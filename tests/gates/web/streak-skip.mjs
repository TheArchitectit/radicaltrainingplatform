/**
 * TM-85 / R-17 — streak from attempt history, and Skip notifications.
 *
 * Two defects this encodes:
 *  1. Streak was a counter a retry inflated (answer one item right twice →
 *     streak 2). It must derive from attempt history: consecutive correct
 *     since the last miss, counting each distinct item at most once.
 *  2. Skip notifications must fire ONLY on a real skip. Submit/retry must
 *     never emit progress:skipped.
 *
 * Failing side: a naive streak++ and a skip event on every miss both fail
 * the assertions below. Passing side: ProgressStore's streak state and the
 * single emitter rule.
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

installDom();
const runner = makeRunner();

const { progress } = await import('../../../RadicalTrainingPlatform.Web/js/core/ProgressStore.js');
const { bus } = await import('../../../RadicalTrainingPlatform.Web/js/core/EventBus.js');
const { store } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateStore.js');

await progress.init();

const EXAM = 'COMPTIA-NET-009';

function watchSkips() {
    const seen = [];
    const off = bus.on('progress:skipped', (e) => seen.push(e));
    return { seen, off };
}

await runner.test('streak increments on consecutive correct items', async () => {
    await progress.recordItem(EXAM, 'streak.md/Q1', { isCorrect: true, reason: '' });
    let meta = await progress.getMeta();
    assertEqual(meta.streak, 1);

    await progress.recordItem(EXAM, 'streak.md/Q2', { isCorrect: true, reason: '' });
    meta = await progress.getMeta();
    assertEqual(meta.streak, 2);
    assertEqual(meta.bestStreak >= 2, true);
});

await runner.test('a correct retry of the same item does NOT inflate the streak', async () => {
    // Failing side of the old bug: Q1 right twice read as streak 2.
    await progress.recordItem(EXAM, 'streak.md/Q1', { isCorrect: true, reason: '' });
    const meta = await progress.getMeta();
    assertEqual(meta.streak, 2, 'retry of an item already in the run adds no phantom step');
    assertEqual(meta.streakItems.length, 2, 'run holds distinct items only');
});

await runner.test('a miss resets the run; peak is retained', async () => {
    await progress.recordItem(EXAM, 'streak.md/Q3', { isCorrect: false, reason: 'set-mismatch' });
    const meta = await progress.getMeta();
    assertEqual(meta.streak, 0, 'streak is consecutive-correct since the last miss');
    assertEqual(meta.bestStreak, 2, 'best streak survives the reset');
    assertEqual(meta.streakItems.length, 0, 'run is cleared on a miss');
});

await runner.test('fail-then-pass retry counts one step after the miss', async () => {
    await progress.recordItem(EXAM, 'streak.md/Q4', { isCorrect: false, reason: '' });
    let meta = await progress.getMeta();
    assertEqual(meta.streak, 0);

    await progress.recordItem(EXAM, 'streak.md/Q4', { isCorrect: true, reason: '' });
    meta = await progress.getMeta();
    assertEqual(meta.streak, 1, 'one distinct item since the miss');

    // Correct retry still must not inflate.
    await progress.recordItem(EXAM, 'streak.md/Q4', { isCorrect: true, reason: '' });
    meta = await progress.getMeta();
    assertEqual(meta.streak, 1, 'second correct attempt on Q4 is still one step');
});

await runner.test('recordItem never emits progress:skipped (R-17)', async () => {
    const { seen, off } = watchSkips();
    await progress.recordItem(EXAM, 'streak.md/Q5', { isCorrect: false, reason: 'set-mismatch' });
    await progress.recordItem(EXAM, 'streak.md/Q6', { isCorrect: true, reason: '' });
    off();
    assertEqual(seen.length, 0,
        'submit/retry must not fire skip notifications — only real skips do');
});

await runner.test('skipItem emits progress:skipped exactly once and records a miss', async () => {
    const { seen, off } = watchSkips();
    const r = await progress.skipItem(EXAM, 'streak.md/Q7');
    off();

    assertEqual(r.saved, true);
    assertEqual(seen.length, 1, 'a real skip notifies once');
    assertEqual(seen[0].examId, EXAM);
    assertEqual(seen[0].itemId, 'streak.md/Q7');

    const rec = await progress.getItem(EXAM, 'streak.md/Q7');
    assertEqual(rec.isCorrect, false, 'skip is a miss');
    assertEqual(rec.latestCorrect, false);
    assertEqual(rec.reason, 'skipped');
    assertEqual(rec.firstCorrect, false, 'a skip is never a first-attempt win');

    const meta = await progress.getMeta();
    assertEqual(meta.streak, 0, 'skip breaks the streak like any miss');
});

await runner.test('skip after a streak clears it and leaves bestStreak intact', async () => {
    await progress.recordItem(EXAM, 'streak.md/Q8', { isCorrect: true, reason: '' });
    await progress.recordItem(EXAM, 'streak.md/Q9', { isCorrect: true, reason: '' });
    let meta = await progress.getMeta();
    assertEqual(meta.streak, 2);

    const { seen, off } = watchSkips();
    await progress.skipItem(EXAM, 'streak.md/Q10');
    off();
    assertEqual(seen.length, 1);

    meta = await progress.getMeta();
    assertEqual(meta.streak, 0);
    assertEqual(meta.bestStreak, 2, 'peak retained across a skip');
});

await runner.test('failed skip save emits no skip notification (never a false event)', async () => {
    const original = globalThis.localStorage.setItem;
    globalThis.localStorage.setItem = () => {
        throw new Error('QuotaExceededError');
    };
    const { seen, off } = watchSkips();
    try {
        const r = await progress.skipItem(EXAM, 'streak.md/Q11');
        assertEqual(r.saved, false, 'storage failure reports saved:false');
    } finally {
        globalThis.localStorage.setItem = original;
        off();
    }
    assertEqual(seen.length, 0, 'a skip that did not persist must not announce itself');
});

process.exit(runner.done('streak-skip'));
