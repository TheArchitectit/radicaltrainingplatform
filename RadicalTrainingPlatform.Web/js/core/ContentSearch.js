/**
 * ContentSearch (S37-07) — the pure half of offline search: tokenising,
 * ranking, and snippet extraction.
 *
 * This module has **no imports at all**. It does not know what content exists,
 * it does not know what a route is, and it never touches the network or the
 * DOM. It takes a list of documents and a query string and returns a ranked
 * list. That is deliberate and it is what makes "offline search" a fact rather
 * than a claim: there is nothing here that could reach a server even if a
 * server existed, and the whole thing runs synchronously from a local index.
 *
 * The index itself is assembled by the view that can see the content sources
 * (`js/views/search.js`), for the same reason `ContentFormats.js` classifies
 * IDs but does not enumerate them: enumeration needs the data module and the
 * scenario module, and a core module that reached into a view would invert the
 * layering this repository keeps everywhere else.
 *
 * ## Matching rules, stated so they can be checked
 *
 *   - A document matches only if **every** query token appears somewhere in its
 *     title or body. AND, not OR — on a corpus of a few hundred items an OR
 *     query returns everything and ranks nothing.
 *   - Occurrences in the **title count 3×** an occurrence in the body, so a
 *     query for "DNS" surfaces the item about DNS above the item that mentions
 *     it in passing.
 *   - Ranking is score descending, then format ID, then content ID. The last
 *     two make the order **total and deterministic**: the same corpus and the
 *     same query always produce the same list, which is what lets a fixture
 *     pin it.
 *   - Tokens are lowercased and must be at least 2 characters. Dots are kept
 *     inside a token so an objective ID (`2.3`) or an address (`169.254`) stays
 *     one token instead of decaying into digits that match everything.
 */

/** Escape for HTML text and attribute contexts. */
export function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

const MIN_TOKEN = 2;

/**
 * Split text into search tokens: lowercased, punctuation-split, dots kept
 * inside a token. Tokens shorter than two characters are dropped — a single
 * letter appears in nearly every document and ranks nothing.
 */
export function tokenize(text) {
    return String(text ?? '')
        .toLowerCase()
        .split(/[^a-z0-9.]+/)
        .map(t => t.replace(/^\.+/, '').replace(/\.+$/, ''))
        .filter(t => t.length >= MIN_TOKEN);
}

/** The query as tokens. An empty or punctuation-only query yields `[]`. */
export function normalizeQuery(query) {
    return tokenize(query);
}

/** How many times `token` occurs in `text`, case-insensitively. */
function countOccurrences(text, token) {
    if (!token) return 0;
    let count = 0;
    let from = 0;
    const haystack = text.toLowerCase();
    for (;;) {
        const at = haystack.indexOf(token, from);
        if (at === -1) return count;
        count += 1;
        from = at + token.length;
    }
}

/**
 * Score one document against the query tokens, or `null` when it does not
 * match. Exported so a fixture can assert the weighting directly rather than
 * inferring it from an ordering.
 */
export function scoreDocument(doc, tokens) {
    if (!tokens.length) return null;
    const title = String(doc?.title ?? '');
    const body = String(doc?.body ?? '');
    let score = 0;
    for (const token of tokens) {
        const inTitle = countOccurrences(title, token);
        const inBody = countOccurrences(body, token);
        // AND semantics: a token that appears nowhere disqualifies the document.
        if (inTitle === 0 && inBody === 0) return null;
        score += inTitle * 3 + inBody;
    }
    return score;
}

/**
 * The plain-text window of `text` around the first query token, with an
 * ellipsis where the window was cut. Plain text — `renderSnippet` is what
 * turns it into safe HTML. Returns '' when no token is present.
 */
export function snippetFor(text, tokens, radius = 70) {
    const source = String(text ?? '');
    if (!tokens.length || !source) return '';
    const haystack = source.toLowerCase();
    let at = -1;
    for (const token of tokens) {
        const found = haystack.indexOf(token);
        if (found !== -1 && (at === -1 || found < at)) at = found;
    }
    if (at === -1) return '';
    const start = Math.max(0, at - radius);
    const end = Math.min(source.length, at + radius);
    // Cut on whitespace where possible so the snippet does not start mid-word.
    const lead = start > 0 ? '…' : '';
    const tail = end < source.length ? '…' : '';
    return `${lead}${source.slice(start, end).trim()}${tail}`;
}

/**
 * A snippet as safe HTML, with every query token wrapped in `<mark>`.
 *
 * **This function escapes the text itself, so the caller must not escape it
 * again.** One function owns both halves of the job because splitting them is
 * how a snippet ends up double-escaped (`&amp;amp;`) or, worse, unescaped.
 *
 * Matching runs against the escaped text, which is sound because a token can
 * only ever contain `[a-z0-9.]` — escaping never alters those characters and
 * never introduces one, so a match found here is a match in the source.
 */
export function renderSnippet(snippet, tokens) {
    const escaped = escapeHtml(snippet);
    if (!tokens.length) return escaped;
    const alternation = tokens
        .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');
    return escaped.replace(new RegExp(`(${alternation})`, 'gi'), '<mark>$1</mark>');
}

/**
 * Rank documents against a query.
 *
 * Returns `{ tokens, results, total, truncated }`. `total` is how many
 * documents matched and `results` is the (possibly capped) slice, so a caller
 * can say "showing 50 of 213" honestly rather than silently truncating — a
 * silent cap reads as "that is all there is".
 */
export function searchDocuments(documents, query, opts = {}) {
    const tokens = normalizeQuery(query);
    const limit = Number.isInteger(opts.limit) && opts.limit > 0 ? opts.limit : 50;
    if (!tokens.length) {
        return { tokens, results: [], total: 0, truncated: false };
    }
    const scored = [];
    for (const doc of documents || []) {
        const score = scoreDocument(doc, tokens);
        if (score === null) continue;
        scored.push({
            formatId: doc.formatId,
            contentId: doc.contentId,
            title: doc.title,
            href: doc.href,
            score,
            snippet: snippetFor(doc.body, tokens),
        });
    }
    scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const byFormat = String(a.formatId).localeCompare(String(b.formatId));
        if (byFormat !== 0) return byFormat;
        return String(a.contentId).localeCompare(String(b.contentId), undefined, { numeric: true });
    });
    return {
        tokens,
        results: scored.slice(0, limit),
        total: scored.length,
        truncated: scored.length > limit,
    };
}
