import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { Wizard } from '../components/Wizard.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

/**
 * PC Networking — VPCs, Subnets, Floating IPs, Route Tables.
 * Simulates Prism Central networking for AHV overlay networks.
 */
export class PcNetworkView extends BaseView {
    #table = null;
    #unsubs = [];
    #activeTab = 'vpcs';

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        const header = document.createElement('div');
        header.className = 'page-title';
        header.innerHTML = `
            <h1>Network Configuration</h1>
            <button class="btn btn-primary" id="net-create-btn">+ Create</button>
        `;
        el.appendChild(header);

        const tabs = document.createElement('div');
        tabs.className = 'tabs';
        tabs.innerHTML = `
            <button class="tab active" data-tab="vpcs">VPCs</button>
            <button class="tab" data-tab="subnets">Subnets</button>
            <button class="tab" data-tab="floating_ips">Floating IPs</button>
            <button class="tab" data-tab="route_tables">Route Tables</button>
        `;
        el.appendChild(tabs);

        const content = document.createElement('div');
        content.id = 'net-content';
        el.appendChild(content);

        return el;
    }

    afterRender() {
        this.#renderTab(this.#activeTab);

        document.querySelectorAll('.tabs .tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.#activeTab = tab.dataset.tab;
                this.#renderTab(this.#activeTab);
            });
        });

        document.getElementById('net-create-btn')?.addEventListener('click', () => this.#create());

        this.#unsubs.push(
            bus.on('vpcs:created', () => this.#renderTab(this.#activeTab)),
            bus.on('vpcs:deleted', () => this.#renderTab(this.#activeTab)),
            bus.on('subnets:created', () => this.#renderTab(this.#activeTab)),
            bus.on('subnets:deleted', () => this.#renderTab(this.#activeTab)),
            bus.on('floating_ips:created', () => this.#renderTab(this.#activeTab)),
            bus.on('floating_ips:deleted', () => this.#renderTab(this.#activeTab)),
        );
    }

    destroy() { this.#unsubs.forEach(fn => fn()); }

    #renderTab(tab) {
        const container = document.getElementById('net-content');
        if (!container) return;
        container.innerHTML = '';

        if (tab === 'vpcs') this.#renderVpcs(container);
        else if (tab === 'subnets') this.#renderSubnets(container);
        else if (tab === 'floating_ips') this.#renderFloatingIps(container);
        else this.#renderRouteTables(container);
    }

    #renderVpcs(container) {
        const vpcs = state.getAll('vpcs');

        const summary = document.createElement('div');
        summary.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-lg);margin:var(--space-lg) 0;';
        summary.innerHTML = `
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${vpcs.length}</div>
                <div class="text-secondary text-sm">Total VPCs</div>
            </div></div>
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--status-good);">${state.getAll('subnets').length}</div>
                <div class="text-secondary text-sm">Total Subnets</div>
            </div></div>
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${state.getAll('floating_ips').length}</div>
                <div class="text-secondary text-sm">Floating IPs</div>
            </div></div>
        `;
        container.appendChild(summary);

        this.#table = new EntityTable({
            columns: [
                { key: 'name', label: 'VPC Name' },
                { key: 'cidr', label: 'CIDR Block' },
                { key: 'external_subnet', label: 'External Subnet' },
                { key: 'dns_servers', label: 'DNS', render: v => (v || []).join(', ') || '—' },
                { key: 'subnet_count', label: 'Subnets', render: (_, row) => state.getAll('subnets').filter(s => s.vpc_uuid === row.uuid).length },
                { key: 'status', label: 'Status', render: v => `<span style="color:${v === 'active' ? 'var(--status-good)' : 'var(--status-warning)'};">${v}</span>` },
            ],
            data: vpcs,
            searchKeys: ['name', 'cidr'],
            selectable: true,
            actions: [
                { label: '🗑️ Delete', variant: 'danger', onClick: (item) => this.#deleteItems('vpcs', [item]) },
            ],
        });
        container.appendChild(this.#table.render());
    }

    #renderSubnets(container) {
        const subnets = state.getAll('subnets');
        const vpcs = state.getAll('vpcs');

        this.#table = new EntityTable({
            columns: [
                { key: 'name', label: 'Subnet Name' },
                { key: 'type', label: 'Type', render: v => `<span class="badge">${v}</span>` },
                { key: 'vpc_uuid', label: 'VPC', render: v => { const vpc = vpcs.find(x => x.uuid === v); return vpc ? vpc.name : '—'; }},
                { key: 'cidr', label: 'CIDR' },
                { key: 'gateway', label: 'Gateway' },
                { key: 'ip_pool', label: 'IP Pool', render: (_, row) => row.pool_start && row.pool_end ? `${row.pool_start} – ${row.pool_end}` : '—' },
                { key: 'nat', label: 'NAT', render: v => v ? '✅' : '—' },
            ],
            data: subnets,
            searchKeys: ['name', 'cidr', 'type'],
            selectable: true,
            actions: [
                { label: '🗑️ Delete', variant: 'danger', onClick: (item) => this.#deleteItems('subnets', [item]) },
            ],
        });
        container.appendChild(this.#table.render());
    }

    #renderFloatingIps(container) {
        const fips = state.getAll('floating_ips');

        this.#table = new EntityTable({
            columns: [
                { key: 'ip', label: 'Floating IP' },
                { key: 'vpc_name', label: 'VPC' },
                { key: 'assigned_to', label: 'Assigned To', render: v => v || '<span class="text-secondary">Unassigned</span>' },
                { key: 'status', label: 'Status', render: v => `<span style="color:${v === 'assigned' ? 'var(--status-good)' : 'var(--text-secondary)'};">${v}</span>` },
            ],
            data: fips,
            searchKeys: ['ip', 'vpc_name', 'assigned_to'],
            selectable: true,
            actions: [
                { label: '🗑️ Release', variant: 'danger', onClick: (item) => this.#deleteItems('floating_ips', [item]) },
            ],
        });
        container.appendChild(this.#table.render());
    }

    #renderRouteTables(container) {
        const vpcs = state.getAll('vpcs');

        if (vpcs.length === 0) {
            container.innerHTML = '<div class="card"><div class="card-body" style="text-align:center;padding:40px;"><h3>No VPCs configured</h3><p class="text-secondary">Create a VPC to see its route table.</p></div></div>';
            return;
        }

        vpcs.forEach(vpc => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.marginTop = 'var(--space-lg)';
            const routes = vpc.routes || [
                { destination: '0.0.0.0/0', target: 'External Gateway', type: 'default' },
                { destination: vpc.cidr, target: 'Local', type: 'local' },
            ];
            card.innerHTML = `
                <div class="card-header">${vpc.name} — Route Table</div>
                <div class="card-body">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr style="border-bottom:2px solid var(--border-subtle);">
                                <th style="text-align:left;padding:8px;">Destination</th>
                                <th style="text-align:left;padding:8px;">Target</th>
                                <th style="text-align:left;padding:8px;">Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${routes.map(r => `
                                <tr style="border-bottom:1px solid var(--border-subtle);">
                                    <td style="padding:8px;font-family:monospace;">${r.destination}</td>
                                    <td style="padding:8px;">${r.target}</td>
                                    <td style="padding:8px;"><span class="badge">${r.type}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            container.appendChild(card);
        });
    }

    #create() {
        if (this.#activeTab === 'vpcs') this.#createVpc();
        else if (this.#activeTab === 'subnets') this.#createSubnet();
        else if (this.#activeTab === 'floating_ips') this.#allocateFloatingIp();
        else toast('Route tables are auto-generated per VPC.', 'info');
    }

    #createVpc() {
        const networks = state.networks;
        const wizard = new Wizard({
            title: 'Create VPC',
            initialData: { name: '', cidr: '', external_subnet: networks[0]?.name || '', dns: '' },
            steps: [
                {
                    label: 'VPC Details',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">VPC Name</label>
                            <input class="form-input" data-field="name" value="${data.name}" placeholder="e.g. Production-VPC" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">CIDR Block</label>
                            <input class="form-input" data-field="cidr" value="${data.cidr}" placeholder="172.16.0.0/16" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">External Subnet</label>
                            <select class="form-input" data-field="external_subnet">
                                ${networks.map(n => `<option value="${n.name}" ${data.external_subnet === n.name ? 'selected' : ''}>${n.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">DNS Servers (comma-separated)</label>
                            <input class="form-input" data-field="dns" value="${data.dns}" placeholder="10.42.100.10" />
                        </div>
                    `,
                    validate: (data) => {
                        const errors = [];
                        if (!data.name?.trim()) errors.push('VPC name is required');
                        if (!data.cidr?.trim()) errors.push('CIDR block is required');
                        if (!data.external_subnet) errors.push('External subnet is required');
                        return errors;
                    },
                },
            ],
            onComplete: async (data) => {
                await state.create('vpcs', {
                    name: data.name.trim(),
                    cidr: data.cidr.trim(),
                    external_subnet: data.external_subnet,
                    dns_servers: data.dns ? data.dns.split(',').map(s => s.trim()) : [],
                    status: 'active',
                    routes: [
                        { destination: '0.0.0.0/0', target: 'External Gateway', type: 'default' },
                        { destination: data.cidr.trim(), target: 'Local', type: 'local' },
                    ],
                });
                toast(`VPC "${data.name}" created.`, 'success');
            },
        });
        wizard.open();
    }

    #createSubnet() {
        const vpcs = state.getAll('vpcs');
        if (vpcs.length === 0) { toast('Create a VPC first.', 'warning'); return; }

        const wizard = new Wizard({
            title: 'Create Subnet',
            initialData: { name: '', vpc_uuid: vpcs[0]?.uuid || '', type: 'Overlay', cidr: '', gateway: '', pool_start: '', pool_end: '', nat: 'Yes' },
            steps: [
                {
                    label: 'Subnet Details',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Subnet Name</label>
                            <input class="form-input" data-field="name" value="${data.name}" placeholder="e.g. App-Tier-Subnet" />
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                            <div class="form-group">
                                <label class="form-label">VPC</label>
                                <select class="form-input" data-field="vpc_uuid">
                                    ${vpcs.map(v => `<option value="${v.uuid}" ${data.vpc_uuid === v.uuid ? 'selected' : ''}>${v.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Type</label>
                                <select class="form-input" data-field="type">
                                    <option ${data.type === 'Overlay' ? 'selected' : ''}>Overlay</option>
                                    <option ${data.type === 'VLAN' ? 'selected' : ''}>VLAN</option>
                                </select>
                            </div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                            <div class="form-group">
                                <label class="form-label">CIDR</label>
                                <input class="form-input" data-field="cidr" value="${data.cidr}" placeholder="172.16.1.0/24" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Gateway</label>
                                <input class="form-input" data-field="gateway" value="${data.gateway}" placeholder="172.16.1.1" />
                            </div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
                            <div class="form-group">
                                <label class="form-label">IP Pool Start</label>
                                <input class="form-input" data-field="pool_start" value="${data.pool_start}" placeholder="172.16.1.10" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">IP Pool End</label>
                                <input class="form-input" data-field="pool_end" value="${data.pool_end}" placeholder="172.16.1.250" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Enable NAT</label>
                                <select class="form-input" data-field="nat">
                                    <option ${data.nat === 'Yes' ? 'selected' : ''}>Yes</option>
                                    <option ${data.nat === 'No' ? 'selected' : ''}>No</option>
                                </select>
                            </div>
                        </div>
                    `,
                    validate: (data) => {
                        const errors = [];
                        if (!data.name?.trim()) errors.push('Subnet name is required');
                        if (!data.cidr?.trim()) errors.push('CIDR is required');
                        if (!data.gateway?.trim()) errors.push('Gateway is required');
                        return errors;
                    },
                },
            ],
            onComplete: async (data) => {
                await state.create('subnets', {
                    name: data.name.trim(),
                    vpc_uuid: data.vpc_uuid,
                    type: data.type,
                    cidr: data.cidr.trim(),
                    gateway: data.gateway.trim(),
                    pool_start: data.pool_start || '',
                    pool_end: data.pool_end || '',
                    nat: data.nat === 'Yes',
                });
                toast(`Subnet "${data.name}" created.`, 'success');
            },
        });
        wizard.open();
    }

    #allocateFloatingIp() {
        const vpcs = state.getAll('vpcs');
        if (vpcs.length === 0) { toast('Create a VPC first.', 'warning'); return; }

        const wizard = new Wizard({
            title: 'Allocate Floating IP',
            initialData: { vpc_uuid: vpcs[0]?.uuid || '' },
            steps: [
                {
                    label: 'Select VPC',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">VPC</label>
                            <select class="form-input" data-field="vpc_uuid">
                                ${vpcs.map(v => `<option value="${v.uuid}" ${data.vpc_uuid === v.uuid ? 'selected' : ''}>${v.name}</option>`).join('')}
                            </select>
                        </div>
                        <p class="text-secondary text-sm">A random floating IP will be allocated from the VPC's address space.</p>
                    `,
                },
            ],
            onComplete: async (data) => {
                const vpc = vpcs.find(v => v.uuid === data.vpc_uuid);
                const base = vpc ? vpc.cidr.split('/')[0].split('.').slice(0, 3).join('.') : '10.0.0';
                const ip = `${base}.${Math.floor(Math.random() * 200) + 50}`;
                await state.create('floating_ips', {
                    ip,
                    vpc_uuid: data.vpc_uuid,
                    vpc_name: vpc?.name || '',
                    assigned_to: null,
                    status: 'available',
                });
                toast(`Floating IP ${ip} allocated.`, 'success');
            },
        });
        wizard.open();
    }

    async #deleteItems(collection, selected) {
        if (!selected || selected.length === 0) { toast('Select items first.', 'warning'); return; }
        const ok = await confirm({ title: 'Delete Items', message: `Delete ${selected.length} ${collection} item(s)?`, confirmLabel: 'Delete', danger: true });
        if (!ok) return;
        for (const item of selected) { await state.remove(collection, item.uuid); }
        toast(`Deleted ${selected.length} item(s).`, 'success');
    }
}
