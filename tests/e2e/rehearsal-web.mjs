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
 *
 * The flow bodies live in ./rehearsal/ (state, browser and driver layers plus
 * the two flow modules). This file is the runner: preflight, process + CDP
 * setup, flow dispatch in order, and the result summary.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { WEB_ROOT, FLOWS, log, say, failures, findings, fail, pass } from './rehearsal/state.mjs';
import {
    Cdp, findBrowser, readDevToolsPort, startServer, waitForHttp, watchConsole,
} from './rehearsal/browser.mjs';
import { createDriver } from './rehearsal/driver.mjs';
import {
    runBoot, runLesson, runPersistence, runPractice, runTrackPicker,
} from './rehearsal/flows-core.mjs';
import { runReset, runScenario } from './rehearsal/flows-demo.mjs';

// The exact string REQ-BRAND-02 requires, checked verbatim — a paraphrase is a
// different claim, and this one is the disclaimer the demo leans on. It stays
// here, beside the runner, so the normative text exists in one place; the
// lesson flow receives it as a parameter.
const DISCLAIMER =
    'This is independent study material. It is not official training and is not '
    + 'endorsed or approved by CompTIA, Nutanix, or any other certification body.';

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

        const consoleErrors = watchConsole(cdp, sessionId);

        await cdp.send('Runtime.enable', {}, sessionId);
        await cdp.send('Log.enable', {}, sessionId);
        await cdp.send('Page.enable', {}, sessionId);

        const d = createDriver(cdp, sessionId);

        await runBoot(d, origin);
        if (FLOWS.has(2)) await runTrackPicker(d);
        if (FLOWS.has(3)) await runLesson(d, DISCLAIMER);
        if (FLOWS.has(4)) await runPractice(d);
        if (FLOWS.has(5)) await runPersistence(d);
        if (FLOWS.has(6)) await runScenario(d);
        if (FLOWS.has(7)) await runReset(d);

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
