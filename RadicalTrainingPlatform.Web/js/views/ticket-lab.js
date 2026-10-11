import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { toast } from '../components/Toast.js';
import { progress } from '../core/ProgressStore.js';

/**
 * Ticket Lab (T-13, SPEC-07) — shared help-desk ticket renderer for the
 * CompTIA ticket scenarios (aplus-dns-01, netplus-gw-01, plus the Sprint 48
 * NCA beginner set when it lands).
 *
 * The renderer owns NO scoring logic. Validators are pure functions over the
 * simulated store plus the recorded action trace, defined beside the scenario
 * registry — the UI calls the same evaluation entry point the CI scan and the
 * demo sweep use, so a divergent test-only validator is impossible (REQ-SC-01
 * guidance). The evidence panel shows requested vs actual configuration and
 * the semantic action trace; it never decides pass/fail.
 *
 * Everything here mutates only the simulated StateEngine store — zero real
 * network calls (REQ-SC-05). Tests are labeled simulated in the results.
 */

// Fixed diagnostic test set (safe tests only, per SPEC-07).
export const TEST_SET = [
    { id: 'ping-ip', label: 'ping a known IP address (8.8.8.8)' },
    { id: 'ping-name', label: 'ping a host by name (example.com)' },
    { id: 'nslookup', label: 'nslookup example.com' },
    { id: 'ipconfig', label: 'ipconfig /all' },
    { id: 'tracert', label: 'tracert example.com' },
];

export class TicketLabView extends BaseView {
    #scenario = null;
    #trace = [];
    #testsRun = [];

    async render(params) {
        const scenario = (params && params.scenario) || null;
        if (!scenario) {
            return this.html(`<div class="view"><p>Ticket scenario not found.</p></div>`);
        }
        this.#scenario = scenario;
        this.#trace = [];
        this.#testsRun = [];
        return this.#renderLab();
    }

    async #renderLab() {
        const ws = await this.#workstation();
        const ticket = this.#scenario.ticket;
        const cfg = ws.config;
        const fields = this.#scenario.configFields || ['ip', 'gateway', 'dns'];
        const rows = fields.map(f => `
            <div class="ticket-cfg-row">
                <label for="ticket-cfg-${f}">${this.#fieldLabel(f)}</label>
                <input id="ticket-cfg-${f}" data-field="${f}" value="${cfg[f] || ''}" ${f === this.#scenario.editableField ? '' : 'disabled'}>
            </div>`).join('');
        const tests = TEST_SET.map(t => `
            <label class="ticket-test-row"><input type="checkbox" data-test="${t.id}" ${this.#testsRun.includes(t.id) ? 'checked' : ''}> ${t.label}</label>`).join('');
        return this.html(`
            <div class="study-page ticket-page">
                <a class="study-back" href="#/pc/scenarios">‹ Back to scenarios</a>
                <h1 class="study-title">Help Desk Ticket — ${this.#scenario.title}</h1>
                <p class="study-sub">Simulated environment — every action here mutates a local simulation only. No real systems are contacted.</p>
                <div class="ticket-pane card">
                    <div class="card-header">Ticket ${ticket.id} · Priority ${ticket.priority}</div>
                    <div class="card-body">
                        <p><strong>Reported by:</strong> ${ticket.reportedBy}</p>
                        <p>${ticket.text}</p>
                    </div>
                </div>
                <div class="card ticket-config">
                    <div class="card-header">Workstation configuration — ${ws.name}</div>
                    <div class="card-body">
                        ${rows}
                    </div>
                </div>
                <div class="card ticket-tests">
                    <div class="card-header">Diagnostic tests (fixed set — pick what you need)</div>
                    <div class="card-body ticket-test-list">${tests}</div>
                </div>
                <div class="card ticket-note">
                    <div class="card-header">Resolution note</div>
                    <div class="card-body">
                        <textarea id="ticket-note" rows="3" placeholder="What was wrong, what you changed, how you verified it."></textarea>
                    </div>
                </div>
                <div class="lesson-actions">
                    <button class="study-button" id="ticket-submit">Submit resolution</button>
                    <button class="study-button secondary" id="ticket-reset">Reset workstation</button>
                </div>
                <div id="ticket-evidence"></div>
                <p class="study-disclaimer">${this.#scenario.disclaimer}</p>
            </div>`);
    }

    #fieldLabel(f) {
        return { ip: 'IP address', gateway: 'Default gateway', dns: 'DNS server' }[f] || f;
    }

    async #workstation() {
        const list = state.getAll('ticket_workstations');
        return list.find(w => w.scenarioId === this.#scenario.scenarioId);
    }

    afterRender(params) {
        // Rebind after in-place re-renders (render() sets #scenario first).
        if (!this.#scenario) return;
        const s = this.#scenario;

        this.root.querySelectorAll('input[type="checkbox"][data-test]').forEach(box => {
            box.addEventListener('change', async () => {
                const id = box.dataset.test;
                if (box.checked) {
                    if (!this.#testsRun.includes(id)) this.#testsRun.push(id);
                    this.#trace.push({ action: 'test-run', test: id, at: new Date().toISOString() });
                    await this.#runTest(id);
                }
            });
        });

        const editable = this.root.querySelector(`#ticket-cfg-${s.editableField}`);
        editable?.addEventListener('change', async (e) => {
            const value = e.target.value.trim();
            await this.#applyConfig(s.editableField, value);
        });

        this.root.querySelector('#ticket-submit')?.addEventListener('click', () => this.#submit());
        this.root.querySelector('#ticket-reset')?.addEventListener('click', () => this.#resetWorkstation());
        this.#renderEvidence();
    }

    async #runTest(id) {
        const ws = await this.#workstation();
        const cfg = ws.config;
        // Deterministic simulation: the result is a pure function of the
        // current simulated configuration. No network is touched.
        let outcome;
        if (id === 'ping-ip') {
            outcome = { ok: true, output: 'Reply from 8.8.8.8: bytes=32 time=14ms TTL=118' };
        } else if (id === 'ping-name') {
            outcome = cfg.dns === this.#scenario.correctDns
                ? { ok: true, output: 'Reply from 93.184.216.34: bytes=32 time=21ms TTL=56' }
                : { ok: false, output: 'Ping request could not find host example.com.' };
        } else if (id === 'nslookup') {
            outcome = cfg.dns === this.#scenario.correctDns
                ? { ok: true, output: 'example.com  93.184.216.34' }
                : { ok: false, output: 'example.com: Name resolution timed out.' };
        } else if (id === 'ipconfig') {
            outcome = { ok: true, output: `IPv4: ${cfg.ip}  Gateway: ${cfg.gateway}  DNS: ${cfg.dns}` };
        } else if (id === 'tracert') {
            outcome = cfg.gateway === this.#scenario.correctGateway
                ? { ok: true, output: '1 <1ms 10.42.x.1  2 21ms 93.184.216.34' }
                : { ok: false, output: '1 * * *  Request timed out.' };
        }
        this.#showTestOutput(outcome);
    }

    #showTestOutput(outcome) {
        let el = this.root.querySelector('#ticket-test-output');
        if (!el) {
            el = document.createElement('div');
            el.id = 'ticket-test-output';
            el.className = 'ticket-test-output';
            this.root.querySelector('.ticket-test-list')?.after(el);
        }
        el.textContent = `> ${outcome.ok ? 'OK' : 'FAIL'}: ${outcome.output}`;
    }

    async #applyConfig(field, value) {
        const ws = await this.#workstation();
        const changes = { config: { ...ws.config, [field]: value } };
        await state.update('ticket_workstations', ws.uuid, changes);
        this.#trace.push({ action: 'field-set', field, value, at: new Date().toISOString() });
        this.#renderEvidence();
    }

    async #submit() {
        const s = this.#scenario;
        const noteEl = this.root.querySelector('#ticket-note');
        const note = (noteEl?.value || '').trim();
        this.#trace.push({ action: 'note-submitted', note, at: new Date().toISOString() });
        const ws = await this.#workstation();
        await state.update('ticket_workstations', ws.uuid, { resolution_note: note });
        const verdict = s.validate(state, this.#trace);
        this.#renderEvidence(verdict);
        if (verdict.passed) {
            toast.success(`Ticket ${s.ticket.id} resolved — scenario complete!`);
            await progress.recordScenario(s.scenarioId);
        } else {
            toast.info(`Not resolved yet: ${verdict.unmetConditions[0] || 'objectives unmet'}`);
        }
    }

    async #resetWorkstation() {
        await state.reset();
        this.#testsRun = [];
        this.#trace = [];
        const el = await this.#renderLab();
        this.#swap(el);
        this.afterRender({ scenario: this.#scenario });
        toast.info('Workstation reset to seeded state.');
    }

    /** Evidence panel: requested vs actual + semantic action trace. */
    async #renderEvidence(verdict) {
        const s = this.#scenario;
        const ws = await this.#workstation();
        const cfg = ws.config;
        const rows = (s.configFields || ['ip', 'gateway', 'dns']).map(f => {
            const wanted = f === 'dns' ? s.correctDns : f === 'gateway' ? s.correctGateway : null;
            const actual = cfg[f];
            const state_ = wanted == null ? '' : (actual === wanted ? '✓' : '✗');
            return `<div class="ticket-evidence-row"><span>${this.#fieldLabel(f)}</span><span>${actual}</span><span>${state_}</span></div>`;
        }).join('');
        const traceRows = this.#trace.map(t => {
            if (t.action === 'test-run') {
                const label = TEST_SET.find(x => x.id === t.test)?.label || t.test;
                return `<li>ran ${label}</li>`;
            }
            if (t.action === 'field-set') return `<li>set ${this.#fieldLabel(t.field)} to ${t.value}</li>`;
            if (t.action === 'note-submitted') return `<li>submitted resolution note${t.note ? '' : ' (empty)'}</li>`;
            return `<li>${t.action}</li>`;
        }).join('');
        const verdictHtml = verdict
            ? (verdict.passed
                ? '<div class="verdict correct">All objectives met — ticket resolved.</div>'
                : `<div class="verdict wrong">Not resolved: ${verdict.unmetConditions.join('; ')}</div>`)
            : '';
        let el = this.root.querySelector('#ticket-evidence');
        if (!el) {
            el = document.createElement('div');
            el.id = 'ticket-evidence';
            this.root.appendChild(el);
        }
        el.innerHTML = `
            <div class="card ticket-evidence">
                <div class="card-header">Evidence</div>
                <div class="card-body">
                    <h4>Requested vs actual configuration</h4>
                    <div class="ticket-evidence-table">${rows}</div>
                    <h4>Action trace</h4>
                    <ul class="ticket-trace">${traceRows || '<li>(no actions recorded yet)</li>'}</ul>
                    ${verdictHtml}
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
