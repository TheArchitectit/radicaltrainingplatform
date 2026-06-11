import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { toast } from '../components/Toast.js';

export class PeCapacityView extends BaseView {
    #unsubs = [];
    #activeTab = 'overview';
    #refreshing = false;

    // Default trend data when seed collection is empty
    #defaults = {
        cpu: { usage: 62, runway: 147, trend: [45, 50, 52, 58, 55, 60, 62], topConsumers: [
            { name: 'VM-DB-01', usage: '78%', trend: '↑' },
            { name: 'VM-App-03', usage: '65%', trend: '→' },
            { name: 'VM-Web-02', usage: '54%', trend: '↓' },
            { name: 'VM-Analytics', usage: '48%', trend: '↑' }
        ], recommendations: [
            'Consider migrating VM-DB-01 to reduce CPU pressure',
            'Schedule batch jobs during off-peak hours (2AM-6AM)',
            'Review VM-App-03 CPU reservation settings'
        ]},
        memory: { usage: 74, runway: 89, trend: [60, 63, 65, 68, 70, 72, 74], topConsumers: [
            { name: 'VM-DB-01', usage: '82%', trend: '↑' },
            { name: 'VM-Cache-01', usage: '76%', trend: '↑' },
            { name: 'VM-App-03', usage: '61%', trend: '→' },
            { name: 'VM-Web-02', usage: '45%', trend: '↓' }
        ], recommendations: [
            'Consider migrating VM-DB-01 to reduce memory pressure',
            'VM-Cache-01 memory usage trending up — evaluate cache eviction policy',
            'Add 64 GB memory to host node-2 to extend runway'
        ]},
        storage: { usage: 58, runway: 203, trend: [40, 42, 46, 50, 52, 55, 58], topConsumers: [
            { name: 'VM-DB-01', usage: '340 GB', trend: '↑' },
            { name: 'VM-Backup', usage: '280 GB', trend: '↑' },
            { name: 'VM-Logs', usage: '190 GB', trend: '→' },
            { name: 'VM-App-03', usage: '120 GB', trend: '↓' }
        ], recommendations: [
            'Enable deduplication on storage container SC-01',
            'Archive old snapshots for VM-Backup (120 GB recoverable)',
            'Review VM-Logs retention policy — 30-day trim saves ~80 GB'
        ]}
    };

    async render() {
        const cap = this.#getCapacityData();

        const el = document.createElement('div');
        el.className = 'view';
        el.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-lg);">
                <h1 class="page-title" style="margin:0;">Capacity Planning</h1>
                <button class="btn btn-primary" id="refresh-analysis-btn">⟳ Refresh Analysis</button>
            </div>

            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-lg);margin-bottom:var(--space-xl);">
                <div class="card">
                    <div class="card-body" style="text-align:center;">
                        <div class="text-secondary text-sm">CPU Runway</div>
                        <div style="font-size:1.8rem;font-weight:700;color:${this.#runwayColor(cap.cpu.runway)};">${cap.cpu.runway}d</div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body" style="text-align:center;">
                        <div class="text-secondary text-sm">Memory Runway</div>
                        <div style="font-size:1.8rem;font-weight:700;color:${this.#runwayColor(cap.memory.runway)};">${cap.memory.runway}d</div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body" style="text-align:center;">
                        <div class="text-secondary text-sm">Storage Runway</div>
                        <div style="font-size:1.8rem;font-weight:700;color:${this.#runwayColor(cap.storage.runway)};">${cap.storage.runway}d</div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body" style="text-align:center;">
                        <div class="text-secondary text-sm">Overall Health</div>
                        <div style="font-size:1.8rem;font-weight:700;color:var(--status-good);">${this.#healthScore(cap)}</div>
                    </div>
                </div>
            </div>

            <div class="tabs" style="margin-bottom:var(--space-lg);">
                <button class="tab ${this.#activeTab === 'overview' ? 'active' : ''}" data-tab="overview">Overview</button>
                <button class="tab ${this.#activeTab === 'cpu' ? 'active' : ''}" data-tab="cpu">CPU</button>
                <button class="tab ${this.#activeTab === 'memory' ? 'active' : ''}" data-tab="memory">Memory</button>
                <button class="tab ${this.#activeTab === 'storage' ? 'active' : ''}" data-tab="storage">Storage</button>
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

        this.root.querySelector('#refresh-analysis-btn')?.addEventListener('click', () => this.#refreshAnalysis());

        this.#unsubs.push(
            bus.on('capacity_data:created', () => this.refresh()),
            bus.on('capacity_data:updated', () => this.refresh()),
            bus.on('capacity_data:deleted', () => this.refresh())
        );
    }

    #getCapacityData() {
        const stored = state.getAll('capacity_data') || [];
        if (stored.length > 0) {
            const record = stored[0];
            return {
                cpu: { ...this.#defaults.cpu, ...record.cpu },
                memory: { ...this.#defaults.memory, ...record.memory },
                storage: { ...this.#defaults.storage, ...record.storage }
            };
        }
        return this.#defaults;
    }

    #runwayColor(days) {
        if (days > 120) return 'var(--status-good)';
        if (days > 60) return 'var(--status-warning)';
        return 'var(--status-critical)';
    }

    #healthScore(cap) {
        const avg = Math.round((
            (100 - cap.cpu.usage) +
            (100 - cap.memory.usage) +
            (100 - cap.storage.usage)
        ) / 3);
        return `${avg}/100`;
    }

    #sparkline(data, width = 100, height = 30, color = 'var(--prism-blue)') {
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;
        const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ');
        return `<svg width="${width}" height="${height}" style="vertical-align:middle;"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="2"/></svg>`;
    }

    #progressBar(pct) {
        const color = pct > 80 ? 'var(--status-critical)' : pct > 60 ? 'var(--status-warning)' : 'var(--status-good)';
        return `
            <div style="background:var(--surface-secondary);border-radius:4px;height:8px;width:100%;overflow:hidden;">
                <div style="background:${color};height:100%;width:${pct}%;border-radius:4px;transition:width 0.3s;"></div>
            </div>
        `;
    }

    #renderActiveTab() {
        const container = this.root.querySelector('#tab-content');
        if (!container) return;
        container.innerHTML = '';

        const cap = this.#getCapacityData();

        switch (this.#activeTab) {
            case 'overview': this.#renderOverview(container, cap); break;
            case 'cpu': this.#renderResourceTab(container, cap.cpu, 'CPU'); break;
            case 'memory': this.#renderResourceTab(container, cap.memory, 'Memory'); break;
            case 'storage': this.#renderResourceTab(container, cap.storage, 'Storage'); break;
        }
    }

    #renderOverview(container, cap) {
        const resources = [
            { label: 'CPU', data: cap.cpu, color: 'var(--prism-blue)' },
            { label: 'Memory', data: cap.memory, color: 'var(--status-warning)' },
            { label: 'Storage', data: cap.storage, color: 'var(--status-good)' }
        ];

        container.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-lg);">
                ${resources.map(r => `
                    <div class="card">
                        <div class="card-header">${r.label}</div>
                        <div class="card-body">
                            <div style="margin-bottom:12px;">
                                ${this.#sparkline(r.data.trend, 100, 30, r.color)}
                            </div>
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                                <span class="text-sm">Current Usage</span>
                                <span style="font-weight:600;">${r.data.usage}%</span>
                            </div>
                            ${this.#progressBar(r.data.usage)}
                            <div style="margin-top:12px;color:var(--text-secondary);" class="text-sm">
                                Projected runway: <strong style="color:${this.#runwayColor(r.data.runway)};">${r.data.runway} days</strong>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    #renderResourceTab(container, resource, label) {
        const wrapper = document.createElement('div');

        // Larger trend chart
        wrapper.innerHTML = `
            <div class="card" style="margin-bottom:var(--space-lg);">
                <div class="card-header">${label} Usage Trend (Last 7 Days)</div>
                <div class="card-body" style="text-align:center;">
                    ${this.#sparkline(resource.trend, 300, 150, 'var(--prism-blue)')}
                    <div class="text-secondary text-sm" style="margin-top:8px;">
                        Current: ${resource.usage}% &nbsp;|&nbsp; Runway: ${resource.runway} days
                    </div>
                </div>
            </div>
        `;

        // Top consumers table
        const tableCard = document.createElement('div');
        tableCard.className = 'card';
        tableCard.style.marginBottom = 'var(--space-lg)';
        tableCard.innerHTML = `<div class="card-header">Top ${label} Consumers</div><div class="card-body" id="consumers-table"></div>`;
        wrapper.appendChild(tableCard);

        container.appendChild(wrapper);

        const table = new EntityTable({
            columns: [
                { key: 'name', label: 'Name' },
                { key: 'usage', label: 'Usage' },
                {
                    key: 'trend', label: 'Trend', render: (val) => {
                        const color = val === '↑' ? 'var(--status-critical)' : val === '↓' ? 'var(--status-good)' : 'var(--text-secondary)';
                        return `<span style="color:${color};font-size:1.2rem;">${val}</span>`;
                    }
                }
            ],
            data: resource.topConsumers || []
        });

        tableCard.querySelector('#consumers-table').appendChild(table.render());

        // Recommendations
        const recsCard = document.createElement('div');
        recsCard.className = 'card';
        recsCard.innerHTML = `
            <div class="card-header">Recommendations</div>
            <div class="card-body">
                <ul style="margin:0;padding-left:20px;list-style:disc;">
                    ${(resource.recommendations || []).map(r => `<li style="margin-bottom:8px;color:var(--text-primary);">${r}</li>`).join('')}
                </ul>
            </div>
        `;
        container.appendChild(recsCard);
    }

    async #refreshAnalysis() {
        if (this.#refreshing) return;
        this.#refreshing = true;
        const btn = this.root.querySelector('#refresh-analysis-btn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = '⟳ Analyzing...';
        }
        toast.info('Running capacity analysis...');

        await new Promise(resolve => setTimeout(resolve, 1500));

        this.#refreshing = false;
        if (btn) {
            btn.disabled = false;
            btn.textContent = '⟳ Refresh Analysis';
        }
        toast.success('Capacity analysis complete.');
    }

    destroy() {
        this.#unsubs.forEach(fn => fn());
    }
}
