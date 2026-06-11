import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { toast } from '../components/Toast.js';

/**
 * PC Reports — Report templates and custom report builder.
 */
export class PcReportsView extends BaseView {

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        const reports = state.getAll('reports');
        const templates = [
            { id: 'cluster-efficiency', name: 'Cluster Efficiency', icon: '📊', description: 'Storage savings, dedup/compression ratios, capacity utilization.' },
            { id: 'vm-summary', name: 'VM Summary', icon: '🖥️', description: 'All VMs with power state, resource allocation, host placement.' },
            { id: 'storage-utilization', name: 'Storage Utilization', icon: '💾', description: 'Container usage, growth trends, RF overhead analysis.' },
            { id: 'security-compliance', name: 'Security Compliance', icon: '🔒', description: 'SSH status, DARE, SSL certificates, Flow policy enforcement.' },
            { id: 'data-protection', name: 'Data Protection', icon: '🛡️', description: 'Protection domains, Leap policies, RPO compliance, last snapshots.' },
            { id: 'capacity-planning', name: 'Capacity Planning', icon: '📈', description: 'Runway projections, resource bottlenecks, expansion recommendations.' },
        ];

        el.innerHTML = `
            <div class="page-title">
                <h1>Reports</h1>
                <button class="btn btn-primary" id="custom-report-btn">+ Custom Report</button>
            </div>

            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-lg);margin-bottom:var(--space-xl);">
                ${templates.map(t => `
                    <div class="card report-template" data-template="${t.id}" style="cursor:pointer;transition:box-shadow 0.2s;">
                        <div class="card-body" style="text-align:center;padding:var(--space-xl);">
                            <div style="font-size:36px;margin-bottom:8px;">${t.icon}</div>
                            <div style="font-weight:700;font-size:var(--font-size-md);margin-bottom:4px;">${t.name}</div>
                            <div class="text-secondary text-sm">${t.description}</div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Generated Reports -->
            <div class="card">
                <div class="card-header">Generated Reports</div>
                <div class="card-body" style="padding:0;">
                    <table style="width:100%;border-collapse:collapse;" id="reports-table">
                        <thead>
                            <tr style="background:var(--gray-50);border-bottom:2px solid var(--border-light);">
                                <th style="padding:10px 12px;text-align:left;font-weight:600;font-size:var(--font-size-sm);">Report</th>
                                <th style="padding:10px 12px;text-align:left;font-weight:600;font-size:var(--font-size-sm);">Type</th>
                                <th style="padding:10px 12px;text-align:left;font-weight:600;font-size:var(--font-size-sm);">Generated</th>
                                <th style="padding:10px 12px;text-align:left;font-weight:600;font-size:var(--font-size-sm);width:100px;">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="reports-tbody">
                            ${reports.length === 0 ? '<tr><td colspan="4" class="text-secondary" style="padding:24px;text-align:center;">No reports generated yet. Click a template above to generate one.</td></tr>' :
                            reports.map(r => `
                                <tr>
                                    <td style="padding:8px 12px;font-weight:500;">${r.name}</td>
                                    <td style="padding:8px 12px;">${r.type}</td>
                                    <td style="padding:8px 12px;">${r.generated_at}</td>
                                    <td style="padding:8px 12px;">
                                        <button class="btn btn-secondary btn-sm view-report-btn" data-report-id="${r.uuid}">View</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Report Viewer Modal -->
            <div id="report-viewer" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1000;">
                <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80%;max-width:800px;max-height:80vh;background:white;border-radius:8px;overflow:hidden;">
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--border-light);">
                        <h3 id="report-title" style="margin:0;">Report</h3>
                        <button class="btn btn-secondary btn-sm" id="close-report-btn">✕ Close</button>
                    </div>
                    <div id="report-content" style="padding:20px;overflow-y:auto;max-height:60vh;"></div>
                </div>
            </div>
        `;

        return el;
    }

    afterRender() {
        document.querySelectorAll('.report-template').forEach(card => {
            card.addEventListener('click', () => this.#generateReport(card.dataset.template));
        });
        document.querySelectorAll('.view-report-btn').forEach(btn => {
            btn.addEventListener('click', () => this.#viewReport(btn.dataset.reportId));
        });
        document.getElementById('close-report-btn')?.addEventListener('click', () => {
            document.getElementById('report-viewer').style.display = 'none';
        });
        document.getElementById('custom-report-btn')?.addEventListener('click', () => {
            toast.info('Custom report builder — select entities and metrics to include (coming in a future sprint)');
        });
    }

    async #generateReport(templateId) {
        toast.info('Generating report...');
        const report = this.#buildReport(templateId);

        await state.create('reports', {
            name: report.name,
            type: templateId,
            generated_at: new Date().toISOString().split('T')[0],
            content: report.content,
        });

        toast.success(`Report "${report.name}" generated`);
        this.#showReport(report.name, report.content);

        // Refresh table
        const tbody = document.getElementById('reports-tbody');
        if (tbody) {
            const reports = state.getAll('reports');
            tbody.innerHTML = reports.map(r => `
                <tr>
                    <td style="padding:8px 12px;font-weight:500;">${r.name}</td>
                    <td style="padding:8px 12px;">${r.type}</td>
                    <td style="padding:8px 12px;">${r.generated_at}</td>
                    <td style="padding:8px 12px;"><button class="btn btn-secondary btn-sm view-report-btn" data-report-id="${r.uuid}">View</button></td>
                </tr>
            `).join('');
            tbody.querySelectorAll('.view-report-btn').forEach(btn => {
                btn.addEventListener('click', () => this.#viewReport(btn.dataset.reportId));
            });
        }
    }

    #viewReport(reportId) {
        const report = state.getById('reports', reportId);
        if (report) this.#showReport(report.name, report.content);
    }

    #showReport(title, content) {
        document.getElementById('report-title').textContent = title;
        document.getElementById('report-content').innerHTML = content;
        document.getElementById('report-viewer').style.display = '';
    }

    #buildReport(templateId) {
        const cluster = state.cluster;
        const vms = state.vms;
        const containers = state.containers;
        const hosts = state.hosts;
        const networks = state.networks;

        switch (templateId) {
            case 'cluster-efficiency': {
                const totalCap = containers.reduce((s, c) => s + c.capacity_tb, 0);
                const usedCap = containers.reduce((s, c) => s + c.used_tb, 0);
                const compressedContainers = containers.filter(c => c.compression !== 'off');
                const dedupContainers = containers.filter(c => c.dedup !== 'off');
                return {
                    name: `Cluster Efficiency — ${new Date().toLocaleDateString()}`,
                    content: `
                        <h4>Cluster: ${cluster.name}</h4>
                        <table style="width:100%;font-size:13px;border-collapse:collapse;">
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px;" class="text-secondary">Total Capacity</td><td style="padding:8px;font-weight:600;">${totalCap.toFixed(1)} TB</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px;" class="text-secondary">Used</td><td style="padding:8px;">${usedCap.toFixed(1)} TB (${Math.round(usedCap / totalCap * 100)}%)</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px;" class="text-secondary">Containers with Compression</td><td style="padding:8px;">${compressedContainers.length} of ${containers.length}</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px;" class="text-secondary">Containers with Dedup</td><td style="padding:8px;">${dedupContainers.length} of ${containers.length}</td></tr>
                            <tr><td style="padding:8px;" class="text-secondary">Erasure Coding Enabled</td><td style="padding:8px;">${containers.filter(c => c.erasure_coding).length} container(s)</td></tr>
                        </table>`,
                };
            }
            case 'vm-summary': {
                const running = vms.filter(v => v.power_state === 'on' && !v.is_cvm);
                const stopped = vms.filter(v => v.power_state === 'off');
                return {
                    name: `VM Summary — ${new Date().toLocaleDateString()}`,
                    content: `
                        <h4>Virtual Machines (${vms.length} total)</h4>
                        <div style="margin-bottom:12px;"><strong>Running:</strong> ${running.length} | <strong>Stopped:</strong> ${stopped.length} | <strong>CVMs:</strong> ${vms.filter(v => v.is_cvm).length}</div>
                        <table style="width:100%;font-size:12px;border-collapse:collapse;">
                            <tr style="background:var(--surface-secondary);"><th style="padding:6px;text-align:left;">Name</th><th style="padding:6px;">vCPU</th><th style="padding:6px;">RAM</th><th style="padding:6px;">State</th><th style="padding:6px;">Host</th></tr>
                            ${vms.map(v => `<tr style="border-bottom:1px solid var(--border-light);">
                                <td style="padding:6px;">${v.name}</td>
                                <td style="padding:6px;text-align:center;">${v.vcpus}</td>
                                <td style="padding:6px;text-align:center;">${v.memory_gb} GB</td>
                                <td style="padding:6px;text-align:center;">${v.power_state === 'on' ? '🟢' : '🔴'}</td>
                                <td style="padding:6px;">${state.getById('hosts', v.host_uuid)?.name || '—'}</td>
                            </tr>`).join('')}
                        </table>`,
                };
            }
            case 'storage-utilization':
                return {
                    name: `Storage Utilization — ${new Date().toLocaleDateString()}`,
                    content: `
                        <h4>Storage Containers</h4>
                        <table style="width:100%;font-size:12px;border-collapse:collapse;">
                            <tr style="background:var(--surface-secondary);"><th style="padding:6px;text-align:left;">Container</th><th style="padding:6px;">Capacity</th><th style="padding:6px;">Used</th><th style="padding:6px;">%</th><th style="padding:6px;">RF</th><th style="padding:6px;">Compression</th><th style="padding:6px;">Dedup</th></tr>
                            ${containers.map(c => {
                                const pct = Math.round((c.used_tb / c.capacity_tb) * 100);
                                return `<tr style="border-bottom:1px solid var(--border-light);">
                                    <td style="padding:6px;">${c.name}</td>
                                    <td style="padding:6px;text-align:center;">${c.capacity_tb} TB</td>
                                    <td style="padding:6px;text-align:center;">${c.used_tb} TB</td>
                                    <td style="padding:6px;text-align:center;color:${pct > 80 ? 'red' : pct > 60 ? 'orange' : 'green'};">${pct}%</td>
                                    <td style="padding:6px;text-align:center;">RF${c.rf}</td>
                                    <td style="padding:6px;text-align:center;">${c.compression}</td>
                                    <td style="padding:6px;text-align:center;">${c.dedup}</td>
                                </tr>`;
                            }).join('')}
                        </table>`,
                };
            case 'security-compliance':
                return {
                    name: `Security Compliance — ${new Date().toLocaleDateString()}`,
                    content: `
                        <h4>Security Posture</h4>
                        <table style="width:100%;font-size:13px;border-collapse:collapse;">
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px;" class="text-secondary">Cluster</td><td style="padding:8px;">${cluster.name}</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px;" class="text-secondary">Flow Policies</td><td style="padding:8px;">${state.getAll('flow_policies').length} (${state.getAll('flow_policies').filter(p => p.mode === 'applied').length} enforced)</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px;" class="text-secondary">Local Users</td><td style="padding:8px;">${state.getAll('users').length}</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px;" class="text-secondary">AD Connected</td><td style="padding:8px;">${state.getAll('ad_config').some(c => c.connected) ? '✅ Yes' : '❌ No'}</td></tr>
                            <tr><td style="padding:8px;" class="text-secondary">DNS Configured</td><td style="padding:8px;">${cluster.dns?.length > 0 ? '✅ ' + cluster.dns.join(', ') : '❌ Not configured'}</td></tr>
                        </table>`,
                };
            case 'data-protection': {
                const pds = state.protectionDomains;
                const pps = state.getAll('protection_policies');
                const rps = state.getAll('recovery_plans');
                return {
                    name: `Data Protection — ${new Date().toLocaleDateString()}`,
                    content: `
                        <h4>Protection Overview</h4>
                        <table style="width:100%;font-size:13px;border-collapse:collapse;">
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px;" class="text-secondary">PE Protection Domains</td><td style="padding:8px;">${pds.length}</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px;" class="text-secondary">PC Protection Policies</td><td style="padding:8px;">${pps.length}</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px;" class="text-secondary">Recovery Plans</td><td style="padding:8px;">${rps.length}</td></tr>
                            <tr><td style="padding:8px;" class="text-secondary">Protected VMs</td><td style="padding:8px;">${new Set(pds.flatMap(pd => pd.vms || [])).size}</td></tr>
                        </table>
                        <h4 style="margin-top:16px;">Protection Domains</h4>
                        ${pds.map(pd => `<div style="padding:4px 0;font-size:13px;"><strong>${pd.name}</strong> — ${pd.type} (${(pd.vms || []).length} VMs, ${pd.schedule?.interval || 'N/A'})</div>`).join('')}
                        ${pps.length > 0 ? `<h4 style="margin-top:16px;">Leap Policies</h4>
                        ${pps.map(pp => `<div style="padding:4px 0;font-size:13px;"><strong>${pp.name}</strong> — RPO: ${pp.rpo}, Site: ${pp.remote_site}</div>`).join('')}` : ''}`,
                };
            }
            case 'capacity-planning': {
                const totalCpu = hosts.reduce((s, h) => s + h.cpu_cores, 0);
                const usedCpu = vms.filter(v => v.power_state === 'on').reduce((s, v) => s + v.vcpus, 0);
                const totalMem = hosts.reduce((s, h) => s + h.memory_gb, 0);
                const usedMem = vms.filter(v => v.power_state === 'on').reduce((s, v) => s + v.memory_gb, 0);
                return {
                    name: `Capacity Planning — ${new Date().toLocaleDateString()}`,
                    content: `
                        <h4>Resource Utilization</h4>
                        <table style="width:100%;font-size:13px;border-collapse:collapse;">
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px;" class="text-secondary">CPU</td><td style="padding:8px;">${usedCpu} / ${totalCpu} cores (${Math.round(usedCpu / totalCpu * 100)}%)</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px;" class="text-secondary">Memory</td><td style="padding:8px;">${usedMem} / ${totalMem} GB (${Math.round(usedMem / totalMem * 100)}%)</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px;" class="text-secondary">Nodes</td><td style="padding:8px;">${hosts.length}</td></tr>
                            <tr><td style="padding:8px;" class="text-secondary">Total VMs</td><td style="padding:8px;">${vms.length}</td></tr>
                        </table>
                        <h4 style="margin-top:16px;">Recommendations</h4>
                        <ul style="font-size:13px;padding-left:20px;">
                            ${usedCpu / totalCpu > 0.7 ? '<li style="color:orange;">CPU utilization above 70% — consider adding nodes</li>' : '<li style="color:green;">CPU utilization healthy</li>'}
                            ${usedMem / totalMem > 0.7 ? '<li style="color:orange;">Memory utilization above 70% — consider adding RAM or nodes</li>' : '<li style="color:green;">Memory utilization healthy</li>'}
                        </ul>`,
                };
            }
            default:
                return { name: 'Unknown Report', content: '<p>Template not found.</p>' };
        }
    }
}
