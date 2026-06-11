import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

/**
 * NC2 Networking — AWS VPC + Azure VNet/Flow Gateway configuration.
 * Exam traps: /25 min AWS, /24 min Azure, Flow Gateway mandatory on Azure,
 * noNAT irreversible, max 4 Flow Gateways, Route Server for BGP.
 */
export class CiNetworkingView extends BaseView {
    #unsubs = [];
    #selectedCluster = null;

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        const clusters = state.getAll('nc2_clusters');

        el.innerHTML = `
            <div class="page-title">
                <h1>🌐 NC2 Networking</h1>
            </div>

            ${clusters.length === 0 ? `
                <div class="card">
                    <div class="card-body" style="text-align:center;padding:48px;">
                        <div style="font-size:48px;margin-bottom:16px;">🌐</div>
                        <h3>No NC2 Clusters Deployed</h3>
                        <p class="text-secondary">Deploy an NC2 cluster first to configure networking.</p>
                        <button class="btn btn-primary" style="margin-top:16px;" onclick="location.hash='#/pc/nc2-deploy'">Deploy NC2 Cluster</button>
                    </div>
                </div>
            ` : `
                <div class="form-group" style="max-width:400px;margin-bottom:var(--space-xl);">
                    <label class="form-label">Select Cluster</label>
                    <select class="form-input" id="cluster-select">
                        ${clusters.map((c, i) => `<option value="${c.uuid}" ${i === 0 ? 'selected' : ''}>${c.name} (${c.provider} — ${c.region})</option>`).join('')}
                    </select>
                </div>
                <div id="networking-content"></div>
            `}

            <!-- Reference panels always visible -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-lg);margin-top:var(--space-xl);">
                <div class="card">
                    <div class="card-header">🟠 AWS Networking Architecture</div>
                    <div class="card-body" style="font-size:var(--font-size-sm);">
                        <div style="background:var(--surface-tertiary);padding:16px;border-radius:6px;font-family:monospace;font-size:12px;white-space:pre;line-height:1.8;">
VPC (/16 recommended)
├── Host Subnet (/25 minimum)
│   ├── NC2 Nodes (i3.metal)
│   ├── CVMs
│   └── Prism Central
├── Public Subnet
│   ├── NAT Gateway (outbound internet)
│   └── Internet Gateway
├── Security Groups
│   ├── Port 9440 → Prism UI/API
│   ├── Port 2049 → NFS
│   ├── Port 3260 → iSCSI
│   └── Port 22   → SSH
└── Connectivity
    ├── Direct Connect (dedicated private)
    ├── Transit Gateway (hub-and-spoke)
    ├── VPC Peering (point-to-point, NON-transitive)
    └── Site-to-Site VPN (IPsec backup)</div>
                        <p style="margin-top:12px;"><strong>Key:</strong> No Flow Gateway needed. VPC natively integrates with AHV overlay.</p>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">🔵 Azure Networking Architecture</div>
                    <div class="card-body" style="font-size:var(--font-size-sm);">
                        <div style="background:var(--surface-tertiary);padding:16px;border-radius:6px;font-family:monospace;font-size:12px;white-space:pre;line-height:1.8;">
VNet (custom address space)
├── Delegated Subnet (/24 minimum)
│   ├── BareMetal nodes
│   ├── CVMs
│   └── ⚠️ MUST be empty before delegation
├── Flow Gateways (2-4, ECMP)
│   ├── Bridges AHV overlay ↔ VNet
│   ├── Floating IP for HA
│   └── MANDATORY (unlike AWS)
├── Network Mode (IRREVERSIBLE!)
│   ├── noNAT → direct routing (recommended)
│   └── NAT → address translation (conflicts only)
├── NSG Rules
│   ├── Inbound: 9440, 2049, 3260
│   └── Outbound: 443 (Azure mgmt endpoints)
└── Connectivity
    ├── Route Server (BGP peering for Flow GW)
    ├── ExpressRoute (dedicated, up to 100 Gbps)
    ├── VPN Gateway (IKEv2, hourly+egress cost)
    └── UDR (static routes for L2 stretch)</div>
                        <p style="margin-top:12px;"><strong>Key:</strong> Flow Gateway is <strong>mandatory</strong>. Route Server needed for BGP.</p>
                    </div>
                </div>
            </div>

            <div class="card" style="margin-top:var(--space-lg);">
                <div class="card-header">🎓 Networking Exam Traps</div>
                <div class="card-body">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:var(--font-size-sm);">
                        <div>
                            <p><strong>❌ "AWS needs Flow Gateway like Azure"</strong><br>FALSE — AWS VPC natively integrates with AHV overlay. Only Azure requires Flow Gateway.</p>
                            <p><strong>❌ "VPC Peering is transitive"</strong><br>FALSE — VPC Peering is non-transitive. Use Transit Gateway for multi-VPC hub-and-spoke.</p>
                            <p><strong>❌ "Set dedicated tenancy for better isolation"</strong><br>FALSE — Bare-metal is already isolated. Dedicated adds premium cost with zero benefit.</p>
                            <p><strong>❌ "/28 subnet is fine for small cluster"</strong><br>FALSE — Minimum /25 (AWS) or /24 (Azure). Too small = IP exhaustion.</p>
                        </div>
                        <div>
                            <p><strong>❌ "Can change noNAT → NAT after deploy"</strong><br>FALSE — Network mode is IRREVERSIBLE after deployment.</p>
                            <p><strong>❌ "Delegated subnet can have existing VMs"</strong><br>FALSE — Azure delegated subnet MUST be empty before delegation.</p>
                            <p><strong>❌ "L2 stretch works without Route Server"</strong><br>FALSE — Route Server needed for Flow Gateway route propagation.</p>
                            <p><strong>❌ "Transit Gateway auto-routes"</strong><br>FALSE — Must configure route propagation or static routes in TGW route table.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card" style="margin-top:var(--space-lg);">
                <div class="card-header">Required Ports Reference</div>
                <div class="card-body" style="padding:0;">
                    <table style="width:100%;border-collapse:collapse;font-size:var(--font-size-sm);">
                        <thead><tr style="background:var(--bg-secondary);border-bottom:2px solid var(--border-light);">
                            <th style="padding:10px 16px;text-align:left;">Port</th>
                            <th style="padding:10px 16px;text-align:left;">Protocol</th>
                            <th style="padding:10px 16px;text-align:left;">Service</th>
                            <th style="padding:10px 16px;text-align:left;">Direction</th>
                        </tr></thead>
                        <tbody>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px 16px;"><code>9440</code></td><td>TCP</td><td>Prism Element/Central UI & API</td><td>Inbound</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px 16px;"><code>2049</code></td><td>TCP/UDP</td><td>NFS (Files/storage)</td><td>Inbound</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px 16px;"><code>3260</code></td><td>TCP</td><td>iSCSI (Volumes)</td><td>Inbound</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px 16px;"><code>22</code></td><td>TCP</td><td>SSH (management)</td><td>Inbound</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px 16px;"><code>443</code></td><td>TCP</td><td>Azure management endpoints</td><td>Outbound (Azure only)</td></tr>
                            <tr><td style="padding:8px 16px;"><code>All</code></td><td>All</td><td>Inter-node cluster communication</td><td>Internal</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        return el;
    }

    afterRender() {
        const select = document.getElementById('cluster-select');
        if (select) {
            select.addEventListener('change', () => this.#renderClusterNetworking(select.value));
            this.#renderClusterNetworking(select.value);
        }

        const refresh = () => {
            const sel = document.getElementById('cluster-select');
            if (sel) this.#renderClusterNetworking(sel.value);
        };
        const u1 = bus.on('nc2_clusters:updated', refresh);
        this.#unsubs.push(u1);
    }

    destroy() { this.#unsubs.forEach(u => u()); }

    #renderClusterNetworking(uuid) {
        const container = document.getElementById('networking-content');
        if (!container) return;

        const c = state.get('nc2_clusters', uuid);
        if (!c) { container.innerHTML = '<p class="text-secondary">Cluster not found</p>'; return; }

        this.#selectedCluster = c;

        if (c.provider === 'AWS') {
            this.#renderAWSNetworking(container, c);
        } else {
            this.#renderAzureNetworking(container, c);
        }
    }

    #renderAWSNetworking(container, c) {
        container.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-lg);margin-bottom:var(--space-xl);">
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:24px;font-weight:700;color:var(--prism-blue);">🟠 AWS</div>
                    <div class="text-secondary text-sm">${c.region}</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:20px;font-weight:700;"><code>${c.vpc_cidr}</code></div>
                    <div class="text-secondary text-sm">VPC CIDR</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:20px;font-weight:700;"><code>${c.subnet_cidr}</code></div>
                    <div class="text-secondary text-sm">Host Subnet (AZ: ${c.az})</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:20px;font-weight:700;">No FGW</div>
                    <div class="text-secondary text-sm">Flow Gateway not needed</div>
                </div></div>
            </div>

            <!-- Security Groups -->
            <div class="card" style="margin-bottom:var(--space-lg);">
                <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
                    Security Groups
                    <button class="btn btn-sm btn-secondary" id="add-sg-rule-btn">+ Add Rule</button>
                </div>
                <div class="card-body" style="padding:0;">
                    <table style="width:100%;border-collapse:collapse;font-size:var(--font-size-sm);">
                        <thead><tr style="background:var(--bg-secondary);border-bottom:2px solid var(--border-light);">
                            <th style="padding:10px 16px;text-align:left;">Direction</th>
                            <th style="padding:10px 16px;text-align:left;">Port</th>
                            <th style="padding:10px 16px;text-align:left;">Protocol</th>
                            <th style="padding:10px 16px;text-align:left;">Source/Dest CIDR</th>
                            <th style="padding:10px 16px;text-align:left;">Description</th>
                        </tr></thead>
                        <tbody>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px 16px;">Inbound</td><td><code>9440</code></td><td>TCP</td><td><code>10.0.0.0/8</code></td><td>Prism UI/API</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px 16px;">Inbound</td><td><code>2049</code></td><td>TCP/UDP</td><td><code>10.0.0.0/8</code></td><td>NFS</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px 16px;">Inbound</td><td><code>3260</code></td><td>TCP</td><td><code>10.0.0.0/8</code></td><td>iSCSI</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px 16px;">Inbound</td><td><code>22</code></td><td>TCP</td><td><code>10.42.0.0/16</code></td><td>SSH (mgmt only)</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px 16px;">Inbound</td><td><code>All</code></td><td>All</td><td><code>Self</code></td><td>Inter-node cluster</td></tr>
                            <tr><td style="padding:8px 16px;">Outbound</td><td><code>All</code></td><td>All</td><td><code>0.0.0.0/0</code></td><td>Internet (via NAT GW)</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Connectivity Options -->
            <div class="card">
                <div class="card-header">Connectivity Services</div>
                <div class="card-body">
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
                        <div style="padding:16px;background:var(--bg-secondary);border-radius:6px;">
                            <strong>Direct Connect</strong>
                            <p class="text-secondary text-sm" style="margin-top:4px;">Dedicated private connection. BGP dynamic routing. LAG for link aggregation. Best for production hybrid.</p>
                            <span class="status-badge good" style="margin-top:8px;display:inline-block;"><span class="dot"></span>Available</span>
                        </div>
                        <div style="padding:16px;background:var(--bg-secondary);border-radius:6px;">
                            <strong>Transit Gateway</strong>
                            <p class="text-secondary text-sm" style="margin-top:4px;">Hub-and-spoke multi-VPC. Simplifies routing. Non-transitive via peering (use TGW instead).</p>
                            <span class="status-badge good" style="margin-top:8px;display:inline-block;"><span class="dot"></span>Available</span>
                        </div>
                        <div style="padding:16px;background:var(--bg-secondary);border-radius:6px;">
                            <strong>Site-to-Site VPN</strong>
                            <p class="text-secondary text-sm" style="margin-top:4px;">IPsec tunnels. Backup for Direct Connect. BGP supported for dynamic routing.</p>
                            <span class="status-badge info" style="margin-top:8px;display:inline-block;"><span class="dot"></span>Backup Option</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('add-sg-rule-btn')?.addEventListener('click', () => {
            toast.info('Security Group rules can be managed in the AWS Console. This view shows the required NC2 rules.');
        });
    }

    #renderAzureNetworking(container, c) {
        container.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:var(--space-lg);margin-bottom:var(--space-xl);">
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:24px;font-weight:700;color:var(--prism-blue);">🔵 Azure</div>
                    <div class="text-secondary text-sm">${c.region}</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:20px;font-weight:700;"><code>${c.vpc_cidr}</code></div>
                    <div class="text-secondary text-sm">VNet CIDR</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:20px;font-weight:700;"><code>${c.subnet_cidr}</code></div>
                    <div class="text-secondary text-sm">Delegated Subnet (/24 min)</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:24px;font-weight:700;color:var(--prism-blue);">${c.flow_gateway_count}</div>
                    <div class="text-secondary text-sm">Flow Gateways (ECMP)</div>
                </div></div>
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div style="font-size:20px;font-weight:700;color:${c.network_mode === 'noNAT' ? 'var(--status-good)' : 'var(--status-warning)'};">${c.network_mode}</div>
                    <div class="text-secondary text-sm">Mode (🔒 irreversible)</div>
                </div></div>
            </div>

            <!-- Flow Gateway Panel -->
            <div class="card" style="margin-bottom:var(--space-lg);">
                <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
                    Flow Gateways (${c.flow_gateway_count}/4)
                    <div style="display:flex;gap:8px;">
                        <button class="btn btn-sm btn-secondary" id="add-fgw-btn">+ Add Gateway</button>
                        <button class="btn btn-sm btn-secondary" id="remove-fgw-btn">- Remove Gateway</button>
                    </div>
                </div>
                <div class="card-body">
                    <div style="display:grid;grid-template-columns:repeat(${c.flow_gateway_count},1fr);gap:16px;">
                        ${Array.from({ length: c.flow_gateway_count }, (_, i) => `
                            <div style="padding:16px;background:var(--bg-secondary);border-radius:6px;text-align:center;">
                                <div style="font-size:28px;">🔗</div>
                                <strong>FGW-${i + 1}</strong>
                                <p class="text-secondary text-sm" style="margin-top:4px;">
                                    IP: 10.200.1.${10 + i}<br>
                                    ECMP Active
                                </p>
                                <span class="status-badge good"><span class="dot"></span>Healthy</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="text-secondary text-sm" style="margin-top:12px;">
                        <strong>Mode: ${c.network_mode}</strong> —
                        ${c.network_mode === 'noNAT'
                            ? 'VMs keep original IPs. Direct routing via Flow Gateway. Recommended for most deployments.'
                            : 'VMs translated to Azure VNet address space. Use only when NC2 subnets overlap with existing networks.'}
                        <br>⚠️ Network mode was set at deployment and <strong>cannot be changed</strong>.
                    </div>
                </div>
            </div>

            <!-- NSG Rules -->
            <div class="card" style="margin-bottom:var(--space-lg);">
                <div class="card-header">Network Security Group (NSG)</div>
                <div class="card-body" style="padding:0;">
                    <table style="width:100%;border-collapse:collapse;font-size:var(--font-size-sm);">
                        <thead><tr style="background:var(--bg-secondary);border-bottom:2px solid var(--border-light);">
                            <th style="padding:10px 16px;text-align:left;">Direction</th>
                            <th style="padding:10px 16px;text-align:left;">Port</th>
                            <th style="padding:10px 16px;text-align:left;">Protocol</th>
                            <th style="padding:10px 16px;text-align:left;">Source/Dest</th>
                            <th style="padding:10px 16px;text-align:left;">Description</th>
                        </tr></thead>
                        <tbody>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px 16px;">Inbound</td><td><code>9440</code></td><td>TCP</td><td><code>VirtualNetwork</code></td><td>Prism UI/API</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px 16px;">Inbound</td><td><code>2049</code></td><td>TCP/UDP</td><td><code>VirtualNetwork</code></td><td>NFS</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px 16px;">Inbound</td><td><code>3260</code></td><td>TCP</td><td><code>VirtualNetwork</code></td><td>iSCSI</td></tr>
                            <tr style="border-bottom:1px solid var(--border-light);"><td style="padding:8px 16px;">Outbound</td><td><code>443</code></td><td>TCP</td><td><code>AzureCloud</code></td><td>Azure management APIs</td></tr>
                            <tr><td style="padding:8px 16px;">Inbound</td><td><code>All</code></td><td>All</td><td><code>Self</code></td><td>Inter-node cluster</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Azure Connectivity -->
            <div class="card">
                <div class="card-header">Azure Connectivity Services</div>
                <div class="card-body">
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
                        <div style="padding:16px;background:var(--bg-secondary);border-radius:6px;">
                            <strong>Route Server</strong>
                            <p class="text-secondary text-sm" style="margin-top:4px;">BGP peering endpoint for Flow Gateway. Enables dynamic route advertisement to Azure VNet. Required for L2 stretch.</p>
                            <span class="status-badge good" style="margin-top:8px;display:inline-block;"><span class="dot"></span>Configured</span>
                        </div>
                        <div style="padding:16px;background:var(--bg-secondary);border-radius:6px;">
                            <strong>ExpressRoute</strong>
                            <p class="text-secondary text-sm" style="margin-top:4px;">Dedicated private connection. Up to 100 Gbps. Private peering for on-prem connectivity. Higher cost, consistent latency.</p>
                            <span class="status-badge good" style="margin-top:8px;display:inline-block;"><span class="dot"></span>Available</span>
                        </div>
                        <div style="padding:16px;background:var(--bg-secondary);border-radius:6px;">
                            <strong>VPN Gateway</strong>
                            <p class="text-secondary text-sm" style="margin-top:4px;">IKEv2 VPN. Hourly SKU cost + egress charges. Variable latency. Good for backup or dev/test.</p>
                            <span class="status-badge info" style="margin-top:8px;display:inline-block;"><span class="dot"></span>Backup Option</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('add-fgw-btn')?.addEventListener('click', () => this.#addFlowGateway(c));
        document.getElementById('remove-fgw-btn')?.addEventListener('click', () => this.#removeFlowGateway(c));
    }

    async #addFlowGateway(c) {
        if (c.flow_gateway_count >= 4) {
            toast.error('Maximum 4 Flow Gateways in ECMP. Cannot add more.');
            return;
        }
        const ok = await confirm({
            title: 'Add Flow Gateway',
            message: `Add Flow Gateway to <strong>${c.name}</strong>?<br>Current: ${c.flow_gateway_count} → ${c.flow_gateway_count + 1} (max 4)`,
            confirmLabel: 'Add Gateway',
        });
        if (ok) {
            await state.update('nc2_clusters', c.uuid, { flow_gateway_count: c.flow_gateway_count + 1 });
            toast.success(`Flow Gateway added. Now ${c.flow_gateway_count + 1}/4 in ECMP.`);
        }
    }

    async #removeFlowGateway(c) {
        if (c.flow_gateway_count <= 2) {
            toast.error('Minimum 2 Flow Gateways required for HA. Cannot remove.');
            return;
        }
        const ok = await confirm({
            title: 'Remove Flow Gateway',
            message: `Remove a Flow Gateway from <strong>${c.name}</strong>?<br>Current: ${c.flow_gateway_count} → ${c.flow_gateway_count - 1} (min 2 for HA)`,
            confirmLabel: 'Remove',
            danger: true,
        });
        if (ok) {
            await state.update('nc2_clusters', c.uuid, { flow_gateway_count: c.flow_gateway_count - 1 });
            toast.success(`Flow Gateway removed. Now ${c.flow_gateway_count - 1}/4 in ECMP.`);
        }
    }
}
