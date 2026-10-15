/**
 * Flashcards (S37-03) — the deck model, the review queue, and the cut.
 *
 * Three things this fixture exists to hold down:
 *
 *   1. **A card is its item.** Nothing is authored here, so every card's front
 *      is the stem verbatim and its back carries every correct key. A
 *      multi-select item that showed only its first key would teach a wrong
 *      answer, and that is invisible in a diff.
 *   2. **Reviewing a card is not answering the item.** The click path is driven
 *      end to end here: reveal, record, and then assert that the item's scored
 *      record and the exam summary are untouched. A card and its item share an
 *      ID, so this is one `store.set` away from being wrong.
 *   3. **The SM-2 half is cut, not hidden** (SPEC-11 11.1). SPEC-01 line 99
 *      defers spaced repetition by name. The fixture fails if a scheduling
 *      surface reappears without that being a recorded decision.
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

installDom();
const runner = makeRunner();

const mod = await import('../../../RadicalTrainingPlatform.Web/js/views/flashcards.js');
const { cardFor, decks, deckFor, reviewOrder, FlashcardsView, FlashcardReviewView } = mod;

const { ITEMS, EXAMS } = await import('../../../RadicalTrainingPlatform.Web/js/study-content.js');
const { progress } = await import('../../../RadicalTrainingPlatform.Web/js/core/ProgressStore.js');
const { store } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateStore.js');

await progress.init();

/** Let an async click handler settle (the same one-tick idiom tutor-panel uses). */
async function settle() {
    await new Promise(resolve => setTimeout(resolve, 0));
    await new Promise(resolve => setTimeout(resolve, 0));
}

// ─── The deck model: nothing is authored ───────────────────────────

await runner.test('every card is its item, with nothing invented', async () => {
    assert(ITEMS.length > 0, 'precondition: the bank has items');
    for (const item of ITEMS) {
        const card = cardFor(item);
        assertEqual(card.contentId, item.id, 'the card keeps the item ID (no second ID space)');
        assertEqual(card.front, item.stem, 'the front is the stem, verbatim');
        assertEqual(card.explanation, item.explanation, 'the explanation travels with the card');
        assertEqual(card.objectiveId, item.objectiveId, 'so a card can be traced to its objective');
        assertEqual(card.examId, item.examId);
    }
});

await runner.test('a multi-key card shows every key, never just the first', async () => {
    const multi = ITEMS.filter(i => i.isMultiSelect && i.keys.length > 1);
    assert(multi.length > 0, 'precondition: the bank has a multi-key item');
    for (const item of multi) {
        const card = cardFor(item);
        assertEqual(card.back.split('; ').length, item.keys.length,
            `card ${item.id} must carry all ${item.keys.length} keys, not a truncated back`);
        for (const key of item.keys) {
            assert(card.back.includes(item.options[key]),
                `card ${item.id} is missing the text of option ${key}`);
        }
    }
});

await runner.test('there is one deck per exam with a released bank, and no others', async () => {
    const list = decks();
    const examsWithItems = new Set(ITEMS.map(i => i.examId));
    assertEqual(list.length, examsWithItems.size, 'a deck per exam that has items');
    for (const deck of list) {
        const mine = ITEMS.filter(i => i.examId === deck.examId);
        assertEqual(deck.cards.length, mine.length, `${deck.examId} must deck its whole bank`);
        assert(deck.displayName, 'a deck names its exam');
        for (const card of deck.cards) {
            assertEqual(card.examId, deck.examId, 'no card leaks across decks');
        }
    }
    const names = list.map(d => d.displayName);
    assertEqual(names.join('|'), [...names].sort((a, b) => a.localeCompare(b)).join('|'),
        'decks are presented in catalog order, not in whatever order the bank is in');
});

await runner.test('deckFor returns a whole deck or null, never a half-built one', async () => {
    const some = decks()[0];
    assertEqual(deckFor(some.examId).examId, some.examId);
    assertEqual(deckFor('NOT-AN-EXAM'), null, 'an unknown exam has no deck');
    for (const exam of Object.values(EXAMS)) {
        const deck = deckFor(exam.examId);
        if (deck) assert(deck.cards.length > 0, `${exam.examId} has a deck with no cards in it`);
    }
});

// ─── The review queue: an ordering, not a schedule ─────────────────

await runner.test('reviewOrder puts unseen first, then last-missed, then known', async () => {
    const cards = decks()[0].cards.slice(0, 6);
    assert(cards.length >= 4, 'precondition: a deck with enough cards to group');
    const records = {};
    records[cards[0].contentId] = { outcome: 'known' };
    records[cards[1].contentId] = { outcome: 'missed' };
    records[cards[2].contentId] = { outcome: 'missed' };

    const order = reviewOrder(cards, records).map(c => c.contentId);
    assertEqual(order.length, cards.length, 'no card is dropped or duplicated');
    const groupOf = id => (!records[id] ? 0 : (records[id].outcome === 'missed' ? 1 : 2));
    const groups = order.map(groupOf);
    assertEqual(groups.join(','), [...groups].sort((a, b) => a - b).join(','),
        'the groups must come out in order: unseen, missed, known');
    assertEqual(groups[0], 0, 'a run starts with something unseen');
    assertEqual(groups[groups.length - 1], 2, 'and ends with something already known');
    // The unseen group is exactly the cards with no record — none absorbed
    // into another group, none invented.
    assertEqual(order.filter(id => !records[id]).length, cards.length - 3,
        'every unrecorded card is in the unseen group');
});

await runner.test('the order is deterministic, clock-free, and does not mutate its input', async () => {
    const cards = decks()[0].cards;
    const before = cards.map(c => c.contentId).join('|');
    // Two missed cards with deliberately reversed recency and counts: if either
    // fed the ordering, these would swap.
    const records = {};
    records[cards[0].contentId] = { outcome: 'missed', count: 9, lastRecordedAt: '1999-01-01T00:00:00Z' };
    records[cards[1].contentId] = { outcome: 'missed', count: 1, lastRecordedAt: '2099-01-01T00:00:00Z' };

    const a = reviewOrder(cards, records).map(c => c.contentId);
    const b = reviewOrder(cards, records).map(c => c.contentId);
    assertEqual(a.join('|'), b.join('|'), 'the same input must give the same run');
    assertEqual(cards.map(c => c.contentId).join('|'), before,
        'reviewOrder must not reorder the caller\'s array');

    const expected = [cards[0].contentId, cards[1].contentId].sort((x, y) => x.localeCompare(y, undefined, { numeric: true }));
    const missed = a.filter(id => records[id]);
    assertEqual(missed.join('|'), expected.join('|'),
        'within a group the order is by content ID — no date and no count may influence it');
});

// "a review count is of cards, not of reviews" is asserted in
// content-progress.mjs, against the store method that actually computes it.
// There is deliberately no second helper here for it: two ways to compute one
// number is how they drift apart.

await runner.test('no scheduling surface is exported — the SM-2 half is cut, not hidden', async () => {
    // SPEC-01 line 99 defers spaced repetition by name, so S37-03 ships the
    // deck and the queue without the scheduler. If a scheduler comes back it
    // must be a recorded decision, and this is where that is noticed.
    const scheduling = /interval|ease|due|schedul|sm-?2|repetition|nextReview/i;
    const offenders = Object.keys(mod).filter(name => scheduling.test(name));
    assertEqual(offenders.join(', '), '', 'a scheduling export would make the cut invisible');
    for (const deck of decks()) {
        for (const card of deck.cards) {
            const extra = Object.keys(card).filter(k => scheduling.test(k));
            assertEqual(extra.join(', '), '', `card ${card.contentId} carries a scheduling field`);
        }
    }
});

// ─── The view: the click path, end to end ──────────────────────────

/**
 * Mount a review run the way the router does — render, insert, hand the view
 * its root, then afterRender. Binding is afterRender's job (Router.js:100-114),
 * so a fixture that skipped it would be testing a view with no listeners and
 * would pass for the wrong reason.
 */
async function mountReview(examId) {
    const host = document.createElement('div');
    const view = new FlashcardReviewView(undefined, `/flashcards/${examId}`);
    host.appendChild(await view.render({ examId }));
    view.root = host.children[0];
    view.afterRender({ examId });
    return { view, host };
}

await runner.test('the deck picker links into every deck and denies a schedule', async () => {
    const view = new FlashcardsView(undefined, '/flashcards');
    const el = await view.render({});
    for (const deck of decks()) {
        assert(el.innerHTML.includes(`#/flashcards/${deck.examId}`),
            `the picker has no link into ${deck.examId}`);
    }
    assert(/no review schedule here/i.test(el.textContent),
        'the picker must say there is no schedule, not imply one');
    assert(el.textContent.includes('Flashcards'));
});

await runner.test('the review run shows the prompt and withholds the answer', async () => {
    const deck = decks()[0];
    const { view } = await mountReview(deck.examId);
    const first = reviewOrder(deck.cards, {})[0];

    assert(view.root.textContent.includes(first.front), 'the prompt is on screen');
    assert(!view.root.querySelector('.flashcard-back'), 'the answer is withheld until asked for');
    assert(view.root.querySelector('#flashcard-reveal'), 'and there is a control that asks for it');
});

await runner.test('revealing shows the card answer, and the run advances past it', async () => {
    const deck = decks()[0];
    const { view } = await mountReview(deck.examId);
    const order = reviewOrder(deck.cards, {});
    const first = order[0];

    view.root.querySelector('#flashcard-reveal').click();
    const back = view.root.querySelector('.flashcard-back');
    assert(back, 'revealing must show the answer');
    assert(back.textContent.includes(first.back), 'the answer shown is the card\'s own answer');

    view.root.querySelector('#flashcard-known').click();
    await settle();
    const second = order[1];
    assert(view.root.textContent.includes(second.front),
        'the next card is the next in the review order');
    assert(!view.root.querySelector('.flashcard-back'),
        'and its answer is withheld again, not carried over');
});

await runner.test('recording a review writes the card key and never the item\'s scored key', async () => {
    const deck = decks()[0];
    const examId = deck.examId;
    const { view } = await mountReview(examId);
    const first = reviewOrder(deck.cards, {})[0];

    view.root.querySelector('#flashcard-reveal').click();
    view.root.querySelector('#flashcard-known').click();
    await settle();

    const card = await progress.getContent('flashcard', first.contentId);
    assert(card, 'the review is recorded under the flashcard format');
    assertEqual(card.outcome, 'known');
    assertEqual(card.formatId, 'flashcard');

    assertEqual(await progress.getItem(examId, first.contentId), null,
        'a card review must not create a scored record for the item behind it');
    assertEqual(await store.get(`progress/${examId}/summary`), null,
        'nor may it create an exam summary — that would inflate a score');
});

await runner.test('finishing a deck reports the run and states there is no schedule', async () => {
    const deck = decks()[0];
    const { view } = await mountReview(deck.examId);

    for (let i = 0; i < deck.cards.length; i += 1) {
        view.root.querySelector('#flashcard-reveal').click();
        view.root.querySelector('#flashcard-known').click();
        await settle();
    }

    const text = view.root.textContent;
    assert(/Deck finished/.test(text), 'the run ends on a results screen');
    assert(text.includes(`of ${deck.cards.length} recalled this run`),
        'the result states the run it actually ran');
    assert(/no schedule/i.test(text),
        'and says plainly that there is no schedule to come back to');
    assert(view.root.querySelector('#flashcard-restart'), 'with a way to run it again');
});

await runner.test('a review run for an exam with no bank says so rather than crashing', async () => {
    const view = new FlashcardReviewView(undefined, '/flashcards/NOT-AN-EXAM');
    const el = await view.render({ examId: 'NOT-AN-EXAM' });
    assert(/No deck for that exam/.test(el.textContent), 'an honest empty state, not a throw');
    assert(el.textContent.includes('no released practice bank'));
});

process.exit(runner.done('flashcards'));
