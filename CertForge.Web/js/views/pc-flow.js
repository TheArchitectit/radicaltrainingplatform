import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { Wizard } from '../components/Wizard.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

/**
 * PC Flow Security — Network microsegmentation with 5 policy types.
 * Types: Quarantine, Isolation, Application, VDI, Default.
 * Modes: Monitor (log only) ↔ Apply (enforce).
 */
export class PcFlowView extends BaseView {
    #table = null;
    #unsubs = [];

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        const header = document.createElement('div');
        header.className = 'page-title';
        header.innerHTML = `
            <h1>Flow Security Policies</h1>
            <button class="btn btn-primary" id="create-flow-btn">+ Create Policy</button>
        `;
        el.appendChild(header);

        // Summary cards
        const policies = state.getAll('flow_policies');
        const applied = policies.filter(p => p.mode === 'applied').length;
        const monitoring = policies.filter(p => p.mode === 'monitor').length;

        const summary = document.createElement('div');
        summary.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-lg);margin-bottom:var(--space-xl);';
        summary.innerHTML = `
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${policies.length}</div>
                <div class="text-secondary text-sm">Total Policies</div>
            </div></div>
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--status-good);">${applied}</div>
                <div class="text-secondary text-sm">Applied (Enforced)</div>
            </div></div>
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--status-warning);">${monitoring}</div>
                <div class="text-secondary text-sm">Monitoring</div>
            </div></div>
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${this.#countAffectedVMs(policies)}</div>
                <div class="text-secondary text-sm">Affected VMs</div>
            </div></div>
        `;
        el.appendChild(summary);

        this.#table = new EntityTable({
            columns: [
                { key: 'name', label: 'Policy Name', sortable: true, render: (v) => `<strong>${v}</strong>` },
                {
                    key: 'type', label: 'Type', sortable: true,
                    render: (v) => {
                        const icons = { quarantine: '🔒', isolation: '🧱', application: '📋', vdi: '🖥️', default: '🌐' };
                        const labels = { quarantine: 'Quarantine', isolation: 'Isolation', application: 'Application', vdi: 'VDI', default: 'Default' };
                        return `${icons[v] || ''} ${labels[v] || v}`;
                    }
                },
                {
                    key: 'mode', label: 'Mode', sortable: true,
                    render: (v) => {
                        const isApplied = v === 'applied';
                        return `<span class="status-badge ${isApplied ? 'good' : 'warning'}"><span class="dot"></span>${isApplied ? 'Applied' : 'Monitor'}</span>`;
                    }
                },
                {
                    key: 'target_categories', label: 'Target',
                    render: (val) => {
                        if (!val || val.length === 0) return '<span class="text-secondary">All VMs</span>';
                        return val.map(c => `<span class="status-badge" style="background:var(--prism-blue-light);color:var(--prism-blue);font-size:11px;">${c.key}:${c.value}</span>`).join(' ');
                    }
                },
                {
                    key: 'rules', label: 'Rules',
                    render: (val) => `${(val || []).length} rule(s)`
                },
            ],
            data: state.getAll('flow_policies'),
            searchKeys: ['name', 'type'],
            emptyMessage: 'No security policies configured',
            emptyIcon: '🔒',
            actions: [
                {
                    label: 'Toggle Mode',
                    onClick: (policy) => this.#toggleMode(policy),
                },
                {
                    label: 'Delete',
                    danger: true,
                    onClick: (policy) => this.#deletePolicy(policy),
                },
            ],
        });
        el.appendChild(this.#table.render());

        return el;
    }

    afterRender() {
        document.getElementById('create-flow-btn')?.addEventListener('click', () => this.#openCreateWizard());
        const u1 = bus.on('flow_policies:created', () => this.#refresh());
        const u2 = bus.on('flow_policies:updated', () => this.#refresh());
        const u3 = bus.on('flow_policies:deleted', () => this.#refresh());
        this.#unsubs.push(u1, u2, u3);
    }

    destroy() { this.#table?.destroy(); this.#unsubs.forEach(u => u()); }

    #refresh() { this.#table?.setData(state.getAll('flow_policies')); }

    #countAffectedVMs(policies) {
        const vmIds = new Set();
        for (const p of policies) {
            const cats = p.target_categories || [];
            if (cats.length === 0) {
                state.vms.forEach(v => vmIds.add(v.uuid));
            } else {
                for (const vm of state.vms) {
                    for (const tc of cats) {
                        if ((vm.categories || []).some(c => c.key === tc.key && c.value === tc.value)) {
                            vmIds.add(vm.uuid);
                        }
                    }
                }
            }
        }
        return vmIds.size;
    }

    async #toggleMode(policy) {
        const newMode = policy.mode === 'applied' ? 'monitor' : 'applied';
        const action = newMode === 'applied' ? 'enforce' : 'switch to monitoring for';
        const ok = await confirm({
            title: `${newMode === 'applied' ? 'Apply' : 'Monitor'} Policy`,
            message: `Are you sure you want to ${action} <strong>${policy.name}</strong>?${newMode === 'applied' ? '<br><br><strong>Warning:</strong> Enforced policies will actively block traffic that doesn\'t match rules.' : ''}`,
            confirmLabel: newMode === 'applied' ? 'Apply' : 'Set to Monitor',
            danger: newMode === 'applied',
        });
        if (ok) {
            await state.update('flow_policies', policy.uuid, { mode: newMode });
            toast.success(`Policy "${policy.name}" set to ${newMode === 'applied' ? 'Applied (Enforced)' : 'Monitor'} mode`);
        }
    }

    async #deletePolicy(policy) {
        const ok = await confirm({
            title: 'Delete Security Policy',
            message: `Delete <strong>${policy.name}</strong>? All associated rules will be removed.`,
            confirmLabel: 'Delete',
            danger: true,
        });
        if (ok) {
            await state.remove('flow_policies', policy.uuid);
            toast.success(`Policy "${policy.name}" deleted`);
        }
    }

    #openCreateWizard() {
        const categories = state.getAll('categories');
        const wizard = new Wizard({
            title: 'Create Security Policy',
            initialData: {
                name: '', type: 'application', mode: 'monitor',
                target_key: '', target_value: '',
                source_key: '', source_value: '',
                inbound_action: 'allow', outbound_action: 'allow',
                inbound_ports: '', outbound_ports: '',
            },
            steps: [
                {
                    label: 'Policy Type',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Policy Name</label>
                            <input class="form-input" data-field="name" value="${data.name}" placeholder="e.g., WebApp-Security" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Policy Type</label>
                            <select class="form-input" data-field="type">
                                <option value="quarantine" ${data.type === 'quarantine' ? 'selected' : ''}>Quarantine — Isolate compromised VMs</option>
                                <option value="isolation" ${data.type === 'isolation' ? 'selected' : ''}>Isolation — Restrict network segments</option>
                                <option value="application" ${data.type === 'application' ? 'selected' : ''}>Application — Protect app tiers</option>
                                <option value="vdi" ${data.type === 'vdi' ? 'selected' : ''}>VDI — Virtual desktop isolation</option>
                                <option value="default" ${data.type === 'default' ? 'selected' : ''}>Default — Cluster-wide default rules</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Initial Mode</label>
                            <select class="form-input" data-field="mode">
                                <option value="monitor" ${data.mode === 'monitor' ? 'selected' : ''}>Monitor — Log only (recommended for new policies)</option>
                                <option value="applied" ${data.mode === 'applied' ? 'selected' : ''}>Applied — Enforce rules immediately</option>
                            </select>
                        </div>
                    `,
                    validate: (data) => {
                        const errors = [];
                        if (!data.name?.trim()) errors.push('Policy name is required');
                        if (state.getAll('flow_policies').some(p => p.name === data.name?.trim())) errors.push('A policy with this name already exists');
                        return errors;
                    },
                },
                {
                    label: 'Targets',
                    render: (data) => `
                        <p class="text-secondary text-sm" style="margin-bottom:12px;">Select which VMs this policy applies to using categories. Leave blank to apply to all VMs.</p>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                            <div class="form-group">
                                <label class="form-label">Target Category Key</label>
                                <select class="form-input" data-field="target_key">
                                    <option value="">— All VMs —</option>
                                    ${categories.map(c => `<option value="${c.key}" ${c.key === data.target_key ? 'selected' : ''}>${c.key}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Target Value</label>
                                <select class="form-input target-value-select" data-field="target_value">
                                    <option value="">— Any —</option>
                                    ${data.target_key ? (categories.find(c => c.key === data.target_key)?.values || []).map(v => `<option value="${v}" ${v === data.target_value ? 'selected' : ''}>${v}</option>`).join('') : ''}
                                </select>
                            </div>
                        </div>
                        ${data.type === 'application' ? `
                            <hr style="margin:16px 0;border:none;border-top:1px solid var(--border-light);">
                            <p class="text-secondary text-sm" style="margin-bottom:12px;">Source (allowed inbound traffic):</p>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                                <div class="form-group">
                                    <label class="form-label">Source Category Key</label>
                                    <select class="form-input" data-field="source_key">
                                        <option value="">— Any —</option>
                                        ${categories.map(c => `<option value="${c.key}" ${c.key === data.source_key ? 'selected' : ''}>${c.key}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Source Value</label>
                                    <input class="form-input" data-field="source_value" value="${data.source_value}" placeholder="e.g., Web" />
                                </div>
                            </div>
                        ` : ''}
                    `,
                },
                {
                    label: 'Rules',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Inbound Rules</label>
                            <select class="form-input" data-field="inbound_action">
                                <option value="allow" ${data.inbound_action === 'allow' ? 'selected' : ''}>Allow All</option>
                                <option value="deny" ${data.inbound_action === 'deny' ? 'selected' : ''}>Deny All</option>
                                <option value="whitelist" ${data.inbound_action === 'whitelist' ? 'selected' : ''}>Whitelist (specify ports)</option>
                            </select>
                        </div>
                        ${data.inbound_action === 'whitelist' ? `
                            <div class="form-group">
                                <label class="form-label">Allowed Inbound Ports (comma-separated)</label>
                                <input class="form-input" data-field="inbound_ports" value="${data.inbound_ports}" placeholder="e.g., 80, 443, 22" />
                            </div>
                        ` : ''}
                        <div class="form-group">
                            <label class="form-label">Outbound Rules</label>
                            <select class="form-input" data-field="outbound_action">
                                <option value="allow" ${data.outbound_action === 'allow' ? 'selected' : ''}>Allow All</option>
                                <option value="deny" ${data.outbound_action === 'deny' ? 'selected' : ''}>Deny All</option>
                                <option value="whitelist" ${data.outbound_action === 'whitelist' ? 'selected' : ''}>Whitelist (specify ports)</option>
                            </select>
                        </div>
                        ${data.outbound_action === 'whitelist' ? `
                            <div class="form-group">
                                <label class="form-label">Allowed Outbound Ports (comma-separated)</label>
                                <input class="form-input" data-field="outbound_ports" value="${data.outbound_ports}" placeholder="e.g., 53, 123, 443" />
                            </div>
                        ` : ''}
                    `,
                },
                {
                    label: 'Review',
                    render: (data) => {
                        const targetLabel = data.target_key ? `${data.target_key}:${data.target_value || '*'}` : 'All VMs';
                        return `<div class="card" style="background:var(--gray-50);border:1px solid var(--border-light);"><div class="card-body">
                            <table style="width:100%;font-size:13px;">
                                <tr><td class="text-secondary" style="padding:6px 12px;width:140px;">Name</td><td style="padding:6px 12px;font-weight:600;">${data.name}</td></tr>
                                <tr><td class="text-secondary" style="padding:6px 12px;">Type</td><td style="padding:6px 12px;">${data.type}</td></tr>
                                <tr><td class="text-secondary" style="padding:6px 12px;">Mode</td><td style="padding:6px 12px;">${data.mode === 'applied' ? '⚠️ Applied (Enforcing)' : '👁️ Monitor'}</td></tr>
                                <tr><td class="text-secondary" style="padding:6px 12px;">Target</td><td style="padding:6px 12px;">${targetLabel}</td></tr>
                                <tr><td class="text-secondary" style="padding:6px 12px;">Inbound</td><td style="padding:6px 12px;">${data.inbound_action}${data.inbound_ports ? ` (ports: ${data.inbound_ports})` : ''}</td></tr>
                                <tr><td class="text-secondary" style="padding:6px 12px;">Outbound</td><td style="padding:6px 12px;">${data.outbound_action}${data.outbound_ports ? ` (ports: ${data.outbound_ports})` : ''}</td></tr>
                            </table>
                        </div></div>`;
                    },
                },
            ],
            onComplete: async (data) => {
                const rules = [];
                if (data.inbound_action !== 'allow') {
                    rules.push({
                        direction: 'inbound', action: data.inbound_action,
                        ports: data.inbound_action === 'whitelist' ? data.inbound_ports.split(',').map(p => p.trim()).filter(Boolean) : [],
                    });
                }
                if (data.outbound_action !== 'allow') {
                    rules.push({
                        direction: 'outbound', action: data.outbound_action,
                        ports: data.outbound_action === 'whitelist' ? data.outbound_ports.split(',').map(p => p.trim()).filter(Boolean) : [],
                    });
                }

                const target_categories = data.target_key ? [{ key: data.target_key, value: data.target_value || '*' }] : [];
                const source_categories = data.source_key ? [{ key: data.source_key, value: data.source_value || '*' }] : [];

                await state.create('flow_policies', {
                    name: data.name.trim(),
                    type: data.type,
                    mode: data.mode,
                    target_categories,
                    source_categories,
                    rules,
                });
                toast.success(`Security policy "${data.name}" created in ${data.mode} mode`);
            },
        });
        wizard.open();
    }
}
