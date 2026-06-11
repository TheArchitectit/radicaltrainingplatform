import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';

/**
 * Prism Central Dashboard — Multi-cluster overview with global entity counts,
 * alerts, capacity, and category summary.
 */
export class PcDashboardView extends BaseView {
    async render() {
        const cluster = state.cluster;
        const vms = state.vms;
        const hosts = state.hosts;
        const containers = state.containers;
        const networks = state.networks;
        const categories = state.getAll('categories');
        const flowPolicies = state.getAll('flow_policies');
        const protectionPolicies = state.getAll('protection_policies');
        const recoveryPlans = state.getAll('recovery_plans');
        const alerts = state.getAll('alerts').filter(a => !a.resolved);

        const runningVMs = vms.filter(v => v.power_state === 'on').length;
        const totalStorage = containers.reduce((s, c) => s + c.capacity_tb, 0);
        const usedStorage = containers.reduce((s, c) => s + c.used_tb, 0);
        const storagePct = totalStorage > 0 ? Math.round((usedStorage / totalStorage) * 100) : 0;

        const totalCpu = hosts.reduce((s, h) => s + h.cpu_cores, 0);
        const usedCpu = vms.filter(v => v.power_state === 'on').reduce((s, v) => s + v.vcpus, 0);
        const cpuPct = totalCpu > 0 ? Math.round((usedCpu / totalCpu) * 100) : 0;

        const totalMem = hosts.reduce((s, h) => s + h.memory_gb, 0);
        const usedMem = vms.filter(v => v.power_state === 'on').reduce((s, v) => s + v.memory_gb, 0);
        const memPct = totalMem > 0 ? Math.round((usedMem / totalMem) * 100) : 0;

        return this.html(`
            <div class="page-title">
                <h1>Prism Central Dashboard</h1>
                <span class="text-secondary text-sm">Multi-cluster management</span>
            </div>

            <!-- Cluster Summary -->
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:var(--space-lg);margin-bottom:var(--space-xl);">
                ${this.#card('Clusters', '1', 'var(--prism-blue)', cluster.name)}
                ${this.#card('VMs', `${runningVMs}/${vms.length}`, 'var(--status-good)', `${runningVMs} running`)}
                ${this.#card('Hosts', hosts.length, 'var(--prism-blue)', 'All healthy')}
                ${this.#card('Alerts', alerts.length, alerts.length > 0 ? 'var(--status-warning)' : 'var(--status-good)', `${alerts.filter(a => a.severity === 'critical').length} critical`)}
                ${this.#card('Policies', flowPolicies.length, 'var(--prism-blue)', `${flowPolicies.filter(p => p.mode === 'applied').length} enforced`)}
            </div>

            <!-- Resource Utilization (SVG Gauges) -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-lg);margin-bottom:var(--space-xl);">
                ${this.#gaugeCard('CPU', usedCpu, totalCpu, 'cores', cpuPct)}
                ${this.#gaugeCard('Memory', usedMem, totalMem, 'GB', memPct)}
                ${this.#gaugeCard('Storage', usedStorage.toFixed(1), totalStorage.toFixed(0), 'TB', storagePct)}
            </div>

            <!-- Bottom Row -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-lg);">
                <!-- Registered Clusters -->
                <div class="card">
                    <div class="card-header">Registered Clusters</div>
                    <div class="card-body">
                        <div style="display:flex;align-items:center;gap:12px;padding:8px 0;">
                            <span class="status-badge good"><span class="dot"></span>Healthy</span>
                            <div>
                                <div style="font-weight:600;">${cluster.name}</div>
                                <div class="text-secondary text-sm">${cluster.version} • ${hosts.length} nodes • RF${cluster.rf}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Categories Summary -->
                <div class="card">
                    <div class="card-header">Categories</div>
                    <div class="card-body">
                        ${categories.length === 0 ? '<div class="text-secondary text-sm">No categories defined</div>' :
                        categories.map(c => `
                            <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border-light);">
                                <span class="text-sm" style="font-weight:600;">${this.#esc(c.key)}</span>
                                <span class="text-secondary text-sm">${c.values.length} values</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Data Protection Summary -->
                <div class="card">
                    <div class="card-header">Data Protection</div>
                    <div class="card-body">
                        <table style="width:100%;font-size:var(--font-size-sm);">
                            <tr><td class="text-secondary" style="padding:4px 8px;">Protection Policies</td><td style="padding:4px 8px;font-weight:600;">${protectionPolicies.length}</td></tr>
                            <tr><td class="text-secondary" style="padding:4px 8px;">Recovery Plans</td><td style="padding:4px 8px;font-weight:600;">${recoveryPlans.length}</td></tr>
                            <tr><td class="text-secondary" style="padding:4px 8px;">PE Protection Domains</td><td style="padding:4px 8px;font-weight:600;">${state.protectionDomains.length}</td></tr>
                            <tr><td class="text-secondary" style="padding:4px 8px;">Protected VMs</td><td style="padding:4px 8px;font-weight:600;">${new Set(state.protectionDomains.flatMap(pd => pd.vms || [])).size}</td></tr>
                        </table>
                    </div>
                </div>
            </div>
        `);
    }

    #card(title, value, color, subtitle) {
        return `<div class="card"><div class="card-body" style="text-align:center;">
            <div style="font-size:32px;font-weight:700;color:${color};">${value}</div>
            <div class="text-secondary text-sm">${title}</div>
            <div class="text-secondary" style="font-size:var(--font-size-xs);">${subtitle}</div>
        </div></div>`;
    }

    #gaugeCard(label, used, total, unit, pct) {
        const color = pct > 80 ? 'var(--status-critical)' : pct > 60 ? 'var(--status-warning)' : 'var(--prism-blue)';
        const radius = 54;
        const circumference = 2 * Math.PI * radius;
        const dashOffset = circumference - (pct / 100) * circumference;
        return `<div class="card">
            <div class="card-header">${label} Utilization</div>
            <div class="card-body" style="text-align:center;padding:var(--space-lg);">
                <svg width="140" height="80" viewBox="0 0 140 80">
                    <path d="M 10 70 A 54 54 0 0 1 130 70" fill="none" stroke="var(--border-subtle)" stroke-width="10" stroke-linecap="round"/>
                    <path d="M 10 70 A 54 54 0 0 1 130 70" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"
                          stroke-dasharray="${circumference / 2}" stroke-dashoffset="${dashOffset / 2}"
                          style="transition: stroke-dashoffset 0.6s ease;"/>
                    <text x="70" y="62" text-anchor="middle" font-size="22" font-weight="700" fill="var(--text-primary)">${pct}%</text>
                    <text x="70" y="78" text-anchor="middle" font-size="10" fill="var(--text-secondary)">${used} / ${total} ${unit}</text>
                </svg>
            </div>
        </div>`;
    }

    #utilizationCard(label, used, total, unit, pct) {
        const cls = pct > 80 ? 'critical' : pct > 60 ? 'warning' : '';
        return `<div class="card">
            <div class="card-header">${label} Utilization</div>
            <div class="card-body">
                <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-sm);">
                    <span class="text-sm text-secondary">Used: ${used} ${unit}</span>
                    <span class="text-sm text-secondary">Total: ${total} ${unit}</span>
                </div>
                <div class="capacity-bar" style="height:12px;">
                    <div class="fill ${cls}" style="width:${pct}%;"></div>
                </div>
                <div class="text-sm text-secondary" style="margin-top:var(--space-xs);text-align:right;">${pct}%</div>
            </div>
        </div>`;
    }

    #esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
}
