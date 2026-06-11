import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { Wizard } from '../components/Wizard.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

/**
 * PE Storage Containers — Create and manage storage containers.
 */
export class PeStorageView extends BaseView {
    #table = null;
    #unsubs = [];

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        const header = document.createElement('div');
        header.className = 'page-title';
        header.innerHTML = `
            <h1>Storage Containers</h1>
            <button class="btn btn-primary" id="create-container-btn">+ Create Container</button>
        `;
        el.appendChild(header);

        this.#table = new EntityTable({
            columns: [
                { key: 'name', label: 'Name', sortable: true, render: (v) => `<strong>${v}</strong>` },
                { key: 'rf', label: 'RF', sortable: true, render: (v) => `RF${v}` },
                {
                    key: 'compression', label: 'Compression', sortable: true,
                    render: (v) => v === 'off' ? '<span class="text-secondary">Off</span>' : `<span class="status-badge good"><span class="dot"></span>${v === 'inline' ? 'Inline' : 'Post-process'}</span>`
                },
                {
                    key: 'dedup', label: 'Dedup', sortable: true,
                    render: (v) => v === 'off' ? '<span class="text-secondary">Off</span>' : `<span class="status-badge good"><span class="dot"></span>${v === 'inline' ? 'Inline' : 'Post-process'}</span>`
                },
                {
                    key: 'erasure_coding', label: 'EC-X', sortable: true,
                    render: (v) => v ? '<span class="status-badge good"><span class="dot"></span>On</span>' : '<span class="text-secondary">Off</span>'
                },
                {
                    key: 'used_tb', label: 'Usage', sortable: true,
                    render: (val, item) => {
                        const pct = Math.round((val / item.capacity_tb) * 100);
                        const barClass = pct > 80 ? 'critical' : pct > 60 ? 'warning' : '';
                        return `<div style="min-width:120px;">
                            <div style="font-size:11px;margin-bottom:2px;">${val.toFixed(1)} / ${item.capacity_tb} TB (${pct}%)</div>
                            <div class="capacity-bar"><div class="fill ${barClass}" style="width:${pct}%;"></div></div>
                        </div>`;
                    }
                },
            ],
            data: state.containers,
            searchKeys: ['name'],
            emptyMessage: 'No storage containers',
            emptyIcon: '💾',
            actions: [
                { label: 'Delete', danger: true, onClick: (c) => this.#deleteContainer(c) },
            ],
        });

        el.appendChild(this.#table.render());
        return el;
    }

    afterRender() {
        document.getElementById('create-container-btn')?.addEventListener('click', () => this.#openCreateWizard());
        const unsub = bus.on('containers:created', () => this.#table?.setData(state.containers));
        const unsub2 = bus.on('containers:deleted', () => this.#table?.setData(state.containers));
        this.#unsubs.push(unsub, unsub2);
    }

    destroy() {
        this.#table?.destroy();
        this.#unsubs.forEach(u => u());
    }

    async #deleteContainer(container) {
        // Check if any VMs use this container
        const usedBy = state.vms.filter(vm => vm.disks?.some(d => d.container === container.name));
        if (usedBy.length > 0) {
            toast.warning(`Cannot delete: ${usedBy.length} VM(s) use this container`);
            return;
        }
        const ok = await confirm({ title: 'Delete Container', message: `Delete <strong>${container.name}</strong>?`, confirmLabel: 'Delete', danger: true });
        if (ok) {
            await state.remove('containers', container.uuid);
            toast.success(`Container "${container.name}" deleted`);
        }
    }

    #openCreateWizard() {
        const wizard = new Wizard({
            title: 'Create Storage Container',
            initialData: { name: '', rf: 2, compression: 'inline', dedup: 'off', erasure_coding: false },
            steps: [
                {
                    label: 'Configuration',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Container Name</label>
                            <input class="form-input" data-field="name" value="${data.name}" placeholder="e.g., Production-Data" />
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                            <div class="form-group">
                                <label class="form-label">Replication Factor</label>
                                <select class="form-input" data-field="rf">
                                    <option value="2" ${data.rf == 2 ? 'selected' : ''}>RF2 (2 copies)</option>
                                    <option value="3" ${data.rf == 3 ? 'selected' : ''}>RF3 (3 copies)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Compression</label>
                                <select class="form-input" data-field="compression">
                                    <option value="off" ${data.compression === 'off' ? 'selected' : ''}>Off</option>
                                    <option value="inline" ${data.compression === 'inline' ? 'selected' : ''}>Inline</option>
                                    <option value="post_process" ${data.compression === 'post_process' ? 'selected' : ''}>Post-process</option>
                                </select>
                            </div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                            <div class="form-group">
                                <label class="form-label">Deduplication</label>
                                <select class="form-input" data-field="dedup">
                                    <option value="off" ${data.dedup === 'off' ? 'selected' : ''}>Off</option>
                                    <option value="inline" ${data.dedup === 'inline' ? 'selected' : ''}>Inline</option>
                                    <option value="post_process" ${data.dedup === 'post_process' ? 'selected' : ''}>Post-process</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Erasure Coding (EC-X)</label>
                                <select class="form-input" data-field="erasure_coding">
                                    <option value="false" ${!data.erasure_coding ? 'selected' : ''}>Off</option>
                                    <option value="true" ${data.erasure_coding ? 'selected' : ''}>On</option>
                                </select>
                            </div>
                        </div>
                    `,
                    validate: (data) => {
                        const errors = [];
                        if (!data.name?.trim()) errors.push('Container name is required');
                        if (state.containers.some(c => c.name === data.name?.trim())) errors.push('A container with this name already exists');
                        return errors;
                    },
                },
                {
                    label: 'Review',
                    render: (data) => `
                        <div class="card" style="background:var(--gray-50);border:1px solid var(--border-light);">
                            <div class="card-body">
                                <table style="width:100%;font-size:13px;">
                                    <tr><td class="text-secondary" style="padding:6px 12px;width:160px;">Name</td><td style="padding:6px 12px;font-weight:600;">${data.name}</td></tr>
                                    <tr><td class="text-secondary" style="padding:6px 12px;">Replication Factor</td><td style="padding:6px 12px;">RF${data.rf}</td></tr>
                                    <tr><td class="text-secondary" style="padding:6px 12px;">Compression</td><td style="padding:6px 12px;">${data.compression}</td></tr>
                                    <tr><td class="text-secondary" style="padding:6px 12px;">Deduplication</td><td style="padding:6px 12px;">${data.dedup}</td></tr>
                                    <tr><td class="text-secondary" style="padding:6px 12px;">Erasure Coding</td><td style="padding:6px 12px;">${data.erasure_coding === 'true' || data.erasure_coding === true ? 'On' : 'Off'}</td></tr>
                                </table>
                            </div>
                        </div>
                    `,
                },
            ],
            onComplete: async (data) => {
                await state.create('containers', {
                    name: data.name.trim(),
                    rf: Number(data.rf),
                    compression: data.compression,
                    dedup: data.dedup,
                    erasure_coding: data.erasure_coding === 'true' || data.erasure_coding === true,
                    capacity_tb: 12.0,
                    used_tb: 0,
                });
                toast.success(`Container "${data.name}" created`);
            },
        });
        wizard.open();
    }
}
