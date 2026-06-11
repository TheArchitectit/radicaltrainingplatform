import { BaseView } from './BaseView.js';

/**
 * Service Diagnostic Pages — Stargate, Curator, Cerebro mock metrics.
 * Shows what students would see on CVM ports 2009, 2010, 2020.
 */
export class ServicePagesView extends BaseView {
    #activeTab = 'stargate';

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        el.innerHTML = `
            <div class="page-title">
                <h1>🔧 Service Diagnostics</h1>
            </div>

            <div class="text-secondary text-sm" style="margin-bottom:var(--space-lg);">
                Mock diagnostic pages for Nutanix cluster services. In production, these are accessible on individual CVMs at the specified ports.
            </div>

            <!-- Tabs -->
            <div style="display:flex;gap:0;margin-bottom:var(--space-lg);border-bottom:2px solid var(--border-light);">
                <button class="svc-tab active" data-tab="stargate" style="padding:10px 24px;border:none;background:none;cursor:pointer;font-weight:600;border-bottom:2px solid var(--prism-blue);margin-bottom:-2px;">Stargate (:2009)</button>
                <button class="svc-tab" data-tab="curator" style="padding:10px 24px;border:none;background:none;cursor:pointer;font-weight:500;color:var(--text-secondary);margin-bottom:-2px;">Curator (:2010)</button>
                <button class="svc-tab" data-tab="cerebro" style="padding:10px 24px;border:none;background:none;cursor:pointer;font-weight:500;color:var(--text-secondary);margin-bottom:-2px;">Cerebro (:2020)</button>
            </div>

            <div id="stargate-panel"></div>
            <div id="curator-panel" style="display:none;"></div>
            <div id="cerebro-panel" style="display:none;"></div>
        `;

        // Stargate (:2009) — Storage I/O
        el.querySelector('#stargate-panel').innerHTML = `
            <div class="card">
                <div class="card-header">Stargate — Storage I/O Manager (CVM:2009)</div>
                <div class="card-body">
                    <div class="text-secondary text-sm" style="margin-bottom:16px;">
                        Stargate handles all storage I/O operations. Each CVM runs a Stargate instance that manages local disks and communicates with other Stargates for data replication.
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:var(--space-lg);">
                        <div style="padding:16px;background:var(--bg-secondary);border-radius:6px;text-align:center;">
                            <div style="font-size:24px;font-weight:700;color:var(--status-good);">Healthy</div>
                            <div class="text-secondary text-sm">Service Status</div>
                        </div>
                        <div style="padding:16px;background:var(--bg-secondary);border-radius:6px;text-align:center;">
                            <div style="font-size:24px;font-weight:700;color:var(--prism-blue);">4</div>
                            <div class="text-secondary text-sm">Active Instances</div>
                        </div>
                        <div style="padding:16px;background:var(--bg-secondary);border-radius:6px;text-align:center;">
                            <div style="font-size:24px;font-weight:700;color:var(--prism-blue);">12.4 ms</div>
                            <div class="text-secondary text-sm">Avg I/O Latency</div>
                        </div>
                    </div>
                    <h4>I/O Statistics</h4>
                    <table style="width:100%;border-collapse:collapse;font-size:var(--font-size-sm);margin-top:8px;">
                        <thead><tr style="background:var(--bg-secondary);border-bottom:2px solid var(--border-light);">
                            <th style="padding:8px 12px;text-align:left;">Metric</th>
                            <th style="padding:8px 12px;text-align:right;">Value</th>
                        </tr></thead>
                        <tbody>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:6px 12px;">Read IOPS</td><td style="text-align:right;">2,450</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:6px 12px;">Write IOPS</td><td style="text-align:right;">1,820</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:6px 12px;">Read Throughput</td><td style="text-align:right;">385 MB/s</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:6px 12px;">Write Throughput</td><td style="text-align:right;">210 MB/s</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:6px 12px;">Read Latency (avg)</td><td style="text-align:right;">8.2 ms</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:6px 12px;">Write Latency (avg)</td><td style="text-align:right;">16.6 ms</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:6px 12px;">OpLog Usage</td><td style="text-align:right;">42% (6.8 GB / 16 GB)</td></tr>
                            <tr><td style="padding:6px 12px;">Content Cache Hit Ratio</td><td style="text-align:right;">87.3%</td></tr>
                        </tbody>
                    </table>
                    <div class="text-secondary text-sm" style="margin-top:12px;">
                        <strong>Exam Note:</strong> Stargate manages the OpLog (write buffer), Extent Store (persistent data), and Content Cache (read cache). High OpLog usage may indicate write-heavy workload or slow drain to SSD tier.
                    </div>
                </div>
            </div>
        `;

        // Curator (:2010) — Background tasks
        el.querySelector('#curator-panel').innerHTML = `
            <div class="card">
                <div class="card-header">Curator — Background Task Manager (CVM:2010)</div>
                <div class="card-body">
                    <div class="text-secondary text-sm" style="margin-bottom:16px;">
                        Curator manages background operations: garbage collection, data compaction, ILM (tiering), and MapReduce-style distributed tasks across the cluster.
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:var(--space-lg);">
                        <div style="padding:16px;background:var(--bg-secondary);border-radius:6px;text-align:center;">
                            <div style="font-size:24px;font-weight:700;color:var(--status-good);">Idle</div>
                            <div class="text-secondary text-sm">Scan Status</div>
                        </div>
                        <div style="padding:16px;background:var(--bg-secondary);border-radius:6px;text-align:center;">
                            <div style="font-size:24px;font-weight:700;color:var(--prism-blue);">CVM-01</div>
                            <div class="text-secondary text-sm">Curator Master</div>
                        </div>
                        <div style="padding:16px;background:var(--bg-secondary);border-radius:6px;text-align:center;">
                            <div style="font-size:24px;font-weight:700;color:var(--prism-blue);">14m ago</div>
                            <div class="text-secondary text-sm">Last Full Scan</div>
                        </div>
                    </div>
                    <h4>Recent Scans</h4>
                    <table style="width:100%;border-collapse:collapse;font-size:var(--font-size-sm);margin-top:8px;">
                        <thead><tr style="background:var(--bg-secondary);border-bottom:2px solid var(--border-light);">
                            <th style="padding:8px 12px;text-align:left;">Scan Type</th>
                            <th style="padding:8px 12px;text-align:left;">Status</th>
                            <th style="padding:8px 12px;text-align:right;">Duration</th>
                            <th style="padding:8px 12px;text-align:right;">Extents Scanned</th>
                        </tr></thead>
                        <tbody>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:6px 12px;">Full</td><td><span class="status-badge good"><span class="dot"></span>Completed</span></td><td style="text-align:right;">3m 42s</td><td style="text-align:right;">142,586</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:6px 12px;">Partial</td><td><span class="status-badge good"><span class="dot"></span>Completed</span></td><td style="text-align:right;">0m 28s</td><td style="text-align:right;">8,421</td></tr>
                            <tr><td style="padding:6px 12px;">Selective</td><td><span class="status-badge good"><span class="dot"></span>Completed</span></td><td style="text-align:right;">0m 12s</td><td style="text-align:right;">1,205</td></tr>
                        </tbody>
                    </table>
                    <h4 style="margin-top:var(--space-lg);">Background Tasks</h4>
                    <table style="width:100%;border-collapse:collapse;font-size:var(--font-size-sm);margin-top:8px;">
                        <thead><tr style="background:var(--bg-secondary);border-bottom:2px solid var(--border-light);">
                            <th style="padding:8px 12px;text-align:left;">Task</th>
                            <th style="padding:8px 12px;text-align:left;">Status</th>
                            <th style="padding:8px 12px;text-align:right;">Progress</th>
                        </tr></thead>
                        <tbody>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:6px 12px;">Garbage Collection</td><td><span class="status-badge good"><span class="dot"></span>Idle</span></td><td style="text-align:right;">—</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:6px 12px;">Data Compaction</td><td><span class="status-badge good"><span class="dot"></span>Idle</span></td><td style="text-align:right;">—</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:6px 12px;">ILM Tiering (SSD → HDD)</td><td><span class="status-badge good"><span class="dot"></span>Idle</span></td><td style="text-align:right;">—</td></tr>
                            <tr><td style="padding:6px 12px;">EC-X Encoding</td><td><span class="status-badge info"><span class="dot"></span>N/A</span></td><td style="text-align:right;">No EC-X containers</td></tr>
                        </tbody>
                    </table>
                    <div class="text-secondary text-sm" style="margin-top:12px;">
                        <strong>Exam Note:</strong> Curator runs 3 scan types: Full (all extents), Partial (changed extents), Selective (specific tasks). Use <code>curator_cli</code> in CLI to check scan status.
                    </div>
                </div>
            </div>
        `;

        // Cerebro (:2020) — Replication
        el.querySelector('#cerebro-panel').innerHTML = `
            <div class="card">
                <div class="card-header">Cerebro — Replication Manager (CVM:2020)</div>
                <div class="card-body">
                    <div class="text-secondary text-sm" style="margin-bottom:16px;">
                        Cerebro manages all data replication: async DR (Protection Domains), NearSync, Metro Availability, and snapshot scheduling.
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:var(--space-lg);">
                        <div style="padding:16px;background:var(--bg-secondary);border-radius:6px;text-align:center;">
                            <div style="font-size:24px;font-weight:700;color:var(--status-good);">Active</div>
                            <div class="text-secondary text-sm">Replication Status</div>
                        </div>
                        <div style="padding:16px;background:var(--bg-secondary);border-radius:6px;text-align:center;">
                            <div style="font-size:24px;font-weight:700;color:var(--prism-blue);">3</div>
                            <div class="text-secondary text-sm">Protection Domains</div>
                        </div>
                        <div style="padding:16px;background:var(--bg-secondary);border-radius:6px;text-align:center;">
                            <div style="font-size:24px;font-weight:700;color:var(--prism-blue);">0</div>
                            <div class="text-secondary text-sm">Replication Failures</div>
                        </div>
                    </div>
                    <h4>Replication Streams</h4>
                    <table style="width:100%;border-collapse:collapse;font-size:var(--font-size-sm);margin-top:8px;">
                        <thead><tr style="background:var(--bg-secondary);border-bottom:2px solid var(--border-light);">
                            <th style="padding:8px 12px;text-align:left;">PD</th>
                            <th style="padding:8px 12px;text-align:left;">Type</th>
                            <th style="padding:8px 12px;text-align:left;">Remote Site</th>
                            <th style="padding:8px 12px;text-align:left;">Status</th>
                            <th style="padding:8px 12px;text-align:right;">Last Snapshot</th>
                            <th style="padding:8px 12px;text-align:right;">RPO</th>
                        </tr></thead>
                        <tbody>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:6px 12px;">DR-WebTier</td><td>Async</td><td>DR-Site-01</td><td><span class="status-badge good"><span class="dot"></span>OK</span></td><td style="text-align:right;">8 min ago</td><td style="text-align:right;">1 hour</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:6px 12px;">DR-Database</td><td>Async</td><td>DR-Site-01</td><td><span class="status-badge good"><span class="dot"></span>OK</span></td><td style="text-align:right;">22 min ago</td><td style="text-align:right;">1 hour</td></tr>
                            <tr><td style="padding:6px 12px;">Metro-Critical</td><td>Metro</td><td>Metro-Site-02</td><td><span class="status-badge good"><span class="dot"></span>Synchronous</span></td><td style="text-align:right;">Live</td><td style="text-align:right;">0 (sync)</td></tr>
                        </tbody>
                    </table>
                    <div class="text-secondary text-sm" style="margin-top:12px;">
                        <strong>Exam Note:</strong> Cerebro handles 3 replication modes: Async (RPO 1hr+), NearSync (RPO 1-15 min), Metro (synchronous, RPO 0). Metro requires dedicated 10 Gbps+ link and same AOS version on both sides.
                    </div>
                </div>
            </div>
        `;

        return el;
    }

    afterRender() {
        document.querySelectorAll('.svc-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.svc-tab').forEach(t => {
                    const isActive = t.dataset.tab === tab.dataset.tab;
                    t.classList.toggle('active', isActive);
                    t.style.borderBottom = isActive ? '2px solid var(--prism-blue)' : 'none';
                    t.style.fontWeight = isActive ? '600' : '500';
                    t.style.color = isActive ? 'var(--text-primary)' : 'var(--text-secondary)';
                });
                ['stargate', 'curator', 'cerebro'].forEach(p => {
                    const panel = document.getElementById(`${p}-panel`);
                    if (panel) panel.style.display = p === tab.dataset.tab ? '' : 'none';
                });
            });
        });
    }

    destroy() {}
}
