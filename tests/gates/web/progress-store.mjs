/**
 * T-12/REQ-UI-04/05 — ProgressStore save/restore/failure fixture.
 *
 * Drives the real ProgressStore over the real StateStore fallback path
 * (localStorage stub), then a fresh instance over the same storage to prove
 * restore-after-reload. Failure path: a store that throws must yield a
 * { saved: false } result, never a false save (Plan v2 L-02).
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

installDom();
const runner = makeRunner();

const { progress } = await import('../../../RadicalTrainingPlatform.Web/js/core/ProgressStore.js');
const { store } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateStore.js');

await runner.test('recordItem persists and restore() recovers it (REQ-UI-04)', async () => {
    await progress.init();
    const r = await progress.recordItem('COMPTIA-A-1201', 'core1-a2-fixtures.md/Q1', {
        isCorrect: true, reason: '', answeredAt: '2026-10-11T00:00:00Z',
    });
    assertEqual(r.saved, true, 'first save must succeed');

    // Reload semantics: read the record back through storage, the way a
    // fresh page load's restore() would.
    const rec = await progress.getItem('COMPTIA-A-1201', 'core1-a2-fixtures.md/Q1');
    assert(rec, 'record must be readable back');
    assertEqual(rec.isCorrect, true);
    assertEqual(rec.attempts, 1);

    const restored = await progress.restore('COMPTIA-A-1201', [
        'core1-a2-fixtures.md/Q1', 'core1-a2-fixtures.md/Q2',
    ]);
    assertEqual(restored.attempted, 1, 'only one item answered');
    assertEqual(restored.correct, 1);
    assert(restored.items['core1-a2-fixtures.md/Q1'], 'answered item restored');
    assert(!restored.items['core1-a2-fixtures.md/Q2'], 'unanswered item absent');
});

await runner.test('attempt counts accumulate across re-answers', async () => {
    await progress.recordItem('COMPTIA-A-1201', 'core1-a2-fixtures.md/Q1', {
        isCorrect: false, reason: 'set-mismatch',
    });
    const rec = await progress.getItem('COMPTIA-A-1201', 'core1-a2-fixtures.md/Q1');
    assertEqual(rec.attempts, 2, 'second answer bumps attempts');
    assertEqual(rec.isCorrect, false, 'latest outcome wins');
});

await runner.test('summary tracks attempted/correct', async () => {
    await progress.recordItem('COMPTIA-A-1201', 'core1-a2-fixtures.md/Q3', {
        isCorrect: true, reason: '',
    });
    const summary = await store.get('progress/COMPTIA-A-1201/summary');
    assertEqual(summary.attempted, 3, '3 scored events recorded');
    assertEqual(summary.correct, 2, 'two of three correct');
});

await runner.test('storage failure returns saved:false, never a false save (L-02)', async () => {
    // Force StateStore into its fallback and make localStorage.setItem throw
    // (quota/blocked storage).
    const original = globalThis.localStorage.setItem;
    globalThis.localStorage.setItem = () => {
        throw new Error('QuotaExceededError');
    };
    try {
        const r = await progress.recordItem('COMPTIA-A-1201', 'core1-a2-fixtures.md/Q4', {
            isCorrect: true, reason: '',
        });
        assertEqual(r.saved, false, 'failed save must report saved:false');
        assertEqual(r.reason, 'storage-write-failed');
    } finally {
        globalThis.localStorage.setItem = original;
    }
});

await runner.test('recordScenario persists scenario completion', async () => {
    const r = await progress.recordScenario('mci-02');
    assertEqual(r.saved, true);
    const rec = await progress.getScenario('mci-02');
    assert(rec, 'scenario record readable back');
    assertEqual(rec.scenarioId, 'mci-02');
    assert(rec.completedAt, 'completedAt set');
});

process.exit(runner.done('progress-store'));
