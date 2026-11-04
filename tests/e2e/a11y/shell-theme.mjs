/**
 * The theme sections of the web accessibility gate
 * (tests/e2e/a11y-web.mjs, S35-04 / S35-05): light-theme contrast, system
 * theme detection, and an explicit choice overriding the OS.
 */
import { ROUTES, PER_RULE_CAP, fail, pass, say, findings } from './config.mjs';
import { AUDIT_EXPR } from './page-audit.mjs';

export async function auditLightTheme({ navigate, evaluate }) {
    // ── Light theme must also meet AA (S35-04) ──
    // Chosen through the app's own ThemeToggle rather than by setting the
    // attribute, so this also proves the toggle persists a choice.
    say('');
    say('light theme contrast (S35-04):');
    await navigate(ROUTES[0]);
    await evaluate(`(async () => { const m = await import('/js/components/ThemeToggle.js');`
        + ` m.setTheme('light'); return true; })()`);
    for (const route of ROUTES) {
        await navigate(route);
        const theme = await evaluate(`document.documentElement.getAttribute('data-theme')`);
        if (theme !== 'light') {
            fail(`${route}: chose the light theme but the page rendered ${JSON.stringify(theme)}`);
        }
        const result = await evaluate(AUDIT_EXPR);
        const contrast = (result?.violations || []).filter((v) => v.rule === 'contrast');
        findings.total += contrast.length;
        if (!contrast.length) {
            pass(`${route} (light) — no contrast findings`);
        } else {
            for (const v of contrast.slice(0, PER_RULE_CAP)) {
                fail(`contrast (light) @ ${route}: ${v.detail}`);
            }
            if (contrast.length > PER_RULE_CAP) {
                say(`  ... contrast (light) @ ${route}: +${contrast.length - PER_RULE_CAP} more not shown`);
            }
        }
    }
}

export async function auditSystemTheme({ navigate, evaluate, send }) {
    // ── System theme detection (S35-05) ──
    // The stored choice must be absent for the OS to be consulted at all,
    // so it is cleared before every document in this section.
    say('');
    say('system theme detection (S35-05):');
    const cleared = await send('Page.addScriptToEvaluateOnNewDocument', {
        source: `try { localStorage.removeItem('nutanix-lab-theme'); } catch (e) {}`,
    });
    for (const preference of ['light', 'dark']) {
        await send('Emulation.setEmulatedMedia', {
            features: [{ name: 'prefers-color-scheme', value: preference }],
        });
        await navigate(ROUTES[0]);
        const theme = await evaluate(`document.documentElement.getAttribute('data-theme')`);
        if (theme === preference) {
            pass(`with no stored choice and prefers-color-scheme: ${preference}, the app renders ${preference}`);
        } else {
            fail(`with no stored choice and prefers-color-scheme: ${preference}, `
                + `the app renders ${JSON.stringify(theme)}`);
        }
    }
    await send('Page.removeScriptToEvaluateOnNewDocument',
        { identifier: cleared.identifier });
}

export async function auditExplicitChoice({ navigate, evaluate, send }) {
    // ── An explicit choice must beat the OS ──
    say('');
    say('explicit choice over the OS:');
    await navigate(ROUTES[0]);
    await evaluate(`(async () => { const m = await import('/js/components/ThemeToggle.js');`
        + ` m.setTheme('dark'); return true; })()`);
    await send('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-color-scheme', value: 'light' }],
    });
    await navigate(ROUTES[0]);
    const kept = await evaluate(`document.documentElement.getAttribute('data-theme')`);
    if (kept === 'dark') pass('an explicit dark choice overrides prefers-color-scheme: light');
    else fail(`an explicit dark choice was overridden by prefers-color-scheme: light (got ${JSON.stringify(kept)})`);
    await send('Emulation.setEmulatedMedia', { features: [] });
}
