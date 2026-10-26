/**
 * TM-45 demo sweep report (T-21, REQ-DEMO-02/05).
 *
 * Failing side this fixture names: before T-21 there was no report that
 * named each scenario and its demo-mode result. "All scenarios work in demo
 * mode" was a claim with no artifact behind it — nothing enumerated the
 * catalog, nothing drove each scenario from a fresh station to completion,
 * and nothing would have gone red if one scenario silently started
 * auto-passing or stopped being solvable.
 *
 * For every scenario in the catalog this fixture:
 *   1. resets the demo station (fresh seed, empty trace),
 *   2. evaluates it — it MUST report incomplete, and
 *   3. runs its recorded walkthrough — it MUST then report complete.
 * Any scenario that is complete on a fresh station, or still incomplete
 * after its walkthrough, fails the fixture and is named.
 *
 * The report itself is printed to stdout. Set DEMO_SWEEP_OUT to a path to
 * also write it to disk (used to produce the committed evidence file under
 * docs/qa/release-evidence/).
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';
import { writeFileSync } from 'node:fs';

const dom = installDom();
const runner = makeRunner();

const { state, evalScenario, runWalkthrough } =
    await import('./lib/scenario-walkthroughs.mjs');
const { progress } = await import('../../../RadicalTrainingPlatform.Web/js/core/ProgressStore.js');
const { demo } = await import('../../../RadicalTrainingPlatform.Web/js/core/DemoMode.js');
const { SCENARIOS } = await import('../../../RadicalTrainingPlatform.Web/js/views/scenarios.js');

/**
 * The catalog holds 44 pre-existing scenarios, the 2 CompTIA ticket scenarios
 * built in Sprint 46, the 4 NCA beginner scenarios the plan's "44 + 6"
 * counted, and — as of the 2026-10-26 content pass — the address-conflict
 * ticket (aplus-ipconf-01). This report pins the count at 51 and names every
 * one of them. The pin is the point: if a scenario is added or silently
 * dropped, this report goes red rather than quietly reporting a different
 * catalog than the one it claims.
 */
const EXPECTED_PRESENT = 51;
const NCA_IDS = ['nca-tool-01', 'nca-vm-01', 'nca-maint-01', 'nca-alert-01'];

const rows = [];

await runner.test('every scenario boots incomplete on a fresh demo station', async () => {
    await progress.init();
    await demo.enter(SCENARIOS);
    assertEqual(SCENARIOS.length, EXPECTED_PRESENT,
        `expected ${EXPECTED_PRESENT} scenarios in the catalog, found ${SCENARIOS.length}`);

    const autoPass = [];
    for (const s of SCENARIOS) {
        await demo.resetStation(SCENARIOS);
        const results = evalScenario(s);
        const passed = results.filter(r => r.passed);
        rows.push({
            id: s.id,
            exam: s.exam,
            title: s.title,
            objectives: results.length,
            incomplete: passed.length === 0 ? 'incomplete (0 of ' + results.length + ' met)'
                : `ALREADY COMPLETE (${passed.length} of ${results.length} met)`,
            complete: null,
        });
        if (passed.length > 0) autoPass.push(`${s.id} (${passed.map(p => p.id).join(', ')})`);
    }
    assertEqual(autoPass.join(' | ') || '(none)', '(none)',
        `scenarios that are already complete on a fresh demo station: ${autoPass.join(' | ')}`);
});

await runner.test('every scenario reaches complete after its walkthrough', async () => {
    const failures = [];
    for (const s of SCENARIOS) {
        const row = rows.find(r => r.id === s.id);
        await demo.resetStation(SCENARIOS);
        try {
            await runWalkthrough(s);
        } catch (e) {
            row.complete = `NO WALKTHROUGH (${e.message})`;
            failures.push(`${s.id}: ${e.message}`);
            continue;
        }
        const results = evalScenario(s);
        const open = results.filter(r => !r.passed);
        row.complete = open.length === 0
            ? `complete (${results.length} of ${results.length} met)`
            : `STILL INCOMPLETE (${open.length} open: ${open.map(o => `${o.id} — ${o.unmet.join('; ')}`).join(' | ')})`;
        if (open.length > 0) failures.push(`${s.id}: ${open.map(o => o.id).join(', ')}`);
    }
    assertEqual(failures.join(' | ') || '(none)', '(none)',
        `scenarios that never complete in demo mode: ${failures.join(' | ')}`);
});

await runner.test('the report names every scenario and both of its results', async () => {
    assertEqual(rows.length, SCENARIOS.length, 'every scenario must appear in the report');
    const ids = new Set(rows.map(r => r.id));
    assertEqual(ids.size, rows.length, 'a scenario must not appear twice');
    for (const row of rows) {
        assert(/^incomplete \(0 of \d+ met\)$/.test(row.incomplete),
            `${row.id}: fresh-station result must read "incomplete", got "${row.incomplete}"`);
        assert(/^complete \(\d+ of \d+ met\)$/.test(row.complete),
            `${row.id}: post-walkthrough result must read "complete", got "${row.complete}"`);
    }
});

await runner.test('a scenario that auto-passes on a fresh station is caught, not reported green', async () => {
    // Falsification of the check above: a scenario whose validator always
    // passes must be named, not silently counted as a pass.
    const alwaysPass = [{
        id: 'always-pass-01', exam: 'TEST', title: 'always passes',
        fixtureSeed: 999, renderer: 'store',
        objectives: [{ id: 'obj-1', text: 'nothing', validate: () => ({ passed: true, unmetConditions: [] }) }],
    }];
    await demo.resetStation(alwaysPass);
    const results = evalScenario(alwaysPass[0]);
    const passed = results.filter(r => r.passed);
    assertEqual(passed.length, 1,
        'the always-pass probe must be visible to the same check the sweep uses');
});

function buildReport() {
    const lines = [];
    lines.push('# TM-45 demo-mode scenario sweep report');
    lines.push('');
    lines.push('Generated by `tests/gates/web/demo-sweep-report.mjs` (T-21, S47-03).');
    lines.push('');
    // Provenance placeholder. The fixture must not shell out to git, so the
    // release-evidence step substitutes these three lines in place; a report
    // committed with `(unset)` says plainly that its head is unknown rather
    // than implying a commit it was not generated from.
    lines.push('generated: (unset)');
    lines.push('head: (unset)');
    lines.push('branch: (unset)');
    lines.push('');
    lines.push('Every scenario is driven from a fresh demo station (reset → reseed) and must');
    lines.push('report incomplete, then complete after its recorded walkthrough.');
    lines.push('');
    lines.push(`Scenarios in the catalog: **${rows.length}**`);
    lines.push('');
    lines.push('The OpenSpec package counts "44 existing + 6 new": the 2 Sprint 46 CompTIA');
    lines.push('ticket scenarios plus the 4 NCA beginner scenarios (S48-05, T-35). The');
    lines.push('2026-10-26 content pass added a third CompTIA ticket (aplus-ipconf-01, an');
    lines.push(`address conflict). The count is ${rows.length}, and every one of them is`);
    lines.push('driven below. Nothing is deferred from this catalog.');
    lines.push('');
    lines.push('| # | Scenario ID | Exam | Objectives | Fresh station | After walkthrough |');
    lines.push('|---|-------------|------|-----------:|---------------|-------------------|');
    rows.forEach((r, i) => {
        lines.push(`| ${i + 1} | \`${r.id}\` | ${r.exam} | ${r.objectives} | ${r.incomplete} | ${r.complete} |`);
    });
    lines.push('');
    lines.push('## Not covered by this report');
    lines.push('');
    lines.push('- Real-browser behaviour (keyboard, projector legibility, hover affordances):');
    lines.push('  asserted statically and by the shell fixtures, not by this headless sweep.');
    lines.push('- Whether the lesson text that names each scenario actually links to it:');
    lines.push('  asserted by the content gates, not here. This report covers the catalog');
    lines.push('  and its demo-mode solvability only.');
    return lines.join('\n') + '\n';
}

await runner.test('the report is well-formed and complete', async () => {
    const text = buildReport();
    for (const row of rows) {
        assert(text.includes(`\`${row.id}\``), `the report must name ${row.id}`);
    }
    // The four NCA scenarios are in this build (S48-05) — the report must name
    // them as present rather than as a deferral.
    for (const id of NCA_IDS) {
        assert(text.includes(`\`${id}\``), `the report must name the NCA scenario ${id}`);
    }
    assert(text.includes('Nothing is deferred from this catalog.'),
        'the report must state the catalog is complete');
    // Anchor at line start so the objectives-count column cannot match too.
    assertEqual(text.match(/^\| [0-9]+ \|/gm)?.length, rows.length,
        'the report table must have one row per scenario');
    process.stdout.write('\n' + text);
    const out = process.env.DEMO_SWEEP_OUT;
    if (out) {
        writeFileSync(out, text);
        process.stdout.write(`[demo-sweep] wrote report to ${out}\n`);
    }
});

process.exit(runner.done('demo-sweep-report fixture'));
