import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { toast } from '../components/Toast.js';

/**
 * PC Planning — Runway analysis and what-if capacity scenarios.
 * Shows projected days until resource exhaustion and allows
 * students to simulate adding workloads to see impact.
 */
export class PcPlanningView extends BaseView {
    #scenarios = [];

    async render() {
        const hosts = state.hosts;
        const vms = state.vms;
        const containers = state.containers;

        const totalCpu = hosts.reduce((s, h) => s + h.cpu_cores, 0);
        const totalMem = hosts.reduce((s, h) => s + h.memory_gb, 0);
        const totalStorage = containers.reduce((s, c) => s + c.capacity_tb, 0);

        const usedCpu = vms.filter(v => v.power_state === 'on').reduce((s, v) => s + v.vcpus, 0);
        const usedMem = vms.filter(v => v.power_state === 'on').reduce((s, v) => s + v.memory_gb, 0);
        const usedStorage = containers.reduce((s, c) => s + c.used_tb, 0);

        // Simulate growth rate (5% per month for realistic scenario)
        const growthRate = 0.05;
        const cpuRunway = this.#calcRunway(usedCpu, totalCpu, growthRate);
        const memRunway = this.#calcRunway(usedMem, totalMem, growthRate);
        const storageRunway = this.#calcRunway(usedStorage, totalStorage, growthRate);
        const overallRunway = Math.min(cpuRunway, memRunway, storageRunway);

        const el = document.createElement('div');
        el.className = 'view';

        el.innerHTML = `
            <div class="page-title">
                <h1>Planning</h1>
                <span class="text-secondary text-sm">Capacity runway analysis • ${state.cluster.name}</span>
            </div>

            <!-- Runway Summary -->
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-lg);margin-bottom:var(--space-xl);">
                ${this.#runwayCard('Overall', overallRunway)}
                ${this.#runwayCard('CPU', cpuRunway)}
                ${this.#runwayCard('Memory', memRunway)}
                ${this.#runwayCard('Storage', storageRunway)}
            </div>

            <!-- Resource Details -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-lg);margin-bottom:var(--space-xl);">
                <div class="card">
                    <div class="card-header">Current Utilization</div>
                    <div class="card-body">
                        ${this.#utilizationRow('CPU', usedCpu, totalCpu, 'cores')}
                        ${this.#utilizationRow('Memory', usedMem, totalMem, 'GB')}
                        ${this.#utilizationRow('Storage', usedStorage.toFixed(1), totalStorage.toFixed(0), 'TB')}
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">Cluster Configuration</div>
                    <div class="card-body">
                        <table style="width:100%;font-size:var(--font-size-sm);">
                            <tr><td class="text-secondary" style="padding:4px 8px;">Nodes</td><td style="padding:4px 8px;">${hosts.length}</td></tr>
                            <tr><td class="text-secondary" style="padding:4px 8px;">Cores per Node</td><td style="padding:4px 8px;">${hosts[0]?.cpu_cores || 0}</td></tr>
                            <tr><td class="text-secondary" style="padding:4px 8px;">Memory per Node</td><td style="padding:4px 8px;">${hosts[0]?.memory_gb || 0} GB</td></tr>
                            <tr><td class="text-secondary" style="padding:4px 8px;">Total VMs</td><td style="padding:4px 8px;">${vms.length} (${vms.filter(v => v.power_state === 'on').length} running)</td></tr>
                            <tr><td class="text-secondary" style="padding:4px 8px;">Replication Factor</td><td style="padding:4px 8px;">RF${state.cluster.rf}</td></tr>
                            <tr><td class="text-secondary" style="padding:4px 8px;">Growth Rate</td><td style="padding:4px 8px;">5% / month (simulated)</td></tr>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Runway Chart (simplified bar chart) -->
            <div class="card" style="margin-bottom:var(--space-xl);">
                <div class="card-header">Runway Projection (months)</div>
                <div class="card-body">
                    ${this.#barChart('CPU', cpuRunway)}
                    ${this.#barChart('Memory', memRunway)}
                    ${this.#barChart('Storage', storageRunway)}
                </div>
            </div>

            <!-- What-If Scenarios -->
            <div class="card">
                <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
                    <span>What-If Scenarios</span>
                    <button class="btn btn-primary btn-sm" id="add-scenario-btn">+ Add Workload</button>
                </div>
                <div class="card-body">
                    <p class="text-secondary text-sm" style="margin-bottom:16px;">Simulate adding workloads to see how they impact capacity runway.</p>

                    <div id="scenario-list"></div>

                    <div id="scenario-result" style="margin-top:16px;display:none;">
                        <hr style="border:none;border-top:1px solid var(--border-light);margin-bottom:16px;">
                        <div style="font-weight:600;margin-bottom:8px;">Projected Impact</div>
                        <div id="scenario-impact"></div>
                    </div>
                </div>
            </div>
        `;

        return el;
    }

    afterRender() {
        document.getElementById('add-scenario-btn')?.addEventListener('click', () => this.#addScenario());
        this.#renderScenarios();
    }

    #calcRunway(used, total, monthlyGrowthRate) {
        if (used >= total) return 0;
        if (used <= 0) return 36;
        // months until used * (1+rate)^months >= total
        const months = Math.log(total / used) / Math.log(1 + monthlyGrowthRate);
        return Math.min(Math.round(months), 36);
    }

    #runwayCard(label, months) {
        let color = 'var(--status-good)';
        let status = 'Healthy';
        if (months <= 3) { color = 'var(--status-critical)'; status = 'Critical'; }
        else if (months <= 6) { color = 'var(--status-warning)'; status = 'Warning'; }
        else if (months <= 12) { color = 'var(--prism-blue)'; status = 'OK'; }

        return `<div class="card"><div class="card-body" style="text-align:center;">
            <div style="font-size:32px;font-weight:700;color:${color};">${months}</div>
            <div class="text-secondary text-sm">${label} Runway</div>
            <div style="font-size:var(--font-size-xs);color:${color};font-weight:600;">${status}${months > 12 ? '' : ' — Plan expansion'}</div>
        </div></div>`;
    }

    #utilizationRow(label, used, total, unit) {
        const pct = total > 0 ? Math.round((used / total) * 100) : 0;
        const cls = pct > 80 ? 'critical' : pct > 60 ? 'warning' : '';
        return `
            <div style="margin-bottom:16px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                    <span class="text-sm" style="font-weight:600;">${label}</span>
                    <span class="text-sm text-secondary">${used} / ${total} ${unit} (${pct}%)</span>
                </div>
                <div class="capacity-bar" style="height:10px;"><div class="fill ${cls}" style="width:${pct}%;"></div></div>
            </div>
        `;
    }

    #barChart(label, months) {
        const maxMonths = 36;
        const pct = Math.min((months / maxMonths) * 100, 100);
        let color = 'var(--status-good)';
        if (months <= 3) color = 'var(--status-critical)';
        else if (months <= 6) color = 'var(--status-warning)';
        else if (months <= 12) color = 'var(--status-info)';

        return `
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                <span style="min-width:70px;font-size:13px;font-weight:600;">${label}</span>
                <div style="flex:1;background:var(--gray-100);border-radius:4px;height:24px;position:relative;">
                    <div style="width:${pct}%;height:100%;background:${color};border-radius:4px;transition:width 0.5s;"></div>
                    <span style="position:absolute;right:8px;top:3px;font-size:12px;font-weight:600;">${months} months</span>
                </div>
            </div>
        `;
    }

    #addScenario() {
        this.#scenarios.push({ name: `Workload ${this.#scenarios.length + 1}`, vcpus: 4, memory_gb: 8, storage_tb: 0.1, count: 10 });
        this.#renderScenarios();
        this.#updateImpact();
    }

    #renderScenarios() {
        const list = document.getElementById('scenario-list');
        if (!list) return;

        if (this.#scenarios.length === 0) {
            list.innerHTML = '<div class="text-secondary text-sm">No scenarios added yet.</div>';
            return;
        }

        list.innerHTML = this.#scenarios.map((s, i) => `
            <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr 1fr auto;gap:8px;align-items:center;margin-bottom:8px;">
                <input class="form-input scenario-field" data-idx="${i}" data-field="name" value="${s.name}" placeholder="Name" style="font-size:12px;padding:4px 8px;" />
                <div style="display:flex;align-items:center;gap:4px;">
                    <input class="form-input scenario-field" data-idx="${i}" data-field="vcpus" type="number" min="1" value="${s.vcpus}" style="font-size:12px;padding:4px 8px;" />
                    <span class="text-secondary" style="font-size:11px;">vCPU</span>
                </div>
                <div style="display:flex;align-items:center;gap:4px;">
                    <input class="form-input scenario-field" data-idx="${i}" data-field="memory_gb" type="number" min="1" value="${s.memory_gb}" style="font-size:12px;padding:4px 8px;" />
                    <span class="text-secondary" style="font-size:11px;">GB</span>
                </div>
                <div style="display:flex;align-items:center;gap:4px;">
                    <input class="form-input scenario-field" data-idx="${i}" data-field="storage_tb" type="number" min="0.01" step="0.01" value="${s.storage_tb}" style="font-size:12px;padding:4px 8px;" />
                    <span class="text-secondary" style="font-size:11px;">TB</span>
                </div>
                <div style="display:flex;align-items:center;gap:4px;">
                    <input class="form-input scenario-field" data-idx="${i}" data-field="count" type="number" min="1" value="${s.count}" style="font-size:12px;padding:4px 8px;" />
                    <span class="text-secondary" style="font-size:11px;">VMs</span>
                </div>
                <button class="btn btn-secondary btn-sm remove-scenario-btn" data-idx="${i}" style="color:var(--status-critical);padding:2px 8px;">✕</button>
            </div>
        `).join('');

        // Wire events
        list.querySelectorAll('.scenario-field').forEach(input => {
            input.addEventListener('change', () => {
                const idx = Number(input.dataset.idx);
                const field = input.dataset.field;
                this.#scenarios[idx][field] = field === 'name' ? input.value : Number(input.value);
                this.#updateImpact();
            });
        });
        list.querySelectorAll('.remove-scenario-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.#scenarios.splice(Number(btn.dataset.idx), 1);
                this.#renderScenarios();
                this.#updateImpact();
            });
        });
    }

    #updateImpact() {
        const resultDiv = document.getElementById('scenario-result');
        const impactDiv = document.getElementById('scenario-impact');
        if (!resultDiv || !impactDiv) return;

        if (this.#scenarios.length === 0) {
            resultDiv.style.display = 'none';
            return;
        }
        resultDiv.style.display = '';

        const hosts = state.hosts;
        const vms = state.vms;
        const containers = state.containers;
        const totalCpu = hosts.reduce((s, h) => s + h.cpu_cores, 0);
        const totalMem = hosts.reduce((s, h) => s + h.memory_gb, 0);
        const totalStorage = containers.reduce((s, c) => s + c.capacity_tb, 0);

        let addCpu = 0, addMem = 0, addStorage = 0, addVMs = 0;
        for (const s of this.#scenarios) {
            addCpu += (s.vcpus || 0) * (s.count || 0);
            addMem += (s.memory_gb || 0) * (s.count || 0);
            addStorage += (s.storage_tb || 0) * (s.count || 0);
            addVMs += s.count || 0;
        }

        const currentCpu = vms.filter(v => v.power_state === 'on').reduce((s, v) => s + v.vcpus, 0);
        const currentMem = vms.filter(v => v.power_state === 'on').reduce((s, v) => s + v.memory_gb, 0);
        const currentStorage = containers.reduce((s, c) => s + c.used_tb, 0);

        const newCpu = currentCpu + addCpu;
        const newMem = currentMem + addMem;
        const newStorage = currentStorage + addStorage;

        const cpuPct = totalCpu > 0 ? Math.round((newCpu / totalCpu) * 100) : 0;
        const memPct = totalMem > 0 ? Math.round((newMem / totalMem) * 100) : 0;
        const storagePct = totalStorage > 0 ? Math.round((newStorage / totalStorage) * 100) : 0;

        const newCpuRunway = this.#calcRunway(newCpu, totalCpu, 0.05);
        const newMemRunway = this.#calcRunway(newMem, totalMem, 0.05);
        const newStorageRunway = this.#calcRunway(newStorage, totalStorage, 0.05);

        const feasible = cpuPct <= 100 && memPct <= 100 && storagePct <= 100;

        impactDiv.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:12px;">
                ${this.#impactItem('CPU', cpuPct, newCpuRunway)}
                ${this.#impactItem('Memory', memPct, newMemRunway)}
                ${this.#impactItem('Storage', storagePct, newStorageRunway)}
            </div>
            <div style="padding:12px;border-radius:4px;background:${feasible ? 'var(--status-good-bg, #e8f5e9)' : 'var(--status-critical-bg, #ffebee)'};font-size:13px;">
                ${feasible
                    ? `✅ <strong>Feasible.</strong> Adding ${addVMs} VMs (+${addCpu} vCPU, +${addMem} GB RAM, +${addStorage.toFixed(1)} TB). Min runway: ${Math.min(newCpuRunway, newMemRunway, newStorageRunway)} months.`
                    : `❌ <strong>Not feasible.</strong> Adding ${addVMs} VMs exceeds available capacity. Consider adding nodes or reducing workload.`
                }
            </div>
        `;
    }

    #impactItem(label, pct, runway) {
        const color = pct > 90 ? 'var(--status-critical)' : pct > 70 ? 'var(--status-warning)' : 'var(--status-good)';
        return `<div style="text-align:center;">
            <div style="font-size:20px;font-weight:700;color:${color};">${pct}%</div>
            <div class="text-secondary text-sm">${label} (${runway}mo runway)</div>
        </div>`;
    }
}
