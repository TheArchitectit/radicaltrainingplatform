import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';

/**
 * Prism Element Dashboard — Cluster health overview.
 */
export class PeDashboardView extends BaseView {
    async render() {
        const cluster = state.cluster;
        const vms = state.vms;
        const containers = state.containers;
        const networks = state.networks;
        const alerts = state.getAll('alerts').filter(a => !a.resolved);
        const hosts = state.hosts;

        const runningVMs = vms.filter(v => v.power_state === 'on').length;
        const totalVCPUs = vms.filter(v => v.power_state === 'on').reduce((s, v) => s + v.vcpus, 0);
        const totalMemGB = vms.filter(v => v.power_state === 'on').reduce((s, v) => s + v.memory_gb, 0);
        const totalStorageTB = containers.reduce((s, c) => s + c.capacity_tb, 0);
        const usedStorageTB = containers.reduce((s, c) => s + c.used_tb, 0);
        const storagePct = Math.round((usedStorageTB / totalStorageTB) * 100);
        const storageBarClass = storagePct > 80 ? 'critical' : storagePct > 60 ? 'warning' : '';

        return this.html(`
            <div class="page-title">
                <h1>Dashboard</h1>
                <span class="text-secondary text-sm">${cluster.name} — ${cluster.version}</span>
            </div>

            <!-- Health Summary -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-lg); margin-bottom: var(--space-xl);">
                <div class="card">
                    <div class="card-body" style="text-align:center;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--status-good);">${runningVMs}</div>
                        <div class="text-secondary text-sm">VMs Running</div>
                        <div class="text-secondary" style="font-size:var(--font-size-xs);">${vms.length} total</div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body" style="text-align:center;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--prism-blue);">${hosts.length}</div>
                        <div class="text-secondary text-sm">Hosts</div>
                        <div class="text-secondary" style="font-size:var(--font-size-xs);">All healthy</div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body" style="text-align:center;">
                        <div style="font-size: 32px; font-weight: 700; color: ${alerts.length > 0 ? 'var(--status-warning)' : 'var(--status-good)'};">${alerts.length}</div>
                        <div class="text-secondary text-sm">Active Alerts</div>
                        <div class="text-secondary" style="font-size:var(--font-size-xs);">${alerts.filter(a => a.severity === 'critical').length} critical</div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body" style="text-align:center;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--prism-blue);">${containers.length}</div>
                        <div class="text-secondary text-sm">Containers</div>
                        <div class="text-secondary" style="font-size:var(--font-size-xs);">${networks.length} networks</div>
                    </div>
                </div>
            </div>

            <!-- Cluster Details + Storage -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
                <div class="card">
                    <div class="card-header">Cluster Details</div>
                    <div class="card-body">
                        <table style="width:100%; font-size: var(--font-size-sm);">
                            <tr><td class="text-secondary" style="padding: 4px 8px;">Cluster Name</td><td style="padding: 4px 8px;">${cluster.name}</td></tr>
                            <tr><td class="text-secondary" style="padding: 4px 8px;">AOS Version</td><td style="padding: 4px 8px;">${cluster.version}</td></tr>
                            <tr><td class="text-secondary" style="padding: 4px 8px;">Hypervisor</td><td style="padding: 4px 8px;">${cluster.hypervisor}</td></tr>
                            <tr><td class="text-secondary" style="padding: 4px 8px;">Cluster VIP</td><td style="padding: 4px 8px; font-family: var(--font-mono);">${cluster.clusterVIP}</td></tr>
                            <tr><td class="text-secondary" style="padding: 4px 8px;">Data Services IP</td><td style="padding: 4px 8px; font-family: var(--font-mono);">${cluster.dataServicesIP}</td></tr>
                            <tr><td class="text-secondary" style="padding: 4px 8px;">Replication Factor</td><td style="padding: 4px 8px;">RF${cluster.rf}</td></tr>
                            <tr><td class="text-secondary" style="padding: 4px 8px;">Nodes</td><td style="padding: 4px 8px;">${cluster.numNodes}</td></tr>
                        </table>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">Storage Summary</div>
                    <div class="card-body">
                        <div style="margin-bottom: var(--space-lg);">
                            <div class="flex justify-between mb-lg" style="margin-bottom:var(--space-sm);">
                                <span class="text-sm text-secondary">Used: ${usedStorageTB.toFixed(1)} TB</span>
                                <span class="text-sm text-secondary">Total: ${totalStorageTB.toFixed(0)} TB</span>
                            </div>
                            <div class="capacity-bar" style="height:12px;">
                                <div class="fill ${storageBarClass}" style="width:${storagePct}%;"></div>
                            </div>
                            <div class="text-sm text-secondary" style="margin-top:var(--space-xs);text-align:right;">${storagePct}% used</div>
                        </div>
                        <div style="margin-top:var(--space-lg);">
                            <div class="text-sm" style="font-weight:600; margin-bottom:var(--space-sm);">Resource Usage</div>
                            <table style="width:100%; font-size: var(--font-size-sm);">
                                <tr><td class="text-secondary" style="padding:4px 8px;">Total vCPUs</td><td style="padding:4px 8px;">${totalVCPUs}</td></tr>
                                <tr><td class="text-secondary" style="padding:4px 8px;">Total Memory</td><td style="padding:4px 8px;">${totalMemGB} GB</td></tr>
                                <tr><td class="text-secondary" style="padding:4px 8px;">Physical Cores</td><td style="padding:4px 8px;">${hosts.reduce((s, h) => s + h.cpu_cores, 0)}</td></tr>
                                <tr><td class="text-secondary" style="padding:4px 8px;">Physical Memory</td><td style="padding:4px 8px;">${hosts.reduce((s, h) => s + h.memory_gb, 0)} GB</td></tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }
}
