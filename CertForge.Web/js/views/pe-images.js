import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { toast } from '../components/Toast.js';

/**
 * PE Images — Image configuration and management.
 */
export class PeImagesView extends BaseView {
    #table = null;
    #unsubs = [];

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        const header = document.createElement('div');
        header.className = 'page-title';
        header.innerHTML = `
            <h1>Image Configuration</h1>
            <button class="btn btn-primary" id="upload-image-btn">+ Upload Image</button>
        `;
        el.appendChild(header);

        this.#table = new EntityTable({
            columns: [
                { key: 'name', label: 'Name', sortable: true, render: (v) => `<strong>${v}</strong>` },
                {
                    key: 'type', label: 'Type', sortable: true,
                    render: (v) => v === 'DISK_IMAGE'
                        ? '<span class="status-badge good"><span class="dot"></span>Disk</span>'
                        : '<span class="status-badge info" style="background:var(--status-info-bg);color:var(--status-info);"><span class="dot"></span>ISO</span>'
                },
                { key: 'size_gb', label: 'Size', sortable: true, render: (v) => `${v} GB` },
                {
                    key: 'source', label: 'Source',
                    render: (v) => `<span class="font-mono text-sm" style="word-break:break-all;">${v.length > 60 ? v.slice(0, 60) + '...' : v}</span>`
                },
            ],
            data: state.images,
            searchKeys: ['name'],
            emptyMessage: 'No images uploaded',
            emptyIcon: '💿',
            actions: [
                {
                    label: 'Delete',
                    danger: true,
                    onClick: async (img) => {
                        await state.remove('images', img.uuid);
                        toast.success(`Image "${img.name}" deleted`);
                    }
                },
            ],
        });

        el.appendChild(this.#table.render());
        return el;
    }

    afterRender() {
        document.getElementById('upload-image-btn')?.addEventListener('click', () => this.#showUploadDialog());
        const unsub = bus.on('images:created', () => this.#table?.setData(state.images));
        const unsub2 = bus.on('images:deleted', () => this.#table?.setData(state.images));
        this.#unsubs.push(unsub, unsub2);
    }

    destroy() {
        this.#table?.destroy();
        this.#unsubs.forEach(u => u());
    }

    #showUploadDialog() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal" style="min-width:480px;">
                <div class="modal-header">
                    <h2>Upload Image</h2>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">Image Name</label>
                        <input class="form-input" id="img-name" placeholder="e.g., Rocky-Linux-9" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Image Type</label>
                        <select class="form-input" id="img-type">
                            <option value="DISK_IMAGE">Disk Image (QCOW2, VMDK, RAW)</option>
                            <option value="ISO_IMAGE">ISO Image</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Source URL</label>
                        <input class="form-input" id="img-source" placeholder="https://..." />
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn cancel-btn">Cancel</button>
                    <button class="btn btn-primary save-btn">Upload</button>
                </div>
            </div>
        `;

        const close = () => overlay.remove();
        overlay.querySelector('.modal-close').addEventListener('click', close);
        overlay.querySelector('.cancel-btn').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

        overlay.querySelector('.save-btn').addEventListener('click', async () => {
            const name = overlay.querySelector('#img-name').value.trim();
            const type = overlay.querySelector('#img-type').value;
            const source = overlay.querySelector('#img-source').value.trim();

            if (!name) { toast.warning('Image name is required'); return; }
            if (!source) { toast.warning('Source URL is required'); return; }

            await state.create('images', { name, type, size_gb: Math.round(Math.random() * 8 + 1), source });
            toast.success(`Image "${name}" uploaded`);
            close();
        });

        document.body.appendChild(overlay);
    }
}
