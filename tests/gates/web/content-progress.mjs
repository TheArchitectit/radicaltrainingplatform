/**
 * S37-06 — per-format content progress.
 *
 * The test that matters most is the isolation one: reviewing a flashcard must
 * not move the scored record for the item the card was derived from. A card
 * and its item share an ID (see ContentFormats.js), so they are one `store.set`
 * away from being the same fact — and if they ever become the same fact, a
 * learner can farm a correct score by flipping cards.
 *
 * The rest pins the contract the other writes here already use: counts are of
 * content not events, firstRecordedAt is frozen, a blocked store reports
 * { saved: false } rather than losing the write, and the formats that own
 * their own key space are refused rather than quietly duplicated.
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

installDom();
const runner = makeRunner();

const { progress } = await import('../../../RadicalTrainingPlatform.Web/js/core/ProgressStore.js');
const { store } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateStore.js');
const { ITEMS } = await import('../../../RadicalTrainingPlatform.Web/js/study-content.js');

await progress.init();

const ITEM_ID = ITEMS[0].id;      // COMPTIA-A-1201/core1-a2-fixtures.md/Q1
const EXAM_ID = ITEMS[0].examId;
const LESSON_ID = 'COMPTIA-A-1201/A2';

async function assertRejects(fn, needle, msg) {
    let threw = null;
    try {
        await fn();
    } catch (e) {
        threw = e;
    }
    assert(threw, `${msg || 'expected a rejection'} — nothing was thrown`);
    if (needle) {
        assert(String(threw.message).includes(needle),
            `${msg || 'throw message'}: expected to mention ${JSON.stringify(needle)}, got ${JSON.stringify(threw.message)}`);
    }
}

// ─── The write contract ────────────────────────────────────────────

await runner.test('a lesson read is recorded with the documented shape', async () => {
    const r = await progress.recordContent('lesson', LESSON_ID, {
        outcome: 'read', recordedAt: '2026-10-14T10:00:00Z',
    });
    assertEqual(r.saved, true, 'the write must report success');
    assertEqual(r.record.formatId, 'lesson');
    assertEqual(r.record.contentId, LESSON_ID);
    assertEqual(r.record.outcome, 'read');
    assertEqual(r.record.count, 1, 'first record is the first sighting');
    assertEqual(r.record.firstRecordedAt, '2026-10-14T10:00:00Z');
    assertEqual(r.record.lastRecordedAt, '2026-10-14T10:00:00Z');

    const read = await progress.getContent('lesson', LESSON_ID);
    assert(read, 'the record must be readable back through the store');
    assertEqual(read.outcome, 'read');
});

await runner.test('a repeat sighting bumps count; firstRecordedAt never moves', async () => {
    await progress.recordContent('lesson', LESSON_ID, {
        outcome: 'read', recordedAt: '2026-10-15T10:00:00Z',
    });
    const rec = await progress.getContent('lesson', LESSON_ID);
    assertEqual(rec.count, 2, 'second read bumps the count');
    assertEqual(rec.firstRecordedAt, '2026-10-14T10:00:00Z',
        'firstRecordedAt is frozen at the first sighting, like firstCorrect is for an item');
    assertEqual(rec.lastRecordedAt, '2026-10-15T10:00:00Z', 'lastRecordedAt moves');
});

await runner.test('outcome carries the LAST review, not an accumulation', async () => {
    await progress.recordContent('flashcard', ITEM_ID, { outcome: 'known' });
    await progress.recordContent('flashcard', ITEM_ID, { outcome: 'missed' });
    const rec = await progress.getContent('flashcard', ITEM_ID);
    assertEqual(rec.outcome, 'missed', 'the latest outcome is what a review queue needs');
    assertEqual(rec.count, 2, 'how many times it has been seen is separate');
});

// ─── The isolation claim ───────────────────────────────────────────

await runner.test('reviewing a card does not touch the item it was derived from', async () => {
    // Same ID, two formats, two keys. This is the whole reason flashcards get
    // their own progress kind instead of riding on the scored record.
    await progress.recordItem(EXAM_ID, ITEM_ID, { isCorrect: true, reason: '' });
    const scoredBefore = await progress.getItem(EXAM_ID, ITEM_ID);
    const summaryBefore = await store.get(`progress/${EXAM_ID}/summary`);

    await progress.recordContent('flashcard', ITEM_ID, { outcome: 'missed' });

    const scoredAfter = await progress.getItem(EXAM_ID, ITEM_ID);
    const summaryAfter = await store.get(`progress/${EXAM_ID}/summary`);
    assertEqual(scoredAfter.attempts, scoredBefore.attempts,
        'a card review must not add a scored attempt');
    assertEqual(scoredAfter.isCorrect, true,
        'a missed card must not turn a correct answer wrong');
    assertEqual(summaryAfter.attempted, summaryBefore.attempted,
        'a card review must not inflate the exam summary');
    assertEqual(summaryAfter.correct, summaryBefore.correct);

    const card = await progress.getContent('flashcard', ITEM_ID);
    assertEqual(card.outcome, 'missed', 'the card record holds the review outcome');
    assertEqual(card.formatId, 'flashcard');
});

await runner.test('the two records live under different keys', async () => {
    const scoredKey = `progress/${EXAM_ID}/${ITEM_ID}`;
    const cardKey = `progress/content/flashcard/${ITEM_ID}`;
    assert(scoredKey !== cardKey, 'the key shapes must differ');
    assert(await store.get(scoredKey), 'the scored record exists');
    assert(await store.get(cardKey), 'the card record exists');
    assertEqual((await store.keys('progress/content/')).includes(scoredKey), false,
        'the scored key must not be enumerable as content progress');
});

// ─── Refusals ──────────────────────────────────────────────────────

await runner.test('formats with their own path are refused, not duplicated', async () => {
    // A second key for the same fact is the fragmentation the registry exists
    // to prevent, so it is a throw rather than a silent write.
    // recordContent is async, so the refusal arrives as a rejection — still a
    // throw at the call site, which is what the guard is for.
    await assertRejects(() => progress.recordContent('item', ITEM_ID), 'recordItem',
        'item progress has its own path');
    await assertRejects(() => progress.recordContent('scenario', 'mci-01'), 'recordScenario',
        'scenario progress has its own path');
    await assertRejects(() => progress.recordContent('nope', 'x'), 'unknown format',
        'an unregistered format is refused by the registry');
    // And the refusal must not have written anything on its way out.
    assertEqual((await store.keys('progress/content/item/')).length, 0,
        'a refused write must leave no key behind');
    assertEqual((await store.keys('progress/content/scenario/')).length, 0,
        'a refused write must leave no key behind');
});

// ─── Storage failure is never a false save ─────────────────────────

await runner.test('a blocked store returns saved:false with a reason (L-02)', async () => {
    const original = globalThis.localStorage.setItem;
    globalThis.localStorage.setItem = () => {
        throw new Error('QuotaExceededError');
    };
    try {
        const r = await progress.recordContent('lesson', 'COMPTIA-A-1201/A3', { outcome: 'read' });
        assertEqual(r.saved, false, 'a failed write must not report success');
        assertEqual(r.reason, 'storage-write-failed');
    } finally {
        globalThis.localStorage.setItem = original;
    }
});

// ─── The summary ───────────────────────────────────────────────────

await runner.test('contentSummary counts content, not events (R-04)', async () => {
    const lessonIds = ['COMPTIA-A-1201/A2', 'COMPTIA-A-1201/A3', 'COMPTIA-A-1201/A4'];
    const s = await progress.contentSummary('lesson', lessonIds);
    assertEqual(s.formatId, 'lesson');
    assertEqual(s.total, 3);
    // A2 was recorded twice above and A3's write was blocked, so exactly one
    // of the three has been read — two reads of one lesson is one lesson.
    assertEqual(s.touched, 1, 'a lesson read twice is one lesson read');
    assertEqual(s.remaining, 2);
    assert(s.records['COMPTIA-A-1201/A2'], 'the read lesson is reported');
    assert(!s.records['COMPTIA-A-1201/A4'], 'an unread lesson is absent, not zero-filled');
});

await runner.test('contentSummary reads scenarios from their own key', async () => {
    // The documented exception: scenarios predate the registry and are not
    // migrated, so the summary must read where the record actually is.
    await progress.recordScenario('mci-01');
    const s = await progress.contentSummary('scenario', ['mci-01', 'mci-02', 'mci-03']);
    assertEqual(s.total, 3);
    assertEqual(s.touched, 1, 'only the completed scenario counts as touched');
    assertEqual(s.records['mci-01'].scenarioId, 'mci-01');
});

await runner.test('contentSummary over an empty list is a clean zero', async () => {
    const s = await progress.contentSummary('flashcard', []);
    assertEqual(s.total, 0);
    assertEqual(s.touched, 0);
    assertEqual(s.remaining, 0);
});

// ─── The reset ─────────────────────────────────────────────────────

await runner.test('the station reset clears content progress too', async () => {
    // Asserted here as well as in content-formats.mjs because this fixture is
    // the one that has written lesson and card records: if the sweep missed
    // them, the next student on a shared machine would inherit them.
    assert(await progress.getContent('lesson', LESSON_ID), 'precondition: a lesson record exists');
    assert(await progress.getContent('flashcard', ITEM_ID), 'precondition: a card record exists');

    const result = await progress.clearStation();
    assert(result.cleared > 0, 'the reset must report what it cleared');
    assertEqual((await store.keys('progress/content/')).length, 0, 'no content keys survive');
    assertEqual(await progress.getContent('lesson', LESSON_ID), null, 'the lesson record is gone');
    assertEqual(await progress.getContent('flashcard', ITEM_ID), null, 'the card record is gone');
});

process.exit(runner.done('content-progress'));
