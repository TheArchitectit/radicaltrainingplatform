import { BaseView } from './BaseView.js';
import { ITEMS, EXAMS, TRACKS, DISCLAIMER } from '../study-content.js';
import { progress } from '../core/ProgressStore.js';
import { CONTENT_FORMATS } from '../core/ContentFormats.js';

/**
 * Flashcards (S37-03) — a review surface derived from the practice bank.
 *
 * ## What this is NOT
 *
 * **This is not spaced repetition, and the sprint that asked for it asked for
 * SM-2.** SPEC-01 line 99 defers spaced repetition by name ("no sync, no
 * accounts, no spaced repetition (Plan v2 L-04 deferred)"), and SPEC-15 lists
 * it among the things the package leaves to the owner. So the scheduling half
 * of S37-03 was cut, visibly, and what ships is the half that needs no
 * deferral: a deck, a review queue, and per-card progress.
 *
 * Concretely, there is no interval, no ease factor, no due date, and no
 * clock in this file. `reviewOrder` is a fixed ordering over what the learner
 * has already recorded — unseen cards first, then the ones they last missed,
 * then the rest — recomputed from storage each session. It is deterministic
 * and explainable, and it is not a scheduling algorithm. Calling it "spaced
 * repetition" would be a false claim about what the software does, and a
 * learner could rely on a review schedule that does not exist.
 *
 * ## Why the cards are derived
 *
 * A card is an existing item presented as a prompt/answer pair: front is the
 * stem, back is the correct option text plus the explanation. Nothing is
 * authored here. That is deliberate — the deck cannot drift from the bank,
 * and this sprint touches no content file, no manifest and no provenance
 * record, so the content, lint and RedEye gates are exactly as they were.
 *
 * The cost is stated in the UI rather than hidden: a card shows the answer
 * and not the distractors, so it tests recall of the key, not the
 * discrimination the scored item tests. And because the cards come from
 * `draft`-provenance items, every card carries the same draft label the
 * practice set carries.
 *
 * ## Progress
 *
 * Review outcomes go through `progress.recordContent('flashcard', ...)` —
 * a key of their own, never the item's scored record. Reviewing a card as
 * missed must not turn a correct answer wrong, and the fixture for S37-06
 * asserts exactly that.
 *
 * ## Keyboard behaviour, and its cost
 *
 * The review run re-renders by replacing its root — the same `#swap` the
 * practice view, the ticket lab, the NCA lab and demo mode use. That is
 * deliberate: a second re-render convention in this app would be one more
 * thing to get wrong. The cost is the one the rehearsal already records
 * against that pattern: focus is not restored across the swap, so after
 * "Show answer" or "Got it" a keyboard user resumes from the top of the tab
 * order rather than on the next control. `tests/e2e/rehearsal-web.mjs` notes
 * this for the demo reset; it is inherited here, not introduced, and it is
 * recorded rather than fixed because a focus fix on this surface alone would
 * leave the other four views inconsistent and would ship unverified — the
 * accessibility sweep audits routes as they load and never reaches a click.
 */

// Taken from the registry rather than written as a literal here, so renaming
// the format there cannot leave this view writing to a key nothing reads.
const FORMAT = CONTENT_FORMATS.flashcard.id;

/** Stable order within a group, so two sessions present the same run. */
function byContentId(a, b) {
    return a.contentId.localeCompare(b.contentId, undefined, { numeric: true });
}

/**
 * One card, derived from one item. No authored content.
 *
 * `back` joins every correct option, because a multi-select item has more
 * than one — showing only the first would teach a wrong answer.
 */
export function cardFor(item) {
    return {
        contentId: item.id,
        examId: item.examId,
        front: item.stem,
        back: item.keys.map(k => item.options[k]).join('; '),
        explanation: item.explanation,
        objectiveId: item.objectiveId,
        provenanceStatus: item.provenanceStatus,
        isMultiSelect: !!item.isMultiSelect,
    };
}

/** Every deck, in exam-catalog order, with its card count. */
export function decks() {
    return Object.values(EXAMS)
        .map(exam => {
            const cards = ITEMS.filter(i => i.examId === exam.examId)
                .slice()
                .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
                .map(cardFor);
            const track = Object.values(TRACKS).find(t => t.examIds.includes(exam.examId));
            return {
                examId: exam.examId,
                displayName: exam.displayName,
                previewLabel: track?.previewLabel ?? 'beginner preview',
                cards,
            };
        })
        .filter(deck => deck.cards.length)
        .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

/** One deck, or null for an exam with no released cards. */
export function deckFor(examId) {
    return decks().find(d => d.examId === examId) || null;
}

/**
 * The review order for a deck given what the learner has already recorded.
 *
 * Three groups, in this order:
 *   1. unseen   — no record at all
 *   2. missed   — the last review was a miss
 *   3. known    — the last review was a hit
 *
 * Within a group the order is by content ID, so a run is reproducible and two
 * learners comparing notes see the same sequence. **No dates are read and no
 * intervals are computed** — this is a fixed ordering over recorded outcomes,
 * not a schedule. See the module comment.
 *
 * `records` is the map `progress.contentSummary` returns.
 */
export function reviewOrder(cards, records = {}) {
    const group = (card) => {
        const rec = records[card.contentId];
        if (!rec) return 0;
        return rec.outcome === 'missed' ? 1 : 2;
    };
    return [...cards].sort((a, b) => {
        const ga = group(a);
        const gb = group(b);
        return ga !== gb ? ga - gb : byContentId(a, b);
    });
}

/**
 * Deck picker (route `/flashcards`) — one card per exam that has a released
 * bank, linking into the review surface. Uses the track-card grid so it reads
 * as the same surface as the study tracks it sits beside.
 */
export class FlashcardsView extends BaseView {
    async render() {
        await progress.init();
        const list = decks();
        if (!list.length) {
            return this.html(`
                <div class="study-page">
                    <a class="study-back" href="#/tracks">‹ Study tracks</a>
                    <h1 class="study-title">Flashcards</h1>
                    <p class="study-sub">No released banks to build cards from yet.</p>
                    <p class="study-disclaimer">${DISCLAIMER}</p>
                </div>`);
        }
        const cards = [];
        for (const deck of list) {
            const summary = await progress.contentSummary(FORMAT, deck.cards.map(c => c.contentId));
            const reviewed = summary.touched;
            const pct = deck.cards.length ? Math.round(100 * reviewed / deck.cards.length) : 0;
            cards.push(`
                <a class="track-card" href="#/flashcards/${deck.examId}">
                    <div class="track-card-head">
                        <span class="track-title">${deck.displayName}</span>
                        <span class="preview-label">${deck.previewLabel}</span>
                    </div>
                    <div class="track-audience">${deck.cards.length} card${deck.cards.length === 1 ? '' : 's'}, derived from this exam's released practice bank.</div>
                    <div class="track-coverage">
                        <div class="coverage-bar"><div class="coverage-fill" style="width:${pct}%"></div></div>
                        <span class="coverage-text">reviewed ${reviewed}/${deck.cards.length} (${pct}%)</span>
                    </div>
                    <div class="track-cta">Review deck ›</div>
                </a>`);
        }
        return this.html(`
            <div class="study-page">
                <a class="study-back" href="#/tracks">‹ Study tracks</a>
                <h1 class="study-title">Flashcards</h1>
                <p class="study-sub">Cards are built from this build's released practice bank — the front is the question, the back is the answer and the explanation. They are for recall of the key, not a substitute for the scored practice sets.</p>
                <p class="study-sub">There is no review schedule here. Cards you have not seen come first, then the ones you last missed, then the rest — the same order every session, until you review them.</p>
                <div class="track-grid">${cards.join('')}</div>
                <p class="study-disclaimer">${DISCLAIMER}</p>
            </div>`);
    }
}

/**
 * Review run (route `/flashcards/:examId`).
 *
 * One card at a time: the front is shown, the learner reveals the back, then
 * says whether they had it. Nothing is timed and nothing is scheduled. The
 * run is a plain walk of `reviewOrder` with no attempt to adapt — adapting
 * would be the scheduling half this sprint cut.
 */
export class FlashcardReviewView extends BaseView {
    #cards = [];
    #records = {};
    #index = 0;
    #revealed = false;
    #seen = 0;
    #got = 0;

    async render(params) {
        const deck = deckFor(params.examId);
        if (!deck) {
            return this.html(`
                <div class="study-page">
                    <a class="study-back" href="#/flashcards">‹ All decks</a>
                    <h1 class="study-title">No deck for that exam</h1>
                    <p class="study-sub">This exam has no released practice bank, so there are no cards to build.</p>
                    <p class="study-disclaimer">${DISCLAIMER}</p>
                </div>`);
        }
        await progress.init();
        const summary = await progress.contentSummary(FORMAT, deck.cards.map(c => c.contentId));
        this.#records = summary.records;
        this.#cards = reviewOrder(deck.cards, this.#records);
        this.#index = 0;
        this.#revealed = false;
        this.#seen = 0;
        this.#got = 0;
        return this.#renderCard(deck);
    }

    #renderCard(deck) {
        const card = this.#cards[this.#index];
        const back = this.#revealed ? `
                <div class="flashcard-back">
                    <div class="flashcard-answer">${card.back}</div>
                    <div class="explanation"><h2>Why</h2><p>${card.explanation}</p></div>
                </div>
                <div class="flashcard-controls">
                    <button class="study-button secondary" id="flashcard-missed">Missed it</button>
                    <button class="study-button" id="flashcard-known">Got it ›</button>
                </div>` : `
                <div class="flashcard-controls">
                    <button class="study-button" id="flashcard-reveal">Show answer</button>
                </div>`;
        const rec = this.#records[card.contentId];
        const priorNote = rec
            ? `<p class="practice-prior-note">Reviewed ${rec.count} time${rec.count === 1 ? '' : 's'} before; last time you ${rec.outcome === 'missed' ? 'missed it' : 'had it'}.</p>`
            : '';
        return this.html(`
            <div class="study-page flashcard-page">
                <a class="study-back" href="#/flashcards">‹ All decks</a>
                <h1 class="study-title">Flashcards — ${deck.displayName}</h1>
                <p class="study-sub">Draft pack (${deck.previewLabel}) · cards derived from the released practice bank, answer and explanation included.</p>
                <div class="flashcard-progress">${this.#index + 1} / ${this.#cards.length}${this.#seen ? ` · ${this.#got}/${this.#seen} recalled this run` : ''}</div>
                ${priorNote}
                <div class="flashcard">
                    <div class="flashcard-front">${card.front}</div>
                    ${card.isMultiSelect ? '<p class="practice-hint-note">This question has more than one correct answer.</p>' : ''}
                    ${back}
                </div>
                <p class="study-disclaimer">${DISCLAIMER}</p>
            </div>`);
    }

    afterRender(params) {
        const deck = deckFor(params.examId);
        if (!deck || !this.#cards.length) return;

        this.root.querySelector('#flashcard-reveal')?.addEventListener('click', () => {
            this.#revealed = true;
            this.#rerender(deck);
        });

        const record = async (outcome) => {
            const card = this.#cards[this.#index];
            const result = await progress.recordContent(FORMAT, card.contentId, { outcome });
            this.#seen += 1;
            if (outcome === 'known') this.#got += 1;
            if (result.saved) {
                // Keep the in-memory view of the record in step with storage,
                // so the next card's "reviewed before" note is not stale.
                this.#records[card.contentId] = result.record;
            } else {
                // A blocked or full store must not read as a saved review.
                console.warn('[Flashcards] review not saved:', result.reason);
            }
            this.#index += 1;
            this.#revealed = false;
            this.#rerender(deck);
        };
        this.root.querySelector('#flashcard-known')?.addEventListener('click', () => record('known'));
        this.root.querySelector('#flashcard-missed')?.addEventListener('click', () => record('missed'));

        this.root.querySelector('#flashcard-restart')?.addEventListener('click', () => {
            this.#index = 0;
            this.#revealed = false;
            this.#seen = 0;
            this.#got = 0;
            this.#rerender(deck);
        });
    }

    #rerender(deck) {
        const el = this.#index >= this.#cards.length
            ? this.#renderDone(deck)
            : this.#renderCard(deck);
        this.#swap(el);
        this.afterRender({ examId: deck.examId });
    }

    /**
     * Same swap the practice view uses: replace the root in place and adopt
     * the new element, so `this.root` always points at what is on screen and
     * afterRender rebinds against it.
     */
    #swap(el) {
        const parent = this.root?.parentElement;
        if (!parent) return;
        parent.replaceChild(el, this.root);
        this.root = el;
    }

    #renderDone(deck) {
        const total = this.#cards.length;
        return this.html(`
            <div class="study-page flashcard-page">
                <a class="study-back" href="#/flashcards">‹ All decks</a>
                <h1 class="study-title">Deck finished — ${deck.displayName}</h1>
                <p class="study-sub">${this.#got} of ${this.#seen} recalled this run, across ${total} card${total === 1 ? '' : 's'}. Draft pack — this is practice, never a pass prediction.</p>
                <p class="study-sub">There is no schedule to come back to. Running the deck again starts from the same order: cards you have not seen, then the ones you last missed.</p>
                <div class="lesson-actions">
                    <button class="study-button" id="flashcard-restart">Review again</button>
                    <a class="study-button secondary" href="#/flashcards">All decks</a>
                    <a class="study-button secondary" href="#/practice/${deck.examId}">Scored practice set</a>
                </div>
                <p class="study-disclaimer">${DISCLAIMER}</p>
            </div>`);
    }
}
