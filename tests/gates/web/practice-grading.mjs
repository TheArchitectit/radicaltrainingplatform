/**
 * T-11/REQ-UI-03 — practice scoring parity fixture.
 *
 * Pins Web/js/views/practice.js `grade()` against the Core
 * ExamSessionViewModel.Grade rules (SPEC-09 R-03/R-04): choice items are
 * set equality (order-insensitive, count-sensitive); ordered items are
 * exact sequence equality with distinct failure reasons. S46-06 asserts
 * the same vectors against Core itself; this fixture pins the JS side so
 * a regression in the port fails the web fixtures independently.
 */
import { makeRunner, assert, assertEqual } from './helpers.mjs';

const { grade } = await import('../../../RadicalTrainingPlatform.Web/js/views/practice.js');

const runner = makeRunner();

const choice = { isOrdered: false, keys: ['B'] };
const multi = { isOrdered: false, keys: ['A', 'C'] };
const ordered = { isOrdered: true, keys: ['B', 'D', 'A'] };

await runner.test('single-select: exact match passes', async () => {
    assert(grade(choice, ['B']).isCorrect, 'B should pass');
});
await runner.test('single-select: wrong letter fails with set-mismatch', async () => {
    const r = grade(choice, ['A']);
    assert(!r.isCorrect);
    assertEqual(r.reason, 'set-mismatch');
});
await runner.test('multi-select: order-insensitive (A,C == C,A)', async () => {
    assert(grade(multi, ['C', 'A']).isCorrect, 'reordered multi-select must pass');
});
await runner.test('multi-select: subset fails (count-sensitive)', async () => {
    const r = grade(multi, ['A']);
    assert(!r.isCorrect);
    assertEqual(r.reason, 'set-mismatch');
});
await runner.test('multi-select: superset fails', async () => {
    const r = grade(multi, ['A', 'C', 'D']);
    assert(!r.isCorrect);
    assertEqual(r.reason, 'set-mismatch');
});
await runner.test('ordered: correct sequence passes', async () => {
    assert(grade(ordered, ['B', 'D', 'A']).isCorrect);
});
await runner.test('ordered: correct set wrong order fails with sequence-mismatch', async () => {
    const r = grade(ordered, ['A', 'B', 'D']);
    assert(!r.isCorrect);
    assertEqual(r.reason, 'sequence-mismatch');
});
await runner.test('ordered: missing step named', async () => {
    const r = grade(ordered, ['B', 'D']);
    assert(!r.isCorrect);
    assertEqual(r.reason, 'missing-step');
});
await runner.test('ordered: extra token named', async () => {
    const r = grade(ordered, ['B', 'D', 'A', 'C']);
    assert(!r.isCorrect);
    assertEqual(r.reason, 'extra-token');
});
await runner.test('ordered: duplicate step named', async () => {
    const r = grade(ordered, ['B', 'B', 'A']);
    assert(!r.isCorrect);
    assertEqual(r.reason, 'duplicate-step');
});

process.exit(runner.done('practice-grading'));
