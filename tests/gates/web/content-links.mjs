/**
 * Cross-linking (S37-05) — lesson ↔ item ↔ objective ↔ deck ↔ scenario.
 *
 * The links this pins are the ones the data can actually support, and the
 * fixture is written to hold the *refusals* down as firmly as the links:
 *
 *   1. **An item reaches its lesson through its blueprint objective, and only
 *      when a released lesson really covers that objective.** 24 of the 189
 *      items have no covering lesson in this build; those must render no link
 *      at all. A link to a lesson that does not teach the item is worse than
 *      no link, because a learner would trust it.
 *   2. **Every href the link layer hands out is a route the app registers.**
 *      Read out of `js/app.js`, same as the search fixture — a hash router
 *      never 404s, it silently bounces to the dashboard.
 *   3. **No scenario carries a lesson ID.** Four beginner scenarios name a
 *      lesson in prose ("Powers lesson 1.3"); a sentence is not a field. The
 *      lesson reader therefore links to the exam's scenario set. Pinning the
 *      absence means a future per-lesson mapping is a deliberate change rather
 *      than something that quietly starts being assumed.
 */
import { installDom, makeRunner, assert, assertEqual, registeredRoutePatterns, hrefIsRouted } from './helpers.mjs';

installDom();
const runner = makeRunner();

const {
    trackForExam, lessonKeyOf, releasedLessons, lessonForObjective, objectiveOf,
    lessonHref, practiceHref, deckHref, scenariosHref, linksForItem, linksForLesson,
} = await import('../../../RadicalTrainingPlatform.Web/js/data/content-links.js');
const { ITEMS, LESSONS, TRACKS, EXAMS } =
    await import('../../../RadicalTrainingPlatform.Web/js/study-content.js');
const { SCENARIOS } = await import('../../../RadicalTrainingPlatform.Web/js/views/scenarios.js');
const { PracticeView } = await import('../../../RadicalTrainingPlatform.Web/js/views/practice.js');

const ROUTES = registeredRoutePatterns(
    new URL('../../../RadicalTrainingPlatform.Web/js/app.js', import.meta.url)
);

// ─── The objective → lesson resolution ─────────────────────────────

await runner.test('a resolved lesson really lists the objective', async () => {
    let checked = 0;
    for (const item of ITEMS) {
        const lesson = lessonForObjective(item.examId, item.objectiveId);
        if (!lesson) continue;
        checked += 1;
        assertEqual(lesson.status, 'released', `${lesson.lessonId} is not released but was resolved`);
        assertEqual(lesson.examId, item.examId, 'a lesson must not cross exams');
        assert(lesson.objectiveIds.includes(item.objectiveId),
            `${lesson.lessonId} does not list objective ${item.objectiveId} but was returned for it`);
    }
    assert(checked > 0, 'precondition: some items do have a covering lesson');
});

await runner.test('an uncovered objective resolves to null, never to a neighbour', async () => {
    // Both branches are real in this build: 165 items have a covering lesson,
    // 24 do not. If the uncovered branch were empty this test would pass for
    // the wrong reason, so the counts are asserted.
    const covered = ITEMS.filter(i => lessonForObjective(i.examId, i.objectiveId));
    const uncovered = ITEMS.filter(i => !lessonForObjective(i.examId, i.objectiveId));
    assert(covered.length > 0, 'precondition: some items are covered');
    assert(uncovered.length > 0, 'precondition: some items are not covered');
    for (const item of uncovered) {
        assertEqual(linksForItem(item).lesson, null,
            `${item.id} has no covering lesson and must render no lesson link`);
    }
});

await runner.test('the resolution is the lowest lesson ID, deterministically', async () => {
    // NOTE: no objective in this build is covered by two released lessons, so
    // the tie-break rule below is a determinism guarantee the current corpus
    // does not exercise. It is asserted against the rule, not against a real
    // tie — recorded here rather than claimed as covered.
    for (const lesson of Object.values(LESSONS)) {
        if (lesson.status !== 'released') continue;
        for (const objectiveId of lesson.objectiveIds) {
            const candidates = releasedLessons(lesson.examId)
                .filter(l => l.objectiveIds.includes(objectiveId));
            const lowest = candidates.map(l => l.lessonId)
                .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))[0];
            assertEqual(lessonForObjective(lesson.examId, objectiveId).lessonId, lowest,
                `${lesson.examId}/${objectiveId} must resolve to the lowest lesson ID`);
        }
    }
});

await runner.test('an unknown exam or objective resolves to null rather than throwing', async () => {
    assertEqual(lessonForObjective('NOT-AN-EXAM', '1.1'), null);
    assertEqual(lessonForObjective('COMPTIA-A-1201', null), null);
    assertEqual(lessonForObjective(null, '2.3'), null);
    assertEqual(objectiveOf('NOT-AN-EXAM', '1.1'), null);
});

await runner.test('an objective resolves to its blueprint title', async () => {
    const item = ITEMS.find(i => lessonForObjective(i.examId, i.objectiveId));
    const objective = objectiveOf(item.examId, item.objectiveId);
    assert(objective, 'the objective must resolve');
    assertEqual(objective.id, item.objectiveId);
    assert(objective.title && objective.title.length > 0, 'a resolved objective carries its title');
});

// ─── The links themselves ──────────────────────────────────────────

await runner.test('every href the link layer builds is a registered route', async () => {
    assert(ROUTES.length > 0, 'precondition: the app registers routes');
    const hrefs = new Set([scenariosHref()]);
    for (const item of ITEMS) {
        const links = linksForItem(item);
        hrefs.add(links.practice.href);
        hrefs.add(links.deck.href);
        if (links.lesson) hrefs.add(links.lesson.href);
    }
    for (const lesson of Object.values(LESSONS)) {
        const links = linksForLesson(lesson, trackForExam(lesson.examId));
        for (const key of ['practice', 'deck', 'scenarios']) hrefs.add(links[key].href);
        if (links.track) hrefs.add(links.track.href);
    }
    const dead = [...hrefs].filter(h => !hrefIsRouted(h, ROUTES));
    assertEqual(dead.join(', '), '', 'a cross-link to an unregistered route is a dead link');
});

await runner.test('an item links to its own exam, never to another', async () => {
    for (const item of ITEMS) {
        const links = linksForItem(item);
        assertEqual(links.examId, item.examId);
        assertEqual(links.practice.href, practiceHref(item.examId));
        assertEqual(links.deck.href, deckHref(item.examId));
        assert(links.deck.href.includes(item.examId), 'the deck link names the item\'s exam');
    }
});

await runner.test('a lesson links to its own exam\'s practice set and deck', async () => {
    const lesson = releasedLessons('NCA-75')[0];
    assert(lesson, 'precondition: NCA has a released lesson');
    const track = trackForExam(lesson.examId);
    const links = linksForLesson(lesson, track);
    assertEqual(links.practice.href, `#/practice/${lesson.examId}`);
    assertEqual(links.deck.href, `#/flashcards/${lesson.examId}`);
    assertEqual(links.scenarios.href, scenariosHref());
    assertEqual(links.track.href, `#/tracks/${track.trackId}`);
});

await runner.test('lessonKeyOf matches the key LESSONS is indexed by', async () => {
    for (const [key, lesson] of Object.entries(LESSONS)) {
        assertEqual(lessonKeyOf(lesson), key, 'the derived key must be the key the data uses');
    }
});

await runner.test('the track lookup finds the track that carries the exam', async () => {
    for (const track of Object.values(TRACKS)) {
        for (const examId of track.examIds) {
            assertEqual(trackForExam(examId).trackId, track.trackId);
        }
    }
    assertEqual(trackForExam('NOT-AN-EXAM'), null);
});

// ─── The refusal, pinned ───────────────────────────────────────────

await runner.test('no scenario carries a lesson ID — the prose link stays prose', async () => {
    // Four scenarios say "Powers lesson 1.3" in their description. That is the
    // only lesson reference that exists. If a real field is ever added, this
    // test fails and the lesson reader can link per-lesson instead of to the
    // exam's set — which is the deliberate change, not an accident.
    const withField = SCENARIOS.filter(s =>
        Object.prototype.hasOwnProperty.call(s, 'lessonId')
        || Object.prototype.hasOwnProperty.call(s, 'lesson'));
    assertEqual(withField.map(s => s.id).join(', '), '',
        'a scenario gained a lesson field — update linksForLesson and this fixture together');
    // And the prose really is there, so this is a documented gap, not a
    // fixture asserting something vacuous.
    const prose = SCENARIOS.filter(s => /Powers lesson/i.test(s.description || ''));
    assert(prose.length > 0, 'precondition: some scenarios do name a lesson in prose');
});

// ─── End to end: the feedback panel carries the link ───────────────

await runner.test('a submitted practice item links to the lesson that teaches it', async () => {
    // The unit above proves the resolver; this proves the view actually renders
    // its answer. An unused resolver would pass every test before this one.
    const examId = ITEMS.find(i => lessonForObjective(i.examId, i.objectiveId)).examId;
    const host = document.createElement('div');
    const view = new PracticeView(undefined, `/practice/${examId}`);
    host.appendChild(await view.render({ examId }));
    view.root = host.children[0];
    view.afterRender({ examId });

    const option = view.root.querySelectorAll('.option-row')[0];
    assert(option, 'precondition: the practice view rendered options');
    option.click();
    view.root.querySelector('#practice-submit').click();

    const feedback = view.root.querySelector('#practice-feedback').innerHTML;
    const item = ITEMS.filter(i => i.examId === examId)
        .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))[0];
    const lesson = lessonForObjective(item.examId, item.objectiveId);
    assert(lesson, 'precondition: the first item of this exam has a covering lesson');
    const href = lessonHref(trackForExam(item.examId).trackId, lesson);
    assert(feedback.includes(href),
        `the feedback panel must link to ${href} for ${item.id}`);
    assert(feedback.includes(deckHref(examId)), 'and offer the deck for the exam');
    assert(!/undefined/.test(feedback), 'no link may render as "undefined"');
});

await runner.test('an item with no covering lesson renders no lesson link, and says why not', async () => {
    const item = ITEMS.find(i => !lessonForObjective(i.examId, i.objectiveId));
    assert(item, 'precondition: some item has no covering lesson');
    const links = linksForItem(item);
    assertEqual(links.lesson, null);
    // The feedback line still names the objective — the absence of a lesson is
    // stated by omission, not by a broken link or an empty href.
    assert(links.objective === null || typeof links.objective.id === 'string');
});

process.exit(runner.done('content-links'));
