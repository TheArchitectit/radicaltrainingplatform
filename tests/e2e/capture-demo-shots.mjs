#!/usr/bin/env node
/**
 * Demo-path screenshot capture (T-28 / S47-12).
 *
 * What this is for: T-28 asks for screenshots/video captured as backup
 * evidence, and for the non-AI backup path rehearsed (REQ-AI-07). The backup
 * path is the recorded-example tutor: if the tutor segment fails on the day,
 * the presenter shows these frames instead. A backup that lives only on one
 * workstation is not a backup, so the frames are written into the release
 * evidence directory and committed with the record.
 *
 * What it captures: the seven named critical flows (PKG:141) as the presenter
 * would see them, plus the recorded-example tutor panel and the demo-mode reset
 * report. Every frame is taken from the artifact the demo serves
 * (RadicalTrainingPlatform.Web/), not a rebuild.
 *
 * What it is NOT: a measurement of projector readability. These are headless
 * renders at a fixed viewport. The viewport is recorded in the log so a reader
 * can judge the claim, and nothing here says anything about legibility at
 * distance — that is T-26's manual half and remains unverified.
 *
 * Zero npm dependencies: the repo has no package.json, and Node's global
 * WebSocket (Node >= 22) speaks CDP directly.
 *
 * Env:
 *   CHROME_BIN           path to the browser (else PATH is searched)
 *   SHOTS_WEB_ROOT       artifact directory to serve (default: the repo's Web dir)
 *   SHOTS_OUT            directory to write PNGs into
 *   SHOTS_WIDTH/SHOTS_HEIGHT  viewport (default 1440x900)
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync, existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const WEB_ROOT = resolve(process.env.SHOTS_WEB_ROOT || 'RadicalTrainingPlatform.Web');
const OUT_DIR = resolve(process.env.SHOTS_OUT || 'docs/qa/release-evidence/2026-10-23-demo-shots');
const WIDTH = parseInt(process.env.SHOTS_WIDTH || '1440', 10);
const HEIGHT = parseInt(process.env.SHOTS_HEIGHT || '900', 10);

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
function say(line) { log.push(line); process.stdout.write(line + '\n'); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

function findBrowser() {
    const candidates = [
        process.env.CHROME_BIN,
        '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium', '/usr/bin/chromium-browser',
        '/snap/bin/chromium',
    ].filter(Boolean);
    for (const c of candidates) if (existsSync(c)) return c;
    for (const name of ['google-chrome', 'chromium', 'chromium-browser', 'chrome']) {
        for (const dir of (process.env.PATH || '').split(':')) {
            const full = join(dir, name);
            if (dir && existsSync(full)) return full;
        }
    }
    return null;
}

// ── Minimal CDP client (same shape as rehearsal-web.mjs) ──

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

async function main() {
    if (!existsSync(WEB_ROOT)) throw new Error(`artifact directory missing: ${WEB_ROOT}`);
    const browser = findBrowser();
    if (!browser) throw new Error('no Chrome/Chromium found (set CHROME_BIN) — no frames captured');

    mkdirSync(OUT_DIR, { recursive: true });
    say(`browser: ${browser}`);
    say(`viewport: ${WIDTH}x${HEIGHT} (headless, fixed — NOT a projector measurement)`);

    const server = await startServer();
    const origin = `http://127.0.0.1:${server.address().port}`;
    say(`serving ${WEB_ROOT}`);
    say(`writing to ${OUT_DIR}`);

    const profile = mkdtempSync(join(tmpdir(), 'rtp-shots-'));
    const proc = spawn(browser, [
        '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
        '--disable-dev-shm-usage', '--remote-debugging-port=0',
        `--user-data-dir=${profile}`, 'about:blank',
    ], { stdio: ['ignore', 'ignore', 'pipe'] });

    let stderr = '';
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    let cdp;
    const shots = [];
    try {
        const devtoolsPort = await readDevToolsPort(profile);
        const version = await waitForHttp(`http://127.0.0.1:${devtoolsPort}/json/version`);
        cdp = await Cdp.connect(version.webSocketDebuggerUrl);

        const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
        const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });

        await cdp.send('Runtime.enable', {}, sessionId);
        await cdp.send('Page.enable', {}, sessionId);
        await cdp.send('Emulation.setDeviceMetricsOverride',
            { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false }, sessionId);

        const evaluate = async (expression) => {
            const r = await cdp.send('Runtime.evaluate',
                { expression, returnByValue: true, awaitPromise: true }, sessionId);
            if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
            return r.result.value;
        };

        const goto = async (hash) => {
            await evaluate(`location.hash = ${JSON.stringify(hash)}`);
            await sleep(900);
        };

        const waitFor = async (expression, what, timeoutMs = 15000) => {
            const deadline = Date.now() + timeoutMs;
            while (Date.now() < deadline) {
                try { if (await evaluate(expression)) return; } catch { /* mid-navigation */ }
                await sleep(150);
            }
            throw new Error(`timed out waiting for ${what}`);
        };

        /**
         * Shoot one frame. The file name carries the ordinal so the reading
         * order in the record matches the demo order.
         */
        const shot = async (name, what) => {
            const { data } = await cdp.send('Page.captureScreenshot',
                { format: 'png', captureBeyondViewport: false }, sessionId);
            const file = `${String(shots.length + 1).padStart(2, '0')}-${name}.png`;
            writeFileSync(join(OUT_DIR, file), Buffer.from(data, 'base64'));
            const bytes = readFileSync(join(OUT_DIR, file)).length;
            shots.push({ file, what, bytes });
            say(`  shot ${file} (${(bytes / 1024).toFixed(0)} KB) — ${what}`);
        };

        // 1 — boot / track picker
        await cdp.send('Page.navigate', { url: `${origin}/index.html#/tracks` }, sessionId);
        await waitFor(`document.querySelector('#view-container')?.children.length > 0`, 'boot');
        await shot('track-picker', 'boot: the track picker at #/tracks');

        // 2 — a track page
        await goto('#/tracks/track-aplus');
        await waitFor(`document.querySelector('.study-title')`, 'the A+ track page');
        await shot('track-aplus', 'track picker: the A+ track with its released lessons');

        // 3 — lesson reader
        const lessonHash = await evaluate(`(() => {
            const a = [...document.querySelectorAll('a[href]')]
                .find(e => (e.getAttribute('href') || '').includes('/lessons/'));
            return a ? a.getAttribute('href') : null;
        })()`);
        if (!lessonHash) throw new Error('no released lesson link on the track page');
        await goto(lessonHash);
        await waitFor(`document.querySelector('.lesson-body')`, 'the lesson reader');
        await shot('lesson', 'lesson: a released lesson with the REQ-BRAND-02 disclaimer');

        // 4 — practice question, then graded feedback. The practice entry point
        //     is on the lesson reader ("Practice this exam ›"), not the track
        //     page, so this stays where shot 3 left off.
        const practiceHash = await evaluate(`(() => {
            const a = [...document.querySelectorAll('a[href]')]
                .find(e => (e.getAttribute('href') || '').startsWith('#/practice/'));
            return a ? a.getAttribute('href') : null;
        })()`);
        if (!practiceHash) throw new Error('no practice link on the lesson reader');
        await goto(practiceHash);
        await waitFor(`document.querySelector('.option-row')`, 'a practice question');
        await shot('practice-question', 'practice: an unsubmitted question in a scored set');

        await evaluate(`document.querySelector('.option-row[data-letter="A"]').click()`);
        await sleep(250);
        await evaluate(`document.getElementById('practice-submit').click()`);
        await sleep(900);
        await waitFor(`document.querySelector('#practice-feedback .verdict')`, 'graded feedback');
        await shot('practice-graded', 'practice: the graded verdict and rationale after submit');

        // 5 — scenario ticket lab (reached by hash: the nav item has no href,
        //     the REQ-DEMO-05 gap S47-10 recorded)
        await goto('#/pc/scenarios');
        await waitFor(`document.querySelector('.start-scenario-btn[data-id="aplus-dns-01"]')`,
            'the scenario list');
        await shot('scenario-list', 'scenario: the scenario list');

        await evaluate(
            `document.querySelector('.start-scenario-btn[data-id="aplus-dns-01"]').click()`);
        await sleep(900);
        await waitFor(`document.getElementById('ticket-cfg-dns')`, 'the ticket lab');
        await shot('scenario-ticket', 'scenario: the aplus-dns-01 ticket lab, unsubmitted');

        // The ticket's actionable controls (the fixed diagnostic set, the
        // resolution note, Submit) sit below the fold at this viewport, and
        // completing the ticket is the demo's centrepiece — so capture the
        // working end of the page, and then the resolved state.
        await evaluate(`document.getElementById('ticket-submit')
            .scrollIntoView({ block: 'end' })`);
        await sleep(400);
        await shot('scenario-ticket-controls',
            'scenario: the fixed diagnostic set, resolution note and Submit');

        // Complete it the way the demo does: correct DNS, both required
        // diagnostics, a note, then Submit.
        //
        // The config field and the diagnostic checkboxes both bind on `change`
        // (ticket-lab.js afterRender), not `input` — a synthetic `input` event
        // updates the DOM value and commits nothing, so the validator still
        // reads the original config and the ticket stays unresolved.
        await evaluate(`(() => {
            const dns = document.getElementById('ticket-cfg-dns');
            dns.value = '10.42.100.10';
            dns.dispatchEvent(new Event('change', { bubbles: true }));
            for (const id of ['ping-ip', 'nslookup']) {
                const box = document.querySelector('input[type="checkbox"][data-test="' + id + '"]');
                box.checked = true;
                box.dispatchEvent(new Event('change', { bubbles: true }));
            }
            const note = document.getElementById('ticket-note');
            note.value = 'DNS server was pointed at 10.42.100.99 instead of the site resolver.';
            note.dispatchEvent(new Event('change', { bubbles: true }));
        })()`);
        await sleep(500);
        await evaluate(`document.getElementById('ticket-submit').click()`);
        await sleep(900);
        const verdict = await evaluate(
            `document.querySelector('#ticket-evidence .verdict')?.textContent.trim() || null`);
        if (!verdict) throw new Error('the ticket produced no verdict after submit');
        say(`  (ticket verdict: ${JSON.stringify(verdict.slice(0, 80))})`);
        await evaluate(`document.getElementById('ticket-evidence')
            .scrollIntoView({ block: 'center' })`);
        await sleep(400);
        await shot('scenario-resolved', 'scenario: the completed ticket and its validation verdict');

        // 6 — demo mode and the reset report
        await goto('#/demo');
        await waitFor(`document.getElementById('demo-enter')`, 'the demo controls');
        await shot('demo-controls', 'reset: the demo controls before entering demo mode');
        await evaluate(`document.getElementById('demo-enter').click()`);
        await sleep(700);
        await evaluate(`document.getElementById('demo-reset').click()`);
        await sleep(1400);
        await waitFor(`document.getElementById('demo-report')`, 'the reseed report');
        await shot('demo-reset', 'reset: the reseed verification report between groups');

        // 7 — the non-AI backup path: the recorded-example tutor panel
        await goto('#/tutor/COMPTIA-A-1201');
        await waitFor(`document.getElementById('tutor-mode')`, 'the tutor panel');
        const mode = await evaluate(`document.getElementById('tutor-mode').textContent.trim()`);
        if (mode !== 'recorded example') {
            throw new Error(`the tutor panel is not in recorded mode (mode reads ${JSON.stringify(mode)})`);
        }
        // Ask one of the two demo prompts so the frame shows a real recorded
        // answer, not an empty panel. ans-01 is the A+ demo prompt.
        await evaluate(`(() => {
            const q = document.getElementById('tutor-question');
            q.value = 'The website works by IP address but not by name. Give me one hint, not the answer.';
            q.dispatchEvent(new Event('input', { bubbles: true }));
        })()`);
        await sleep(200);
        await evaluate(`document.getElementById('tutor-ask').click()`);
        await sleep(1200);
        await shot('tutor-recorded', 'backup path: the recorded-example tutor answering a demo prompt');
    } finally {
        cdp?.close();
        proc.kill('SIGKILL');
        server.close();
        try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 120 }); }
        catch { /* a failed cleanup must not mask the capture result */ }
    }

    if (stderr.trim()) {
        say('');
        say('browser stderr (tail):');
        say(stderr.trim().split('\n').slice(-3).join('\n'));
    }
    say('');
    say(`CAPTURED ${shots.length} frame(s)`);
}

main().catch((e) => {
    say(`CAPTURE FAILED: ${e.message}`);
    process.exit(1);
});
