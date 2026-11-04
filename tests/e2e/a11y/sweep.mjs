/**
 * The per-route audit sweep for the web accessibility gate
 * (tests/e2e/a11y-web.mjs).
 */
import { ROUTES, DISCOVERY, PER_RULE_CAP, fail, pass, say, findings } from './config.mjs';
import { AUDIT_EXPR } from './page-audit.mjs';

/**
 * Navigate every route, run the in-page audit, and report. Returns once the
 * sweep and its coverage tripwires have run; a route that will not render is
 * one failure, not the end of the sweep.
 */
export async function sweepRoutes({ navigate, evaluate }) {
    // ── Per-route audit ──
    // A route that will not render must not end the sweep. It did: a single
    // `navigate` timeout threw out of this loop into the outer catch, the
    // remaining routes were never audited, and the run still printed a
    // summary as if it had covered them — 34 of 54 routes went unmeasured
    // while the gate looked like it had finished. A route that fails is now
    // one failure and the sweep continues; `routesAudited` is reported at
    // the end so a short sweep can never be mistaken for a clean one.
    let routesAudited = 0;
    for (const route of ROUTES) {
        try {
            await navigate(route);
        } catch (first) {
            // One retry. A route that renders on the second attempt is a
            // slow render, not an inaccessible page — `/pc/api` was observed
            // timing out once in a 54-route sweep and passing every other
            // time — and a gate that reds on a transient is a gate that gets
            // ignored. A route that fails twice is reported.
            try {
                await navigate(route);
            } catch (second) {
                fail(`${route}: did not render — ${second.message} (after a retry; `
                    + `first attempt: ${first.message})`);
                continue;
            }
        }
        const result = await evaluate(AUDIT_EXPR);
        routesAudited++;
        if (!result || !Array.isArray(result.violations)) {
            fail(`${route}: the audit returned no result (the page may not have rendered)`);
            continue;
        }
        findings.total += result.violations.length;
        const byRule = new Map();
        for (const v of result.violations) {
            if (!byRule.has(v.rule)) byRule.set(v.rule, []);
            byRule.get(v.rule).push(v.detail);
        }
        if (!result.violations.length) {
            pass(`${route} — no findings (${result.stats.textHosts} text runs, `
                + `${result.stats.focusables} focusable, ${result.stats.headings} headings)`);
            continue;
        }
        for (const [rule, details] of byRule) {
            const shown = details.slice(0, PER_RULE_CAP);
            const extra = details.length > shown.length
                ? ` (+${details.length - shown.length} more not shown)` : '';
            for (const d of shown) fail(`${rule} @ ${route}: ${d}`);
            if (extra) say(`  ... ${rule} @ ${route}:${extra}`);
        }
    }

    // Every route that was asked for must have been audited. This is the
    // tripwire for the abort above ever coming back in another form: a sweep
    // that quietly covers fewer routes than it was given is a gate reporting
    // on a smaller surface than the one it names. It sits immediately after
    // the sweep, before anything else can throw, so it is always reached.
    // …and every route the app registers must have been *in* the list to
    // begin with. Without this the discovery step could quietly miss a view
    // — a `router.register` written across two lines, a path built from a
    // variable — and the sweep would report full coverage of a list that
    // was never the app's.
    if (DISCOVERY.unparsed > 0) {
        fail(`${DISCOVERY.unparsed} router.register call(s) could not be parsed, so those `
            + 'views are not in the audit list — give each one a literal path string');
    }
    if (DISCOVERY.uncovered.length) {
        fail(`the gate's route list is missing ${DISCOVERY.uncovered.length} registered route(s) `
            + `— they would never be audited: ${DISCOVERY.uncovered.join(', ')}`);
    }

    if (routesAudited !== ROUTES.length) {
        fail(`${ROUTES.length - routesAudited} of ${ROUTES.length} routes were never audited `
            + '(the sweep did not cover what it was given)');
    } else {
        pass(`all ${ROUTES.length} routes rendered and were audited`);
    }
}
