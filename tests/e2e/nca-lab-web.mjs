#!/usr/bin/env node
/**
 * NCA beginner lab, driven in a real browser (T-35 / S48-05, SPEC-07 07.5,
 * REQ-SC-02..06, TM-45).
 *
 * The gap this closes. S48-05 shipped the four NCA scenarios behind
 * `tests/gates/web/nca-scenarios.mjs`, which drives the real validators over a
 * stub DOM and the real StateEngine store. That proves the *validators*; it
 * does not prove the *page*. Every leg of the learner path in between — the
 * renderer's afterRender wiring, the radio `change` handler writing the trace,
 * the sequence buttons appending in click order, the alert-detail toggle, the
 * submit button reading the trace back — was unexercised. A view whose
 * handlers were never wired would pass every store-level fixture in the repo
 * and fail the first learner who touched it. The S48-06 freeze record lists
 * exactly this as known-unverified item 6 ("The lab UI was never driven in a
 * browser"); this file is that leg, and it is why the item can now be closed.
 *
 * What it does, per lab scenario, in headless Chrome over CDP:
 *   1. boots the built artifact and reaches the scenario catalogue,
 *   2. starts the lab from its Start button and asserts the REQ-SC-05 label
 *      renders on the page the learner actually sees,
 *   3. resets to the seed and submits — every objective must be unmet, and
 *      each must name why (REQ-SC-02 fresh-seed negativity, REQ-SC-04),
 *   4. performs the recorded correct actions through the real controls,
 *   5. submits — every objective must be met, and the completion toast must
 *      fire (the UI-visible half of REQ-SC-03's solvability walkthrough),
 *   6. resets — the seed must come back and the objectives must fail again
 *      (REQ-SC-06).
 *
 * Deliberately NOT a keyboard gate. `rehearsal-web.mjs` owns the
 * keyboard-operability claim (REQ-DEMO-05) and drives everything with Tab and
 * Enter for that reason. This gate asks whether the lab *works when driven*,
 * so it activates controls directly, like `smoke-web.mjs` does. It makes no
 * claim about the tab order and must not be cited as one.
 *
 * Zero npm dependencies: the repo has no package.json, and a gate that needs
 * an install step is a gate that gets skipped. Node's global WebSocket
 * (Node >= 22) speaks CDP directly.
 *
 * Env:
 *   CHROME_BIN        path to the browser (else PATH is searched)
 *   NCA_LAB_WEB_ROOT  artifact directory to serve (default: the repo's Web
 *                     dir); tests/gates/run_nca_lab_fixtures.sh points this at
 *                     a deliberately broken copy to prove the gate can fail
 *   NCA_LAB_LOG_OUT   write the run log to this path (archived for release)
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync, existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const WEB_ROOT = resolve(process.env.NCA_LAB_WEB_ROOT || 'RadicalTrainingPlatform.Web');
const CATALOGUE_ROUTE = '/pc/scenarios';
const START_PATH = `index.html#${CATALOGUE_ROUTE}`;

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

/**
 * The three lab-mode scenarios and the actions that complete them. The action
 * lists are selectors for the real controls the renderer emits — the same
 * choices `scenario-walkthroughs.mjs` records for the store-level fixture, so
 * the two fixtures disagreeing would itself be a finding.
 */
const LABS = [
    {
        id: 'nca-tool-01',
        title: 'Pick the Right Tool',
        objectives: 3,
        actions: [
            'input[data-task="task-1"][value="move"]',
            'input[data-task="task-2"][value="foundation"]',
            'input[data-task="task-3"][value="ssr"]',
        ],
    },
    {
        id: 'nca-maint-01',
        title: 'Order a Safe Maintenance Sequence',
        objectives: 2,
        // health checks → evacuate → service → update, the manifest's contract.
        actions: [
            '.nca-step-btn[data-step="health-check"]',
            '.nca-step-btn[data-step="evacuate-host"]',
            '.nca-step-btn[data-step="maintenance-mode"]',
            '.nca-step-btn[data-step="lcm-upgrade"]',
        ],
    },
    {
        id: 'nca-alert-01',
        title: 'Read an Alert, Choose the Next Step',
        objectives: 2,
        // Reading first is the point: SPEC-07 07.5 requires that clicking the
        // right answer without opening the alert detail does not pass.
        actions: ['#nca-alert-open', 'input[data-step="expand-container"]'],
    },
];

// ── Static server over the exact artifact that would be published ──

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

// ── The run ──

const failures = [];
function fail(what) { failures.push(what); say(`  FAIL ${what}`); }
function pass(what) { say(`  PASS ${what}`); }

/**
 * Reads the evidence panel the lab renders: one line per objective, marked
 * `✓` when met and `✗` with a reason when not.
 */
const EVIDENCE = `(() => {
    const el = document.querySelector('#nca-evidence .nca-objectives');
    if (!el) return null;
    const lines = [...el.querySelectorAll('li')].map(li => li.textContent.replace(/\\s+/g, ' ').trim());
    return {
        total: lines.length,
        met: lines.filter(t => t.startsWith('✓')).length,
        unmet: lines.filter(t => t.startsWith('✗')).length,
        reasons: lines.filter(t => t.startsWith('✗')).filter(t => /—/.test(t)).length,
        lines,
    };
})()`;

async function main() {
    if (!existsSync(WEB_ROOT)) {
        fail(`artifact directory missing: ${WEB_ROOT}`);
        return;
    }
    const browser = findBrowser();
    if (!browser) {
        // Fail closed: no browser means the gate did not run, and a gate that
        // did not run must never read as green.
        fail('no Chrome/Chromium found (set CHROME_BIN) — the lab run did not happen');
        return;
    }
    say(`browser: ${browser}`);

    const server = await startServer();
    const port = server.address().port;
    const origin = `http://127.0.0.1:${port}`;
    say(`serving ${WEB_ROOT} at ${origin}`);

    // A throwaway profile: empty storage, so the first load seeds from the
    // StateEngine's own seed rather than from anything a previous run left.
    const profile = mkdtempSync(join(tmpdir(), 'rtp-ncalab-'));
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
        const waitForExpr = async (expression, what, timeoutMs = 15000) => {
            const deadline = Date.now() + timeoutMs;
            while (Date.now() < deadline) {
                try { if (await evaluate(expression)) return true; } catch { /* mid-navigation */ }
                await sleep(150);
            }
            throw new Error(`timed out waiting for ${what}`);
        };
        /** Activate a control the lab rendered, or fail naming the selector. */
        const activate = async (selector) => {
            const ok = await evaluate(`(() => {
                const el = document.querySelector(${JSON.stringify(selector)});
                if (!el) return false;
                el.click();
                return true;
            })()`);
            if (!ok) throw new Error(`the lab rendered no control matching ${selector}`);
            await sleep(80);   // let the async trace write settle
        };

        for (const lab of LABS) {
            say('');
            say(`## ${lab.id} — ${lab.title}`);

            // A full navigation per scenario. The StateEngine persists to
            // browser storage, so the lab's own Reset (below) is what
            // guarantees the seed — the navigation guarantees the page.
            await cdp.send('Page.navigate', { url: `${origin}/${START_PATH}` }, sessionId);
            await waitForExpr(
                `!!document.querySelector('.start-scenario-btn[data-id="${lab.id}"]')`,
                `${lab.id}'s Start button`);

            await activate(`.start-scenario-btn[data-id="${lab.id}"]`);
            await waitForExpr(`!!document.getElementById('nca-submit')`, `${lab.id}'s lab to render`);

            const label = await evaluate(
                `document.querySelector('.nca-page')?.textContent?.replace(/\\s+/g, ' ') || ''`);
            if (!label.includes('Simulated environment') || !label.includes('No real systems are contacted')) {
                fail(`${lab.id}: the rendered lab does not carry the REQ-SC-05 simulated-environment label`);
            } else {
                pass(`${lab.id}: the rendered lab labels the simulation (REQ-SC-05)`);
            }

            // ── Seed → incomplete (REQ-SC-02, REQ-SC-04) ──
            await activate('#nca-reset');
            await waitForExpr(`!!document.getElementById('nca-submit')`, `${lab.id} to re-render after reset`);
            await activate('#nca-submit');
            const seeded = await evaluate(EVIDENCE);
            if (!seeded) {
                fail(`${lab.id}: no evidence panel rendered`);
            } else if (seeded.total !== lab.objectives) {
                fail(`${lab.id}: evidence lists ${seeded.total} objectives, expected ${lab.objectives}`);
            } else if (seeded.met !== 0) {
                fail(`${lab.id}: ${seeded.met} objective(s) report complete on a fresh seed (REQ-SC-02)`);
            } else if (seeded.reasons !== seeded.unmet) {
                fail(`${lab.id}: ${seeded.unmet - seeded.reasons} unmet objective(s) name no reason (REQ-SC-04): `
                    + seeded.lines.join(' | '));
            } else {
                pass(`${lab.id}: fresh seed leaves all ${lab.objectives} objectives unmet, each with a reason`);
            }

            // ── Act → complete (REQ-SC-03) ──
            for (const selector of lab.actions) await activate(selector);
            await activate('#nca-submit');
            const solved = await evaluate(EVIDENCE);
            if (!solved) {
                fail(`${lab.id}: no evidence panel rendered after answering`);
            } else if (solved.unmet !== 0 || solved.met !== lab.objectives) {
                fail(`${lab.id}: the recorded walkthrough left ${solved.unmet} objective(s) unmet: `
                    + solved.lines.join(' | '));
            } else {
                pass(`${lab.id}: the recorded walkthrough completes all ${lab.objectives} objectives`);
            }
            // The completion toast is the UI-visible half of REQ-SC-03 — it is
            // what a learner sees, and it fires only on a fully met scenario.
            const toasted = await evaluate(
                `!!document.querySelector('#toast-container .toast.success')`);
            if (!toasted) fail(`${lab.id}: no completion toast fired on a fully met scenario`);
            else pass(`${lab.id}: completion fires its success toast`);

            // ── Reset → seed again (REQ-SC-06) ──
            await activate('#nca-reset');
            await waitForExpr(`!!document.getElementById('nca-submit')`, `${lab.id} to re-render after reset`);
            const after = await evaluate(EVIDENCE);
            if (!after) {
                fail(`${lab.id}: no evidence panel rendered after reset`);
            } else if (after.met !== 0) {
                fail(`${lab.id}: ${after.met} objective(s) still complete after reset (REQ-SC-06)`);
            } else {
                pass(`${lab.id}: reset restores the seed and the objectives fail again`);
            }
            if (lab.id === 'nca-maint-01') {
                const order = await evaluate(
                    `document.querySelectorAll('#nca-order-list li').length`);
                if (order !== 0) fail(`${lab.id}: the built order survived the reset (${order} step(s) left)`);
                else pass(`${lab.id}: reset clears the built order`);
            }
        }

        // Console must be clean across the whole run. A 404 on a script or a
        // throwing handler lands here.
        say('');
        if (consoleErrors.length) {
            fail(`console errors: ${consoleErrors.join(' | ')}`);
        } else {
            pass('zero console errors, uncaught exceptions, or failed requests across all three labs');
        }
    } catch (e) {
        fail(e.message);
    } finally {
        cdp?.close();
        proc.kill('SIGKILL');
        server.close();
        rmSync(profile, { recursive: true, force: true });
        if (failures.length && stderr) say(`browser stderr (tail): ${stderr.slice(-600)}`);
    }
}

await main();

say('');
say(failures.length === 0
    ? 'NCA LAB: PASS — all three decision labs render, fail from the seed, complete when driven, and reset'
    : `NCA LAB: FAIL — ${failures.length} problem(s)`);

const out = process.env.NCA_LAB_LOG_OUT;
if (out) {
    writeFileSync(out, `# NCA lab browser log (T-35 / S48-05)\n\n\`\`\`\n${log.join('\n')}\n\`\`\`\n`);
    process.stdout.write(`[nca-lab] wrote log to ${out}\n`);
}

process.exit(failures.length === 0 ? 0 : 1);
