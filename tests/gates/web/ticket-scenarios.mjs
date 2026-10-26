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
const { validateAplusDns01, validateNetplusGw01, validateAplusIpconf01, SCENARIOS, TICKET_VALIDATORS } = await import('../../../RadicalTrainingPlatform.Web/js/views/scenarios.js');

await state.init();

const DNS_CORRECT = '10.42.100.10';
const DNS_SEEDED_WRONG = '10.42.100.99';
const DNS_WRONG_PLAUSIBLE = '8.8.4.4';
const GW_CORRECT = '10.42.200.1';
const GW_SEEDED_WRONG = '10.42.200.254';
const GW_WRONG_PLAUSIBLE = '10.42.100.1';
const IP_CONFLICT_SEEDED = '10.42.100.118';
const IP_CONFLICT_WRONG_PLAUSIBLE = '10.42.100.126';
const IP_CONFLICT_CORRECT = '10.42.100.121';

function setWsConfig(scenarioId, patch) {
    const ws = state.getAll('ticket_workstations').find(w => w.scenarioId === scenarioId);
    return state.update('ticket_workstations', ws.uuid, { config: { ...ws.config, ...patch } });
}
function setNote(scenarioId, note) {
    const ws = state.getAll('ticket_workstations').find(w => w.scenarioId === scenarioId);
    return state.update('ticket_workstations', ws.uuid, { resolution_note: note });
}

await runner.test('fresh seed: every ticket scenario fails every objective (REQ-SC-02)', async () => {
    await state.reset();
    const dns = validateAplusDns01(state, []);
    assert(!dns.passed, 'aplus-dns-01 must fail from fresh seed');
    assert(dns.unmetConditions.length >= 1, 'unmet conditions named');
    const gw = validateNetplusGw01(state, []);
    assert(!gw.passed, 'netplus-gw-01 must fail from fresh seed');
    assert(gw.unmetConditions.length >= 1, 'unmet conditions named');
    const ipconf = validateAplusIpconf01(state, []);
    assert(!ipconf.passed, 'aplus-ipconf-01 must fail from fresh seed');
    assert(ipconf.unmetConditions.length >= 1, 'unmet conditions named');
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

// ── Address conflict (aplus-ipconf-01) ──
// The third fault type the ticket lab models: the link is up, the gateway and
// resolver are right, and the machine still drops because another host answers
// for its address. It fails for a different reason than the other two, which is
// the point of adding it — the fix is the address, and the evidence is ipconfig.

await runner.test('ipconf: seeded conflict fails, plausible wrong address fails naming it', async () => {
    await state.reset();
    const fresh = validateAplusIpconf01(state, []);
    assert(!fresh.passed, 'aplus-ipconf-01 must fail from fresh seed');
    assert(fresh.unmetConditions.some(m => m.includes(IP_CONFLICT_SEEDED)), 'seeded conflict is named');

    await setWsConfig('aplus-ipconf-01', { ip: IP_CONFLICT_WRONG_PLAUSIBLE });
    await setNote('aplus-ipconf-01', 'Changed the address and verified.');
    const trace = [{ action: 'test-run', test: 'ipconfig' }, { action: 'test-run', test: 'ping-ip' }];
    const v = validateAplusIpconf01(state, trace);
    assert(!v.passed, 'a wrong-but-in-subnet address must fail even with tests and a note');
    assert(v.unmetConditions.some(m => m.includes(IP_CONFLICT_WRONG_PLAUSIBLE)),
        `failure names the wrong address: ${v.unmetConditions[0]}`);
});

await runner.test('ipconf: correct address without ipconfig or note still fails (trace is honored)', async () => {
    await setWsConfig('aplus-ipconf-01', { ip: IP_CONFLICT_CORRECT });
    await setNote('aplus-ipconf-01', '');
    const v = validateAplusIpconf01(state, []);
    assert(!v.passed, 'correct address with no trace fails');
    assert(v.unmetConditions.some(m => m.includes('ipconfig')), 'unmet: ipconfig evidence');
    assert(v.unmetConditions.some(m => m.includes('note')), 'unmet: note');

    await setNote('aplus-ipconf-01', 'Address 10.42.100.118 duplicated a spare laptop. Set the assigned 10.42.100.121; ping is now steady.');
    const trace = [{ action: 'test-run', test: 'ipconfig' }, { action: 'test-run', test: 'ping-ip' }];
    const ok = validateAplusIpconf01(state, trace);
    assert(ok.passed, `walkthrough must pass, got unmet: ${ok.unmetConditions.join('; ')}`);
    assertEqual(ok.unmetConditions.length, 0);
});

await runner.test('reset restores seeded wrong state (REQ-SC-06)', async () => {
    await state.reset();
    const ws = state.getAll('ticket_workstations').find(w => w.scenarioId === 'aplus-dns-01');
    assertEqual(ws.config.dns, DNS_SEEDED_WRONG, 'reset reseeds the wrong DNS');
    const gw = state.getAll('ticket_workstations').find(w => w.scenarioId === 'netplus-gw-01');
    assertEqual(gw.config.gateway, GW_SEEDED_WRONG, 'reset reseeds the wrong gateway');
    const ip = state.getAll('ticket_workstations').find(w => w.scenarioId === 'aplus-ipconf-01');
    assertEqual(ip.config.ip, IP_CONFLICT_SEEDED, 'reset reseeds the conflicting IP');
    assertEqual((ip.resolution_note || ''), '', 'reset clears the resolution note');
    assert(!validateAplusDns01(state, []).passed, 'post-reset negativity holds');
    assert(!validateAplusIpconf01(state, []).passed, 'post-reset ipconf negativity holds');
});

// Regression lock from browser verification: ticket registry entries must
// carry the shared validator on `.validate` — TicketLabView calls
// `s.validate(state, trace)`, so an unwired entry throws at submit time.
await runner.test('ticket registry entries wire the shared validators (UI entry point)', async () => {
    // Iterate the registry, not a hardcoded list: a new ticket that forgets to
    // wire `.validate` must fail here rather than throw at submit time.
    assert(Object.keys(TICKET_VALIDATORS).length >= 3, 'ticket validator registry populated');
    for (const id of Object.keys(TICKET_VALIDATORS)) {
        const entry = SCENARIOS.find(s => s.id === id);
        assert(entry, `${id} present in SCENARIOS`);
        assertEqual(typeof entry.validate, 'function', `${id}.validate must be a function`);
        assertEqual(entry.validate, TICKET_VALIDATORS[id], `${id}.validate must be the shared TICKET_VALIDATORS entry`);
    }
    // The other direction: every scenario the ticket renderer draws must have
    // a validator, or submitting it evaluates nothing.
    for (const s of SCENARIOS.filter(x => x.renderer === 'ticket')) {
        assertEqual(typeof s.validate, 'function', `${s.id} (renderer ticket) must carry a validator`);
        assert(TICKET_VALIDATORS[s.id], `${s.id} (renderer ticket) must be registered in TICKET_VALIDATORS`);
    }
});

process.exit(runner.done('ticket-scenarios'));
