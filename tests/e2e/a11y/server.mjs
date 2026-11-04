/**
 * Static server and browser discovery for the web accessibility gate
 * (tests/e2e/a11y-web.mjs).
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { WEB_ROOT, MIME } from './config.mjs';

// ── Static server over the exact artifact that would be published ──

export function startServer() {
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

export function findBrowser() {
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
