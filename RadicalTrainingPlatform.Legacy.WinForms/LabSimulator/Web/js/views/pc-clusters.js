import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { Wizard } from '../components/Wizard.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

/**
 * PC Clusters — Multi-cluster federation management.
 * Register PE clusters, view health, and manage cross-cluster operations.
 */
export class PcClustersView extends BaseView {
    #table = null;
    #unsubs = [];

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        const clusters = state.getAll('registered_clusters');
        const healthy = clusters.filter(c => c.status === 'healthy').length;
        const totalNodes = clusters.reduce((s, c) => s + (c.node_count || 0), 0);
        const totalVMs = clusters.reduce((s, c) => s + (c.vm_count || 0), 0);

        el.innerHTML = `
            <div class="page-title">
                <h1>🏢 Multi-Cluster Management</h1>
                <button class="btn btn-primary" id="register-cluster-btn">+ Register Cluster</button>
            </div>

            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:var(--space-lg);">
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--blue-500);">${clusters.length}</div>
                    <div class="text-secondary text-sm">Registered Clusters</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--green-500);">${healthy}</div>
                    <div class="text-secondary text-sm">Healthy</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;">${totalNodes}</div>
                    <div class="text-secondary text-sm">Total Nodes</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;">${totalVMs}</div>
                    <div class="text-secondary text-sm">Total VMs</div>
                </div></div>
            </div>

            <div id="clusters-table"></div>
        `;

        return el;
    }

    afterRender() {
        this.#buildTable();

        document.getElementById('register-cluster-btn')?.addEventListener('click', () => this.#openRegisterWizard());

        const unsub = bus.on('registered_clusters:created', () => this.#buildTable());
        const unsub2 = bus.on('registered_clusters:updated', () => this.#buildTable());
        const unsub3 = bus.on('registered_clusters:deleted', () => this.#buildTable());
        this.#unsubs.push(unsub, unsub2, unsub3);
    }

    destroy() {
        this.#table?.destroy();
        this.#unsubs.forEach(u => u());
    }

    #buildTable() {
        const container = document.getElementById('clusters-table');
        if (!container) return;
        this.#table?.destroy();

        this.#table = new EntityTable({
            columns: [
                {
                    key: 'name', label: 'Cluster Name', sortable: true,
                    render: (val) => `<strong>${this.#esc(val)}</strong>`
                },
                {
                    key: 'status', label: 'Status', sortable: true,
                    render: (val) => {
                        const cls = val === 'healthy' ? 'good' : val === 'degraded' ? 'warning' : 'critical';
                        return `<span class="status-badge ${cls}"><span class="dot"></span>${val}</span>`;
                    }
                },
                { key: 'vip', label: 'Cluster VIP', render: (val) => `<span class="font-mono">${val || '—'}</span>` },
                { key: 'version', label: 'AOS Version' },
                { key: 'node_count', label: 'Nodes' },
                { key: 'vm_count', label: 'VMs' },
                { key: 'hypervisor', label: 'Hypervisor' },
                { key: 'rf', label: 'RF', render: (val) => `RF${val}` },
                {
                    key: 'storage_usage', label: 'Storage',
                    render: (val, item) => {
                        const pct = item.storage_capacity ? Math.round((val / item.storage_capacity) * 100) : 0;
                        const color = pct > 80 ? 'var(--red-500)' : pct > 60 ? 'var(--yellow-500)' : 'var(--green-500)';
                        return `<div style="display:flex;align-items:center;gap:8px;">
                            <div style="width:60px;height:6px;background:var(--gray-200);border-radius:3px;">
                                <div style="width:${pct}%;height:100%;background:${color};border-radius:3px;"></div>
                            </div>
                            <span class="text-sm">${pct}%</span>
                        </div>`;
                    }
                },
            ],
            data: state.getAll('registered_clusters'),
            searchKeys: ['name', 'vip', 'version'],
            selectable: true,
            emptyMessage: 'No clusters registered. Add a Prism Element cluster to begin multi-cluster management.',
            emptyIcon: '🏢',
            actions: [
                {
                    label: 'Health Check', onClick: async (cluster) => {
                        const statuses = ['healthy', 'healthy', 'healthy', 'degraded'];
                        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
                        await state.update('registered_clusters', cluster.uuid, { status: newStatus, last_health_check: new Date().toISOString() });
                        toast.success(`Health check on "${cluster.name}": ${newStatus}`);
                    }
                },
                {
                    label: 'Unregister', danger: true, onClick: async (cluster) => {
                        const ok = await confirm({
                            title: 'Unregister Cluster',
                            message: `Unregister <strong>${cluster.name}</strong> from Prism Central?`,
                            confirmLabel: 'Unregister', danger: true,
                        });
                        if (ok) {
                            await state.remove('registered_clusters', cluster.uuid);
                            toast.success(`"${cluster.name}" unregistered`);
                        }
                    }
                },
            ],
        });

        container.innerHTML = '';
        container.appendChild(this.#table.render());
    }

    #openRegisterWizard() {
        const wizard = new Wizard({
            title: 'Register Prism Element Cluster',
            initialData: { name: '', vip: '', version: 'AOS 6.10.1.2', hypervisor: 'AHV', node_count: 4, rf: 2 },
            steps: [
                {
                    label: 'Cluster Details',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Cluster Name</label>
                            <input class="form-input" data-field="name" value="${data.name}" placeholder="e.g., NTNX-Site-B" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Cluster Virtual IP</label>
                            <input class="form-input" data-field="vip" value="${data.vip}" placeholder="e.g., 10.42.200.37" />
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                            <div class="form-group">
                                <label class="form-label">AOS Version</label>
                                <select class="form-input" data-field="version">
                                    <option ${data.version === 'AOS 6.10.1.2' ? 'selected' : ''}>AOS 6.10.1.2</option>
                                    <option ${data.version === 'AOS 6.8.1' ? 'selected' : ''}>AOS 6.8.1</option>
                                    <option ${data.version === 'AOS 6.5.5' ? 'selected' : ''}>AOS 6.5.5</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Hypervisor</label>
                                <select class="form-input" data-field="hypervisor">
                                    <option>AHV</option>
                                    <option>ESXi</option>
                                    <option>Hyper-V</option>
                                </select>
                            </div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                            <div class="form-group">
                                <label class="form-label">Number of Nodes</label>
                                <input class="form-input" data-field="node_count" type="number" min="1" max="32" value="${data.node_count}" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Replication Factor</label>
                                <select class="form-input" data-field="rf">
                                    <option value="2" ${data.rf == 2 ? 'selected' : ''}>RF2</option>
                                    <option value="3" ${data.rf == 3 ? 'selected' : ''}>RF3</option>
                                </select>
                            </div>
                        </div>
                    `,
                    validate: (data) => {
                        const errors = [];
                        if (!data.name?.trim()) errors.push('Cluster name is required');
                        if (!data.vip?.trim()) errors.push('Cluster VIP is required');
                        if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(data.vip?.trim())) errors.push('VIP must be a valid IP address');
                        return errors;
                    },
                },
            ],
            onComplete: async (data) => {
                const vmCount = Math.floor(Math.random() * 20) + 5;
                const storageUsed = +(Math.random() * 30 + 5).toFixed(1);
                await state.create('registered_clusters', {
                    name: data.name.trim(),
                    vip: data.vip.trim(),
                    version: data.version,
                    hypervisor: data.hypervisor,
                    node_count: parseInt(data.node_count) || 4,
                    rf: parseInt(data.rf) || 2,
                    vm_count: vmCount,
                    status: 'healthy',
                    storage_usage: storageUsed,
                    storage_capacity: 48.0,
                    last_health_check: new Date().toISOString(),
                });
                toast.success(`Cluster "${data.name}" registered successfully`);
            },
        });
        wizard.open();
    }

    #esc(str) { return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
}
