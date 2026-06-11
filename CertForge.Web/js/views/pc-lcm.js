import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

/**
 * PC LCM — Life Cycle Manager: firmware/software inventory, update workflows.
 * Shows current component versions, available updates, and update history.
 */
export class PcLcmView extends BaseView {
    #table = null;
    #unsubs = [];
    #activeTab = 'inventory';

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        const header = document.createElement('div');
        header.className = 'page-title';
        header.innerHTML = `
            <h1>Life Cycle Manager (LCM)</h1>
            <button class="btn btn-primary" id="lcm-check-btn">🔍 Check for Updates</button>
        `;
        el.appendChild(header);

        // Tabs
        const tabs = document.createElement('div');
        tabs.className = 'tabs';
        tabs.innerHTML = `
            <button class="tab active" data-tab="inventory">Inventory</button>
            <button class="tab" data-tab="updates">Available Updates</button>
            <button class="tab" data-tab="history">Update History</button>
        `;
        el.appendChild(tabs);

        const content = document.createElement('div');
        content.id = 'lcm-content';
        el.appendChild(content);

        return el;
    }

    afterRender() {
        this.#renderTab(this.#activeTab);

        document.querySelectorAll('.tabs .tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.#activeTab = tab.dataset.tab;
                this.#renderTab(this.#activeTab);
            });
        });

        document.getElementById('lcm-check-btn')?.addEventListener('click', () => this.#checkForUpdates());

        this.#unsubs.push(bus.on('lcm_inventory:updated', () => this.#renderTab(this.#activeTab)));
    }

    destroy() { this.#unsubs.forEach(fn => fn()); }

    #renderTab(tab) {
        const container = document.getElementById('lcm-content');
        if (!container) return;
        container.innerHTML = '';

        if (tab === 'inventory') this.#renderInventory(container);
        else if (tab === 'updates') this.#renderUpdates(container);
        else this.#renderHistory(container);
    }

    #renderInventory(container) {
        const items = state.getAll('lcm_inventory');

        // Summary cards
        const summary = document.createElement('div');
        summary.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-lg);margin:var(--space-lg) 0;';
        const upToDate = items.filter(i => !i.update_available).length;
        const needsUpdate = items.filter(i => i.update_available).length;
        const firmware = items.filter(i => i.category === 'firmware').length;
        const software = items.filter(i => i.category === 'software').length;
        summary.innerHTML = `
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${items.length}</div>
                <div class="text-secondary text-sm">Total Components</div>
            </div></div>
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--status-good);">${upToDate}</div>
                <div class="text-secondary text-sm">Up to Date</div>
            </div></div>
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:${needsUpdate > 0 ? 'var(--status-warning)' : 'var(--status-good)'};">${needsUpdate}</div>
                <div class="text-secondary text-sm">Updates Available</div>
            </div></div>
            <div class="card"><div class="card-body" style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${firmware} / ${software}</div>
                <div class="text-secondary text-sm">Firmware / Software</div>
            </div></div>
        `;
        container.appendChild(summary);

        this.#table = new EntityTable({
            columns: [
                { key: 'name', label: 'Component' },
                { key: 'category', label: 'Category', render: v => `<span class="badge">${v}</span>` },
                { key: 'entity', label: 'Entity' },
                { key: 'current_version', label: 'Current Version' },
                { key: 'available_version', label: 'Available Version', render: (v, row) => row.update_available ? `<span style="color:var(--status-warning);font-weight:600;">${v}</span>` : '<span class="text-secondary">—</span>' },
                { key: 'status', label: 'Status', render: v => {
                    const colors = { 'up_to_date': 'var(--status-good)', 'update_available': 'var(--status-warning)', 'updating': 'var(--prism-blue)' };
                    const labels = { 'up_to_date': 'Up to Date', 'update_available': 'Update Available', 'updating': 'Updating...' };
                    return `<span style="color:${colors[v] || 'inherit'};">${labels[v] || v}</span>`;
                }},
            ],
            data: items,
            searchKeys: ['name', 'entity', 'category'],
            selectable: true,
            actions: [
                { label: '⬆️ Update Selected', onClick: (item) => this.#updateComponents([item]) },
            ],
            emptyMessage: 'No LCM inventory. Click "Check for Updates" to scan.',
        });
        container.appendChild(this.#table.render());
    }

    #renderUpdates(container) {
        const items = state.getAll('lcm_inventory').filter(i => i.update_available);

        if (items.length === 0) {
            container.innerHTML = '<div class="card"><div class="card-body" style="text-align:center;padding:40px;"><h3>✅ All components are up to date</h3><p class="text-secondary">No pending updates found.</p></div></div>';
            return;
        }

        const table = new EntityTable({
            columns: [
                { key: 'name', label: 'Component' },
                { key: 'entity', label: 'Entity' },
                { key: 'current_version', label: 'Current' },
                { key: 'available_version', label: 'Available' },
                { key: 'update_size_mb', label: 'Size (MB)' },
            ],
            data: items,
            searchKeys: ['name', 'entity'],
            selectable: true,
            actions: [
                { label: '⬆️ Update Selected', onClick: (item) => this.#updateComponents([item]) },
                { label: '⬆️ Update All', onClick: () => this.#updateComponents(items) },
            ],
        });
        container.appendChild(table.render());
    }

    #renderHistory(container) {
        const history = state.getAll('lcm_update_history');

        const table = new EntityTable({
            columns: [
                { key: 'component', label: 'Component' },
                { key: 'from_version', label: 'From' },
                { key: 'to_version', label: 'To' },
                { key: 'status', label: 'Status', render: v => {
                    const c = v === 'success' ? 'var(--status-good)' : v === 'failed' ? 'var(--status-critical)' : 'var(--status-warning)';
                    return `<span style="color:${c};font-weight:600;">${v}</span>`;
                }},
                { key: 'completed_at', label: 'Completed', render: v => v ? new Date(v).toLocaleString() : '—' },
            ],
            data: history,
            searchKeys: ['component'],
            emptyMessage: 'No update history yet.',
        });
        container.appendChild(table.render());
    }

    async #checkForUpdates() {
        toast('Scanning for updates...', 'info');
        // Simulate scanning delay
        await new Promise(r => setTimeout(r, 1500));

        const items = state.getAll('lcm_inventory');
        let foundUpdates = 0;
        for (const item of items) {
            if (Math.random() > 0.7 && !item.update_available) {
                const parts = item.current_version.split('.');
                parts[parts.length - 1] = String(parseInt(parts[parts.length - 1]) + 1);
                await state.update('lcm_inventory', item.uuid, {
                    update_available: true,
                    available_version: parts.join('.'),
                    status: 'update_available',
                    update_size_mb: Math.floor(Math.random() * 500) + 50,
                });
                foundUpdates++;
            }
        }
        toast(`Scan complete. ${foundUpdates} new update(s) found.`, foundUpdates > 0 ? 'warning' : 'success');
        this.#renderTab(this.#activeTab);
    }

    async #updateComponents(selected) {
        if (!selected || selected.length === 0) { toast('Select components to update.', 'warning'); return; }
        const updatable = selected.filter(i => i.update_available);
        if (updatable.length === 0) { toast('Selected components are already up to date.', 'info'); return; }

        const ok = await confirm({ title: 'Update Components', message: `Update ${updatable.length} component(s)? This will simulate a rolling update.`, confirmLabel: 'Update' });
        if (!ok) return;

        toast(`Updating ${updatable.length} component(s)...`, 'info');
        for (const item of updatable) {
            await state.update('lcm_inventory', item.uuid, { status: 'updating' });
        }
        this.#renderTab(this.#activeTab);

        // Simulate update delay
        await new Promise(r => setTimeout(r, 2000));

        for (const item of updatable) {
            await state.update('lcm_inventory', item.uuid, {
                current_version: item.available_version,
                available_version: null,
                update_available: false,
                status: 'up_to_date',
                update_size_mb: 0,
            });
            await state.create('lcm_update_history', {
                component: item.name,
                entity: item.entity,
                from_version: item.current_version,
                to_version: item.available_version,
                status: 'success',
                completed_at: new Date().toISOString(),
            });
        }
        toast(`✅ ${updatable.length} component(s) updated successfully.`, 'success');
        this.#renderTab(this.#activeTab);
    }
}
