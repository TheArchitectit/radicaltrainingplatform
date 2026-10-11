/**
 * TM-85 / R-15 — study continuation across sessions.
 *
 * Acceptance: "Study-continuation restore works across sessions." The
 * mid-run pointer (index + in-progress selection + results so far) is
 * persisted on change and restored on render; it is cleared on complete
 * and on restart so a finished run never resumes as a ghost.
 *
 * Failing side: pre-R-15 practice.js always started at index 0 with an
 * empty selection and kept no continuation record — the restore tests
 * below fail against that behavior. Passing side: the APIs and the
 * round-trip they must satisfy.
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

installDom();
const runner = makeRunner();

const { progress } = await import('../../../RadicalTrainingPlatform.Web/js/core/ProgressStore.js');
const { store } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateStore.js');

await progress.init();

const EXAM = 'COMPTIA-A-1201';

await runner.test('saveContinuation persists index + selection + results', async () => {
    const r = await progress.saveContinuation(EXAM, {
        index: 2,
        selection: ['B', 'D'],
        results: [{ isCorrect: true }, { isCorrect: false }],
        total: 5,
    });
    assertEqual(r.saved, true);

    const cont = await progress.loadContinuation(EXAM);
    assert(cont, 'continuation must be readable back');
    assertEqual(cont.index, 2, 'exact position');
    assertEqual(cont.selection.length, 2);
    assertEqual(cont.selection[0], 'B');
    assertEqual(cont.selection[1], 'D');
    assertEqual(cont.results.length, 2, 'results collected so far');
    assertEqual(cont.results[0].isCorrect, true);
    assertEqual(cont.results[1].isCorrect, false);
    assertEqual(cont.total, 5);
});

await runner.test('loadContinuation restores the same position (cross-session)', async () => {
    // A reload re-reads the same storage through loadContinuation.
    const cont = await progress.loadContinuation(EXAM);
    assertEqual(cont.index, 2, 'index survives the round-trip');
    assertEqual(cont.selection.join(''), 'BD', 'in-progress selection survives');
    assertEqual(cont.results.length, 2, 'partial results survive');

    // The storage key is the documented continuation slot, not a side channel.
    const raw = await store.get(`progress/${EXAM}/continuation`);
    assert(raw, 'continuation lives at progress/<examId>/continuation');
    assertEqual(raw.index, 2);
});

await runner.test('overwrite keeps the latest position only', async () => {
    await progress.saveContinuation(EXAM, {
        index: 4,
        selection: ['A'],
        results: [{ isCorrect: true }, { isCorrect: false }, { isCorrect: true }, { isCorrect: true }],
        total: 5,
    });
    const cont = await progress.loadContinuation(EXAM);
    assertEqual(cont.index, 4, 'latest write wins');
    assertEqual(cont.selection.join(''), 'A');
    assertEqual(cont.results.length, 4);
});

await runner.test('clearContinuation removes the pointer (complete / restart)', async () => {
    await progress.clearContinuation(EXAM);
    const cont = await progress.loadContinuation(EXAM);
    assertEqual(cont, null, 'a completed or restarted run must not resume');
});

await runner.test('clearExam also drops continuation (reset never leaves a ghost)', async () => {
    await progress.saveContinuation(EXAM, { index: 1, selection: ['C'], results: [], total: 3 });
    await progress.clearExam(EXAM);
    const cont = await progress.loadContinuation(EXAM);
    assertEqual(cont, null, 'clearExam must clear continuation with the summary');
});

await runner.test('malformed index is coerced, never trusted as a crash', async () => {
    const r = await progress.saveContinuation(EXAM, {
        index: 'nope',
        selection: 'BD',
        results: null,
        total: undefined,
    });
    assertEqual(r.saved, true);
    assertEqual(r.record.index, 0, 'non-integer index falls back to 0');
    assertEqual(r.record.selection.length, 0, 'non-array selection becomes empty');
    assertEqual(r.record.results.length, 0, 'non-array results becomes empty');
    assertEqual(r.record.total, 0);
});

process.exit(runner.done('study-continuation'));
