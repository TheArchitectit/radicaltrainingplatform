/**
 * Demo independence fixture (T-21, REQ-DEMO-03/04, REQ-UI-08).
 *
 * Failing side this fixture names: before T-21 nothing asserted that the
 * simulator content makes no outbound calls, and nothing asserted that no
 * surface collects a learner's identity. Both were true by inspection and
 * unenforced by construction — an inspection is not a gate.
 *
 * Three independent checks:
 *   1. STATIC — no outbound-call primitive anywhere in the simulator
 *      content (`js/`). The service worker is checked separately and
 *      narrowly: it is allowed a same-origin cache-revalidation fetch, and
 *      it must bail on cross-origin before touching the network.
 *   2. RUNTIME — fetch/XHR/WebSocket/EventSource/sendBeacon are stubbed and
 *      a full scenario walkthrough runs; the recorded call count must be 0.
 *   3. IDENTITY — no surface asks for a learner's name, email, phone, or
 *      account, and no store key holds one. Simulator-domain secrets (the
 *      iSCSI CHAP secret field) are fixture data, not learner identity, and
 *      are named explicitly rather than waved through.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

const WEB = 'RadicalTrainingPlatform.Web';
const runner = makeRunner();

// ── 1. Static scan of simulator content ──

function walk(dir) {
    const out = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) out.push(...walk(full));
        else if (entry.endsWith('.js')) out.push(full);
    }
    return out;
}

const OUTBOUND_PATTERNS = [
    [/\bfetch\s*\(/, 'fetch()'],
    [/\bXMLHttpRequest\b/, 'XMLHttpRequest'],
    [/\bnew\s+WebSocket\b/, 'new WebSocket'],
    [/\bnew\s+EventSource\b/, 'new EventSource'],
    [/\bsendBeacon\b/, 'navigator.sendBeacon'],
    [/\bimportScripts\s*\(/, 'importScripts()'],
    [/\bimport\s*\(\s*['"`]https?:/, 'dynamic import of a remote URL'],
    [/\bnavigator\.connection\b/, 'navigator.connection (network probing)'],
];

await runner.test('simulator content contains no outbound-call primitive', async () => {
    const hits = [];
    for (const file of walk(`${WEB}/js`)) {
        const src = readFileSync(file, 'utf8');
        for (const [re, label] of OUTBOUND_PATTERNS) {
            const m = src.match(re);
            if (m) hits.push(`${file}: ${label}`);
        }
    }
    assertEqual(hits.join(' | ') || '(none)', '(none)',
        `outbound-call primitives in simulator content: ${hits.join(' | ')}`);
});

await runner.test('the service worker only ever fetches same-origin', async () => {
    const src = readFileSync(`${WEB}/sw.js`, 'utf8');
    // The cache-revalidation fetch is the one allowed network use; it must
    // be unreachable for a cross-origin request.
    assert(/url\.origin\s*!==\s*self\.location\.origin/.test(src),
        'sw.js must bail on cross-origin requests before responding');
    assert(!/\bnew\s+WebSocket\b|\bEventSource\b|\bsendBeacon\b/.test(src),
        'sw.js must not open a socket, stream, or beacon');
    for (const m of src.matchAll(/\bfetch\s*\(([^)]*)\)/g)) {
        const arg = m[1].trim();
        assert(!/^['"`]https?:/.test(arg),
            `sw.js must not fetch an absolute remote URL: fetch(${arg})`);
    }
});

// ── 2. Runtime spy over a full scenario walkthrough ──

const calls = [];
function installNetworkSpy() {
    const record = (kind) => (...args) => {
        calls.push({ kind, args: args.map(a => String(a).slice(0, 80)) });
        return Promise.reject(new Error(`outbound call blocked in demo mode: ${kind}`));
    };
    globalThis.fetch = record('fetch');
    globalThis.XMLHttpRequest = class { open(...a) { record('XMLHttpRequest')(...a); } send() {} };
    globalThis.WebSocket = class { constructor(...a) { record('WebSocket')(...a); } };
    globalThis.EventSource = class { constructor(...a) { record('EventSource')(...a); } };
    // `navigator` is a getter-only global on modern Node; define it rather
    // than assign, so the spy replaces the whole object.
    Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        writable: true,
        value: { sendBeacon: record('sendBeacon') },
    });
}

installDom();
installNetworkSpy();

const { state } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateEngine.js');
const { progress } = await import('../../../RadicalTrainingPlatform.Web/js/core/ProgressStore.js');
const { demo } = await import('../../../RadicalTrainingPlatform.Web/js/core/DemoMode.js');
const { SCENARIOS } = await import('../../../RadicalTrainingPlatform.Web/js/views/scenarios.js');

await runner.test('a demo-mode scenario walkthrough makes zero outbound calls', async () => {
    await progress.init();
    await demo.enter(SCENARIOS);

    // Drive a scenario through the same entry point the UI uses: reset the
    // station, then evaluate every validator over the seeded state.
    await demo.resetStation(SCENARIOS);
    for (const s of SCENARIOS) {
        const trace = state.getAll('action_trace');
        for (const obj of s.objectives || []) {
            try { obj.validate(state, trace); } catch { /* negativity is covered elsewhere */ }
        }
    }
    assertEqual(calls.length, 0,
        `simulator content made outbound calls: ${JSON.stringify(calls)}`);
});

// ── 3. No learner-identity collection (REQ-UI-08) ──

await runner.test('no surface collects learner identity', async () => {
    const surfaces = [`${WEB}/index.html`, ...walk(`${WEB}/js`)];
    const hits = [];
    for (const file of surfaces) {
        const src = readFileSync(file, 'utf8');
        for (const [re, label] of [
            [/type\s*=\s*["']email["']/i, 'email input'],
            [/type\s*=\s*["']tel["']/i, 'phone input'],
            [/name\s*=\s*["'](email|password|user(name)?|fullname|phone)["']/i, 'identity-named field'],
            // Learner-directed phrasing only. A bare "email" is simulator
            // domain data: pc-alerts.js names an alert policy
            // "e.g. Critical-Alerts-Email", which is a resource name, not a
            // prompt for the learner's address.
            [/placeholder\s*=\s*["'][^"']*(your (e-?mail|name|username|address)|sign ?in|log ?in|enter your)[^"']*["']/i, 'identity prompt'],
        ]) {
            if (re.test(src)) hits.push(`${file}: ${label}`);
        }
    }
    assertEqual(hits.join(' | ') || '(none)', '(none)',
        `learner-identity collection surfaces: ${hits.join(' | ')}`);
});

await runner.test('the only password field is the simulator CHAP secret, not a credential prompt', async () => {
    const hits = [];
    for (const file of walk(`${WEB}/js`)) {
        const src = readFileSync(file, 'utf8');
        for (const m of src.matchAll(/type="password"/g)) {
            const lineStart = src.lastIndexOf('\n', m.index) + 1;
            const line = src.slice(lineStart, src.indexOf('\n', m.index));
            hits.push(`${file}: ${line.trim().slice(0, 120)}`);
        }
    }
    assert(hits.length > 0, 'expected the simulator CHAP secret field to exist');
    for (const hit of hits) {
        assert(/chap_secret|CHAP Secret/i.test(hit),
            `a password field that is not the simulator CHAP secret: ${hit}`);
    }
});

await runner.test('no store key holds learner identity after a demo walkthrough', async () => {
    const { store } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateStore.js');
    const keys = await store.keys('');
    const suspicious = keys.filter(k => /email|user(name)?|student|person|account|name/i.test(k));
    assertEqual(suspicious.join(',') || '(none)', '(none)',
        `store keys that look like identity: ${suspicious.join(', ')}`);
    // Every key must be a learner-progress or simulator key — nothing else.
    const unexpected = keys.filter(k =>
        !/^(progress|scenario|demo)\//.test(k) && !/^(clusterState|action_trace)/.test(k));
    assertEqual(unexpected.join(',') || '(none)', '(none)',
        `unexpected store keyspaces: ${unexpected.join(', ')}`);
});

await runner.test('the demo-mode label sits in the app shell, not inside a routed view', async () => {
    const src = readFileSync(`${WEB}/index.html`, 'utf8');
    const banner = src.indexOf('id="demo-banner"');
    const viewContainer = src.indexOf('id="view-container"');
    assert(banner !== -1, 'the shell must carry the demo-mode banner (REQ-DEMO-02)');
    assert(viewContainer !== -1, 'the shell must carry the routed view container');
    // "a visible demo-mode label on every screen" only holds if the banner
    // lives outside the container the router swaps out.
    assert(banner < viewContainer,
        'the demo banner must be in the shell, outside the routed view container');
    assert(/role="status"/.test(src.slice(banner - 60, banner + 200)),
        'the banner must announce itself to assistive tech');
});

await runner.test('every demo control is a real button, not a hover-only affordance', async () => {
    const src = readFileSync(`${WEB}/js/views/demo-mode.js`, 'utf8');
    const ids = ['demo-enter', 'demo-reset', 'demo-exit'];
    for (const id of ids) {
        assert(new RegExp(`<button[^>]*id="${id}"`).test(src),
            `${id} must be a <button> so it is keyboard-operable by default`);
    }
    assert(!/onclick=/.test(src), 'the demo view must not use inline click handlers on non-button elements');
    // Projector readability: the demo mode raises the base type size.
    const css = readFileSync(`${WEB}/css/study.css`, 'utf8');
    assert(/body\.demo-mode\s*\{[^}]*font-size/.test(css),
        'demo mode must raise the base font size for projector legibility');
});

await runner.test('the header identity label is marked simulated, not a real account', async () => {
    const src = readFileSync(`${WEB}/index.html`, 'utf8');
    const m = src.match(/<span id="simulated-identity-label"[^>]*>([^<]*)<\/span>/);
    assert(m, 'the header must carry the simulated-identity label');
    assert(/simulated/i.test(m[1]),
        `the header label must say it is simulated, got "${m[1]}"`);
});

await runner.test('the demo surfaces carry no identity field of their own', async () => {
    for (const file of [
        `${WEB}/js/core/DemoMode.js`,
        `${WEB}/js/core/CompletionPanel.js`,
        `${WEB}/js/components/DemoBanner.js`,
        `${WEB}/js/views/demo-mode.js`,
    ]) {
        const src = readFileSync(file, 'utf8');
        assert(!/<input[^>]*type="(text|email|tel|password)"/i.test(src),
            `${file} must not render an identity input`);
        assert(!/\b(getUserName|currentUser|signIn|sign_in|login)\b/.test(src),
            `${file} must not reference an identity/authentication surface`);
    }
});

process.exit(runner.done('demo-independence fixture'));
