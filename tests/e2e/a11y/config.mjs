/**
 * Configuration and reporting state shared by the web accessibility gate
 * (tests/e2e/a11y-web.mjs).
 *
 * Everything in here is decided before the browser starts: which artifact tree
 * is served, which routes are audited, and how findings are recorded. Keeping
 * it in one module means the sweep and every shell section report through the
 * same `say`/`fail`/`pass` channel, so the output order is the call order and
 * the summary counts are the same counts wherever they were raised.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

export const WEB_ROOT = resolve(process.env.A11Y_WEB_ROOT || 'RadicalTrainingPlatform.Web');

// Every study surface a student can reach from the router. The PE/PC simulator
// screens are the bulk of the app but share the shell's chrome, which the
// routes below already exercise; the study routes are the ones the October
// demo runs and the ones Sprint 46/47 added.
//
// `/pc/clusters` and `/pc/vms` are here for a different reason: they are the
// two routes whose EntityTable is `selectable: true`, so they are the only
// coverage of the per-row checkbox and the per-row action button — the class of
// control that the audit found unnamed and that no amount of shell testing
// reaches. A component class covered on one route is covered.
export const DEFAULT_TARGETS = [
    'index.html#/pe/dashboard',
    'index.html#/tracks',
    'index.html#/tracks/track-nca',
    'index.html#/tracks/track-nca/lessons/NCA-75/s1_1',
    'index.html#/practice/NCA-75',
    'index.html#/demo',
    'index.html#/tutor',
    'index.html#/pc/scenarios',
    'index.html#/pc/clusters',
    'index.html#/pc/vms',
];

// Concrete instances of the app's parameterized routes. The router table names
// them as patterns (`/tracks/:trackId`), and the gate cannot invent a track id —
// so these are the one hand-maintained part of the route list. The content IDs
// are stable by contract (SPEC-16: never renumber or silently remap an existing
// content ID), so a failure here means content moved, which is worth knowing.
export const PARAMETERIZED_TARGETS = [
    'index.html#/tracks/track-nca',
    'index.html#/tracks/track-nca/lessons/NCA-75/s1_1',
    'index.html#/practice/NCA-75',
    'index.html#/tutor/NCA-75',
    // S37-03. The deck picker (/flashcards) is unparameterized and is picked up
    // from the router table; this is the review run it links into.
    'index.html#/flashcards/NCA-75',
];

/**
 * The click-reachable surface this gate drives: the create-VM wizard on the PE
 * VM list. The shared `Wizard` component sits behind a button on ~25 views, so
 * the per-route audit above never opens it — this is the route and the control
 * that do. The stub shell carries the same control id so the section can be
 * driven there too, and therefore broken there (SPEC-16 #4).
 */
export const WIZARD_ROUTE = '/pe/vms';
export const WIZARD_TRIGGER = 'create-vm-btn';

/**
 * The routes to audit, read from the app's own router table.
 *
 * A hand-written list is a coverage claim that drifts: every view added since it
 * was written is silently unaudited, and the gate keeps passing while its
 * surface shrinks. Reading `router.register(...)` out of `js/app.js` makes the
 * gate's surface the app's surface. Fixture roots have no `app.js`, so those
 * fall back to `DEFAULT_TARGETS` (and in practice set `A11Y_TARGETS` anyway).
 */
export function discoverTargets() {
    const appJs = join(WEB_ROOT, 'js/app.js');
    if (!existsSync(appJs)) {
        return { routes: DEFAULT_TARGETS, registered: [], covered: true, uncovered: [], unparsed: 0 };
    }
    const source = readFileSync(appJs, 'utf8');
    const registered = [...source.matchAll(/router\.register\(\s*'([^']+)'/g)].map((m) => m[1]);
    const routes = [
        ...registered.filter((p) => !p.includes(':')).map((p) => `index.html#${p}`),
        ...PARAMETERIZED_TARGETS,
    ];
    // Two ways a view can end up unaudited, and both are checked, because a
    // coverage claim that is only approximately true is not a coverage claim:
    //
    //   1. A registration this regex cannot see — a path held in a variable, a
    //      call spread over lines with the path on the next one. Counting the
    //      call sites catches it, because the parse found fewer paths than there
    //      are calls.
    //   2. A parameterized route with no concrete instance above, which would
    //      otherwise be dropped silently (the gate cannot invent a track id).
    const calls = (source.match(/router\.register\(/g) || []).length;
    const unparsed = calls - registered.length;
    const uncovered = registered.filter((p) => p.includes(':')
        && !PARAMETERIZED_TARGETS.some((t) => t.includes(p.slice(0, p.indexOf(':')))));
    return {
        routes,
        registered,
        covered: uncovered.length === 0 && unparsed === 0,
        uncovered,
        unparsed,
    };
}

export const TARGETS = (process.env.A11Y_TARGETS || '').split(',').map((s) => s.trim()).filter(Boolean);
export const DISCOVERY = discoverTargets();
export const ROUTES = TARGETS.length ? TARGETS : DISCOVERY.routes;

export const MIME = {
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

// At most this many findings of one rule on one target are printed; the total
// is always printed. Without a cap a missing focus indicator prints one line
// per focusable element and buries every other finding.
export const PER_RULE_CAP = 6;

export const log = [];
export function say(line) {
    log.push(line);
    process.stdout.write(line + '\n');
}

export const failures = [];

// Findings are printed capped (PER_RULE_CAP per rule per route) so one broken
// token cannot bury the run under 400 identical lines — but the headline must
// not be the printed count. It was: `failures.length` reported 1,095 for a tree
// that had 1,689 findings, because 594 sat behind "+N more not shown". A gate
// that under-reports its own findings reads as a gate that found less than it
// did, which is the same defect as a sweep covering fewer routes than it names.
// The true total is counted separately and both are reported.
//
// It lives in an object rather than a bare binding because the sweep and the
// shell sections all add to it; an exported `let` would be read-only to them.
export const findings = { total: 0 };

export function fail(what) { failures.push(what); say(`  FAIL ${what}`); }
export function pass(what) { say(`  PASS ${what}`); }
