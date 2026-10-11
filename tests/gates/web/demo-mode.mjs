/**
 * Demo mode fixture (T-21, REQ-DEMO-01/02/05).
 *
 * Failing side this fixture names — the state before T-21:
 *   - no scenario declared a fixture seed, so "entering demo mode loads that
 *     seed exactly" had nothing to load and nothing to check;
 *   - `StateStore` had `clear()` (whole store) and `delete(key)` but no
 *     key enumeration, so no caller could reset the learner keyspaces
 *     without wiping simulator fixtures too;
 *   - `ProgressStore.clearExam` deleted only the summary and continuation,
 *     leaving every scored item record behind — a reset that looked clean
 *     and was not;
 *   - no reseed verification existed, so "reseeded" was an assertion.
 *
 * Covers: declared seed validity and uniqueness; enter() loading every
 * declared seed exactly; a deterministic PRNG bound to that seed; the
 * station reset clearing progress/ and scenario/ and nothing else; and the
 * reseed verification pass driving each validator's negative path.
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

installDom();
const runner = makeRunner();

const { store } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateStore.js');
const { state } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateEngine.js');
const { progress } = await import('../../../RadicalTrainingPlatform.Web/js/core/ProgressStore.js');
const { demo, isValidFixtureSeed, makeRng, DEMO_MODE_KEY } = await import('../../../RadicalTrainingPlatform.Web/js/core/DemoMode.js');
const { SCENARIOS } = await import('../../../RadicalTrainingPlatform.Web/js/views/scenarios.js');

await runner.test('every scenario declares a valid, unique fixture seed', async () => {
    const invalid = SCENARIOS.filter(s => !isValidFixtureSeed(s.fixtureSeed));
    assertEqual(invalid.map(s => s.id).join(',') || '(none)', '(none)',
        `invalid fixtureSeed on: ${invalid.map(s => s.id).join(', ')}`);
    const seen = new Map();
    for (const s of SCENARIOS) {
        if (seen.has(s.fixtureSeed)) {
            throw new Error(`${s.id} and ${seen.get(s.fixtureSeed)} share fixtureSeed ${s.fixtureSeed}`);
        }
        seen.set(s.fixtureSeed, s.id);
    }
    // The catalog holds 44 pre-existing scenarios plus the 2 CompTIA ticket
    // scenarios built in Sprint 46. The plan's "44 + 6" counts 4 NCA
    // scenarios that land in Sprint 48 (T-35); they are not in this build,
    // and this fixture must not pretend otherwise.
    assert(SCENARIOS.length >= 46,
        `expected at least the 44 pre-existing + 2 ticket scenarios, got ${SCENARIOS.length}`);
});

await runner.test('declaredSeeds refuses a scenario that declares no seed', async () => {
    let threw = null;
    try {
        demo.declaredSeeds([{ id: 'no-seed-01', objectives: [] }]);
    } catch (e) {
        threw = e;
    }
    assert(threw, 'a scenario without a fixtureSeed must be refused, not silently defaulted');
    assert(/fixtureSeed/.test(threw.message), `the error must name the missing field, got: ${threw.message}`);
});

await runner.test('entering demo mode loads every declared seed exactly', async () => {
    await progress.init();
    await demo.exit();
    assertEqual(demo.active, false, 'demo mode starts inactive after exit');

    const loaded = await demo.enter(SCENARIOS);

    assertEqual(demo.active, true, 'demo mode must be active after enter()');
    assertEqual(Object.keys(loaded).length, SCENARIOS.length, 'every scenario must have a loaded seed');
    for (const s of SCENARIOS) {
        assertEqual(loaded[s.id], s.fixtureSeed, `${s.id} must load its declared seed exactly`);
        assertEqual(demo.seedFor(s.id), s.fixtureSeed, `${s.id} seedFor must return the declared seed`);
    }
    assertEqual(document.body.classList.contains('demo-mode'), false,
        'the body class is the banner\'s job, not enter()\'s');
    const flag = await store.get(DEMO_MODE_KEY);
    assertEqual(flag?.active, true, 'the mode flag must be persisted so a reload stays in demo mode');
});

await runner.test('a reloaded demo mode restores the same seeds', async () => {
    // A presenter refreshing mid-demo must not drop out of the mode or
    // silently re-derive a different station.
    const before = demo.seeds;
    const { demo: fresh } = await import(
        '../../../RadicalTrainingPlatform.Web/js/core/DemoMode.js?reload=1'
    );
    await fresh.init(SCENARIOS);
    assertEqual(fresh.active, true, 'demo mode must be restored from the persisted flag');
    for (const s of SCENARIOS) {
        assertEqual(fresh.seedFor(s.id), before[s.id], `${s.id} must restore the same seed`);
    }
});

await runner.test('rngFor is deterministic per declared seed and differs across scenarios', async () => {
    const a1 = Array.from({ length: 5 }, demo.rngFor('mci-01'));
    const a2 = Array.from({ length: 5 }, demo.rngFor('mci-01'));
    const b1 = Array.from({ length: 5 }, demo.rngFor('mci-02'));
    assertEqual(a1.join(','), a2.join(','), 'the same seed must reproduce the same stream');
    assert(a1.join(',') !== b1.join(','), 'different seeds must produce different streams');
    const manual = Array.from({ length: 5 }, makeRng(SCENARIOS.find(s => s.id === 'mci-01').fixtureSeed));
    assertEqual(a1.join(','), manual.join(','), 'rngFor must use the declared seed, not a derived one');
});

await runner.test('rngFor refuses a scenario with no loaded seed', async () => {
    let threw = null;
    try {
        demo.rngFor('not-a-scenario');
    } catch (e) {
        threw = e;
    }
    assert(threw, 'rngFor must not invent a seed for an unknown scenario');
});

await runner.test('station reset clears progress/ and scenario/ keyspaces', async () => {
    await progress.init();
    await demo.enter(SCENARIOS);

    // Lay down learner state of every persisted shape.
    await progress.recordItem('COMPTIA-A-1201', 'COMPTIA-A-1201/core1-a2-fixtures.md/Q1', { isCorrect: true });
    await progress.recordItem('COMPTIA-A-1201', 'COMPTIA-A-1201/core1-a2-fixtures.md/Q2', { isCorrect: false });
    await progress.saveContinuation('COMPTIA-A-1201', { index: 3, selection: ['A'], results: [{ isCorrect: true }], total: 24 });
    await progress.recordScenario('aplus-dns-01');

    const beforeProgress = await store.keys('progress/');
    const beforeScenario = await store.keys('scenario/');
    assert(beforeProgress.length >= 3, `expected learner progress keys, found ${beforeProgress.join(', ')}`);
    assert(beforeScenario.length >= 1, `expected a scenario record, found ${beforeScenario.join(', ')}`);

    const report = await demo.resetStation(SCENARIOS);

    assertEqual((await store.keys('progress/')).length, 0, 'progress/ must be empty after a station reset');
    assertEqual((await store.keys('scenario/')).length, 0, 'scenario/ must be empty after a station reset');
    assert(report.clearedKeys >= beforeProgress.length + beforeScenario.length,
        `the report must count what it cleared (got ${report.clearedKeys})`);

    // No student answers survive a reset (REQ-DEMO-05).
    const restored = await progress.restore('COMPTIA-A-1201', ['COMPTIA-A-1201/core1-a2-fixtures.md/Q1']);
    assertEqual(restored.attempted, 0, 'no scored answer may survive a station reset');
    assertEqual(await progress.getScenario('aplus-dns-01'), null, 'no scenario record may survive a reset');
});

await runner.test('station reset leaves the simulator fixtures seeded, not empty', async () => {
    await demo.resetStation(SCENARIOS);
    assert(state.getAll('vms').length > 0, 'the VM fixtures must be reseeded, not cleared');
    assert(state.getAll('action_trace').length === 0, 'the action trace must be cleared by the reset');
    assert(state.getAll('ticket_workstations').length > 0, 'ticket workstation fixtures must be reseeded');
});

await runner.test('reseed verification drives every validator negative path', async () => {
    const report = await demo.resetStation(SCENARIOS);
    const v = report.verification;
    assertEqual(v.seeded, SCENARIOS.length, 'every scenario must be verified');
    assertEqual(v.ok, true,
        `reseed verification failed: ${v.results.filter(r => !(r.seedMatches && r.negativePathHolds)).map(r => r.scenarioId).join(', ')}`);
    for (const r of v.results) {
        assertEqual(r.seedMatches, true, `${r.scenarioId}: loaded seed must equal the declared seed`);
        assertEqual(r.negativePathHolds, true,
            `${r.scenarioId}: a fresh station must fail this scenario (passing: ${r.passingOnFreshSeed.join(', ')})`);
        assertEqual(r.failedValidator, null, `${r.scenarioId}: validator threw — ${r.failedValidator}`);
    }
});

await runner.test('reseed verification reports a poisoned validator as failed, never as clean', async () => {
    const poisoned = [{
        id: 'poisoned-01',
        fixtureSeed: 12345,
        objectives: [{ id: 'obj-1', validate: () => { throw new Error('boom'); } }],
    }];
    // Load the seed so seedMatches holds and only the validator is at fault.
    await demo.declaredSeeds(poisoned);
    const v = demo.verifyReseed(poisoned);
    assertEqual(v.ok, false, 'a throwing validator must fail verification');
    assert(v.results[0].failedValidator, 'the report must name the validator failure');
    assertEqual(v.results[0].negativePathHolds, false, 'a throw is not a clean station');
});

await runner.test('leaving demo mode resets the station and clears the flag', async () => {
    await progress.init();
    await demo.enter(SCENARIOS);
    await progress.recordItem('COMPTIA-A-1201', 'COMPTIA-A-1201/core1-a2-fixtures.md/Q1', { isCorrect: true });

    await demo.exit();

    assertEqual(demo.active, false, 'demo mode must be off after exit');
    assertEqual(demo.seeds['mci-01'] ?? null, null, 'loaded seeds must be dropped on exit');
    assertEqual(await store.get(DEMO_MODE_KEY), null, 'the persisted mode flag must be removed');
    assertEqual((await store.keys('progress/')).length, 0,
        'a learner must never inherit a presenter\'s answers');
});

process.exit(runner.done('demo-mode fixture'));
