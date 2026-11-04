/**
 * Browser harness for the web accessibility gate (tests/e2e/a11y-web.mjs):
 * launch headless Chrome against the served artifact, attach over CDP, and
 * expose the few operations every section needs.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { WEB_ROOT, say, failures } from './config.mjs';
import { startServer } from './server.mjs';
import { Cdp, sleep, waitForHttp, readDevToolsPort } from './cdp.mjs';

/**
 * Serve the artifact and start the browser. The returned handle is mutated by
 * `attach` (it records the CDP connection under `.cdp`) and read by
 * `cleanup`, so the caller keeps a single object to tear down even when
 * `attach` throws part-way.
 */
export async function launch(browser) {
    const server = await startServer();
    const origin = `http://127.0.0.1:${server.address().port}`;
    say(`serving ${WEB_ROOT} at ${origin}`);

    const profile = mkdtempSync(join(tmpdir(), 'rtp-a11y-'));
    const proc = spawn(browser, [
        '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
        '--disable-dev-shm-usage', '--remote-debugging-port=0',
        `--user-data-dir=${profile}`, 'about:blank',
    ], { stdio: ['ignore', 'ignore', 'pipe'] });

    const handle = { server, origin, profile, proc, cdp: null, stderr: '' };
    proc.stderr.on('data', (d) => { handle.stderr += d.toString(); });
    return handle;
}

/** Connect over CDP and return the operations the gate drives. */
export async function attach(h) {
    const devtoolsPort = await readDevToolsPort(h.profile);
    const version = await waitForHttp(`http://127.0.0.1:${devtoolsPort}/json/version`);
    const cdp = await Cdp.connect(version.webSocketDebuggerUrl);
    h.cdp = cdp;

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
        }
    });

    await cdp.send('Runtime.enable', {}, sessionId);
    await cdp.send('Page.enable', {}, sessionId);
    // Headless Chrome does not consider its window focused, and an
    // unfocused window applies no `:focus-visible` and moves no focus on
    // Tab. Every focus assertion below depends on this.
    await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: true }, sessionId);

    const evaluate = async (expression) => {
        const r = await cdp.send('Runtime.evaluate',
            { expression, returnByValue: true, awaitPromise: true }, sessionId);
        if (r.exceptionDetails) {
            throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
        }
        return r.result.value;
    };
    const waitForExpr = async (expression, what, timeoutMs = 15000) => {
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
            try { if (await evaluate(expression)) return true; } catch { /* mid-navigation */ }
            await sleep(120);
        }
        throw new Error(`timed out waiting for ${what}`);
    };
    // Every target gets a unique query string. Without it, moving between
    // two hash routes is a *fragment* navigation: Chrome reuses the same
    // document, `initTheme` never re-runs, and an attribute set on the
    // previous route survives into the next — which is exactly how a first
    // version of this gate reported a `prefers-color-scheme` pass for an
    // app that has no system-theme support at all. The nonce forces a real
    // document load, which is also how a student arriving at a deep link
    // gets the page.
    let nonce = 0;
    const navigate = async (path) => {
        const i = path.indexOf('#');
        const url = `${h.origin}/${i === -1 ? `${path}?a11y=${++nonce}` : `${path.slice(0, i)}?a11y=${++nonce}${path.slice(i)}`}`;
        await cdp.send('Page.navigate', { url }, sessionId);
        await waitForExpr(
            `location.href === ${JSON.stringify(url)} && document.readyState === 'complete'`,
            `${path} to load`);
        // The app shell always has #view-container; a fixture page need not.
        if (await evaluate(`!!document.getElementById('view-container')`)) {
            await waitForExpr(
                `document.querySelector('#view-container').children.length > 0`,
                `the router to render ${path}`);
        }
        // One frame for the view's own afterRender work to settle.
        await sleep(120);
    };
    const pressKey = async (key, code, vk) => {
        for (const type of ['rawKeyDown', 'keyUp']) {
            await cdp.send('Input.dispatchKeyEvent', {
                type, key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk,
            }, sessionId);
        }
        await sleep(80);
    };

    return {
        cdp,
        sessionId,
        origin: h.origin,
        evaluate,
        waitForExpr,
        navigate,
        pressKey,
        consoleErrors,
        // Session-bound CDP call, for the theme section's media emulation.
        send: (method, params = {}) => cdp.send(method, params, sessionId),
    };
}

/** Tear everything down and, on failure, report the browser's stderr tail. */
export async function cleanup(h) {
    h.cdp?.close();
    h.proc.kill('SIGKILL');
    h.server.close();
    // Chrome keeps writing to its profile for a moment after SIGKILL, so an
    // immediate rmSync races it and throws ENOTEMPTY. A leftover temp
    // directory is not a gate failure: wait for the process to go, then
    // remove best-effort with retries.
    if (h.proc.exitCode === null && h.proc.signalCode === null) {
        await new Promise((done) => {
            h.proc.once('exit', done);
            setTimeout(done, 2000);   // never hang on a process that will not die
        });
    }
    for (let attempt = 0; attempt < 20; attempt++) {
        try {
            rmSync(h.profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
            break;
        } catch {
            await sleep(250);
        }
    }
    if (failures.length && h.stderr) say(`browser stderr (tail): ${h.stderr.slice(-600)}`);
}
