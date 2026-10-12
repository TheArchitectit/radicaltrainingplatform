#!/usr/bin/env node
/**
 * Pages predeploy browser smoke (T-22, CI-03).
 *
 * Failing side this gate names: `pwa-deploy.yml` published
 * RadicalTrainingPlatform.Web/ with an import-resolution check and nothing
 * else. R-01 — a bad relative import in pe-reports.js — therefore shipped and
 * stayed broken in tree since June: the module graph failed, the PWA booted
 * to a blank shell, and no step in the pipeline could tell. A case-sensitive
 * import check catches that one class; only opening the built artifact in a
 * browser catches the rest (a throwing view, a missing asset, a 404 script).
 *
 * This script:
 *   1. serves RadicalTrainingPlatform.Web/ over a loopback static server,
 *   2. launches headless Chrome and drives it over the DevTools Protocol,
 *   3. navigates to a known route and waits for the router to render,
 *   4. completes one meaningful interaction (enter demo mode, reset the
 *      station, confirm the reseed verification report renders),
 *   5. fails on any console error, uncaught exception, or failed request.
 *
 * Zero npm dependencies on purpose: the repo has no package.json, and a gate
 * that needs an install step is a gate that gets skipped. Node's global
 * WebSocket (Node >= 22) speaks CDP directly.
 *
 * Env:
 *   CHROME_BIN   path to the browser (else PATH is searched)
 *   SMOKE_WEB_ROOT  artifact directory to serve (default: the repo's Web dir);
 *                   tests/gates/run_smoke_fixtures.sh points this at a
 *                   deliberately broken copy to prove the gate can fail
 *   SMOKE_LOG_OUT  write the smoke log to this path (archived for release)
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync, existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const WEB_ROOT = resolve(process.env.SMOKE_WEB_ROOT || 'RadicalTrainingPlatform.Web');
const KNOWN_ROUTE = '/pe/dashboard';
const START_PATH = `index.html#${KNOWN_ROUTE}`;

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

// ── Static server over the exact artifact that would be published ──

function startServer() {
    const server = createServer((req, res) => {
        const url = new URL(req.url, 'http://127.0.0.1');
        let pathname = decodeURIComponent(url.pathname);
        if (pathname === '/') pathname = '/index.html';
        // Refuse traversal: the gate serves the artifact, not the repo.
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
        const found = spawnSyncPath(name);
        if (found) return found;
    }
    return null;
}

function spawnSyncPath(name) {
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

// ── The smoke ──

const failures = [];

function fail(what) { failures.push(what); say(`  FAIL ${what}`); }
function pass(what) { say(`  PASS ${what}`); }

async function main() {
    if (!existsSync(WEB_ROOT)) {
        fail(`artifact directory missing: ${WEB_ROOT}`);
        return;
    }
    const browser = findBrowser();
    if (!browser) {
        // Fail closed: an unavailable browser means the gate did not run, and
        // a gate that did not run must never read as green.
        fail('no Chrome/Chromium found (set CHROME_BIN) — the smoke did not run');
        return;
    }
    say(`browser: ${browser}`);

    const server = await startServer();
    const port = server.address().port;
    const origin = `http://127.0.0.1:${port}`;
    say(`serving ${WEB_ROOT} at ${origin}`);

    const profile = mkdtempSync(join(tmpdir(), 'rtp-smoke-'));
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

        await cdp.send('Page.navigate', { url: `${origin}/${START_PATH}` }, sessionId);

        // The router must actually render a view — this is the R-01 shape: a
        // broken module graph leaves #view-container empty and the shell silent.
        await waitForExpr(
            `document.querySelector('#view-container')?.children.length > 0`,
            `the router to render ${KNOWN_ROUTE}`);
        const renderedRoute = await evaluate(`location.hash`);
        if (renderedRoute !== `#${KNOWN_ROUTE}`) fail(`route is ${renderedRoute}, expected #${KNOWN_ROUTE}`);
        else pass(`boots to ${KNOWN_ROUTE} with a rendered view`);

        const title = await evaluate(
            `document.querySelector('#view-container')?.textContent?.trim().length > 0`);
        if (!title) fail('the rendered view has no text content');
        else pass('the rendered view has content');

        // One meaningful interaction: enter demo mode, reset the station, and
        // confirm the reseed verification report actually renders in a browser.
        await evaluate(`location.hash = '#/demo'`);
        await waitForExpr(`!!document.getElementById('demo-enter')`, 'the demo controls to render');
        await evaluate(`document.getElementById('demo-enter').click()`);
        await waitForExpr(`!document.getElementById('demo-banner').hidden`,
            'the demo-mode label to appear');
        pass('entering demo mode shows the demo-mode label');

        await evaluate(`document.getElementById('demo-reset').click()`);
        await waitForExpr(
            `/reseed verification/i.test(document.getElementById('demo-report')?.textContent || '')`,
            'the reseed verification report');
        // The report must state an outcome, not just render a table: a
        // "n of m … all correct" line, or an explicit NOT-all-correct.
        const reportText = await evaluate(
            `document.getElementById('demo-report').textContent.replace(/\\s+/g, ' ')`);
        if (!/\d+\s*\/\s*\d+ scenarios reseeded/.test(reportText)) {
            fail(`the reseed report does not state how many scenarios reseeded: ${reportText.slice(0, 200)}`);
        } else if (!/all correct|NOT all correct/.test(reportText)) {
            fail(`the reseed report does not state a verification outcome: ${reportText.slice(0, 200)}`);
        } else {
            pass('station reset renders its reseed verification outcome');
        }

        await evaluate(`document.getElementById('demo-exit').click()`);
        await waitForExpr(`document.getElementById('demo-banner').hidden`,
            'the demo-mode label to clear on exit');
        pass('leaving demo mode clears the label');

        // Console must be clean. A 404 on a script or stylesheet lands here too.
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
        // Chrome keeps writing to its profile for a moment after SIGKILL, so an
        // immediate rmSync races it and throws ENOTEMPTY — measured on
        // tests/e2e/nca-lab-web.mjs, which shares this shape, on a run whose
        // every assertion had passed. A leftover temp directory is not a gate
        // failure: wait for the process to actually go, then remove best-effort
        // with retries.
        if (proc.exitCode === null && proc.signalCode === null) {
            await new Promise((done) => {
                proc.once('exit', done);
                setTimeout(done, 2000);   // never hang on a process that will not die
            });
        }
        // SIGKILL reaps the parent, not Chrome's zygote/GPU children, and they
        // hold the profile open a little longer. Retry until it goes rather
        // than leaving a ~4 MB directory behind on every run.
        for (let attempt = 0; attempt < 20; attempt++) {
            try {
                rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
                break;
            } catch {
                await sleep(250);
            }
        }
        if (failures.length && stderr) say(`browser stderr (tail): ${stderr.slice(-600)}`);
    }
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

await main();

say('');
say(failures.length === 0
    ? 'WEB SMOKE: PASS — the built artifact boots, renders, and completes a demo interaction with a clean console'
    : `WEB SMOKE: FAIL — ${failures.length} problem(s)`);

const out = process.env.SMOKE_LOG_OUT;
if (out) {
    writeFileSync(out, `# Web smoke log (T-22 / CI-03)\n\n\`\`\`\n${log.join('\n')}\n\`\`\`\n`);
    process.stdout.write(`[smoke] wrote log to ${out}\n`);
}

process.exit(failures.length === 0 ? 0 : 1);
