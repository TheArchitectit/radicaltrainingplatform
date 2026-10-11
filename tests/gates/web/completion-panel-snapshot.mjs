/**
 * Completion-panel snapshot fixture (T-21, REQ-DEMO-06).
 *
 * Failing side this fixture names: the pre-T-21 result panel rendered
 *   <h2>All Objectives Complete!</h2>
 *   <p>Great job! You've completed "…".</p>
 * with no statement of which conditions were met, no requested-vs-actual
 * comparison, and no action trace — and the incomplete branch said only
 * "Some objectives are not met." Nothing in it was a mastery claim, but
 * nothing in it told the truth either, and there was no list to enforce.
 *
 * This fixture renders every branch of the panel and asserts the standing
 * contract: conditions met/remaining are named, requested vs actual appears
 * per condition, the action trace appears, and no mastery / job-qualification
 * / certification-readiness claim appears anywhere. The forbidden list lives
 * in the module, so adding a claim there is enforced here immediately.
 */
import { makeRunner, assert, assertEqual } from './helpers.mjs';

const runner = makeRunner();

const {
    renderCompletionPanel,
    findForbiddenClaims,
    FORBIDDEN_CLAIM_STRINGS,
    PANEL_FRAMING,
} = await import('../../../RadicalTrainingPlatform.Web/js/core/CompletionPanel.js');

const COMPLETE = {
    title: 'Create and Power On a VM',
    scenarioId: 'mci-01',
    objectives: [
        { id: 'obj-1', text: 'Create a VM named "Lab-WebServer"', passed: true, unmetConditions: [] },
        { id: 'obj-2', text: 'Power on the VM', passed: true, unmetConditions: [] },
    ],
    trace: [
        { action: 'route-entered', route: '/pc/vms' },
        { action: 'interpretation', objectiveId: 'obj-1', response: 'VM created' },
    ],
    recorded: true,
};

const INCOMPLETE = {
    title: 'Create and Power On a VM',
    scenarioId: 'mci-01',
    objectives: [
        { id: 'obj-1', text: 'Create a VM named "Lab-WebServer"', passed: true, unmetConditions: [] },
        { id: 'obj-2', text: 'Power on the VM', passed: false, unmetConditions: ['the VM is still powered off'] },
    ],
    trace: [{ action: 'route-entered', route: '/pc/vms' }],
    recorded: false,
};

const EMPTY = { title: 'No objectives', scenarioId: 'x-01', objectives: [], trace: [], recorded: false };

await runner.test('the forbidden-claim list is non-empty and covers the three families', async () => {
    assert(FORBIDDEN_CLAIM_STRINGS.length >= 10, 'the forbidden list must be substantive');
    for (const probe of ['mastery', 'job-qualified', 'certification-ready']) {
        assert(FORBIDDEN_CLAIM_STRINGS.includes(probe),
            `the list must include "${probe}"`);
    }
});

await runner.test('the complete branch names conditions met and the action trace', async () => {
    const html = renderCompletionPanel(COMPLETE);
    assert(/Conditions met/.test(html), 'the complete branch must say conditions were met');
    assert(/2 of 2 task conditions met/.test(html), `expected the count line, got: ${html.slice(0, 200)}`);
    assert(!/still open/.test(html), 'the complete branch must not report open conditions');
    assert(/Action trace/.test(html), 'the panel must show the action trace');
    assert(/route-entered/.test(html) && /interpretation/.test(html),
        'the trace must list the recorded actions');
    assert(/This run was recorded on the station/.test(html),
        'a recorded run must say so');
});

await runner.test('the incomplete branch names the remaining condition and its actual state', async () => {
    const html = renderCompletionPanel(INCOMPLETE);
    assert(/Conditions remaining/.test(html), 'the incomplete branch must say conditions remain');
    assert(/1 of 2 task conditions met — 1 still open/.test(html),
        `expected the count line, got: ${html.slice(0, 240)}`);
    assert(/Requested:<\/strong> Power on the VM/.test(html), 'requested state must be shown');
    assert(/Actual:<\/strong> the VM is still powered off/.test(html),
        'actual state must be shown, not just the objective text');
    assert(/This run was not recorded/.test(html),
        'an unrecorded run must be reported honestly, not hidden');
});

await runner.test('an empty objective list does not claim completion', async () => {
    const html = renderCompletionPanel(EMPTY);
    // Assert on the title, not the substring: the section heading reads
    // "Conditions met and remaining" and would match a loose /Conditions met/.
    assert(!/<h2 class="completion-title">Conditions met<\/h2>/.test(html),
        'zero objectives is not "conditions met"');
    assert(/0 of 0 task conditions met/.test(html), 'the count must be truthful');
    assert(/No actions were recorded/.test(html), 'an empty trace must be stated');
});

await runner.test('no branch contains a mastery, qualification, or readiness claim', async () => {
    for (const [name, input] of [['complete', COMPLETE], ['incomplete', INCOMPLETE], ['empty', EMPTY]]) {
        const html = renderCompletionPanel(input);
        const hits = findForbiddenClaims(html);
        assertEqual(hits.join(',') || '(none)', '(none)',
            `${name} branch contains forbidden claim(s): ${hits.join(', ')}`);
    }
});

await runner.test('the standing framing line is present in every branch and is not a score', async () => {
    for (const input of [COMPLETE, INCOMPLETE, EMPTY]) {
        const html = renderCompletionPanel(input);
        assert(html.includes(PANEL_FRAMING),
            'every branch must carry the "not an exam score" framing line');
    }
    assertEqual(findForbiddenClaims(PANEL_FRAMING).join(',') || '(none)', '(none)',
        'the framing line itself must not contain a forbidden claim');
});

await runner.test('untrusted text is escaped, not injected', async () => {
    const html = renderCompletionPanel({
        title: 'x',
        scenarioId: 'x-01',
        objectives: [{
            id: 'obj-1',
            text: '<img src=x onerror="alert(1)">',
            passed: false,
            unmetConditions: ['<script>bad()</script>'],
        }],
        trace: [{ action: '<b>route-entered</b>', route: '"quoted"' }],
        recorded: false,
    });
    assert(!/<img|<script|<b>/.test(html), `raw markup must not survive into the panel: ${html.slice(0, 300)}`);
    assert(/&lt;img/.test(html) && /&lt;script&gt;/.test(html), 'escaped text must be present');
});

await runner.test('the panel output is deterministic (no clock, no randomness)', async () => {
    assertEqual(renderCompletionPanel(COMPLETE), renderCompletionPanel(COMPLETE),
        'two renders of the same input must be byte-identical');
});

process.exit(runner.done('completion-panel-snapshot fixture'));
