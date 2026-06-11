import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { Wizard } from '../components/Wizard.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

/**
 * PE Network Configuration — Manage virtual networks.
 */
export class PeNetworkView extends BaseView {
    #table = null;
    #unsubs = [];

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        const header = document.createElement('div');
        header.className = 'page-title';
        header.innerHTML = `
            <h1>Network Configuration</h1>
            <button class="btn btn-primary" id="create-network-btn">+ Create Network</button>
        `;
        el.appendChild(header);

        this.#table = new EntityTable({
            columns: [
                { key: 'name', label: 'Name', sortable: true, render: (v) => `<strong>${v}</strong>` },
                { key: 'vlan_id', label: 'VLAN ID', sortable: true },
                { key: 'subnet', label: 'Subnet', sortable: true, render: (v) => `<span class="font-mono">${v}</span>` },
                { key: 'gateway', label: 'Gateway', render: (v) => `<span class="font-mono">${v}</span>` },
                {
                    key: 'ipam', label: 'IPAM', sortable: true,
                    render: (v) => v ? '<span class="status-badge good"><span class="dot"></span>Enabled</span>' : '<span class="text-secondary">Disabled</span>'
                },
                {
                    key: 'pool_start', label: 'IP Pool',
                    render: (val, item) => item.ipam && val ? `<span class="font-mono text-sm">${val} - ${item.pool_end}</span>` : '—'
                },
            ],
            data: state.networks,
            searchKeys: ['name'],
            emptyMessage: 'No networks configured',
            emptyIcon: '🌐',
            actions: [
                { label: 'Delete', danger: true, onClick: (n) => this.#deleteNetwork(n) },
            ],
        });

        el.appendChild(this.#table.render());
        return el;
    }

    afterRender() {
        document.getElementById('create-network-btn')?.addEventListener('click', () => this.#openCreateWizard());
        const unsub = bus.on('networks:created', () => this.#table?.setData(state.networks));
        const unsub2 = bus.on('networks:deleted', () => this.#table?.setData(state.networks));
        this.#unsubs.push(unsub, unsub2);
    }

    destroy() {
        this.#table?.destroy();
        this.#unsubs.forEach(u => u());
    }

    async #deleteNetwork(network) {
        const usedBy = state.vms.filter(vm => vm.nics?.some(n => n.network_uuid === network.uuid));
        if (usedBy.length > 0) {
            toast.warning(`Cannot delete: ${usedBy.length} VM(s) use this network`);
            return;
        }
        const ok = await confirm({ title: 'Delete Network', message: `Delete <strong>${network.name}</strong>?`, confirmLabel: 'Delete', danger: true });
        if (ok) {
            await state.remove('networks', network.uuid);
            toast.success(`Network "${network.name}" deleted`);
        }
    }

    #openCreateWizard() {
        const wizard = new Wizard({
            title: 'Create Network',
            initialData: { name: '', vlan_id: '', subnet: '', gateway: '', ipam: false, dns: '', pool_start: '', pool_end: '' },
            steps: [
                {
                    label: 'Configuration',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Network Name</label>
                            <input class="form-input" data-field="name" value="${data.name}" placeholder="e.g., VM-Network-500" />
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                            <div class="form-group">
                                <label class="form-label">VLAN ID</label>
                                <input class="form-input" data-field="vlan_id" type="number" min="0" max="4094" value="${data.vlan_id}" placeholder="0-4094" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Subnet (CIDR)</label>
                                <input class="form-input" data-field="subnet" value="${data.subnet}" placeholder="e.g., 10.42.500.0/24" />
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Gateway</label>
                            <input class="form-input" data-field="gateway" value="${data.gateway}" placeholder="e.g., 10.42.500.1" />
                        </div>
                    `,
                    validate: (data) => {
                        const errors = [];
                        if (!data.name?.trim()) errors.push('Network name is required');
                        if (!data.vlan_id && data.vlan_id !== 0) errors.push('VLAN ID is required');
                        if (state.networks.some(n => n.name === data.name?.trim())) errors.push('Network name already exists');
                        return errors;
                    },
                },
                {
                    label: 'IPAM',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label" style="display:flex;align-items:center;gap:8px;">
                                <input type="checkbox" data-field="ipam" ${data.ipam ? 'checked' : ''} />
                                Enable IP Address Management (IPAM)
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="form-label">DNS Servers</label>
                            <input class="form-input" data-field="dns" value="${data.dns}" placeholder="Comma-separated, e.g., 10.42.100.10" />
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                            <div class="form-group">
                                <label class="form-label">IP Pool Start</label>
                                <input class="form-input" data-field="pool_start" value="${data.pool_start}" placeholder="e.g., 10.42.500.10" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">IP Pool End</label>
                                <input class="form-input" data-field="pool_end" value="${data.pool_end}" placeholder="e.g., 10.42.500.200" />
                            </div>
                        </div>
                    `,
                },
                {
                    label: 'Review',
                    render: (data) => `
                        <div class="card" style="background:var(--gray-50);border:1px solid var(--border-light);">
                            <div class="card-body">
                                <table style="width:100%;font-size:13px;">
                                    <tr><td class="text-secondary" style="padding:6px 12px;width:140px;">Name</td><td style="padding:6px 12px;font-weight:600;">${data.name}</td></tr>
                                    <tr><td class="text-secondary" style="padding:6px 12px;">VLAN ID</td><td style="padding:6px 12px;">${data.vlan_id}</td></tr>
                                    <tr><td class="text-secondary" style="padding:6px 12px;">Subnet</td><td style="padding:6px 12px;">${data.subnet || '—'}</td></tr>
                                    <tr><td class="text-secondary" style="padding:6px 12px;">Gateway</td><td style="padding:6px 12px;">${data.gateway || '—'}</td></tr>
                                    <tr><td class="text-secondary" style="padding:6px 12px;">IPAM</td><td style="padding:6px 12px;">${data.ipam ? 'Enabled' : 'Disabled'}</td></tr>
                                    ${data.ipam ? `<tr><td class="text-secondary" style="padding:6px 12px;">IP Pool</td><td style="padding:6px 12px;">${data.pool_start || '—'} — ${data.pool_end || '—'}</td></tr>` : ''}
                                    <tr><td class="text-secondary" style="padding:6px 12px;">DNS</td><td style="padding:6px 12px;">${data.dns || '—'}</td></tr>
                                </table>
                            </div>
                        </div>
                    `,
                },
            ],
            onComplete: async (data) => {
                await state.create('networks', {
                    name: data.name.trim(),
                    vlan_id: Number(data.vlan_id),
                    subnet: data.subnet || '',
                    gateway: data.gateway || '',
                    ipam: !!data.ipam,
                    dns: data.dns ? data.dns.split(',').map(s => s.trim()) : [],
                    pool_start: data.pool_start || '',
                    pool_end: data.pool_end || '',
                });
                toast.success(`Network "${data.name}" created`);
            },
        });
        wizard.open();
    }
}
