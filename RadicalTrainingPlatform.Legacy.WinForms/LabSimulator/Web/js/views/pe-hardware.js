import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';

/**
 * PE Hardware — Host/node management view.
 */
export class PeHardwareView extends BaseView {
    async render() {
        const hosts = state.hosts;
        const cluster = state.cluster;
        const totalCores = hosts.reduce((s, h) => s + h.cpu_cores, 0);
        const totalMem = hosts.reduce((s, h) => s + h.memory_gb, 0);
        const totalSSD = hosts.reduce((s, h) => s + h.ssd_tb, 0);
        const totalHDD = hosts.reduce((s, h) => s + h.hdd_tb, 0);

        return this.html(`
            <div class="page-title">
                <h1>Hardware</h1>
                <span class="text-secondary text-sm">${cluster.numNodes} Nodes — ${cluster.hypervisor}</span>
            </div>

            <!-- Cluster-wide summary -->
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-lg);margin-bottom:var(--space-xl);">
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${totalCores}</div>
                    <div class="text-secondary text-sm">Total CPU Cores</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${totalMem} GB</div>
                    <div class="text-secondary text-sm">Total Memory</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${totalSSD.toFixed(1)} TB</div>
                    <div class="text-secondary text-sm">SSD Capacity</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${totalHDD.toFixed(1)} TB</div>
                    <div class="text-secondary text-sm">HDD Capacity</div>
                </div></div>
            </div>

            <!-- Host table -->
            <div class="card">
                <div class="card-header">Hosts</div>
                <div class="card-body" style="padding:0;">
                    <table class="entity-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>CVM IP</th>
                                <th>IPMI IP</th>
                                <th>CPU Cores</th>
                                <th>Memory</th>
                                <th>SSD</th>
                                <th>HDD</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${hosts.map(h => `
                                <tr>
                                    <td><strong>${h.name}</strong></td>
                                    <td><span class="font-mono">${h.ip}</span></td>
                                    <td><span class="font-mono">${h.ipmi}</span></td>
                                    <td>${h.cpu_cores}</td>
                                    <td>${h.memory_gb} GB</td>
                                    <td>${h.ssd_tb} TB</td>
                                    <td>${h.hdd_tb} TB</td>
                                    <td><span class="status-badge good"><span class="dot"></span>${h.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `);
    }
}
