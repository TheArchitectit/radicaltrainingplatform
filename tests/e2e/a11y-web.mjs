#!/usr/bin/env node
/**
 * Web accessibility gate (Sprints 35-36, S35-01..S35-07).
 *
 * Failing side this gate names: nothing in the repository measured the PWA's
 * accessibility. Sprint 25 built the foundation for the *desktop* Avalonia
 * client (AutomationPeers, live regions, focus indicators) and the Web PWA —
 * which is what the October demo actually runs — was never audited at all.
 * Measured on 2026-10-14, the shell had no `<h1>`, no skip link, unnamed icon
 * buttons, a toast container with no live region, a modal with no dialog
 * semantics or focus management, no `prefers-color-scheme` support, and header
 * text painted at 1.05:1 — dark-on-dark — because `.header-bar` and
 * `.pc-sidebar` use `--text-inverse`, a token the dark theme flips, on
 * backgrounds that stay dark in both themes.
 *
 * This script:
 *   1. serves RadicalTrainingPlatform.Web/ over a loopback static server,
 *   2. launches headless Chrome and drives it over the DevTools Protocol,
 *   3. opens every study route and runs an in-page WCAG 2.1 AA audit —
 *      contrast, accessible names, landmarks, heading order, skip link,
 *      live regions, image alternatives, focus indicators,
 *   4. drives the modal dialog through the keyboard to check role, name,
 *      initial focus, focus trap, Escape, and focus restore,
 *   5. opens the click-reachable create-VM wizard and runs the same dialog and
 *      contrast checks on it — the shared `Wizard` component has no route of its
 *      own, so it is invisible to step 3,
 *   6. repeats the contrast audit in the light theme and verifies that an
 *      explicit theme choice wins while an absent one follows the OS.
 *
 * Zero npm dependencies on purpose: the repo has no package.json, and a gate
 * that needs an install step is a gate that gets skipped. Node's global
 * WebSocket (Node >= 22) speaks CDP directly.
 *
 * What this gate does NOT check, so a green run is not read as more than it is:
 *   - **Only routes the router registers, plus one click-reachable surface.** The
 *     route list is read out of `js/app.js` rather than hand-written, and the
 *     gate fails if it cannot parse a registration or has no concrete instance
 *     for a parameterized route. It also opens the create-VM wizard, which has
 *     no route of its own — so the shared `Wizard` component is now measured
 *     rather than assumed. But that is *one* click-reachable surface: the
 *     confirm dialog, the hamburger overlay, the theme toggle and the wizard are
 *     driven; every other view-only interaction, and every drag-based one, is
 *     still never opened. Coverage of the *route table* is asserted; coverage of
 *     the *application* is not.
 *   - **Contrast is computed from solid `background-color` only.** An element
 *     painted over a gradient, an image, or a `backdrop-filter` layer is
 *     measured against the nearest solid ancestor colour, so a genuinely low
 *     ratio over a gradient would not be reported. This app uses solid fills;
 *     a future gradient would need this check revisited.
 *   - **Non-text contrast (WCAG 1.4.11) is not measured** — component
 *     boundaries and graphical objects are not classified here.
 *   - **Nothing about screen readers, switch access, or a real assistive
 *     technology.** This measures the DOM and the computed styles a screen
 *     reader reads *from*; it does not run one.
 *   - **No human has read the pages.** S35-01 asks for an auditor; this is the
 *     engine half of that audit, and the conformance report says so.
 *
 * Env:
 *   CHROME_BIN      path to the browser (else PATH is searched)
 *   A11Y_WEB_ROOT   artifact directory to serve (default: the repo's Web dir);
 *                   tests/gates/run_a11y_fixtures.sh points this at a
 *                   deliberately broken copy to prove the gate can fail
 *   A11Y_TARGETS    comma-separated paths to audit instead of the real routes
 *   A11Y_LOG_OUT    write the audit log to this path (archived as S35-01 evidence)
 */
import { existsSync, writeFileSync } from 'node:fs';
import { WEB_ROOT, findings, failures, log, say, fail, pass } from './a11y/config.mjs';
import { findBrowser } from './a11y/server.mjs';
import { launch, attach, cleanup } from './a11y/harness.mjs';
import { sweepRoutes } from './a11y/sweep.mjs';
import { auditDialog } from './a11y/shell-dialog.mjs';
import { auditHamburgerOverlay } from './a11y/shell-overlay.mjs';
import { auditWizard } from './a11y/shell-wizard.mjs';
import { auditRuntimeSemantics } from './a11y/shell-runtime.mjs';
import { auditLightTheme, auditSystemTheme, auditExplicitChoice } from './a11y/shell-theme.mjs';

// ── The audit ──
//
// The pieces live under ./a11y/: the route list and reporting state in
// config.mjs, the in-page rule set in page-audit.mjs, the browser driving in
// harness.mjs, the per-route sweep in sweep.mjs, and one module per shell
// section. This file owns the order they run in, because that order is the
// output the gate ships as its failing-side evidence.

async function main() {
    if (!existsSync(WEB_ROOT)) {
        fail(`artifact directory missing: ${WEB_ROOT}`);
        return;
    }
    const browser = findBrowser();
    if (!browser) {
        // Fail closed: an unavailable browser means the gate did not run, and
        // a gate that did not run must never read as green.
        fail('no Chrome/Chromium found (set CHROME_BIN) — the audit did not run');
        return;
    }
    say(`browser: ${browser}`);

    const h = await launch(browser);
    try {
        const client = await attach(h);
        const { evaluate } = client;

        await sweepRoutes(client);

        // ── The app shell only ──
        // Everything below drives the real shell: its Confirm.js dialog, its
        // ThemeToggle, its hamburger navigation. A fixture page is a plain
        // document with none of them, so these sections are skipped there and
        // the page-level audit above is the whole run. `#view-container` is
        // how the shell is recognised; every route of the real app has one.
        const isAppShell = await evaluate(`!!document.getElementById('view-container')`);
        if (isAppShell) {
            await auditDialog(client);
            await auditHamburgerOverlay(client);
            await auditWizard(client);
            await auditRuntimeSemantics(client);
            await auditLightTheme(client);
            await auditSystemTheme(client);
            await auditExplicitChoice(client);
        }

        // Console must be clean — a thrown view is an accessibility problem too.
        const realErrors = client.consoleErrors.filter((e) => !/favicon/i.test(e));
        if (realErrors.length) fail(`console errors: ${realErrors.join(' | ')}`);
        else pass('zero console errors or uncaught exceptions across every route');
    } catch (e) {
        fail(e.message);
    } finally {
        await cleanup(h);
    }
}

await main();

say('');
say(failures.length === 0
    ? 'A11Y WEB: PASS — every audited route meets the WCAG 2.1 AA checks this gate implements'
    : `A11Y WEB: FAIL — ${findings.total} finding(s)`
        + (findings.total > failures.length
            ? ` (${failures.length} printed, the rest behind the per-rule cap)` : ''));

const out = process.env.A11Y_LOG_OUT;
if (out) {
    writeFileSync(out, `# Web accessibility audit log (S35-01)\n\n\`\`\`\n${log.join('\n')}\n\`\`\`\n`);
    process.stdout.write(`[a11y] wrote log to ${out}\n`);
}

process.exit(failures.length === 0 ? 0 : 1);
