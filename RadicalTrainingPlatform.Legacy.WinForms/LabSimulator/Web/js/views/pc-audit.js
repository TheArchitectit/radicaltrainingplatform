import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';

/**
 * PC Audit Log — Activity feed tracking all state changes across the simulator.
 */
export class PcAuditView extends BaseView {
    #table = null;
    #unsub = null;

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        const logs = state.getAll('audit_log');

        // Summary
        const lastHour = logs.filter(l => (Date.now() - new Date(l.timestamp).getTime()) < 3600000).length;
        const actions = {};
        logs.forEach(l => { actions[l.action] = (actions[l.action] || 0) + 1; });
        const topAction = Object.entries(actions).sort((a, b) => b[1] - a[1])[0];

        el.innerHTML = `
            <div class="page-title">
                <h1>📜 Audit Log</h1>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-secondary btn-sm" id="export-audit-btn">📥 Export CSV</button>
                    <button class="btn btn-secondary btn-sm" id="clear-audit-btn">🗑️ Clear Log</button>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:var(--space-lg);">
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;">${logs.length}</div>
                    <div class="text-secondary text-sm">Total Events</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;">${lastHour}</div>
                    <div class="text-secondary text-sm">Last Hour</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;">${topAction ? topAction[0] : '—'}</div>
                    <div class="text-secondary text-sm">Most Frequent</div>
                </div></div>
            </div>

            <div id="audit-table-container"></div>
        `;

        return el;
    }

    afterRender() {
        this.#buildTable();

        document.getElementById('export-audit-btn')?.addEventListener('click', () => this.#exportCSV());
        document.getElementById('clear-audit-btn')?.addEventListener('click', async () => {
            const logs = state.getAll('audit_log');
            for (const log of logs) await state.remove('audit_log', log.uuid);
            this.#buildTable();
        });

        this.#unsub = bus.on('audit_log:created', () => this.#buildTable());
    }

    destroy() {
        this.#table?.destroy();
        this.#unsub?.();
    }

    #buildTable() {
        const container = document.getElementById('audit-table-container');
        if (!container) return;
        this.#table?.destroy();

        const logs = state.getAll('audit_log').slice().reverse();

        this.#table = new EntityTable({
            columns: [
                {
                    key: 'timestamp', label: 'Time', sortable: true,
                    render: (val) => `<span class="font-mono text-sm">${new Date(val).toLocaleString()}</span>`
                },
                {
                    key: 'action', label: 'Action', sortable: true,
                    render: (val) => {
                        const icons = { create: '🟢', update: '🟡', delete: '🔴' };
                        return `${icons[val] || '⚪'} ${val}`;
                    }
                },
                { key: 'collection', label: 'Resource Type', sortable: true },
                {
                    key: 'entity_name', label: 'Entity', sortable: true,
                    render: (val) => `<strong>${this.#esc(val || '—')}</strong>`
                },
                { key: 'user', label: 'User', render: () => 'admin' },
                {
                    key: 'details', label: 'Details',
                    render: (val) => `<span class="text-secondary text-sm">${this.#esc(val || '')}</span>`
                },
            ],
            data: logs,
            searchKeys: ['collection', 'entity_name', 'action', 'details'],
            emptyMessage: 'No audit events recorded yet. Perform actions in the simulator to see them here.',
            emptyIcon: '📜',
        });

        container.innerHTML = '';
        container.appendChild(this.#table.render());
    }

    #exportCSV() {
        const logs = state.getAll('audit_log');
        const header = 'Timestamp,Action,Collection,Entity,Details';
        const rows = logs.map(l => `"${l.timestamp}","${l.action}","${l.collection}","${l.entity_name || ''}","${(l.details || '').replace(/"/g, '""')}"`);
        const csv = [header, ...rows].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'audit_log.csv'; a.click();
        URL.revokeObjectURL(url);
    }

    #esc(str) { return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
}
