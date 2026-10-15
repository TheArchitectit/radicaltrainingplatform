import { BaseView } from './BaseView.js';
import { ITEMS, LESSONS, DISCLAIMER } from '../study-content.js';
import { SCENARIOS } from './scenarios.js';
import { cardFor } from './flashcards.js';
import { CONTENT_FORMATS } from '../core/ContentFormats.js';
import { searchDocuments, renderSnippet, escapeHtml } from '../core/ContentSearch.js';
import {
    lessonKeyOf, lessonHref, trackForExam, practiceHref, deckHref, scenariosHref,
} from '../data/content-links.js';

/**
 * Content search (S37-07) — one box over every format the registry knows.
 *
 * ## Offline, and why that is a structural fact rather than a promise
 *
 * The whole index is built from modules that are already in the PWA's runtime
 * graph, and the ranking is `js/core/ContentSearch.js`, which imports nothing
 * and performs no I/O. There is no fetch, no worker, no service, and no query
 * string: a search runs against arrays that are already in memory. The route
 * carries no `?q=`, because the hash router splits the whole path on `/` and
 * would not match a query anyway — so the query lives in the view's own state
 * and the results render in place. That also means the search box keeps focus
 * while results update, which is the one place in this app where the
 * re-render does not cost a keyboard user their position.
 *
 * ## The index is assembled here, not in core
 *
 * Building the index needs the content data module *and* the scenario module,
 * and `js/views/scenarios.js` is a view. A core module that reached into it
 * would invert the layering every other module keeps, so the enumeration lives
 * at this tier — the same reason `ContentFormats.js` classifies IDs and
 * refuses to list them. `buildSearchIndex()` is exported pure so the fixture
 * can assert the corpus without a DOM.
 *
 * ## Cards reuse the deck's own derivation
 *
 * Flashcard documents come from `cardFor` in `js/views/flashcards.js`, not
 * from a second copy of "front is the stem, back is the keys". If the card
 * model changes, search follows it; two derivations of one card is how they
 * drift apart.
 */

/** A lesson's markdown, reduced to the words a learner would search for. */
export function markdownToPlain(markdown) {
    return String(markdown ?? '')
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/^---+$/gm, ' ')
        .replace(/^\s*[-*]\s+/gm, ' ')
        .replace(/^\s*\d+\.\s+/gm, ' ')
        .replace(/#{1,6}\s*/g, ' ')
        .replace(/\*\*/g, '')
        .replace(/`/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Every searchable document, one per format the registry defines.
 *
 * A document is `{ formatId, contentId, title, body, href }`. An item and its
 * flashcard share a content ID and appear as two documents under two formats —
 * that is the registry's point, not a duplication to collapse.
 *
 * A released lesson whose exam has no track is skipped rather than linked
 * somewhere it does not belong: every route this index hands out is one the
 * app can actually serve.
 */
export function buildSearchIndex() {
    const documents = [];

    for (const lesson of Object.values(LESSONS)) {
        if (lesson.status !== 'released') continue;
        const track = trackForExam(lesson.examId);
        if (!track) continue;
        documents.push({
            formatId: CONTENT_FORMATS.lesson.id,
            contentId: lessonKeyOf(lesson),
            title: lesson.title,
            body: markdownToPlain(lesson.markdown),
            href: lessonHref(track.trackId, lesson),
        });
    }

    for (const item of ITEMS) {
        const optionText = Object.values(item.options || {}).join(' ');
        const explanation = String(item.explanation ?? '');
        documents.push({
            formatId: CONTENT_FORMATS.item.id,
            contentId: item.id,
            title: item.stem,
            body: `${optionText} ${explanation} ${item.objectiveId ?? ''}`,
            href: practiceHref(item.examId),
        });
        const card = cardFor(item);
        documents.push({
            formatId: CONTENT_FORMATS.flashcard.id,
            contentId: card.contentId,
            title: card.front,
            body: `${card.back} ${card.explanation ?? ''}`,
            href: deckHref(card.examId),
        });
    }

    for (const scenario of SCENARIOS) {
        const objectives = (scenario.objectives || []).map(o => o.text).join(' ');
        documents.push({
            formatId: CONTENT_FORMATS.scenario.id,
            contentId: scenario.id,
            title: scenario.title,
            body: `${scenario.description ?? ''} ${objectives}`,
            href: scenariosHref(),
        });
    }

    return documents;
}

/** Format ID → display label, taken from the registry so it cannot drift. */
function formatLabel(formatId) {
    return CONTENT_FORMATS[formatId]?.label ?? formatId;
}

/**
 * Search surface (route `/search`).
 *
 * Results replace the contents of one container rather than the view root, so
 * the input keeps focus and the caret stays where the learner left it while
 * they refine a query.
 */
export class SearchView extends BaseView {
    #index = [];
    #debounce = null;

    async render() {
        this.#index = buildSearchIndex();
        const counts = {};
        for (const doc of this.#index) {
            counts[doc.formatId] = (counts[doc.formatId] || 0) + 1;
        }
        const summary = Object.keys(CONTENT_FORMATS)
            .filter(id => counts[id])
            .map(id => `${counts[id]} ${CONTENT_FORMATS[id].plural.toLowerCase()}`)
            .join(' · ');
        return this.html(`
            <div class="study-page search-page">
                <a class="study-back" href="#/tracks">‹ Study tracks</a>
                <h1 class="study-title">Search</h1>
                <p class="study-sub">Searches this build's own content — lessons, practice items, flashcards and guided scenarios. Nothing is sent anywhere; the index is built in the page.</p>
                <form class="search-form" id="search-form" role="search">
                    <label class="search-label" for="search-input">Search study content</label>
                    <div class="search-row">
                        <input class="search-input" id="search-input" type="search" name="q"
                               autocomplete="off" spellcheck="false"
                               placeholder="e.g. DNS, default gateway, 2.3, protection domain">
                        <button class="study-button" id="search-submit" type="submit">Search</button>
                    </div>
                </form>
                <p class="search-index-note">Indexed in this page: ${summary}.</p>
                <div id="search-results" role="status" aria-live="polite">
                    <p class="search-hint">Type a word or two to search. Every word you type has to appear, so more words narrow the results rather than widening them.</p>
                </div>
                <p class="study-disclaimer">${DISCLAIMER}</p>
            </div>`);
    }

    afterRender() {
        const form = this.root.querySelector('#search-form');
        const input = this.root.querySelector('#search-input');
        if (!form || !input) return;
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.#run(input.value);
        });
        input.addEventListener('input', () => {
            clearTimeout(this.#debounce);
            this.#debounce = setTimeout(() => this.#run(input.value), 120);
        });
    }

    destroy() {
        clearTimeout(this.#debounce);
        this.#debounce = null;
    }

    #run(query) {
        const host = this.root.querySelector('#search-results');
        if (!host) return;
        host.innerHTML = this.#renderResults(query);
    }

    #renderResults(query) {
        const { tokens, results, total, truncated } = searchDocuments(this.#index, query);
        if (!tokens.length) {
            return `<p class="search-hint">Type a word or two to search. Every word you type has to appear, so more words narrow the results rather than widening them.</p>`;
        }
        if (!results.length) {
            return `<p class="search-empty">No matches for <strong>${escapeHtml(query)}</strong> in this build. Try fewer or more general words — every word has to appear in the same entry.</p>`;
        }
        const byFormat = {};
        for (const r of results) byFormat[r.formatId] = (byFormat[r.formatId] || 0) + 1;
        const breakdown = Object.keys(CONTENT_FORMATS)
            .filter(id => byFormat[id])
            .map(id => `${byFormat[id]} ${CONTENT_FORMATS[id].plural.toLowerCase()}`)
            .join(' · ');
        const cap = truncated
            ? ` Showing the first ${results.length} of ${total}, ranked by match.`
            : '';
        const rows = results.map(r => `
            <li class="search-result">
                <a class="search-result-link" href="${r.href}">
                    <span class="search-format">${escapeHtml(formatLabel(r.formatId))}</span>
                    <span class="search-result-title">${escapeHtml(r.title)}</span>
                    ${r.snippet ? `<span class="search-result-snippet">${renderSnippet(r.snippet, tokens)}</span>` : ''}
                </a>
            </li>`).join('');
        return `
            <p class="search-count">${total} match${total === 1 ? '' : 'es'} for <strong>${escapeHtml(query)}</strong> — ${breakdown}.${cap}</p>
            <ol class="search-results">${rows}</ol>`;
    }
}
