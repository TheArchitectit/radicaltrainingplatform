import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { toast } from '../components/Toast.js';

/**
 * PE Health — NCC checks and alerts dashboard.
 */
export class PeHealthView extends BaseView {
    #unsubs = [];

    async render() {
        const alerts = state.getAll('alerts');
        const activeAlerts = alerts.filter(a => !a.resolved);
        const resolvedAlerts = alerts.filter(a => a.resolved);

        // Simulated NCC checks
        const nccChecks = [
            { name: 'Cluster Connectivity', status: 'pass' },
            { name: 'CVM Health', status: 'pass' },
            { name: 'Disk Health', status: 'pass' },
            { name: 'Network Health', status: 'pass' },
            { name: 'Storage Container Space', status: state.containers.some(c => c.used_tb / c.capacity_tb > 0.7) ? 'warn' : 'pass' },
            { name: 'VM Power State Audit', status: state.vms.some(v => !v.is_cvm && v.power_state === 'off') ? 'warn' : 'pass' },
            { name: 'Data Resiliency', status: 'pass' },
            { name: 'Hypervisor Health', status: 'pass' },
            { name: 'Time Synchronization', status: 'pass' },
            { name: 'Certificate Expiration', status: 'pass' },
        ];

        const passed = nccChecks.filter(c => c.status === 'pass').length;
        const warnings = nccChecks.filter(c => c.status === 'warn').length;
        const failures = nccChecks.filter(c => c.status === 'fail').length;

        return this.html(`
            <div class="page-title">
                <h1>Health</h1>
                <button class="btn btn-primary" id="run-ncc-btn">Run NCC Checks</button>
            </div>

            <!-- NCC Summary -->
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-lg);margin-bottom:var(--space-xl);">
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:32px;font-weight:700;color:var(--status-good);">${passed}</div>
                    <div class="text-secondary text-sm">Passed</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:32px;font-weight:700;color:var(--status-warning);">${warnings}</div>
                    <div class="text-secondary text-sm">Warnings</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:32px;font-weight:700;color:var(--status-critical);">${failures}</div>
                    <div class="text-secondary text-sm">Failures</div>
                </div></div>
            </div>

            <!-- NCC Check Results -->
            <div class="card" style="margin-bottom:var(--space-xl);">
                <div class="card-header">NCC Health Checks</div>
                <div class="card-body" style="padding:0;">
                    <table class="entity-table">
                        <thead><tr><th>Check</th><th>Status</th></tr></thead>
                        <tbody>
                            ${nccChecks.map(c => `
                                <tr>
                                    <td>${c.name}</td>
                                    <td><span class="status-badge ${c.status === 'pass' ? 'good' : c.status === 'warn' ? 'warning' : 'critical'}">
                                        <span class="dot"></span>${c.status === 'pass' ? 'Pass' : c.status === 'warn' ? 'Warning' : 'Fail'}
                                    </span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Active Alerts -->
            <div class="card" style="margin-bottom:var(--space-xl);">
                <div class="card-header flex justify-between items-center">
                    <span>Active Alerts (${activeAlerts.length})</span>
                </div>
                <div class="card-body" style="padding:0;">
                    ${activeAlerts.length === 0 ? '<div class="empty-state" style="padding:24px;"><h3>No active alerts</h3></div>' : `
                    <table class="entity-table">
                        <thead><tr><th>Severity</th><th>Title</th><th>Entity</th><th>Time</th><th></th></tr></thead>
                        <tbody>
                            ${activeAlerts.map(a => `
                                <tr>
                                    <td><span class="status-badge ${a.severity === 'critical' ? 'critical' : a.severity === 'warning' ? 'warning' : 'good'}">
                                        <span class="dot"></span>${a.severity}
                                    </span></td>
                                    <td>${a.title}</td>
                                    <td>${a.entity}</td>
                                    <td class="text-secondary text-sm">${new Date(a.created_at).toLocaleString()}</td>
                                    <td><button class="btn resolve-alert-btn" data-id="${a.uuid}" style="padding:2px 8px;font-size:11px;">Resolve</button></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>`}
                </div>
            </div>

            <!-- Resolved Alerts -->
            ${resolvedAlerts.length > 0 ? `
            <div class="card">
                <div class="card-header">Resolved Alerts (${resolvedAlerts.length})</div>
                <div class="card-body" style="padding:0;">
                    <table class="entity-table">
                        <thead><tr><th>Severity</th><th>Title</th><th>Entity</th><th>Time</th></tr></thead>
                        <tbody>
                            ${resolvedAlerts.map(a => `
                                <tr style="opacity:0.6;">
                                    <td><span class="status-badge good"><span class="dot"></span>${a.severity}</span></td>
                                    <td>${a.title}</td>
                                    <td>${a.entity}</td>
                                    <td class="text-secondary text-sm">${new Date(a.created_at).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>` : ''}
        `);
    }

    afterRender() {
        document.getElementById('run-ncc-btn')?.addEventListener('click', () => {
            toast.success('NCC health checks completed');
        });

        document.querySelectorAll('.resolve-alert-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                await state.update('alerts', btn.dataset.id, { resolved: true });
                toast.success('Alert resolved');
                // Re-render
                const container = document.getElementById('view-container');
                if (container) {
                    container.innerHTML = '';
                    const el = await this.render();
                    container.appendChild(el);
                    this.afterRender();
                }
            });
        });
    }

    destroy() { this.#unsubs.forEach(u => u()); }
}
