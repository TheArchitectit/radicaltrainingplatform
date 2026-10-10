/**
 * R-22 bullet 6 — per-item validator isolation in ScenariosView.
 *
 * Defect: #renderActiveScenario wrapped the whole initial-validation loop
 * (results.forEach(r => r.passed = r.validate())) in one try/catch, so a
 * single throwing validator aborted the loop — every objective after the
 * poisoned one rendered as unvalidated (all ⬜) regardless of state.
 *
 * Fixture drives the real view through #startScenario on the mci-03
 * scenario, poisoning state.getAll('categories') so obj-1's real validator
 * throws while obj-2 (flow_policies) stays healthy. Post-fix, obj-2 must
 * still render ✅ on initial render and ❌/✅ correctly on Check Progress.
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

const dom = installDom();
const runner = makeRunner();

await runner.test('one throwing validator does not mask later objectives', async () => {
    const { state } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateEngine.js');
    const { ScenariosView } = await import('../../../RadicalTrainingPlatform.Web/js/views/scenarios.js');

    await state.init();

    const view = new ScenariosView();
    const el = await view.render();
    dom.document.body.appendChild(el);
    view.root = el;
    view.afterRender();

    // Create the entity the healthy validator looks for.
    await state.create('flow_policies', { name: 'Lab-AppPolicy' });

    // Poison the categories collection so mci-03 obj-1's real validator
    // throws (the state.getAll call itself throws).
    const origGetAll = state.getAll.bind(state);
    state.getAll = (collection) => {
        if (collection === 'categories') throw new Error('injected validator poison');
        return origGetAll(collection);
    };

    // Pre-fix this throws out of #renderActiveScenario; post-fix it returns
    // normally.
    const startBtn = el.querySelectorAll('.start-scenario-btn').find(b => b.dataset.id === 'mci-03');
    assert(startBtn, 'mci-03 start button should exist');
    startBtn.click();

    const healthyIcon = dom.document.getElementById('obj-obj-2')?.querySelector('span');
    assert(healthyIcon, 'healthy objective row should render');
    assertEqual(healthyIcon.textContent, '✅',
        'healthy objective must still be marked ✅ even though the earlier validator threw');

    const poisonedIcon = dom.document.getElementById('obj-obj-1')?.querySelector('span');
    assert(poisonedIcon, 'poisoned objective row should render');
    assertEqual(poisonedIcon.textContent, '⬜',
        'poisoned objective should stay unvalidated on initial render');

    // Check Progress applies the same isolation: poison → ❌, healthy → ✅.
    const checkBtn = dom.document.getElementById('check-btn');
    assert(checkBtn, 'check button should be wired');
    checkBtn.dispatchEvent({ type: 'click', target: checkBtn });
    assertEqual(dom.document.getElementById('obj-obj-1').querySelector('span').textContent, '❌',
        'check progress should mark the poisoned objective ❌, not skip it');
    assertEqual(dom.document.getElementById('obj-obj-2').querySelector('span').textContent, '✅');
});

process.exit(runner.done('scenario-validator-isolation fixture'));
