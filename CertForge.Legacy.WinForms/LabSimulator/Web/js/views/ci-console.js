import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { EntityTable } from '../components/EntityTable.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

/**
 * NC2 Console Dashboard — Nutanix Cloud Clusters management.
 * Key exam points: single-AZ only, min 3 nodes, hibernate preserves NVMe,
 * my.nutanix.com entry point, no Foundation for cloud nodes.
 */
export class CiConsoleView extends BaseView {
    #clusterTable = null;
    #unsubs = [];

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        const clusters = state.getAll('nc2_clusters');
        const running = clusters.filter(c => c.status === 'running');
        const hibernated = clusters.filter(c => c.status === 'hibernated');
        const totalNodes = clusters.reduce((sum, c) => sum + c.node_count, 0);

        el.innerHTML = `
            <div class="page-title">
                <h1>☁️ NC2 Console — my.nutanix.com</h1>
                <button class="btn btn-primary" id="deploy-cluster-btn">+ Deploy NC2 Cluster</button>
            </div>

            <div class="text-secondary text-sm" style="margin-bottom:var(--space-lg);">
                <strong>Exam Note:</strong> NC2 is managed from <strong>my.nutanix.com</strong> (NC2 Console), NOT Prism Central.
                Foundation is NOT used — the NC2 Console handles all node imaging automatically.
            </div>

            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:var(--space-lg);margin-bottom:var(--space-xl);">
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${clusters.length}</div>
                    <div class="text-secondary text-sm">Total Clusters</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--status-good);">${running.length}</div>
                    <div class="text-secondary text-sm">Running</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--status-warning);">${hibernated.length}</div>
                    <div class="text-secondary text-sm">Hibernated</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--prism-blue);">${totalNodes}</div>
                    <div class="text-secondary text-sm">Total Nodes</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:var(--text-secondary);">${clusters.filter(c => c.provider === 'AWS').length} / ${clusters.filter(c => c.provider === 'Azure').length}</div>
                    <div class="text-secondary text-sm">AWS / Azure</div>
                </div></div>
            </div>

            <div id="cluster-table-wrap"></div>

            <div class="card" style="margin-top:var(--space-xl);">
                <div class="card-header">🎓 NC2 Exam Traps</div>
                <div class="card-body">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:var(--font-size-sm);">
                        <div>
                            <p><strong>❌ "NC2 spans nodes across AZs for HA"</strong><br>FALSE — All nodes MUST be in the same AZ. DSF requires low-latency.</p>
                            <p><strong>❌ "Use Foundation to image cloud nodes"</strong><br>FALSE — NC2 Console handles imaging automatically.</p>
                            <p><strong>❌ "r5.metal works because it's bare-metal"</strong><br>FALSE — r5.metal uses EBS only, no local NVMe. NC2 requires i3.metal or i3en.metal.</p>
                        </div>
                        <div>
                            <p><strong>❌ "Can remove nodes to single node"</strong><br>FALSE — Minimum 3 nodes enforced for quorum + RF2.</p>
                            <p><strong>❌ "Add EBS volumes to expand storage"</strong><br>FALSE — Only local NVMe used. Add nodes to expand capacity.</p>
                            <p><strong>❌ "Can mix i3.metal + i3en.metal"</strong><br>FALSE — All nodes must be identical instance type.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.#clusterTable = new EntityTable({
            columns: [
                { key: 'name', label: 'Cluster Name', sortable: true, render: (v) => `<strong>${v}</strong>` },
                { key: 'provider', label: 'Provider', sortable: true, render: (v) => v === 'AWS' ? '🟠 AWS' : '🔵 Azure' },
                { key: 'region', label: 'Region', sortable: true },
                { key: 'az', label: 'AZ' },
                { key: 'instance_type', label: 'Instance Type', render: (v) => `<code>${v}</code>` },
                { key: 'node_count', label: 'Nodes', sortable: true, render: (v) => `${v}` },
                { key: 'rf', label: 'RF' },
                {
                    key: 'status', label: 'Status', sortable: true,
                    render: (v) => {
                        const cls = { running: 'good', hibernated: 'warning', deploying: 'info', error: 'critical' }[v] || 'info';
                        return `<span class="status-badge ${cls}"><span class="dot"></span>${v}</span>`;
                    }
                },
            ],
            data: clusters,
            searchKeys: ['name', 'provider', 'region'],
            emptyMessage: 'No NC2 clusters deployed. Click "Deploy NC2 Cluster" to begin.',
            emptyIcon: '☁️',
            actions: [
                { label: 'Hibernate', onClick: (c) => this.#hibernate(c) },
                { label: 'Resume', onClick: (c) => this.#resume(c) },
                { label: 'Add Node', onClick: (c) => this.#addNode(c) },
                { label: 'Remove Node', onClick: (c) => this.#removeNode(c) },
                { label: 'Delete', danger: true, onClick: (c) => this.#deleteCluster(c) },
            ],
        });

        el.querySelector('#cluster-table-wrap').appendChild(this.#clusterTable.render());
        return el;
    }

    afterRender() {
        document.getElementById('deploy-cluster-btn')?.addEventListener('click', () => {
            window.location.hash = '#/pc/nc2-deploy';
        });

        const refresh = () => this.#clusterTable?.setData(state.getAll('nc2_clusters'));
        const u1 = bus.on('nc2_clusters:created', refresh);
        const u2 = bus.on('nc2_clusters:updated', refresh);
        const u3 = bus.on('nc2_clusters:deleted', refresh);
        this.#unsubs.push(u1, u2, u3);
    }

    destroy() { this.#clusterTable?.destroy(); this.#unsubs.forEach(u => u()); }

    async #hibernate(c) {
        if (c.status === 'hibernated') { toast.warning('Cluster is already hibernated'); return; }
        if (c.status !== 'running') { toast.error('Only running clusters can be hibernated'); return; }

        const ok = await confirm({
            title: 'Hibernate Cluster',
            message: `Hibernate <strong>${c.name}</strong>?<br><br>
                This will:<br>
                • Power down all VMs<br>
                • Shut down CVMs gracefully<br>
                • Stop bare-metal instances (NOT terminate)<br>
                • Preserve local NVMe data<br>
                • Backup metadata to ${c.provider === 'AWS' ? 'S3' : 'Azure Blob Storage'}<br><br>
                <span class="text-secondary text-sm">💡 Billing stops for compute. Storage metadata backup costs remain.</span>`,
            confirmLabel: 'Hibernate',
        });
        if (ok) {
            await state.update('nc2_clusters', c.uuid, { status: 'hibernated' });
            toast.success(`Cluster "${c.name}" hibernated. Metadata backed up to ${c.provider === 'AWS' ? 'S3' : 'Blob Storage'}.`);
        }
    }

    async #resume(c) {
        if (c.status !== 'hibernated') { toast.warning('Only hibernated clusters can be resumed'); return; }
        await state.update('nc2_clusters', c.uuid, { status: 'running' });
        toast.success(`Cluster "${c.name}" resuming. NVMe data intact, DSF rebalancing...`);
    }

    async #addNode(c) {
        if (c.status !== 'running') { toast.error('Cluster must be running to add nodes'); return; }
        const ok = await confirm({
            title: 'Add Node',
            message: `Add a <code>${c.instance_type}</code> node to <strong>${c.name}</strong> in <strong>${c.az}</strong>?<br><br>
                <span class="text-secondary text-sm">New node will be in the same AZ. Data will automatically rebalance.</span>`,
            confirmLabel: 'Add Node',
        });
        if (ok) {
            const newCount = c.node_count + 1;
            await state.update('nc2_clusters', c.uuid, { node_count: newCount });
            toast.success(`Node added to "${c.name}". Now ${newCount} nodes. Rebalancing data...`);
        }
    }

    async #removeNode(c) {
        if (c.status !== 'running') { toast.error('Cluster must be running to remove nodes'); return; }
        if (c.node_count <= 3) {
            toast.error('Cannot remove node: minimum 3 nodes required for quorum and RF2 data redundancy.');
            return;
        }
        const ok = await confirm({
            title: 'Remove Node',
            message: `Remove a node from <strong>${c.name}</strong>?<br>
                Current nodes: ${c.node_count} → ${c.node_count - 1}<br><br>
                ⚠️ <strong>Minimum 3 nodes</strong> required for quorum.`,
            confirmLabel: 'Remove Node',
            danger: true,
        });
        if (ok) {
            const newCount = c.node_count - 1;
            await state.update('nc2_clusters', c.uuid, { node_count: newCount });
            toast.success(`Node removed from "${c.name}". Now ${newCount} nodes. Data migrating...`);
        }
    }

    async #deleteCluster(c) {
        const ok = await confirm({
            title: 'Delete NC2 Cluster',
            message: `Delete <strong>${c.name}</strong>? This will terminate all ${c.provider} instances and destroy all data.`,
            confirmLabel: 'Delete Cluster',
            danger: true,
        });
        if (ok) {
            await state.remove('nc2_clusters', c.uuid);
            toast.success(`Cluster "${c.name}" deleted.`);
        }
    }
}
