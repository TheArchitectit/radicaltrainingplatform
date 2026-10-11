/**
 * CompletionPanel (T-21, REQ-DEMO-06) — the truth-telling completion panel.
 *
 * A simulated lab is not an exam and this panel must never read like one.
 * It reports three things and invents nothing:
 *   - which task conditions were met and which remain;
 *   - requested state vs actual state, per condition;
 *   - the action trace the learner actually produced.
 *
 * It is a pure string builder (no DOM, no storage, no clock) so the
 * forbidden-claim snapshot fixture can render every branch in Node and
 * assert that mastery / job-qualification / certification-readiness claims
 * appear nowhere. Keep it pure: a Date or a store read here would make the
 * snapshot non-deterministic and the claim unfalsifiable.
 */

/**
 * Claim strings forbidden in this panel (REQ-DEMO-06). Matched
 * case-insensitively as substrings, so "you are now certified" is caught by
 * `certified`. Adding a claim here is how the contract grows — the snapshot
 * fixture reads this same list, so a new entry is enforced immediately.
 */
export const FORBIDDEN_CLAIM_STRINGS = [
    'mastered',
    'mastery',
    'you have passed',
    'pass prediction',
    'predicted score',
    'exam-ready',
    'exam ready',
    'certification-ready',
    'certification ready',
    'certified',
    'qualifies you',
    'job-qualified',
    'job qualified',
    'ready for the exam',
    'ready to sit',
];

/** The panel's standing framing line — always present, never a score. */
export const PANEL_FRAMING = 'This is a simulated lab result, not an exam score and not a prediction of exam performance.';

/** True when `text` contains any forbidden claim string. */
export function findForbiddenClaims(text) {
    const hay = String(text || '').toLowerCase();
    return FORBIDDEN_CLAIM_STRINGS.filter(s => hay.includes(s));
}

function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Render the completion panel.
 *
 * @param {Object} input
 * @param {string} input.title        scenario title (display only)
 * @param {Array}  input.objectives   [{ id, text, passed, unmetConditions[] }]
 *        `text` is the requested state; `unmetConditions` is the actual
 *        state that differs from it.
 * @param {Array}  input.trace        action-trace entries (action + detail)
 * @param {string} [input.scenarioId]
 * @param {boolean}[input.recorded]   whether a completion record was written
 * @returns {string} HTML
 */
export function renderCompletionPanel({ title = '', objectives = [], trace = [], scenarioId = '', recorded = false } = {}) {
    const met = objectives.filter(o => o.passed);
    const remaining = objectives.filter(o => !o.passed);
    const complete = objectives.length > 0 && remaining.length === 0;

    const conditionRows = objectives.map(o => {
        const actual = o.passed
            ? 'observed state matches the requested condition'
            : (o.unmetConditions?.length ? o.unmetConditions.join('; ') : 'condition not observed');
        return `
            <li class="completion-condition ${o.passed ? 'met' : 'remaining'}">
                <span class="completion-mark">${o.passed ? '✓' : '○'}</span>
                <span class="completion-requested"><strong>Requested:</strong> ${esc(o.text)}</span>
                <span class="completion-actual"><strong>Actual:</strong> ${esc(actual)}</span>
            </li>`;
    }).join('');

    const traceRows = trace.length
        ? trace.map(t => `
            <li class="completion-trace-row">
                <span class="completion-trace-action">${esc(t.action)}</span>
                <span class="completion-trace-detail">${esc(t.route || t.command || t.test || t.objectiveId || '')}</span>
            </li>`).join('')
        : '<li class="completion-trace-empty">No actions were recorded for this run.</li>';

    return `
        <div class="completion-panel" data-scenario="${esc(scenarioId)}">
            <div class="completion-head">
                <h2 class="completion-title">${complete ? 'Conditions met' : 'Conditions remaining'}</h2>
                <p class="completion-summary">${met.length} of ${objectives.length} task conditions met${complete ? '' : ` — ${remaining.length} still open`}.</p>
            </div>

            <p class="completion-framing">${PANEL_FRAMING}</p>

            <h3 class="completion-section">Conditions met and remaining</h3>
            <ul class="completion-conditions">${conditionRows}</ul>

            <h3 class="completion-section">Action trace</h3>
            <ul class="completion-trace">${traceRows}</ul>

            <p class="completion-record">${recorded
                ? 'This run was recorded on the station. A station reset clears it.'
                : 'This run was not recorded — the station could not store it.'}</p>
        </div>`;
}
