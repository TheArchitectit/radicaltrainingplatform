import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { Wizard } from '../components/Wizard.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

/**
 * PC Alerts — Alert management, alert policies, SNMP/Syslog configuration.
 * Shows active/resolved alerts with severity filtering.
 */
export class PcAlertsView extends BaseView {
    #table = null;
    #unsubs = [];
    #activeTab = 'alerts';

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        const header = document.createElement('div');
        header.className = 'page-title';
        header.innerHTML = `
            <h1>Alert Management</h1>
            <button class="btn btn-primary" id="alert-create-btn">+ Create Alert Policy</button>
        `;
        el.appendChild(header);

        const tabs = document.createElement('div');
        tabs.className = 'tabs';
        tabs.innerHTML = `
            <button class="tab active" data-tab="alerts">Alerts</button>
            <button class="tab" data-tab="policies">Alert Policies</button>
            <button class="tab" data-tab="config">SNMP / Syslog</button>
        `;
        el.appendChild(tabs);

        const content = document.createElement('div');
        content.id = 'alert-content';
        el.appendChild(content);

        return el;
    }

    afterRender() {
        this.#renderTab(this.#activeTab);

        document.querySelectorAll('.tabs .tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.#activeTab = tab.dataset.tab;
                this.#renderTab(this.#activeTab);
            });
        });

        document.getElementById('alert-create-btn')?.addEventListener('click', () => this.#createPolicy());

        this.#unsubs.push(
            bus.on('alerts:created', () => this.#renderTab(this.#activeTab)),
            bus.on('alerts:updated', () => this.#renderTab(this.#activeTab)),
            bus.on('alert_policies:created', () => this.#renderTab(this.#activeTab)),
        );
    }

    destroy() { this.#unsubs.forEach(fn => fn()); }

    #renderTab(tab) {
        const container = document.getElementById('alert-content');
        if (!container) return;
        container.innerHTML = '';

        if (tab === 'alerts') this.#renderAlerts(container);
        else if (tab === 'policies') this.#renderPolicies(container);
        else this.#renderConfig(container);
    }

    #renderAlerts(container) {
        const alerts = state.getAll('alerts');
        const critical = alerts.filter(a => a.severity === 'critical' && !a.resolved).length;
        const warning = alerts.filter(a => a.severity === 'warning' && !a.resolved).length;
        const info = alerts.filter(a => a.severity === 'info' && !a.resolved).length;
        const resolved = alerts.filter(a => a.resolved).length;

        const summary = document.createElement('div');
        summary.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-lg);margin:var(--space-lg) 0;';
        summary.innerHTML = `
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--status-critical);">${critical}</div>
                <div class="text-secondary text-sm">Critical</div>
            </div></div>
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--status-warning);">${warning}</div>
                <div class="text-secondary text-sm">Warning</div>
            </div></div>
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${info}</div>
                <div class="text-secondary text-sm">Info</div>
            </div></div>
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--status-good);">${resolved}</div>
                <div class="text-secondary text-sm">Resolved</div>
            </div></div>
        `;
        container.appendChild(summary);

        this.#table = new EntityTable({
            columns: [
                { key: 'severity', label: 'Severity', render: v => {
                    const colors = { critical: 'var(--status-critical)', warning: 'var(--status-warning)', info: 'var(--prism-blue)' };
                    return `<span style="color:${colors[v] || 'inherit'};font-weight:600;text-transform:uppercase;">${v}</span>`;
                }},
                { key: 'title', label: 'Alert' },
                { key: 'entity', label: 'Entity' },
                { key: 'created_at', label: 'Time', render: v => new Date(v).toLocaleString() },
                { key: 'resolved', label: 'Status', render: v => v ? '<span style="color:var(--status-good);">Resolved</span>' : '<span style="color:var(--status-warning);">Active</span>' },
            ],
            data: alerts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
            searchKeys: ['title', 'entity', 'severity'],
            selectable: true,
            actions: [
                { label: '✅ Resolve', onClick: (item) => this.#resolveAlerts([item]) },
                { label: '🔄 Acknowledge', onClick: (item) => this.#acknowledgeAlerts([item]) },
            ],
        });
        container.appendChild(this.#table.render());
    }

    #renderPolicies(container) {
        const policies = state.getAll('alert_policies');

        this.#table = new EntityTable({
            columns: [
                { key: 'name', label: 'Policy Name' },
                { key: 'entity_type', label: 'Entity Type', render: v => `<span class="badge">${v}</span>` },
                { key: 'severity_filter', label: 'Severity Filter', render: v => (v || []).join(', ') },
                { key: 'action', label: 'Action', render: v => v === 'email' ? '📧 Email' : v === 'snmp' ? '📡 SNMP Trap' : v === 'syslog' ? '📋 Syslog' : v },
                { key: 'enabled', label: 'Enabled', render: v => v ? '✅' : '❌' },
            ],
            data: policies,
            searchKeys: ['name', 'entity_type'],
            selectable: true,
            actions: [
                { label: '🗑️ Delete', variant: 'danger', onClick: (item) => this.#deletePolicies([item]) },
            ],
            emptyMessage: 'No alert policies configured.',
        });
        container.appendChild(this.#table.render());
    }

    #renderConfig(container) {
        const cfg = state.getAll('pc_settings')[0] || {};

        const card = document.createElement('div');
        card.className = 'card';
        card.style.marginTop = 'var(--space-lg)';
        card.innerHTML = `
            <div class="card-header">SNMP Configuration</div>
            <div class="card-body">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-lg);margin-bottom:var(--space-lg);">
                    <div>
                        <label style="font-weight:600;display:block;margin-bottom:4px;">SNMP Version</label>
                        <select id="snmp-ver" style="width:100%;padding:8px;border:1px solid var(--border-subtle);border-radius:4px;background:var(--surface-secondary);color:var(--text-primary);">
                            <option value="v2c">SNMPv2c</option>
                            <option value="v3">SNMPv3</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-weight:600;display:block;margin-bottom:4px;">Community String</label>
                        <input type="text" value="public" style="width:100%;padding:8px;border:1px solid var(--border-subtle);border-radius:4px;background:var(--surface-secondary);color:var(--text-primary);"/>
                    </div>
                </div>
                <div style="margin-bottom:var(--space-md);">
                    <label style="font-weight:600;display:block;margin-bottom:4px;">Trap Receivers (one per line)</label>
                    <textarea rows="3" style="width:100%;padding:8px;border:1px solid var(--border-subtle);border-radius:4px;background:var(--surface-secondary);color:var(--text-primary);font-family:monospace;">10.42.100.100:162</textarea>
                </div>
                <button class="btn btn-primary" onclick="alert('SNMP config saved (simulated).')">Save SNMP</button>
            </div>
        `;
        container.appendChild(card);

        const syslog = document.createElement('div');
        syslog.className = 'card';
        syslog.style.marginTop = 'var(--space-lg)';
        syslog.innerHTML = `
            <div class="card-header">Syslog Configuration</div>
            <div class="card-body">
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-lg);margin-bottom:var(--space-lg);">
                    <div>
                        <label style="font-weight:600;display:block;margin-bottom:4px;">Server Address</label>
                        <input type="text" value="${cfg.syslog_server || ''}" placeholder="10.42.100.200" style="width:100%;padding:8px;border:1px solid var(--border-subtle);border-radius:4px;background:var(--surface-secondary);color:var(--text-primary);"/>
                    </div>
                    <div>
                        <label style="font-weight:600;display:block;margin-bottom:4px;">Port</label>
                        <input type="number" value="514" style="width:100%;padding:8px;border:1px solid var(--border-subtle);border-radius:4px;background:var(--surface-secondary);color:var(--text-primary);"/>
                    </div>
                    <div>
                        <label style="font-weight:600;display:block;margin-bottom:4px;">Protocol</label>
                        <select style="width:100%;padding:8px;border:1px solid var(--border-subtle);border-radius:4px;background:var(--surface-secondary);color:var(--text-primary);">
                            <option>UDP</option>
                            <option>TCP</option>
                            <option>TCP+TLS</option>
                        </select>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="alert('Syslog config saved (simulated).')">Save Syslog</button>
            </div>
        `;
        container.appendChild(syslog);
    }

    #createPolicy() {
        const wizard = new Wizard({
            title: 'Create Alert Policy',
            initialData: { name: '', entity_type: 'VM', severity: 'Critical Only', action: 'Email' },
            steps: [
                {
                    label: 'Policy Details',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Policy Name</label>
                            <input class="form-input" data-field="name" value="${data.name}" placeholder="e.g. Critical-Alerts-Email" />
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                            <div class="form-group">
                                <label class="form-label">Entity Type</label>
                                <select class="form-input" data-field="entity_type">
                                    ${['VM', 'Host', 'Cluster', 'Storage Container', 'Network', 'All'].map(o => `<option ${data.entity_type === o ? 'selected' : ''}>${o}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Severity Filter</label>
                                <select class="form-input" data-field="severity">
                                    ${['Critical Only', 'Warning & Critical', 'All'].map(o => `<option ${data.severity === o ? 'selected' : ''}>${o}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Action</label>
                            <select class="form-input" data-field="action">
                                ${['Email', 'SNMP Trap', 'Syslog', 'Webhook'].map(o => `<option ${data.action === o ? 'selected' : ''}>${o}</option>`).join('')}
                            </select>
                        </div>
                    `,
                    validate: (data) => {
                        const errors = [];
                        if (!data.name?.trim()) errors.push('Policy name is required');
                        return errors;
                    },
                },
            ],
            onComplete: async (data) => {
                const sevMap = { 'Critical Only': ['critical'], 'Warning & Critical': ['warning', 'critical'], 'All': ['info', 'warning', 'critical'] };
                const actMap = { 'Email': 'email', 'SNMP Trap': 'snmp', 'Syslog': 'syslog', 'Webhook': 'webhook' };
                await state.create('alert_policies', {
                    name: data.name,
                    entity_type: data.entity_type,
                    severity_filter: sevMap[data.severity] || ['critical'],
                    action: actMap[data.action] || 'email',
                    enabled: true,
                });
                toast(`Alert policy "${data.name}" created.`, 'success');
            },
        });
        wizard.open();
    }

    async #resolveAlerts(selected) {
        if (!selected || selected.length === 0) { toast('Select alerts to resolve.', 'warning'); return; }
        const active = selected.filter(a => !a.resolved);
        if (active.length === 0) { toast('Selected alerts are already resolved.', 'info'); return; }

        for (const alert of active) {
            await state.update('alerts', alert.uuid, { resolved: true, resolved_at: new Date().toISOString() });
        }
        toast(`Resolved ${active.length} alert(s).`, 'success');
    }

    async #acknowledgeAlerts(selected) {
        if (!selected || selected.length === 0) { toast('Select alerts to acknowledge.', 'warning'); return; }
        for (const alert of selected) {
            await state.update('alerts', alert.uuid, { acknowledged: true });
        }
        toast(`Acknowledged ${selected.length} alert(s).`, 'success');
    }

    async #deletePolicies(selected) {
        if (!selected || selected.length === 0) { toast('Select policies first.', 'warning'); return; }
        const ok = await confirm({ title: 'Delete Policies', message: `Delete ${selected.length} alert policy(ies)?`, confirmLabel: 'Delete', danger: true });
        if (!ok) return;
        for (const p of selected) { await state.remove('alert_policies', p.uuid); }
        toast(`Deleted ${selected.length} policy(ies).`, 'success');
        this.#renderTab(this.#activeTab);
    }
}
