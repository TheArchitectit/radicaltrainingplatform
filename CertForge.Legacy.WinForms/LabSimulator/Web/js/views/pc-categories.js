import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';
import { Wizard } from '../components/Wizard.js';

/**
 * PC Categories — Manage category key/value pairs and assign to VMs.
 * Categories are fundamental to Prism Central — used by Flow, Leap, and X-Play.
 */
export class PcCategoriesView extends BaseView {
    #unsubs = [];
    #selectedCategory = null;

    async render() {
        const el = document.createElement('div');
        el.className = 'view';
        el.innerHTML = this.#buildHTML();
        return el;
    }

    afterRender() {
        document.getElementById('create-cat-btn')?.addEventListener('click', () => this.#openCreateDialog());
        this.#wireCards();

        const u1 = bus.on('categories:created', () => this.#rerender());
        const u2 = bus.on('categories:updated', () => this.#rerender());
        const u3 = bus.on('categories:deleted', () => this.#rerender());
        this.#unsubs.push(u1, u2, u3);
    }

    destroy() { this.#unsubs.forEach(u => u()); }

    #buildHTML() {
        const categories = state.getAll('categories');

        const categoryCards = categories.length === 0
            ? '<div class="text-secondary" style="text-align:center;padding:40px;">No categories defined. Create your first category to enable Flow, Leap, and X-Play.</div>'
            : categories.map(c => `
                <div class="card cat-card" data-cat-id="${c.uuid}" style="cursor:pointer;transition:box-shadow 0.2s;">
                    <div class="card-body">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                            <span style="font-weight:700;font-size:var(--font-size-md);">${this.#esc(c.key)}</span>
                            <div style="display:flex;gap:4px;">
                                <button class="btn btn-secondary btn-sm add-value-btn" data-cat-id="${c.uuid}" title="Add value">+ Value</button>
                                <button class="btn btn-secondary btn-sm delete-cat-btn" data-cat-id="${c.uuid}" title="Delete" style="color:var(--status-critical);">✕</button>
                            </div>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;">
                            ${c.values.map(v => `
                                <span class="status-badge" style="background:var(--prism-blue-light);color:var(--prism-blue);cursor:default;"
                                    >${this.#esc(v)}<button class="remove-val-btn" data-cat-id="${c.uuid}" data-val="${this.#esc(v)}" style="margin-left:4px;border:none;background:none;color:var(--prism-blue);cursor:pointer;font-weight:700;font-size:12px;" title="Remove value">×</button></span>
                            `).join('')}
                            ${c.values.length === 0 ? '<span class="text-secondary text-sm">No values</span>' : ''}
                        </div>
                        <div class="text-secondary text-sm" style="margin-top:8px;">
                            ${this.#getCategoryUsage(c)}
                        </div>
                    </div>
                </div>
            `).join('');

        // VM assignments section
        const vms = state.vms.filter(v => !v.is_cvm);
        const vmAssignments = vms.map(vm => {
            const cats = (vm.categories || []);
            return `<tr>
                <td style="padding:8px 12px;font-weight:500;">${this.#esc(vm.name)}</td>
                <td style="padding:8px 12px;">
                    <div style="display:flex;flex-wrap:wrap;gap:4px;">
                        ${cats.map(c => `<span class="status-badge" style="background:var(--prism-blue-light);color:var(--prism-blue);font-size:11px;">${this.#esc(c.key)}:${this.#esc(c.value)}</span>`).join('')}
                        ${cats.length === 0 ? '<span class="text-secondary text-sm">None</span>' : ''}
                    </div>
                </td>
                <td style="padding:8px 12px;">
                    <button class="btn btn-secondary btn-sm assign-cat-btn" data-vm-id="${vm.uuid}">Assign</button>
                </td>
            </tr>`;
        }).join('');

        return `
            <div class="page-title">
                <h1>Categories</h1>
                <button class="btn btn-primary" id="create-cat-btn">+ Create Category</button>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:var(--space-lg);margin-bottom:var(--space-xl);">
                ${categoryCards}
            </div>

            <div class="card">
                <div class="card-header">VM Category Assignments</div>
                <div class="card-body" style="padding:0;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr style="background:var(--gray-50);border-bottom:2px solid var(--border-light);">
                                <th style="padding:10px 12px;text-align:left;font-weight:600;font-size:var(--font-size-sm);">VM Name</th>
                                <th style="padding:10px 12px;text-align:left;font-weight:600;font-size:var(--font-size-sm);">Categories</th>
                                <th style="padding:10px 12px;text-align:left;font-weight:600;font-size:var(--font-size-sm);width:80px;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>${vmAssignments}</tbody>
                    </table>
                </div>
            </div>
        `;
    }

    #getCategoryUsage(cat) {
        const vms = state.vms.filter(v => (v.categories || []).some(c => c.key === cat.key));
        const policies = state.getAll('flow_policies').filter(p =>
            (p.target_categories || []).some(tc => tc.key === cat.key) ||
            (p.source_categories || []).some(sc => sc.key === cat.key)
        );
        const parts = [];
        if (vms.length > 0) parts.push(`${vms.length} VM(s)`);
        if (policies.length > 0) parts.push(`${policies.length} policy(ies)`);
        return parts.length > 0 ? `Used by: ${parts.join(', ')}` : 'Not used';
    }

    #wireCards() {
        document.querySelectorAll('.add-value-btn').forEach(btn => {
            btn.addEventListener('click', (e) => { e.stopPropagation(); this.#addValue(btn.dataset.catId); });
        });
        document.querySelectorAll('.delete-cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => { e.stopPropagation(); this.#deleteCategory(btn.dataset.catId); });
        });
        document.querySelectorAll('.remove-val-btn').forEach(btn => {
            btn.addEventListener('click', (e) => { e.stopPropagation(); this.#removeValue(btn.dataset.catId, btn.dataset.val); });
        });
        document.querySelectorAll('.assign-cat-btn').forEach(btn => {
            btn.addEventListener('click', () => this.#openAssignDialog(btn.dataset.vmId));
        });
    }

    #rerender() {
        const container = document.querySelector('.view');
        if (container) {
            container.innerHTML = this.#buildHTML();
            document.getElementById('create-cat-btn')?.addEventListener('click', () => this.#openCreateDialog());
            this.#wireCards();
        }
    }

    #openCreateDialog() {
        const wizard = new Wizard({
            title: 'Create Category',
            initialData: { key: '', values: '' },
            steps: [{
                label: 'Category',
                render: (data) => `
                    <div class="form-group">
                        <label class="form-label">Category Key</label>
                        <input class="form-input" data-field="key" value="${data.key}" placeholder="e.g., AppType, Environment, AppTier" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Values (comma-separated)</label>
                        <input class="form-input" data-field="values" value="${data.values}" placeholder="e.g., Web, Database, App" />
                    </div>
                `,
                validate: (data) => {
                    const errors = [];
                    if (!data.key?.trim()) errors.push('Category key is required');
                    if (state.getAll('categories').some(c => c.key === data.key?.trim())) errors.push('Category key already exists');
                    if (!data.values?.trim()) errors.push('At least one value is required');
                    return errors;
                },
            }],
            onComplete: async (data) => {
                const values = data.values.split(',').map(v => v.trim()).filter(Boolean);
                await state.create('categories', { key: data.key.trim(), values });
                toast.success(`Category "${data.key}" created with ${values.length} values`);
            },
        });
        wizard.open();
    }

    async #addValue(catId) {
        const cat = state.getById('categories', catId);
        if (!cat) return;
        const wizard = new Wizard({
            title: `Add Value to "${cat.key}"`,
            initialData: { value: '' },
            steps: [{
                label: 'New Value',
                render: (data) => `
                    <div class="form-group">
                        <label class="form-label">Value</label>
                        <input class="form-input" data-field="value" value="${data.value}" placeholder="e.g., Production" />
                    </div>
                    <div class="text-secondary text-sm">Existing values: ${cat.values.join(', ') || 'None'}</div>
                `,
                validate: (data) => {
                    const errors = [];
                    if (!data.value?.trim()) errors.push('Value is required');
                    if (cat.values.includes(data.value?.trim())) errors.push('Value already exists');
                    return errors;
                },
            }],
            onComplete: async (data) => {
                const newValues = [...cat.values, data.value.trim()];
                await state.update('categories', catId, { values: newValues });
                toast.success(`Value "${data.value}" added to "${cat.key}"`);
            },
        });
        wizard.open();
    }

    async #removeValue(catId, value) {
        const cat = state.getById('categories', catId);
        if (!cat) return;
        const newValues = cat.values.filter(v => v !== value);
        await state.update('categories', catId, { values: newValues });
        toast.success(`Value "${value}" removed from "${cat.key}"`);
    }

    async #deleteCategory(catId) {
        const cat = state.getById('categories', catId);
        if (!cat) return;
        const ok = await confirm({
            title: 'Delete Category',
            message: `Delete category <strong>${cat.key}</strong>? This will remove all assignments using this category.`,
            confirmLabel: 'Delete',
            danger: true,
        });
        if (ok) {
            // Remove category assignments from all VMs
            for (const vm of state.vms) {
                if ((vm.categories || []).some(c => c.key === cat.key)) {
                    const filtered = vm.categories.filter(c => c.key !== cat.key);
                    await state.update('vms', vm.uuid, { categories: filtered });
                }
            }
            await state.remove('categories', catId);
            toast.success(`Category "${cat.key}" deleted`);
        }
    }

    #openAssignDialog(vmId) {
        const vm = state.getById('vms', vmId);
        if (!vm) return;
        const categories = state.getAll('categories');
        if (categories.length === 0) {
            toast.warning('Create categories first before assigning them to VMs');
            return;
        }

        const currentCats = vm.categories || [];
        const wizard = new Wizard({
            title: `Assign Categories to "${vm.name}"`,
            initialData: {
                assignments: categories.map(cat => {
                    const assigned = currentCats.find(c => c.key === cat.key);
                    return { key: cat.key, value: assigned?.value || '', values: cat.values };
                }),
            },
            steps: [{
                label: 'Categories',
                render: (data) => `
                    <div style="max-height:400px;overflow-y:auto;">
                        ${data.assignments.map((a, i) => `
                            <div class="form-group" style="display:flex;align-items:center;gap:12px;">
                                <label class="form-label" style="min-width:120px;margin:0;font-weight:600;">${this.#esc(a.key)}</label>
                                <select class="form-input cat-assign-select" data-idx="${i}" style="flex:1;">
                                    <option value="">— Not assigned —</option>
                                    ${a.values.map(v => `<option value="${v}" ${v === a.value ? 'selected' : ''}>${v}</option>`).join('')}
                                </select>
                            </div>
                        `).join('')}
                    </div>
                `,
                bind: (body, data) => {
                    body.querySelectorAll('.cat-assign-select').forEach(sel => {
                        sel.addEventListener('change', () => {
                            data.assignments[Number(sel.dataset.idx)].value = sel.value;
                        });
                    });
                },
            }],
            onComplete: async (data) => {
                const newCats = data.assignments
                    .filter(a => a.value)
                    .map(a => ({ key: a.key, value: a.value }));
                await state.update('vms', vmId, { categories: newCats });
                toast.success(`Categories updated for "${vm.name}"`);
            },
        });
        wizard.open();
    }

    #esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
}
