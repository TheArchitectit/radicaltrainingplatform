/**
 * Static server, browser discovery and the minimal CDP client.
 *
 * Extracted verbatim from tests/e2e/rehearsal-web.mjs (T-26 / S47-10). Nothing
 * here knows about flows; the runner wires these pieces together and the flow
 * modules drive the resulting session through ./driver.mjs.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

import { MIME, WEB_ROOT } from './state.mjs';

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

/**
 * Collect uncaught exceptions, console.error entries and failed log entries
 * for the one attached session. Returns the array the runner reports on.
 */
function watchConsole(cdp, sessionId) {
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
    return consoleErrors;
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

export {
    startServer, findBrowser, onPath, Cdp, sleep, waitForHttp, readDevToolsPort,
    watchConsole, KEY, ACTIVE,
};
