import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { Wizard } from '../components/Wizard.js';
import { toast } from '../components/Toast.js';

export class CiScalingView extends BaseView {
    #table = null;
    #activeTab = 'clusters';
    #unsubs = [];

    async render() {
        return this.html(`
            <div class="view">
                <h2 class="page-title">NC2 Cluster Scaling</h2>
                <div id="ci-scale-summary"></div>
                <div class="tabs" id="ci-scale-tabs">
                    <button class="tab active" data-tab="clusters">Clusters</button>
                    <button class="tab" data-tab="history">Scaling History</button>
                    <button class="tab" data-tab="policies">Auto-Scale Policies</button>
                </div>
                <div id="ci-scale-content" style="margin-top:var(--space-lg);"></div>
            </div>
        `);
    }

    afterRender() {
        this.#renderSummary();
        this.#renderTab();

        document.getElementById('ci-scale-tabs')?.addEventListener('click', (e) => {
            const tab = e.target.closest('[data-tab]');
            if (!tab) return;
            document.querySelectorAll('#ci-scale-tabs .tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            this.#activeTab = tab.dataset.tab;
            this.#renderTab();
        });

        this.#unsubs.push(
            bus.on('nc2_clusters:updated', () => this.#refresh()),
            bus.on('nc2_scaling_history:created', () => this.#refresh()),
            bus.on('nc2_autoscale_policies:created', () => this.#refresh()),
            bus.on('nc2_autoscale_policies:updated', () => this.#refresh())
        );
    }

    #getClusters() {
        return state.getAll('nc2_clusters') || [];
    }

    #getHistory() {
        return state.getAll('nc2_scaling_history') || [];
    }

    #getPolicies() {
        return state.getAll('nc2_autoscale_policies') || [];
    }

    #renderSummary() {
        const clusters = this.#getClusters();
        const totalNodes = clusters.reduce((s, c) => s + (c.node_count || 0), 0);
        const history = this.#getHistory();
        const pending = history.filter(h => h.status === 'in_progress').length;
        const policies = this.#getPolicies();

        const container = document.getElementById('ci-scale-summary');
        if (!container) return;
        container.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:var(--space-lg);">
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${totalNodes}</div>
                    <div class="text-secondary text-sm">Total Cloud Nodes</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--status-good);">${history.length}</div>
                    <div class="text-secondary text-sm">Scaling Events (30d)</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--status-warning);">${pending}</div>
                    <div class="text-secondary text-sm">Pending Operations</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--text-secondary);">${policies.length}</div>
                    <div class="text-secondary text-sm">Auto-Scale Policies</div>
                </div></div>
            </div>
        `;
    }

    #renderTab() {
        switch (this.#activeTab) {
            case 'clusters': this.#renderClustersTab(); break;
            case 'history':  this.#renderHistoryTab();  break;
            case 'policies': this.#renderPoliciesTab(); break;
        }
    }

    // ── Clusters Tab ──

    #renderClustersTab() {
        const container = document.getElementById('ci-scale-content');
        if (!container) return;
        this.#table?.destroy();

        const clusters = this.#getClusters().map(c => ({
            ...c,
            min_nodes: c.min_nodes ?? 2,
            max_nodes: c.max_nodes ?? 16
        }));

        this.#table = new EntityTable({
            columns: [
                { key: 'name', label: 'Cluster Name', sortable: true },
                { key: 'provider', label: 'Provider', sortable: true, render: (v) => `<span class="badge">${v}</span>` },
                { key: 'node_count', label: 'Current Nodes', sortable: true },
                { key: 'min_nodes', label: 'Min Nodes', sortable: false },
                { key: 'max_nodes', label: 'Max Nodes', sortable: false },
                {
                    key: 'status', label: 'Status', sortable: true,
                    render: (v) => {
                        const c = v === 'running' ? 'var(--status-good)' : 'var(--status-warning)';
                        return `<span class="badge" style="background:${c};color:var(--text-inverse);">${v}</span>`;
                    }
                }
            ],
            data: clusters,
            searchKeys: ['name', 'provider', 'status'],
            emptyMessage: 'No NC2 clusters configured',
            emptyIcon: '☁️',
            actions: [
                { label: 'Scale Up',   onClick: (item) => this.#openScaleWizard(item, 'scale_up') },
                { label: 'Scale Down', onClick: (item) => this.#openScaleWizard(item, 'scale_down') }
            ]
        });

        container.innerHTML = '';
        container.appendChild(this.#table.render());
    }

    #openScaleWizard(cluster, action) {
        const isUp = action === 'scale_up';
        const wizard = new Wizard({
            title: `${isUp ? 'Scale Up' : 'Scale Down'} — ${cluster.name}`,
            initialData: {},
            steps: [
                {
                    label: 'Scale Configuration',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Current Nodes</label>
                            <div style="font-size:24px;font-weight:700;color:var(--prism-blue);margin-bottom:12px;">${cluster.node_count}</div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Target Node Count</label>
                            <input class="form-input" data-field="target_nodes" type="number"
                                value="${data.target_nodes || cluster.node_count}"
                                min="${isUp ? cluster.node_count + 1 : 1}"
                                max="${isUp ? (cluster.max_nodes ?? 16) : cluster.node_count - 1}" />
                        </div>
                        <div class="text-secondary text-sm" style="margin-top:12px;padding:8px;background:var(--border-light);border-radius:4px;">
                            ⚠️ ${isUp
                                ? 'Adding nodes will increase your hourly billing rate. New nodes typically take 10–15 minutes to become available.'
                                : 'Removing nodes will migrate workloads automatically. Ensure sufficient capacity remains for running VMs.'}
                        </div>
                    `,
                    validate: (data) => {
                        const errors = [];
                        const target = parseInt(data.target_nodes);
                        if (isNaN(target) || target < 1) {
                            errors.push('Target node count must be at least 1');
                        } else if (isUp && target <= cluster.node_count) {
                            errors.push('Target must be greater than current node count');
                        } else if (!isUp && target >= cluster.node_count) {
                            errors.push('Target must be less than current node count');
                        }
                        return errors;
                    }
                }
            ],
            onComplete: async (data) => {
                const target = parseInt(data.target_nodes);
                await state.update('nc2_clusters', cluster.uuid, { node_count: target });
                await state.create('nc2_scaling_history', {
                    cluster: cluster.name,
                    action,
                    from_nodes: cluster.node_count,
                    to_nodes: target,
                    initiated_by: 'admin@ntnxlab.local',
                    status: 'completed',
                    timestamp: new Date().toISOString()
                });
                toast.success(`${cluster.name} scaled from ${cluster.node_count} to ${target} nodes`);
            }
        });
        wizard.open();
    }

    // ── Scaling History Tab ──

    #renderHistoryTab() {
        const container = document.getElementById('ci-scale-content');
        if (!container) return;
        this.#table?.destroy();

        this.#table = new EntityTable({
            columns: [
                { key: 'cluster', label: 'Cluster', sortable: true },
                {
                    key: 'action', label: 'Action', sortable: true,
                    render: (v) => {
                        const color = v === 'scale_up' ? 'var(--status-good)' : 'var(--status-warning)';
                        return `<span class="badge" style="background:${color};color:var(--text-inverse);">${v === 'scale_up' ? '↑ Scale Up' : '↓ Scale Down'}</span>`;
                    }
                },
                { key: 'from_nodes', label: 'From Nodes', sortable: false },
                { key: 'to_nodes', label: 'To Nodes', sortable: false },
                { key: 'initiated_by', label: 'Initiated By', sortable: true },
                {
                    key: 'status', label: 'Status', sortable: true,
                    render: (v) => {
                        const colors = { completed: 'var(--status-good)', in_progress: 'var(--prism-blue)', failed: 'var(--status-critical)' };
                        return `<span class="badge" style="background:${colors[v] || 'var(--text-secondary)'};color:var(--text-inverse);">${v}</span>`;
                    }
                },
                { key: 'timestamp', label: 'Timestamp', sortable: true, render: (v) => v ? new Date(v).toLocaleString() : '—' }
            ],
            data: this.#getHistory(),
            searchKeys: ['cluster', 'action', 'initiated_by', 'status'],
            emptyMessage: 'No scaling events recorded',
            emptyIcon: '📈'
        });

        container.innerHTML = '';
        container.appendChild(this.#table.render());
    }

    // ── Auto-Scale Policies Tab ──

    #renderPoliciesTab() {
        const container = document.getElementById('ci-scale-content');
        if (!container) return;
        this.#table?.destroy();
        this.#table = null;

        const policies = this.#getPolicies();

        container.innerHTML = `
            <div style="display:flex;justify-content:flex-end;margin-bottom:var(--space-lg);">
                <button class="btn btn-primary" id="create-policy-btn">+ Create Policy</button>
            </div>
            <div id="policies-grid"></div>
        `;

        const grid = document.getElementById('policies-grid');
        if (policies.length === 0) {
            grid.innerHTML = `
                <div class="card"><div class="card-body" style="text-align:center;padding:var(--space-xl);">
                    <div style="font-size:48px;margin-bottom:16px;">⚖️</div>
                    <h3>No Auto-Scale Policies</h3>
                    <p class="text-secondary">Create a policy to automatically scale NC2 clusters based on resource utilization thresholds.</p>
                </div></div>
            `;
        } else {
            grid.innerHTML = `
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px;">
                    ${policies.map(p => {
                        const enabledColor = p.enabled ? 'var(--status-good)' : 'var(--text-secondary)';
                        return `
                            <div class="card">
                                <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
                                    <span style="font-weight:600;">${p.name}</span>
                                    <span class="badge" style="background:${enabledColor};color:var(--text-inverse);">${p.enabled ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                <div class="card-body">
                                    <div class="form-group" style="margin-bottom:8px;">
                                        <span class="text-secondary text-sm">Cluster:</span> ${p.cluster}
                                    </div>
                                    <div class="form-group" style="margin-bottom:8px;">
                                        <span class="text-secondary text-sm">Metric:</span> ${p.metric} &ge; ${p.threshold}%
                                    </div>
                                    <div class="form-group" style="margin-bottom:8px;">
                                        <span class="text-secondary text-sm">Action:</span>
                                        <span class="badge">${p.action === 'add_node' ? '↑ Add Node' : '↓ Remove Node'}</span>
                                    </div>
                                    <div class="form-group" style="margin-bottom:8px;">
                                        <span class="text-secondary text-sm">Cooldown:</span> ${p.cooldown_min || 5} min
                                    </div>
                                    <button class="btn" style="width:100%;margin-top:8px;" data-toggle-policy="${p.uuid}">
                                        ${p.enabled ? 'Disable' : 'Enable'}
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        document.getElementById('create-policy-btn')?.addEventListener('click', () => this.#openPolicyWizard());

        container.querySelectorAll('[data-toggle-policy]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const uuid = btn.dataset.togglePolicy;
                const policy = state.getById('nc2_autoscale_policies', uuid);
                if (policy) {
                    await state.update('nc2_autoscale_policies', uuid, { enabled: !policy.enabled });
                    toast.success(`Policy "${policy.name}" ${policy.enabled ? 'disabled' : 'enabled'}`);
                    this.#renderPoliciesTab();
                }
            });
        });
    }

    #openPolicyWizard() {
        const clusters = this.#getClusters();
        const wizard = new Wizard({
            title: 'Create Auto-Scale Policy',
            initialData: {},
            steps: [
                {
                    label: 'Policy Configuration',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Policy Name</label>
                            <input class="form-input" data-field="name" type="text" value="${data.name || ''}" placeholder="e.g. Prod CPU Scale-Out" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Cluster</label>
                            <select class="form-input" data-field="cluster">
                                <option value="">Select cluster…</option>
                                ${clusters.map(c => `<option value="${c.name}" ${data.cluster === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Metric</label>
                            <select class="form-input" data-field="metric">
                                <option value="CPU" ${data.metric === 'CPU' ? 'selected' : ''}>CPU Utilization</option>
                                <option value="Memory" ${data.metric === 'Memory' ? 'selected' : ''}>Memory Utilization</option>
                            </select>
                        </div>
                    `,
                    validate: (data) => {
                        const errors = [];
                        if (!data.name?.trim()) errors.push('Policy name is required');
                        if (!data.cluster) errors.push('Cluster is required');
                        return errors;
                    }
                },
                {
                    label: 'Threshold & Action',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Threshold (%)</label>
                            <input class="form-input" data-field="threshold" type="number" value="${data.threshold || 80}" min="10" max="99" />
                            <div class="text-secondary text-sm" style="margin-top:4px;">Trigger action when metric exceeds this percentage</div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Scale Action</label>
                            <select class="form-input" data-field="action">
                                <option value="add_node" ${data.action === 'add_node' ? 'selected' : ''}>Add Node</option>
                                <option value="remove_node" ${data.action === 'remove_node' ? 'selected' : ''}>Remove Node</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Cooldown (minutes)</label>
                            <input class="form-input" data-field="cooldown_min" type="number" value="${data.cooldown_min || 10}" min="1" max="60" />
                            <div class="text-secondary text-sm" style="margin-top:4px;">Minimum wait between scaling events</div>
                        </div>
                    `,
                    validate: (data) => {
                        const errors = [];
                        const threshold = parseInt(data.threshold);
                        if (isNaN(threshold) || threshold < 10 || threshold > 99) errors.push('Threshold must be between 10 and 99');
                        const cooldown = parseInt(data.cooldown_min);
                        if (isNaN(cooldown) || cooldown < 1) errors.push('Cooldown must be at least 1 minute');
                        return errors;
                    }
                }
            ],
            onComplete: async (data) => {
                await state.create('nc2_autoscale_policies', {
                    name: data.name.trim(),
                    cluster: data.cluster,
                    metric: data.metric || 'CPU',
                    threshold: parseInt(data.threshold),
                    action: data.action || 'add_node',
                    cooldown_min: parseInt(data.cooldown_min),
                    enabled: true
                });
                toast.success(`Policy "${data.name}" created`);
            }
        });
        wizard.open();
    }

    #refresh() {
        this.#renderSummary();
        this.#renderTab();
    }

    destroy() {
        this.#table?.destroy();
        this.#unsubs.forEach(fn => fn());
    }
}
