/**
 * Shared configuration and result state for the keyboard rehearsal.
 *
 * Split out of tests/e2e/rehearsal-web.mjs (T-26 / S47-10) so the runner, the
 * CDP layer and the flow modules all read the same env-derived values and
 * append to the same failure/finding lists. Import order matters only in that
 * this module reads REHEARSAL_WEB_ROOT and REHEARSAL_FLOWS once, at load time.
 */
import { resolve } from 'node:path';

const WEB_ROOT = resolve(process.env.REHEARSAL_WEB_ROOT || 'RadicalTrainingPlatform.Web');

const MIME = {
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

const log = [];
function say(line) {
    log.push(line);
    process.stdout.write(line + '\n');
}

const failures = [];
const findings = [];

// Optional flow scoping (REHEARSAL_FLOWS=1,2,3,4,7). This exists so
// tests/gates/run_rehearsal_fixtures.sh can exercise a genuinely green path on
// an UNMODIFIED copy of the artifact: the live tree is red on exactly two legs
// (the REQ-UI-04 cold-load note and the REQ-DEMO-05 scenario nav), and a
// fixture that could only ever observe failure would prove nothing about
// whether this harness can pass. Flow 1 is always run — it is the boot
// precondition every other leg builds on — and a scope that includes 4 or 5
// must include 1-3, which establish the route and the scored answer.
const ALL_FLOWS = [1, 2, 3, 4, 5, 6, 7];
const FLOWS = new Set(process.env.REHEARSAL_FLOWS
    ? process.env.REHEARSAL_FLOWS.split(',').map((s) => parseInt(s.trim(), 10)).filter(Number.isInteger)
    : ALL_FLOWS);

function fail(what) { failures.push(what); say(`  FAIL ${what}`); }
function pass(what) { say(`  PASS ${what}`); }
function note(what) { findings.push(what); say(`  NOTE ${what}`); }

export { WEB_ROOT, MIME, log, say, failures, findings, FLOWS, fail, pass, note };
