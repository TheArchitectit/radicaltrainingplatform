/**
 * S37-01 — the content-format registry.
 *
 * The load-bearing test here is the one that classifies **every ID in the
 * real content** rather than a hand-picked sample. A classifier that handles
 * `COMPTIA-A-1201/A2` and `mci-01` proves nothing about the other 55 lessons,
 * 188 items and 49 scenarios — and the registry is only useful if it holds
 * over the whole ID space, because that is what the progress, cross-link and
 * search surfaces will feed it.
 *
 * The second thing it pins is the namespace claim: content progress keys must
 * not collide with the exam-scoped keys ProgressStore already writes, and a
 * demo reset must sweep them. Both are asserted against the real
 * ProgressStore, not against a restatement of its key format.
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

installDom();
const runner = makeRunner();

const { CONTENT_FORMATS, FORMAT_IDS, formatFor, format, isKnownFormat, progressKeyFor } =
    await import('../../../RadicalTrainingPlatform.Web/js/core/ContentFormats.js');
const { LESSONS, ITEMS, EXAMS } = await import('../../../RadicalTrainingPlatform.Web/js/study-content.js');
const { SCENARIOS } = await import('../../../RadicalTrainingPlatform.Web/js/views/scenarios.js');
const { progress } = await import('../../../RadicalTrainingPlatform.Web/js/core/ProgressStore.js');
const { store } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateStore.js');

await progress.init();

function assertThrows(fn, needle, msg) {
    let threw = null;
    try {
        fn();
    } catch (e) {
        threw = e;
    }
    assert(threw, `${msg || 'expected a throw'} — nothing was thrown`);
    if (needle) {
        assert(String(threw.message).includes(needle),
            `${msg || 'throw message'}: expected to mention ${JSON.stringify(needle)}, got ${JSON.stringify(threw.message)}`);
    }
}

// ─── The registry itself ───────────────────────────────────────────

await runner.test('the registry declares exactly the four formats, each frozen', async () => {
    assertEqual(FORMAT_IDS.length, 4, 'four formats are in scope for S37-01');
    for (const id of ['lesson', 'item', 'scenario', 'flashcard']) {
        assert(FORMAT_IDS.includes(id), `${id} must be registered`);
    }
    assert(Object.isFrozen(CONTENT_FORMATS), 'the registry must be frozen');
    for (const id of FORMAT_IDS) {
        assert(Object.isFrozen(CONTENT_FORMATS[id]), `${id} descriptor must be frozen`);
    }
});

await runner.test('every descriptor carries the fields a caller needs', async () => {
    for (const id of FORMAT_IDS) {
        const f = CONTENT_FORMATS[id];
        assertEqual(f.id, id, 'descriptor id must match its key');
        for (const field of ['label', 'plural', 'idShape', 'example', 'source', 'progressKind']) {
            assert(typeof f[field] === 'string' && f[field].length,
                `${id}.${field} must be a non-empty string`);
        }
        assert('route' in f, `${id}.route must be declared (null where no route exists)`);
        assert(typeof f.scorable === 'boolean', `${id}.scorable must be a boolean`);
    }
});

await runner.test('only the item format is scorable', async () => {
    // A lesson is read, a scenario is completed, a card is reviewed. Only a
    // practice item has a right answer — and a card flip must never be
    // counted as one.
    const scorable = FORMAT_IDS.filter(id => CONTENT_FORMATS[id].scorable);
    assertEqual(scorable.join(','), 'item', 'exactly one scorable format');
});

await runner.test('format() and isKnownFormat() answer for known and unknown ids', async () => {
    assertEqual(format('lesson'), CONTENT_FORMATS.lesson, 'known format returns its descriptor');
    assertEqual(format('nope'), null, 'unknown format returns null, never throws');
    assertEqual(isKnownFormat('flashcard'), true);
    assertEqual(isKnownFormat('flashcard '), false, 'no trimming: ids are exact');
    assertEqual(isKnownFormat('__proto__'), false, 'inherited keys are not formats');
    assertEqual(isKnownFormat('constructor'), false, 'inherited keys are not formats');
});

// ─── The classifier, over the real ID space ────────────────────────

await runner.test('every lesson in the real content classifies as a lesson', async () => {
    const ids = Object.keys(LESSONS);
    assert(ids.length > 0, 'the content must expose lessons');
    const wrong = ids.filter(id => formatFor(id) !== 'lesson');
    assertEqual(wrong.length, 0, `lesson ids that did not classify as lesson: ${wrong.slice(0, 5).join(', ')}`);
});

await runner.test('every item in the real content classifies as an item', async () => {
    assert(ITEMS.length > 0, 'the content must expose items');
    const wrong = ITEMS.map(i => i.id).filter(id => formatFor(id) !== 'item');
    assertEqual(wrong.length, 0, `item ids that did not classify as item: ${wrong.slice(0, 5).join(', ')}`);
});

await runner.test('every scenario in the real content classifies as a scenario', async () => {
    assert(SCENARIOS.length > 0, 'the content must expose scenarios');
    const wrong = SCENARIOS.map(s => s.id).filter(id => formatFor(id) !== 'scenario');
    assertEqual(wrong.length, 0, `scenario ids that did not classify as scenario: ${wrong.slice(0, 5).join(', ')}`);
});

await runner.test('the three ID spaces are disjoint — no id classifies as two formats', async () => {
    // The slash rule only works if no segment contains a slash. If an exam,
    // lesson or source file ever gained one, an id would start matching the
    // wrong format, and the failure would be silent everywhere downstream.
    const lessonIds = new Set(Object.keys(LESSONS));
    const itemIds = new Set(ITEMS.map(i => i.id));
    const scenarioIds = new Set(SCENARIOS.map(s => s.id));
    for (const id of lessonIds) assert(!itemIds.has(id) && !scenarioIds.has(id), `lesson ${id} collides`);
    for (const id of itemIds) assert(!scenarioIds.has(id), `item ${id} collides`);
});

await runner.test('an unrecognised shape is null, never a guess', async () => {
    assertEqual(formatFor(''), null, 'empty is not a format');
    assertEqual(formatFor(null), null, 'null is not a format');
    assertEqual(formatFor(undefined), null, 'undefined is not a format');
    assertEqual(formatFor('a/b/c/d'), null, 'four segments match nothing');
    assertEqual(formatFor('a/b/c'), 'item', 'three segments is the item shape');
});

await runner.test('formatFor never returns flashcard — a card shares its item id', async () => {
    // Documented behaviour, pinned so a future edit cannot quietly make
    // flashcards a separate ID space and orphan every stored review record.
    const anItemId = ITEMS[0].id;
    assertEqual(formatFor(anItemId), 'item', 'a card id is an item id');
    const everyId = [...Object.keys(LESSONS), ...ITEMS.map(i => i.id), ...SCENARIOS.map(s => s.id)];
    const sawFlashcard = everyId.filter(id => formatFor(id) === 'flashcard');
    assertEqual(sawFlashcard.length, 0,
        'no content id may classify as a flashcard — the format is named, never inferred');
});

// ─── The progress key ──────────────────────────────────────────────

await runner.test('progressKeyFor builds the documented key', async () => {
    assertEqual(progressKeyFor('lesson', 'COMPTIA-A-1201/A2'), 'progress/content/lesson/COMPTIA-A-1201/A2');
    assertEqual(progressKeyFor('item', 'COMPTIA-A-1201/core1-a2-fixtures.md/Q1'),
        'progress/content/item/COMPTIA-A-1201/core1-a2-fixtures.md/Q1');
    assertEqual(progressKeyFor('scenario', 'mci-01'), 'progress/content/scenario/mci-01');
    assertEqual(progressKeyFor('flashcard', 'COMPTIA-A-1201/core1-a2-fixtures.md/Q1'),
        'progress/content/flashcard/COMPTIA-A-1201/core1-a2-fixtures.md/Q1');
});

await runner.test('progressKeyFor refuses an unknown format or an empty id', async () => {
    // A call site that has the format in hand is a programming error when it
    // passes nonsense — unlike formatFor, which classifies input it did not choose.
    assertThrows(() => progressKeyFor('nope', 'x'), 'unknown format', 'unknown format must throw');
    assertThrows(() => progressKeyFor('lesson', ''), 'empty content id', 'empty id must throw');
    assertThrows(() => progressKeyFor('lesson', null), 'empty content id', 'null id must throw');
});

await runner.test('a content key cannot collide with an exam-scoped key', async () => {
    // progress/<examId>/<itemId> and progress/content/<formatId>/<contentId>
    // differ at the second segment: 'content' is not an exam id, and no exam
    // id is 'content'. Both halves are asserted, so neither side can drift
    // into the other's namespace unnoticed.
    assert(!Object.keys(EXAMS).includes('content'), "no exam may be named 'content'");
    const key = progressKeyFor('item', ITEMS[0].id);
    const examScoped = `progress/${ITEMS[0].examId}/${ITEMS[0].id.split('/').slice(1).join('/')}`;
    assert(key !== examScoped, 'the two key shapes must differ');
    assertEqual(key.split('/')[1], 'content', 'content keys live under progress/content/');
});

await runner.test('clearStation sweeps content progress — a demo reset clears it', async () => {
    // The reset is what a presenter presses between students. If content
    // progress survived it, the next student would inherit the last one's
    // review state, and the reset would be a false reset.
    const key = progressKeyFor('flashcard', ITEMS[0].id);
    await store.set(key, { contentId: ITEMS[0].id, reviewedAt: '2026-10-14T00:00:00Z' });
    assert(await store.get(key), 'content record must be written before the sweep');

    const before = await store.keys('progress/content/');
    assert(before.includes(key), 'the record must be enumerable under the prefix');

    const result = await progress.clearStation();
    assert(result.cleared > 0, 'the reset must report what it cleared');
    assertEqual(await store.get(key), null, 'content progress must be gone after a reset');
    assertEqual((await store.keys('progress/content/')).length, 0, 'no content keys may survive');
});

process.exit(runner.done('content-formats'));
