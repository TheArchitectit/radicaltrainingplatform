import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { toast } from '../components/Toast.js';

export class AiMonitoringView extends BaseView {
    #table = null;
    #activeTab = 'endpoints';
    #unsubs = [];

    async render() {
        return this.html(`
            <div class="view">
                <h2 class="page-title">NAI Endpoint Monitoring</h2>
                <div id="ai-mon-summary"></div>
                <div class="tabs" id="ai-mon-tabs">
                    <button class="tab active" data-tab="endpoints">Endpoints</button>
                    <button class="tab" data-tab="metrics">Metrics</button>
                    <button class="tab" data-tab="alerts">Alerts</button>
                </div>
                <div id="ai-mon-content" style="margin-top:var(--space-lg);"></div>
            </div>
        `);
    }

    afterRender() {
        this.#renderSummary();
        this.#renderTab();

        document.getElementById('ai-mon-tabs')?.addEventListener('click', (e) => {
            const tab = e.target.closest('[data-tab]');
            if (!tab) return;
            document.querySelectorAll('#ai-mon-tabs .tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            this.#activeTab = tab.dataset.tab;
            this.#renderTab();
        });

        this.#unsubs.push(
            bus.on('ai_endpoint_metrics:updated', () => this.#refresh())
        );
    }

    #getEndpoints() {
        return state.getAll('ai_endpoint_metrics') || [];
    }

    #renderSummary() {
        const endpoints = this.#getEndpoints();
        const active = endpoints.filter(e => e.status === 'healthy').length;
        const avgLatency = endpoints.length
            ? Math.round(endpoints.reduce((s, e) => s + (e.avg_latency_ms || 0), 0) / endpoints.length)
            : 0;
        const totalReqs = endpoints.reduce((s, e) => s + (e.requests_min || 0), 0) * 60;
        const avgGpu = endpoints.length
            ? Math.round(endpoints.reduce((s, e) => s + (e.gpu_util || 0), 0) / endpoints.length)
            : 0;

        const container = document.getElementById('ai-mon-summary');
        if (!container) return;
        container.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:var(--space-lg);">
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${active}</div>
                    <div class="text-secondary text-sm">Active Endpoints</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--status-warning);">${avgLatency} ms</div>
                    <div class="text-secondary text-sm">Avg Latency</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--status-good);">${totalReqs.toLocaleString()}</div>
                    <div class="text-secondary text-sm">Total Requests/hr</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--status-critical);">${avgGpu}%</div>
                    <div class="text-secondary text-sm">GPU Utilization</div>
                </div></div>
            </div>
        `;
    }

    #renderTab() {
        switch (this.#activeTab) {
            case 'endpoints': this.#renderEndpointsTab(); break;
            case 'metrics':   this.#renderMetricsTab();   break;
            case 'alerts':    this.#renderAlertsTab();     break;
        }
    }

    #renderEndpointsTab() {
        const container = document.getElementById('ai-mon-content');
        if (!container) return;
        this.#table?.destroy();

        this.#table = new EntityTable({
            columns: [
                { key: 'name', label: 'Endpoint Name', sortable: true },
                { key: 'model', label: 'Model', sortable: true },
                { key: 'replicas', label: 'Replicas', sortable: true },
                { key: 'requests_min', label: 'Requests/min', sortable: true },
                { key: 'avg_latency_ms', label: 'Avg Latency (ms)', sortable: true },
                { key: 'p99_latency_ms', label: 'P99 Latency (ms)', sortable: true },
                { key: 'gpu_util', label: 'GPU Util %', sortable: true, render: (v) => `${v ?? 0}%` },
                {
                    key: 'status', label: 'Status', sortable: true,
                    render: (v) => {
                        const colors = { healthy: 'var(--status-good)', degraded: 'var(--status-warning)', down: 'var(--status-critical)' };
                        return `<span class="badge" style="background:${colors[v] || 'var(--text-secondary)'};color:var(--text-inverse);">${v || 'unknown'}</span>`;
                    }
                }
            ],
            data: this.#getEndpoints(),
            searchKeys: ['name', 'model', 'status'],
            emptyMessage: 'No AI endpoints configured',
            emptyIcon: '🔌',
            actions: [
                {
                    label: 'Scale',
                    onClick: (item) => {
                        toast(`Scaling endpoint "${item.name}"…`, 'info');
                    }
                },
                {
                    label: 'Restart',
                    onClick: (item) => {
                        toast(`Restarting endpoint "${item.name}"…`, 'info');
                    }
                }
            ]
        });

        container.innerHTML = '';
        container.appendChild(this.#table.render());
    }

    #renderMetricsTab() {
        const container = document.getElementById('ai-mon-content');
        if (!container) return;
        this.#table?.destroy();
        this.#table = null;

        const metrics = [
            { title: 'Latency',         value: '42 ms',   trend: '↓', trendColor: 'var(--status-good)',    bars: [55, 48, 50, 45, 42], color: 'var(--prism-blue)' },
            { title: 'Throughput',       value: '1,240/s', trend: '↑', trendColor: 'var(--status-good)',    bars: [980, 1050, 1100, 1180, 1240], color: 'var(--status-good)' },
            { title: 'GPU Utilization',  value: '78%',     trend: '→', trendColor: 'var(--status-warning)', bars: [72, 75, 80, 76, 78], color: 'var(--status-warning)' },
            { title: 'Error Rate',       value: '0.3%',    trend: '↓', trendColor: 'var(--status-good)',    bars: [1.2, 0.8, 0.5, 0.4, 0.3], color: 'var(--status-critical)' }
        ];

        container.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;">
                ${metrics.map(m => `
                    <div class="card">
                        <div class="card-header">${m.title}</div>
                        <div class="card-body" style="display:flex;align-items:center;justify-content:space-between;">
                            <div>
                                <div style="font-size:32px;font-weight:700;color:var(--text-primary);">
                                    ${m.value}
                                    <span style="font-size:18px;color:${m.trendColor};margin-left:8px;">${m.trend}</span>
                                </div>
                                <div class="text-secondary text-sm">Last 5 intervals</div>
                            </div>
                            <div>${this.#barChart(m.bars, 120, 40, m.color)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    #barChart(values, width = 120, height = 40, color = 'var(--prism-blue)') {
        const max = Math.max(...values);
        const barW = width / values.length - 2;
        return `<svg width="${width}" height="${height}">${values.map((v, i) => {
            const h = max > 0 ? (v / max) * height : 0;
            return `<rect x="${i * (barW + 2)}" y="${height - h}" width="${barW}" height="${h}" fill="${color}" rx="2"/>`;
        }).join('')}</svg>`;
    }

    #renderAlertsTab() {
        const container = document.getElementById('ai-mon-content');
        if (!container) return;
        this.#table?.destroy();
        this.#table = null;

        const allAlerts = state.getAll('alerts') || [];
        const aiAlerts = allAlerts.filter(a =>
            (a.entity && (/NAI|GPU/i.test(a.entity))) ||
            (a.message && (/NAI|GPU/i.test(a.message)))
        );

        if (aiAlerts.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <div class="card-body" style="text-align:center;padding:var(--space-xl);">
                        <div style="font-size:48px;margin-bottom:16px;">✅</div>
                        <h3 style="margin-bottom:8px;">No AI Alerts</h3>
                        <p class="text-secondary">All NAI endpoints and GPU resources are operating normally. Alerts will appear here when issues are detected with AI inference endpoints or GPU devices.</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:12px;">
                ${aiAlerts.map(a => {
                    const sevColors = { critical: 'var(--status-critical)', warning: 'var(--status-warning)', info: 'var(--prism-blue)' };
                    const color = sevColors[a.severity] || 'var(--text-secondary)';
                    return `
                        <div class="card" style="border-left:4px solid ${color};">
                            <div class="card-body" style="display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <div style="font-weight:600;">${a.message || a.entity || 'Alert'}</div>
                                    <div class="text-secondary text-sm">${a.entity || ''} · ${a.timestamp ? new Date(a.timestamp).toLocaleString() : ''}</div>
                                </div>
                                <span class="badge" style="background:${color};color:var(--text-inverse);">${a.severity || 'info'}</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    #refresh() {
        this.#renderSummary();
        this.#renderTab();
    }

    destroy() {
        this.#table?.destroy();
        this.#unsubs.forEach(fn => fn());
    }
}
