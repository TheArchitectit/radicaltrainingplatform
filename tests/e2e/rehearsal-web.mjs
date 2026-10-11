#!/usr/bin/env node
/**
 * Keyboard-only demo-loop rehearsal (T-26 / S47-10).
 *
 * What this is for: T-26 is a rehearsal on the actual demo host, and half of
 * that cannot be done from a CI box — the host machine is still undecided in
 * the package (PKG:1469), and projector distance and a ChromeOS device are
 * physical facts. TM-48, though, names its own test type as "manual +
 * automated a11y", and S47-03 explicitly handed the real-browser keyboard
 * walkthrough forward to this row ("the legibility and button checks are
 * static, not a rendered measurement"). This file is that automated half.
 *
 * What it does: drives the seven named critical flows (PKG:141 — boot, track
 * picker, lesson, practice, scenario, reset, progress persistence) through a
 * real browser using nothing but key events.
 *
 * Why key events and never element.click(): a programmatic click succeeds on
 * an element the keyboard cannot reach, so a harness built on .click() would
 * report a passing walkthrough for a page no keyboard user can operate — the
 * precise defect REQ-DEMO-05 exists to forbid ("keyboard-operable, no
 * hover-only affordances on the demo path"). Every activation below is a Tab
 * to the control and then Enter or Space, so a control that is not in the tab
 * order fails the leg rather than being quietly clicked around.
 *
 * This is a rehearsal, not a merge gate. It is deliberately NOT wired into
 * CI: its browser legs belong to the hosted runner by design (see the note in
 * .github/workflows/pwa-deploy.yml), and it is expected to be red until the
 * demo-path keyboard gaps it reports are closed — a knowingly-red gate on
 * main's deploy path would be worse than no gate. Run it before a rehearsal:
 *
 *     node tests/e2e/rehearsal-web.mjs
 *
 * Zero npm dependencies: the repo has no package.json, and Node's global
 * WebSocket (Node >= 22) speaks CDP directly.
 *
 * Env:
 *   CHROME_BIN          path to the browser (else PATH is searched)
 *   REHEARSAL_WEB_ROOT  artifact directory to serve (default: the repo's Web
 *                       dir); tests/gates/run_rehearsal_fixtures.sh points this
 *                       at a deliberately broken copy to prove this can fail
 *   REHEARSAL_LOG_OUT   write the rehearsal log to this path (archived as the
 *                       S47-10 evidence record)
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync, existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const WEB_ROOT = resolve(process.env.REHEARSAL_WEB_ROOT || 'RadicalTrainingPlatform.Web');

// The exact string REQ-BRAND-02 requires, checked verbatim — a paraphrase is a
// different claim, and this one is the disclaimer the demo leans on.
const DISCLAIMER =
    'This is independent study material. It is not official training and is not '
    + 'endorsed or approved by CompTIA, Nutanix, or any other certification body.';

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json',
};

const log = [];
function say(line) {
    log.push(line);
    process.stdout.write(line + '\n');
}

// ── Static server over the exact artifact that would be demoed ──

function startServer() {
    const server = createServer((req, res) => {
        const url = new URL(req.url, 'http://127.0.0.1');
        let pathname = decodeURIComponent(url.pathname);
        if (pathname === '/') pathname = '/index.html';
        const target = resolve(join(WEB_ROOT, pathname));
        if (!target.startsWith(WEB_ROOT) || !existsSync(target)) {
            res.writeHead(404, { 'content-type': 'text/plain' });
            res.end('not found');
            return;
        }
        res.writeHead(200, { 'content-type': MIME[extname(target)] || 'application/octet-stream' });
        res.end(readFileSync(target));
    });
    return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

// ── Browser discovery: fail loudly, never skip ──

function findBrowser() {
    const candidates = [
        process.env.CHROME_BIN,
        '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium', '/usr/bin/chromium-browser',
        '/snap/bin/chromium',
    ].filter(Boolean);
    for (const c of candidates) if (existsSync(c)) return c;
    for (const name of ['google-chrome', 'chromium', 'chromium-browser', 'chrome']) {
        const found = onPath(name);
        if (found) return found;
    }
    return null;
}

function onPath(name) {
    for (const dir of (process.env.PATH || '').split(':')) {
        const full = join(dir, name);
        if (dir && existsSync(full)) return full;
    }
    return null;
}

// ── Minimal CDP client ──

class Cdp {
    #ws; #id = 0; #pending = new Map(); #handlers = [];
    constructor(ws) {
        this.#ws = ws;
        ws.addEventListener('message', (ev) => {
            const msg = JSON.parse(ev.data);
            if (msg.id != null) {
                const p = this.#pending.get(msg.id);
                if (!p) return;
                this.#pending.delete(msg.id);
                if (msg.error) p.reject(new Error(`${p.method}: ${msg.error.message}`));
                else p.resolve(msg.result);
            } else {
                for (const h of this.#handlers) h(msg);
            }
        });
    }
    static async connect(url) {
        const ws = new WebSocket(url);
        await new Promise((ok, no) => {
            ws.addEventListener('open', ok, { once: true });
            ws.addEventListener('error', () => no(new Error(`cannot connect to ${url}`)), { once: true });
        });
        return new Cdp(ws);
    }
    on(handler) { this.#handlers.push(handler); }
    send(method, params = {}, sessionId) {
        const id = ++this.#id;
        const payload = { id, method, params };
        if (sessionId) payload.sessionId = sessionId;
        this.#ws.send(JSON.stringify(payload));
        return new Promise((resolve, reject) => this.#pending.set(id, { resolve, reject, method }));
    }
    close() { try { this.#ws.close(); } catch { /* already closing */ } }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForHttp(url, timeoutMs = 15000) {
    const deadline = Date.now() + timeoutMs;
    let lastErr;
    while (Date.now() < deadline) {
        try {
            const res = await fetch(url);
            if (res.ok) return await res.json();
        } catch (e) { lastErr = e; }
        await sleep(120);
    }
    throw new Error(`browser endpoint ${url} never came up (${lastErr?.message || 'timeout'})`);
}

/**
 * Chrome writes the port it chose here when launched with
 * `--remote-debugging-port=0`. The file appears asynchronously, so poll.
 */
async function readDevToolsPort(profileDir, timeoutMs = 15000) {
    const file = join(profileDir, 'DevToolsActivePort');
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        if (existsSync(file)) {
            const line = readFileSync(file, 'utf8').split('\n')[0].trim();
            if (line) return line;
        }
        await sleep(120);
    }
    throw new Error('Chrome never wrote DevToolsActivePort — it may have failed to start');
}

// ── Key events ──
//
// Measured, not assumed: a focused <button> does NOT activate on
// `rawKeyDown`+`keyUp` alone — Chrome synthesizes the click from the key's
// text. A <a href> activates on any of the shapes, which is exactly why a
// harness that only ever tested links would look fine while every real button
// stayed inert. `rawKeyDown` + `char` + `keyUp` drives both, so that is the
// one shape used here. (tests/gates/run_rehearsal_fixtures.sh pins this: the
// fixture that turns a demo-path control into a non-focusable <div> must fail.)

const KEY = {
    Tab: { key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 },
    Enter: { key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: '\r' },
    Space: { key: ' ', code: 'Space', windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32, text: ' ' },
};

/** A descriptor of whatever currently holds focus, for reachability assertions. */
const ACTIVE = `(() => {
    const e = document.activeElement;
    if (!e) return null;
    return {
        tag: e.tagName,
        id: e.id || null,
        cls: (typeof e.className === 'string' ? e.className : '') || null,
        href: e.getAttribute ? e.getAttribute('href') : null,
        route: (e.dataset && e.dataset.route) || null,
        letter: (e.dataset && e.dataset.letter) || null,
        sid: (e.dataset && e.dataset.id) || null,
        dtest: (e.dataset && e.dataset.test) || null,
        type: e.type || null,
        disabled: e.disabled === true,
        text: (e.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 60),
    };
})()`;

const failures = [];
const findings = [];

// Optional flow scoping (REHEARSAL_FLOWS=1,2,3,4,7). This exists so
// tests/gates/run_rehearsal_fixtures.sh can exercise a genuinely green path on
// an UNMODIFIED copy of the artifact: the live tree is red on exactly two legs
// (the REQ-UI-04 cold-load note and the REQ-DEMO-05 scenario nav), and a
// fixture that could only ever observe failure would prove nothing about
// whether this harness can pass. Flow 1 is always run — it is the boot
// precondition every other leg builds on — and a scope that includes 4 or 5
// must include 1-3, which establish the route and the scored answer.
const ALL_FLOWS = [1, 2, 3, 4, 5, 6, 7];
const FLOWS = new Set(process.env.REHEARSAL_FLOWS
    ? process.env.REHEARSAL_FLOWS.split(',').map((s) => parseInt(s.trim(), 10)).filter(Number.isInteger)
    : ALL_FLOWS);

function fail(what) { failures.push(what); say(`  FAIL ${what}`); }
function pass(what) { say(`  PASS ${what}`); }
function note(what) { findings.push(what); say(`  NOTE ${what}`); }

async function main() {
    if (!existsSync(WEB_ROOT)) {
        fail(`artifact directory missing: ${WEB_ROOT}`);
        return;
    }
    const browser = findBrowser();
    if (!browser) {
        // Fail closed: no browser means the rehearsal did not happen, and a
        // rehearsal that did not happen must never read as a pass.
        fail('no Chrome/Chromium found (set CHROME_BIN) — the rehearsal did not run');
        return;
    }
    say(`browser: ${browser}`);

    const server = await startServer();
    const origin = `http://127.0.0.1:${server.address().port}`;
    say(`serving ${WEB_ROOT} at ${origin}`);

    const profile = mkdtempSync(join(tmpdir(), 'rtp-rehearsal-'));
    const proc = spawn(browser, [
        '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
        '--disable-dev-shm-usage', '--remote-debugging-port=0',
        `--user-data-dir=${profile}`, 'about:blank',
    ], { stdio: ['ignore', 'ignore', 'pipe'] });

    let stderr = '';
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    let cdp;
    try {
        const devtoolsPort = await readDevToolsPort(profile);
        const version = await waitForHttp(`http://127.0.0.1:${devtoolsPort}/json/version`);
        cdp = await Cdp.connect(version.webSocketDebuggerUrl);

        const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
        const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });

        const consoleErrors = [];
        cdp.on((msg) => {
            if (msg.sessionId !== sessionId) return;
            if (msg.method === 'Runtime.exceptionThrown') {
                const d = msg.params.exceptionDetails;
                consoleErrors.push(`uncaught: ${d.exception?.description || d.text}`);
            } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
                consoleErrors.push(`console.error: ${msg.params.args.map(a => a.value ?? a.description).join(' ')}`);
            } else if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
                consoleErrors.push(`log: ${msg.params.entry.text} (${msg.params.entry.url || ''})`);
            }
        });

        await cdp.send('Runtime.enable', {}, sessionId);
        await cdp.send('Log.enable', {}, sessionId);
        await cdp.send('Page.enable', {}, sessionId);

        const evaluate = async (expression) => {
            const r = await cdp.send('Runtime.evaluate',
                { expression, returnByValue: true, awaitPromise: true }, sessionId);
            if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
            return r.result.value;
        };

        const key = async (name) => {
            const k = KEY[name];
            await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...k }, sessionId);
            if (k.text) await cdp.send('Input.dispatchKeyEvent', { type: 'char', ...k }, sessionId);
            await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', ...k }, sessionId);
            await sleep(70);
        };

        // Punctuation needs its real code and virtual key: a '.' sent with a
        // letter's keycode is silently dropped by the renderer, which is how a
        // typed "10.42.100.10" arrives as "104210010" and the rehearsal then
        // blames the app for a value it never entered.
        const PUNCT = {
            '.': { code: 'Period', vk: 190 },
            '-': { code: 'Minus', vk: 189 },
            ' ': { code: 'Space', vk: 32 },
            '/': { code: 'Slash', vk: 191 },
            ':': { code: 'Semicolon', vk: 186 },
            ',': { code: 'Comma', vk: 188 },
            "'": { code: 'Quote', vk: 222 },
        };

        /** Type one character the way a keyboard would, not via value assignment. */
        const typeChar = async (ch) => {
            const upper = ch.toUpperCase();
            let code, vk;
            if (ch >= '0' && ch <= '9') {
                code = `Digit${ch}`; vk = ch.charCodeAt(0);
            } else if (PUNCT[ch]) {
                ({ code, vk } = PUNCT[ch]);
            } else {
                code = `Key${upper}`; vk = upper.charCodeAt(0);
            }
            const base = { key: ch, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, text: ch };
            await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...base }, sessionId);
            await cdp.send('Input.dispatchKeyEvent', { type: 'char', ...base }, sessionId);
            await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', ...base }, sessionId);
            await sleep(25);
        };

        const typeText = async (text) => { for (const ch of text) await typeChar(ch); };

        /** Select the whole field (Ctrl+A) so typing replaces it. */
        const selectAll = async () => {
            const mods = { key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65, nativeVirtualKeyCode: 65, modifiers: 2 };
            await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...mods }, sessionId);
            await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', ...mods }, sessionId);
            await sleep(80);
        };

        const active = () => evaluate(ACTIVE);

        /**
         * Tab forward until the focused element satisfies `pred`. Returns how
         * many presses it took, or ok:false after `max`. This is the whole
         * reachability test: a control the keyboard cannot reach simply never
         * matches, and the caller fails the leg.
         */
        const tabTo = async (pred, label, max = 60) => {
            for (let i = 1; i <= max; i++) {
                await key('Tab');
                const d = await active();
                if (d && pred(d)) return { ok: true, presses: i, d };
            }
            return { ok: false, presses: max, d: await active(), label };
        };

        const goto = async (hash) => {
            await evaluate(`location.hash = ${JSON.stringify(hash)}`);
            await sleep(600);
        };

        const waitForExpr = async (expression, what, timeoutMs = 15000) => {
            const deadline = Date.now() + timeoutMs;
            while (Date.now() < deadline) {
                try { if (await evaluate(expression)) return true; } catch { /* mid-navigation */ }
                await sleep(150);
            }
            throw new Error(`timed out waiting for ${what}`);
        };

        // ══ Flow 1: boot ══════════════════════════════════════════════════
        say('');
        say('## Flow 1 — boot');
        await cdp.send('Page.navigate', { url: `${origin}/index.html#/tracks` }, sessionId);
        await waitForExpr(`document.querySelector('#view-container')?.children.length > 0`,
            'the router to render #/tracks');
        pass('the PWA boots to #/tracks with a rendered view');

        // ══ Flow 2: track picker (Tab + Enter) ════════════════════════════
        if (FLOWS.has(2)) {
        say('');
        say('## Flow 2 — track picker');
        const trackCard = await tabTo(
            (d) => d.href === '#/tracks/track-aplus', 'the A+ track card');
        if (!trackCard.ok) {
            fail(`the A+ track card is not reachable by Tab (stopped on ${JSON.stringify(trackCard.d)})`);
        } else {
            pass(`A+ track card reached by keyboard in ${trackCard.presses} Tab press(es)`);
            await key('Enter');
            await sleep(600);
            const hash = await evaluate('location.hash');
            if (hash === '#/tracks/track-aplus') pass('Enter on the track card opens the track');
            else fail(`Enter on the track card left the route at ${hash}`);
        }
        }

        // ══ Flow 3: lesson reader (Tab + Enter) ═══════════════════════════
        if (FLOWS.has(3)) {
        say('');
        say('## Flow 3 — lesson');
        const lessonLink = await tabTo(
            (d) => (d.href || '').includes('/lessons/'), 'a released lesson link');
        if (!lessonLink.ok) {
            fail(`no released lesson link reachable by Tab (stopped on ${JSON.stringify(lessonLink.d)})`);
        } else {
            pass(`released lesson link reached by keyboard in ${lessonLink.presses} Tab press(es)`);
            await key('Enter');
            await sleep(700);
            const hash = await evaluate('location.hash');
            if (hash.includes('/lessons/')) pass('Enter on the lesson link opens the reader');
            else fail(`Enter on the lesson link left the route at ${hash}`);

            const bodyLen = await evaluate(
                `document.querySelector('.lesson-body')?.textContent.trim().length || 0`);
            if (bodyLen > 200) pass(`the lesson body renders ${bodyLen} characters of prose`);
            else fail(`the lesson body is empty or near-empty (${bodyLen} characters)`);

            const disclaimer = await evaluate(
                `document.querySelector('.study-disclaimer')?.textContent.trim() || ''`);
            if (disclaimer === DISCLAIMER) pass('the lesson carries the exact REQ-BRAND-02 disclaimer');
            else fail(`the lesson disclaimer is not the required string: ${JSON.stringify(disclaimer.slice(0, 120))}`);
        }
        }

        // ══ Flow 4: practice (Tab, Space, Enter) ══════════════════════════
        if (FLOWS.has(4)) {
        say('');
        say('## Flow 4 — practice');
        const practiceLink = await tabTo(
            (d) => (d.href || '').startsWith('#/practice/'), 'the practice button');
        if (!practiceLink.ok) {
            fail(`no practice button reachable by Tab (stopped on ${JSON.stringify(practiceLink.d)})`);
        } else {
            pass(`practice button reached by keyboard in ${practiceLink.presses} Tab press(es)`);
            await key('Enter');
            await sleep(800);
            const hash = await evaluate('location.hash');
            if (hash.startsWith('#/practice/')) pass('Enter on the practice button opens a practice set');
            else fail(`Enter on the practice button left the route at ${hash}`);

            const rows = await evaluate(`document.querySelectorAll('.option-row').length`);
            if (rows > 0) pass(`the practice set renders ${rows} answer options`);
            else fail('the practice set rendered no answer options');

            const option = await tabTo(
                (d) => (d.cls || '').includes('option-row'), 'an answer option');
            if (!option.ok) {
                fail(`no answer option reachable by Tab (stopped on ${JSON.stringify(option.d)})`);
            } else {
                await key('Space');
                await sleep(250);
                const selected = await evaluate(
                    `document.querySelector('.option-row.selected')?.dataset.letter || null`);
                if (selected) pass(`Space selects the focused option (${selected})`);
                else fail('Space on a focused option did not select it');

                const submit = await tabTo((d) => d.id === 'practice-submit', '#practice-submit');
                if (!submit.ok) {
                    fail(`#practice-submit not reachable by Tab (stopped on ${JSON.stringify(submit.d)})`);
                } else {
                    const disabled = await evaluate(
                        `document.getElementById('practice-submit').disabled`);
                    if (disabled) fail('the submit button is still disabled after a keyboard selection');
                    await key('Enter');
                    await sleep(600);
                    const verdict = await evaluate(
                        `document.querySelector('#practice-feedback .verdict')?.textContent.trim() || null`);
                    if (verdict) pass(`Enter on submit grades the answer: "${verdict.slice(0, 60)}"`);
                    else fail('Enter on the submit button produced no graded feedback');
                }
            }
        }
        }

        // ══ Flow 5: progress persistence across a reload ══════════════════
        if (FLOWS.has(5)) {
        say('');
        say('## Flow 5 — progress persistence');
        //
        // Two separate claims, because they can fail independently and mean
        // different things: (1) the scored answer is still IN storage, and
        // (2) the app SURFACES it on a cold load. A rehearsal that only asked
        // (1) would call this flow green while a presenter opening the app
        // cold sees a learner with no history.
        await cdp.send('Page.navigate', { url: `${origin}/index.html#/practice/COMPTIA-A-1201` }, sessionId);
        await waitForExpr(`!!document.querySelector('.practice-progress')`, 'practice to re-render');

        const stored = await evaluate(`(async () => {
            const mod = await import('/js/core/StateStore.js');
            const keys = await mod.store.keys('progress/');
            return keys.filter(k => !k.endsWith('/continuation') && !k.endsWith('/summary')).length;
        })()`);
        if (stored > 0) pass(`the scored answer is still in storage after a reload (${stored} item record(s))`);
        else fail('the scored answer is gone from storage after a reload — progress did not persist');

        const priorNote = await evaluate(
            `document.querySelector('.practice-prior-note')?.textContent.trim() || null`);
        if (priorNote && /previously answered/i.test(priorNote)) {
            pass(`a cold load surfaces the stored progress: "${priorNote}"`);
        } else {
            fail(`a cold load does not surface the stored progress (note was ${JSON.stringify(priorNote)}) `
                + `even though the record is present — the learner opens the app to a blank history`);
            // Prove it is a cold-load ordering problem and not a missing
            // feature: the same view on a client-side route change shows it.
            await goto('#/tracks');
            await goto('#/practice/COMPTIA-A-1201');
            const afterRoute = await evaluate(
                `document.querySelector('.practice-prior-note')?.textContent.trim() || null`);
            if (afterRoute && /previously answered/i.test(afterRoute)) {
                note(`REQ-UI-04 gap — the prior-progress note renders on a client-side route `
                    + `change ("${afterRoute}") but not on a cold load, so PracticeView reads the `
                    + `store before it can see the records. Reproduced: reload the app on `
                    + `#/practice/COMPTIA-A-1201 with a stored answer, then navigate away and back.`);
            }
        }
        }

        // ══ Flow 6: scenario ══════════════════════════════════════════════
        //
        // Reachability first, and reported separately from completion: the
        // ticket lab itself is keyboard-operable, but if no control in the
        // shell leads to it then a keyboard user cannot get there at all.
        if (FLOWS.has(6)) {
        say('');
        say('## Flow 6 — scenario');
        await goto('#/tracks');
        const scenarioReach = await evaluate(`(() => {
            const focusable = [...document.querySelectorAll('a[href], button, input, select, textarea')];
            const linkToScenarios = focusable.filter(
                e => ((e.getAttribute('href') || '') + (e.dataset?.route || '')).includes('/pc/scenarios'));
            const inertNavItems = [...document.querySelectorAll('.nav-item')]
                .filter(a => !a.getAttribute('href'));
            return {
                focusableLinksToScenarios: linkToScenarios.length,
                inertNavItems: inertNavItems.length,
                inertSample: inertNavItems.slice(0, 3).map(a => a.textContent.trim().slice(0, 24)),
            };
        })()`);
        if (scenarioReach.focusableLinksToScenarios > 0) {
            pass('the scenario view is reachable from a focusable control in the shell');
        } else {
            fail('the scenario view is NOT keyboard-reachable: the only control that leads to '
                + `/pc/scenarios is a nav item with no href (${scenarioReach.inertNavItems} such `
                + 'nav items in the shell), so it is not in the tab order and cannot be activated '
                + 'with Enter or Space');
            note('REQ-DEMO-05 gap — the demo loop\'s scenario leg is mouse-only to enter. The '
                + 'ticket lab inside it IS keyboard-operable (verified below), so the defect is '
                + 'the shell navigation, not the scenario itself.');
        }

        // Complete the ticket by keyboard once there, reached by hash.
        //
        // The predicate must name aplus-dns-01 exactly: every scenario row has
        // a .start-scenario-btn, but only the `ticket` renderer mounts the
        // TicketLabView, so a predicate that matched any Start button would
        // land on a store-based scenario and then blame the lab for the ids it
        // never had.
        await goto('#/pc/scenarios');
        const startBtn = await tabTo(
            (d) => d.sid === 'aplus-dns-01', 'the aplus-dns-01 Start button');
        if (!startBtn.ok) {
            fail(`the aplus-dns-01 Start button is not reachable by Tab `
                + `(stopped on ${JSON.stringify(startBtn.d)})`);
        } else {
            pass(`scenario Start reached by keyboard in ${startBtn.presses} Tab press(es)`);
            await key('Enter');
            await sleep(700);
            const mounted = await evaluate(`!!document.getElementById('ticket-cfg-dns')`);
            if (!mounted) {
                fail('Enter on Start did not mount the ticket lab');
            } else {
                pass('Enter on Start mounts the ticket lab');

                // The DNS field is the editable one for this scenario; the
                // others are disabled. Its `change` fires on blur, so type and
                // then Tab away rather than stopping at the field.
                const dnsField = await tabTo((d) => d.id === 'ticket-cfg-dns', '#ticket-cfg-dns');
                if (!dnsField.ok) {
                    fail(`#ticket-cfg-dns not reachable by Tab (stopped on ${JSON.stringify(dnsField.d)})`);
                } else {
                    pass(`the DNS field reached by keyboard in ${dnsField.presses} Tab press(es)`);
                    await selectAll();
                    await typeText('10.42.100.10');
                    // Read the value WITHOUT blurring: the field's `change` only
                    // fires on blur, and blurring here would move focus onto the
                    // first checkbox, which the next tabTo would then Tab past.
                    const dnsValue = await evaluate(
                        `document.getElementById('ticket-cfg-dns').value`);
                    if (dnsValue === '10.42.100.10') pass('the DNS value was typed by keyboard');
                    else fail(`the typed DNS value did not take (field holds ${JSON.stringify(dnsValue)})`);
                }

                // Run every diagnostic the scenario's validator requires, in the
                // order the fixed test set renders them. For aplus-dns-01 that
                // is BOTH ping-ip and nslookup (scenarios.js:120-125) — checking
                // only one leaves the ticket unresolved, and which one is missing
                // is only named in the verdict text. The first Tab here also
                // blurs the DNS field, committing the typed value.
                for (const testId of ['ping-ip', 'nslookup']) {
                    const testBox = await tabTo(
                        (d) => d.dtest === testId, `the ${testId} diagnostic checkbox`);
                    if (!testBox.ok) {
                        fail(`the ${testId} diagnostic is not reachable by Tab `
                            + `(stopped on ${JSON.stringify(testBox.d)})`);
                        continue;
                    }
                    pass(`the ${testId} diagnostic reached by keyboard in ${testBox.presses} Tab press(es)`);
                    await key('Space');
                    await sleep(300);
                    const checked = await evaluate(`(() => {
                        const box = document.activeElement;
                        return box && box.type === 'checkbox' ? box.checked : null;
                    })()`);
                    if (checked === true) pass(`Space checks the ${testId} diagnostic`);
                    else if (checked === null) fail('the focused element is not a checkbox');
                    else fail(`Space did not check the ${testId} diagnostic`);
                }

                // The resolution note, then submit.
                const noteField = await tabTo((d) => d.tag === 'TEXTAREA', '#ticket-note');
                if (!noteField.ok) {
                    fail(`the resolution note is not reachable by Tab (stopped on ${JSON.stringify(noteField.d)})`);
                } else {
                    await typeText('DNS was pointing at the wrong server.');
                    await sleep(200);
                    pass('the resolution note accepts typed input');
                }

                const submit = await tabTo((d) => d.id === 'ticket-submit', '#ticket-submit');
                if (!submit.ok) {
                    fail(`#ticket-submit not reachable by Tab (stopped on ${JSON.stringify(submit.d)})`);
                } else {
                    await key('Enter');
                    await sleep(700);
                    // The success marker is the `.correct` verdict class, not the
                    // word "resolved": the failure text is "Not resolved: …",
                    // which contains it, so a substring test on the word alone
                    // would report a failed ticket as a pass.
                    const evidence = await evaluate(`(() => {
                        const v = document.querySelector('#ticket-evidence .verdict');
                        if (!v) return null;
                        return { correct: v.classList.contains('correct'), text: v.textContent.trim() };
                    })()`);
                    if (evidence && evidence.correct) {
                        pass(`the ticket resolves by keyboard: "${evidence.text.slice(0, 60)}"`);
                    } else {
                        fail(`the ticket did not resolve by keyboard `
                            + `(verdict: ${JSON.stringify(evidence?.text ?? null)})`);
                    }
                }
            }
        }
        }

        // ══ Flow 7: reset between groups ══════════════════════════════════
        if (FLOWS.has(7)) {
        say('');
        say('## Flow 7 — reset between groups');
        await goto('#/tracks');
        const demoLink = await tabTo((d) => d.href === '#/demo', 'the demo controls link');
        if (!demoLink.ok) {
            fail(`the demo controls link is not reachable by Tab (stopped on ${JSON.stringify(demoLink.d)})`);
        } else {
            pass(`demo controls reached by keyboard in ${demoLink.presses} Tab press(es)`);
            await key('Enter');
            await sleep(600);

            const enter = await tabTo((d) => d.id === 'demo-enter', '#demo-enter');
            if (!enter.ok) {
                fail(`#demo-enter not reachable by Tab (stopped on ${JSON.stringify(enter.d)})`);
            } else {
                await key('Enter');
                await sleep(700);
                const banner = await evaluate(`!document.getElementById('demo-banner').hidden`);
                if (banner) pass('Enter on "Enter demo mode" shows the demo banner');
                else fail('entering demo mode did not show the demo banner');

                const reset = await tabTo((d) => d.id === 'demo-reset', '#demo-reset');
                if (!reset.ok) {
                    fail(`#demo-reset not reachable by Tab (stopped on ${JSON.stringify(reset.d)})`);
                } else {
                    await key('Enter');
                    await sleep(1200);
                    const report = await evaluate(
                        `document.getElementById('demo-report')?.textContent.replace(/\\s+/g, ' ') || ''`);
                    if (!/reseed verification/i.test(report)) {
                        fail(`the reseed verification report did not render (${report.slice(0, 120)})`);
                    } else if (!/\d+\s*\/\s*\d+ scenarios reseeded/.test(report)) {
                        fail(`the reseed report states no count (${report.slice(0, 160)})`);
                    } else if (!/all correct|NOT all correct/.test(report)) {
                        fail(`the reseed report states no outcome (${report.slice(0, 160)})`);
                    } else {
                        pass('the station reset renders its reseed verification outcome');
                    }

                    // TM-48: "focus predictable after reset". The reset
                    // re-renders the view by replaceChild, so the honest
                    // question is whether focus is somewhere sensible rather
                    // than stranded on a node that is no longer in the tree.
                    const after = await active();
                    const stranded = await evaluate(`(() => {
                        const e = document.activeElement;
                        return !!e && !document.contains(e);
                    })()`);
                    if (stranded) {
                        fail('after the reset, focus is on a detached node — not predictable');
                    } else {
                        note(`focus after reset is <${after?.tag || 'null'}`
                            + `${after?.id ? '#' + after.id : ''}>; the view is re-rendered with `
                            + 'replaceChild and nothing restores focus, so a keyboard user resumes '
                            + 'from the top of the tab order.');
                    }

                    // The reset's own claim: the learner keys are cleared.
                    // `store` is exported by StateStore.js; ProgressStore.js
                    // exports `progress` and re-exports nothing named `store`.
                    const cleared = await evaluate(`(async () => {
                        const mod = await import('/js/core/StateStore.js');
                        const keys = await mod.store.keys('progress/');
                        const scen = await mod.store.keys('scenario/');
                        return { progress: keys.length, scenario: scen.length };
                    })()`);
                    if (cleared && cleared.progress === 0 && cleared.scenario === 0) {
                        pass('the reset cleared the stored learner keys (progress/* and scenario/*)');
                    } else {
                        fail(`the reset left learner keys behind: ${JSON.stringify(cleared)}`);
                    }
                }
            }
        }
        }

        if (consoleErrors.length) {
            fail(`console errors: ${consoleErrors.join(' | ')}`);
        } else {
            pass('zero console errors, uncaught exceptions, or failed requests');
        }
    } catch (e) {
        fail(e.message);
    } finally {
        cdp?.close();
        proc.kill('SIGKILL');
        server.close();
        // Chrome keeps writing into its profile for a moment after SIGKILL, so
        // a straight recursive remove can hit ENOTEMPTY. The profile is a
        // throwaway in the OS temp dir: a failed cleanup must not mask the
        // rehearsal result.
        try {
            rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 120 });
        } catch (e) {
            say(`  (note: could not remove the throwaway profile ${profile}: ${e.code || e.message})`);
        }
        if (failures.length && stderr) say(`browser stderr (tail): ${stderr.slice(-600)}`);
    }
}

await main();

say('');
say(`## Findings (${findings.length})`);
for (const f of findings) say(`- ${f}`);
say('');
say(failures.length === 0
    ? 'KEYBOARD REHEARSAL: PASS — every demo-loop flow is keyboard-reachable and completes'
    : `KEYBOARD REHEARSAL: FAIL — ${failures.length} problem(s)`);

const out = process.env.REHEARSAL_LOG_OUT;
if (out) {
    writeFileSync(out, `# Keyboard-only demo-loop rehearsal (T-26 / S47-10)\n\n`
        + `Automated half of TM-48. Manual half (actual demo host, projector `
        + `distance, ChromeOS device) is NOT covered by this log.\n\n`
        + '```\n' + log.join('\n') + '\n```\n');
    process.stdout.write(`[rehearsal] wrote log to ${out}\n`);
}

process.exit(failures.length === 0 ? 0 : 1);
