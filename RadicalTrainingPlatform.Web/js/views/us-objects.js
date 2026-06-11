import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { Wizard } from '../components/Wizard.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

/**
 * Nutanix Objects — S3-compatible object storage.
 * Key exam points: WORM is IRREVERSIBLE, lifecycle rules, PC-only management.
 */
export class UsObjectsView extends BaseView {
    #storeTable = null;
    #bucketTable = null;
    #unsubs = [];
    #activeTab = 'stores';

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        const stores = state.getAll('object_stores');
        const buckets = state.getAll('object_buckets');

        el.innerHTML = `
            <div class="page-title">
                <h1>Nutanix Objects</h1>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-primary" id="create-store-btn">+ Create Object Store</button>
                    <button class="btn btn-secondary" id="create-bucket-btn">+ Create Bucket</button>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-lg);margin-bottom:var(--space-xl);">
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${stores.length}</div>
                    <div class="text-secondary text-sm">Object Stores</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${buckets.length}</div>
                    <div class="text-secondary text-sm">Buckets</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--status-warning);">${buckets.filter(b => b.worm_enabled).length}</div>
                    <div class="text-secondary text-sm">WORM Buckets</div>
                    <div style="font-size:var(--font-size-xs);color:var(--status-warning);">⚠️ Irreversible</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${buckets.filter(b => b.versioning).length}</div>
                    <div class="text-secondary text-sm">Versioned Buckets</div>
                </div></div>
            </div>

            <!-- Tabs -->
            <div style="display:flex;gap:0;margin-bottom:var(--space-lg);border-bottom:2px solid var(--border-light);">
                <button class="obj-tab active" data-tab="stores" style="padding:10px 24px;border:none;background:none;cursor:pointer;font-weight:600;border-bottom:2px solid var(--prism-blue);margin-bottom:-2px;">Object Stores</button>
                <button class="obj-tab" data-tab="buckets" style="padding:10px 24px;border:none;background:none;cursor:pointer;font-weight:500;color:var(--text-secondary);margin-bottom:-2px;">Buckets</button>
                <button class="obj-tab" data-tab="keys" style="padding:10px 24px;border:none;background:none;cursor:pointer;font-weight:500;color:var(--text-secondary);margin-bottom:-2px;">Access Keys</button>
            </div>

            <div id="stores-panel"></div>
            <div id="buckets-panel" style="display:none;"></div>
            <div id="keys-panel" style="display:none;"></div>
        `;

        this.#storeTable = new EntityTable({
            columns: [
                { key: 'name', label: 'Object Store', sortable: true, render: (v) => `<strong>${v}</strong>` },
                { key: 'endpoint', label: 'Endpoint', render: (v) => `<span class="font-mono text-sm">${v}</span>` },
                { key: 'capacity_tb', label: 'Capacity', render: (v) => `${v} TB` },
                {
                    key: 'status', label: 'Status',
                    render: (v) => `<span class="status-badge ${v === 'online' ? 'good' : 'critical'}"><span class="dot"></span>${v}</span>`
                },
            ],
            data: stores,
            searchKeys: ['name'],
            emptyMessage: 'No object stores deployed',
            emptyIcon: '📦',
            actions: [{ label: 'Delete', danger: true, onClick: (s) => this.#deleteStore(s) }],
        });

        this.#bucketTable = new EntityTable({
            columns: [
                { key: 'name', label: 'Bucket', sortable: true, render: (v) => `<strong>${v}</strong>` },
                { key: 'store', label: 'Object Store' },
                {
                    key: 'worm_enabled', label: 'WORM', sortable: true,
                    render: (v) => v ? '<span style="color:var(--status-warning);font-weight:700;">🔒 LOCKED</span>' : '—'
                },
                { key: 'versioning', label: 'Versioning', render: (v) => v ? '✅' : '—' },
                {
                    key: 'lifecycle', label: 'Lifecycle',
                    render: (val) => val ? `${val.days}d → ${val.action}` : '—'
                },
            ],
            data: buckets,
            searchKeys: ['name'],
            emptyMessage: 'No buckets created',
            emptyIcon: '🪣',
            actions: [{ label: 'Delete', danger: true, onClick: (b) => this.#deleteBucket(b) }],
        });

        el.querySelector('#stores-panel').appendChild(this.#storeTable.render());
        el.querySelector('#buckets-panel').appendChild(this.#bucketTable.render());

        // Access Keys panel
        el.querySelector('#keys-panel').innerHTML = `
            <div class="card">
                <div class="card-header">S3 Access Keys</div>
                <div class="card-body">
                    <p class="text-secondary text-sm" style="margin-bottom:16px;">Access keys are used for S3-compatible API access to buckets.</p>
                    <div style="border:1px solid var(--border-light);border-radius:4px;padding:16px;">
                        <div style="margin-bottom:12px;">
                            <span class="text-sm" style="font-weight:600;">Access Key:</span>
                            <span class="font-mono text-sm" style="margin-left:8px;">AKIAIOSFODNN7EXAMPLE</span>
                        </div>
                        <div>
                            <span class="text-sm" style="font-weight:600;">Secret Key:</span>
                            <span class="font-mono text-sm" style="margin-left:8px;">wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY</span>
                        </div>
                    </div>
                    <div class="text-secondary text-sm" style="margin-top:12px;">
                        <strong>Endpoint:</strong> <code>https://ntnx-objects.ntnxlab.local</code> (port 443, HTTPS)
                    </div>
                </div>
            </div>
        `;

        return el;
    }

    afterRender() {
        document.getElementById('create-store-btn')?.addEventListener('click', () => this.#openStoreWizard());
        document.getElementById('create-bucket-btn')?.addEventListener('click', () => this.#openBucketWizard());

        document.querySelectorAll('.obj-tab').forEach(tab => {
            tab.addEventListener('click', () => this.#switchTab(tab.dataset.tab));
        });

        const u1 = bus.on('object_stores:created', () => this.#storeTable?.setData(state.getAll('object_stores')));
        const u2 = bus.on('object_stores:deleted', () => this.#storeTable?.setData(state.getAll('object_stores')));
        const u3 = bus.on('object_buckets:created', () => this.#bucketTable?.setData(state.getAll('object_buckets')));
        const u4 = bus.on('object_buckets:deleted', () => this.#bucketTable?.setData(state.getAll('object_buckets')));
        this.#unsubs.push(u1, u2, u3, u4);
    }

    destroy() { this.#storeTable?.destroy(); this.#bucketTable?.destroy(); this.#unsubs.forEach(u => u()); }

    #switchTab(tab) {
        document.querySelectorAll('.obj-tab').forEach(t => {
            const isActive = t.dataset.tab === tab;
            t.classList.toggle('active', isActive);
            t.style.borderBottom = isActive ? '2px solid var(--prism-blue)' : 'none';
            t.style.fontWeight = isActive ? '600' : '500';
            t.style.color = isActive ? 'var(--text-primary)' : 'var(--text-secondary)';
        });
        ['stores', 'buckets', 'keys'].forEach(p => {
            const panel = document.getElementById(`${p}-panel`);
            if (panel) panel.style.display = p === tab ? '' : 'none';
        });
    }

    async #deleteStore(s) {
        const ok = await confirm({ title: 'Delete Object Store', message: `Delete <strong>${s.name}</strong>? All buckets and data will be lost.`, confirmLabel: 'Delete', danger: true });
        if (ok) { await state.remove('object_stores', s.uuid); toast.success(`Object store "${s.name}" deleted`); }
    }

    async #deleteBucket(b) {
        if (b.worm_enabled) { toast.error('Cannot delete a WORM-enabled bucket. WORM is irreversible!'); return; }
        const ok = await confirm({ title: 'Delete Bucket', message: `Delete bucket <strong>${b.name}</strong>?`, confirmLabel: 'Delete', danger: true });
        if (ok) { await state.remove('object_buckets', b.uuid); toast.success(`Bucket "${b.name}" deleted`); }
    }

    #openStoreWizard() {
        const wizard = new Wizard({
            title: 'Create Object Store',
            initialData: { name: '', capacity_tb: 10, endpoint: '' },
            steps: [{
                label: 'Object Store',
                render: (data) => `
                    <div class="form-group"><label class="form-label">Name</label><input class="form-input" data-field="name" value="${data.name}" placeholder="e.g., ntnx-objects" /></div>
                    <div class="form-group"><label class="form-label">Capacity (TB)</label><input class="form-input" data-field="capacity_tb" type="number" min="1" value="${data.capacity_tb}" /></div>
                    <div class="form-group"><label class="form-label">Client Endpoint DNS</label><input class="form-input" data-field="endpoint" value="${data.endpoint}" placeholder="e.g., ntnx-objects.ntnxlab.local" /></div>
                    <div class="text-secondary text-sm" style="margin-top:8px;">⚠️ <strong>Exam Note:</strong> Object Store management is PC-only. You cannot manage Objects from Prism Element.</div>
                `,
                validate: (data) => {
                    const e = [];
                    if (!data.name?.trim()) e.push('Name is required');
                    if (!data.endpoint?.trim()) e.push('Endpoint DNS is required');
                    return e;
                },
            }],
            onComplete: async (data) => {
                await state.create('object_stores', { name: data.name.trim(), capacity_tb: data.capacity_tb, endpoint: data.endpoint.trim(), status: 'online' });
                toast.success(`Object store "${data.name}" created`);
            },
        });
        wizard.open();
    }

    #openBucketWizard() {
        const stores = state.getAll('object_stores');
        if (stores.length === 0) { toast.warning('Create an Object Store first'); return; }

        const wizard = new Wizard({
            title: 'Create Bucket',
            initialData: { name: '', store: stores[0]?.name || '', versioning: false, worm_enabled: false, lifecycle_days: 0, lifecycle_action: 'delete' },
            steps: [
                {
                    label: 'Bucket Config',
                    render: (data) => `
                        <div class="form-group"><label class="form-label">Bucket Name</label><input class="form-input" data-field="name" value="${data.name}" placeholder="e.g., backup-2026" /></div>
                        <div class="form-group">
                            <label class="form-label">Object Store</label>
                            <select class="form-input" data-field="store">${stores.map(s => `<option value="${s.name}" ${s.name === data.store ? 'selected' : ''}>${s.name}</option>`).join('')}</select>
                        </div>
                    `,
                    validate: (data) => {
                        const e = [];
                        if (!data.name?.trim()) e.push('Bucket name is required');
                        return e;
                    },
                },
                {
                    label: 'Features',
                    render: (data) => `
                        <div class="form-group" style="display:flex;align-items:center;gap:12px;">
                            <input type="checkbox" id="versioning-check" ${data.versioning ? 'checked' : ''} />
                            <label for="versioning-check" style="cursor:pointer;"><strong>Enable Versioning</strong><br><span class="text-secondary text-sm">Keep previous versions of objects</span></label>
                        </div>
                        <hr style="margin:16px 0;border:none;border-top:1px solid var(--border-light);">
                        <div class="form-group" style="display:flex;align-items:center;gap:12px;">
                            <input type="checkbox" id="worm-check" ${data.worm_enabled ? 'checked' : ''} />
                            <label for="worm-check" style="cursor:pointer;">
                                <strong>⚠️ Enable WORM (Write Once Read Many)</strong><br>
                                <span style="color:var(--status-critical);font-size:12px;font-weight:700;">WARNING: This is IRREVERSIBLE. Once enabled, WORM cannot be disabled and objects cannot be deleted until retention expires.</span>
                            </label>
                        </div>
                        <hr style="margin:16px 0;border:none;border-top:1px solid var(--border-light);">
                        <div class="form-group">
                            <label class="form-label">Lifecycle Rule (days until action, 0 = no rule)</label>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                                <input class="form-input" data-field="lifecycle_days" type="number" min="0" value="${data.lifecycle_days}" placeholder="Days" />
                                <select class="form-input" data-field="lifecycle_action">
                                    <option value="delete" ${data.lifecycle_action === 'delete' ? 'selected' : ''}>Delete</option>
                                    <option value="transition_cold" ${data.lifecycle_action === 'transition_cold' ? 'selected' : ''}>Transition to Cold</option>
                                </select>
                            </div>
                        </div>
                    `,
                    bind: (body, data) => {
                        body.querySelector('#versioning-check')?.addEventListener('change', (e) => { data.versioning = e.target.checked; });
                        body.querySelector('#worm-check')?.addEventListener('change', (e) => { data.worm_enabled = e.target.checked; });
                    },
                },
            ],
            onComplete: async (data) => {
                if (data.worm_enabled) {
                    const ok = await confirm({
                        title: '⚠️ WORM Confirmation',
                        message: '<strong>FINAL WARNING:</strong> Enabling WORM is <strong>IRREVERSIBLE</strong>. You will NOT be able to:<br>• Disable WORM<br>• Delete objects before retention expires<br>• Delete this bucket while it contains data<br><br>Are you absolutely sure?',
                        confirmLabel: 'Enable WORM (Irreversible)',
                        danger: true,
                    });
                    if (!ok) return;
                }
                await state.create('object_buckets', {
                    name: data.name.trim(), store: data.store, versioning: data.versioning, worm_enabled: data.worm_enabled,
                    lifecycle: data.lifecycle_days > 0 ? { days: data.lifecycle_days, action: data.lifecycle_action } : null,
                });
                toast.success(`Bucket "${data.name}" created${data.worm_enabled ? ' (WORM enabled — irreversible!)' : ''}`);
            },
        });
        wizard.open();
    }
}
