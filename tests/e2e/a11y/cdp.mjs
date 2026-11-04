/**
 * Minimal CDP client and browser-endpoint helpers for the web accessibility
 * gate (tests/e2e/a11y-web.mjs).
 *
 * Zero npm dependencies on purpose: the repo has no package.json, and a gate
 * that needs an install step is a gate that gets skipped. Node's global
 * WebSocket (Node >= 22) speaks CDP directly.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// ── Minimal CDP client ──

export class Cdp {
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

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function waitForHttp(url, timeoutMs = 15000) {
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
export async function readDevToolsPort(profileDir, timeoutMs = 15000) {
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
