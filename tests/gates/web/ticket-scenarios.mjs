/**
 * T-13/S46-03 — CompTIA ticket scenario fixtures (SPEC-07 REQ-SC-01..04).
 *
 * Drives the real validators (the same entry point the UI evaluates) over
 * the real StateEngine seed:
 *   1. Fresh-seed negativity: seeded (wrong) state fails every objective
 *      before any learner action (REQ-SC-02).
 *   2. Wrong-state negativity: a wrong-but-plausible DNS / gateway value
 *      fails (REQ-SC-04), and the failure names the unmet objective.
 *   3. Walkthrough positivity: the recorded action script reaches 100%
 *      (REQ-SC-03).
 *   4. Trace is honored: correct config but no diagnosis test / no note
 *      still fails — the validator checks final value AND recorded steps.
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

installDom();
const runner = makeRunner();

const { state } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateEngine.js');
const { validateAplusDns01, validateNetplusGw01, SCENARIOS, TICKET_VALIDATORS } = await import('../../../RadicalTrainingPlatform.Web/js/views/scenarios.js');

await state.init();

const DNS_CORRECT = '10.42.100.10';
const DNS_SEEDED_WRONG = '10.42.100.99';
const DNS_WRONG_PLAUSIBLE = '8.8.4.4';
const GW_CORRECT = '10.42.200.1';
const GW_SEEDED_WRONG = '10.42.200.254';
const GW_WRONG_PLAUSIBLE = '10.42.100.1';

function setWsConfig(scenarioId, patch) {
    const ws = state.getAll('ticket_workstations').find(w => w.scenarioId === scenarioId);
    return state.update('ticket_workstations', ws.uuid, { config: { ...ws.config, ...patch } });
}
function setNote(scenarioId, note) {
    const ws = state.getAll('ticket_workstations').find(w => w.scenarioId === scenarioId);
    return state.update('ticket_workstations', ws.uuid, { resolution_note: note });
}

await runner.test('fresh seed: both ticket scenarios fail every objective (REQ-SC-02)', async () => {
    await state.reset();
    const dns = validateAplusDns01(state, []);
    assert(!dns.passed, 'aplus-dns-01 must fail from fresh seed');
    assert(dns.unmetConditions.length >= 1, 'unmet conditions named');
    const gw = validateNetplusGw01(state, []);
    assert(!gw.passed, 'netplus-gw-01 must fail from fresh seed');
    assert(gw.unmetConditions.length >= 1, 'unmet conditions named');
});

await runner.test('wrong-but-plausible DNS fails, naming the objective (REQ-SC-04)', async () => {
    await setWsConfig('aplus-dns-01', { dns: DNS_WRONG_PLAUSIBLE });
    await setNote('aplus-dns-01', 'Changed DNS and verified.');
    const trace = [{ action: 'test-run', test: 'ping-ip' }, { action: 'test-run', test: 'nslookup' }];
    const v = validateAplusDns01(state, trace);
    assert(!v.passed, 'plausible wrong DNS must fail');
    assert(v.unmetConditions.some(m => m.includes(DNS_WRONG_PLAUSIBLE)), `failure names the wrong value: ${v.unmetConditions[0]}`);
});

await runner.test('correct DNS without diagnosis test or note still fails (trace is honored)', async () => {
    await setWsConfig('aplus-dns-01', { dns: DNS_CORRECT });
    await setNote('aplus-dns-01', '');
    const v = validateAplusDns01(state, []);
    assert(!v.passed, 'correct value with no trace fails');
    assert(v.unmetConditions.some(m => m.includes('nslookup')), 'unmet: diagnosis test');
    assert(v.unmetConditions.some(m => m.includes('note')), 'unmet: note');

    // Full walkthrough: tests recorded, note written → passes (REQ-SC-03).
    await setNote('aplus-dns-01', 'DNS was 10.42.100.99, unreachable. Set resolver to 10.42.100.10; nslookup now resolves example.com.');
    const trace = [{ action: 'test-run', test: 'ping-ip' }, { action: 'test-run', test: 'nslookup' }];
    const ok = validateAplusDns01(state, trace);
    assert(ok.passed, `walkthrough must pass, got unmet: ${ok.unmetConditions.join('; ')}`);
    assertEqual(ok.unmetConditions.length, 0);
});

await runner.test('wrong-but-plausible gateway fails; netplus walkthrough passes', async () => {
    await setWsConfig('netplus-gw-01', { gateway: GW_WRONG_PLAUSIBLE });
    await setNote('netplus-gw-01', 'Reset gateway.');
    const trace = [{ action: 'test-run', test: 'tracert' }];
    const v = validateNetplusGw01(state, trace);
    assert(!v.passed, 'wrong-but-same-subnet gateway must fail');
    assert(v.unmetConditions.some(m => m.includes(GW_WRONG_PLAUSIBLE)), 'failure names the wrong gateway');

    await setWsConfig('netplus-gw-01', { gateway: GW_CORRECT });
    await setNote('netplus-gw-01', 'Gateway was 10.42.200.254 (invalid). Set to 10.42.200.1; tracert reaches off-subnet hosts.');
    const ok = validateNetplusGw01(state, trace);
    assert(ok.passed, `walkthrough must pass, got unmet: ${ok.unmetConditions.join('; ')}`);
});

await runner.test('reset restores seeded wrong state (REQ-SC-06)', async () => {
    await state.reset();
    const ws = state.getAll('ticket_workstations').find(w => w.scenarioId === 'aplus-dns-01');
    assertEqual(ws.config.dns, DNS_SEEDED_WRONG, 'reset reseeds the wrong DNS');
    const gw = state.getAll('ticket_workstations').find(w => w.scenarioId === 'netplus-gw-01');
    assertEqual(gw.config.gateway, GW_SEEDED_WRONG, 'reset reseeds the wrong gateway');
    assert(!validateAplusDns01(state, []).passed, 'post-reset negativity holds');
});

// Regression lock from browser verification: ticket registry entries must
// carry the shared validator on `.validate` — TicketLabView calls
// `s.validate(state, trace)`, so an unwired entry throws at submit time.
await runner.test('ticket registry entries wire the shared validators (UI entry point)', async () => {
    for (const id of ['aplus-dns-01', 'netplus-gw-01']) {
        const entry = SCENARIOS.find(s => s.id === id);
        assert(entry, `${id} present in SCENARIOS`);
        assertEqual(typeof entry.validate, 'function', `${id}.validate must be a function`);
        assertEqual(entry.validate, TICKET_VALIDATORS[id], `${id}.validate must be the shared TICKET_VALIDATORS entry`);
    }
});

process.exit(runner.done('ticket-scenarios'));
