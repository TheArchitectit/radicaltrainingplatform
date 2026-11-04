/**
 * CompTIA help-desk ticket scenarios and their validators (SPEC-04
 * REQ-AP-07, SPEC-05 REQ-NP-02).
 *
 * Validators are pure over (state, trace): the configuration the learner
 * changed and the diagnosis they recorded, never wall-clock or random.
 * TICKET_VALIDATORS is the one registry the scenario entries, the UI and the
 * ticket gate share.
 */
import { DISCLAIMER } from './scenarios-shared.js';

// ── Ticket scenario validators (pure: state + trace only) ──

/** Correct values are part of the scenario contract, not the seed. */
export const TICKET_EXPECTATIONS = {
    'aplus-dns-01': {
        workstation: 'ws-dns-01',
        editableField: 'dns',
        correctDns: '10.42.100.10',
        requiredTests: ['nslookup'],
    },
    'netplus-gw-01': {
        workstation: 'ws-gw-01',
        editableField: 'gateway',
        correctGateway: '10.42.200.1',
        requiredTests: ['tracert'],
    },
    'aplus-ipconf-01': {
        workstation: 'ws-ipconf-01',
        editableField: 'ip',
        correctIp: '10.42.100.121',
        requiredTests: ['ipconfig', 'ping-ip'],
    },
};

function workstationOf(stateApi, scenarioId) {
    return stateApi.getAll('ticket_workstations').find(w => w.scenarioId === scenarioId);
}

/** Trace helpers: did the learner run a required test AFTER observing the fault? */
function ranTest(trace, testId) {
    return trace.some(t => t.action === 'test-run' && t.test === testId);
}

export function validateAplusDns01(stateApi, trace) {
    const unmetList = [];
    const ws = workstationOf(stateApi, 'aplus-dns-01');
    const exp = TICKET_EXPECTATIONS['aplus-dns-01'];
    if (!ws) return { passed: false, unmetConditions: ['workstation record missing'] };
    if (ws.config.dns !== exp.correctDns) {
        unmetList.push(`DNS server is still ${ws.config.dns} — the resolver must point at 10.42.100.10`);
    }
    if (!ranTest(trace, 'nslookup')) {
        unmetList.push('no nslookup diagnosis recorded — run the fixed-set test before submitting');
    }
    if (!ranTest(trace, 'ping-ip')) {
        unmetList.push('no ping-by-IP recorded — confirm name resolution is the only fault');
    }
    if (!(ws.resolution_note || '').trim()) {
        unmetList.push('resolution note is empty — document the fix');
    }
    return { passed: unmetList.length === 0, unmetConditions: unmetList };
}

export function validateNetplusGw01(stateApi, trace) {
    const unmetList = [];
    const ws = workstationOf(stateApi, 'netplus-gw-01');
    const exp = TICKET_EXPECTATIONS['netplus-gw-01'];
    if (!ws) return { passed: false, unmetConditions: ['workstation record missing'] };
    if (ws.config.gateway !== exp.correctGateway) {
        unmetList.push(`default gateway is still ${ws.config.gateway} — it must be 10.42.200.1 for the 10.42.200.0/24 subnet`);
    }
    if (!ranTest(trace, 'tracert')) {
        unmetList.push('no tracert verification recorded — verify off-subnet reachability after the fix');
    }
    if (!(ws.resolution_note || '').trim()) {
        unmetList.push('resolution note is empty — document the fix');
    }
    return { passed: unmetList.length === 0, unmetConditions: unmetList };
}

export function validateAplusIpconf01(stateApi, trace) {
    const unmetList = [];
    const ws = workstationOf(stateApi, 'aplus-ipconf-01');
    const exp = TICKET_EXPECTATIONS['aplus-ipconf-01'];
    if (!ws) return { passed: false, unmetConditions: ['workstation record missing'] };
    if (ws.config.ip !== exp.correctIp) {
        unmetList.push(`IP address is still ${ws.config.ip} — it conflicts with another host; set the assigned address ${exp.correctIp}`);
    }
    if (!ranTest(trace, 'ipconfig')) {
        unmetList.push('no ipconfig output recorded — capture the duplicate-address evidence before submitting');
    }
    if (!ranTest(trace, 'ping-ip')) {
        unmetList.push('no ping-by-IP recorded — confirm the intermittent loss clears after the change');
    }
    if (!(ws.resolution_note || '').trim()) {
        unmetList.push('resolution note is empty — document the fix');
    }
    return { passed: unmetList.length === 0, unmetConditions: unmetList };
}

export const TICKET_VALIDATORS = {
    'aplus-dns-01': validateAplusDns01,
    'netplus-gw-01': validateNetplusGw01,
    'aplus-ipconf-01': validateAplusIpconf01,
};

// Sprint 46 (T-13) — CompTIA help-desk ticket scenarios (SPEC-04 REQ-AP-07,
// SPEC-05 REQ-NP-02). Routed through TicketLabView; validators above.
export const TICKET_SCENARIOS = [
    {
        id: 'aplus-dns-01', exam: 'COMPTIA-A-1201', title: 'Ticket HR-2214: Site loads by IP, not by name',
        fixtureSeed: 1961388102,
        difficulty: 'Beginner', time: '10 min',
        description: 'A help-desk ticket: the user can reach a website by IP address but not by name. Diagnose, fix the workstation, and document.',
        renderer: 'ticket',
        scenarioId: 'aplus-dns-01',
        validate: TICKET_VALIDATORS['aplus-dns-01'],
        ticket: {
            id: 'HR-2214', priority: 'P3', reportedBy: 'M. Alvarez (HR)',
            text: 'Since this morning I can open the intranet report portal by typing its IP address, but when I type the website name the browser says it cannot find it. Yesterday everything worked. I did not change anything.',
        },
        configFields: ['ip', 'gateway', 'dns'],
        editableField: 'dns',
        correctDns: '10.42.100.10',
        correctGateway: '10.42.100.1',
        hints: ['The user reaches services by IP — that rules out routing and the NIC.', 'Name resolution failing points at exactly one configuration field.', 'Run nslookup before and after the change to record the diagnosis.'],
        disclaimer: DISCLAIMER,
    },
    {
        id: 'netplus-gw-01', exam: 'COMPTIA-NET-009', title: 'Ticket SA-3391: Local share works, internet does not',
        fixtureSeed: 2288554035,
        difficulty: 'Beginner', time: '10 min',
        description: 'A network troubleshooting ticket: the workstation reaches its own subnet but nothing beyond it. Identify, fix, and verify.',
        renderer: 'ticket',
        scenarioId: 'netplus-gw-01',
        validate: TICKET_VALIDATORS['netplus-gw-01'],
        ticket: {
            id: 'SA-3391', priority: 'P3', reportedBy: 'D. Chen (Sales)',
            text: 'I can open shared folders and print, but I cannot reach anything outside our building — no websites, no webmail. Coworkers on the same floor are fine. A colleague was configuring my machine last week and may have "cleaned something up".',
        },
        configFields: ['ip', 'gateway', 'dns'],
        editableField: 'gateway',
        correctDns: '10.42.100.10',
        correctGateway: '10.42.200.1',
        topology: { subnets: ['10.42.200.0/24 — Sales', '10.42.100.0/24 — Services'], router: '10.42.200.1' },
        hints: ['Reaching hosts on the same subnet but nothing off-subnet is a classic default-gateway symptom.', 'The correct gateway for 10.42.200.0/24 is .1 — check the topology panel.', 'tracert after the fix verifies off-subnet reachability; document what you found.'],
        disclaimer: DISCLAIMER,
    },
    {
        id: 'aplus-ipconf-01', exam: 'COMPTIA-A-1201', title: 'Ticket OPS-4472: The network drops when a second laptop is docked',
        fixtureSeed: 1732050807,
        difficulty: 'Beginner', time: '10 min',
        description: 'An address-conflict ticket: the workstation works for a while, drops, and recovers. Diagnose, fix the addressing, and verify.',
        renderer: 'ticket',
        scenarioId: 'aplus-ipconf-01',
        validate: TICKET_VALIDATORS['aplus-ipconf-01'],
        ticket: {
            id: 'OPS-4472', priority: 'P2', reportedBy: 'R. Okafor (Operations)',
            text: 'My machine connects, then drops for a minute or two, then comes back. Downloads fail halfway and the shared drive disconnects. It started when a spare laptop was set up next to me. IT says my address should be 10.42.100.121.',
        },
        configFields: ['ip', 'gateway', 'dns'],
        editableField: 'ip',
        correctDns: '10.42.100.10',
        correctGateway: '10.42.100.1',
        correctIp: '10.42.100.121',
        topology: { subnets: ['10.42.100.0/24 — Operations'], router: '10.42.100.1' },
        hints: ['Working, then dropping, then recovering is not a dead link — the link is being fought over.', 'Run ipconfig and read the whole output rather than only the address.', 'ping a known IP shows partial replies; the fix is the assigned address, not the cable.'],
        disclaimer: DISCLAIMER,
    },
];
