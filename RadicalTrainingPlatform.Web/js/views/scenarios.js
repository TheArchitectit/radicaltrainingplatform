import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { toast } from '../components/Toast.js';
import { TicketLabView } from './ticket-lab.js';
import { NcaLabView } from './nca-lab.js';
import { renderCompletionPanel } from '../core/CompletionPanel.js';
import { interpreted, observation } from './scenarios-shared.js';
import { STORE_CORE_SCENARIOS } from './scenarios-store-core.js';
import { STORE_OPERATIONS_SCENARIOS } from './scenarios-store-operations.js';
import { STORE_ADVANCED_SCENARIOS } from './scenarios-store-advanced.js';
import {
    TICKET_EXPECTATIONS, TICKET_SCENARIOS, TICKET_VALIDATORS,
    validateAplusDns01, validateNetplusGw01, validateAplusIpconf01,
} from './scenarios-ticket.js';
import { NCA_ALERT_LAB, NCA_MAINT_SEQUENCE, NCA_SCENARIOS, NCA_TOOL_LAB } from './scenarios-nca.js';

/**
 * Guided Lab Scenarios — JSON-driven lab exercises across all exams.
 *
 * SPEC-07 validator contract (universal as of T-14/S46-04):
 *   validate: (state, trace) -> { passed, unmetConditions[] }
 *
 * `state` is the simulated StateEngine store. `trace` is the recorded
 * action trail (StateEngine `action_trace` collection for store-based
 * scenarios; TicketLabView's per-run trace for ticket scenarios). The
 * validator is pure over those two inputs — no wall-clock, no random,
 * no network. The UI, the CI scan and the demo sweep all evaluate the
 * same entry point.
 *
 * Observation-only objectives ("open the CLI", "review the dashboard")
 * cannot be proven from configuration state — they validate against the
 * action trace (route-entered / cli-command / tool-used). Create-style
 * objectives validate the entity the real UI mutation path writes.
 */

export { interpreted, observation };
export {
    TICKET_EXPECTATIONS, TICKET_VALIDATORS,
    validateAplusDns01, validateNetplusGw01, validateAplusIpconf01,
};
export { NCA_TOOL_LAB, NCA_MAINT_SEQUENCE, NCA_ALERT_LAB };

/**
 * The catalogue in authored order: the store-based lab set, then the CompTIA
 * help-desk tickets, then the NCA beginner decision labs.
 */
export const SCENARIOS = [
    ...STORE_CORE_SCENARIOS,
    ...STORE_OPERATIONS_SCENARIOS,
    ...STORE_ADVANCED_SCENARIOS,
    ...TICKET_SCENARIOS,
    ...NCA_SCENARIOS,
];

export class ScenariosView extends BaseView {
    #activeScenario = null;
    #attemptRecorded = false;

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        // Group by exam — derive the exam list from the registry itself so
        // scenario entries are never invisible because of a hardcoded list.
        const exams = [...new Set(SCENARIOS.map(s => s.exam))];
        const grouped = {};
        exams.forEach(e => grouped[e] = SCENARIOS.filter(s => s.exam === e));

        el.innerHTML = `
            <div class="page-title">
                <h1>🧪 Guided Lab Scenarios</h1>
            </div>

            <div class="text-secondary text-sm" style="margin-bottom:var(--space-md);">
                Complete hands-on lab exercises to practice for certification exams.
                Each scenario validates your actions against the simulator state.
            </div>

            <!-- REQ-SC-05: the simulation is labelled wherever a learner meets it.
                 The ticket and NCA labs carry the same line on their own pages;
                 store-based scenarios (e.g. nca-vm-01, which runs on the real PE
                 VM wizard) never had one, so the catalogue states it once here
                 for every scenario it lists. -->
            <p class="study-sub" style="margin-bottom:var(--space-xl);">Simulated environment — every action here mutates a local simulation only. No real systems are contacted.</p>

            <div id="scenario-list">
                ${exams.map(exam => `
                    <div class="card" style="margin-bottom:var(--space-lg);">
                        <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
                            ${exam}
                            <span class="text-secondary text-sm">${grouped[exam].length} scenarios</span>
                        </div>
                        <div class="card-body" style="padding:0;">
                            ${grouped[exam].map(s => `
                                <div class="scenario-item" data-id="${s.id}" style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border-light);cursor:pointer;transition:background 0.15s;">
                                    <div>
                                        <strong>${s.title}</strong>
                                        <div class="text-secondary text-sm">${s.description}</div>
                                    </div>
                                    <div style="display:flex;gap:12px;align-items:center;">
                                        <span class="text-secondary text-sm">${s.time}</span>
                                        <span class="status-badge ${s.difficulty === 'Beginner' ? 'good' : s.difficulty === 'Intermediate' ? 'warning' : 'critical'}"><span class="dot"></span>${s.difficulty}</span>
                                        <button class="btn btn-sm btn-primary start-scenario-btn" data-id="${s.id}">Start</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="card" id="scenario-history" style="margin-top:var(--space-xl);">
                <div class="card-header">History</div>
                <div class="card-body" id="scenario-history-list"></div>
            </div>

            <div id="active-scenario" style="display:none;"></div>
        `;

        return el;
    }

    afterRender() {
        document.querySelectorAll('.start-scenario-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.#startScenario(btn.dataset.id);
            });
        });

        document.querySelectorAll('.scenario-item').forEach(item => {
            item.addEventListener('mouseenter', () => item.style.background = 'var(--bg-secondary)');
            item.addEventListener('mouseleave', () => item.style.background = '');
        });

        this.#renderHistory();
    }

    destroy() {}

    #startScenario(id) {
        const scenario = SCENARIOS.find(s => s.id === id);
        if (!scenario) return;

        // Ticket scenarios run in the shared TicketLabView renderer (T-13);
        // the NCA beginner decision tasks run in NcaLabView (T-35); the
        // objective-checklist flow below stays for store-based scenarios.
        if (scenario.renderer === 'ticket' || scenario.renderer === 'nca-lab') {
            const listDiv = document.getElementById('scenario-list');
            const activeDiv = document.getElementById('active-scenario');
            if (!listDiv || !activeDiv) return;
            listDiv.style.display = 'none';
            activeDiv.style.display = '';
            const lab = scenario.renderer === 'ticket' ? new TicketLabView() : new NcaLabView();
            lab.render({ scenario }).then(el => {
                activeDiv.innerHTML = '';
                activeDiv.appendChild(el);
                lab.root = el;
                lab.afterRender({ scenario });
            });
            return;
        }

        this.#activeScenario = scenario;
        this.#attemptRecorded = false;
        const listDiv = document.getElementById('scenario-list');
        const activeDiv = document.getElementById('active-scenario');
        if (!listDiv || !activeDiv) return;

        listDiv.style.display = 'none';
        activeDiv.style.display = '';

        this.#renderActiveScenario(activeDiv, scenario);
    }

    /** SPEC-07: the UI evaluates the same (state, trace) entry point as CI. */
    #trace() {
        return state.getAll('action_trace');
    }

    #evalObjective(obj) {
        return this.#evalObjectiveDetail(obj).passed;
    }

    /** Full validator result — the completion panel reports unmetConditions. */
    #evalObjectiveDetail(obj) {
        try {
            const result = obj.validate(state, this.#trace());
            return {
                passed: result?.passed === true,
                unmetConditions: Array.isArray(result?.unmetConditions) ? result.unmetConditions : [],
            };
        } catch (e) {
            return { passed: false, unmetConditions: [`validator failed: ${e?.message || e}`] };
        }
    }

    /**
     * The interpretation form for one observation objective (T-21,
     * REQ-DEMO-06). Rendered only for objectives flagged `observation` —
     * a config-mutation objective has nothing to interpret.
     */
    #renderInterpretationInput(scenario, objective) {
        const already = interpreted(this.#trace(), scenario.id, objective.id);
        return `
            <div class="interpretation-form" data-objective="${objective.id}" data-recorded="${already}">
                <label class="interpretation-label" for="interp-${objective.id}">What did you observe? Record your interpretation to complete this observation task.</label>
                <textarea class="interpretation-input" id="interp-${objective.id}" rows="2"
                    ${already ? 'disabled' : ''}
                    placeholder="Describe what the page showed and what it means."></textarea>
                <div class="interpretation-actions">
                    <button class="btn btn-sm btn-primary interpretation-submit" ${already ? 'disabled' : ''}>Record interpretation</button>
                    <span class="interpretation-status text-secondary text-sm">${already ? 'Recorded.' : 'Visiting the view alone does not complete this task.'}</span>
                </div>
            </div>`;
    }

    #renderActiveScenario(container, scenario) {
        const results = scenario.objectives.map(obj => ({
            ...obj,
            passed: false,
        }));

        // Try initial validation — isolate each validator so one poisoned
        // objective doesn't leave the rest unrendered/unmarked.
        results.forEach(r => {
            r.passed = this.#evalObjective(r);
        });

        container.innerHTML = `
            <div class="card" style="margin-bottom:var(--space-lg);">
                <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <span class="status-badge info"><span class="dot"></span>${scenario.exam}</span>
                        <strong style="margin-left:8px;">${scenario.title}</strong>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button class="btn btn-sm btn-secondary" id="check-btn">✓ Check Progress</button>
                        <button class="btn btn-sm btn-secondary" id="hints-btn">💡 Show Hints</button>
                        <button class="btn btn-sm btn-secondary" id="navigate-btn">🔗 Go to View</button>
                        <button class="btn btn-sm btn-secondary" id="back-btn">← Back to Scenarios</button>
                    </div>
                </div>
                <div class="card-body">
                    <p>${scenario.description}</p>
                    <p class="text-secondary text-sm">⏱️ Estimated time: ${scenario.time} | Difficulty: ${scenario.difficulty}</p>
                </div>
            </div>

            <div class="card" style="margin-bottom:var(--space-lg);">
                <div class="card-header">Objectives</div>
                <div class="card-body" id="objectives-list">
                    ${results.map(r => `
                        <div class="objective-row" id="obj-${r.id}">
                            <div class="objective-head">
                                <span class="objective-mark" style="font-size:20px;">${r.passed ? '✅' : '⬜'}</span>
                                <span>${r.text}</span>
                            </div>
                            ${r.observation ? this.#renderInterpretationInput(scenario, r) : ''}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="card" id="hints-panel" style="display:none;">
                <div class="card-header">💡 Hints</div>
                <div class="card-body">
                    <ol style="padding-left:20px;">
                        ${scenario.hints.map(h => `<li style="margin-bottom:8px;">${h}</li>`).join('')}
                    </ol>
                </div>
            </div>

            <div class="card" id="result-panel" style="display:none;">
                <div class="card-body" id="result-body"></div>
            </div>
        `;

        // Observation objectives need a recorded interpretation response
        // (T-21): a plain textarea + button, both natively tabbable, so the
        // demo path stays keyboard-operable with no hover-only affordance.
        container.querySelectorAll('.interpretation-form').forEach(form => {
            const objectiveId = form.dataset.objective;
            const input = form.querySelector('.interpretation-input');
            const submit = form.querySelector('.interpretation-submit');
            const status = form.querySelector('.interpretation-status');
            const save = async () => {
                const response = (input?.value || '').trim();
                if (!response) {
                    if (status) status.textContent = 'Type what you observed before recording — an empty response is not an interpretation.';
                    input?.focus();
                    return;
                }
                try {
                    await state.create('action_trace', {
                        action: 'interpretation',
                        scenarioId: scenario.id,
                        objectiveId,
                        response,
                    });
                } catch (e) {
                    if (status) status.textContent = 'Could not record the response — the station did not store it.';
                    return;
                }
                if (status) status.textContent = 'Recorded. Use "Check Progress" to re-evaluate.';
                submit.disabled = true;
                input.disabled = true;
                form.dataset.recorded = 'true';
            };
            submit?.addEventListener('click', save);
            input?.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    save();
                }
            });
        });

        document.getElementById('back-btn')?.addEventListener('click', () => {
            container.style.display = 'none';
            document.getElementById('scenario-list').style.display = '';
        });

        document.getElementById('hints-btn')?.addEventListener('click', () => {
            const panel = document.getElementById('hints-panel');
            if (panel) panel.style.display = panel.style.display === 'none' ? '' : 'none';
        });

        document.getElementById('navigate-btn')?.addEventListener('click', async () => {
            // Record the navigation as a semantic action before leaving the view
            // so observation objectives can see it after the user returns.
            try {
                await state.create('action_trace', { action: 'route-entered', route: scenario.startRoute });
            } catch { /* trace write must never block navigation */ }
            window.location.hash = `#${scenario.startRoute}`;
        });

        document.getElementById('check-btn')?.addEventListener('click', () => {
            const evaluated = scenario.objectives.map(obj => {
                const detail = this.#evalObjectiveDetail(obj);
                const el = document.getElementById(`obj-${obj.id}`);
                const icon = el?.querySelector('.objective-mark');
                if (icon) icon.textContent = detail.passed ? '✅' : '❌';
                return { id: obj.id, text: obj.text, passed: detail.passed, unmetConditions: detail.unmetConditions };
            });
            const allPassed = evaluated.every(o => o.passed);

            const resultPanel = document.getElementById('result-panel');
            const resultBody = document.getElementById('result-body');
            if (!resultPanel || !resultBody) return;
            resultPanel.style.display = '';

            // T-21/REQ-DEMO-06: the panel states conditions met and
            // remaining, requested vs actual, and the action trace. It is
            // never a score and never a mastery/qualification claim —
            // CompletionPanel holds the forbidden-string list.
            resultBody.innerHTML = renderCompletionPanel({
                title: scenario.title,
                scenarioId: scenario.id,
                objectives: evaluated,
                trace: this.#trace(),
                recorded: allPassed,
            });
            if (allPassed) {
                toast.success(`All task conditions met for "${scenario.title}".`);
                this.#recordAttempt(scenario);
            } else {
                toast.info(`${evaluated.filter(o => !o.passed).length} condition(s) still open.`);
            }
        });
    }

    async #recordAttempt(scenario) {
        if (this.#attemptRecorded) return;
        this.#attemptRecorded = true;
        const existing = state.getAll('scenario_attempts')
            .filter(a => a.scenario_id === scenario.id && a.completed);
        await state.create('scenario_attempts', {
            scenario_id: scenario.id,
            scenario_title: scenario.title,
            exam: scenario.exam,
            attempt_number: existing.length + 1,
            completed: true,
            completed_at: new Date().toISOString(),
        });
        this.#renderHistory();
    }

    #renderHistory() {
        const list = document.getElementById('scenario-history-list');
        if (!list) return;
        const attempts = state.getAll('scenario_attempts');
        if (attempts.length === 0) {
            list.innerHTML = '<span class="text-secondary text-sm">No completed scenarios yet.</span>';
            return;
        }
        list.innerHTML = attempts.map(a => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-light);">
                <span>✅ <strong>${a.scenario_title}</strong> <span class="text-secondary text-sm">(${a.exam})</span></span>
                <span class="text-secondary text-sm">attempt #${a.attempt_number}${a.completed_at ? ` · ${new Date(a.completed_at).toLocaleString()}` : ''}</span>
            </div>
        `).join('');
    }
}
