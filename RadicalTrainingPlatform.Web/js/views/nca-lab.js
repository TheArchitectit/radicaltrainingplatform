import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { toast } from '../components/Toast.js';
import { progress } from '../core/ProgressStore.js';

/**
 * NCA Beginner Lab (T-35, SPEC-07 07.5, REQ-NCA-07).
 *
 * Renderer for the four NCA beginner scenarios' decision tasks. Like
 * TicketLabView it owns NO scoring logic: every validator is a pure function
 * over the simulated store plus the recorded action trace, defined beside the
 * scenario registry, and this view calls the same evaluation entry point the
 * CI scan and the demo sweep use (REQ-SC-01 guidance).
 *
 * Why a renderer at all. Three of the four tasks ask the learner to make a
 * decision the PE/PC simulator has no surface for — picking a tool from a
 * tool list, ordering maintenance steps, triaging an alert. SPEC-07 07.7:
 * "When a view lacks a mutation the scenario needs, the fix is in the view or
 * the scenario — chosen explicitly and recorded — never in the validator."
 * The choice made here is the view. (nca-vm-01 needs no renderer: it runs on
 * the real PE VM wizard, so it stays a plain store-based scenario.)
 *
 * Honesty rule (REQ-NCA-07): these tasks are decisions the simulator can
 * genuinely record, so they are real interactive tasks. Nothing here pretends
 * to perform a licensing mutation or any other action the simulator cannot do
 * — those are labelled worked examples in the lesson text instead.
 *
 * Everything mutates only the simulated StateEngine store — zero real network
 * calls (REQ-SC-05), and the "simulated environment" label is rendered above.
 *
 * Trace shape: each answer is recorded as a semantic action with stable IDs.
 * Re-answering records a NEW action, and the validators read the LAST one, so
 * a learner who changes their mind is judged on their final answer rather than
 * on having once clicked the right thing by accident.
 */
export class NcaLabView extends BaseView {
    #scenario = null;
    #order = [];

    async render(params) {
        const scenario = (params && params.scenario) || null;
        if (!scenario || !scenario.lab) {
            return this.html(`<div class="view"><p>Scenario not found.</p></div>`);
        }
        this.#scenario = scenario;
        this.#order = [];
        return this.#renderLab();
    }

    #renderLab() {
        const s = this.#scenario;
        const body = s.lab.mode === 'tool-select' ? this.#toolSelect()
            : s.lab.mode === 'sequence' ? this.#sequence()
            : s.lab.mode === 'alert-triage' ? this.#alertTriage()
            : '<p>Unknown lab mode.</p>';
        return this.html(`
            <div class="study-page nca-page">
                <a class="study-back" href="#/pc/scenarios">‹ Back to scenarios</a>
                <h1 class="study-title">${s.title}</h1>
                <p class="study-sub">Simulated environment — every action here mutates a local simulation only. No real systems are contacted.</p>
                <div class="card nca-pane">
                    <div class="card-header">${s.lab.prompt}</div>
                    <div class="card-body">${body}</div>
                </div>
                <div class="lesson-actions">
                    <button class="study-button" id="nca-submit">Check my answer</button>
                    <button class="study-button secondary" id="nca-reset">Reset scenario</button>
                </div>
                <div id="nca-evidence"></div>
                <p class="study-disclaimer">${s.disclaimer}</p>
            </div>`);
    }

    // ── Mode: pick the right tool (nca-tool-01) ──

    #toolSelect() {
        const lab = this.#scenario.lab;
        return lab.tasks.map(task => `
            <div class="nca-task">
                <p class="nca-task-prompt">${task.prompt}</p>
                <div class="nca-options" role="radiogroup" aria-label="Tool for ${task.id}">
                    ${lab.tools.map(t => `
                        <label class="nca-option">
                            <input type="radio" name="nca-${task.id}" data-task="${task.id}" value="${t.id}">
                            <span>${t.label}</span>
                        </label>`).join('')}
                </div>
            </div>`).join('');
    }

    // ── Mode: order the maintenance steps (nca-maint-01) ──

    #sequence() {
        const lab = this.#scenario.lab;
        const buttons = lab.shuffledOrder.map(stepId => {
            const step = lab.steps.find(x => x.id === stepId);
            return `<button class="study-button secondary nca-step-btn" data-step="${step.id}">${step.label}</button>`;
        }).join('');
        return `
            <p class="nca-hint">Click the steps in the order you would perform them. The order you build is what is checked.</p>
            <div class="nca-shuffled" id="nca-shuffled">${buttons}</div>
            <div class="card nca-order">
                <div class="card-header">Your order</div>
                <div class="card-body">
                    <ol id="nca-order-list" class="nca-order-list"></ol>
                    <button class="study-button secondary" id="nca-clear-order">Clear order</button>
                </div>
            </div>`;
    }

    #renderOrder() {
        const lab = this.#scenario.lab;
        const list = this.root.querySelector('#nca-order-list');
        if (!list) return;
        list.innerHTML = this.#order.map(id => {
            const step = lab.steps.find(x => x.id === id);
            return `<li>${step ? step.label : id}</li>`;
        }).join('');
    }

    // ── Mode: triage the seeded alert (nca-alert-01) ──

    #alertTriage() {
        const lab = this.#scenario.lab;
        const alert = state.getAll('alerts').find(a => a.uuid === lab.alertUuid);
        if (!alert) return `<p>Alert ${lab.alertUuid} is not present in the simulated cluster.</p>`;
        const sev = alert.severity === 'critical' ? 'critical'
            : alert.severity === 'warning' ? 'warning' : 'good';
        return `
            <div class="nca-alert" id="nca-alert">
                <div class="nca-alert-row">
                    <span class="status-badge ${sev}"><span class="dot"></span>${alert.severity}</span>
                    <strong>${alert.title}</strong>
                    <span class="text-secondary text-sm">${alert.entity}</span>
                    <button class="study-button secondary" id="nca-alert-open">Open detail</button>
                </div>
                <div class="nca-alert-detail" id="nca-alert-detail" hidden>
                    <p>${lab.detail}</p>
                </div>
            </div>
            <div class="nca-options" role="radiogroup" aria-label="Next step">
                ${lab.steps.map(st => `
                    <label class="nca-option">
                        <input type="radio" name="nca-triage" data-step="${st.id}" value="${st.id}">
                        <span>${st.label}</span>
                    </label>`).join('')}
            </div>`;
    }

    afterRender(params) {
        if (!this.#scenario) return;

        this.root.querySelectorAll('input[type="radio"][data-task]').forEach(box => {
            box.addEventListener('change', async () => {
                await state.create('action_trace', {
                    action: 'tool-selected', task: box.dataset.task, tool: box.value,
                });
                this.#renderEvidence();
            });
        });

        this.root.querySelectorAll('.nca-step-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                this.#order.push(btn.dataset.step);
                await state.create('action_trace', {
                    action: 'sequence-order', steps: [...this.#order],
                });
                this.#renderOrder();
                this.#renderEvidence();
            });
        });

        this.root.querySelector('#nca-clear-order')?.addEventListener('click', async () => {
            this.#order = [];
            await state.create('action_trace', { action: 'sequence-order', steps: [] });
            this.#renderOrder();
            this.#renderEvidence();
        });

        this.root.querySelector('#nca-alert-open')?.addEventListener('click', async () => {
            const detail = this.root.querySelector('#nca-alert-detail');
            if (detail) detail.hidden = false;
            await state.create('action_trace', {
                action: 'alert-opened', alert: this.#scenario.lab.alertUuid,
            });
            this.#renderEvidence();
        });

        this.root.querySelectorAll('input[type="radio"][data-step]').forEach(box => {
            box.addEventListener('change', async () => {
                await state.create('action_trace', { action: 'triage-selected', step: box.value });
                this.#renderEvidence();
            });
        });

        this.root.querySelector('#nca-submit')?.addEventListener('click', () => this.#submit());
        this.root.querySelector('#nca-reset')?.addEventListener('click', () => this.#resetScenario());
        this.#renderOrder();
        this.#renderEvidence();
    }

    async #submit() {
        const s = this.#scenario;
        const trace = state.getAll('action_trace');
        const results = (s.objectives || []).map(obj => {
            try {
                const r = obj.validate(state, trace);
                return { id: obj.id, text: obj.text, passed: r?.passed === true, unmet: r?.unmetConditions || [] };
            } catch (e) {
                return { id: obj.id, text: obj.text, passed: false, unmet: [`validator failed: ${e?.message || e}`] };
            }
        });
        const open = results.filter(r => !r.passed);
        this.#renderEvidence(results);
        if (open.length === 0) {
            toast.success(`${s.title} — scenario complete!`);
            await progress.recordScenario(s.id);
        } else {
            toast.info(`Not complete yet: ${open[0].unmet[0] || 'objectives unmet'}`);
        }
    }

    async #resetScenario() {
        await state.reset();
        this.#order = [];
        const el = await this.#renderLab();
        this.#swap(el);
        this.afterRender({ scenario: this.#scenario });
        toast.info('Scenario reset to seeded state.');
    }

    /** Evidence panel: the recorded actions and the objective results. */
    #renderEvidence(results) {
        const s = this.#scenario;
        const trace = state.getAll('action_trace');
        const rows = (s.objectives || []).map(obj => {
            const r = (results || []).find(x => x.id === obj.id);
            const mark = !r ? '' : (r.passed ? '✓' : '✗');
            const why = r && !r.passed && r.unmet.length ? ` — ${r.unmet.join('; ')}` : '';
            return `<li>${mark} ${obj.text}${why}</li>`;
        }).join('');
        const actions = trace.map(t => {
            if (t.action === 'tool-selected') return `<li>selected ${t.tool} for ${t.task}</li>`;
            if (t.action === 'sequence-order') return `<li>ordered: ${(t.steps || []).join(' → ') || '(cleared)'}</li>`;
            if (t.action === 'alert-opened') return `<li>opened alert detail ${t.alert}</li>`;
            if (t.action === 'triage-selected') return `<li>selected next step ${t.step}</li>`;
            return `<li>${t.action}</li>`;
        }).join('');
        let el = this.root.querySelector('#nca-evidence');
        if (!el) {
            el = document.createElement('div');
            el.id = 'nca-evidence';
            this.root.appendChild(el);
        }
        el.innerHTML = `
            <div class="card nca-evidence">
                <div class="card-header">Evidence</div>
                <div class="card-body">
                    <h4>Objectives</h4>
                    <ul class="nca-objectives">${rows}</ul>
                    <h4>Recorded actions</h4>
                    <ul class="nca-trace">${actions || '<li>(no actions recorded yet)</li>'}</ul>
                </div>
            </div>`;
    }

    #swap(el) {
        const parent = this.root.parentElement;
        if (!parent) return;
        parent.replaceChild(el, this.root);
        this.root = el;
    }
}
