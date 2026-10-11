/**
 * TM-45 scenario sweep (REQ-SC-02/03/04, T-14/S46-04).
 *
 * 1. Fresh-seed negativity: after state.reset() with an empty action trace,
 *    every objective of every store-based scenario evaluates false.
 * 2. Walkthrough solvability: a recorded action-script per scenario mutates
 *    the simulated store + trace through the same fields the real UI writes,
 *    and every objective then evaluates true (100%).
 * 3. Wrong-state negativity: for repaired scenarios, an incorrect final
 *    state fails and the failure message names the unmet objective.
 *
 * Evaluates the same (state, trace) entry point the UI uses.
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

const dom = installDom();
const runner = makeRunner();

// Dynamic import, after installDom(): the shared walkthrough module pulls in
// StateEngine, which must not be evaluated before the DOM stub exists.
const { state, evalScenario, traceAdd, recordInterpretations, WALKTHROUGHS } =
    await import('./lib/scenario-walkthroughs.mjs');
const { SCENARIOS, TICKET_VALIDATORS } = await import('../../../RadicalTrainingPlatform.Web/js/views/scenarios.js');

// Ticket scenarios are validated by TicketLabView against its own trace;
// they are covered by ticket-scenarios.mjs. This sweep covers store-based
// scenarios.
const STORE_SCENARIOS = SCENARIOS.filter(s => s.renderer !== 'ticket');

await runner.test('every store-based scenario has a walkthrough', async () => {
    const missing = STORE_SCENARIOS.filter(s => !WALKTHROUGHS[s.id]);
    assertEqual(missing.map(s => s.id).join(',') || '(none)', '(none)',
        `missing walkthroughs for: ${missing.map(s => s.id).join(', ')}`);
});

// ── 1. Fresh-seed negativity (REQ-SC-02) ──

await runner.test('every objective of every store-based scenario fails on a fresh seed', async () => {
    await state.init();
    await state.reset();
    const autoPass = [];
    for (const s of STORE_SCENARIOS) {
        for (const r of evalScenario(s)) {
            if (r.passed) autoPass.push(`${s.id}/${r.id}`);
        }
    }
    assertEqual(autoPass.join(',') || '(none)', '(none)',
        `objectives that auto-pass on a fresh seed (REQ-SC-02): ${autoPass.join(', ')}`);
});

// ── 2. Walkthrough solvability (REQ-SC-03) ──

await runner.test('every store-based scenario reaches 100% via its walkthrough', async () => {
    const failures = [];
    for (const s of STORE_SCENARIOS) {
        const walk = WALKTHROUGHS[s.id];
        if (!walk) { failures.push(`${s.id}: no walkthrough`); continue; }
        await state.reset();
        await walk();
        await recordInterpretations(s);
        const results = evalScenario(s);
        for (const r of results) {
            if (!r.passed) {
                failures.push(`${s.id}/${r.id}: unmet after walkthrough — ${r.unmet.join('; ')}`);
            }
        }
    }
    assertEqual(failures.join(' | ') || '(none)', '(none)',
        `walkthrough solvability failures (REQ-SC-03): ${failures.join(' | ')}`);
});

// ── 2b. Observation tasks require a recorded interpretation (T-21) ──

await runner.test('every observation objective fails on a visit with no interpretation', async () => {
    const failures = [];
    let observationCount = 0;
    for (const s of STORE_SCENARIOS) {
        const walk = WALKTHROUGHS[s.id];
        if (!walk) continue;
        const observationIds = s.objectives.filter(o => o.observation).map(o => o.id);
        if (!observationIds.length) continue;
        observationCount += observationIds.length;
        // Walk the scenario but stop short of recording interpretations —
        // this is exactly "visited, did not respond".
        await state.reset();
        await walk();
        const byId = Object.fromEntries(evalScenario(s).map(r => [r.id, r]));
        for (const id of observationIds) {
            if (byId[id]?.passed) {
                failures.push(`${s.id}/${id}: passed on a visit alone`);
            } else if (!byId[id]?.unmet.some(m => /interpretation/i.test(m))) {
                failures.push(`${s.id}/${id}: unmet message does not name the missing interpretation — ${byId[id]?.unmet.join('; ')}`);
            }
        }
    }
    assert(observationCount > 0, 'the sweep must find observation objectives to test');
    assertEqual(failures.join(' | ') || '(none)', '(none)',
        `visit-without-responding failures (REQ-DEMO-06): ${failures.join(' | ')}`);
});

await runner.test('every observation objective passes once an interpretation is recorded', async () => {
    const failures = [];
    for (const s of STORE_SCENARIOS) {
        const walk = WALKTHROUGHS[s.id];
        if (!walk) continue;
        for (const obj of s.objectives.filter(o => o.observation)) {
            await state.reset();
            await walk();
            await traceAdd({
                action: 'interpretation', scenarioId: s.id, objectiveId: obj.id,
                response: 'recorded',
            });
            const r = evalScenario(s).find(x => x.id === obj.id);
            if (!r?.passed) failures.push(`${s.id}/${obj.id}: ${r?.unmet.join('; ')}`);
        }
    }
    assertEqual(failures.join(' | ') || '(none)', '(none)',
        `interpretation did not complete the objective: ${failures.join(' | ')}`);
});

await runner.test('a blank or cross-scenario interpretation does not complete an objective', async () => {
    const s = STORE_SCENARIOS.find(x => x.objectives.some(o => o.observation));
    const obj = s.objectives.find(o => o.observation);
    for (const bad of [
        { action: 'interpretation', scenarioId: s.id, objectiveId: obj.id, response: '   ' },
        { action: 'interpretation', scenarioId: 'some-other-scenario', objectiveId: obj.id, response: 'text' },
        { action: 'interpretation', scenarioId: s.id, objectiveId: 'obj-999', response: 'text' },
    ]) {
        await state.reset();
        await WALKTHROUGHS[s.id]();
        await traceAdd(bad);
        const r = evalScenario(s).find(x => x.id === obj.id);
        assertEqual(r.passed, false,
            `a blank/mismatched interpretation must not complete ${s.id}/${obj.id} (${JSON.stringify(bad)})`);
    }
});

// ── 2c. Every scenario declares a demo fixture seed (T-21) ──

await runner.test('every scenario declares a valid integer fixtureSeed', async () => {
    const bad = SCENARIOS.filter(s =>
        !Number.isInteger(s.fixtureSeed) || s.fixtureSeed <= 0 || s.fixtureSeed > 0xFFFFFFFF);
    assertEqual(bad.map(s => s.id).join(',') || '(none)', '(none)',
        `scenarios without a valid fixtureSeed: ${bad.map(s => s.id).join(', ')}`);
    const ids = SCENARIOS.map(s => s.fixtureSeed);
    assertEqual(new Set(ids).size, ids.length,
        'fixture seeds must be distinct so two scenarios cannot share a station');
});

// ── 3. Wrong-state negativity for repaired scenarios (REQ-SC-04) ──

await runner.test('us-bucket-01 fails without versioning+lifecycle (repaired contract)', async () => {
    await state.reset();
    // Wrong-state: bucket exists but is missing the versioning/lifecycle contract.
    await state.create('object_buckets', {
        name: 'lab-backups', store: 'object-store-001',
        versioning: false, worm_enabled: false, lifecycle: null,
    });
    const s = STORE_SCENARIOS.find(x => x.id === 'us-bucket-01');
    const results = evalScenario(s);
    assertEqual(results[0].passed, false, 'bucket without versioning/lifecycle must fail');
    assert(results[0].unmet.length > 0, 'failure must name an unmet condition');
    assert(results[0].unmet.some(m => /versioning|lifecycle/i.test(m)),
        `unmet message should name the contract, got: ${results[0].unmet.join('; ')}`);
});

await runner.test('us-bucket-01 fails when the wrong collection name is used', async () => {
    await state.reset();
    // The pre-repair bug read state.getAll('buckets') — a collection that
    // does not exist. Writing to that wrong collection must not pass.
    await state.create('buckets', {
        name: 'lab-backups', versioning: true,
        lifecycle: { days: 90, action: 'expire' },
    }).catch(() => {});
    const s = STORE_SCENARIOS.find(x => x.id === 'us-bucket-01');
    const results = evalScenario(s);
    assertEqual(results[0].passed, false,
        'entities written to the wrong collection must not satisfy the objective');
});

await runner.test('mci-01 fails without power-on (obj-4 names the unmet objective)', async () => {
    await state.reset();
    await state.create('vms', {
        name: 'Lab-WebServer', vcpus: 2, memory_gb: 4, power_state: 'off',
        host_uuid: 'host-001', is_cvm: false,
        disks: [{ size_gb: 40, container: 'default', image: 'CentOS-8-GenericCloud' }],
        nics: [{ network_uuid: 'net-001' }],
    });
    const s = STORE_SCENARIOS.find(x => x.id === 'mci-01');
    const results = evalScenario(s);
    const byId = Object.fromEntries(results.map(r => [r.id, r]));
    assertEqual(byId['obj-4'].passed, false, 'obj-4 must fail while the VM is off');
    assert(byId['obj-4'].unmet.some(m => /powered on/i.test(m)),
        `unmet message should name the power-state objective, got: ${byId['obj-4'].unmet.join('; ')}`);
    assertEqual(byId['obj-1'].passed, true, 'obj-1 should already be met by the created VM');
});

await runner.test('ci-03 obj-2 fails without resume (mutual-exclusion repaired via trace)', async () => {
    await state.reset();
    await state.create('action_trace', { action: 'nc2-hibernate', cluster: 'NC2-Prod-AWS' });
    const s = STORE_SCENARIOS.find(x => x.id === 'ci-03');
    const results = evalScenario(s);
    const byId = Object.fromEntries(results.map(r => [r.id, r]));
    assertEqual(byId['obj-1'].passed, true, 'obj-1 should pass after hibernate');
    assertEqual(byId['obj-2'].passed, false, 'obj-2 must fail before resume');
    assert(byId['obj-2'].unmet.some(m => /resumed/i.test(m)),
        `unmet message should name the resume objective, got: ${byId['obj-2'].unmet.join('; ')}`);
});

await runner.test('mci-01 fails when the image/network field shapes are wrong (old bug class)', async () => {
    await state.reset();
    // Pre-repair shapes: image === 'CentOS-8' and n.subnet === 'VM-100'.
    await state.create('vms', {
        name: 'Lab-WebServer', vcpus: 2, memory_gb: 4, power_state: 'on',
        host_uuid: 'host-001', is_cvm: false,
        disks: [{ size_gb: 40, container: 'default', image: 'CentOS-8' }],
        nics: [{ subnet: 'VM-100' }],
    });
    const s = STORE_SCENARIOS.find(x => x.id === 'mci-01');
    const results = evalScenario(s);
    const byId = Object.fromEntries(results.map(r => [r.id, r]));
    assertEqual(byId['obj-2'].passed, false,
        'the old image string "CentOS-8" is not what the UI writes — must not pass');
    assertEqual(byId['obj-3'].passed, false,
        'the old n.subnet shape is not what the UI writes — must not pass');
});

// ── 4. Ticket validators keep their (state, trace) shape (SPEC-07) ──

await runner.test('ticket validators expose the universal (state, trace) shape', async () => {
    for (const id of ['aplus-dns-01', 'netplus-gw-01']) {
        assert(typeof TICKET_VALIDATORS[id] === 'function', `${id} validator must be a function`);
        const entry = SCENARIOS.find(s => s.id === id);
        assertEqual(entry.validate, TICKET_VALIDATORS[id],
            `${id} registry entry must reference the shared ticket validator`);
    }
});

process.exit(runner.done('scenario-sweep fixture'));
