import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { Wizard } from '../components/Wizard.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

/**
 * PC Calm — Blueprint & Marketplace management for Nutanix Calm automation.
 */

const MARKETPLACE_ITEMS = [
    { name: 'WordPress', icon: '📝', category: 'Web', description: 'Full WordPress stack with MySQL backend', version: '6.4.2', publisher: 'Nutanix' },
    { name: 'LAMP Stack', icon: '🔥', category: 'Web', description: 'Linux, Apache, MySQL, PHP stack', version: '2.0', publisher: 'Nutanix' },
    { name: 'Kubernetes', icon: '☸️', category: 'Container', description: 'Multi-node Kubernetes cluster with Flannel CNI', version: '1.29', publisher: 'Nutanix' },
    { name: 'MongoDB', icon: '🍃', category: 'Database', description: 'MongoDB replica set with 3 nodes', version: '7.0', publisher: 'Community' },
    { name: 'Hadoop', icon: '🐘', category: 'Big Data', description: 'Hadoop cluster with HDFS and YARN', version: '3.3.6', publisher: 'Community' },
    { name: 'Jenkins', icon: '🔧', category: 'CI/CD', description: 'Jenkins CI server with agent nodes', version: '2.440', publisher: 'Community' },
    { name: 'PostgreSQL HA', icon: '🐘', category: 'Database', description: 'PostgreSQL with Patroni HA and pgBouncer', version: '16.1', publisher: 'Nutanix' },
    { name: 'Grafana + Prometheus', icon: '📊', category: 'Monitoring', description: 'Monitoring stack with dashboards', version: '10.2', publisher: 'Community' },
];

export class PcCalmView extends BaseView {
    #table = null;
    #unsubs = [];
    #tab = 'blueprints';

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        el.innerHTML = `
            <div class="page-title">
                <h1>🧩 Calm — Application Automation</h1>
                <button class="btn btn-primary" id="create-bp-btn">+ Create Blueprint</button>
            </div>

            <div style="display:flex;gap:0;margin-bottom:var(--space-lg);border-bottom:2px solid var(--border-light);">
                <button class="btn btn-sm tab-btn active" data-tab="blueprints" style="border-radius:0;border-bottom:2px solid var(--blue-500);margin-bottom:-2px;">📋 Blueprints</button>
                <button class="btn btn-sm tab-btn" data-tab="applications" style="border-radius:0;border-bottom:2px solid transparent;margin-bottom:-2px;">🚀 Applications</button>
                <button class="btn btn-sm tab-btn" data-tab="marketplace" style="border-radius:0;border-bottom:2px solid transparent;margin-bottom:-2px;">🏪 Marketplace</button>
                <button class="btn btn-sm tab-btn" data-tab="runbooks" style="border-radius:0;border-bottom:2px solid transparent;margin-bottom:-2px;">📔 Runbooks</button>
            </div>

            <div id="tab-content"></div>
        `;

        return el;
    }

    afterRender() {
        this.#renderTab('blueprints');

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => {
                    b.classList.remove('active');
                    b.style.borderBottomColor = 'transparent';
                });
                btn.classList.add('active');
                btn.style.borderBottomColor = 'var(--blue-500)';
                this.#tab = btn.dataset.tab;
                this.#renderTab(btn.dataset.tab);
            });
        });

        document.getElementById('create-bp-btn')?.addEventListener('click', () => this.#openBlueprintWizard());

        const unsub = bus.on('blueprints:created', () => { if (this.#tab === 'blueprints') this.#renderTab('blueprints'); });
        const unsub2 = bus.on('applications:created', () => { if (this.#tab === 'applications') this.#renderTab('applications'); });
        const unsub3 = bus.on('runbooks:created', () => { if (this.#tab === 'runbooks') this.#renderTab('runbooks'); });
        this.#unsubs.push(unsub, unsub2, unsub3);
    }

    destroy() {
        this.#table?.destroy();
        this.#unsubs.forEach(u => u());
    }

    #renderTab(tab) {
        const container = document.getElementById('tab-content');
        if (!container) return;

        switch (tab) {
            case 'blueprints': this.#renderBlueprints(container); break;
            case 'applications': this.#renderApplications(container); break;
            case 'marketplace': this.#renderMarketplace(container); break;
            case 'runbooks': this.#renderRunbooks(container); break;
        }
    }

    #renderBlueprints(container) {
        const bps = state.getAll('blueprints');
        this.#table?.destroy();
        this.#table = new EntityTable({
            columns: [
                { key: 'name', label: 'Blueprint Name', sortable: true, render: (val) => `<strong>${this.#esc(val)}</strong>` },
                {
                    key: 'status', label: 'Status', sortable: true,
                    render: (val) => `<span class="status-badge ${val === 'active' ? 'good' : val === 'draft' ? 'warning' : 'info'}"><span class="dot"></span>${val}</span>`
                },
                { key: 'type', label: 'Type', sortable: true },
                { key: 'services', label: 'Services', render: (val) => val?.length || 0 },
                { key: 'project', label: 'Project', render: (val) => val || '—' },
                { key: 'updated_at', label: 'Last Modified', render: (val) => val ? new Date(val).toLocaleDateString() : '—' },
            ],
            data: bps,
            searchKeys: ['name', 'project'],
            selectable: true,
            emptyMessage: 'No blueprints created yet. Create one or import from the Marketplace.',
            emptyIcon: '🧩',
            actions: [
                {
                    label: 'Launch', onClick: async (bp) => {
                        const appName = `${bp.name}-${Date.now().toString(36).slice(-4)}`;
                        await state.create('applications', {
                            name: appName, blueprint: bp.name, status: 'running',
                            services: bp.services, project: bp.project,
                        });
                        toast.success(`Application "${appName}" launched from blueprint "${bp.name}"`);
                    }
                },
                {
                    label: 'Publish to Marketplace', onClick: async (bp) => {
                        await state.update('blueprints', bp.uuid, { status: 'published' });
                        toast.success(`"${bp.name}" published to Marketplace`);
                    }
                },
                { label: 'Delete', danger: true, onClick: async (bp) => {
                    const ok = await confirm({ title: 'Delete Blueprint', message: `Delete <strong>${bp.name}</strong>?`, confirmLabel: 'Delete', danger: true });
                    if (ok) { await state.remove('blueprints', bp.uuid); toast.success(`"${bp.name}" deleted`); this.#renderBlueprints(container); }
                }},
            ],
        });
        container.innerHTML = '';
        container.appendChild(this.#table.render());
    }

    #renderApplications(container) {
        const apps = state.getAll('applications');
        this.#table?.destroy();
        this.#table = new EntityTable({
            columns: [
                { key: 'name', label: 'Application', sortable: true, render: (val) => `<strong>${this.#esc(val)}</strong>` },
                { key: 'blueprint', label: 'Blueprint', sortable: true },
                {
                    key: 'status', label: 'Status', sortable: true,
                    render: (val) => {
                        const cls = val === 'running' ? 'good' : val === 'error' ? 'critical' : 'warning';
                        return `<span class="status-badge ${cls}"><span class="dot"></span>${val}</span>`;
                    }
                },
                { key: 'services', label: 'Services', render: (val) => val?.length || 0 },
                { key: 'project', label: 'Project', render: (val) => val || '—' },
            ],
            data: apps,
            searchKeys: ['name', 'blueprint'],
            emptyMessage: 'No applications running. Launch one from a blueprint.',
            emptyIcon: '🚀',
            actions: [
                { label: 'Stop', onClick: async (app) => { await state.update('applications', app.uuid, { status: 'stopped' }); toast.info(`"${app.name}" stopped`); this.#renderApplications(container); }},
                { label: 'Delete', danger: true, onClick: async (app) => { await state.remove('applications', app.uuid); toast.success(`"${app.name}" deleted`); this.#renderApplications(container); }},
            ],
        });
        container.innerHTML = '';
        container.appendChild(this.#table.render());
    }

    #renderMarketplace(container) {
        const published = state.getAll('blueprints').filter(b => b.status === 'published');
        const allItems = [...MARKETPLACE_ITEMS, ...published.map(b => ({ name: b.name, icon: '📋', category: 'Custom', description: `Published blueprint`, version: '1.0', publisher: 'Local' }))];
        const categories = [...new Set(allItems.map(i => i.category))];

        container.innerHTML = `
            <div style="display:flex;gap:8px;margin-bottom:var(--space-lg);flex-wrap:wrap;">
                <button class="btn btn-sm btn-secondary mp-filter active" data-filter="all">All</button>
                ${categories.map(c => `<button class="btn btn-sm btn-secondary mp-filter" data-filter="${c}">${c}</button>`).join('')}
            </div>
            <div id="mp-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
                ${allItems.map(item => `
                    <div class="card mp-card" data-category="${item.category}" style="cursor:pointer;transition:transform 0.15s,box-shadow 0.15s;">
                        <div class="card-body">
                            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                                <span style="font-size:32px;">${item.icon}</span>
                                <div>
                                    <strong>${item.name}</strong>
                                    <div class="text-secondary text-sm">v${item.version} · ${item.publisher}</div>
                                </div>
                            </div>
                            <p class="text-secondary text-sm" style="margin-bottom:12px;">${item.description}</p>
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <span class="status-badge info"><span class="dot"></span>${item.category}</span>
                                <button class="btn btn-sm btn-primary mp-clone-btn" data-name="${item.name}">Clone to Blueprints</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        container.querySelectorAll('.mp-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.mp-filter').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                container.querySelectorAll('.mp-card').forEach(card => {
                    card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
                });
            });
        });

        container.querySelectorAll('.mp-clone-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const item = allItems.find(i => i.name === btn.dataset.name);
                if (!item) return;
                await state.create('blueprints', {
                    name: `${item.name}-clone`, type: 'Multi-VM', status: 'draft',
                    services: [{ name: item.name, type: 'VM', substrate: 'AHV' }],
                    project: '', source: 'marketplace',
                });
                toast.success(`"${item.name}" cloned to your Blueprints`);
            });
        });

        container.querySelectorAll('.mp-card').forEach(card => {
            card.addEventListener('mouseenter', () => { card.style.transform = 'translateY(-2px)'; card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; });
            card.addEventListener('mouseleave', () => { card.style.transform = ''; card.style.boxShadow = ''; });
        });
    }

    #renderRunbooks(container) {
        const runbooks = state.getAll('runbooks');
        this.#table?.destroy();
        this.#table = new EntityTable({
            columns: [
                { key: 'name', label: 'Runbook Name', sortable: true, render: (val) => `<strong>${this.#esc(val)}</strong>` },
                { key: 'type', label: 'Type' },
                {
                    key: 'status', label: 'Status',
                    render: (val) => `<span class="status-badge ${val === 'active' ? 'good' : 'warning'}"><span class="dot"></span>${val}</span>`
                },
                { key: 'last_run', label: 'Last Run', render: (val) => val || 'Never' },
                { key: 'run_count', label: 'Runs', render: (val) => val || 0 },
            ],
            data: runbooks,
            searchKeys: ['name'],
            emptyMessage: 'No runbooks created. Create a runbook to automate operational tasks.',
            emptyIcon: '📔',
            actions: [
                {
                    label: 'Execute', onClick: async (rb) => {
                        await state.update('runbooks', rb.uuid, { last_run: new Date().toISOString(), run_count: (rb.run_count || 0) + 1 });
                        toast.success(`Runbook "${rb.name}" executed`);
                        this.#renderRunbooks(container);
                    }
                },
                { label: 'Delete', danger: true, onClick: async (rb) => { await state.remove('runbooks', rb.uuid); toast.success(`"${rb.name}" deleted`); this.#renderRunbooks(container); }},
            ],
        });
        container.innerHTML = '';

        const btnBar = document.createElement('div');
        btnBar.style.cssText = 'margin-bottom:var(--space-md);';
        btnBar.innerHTML = `<button class="btn btn-sm btn-secondary" id="create-rb-btn">+ Create Runbook</button>`;
        container.appendChild(btnBar);
        container.appendChild(this.#table.render());

        document.getElementById('create-rb-btn')?.addEventListener('click', () => this.#openRunbookWizard(container));
    }

    #openBlueprintWizard() {
        const wizard = new Wizard({
            title: 'Create Blueprint',
            initialData: { name: '', type: 'Multi-VM', project: '', services: '' },
            steps: [
                {
                    label: 'General',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Blueprint Name</label>
                            <input class="form-input" data-field="name" value="${data.name}" placeholder="e.g., WebApp-3Tier" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Type</label>
                            <select class="form-input" data-field="type">
                                <option ${data.type === 'Multi-VM' ? 'selected' : ''}>Multi-VM</option>
                                <option ${data.type === 'Single-VM' ? 'selected' : ''}>Single-VM</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Project</label>
                            <input class="form-input" data-field="project" value="${data.project}" placeholder="e.g., Engineering" />
                        </div>
                    `,
                    validate: (data) => {
                        const errors = [];
                        if (!data.name?.trim()) errors.push('Blueprint name is required');
                        return errors;
                    },
                },
                {
                    label: 'Services',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Services (comma-separated names)</label>
                            <input class="form-input" data-field="services" value="${data.services}" placeholder="e.g., WebServer, AppServer, Database" />
                        </div>
                        <p class="text-secondary text-sm">Each service represents a VM tier in the blueprint. They will use AHV as the substrate.</p>
                    `,
                },
            ],
            onComplete: async (data) => {
                const services = (data.services || '').split(',').map(s => s.trim()).filter(Boolean).map(s => ({ name: s, type: 'VM', substrate: 'AHV' }));
                await state.create('blueprints', {
                    name: data.name.trim(), type: data.type, status: 'draft',
                    services, project: data.project || '',
                });
                toast.success(`Blueprint "${data.name}" created`);
            },
        });
        wizard.open();
    }

    #openRunbookWizard(container) {
        const wizard = new Wizard({
            title: 'Create Runbook',
            initialData: { name: '', type: 'Operational' },
            steps: [{
                label: 'Details',
                render: (data) => `
                    <div class="form-group">
                        <label class="form-label">Runbook Name</label>
                        <input class="form-input" data-field="name" value="${data.name}" placeholder="e.g., Cluster-Health-Check" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Type</label>
                        <select class="form-input" data-field="type">
                            <option>Operational</option>
                            <option>Remediation</option>
                            <option>Provisioning</option>
                        </select>
                    </div>
                `,
                validate: (data) => !data.name?.trim() ? ['Runbook name is required'] : [],
            }],
            onComplete: async (data) => {
                await state.create('runbooks', { name: data.name.trim(), type: data.type, status: 'active', run_count: 0, last_run: null });
                toast.success(`Runbook "${data.name}" created`);
                this.#renderRunbooks(container);
            },
        });
        wizard.open();
    }

    #esc(str) { return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
}
