import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { Wizard } from '../components/Wizard.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

/**
 * Nutanix Files — FSVM management, SMB/NFS shares, Smart DR.
 * Key exam points: min 3 FSVMs, AD join for SMB, SSR snapshots.
 */
export class UsFilesView extends BaseView {
    #fsvmTable = null;
    #shareTable = null;
    #unsubs = [];
    #activeTab = 'shares';

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        const fsvms = state.getAll('fsvms');
        const shares = state.getAll('file_shares');

        el.innerHTML = `
            <div class="page-title">
                <h1>Nutanix Files</h1>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-primary" id="create-share-btn">+ Create Share</button>
                    <button class="btn btn-secondary" id="deploy-fsvm-btn">+ Deploy FSVM</button>
                </div>
            </div>

            <!-- File Server Summary -->
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-lg);margin-bottom:var(--space-xl);">
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:${fsvms.length >= 3 ? 'var(--status-good)' : 'var(--status-warning)'};">${fsvms.length}</div>
                    <div class="text-secondary text-sm">FSVMs</div>
                    <div style="font-size:var(--font-size-xs);color:${fsvms.length >= 3 ? 'var(--status-good)' : 'var(--status-warning)'};">${fsvms.length >= 3 ? '✅ Min 3 met' : '⚠️ Need min 3'}</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${shares.length}</div>
                    <div class="text-secondary text-sm">Shares</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${shares.filter(s => s.protocol === 'SMB').length}</div>
                    <div class="text-secondary text-sm">SMB Shares</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${shares.filter(s => s.protocol === 'NFS').length}</div>
                    <div class="text-secondary text-sm">NFS Exports</div>
                </div></div>
            </div>

            <!-- Tabs -->
            <div style="display:flex;gap:0;margin-bottom:var(--space-lg);border-bottom:2px solid var(--border-light);">
                <button class="files-tab active" data-tab="shares" style="padding:10px 24px;border:none;background:none;cursor:pointer;font-weight:600;border-bottom:2px solid var(--prism-blue);margin-bottom:-2px;">Shares</button>
                <button class="files-tab" data-tab="fsvms" style="padding:10px 24px;border:none;background:none;cursor:pointer;font-weight:500;color:var(--text-secondary);margin-bottom:-2px;">File Server VMs</button>
                <button class="files-tab" data-tab="smartdr" style="padding:10px 24px;border:none;background:none;cursor:pointer;font-weight:500;color:var(--text-secondary);margin-bottom:-2px;">Smart DR</button>
            </div>

            <div id="shares-panel"></div>
            <div id="fsvms-panel" style="display:none;"></div>
            <div id="smartdr-panel" style="display:none;"></div>
        `;

        // Shares table
        this.#shareTable = new EntityTable({
            columns: [
                { key: 'name', label: 'Share Name', sortable: true, render: (v) => `<strong>${v}</strong>` },
                {
                    key: 'protocol', label: 'Protocol', sortable: true,
                    render: (v) => `<span class="status-badge ${v === 'SMB' ? 'good' : 'info'}" ${v === 'NFS' ? 'style="background:var(--status-info-bg);color:var(--status-info);"' : ''}>${v}</span>`
                },
                { key: 'path', label: 'Path', render: (v) => `<span class="font-mono text-sm">${v}</span>` },
                { key: 'max_size_gb', label: 'Max Size', render: (v) => v ? `${v} GB` : 'Unlimited' },
                {
                    key: 'ssr_enabled', label: 'SSR',
                    render: (v) => v ? '<span style="color:var(--status-good);">✅ Enabled</span>' : '<span class="text-secondary">Disabled</span>'
                },
                {
                    key: 'multi_protocol', label: 'Multi-Protocol',
                    render: (v) => v ? '✅' : '—'
                },
            ],
            data: shares,
            searchKeys: ['name'],
            emptyMessage: 'No shares configured',
            emptyIcon: '📁',
            actions: [
                { label: 'Toggle SSR', onClick: (s) => this.#toggleSSR(s) },
                { label: 'Delete', danger: true, onClick: (s) => this.#deleteShare(s) },
            ],
        });

        // FSVM table
        this.#fsvmTable = new EntityTable({
            columns: [
                { key: 'name', label: 'FSVM Name', sortable: true, render: (v) => `<strong>${v}</strong>` },
                { key: 'ip', label: 'IP Address', render: (v) => `<span class="font-mono">${v}</span>` },
                { key: 'vcpus', label: 'vCPUs' },
                { key: 'memory_gb', label: 'Memory', render: (v) => `${v} GB` },
                {
                    key: 'status', label: 'Status',
                    render: (v) => `<span class="status-badge ${v === 'healthy' ? 'good' : 'critical'}"><span class="dot"></span>${v}</span>`
                },
            ],
            data: fsvms,
            searchKeys: ['name'],
            emptyMessage: 'No FSVMs deployed',
            emptyIcon: '🖥️',
        });

        el.querySelector('#shares-panel').appendChild(this.#shareTable.render());
        el.querySelector('#fsvms-panel').appendChild(this.#fsvmTable.render());

        // Smart DR panel
        const smartdrPanel = el.querySelector('#smartdr-panel');
        smartdrPanel.innerHTML = `
            <div class="card">
                <div class="card-header">Smart DR Configuration</div>
                <div class="card-body">
                    <p class="text-secondary text-sm" style="margin-bottom:16px;">Smart DR enables file server-level replication to a remote file server for disaster recovery.</p>
                    <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:16px;align-items:center;margin-bottom:20px;">
                        <div class="card" style="border:2px solid var(--prism-blue);">
                            <div class="card-body" style="text-align:center;">
                                <div style="font-weight:700;">Primary</div>
                                <div class="text-secondary text-sm">NTNX-Files-01</div>
                                <div class="text-secondary text-sm">${fsvms.length} FSVMs</div>
                            </div>
                        </div>
                        <div style="font-size:24px;color:var(--text-secondary);">⟷</div>
                        <div class="card" style="border:2px dashed var(--border-light);">
                            <div class="card-body" style="text-align:center;">
                                <div style="font-weight:700;">DR Target</div>
                                <div class="text-secondary text-sm">Not configured</div>
                                <button class="btn btn-secondary btn-sm" style="margin-top:8px;" id="configure-smartdr-btn">Configure</button>
                            </div>
                        </div>
                    </div>
                    <div class="text-secondary text-sm">
                        <strong>Exam Note:</strong> Smart DR is file server-level (not share-level). Failover activates the DR file server and makes shares available at the DR site.
                    </div>
                </div>
            </div>
        `;

        return el;
    }

    afterRender() {
        document.getElementById('create-share-btn')?.addEventListener('click', () => this.#openShareWizard());
        document.getElementById('deploy-fsvm-btn')?.addEventListener('click', () => this.#deployFSVM());
        document.getElementById('configure-smartdr-btn')?.addEventListener('click', () => toast.info('Smart DR target configuration — configure a remote file server for replication'));

        document.querySelectorAll('.files-tab').forEach(tab => {
            tab.addEventListener('click', () => this.#switchTab(tab.dataset.tab));
        });

        const u1 = bus.on('file_shares:created', () => this.#shareTable?.setData(state.getAll('file_shares')));
        const u2 = bus.on('file_shares:updated', () => this.#shareTable?.setData(state.getAll('file_shares')));
        const u3 = bus.on('file_shares:deleted', () => this.#shareTable?.setData(state.getAll('file_shares')));
        const u4 = bus.on('fsvms:created', () => this.#fsvmTable?.setData(state.getAll('fsvms')));
        this.#unsubs.push(u1, u2, u3, u4);
    }

    destroy() { this.#shareTable?.destroy(); this.#fsvmTable?.destroy(); this.#unsubs.forEach(u => u()); }

    #switchTab(tab) {
        document.querySelectorAll('.files-tab').forEach(t => {
            const isActive = t.dataset.tab === tab;
            t.classList.toggle('active', isActive);
            t.style.borderBottom = isActive ? '2px solid var(--prism-blue)' : 'none';
            t.style.fontWeight = isActive ? '600' : '500';
            t.style.color = isActive ? 'var(--text-primary)' : 'var(--text-secondary)';
        });
        ['shares', 'fsvms', 'smartdr'].forEach(p => {
            const panel = document.getElementById(`${p}-panel`);
            if (panel) panel.style.display = p === tab ? '' : 'none';
        });
    }

    async #toggleSSR(share) {
        await state.update('file_shares', share.uuid, { ssr_enabled: !share.ssr_enabled });
        toast.success(`SSR ${!share.ssr_enabled ? 'enabled' : 'disabled'} for "${share.name}"`);
    }

    async #deleteShare(share) {
        const ok = await confirm({ title: 'Delete Share', message: `Delete share <strong>${share.name}</strong>? All data in this share will be lost.`, confirmLabel: 'Delete', danger: true });
        if (ok) { await state.remove('file_shares', share.uuid); toast.success(`Share "${share.name}" deleted`); }
    }

    async #deployFSVM() {
        const fsvms = state.getAll('fsvms');
        const nextNum = fsvms.length + 1;
        const hosts = state.hosts;
        const host = hosts[nextNum % hosts.length];

        const wizard = new Wizard({
            title: 'Deploy File Server VM',
            initialData: { name: `FSVM-${String(nextNum).padStart(2, '0')}`, ip: `10.42.100.${50 + nextNum}`, vcpus: 4, memory_gb: 12 },
            steps: [{
                label: 'FSVM Config',
                render: (data) => `
                    <div class="form-group">
                        <label class="form-label">FSVM Name</label>
                        <input class="form-input" data-field="name" value="${data.name}" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">IP Address</label>
                        <input class="form-input" data-field="ip" value="${data.ip}" placeholder="10.42.100.x" />
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                        <div class="form-group"><label class="form-label">vCPUs</label><input class="form-input" data-field="vcpus" type="number" min="4" value="${data.vcpus}" /></div>
                        <div class="form-group"><label class="form-label">Memory (GB)</label><input class="form-input" data-field="memory_gb" type="number" min="12" value="${data.memory_gb}" /></div>
                    </div>
                    <div class="text-secondary text-sm" style="margin-top:8px;">
                        <strong>Exam Note:</strong> Minimum 3 FSVMs required for a production file server deployment. Currently deployed: ${fsvms.length}
                    </div>
                `,
                validate: (data) => {
                    const e = [];
                    if (!data.name?.trim()) e.push('Name is required');
                    if (!data.ip?.trim()) e.push('IP is required');
                    if (data.vcpus < 4) e.push('Min 4 vCPUs for FSVM');
                    if (data.memory_gb < 12) e.push('Min 12 GB memory for FSVM');
                    return e;
                },
            }],
            onComplete: async (data) => {
                await state.create('fsvms', { name: data.name, ip: data.ip, vcpus: data.vcpus, memory_gb: data.memory_gb, host_uuid: host.uuid, status: 'healthy' });
                toast.success(`FSVM "${data.name}" deployed on ${host.name}`);
            },
        });
        wizard.open();
    }

    #openShareWizard() {
        const fsvms = state.getAll('fsvms');
        if (fsvms.length < 3) {
            toast.warning(`Cannot create shares: need minimum 3 FSVMs (currently ${fsvms.length}). Deploy more FSVMs first.`);
            return;
        }

        const wizard = new Wizard({
            title: 'Create File Share',
            initialData: { name: '', protocol: 'SMB', path: '', max_size_gb: 100, ssr_enabled: false, multi_protocol: false, ad_domain: 'ntnxlab.local' },
            steps: [
                {
                    label: 'Share Config',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Share Name</label>
                            <input class="form-input" data-field="name" value="${data.name}" placeholder="e.g., Engineering" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Protocol</label>
                            <select class="form-input" data-field="protocol">
                                <option value="SMB" ${data.protocol === 'SMB' ? 'selected' : ''}>SMB (Windows / AD-integrated)</option>
                                <option value="NFS" ${data.protocol === 'NFS' ? 'selected' : ''}>NFS (Linux / POSIX)</option>
                                <option value="Multi" ${data.protocol === 'Multi' ? 'selected' : ''}>Multi-Protocol (SMB + NFS)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Max Size (GB) — 0 for unlimited</label>
                            <input class="form-input" data-field="max_size_gb" type="number" min="0" value="${data.max_size_gb}" />
                        </div>
                        ${data.protocol !== 'NFS' ? `
                            <div class="form-group">
                                <label class="form-label">Active Directory Domain</label>
                                <input class="form-input" data-field="ad_domain" value="${data.ad_domain}" placeholder="ntnxlab.local" />
                                <div class="text-secondary text-sm" style="margin-top:4px;">⚠️ AD join required for SMB shares</div>
                            </div>
                        ` : ''}
                    `,
                    validate: (data) => {
                        const e = [];
                        if (!data.name?.trim()) e.push('Share name is required');
                        return e;
                    },
                },
                {
                    label: 'Features',
                    render: (data) => `
                        <div class="form-group" style="display:flex;align-items:center;gap:12px;">
                            <input type="checkbox" id="ssr-check" ${data.ssr_enabled ? 'checked' : ''} />
                            <div>
                                <label class="form-label" for="ssr-check" style="margin:0;cursor:pointer;">Self-Service Restore (SSR)</label>
                                <div class="text-secondary text-sm">Allow users to restore previous versions of files via Windows Previous Versions tab</div>
                            </div>
                        </div>
                    `,
                    bind: (body, data) => {
                        body.querySelector('#ssr-check')?.addEventListener('change', (e) => { data.ssr_enabled = e.target.checked; });
                    },
                },
            ],
            onComplete: async (data) => {
                const multi = data.protocol === 'Multi';
                const path = data.protocol === 'NFS' ? `/export/${data.name.trim()}` : `\\\\NTNX-Files\\${data.name.trim()}`;
                await state.create('file_shares', {
                    name: data.name.trim(), protocol: multi ? 'SMB' : data.protocol, path,
                    max_size_gb: data.max_size_gb || null, ssr_enabled: data.ssr_enabled, multi_protocol: multi,
                });
                toast.success(`Share "${data.name}" created (${data.protocol})`);
            },
        });
        wizard.open();
    }
}
