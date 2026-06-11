import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { Wizard } from '../components/Wizard.js';
import { toast } from '../components/Toast.js';

/**
 * NC2 Deploy Wizard — Step-by-step NC2 cluster deployment.
 * Exam traps: i3.metal/i3en.metal ONLY (rejects r5.metal, virtualized types),
 * single AZ only (no spanning), min 3 nodes, homogeneous instance types.
 */

const AWS_REGIONS = [
    { id: 'us-east-1', name: 'US East (N. Virginia)', azs: ['us-east-1a', 'us-east-1b', 'us-east-1c'] },
    { id: 'us-west-2', name: 'US West (Oregon)', azs: ['us-west-2a', 'us-west-2b', 'us-west-2c'] },
    { id: 'eu-west-1', name: 'EU (Ireland)', azs: ['eu-west-1a', 'eu-west-1b', 'eu-west-1c'] },
    { id: 'ap-southeast-1', name: 'Asia Pacific (Singapore)', azs: ['ap-southeast-1a', 'ap-southeast-1b'] },
];

const AZURE_REGIONS = [
    { id: 'eastus', name: 'East US', azs: ['eastus-az1', 'eastus-az2'] },
    { id: 'westeurope', name: 'West Europe', azs: ['westeurope-az1', 'westeurope-az2'] },
    { id: 'southeastasia', name: 'Southeast Asia', azs: ['southeastasia-az1'] },
];

const AWS_INSTANCE_TYPES = [
    { id: 'i3.metal', label: 'i3.metal — 36 vCPU, 512 GB, 8×1.9 TB NVMe', valid: true },
    { id: 'i3en.metal', label: 'i3en.metal — 96 vCPU, 768 GB, 8×7.5 TB NVMe', valid: true },
    { id: 'r5.metal', label: 'r5.metal — 96 vCPU, 768 GB, EBS only (NO NVMe ❌)', valid: false },
    { id: 'm6i.metal', label: 'm6i.metal — Virtualized (NOT bare-metal ❌)', valid: false },
    { id: 'c6i.xlarge', label: 'c6i.xlarge — Compute optimized (NOT bare-metal ❌)', valid: false },
    { id: 't3.xlarge', label: 't3.xlarge — Burstable (NOT bare-metal ❌)', valid: false },
];

const AZURE_INSTANCE_TYPES = [
    { id: 'BareMetal-AHV', label: 'Azure BareMetal Infrastructure — Dedicated physical server', valid: true },
    { id: 'Standard_D16s_v5', label: 'Standard_D16s_v5 — VM (NOT bare-metal ❌)', valid: false },
    { id: 'Standard_E32s_v5', label: 'Standard_E32s_v5 — VM (NOT bare-metal ❌)', valid: false },
];

export class CiDeployView extends BaseView {
    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        el.innerHTML = `
            <div class="page-title">
                <h1>☁️ Deploy NC2 Cluster</h1>
                <button class="btn btn-secondary" id="back-console-btn">← Back to Console</button>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-xl);margin-bottom:var(--space-xl);">
                <div class="card" id="aws-card" style="cursor:pointer;border:2px solid transparent;transition:border-color 0.2s;">
                    <div class="card-body" style="text-align:center;padding:32px;">
                        <div style="font-size:48px;">🟠</div>
                        <h3 style="margin:12px 0 4px;">Amazon Web Services</h3>
                        <p class="text-secondary text-sm">i3.metal / i3en.metal bare-metal instances<br>Local NVMe storage</p>
                    </div>
                </div>
                <div class="card" id="azure-card" style="cursor:pointer;border:2px solid transparent;transition:border-color 0.2s;">
                    <div class="card-body" style="text-align:center;padding:32px;">
                        <div style="font-size:48px;">🔵</div>
                        <h3 style="margin:12px 0 4px;">Microsoft Azure</h3>
                        <p class="text-secondary text-sm">BareMetal Infrastructure<br>Requires Microsoft.BareMetalInfrastructure provider</p>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">Deployment Prerequisites</div>
                <div class="card-body" style="font-size:var(--font-size-sm);">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
                        <div>
                            <h4>AWS Requirements</h4>
                            <ul style="padding-left:20px;">
                                <li>IAM role with: EC2, VPC, EBS, S3 permissions</li>
                                <li>VPC with /16+ CIDR (recommended)</li>
                                <li>Subnet ≥ /25 in target AZ</li>
                                <li>Internet Gateway or NAT Gateway</li>
                                <li>Security Groups: ports 9440, 2049, 3260, 22</li>
                                <li>Default tenancy (NOT dedicated — no benefit for bare-metal)</li>
                            </ul>
                        </div>
                        <div>
                            <h4>Azure Requirements</h4>
                            <ul style="padding-left:20px;">
                                <li><strong>Microsoft.BareMetalInfrastructure</strong> provider registered</li>
                                <li>VNet with delegated subnet ≥ /24</li>
                                <li>Subnet MUST be empty (no existing VMs/NICs)</li>
                                <li>NSG: ports 9440, 2049, 3260 + outbound 443</li>
                                <li>Dedicated Resource Group</li>
                                <li>Flow Gateways: 2-4 for overlay bridge (mandatory)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card" style="margin-top:var(--space-lg);">
                <div class="card-header">🎓 Common Deployment Failures (Exam Traps)</div>
                <div class="card-body" style="font-size:var(--font-size-sm);">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                        <div>
                            <p><strong>InsufficientInstanceCapacity</strong> — Bare-metal unavailable in selected AZ. Try a different AZ or request quota increase.</p>
                            <p><strong>Permission errors</strong> — IAM role missing EC2, VPC, EBS, or S3 service permissions.</p>
                        </div>
                        <div>
                            <p><strong>Deployment hangs</strong> — No internet access. Verify IGW/NAT Gateway exists.</p>
                            <p><strong>CloudAPIEndpointUnreachable</strong> — Check IAM first (DescribeInstances), then NSG/Security Groups.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return el;
    }

    afterRender() {
        document.getElementById('back-console-btn')?.addEventListener('click', () => {
            window.location.hash = '#/pc/nc2-console';
        });

        document.getElementById('aws-card')?.addEventListener('click', () => this.#openDeployWizard('AWS'));
        document.getElementById('azure-card')?.addEventListener('click', () => this.#openDeployWizard('Azure'));

        // Highlight card on hover
        ['aws-card', 'azure-card'].forEach(id => {
            const card = document.getElementById(id);
            card?.addEventListener('mouseenter', () => card.style.borderColor = 'var(--prism-blue)');
            card?.addEventListener('mouseleave', () => card.style.borderColor = 'transparent');
        });
    }

    destroy() {}

    #openDeployWizard(provider) {
        const regions = provider === 'AWS' ? AWS_REGIONS : AZURE_REGIONS;
        const instanceTypes = provider === 'AWS' ? AWS_INSTANCE_TYPES : AZURE_INSTANCE_TYPES;

        const wizard = new Wizard({
            title: `Deploy NC2 Cluster on ${provider}`,
            initialData: {
                name: '',
                provider,
                region: regions[0].id,
                az: regions[0].azs[0],
                instance_type: instanceTypes[0].id,
                node_count: 3,
                rf: 'RF2',
                vpc_cidr: provider === 'AWS' ? '10.100.0.0/16' : '10.200.0.0/16',
                subnet_cidr: provider === 'AWS' ? '10.100.1.0/25' : '10.200.1.0/24',
                flow_gateway_count: 2,
                network_mode: 'noNAT',
                billing: 'PAYG',
            },
            steps: [
                {
                    label: 'Cluster Basics',
                    render: (data) => `
                        <div class="form-group"><label class="form-label">Cluster Name</label>
                            <input class="form-input" data-field="name" value="${data.name}" placeholder="e.g., NC2-Prod-${provider}" /></div>
                        <div class="form-group"><label class="form-label">Region</label>
                            <select class="form-input" data-field="region" id="region-select">
                                ${regions.map(r => `<option value="${r.id}" ${r.id === data.region ? 'selected' : ''}>${r.name} (${r.id})</option>`).join('')}
                            </select></div>
                        <div class="form-group"><label class="form-label">Availability Zone</label>
                            <select class="form-input" data-field="az" id="az-select">
                                ${regions.find(r => r.id === data.region)?.azs.map(az => `<option value="${az}" ${az === data.az ? 'selected' : ''}>${az}</option>`).join('')}
                            </select>
                            <div class="text-secondary text-sm" style="margin-top:4px;">⚠️ All nodes MUST be in the <strong>same AZ</strong>. Cannot span AZs.</div>
                        </div>
                        <div class="form-group"><label class="form-label">Billing Model</label>
                            <select class="form-input" data-field="billing">
                                <option value="PAYG" ${data.billing === 'PAYG' ? 'selected' : ''}>Pay-As-You-Go (hourly)</option>
                                <option value="1yr" ${data.billing === '1yr' ? 'selected' : ''}>1-Year Term (lower cost)</option>
                                <option value="3yr" ${data.billing === '3yr' ? 'selected' : ''}>3-Year Term (lowest cost)</option>
                            </select></div>
                    `,
                    bind: (body, data) => {
                        body.querySelector('#region-select')?.addEventListener('change', (e) => {
                            data.region = e.target.value;
                            const azSelect = body.querySelector('#az-select');
                            const r = regions.find(r => r.id === data.region);
                            if (azSelect && r) {
                                azSelect.innerHTML = r.azs.map(az => `<option value="${az}">${az}</option>`).join('');
                                data.az = r.azs[0];
                            }
                        });
                    },
                    validate: (data) => {
                        const e = [];
                        if (!data.name?.trim()) e.push('Cluster name is required');
                        return e;
                    },
                },
                {
                    label: 'Instance & Nodes',
                    render: (data) => `
                        <div class="form-group"><label class="form-label">Instance Type</label>
                            <select class="form-input" data-field="instance_type" id="instance-select">
                                ${instanceTypes.map(t => `<option value="${t.id}" ${t.id === data.instance_type ? 'selected' : ''} ${!t.valid ? 'style="color:var(--status-critical);"' : ''}>${t.label}</option>`).join('')}
                            </select>
                            <div id="instance-warning" style="margin-top:8px;display:none;padding:12px;background:var(--status-critical-bg, #ffeaea);border-radius:6px;font-size:var(--font-size-sm);color:var(--status-critical);"></div>
                        </div>
                        <div class="form-group"><label class="form-label">Node Count (min 3)</label>
                            <input class="form-input" data-field="node_count" type="number" min="3" max="28" value="${data.node_count}" />
                            <div class="text-secondary text-sm" style="margin-top:4px;">Minimum 3 for quorum + RF2. All nodes identical type (no mixing).</div>
                        </div>
                        <div class="form-group"><label class="form-label">Replication Factor</label>
                            <select class="form-input" data-field="rf">
                                <option value="RF2" ${data.rf === 'RF2' ? 'selected' : ''}>RF2 — 2 copies (min 3 nodes, 1 failure tolerance)</option>
                                <option value="RF3" ${data.rf === 'RF3' ? 'selected' : ''}>RF3 — 3 copies (min 5 nodes, 2 failure tolerance)</option>
                            </select></div>
                    `,
                    bind: (body, data) => {
                        const warn = body.querySelector('#instance-warning');
                        const select = body.querySelector('#instance-select');
                        const checkInstance = () => {
                            const t = instanceTypes.find(t => t.id === data.instance_type);
                            if (t && !t.valid) {
                                let reason = '';
                                if (data.instance_type === 'r5.metal') reason = 'r5.metal uses EBS only — NO local NVMe storage. NC2 requires local NVMe (i3.metal or i3en.metal).';
                                else if (data.instance_type.includes('metal')) reason = 'This instance type does not have local NVMe storage required by NC2.';
                                else reason = 'NC2 requires bare-metal instances with local NVMe. Virtualized instances cannot run AHV hypervisor.';
                                warn.style.display = 'block';
                                warn.innerHTML = `❌ <strong>${data.instance_type}</strong> is NOT supported.<br>${reason}`;
                            } else {
                                warn.style.display = 'none';
                            }
                        };
                        select?.addEventListener('change', () => { data.instance_type = select.value; checkInstance(); });
                        checkInstance();
                    },
                    validate: (data) => {
                        const e = [];
                        const t = instanceTypes.find(t => t.id === data.instance_type);
                        if (!t?.valid) e.push(`${data.instance_type} is not supported for NC2. Use ${provider === 'AWS' ? 'i3.metal or i3en.metal' : 'BareMetal-AHV'}.`);
                        if (data.node_count < 3) e.push('Minimum 3 nodes required for quorum');
                        if (data.rf === 'RF3' && data.node_count < 5) e.push('RF3 requires at least 5 nodes');
                        return e;
                    },
                },
                {
                    label: 'Networking',
                    render: (data) => `
                        <div class="form-group"><label class="form-label">${provider === 'AWS' ? 'VPC' : 'VNet'} CIDR</label>
                            <input class="form-input" data-field="vpc_cidr" value="${data.vpc_cidr}" placeholder="${provider === 'AWS' ? '10.100.0.0/16' : '10.200.0.0/16'}" />
                            <div class="text-secondary text-sm" style="margin-top:4px;">Recommended /16 or larger for growth</div>
                        </div>
                        <div class="form-group"><label class="form-label">${provider === 'AWS' ? 'Host Subnet' : 'Delegated Subnet'} CIDR</label>
                            <input class="form-input" data-field="subnet_cidr" value="${data.subnet_cidr}" />
                            <div class="text-secondary text-sm" style="margin-top:4px;">
                                ${provider === 'AWS'
                                    ? 'Minimum /25 (128 IPs, 123 usable after AWS reserves 5)'
                                    : 'Minimum /24 (256 IPs). Must be empty — no pre-existing VMs/NICs/endpoints.'}
                            </div>
                        </div>
                        ${provider === 'Azure' ? `
                            <div class="form-group"><label class="form-label">Flow Gateway Count</label>
                                <input class="form-input" data-field="flow_gateway_count" type="number" min="2" max="4" value="${data.flow_gateway_count}" />
                                <div class="text-secondary text-sm" style="margin-top:4px;">Min 2 for HA, max 4. ECMP load balancing. Flow Gateway is <strong>mandatory on Azure</strong> (bridges AHV overlay to VNet).</div>
                            </div>
                            <div class="form-group"><label class="form-label">Network Mode</label>
                                <select class="form-input" data-field="network_mode">
                                    <option value="noNAT" ${data.network_mode === 'noNAT' ? 'selected' : ''}>noNAT (Recommended) — VMs keep original IPs, direct routing</option>
                                    <option value="NAT" ${data.network_mode === 'NAT' ? 'selected' : ''}>NAT — Address translation (for IP conflicts only)</option>
                                </select>
                                <div style="margin-top:8px;padding:10px;background:var(--status-warning-bg);border-radius:6px;font-size:var(--font-size-sm);">
                                    ⚠️ <strong>Network mode is IRREVERSIBLE after deployment.</strong> noNAT is recommended for most deployments.
                                </div>
                            </div>
                        ` : `
                            <div class="text-secondary text-sm" style="padding:12px;background:var(--status-info-bg);border-radius:6px;">
                                ℹ️ <strong>AWS Note:</strong> Flow Gateway is NOT required on AWS. VPC natively integrates with AHV overlay.
                                Security Groups handle port-level access: 9440 (Prism), 2049 (NFS), 3260 (iSCSI), 22 (SSH).
                            </div>
                        `}
                    `,
                    validate: (data) => {
                        const e = [];
                        if (!data.subnet_cidr) e.push('Subnet CIDR is required');
                        else {
                            const prefix = parseInt(data.subnet_cidr.split('/')[1]);
                            if (provider === 'AWS' && prefix > 25) e.push('AWS host subnet must be at least /25 (128 addresses)');
                            if (provider === 'Azure' && prefix > 24) e.push('Azure delegated subnet must be at least /24 (256 addresses)');
                        }
                        if (provider === 'Azure') {
                            if (data.flow_gateway_count < 2) e.push('Minimum 2 Flow Gateways required for HA');
                            if (data.flow_gateway_count > 4) e.push('Maximum 4 Flow Gateways in ECMP');
                        }
                        return e;
                    },
                },
                {
                    label: 'Review',
                    render: (data) => `
                        <div style="font-size:var(--font-size-sm);">
                            <h3>Deployment Summary</h3>
                            <table style="width:100%;border-collapse:collapse;">
                                <tr style="border-bottom:1px solid var(--border-light);">
                                    <td style="padding:8px;font-weight:600;">Cluster Name</td><td style="padding:8px;">${data.name}</td>
                                </tr>
                                <tr style="border-bottom:1px solid var(--border-light);">
                                    <td style="padding:8px;font-weight:600;">Provider</td><td style="padding:8px;">${provider === 'AWS' ? '🟠 AWS' : '🔵 Azure'}</td>
                                </tr>
                                <tr style="border-bottom:1px solid var(--border-light);">
                                    <td style="padding:8px;font-weight:600;">Region / AZ</td><td style="padding:8px;">${data.region} / ${data.az}</td>
                                </tr>
                                <tr style="border-bottom:1px solid var(--border-light);">
                                    <td style="padding:8px;font-weight:600;">Instance Type</td><td style="padding:8px;"><code>${data.instance_type}</code></td>
                                </tr>
                                <tr style="border-bottom:1px solid var(--border-light);">
                                    <td style="padding:8px;font-weight:600;">Nodes</td><td style="padding:8px;">${data.node_count} (${data.rf})</td>
                                </tr>
                                <tr style="border-bottom:1px solid var(--border-light);">
                                    <td style="padding:8px;font-weight:600;">${provider === 'AWS' ? 'VPC' : 'VNet'} CIDR</td><td style="padding:8px;"><code>${data.vpc_cidr}</code></td>
                                </tr>
                                <tr style="border-bottom:1px solid var(--border-light);">
                                    <td style="padding:8px;font-weight:600;">Subnet</td><td style="padding:8px;"><code>${data.subnet_cidr}</code></td>
                                </tr>
                                ${provider === 'Azure' ? `
                                    <tr style="border-bottom:1px solid var(--border-light);">
                                        <td style="padding:8px;font-weight:600;">Flow Gateways</td><td style="padding:8px;">${data.flow_gateway_count} (ECMP)</td>
                                    </tr>
                                    <tr style="border-bottom:1px solid var(--border-light);">
                                        <td style="padding:8px;font-weight:600;">Network Mode</td>
                                        <td style="padding:8px;">${data.network_mode} ${data.network_mode === 'noNAT' ? '✅' : ''} <span class="text-secondary text-sm">(irreversible)</span></td>
                                    </tr>
                                ` : ''}
                                <tr>
                                    <td style="padding:8px;font-weight:600;">Billing</td><td style="padding:8px;">${data.billing}</td>
                                </tr>
                            </table>
                        </div>
                    `,
                },
            ],
            onComplete: async (data) => {
                await state.create('nc2_clusters', {
                    name: data.name.trim(),
                    provider,
                    region: data.region,
                    az: data.az,
                    instance_type: data.instance_type,
                    node_count: data.node_count,
                    rf: data.rf,
                    vpc_cidr: data.vpc_cidr,
                    subnet_cidr: data.subnet_cidr,
                    flow_gateway_count: provider === 'Azure' ? data.flow_gateway_count : 0,
                    network_mode: provider === 'Azure' ? data.network_mode : 'native',
                    billing: data.billing,
                    status: 'running',
                    aos_version: '6.10.1.2',
                    ahv_version: '20230302.10015',
                });
                toast.success(`NC2 cluster "${data.name}" deployed on ${provider}! ${data.node_count} nodes in ${data.az}.`);
                window.location.hash = '#/pc/nc2-console';
            },
        });
        wizard.open();
    }
}
