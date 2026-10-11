/**
 * R-22 bullet 7 — scenario attempt/history is never recorded.
 *
 * Defect: completing a scenario (Check Progress → all objectives pass)
 * showed a toast but recorded nothing: no scenario_attempts entity, no
 * durable history, so learner progress across sessions was lost.
 *
 * Fixture drives the real view through #startScenario, satisfies all
 * objectives of mci-02, clicks Check Progress, and asserts:
 *   1. a scenario_attempts entity is created (completed, attempt #1),
 *   2. a second completion records attempt #2 (history accrues),
 *   3. the history panel renders the entries,
 *   4. the attempt is durable in the serialized state (persists via state).
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

const dom = installDom();
const runner = makeRunner();

async function completeScenario(state, view, el) {
    // Satisfy every objective of mci-02 (PD-Lab-DR): create the PD with
    // one VM and an hourly schedule through the real UI mutation shape
    // (schedule is { interval, retention_* }, not a bare string).
    await state.create('protection_domains', {
        name: 'PD-Lab-DR', vms: ['vm-1'],
        schedule: { interval: 'hourly', retention_local: 24, retention_remote: 72 },
    });

    const startBtn = el.querySelectorAll('.start-scenario-btn').find(b => b.dataset.id === 'mci-02');
    assert(startBtn, 'mci-02 start button should exist');
    startBtn.click();

    const checkBtn = dom.document.getElementById('check-btn');
    assert(checkBtn, 'check button should be wired');
    checkBtn.dispatchEvent({ type: 'click', target: checkBtn });

    // T-21/REQ-DEMO-06 replaced the old "All Objectives Complete!" panel:
    // a mastery-style claim is a forbidden string, so completion is now
    // reported as task conditions met/remaining, with requested vs actual.
    const body = dom.document.getElementById('result-body');
    assert(body, 'the result panel body should exist');
    assert(body.innerHTML.includes('completion-panel'),
        `the completion panel should render, got: ${body.innerHTML.slice(0, 200)}`);
    assert(/<h2 class="completion-title">Conditions met<\/h2>/.test(body.innerHTML),
        'a fully-satisfied scenario must report "Conditions met"');
    assert(!/All Objectives Complete/.test(body.innerHTML),
        'the panel must not make an "all objectives complete" mastery-style claim');
}

await runner.test('completing a scenario records an attempt and renders history', async () => {
    const { state } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateEngine.js');
    const { ScenariosView } = await import('../../../RadicalTrainingPlatform.Web/js/views/scenarios.js');

    await state.init();
    const view = new ScenariosView();
    const el = await view.render();
    dom.document.body.appendChild(el);
    view.root = el;
    view.afterRender();

    const attemptsBefore = state.getAll('scenario_attempts');
    assertEqual(attemptsBefore.length, 0, 'no attempts should exist before completion');

    await completeScenario(state, view, el);

    // recordAttempt is async (create + persist) — let it settle.
    await new Promise(r => setTimeout(r, 25));

    const attempts = state.getAll('scenario_attempts');
    assertEqual(attempts.length, 1, 'one attempt must be recorded');
    assertEqual(attempts[0].scenario_id, 'mci-02', 'attempt should reference the scenario');
    assertEqual(attempts[0].completed, true, 'attempt should be marked completed');
    assertEqual(attempts[0].attempt_number, 1, 'first completion is attempt #1');
    assert(attempts[0].completed_at, 'attempt should carry a completion timestamp');

    const historyList = dom.document.getElementById('scenario-history-list');
    assert(historyList, 'history panel should exist');
    assert(historyList.innerHTML.includes('Configure Data Protection'),
        'history should render the completed scenario title');
    assert(!historyList.innerHTML.includes('No completed scenarios'),
        'empty-state message must not show after a completion');
});

await runner.test('a second completion records attempt #2', async () => {
    const { state } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateEngine.js');
    const { ScenariosView } = await import('../../../RadicalTrainingPlatform.Web/js/views/scenarios.js');

    const view = new ScenariosView();
    const el = await view.render();
    dom.document.body.appendChild(el);
    view.root = el;
    view.afterRender();

    // Remove the PD so the scenario can be completed "fresh" again.
    const pd = state.getAll('protection_domains').find(p => p.name === 'PD-Lab-DR');
    await state.remove('protection_domains', pd.uuid);
    // renderHistory must still show the earlier attempt after re-render.
    const historyList = dom.document.getElementById('scenario-history-list');
    assert(historyList.innerHTML.includes('Configure Data Protection'), 'history persists across re-renders');

    await completeScenario(state, view, el);
    await new Promise(r => setTimeout(r, 25));

    const attempts = state.getAll('scenario_attempts');
    assertEqual(attempts.length, 2, 'second completion must add another attempt');
    assertEqual(attempts[1].attempt_number, 2, 'second completion is attempt #2');
});

await runner.test('attempts are durable in the serialized state', async () => {
    const { store } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateStore.js');
    const raw = dom.localStorage.getItem('lab_clusterState');
    assert(raw, 'cluster state should be persisted');
    const persisted = JSON.parse(raw);
    const persistedAttempts = persisted.scenario_attempts || [];
    assert(persistedAttempts.length >= 2,
        `attempts must be persisted; found ${persistedAttempts.length}`);
    assert(persistedAttempts.every(a => a.completed && a.scenario_id),
        'persisted attempts should carry completion data');
    void store;
});

process.exit(runner.done('scenario-attempt-history fixture'));
