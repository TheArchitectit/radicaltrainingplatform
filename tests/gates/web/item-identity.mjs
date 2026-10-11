/**
 * TM-81 / R-13 — source-aware item identity over the progress store.
 *
 * Two Q1 items from two source files in one exam must not collide. A bare
 * exam+number is ambiguous; the storage key is the semantic ID
 * (examId/sourceFile/Qn). Collision detection is covered by
 * scripts/check-item-identity.py (gate) and SemanticItemIdTests.cs (unit).
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

installDom();
const runner = makeRunner();

const { progress } = await import('../../../RadicalTrainingPlatform.Web/js/core/ProgressStore.js');

await progress.init();

const EXAM = 'NCA-75';
const Q1_PART1 = 'NCA-75/NCA-75-Part1.md/Q1';
const Q1_PART2 = 'NCA-75/NCA-75-Part2.md/Q1';

await runner.test('two Q1 items from two files in one exam get distinct records', async () => {
    const a = await progress.recordItem(EXAM, Q1_PART1, { isCorrect: true, reason: '' });
    const b = await progress.recordItem(EXAM, Q1_PART2, { isCorrect: false, reason: 'set-mismatch' });

    assertEqual(a.saved, true);
    assertEqual(b.saved, true);

    const ra = await progress.getItem(EXAM, Q1_PART1);
    const rb = await progress.getItem(EXAM, Q1_PART2);
    assert(ra, 'Part1 Q1 record exists');
    assert(rb, 'Part2 Q1 record exists');
    assertEqual(ra.isCorrect, true, 'Part1 Q1 must not be overwritten by Part2 Q1');
    assertEqual(rb.isCorrect, false);
    assert(ra.itemId !== rb.itemId, 'semantic item IDs differ');
});

await runner.test('semantic ID form is examId/sourceFile/Qn', async () => {
    for (const id of [Q1_PART1, Q1_PART2]) {
        const parts = id.split('/');
        assertEqual(parts.length, 3, `${id} must be three-part`);
        assertEqual(parts[0], EXAM);
        assert(parts[1].endsWith('.md'), 'source segment is a file name');
        assert(parts[2].startsWith('Q'), 'local segment carries the Q prefix');
    }
});

await runner.test('same local id in two exams stays separate (REQ-MAN-05 + R-13)', async () => {
    const a = await progress.recordItem('COMPTIA-A-1201', 'shared.md/Q1', { isCorrect: true, reason: '' });
    const n = await progress.recordItem('COMPTIA-NET-009', 'shared.md/Q1', { isCorrect: false, reason: '' });
    assertEqual(a.saved, true);
    assertEqual(n.saved, true);

    const ra = await progress.getItem('COMPTIA-A-1201', 'shared.md/Q1');
    const rn = await progress.getItem('COMPTIA-NET-009', 'shared.md/Q1');
    assertEqual(ra.isCorrect, true);
    assertEqual(rn.isCorrect, false);
});

process.exit(runner.done('item-identity'));
