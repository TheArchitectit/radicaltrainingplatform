import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';

/**
 * File Analytics + Data Lens — Dashboard with file distribution, audit,
 * and anomaly detection.
 */
export class UsAnalyticsView extends BaseView {
    async render() {
        const shares = state.getAll('file_shares');
        const fsvms = state.getAll('fsvms');

        // Simulated analytics data
        const analytics = {
            totalFiles: 284750,
            totalSize: '2.4 TB',
            avgFileAge: '45 days',
            topContributors: [
                { user: 'jdoe@ntnxlab.local', files: 12400, size: '180 GB' },
                { user: 'asmith@ntnxlab.local', files: 9800, size: '145 GB' },
                { user: 'mchen@ntnxlab.local', files: 8200, size: '120 GB' },
                { user: 'svc_backup@ntnxlab.local', files: 6500, size: '95 GB' },
            ],
            fileDistribution: [
                { type: 'Documents (docx, pdf, xlsx)', count: 98500, pct: 35 },
                { type: 'Images (jpg, png, gif)', count: 71200, pct: 25 },
                { type: 'Videos (mp4, avi)', count: 28500, pct: 10 },
                { type: 'Archives (zip, tar)', count: 42700, pct: 15 },
                { type: 'Other', count: 43850, pct: 15 },
            ],
            anomalies: [
                { time: '2026-04-01 14:23', user: 'jdoe', event: 'Mass delete: 450 files in /Engineering/archive', severity: 'warning' },
                { time: '2026-03-28 03:15', user: 'unknown', event: 'Ransomware pattern: 200+ files renamed to .encrypted', severity: 'critical' },
            ],
            auditTrail: [
                { time: '2026-04-01 16:45', user: 'asmith', action: 'Created', path: '/HR/policies/2026-handbook.pdf' },
                { time: '2026-04-01 15:30', user: 'mchen', action: 'Modified', path: '/Engineering/designs/v2-arch.vsdx' },
                { time: '2026-04-01 14:23', user: 'jdoe', action: 'Deleted', path: '/Engineering/archive/ (450 files)' },
                { time: '2026-04-01 12:00', user: 'svc_backup', action: 'Read', path: '/Finance/reports/Q1-2026.xlsx' },
            ],
        };

        return this.html(`
            <div class="page-title">
                <h1>File Analytics</h1>
                <span class="text-secondary text-sm">${fsvms.length} FSVMs • ${shares.length} shares monitored</span>
            </div>

            <!-- Summary Cards -->
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-lg);margin-bottom:var(--space-xl);">
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${(analytics.totalFiles / 1000).toFixed(0)}K</div>
                    <div class="text-secondary text-sm">Total Files</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${analytics.totalSize}</div>
                    <div class="text-secondary text-sm">Total Size</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${analytics.avgFileAge}</div>
                    <div class="text-secondary text-sm">Avg File Age</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:${analytics.anomalies.length > 0 ? 'var(--status-warning)' : 'var(--status-good)'};">${analytics.anomalies.length}</div>
                    <div class="text-secondary text-sm">Anomalies</div>
                </div></div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-lg);margin-bottom:var(--space-xl);">
                <!-- Top Contributors -->
                <div class="card">
                    <div class="card-header">Top Contributors</div>
                    <div class="card-body" style="padding:0;">
                        <table style="width:100%;border-collapse:collapse;">
                            <thead><tr style="background:var(--gray-50);border-bottom:2px solid var(--border-light);">
                                <th style="padding:8px 12px;text-align:left;font-size:var(--font-size-sm);">User</th>
                                <th style="padding:8px 12px;text-align:right;font-size:var(--font-size-sm);">Files</th>
                                <th style="padding:8px 12px;text-align:right;font-size:var(--font-size-sm);">Size</th>
                            </tr></thead>
                            <tbody>
                                ${analytics.topContributors.map(c => `
                                    <tr style="border-bottom:1px solid var(--border-light);">
                                        <td style="padding:8px 12px;font-size:13px;">${c.user}</td>
                                        <td style="padding:8px 12px;text-align:right;font-size:13px;">${c.files.toLocaleString()}</td>
                                        <td style="padding:8px 12px;text-align:right;font-size:13px;">${c.size}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- File Distribution -->
                <div class="card">
                    <div class="card-header">File Type Distribution</div>
                    <div class="card-body">
                        ${analytics.fileDistribution.map(d => `
                            <div style="margin-bottom:12px;">
                                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                                    <span class="text-sm">${d.type}</span>
                                    <span class="text-sm text-secondary">${d.count.toLocaleString()} (${d.pct}%)</span>
                                </div>
                                <div class="capacity-bar" style="height:8px;"><div class="fill" style="width:${d.pct}%;"></div></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Anomaly Detection -->
            <div class="card" style="margin-bottom:var(--space-xl);">
                <div class="card-header">🔍 Anomaly Detection</div>
                <div class="card-body" style="padding:0;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead><tr style="background:var(--gray-50);border-bottom:2px solid var(--border-light);">
                            <th style="padding:8px 12px;text-align:left;font-size:var(--font-size-sm);">Time</th>
                            <th style="padding:8px 12px;text-align:left;font-size:var(--font-size-sm);">User</th>
                            <th style="padding:8px 12px;text-align:left;font-size:var(--font-size-sm);">Event</th>
                            <th style="padding:8px 12px;text-align:left;font-size:var(--font-size-sm);">Severity</th>
                        </tr></thead>
                        <tbody>
                            ${analytics.anomalies.map(a => `
                                <tr style="border-bottom:1px solid var(--border-light);">
                                    <td style="padding:8px 12px;font-size:12px;font-family:var(--font-mono);">${a.time}</td>
                                    <td style="padding:8px 12px;font-size:13px;">${a.user}</td>
                                    <td style="padding:8px 12px;font-size:13px;">${a.event}</td>
                                    <td style="padding:8px 12px;"><span class="status-badge ${a.severity === 'critical' ? 'critical' : 'warning'}"><span class="dot"></span>${a.severity}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Audit Trail -->
            <div class="card" style="margin-bottom:var(--space-xl);">
                <div class="card-header">📝 Audit Trail</div>
                <div class="card-body" style="padding:0;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead><tr style="background:var(--gray-50);border-bottom:2px solid var(--border-light);">
                            <th style="padding:8px 12px;text-align:left;font-size:var(--font-size-sm);">Time</th>
                            <th style="padding:8px 12px;text-align:left;font-size:var(--font-size-sm);">User</th>
                            <th style="padding:8px 12px;text-align:left;font-size:var(--font-size-sm);">Action</th>
                            <th style="padding:8px 12px;text-align:left;font-size:var(--font-size-sm);">Path</th>
                        </tr></thead>
                        <tbody>
                            ${analytics.auditTrail.map(a => `
                                <tr style="border-bottom:1px solid var(--border-light);">
                                    <td style="padding:8px 12px;font-size:12px;font-family:var(--font-mono);">${a.time}</td>
                                    <td style="padding:8px 12px;font-size:13px;">${a.user}</td>
                                    <td style="padding:8px 12px;font-size:13px;">${a.action}</td>
                                    <td style="padding:8px 12px;font-size:12px;font-family:var(--font-mono);">${a.path}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Data Lens -->
            <div class="card">
                <div class="card-header">☁️ Data Lens (Cloud-based Analytics)</div>
                <div class="card-body">
                    <p class="text-secondary text-sm" style="margin-bottom:12px;">
                        <strong>Exam Note:</strong> Data Lens is the cloud-hosted successor to on-prem File Analytics. Key differences:
                    </p>
                    <table style="width:100%;font-size:13px;border-collapse:collapse;">
                        <tr style="background:var(--gray-50);"><th style="padding:8px 12px;text-align:left;">Feature</th><th style="padding:8px 12px;text-align:left;">File Analytics (On-Prem)</th><th style="padding:8px 12px;text-align:left;">Data Lens (Cloud)</th></tr>
                        <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px 12px;">Deployment</td><td style="padding:8px 12px;">VM on cluster</td><td style="padding:8px 12px;">SaaS (no VM needed)</td></tr>
                        <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px 12px;">Multi-cluster</td><td style="padding:8px 12px;">No (per-cluster)</td><td style="padding:8px 12px;">Yes (centralized)</td></tr>
                        <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px 12px;">Ransomware Detection</td><td style="padding:8px 12px;">Basic</td><td style="padding:8px 12px;">Advanced (ML-based)</td></tr>
                        <tr><td style="padding:8px 12px;">Data Classification</td><td style="padding:8px 12px;">No</td><td style="padding:8px 12px;">Yes (PII, PHI, PCI)</td></tr>
                    </table>
                </div>
            </div>
        `);
    }
}
