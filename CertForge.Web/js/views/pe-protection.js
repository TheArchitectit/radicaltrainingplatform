import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { Wizard } from '../components/Wizard.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

/**
 * PE Protection Domains — Data protection management.
 */
export class PeProtectionView extends BaseView {
    #table = null;
    #unsubs = [];

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        const header = document.createElement('div');
        header.className = 'page-title';
        header.innerHTML = `
            <h1>Data Protection</h1>
            <button class="btn btn-primary" id="create-pd-btn">+ Create Protection Domain</button>
        `;
        el.appendChild(header);

        this.#table = new EntityTable({
            columns: [
                { key: 'name', label: 'Name', sortable: true, render: (v) => `<strong>${v}</strong>` },
                {
                    key: 'type', label: 'Type', sortable: true,
                    render: (v) => {
                        const colors = { async: 'good', nearsync: 'warning', metro: 'info' };
                        const labels = { async: 'Async DR', nearsync: 'NearSync', metro: 'Metro Availability' };
                        const cls = colors[v] || 'good';
                        return `<span class="status-badge ${cls}" ${cls === 'info' ? 'style="background:var(--status-info-bg);color:var(--status-info);"' : ''}><span class="dot"></span>${labels[v] || v}</span>`;
                    }
                },
                {
                    key: 'vms', label: 'Protected VMs', sortable: true,
                    render: (val) => {
                        const names = (val || []).map(id => state.getById('vms', id)?.name || id).join(', ');
                        return `<span title="${names}">${(val || []).length} VM(s)</span>`;
                    }
                },
                {
                    key: 'schedule', label: 'Schedule',
                    render: (val) => {
                        if (!val) return '—';
                        const labels = { hourly: 'Every hour', daily: 'Daily', every_15_min: 'Every 15 min', synchronous: 'Synchronous' };
                        return labels[val.interval] || val.interval;
                    }
                },
                { key: 'remote_site', label: 'Remote Site', render: (v) => v || '—' },
            ],
            data: state.protectionDomains,
            searchKeys: ['name'],
            emptyMessage: 'No protection domains configured',
            emptyIcon: '🛡️',
            actions: [
                { label: 'Delete', danger: true, onClick: (pd) => this.#deletePD(pd) },
            ],
        });

        el.appendChild(this.#table.render());
        return el;
    }

    afterRender() {
        document.getElementById('create-pd-btn')?.addEventListener('click', () => this.#openCreateWizard());
        const u1 = bus.on('protection_domains:created', () => this.#table?.setData(state.protectionDomains));
        const u2 = bus.on('protection_domains:deleted', () => this.#table?.setData(state.protectionDomains));
        this.#unsubs.push(u1, u2);
    }

    destroy() { this.#table?.destroy(); this.#unsubs.forEach(u => u()); }

    async #deletePD(pd) {
        const ok = await confirm({ title: 'Delete Protection Domain', message: `Delete <strong>${pd.name}</strong>? Protected VMs will no longer be replicated.`, confirmLabel: 'Delete', danger: true });
        if (ok) { await state.remove('protection_domains', pd.uuid); toast.success(`Protection domain "${pd.name}" deleted`); }
    }

    #openCreateWizard() {
        const vms = state.vms.filter(v => !v.is_cvm);
        const wizard = new Wizard({
            title: 'Create Protection Domain',
            initialData: { name: '', type: 'async', selectedVms: [], interval: 'hourly', retention_local: 3, retention_remote: 2, remote_site: '' },
            steps: [
                {
                    label: 'General',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Protection Domain Name</label>
                            <input class="form-input" data-field="name" value="${data.name}" placeholder="e.g., DR-WebTier" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Protection Type</label>
                            <select class="form-input" data-field="type">
                                <option value="async" ${data.type === 'async' ? 'selected' : ''}>Async DR</option>
                                <option value="nearsync" ${data.type === 'nearsync' ? 'selected' : ''}>NearSync (1-15 min RPO)</option>
                                <option value="metro" ${data.type === 'metro' ? 'selected' : ''}>Metro Availability (0 RPO)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Remote Site</label>
                            <input class="form-input" data-field="remote_site" value="${data.remote_site}" placeholder="e.g., DR-Site-01" />
                        </div>
                    `,
                    validate: (data) => {
                        const e = [];
                        if (!data.name?.trim()) e.push('Name is required');
                        if (!data.remote_site?.trim()) e.push('Remote site is required');
                        return e;
                    },
                },
                {
                    label: 'VMs',
                    render: (data) => `
                        <p class="text-secondary text-sm" style="margin-bottom:12px;">Select VMs to protect:</p>
                        <div style="max-height:300px;overflow-y:auto;border:1px solid var(--border-light);border-radius:4px;">
                            ${vms.map(vm => `
                                <label style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border-light);cursor:pointer;">
                                    <input type="checkbox" class="vm-check" data-vm-id="${vm.uuid}" ${(data.selectedVms || []).includes(vm.uuid) ? 'checked' : ''} />
                                    <span>${vm.name}</span>
                                    <span class="text-secondary text-sm" style="margin-left:auto;">${vm.power_state === 'on' ? '🟢' : '🔴'}</span>
                                </label>
                            `).join('')}
                        </div>
                    `,
                    bind: (body, data) => {
                        body.querySelectorAll('.vm-check').forEach(cb => {
                            cb.addEventListener('change', () => {
                                const selected = [...body.querySelectorAll('.vm-check:checked')].map(c => c.dataset.vmId);
                                data.selectedVms = selected;
                            });
                        });
                    },
                },
                {
                    label: 'Schedule',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Replication Interval</label>
                            <select class="form-input" data-field="interval">
                                <option value="every_15_min" ${data.interval === 'every_15_min' ? 'selected' : ''}>Every 15 minutes</option>
                                <option value="hourly" ${data.interval === 'hourly' ? 'selected' : ''}>Hourly</option>
                                <option value="daily" ${data.interval === 'daily' ? 'selected' : ''}>Daily</option>
                                ${data.type === 'metro' ? '<option value="synchronous" selected>Synchronous</option>' : ''}
                            </select>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                            <div class="form-group">
                                <label class="form-label">Local Retention</label>
                                <input class="form-input" data-field="retention_local" type="number" min="1" max="24" value="${data.retention_local}" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Remote Retention</label>
                                <input class="form-input" data-field="retention_remote" type="number" min="1" max="24" value="${data.retention_remote}" />
                            </div>
                        </div>
                    `,
                },
                {
                    label: 'Review',
                    render: (data) => {
                        const vmNames = (data.selectedVms || []).map(id => state.getById('vms', id)?.name || id).join(', ');
                        return `<div class="card" style="background:var(--gray-50);border:1px solid var(--border-light);"><div class="card-body">
                            <table style="width:100%;font-size:13px;">
                                <tr><td class="text-secondary" style="padding:6px 12px;width:140px;">Name</td><td style="padding:6px 12px;font-weight:600;">${data.name}</td></tr>
                                <tr><td class="text-secondary" style="padding:6px 12px;">Type</td><td style="padding:6px 12px;">${data.type}</td></tr>
                                <tr><td class="text-secondary" style="padding:6px 12px;">Remote Site</td><td style="padding:6px 12px;">${data.remote_site}</td></tr>
                                <tr><td class="text-secondary" style="padding:6px 12px;">VMs</td><td style="padding:6px 12px;">${vmNames || 'None'}</td></tr>
                                <tr><td class="text-secondary" style="padding:6px 12px;">Interval</td><td style="padding:6px 12px;">${data.interval}</td></tr>
                                <tr><td class="text-secondary" style="padding:6px 12px;">Retention</td><td style="padding:6px 12px;">${data.retention_local} local / ${data.retention_remote} remote</td></tr>
                            </table>
                        </div></div>`;
                    },
                },
            ],
            onComplete: async (data) => {
                await state.create('protection_domains', {
                    name: data.name.trim(),
                    type: data.type,
                    vms: data.selectedVms || [],
                    schedule: { interval: data.type === 'metro' ? 'synchronous' : data.interval, retention_local: Number(data.retention_local), retention_remote: Number(data.retention_remote) },
                    remote_site: data.remote_site.trim(),
                });
                toast.success(`Protection domain "${data.name}" created`);
            },
        });
        wizard.open();
    }
}
