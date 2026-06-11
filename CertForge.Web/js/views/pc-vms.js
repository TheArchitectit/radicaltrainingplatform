import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { Wizard } from '../components/Wizard.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

/**
 * PC VM List — Prism Central VM management with categories, projects, and cross-cluster view.
 */
export class PcVmsView extends BaseView {
    #table = null;
    #unsubs = [];

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        const header = document.createElement('div');
        header.className = 'page-title';
        header.innerHTML = `
            <h1>Virtual Machines</h1>
            <div style="display:flex;gap:8px;">
                <button class="btn btn-primary" id="pc-create-vm-btn">+ Create VM</button>
                <button class="btn btn-secondary" id="pc-assign-cat-btn">🏷️ Assign Category</button>
            </div>
        `;
        el.appendChild(header);

        // Summary cards
        const vms = state.vms;
        const running = vms.filter(v => v.power_state === 'on' && !v.is_cvm).length;
        const stopped = vms.filter(v => v.power_state === 'off' && !v.is_cvm).length;
        const totalVCPU = vms.reduce((s, v) => s + (v.is_cvm ? 0 : v.vcpus), 0);
        const totalMem = vms.reduce((s, v) => s + (v.is_cvm ? 0 : v.memory_gb), 0);

        const summary = document.createElement('div');
        summary.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:var(--space-lg);';
        summary.innerHTML = `
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--blue-500);">${vms.filter(v => !v.is_cvm).length}</div>
                <div class="text-secondary text-sm">User VMs</div>
            </div></div>
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--green-500);">${running}</div>
                <div class="text-secondary text-sm">Running</div>
            </div></div>
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--text-secondary);">${stopped}</div>
                <div class="text-secondary text-sm">Stopped</div>
            </div></div>
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--purple-500);">${totalVCPU} vCPU / ${totalMem} GB</div>
                <div class="text-secondary text-sm">Allocated Resources</div>
            </div></div>
        `;
        el.appendChild(summary);

        this.#table = new EntityTable({
            columns: [
                {
                    key: 'name', label: 'Name', sortable: true,
                    render: (val, item) => {
                        const badges = [];
                        if (item.is_cvm) badges.push('<span style="color:var(--text-secondary);font-size:11px;">(CVM)</span>');
                        if (item.categories?.length) badges.push(`<span style="color:var(--blue-500);font-size:11px;">🏷️ ${item.categories.length}</span>`);
                        if (item.project) badges.push(`<span style="color:var(--purple-500);font-size:11px;">📁 ${this.#esc(item.project)}</span>`);
                        return `<strong>${this.#esc(val)}</strong> ${badges.join(' ')}`;
                    }
                },
                {
                    key: 'power_state', label: 'Power State', sortable: true,
                    render: (val) => {
                        const isOn = val === 'on';
                        return `<span class="status-badge ${isOn ? 'good' : 'critical'}"><span class="dot"></span>${isOn ? 'On' : 'Off'}</span>`;
                    }
                },
                { key: 'vcpus', label: 'vCPUs', sortable: true },
                {
                    key: 'memory_gb', label: 'Memory', sortable: true,
                    render: (val) => `${val} GB`
                },
                {
                    key: 'host_uuid', label: 'Host', sortable: true,
                    render: (val) => {
                        const host = state.getById('hosts', val);
                        return host ? this.#esc(host.name) : '—';
                    }
                },
                {
                    key: 'nics', label: 'IP Address',
                    render: (val) => val?.[0]?.ip ? `<span class="font-mono">${val[0].ip}</span>` : '—'
                },
                {
                    key: 'cluster_name', label: 'Cluster',
                    render: (val) => val ? this.#esc(val) : state.cluster.name
                },
            ],
            data: state.vms,
            searchKeys: ['name', 'project'],
            selectable: true,
            emptyMessage: 'No virtual machines found',
            emptyIcon: '🖥️',
            actions: [
                { label: 'Power On', onClick: (vm) => this.#powerAction(vm, 'on') },
                { label: 'Power Off', onClick: (vm) => this.#powerAction(vm, 'off') },
                { label: 'Manage Categories', onClick: (vm) => this.#manageCategoriesDialog(vm) },
                { label: 'Delete', danger: true, onClick: (vm) => this.#deleteVm(vm) },
            ],
        });

        el.appendChild(this.#table.render());
        return el;
    }

    afterRender() {
        document.getElementById('pc-create-vm-btn')?.addEventListener('click', () => this.#openCreateWizard());
        document.getElementById('pc-assign-cat-btn')?.addEventListener('click', () => {
            toast.info('Select a VM from the table, then use the row action "Manage Categories".');
        });

        const unsub = bus.on('vms:created', () => this.#refresh());
        const unsub2 = bus.on('vms:updated', () => this.#refresh());
        const unsub3 = bus.on('vms:deleted', () => this.#refresh());
        this.#unsubs.push(unsub, unsub2, unsub3);
    }

    destroy() {
        this.#table?.destroy();
        this.#unsubs.forEach(u => u());
    }

    #refresh() {
        this.#table?.setData(state.vms);
    }

    async #powerAction(vm, targetState) {
        if (vm.is_cvm) { toast.warning('Cannot change power state of a Controller VM'); return; }
        if (vm.power_state === targetState) { toast.info(`VM is already powered ${targetState}`); return; }
        await state.update('vms', vm.uuid, { power_state: targetState });
        toast.success(`${vm.name} powered ${targetState}`);
    }

    async #deleteVm(vm) {
        if (vm.is_cvm) { toast.warning('Cannot delete a Controller VM'); return; }
        const ok = await confirm({
            title: 'Delete VM',
            message: `Are you sure you want to delete <strong>${vm.name}</strong>? This action cannot be undone.`,
            confirmLabel: 'Delete', danger: true,
        });
        if (ok) {
            await state.remove('vms', vm.uuid);
            toast.success(`${vm.name} deleted`);
        }
    }

    async #manageCategoriesDialog(vm) {
        if (vm.is_cvm) { toast.warning('Cannot assign categories to a Controller VM'); return; }
        const categories = state.getAll('categories');
        const currentCats = vm.categories || [];

        const wizard = new Wizard({
            title: `Manage Categories — ${vm.name}`,
            initialData: { selections: currentCats.map(c => `${c.key}:${c.value}`) },
            steps: [{
                label: 'Categories',
                render: (data) => {
                    const options = categories.flatMap(c => c.values.map(v => `${c.key}:${v}`));
                    return `
                        <div class="form-group">
                            <label class="form-label">Select categories to assign:</label>
                            ${options.map(opt => `
                                <label style="display:flex;align-items:center;gap:8px;padding:6px 0;">
                                    <input type="checkbox" data-cat="${opt}" ${data.selections?.includes(opt) ? 'checked' : ''} />
                                    ${opt}
                                </label>
                            `).join('')}
                        </div>
                    `;
                },
            }],
            onComplete: async (data) => {
                const checkboxes = document.querySelectorAll('[data-cat]');
                const selected = [];
                checkboxes.forEach(cb => {
                    if (cb.checked) {
                        const [key, value] = cb.dataset.cat.split(':');
                        selected.push({ key, value });
                    }
                });
                await state.update('vms', vm.uuid, { categories: selected });
                toast.success(`Categories updated for ${vm.name}`);
            },
        });
        wizard.open();
    }

    #openCreateWizard() {
        const images = state.images;
        const networks = state.networks;
        const containers = state.containers;
        const categories = state.getAll('categories');

        const wizard = new Wizard({
            title: 'Create VM',
            initialData: { name: '', vcpus: 2, memory_gb: 4, disk_size_gb: 50, disk_container: containers[0]?.name || '', disk_image: '', nic_network: networks[0]?.uuid || '', project: '', category: '' },
            steps: [
                {
                    label: 'General',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">VM Name</label>
                            <input class="form-input" data-field="name" value="${data.name}" placeholder="e.g., My-VM-01" />
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                            <div class="form-group">
                                <label class="form-label">vCPUs</label>
                                <input class="form-input" data-field="vcpus" type="number" min="1" max="64" value="${data.vcpus}" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Memory (GB)</label>
                                <input class="form-input" data-field="memory_gb" type="number" min="1" max="512" value="${data.memory_gb}" />
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Project (optional)</label>
                            <input class="form-input" data-field="project" value="${data.project}" placeholder="e.g., Engineering" />
                        </div>
                    `,
                    validate: (data) => {
                        const errors = [];
                        if (!data.name?.trim()) errors.push('VM name is required');
                        if (data.vcpus < 1 || data.vcpus > 64) errors.push('vCPUs must be 1-64');
                        if (data.memory_gb < 1) errors.push('Memory must be at least 1 GB');
                        if (state.vms.some(v => v.name === data.name?.trim())) errors.push('A VM with this name already exists');
                        return errors;
                    },
                },
                {
                    label: 'Disks',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Disk Size (GB)</label>
                            <input class="form-input" data-field="disk_size_gb" type="number" min="1" value="${data.disk_size_gb}" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Storage Container</label>
                            <select class="form-input" data-field="disk_container">
                                ${containers.map(c => `<option value="${c.name}" ${c.name === data.disk_container ? 'selected' : ''}>${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Clone from Image (optional)</label>
                            <select class="form-input" data-field="disk_image">
                                <option value="">— None —</option>
                                ${images.filter(i => i.type === 'DISK_IMAGE').map(i => `<option value="${i.name}" ${i.name === data.disk_image ? 'selected' : ''}>${i.name} (${i.size_gb} GB)</option>`).join('')}
                            </select>
                        </div>
                    `,
                },
                {
                    label: 'Network & Category',
                    render: (data) => {
                        const catOptions = categories.flatMap(c => c.values.map(v => `${c.key}:${v}`));
                        return `
                            <div class="form-group">
                                <label class="form-label">Network</label>
                                <select class="form-input" data-field="nic_network">
                                    ${networks.map(n => `<option value="${n.uuid}" ${n.uuid === data.nic_network ? 'selected' : ''}>${n.name} (VLAN ${n.vlan_id})</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Category (optional)</label>
                                <select class="form-input" data-field="category">
                                    <option value="">— None —</option>
                                    ${catOptions.map(opt => `<option value="${opt}" ${opt === data.category ? 'selected' : ''}>${opt}</option>`).join('')}
                                </select>
                            </div>
                        `;
                    },
                },
                {
                    label: 'Review',
                    render: (data) => {
                        const net = networks.find(n => n.uuid === data.nic_network);
                        return `
                            <div class="card" style="background:var(--gray-50);border:1px solid var(--border-light);">
                                <div class="card-body">
                                    <table style="width:100%;font-size:13px;">
                                        <tr><td class="text-secondary" style="padding:6px 12px;width:140px;">Name</td><td style="padding:6px 12px;font-weight:600;">${data.name}</td></tr>
                                        <tr><td class="text-secondary" style="padding:6px 12px;">vCPUs</td><td style="padding:6px 12px;">${data.vcpus}</td></tr>
                                        <tr><td class="text-secondary" style="padding:6px 12px;">Memory</td><td style="padding:6px 12px;">${data.memory_gb} GB</td></tr>
                                        <tr><td class="text-secondary" style="padding:6px 12px;">Disk</td><td style="padding:6px 12px;">${data.disk_size_gb} GB on ${data.disk_container}</td></tr>
                                        <tr><td class="text-secondary" style="padding:6px 12px;">Image</td><td style="padding:6px 12px;">${data.disk_image || '— None —'}</td></tr>
                                        <tr><td class="text-secondary" style="padding:6px 12px;">Network</td><td style="padding:6px 12px;">${net ? net.name : '—'}</td></tr>
                                        <tr><td class="text-secondary" style="padding:6px 12px;">Project</td><td style="padding:6px 12px;">${data.project || '— None —'}</td></tr>
                                        <tr><td class="text-secondary" style="padding:6px 12px;">Category</td><td style="padding:6px 12px;">${data.category || '— None —'}</td></tr>
                                    </table>
                                </div>
                            </div>
                        `;
                    },
                },
            ],
            onComplete: async (data) => {
                const hosts = state.hosts;
                const randomHost = hosts[Math.floor(Math.random() * hosts.length)];
                const cats = [];
                if (data.category) {
                    const [key, value] = data.category.split(':');
                    cats.push({ key, value });
                }
                await state.create('vms', {
                    name: data.name.trim(),
                    vcpus: data.vcpus,
                    memory_gb: data.memory_gb,
                    power_state: 'off',
                    host_uuid: randomHost.uuid,
                    is_cvm: false,
                    disks: [{ size_gb: data.disk_size_gb, container: data.disk_container, image: data.disk_image || undefined }],
                    nics: [{ network_uuid: data.nic_network }],
                    project: data.project || undefined,
                    categories: cats.length ? cats : undefined,
                });
                toast.success(`VM "${data.name}" created successfully`);
            },
        });
        wizard.open();
    }

    #esc(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}
