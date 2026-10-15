/**
 * Content search (S37-07) — the index, the ranking, and the offline claim.
 *
 * Four things this fixture exists to hold down:
 *
 *   1. **Every document points at a route the app serves.** A hash router
 *      never 404s; a link to a route that was never registered simply bounces
 *      the learner to the dashboard. Nothing else in the gate chain would
 *      notice, so the routes are read out of `js/app.js` here and every href
 *      the index hands out is matched against them.
 *   2. **Search is AND, not OR.** On a corpus of a few hundred entries an OR
 *      query returns everything and ranks nothing, so the rule is pinned
 *      directly rather than inferred from an ordering.
 *   3. **The ordering is total and deterministic.** Same corpus, same query,
 *      same list — otherwise the ranking is a coin toss and nothing can be
 *      pinned against it.
 *   4. **It is offline by construction, not by promise.** The core module is
 *      asserted to import nothing and to contain no I/O call. That is a
 *      structural fact about the file, and it is checkable.
 */
import { installDom, makeRunner, assert, assertEqual, registeredRoutePatterns, hrefIsRouted } from './helpers.mjs';

installDom();
const runner = makeRunner();

const { searchDocuments, tokenize, scoreDocument, snippetFor, renderSnippet, escapeHtml } =
    await import('../../../RadicalTrainingPlatform.Web/js/core/ContentSearch.js');
const { buildSearchIndex, markdownToPlain, SearchView } =
    await import('../../../RadicalTrainingPlatform.Web/js/views/search.js');
const { CONTENT_FORMATS } = await import('../../../RadicalTrainingPlatform.Web/js/core/ContentFormats.js');
const { ITEMS, LESSONS } = await import('../../../RadicalTrainingPlatform.Web/js/study-content.js');
const { SCENARIOS } = await import('../../../RadicalTrainingPlatform.Web/js/views/scenarios.js');

const ROUTES = registeredRoutePatterns(
    new URL('../../../RadicalTrainingPlatform.Web/js/app.js', import.meta.url)
);

const INDEX = buildSearchIndex();

// ─── The index ─────────────────────────────────────────────────────

await runner.test('the index covers every format the registry defines', async () => {
    assert(ROUTES.length > 0, 'precondition: the app registers routes');
    const present = new Set(INDEX.map(d => d.formatId));
    for (const id of Object.keys(CONTENT_FORMATS)) {
        assert(present.has(id), `the index has no documents for the '${id}' format`);
    }
});

await runner.test('every document names a known format and a real source count', async () => {
    const byFormat = {};
    for (const doc of INDEX) byFormat[doc.formatId] = (byFormat[doc.formatId] || 0) + 1;
    assertEqual(byFormat[CONTENT_FORMATS.item.id], ITEMS.length, 'one document per practice item');
    assertEqual(byFormat[CONTENT_FORMATS.flashcard.id], ITEMS.length, 'one card document per item');
    assertEqual(byFormat[CONTENT_FORMATS.scenario.id], SCENARIOS.length, 'one document per scenario');
    const released = Object.values(LESSONS).filter(l => l.status === 'released').length;
    assertEqual(byFormat[CONTENT_FORMATS.lesson.id], released,
        'one document per released lesson — a planned lesson has no body to search');
});

await runner.test('every document href is a route the app actually serves', async () => {
    const dead = INDEX.filter(d => !hrefIsRouted(d.href, ROUTES));
    assertEqual(dead.map(d => `${d.formatId}:${d.contentId}->${d.href}`).slice(0, 5).join(', '), '',
        'the index must not hand out a link to an unregistered route');
});

await runner.test('an item and its card are two documents under one content ID', async () => {
    // This is the registry's point, not a duplication to collapse: the same ID
    // is a scored item and a review card, and search must be able to offer both.
    const shared = INDEX.filter(d => d.contentId === ITEMS[0].id);
    const formats = shared.map(d => d.formatId).sort();
    assertEqual(formats.join(','), `${CONTENT_FORMATS.flashcard.id},${CONTENT_FORMATS.item.id}`);
});

// ─── Tokenising and matching ───────────────────────────────────────

await runner.test('a dotted token stays whole, and one-character tokens are dropped', async () => {
    assertEqual(tokenize('2.3').join('|'), '2.3', 'an objective ID must not decay into digits');
    assertEqual(tokenize('169.254').join('|'), '169.254', 'nor must an address');
    assertEqual(tokenize('a b cd').join('|'), 'cd', 'single letters match everything, so they are dropped');
    assertEqual(tokenize('...').join('|'), '', 'punctuation is not a query');
});

await runner.test('a one-character query returns nothing rather than everything', async () => {
    const result = searchDocuments(INDEX, 'a');
    assertEqual(result.tokens.length, 0, 'a dropped token means no query at all');
    assertEqual(result.results.length, 0);
});

await runner.test('matching is AND — every token must appear', async () => {
    const doc = { formatId: 'item', contentId: 'x', title: 'DNS lookup failure', body: 'check the server', href: '#/practice/X' };
    assert(scoreDocument(doc, tokenize('dns')) !== null, 'one token present matches');
    assert(scoreDocument(doc, tokenize('dns server')) !== null, 'both present matches');
    assertEqual(scoreDocument(doc, tokenize('dns gateway')), null,
        'a token that appears nowhere disqualifies the document — AND, not OR');
});

await runner.test('a title match outranks a body-only match', async () => {
    const titleMatch = { formatId: 'item', contentId: 'a', title: 'DNS', body: 'unrelated', href: '#/practice/X' };
    const bodyMatch = { formatId: 'item', contentId: 'b', title: 'unrelated', body: 'DNS', href: '#/practice/X' };
    const a = scoreDocument(titleMatch, tokenize('dns'));
    const b = scoreDocument(bodyMatch, tokenize('dns'));
    assert(a > b, `a title occurrence must outweigh a body occurrence (got ${a} vs ${b})`);
});

// ─── Ranking ───────────────────────────────────────────────────────

await runner.test('the ranking is deterministic and total', async () => {
    const query = 'gateway';
    const a = searchDocuments(INDEX, query).results.map(r => `${r.formatId}:${r.contentId}`);
    const b = searchDocuments(INDEX, query).results.map(r => `${r.formatId}:${r.contentId}`);
    assert(a.length > 1, 'precondition: the query matches more than one entry');
    assertEqual(a.join('|'), b.join('|'), 'the same corpus and query must give the same list');

    // Total: no two distinct results may compare equal, or the order between
    // them is whatever the sort happened to do.
    assertEqual(new Set(a).size, a.length, 'no entry may appear twice');
    const scores = searchDocuments(INDEX, query).results.map(r => r.score);
    for (let i = 1; i < scores.length; i += 1) {
        assert(scores[i - 1] >= scores[i], 'results must come out in descending score order');
    }
});

await runner.test('the cap is reported, not silent', async () => {
    // A silent cap reads as "that is all there is". `total` is what makes
    // "showing the first 3 of N" sayable.
    const capped = searchDocuments(INDEX, 'the', { limit: 3 });
    assert(capped.results.length <= 3, 'the limit must be honoured');
    assert(capped.total >= capped.results.length, 'total is the match count, not the page size');
    assertEqual(capped.truncated, capped.total > capped.results.length);
    const wide = searchDocuments(INDEX, 'the', { limit: 5000 });
    assertEqual(wide.truncated, false, 'a limit above the match count is not a truncation');
});

await runner.test('an empty query returns nothing and does not throw', async () => {
    for (const q of ['', '   ', '...', null, undefined]) {
        const r = searchDocuments(INDEX, q);
        assertEqual(r.results.length, 0, `query ${JSON.stringify(q)} must match nothing`);
        assertEqual(r.total, 0);
    }
});

// ─── Snippets ──────────────────────────────────────────────────────

await runner.test('a snippet is a window on the match, not the whole body', async () => {
    const body = `${'x'.repeat(400)} needle ${'y'.repeat(400)}`;
    const snippet = snippetFor(body, tokenize('needle'), 30);
    assert(snippet.includes('needle'), 'the snippet must contain what was searched for');
    assert(snippet.length < body.length, 'a snippet is a window, not a copy of the body');
    assert(snippet.startsWith('…') && snippet.endsWith('…'), 'a cut window is marked as cut');
});

await runner.test('snippet rendering escapes the text and marks only the query', async () => {
    const evil = '<img src=x onerror=alert(1)> DNS';
    const html = renderSnippet(evil, tokenize('dns'));
    assert(!html.includes('<img'), 'the snippet must be escaped, not injected');
    assert(html.includes('&lt;img'), 'and escaped visibly');
    assert(html.includes('<mark>DNS</mark>'), 'the query term is marked');
    // A token can only ever be [a-z0-9.], so escaping never creates a match.
    assertEqual(escapeHtml("a'b"), 'a&#39;b');
});

await runner.test('renderSnippet does not double-escape what it already escaped', async () => {
    // One function owns both escaping and marking, so a caller that escaped
    // first would render &amp;amp;. Pinned because the contract is easy to
    // break from the outside.
    const html = renderSnippet('a & b DNS', tokenize('dns'));
    assert(html.includes('a &amp; b'), 'the ampersand is escaped exactly once');
    assert(!html.includes('&amp;amp;'), 'and never twice');
});

// ─── Offline, by construction ──────────────────────────────────────

await runner.test('the search core imports nothing and performs no I/O', async () => {
    // "Offline search" is a structural claim here, so it is checked
    // structurally: a module with no imports and no I/O call cannot reach a
    // network even if one existed.
    const { readFileSync } = await import('node:fs');
    const source = readFileSync(
        new URL('../../../RadicalTrainingPlatform.Web/js/core/ContentSearch.js', import.meta.url),
        'utf8'
    );
    const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    assert(!/^\s*import\s/m.test(code), 'the search core must not import anything');
    for (const io of ['fetch(', 'XMLHttpRequest', 'localStorage', 'indexedDB', 'require(', 'WebSocket']) {
        assert(!code.includes(io), `the search core must not reference ${io}`);
    }
});

// ─── The view ──────────────────────────────────────────────────────

await runner.test('the view renders a labelled search box and an honest empty state', async () => {
    const view = new SearchView(undefined, '/search');
    const el = await view.render();
    assert(el.querySelector('#search-input'), 'there is a search input');
    assert(el.querySelector('.search-label'), 'and a label for it — an unlabelled box is not a search box');
    assertEqual(el.querySelector('.search-label').getAttribute('for'), 'search-input',
        'the label must be bound to the input, not merely near it');
    assert(el.querySelector('#search-results'), 'results land in their own region');
    assert(/Indexed in this page/.test(el.textContent), 'the view states where the index comes from');
});

await runner.test('running a search fills the results without replacing the view root', async () => {
    // This is the point of rendering into a container rather than swapping the
    // root: the input keeps focus, so a keyboard user refining a query is not
    // sent back to the top of the tab order. The test is element identity —
    // if the root were swapped, this node would be a different object.
    const host = document.createElement('div');
    const view = new SearchView(undefined, '/search');
    host.appendChild(await view.render());
    view.root = host.children[0];
    view.afterRender();

    const input = view.root.querySelector('#search-input');
    const form = view.root.querySelector('#search-form');
    input.value = 'dns';
    form.dispatchEvent({ type: 'submit', preventDefault() {} });

    assertEqual(view.root.querySelector('#search-input'), input,
        'the input must be the same element after a search — otherwise focus was lost');
    const results = view.root.querySelector('#search-results');
    assert(/match/i.test(results.textContent), 'the results region reports the run');
    assert(results.querySelectorAll('.search-result-link').length > 0, 'and lists links');
});

await runner.test('every rendered result link is a routed path', async () => {
    const view = new SearchView(undefined, '/search');
    const host = document.createElement('div');
    host.appendChild(await view.render());
    view.root = host.children[0];
    view.afterRender();
    view.root.querySelector('#search-input').value = 'the';
    view.root.querySelector('#search-form').dispatchEvent({ type: 'submit', preventDefault() {} });

    const links = view.root.querySelectorAll('.search-result-link');
    assert(links.length > 0, 'precondition: the query rendered results');
    for (const link of links) {
        assert(hrefIsRouted(link.getAttribute('href'), ROUTES),
            `rendered link ${link.getAttribute('href')} is not a registered route`);
    }
});

await runner.test('a query with no matches says so instead of showing nothing', async () => {
    const view = new SearchView(undefined, '/search');
    const host = document.createElement('div');
    host.appendChild(await view.render());
    view.root = host.children[0];
    view.afterRender();
    view.root.querySelector('#search-input').value = 'zzzznotarealword';
    view.root.querySelector('#search-form').dispatchEvent({ type: 'submit', preventDefault() {} });
    assert(/No matches for/.test(view.root.querySelector('#search-results').textContent),
        'an empty result set must be stated, not rendered as a blank region');
});

await runner.test('markdown is reduced to words before it is indexed', async () => {
    const plain = markdownToPlain('# Heading\n\n- **bold** item\n\n`code` here\n\n---\n');
    assert(!plain.includes('#'), 'heading marks are not searchable text');
    assert(!plain.includes('*'), 'emphasis marks are not searchable text');
    assert(!plain.includes('`'), 'code fences are not searchable text');
    assert(plain.includes('Heading') && plain.includes('bold') && plain.includes('code'),
        'the words themselves survive');
});

process.exit(runner.done('content-search'));
