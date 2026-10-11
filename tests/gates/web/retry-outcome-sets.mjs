/**
 * TM-82 / R-14 / D9 — retry outcome sets in BOTH directions.
 *
 * Policy (finalized with S45-05): first-attempt and latest-attempt are
 * separate, explicit metrics; displayed outcome = latest; statistics report
 * both. A retry must never leave first and latest disagreeing without BOTH
 * being visible in the stored record and the summary.
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

installDom();
const runner = makeRunner();

const { progress } = await import('../../../RadicalTrainingPlatform.Web/js/core/ProgressStore.js');
const { store } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateStore.js');

await progress.init();

const EXAM = 'COMPTIA-A-1201';

await runner.test('pass-then-fail: firstCorrect stays true, latest becomes false, both visible', async () => {
    const id = 'retry-pf.md/Q1';

    // First attempt: correct.
    let r = await progress.recordItem(EXAM, id, { isCorrect: true, reason: '' });
    assertEqual(r.saved, true);
    assertEqual(r.record.firstCorrect, true);
    assertEqual(r.record.latestCorrect, true);

    // Retry: wrong.
    r = await progress.recordItem(EXAM, id, { isCorrect: false, reason: 'set-mismatch' });
    const rec = await progress.getItem(EXAM, id);

    assertEqual(rec.attempts, 2);
    assertEqual(rec.firstCorrect, true, 'first-attempt win is immutable');
    assertEqual(rec.latestCorrect, false, 'displayed outcome = latest');
    assertEqual(rec.isCorrect, false, 'isCorrect aliases latestCorrect');
    // Both visible whenever they disagree.
    assert(rec.firstCorrect !== rec.latestCorrect,
        'first and latest disagree — both must be present on the record');
});

await runner.test('fail-then-pass: firstCorrect stays false, latest becomes true, both visible', async () => {
    const id = 'retry-fp.md/Q1';

    // First attempt: wrong.
    let r = await progress.recordItem(EXAM, id, { isCorrect: false, reason: 'set-mismatch' });
    assertEqual(r.record.firstCorrect, false);
    assertEqual(r.record.latestCorrect, false);

    // Retry: correct.
    r = await progress.recordItem(EXAM, id, { isCorrect: true, reason: '' });
    const rec = await progress.getItem(EXAM, id);

    assertEqual(rec.attempts, 2);
    assertEqual(rec.firstCorrect, false, 'first-attempt miss is immutable');
    assertEqual(rec.latestCorrect, true, 'displayed outcome = latest');
    assertEqual(rec.isCorrect, true);
    assert(rec.firstCorrect !== rec.latestCorrect,
        'first and latest disagree — both must be present on the record');
});

await runner.test('summary exposes both metrics; retries never inflate item counts', async () => {
    const summary = await store.get(`progress/${EXAM}/summary`);
    // Two unique items (retry-pf, retry-fp), three scored events.
    assertEqual(summary.attempted, 2, 'unique items, not scored events');
    // Display = latest: retry-fp is currently correct (1); retry-pf is wrong.
    assertEqual(summary.correct, 1);
    // First-attempt wins: retry-pf only (1). Both metrics are stored even
    // when the aggregates happen to coincide.
    assertEqual(summary.firstCorrect, 1);
    assert(typeof summary.firstCorrect === 'number' && typeof summary.correct === 'number',
        'both metrics must be present on the summary');
});

await runner.test('summary aggregates diverge when the item-level disagreements align', async () => {
    // A second pass-then-fail item: firstCorrect moves to 2, latest-correct
    // stays 1 — the two numbers now differ and both are visible.
    const id = 'retry-pf2.md/Q1';
    await progress.recordItem(EXAM, id, { isCorrect: true, reason: '' });
    await progress.recordItem(EXAM, id, { isCorrect: false, reason: '' });

    const summary = await store.get(`progress/${EXAM}/summary`);
    assertEqual(summary.attempted, 3, 'three unique items');
    assertEqual(summary.correct, 1, 'latest-correct still only retry-fp');
    assertEqual(summary.firstCorrect, 2, 'first-attempt wins: retry-pf and retry-pf2');
    assert(summary.firstCorrect !== summary.correct,
        'aligned pass-then-fail retries must make the disagreement visible in the summary');
});

await runner.test('double-flip: first is still frozen after three more attempts', async () => {
    const id = 'retry-flip.md/Q1';
    await progress.recordItem(EXAM, id, { isCorrect: true, reason: '' });   // first: pass
    await progress.recordItem(EXAM, id, { isCorrect: false, reason: '' });  // flip
    await progress.recordItem(EXAM, id, { isCorrect: true, reason: '' });   // flip
    await progress.recordItem(EXAM, id, { isCorrect: false, reason: '' });  // flip

    const rec = await progress.getItem(EXAM, id);
    assertEqual(rec.attempts, 4);
    assertEqual(rec.firstCorrect, true, 'first outcome never moves');
    assertEqual(rec.latestCorrect, false);
});

process.exit(runner.done('retry-outcome-sets'));
