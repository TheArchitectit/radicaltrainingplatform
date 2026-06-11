import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { toast } from '../components/Toast.js';

/**
 * NAI API Explorer + VRAM Calculator.
 * Interactive API testing (OpenAI-compatible) and GPU memory planning.
 */

const PRECISION = [
    { id: 'FP32', bytes: 4, label: 'FP32 (4 bytes/param)' },
    { id: 'FP16', bytes: 2, label: 'FP16 (2 bytes/param)' },
    { id: 'BF16', bytes: 2, label: 'BF16 (2 bytes/param)' },
    { id: 'INT8', bytes: 1, label: 'INT8 (1 byte/param)' },
    { id: 'INT4', bytes: 0.5, label: 'INT4 (0.5 bytes/param)' },
];

const PRESETS = [
    { label: '7B FP16', params: 7, precision: 'FP16' },
    { label: '13B FP16', params: 13, precision: 'FP16' },
    { label: '13B INT8', params: 13, precision: 'INT8' },
    { label: '70B FP16', params: 70, precision: 'FP16' },
    { label: '70B INT4', params: 70, precision: 'INT4' },
    { label: '70B INT8', params: 70, precision: 'INT8' },
];

const GPU_OPTIONS = [
    { id: 'A100', vram: 80, mig: true, nvlink: true },
    { id: 'H100', vram: 80, mig: true, nvlink: true },
    { id: 'L40S', vram: 48, mig: false, nvlink: false },
    { id: 'T4', vram: 16, mig: false, nvlink: false },
    { id: 'V100', vram: 32, mig: false, nvlink: false },
];

export class AiToolsView extends BaseView {
    #activeTab = 'api';

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        const endpoints = state.getAll('nai_endpoints');

        el.innerHTML = `
            <div class="page-title">
                <h1>🧪 NAI Tools</h1>
            </div>

            <!-- Tabs -->
            <div style="display:flex;gap:0;margin-bottom:var(--space-lg);border-bottom:2px solid var(--border-light);">
                <button class="tools-tab active" data-tab="api" style="padding:10px 24px;border:none;background:none;cursor:pointer;font-weight:600;border-bottom:2px solid var(--prism-blue);margin-bottom:-2px;">API Explorer</button>
                <button class="tools-tab" data-tab="vram" style="padding:10px 24px;border:none;background:none;cursor:pointer;font-weight:500;color:var(--text-secondary);margin-bottom:-2px;">VRAM Calculator</button>
            </div>

            <div id="api-panel"></div>
            <div id="vram-panel" style="display:none;"></div>
        `;

        // API Explorer
        el.querySelector('#api-panel').innerHTML = `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-lg);">
                <!-- Request Panel -->
                <div class="card">
                    <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
                        Request
                        <button class="btn btn-sm btn-primary" id="send-btn">▶ Send</button>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label">Endpoint</label>
                            <select class="form-input" id="api-endpoint">
                                ${endpoints.length > 0
                                    ? endpoints.map(e => `<option value="${e.url}">${e.name} (${e.model})</option>`).join('')
                                    : '<option value="https://demo.nai.ntnxlab.local/v1">Demo Endpoint (no endpoints deployed)</option>'
                                }
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">API Path</label>
                            <select class="form-input" id="api-path">
                                <option value="/chat/completions">POST /v1/chat/completions</option>
                                <option value="/completions">POST /v1/completions</option>
                                <option value="/models">GET /v1/models</option>
                                <option value="/embeddings">POST /v1/embeddings</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Authorization Header</label>
                            <input class="form-input font-mono" id="api-auth" value="Bearer nai-api-key-here" style="font-size:12px;" />
                            <div class="text-secondary text-sm" style="margin-top:4px;">Format: <code>Bearer &lt;token&gt;</code> (NOT <code>Token &lt;token&gt;</code>)</div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Request Body (JSON)</label>
                            <textarea class="form-input font-mono" id="api-body" rows="12" style="font-size:12px;font-family:monospace;">${JSON.stringify({
                                model: endpoints[0]?.model || 'llama-2-7b-chat',
                                messages: [
                                    { role: 'system', content: 'You are a helpful assistant.' },
                                    { role: 'user', content: 'What is Nutanix?' }
                                ],
                                max_tokens: 512,
                                temperature: 0.7,
                                stream: false
                            }, null, 2)}</textarea>
                        </div>
                    </div>
                </div>

                <!-- Response Panel -->
                <div class="card">
                    <div class="card-header">Response</div>
                    <div class="card-body">
                        <div id="api-response" style="min-height:300px;">
                            <div class="text-secondary text-sm" style="text-align:center;padding:48px;">
                                Click <strong>▶ Send</strong> to make a request
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Code Samples -->
            <div class="card" style="margin-top:var(--space-lg);">
                <div class="card-header">Code Samples</div>
                <div class="card-body">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                        <div>
                            <h4>Python (OpenAI SDK)</h4>
                            <pre style="background:var(--bg-secondary);padding:12px;border-radius:6px;font-size:12px;overflow-x:auto;"><code>from openai import OpenAI

client = OpenAI(
    api_key="nai-api-key-here",
    base_url="https://endpoint.nai.ntnxlab.local/v1"
    # ↑ ONLY base_url changes from OpenAI
)

response = client.chat.completions.create(
    model="llama-2-7b-chat",
    messages=[
        {"role": "user", "content": "Hello"}
    ],
    stream=True  # SSE streaming
)

for chunk in response:
    print(chunk.choices[0].delta.content, end="")</code></pre>
                        </div>
                        <div>
                            <h4>cURL</h4>
                            <pre style="background:var(--bg-secondary);padding:12px;border-radius:6px;font-size:12px;overflow-x:auto;"><code>curl -X POST \\
  https://endpoint.nai.ntnxlab.local/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer nai-api-key-here" \\
  -d '{
    "model": "llama-2-7b-chat",
    "messages": [
      {"role": "system", "content": "You are helpful."},
      {"role": "user", "content": "What is AHV?"}
    ],
    "max_tokens": 256
  }'</code></pre>
                        </div>
                    </div>
                    <div class="text-secondary text-sm" style="margin-top:12px;">
                        <strong>Key:</strong> NAI is OpenAI API-compatible. Only <code>base_url</code> and <code>api_key</code> need to change — all other code is identical.
                    </div>
                </div>
            </div>

            <div class="card" style="margin-top:var(--space-lg);">
                <div class="card-header">🎓 API Exam Traps</div>
                <div class="card-body">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:var(--font-size-sm);">
                        <div>
                            <p><strong>422 Unprocessable Entity</strong> — Sent <code>{"prompt":"..."}</code> to <code>/v1/chat/completions</code>. Use <code>{"messages":[...]}</code> instead.</p>
                            <p><strong>"model not found"</strong> — Model name mismatch. Must match exactly (e.g., <code>meta-llama/Llama-2-7b-chat-hf</code> vs <code>llama-2-7b</code>).</p>
                        </div>
                        <div>
                            <p><strong>API is STATELESS</strong> — No server-side session. Client must send full <code>messages</code> array each turn.</p>
                            <p><strong>Streaming</strong> — <code>stream:true</code> → SSE. First chunk: <code>{"delta":{"role":"assistant"}}</code>. Final: <code>data: [DONE]</code>.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // VRAM Calculator
        el.querySelector('#vram-panel').innerHTML = `
            <div class="card">
                <div class="card-header">VRAM Calculator</div>
                <div class="card-body">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-xl);">
                        <!-- Input side -->
                        <div>
                            <div class="form-group">
                                <label class="form-label">Quick Presets</label>
                                <div style="display:flex;flex-wrap:wrap;gap:8px;" id="presets">
                                    ${PRESETS.map(p => `<button class="btn btn-sm btn-secondary preset-btn" data-params="${p.params}" data-precision="${p.precision}">${p.label}</button>`).join('')}
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Model Parameters (Billions)</label>
                                <input class="form-input" id="calc-params" type="number" min="1" max="1000" value="7" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Precision</label>
                                <select class="form-input" id="calc-precision">
                                    ${PRECISION.map(p => `<option value="${p.id}" ${p.id === 'FP16' ? 'selected' : ''}>${p.label}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Overhead Factor (KV cache + activations)</label>
                                <select class="form-input" id="calc-overhead">
                                    <option value="1.3">1.3× (minimal concurrency)</option>
                                    <option value="1.5" selected>1.5× (typical production)</option>
                                    <option value="2.0">2.0× (high concurrency / training)</option>
                                </select>
                            </div>
                            <button class="btn btn-primary" id="calc-btn" style="width:100%;margin-top:8px;">Calculate VRAM</button>
                        </div>

                        <!-- Result side -->
                        <div id="calc-result">
                            <div class="text-secondary" style="text-align:center;padding:48px;">
                                Set parameters and click <strong>Calculate VRAM</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Reference table -->
            <div class="card" style="margin-top:var(--space-lg);">
                <div class="card-header">VRAM Quick Reference</div>
                <div class="card-body" style="padding:0;">
                    <table style="width:100%;border-collapse:collapse;font-size:var(--font-size-sm);">
                        <thead><tr style="background:var(--bg-secondary);border-bottom:2px solid var(--border-light);">
                            <th style="padding:10px 16px;text-align:left;">Precision</th>
                            <th style="padding:10px 16px;text-align:right;">Bytes/Param</th>
                            <th style="padding:10px 16px;text-align:right;">7B</th>
                            <th style="padding:10px 16px;text-align:right;">13B</th>
                            <th style="padding:10px 16px;text-align:right;">33B</th>
                            <th style="padding:10px 16px;text-align:right;">70B</th>
                            <th style="padding:10px 16px;text-align:left;">Quality</th>
                        </tr></thead>
                        <tbody>
                            ${PRECISION.map(p => `
                                <tr style="border-bottom:1px solid var(--border-light);">
                                    <td style="padding:8px 16px;font-weight:600;">${p.id}</td>
                                    <td style="text-align:right;">${p.bytes}</td>
                                    <td style="text-align:right;">${(7 * p.bytes).toFixed(1)} GB</td>
                                    <td style="text-align:right;">${(13 * p.bytes).toFixed(1)} GB</td>
                                    <td style="text-align:right;">${(33 * p.bytes).toFixed(1)} GB</td>
                                    <td style="text-align:right;">${(70 * p.bytes).toFixed(1)} GB</td>
                                    <td>${p.id === 'FP32' ? 'Highest' : p.id === 'FP16' || p.id === 'BF16' ? 'Baseline' : p.id === 'INT8' ? '~5% loss' : '~10-15% loss'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card" style="margin-top:var(--space-lg);">
                <div class="card-header">VRAM Formula</div>
                <div class="card-body">
                    <div style="background:var(--bg-secondary);padding:16px;border-radius:6px;font-family:monospace;font-size:13px;line-height:2;">
Total VRAM = Model Weights + KV Cache + Activations + Batch Overhead

Model Weights (GB) = Parameters (B) × Bytes per Precision
KV Cache            ≈ 10-30% of model weights (scales with sequence length × batch size)
Activations         ≈ 10-20% of model weights
Batch Overhead      = Variable (scales with concurrent requests)

Practical Total     ≈ Model Weights × Overhead Factor (1.3× to 2.0×)
                    </div>
                    <div class="text-secondary text-sm" style="margin-top:12px;">
                        <strong>Key memorization:</strong> 7B FP16 = 14GB weights. Practical = ~21GB (1.5×). Fits on L40S (48GB) easily. T4 (16GB) too tight.
                    </div>
                </div>
            </div>
        `;

        return el;
    }

    afterRender() {
        document.querySelectorAll('.tools-tab').forEach(tab => {
            tab.addEventListener('click', () => this.#switchTab(tab.dataset.tab));
        });

        // API Explorer
        document.getElementById('send-btn')?.addEventListener('click', () => this.#sendApiRequest());
        document.getElementById('api-path')?.addEventListener('change', (e) => this.#updateRequestBody(e.target.value));

        // VRAM Calculator
        document.getElementById('calc-btn')?.addEventListener('click', () => this.#calculateVram());
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('calc-params').value = btn.dataset.params;
                document.getElementById('calc-precision').value = btn.dataset.precision;
                this.#calculateVram();
            });
        });
    }

    destroy() {}

    #switchTab(tab) {
        document.querySelectorAll('.tools-tab').forEach(t => {
            const isActive = t.dataset.tab === tab;
            t.classList.toggle('active', isActive);
            t.style.borderBottom = isActive ? '2px solid var(--prism-blue)' : 'none';
            t.style.fontWeight = isActive ? '600' : '500';
            t.style.color = isActive ? 'var(--text-primary)' : 'var(--text-secondary)';
        });
        ['api', 'vram'].forEach(p => {
            const panel = document.getElementById(`${p}-panel`);
            if (panel) panel.style.display = p === tab ? '' : 'none';
        });
    }

    #updateRequestBody(path) {
        const body = document.getElementById('api-body');
        if (!body) return;

        const endpoint = state.getAll('nai_endpoints')[0];
        const model = endpoint?.model || 'llama-2-7b-chat';

        const templates = {
            '/chat/completions': { model, messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: 'What is Nutanix?' }], max_tokens: 512, temperature: 0.7, stream: false },
            '/completions': { model, prompt: 'Translate English to French:\nHello →', max_tokens: 100 },
            '/models': null,
            '/embeddings': { model, input: 'Nutanix is a cloud computing company.' },
        };

        body.value = templates[path] ? JSON.stringify(templates[path], null, 2) : '// GET request — no body needed';
    }

    #sendApiRequest() {
        const path = document.getElementById('api-path')?.value;
        const bodyText = document.getElementById('api-body')?.value;
        const auth = document.getElementById('api-auth')?.value;
        const respDiv = document.getElementById('api-response');
        if (!respDiv) return;

        // Validate auth format
        if (!auth?.startsWith('Bearer ')) {
            respDiv.innerHTML = `<div style="padding:12px;background:var(--status-critical-bg);border-radius:6px;"><strong>401 Unauthorized</strong><br><br>Invalid authorization header format.<br>Expected: <code>Authorization: Bearer &lt;token&gt;</code><br>Got: <code>${auth}</code><br><br>❌ Exam trap: Use <code>Bearer</code>, NOT <code>Token</code>.</div>`;
            return;
        }

        // Validate request body format
        let reqBody = null;
        if (path !== '/models') {
            try { reqBody = JSON.parse(bodyText); }
            catch { respDiv.innerHTML = `<div style="padding:12px;background:var(--status-critical-bg);border-radius:6px;"><strong>400 Bad Request</strong><br>Invalid JSON in request body.</div>`; return; }
        }

        // Check for common mistakes
        if (path === '/chat/completions' && reqBody?.prompt && !reqBody?.messages) {
            respDiv.innerHTML = `<div style="padding:12px;background:var(--status-critical-bg);border-radius:6px;">
                <strong>422 Unprocessable Entity</strong><br><br>
                <code>/v1/chat/completions</code> requires <code>"messages"</code> array, not <code>"prompt"</code> string.<br><br>
                ❌ You sent: <code>{"prompt": "..."}</code><br>
                ✅ Expected: <code>{"messages": [{"role": "user", "content": "..."}]}</code><br><br>
                Use <code>/v1/completions</code> for raw prompt-based inference.
            </div>`;
            return;
        }

        if (path === '/completions' && reqBody?.messages && !reqBody?.prompt) {
            respDiv.innerHTML = `<div style="padding:12px;background:var(--status-critical-bg);border-radius:6px;">
                <strong>422 Unprocessable Entity</strong><br><br>
                <code>/v1/completions</code> requires <code>"prompt"</code> string, not <code>"messages"</code> array.<br><br>
                Use <code>/v1/chat/completions</code> for conversation-style inference.
            </div>`;
            return;
        }

        // Simulate successful response
        const simResponse = this.#simulateResponse(path, reqBody);
        respDiv.innerHTML = `
            <div style="margin-bottom:8px;">
                <span class="status-badge good"><span class="dot"></span>200 OK</span>
                <span class="text-secondary text-sm" style="margin-left:8px;">~${Math.floor(Math.random() * 200 + 100)}ms</span>
            </div>
            <pre style="background:var(--bg-secondary);padding:12px;border-radius:6px;font-size:12px;overflow-x:auto;max-height:400px;overflow-y:auto;"><code>${JSON.stringify(simResponse, null, 2)}</code></pre>
            <div class="text-secondary text-sm" style="margin-top:8px;">
                ℹ️ Simulated response. Real NAI endpoints return actual model inference.
            </div>
        `;
    }

    #simulateResponse(path, body) {
        const model = body?.model || 'llama-2-7b-chat';

        if (path === '/chat/completions') {
            return {
                id: `chatcmpl-${Date.now()}`,
                object: 'chat.completion',
                model,
                choices: [{
                    index: 0,
                    message: { role: 'assistant', content: 'Nutanix is a cloud computing company that provides hyperconverged infrastructure (HCI) solutions. Their platform combines compute, storage, and networking into a single software-defined solution running on industry-standard hardware.' },
                    finish_reason: 'stop',
                }],
                usage: { prompt_tokens: 28, completion_tokens: 42, total_tokens: 70 },
            };
        }
        if (path === '/completions') {
            return {
                id: `cmpl-${Date.now()}`,
                object: 'text_completion',
                model,
                choices: [{ text: ' Bonjour', index: 0, finish_reason: 'stop' }],
                usage: { prompt_tokens: 8, completion_tokens: 2, total_tokens: 10 },
            };
        }
        if (path === '/models') {
            const endpoints = state.getAll('nai_endpoints');
            return {
                object: 'list',
                data: endpoints.length > 0
                    ? endpoints.map(e => ({ id: e.model, object: 'model', owned_by: 'nai' }))
                    : [{ id: 'llama-2-7b-chat', object: 'model', owned_by: 'nai' }],
            };
        }
        if (path === '/embeddings') {
            return {
                object: 'list',
                data: [{ object: 'embedding', embedding: Array.from({ length: 10 }, () => +(Math.random() * 2 - 1).toFixed(6)), index: 0 }],
                model,
                usage: { prompt_tokens: 8, total_tokens: 8 },
            };
        }
        return { error: 'Unknown endpoint' };
    }

    #calculateVram() {
        const params = parseFloat(document.getElementById('calc-params')?.value) || 7;
        const precId = document.getElementById('calc-precision')?.value || 'FP16';
        const overhead = parseFloat(document.getElementById('calc-overhead')?.value) || 1.5;
        const resultDiv = document.getElementById('calc-result');
        if (!resultDiv) return;

        const prec = PRECISION.find(p => p.id === precId);
        const weightsGb = params * prec.bytes;
        const totalGb = weightsGb * overhead;

        // Find suitable GPUs
        const recommendations = GPU_OPTIONS.map(gpu => {
            const gpusNeeded = Math.ceil(totalGb / gpu.vram);
            const fits = gpu.vram >= totalGb;
            const needsTensorParallel = !fits;
            const tpViable = needsTensorParallel && gpu.nvlink;
            const feasible = fits || tpViable;

            return { ...gpu, gpusNeeded, fits, needsTensorParallel, tpViable, feasible };
        });

        resultDiv.innerHTML = `
            <div style="text-align:center;padding:16px;background:var(--bg-secondary);border-radius:8px;margin-bottom:16px;">
                <div style="font-size:14px;font-weight:600;color:var(--text-secondary);">Model: ${params}B ${precId}</div>
                <div style="font-size:36px;font-weight:700;color:var(--prism-blue);margin:8px 0;">${weightsGb.toFixed(1)} GB</div>
                <div class="text-secondary text-sm">Weights Only</div>
                <div style="font-size:24px;font-weight:700;color:var(--status-warning);margin-top:8px;">${totalGb.toFixed(1)} GB</div>
                <div class="text-secondary text-sm">With ${overhead}× overhead (KV cache + activations)</div>
            </div>

            <h4 style="margin-bottom:8px;">GPU Recommendations</h4>
            ${recommendations.map(r => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border:1px solid ${r.feasible ? 'var(--border-light)' : 'var(--status-critical)'};border-radius:6px;margin-bottom:8px;background:${r.fits ? 'var(--status-good-bg)' : r.tpViable ? 'var(--status-warning-bg)' : 'var(--status-critical-bg)'};">
                    <div>
                        <strong>${r.id}</strong> <span class="text-secondary text-sm">(${r.vram}GB)</span>
                    </div>
                    <div style="font-size:var(--font-size-sm);">
                        ${r.fits
                            ? `<span style="color:var(--status-good);">✅ 1× GPU (${(r.vram - totalGb).toFixed(0)}GB headroom)</span>`
                            : r.tpViable
                                ? `<span style="color:var(--status-warning);">⚠️ ${r.gpusNeeded}× GPU (tensor parallel via NVLink)</span>`
                                : `<span style="color:var(--status-critical);">❌ ${r.gpusNeeded}× needed, no NVLink — not viable</span>`
                        }
                    </div>
                </div>
            `).join('')}

            <div class="text-secondary text-sm" style="margin-top:12px;">
                <strong>Formula:</strong> ${params}B × ${prec.bytes} bytes = ${weightsGb.toFixed(1)} GB weights × ${overhead} overhead = ${totalGb.toFixed(1)} GB total<br>
                Green = single GPU fits. Yellow = multi-GPU with NVLink. Red = not feasible (no NVLink for tensor parallel).
            </div>
        `;
    }
}
