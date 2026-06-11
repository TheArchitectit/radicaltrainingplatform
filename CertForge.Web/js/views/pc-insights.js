import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { toast } from '../components/Toast.js';

export class PcInsightsView extends BaseView {
    #anomalyTable = null;
    #unsubs = [];
    #activeTab = 'recommendations';

    // Default data when seed collection is empty
    #defaultRecommendations = [
        { id: 'rec-1', category: 'critical', title: 'High Memory Pressure on Cluster-A', description: 'Cluster-A memory utilization has exceeded 85% for 72 hours. Immediate action recommended.', impact: 'Risk of VM performance degradation and potential OOM events.' },
        { id: 'rec-2', category: 'optimization', title: 'Right-size VM-Web-02', description: 'VM-Web-02 has consistently used less than 20% of allocated CPU over the past 30 days.', impact: 'Reclaiming 4 vCPUs would save ~$120/month and improve cluster capacity.' },
        { id: 'rec-3', category: 'optimization', title: 'Enable Compression on SC-Data', description: 'Storage container SC-Data has 2.1 TB of compressible data with no compression policy.', impact: 'Estimated 40% space savings (~840 GB recoverable).' },
        { id: 'rec-4', category: 'info', title: 'Firmware Update Available', description: 'AOS 6.7.1 is available with security patches and performance improvements.', impact: 'Addresses 3 CVEs and improves CVM memory efficiency by 8%.' },
        { id: 'rec-5', category: 'critical', title: 'Storage Runway Below Threshold', description: 'Storage container SC-Prod has 45 days of runway remaining at current growth rate.', impact: 'Without intervention, storage exhaustion may cause write failures.' }
    ];

    #defaultAnomalies = [
        { id: 'anom-1', entity: 'VM-DB-01', metric: 'CPU Usage', expected: '55%', actual: '92%', deviation: '67%', detectedAt: '2024-01-15 14:30', status: 'active' },
        { id: 'anom-2', entity: 'Host-Node-3', metric: 'Network Latency', expected: '2ms', actual: '18ms', deviation: '800%', detectedAt: '2024-01-15 13:15', status: 'active' },
        { id: 'anom-3', entity: 'SC-Prod', metric: 'IOPS', expected: '5000', actual: '12400', deviation: '148%', detectedAt: '2024-01-15 11:00', status: 'acknowledged' },
        { id: 'anom-4', entity: 'VM-Cache-01', metric: 'Memory Usage', expected: '60%', actual: '95%', deviation: '58%', detectedAt: '2024-01-15 09:45', status: 'active' }
    ];

    #efficiencyScores = { overall: 73, cpu: 68, memory: 71, storage: 82, network: 79 };

    async render() {
        const insights = this.#getInsightsData();
        const recs = insights.recommendations;
        const anoms = insights.anomalies;
        const criticalCount = recs.filter(r => r.category === 'critical').length;
        const optimizationCount = recs.filter(r => r.category === 'optimization').length;

        const el = document.createElement('div');
        el.className = 'view';
        el.innerHTML = `
            <h1 class="page-title">Insights</h1>

            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-lg);margin-bottom:var(--space-xl);">
                <div class="card">
                    <div class="card-body" style="text-align:center;">
                        <div class="text-secondary text-sm">Total Insights</div>
                        <div style="font-size:1.8rem;font-weight:700;color:var(--prism-blue);">${recs.length}</div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body" style="text-align:center;">
                        <div class="text-secondary text-sm">Critical Actions</div>
                        <div style="font-size:1.8rem;font-weight:700;color:var(--status-critical);">${criticalCount}</div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body" style="text-align:center;">
                        <div class="text-secondary text-sm">Optimizations</div>
                        <div style="font-size:1.8rem;font-weight:700;color:var(--status-warning);">${optimizationCount}</div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body" style="text-align:center;">
                        <div class="text-secondary text-sm">Anomalies Detected</div>
                        <div style="font-size:1.8rem;font-weight:700;color:var(--status-critical);">${anoms.length}</div>
                    </div>
                </div>
            </div>

            <div class="tabs" style="margin-bottom:var(--space-lg);">
                <button class="tab ${this.#activeTab === 'recommendations' ? 'active' : ''}" data-tab="recommendations">Recommendations</button>
                <button class="tab ${this.#activeTab === 'anomalies' ? 'active' : ''}" data-tab="anomalies">Anomalies</button>
                <button class="tab ${this.#activeTab === 'efficiency' ? 'active' : ''}" data-tab="efficiency">Efficiency Score</button>
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

        this.#unsubs.push(
            bus.on('insights:created', () => this.refresh()),
            bus.on('insights:updated', () => this.refresh()),
            bus.on('insights:deleted', () => this.refresh())
        );
    }

    #getInsightsData() {
        const stored = state.getAll('insights') || [];
        const recommendations = stored.filter(i => i.category && !i.metric) || [];
        const anomalies = stored.filter(i => i.metric) || [];
        return {
            recommendations: recommendations.length > 0 ? recommendations : this.#defaultRecommendations,
            anomalies: anomalies.length > 0 ? anomalies : this.#defaultAnomalies
        };
    }

    #renderActiveTab() {
        const container = this.root.querySelector('#tab-content');
        if (!container) return;
        container.innerHTML = '';

        switch (this.#activeTab) {
            case 'recommendations': this.#renderRecommendations(container); break;
            case 'anomalies': this.#renderAnomalies(container); break;
            case 'efficiency': this.#renderEfficiency(container); break;
        }
    }

    #renderRecommendations(container) {
        const { recommendations } = this.#getInsightsData();

        const iconMap = { critical: '🔴', optimization: '🟡', info: '🔵' };
        const borderMap = { critical: 'var(--status-critical)', optimization: 'var(--status-warning)', info: 'var(--prism-blue)' };

        container.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:var(--space-lg);">
                ${recommendations.map(rec => `
                    <div class="card" style="border-left:4px solid ${borderMap[rec.category] || 'var(--border-light)'};">
                        <div class="card-body">
                            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                                <div style="flex:1;">
                                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                                        <span style="font-size:1.2rem;">${iconMap[rec.category] || '🔵'}</span>
                                        <strong style="font-size:1.05rem;">${rec.title}</strong>
                                    </div>
                                    <p style="margin:0 0 8px;color:var(--text-secondary);">${rec.description}</p>
                                    <div class="text-sm" style="color:var(--text-secondary);">
                                        <strong>Impact:</strong> ${rec.impact}
                                    </div>
                                </div>
                                <button class="btn btn-primary apply-rec-btn" data-rec-id="${rec.id}" style="margin-left:16px;white-space:nowrap;">Apply</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        container.querySelectorAll('.apply-rec-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const rec = recommendations.find(r => r.id === btn.dataset.recId);
                if (rec) {
                    toast.success(`Applied recommendation: "${rec.title}" (simulated)`);
                }
            });
        });
    }

    #renderAnomalies(container) {
        const { anomalies } = this.#getInsightsData();

        this.#anomalyTable = new EntityTable({
            columns: [
                { key: 'entity', label: 'Entity' },
                { key: 'metric', label: 'Metric' },
                { key: 'expected', label: 'Expected' },
                { key: 'actual', label: 'Actual', render: (val) => `<span style="color:var(--status-critical);font-weight:600;">${val}</span>` },
                {
                    key: 'deviation', label: 'Deviation %', render: (val) => {
                        const num = parseFloat(val);
                        const color = num > 100 ? 'var(--status-critical)' : 'var(--status-warning)';
                        return `<span style="color:${color};font-weight:600;">${val}</span>`;
                    }
                },
                { key: 'detectedAt', label: 'Detected At' },
                {
                    key: 'status', label: 'Status', render: (val) => {
                        const color = val === 'active' ? 'var(--status-critical)' : 'var(--status-warning)';
                        return `<span class="badge" style="background:${color};color:var(--text-inverse);">${val}</span>`;
                    }
                }
            ],
            data: anomalies,
            actions: [
                {
                    label: 'Acknowledge',
                    onClick: (item) => this.#acknowledgeAnomaly(item)
                },
                {
                    label: 'Dismiss',
                    variant: 'danger',
                    onClick: (item) => this.#dismissAnomaly(item)
                }
            ]
        });

        container.appendChild(this.#anomalyTable.render());
    }

    #acknowledgeAnomaly(item) {
        const stored = state.getAll('insights') || [];
        const existing = stored.find(i => i.id === item.id);
        if (existing) {
            state.update('insights', item.id, { status: 'acknowledged' });
        }
        toast.info(`Anomaly on "${item.entity}" acknowledged.`);
        this.#renderActiveTab();
    }

    #dismissAnomaly(item) {
        const stored = state.getAll('insights') || [];
        const existing = stored.find(i => i.id === item.id);
        if (existing) {
            state.remove('insights', item.id);
        }
        toast.success(`Anomaly on "${item.entity}" dismissed.`);
        this.#renderActiveTab();
    }

    #renderEfficiency(container) {
        const scores = this.#efficiencyScores;

        container.innerHTML = `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-lg);">
                <div class="card">
                    <div class="card-header">Overall Efficiency Score</div>
                    <div class="card-body" style="display:flex;justify-content:center;align-items:center;padding:var(--space-xl);">
                        ${this.#circleScore(scores.overall)}
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">Breakdown</div>
                    <div class="card-body">
                        ${this.#efficiencyRow('CPU Efficiency', scores.cpu)}
                        ${this.#efficiencyRow('Memory Efficiency', scores.memory)}
                        ${this.#efficiencyRow('Storage Efficiency', scores.storage)}
                        ${this.#efficiencyRow('Network Efficiency', scores.network)}
                    </div>
                </div>
            </div>

            <div class="card" style="margin-top:var(--space-lg);">
                <div class="card-header">Optimization Tips</div>
                <div class="card-body">
                    <ul style="margin:0;padding-left:20px;list-style:disc;">
                        <li style="margin-bottom:8px;">Right-size VMs that consistently use less than 30% of allocated resources</li>
                        <li style="margin-bottom:8px;">Enable deduplication and compression on storage containers with compressible workloads</li>
                        <li style="margin-bottom:8px;">Use affinity rules to co-locate VMs that communicate frequently, reducing network hops</li>
                        <li style="margin-bottom:8px;">Schedule non-critical workloads during off-peak hours to flatten usage peaks</li>
                        <li style="margin-bottom:8px;">Review and consolidate snapshots older than 30 days to reclaim storage</li>
                        <li style="margin-bottom:0;">Monitor anomaly trends weekly to catch efficiency regressions early</li>
                    </ul>
                </div>
            </div>
        `;
    }

    #circleScore(score) {
        const radius = 60;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (score / 100) * circumference;
        const color = score >= 80 ? 'var(--status-good)' : score >= 60 ? 'var(--status-warning)' : 'var(--status-critical)';

        return `
            <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="${radius}" fill="none" stroke="var(--surface-secondary)" stroke-width="12"/>
                <circle cx="80" cy="80" r="${radius}" fill="none" stroke="${color}" stroke-width="12"
                    stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
                    stroke-linecap="round" transform="rotate(-90 80 80)"/>
                <text x="80" y="75" text-anchor="middle" font-size="28" font-weight="700" fill="var(--text-primary)">${score}</text>
                <text x="80" y="98" text-anchor="middle" font-size="12" fill="var(--text-secondary)">out of 100</text>
            </svg>
        `;
    }

    #efficiencyRow(label, score) {
        const color = score >= 80 ? 'var(--status-good)' : score >= 60 ? 'var(--status-warning)' : 'var(--status-critical)';
        return `
            <div style="margin-bottom:16px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                    <span class="text-sm">${label}</span>
                    <span class="text-sm" style="font-weight:600;color:${color};">${score}%</span>
                </div>
                <div style="background:var(--surface-secondary);border-radius:4px;height:8px;width:100%;overflow:hidden;">
                    <div style="background:${color};height:100%;width:${score}%;border-radius:4px;transition:width 0.3s;"></div>
                </div>
            </div>
        `;
    }

    destroy() {
        this.#unsubs.forEach(fn => fn());
    }
}
