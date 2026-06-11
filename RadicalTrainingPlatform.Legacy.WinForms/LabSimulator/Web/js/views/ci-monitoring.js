import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { toast } from '../components/Toast.js';

export class CiMonitoringView extends BaseView {
    #activeTab = 'overview';
    #unsubs = [];

    async render() {
        return this.html(`
            <div class="view">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-lg);">
                    <h2 class="page-title">NC2 Cloud Cluster Monitoring</h2>
                    <button class="btn btn-primary" id="ci-mon-refresh-btn">↻ Refresh Metrics</button>
                </div>
                <div id="ci-mon-summary"></div>
                <div class="tabs" id="ci-mon-tabs">
                    <button class="tab active" data-tab="overview">Overview</button>
                    <button class="tab" data-tab="cost">Cost Analysis</button>
                    <button class="tab" data-tab="performance">Performance</button>
                </div>
                <div id="ci-mon-content" style="margin-top:var(--space-lg);"></div>
            </div>
        `);
    }

    afterRender() {
        this.#renderSummary();
        this.#renderTab();

        document.getElementById('ci-mon-tabs')?.addEventListener('click', (e) => {
            const tab = e.target.closest('[data-tab]');
            if (!tab) return;
            document.querySelectorAll('#ci-mon-tabs .tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            this.#activeTab = tab.dataset.tab;
            this.#renderTab();
        });

        document.getElementById('ci-mon-refresh-btn')?.addEventListener('click', () => {
            const btn = document.getElementById('ci-mon-refresh-btn');
            if (btn) { btn.disabled = true; btn.textContent = 'Refreshing…'; }
            setTimeout(() => {
                this.#renderSummary();
                this.#renderTab();
                if (btn) { btn.disabled = false; btn.textContent = '↻ Refresh Metrics'; }
                toast.success('Metrics refreshed');
            }, 1500);
        });

        this.#unsubs.push(
            bus.on('nc2_clusters:updated', () => this.#refresh())
        );
    }

    #getClusters() {
        return state.getAll('nc2_clusters') || [];
    }

    #renderSummary() {
        const clusters = this.#getClusters();
        const totalNodes = clusters.reduce((s, c) => s + (c.node_count || 0), 0);
        const monthlyCost = clusters.reduce((s, c) => {
            const hourly = this.#costData().find(d => d.cluster === c.name)?.hourly_rate || 0;
            return s + hourly * 730;
        }, 0);
        const avgUptime = clusters.length > 0 ? 99.7 : 0;

        const container = document.getElementById('ci-mon-summary');
        if (!container) return;
        container.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:var(--space-lg);">
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${clusters.length}</div>
                    <div class="text-secondary text-sm">NC2 Clusters</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--status-good);">${totalNodes}</div>
                    <div class="text-secondary text-sm">Total Cloud Nodes</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--status-warning);">$${Math.round(monthlyCost).toLocaleString()}</div>
                    <div class="text-secondary text-sm">Monthly Cost Est.</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--status-good);">${avgUptime}%</div>
                    <div class="text-secondary text-sm">Avg Uptime</div>
                </div></div>
            </div>
        `;
    }

    #renderTab() {
        switch (this.#activeTab) {
            case 'overview':    this.#renderOverviewTab();    break;
            case 'cost':        this.#renderCostTab();        break;
            case 'performance': this.#renderPerformanceTab(); break;
        }
    }

    #renderOverviewTab() {
        const container = document.getElementById('ci-mon-content');
        if (!container) return;
        const clusters = this.#getClusters();

        if (clusters.length === 0) {
            container.innerHTML = `
                <div class="card"><div class="card-body" style="text-align:center;padding:var(--space-xl);">
                    <div style="font-size:48px;margin-bottom:16px;">☁️</div>
                    <h3>No NC2 Clusters</h3>
                    <p class="text-secondary">Deploy a Nutanix Cloud Cluster to see monitoring data here.</p>
                </div></div>
            `;
            return;
        }

        const healthMetrics = {
            'NC2-Prod-AWS':   { cpu: 62, memory: 71, storage: 45 },
            'NC2-Dev-Azure':  { cpu: 38, memory: 44, storage: 29 },
            'NC2-DR-GCP':     { cpu: 15, memory: 22, storage: 52 }
        };

        container.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:16px;">
                ${clusters.map(c => {
                    const h = healthMetrics[c.name] || { cpu: 50, memory: 50, storage: 50 };
                    const providerColors = { AWS: '#FF9900', Azure: '#0078D4', GCP: '#4285F4' };
                    const statusColor = c.status === 'running' ? 'var(--status-good)' : 'var(--status-warning)';
                    return `
                        <div class="card">
                            <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
                                <span style="font-weight:600;">${c.name}</span>
                                <span class="badge" style="background:${providerColors[c.provider] || 'var(--prism-blue)'};color:var(--text-inverse);">${c.provider}</span>
                            </div>
                            <div class="card-body">
                                <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                                    <span class="text-secondary text-sm">Region: ${c.region}</span>
                                    <span class="text-secondary text-sm">Nodes: ${c.node_count}</span>
                                    <span class="badge" style="background:${statusColor};color:var(--text-inverse);">${c.status}</span>
                                </div>
                                ${this.#progressBar('CPU', h.cpu)}
                                ${this.#progressBar('Memory', h.memory)}
                                ${this.#progressBar('Storage', h.storage)}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    #progressBar(label, pct) {
        const color = pct > 80 ? 'var(--status-critical)' : pct > 60 ? 'var(--status-warning)' : 'var(--status-good)';
        return `
            <div style="margin-bottom:8px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
                    <span class="text-sm">${label}</span>
                    <span class="text-sm" style="color:${color};">${pct}%</span>
                </div>
                <div style="background:var(--border-light);border-radius:4px;height:8px;overflow:hidden;">
                    <div style="width:${pct}%;height:100%;background:${color};border-radius:4px;transition:width 0.3s;"></div>
                </div>
            </div>
        `;
    }

    #costData() {
        return [
            { cluster: 'NC2-Prod-AWS',  provider: 'AWS',   instance_type: 'i3.metal',            nodes: 4, hourly_rate: 10.86, savings: 18 },
            { cluster: 'NC2-Dev-Azure',  provider: 'Azure', instance_type: 'Standard_E64is_v3',   nodes: 3, hourly_rate: 8.42,  savings: 12 },
            { cluster: 'NC2-DR-GCP',     provider: 'GCP',   instance_type: 'n2-highmem-80',       nodes: 2, hourly_rate: 7.15,  savings: 22 }
        ];
    }

    #renderCostTab() {
        const container = document.getElementById('ci-mon-content');
        if (!container) return;
        const rows = this.#costData();
        const totalHourly = rows.reduce((s, r) => s + r.hourly_rate * r.nodes, 0);
        const totalMonthly = totalHourly * 730;

        container.innerHTML = `
            <div class="card">
                <div class="card-header">Cost Breakdown</div>
                <div class="card-body" style="overflow-x:auto;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr style="border-bottom:2px solid var(--border-light);">
                                <th style="text-align:left;padding:8px;">Cluster</th>
                                <th style="text-align:left;padding:8px;">Provider</th>
                                <th style="text-align:left;padding:8px;">Instance Type</th>
                                <th style="text-align:right;padding:8px;">Nodes</th>
                                <th style="text-align:right;padding:8px;">Hourly Rate</th>
                                <th style="text-align:right;padding:8px;">Monthly Est.</th>
                                <th style="text-align:right;padding:8px;">vs On-Prem Savings</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows.map(r => `
                                <tr style="border-bottom:1px solid var(--border-light);">
                                    <td style="padding:8px;font-weight:600;">${r.cluster}</td>
                                    <td style="padding:8px;">${r.provider}</td>
                                    <td style="padding:8px;font-family:monospace;font-size:0.85em;">${r.instance_type}</td>
                                    <td style="padding:8px;text-align:right;">${r.nodes}</td>
                                    <td style="padding:8px;text-align:right;">$${(r.hourly_rate * r.nodes).toFixed(2)}</td>
                                    <td style="padding:8px;text-align:right;">$${Math.round(r.hourly_rate * r.nodes * 730).toLocaleString()}</td>
                                    <td style="padding:8px;text-align:right;color:var(--status-good);">${r.savings}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr style="border-top:2px solid var(--border-light);font-weight:700;">
                                <td style="padding:8px;" colspan="4">Total</td>
                                <td style="padding:8px;text-align:right;">$${totalHourly.toFixed(2)}</td>
                                <td style="padding:8px;text-align:right;">$${Math.round(totalMonthly).toLocaleString()}</td>
                                <td style="padding:8px;text-align:right;"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        `;
    }

    #renderPerformanceTab() {
        const container = document.getElementById('ci-mon-content');
        if (!container) return;

        const perfData = [
            { metric: 'IOPS',             onPrem: 125000, aws: 118000, azure: 112000 },
            { metric: 'Latency (ms)',      onPrem: 0.8,    aws: 0.9,    azure: 1.0    },
            { metric: 'Throughput (MB/s)', onPrem: 4800,   aws: 4500,   azure: 4200   },
            { metric: 'Availability %',    onPrem: 99.99,  aws: 99.95,  azure: 99.92  }
        ];

        const colorCell = (cloud, onPrem, metric) => {
            const isLatency = metric.toLowerCase().includes('latency');
            const diff = isLatency
                ? ((cloud - onPrem) / onPrem) * 100
                : ((onPrem - cloud) / onPrem) * 100;
            if (diff <= 10) return 'var(--status-good)';
            if (diff <= 20) return 'var(--status-warning)';
            return 'var(--status-critical)';
        };

        const fmt = (v, metric) => {
            if (metric.includes('%')) return v.toFixed(2) + '%';
            if (metric.includes('ms')) return v.toFixed(1);
            return v.toLocaleString();
        };

        container.innerHTML = `
            <div class="card">
                <div class="card-header">Performance Comparison — On-Premises vs NC2</div>
                <div class="card-body" style="overflow-x:auto;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr style="border-bottom:2px solid var(--border-light);">
                                <th style="text-align:left;padding:8px;">Metric</th>
                                <th style="text-align:right;padding:8px;">On-Premises</th>
                                <th style="text-align:right;padding:8px;">NC2-AWS</th>
                                <th style="text-align:right;padding:8px;">NC2-Azure</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${perfData.map(r => `
                                <tr style="border-bottom:1px solid var(--border-light);">
                                    <td style="padding:8px;font-weight:600;">${r.metric}</td>
                                    <td style="padding:8px;text-align:right;">${fmt(r.onPrem, r.metric)}</td>
                                    <td style="padding:8px;text-align:right;color:${colorCell(r.aws, r.onPrem, r.metric)};">${fmt(r.aws, r.metric)}</td>
                                    <td style="padding:8px;text-align:right;color:${colorCell(r.azure, r.onPrem, r.metric)};">${fmt(r.azure, r.metric)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="text-secondary text-sm" style="margin-top:12px;">
                        <span style="color:var(--status-good);">●</span> Within 10% &nbsp;
                        <span style="color:var(--status-warning);">●</span> 10–20% slower &nbsp;
                        <span style="color:var(--status-critical);">●</span> &gt;20% slower
                    </div>
                </div>
            </div>
        `;
    }

    #refresh() {
        this.#renderSummary();
        this.#renderTab();
    }

    destroy() {
        this.#unsubs.forEach(fn => fn());
    }
}
