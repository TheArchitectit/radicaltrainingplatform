import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { Wizard } from '../components/Wizard.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

/**
 * NAI Deployment + Endpoint Management.
 * Pipeline: NKP → GPU Operator → CSI → NAI Operator → Endpoints
 * Exam traps: wrong install order causes cascade failures, GGUF unsupported.
 */

const MODELS = [
    { id: 'llama-2-7b-chat', name: 'Llama 2 7B Chat', params: '7B', source: 'Hugging Face' },
    { id: 'llama-2-13b-chat', name: 'Llama 2 13B Chat', params: '13B', source: 'Hugging Face' },
    { id: 'llama-2-70b-chat', name: 'Llama 2 70B Chat', params: '70B', source: 'Hugging Face' },
    { id: 'mistral-7b-instruct', name: 'Mistral 7B Instruct', params: '7B', source: 'Hugging Face' },
    { id: 'codellama-34b', name: 'Code Llama 34B', params: '34B', source: 'Hugging Face' },
];

const ENGINES = [
    { id: 'vllm', name: 'vLLM', desc: 'Python-based, broadest LLM support, PagedAttention. Drop-in OpenAI API replacement.' },
    { id: 'tensorrt-llm', name: 'TensorRT-LLM', desc: 'NVIDIA compiled engine. Max performance but requires model conversion. Narrower support.' },
];

const FORMATS = [
    { id: 'safetensors', name: 'SafeTensors (FP16/BF16)', vllm: true, trt: false },
    { id: 'gptq', name: 'GPTQ (INT4/INT8)', vllm: true, trt: false },
    { id: 'awq', name: 'AWQ (INT4)', vllm: true, trt: false },
    { id: 'gguf', name: 'GGUF ❌ (NOT supported)', vllm: false, trt: false },
];

export class AiNaiView extends BaseView {
    #endpointTable = null;
    #unsubs = [];
    #activeTab = 'endpoints';

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        const endpoints = state.getAll('nai_endpoints');
        const gpus = state.getAll('gpu_devices');

        el.innerHTML = `
            <div class="page-title">
                <h1>🤖 NAI — Nutanix AI Infrastructure</h1>
                <button class="btn btn-primary" id="create-endpoint-btn">+ Create Endpoint</button>
            </div>

            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-lg);margin-bottom:var(--space-xl);">
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${endpoints.length}</div>
                    <div class="text-secondary text-sm">Endpoints</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--status-good);">${endpoints.filter(e => e.status === 'running').length}</div>
                    <div class="text-secondary text-sm">Running</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${endpoints.reduce((s, e) => s + (e.replicas || 1), 0)}</div>
                    <div class="text-secondary text-sm">Total Replicas</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${gpus.length}</div>
                    <div class="text-secondary text-sm">Available GPUs</div>
                </div></div>
            </div>

            <!-- Tabs -->
            <div style="display:flex;gap:0;margin-bottom:var(--space-lg);border-bottom:2px solid var(--border-light);">
                <button class="nai-tab active" data-tab="endpoints" style="padding:10px 24px;border:none;background:none;cursor:pointer;font-weight:600;border-bottom:2px solid var(--prism-blue);margin-bottom:-2px;">Endpoints</button>
                <button class="nai-tab" data-tab="pipeline" style="padding:10px 24px;border:none;background:none;cursor:pointer;font-weight:500;color:var(--text-secondary);margin-bottom:-2px;">Deployment Pipeline</button>
                <button class="nai-tab" data-tab="formats" style="padding:10px 24px;border:none;background:none;cursor:pointer;font-weight:500;color:var(--text-secondary);margin-bottom:-2px;">Model Formats</button>
            </div>

            <div id="endpoints-panel"></div>
            <div id="pipeline-panel" style="display:none;"></div>
            <div id="formats-panel" style="display:none;"></div>
        `;

        // Endpoints table
        this.#endpointTable = new EntityTable({
            columns: [
                { key: 'name', label: 'Endpoint', sortable: true, render: (v) => `<strong>${v}</strong>` },
                { key: 'model', label: 'Model', sortable: true },
                { key: 'engine', label: 'Engine', render: (v) => v === 'vllm' ? 'vLLM' : 'TensorRT-LLM' },
                { key: 'format', label: 'Format' },
                { key: 'gpu_count', label: 'GPUs', render: (v) => `${v}× GPU` },
                { key: 'replicas', label: 'Replicas', render: (v, row) => `${row.min_replicas}-${row.max_replicas} (current: ${v})` },
                {
                    key: 'status', label: 'Status', sortable: true,
                    render: (v) => {
                        const cls = { running: 'good', deploying: 'warning', error: 'critical', stopped: 'info' }[v] || 'info';
                        return `<span class="status-badge ${cls}"><span class="dot"></span>${v}</span>`;
                    }
                },
            ],
            data: endpoints,
            searchKeys: ['name', 'model'],
            emptyMessage: 'No NAI endpoints deployed. Create an endpoint to serve inference.',
            emptyIcon: '🤖',
            actions: [
                { label: 'Scale Up', onClick: (e) => this.#scale(e, 1) },
                { label: 'Scale Down', onClick: (e) => this.#scale(e, -1) },
                { label: 'View API', onClick: (e) => this.#showApi(e) },
                { label: 'Delete', danger: true, onClick: (e) => this.#deleteEndpoint(e) },
            ],
        });

        el.querySelector('#endpoints-panel').appendChild(this.#endpointTable.render());

        // Pipeline reference
        el.querySelector('#pipeline-panel').innerHTML = `
            <div class="card">
                <div class="card-header">NAI Deployment Pipeline (CRITICAL ORDER)</div>
                <div class="card-body">
                    <div style="display:flex;gap:16px;align-items:stretch;">
                        ${[
                            { step: '1', title: 'NKP Cluster', desc: 'Healthy Kubernetes cluster with GPU-enabled worker nodes. 3+ master nodes for HA.', icon: '☸️' },
                            { step: '2', title: 'GPU Operator', desc: 'NVIDIA device plugin + drivers. Registers nvidia.com/gpu resources. Makes GPUs visible to scheduler.', icon: '🔌' },
                            { step: '3', title: 'CSI Driver', desc: 'Nutanix storage integration. Default StorageClass required. RWO (Volumes) + RWX (Files).', icon: '💾' },
                            { step: '4', title: 'NAI Operator', desc: 'Manages CRDs for endpoints. Via NKP App Catalog (NKP) or kubectl+Helm (vanilla K8s).', icon: '🤖' },
                            { step: '5', title: 'Endpoints', desc: 'Model serving pods. Select model, engine (vLLM/TensorRT), precision, replicas.', icon: '🎯' },
                        ].map((s, i) => `
                            <div style="flex:1;padding:16px;background:var(--bg-secondary);border-radius:8px;text-align:center;position:relative;">
                                <div style="font-size:32px;">${s.icon}</div>
                                <div style="font-weight:700;margin:8px 0;font-size:var(--font-size-sm);">Step ${s.step}: ${s.title}</div>
                                <p class="text-secondary" style="font-size:12px;">${s.desc}</p>
                                ${i < 4 ? '<div style="position:absolute;right:-14px;top:50%;transform:translateY(-50%);font-size:20px;z-index:1;">→</div>' : ''}
                            </div>
                        `).join('')}
                    </div>
                    <div style="margin-top:16px;padding:12px;background:var(--status-critical-bg);border-radius:6px;font-size:var(--font-size-sm);">
                        <strong>⚠️ Exam Trap:</strong> Installing NAI Operator <em>before</em> GPU Operator → GPU detection failure.
                        Wrong order causes cascading failures. Always follow: NKP → GPU Operator → CSI → NAI Operator → Endpoints.
                    </div>
                    <div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:var(--font-size-sm);">
                        <div style="padding:12px;background:var(--status-info-bg);border-radius:6px;">
                            <strong>NKP Installation:</strong> One-click via NKP App Catalog (GUI). Validated compatibility.
                        </div>
                        <div style="padding:12px;background:var(--status-warning-bg);border-radius:6px;">
                            <strong>Non-NKP (vanilla K8s):</strong> Manual kubectl + Helm. Must install CRDs, GPU Operator, CSI, manage versions manually. NOT via App Catalog.
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Model Formats reference
        el.querySelector('#formats-panel').innerHTML = `
            <div class="card">
                <div class="card-header">Model Format Compatibility</div>
                <div class="card-body" style="padding:0;">
                    <table style="width:100%;border-collapse:collapse;font-size:var(--font-size-sm);">
                        <thead><tr style="background:var(--bg-secondary);border-bottom:2px solid var(--border-light);">
                            <th style="padding:10px 16px;text-align:left;">Format</th>
                            <th style="padding:10px 16px;text-align:left;">vLLM</th>
                            <th style="padding:10px 16px;text-align:left;">TensorRT-LLM</th>
                            <th style="padding:10px 16px;text-align:left;">Notes</th>
                        </tr></thead>
                        <tbody>
                            ${FORMATS.map(f => `
                                <tr style="border-bottom:1px solid var(--border-light);">
                                    <td style="padding:8px 16px;"><strong>${f.name}</strong></td>
                                    <td>${f.vllm ? '✅ Native' : '❌'}</td>
                                    <td>${f.trt ? '✅' : f.id === 'gguf' ? '❌' : '⚠️ Needs conversion'}</td>
                                    <td class="text-secondary">${f.id === 'safetensors' ? 'Industry standard, recommended' : f.id === 'gptq' ? 'Quantized, popular for INT4/INT8' : f.id === 'awq' ? 'Newer quantization, INT4' : '⚠️ For llama.cpp only — NOT vLLM!'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="card" style="margin-top:var(--space-lg);">
                <div class="card-header">🎓 NAI Exam Traps</div>
                <div class="card-body">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:var(--font-size-sm);">
                        <div>
                            <p><strong>❌ "Upload GGUF model to vLLM"</strong><br>ValueError: Unsupported format. Convert to GPTQ/AWQ/SafeTensors first.</p>
                            <p><strong>❌ "NAI maintains conversation server-side"</strong><br>FALSE — API is stateless. Client sends full messages array each turn.</p>
                            <p><strong>❌ "Use NKP App Catalog on vanilla K8s"</strong><br>App Catalog = NKP only. Non-NKP: kubectl + Helm.</p>
                        </div>
                        <div>
                            <p><strong>❌ "max_tokens can exceed context window"</strong><br>FALSE — prompt_tokens + max_tokens ≤ context_window or request fails.</p>
                            <p><strong>❌ "OOMKilled = GPU memory full"</strong><br>OOMKilled = system RAM, not GPU VRAM. Increase pod memory limit.</p>
                            <p><strong>❌ "Rotate compromised key on schedule"</strong><br>IMMEDIATE revocation required. Don't wait for scheduled rotation.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return el;
    }

    afterRender() {
        document.getElementById('create-endpoint-btn')?.addEventListener('click', () => this.#openEndpointWizard());

        document.querySelectorAll('.nai-tab').forEach(tab => {
            tab.addEventListener('click', () => this.#switchTab(tab.dataset.tab));
        });

        const refresh = () => this.#endpointTable?.setData(state.getAll('nai_endpoints'));
        const u1 = bus.on('nai_endpoints:created', refresh);
        const u2 = bus.on('nai_endpoints:updated', refresh);
        const u3 = bus.on('nai_endpoints:deleted', refresh);
        this.#unsubs.push(u1, u2, u3);
    }

    destroy() { this.#endpointTable?.destroy(); this.#unsubs.forEach(u => u()); }

    #switchTab(tab) {
        document.querySelectorAll('.nai-tab').forEach(t => {
            const isActive = t.dataset.tab === tab;
            t.classList.toggle('active', isActive);
            t.style.borderBottom = isActive ? '2px solid var(--prism-blue)' : 'none';
            t.style.fontWeight = isActive ? '600' : '500';
            t.style.color = isActive ? 'var(--text-primary)' : 'var(--text-secondary)';
        });
        ['endpoints', 'pipeline', 'formats'].forEach(p => {
            const panel = document.getElementById(`${p}-panel`);
            if (panel) panel.style.display = p === tab ? '' : 'none';
        });
    }

    async #scale(e, delta) {
        const newReplicas = e.replicas + delta;
        if (newReplicas < e.min_replicas) { toast.error(`Cannot scale below minimum replicas (${e.min_replicas})`); return; }
        if (newReplicas > e.max_replicas) { toast.error(`Cannot scale above maximum replicas (${e.max_replicas})`); return; }
        await state.update('nai_endpoints', e.uuid, { replicas: newReplicas });
        toast.success(`Endpoint "${e.name}" scaled to ${newReplicas} replicas`);
    }

    #showApi(e) {
        const url = `https://${e.name}.nai.ntnxlab.local/v1`;
        toast.info(`API: ${url}/chat/completions\nAuth: Bearer <API_KEY>\nModel: ${e.model}`);
    }

    async #deleteEndpoint(e) {
        const ok = await confirm({ title: 'Delete Endpoint', message: `Delete <strong>${e.name}</strong>? All serving pods will be terminated.`, confirmLabel: 'Delete', danger: true });
        if (ok) { await state.remove('nai_endpoints', e.uuid); toast.success(`Endpoint "${e.name}" deleted`); }
    }

    #openEndpointWizard() {
        const gpus = state.getAll('gpu_devices');
        if (gpus.length === 0) { toast.warning('Add GPU devices first (GPU Configuration page)'); return; }

        const wizard = new Wizard({
            title: 'Create NAI Inference Endpoint',
            initialData: { name: '', model: MODELS[0].id, engine: 'vllm', format: 'safetensors', gpu_count: 1, min_replicas: 1, max_replicas: 3, api_key: '' },
            steps: [
                {
                    label: 'Model',
                    render: (data) => `
                        <div class="form-group"><label class="form-label">Endpoint Name</label>
                            <input class="form-input" data-field="name" value="${data.name}" placeholder="e.g., llama-prod" /></div>
                        <div class="form-group"><label class="form-label">Model</label>
                            <select class="form-input" data-field="model">
                                ${MODELS.map(m => `<option value="${m.id}" ${m.id === data.model ? 'selected' : ''}>${m.name} (${m.params}) — ${m.source}</option>`).join('')}
                            </select></div>
                        <div class="form-group"><label class="form-label">Model Source</label>
                            <div class="text-secondary text-sm" style="padding:8px;background:var(--bg-secondary);border-radius:4px;">
                                Sources: Hugging Face Hub (HF API token), NVIDIA NGC (NGC API token), or Nutanix Files/Objects (external storage).
                                Configure tokens in NAI Settings → Model Repository.
                            </div></div>
                    `,
                    validate: (data) => {
                        const e = [];
                        if (!data.name?.trim()) e.push('Endpoint name is required');
                        return e;
                    },
                },
                {
                    label: 'Engine & Format',
                    render: (data) => `
                        <div class="form-group"><label class="form-label">Inference Engine</label>
                            <select class="form-input" data-field="engine">
                                ${ENGINES.map(e => `<option value="${e.id}" ${e.id === data.engine ? 'selected' : ''}>${e.name}</option>`).join('')}
                            </select>
                            <div class="text-secondary text-sm" style="margin-top:4px;" id="engine-desc">
                                ${ENGINES.find(e => e.id === data.engine)?.desc}
                            </div></div>
                        <div class="form-group"><label class="form-label">Model Format / Quantization</label>
                            <select class="form-input" data-field="format" id="format-select">
                                ${FORMATS.map(f => `<option value="${f.id}" ${f.id === data.format ? 'selected' : ''} ${!f.vllm && !f.trt ? 'style="color:var(--status-critical);"' : ''}>${f.name}</option>`).join('')}
                            </select>
                            <div id="format-warning" style="display:none;margin-top:8px;padding:12px;background:var(--status-critical-bg);border-radius:6px;font-size:var(--font-size-sm);color:var(--status-critical);"></div>
                        </div>
                    `,
                    bind: (body, data) => {
                        const warn = body.querySelector('#format-warning');
                        const fsel = body.querySelector('#format-select');
                        const checkFormat = () => {
                            if (data.format === 'gguf') {
                                warn.style.display = 'block';
                                warn.innerHTML = '❌ <strong>GGUF is NOT supported</strong> by vLLM or TensorRT-LLM.<br>GGUF is for llama.cpp only. Convert to GPTQ, AWQ, or SafeTensors.';
                            } else { warn.style.display = 'none'; }
                        };
                        fsel?.addEventListener('change', () => { data.format = fsel.value; checkFormat(); });
                        checkFormat();
                    },
                    validate: (data) => {
                        const e = [];
                        if (data.format === 'gguf') e.push('GGUF format is NOT supported. Use SafeTensors, GPTQ, or AWQ.');
                        return e;
                    },
                },
                {
                    label: 'Scaling',
                    render: (data) => `
                        <div class="form-group"><label class="form-label">GPUs per Replica</label>
                            <input class="form-input" data-field="gpu_count" type="number" min="1" max="8" value="${data.gpu_count}" />
                            <div class="text-secondary text-sm" style="margin-top:4px;">Use 2+ for tensor parallelism (requires NVLink: A100/H100 only).</div></div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                            <div class="form-group"><label class="form-label">Min Replicas (always running)</label>
                                <input class="form-input" data-field="min_replicas" type="number" min="1" max="10" value="${data.min_replicas}" /></div>
                            <div class="form-group"><label class="form-label">Max Replicas (autoscale limit)</label>
                                <input class="form-input" data-field="max_replicas" type="number" min="1" max="10" value="${data.max_replicas}" /></div>
                        </div>
                        <div class="form-group"><label class="form-label">API Key</label>
                            <input class="form-input" data-field="api_key" value="${data.api_key}" placeholder="Bearer token for authentication" />
                            <div class="text-secondary text-sm" style="margin-top:4px;">Used in header: <code>Authorization: Bearer &lt;API_KEY&gt;</code></div></div>
                    `,
                    validate: (data) => {
                        const e = [];
                        if (data.min_replicas > data.max_replicas) e.push('Min replicas cannot exceed max replicas');
                        if (data.gpu_count < 1) e.push('At least 1 GPU required per replica');
                        return e;
                    },
                },
            ],
            onComplete: async (data) => {
                await state.create('nai_endpoints', {
                    name: data.name.trim(),
                    model: data.model,
                    engine: data.engine,
                    format: data.format,
                    gpu_count: data.gpu_count,
                    replicas: data.min_replicas,
                    min_replicas: data.min_replicas,
                    max_replicas: data.max_replicas,
                    api_key: data.api_key || 'nai-default-key',
                    status: 'running',
                    url: `https://${data.name.trim()}.nai.ntnxlab.local/v1`,
                });
                toast.success(`Endpoint "${data.name}" deployed with ${data.engine === 'vllm' ? 'vLLM' : 'TensorRT-LLM'}`);
            },
        });
        wizard.open();
    }
}
