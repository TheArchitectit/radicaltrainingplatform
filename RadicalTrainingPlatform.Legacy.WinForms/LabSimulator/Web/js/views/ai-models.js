import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { Wizard } from '../components/Wizard.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

export class AiModelsView extends BaseView {
    #table = null;
    #unsubs = [];

    async render() {
        return this.html(`
            <div class="view">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-lg);">
                    <h2 class="page-title">NAI Model Registry</h2>
                    <button class="btn btn-primary" id="register-model-btn">+ Register Model</button>
                </div>
                <div id="ai-models-summary"></div>
                <div id="ai-models-table"></div>
            </div>
        `);
    }

    afterRender() {
        this.#renderSummary();
        this.#renderTable();

        document.getElementById('register-model-btn')?.addEventListener('click', () => this.#openRegisterWizard());

        this.#unsubs.push(
            bus.on('ai_models:created', () => this.#refresh()),
            bus.on('ai_models:deleted', () => this.#refresh())
        );
    }

    #getModels() {
        return state.getAll('ai_models') || [];
    }

    #renderSummary() {
        const models = this.#getModels();
        const deployed = models.filter(m => m.status === 'deployed').length;
        const available = models.filter(m => m.status === 'available').length;
        const totalSize = models.reduce((sum, m) => sum + (parseFloat(m.size_gb) || 0), 0).toFixed(1);

        const container = document.getElementById('ai-models-summary');
        if (!container) return;
        container.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:var(--space-lg);">
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${models.length}</div>
                    <div class="text-secondary text-sm">Total Models</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--status-good);">${deployed}</div>
                    <div class="text-secondary text-sm">Deployed</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--status-warning);">${available}</div>
                    <div class="text-secondary text-sm">Available</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--text-secondary);">${totalSize} GB</div>
                    <div class="text-secondary text-sm">Total Size</div>
                </div></div>
            </div>
        `;
    }

    #renderTable() {
        const container = document.getElementById('ai-models-table');
        if (!container) return;
        this.#table?.destroy();

        this.#table = new EntityTable({
            columns: [
                { key: 'name', label: 'Model Name', sortable: true },
                { key: 'framework', label: 'Framework', sortable: true, render: (v) => `<span class="badge">${v || '—'}</span>` },
                { key: 'version', label: 'Version', sortable: false },
                { key: 'size_gb', label: 'Size (GB)', sortable: true, render: (v) => v != null ? `${v} GB` : '—' },
                {
                    key: 'status', label: 'Status', sortable: true,
                    render: (v) => {
                        const colors = { deployed: 'var(--status-good)', available: 'var(--status-warning)', downloading: 'var(--prism-blue)' };
                        return `<span class="badge" style="background:${colors[v] || 'var(--text-secondary)'};color:var(--text-inverse);">${v || 'unknown'}</span>`;
                    }
                },
                { key: 'quantization', label: 'Quantization', sortable: false, render: (v) => v || 'None' },
                { key: 'last_updated', label: 'Last Updated', sortable: true, render: (v) => v ? new Date(v).toLocaleDateString() : '—' }
            ],
            data: this.#getModels(),
            searchKeys: ['name', 'framework', 'status'],
            selectable: true,
            emptyMessage: 'No AI models registered',
            emptyIcon: '🤖',
            actions: [
                {
                    label: 'Deploy',
                    onClick: (item) => {
                        state.update('ai_models', item.uuid, { status: 'deployed' });
                        toast.success(`Model "${item.name}" deployed successfully`);
                        this.#refresh();
                    }
                },
                {
                    label: 'Delete',
                    danger: true,
                    onClick: async (item) => {
                        const ok = await confirm({
                            title: 'Delete Model',
                            message: `Delete model <strong>${item.name}</strong>? This action cannot be undone.`,
                            confirmLabel: 'Delete',
                            danger: true
                        });
                        if (ok) {
                            await state.remove('ai_models', item.uuid);
                            toast.success(`Model "${item.name}" deleted`);
                        }
                    }
                }
            ]
        });

        container.innerHTML = '';
        container.appendChild(this.#table.render());
    }

    #openRegisterWizard() {
        const wizard = new Wizard({
            title: 'Register Model',
            initialData: {},
            steps: [
                {
                    label: 'Model Info',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Model Name</label>
                            <input class="form-input" data-field="name" type="text" value="${data.name || ''}" placeholder="e.g. llama-2-7b-chat" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Framework</label>
                            <select class="form-input" data-field="framework">
                                <option value="">Select framework…</option>
                                <option value="PyTorch" ${data.framework === 'PyTorch' ? 'selected' : ''}>PyTorch</option>
                                <option value="TensorFlow" ${data.framework === 'TensorFlow' ? 'selected' : ''}>TensorFlow</option>
                                <option value="ONNX" ${data.framework === 'ONNX' ? 'selected' : ''}>ONNX</option>
                                <option value="vLLM" ${data.framework === 'vLLM' ? 'selected' : ''}>vLLM</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Version</label>
                            <input class="form-input" data-field="version" type="text" value="${data.version || ''}" placeholder="e.g. 1.0.0" />
                        </div>
                    `,
                    validate: (data) => {
                        const errors = [];
                        if (!data.name?.trim()) errors.push('Model name is required');
                        if (!data.framework) errors.push('Framework is required');
                        if (!data.version?.trim()) errors.push('Version is required');
                        return errors;
                    }
                },
                {
                    label: 'Configuration',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Quantization</label>
                            <select class="form-input" data-field="quantization">
                                <option value="None" ${data.quantization === 'None' ? 'selected' : ''}>None</option>
                                <option value="FP16" ${data.quantization === 'FP16' ? 'selected' : ''}>FP16</option>
                                <option value="INT8" ${data.quantization === 'INT8' ? 'selected' : ''}>INT8</option>
                                <option value="INT4" ${data.quantization === 'INT4' ? 'selected' : ''}>INT4</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Size (GB)</label>
                            <input class="form-input" data-field="size_gb" type="number" value="${data.size_gb || ''}" placeholder="e.g. 13.5" step="0.1" min="0.1" />
                        </div>
                    `,
                    validate: (data) => {
                        const errors = [];
                        if (!data.size_gb || parseFloat(data.size_gb) <= 0) errors.push('Size must be greater than 0');
                        return errors;
                    }
                }
            ],
            onComplete: async (data) => {
                await state.create('ai_models', {
                    name: data.name.trim(),
                    framework: data.framework,
                    version: data.version.trim(),
                    quantization: data.quantization || 'None',
                    size_gb: parseFloat(data.size_gb),
                    status: 'available',
                    last_updated: new Date().toISOString()
                });
                toast.success(`Model "${data.name}" registered successfully`);
            }
        });
        wizard.open();
    }

    #refresh() {
        this.#renderSummary();
        this.#renderTable();
    }

    destroy() {
        this.#table?.destroy();
        this.#unsubs.forEach(fn => fn());
    }
}
