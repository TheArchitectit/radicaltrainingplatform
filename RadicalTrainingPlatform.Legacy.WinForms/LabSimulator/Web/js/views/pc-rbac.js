import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { Wizard } from '../components/Wizard.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

/**
 * PC RBAC — User/Role management and Active Directory configuration.
 */
export class PcRbacView extends BaseView {
    #userTable = null;
    #roleTable = null;
    #unsubs = [];
    #activeTab = 'users';

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        el.innerHTML = `
            <div class="page-title">
                <h1>Users & Roles</h1>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-primary" id="create-user-btn">+ Add User</button>
                    <button class="btn btn-secondary" id="create-role-btn">+ Create Role</button>
                </div>
            </div>

            <!-- Tabs -->
            <div style="display:flex;gap:0;margin-bottom:var(--space-lg);border-bottom:2px solid var(--border-light);">
                <button class="rbac-tab active" data-tab="users" style="padding:10px 24px;border:none;background:none;cursor:pointer;font-weight:600;border-bottom:2px solid var(--prism-blue);margin-bottom:-2px;">Local Users</button>
                <button class="rbac-tab" data-tab="roles" style="padding:10px 24px;border:none;background:none;cursor:pointer;font-weight:500;color:var(--text-secondary);margin-bottom:-2px;">Roles</button>
                <button class="rbac-tab" data-tab="ad" style="padding:10px 24px;border:none;background:none;cursor:pointer;font-weight:500;color:var(--text-secondary);margin-bottom:-2px;">Directory Services</button>
            </div>

            <div id="users-panel"></div>
            <div id="roles-panel" style="display:none;"></div>
            <div id="ad-panel" style="display:none;"></div>
        `;

        // Users table
        this.#userTable = new EntityTable({
            columns: [
                { key: 'username', label: 'Username', sortable: true, render: (v) => `<strong>${v}</strong>` },
                { key: 'email', label: 'Email', render: (v) => v || '—' },
                {
                    key: 'role', label: 'Role', sortable: true,
                    render: (v) => {
                        const colors = { 'Cluster Admin': 'good', 'User Admin': 'warning', 'Viewer': 'info', 'Custom': 'info' };
                        const cls = colors[v] || 'info';
                        return `<span class="status-badge ${cls}" ${cls === 'info' ? 'style="background:var(--status-info-bg);color:var(--status-info);"' : ''}>${v}</span>`;
                    }
                },
                { key: 'source', label: 'Source', render: (v) => v === 'ad' ? '🏢 Active Directory' : '👤 Local' },
                {
                    key: 'last_login', label: 'Last Login',
                    render: (v) => v || '<span class="text-secondary">Never</span>'
                },
            ],
            data: state.getAll('users'),
            searchKeys: ['username', 'email'],
            emptyMessage: 'No users configured',
            emptyIcon: '👤',
            actions: [
                { label: 'Change Role', onClick: (u) => this.#changeRole(u) },
                { label: 'Delete', danger: true, onClick: (u) => this.#deleteUser(u) },
            ],
        });

        // Roles table
        this.#roleTable = new EntityTable({
            columns: [
                { key: 'name', label: 'Role Name', sortable: true, render: (v) => `<strong>${v}</strong>` },
                { key: 'type', label: 'Type', render: (v) => v === 'built_in' ? 'Built-in' : 'Custom' },
                {
                    key: 'permissions', label: 'Permissions',
                    render: (val) => `${(val || []).length} permission(s)`
                },
                {
                    key: 'users', label: 'Assigned Users',
                    render: (_, role) => {
                        const count = state.getAll('users').filter(u => u.role === role.name).length;
                        return `${count} user(s)`;
                    }
                },
            ],
            data: state.getAll('roles'),
            searchKeys: ['name'],
            emptyMessage: 'No roles defined',
            emptyIcon: '🔑',
            actions: [
                { label: 'Delete', danger: true, onClick: (r) => this.#deleteRole(r) },
            ],
        });

        // AD panel content
        const adPanel = el.querySelector('#ad-panel');
        const adConfig = state.getAll('ad_config')[0] || { domain: '', server: '', ou: '', connected: false };
        adPanel.innerHTML = `
            <div class="card">
                <div class="card-header">Active Directory Configuration</div>
                <div class="card-body">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                        <span class="status-badge ${adConfig.connected ? 'good' : 'critical'}"><span class="dot"></span>${adConfig.connected ? 'Connected' : 'Not Connected'}</span>
                        ${adConfig.domain ? `<span class="text-secondary text-sm">${adConfig.domain}</span>` : ''}
                    </div>
                    <div class="form-group">
                        <label class="form-label">Domain Name</label>
                        <input class="form-input" id="ad-domain" value="${adConfig.domain}" placeholder="e.g., ntnxlab.local" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Directory Server</label>
                        <input class="form-input" id="ad-server" value="${adConfig.server}" placeholder="e.g., ldap://10.42.100.10" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Organizational Unit (OU)</label>
                        <input class="form-input" id="ad-ou" value="${adConfig.ou}" placeholder="e.g., OU=Users,DC=ntnxlab,DC=local" />
                    </div>
                    <button class="btn btn-primary" id="save-ad-btn">Save & Test Connection</button>
                </div>
            </div>
        `;

        el.querySelector('#users-panel').appendChild(this.#userTable.render());
        el.querySelector('#roles-panel').appendChild(this.#roleTable.render());

        return el;
    }

    afterRender() {
        document.getElementById('create-user-btn')?.addEventListener('click', () => this.#openUserWizard());
        document.getElementById('create-role-btn')?.addEventListener('click', () => this.#openRoleWizard());
        document.getElementById('save-ad-btn')?.addEventListener('click', () => this.#saveADConfig());

        document.querySelectorAll('.rbac-tab').forEach(tab => {
            tab.addEventListener('click', () => this.#switchTab(tab.dataset.tab));
        });

        const u1 = bus.on('users:created', () => this.#userTable?.setData(state.getAll('users')));
        const u2 = bus.on('users:updated', () => this.#userTable?.setData(state.getAll('users')));
        const u3 = bus.on('users:deleted', () => this.#userTable?.setData(state.getAll('users')));
        const u4 = bus.on('roles:created', () => this.#roleTable?.setData(state.getAll('roles')));
        const u5 = bus.on('roles:deleted', () => this.#roleTable?.setData(state.getAll('roles')));
        this.#unsubs.push(u1, u2, u3, u4, u5);
    }

    destroy() { this.#userTable?.destroy(); this.#roleTable?.destroy(); this.#unsubs.forEach(u => u()); }

    #switchTab(tab) {
        document.querySelectorAll('.rbac-tab').forEach(t => {
            const isActive = t.dataset.tab === tab;
            t.classList.toggle('active', isActive);
            t.style.borderBottom = isActive ? '2px solid var(--prism-blue)' : 'none';
            t.style.fontWeight = isActive ? '600' : '500';
            t.style.color = isActive ? 'var(--text-primary)' : 'var(--text-secondary)';
        });
        ['users', 'roles', 'ad'].forEach(p => {
            const panel = document.getElementById(`${p}-panel`);
            if (panel) panel.style.display = p === tab ? '' : 'none';
        });
    }

    async #deleteUser(user) {
        if (user.username === 'admin') { toast.warning('Cannot delete the default admin user'); return; }
        const ok = await confirm({ title: 'Delete User', message: `Delete user <strong>${user.username}</strong>?`, confirmLabel: 'Delete', danger: true });
        if (ok) { await state.remove('users', user.uuid); toast.success(`User "${user.username}" deleted`); }
    }

    async #deleteRole(role) {
        if (role.type === 'built_in') { toast.warning('Cannot delete built-in roles'); return; }
        const ok = await confirm({ title: 'Delete Role', message: `Delete role <strong>${role.name}</strong>?`, confirmLabel: 'Delete', danger: true });
        if (ok) { await state.remove('roles', role.uuid); toast.success(`Role "${role.name}" deleted`); }
    }

    async #changeRole(user) {
        const roles = state.getAll('roles');
        const wizard = new Wizard({
            title: `Change Role for "${user.username}"`,
            initialData: { role: user.role },
            steps: [{
                label: 'Role',
                render: (data) => `
                    <div class="form-group">
                        <label class="form-label">Role</label>
                        <select class="form-input" data-field="role">
                            ${roles.map(r => `<option value="${r.name}" ${r.name === data.role ? 'selected' : ''}>${r.name}</option>`).join('')}
                        </select>
                    </div>
                `,
            }],
            onComplete: async (data) => {
                await state.update('users', user.uuid, { role: data.role });
                toast.success(`"${user.username}" role changed to ${data.role}`);
            },
        });
        wizard.open();
    }

    #openUserWizard() {
        const roles = state.getAll('roles');
        const wizard = new Wizard({
            title: 'Add User',
            initialData: { username: '', email: '', role: 'Viewer', password: '' },
            steps: [{
                label: 'User Details',
                render: (data) => `
                    <div class="form-group">
                        <label class="form-label">Username</label>
                        <input class="form-input" data-field="username" value="${data.username}" placeholder="e.g., jdoe" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input class="form-input" data-field="email" value="${data.email}" placeholder="e.g., jdoe@example.com" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Role</label>
                        <select class="form-input" data-field="role">
                            ${roles.map(r => `<option value="${r.name}" ${r.name === data.role ? 'selected' : ''}>${r.name}</option>`).join('')}
                        </select>
                    </div>
                `,
                validate: (data) => {
                    const e = [];
                    if (!data.username?.trim()) e.push('Username is required');
                    if (state.getAll('users').some(u => u.username === data.username?.trim())) e.push('Username already exists');
                    return e;
                },
            }],
            onComplete: async (data) => {
                await state.create('users', { username: data.username.trim(), email: data.email, role: data.role, source: 'local', last_login: null });
                toast.success(`User "${data.username}" created with ${data.role} role`);
            },
        });
        wizard.open();
    }

    #openRoleWizard() {
        const allPerms = ['VM.Create', 'VM.Delete', 'VM.PowerOps', 'VM.Update', 'Storage.Create', 'Storage.Delete', 'Network.Create', 'Network.Delete', 'Cluster.View', 'Cluster.Update', 'User.Manage', 'Alert.View', 'Alert.Resolve'];
        const wizard = new Wizard({
            title: 'Create Custom Role',
            initialData: { name: '', selectedPerms: [] },
            steps: [{
                label: 'Role',
                render: (data) => `
                    <div class="form-group">
                        <label class="form-label">Role Name</label>
                        <input class="form-input" data-field="name" value="${data.name}" placeholder="e.g., VM Operator" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Permissions</label>
                        <div style="max-height:300px;overflow-y:auto;border:1px solid var(--border-light);border-radius:4px;">
                            ${allPerms.map(p => `
                                <label style="display:flex;align-items:center;gap:8px;padding:6px 12px;border-bottom:1px solid var(--border-light);cursor:pointer;">
                                    <input type="checkbox" class="perm-check" data-perm="${p}" ${(data.selectedPerms || []).includes(p) ? 'checked' : ''} />
                                    <span style="font-size:13px;">${p}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `,
                bind: (body, data) => {
                    body.querySelectorAll('.perm-check').forEach(cb => {
                        cb.addEventListener('change', () => {
                            data.selectedPerms = [...body.querySelectorAll('.perm-check:checked')].map(c => c.dataset.perm);
                        });
                    });
                },
                validate: (data) => {
                    const e = [];
                    if (!data.name?.trim()) e.push('Role name is required');
                    if ((data.selectedPerms || []).length === 0) e.push('Select at least one permission');
                    return e;
                },
            }],
            onComplete: async (data) => {
                await state.create('roles', { name: data.name.trim(), type: 'custom', permissions: data.selectedPerms || [] });
                toast.success(`Role "${data.name}" created with ${data.selectedPerms.length} permissions`);
            },
        });
        wizard.open();
    }

    async #saveADConfig() {
        const domain = document.getElementById('ad-domain')?.value?.trim();
        const server = document.getElementById('ad-server')?.value?.trim();
        const ou = document.getElementById('ad-ou')?.value?.trim();

        if (!domain || !server) { toast.warning('Domain and server are required'); return; }

        toast.info('Testing AD connection...');
        setTimeout(async () => {
            const existing = state.getAll('ad_config');
            if (existing.length > 0) {
                await state.update('ad_config', existing[0].uuid, { domain, server, ou, connected: true });
            } else {
                await state.create('ad_config', { domain, server, ou, connected: true });
            }
            toast.success(`Connected to ${domain} via ${server}`);
        }, 1500);
    }
}
