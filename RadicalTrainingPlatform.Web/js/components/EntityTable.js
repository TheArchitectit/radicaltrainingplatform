import { bus } from '../core/EventBus.js';

/**
 * EntityTable — Reusable sortable, searchable, selectable data table.
 *
 * Usage:
 *   const table = new EntityTable({
 *     columns: [
 *       { key: 'name', label: 'Name', sortable: true },
 *       { key: 'status', label: 'Status', render: (val) => `<span class="status-badge good"><span class="dot"></span>${val}</span>` },
 *     ],
 *     data: [...],
 *     onRowClick: (item) => { ... },
 *     actions: [{ label: 'Delete', onClick: (item) => { ... }, danger: true }],
 *     emptyMessage: 'No VMs found',
 *     searchKeys: ['name'],
 *   });
 *   container.appendChild(table.render());
 */
export class EntityTable {
    #config;
    #data = [];
    #filtered = [];
    #sortKey = null;
    #sortAsc = true;
    #searchTerm = '';
    #selected = new Set();
    #el = null;

    constructor(config) {
        this.#config = {
            columns: [],
            data: [],
            onRowClick: null,
            actions: [],
            emptyMessage: 'No items found',
            emptyIcon: '📋',
            searchKeys: [],
            selectable: false,
            ...config,
        };
        this.#data = [...this.#config.data];
        this.#filtered = [...this.#data];
    }

    /** Set new data and re-render. */
    setData(data) {
        this.#data = [...data];
        this.#applyFilterSort();
        this.#update();
    }

    /** Get selected items. */
    getSelected() {
        return this.#filtered.filter(item => this.#selected.has(item.uuid));
    }

    render() {
        this.#el = document.createElement('div');
        this.#el.className = 'entity-table-wrapper';
        this.#update();
        return this.#el;
    }

    #update() {
        if (!this.#el) return;

        const { columns, actions, emptyMessage, emptyIcon, searchKeys, selectable } = this.#config;
        const showSearch = searchKeys.length > 0;

        let html = '';

        // Search bar
        if (showSearch) {
            html += `<div class="search-filter">
                <input class="search-input" type="text" placeholder="Search..." value="${this.#escHtml(this.#searchTerm)}" />
                <span class="text-secondary text-sm">${this.#filtered.length} of ${this.#data.length} items</span>
            </div>`;
        }

        if (this.#filtered.length === 0) {
            html += `<div class="empty-state">
                <div class="icon">${emptyIcon}</div>
                <h3>${emptyMessage}</h3>
            </div>`;
        } else {
            html += '<div class="card"><table class="entity-table"><thead><tr>';

            if (selectable) {
                html += `<th style="width:36px;"><input type="checkbox" class="select-all" ${this.#selected.size === this.#filtered.length ? 'checked' : ''} /></th>`;
            }

            for (const col of columns) {
                const sortIndicator = this.#sortKey === col.key
                    ? `<span class="sort-indicator">${this.#sortAsc ? '▲' : '▼'}</span>`
                    : '';
                html += `<th data-sort-key="${col.key}" ${col.sortable !== false ? 'class="sortable"' : ''}>${col.label}${sortIndicator}</th>`;
            }

            if (actions.length > 0) {
                html += '<th style="width:40px;"></th>';
            }

            html += '</tr></thead><tbody>';

            for (const item of this.#filtered) {
                const isSelected = this.#selected.has(item.uuid);
                html += `<tr data-id="${item.uuid}" class="${isSelected ? 'selected' : ''}">`;

                if (selectable) {
                    html += `<td><input type="checkbox" class="row-select" data-id="${item.uuid}" ${isSelected ? 'checked' : ''} /></td>`;
                }

                for (const col of columns) {
                    const val = item[col.key];
                    const rendered = col.render ? col.render(val, item) : this.#escHtml(String(val ?? ''));
                    html += `<td>${rendered}</td>`;
                }

                if (actions.length > 0) {
                    html += `<td><button class="btn action-menu-btn" data-id="${item.uuid}" style="padding:2px 6px;font-size:16px;border:none;">⋯</button></td>`;
                }

                html += '</tr>';
            }

            html += '</tbody></table></div>';
        }

        this.#el.innerHTML = html;
        this.#wireEvents();
    }

    #wireEvents() {
        // Search
        const searchInput = this.#el.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.#searchTerm = e.target.value;
                this.#applyFilterSort();
                this.#update();
                // Re-focus search after re-render
                const newInput = this.#el.querySelector('.search-input');
                if (newInput) {
                    newInput.focus();
                    newInput.setSelectionRange(this.#searchTerm.length, this.#searchTerm.length);
                }
            });
        }

        // Sort
        this.#el.querySelectorAll('th[data-sort-key]').forEach(th => {
            th.addEventListener('click', () => {
                const key = th.dataset.sortKey;
                if (this.#sortKey === key) {
                    this.#sortAsc = !this.#sortAsc;
                } else {
                    this.#sortKey = key;
                    this.#sortAsc = true;
                }
                this.#applyFilterSort();
                this.#update();
            });
        });

        // Row clicks
        if (this.#config.onRowClick) {
            this.#el.querySelectorAll('tbody tr').forEach(tr => {
                tr.style.cursor = 'pointer';
                tr.addEventListener('click', (e) => {
                    if (e.target.closest('.action-menu-btn') || e.target.closest('.row-select')) return;
                    const item = this.#filtered.find(i => i.uuid === tr.dataset.id);
                    if (item) this.#config.onRowClick(item);
                });
            });
        }

        // Action buttons
        this.#el.querySelectorAll('.action-menu-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = this.#filtered.find(i => i.uuid === btn.dataset.id);
                if (item) this.#showActionMenu(btn, item);
            });
        });

        // Select all
        const selectAll = this.#el.querySelector('.select-all');
        if (selectAll) {
            selectAll.addEventListener('change', () => {
                if (selectAll.checked) {
                    this.#filtered.forEach(i => this.#selected.add(i.uuid));
                } else {
                    this.#selected.clear();
                }
                this.#update();
            });
        }

        // Row select
        this.#el.querySelectorAll('.row-select').forEach(cb => {
            cb.addEventListener('change', () => {
                if (cb.checked) this.#selected.add(cb.dataset.id);
                else this.#selected.delete(cb.dataset.id);
                this.#update();
            });
        });
    }

    #showActionMenu(btn, item) {
        // Remove any existing menu
        document.querySelectorAll('.action-popup').forEach(m => m.remove());

        const menu = document.createElement('div');
        menu.className = 'action-popup';
        menu.style.cssText = `
            position: absolute; background: var(--bg-card); border: 1px solid var(--border-default);
            border-radius: var(--radius-md); box-shadow: var(--shadow-md); z-index: 50; min-width: 140px;
        `;

        for (const action of this.#config.actions) {
            const actionBtn = document.createElement('button');
            actionBtn.textContent = action.label;
            actionBtn.style.cssText = `
                display: block; width: 100%; text-align: left; padding: 8px 16px;
                border: none; background: none; cursor: pointer; font-size: 13px;
                color: ${action.danger ? 'var(--status-critical)' : 'var(--text-primary)'};
            `;
            actionBtn.addEventListener('mouseenter', () => actionBtn.style.background = 'var(--bg-table-row-hover)');
            actionBtn.addEventListener('mouseleave', () => actionBtn.style.background = 'none');
            actionBtn.addEventListener('click', () => {
                menu.remove();
                action.onClick(item);
            });
            menu.appendChild(actionBtn);
        }

        const rect = btn.getBoundingClientRect();
        menu.style.top = `${rect.bottom + 4}px`;
        menu.style.left = `${rect.left - 100}px`;
        document.body.appendChild(menu);

        // Close on outside click
        const close = (e) => { if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', close); } };
        setTimeout(() => document.addEventListener('click', close), 0);
    }

    #applyFilterSort() {
        let result = [...this.#data];

        // Filter
        if (this.#searchTerm && this.#config.searchKeys.length > 0) {
            const term = this.#searchTerm.toLowerCase();
            result = result.filter(item =>
                this.#config.searchKeys.some(key => String(item[key] ?? '').toLowerCase().includes(term))
            );
        }

        // Sort
        if (this.#sortKey) {
            result.sort((a, b) => {
                const va = a[this.#sortKey] ?? '';
                const vb = b[this.#sortKey] ?? '';
                const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
                return this.#sortAsc ? cmp : -cmp;
            });
        }

        this.#filtered = result;
    }

    #escHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    destroy() {
        document.querySelectorAll('.action-popup').forEach(m => m.remove());
    }
}
