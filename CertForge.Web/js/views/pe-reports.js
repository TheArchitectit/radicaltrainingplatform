import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { toast } from '../components/Toast.js';
import { Wizard } from '../components/Wizard.js';
import { confirm } from '../components/ConfirmDialog.js';

export class PeReportsView extends BaseView {
    #libraryTable = null;
    #scheduledTable = null;
    #unsubs = [];
    #activeTab = 'library';

    async render() {
        const reports = state.getAll('pe_reports') || [];
        const scheduled = reports.filter(r => r.schedule);
        const library = reports.filter(r => !r.schedule);
        const generatedToday = library.filter(r => {
            if (!r.generatedAt) return false;
            const today = new Date().toISOString().slice(0, 10);
            return r.generatedAt.startsWith(today);
        });
        const exported = library.filter(r => r.exported);

        const el = document.createElement('div');
        el.className = 'view';
        el.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-lg);">
                <h1 class="page-title" style="margin:0;">Reports</h1>
                <button class="btn btn-primary" id="generate-report-btn">+ Generate Report</button>
            </div>

            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-lg);margin-bottom:var(--space-xl);">
                <div class="card">
                    <div class="card-body" style="text-align:center;">
                        <div class="text-secondary text-sm">Total Reports</div>
                        <div style="font-size:1.8rem;font-weight:700;color:var(--prism-blue);">${library.length}</div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body" style="text-align:center;">
                        <div class="text-secondary text-sm">Scheduled</div>
                        <div style="font-size:1.8rem;font-weight:700;color:var(--prism-blue);">${scheduled.length}</div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body" style="text-align:center;">
                        <div class="text-secondary text-sm">Generated Today</div>
                        <div style="font-size:1.8rem;font-weight:700;color:var(--status-good);">${generatedToday.length}</div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body" style="text-align:center;">
                        <div class="text-secondary text-sm">Exported</div>
                        <div style="font-size:1.8rem;font-weight:700;color:var(--text-secondary);">${exported.length}</div>
                    </div>
                </div>
            </div>

            <div class="tabs" style="margin-bottom:var(--space-lg);">
                <button class="tab ${this.#activeTab === 'library' ? 'active' : ''}" data-tab="library">Reports Library</button>
                <button class="tab ${this.#activeTab === 'scheduled' ? 'active' : ''}" data-tab="scheduled">Scheduled Reports</button>
            </div>

            <div id="tab-content"></div>
        `;

        return el;
    }

    afterRender() {
        this.#renderActiveTab();

        this.root.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.#activeTab = tab.dataset.tab;
                this.root.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.#renderActiveTab();
            });
        });

        this.root.querySelector('#generate-report-btn')?.addEventListener('click', () => this.#openGenerateWizard());

        this.#unsubs.push(
            bus.on('pe_reports:created', () => this.refresh()),
            bus.on('pe_reports:updated', () => this.refresh()),
            bus.on('pe_reports:deleted', () => this.refresh())
        );
    }

    #renderActiveTab() {
        const container = this.root.querySelector('#tab-content');
        if (!container) return;
        container.innerHTML = '';

        if (this.#activeTab === 'library') {
            this.#renderLibraryTab(container);
        } else {
            this.#renderScheduledTab(container);
        }
    }

    #renderLibraryTab(container) {
        const reports = (state.getAll('pe_reports') || []).filter(r => !r.schedule);

        this.#libraryTable = new EntityTable({
            columns: [
                { key: 'name', label: 'Name' },
                { key: 'type', label: 'Type', render: (val) => `<span class="badge">${val}</span>` },
                { key: 'generatedAt', label: 'Generated At' },
                { key: 'size', label: 'Size' },
                {
                    key: 'status', label: 'Status', render: (val) => {
                        const color = val === 'ready' ? 'var(--status-good)' : 'var(--status-warning)';
                        return `<span style="color:${color};font-weight:600;">${val}</span>`;
                    }
                }
            ],
            data: reports,
            actions: [
                {
                    label: 'Download',
                    onClick: (item) => this.#downloadReport(item)
                },
                {
                    label: 'Delete',
                    danger: true,
                    onClick: (item) => this.#deleteReport(item)
                }
            ]
        });

        container.appendChild(this.#libraryTable.render());
    }

    #renderScheduledTab(container) {
        const scheduled = (state.getAll('pe_reports') || []).filter(r => r.schedule);

        this.#scheduledTable = new EntityTable({
            columns: [
                { key: 'name', label: 'Name' },
                { key: 'schedule', label: 'Schedule', render: (val) => `<span class="badge">${val}</span>` },
                { key: 'nextRun', label: 'Next Run' },
                { key: 'recipients', label: 'Recipients' },
                {
                    key: 'enabled', label: 'Enabled', render: (val) => {
                        const color = val ? 'var(--status-good)' : 'var(--text-secondary)';
                        return `<span style="color:${color};font-weight:600;">${val ? 'Yes' : 'No'}</span>`;
                    }
                }
            ],
            data: scheduled,
            actions: [
                {
                    label: 'Toggle',
                    onClick: (item) => this.#toggleScheduled(item)
                }
            ]
        });

        container.appendChild(this.#scheduledTable.render());
    }

    #downloadReport(item) {
        toast.success(`Downloading "${item.name}"... (simulated)`);
    }

    async #deleteReport(item) {
        const ok = await confirm({
            title: 'Delete Report',
            message: `Are you sure you want to delete report "${item.name}"? This action cannot be undone.`,
            confirmLabel: 'Delete',
            danger: true
        });
        if (ok) {
            state.remove('pe_reports', item.id);
            toast.success(`Report "${item.name}" deleted.`);
        }
    }

    #toggleScheduled(item) {
        state.update('pe_reports', item.id, { enabled: !item.enabled });
        toast.info(`Schedule "${item.name}" ${!item.enabled ? 'enabled' : 'disabled'}.`);
    }

    #openGenerateWizard() {
        const wizard = new Wizard({
            title: 'Generate Report',
            initialData: {},
            steps: [
                {
                    label: 'Report Details',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Report Name</label>
                            <input class="form-input" data-field="name" type="text" value="${data.name || ''}" placeholder="Enter report name" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Type</label>
                            <select class="form-input" data-field="type">
                                <option value="">Select type...</option>
                                <option value="Performance" ${data.type === 'Performance' ? 'selected' : ''}>Performance</option>
                                <option value="Capacity" ${data.type === 'Capacity' ? 'selected' : ''}>Capacity</option>
                                <option value="Configuration" ${data.type === 'Configuration' ? 'selected' : ''}>Configuration</option>
                                <option value="Custom" ${data.type === 'Custom' ? 'selected' : ''}>Custom</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Date Range</label>
                            <select class="form-input" data-field="dateRange">
                                <option value="last7d" ${data.dateRange === 'last7d' ? 'selected' : ''}>Last 7 Days</option>
                                <option value="last30d" ${data.dateRange === 'last30d' ? 'selected' : ''}>Last 30 Days</option>
                                <option value="last90d" ${data.dateRange === 'last90d' ? 'selected' : ''}>Last 90 Days</option>
                            </select>
                        </div>
                    `,
                    validate: (data) => {
                        const errors = [];
                        if (!data.name?.trim()) errors.push('Report name is required.');
                        if (!data.type) errors.push('Report type is required.');
                        return errors;
                    }
                },
                {
                    label: 'Configuration',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Entities to Include</label>
                            <input class="form-input" data-field="entities" type="text" value="${data.entities || ''}" placeholder="e.g. clusters, hosts, VMs" />
                            <div class="text-secondary text-sm" style="margin-top:4px;">Comma-separated: clusters, hosts, VMs</div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Format</label>
                            <select class="form-input" data-field="format">
                                <option value="PDF" ${data.format === 'PDF' ? 'selected' : ''}>PDF</option>
                                <option value="CSV" ${data.format === 'CSV' ? 'selected' : ''}>CSV</option>
                                <option value="HTML" ${data.format === 'HTML' ? 'selected' : ''}>HTML</option>
                            </select>
                        </div>
                    `,
                    validate: (data) => {
                        const errors = [];
                        if (!data.entities?.trim()) errors.push('Specify at least one entity type.');
                        return errors;
                    }
                }
            ],
            onComplete: (data) => this.#createReport(data)
        });
        wizard.open();
    }

    #createReport(data) {
        const now = new Date().toISOString();
        state.create('pe_reports', {
            name: data.name,
            type: data.type,
            generatedAt: now.slice(0, 16).replace('T', ' '),
            size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
            status: 'generating',
            format: data.format || 'PDF',
            entities: data.entities,
            dateRange: data.dateRange || 'last7d',
            exported: false
        });
        toast.info(`Generating report "${data.name}"...`);

        setTimeout(() => {
            const reports = state.getAll('pe_reports') || [];
            const report = reports.find(r => r.name === data.name && r.status === 'generating');
            if (report) {
                state.update('pe_reports', report.id, { status: 'ready' });
                toast.success(`Report "${data.name}" is ready.`);
            }
        }, 3000);
    }

    destroy() {
        this.#unsubs.forEach(fn => fn());
    }
}
