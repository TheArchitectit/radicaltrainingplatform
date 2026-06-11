import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { Wizard } from '../components/Wizard.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

/**
 * GPU Configuration — Passthrough, vGPU profiles, MIG.
 * Exam traps: MIG only A100/H100, NOT T4/L40S. NVLink only A100/H100.
 */

const GPU_MODELS = [
    { id: 'A100', name: 'NVIDIA A100 SXM', vram_gb: 80, mig: true, nvlink: true, pcie: 'Gen5', max_mig: 7, max_fp16_params: '40B' },
    { id: 'H100', name: 'NVIDIA H100 SXM', vram_gb: 80, mig: true, nvlink: true, pcie: 'Gen5', max_mig: 7, max_fp16_params: '40B' },
    { id: 'L40S', name: 'NVIDIA L40S', vram_gb: 48, mig: false, nvlink: false, pcie: 'Gen5', max_mig: 0, max_fp16_params: '24B' },
    { id: 'T4', name: 'NVIDIA T4', vram_gb: 16, mig: false, nvlink: false, pcie: 'Gen3', max_mig: 0, max_fp16_params: '8B' },
    { id: 'V100', name: 'NVIDIA V100', vram_gb: 32, mig: false, nvlink: false, pcie: 'Gen3', max_mig: 0, max_fp16_params: '16B' },
];

export class AiGpuView extends BaseView {
    #gpuTable = null;
    #unsubs = [];
    #activeTab = 'inventory';

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        const gpus = state.getAll('gpu_devices');
        const totalVram = gpus.reduce((s, g) => s + (GPU_MODELS.find(m => m.id === g.model)?.vram_gb || 0), 0);
        const migCapable = gpus.filter(g => ['A100', 'H100'].includes(g.model));

        el.innerHTML = `
            <div class="page-title">
                <h1>🎮 GPU Configuration</h1>
                <button class="btn btn-primary" id="add-gpu-btn">+ Add GPU Device</button>
            </div>

            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-lg);margin-bottom:var(--space-xl);">
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${gpus.length}</div>
                    <div class="text-secondary text-sm">Total GPUs</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${totalVram} GB</div>
                    <div class="text-secondary text-sm">Total VRAM</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--status-good);">${migCapable.length}</div>
                    <div class="text-secondary text-sm">MIG-Capable</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${gpus.filter(g => g.mode === 'passthrough').length} / ${gpus.filter(g => g.mode === 'mig').length}</div>
                    <div class="text-secondary text-sm">Passthrough / MIG</div>
                </div></div>
            </div>

            <!-- Tabs -->
            <div style="display:flex;gap:0;margin-bottom:var(--space-lg);border-bottom:2px solid var(--border-light);">
                <button class="gpu-tab active" data-tab="inventory" style="padding:10px 24px;border:none;background:none;cursor:pointer;font-weight:600;border-bottom:2px solid var(--prism-blue);margin-bottom:-2px;">GPU Inventory</button>
                <button class="gpu-tab" data-tab="specs" style="padding:10px 24px;border:none;background:none;cursor:pointer;font-weight:500;color:var(--text-secondary);margin-bottom:-2px;">GPU Specifications</button>
                <button class="gpu-tab" data-tab="modes" style="padding:10px 24px;border:none;background:none;cursor:pointer;font-weight:500;color:var(--text-secondary);margin-bottom:-2px;">Access Modes</button>
            </div>

            <div id="inventory-panel"></div>
            <div id="specs-panel" style="display:none;"></div>
            <div id="modes-panel" style="display:none;"></div>
        `;

        // GPU inventory table
        this.#gpuTable = new EntityTable({
            columns: [
                { key: 'name', label: 'GPU', sortable: true, render: (v) => `<strong>${v}</strong>` },
                { key: 'model', label: 'Model', sortable: true, render: (v) => {
                    const spec = GPU_MODELS.find(m => m.id === v);
                    return `${spec?.name || v} (${spec?.vram_gb}GB)`;
                }},
                { key: 'host', label: 'Host Node', sortable: true },
                { key: 'mode', label: 'Mode', sortable: true, render: (v) => {
                    const colors = { passthrough: 'good', mig: 'info', vgpu: 'warning' };
                    return `<span class="status-badge ${colors[v] || 'info'}"><span class="dot"></span>${v.toUpperCase()}</span>`;
                }},
                { key: 'mig_partitions', label: 'MIG Partitions', render: (v, row) => row.mode === 'mig' ? `${v || 0} active` : '—' },
                { key: 'assigned_to', label: 'Assigned To', render: (v) => v || '<span class="text-secondary">Unassigned</span>' },
            ],
            data: gpus,
            searchKeys: ['name', 'model', 'host'],
            emptyMessage: 'No GPU devices configured. Add GPUs to enable AI workloads.',
            emptyIcon: '🎮',
            actions: [
                { label: 'Set Passthrough', onClick: (g) => this.#setMode(g, 'passthrough') },
                { label: 'Enable MIG', onClick: (g) => this.#setMode(g, 'mig') },
                { label: 'Remove', danger: true, onClick: (g) => this.#removeGpu(g) },
            ],
        });

        el.querySelector('#inventory-panel').appendChild(this.#gpuTable.render());

        // GPU Specifications reference
        el.querySelector('#specs-panel').innerHTML = `
            <div class="card">
                <div class="card-header">GPU Specifications Matrix</div>
                <div class="card-body" style="padding:0;">
                    <table style="width:100%;border-collapse:collapse;font-size:var(--font-size-sm);">
                        <thead><tr style="background:var(--bg-secondary);border-bottom:2px solid var(--border-light);">
                            <th style="padding:10px 16px;text-align:left;">GPU</th>
                            <th style="padding:10px 16px;text-align:left;">VRAM</th>
                            <th style="padding:10px 16px;text-align:left;">Max FP16</th>
                            <th style="padding:10px 16px;text-align:left;">MIG</th>
                            <th style="padding:10px 16px;text-align:left;">NVLink</th>
                            <th style="padding:10px 16px;text-align:left;">PCIe</th>
                            <th style="padding:10px 16px;text-align:left;">Best For</th>
                        </tr></thead>
                        <tbody>
                            ${GPU_MODELS.map(g => `
                                <tr style="border-bottom:1px solid var(--border-light);">
                                    <td style="padding:8px 16px;"><strong>${g.name}</strong></td>
                                    <td>${g.vram_gb} GB</td>
                                    <td>${g.max_fp16_params}</td>
                                    <td>${g.mig ? `✅ ${g.max_mig} partitions` : '❌'}</td>
                                    <td>${g.nvlink ? '✅ 900 GB/s' : '❌ PCIe only'}</td>
                                    <td>${g.pcie}</td>
                                    <td>${g.id === 'A100' ? 'Multi-tenant, large models' : g.id === 'H100' ? 'Max throughput, FP8' : g.id === 'L40S' ? 'Single model inference' : g.id === 'T4' ? 'Small models, cost-effective' : 'Legacy deployments'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Access Modes reference
        el.querySelector('#modes-panel').innerHTML = `
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-lg);">
                <div class="card">
                    <div class="card-header">GPU Passthrough</div>
                    <div class="card-body" style="font-size:var(--font-size-sm);">
                        <p><strong>Entire GPU</strong> allocated exclusively to one VM/pod.</p>
                        <ul style="padding-left:16px;">
                            <li>Requires IOMMU/VT-d in BIOS</li>
                            <li>AHV GPU passthrough enabled</li>
                            <li>PCI device assigned to VM</li>
                            <li>No sharing between workloads</li>
                            <li>Full GPU performance</li>
                        </ul>
                        <p style="margin-top:8px;"><strong>Supported:</strong> All GPUs (A100, H100, L40S, T4, V100)</p>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">Multi-Instance GPU (MIG)</div>
                    <div class="card-body" style="font-size:var(--font-size-sm);">
                        <p><strong>Partitions</strong> single GPU into up to 7 isolated instances.</p>
                        <ul style="padding-left:16px;">
                            <li>Each partition: dedicated VRAM, compute, bandwidth</li>
                            <li>Isolated memory pools (no cross-partition access)</li>
                            <li>A100 80GB → 7 × ~10GB partitions</li>
                            <li>Ideal for multi-tenant small models</li>
                        </ul>
                        <div style="margin-top:8px;padding:8px;background:var(--status-critical-bg);border-radius:4px;">
                            <strong>⚠️ ONLY A100 & H100</strong><br>
                            T4 and L40S do NOT support MIG!
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">vGPU (Virtual GPU)</div>
                    <div class="card-body" style="font-size:var(--font-size-sm);">
                        <p><strong>Time-sliced sharing</strong> of GPU between VMs.</p>
                        <ul style="padding-left:16px;">
                            <li>Requires NVIDIA vGPU license</li>
                            <li>Lower isolation than MIG</li>
                            <li>Good for VDI workloads</li>
                            <li>Not commonly used for NAI inference</li>
                        </ul>
                        <p class="text-secondary" style="margin-top:8px;">Limited usage in NAI context. Prefer Passthrough or MIG for inference.</p>
                    </div>
                </div>
            </div>

            <div class="card" style="margin-top:var(--space-lg);">
                <div class="card-header">🎓 GPU Exam Traps</div>
                <div class="card-body">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:var(--font-size-sm);">
                        <div>
                            <p><strong>❌ "Use MIG on L40S for multiple small models"</strong><br>FALSE — L40S doesn't support MIG. Only A100/H100.</p>
                            <p><strong>❌ "Deploy 70B FP16 on 4× T4 (64GB total)"</strong><br>FALSE — T4 lacks NVLink. Tensor parallelism over PCIe is too slow.</p>
                            <p><strong>❌ "Any GPU supports all modes"</strong><br>FALSE — MIG: only A100/H100. NVLink: only A100/H100.</p>
                        </div>
                        <div>
                            <p><strong>❌ "GPU VRAM = total usable for model"</strong><br>FALSE — Must account for KV cache, activations, batch overhead (add 30-50%).</p>
                            <p><strong>❌ "A100 and H100 same performance"</strong><br>FALSE — H100 has Transformer Engine (FP8 native), 2-3× throughput of A100.</p>
                            <p><strong>❌ "NVLink bandwidth same as PCIe"</strong><br>FALSE — NVLink 4.0: 900 GB/s vs PCIe Gen5: ~128 GB/s (7× faster).</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return el;
    }

    afterRender() {
        document.getElementById('add-gpu-btn')?.addEventListener('click', () => this.#openAddGpuWizard());

        document.querySelectorAll('.gpu-tab').forEach(tab => {
            tab.addEventListener('click', () => this.#switchTab(tab.dataset.tab));
        });

        const refresh = () => this.#gpuTable?.setData(state.getAll('gpu_devices'));
        const u1 = bus.on('gpu_devices:created', refresh);
        const u2 = bus.on('gpu_devices:updated', refresh);
        const u3 = bus.on('gpu_devices:deleted', refresh);
        this.#unsubs.push(u1, u2, u3);
    }

    destroy() { this.#gpuTable?.destroy(); this.#unsubs.forEach(u => u()); }

    #switchTab(tab) {
        document.querySelectorAll('.gpu-tab').forEach(t => {
            const isActive = t.dataset.tab === tab;
            t.classList.toggle('active', isActive);
            t.style.borderBottom = isActive ? '2px solid var(--prism-blue)' : 'none';
            t.style.fontWeight = isActive ? '600' : '500';
            t.style.color = isActive ? 'var(--text-primary)' : 'var(--text-secondary)';
        });
        ['inventory', 'specs', 'modes'].forEach(p => {
            const panel = document.getElementById(`${p}-panel`);
            if (panel) panel.style.display = p === tab ? '' : 'none';
        });
    }

    async #setMode(g, mode) {
        const spec = GPU_MODELS.find(m => m.id === g.model);
        if (mode === 'mig' && !spec?.mig) {
            toast.error(`${spec?.name || g.model} does NOT support MIG. Only A100 and H100 support Multi-Instance GPU.`);
            return;
        }
        await state.update('gpu_devices', g.uuid, {
            mode,
            mig_partitions: mode === 'mig' ? spec.max_mig : 0,
        });
        toast.success(`GPU "${g.name}" set to ${mode.toUpperCase()} mode${mode === 'mig' ? ` (${spec.max_mig} partitions)` : ''}`);
    }

    async #removeGpu(g) {
        const ok = await confirm({ title: 'Remove GPU', message: `Remove <strong>${g.name}</strong> (${g.model})?`, confirmLabel: 'Remove', danger: true });
        if (ok) { await state.remove('gpu_devices', g.uuid); toast.success(`GPU "${g.name}" removed`); }
    }

    #openAddGpuWizard() {
        const hosts = state.getAll('hosts');
        const wizard = new Wizard({
            title: 'Add GPU Device',
            initialData: { name: '', model: 'A100', host: hosts[0]?.name || 'Node-1', mode: 'passthrough' },
            steps: [{
                label: 'GPU Configuration',
                render: (data) => `
                    <div class="form-group"><label class="form-label">GPU Name</label>
                        <input class="form-input" data-field="name" value="${data.name}" placeholder="e.g., GPU-Node1-Slot0" /></div>
                    <div class="form-group"><label class="form-label">GPU Model</label>
                        <select class="form-input" data-field="model">
                            ${GPU_MODELS.map(g => `<option value="${g.id}" ${g.id === data.model ? 'selected' : ''}>${g.name} (${g.vram_gb}GB) ${g.mig ? '— MIG ✅' : ''}</option>`).join('')}
                        </select></div>
                    <div class="form-group"><label class="form-label">Host Node</label>
                        <input class="form-input" data-field="host" value="${data.host}" placeholder="Node hostname" /></div>
                    <div class="form-group"><label class="form-label">Access Mode</label>
                        <select class="form-input" data-field="mode">
                            <option value="passthrough" ${data.mode === 'passthrough' ? 'selected' : ''}>Passthrough — Entire GPU to one VM</option>
                            <option value="mig" ${data.mode === 'mig' ? 'selected' : ''}>MIG — Multi-Instance (A100/H100 only)</option>
                            <option value="vgpu" ${data.mode === 'vgpu' ? 'selected' : ''}>vGPU — Virtual GPU (time-sliced)</option>
                        </select></div>
                    <div class="text-secondary text-sm" style="margin-top:8px;">
                        Requirements: IOMMU/VT-d enabled in BIOS, AHV GPU passthrough configured, PCI device assigned to VM.
                    </div>
                `,
                validate: (data) => {
                    const e = [];
                    if (!data.name?.trim()) e.push('GPU name is required');
                    const spec = GPU_MODELS.find(m => m.id === data.model);
                    if (data.mode === 'mig' && !spec?.mig) e.push(`${spec?.name} does NOT support MIG. Only A100 and H100 support MIG.`);
                    return e;
                },
            }],
            onComplete: async (data) => {
                const spec = GPU_MODELS.find(m => m.id === data.model);
                await state.create('gpu_devices', {
                    name: data.name.trim(),
                    model: data.model,
                    host: data.host.trim(),
                    mode: data.mode,
                    mig_partitions: data.mode === 'mig' ? spec.max_mig : 0,
                    assigned_to: null,
                });
                toast.success(`GPU "${data.name}" added in ${data.mode.toUpperCase()} mode`);
            },
        });
        wizard.open();
    }
}
