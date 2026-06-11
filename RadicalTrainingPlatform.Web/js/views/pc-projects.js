import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { Wizard } from '../components/Wizard.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

/**
 * PC Projects — Self-Service portal: project quotas, assigned users,
 * infrastructure resources, and RBAC integration.
 */
export class PcProjectsView extends BaseView {
    #table = null;
    #unsubs = [];
    #selectedProject = null;

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        const header = document.createElement('div');
        header.className = 'page-title';
        header.innerHTML = `
            <h1>Projects</h1>
            <button class="btn btn-primary" id="proj-create-btn">+ Create Project</button>
        `;
        el.appendChild(header);

        const content = document.createElement('div');
        content.id = 'projects-content';
        el.appendChild(content);

        return el;
    }

    afterRender() {
        this.#renderList();

        document.getElementById('proj-create-btn')?.addEventListener('click', () => this.#createProject());

        this.#unsubs.push(
            bus.on('projects:created', () => this.#renderList()),
            bus.on('projects:updated', () => this.#renderList()),
            bus.on('projects:deleted', () => this.#renderList()),
        );
    }

    destroy() { this.#unsubs.forEach(fn => fn()); }

    #renderList() {
        const container = document.getElementById('projects-content');
        if (!container) return;
        container.innerHTML = '';

        const projects = state.getAll('projects');

        // Summary
        const summary = document.createElement('div');
        summary.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-lg);margin-bottom:var(--space-xl);';
        const totalVms = projects.reduce((s, p) => s + (p.vm_count || 0), 0);
        const totalVcpus = projects.reduce((s, p) => s + (p.vcpu_used || 0), 0);
        const totalMem = projects.reduce((s, p) => s + (p.memory_used_gb || 0), 0);
        const totalStorage = projects.reduce((s, p) => s + (p.storage_used_gb || 0), 0);
        summary.innerHTML = `
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${projects.length}</div>
                <div class="text-secondary text-sm">Projects</div>
            </div></div>
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--status-good);">${totalVms}</div>
                <div class="text-secondary text-sm">Total VMs</div>
            </div></div>
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${totalVcpus} / ${totalMem} GB</div>
                <div class="text-secondary text-sm">vCPU / Memory Used</div>
            </div></div>
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${totalStorage} GB</div>
                <div class="text-secondary text-sm">Storage Used</div>
            </div></div>
        `;
        container.appendChild(summary);

        this.#table = new EntityTable({
            columns: [
                { key: 'name', label: 'Project Name' },
                { key: 'description', label: 'Description', render: v => v || '<span class="text-secondary">—</span>' },
                { key: 'users', label: 'Users', render: v => (v || []).length },
                { key: 'vm_count', label: 'VMs' },
                { key: 'vcpu_used', label: 'vCPUs', render: (v, row) => `${v || 0} / ${row.vcpu_quota || '∞'}` },
                { key: 'memory_used_gb', label: 'Memory (GB)', render: (v, row) => `${v || 0} / ${row.memory_quota_gb || '∞'}` },
                { key: 'storage_used_gb', label: 'Storage (GB)', render: (v, row) => `${v || 0} / ${row.storage_quota_gb || '∞'}` },
            ],
            data: projects,
            searchKeys: ['name', 'description'],
            selectable: true,
            actions: [
                { label: '👁️ View Details', onClick: (item) => this.#viewProject(item) },
                { label: '🗑️ Delete', variant: 'danger', onClick: (item) => this.#deleteProjects([item]) },
            ],
            emptyMessage: 'No projects configured. Click "+ Create Project" to add one.',
        });
        container.appendChild(this.#table.render());
    }

    #viewProject(project) {
        const container = document.getElementById('projects-content');
        if (!container) return;
        container.innerHTML = '';

        const back = document.createElement('button');
        back.className = 'btn';
        back.textContent = '← Back to Projects';
        back.style.marginBottom = 'var(--space-lg)';
        back.addEventListener('click', () => this.#renderList());
        container.appendChild(back);

        // Quota usage bars
        const quotaCard = document.createElement('div');
        quotaCard.className = 'card';
        quotaCard.style.marginBottom = 'var(--space-lg)';
        quotaCard.innerHTML = `
            <div class="card-header">${project.name} — Resource Quotas</div>
            <div class="card-body">
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-xl);">
                    ${this.#quotaBar('vCPUs', project.vcpu_used || 0, project.vcpu_quota || 100)}
                    ${this.#quotaBar('Memory (GB)', project.memory_used_gb || 0, project.memory_quota_gb || 256)}
                    ${this.#quotaBar('Storage (GB)', project.storage_used_gb || 0, project.storage_quota_gb || 1000)}
                </div>
            </div>
        `;
        container.appendChild(quotaCard);

        // Users
        const usersCard = document.createElement('div');
        usersCard.className = 'card';
        usersCard.style.marginBottom = 'var(--space-lg)';
        const users = project.users || [];
        usersCard.innerHTML = `
            <div class="card-header">Assigned Users (${users.length})</div>
            <div class="card-body">
                ${users.length === 0 ? '<p class="text-secondary">No users assigned to this project.</p>' :
                `<table style="width:100%;border-collapse:collapse;">
                    <thead><tr style="border-bottom:2px solid var(--border-subtle);">
                        <th style="text-align:left;padding:8px;">Username</th>
                        <th style="text-align:left;padding:8px;">Role</th>
                    </tr></thead>
                    <tbody>
                        ${users.map(u => `<tr style="border-bottom:1px solid var(--border-subtle);">
                            <td style="padding:8px;">${u.username}</td>
                            <td style="padding:8px;"><span class="badge">${u.role}</span></td>
                        </tr>`).join('')}
                    </tbody>
                </table>`}
            </div>
        `;
        container.appendChild(usersCard);

        // Infrastructure
        const infraCard = document.createElement('div');
        infraCard.className = 'card';
        const infra = project.infrastructure || {};
        infraCard.innerHTML = `
            <div class="card-header">Infrastructure</div>
            <div class="card-body">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-lg);">
                    <div>
                        <div class="text-secondary text-sm">Clusters</div>
                        <div style="font-weight:600;">${(infra.clusters || ['All']).join(', ')}</div>
                    </div>
                    <div>
                        <div class="text-secondary text-sm">Networks</div>
                        <div style="font-weight:600;">${(infra.networks || ['All']).join(', ')}</div>
                    </div>
                    <div>
                        <div class="text-secondary text-sm">Categories</div>
                        <div style="font-weight:600;">${(infra.categories || []).map(c => `${c.key}:${c.value}`).join(', ') || 'None'}</div>
                    </div>
                    <div>
                        <div class="text-secondary text-sm">VPCs</div>
                        <div style="font-weight:600;">${(infra.vpcs || ['None']).join(', ')}</div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(infraCard);
    }

    #quotaBar(label, used, quota) {
        const pct = quota > 0 ? Math.min(Math.round((used / quota) * 100), 100) : 0;
        const color = pct > 90 ? 'var(--status-critical)' : pct > 70 ? 'var(--status-warning)' : 'var(--prism-blue)';
        return `<div>
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                <span style="font-weight:600;">${label}</span>
                <span class="text-secondary text-sm">${used} / ${quota} (${pct}%)</span>
            </div>
            <div style="background:var(--surface-tertiary);border-radius:4px;height:12px;overflow:hidden;">
                <div style="background:${color};height:100%;width:${pct}%;border-radius:4px;transition:width 0.3s;"></div>
            </div>
        </div>`;
    }

    #createProject() {
        const wizard = new Wizard({
            title: 'Create Project',
            initialData: { name: '', description: '', vcpu_quota: '', memory_quota_gb: '', storage_quota_gb: '', admin_user: '' },
            steps: [
                {
                    label: 'Project Details',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Project Name</label>
                            <input class="form-input" data-field="name" value="${data.name}" placeholder="e.g. Engineering" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <input class="form-input" data-field="description" value="${data.description}" placeholder="Team project description" />
                        </div>
                    `,
                    validate: (data) => {
                        const errors = [];
                        if (!data.name?.trim()) errors.push('Project name is required');
                        return errors;
                    },
                },
                {
                    label: 'Resource Quotas',
                    render: (data) => `
                        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
                            <div class="form-group">
                                <label class="form-label">vCPU Quota</label>
                                <input class="form-input" data-field="vcpu_quota" type="number" value="${data.vcpu_quota}" placeholder="100" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Memory Quota (GB)</label>
                                <input class="form-input" data-field="memory_quota_gb" type="number" value="${data.memory_quota_gb}" placeholder="256" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Storage Quota (GB)</label>
                                <input class="form-input" data-field="storage_quota_gb" type="number" value="${data.storage_quota_gb}" placeholder="1000" />
                            </div>
                        </div>
                        <p class="text-secondary text-sm">Leave blank for unlimited quota.</p>
                    `,
                },
                {
                    label: 'Users',
                    render: (data) => `
                        <div class="form-group">
                            <label class="form-label">Project Admin Username</label>
                            <input class="form-input" data-field="admin_user" value="${data.admin_user}" placeholder="admin" />
                        </div>
                        <p class="text-secondary text-sm">This user will be assigned the Project Admin role.</p>
                    `,
                },
            ],
            onComplete: async (data) => {
                const users = data.admin_user ? [{ username: data.admin_user, role: 'Project Admin' }] : [];
                await state.create('projects', {
                    name: data.name,
                    description: data.description || '',
                    vcpu_quota: parseInt(data.vcpu_quota) || null,
                    memory_quota_gb: parseInt(data.memory_quota_gb) || null,
                    storage_quota_gb: parseInt(data.storage_quota_gb) || null,
                    vcpu_used: 0,
                    memory_used_gb: 0,
                    storage_used_gb: 0,
                    vm_count: 0,
                    users,
                    infrastructure: { clusters: ['All'], networks: ['All'], categories: [], vpcs: [] },
                });
                toast(`Project "${data.name}" created.`, 'success');
            },
        });
        wizard.open();
    }

    async #deleteProjects(selected) {
        if (!selected || selected.length === 0) { toast('Select projects first.', 'warning'); return; }
        const ok = await confirm({ title: 'Delete Projects', message: `Delete ${selected.length} project(s)? This cannot be undone.`, confirmLabel: 'Delete', danger: true });
        if (!ok) return;
        for (const p of selected) { await state.remove('projects', p.uuid); }
        toast(`Deleted ${selected.length} project(s).`, 'success');
    }
}
