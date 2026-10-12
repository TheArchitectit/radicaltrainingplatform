/**
 * T-35/S48-05 — NCA beginner scenario fixtures (SPEC-07 07.5, REQ-SC-01..06).
 *
 * Drives the real validators — the same entry point the UI and the demo sweep
 * evaluate — over the real StateEngine seed:
 *   1. Fresh-seed negativity: from the deterministic seed every objective of
 *      every NCA scenario evaluates false before any learner action
 *      (REQ-SC-02).
 *   2. Wrong-state negativity: one negative fixture per scenario proves an
 *      incorrect final state fails, and the message names the unmet objective
 *      (REQ-SC-04). nca-alert-01's negative case is the SPEC-07 07.5 rule —
 *      the right answer clicked without opening the alert detail fails.
 *   3. Walkthrough positivity: the recorded action script reaches 100%
 *      (REQ-SC-03).
 *   4. Reset restores the exact seed (REQ-SC-06).
 *   5. The "simulated environment" label is rendered by the lab view
 *      (REQ-SC-05's UI half; the zero-outbound-calls half is asserted by
 *      demo-independence.mjs).
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

installDom();
const runner = makeRunner();

const { state } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateEngine.js');
const { SCENARIOS, NCA_TOOL_LAB, NCA_MAINT_SEQUENCE, NCA_ALERT_LAB, ScenariosView } =
    await import('../../../RadicalTrainingPlatform.Web/js/views/scenarios.js');
const { NcaLabView } = await import('../../../RadicalTrainingPlatform.Web/js/views/nca-lab.js');
const { evalScenario, runWalkthrough, traceAdd } = await import('./lib/scenario-walkthroughs.mjs');

const NCA_IDS = ['nca-tool-01', 'nca-vm-01', 'nca-maint-01', 'nca-alert-01'];
const scenario = (id) => SCENARIOS.find(s => s.id === id);

/** Evaluate one objective of one scenario against the current (state, trace). */
function evalOne(id, objId) {
    const s = scenario(id);
    const obj = s.objectives.find(o => o.id === objId);
    assert(obj, `${id} has an objective ${objId}`);
    const r = obj.validate(state, state.getAll('action_trace'));
    return { passed: r?.passed === true, unmet: r?.unmetConditions || [] };
}

async function seedVm({ name, vcpus, memory_gb, power_state, network_uuid }) {
    await state.create('vms', {
        name, vcpus, memory_gb, power_state, host_uuid: 'host-001', is_cvm: false,
        disks: [{ size_gb: 40, container: 'Gold-Container', image: 'CentOS-8-GenericCloud' }],
        nics: [{ network_uuid }],
    });
}

await state.init();

// ── 1. Fresh-seed negativity (REQ-SC-02) ──
await runner.test('fresh seed: all four NCA scenarios fail every objective (REQ-SC-02)', async () => {
    await state.reset();
    for (const id of NCA_IDS) {
        const results = evalScenario(scenario(id));
        assert(results.length >= 2, `${id} declares at least two objectives`);
        for (const r of results) {
            assert(!r.passed, `${id}/${r.id} must fail from fresh seed`);
            assert(r.unmet.length >= 1, `${id}/${r.id} must name why it is unmet`);
        }
    }
});

// ── 2. Wrong-state negativity (REQ-SC-04) ──
await runner.test('nca-tool-01: one wrong tool fails, naming the tool chosen', async () => {
    await state.reset();
    await traceAdd({ action: 'tool-selected', task: 'task-1', tool: 'move' });
    await traceAdd({ action: 'tool-selected', task: 'task-2', tool: 'ngt' });
    await traceAdd({ action: 'tool-selected', task: 'task-3', tool: 'ssr' });
    const wrong = evalOne('nca-tool-01', 'obj-2');
    assert(!wrong.passed, 'the wrong tool must fail obj-2');
    assert(wrong.unmet.some(m => m.includes('ngt')), `failure names the tool chosen: ${wrong.unmet[0]}`);
    // The other two objectives are satisfied — the failure is localised.
    assert(evalOne('nca-tool-01', 'obj-1').passed, 'obj-1 stays satisfied');
    assert(evalOne('nca-tool-01', 'obj-3').passed, 'obj-3 stays satisfied');
});

await runner.test('nca-tool-01: re-answering judges the last answer, not the first', async () => {
    await state.reset();
    await traceAdd({ action: 'tool-selected', task: 'task-1', tool: 'ngt' });
    await traceAdd({ action: 'tool-selected', task: 'task-1', tool: 'move' });
    assert(evalOne('nca-tool-01', 'obj-1').passed, 'the corrected final answer passes');
});

await runner.test('nca-vm-01: undersized VM fails, naming the count', async () => {
    await state.reset();
    await seedVm({ name: 'Lab-AppServer', vcpus: 2, memory_gb: 8, power_state: 'on', network_uuid: 'net-002' });
    const wrong = evalOne('nca-vm-01', 'obj-1');
    assert(!wrong.passed, 'a 2-vCPU VM must fail the 4-vCPU objective');
    assert(wrong.unmet.some(m => m.includes('2')), `failure names the count found: ${wrong.unmet[0]}`);
    assert(evalOne('nca-vm-01', 'obj-2').passed, 'memory objective stays satisfied');
    assert(evalOne('nca-vm-01', 'obj-3').passed, 'network objective stays satisfied');
    assert(evalOne('nca-vm-01', 'obj-4').passed, 'power objective stays satisfied');
});

await runner.test('nca-vm-01: a fabricated network name cannot satisfy the NIC objective', async () => {
    await state.reset();
    await seedVm({ name: 'Lab-AppServer', vcpus: 4, memory_gb: 8, power_state: 'on', network_uuid: 'Production-200' });
    const nic = evalOne('nca-vm-01', 'obj-3');
    assert(!nic.passed, 'a uuid that is not a real network must not pass');
    assert(nic.unmet.length >= 1, 'the unmet network objective is named');
});

await runner.test('nca-maint-01: all four steps in an unsafe order fails obj-2 only', async () => {
    await state.reset();
    await traceAdd({ action: 'sequence-order', steps: NCA_MAINT_SEQUENCE.shuffledOrder });
    const completeness = evalOne('nca-maint-01', 'obj-1');
    assert(completeness.passed, 'all four steps each once satisfies the completeness objective');
    const order = evalOne('nca-maint-01', 'obj-2');
    assert(!order.passed, 'an unsafe order must fail the ordering objective');
    assert(order.unmet.some(m => m.toLowerCase().includes('order')), `failure names the order: ${order.unmet[0]}`);
});

await runner.test('nca-maint-01: a short sequence fails both objectives', async () => {
    await state.reset();
    await traceAdd({ action: 'sequence-order', steps: ['health-check', 'evacuate-host'] });
    assert(!evalOne('nca-maint-01', 'obj-1').passed, 'an incomplete sequence fails completeness');
    assert(!evalOne('nca-maint-01', 'obj-2').passed, 'an incomplete sequence fails ordering');
});

await runner.test('nca-alert-01: the right answer without opening the alert fails (SPEC-07 07.5)', async () => {
    await state.reset();
    // The correct next step, clicked without reading the detail.
    await traceAdd({ action: 'triage-selected', step: 'expand-container' });
    const read = evalOne('nca-alert-01', 'obj-1');
    assert(!read.passed, 'not opening the alert detail must fail obj-1');
    const choice = evalOne('nca-alert-01', 'obj-2');
    assert(!choice.passed, 'the correct step without reading must still fail obj-2');
    assert(choice.unmet.some(m => m.includes('opened')), `failure names the unread alert: ${choice.unmet[0]}`);
});

await runner.test('nca-alert-01: a wrong next step after reading fails, naming the step', async () => {
    await state.reset();
    await traceAdd({ action: 'alert-opened', alert: NCA_ALERT_LAB.alertUuid });
    await traceAdd({ action: 'triage-selected', step: 'restart-cvm' });
    assert(evalOne('nca-alert-01', 'obj-1').passed, 'reading the alert satisfies obj-1');
    const choice = evalOne('nca-alert-01', 'obj-2');
    assert(!choice.passed, 'restarting a healthy CVM must fail the triage objective');
    assert(choice.unmet.some(m => m.includes('restart-cvm')), `failure names the step chosen: ${choice.unmet[0]}`);
});

// ── 3. Walkthrough positivity (REQ-SC-03) ──
await runner.test('every NCA walkthrough reaches 100% (REQ-SC-03)', async () => {
    for (const id of NCA_IDS) {
        await state.reset();
        await runWalkthrough(scenario(id));
        const results = evalScenario(scenario(id));
        const open = results.filter(r => !r.passed);
        assertEqual(open.length, 0,
            `${id} walkthrough must satisfy every objective; unmet: ${open.map(r => `${r.id} (${r.unmet.join('; ')})`).join(' | ')}`);
    }
});

// ── 4. Reset restores the seed (REQ-SC-06) ──
await runner.test('reset restores the exact seed (REQ-SC-06)', async () => {
    await state.reset();
    await runWalkthrough(scenario('nca-vm-01'));
    assert(state.getAll('vms').some(v => v.name === 'Lab-AppServer'), 'the walkthrough created the VM');
    await state.reset();
    assert(!state.getAll('vms').some(v => v.name === 'Lab-AppServer'), 'reset removes the learner VM');
    assertEqual(state.getAll('action_trace').length, 0, 'reset clears the action trace');
    for (const id of NCA_IDS) {
        for (const r of evalScenario(scenario(id))) {
            assert(!r.passed, `${id}/${r.id} must fail again after reset`);
        }
    }
});

// ── 5. The simulated-environment label is rendered (REQ-SC-05) ──
await runner.test('the NCA lab renders the simulated-environment label (REQ-SC-05)', async () => {
    await state.reset();
    for (const id of ['nca-tool-01', 'nca-maint-01', 'nca-alert-01']) {
        const el = await new NcaLabView().render({ scenario: scenario(id) });
        assert(el.textContent.includes('Simulated environment'), `${id} renders the label`);
        assert(el.textContent.includes('No real systems are contacted'), `${id} states no real systems are contacted`);
    }
    // nca-vm-01 runs on the real PE VM wizard and carries no lab page of its
    // own, so the catalogue must label the simulation for it.
    const list = await new ScenariosView().render();
    assert(list.textContent.includes('Simulated environment'),
        'the scenario catalogue renders the label for store-based scenarios');
    assert(list.textContent.includes('No real systems are contacted'),
        'the scenario catalogue states no real systems are contacted');
});

// ── Registry wiring (the UI dispatch entry point) ──
await runner.test('the three decision labs are registered with the nca-lab renderer', async () => {
    for (const id of ['nca-tool-01', 'nca-maint-01', 'nca-alert-01']) {
        const entry = scenario(id);
        assertEqual(entry.renderer, 'nca-lab', `${id} uses the nca-lab renderer`);
        assert(entry.lab, `${id} carries a lab manifest`);
    }
    // nca-vm-01 runs on the real PE VM wizard, so it must NOT carry a renderer.
    assertEqual(scenario('nca-vm-01').renderer, undefined, 'nca-vm-01 stays store-based');
    assertEqual(NCA_TOOL_LAB.tools.length, 7, 'the tool list has seven tools');
});

process.exit(runner.done('nca-scenarios'));
