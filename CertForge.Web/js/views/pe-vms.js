import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { Wizard } from '../components/Wizard.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

/**
 * PE VM List — Virtual machine management with create wizard.
 */
export class PeVmsView extends BaseView {
    #table = null;
    #unsubs = [];

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        // Page title
        const header = document.createElement('div');
        header.className = 'page-title';
        header.innerHTML = `
            <h1>Virtual Machines</h1>
            <button class="btn btn-primary" id="create-vm-btn">+ Create VM</button>
        `;
        el.appendChild(header);

        // Table
        this.#table = new EntityTable({
            columns: [
                {
                    key: 'name', label: 'Name', sortable: true,
                    render: (val, item) => `<strong>${this.#esc(val)}</strong>${item.is_cvm ? ' <span style="color:var(--text-secondary);font-size:11px;">(CVM)</span>' : ''}`
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
            ],
            data: state.vms,
            searchKeys: ['name'],
            selectable: true,
            emptyMessage: 'No virtual machines found',
            emptyIcon: '🖥️',
            actions: [
                {
                    label: 'Power On',
                    onClick: (vm) => this.#powerAction(vm, 'on'),
                },
                {
                    label: 'Power Off',
                    onClick: (vm) => this.#powerAction(vm, 'off'),
                },
                {
                    label: 'Delete',
                    danger: true,
                    onClick: (vm) => this.#deleteVm(vm),
                },
            ],
        });

        el.appendChild(this.#table.render());

        return el;
    }

    afterRender() {
        document.getElementById('create-vm-btn')?.addEventListener('click', () => this.#openCreateWizard());

        // Subscribe to state changes
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
        if (vm.is_cvm) {
            toast.warning('Cannot change power state of a Controller VM');
            return;
        }
        if (vm.power_state === targetState) {
            toast.info(`VM is already powered ${targetState}`);
            return;
        }
        await state.update('vms', vm.uuid, { power_state: targetState });
        toast.success(`${vm.name} powered ${targetState}`);
    }

    async #deleteVm(vm) {
        if (vm.is_cvm) {
            toast.warning('Cannot delete a Controller VM');
            return;
        }
        const ok = await confirm({
            title: 'Delete VM',
            message: `Are you sure you want to delete <strong>${vm.name}</strong>? This action cannot be undone.`,
            confirmLabel: 'Delete',
            danger: true,
        });
        if (ok) {
            await state.remove('vms', vm.uuid);
            toast.success(`${vm.name} deleted`);
        }
    }

    #openCreateWizard() {
        const images = state.images;
        const networks = state.networks;
        const containers = state.containers;

        const wizard = new Wizard({
            title: 'Create VM',
            initialData: { name: '', vcpus: 2, memory_gb: 4, disk_size_gb: 50, disk_container: containers[0]?.name || '', disk_image: '', nic_network: networks[0]?.uuid || '' },
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
                    label: 'Network',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Network</label>
                            <select class="form-input" data-field="nic_network">
                                ${networks.map(n => `<option value="${n.uuid}" ${n.uuid === data.nic_network ? 'selected' : ''}>${n.name} (VLAN ${n.vlan_id})</option>`).join('')}
                            </select>
                        </div>
                    `,
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
                await state.create('vms', {
                    name: data.name.trim(),
                    vcpus: data.vcpus,
                    memory_gb: data.memory_gb,
                    power_state: 'off',
                    host_uuid: randomHost.uuid,
                    is_cvm: false,
                    disks: [{ size_gb: data.disk_size_gb, container: data.disk_container, image: data.disk_image || undefined }],
                    nics: [{ network_uuid: data.nic_network }],
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
