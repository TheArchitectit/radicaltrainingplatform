/**
 * The hamburger-overlay section of the web accessibility gate
 * (tests/e2e/a11y-web.mjs, S35-07).
 */
import { ROUTES, PER_RULE_CAP, fail, pass, say } from './config.mjs';
import { AUDIT_EXPR } from './page-audit.mjs';
import { sleep } from './cdp.mjs';

export async function auditHamburgerOverlay({ navigate, evaluate, waitForExpr }) {
    // ── The hamburger overlay (S35-07) ──
    // This is the primary navigation surface on Prism Element routes and it
    // exists only while open, so the per-route audit above never sees it.
    // Opening it also makes the breadcrumb and the overlay two visible
    // `<nav>` landmarks, which is the condition under which they have to be
    // told apart by name.
    say('');
    say('hamburger overlay (PE navigation):');
    await navigate(ROUTES[0]);
    await evaluate(`document.getElementById('hamburger-btn').click()`);
    await waitForExpr(
        `!document.getElementById('hamburger-overlay').hasAttribute('inert')`,
        'the hamburger overlay to open');
    const overlayResult = await evaluate(AUDIT_EXPR);
    const overlayFindings = (overlayResult?.violations || [])
        .filter((v) => v.rule === 'contrast' || v.rule === 'landmark-named' || v.rule === 'control-name');
    if (!overlayFindings.length) {
        pass('the open overlay is a named landmark with no contrast findings');
    } else {
        for (const v of overlayFindings.slice(0, PER_RULE_CAP * 2)) {
            fail(`${v.rule} @ open hamburger overlay: ${v.detail}`);
        }
    }
    // Closing it must take it out of the tab order again, not merely hide it.
    await evaluate(`document.getElementById('hamburger-btn').click()`);
    await sleep(200);
    const closedReachable = await evaluate(
        `(() => { const o = document.getElementById('hamburger-overlay');`
        + ` if (o.hasAttribute('inert')) return false;`
        + ` const cs = getComputedStyle(o);`
        + ` return cs.display !== 'none' && cs.visibility !== 'hidden'; })()`);
    if (closedReachable) fail('the closed hamburger overlay is still reachable (not inert and still rendered)');
    else pass('the closed hamburger overlay is inert and out of the tab order');
}
