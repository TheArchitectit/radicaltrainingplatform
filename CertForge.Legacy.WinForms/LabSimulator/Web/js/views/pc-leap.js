import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { Wizard } from '../components/Wizard.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

/**
 * PC Leap DR — Protection Policies and Recovery Plans.
 * Protection Policies: category-based RPO targets.
 * Recovery Plans: ordered boot groups with network mapping and optional scripts.
 */
export class PcLeapView extends BaseView {
    #policyTable = null;
    #planTable = null;
    #unsubs = [];
    #activeTab = 'policies';

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        el.innerHTML = `
            <div class="page-title">
                <h1>Leap DR</h1>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-primary" id="create-pp-btn">+ Protection Policy</button>
                    <button class="btn btn-secondary" id="create-rp-btn">+ Recovery Plan</button>
                </div>
            </div>

            <!-- Tabs -->
            <div style="display:flex;gap:0;margin-bottom:var(--space-lg);border-bottom:2px solid var(--border-light);">
                <button class="leap-tab active" data-tab="policies" style="padding:10px 24px;border:none;background:none;cursor:pointer;font-weight:600;border-bottom:2px solid var(--prism-blue);margin-bottom:-2px;">Protection Policies</button>
                <button class="leap-tab" data-tab="plans" style="padding:10px 24px;border:none;background:none;cursor:pointer;font-weight:500;color:var(--text-secondary);margin-bottom:-2px;">Recovery Plans</button>
            </div>

            <div id="policies-panel"></div>
            <div id="plans-panel" style="display:none;"></div>
        `;

        // Protection Policies table
        this.#policyTable = new EntityTable({
            columns: [
                { key: 'name', label: 'Policy Name', sortable: true, render: (v) => `<strong>${v}</strong>` },
                {
                    key: 'categories', label: 'Categories',
                    render: (val) => (val || []).map(c =>
                        `<span class="status-badge" style="background:var(--prism-blue-light);color:var(--prism-blue);font-size:11px;">${c.key}:${c.value}</span>`
                    ).join(' ') || '<span class="text-secondary">None</span>'
                },
                {
                    key: 'rpo', label: 'RPO', sortable: true,
                    render: (v) => {
                        const labels = { '1_hour': '1 Hour', '4_hours': '4 Hours', '24_hours': '24 Hours', '0': 'Near-Zero' };
                        return labels[v] || v;
                    }
                },
                { key: 'remote_site', label: 'Remote AZ', render: (v) => v || '—' },
                {
                    key: 'snapshot_type', label: 'Snapshot',
                    render: (v) => v === 'app_consistent' ? 'App Consistent' : 'Crash Consistent'
                },
            ],
            data: state.getAll('protection_policies'),
            searchKeys: ['name'],
            emptyMessage: 'No protection policies configured',
            emptyIcon: '🛡️',
            actions: [
                { label: 'Delete', danger: true, onClick: (pp) => this.#deletePP(pp) },
            ],
        });

        // Recovery Plans table
        this.#planTable = new EntityTable({
            columns: [
                { key: 'name', label: 'Plan Name', sortable: true, render: (v) => `<strong>${v}</strong>` },
                {
                    key: 'boot_groups', label: 'Boot Groups',
                    render: (val) => `${(val || []).length} stage(s)`
                },
                {
                    key: 'network_mapping', label: 'Network Mapping',
                    render: (val) => val ? `${val.source} → ${val.target}` : '—'
                },
                {
                    key: 'last_test', label: 'Last Test',
                    render: (v) => v || '<span class="text-secondary">Never</span>'
                },
                {
                    key: 'status', label: 'Status',
                    render: (v) => {
                        const cls = v === 'ready' ? 'good' : v === 'error' ? 'critical' : 'warning';
                        return `<span class="status-badge ${cls}"><span class="dot"></span>${v || 'Ready'}</span>`;
                    }
                },
            ],
            data: state.getAll('recovery_plans'),
            searchKeys: ['name'],
            emptyMessage: 'No recovery plans configured',
            emptyIcon: '🔄',
            actions: [
                { label: 'Test Failover', onClick: (rp) => this.#testFailover(rp) },
                { label: 'Failover', onClick: (rp) => this.#failover(rp) },
                { label: 'Delete', danger: true, onClick: (rp) => this.#deleteRP(rp) },
            ],
        });

        el.querySelector('#policies-panel').appendChild(this.#policyTable.render());
        el.querySelector('#plans-panel').appendChild(this.#planTable.render());

        return el;
    }

    afterRender() {
        document.getElementById('create-pp-btn')?.addEventListener('click', () => this.#openPPWizard());
        document.getElementById('create-rp-btn')?.addEventListener('click', () => this.#openRPWizard());

        // Tab switching
        document.querySelectorAll('.leap-tab').forEach(tab => {
            tab.addEventListener('click', () => this.#switchTab(tab.dataset.tab));
        });

        const u1 = bus.on('protection_policies:created', () => this.#policyTable?.setData(state.getAll('protection_policies')));
        const u2 = bus.on('protection_policies:deleted', () => this.#policyTable?.setData(state.getAll('protection_policies')));
        const u3 = bus.on('recovery_plans:created', () => this.#planTable?.setData(state.getAll('recovery_plans')));
        const u4 = bus.on('recovery_plans:updated', () => this.#planTable?.setData(state.getAll('recovery_plans')));
        const u5 = bus.on('recovery_plans:deleted', () => this.#planTable?.setData(state.getAll('recovery_plans')));
        this.#unsubs.push(u1, u2, u3, u4, u5);
    }

    destroy() { this.#policyTable?.destroy(); this.#planTable?.destroy(); this.#unsubs.forEach(u => u()); }

    #switchTab(tab) {
        this.#activeTab = tab;
        document.querySelectorAll('.leap-tab').forEach(t => {
            const isActive = t.dataset.tab === tab;
            t.classList.toggle('active', isActive);
            t.style.borderBottom = isActive ? '2px solid var(--prism-blue)' : 'none';
            t.style.fontWeight = isActive ? '600' : '500';
            t.style.color = isActive ? 'var(--text-primary)' : 'var(--text-secondary)';
        });
        document.getElementById('policies-panel').style.display = tab === 'policies' ? '' : 'none';
        document.getElementById('plans-panel').style.display = tab === 'plans' ? '' : 'none';
    }

    // ── Protection Policy ──

    async #deletePP(pp) {
        const ok = await confirm({ title: 'Delete Protection Policy', message: `Delete <strong>${pp.name}</strong>?`, confirmLabel: 'Delete', danger: true });
        if (ok) { await state.remove('protection_policies', pp.uuid); toast.success(`Protection policy "${pp.name}" deleted`); }
    }

    #openPPWizard() {
        const categories = state.getAll('categories');
        const wizard = new Wizard({
            title: 'Create Protection Policy',
            initialData: { name: '', rpo: '1_hour', remote_site: 'DR-Site-01', snapshot_type: 'crash_consistent', cat_key: '', cat_value: '' },
            steps: [
                {
                    label: 'General',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Policy Name</label>
                            <input class="form-input" data-field="name" value="${data.name}" placeholder="e.g., Gold-RPO-1hr" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">RPO Target</label>
                            <select class="form-input" data-field="rpo">
                                <option value="0" ${data.rpo === '0' ? 'selected' : ''}>Near-Zero (Synchronous)</option>
                                <option value="1_hour" ${data.rpo === '1_hour' ? 'selected' : ''}>1 Hour</option>
                                <option value="4_hours" ${data.rpo === '4_hours' ? 'selected' : ''}>4 Hours</option>
                                <option value="24_hours" ${data.rpo === '24_hours' ? 'selected' : ''}>24 Hours</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Remote Availability Zone</label>
                            <input class="form-input" data-field="remote_site" value="${data.remote_site}" placeholder="e.g., DR-Site-01" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Snapshot Type</label>
                            <select class="form-input" data-field="snapshot_type">
                                <option value="crash_consistent" ${data.snapshot_type === 'crash_consistent' ? 'selected' : ''}>Crash Consistent</option>
                                <option value="app_consistent" ${data.snapshot_type === 'app_consistent' ? 'selected' : ''}>Application Consistent (requires NGT)</option>
                            </select>
                        </div>
                    `,
                    validate: (data) => {
                        const e = [];
                        if (!data.name?.trim()) e.push('Policy name is required');
                        if (!data.remote_site?.trim()) e.push('Remote AZ is required');
                        return e;
                    },
                },
                {
                    label: 'Categories',
                    render: (data) => `
                        <p class="text-secondary text-sm" style="margin-bottom:12px;">Assign categories to determine which VMs are protected by this policy.</p>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                            <div class="form-group">
                                <label class="form-label">Category Key</label>
                                <select class="form-input" data-field="cat_key">
                                    <option value="">— Select —</option>
                                    ${categories.map(c => `<option value="${c.key}" ${c.key === data.cat_key ? 'selected' : ''}>${c.key}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Category Value</label>
                                <select class="form-input" data-field="cat_value">
                                    <option value="">— Select —</option>
                                    ${data.cat_key ? (categories.find(c => c.key === data.cat_key)?.values || []).map(v => `<option value="${v}" ${v === data.cat_value ? 'selected' : ''}>${v}</option>`).join('') : ''}
                                </select>
                            </div>
                        </div>
                        ${categories.length === 0 ? '<div class="text-secondary text-sm" style="margin-top:8px;">⚠️ No categories defined. Create categories first for category-based protection.</div>' : ''}
                    `,
                },
                {
                    label: 'Review',
                    render: (data) => `<div class="card" style="background:var(--gray-50);border:1px solid var(--border-light);"><div class="card-body">
                        <table style="width:100%;font-size:13px;">
                            <tr><td class="text-secondary" style="padding:6px 12px;width:140px;">Name</td><td style="padding:6px 12px;font-weight:600;">${data.name}</td></tr>
                            <tr><td class="text-secondary" style="padding:6px 12px;">RPO</td><td style="padding:6px 12px;">${data.rpo}</td></tr>
                            <tr><td class="text-secondary" style="padding:6px 12px;">Remote AZ</td><td style="padding:6px 12px;">${data.remote_site}</td></tr>
                            <tr><td class="text-secondary" style="padding:6px 12px;">Snapshot</td><td style="padding:6px 12px;">${data.snapshot_type === 'app_consistent' ? 'App Consistent' : 'Crash Consistent'}</td></tr>
                            <tr><td class="text-secondary" style="padding:6px 12px;">Category</td><td style="padding:6px 12px;">${data.cat_key ? `${data.cat_key}:${data.cat_value || '*'}` : 'Not set'}</td></tr>
                        </table>
                    </div></div>`,
                },
            ],
            onComplete: async (data) => {
                const categories = data.cat_key ? [{ key: data.cat_key, value: data.cat_value || '*' }] : [];
                await state.create('protection_policies', {
                    name: data.name.trim(),
                    rpo: data.rpo,
                    remote_site: data.remote_site.trim(),
                    snapshot_type: data.snapshot_type,
                    categories,
                });
                toast.success(`Protection policy "${data.name}" created`);
            },
        });
        wizard.open();
    }

    // ── Recovery Plan ──

    async #deleteRP(rp) {
        const ok = await confirm({ title: 'Delete Recovery Plan', message: `Delete <strong>${rp.name}</strong>?`, confirmLabel: 'Delete', danger: true });
        if (ok) { await state.remove('recovery_plans', rp.uuid); toast.success(`Recovery plan "${rp.name}" deleted`); }
    }

    async #testFailover(rp) {
        const ok = await confirm({
            title: 'Test Failover',
            message: `Run a test failover for <strong>${rp.name}</strong>?<br><br>This will validate the plan without affecting production workloads. VMs will be created in an isolated network at the recovery site.`,
            confirmLabel: 'Start Test',
        });
        if (ok) {
            toast.info(`Test failover started for "${rp.name}"...`);
            setTimeout(async () => {
                await state.update('recovery_plans', rp.uuid, { last_test: new Date().toISOString().split('T')[0], status: 'ready' });
                toast.success(`Test failover completed for "${rp.name}" — all ${(rp.boot_groups || []).length} stages validated`);
            }, 2000);
        }
    }

    async #failover(rp) {
        const ok = await confirm({
            title: '⚠️ Live Failover',
            message: `<strong>WARNING:</strong> This will initiate a live failover for <strong>${rp.name}</strong>.<br><br>Production VMs will be powered off at the source and started at the recovery site.<br><br>This action should only be performed during an actual disaster or planned migration.`,
            confirmLabel: 'Initiate Failover',
            danger: true,
        });
        if (ok) {
            toast.info(`Failover initiated for "${rp.name}"...`);
            setTimeout(async () => {
                await state.update('recovery_plans', rp.uuid, { status: 'failed_over' });
                toast.success(`Failover completed for "${rp.name}" — VMs running at recovery site`);
            }, 3000);
        }
    }

    #openRPWizard() {
        const vms = state.vms.filter(v => !v.is_cvm);
        const networks = state.networks;

        const wizard = new Wizard({
            title: 'Create Recovery Plan',
            initialData: {
                name: '',
                stage1_vms: [], stage2_vms: [], stage3_vms: [],
                stage1_delay: 60, stage2_delay: 120,
                source_net: networks[0]?.name || '', target_net: '',
                pre_script: '', post_script: '',
            },
            steps: [
                {
                    label: 'General',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Recovery Plan Name</label>
                            <input class="form-input" data-field="name" value="${data.name}" placeholder="e.g., WebTier-Recovery" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Pre-Recovery Script (optional)</label>
                            <input class="form-input" data-field="pre_script" value="${data.pre_script}" placeholder="e.g., /scripts/pre-failover.sh" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Post-Recovery Script (optional)</label>
                            <input class="form-input" data-field="post_script" value="${data.post_script}" placeholder="e.g., /scripts/post-failover.sh" />
                        </div>
                    `,
                    validate: (data) => {
                        const e = [];
                        if (!data.name?.trim()) e.push('Plan name is required');
                        return e;
                    },
                },
                {
                    label: 'Boot Groups',
                    render: (data) => `
                        <p class="text-secondary text-sm" style="margin-bottom:12px;">Define boot order. Stage 1 starts first (e.g., infrastructure), then Stage 2, then Stage 3 (e.g., app servers).</p>
                        ${[1, 2, 3].map(stage => `
                            <div class="card" style="margin-bottom:12px;border:1px solid var(--border-light);">
                                <div class="card-header" style="font-size:13px;">Stage ${stage}${stage > 1 ? ` <span class="text-secondary">(delay: <input class="form-input" data-field="stage${stage}_delay" type="number" min="0" value="${data[`stage${stage}_delay`] || 0}" style="width:60px;display:inline;padding:2px 6px;" /> sec)</span>` : ''}</div>
                                <div class="card-body" style="max-height:150px;overflow-y:auto;">
                                    ${vms.map(vm => `
                                        <label style="display:flex;align-items:center;gap:8px;padding:4px 0;cursor:pointer;">
                                            <input type="checkbox" class="stage-vm-check" data-stage="${stage}" data-vm-id="${vm.uuid}" ${(data[`stage${stage}_vms`] || []).includes(vm.uuid) ? 'checked' : ''} />
                                            <span style="font-size:13px;">${vm.name}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    `,
                    bind: (body, data) => {
                        body.querySelectorAll('.stage-vm-check').forEach(cb => {
                            cb.addEventListener('change', () => {
                                const stage = cb.dataset.stage;
                                const selected = [...body.querySelectorAll(`.stage-vm-check[data-stage="${stage}"]:checked`)].map(c => c.dataset.vmId);
                                data[`stage${stage}_vms`] = selected;
                            });
                        });
                    },
                },
                {
                    label: 'Network Mapping',
                    render: (data) => `
                        <p class="text-secondary text-sm" style="margin-bottom:12px;">Map source networks to recovery-site networks so VMs get correct IPs at the target.</p>
                        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:16px;align-items:center;">
                            <div class="form-group">
                                <label class="form-label">Source Network</label>
                                <select class="form-input" data-field="source_net">
                                    ${networks.map(n => `<option value="${n.name}" ${n.name === data.source_net ? 'selected' : ''}>${n.name}</option>`).join('')}
                                </select>
                            </div>
                            <span style="font-size:24px;color:var(--text-secondary);margin-top:20px;">→</span>
                            <div class="form-group">
                                <label class="form-label">Target Network</label>
                                <input class="form-input" data-field="target_net" value="${data.target_net}" placeholder="e.g., DR-Prod-200" />
                            </div>
                        </div>
                    `,
                },
                {
                    label: 'Review',
                    render: (data) => {
                        const stages = [1, 2, 3].map(s => {
                            const ids = data[`stage${s}_vms`] || [];
                            const names = ids.map(id => state.getById('vms', id)?.name || id).join(', ');
                            return names ? `Stage ${s}: ${names}` : null;
                        }).filter(Boolean).join('<br>');

                        return `<div class="card" style="background:var(--gray-50);border:1px solid var(--border-light);"><div class="card-body">
                            <table style="width:100%;font-size:13px;">
                                <tr><td class="text-secondary" style="padding:6px 12px;width:140px;">Name</td><td style="padding:6px 12px;font-weight:600;">${data.name}</td></tr>
                                <tr><td class="text-secondary" style="padding:6px 12px;vertical-align:top;">Boot Order</td><td style="padding:6px 12px;">${stages || 'No VMs selected'}</td></tr>
                                <tr><td class="text-secondary" style="padding:6px 12px;">Network</td><td style="padding:6px 12px;">${data.source_net} → ${data.target_net || '(not set)'}</td></tr>
                                <tr><td class="text-secondary" style="padding:6px 12px;">Pre-Script</td><td style="padding:6px 12px;">${data.pre_script || 'None'}</td></tr>
                                <tr><td class="text-secondary" style="padding:6px 12px;">Post-Script</td><td style="padding:6px 12px;">${data.post_script || 'None'}</td></tr>
                            </table>
                        </div></div>`;
                    },
                },
            ],
            onComplete: async (data) => {
                const boot_groups = [1, 2, 3]
                    .filter(s => (data[`stage${s}_vms`] || []).length > 0)
                    .map(s => ({
                        order: s,
                        vms: data[`stage${s}_vms`],
                        delay_seconds: s > 1 ? Number(data[`stage${s}_delay`]) || 0 : 0,
                    }));

                await state.create('recovery_plans', {
                    name: data.name.trim(),
                    boot_groups,
                    network_mapping: data.target_net ? { source: data.source_net, target: data.target_net } : null,
                    pre_script: data.pre_script || null,
                    post_script: data.post_script || null,
                    status: 'ready',
                    last_test: null,
                });
                toast.success(`Recovery plan "${data.name}" created`);
            },
        });
        wizard.open();
    }
}
