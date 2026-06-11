import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { Wizard } from '../components/Wizard.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

/**
 * PC X-Play — Playbook automation engine.
 * Trigger → Condition → Action chains for automated operations.
 */
export class PcXplayView extends BaseView {
    #table = null;
    #unsubs = [];

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        const header = document.createElement('div');
        header.className = 'page-title';
        header.innerHTML = `
            <h1>X-Play Playbooks</h1>
            <button class="btn btn-primary" id="create-playbook-btn">+ Create Playbook</button>
        `;
        el.appendChild(header);

        const playbooks = state.getAll('playbooks');

        // Summary
        const summary = document.createElement('div');
        summary.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-lg);margin-bottom:var(--space-xl);';
        summary.innerHTML = `
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${playbooks.length}</div>
                <div class="text-secondary text-sm">Total Playbooks</div>
            </div></div>
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--status-good);">${playbooks.filter(p => p.enabled).length}</div>
                <div class="text-secondary text-sm">Enabled</div>
            </div></div>
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${playbooks.reduce((s, p) => s + (p.execution_count || 0), 0)}</div>
                <div class="text-secondary text-sm">Total Executions</div>
            </div></div>
        `;
        el.appendChild(summary);

        this.#table = new EntityTable({
            columns: [
                { key: 'name', label: 'Playbook', sortable: true, render: (v) => `<strong>${v}</strong>` },
                {
                    key: 'trigger', label: 'Trigger',
                    render: (v) => {
                        const icons = { alert: '🔔', event: '📡', manual: '👆', schedule: '⏰' };
                        return `${icons[v?.type] || ''} ${this.#triggerLabel(v)}`;
                    }
                },
                {
                    key: 'actions', label: 'Actions',
                    render: (val) => (val || []).map(a => a.type).join(' → ')
                },
                {
                    key: 'enabled', label: 'Status', sortable: true,
                    render: (v) => `<span class="status-badge ${v ? 'good' : 'critical'}"><span class="dot"></span>${v ? 'Enabled' : 'Disabled'}</span>`
                },
                {
                    key: 'execution_count', label: 'Executions', sortable: true,
                    render: (v) => v || 0
                },
                {
                    key: 'last_run', label: 'Last Run',
                    render: (v) => v || '<span class="text-secondary">Never</span>'
                },
            ],
            data: playbooks,
            searchKeys: ['name'],
            emptyMessage: 'No playbooks configured',
            emptyIcon: '🎭',
            actions: [
                { label: 'Run Now', onClick: (pb) => this.#runPlaybook(pb) },
                { label: 'Toggle Enable', onClick: (pb) => this.#toggleEnable(pb) },
                { label: 'Delete', danger: true, onClick: (pb) => this.#deletePlaybook(pb) },
            ],
        });
        el.appendChild(this.#table.render());

        return el;
    }

    afterRender() {
        document.getElementById('create-playbook-btn')?.addEventListener('click', () => this.#openCreateWizard());
        const u1 = bus.on('playbooks:created', () => this.#refresh());
        const u2 = bus.on('playbooks:updated', () => this.#refresh());
        const u3 = bus.on('playbooks:deleted', () => this.#refresh());
        this.#unsubs.push(u1, u2, u3);
    }

    destroy() { this.#table?.destroy(); this.#unsubs.forEach(u => u()); }
    #refresh() { this.#table?.setData(state.getAll('playbooks')); }

    #triggerLabel(trigger) {
        if (!trigger) return 'None';
        const labels = {
            alert: `Alert: ${trigger.severity || 'Any'}`,
            event: `Event: ${trigger.event || 'Any'}`,
            manual: 'Manual',
            schedule: `Schedule: ${trigger.schedule || 'Daily'}`,
        };
        return labels[trigger.type] || trigger.type;
    }

    async #runPlaybook(pb) {
        toast.info(`Executing playbook "${pb.name}"...`);
        setTimeout(async () => {
            await state.update('playbooks', pb.uuid, {
                execution_count: (pb.execution_count || 0) + 1,
                last_run: new Date().toISOString().split('T')[0],
            });
            toast.success(`Playbook "${pb.name}" executed successfully — ${pb.actions.length} action(s) completed`);
        }, 1500);
    }

    async #toggleEnable(pb) {
        await state.update('playbooks', pb.uuid, { enabled: !pb.enabled });
        toast.success(`Playbook "${pb.name}" ${!pb.enabled ? 'enabled' : 'disabled'}`);
    }

    async #deletePlaybook(pb) {
        const ok = await confirm({ title: 'Delete Playbook', message: `Delete <strong>${pb.name}</strong>?`, confirmLabel: 'Delete', danger: true });
        if (ok) { await state.remove('playbooks', pb.uuid); toast.success(`Playbook "${pb.name}" deleted`); }
    }

    #openCreateWizard() {
        const wizard = new Wizard({
            title: 'Create Playbook',
            initialData: {
                name: '', trigger_type: 'alert', trigger_severity: 'critical',
                trigger_event: 'vm.power_off', trigger_schedule: 'daily',
                action1_type: 'email', action1_target: '',
                action2_type: '', action2_target: '',
            },
            steps: [
                {
                    label: 'Trigger',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Playbook Name</label>
                            <input class="form-input" data-field="name" value="${data.name}" placeholder="e.g., Alert-Notify-Admins" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Trigger Type</label>
                            <select class="form-input" data-field="trigger_type">
                                <option value="alert" ${data.trigger_type === 'alert' ? 'selected' : ''}>Alert Generated</option>
                                <option value="event" ${data.trigger_type === 'event' ? 'selected' : ''}>System Event</option>
                                <option value="manual" ${data.trigger_type === 'manual' ? 'selected' : ''}>Manual Trigger</option>
                                <option value="schedule" ${data.trigger_type === 'schedule' ? 'selected' : ''}>Schedule</option>
                            </select>
                        </div>
                        ${data.trigger_type === 'alert' ? `
                            <div class="form-group">
                                <label class="form-label">Alert Severity</label>
                                <select class="form-input" data-field="trigger_severity">
                                    <option value="critical" ${data.trigger_severity === 'critical' ? 'selected' : ''}>Critical</option>
                                    <option value="warning" ${data.trigger_severity === 'warning' ? 'selected' : ''}>Warning</option>
                                    <option value="info" ${data.trigger_severity === 'info' ? 'selected' : ''}>Info</option>
                                </select>
                            </div>
                        ` : ''}
                        ${data.trigger_type === 'event' ? `
                            <div class="form-group">
                                <label class="form-label">Event Type</label>
                                <select class="form-input" data-field="trigger_event">
                                    <option value="vm.power_off">VM Power Off</option>
                                    <option value="vm.create">VM Created</option>
                                    <option value="vm.delete">VM Deleted</option>
                                    <option value="host.down">Host Down</option>
                                </select>
                            </div>
                        ` : ''}
                        ${data.trigger_type === 'schedule' ? `
                            <div class="form-group">
                                <label class="form-label">Schedule</label>
                                <select class="form-input" data-field="trigger_schedule">
                                    <option value="hourly">Hourly</option>
                                    <option value="daily" selected>Daily</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                            </div>
                        ` : ''}
                    `,
                    validate: (data) => {
                        const e = [];
                        if (!data.name?.trim()) e.push('Playbook name is required');
                        return e;
                    },
                },
                {
                    label: 'Actions',
                    render: (data) => `
                        <p class="text-secondary text-sm" style="margin-bottom:12px;">Define actions to execute when the trigger fires.</p>
                        <div class="form-group">
                            <label class="form-label">Action 1</label>
                            <select class="form-input" data-field="action1_type">
                                <option value="email" ${data.action1_type === 'email' ? 'selected' : ''}>Send Email</option>
                                <option value="vm_power" ${data.action1_type === 'vm_power' ? 'selected' : ''}>VM Power Action</option>
                                <option value="snapshot" ${data.action1_type === 'snapshot' ? 'selected' : ''}>Create Snapshot</option>
                                <option value="rest_api" ${data.action1_type === 'rest_api' ? 'selected' : ''}>REST API Call</option>
                                <option value="script" ${data.action1_type === 'script' ? 'selected' : ''}>Run Script</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Action 1 Target</label>
                            <input class="form-input" data-field="action1_target" value="${data.action1_target}" placeholder="e.g., admin@example.com or VM name" />
                        </div>
                        <hr style="margin:16px 0;border:none;border-top:1px solid var(--border-light);">
                        <div class="form-group">
                            <label class="form-label">Action 2 (optional)</label>
                            <select class="form-input" data-field="action2_type">
                                <option value="">— None —</option>
                                <option value="email" ${data.action2_type === 'email' ? 'selected' : ''}>Send Email</option>
                                <option value="vm_power" ${data.action2_type === 'vm_power' ? 'selected' : ''}>VM Power Action</option>
                                <option value="snapshot" ${data.action2_type === 'snapshot' ? 'selected' : ''}>Create Snapshot</option>
                                <option value="rest_api" ${data.action2_type === 'rest_api' ? 'selected' : ''}>REST API Call</option>
                                <option value="script" ${data.action2_type === 'script' ? 'selected' : ''}>Run Script</option>
                            </select>
                        </div>
                        ${data.action2_type ? `
                            <div class="form-group">
                                <label class="form-label">Action 2 Target</label>
                                <input class="form-input" data-field="action2_target" value="${data.action2_target}" placeholder="e.g., admin@example.com" />
                            </div>
                        ` : ''}
                    `,
                },
                {
                    label: 'Review',
                    render: (data) => {
                        const actions = [{ type: data.action1_type, target: data.action1_target }];
                        if (data.action2_type) actions.push({ type: data.action2_type, target: data.action2_target });
                        return `<div class="card" style="background:var(--gray-50);border:1px solid var(--border-light);"><div class="card-body">
                            <table style="width:100%;font-size:13px;">
                                <tr><td class="text-secondary" style="padding:6px 12px;width:120px;">Name</td><td style="padding:6px 12px;font-weight:600;">${data.name}</td></tr>
                                <tr><td class="text-secondary" style="padding:6px 12px;">Trigger</td><td style="padding:6px 12px;">${data.trigger_type}${data.trigger_type === 'alert' ? ` (${data.trigger_severity})` : ''}</td></tr>
                                <tr><td class="text-secondary" style="padding:6px 12px;">Actions</td><td style="padding:6px 12px;">${actions.map(a => `${a.type}${a.target ? ` → ${a.target}` : ''}`).join(', ')}</td></tr>
                            </table>
                        </div></div>`;
                    },
                },
            ],
            onComplete: async (data) => {
                const trigger = { type: data.trigger_type };
                if (data.trigger_type === 'alert') trigger.severity = data.trigger_severity;
                if (data.trigger_type === 'event') trigger.event = data.trigger_event;
                if (data.trigger_type === 'schedule') trigger.schedule = data.trigger_schedule;

                const actions = [{ type: data.action1_type, target: data.action1_target }];
                if (data.action2_type) actions.push({ type: data.action2_type, target: data.action2_target });

                await state.create('playbooks', {
                    name: data.name.trim(), trigger, actions, enabled: true, execution_count: 0, last_run: null,
                });
                toast.success(`Playbook "${data.name}" created and enabled`);
            },
        });
        wizard.open();
    }
}
