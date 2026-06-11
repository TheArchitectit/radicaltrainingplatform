import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { Wizard } from '../components/Wizard.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

/**
 * Nutanix Volumes — iSCSI block storage with CHAP authentication.
 * Key exam points: port 3260 (NOT 3261), CHAP auth, MPIO for HA.
 */
export class UsVolumesView extends BaseView {
    #table = null;
    #unsubs = [];

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        const vgs = state.getAll('volume_groups');

        el.innerHTML = `
            <div class="page-title">
                <h1>Nutanix Volumes</h1>
                <button class="btn btn-primary" id="create-vg-btn">+ Create Volume Group</button>
            </div>

            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-lg);margin-bottom:var(--space-xl);">
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${vgs.length}</div>
                    <div class="text-secondary text-sm">Volume Groups</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${vgs.reduce((s, v) => s + (v.disks?.length || 0), 0)}</div>
                    <div class="text-secondary text-sm">Total Disks</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--status-good);">${vgs.filter(v => v.chap_enabled).length}</div>
                    <div class="text-secondary text-sm">CHAP Enabled</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">3260</div>
                    <div class="text-secondary text-sm">iSCSI Port</div>
                    <div style="font-size:var(--font-size-xs);color:var(--status-warning);">⚠️ Exam: NOT 3261</div>
                </div></div>
            </div>
        `;

        this.#table = new EntityTable({
            columns: [
                { key: 'name', label: 'Volume Group', sortable: true, render: (v) => `<strong>${v}</strong>` },
                {
                    key: 'iscsi_target', label: 'iSCSI Target',
                    render: (v) => `<span class="font-mono text-sm">${v || '—'}</span>`
                },
                {
                    key: 'disks', label: 'Disks',
                    render: (val) => {
                        const totalGB = (val || []).reduce((s, d) => s + d.size_gb, 0);
                        return `${(val || []).length} disk(s) — ${totalGB} GB`;
                    }
                },
                {
                    key: 'clients', label: 'Clients',
                    render: (val) => `${(val || []).length} attached`
                },
                {
                    key: 'chap_enabled', label: 'CHAP',
                    render: (v) => v ? '<span style="color:var(--status-good);">🔐 Enabled</span>' : '<span class="text-secondary">Disabled</span>'
                },
                {
                    key: 'flash_mode', label: 'Flash Mode',
                    render: (v) => v ? '⚡ On' : '—'
                },
            ],
            data: vgs,
            searchKeys: ['name'],
            emptyMessage: 'No volume groups configured',
            emptyIcon: '📀',
            actions: [
                { label: 'Attach Client', onClick: (vg) => this.#attachClient(vg) },
                { label: 'Delete', danger: true, onClick: (vg) => this.#deleteVG(vg) },
            ],
        });
        el.appendChild(this.#table.render());

        // Exam tips card
        const tips = document.createElement('div');
        tips.className = 'card';
        tips.style.marginTop = 'var(--space-xl)';
        tips.innerHTML = `
            <div class="card-header">⚠️ Volumes Exam Tips</div>
            <div class="card-body" style="font-size:13px;">
                <ul style="padding-left:20px;margin:0;">
                    <li><strong>iSCSI Port:</strong> Always <code>3260</code>. The exam may present 3261 as a distractor — it's wrong.</li>
                    <li><strong>CHAP Authentication:</strong> Mutual CHAP requires both initiator and target secrets. One-way CHAP only authenticates the initiator.</li>
                    <li><strong>MPIO:</strong> Multipath I/O provides high availability. Configure 2+ paths for production workloads.</li>
                    <li><strong>Flash Mode:</strong> Pins all data to SSD tier for latency-sensitive workloads.</li>
                    <li><strong>Data Services IP:</strong> Required for iSCSI access — <code>${state.cluster.dataServicesIP}</code></li>
                    <li><strong>External Clients:</strong> Use iSCSI initiator (Windows) or iscsiadm (Linux) to connect.</li>
                </ul>
            </div>
        `;
        el.appendChild(tips);

        return el;
    }

    afterRender() {
        document.getElementById('create-vg-btn')?.addEventListener('click', () => this.#openCreateWizard());
        const u1 = bus.on('volume_groups:created', () => this.#table?.setData(state.getAll('volume_groups')));
        const u2 = bus.on('volume_groups:updated', () => this.#table?.setData(state.getAll('volume_groups')));
        const u3 = bus.on('volume_groups:deleted', () => this.#table?.setData(state.getAll('volume_groups')));
        this.#unsubs.push(u1, u2, u3);
    }

    destroy() { this.#table?.destroy(); this.#unsubs.forEach(u => u()); }

    async #deleteVG(vg) {
        if ((vg.clients || []).length > 0) { toast.warning('Detach all clients before deleting the volume group'); return; }
        const ok = await confirm({ title: 'Delete Volume Group', message: `Delete <strong>${vg.name}</strong>? All data will be lost.`, confirmLabel: 'Delete', danger: true });
        if (ok) { await state.remove('volume_groups', vg.uuid); toast.success(`Volume group "${vg.name}" deleted`); }
    }

    async #attachClient(vg) {
        const wizard = new Wizard({
            title: `Attach Client to "${vg.name}"`,
            initialData: { iqn: '', type: 'external' },
            steps: [{
                label: 'Client',
                render: (data) => `
                    <div class="form-group">
                        <label class="form-label">Client Type</label>
                        <select class="form-input" data-field="type">
                            <option value="external" ${data.type === 'external' ? 'selected' : ''}>External (iSCSI Initiator)</option>
                            <option value="vm" ${data.type === 'vm' ? 'selected' : ''}>VM (Direct Attach)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">iSCSI Initiator IQN</label>
                        <input class="form-input" data-field="iqn" value="${data.iqn}" placeholder="iqn.2025-01.com.example:initiator01" />
                    </div>
                    <div class="text-secondary text-sm" style="margin-top:8px;">
                        Target: <code>${state.cluster.dataServicesIP}:3260</code>
                    </div>
                `,
                validate: (data) => {
                    const e = [];
                    if (!data.iqn?.trim()) e.push('IQN is required');
                    return e;
                },
            }],
            onComplete: async (data) => {
                const clients = [...(vg.clients || []), { iqn: data.iqn.trim(), type: data.type }];
                await state.update('volume_groups', vg.uuid, { clients });
                toast.success(`Client attached to "${vg.name}"`);
            },
        });
        wizard.open();
    }

    #openCreateWizard() {
        const containers = state.containers;
        const wizard = new Wizard({
            title: 'Create Volume Group',
            initialData: { name: '', chap_enabled: false, chap_user: '', chap_secret: '', flash_mode: false, disk_count: 1, disk_size_gb: 50, container: containers[0]?.name || '' },
            steps: [
                {
                    label: 'General',
                    render: (data) => `
                        <div class="form-group"><label class="form-label">Volume Group Name</label><input class="form-input" data-field="name" value="${data.name}" placeholder="e.g., SQL-Data-VG" /></div>
                        <div class="form-group">
                            <label class="form-label">Storage Container</label>
                            <select class="form-input" data-field="container">${containers.map(c => `<option value="${c.name}" ${c.name === data.container ? 'selected' : ''}>${c.name}</option>`).join('')}</select>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                            <div class="form-group"><label class="form-label">Number of Disks</label><input class="form-input" data-field="disk_count" type="number" min="1" max="64" value="${data.disk_count}" /></div>
                            <div class="form-group"><label class="form-label">Disk Size (GB each)</label><input class="form-input" data-field="disk_size_gb" type="number" min="1" value="${data.disk_size_gb}" /></div>
                        </div>
                    `,
                    validate: (data) => {
                        const e = [];
                        if (!data.name?.trim()) e.push('Name is required');
                        return e;
                    },
                },
                {
                    label: 'Security & Performance',
                    render: (data) => `
                        <div class="form-group" style="display:flex;align-items:center;gap:12px;">
                            <input type="checkbox" id="chap-check" ${data.chap_enabled ? 'checked' : ''} />
                            <label for="chap-check" style="cursor:pointer;"><strong>Enable CHAP Authentication</strong></label>
                        </div>
                        <div id="chap-fields" style="${data.chap_enabled ? '' : 'display:none;'}margin-top:12px;">
                            <div class="form-group"><label class="form-label">CHAP Username</label><input class="form-input" data-field="chap_user" value="${data.chap_user}" /></div>
                            <div class="form-group"><label class="form-label">CHAP Secret (12-16 chars)</label><input class="form-input" data-field="chap_secret" value="${data.chap_secret}" type="password" /></div>
                        </div>
                        <hr style="margin:16px 0;border:none;border-top:1px solid var(--border-light);">
                        <div class="form-group" style="display:flex;align-items:center;gap:12px;">
                            <input type="checkbox" id="flash-check" ${data.flash_mode ? 'checked' : ''} />
                            <label for="flash-check" style="cursor:pointer;"><strong>⚡ Flash Mode</strong> — Pin all data to SSD tier</label>
                        </div>
                    `,
                    bind: (body, data) => {
                        body.querySelector('#chap-check')?.addEventListener('change', (e) => {
                            data.chap_enabled = e.target.checked;
                            const fields = body.querySelector('#chap-fields');
                            if (fields) fields.style.display = e.target.checked ? '' : 'none';
                        });
                        body.querySelector('#flash-check')?.addEventListener('change', (e) => { data.flash_mode = e.target.checked; });
                    },
                },
            ],
            onComplete: async (data) => {
                const disks = Array.from({ length: Number(data.disk_count) }, (_, i) => ({ index: i, size_gb: Number(data.disk_size_gb), container: data.container }));
                const iqnSuffix = data.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
                await state.create('volume_groups', {
                    name: data.name.trim(),
                    iscsi_target: `iqn.2025-01.local.ntnxlab:${iqnSuffix}`,
                    disks, clients: [],
                    chap_enabled: data.chap_enabled, flash_mode: data.flash_mode,
                });
                toast.success(`Volume group "${data.name}" created with ${data.disk_count} disk(s)`);
            },
        });
        wizard.open();
    }
}
