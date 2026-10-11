import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { toast } from '../components/Toast.js';
import { TicketLabView } from './ticket-lab.js';

/**
 * Guided Lab Scenarios — JSON-driven lab exercises across all exams.
 *
 * SPEC-07 validator contract (universal as of T-14/S46-04):
 *   validate: (state, trace) -> { passed, unmetConditions[] }
 *
 * `state` is the simulated StateEngine store. `trace` is the recorded
 * action trail (StateEngine `action_trace` collection for store-based
 * scenarios; TicketLabView's per-run trace for ticket scenarios). The
 * validator is pure over those two inputs — no wall-clock, no random,
 * no network. The UI, the CI scan and the demo sweep all evaluate the
 * same entry point.
 *
 * Observation-only objectives ("open the CLI", "review the dashboard")
 * cannot be proven from configuration state — they validate against the
 * action trace (route-entered / cli-command / tool-used). Create-style
 * objectives validate the entity the real UI mutation path writes.
 */

const DISCLAIMER = 'This is independent study material. It is not official training and is not endorsed or approved by CompTIA, Nutanix, or any other certification body.';

// ── Validator result builders (SPEC-07 shape) ──

const met = () => ({ passed: true, unmetConditions: [] });
const unmet = (...msgs) => ({ passed: false, unmetConditions: msgs });

// ── Action-trace helpers ──

function visited(trace, route) {
    return (trace || []).some(t => t.action === 'route-entered' && t.route === route);
}
function ranCli(trace, pattern) {
    return (trace || []).some(t => t.action === 'cli-command' && pattern.test(t.command || ''));
}
function ranAction(trace, action) {
    return (trace || []).some(t => t.action === action);
}

// ── Ticket scenario validators (pure: state + trace only) ──

/** Correct values are part of the scenario contract, not the seed. */
export const TICKET_EXPECTATIONS = {
    'aplus-dns-01': {
        workstation: 'ws-dns-01',
        editableField: 'dns',
        correctDns: '10.42.100.10',
        requiredTests: ['nslookup'],
    },
    'netplus-gw-01': {
        workstation: 'ws-gw-01',
        editableField: 'gateway',
        correctGateway: '10.42.200.1',
        requiredTests: ['tracert'],
    },
};

function workstationOf(stateApi, scenarioId) {
    return stateApi.getAll('ticket_workstations').find(w => w.scenarioId === scenarioId);
}

/** Trace helpers: did the learner run a required test AFTER observing the fault? */
function ranTest(trace, testId) {
    return trace.some(t => t.action === 'test-run' && t.test === testId);
}

export function validateAplusDns01(stateApi, trace) {
    const unmetList = [];
    const ws = workstationOf(stateApi, 'aplus-dns-01');
    const exp = TICKET_EXPECTATIONS['aplus-dns-01'];
    if (!ws) return { passed: false, unmetConditions: ['workstation record missing'] };
    if (ws.config.dns !== exp.correctDns) {
        unmetList.push(`DNS server is still ${ws.config.dns} — the resolver must point at 10.42.100.10`);
    }
    if (!ranTest(trace, 'nslookup')) {
        unmetList.push('no nslookup diagnosis recorded — run the fixed-set test before submitting');
    }
    if (!ranTest(trace, 'ping-ip')) {
        unmetList.push('no ping-by-IP recorded — confirm name resolution is the only fault');
    }
    if (!(ws.resolution_note || '').trim()) {
        unmetList.push('resolution note is empty — document the fix');
    }
    return { passed: unmetList.length === 0, unmetConditions: unmetList };
}

export function validateNetplusGw01(stateApi, trace) {
    const unmetList = [];
    const ws = workstationOf(stateApi, 'netplus-gw-01');
    const exp = TICKET_EXPECTATIONS['netplus-gw-01'];
    if (!ws) return { passed: false, unmetConditions: ['workstation record missing'] };
    if (ws.config.gateway !== exp.correctGateway) {
        unmetList.push(`default gateway is still ${ws.config.gateway} — it must be 10.42.200.1 for the 10.42.200.0/24 subnet`);
    }
    if (!ranTest(trace, 'tracert')) {
        unmetList.push('no tracert verification recorded — verify off-subnet reachability after the fix');
    }
    if (!(ws.resolution_note || '').trim()) {
        unmetList.push('resolution note is empty — document the fix');
    }
    return { passed: unmetList.length === 0, unmetConditions: unmetList };
}

export const TICKET_VALIDATORS = {
    'aplus-dns-01': validateAplusDns01,
    'netplus-gw-01': validateNetplusGw01,
};


export const SCENARIOS = [
    // NCM-MCI (4 scenarios)
    {
        id: 'mci-01', exam: 'NCM-MCI', title: 'Create and Power On a VM',
        difficulty: 'Beginner', time: '10 min',
        description: 'Create a VM with specific resources, attach a disk from an image, configure networking, and power it on.',
        objectives: [
            {
                id: 'obj-1', text: 'Create a VM named "Lab-WebServer" with 2 vCPUs and 4 GB RAM',
                validate: (s) => {
                    const ok = s.getAll('vms').some(v => v.name === 'Lab-WebServer' && v.vcpus === 2 && v.memory_gb === 4);
                    return ok ? met() : unmet('no VM named Lab-WebServer with 2 vCPUs and 4 GB RAM exists');
                },
            },
            {
                // Image library names are CentOS-8-GenericCloud etc. (T-14):
                // the old predicate checked image === 'CentOS-8', which the VM
                // wizard can never write. Resolve the disk image against the
                // real image library so a fabricated name cannot pass.
                id: 'obj-2', text: 'Attach a disk cloned from the CentOS-8 image',
                validate: (s) => {
                    const vm = s.getAll('vms').find(v => v.name === 'Lab-WebServer');
                    const images = s.getAll('images');
                    const ok = vm?.disks?.some(d => {
                        const img = images.find(i => i.name === d.image || i.uuid === d.image);
                        return !!img && img.name.includes('CentOS-8');
                    });
                    return ok ? met() : unmet('Lab-WebServer has no disk cloned from the CentOS-8 image');
                },
            },
            {
                // The VM wizard writes nics: [{ network_uuid }]. There is no
                // "VM-100" entity — the real network is VM-Network-100 (T-14).
                id: 'obj-3', text: 'Connect the VM to the VM-Network-100 network',
                validate: (s) => {
                    const vm = s.getAll('vms').find(v => v.name === 'Lab-WebServer');
                    const nets = s.getAll('networks');
                    const ok = vm?.nics?.some(n => nets.find(net => net.uuid === n.network_uuid)?.name === 'VM-Network-100');
                    return ok ? met() : unmet('Lab-WebServer is not connected to VM-Network-100');
                },
            },
            {
                id: 'obj-4', text: 'Power on the VM',
                validate: (s) => {
                    const ok = s.getAll('vms').find(v => v.name === 'Lab-WebServer')?.power_state === 'on';
                    return ok ? met() : unmet('Lab-WebServer is not powered on');
                },
            },
        ],
        hints: ['Navigate to PE → VMs', 'Click "+ Create VM"', 'Use the 4-step wizard: General → Disks → NICs → Review'],
        context: 'pe', startRoute: '/pe/vms',
    },
    {
        id: 'mci-02', exam: 'NCM-MCI', title: 'Configure Data Protection',
        difficulty: 'Intermediate', time: '15 min',
        description: 'Create a protection domain, add VMs, and configure a replication schedule.',
        objectives: [
            {
                id: 'obj-1', text: 'Create a Protection Domain named "PD-Lab-DR"',
                validate: (s) => {
                    const ok = s.getAll('protection_domains').some(p => p.name === 'PD-Lab-DR');
                    return ok ? met() : unmet('no protection domain named PD-Lab-DR exists');
                },
            },
            {
                id: 'obj-2', text: 'Add at least 1 VM to the protection domain',
                validate: (s) => {
                    const pd = s.getAll('protection_domains').find(p => p.name === 'PD-Lab-DR');
                    return pd?.vms?.length > 0 ? met() : unmet('PD-Lab-DR has no VMs assigned');
                },
            },
            {
                // The PD wizard writes schedule: { interval, retention_* }.
                // The old predicate compared schedule === 'hourly' (a string),
                // which the wizard can never produce (T-14).
                id: 'obj-3', text: 'Configure an hourly replication schedule',
                validate: (s) => {
                    const pd = s.getAll('protection_domains').find(p => p.name === 'PD-Lab-DR');
                    return pd?.schedule?.interval === 'hourly' ? met() : unmet('PD-Lab-DR does not use an hourly replication interval');
                },
            },
        ],
        hints: ['Navigate to PE → Data Protection', 'Click "+ Create Protection Domain"', 'Add VMs and set schedule to hourly'],
        context: 'pe', startRoute: '/pe/protection',
    },
    {
        id: 'mci-03', exam: 'NCM-MCI', title: 'Create a Flow Security Policy',
        difficulty: 'Intermediate', time: '15 min',
        description: 'Create an Application security policy using categories to control traffic between tiers.',
        objectives: [
            {
                id: 'obj-1', text: 'Create a category value "Lab-App" under AppType',
                validate: (s) => {
                    const at = s.getAll('categories').find(c => c.key === 'AppType');
                    return at?.values?.includes('Lab-App') ? met() : unmet('AppType has no Lab-App value');
                },
            },
            {
                id: 'obj-2', text: 'Create a Flow policy named "Lab-AppPolicy"',
                validate: (s) => {
                    const ok = s.getAll('flow_policies').some(p => p.name === 'Lab-AppPolicy');
                    return ok ? met() : unmet('no flow policy named Lab-AppPolicy exists');
                },
            },
        ],
        hints: ['First create the category in PC → Categories', 'Then create the policy in PC → Flow'],
        context: 'pc', startRoute: '/pc/categories',
    },
    {
        id: 'mci-04', exam: 'NCM-MCI', title: 'Use the CLI to Manage VMs',
        difficulty: 'Advanced', time: '10 min',
        description: 'Use acli and ncli commands to list and manage cluster resources.',
        objectives: [
            {
                id: 'obj-1', text: 'Open the CLI terminal',
                validate: (s, t) => visited(t, '/pe/cli') ? met() : unmet('the CLI terminal has not been opened'),
            },
            {
                id: 'obj-2', text: 'List all VMs using acli',
                validate: (s, t) => ranCli(t, /^acli\s+vm(\.list|\b)/) ? met() : unmet('no acli vm.list command recorded'),
            },
            {
                id: 'obj-3', text: 'Check cluster status using ncli',
                validate: (s, t) => ranCli(t, /^ncli\s+cluster\b/) ? met() : unmet('no ncli cluster command recorded'),
            },
        ],
        hints: ['Open CLI from PE hamburger menu', 'Type: acli vm.list', 'Type: ncli cluster get-params'],
        context: 'pe', startRoute: '/pe/cli',
    },
    // NCP-US (3 scenarios)
    {
        id: 'us-01', exam: 'NCP-US', title: 'Deploy Nutanix Files',
        difficulty: 'Intermediate', time: '15 min',
        description: 'Deploy FSVMs and create an SMB file share with Self-Service Restore.',
        objectives: [
            {
                // Seed ships 3 pre-existing FSVMs. "Deploy" means the learner
                // deploys new ones — count only non-seed FSVMs (T-14, REQ-SC-02).
                id: 'obj-1', text: 'Deploy at least 3 FSVMs (minimum required)',
                validate: (s) => {
                    const deployed = s.getAll('fsvms').filter(f => !['fsvm-001', 'fsvm-002', 'fsvm-003'].includes(f.uuid));
                    return deployed.length >= 3 ? met() : unmet(`only ${deployed.length} learner-deployed FSVM(s) — deploy 3 new FSVMs`);
                },
            },
            {
                id: 'obj-2', text: 'Create an SMB share named "Lab-Share"',
                validate: (s) => {
                    const ok = s.getAll('file_shares').some(sh => sh.name === 'Lab-Share' && sh.protocol === 'SMB');
                    return ok ? met() : unmet('no SMB share named Lab-Share exists');
                },
            },
        ],
        hints: ['Navigate to PC → Files', 'Deploy 3 FSVMs first (minimum)', 'Then create the SMB share'],
        context: 'pc', startRoute: '/pc/files',
    },
    {
        id: 'us-02', exam: 'NCP-US', title: 'Create WORM-Enabled Bucket',
        difficulty: 'Advanced', time: '10 min',
        description: 'Create an Object Store bucket with WORM compliance (irreversible!).',
        objectives: [
            {
                id: 'obj-1', text: 'Create a bucket named "compliance-lab" with WORM enabled',
                validate: (s) => {
                    const ok = s.getAll('object_buckets').some(b => b.name === 'compliance-lab' && b.worm_enabled);
                    return ok ? met() : unmet('no WORM-enabled bucket named compliance-lab exists');
                },
            },
        ],
        hints: ['Navigate to PC → Objects', 'Create bucket → enable WORM', '⚠️ WORM is IRREVERSIBLE — read the warning!'],
        context: 'pc', startRoute: '/pc/objects',
    },
    {
        id: 'us-03', exam: 'NCP-US', title: 'Configure Volume Group with iSCSI',
        difficulty: 'Intermediate', time: '15 min',
        description: 'Create a Volume Group with iSCSI target and enable CHAP authentication.',
        objectives: [
            {
                id: 'obj-1', text: 'Create a Volume Group named "Lab-VG"',
                validate: (s) => {
                    const ok = s.getAll('volume_groups').some(v => v.name === 'Lab-VG');
                    return ok ? met() : unmet('no volume group named Lab-VG exists');
                },
            },
            {
                id: 'obj-2', text: 'Enable CHAP authentication',
                validate: (s) => {
                    const vg = s.getAll('volume_groups').find(v => v.name === 'Lab-VG');
                    return vg?.chap_enabled ? met() : unmet('Lab-VG does not have CHAP authentication enabled');
                },
            },
        ],
        hints: ['Navigate to PC → Volumes', 'Create volume group with CHAP', 'iSCSI uses port 3260 (NOT 3261!)'],
        context: 'pc', startRoute: '/pc/volumes',
    },
    // NCP-CI (4 scenarios)
    {
        id: 'ci-01', exam: 'NCP-CI', title: 'Deploy NC2 Cluster on AWS',
        difficulty: 'Intermediate', time: '15 min',
        description: 'Deploy an NC2 cluster using i3.metal instances in a single AZ.',
        objectives: [
            {
                id: 'obj-1', text: 'Deploy an NC2 cluster on AWS with i3.metal instances',
                validate: (s) => {
                    const ok = s.getAll('nc2_clusters').some(c => c.provider === 'AWS' && c.instance_type === 'i3.metal' && c.name !== 'NC2-Prod-AWS');
                    return ok ? met() : unmet('no new AWS i3.metal NC2 cluster has been deployed');
                },
            },
        ],
        hints: ['Navigate to PC → NC2 Console → Deploy', 'Select AWS → choose i3.metal', 'r5.metal won\'t work (EBS only, no NVMe)'],
        context: 'pc', startRoute: '/pc/nc2-deploy',
    },
    {
        id: 'ci-02', exam: 'NCP-CI', title: 'Deploy NC2 on Azure with Flow Gateway',
        difficulty: 'Advanced', time: '15 min',
        description: 'Deploy an Azure NC2 cluster with Flow Gateways in noNAT mode.',
        objectives: [
            {
                id: 'obj-1', text: 'Deploy an NC2 cluster on Azure with /24 subnet',
                validate: (s) => {
                    const ok = s.getAll('nc2_clusters').some(c => c.provider === 'Azure' && c.name !== 'NC2-DR-Azure');
                    return ok ? met() : unmet('no new Azure NC2 cluster has been deployed');
                },
            },
            {
                id: 'obj-2', text: 'Ensure at least 2 Flow Gateways configured',
                validate: (s) => {
                    const c = s.getAll('nc2_clusters').find(c => c.provider === 'Azure' && c.name !== 'NC2-DR-Azure');
                    return c?.flow_gateway_count >= 2 ? met() : unmet('the new Azure cluster has fewer than 2 Flow Gateways');
                },
            },
        ],
        hints: ['Select Azure provider', 'Minimum /24 subnet (not /25)', 'noNAT is recommended — and irreversible!'],
        context: 'pc', startRoute: '/pc/nc2-deploy',
    },
    {
        id: 'ci-03', exam: 'NCP-CI', title: 'Hibernate and Resume NC2 Cluster',
        difficulty: 'Beginner', time: '5 min',
        description: 'Hibernate a running NC2 cluster and then resume it.',
        objectives: [
            {
                // State alone cannot hold both objectives at once (hibernated
                // XOR running). The action trace is the honest record (T-14).
                id: 'obj-1', text: 'Hibernate a running NC2 cluster',
                validate: (s, t) => ranAction(t, 'nc2-hibernate') ? met() : unmet('no cluster hibernation recorded'),
            },
            {
                id: 'obj-2', text: 'Resume the hibernated cluster',
                validate: (s, t) => {
                    if (!ranAction(t, 'nc2-hibernate')) return unmet('no cluster has been hibernated yet');
                    return ranAction(t, 'nc2-resume') ? met() : unmet('the hibernated cluster has not been resumed');
                },
            },
        ],
        hints: ['Go to NC2 Console', 'Select a running cluster → Hibernate', 'Then select it again → Resume'],
        context: 'pc', startRoute: '/pc/nc2-console',
    },
    {
        id: 'ci-04', exam: 'NCP-CI', title: 'Validate Instance Type Selection',
        difficulty: 'Beginner', time: '5 min',
        description: 'Attempt to deploy with invalid instance types and observe the validation errors.',
        objectives: [
            {
                id: 'obj-1', text: 'Open the AWS deploy wizard and observe instance type options',
                validate: (s, t) => visited(t, '/pc/nc2-deploy') ? met() : unmet('the NC2 deploy wizard has not been opened'),
            },
        ],
        hints: ['Try selecting r5.metal — it should show a warning', 't3.xlarge is virtualized — won\'t work', 'Only i3.metal and i3en.metal are valid'],
        context: 'pc', startRoute: '/pc/nc2-deploy',
    },
    // NCP-AI (4 scenarios)
    {
        id: 'ai-01', exam: 'NCP-AI', title: 'Configure GPU with MIG',
        difficulty: 'Intermediate', time: '10 min',
        description: 'Add an A100 GPU and enable MIG mode. Try enabling MIG on a T4 (should fail).',
        objectives: [
            {
                id: 'obj-1', text: 'Add an A100 GPU in MIG mode',
                validate: (s) => {
                    const ok = s.getAll('gpu_devices').some(g => g.model === 'A100' && g.mode === 'mig' && g.name !== 'GPU-Node1-Slot1');
                    return ok ? met() : unmet('no new A100 GPU in MIG mode has been added');
                },
            },
        ],
        hints: ['Navigate to PC → GPU Config', 'Add an A100 → select MIG mode', 'Try MIG on T4/L40S — it should be rejected'],
        context: 'pc', startRoute: '/pc/gpu',
    },
    {
        id: 'ai-02', exam: 'NCP-AI', title: 'Deploy NAI Inference Endpoint',
        difficulty: 'Advanced', time: '15 min',
        description: 'Create an NAI endpoint with vLLM engine and test the API.',
        objectives: [
            {
                id: 'obj-1', text: 'Create an NAI endpoint named "lab-endpoint"',
                validate: (s) => {
                    const ok = s.getAll('nai_endpoints').some(e => e.name === 'lab-endpoint');
                    return ok ? met() : unmet('no NAI endpoint named lab-endpoint exists');
                },
            },
        ],
        hints: ['Navigate to PC → NAI Endpoints', 'Select vLLM engine (broader support)', 'Don\'t use GGUF format — it\'s not supported!'],
        context: 'pc', startRoute: '/pc/nai',
    },
    {
        id: 'ai-03', exam: 'NCP-AI', title: 'Calculate VRAM for 70B Model',
        difficulty: 'Intermediate', time: '5 min',
        description: 'Use the VRAM calculator to determine GPU requirements for a 70B parameter model.',
        objectives: [
            {
                id: 'obj-1', text: 'Calculate VRAM for 70B FP16 model (should show ~140GB weights)',
                validate: (s, t) => {
                    const ok = t.some(e => e.action === 'vram-calculate' && e.params === 70 && e.precision === 'FP16');
                    return ok ? met() : unmet('no VRAM calculation for a 70B FP16 model is recorded');
                },
            },
        ],
        hints: ['Navigate to PC → NAI Tools → VRAM Calculator', 'Select 70B FP16 preset', 'Note: needs 2× A100 with NVLink, T4 is not viable'],
        context: 'pc', startRoute: '/pc/nai-tools',
    },
    {
        id: 'ai-04', exam: 'NCP-AI', title: 'Test NAI API Explorer',
        difficulty: 'Intermediate', time: '10 min',
        description: 'Send requests to the API explorer and observe error handling for common mistakes.',
        objectives: [
            {
                id: 'obj-1', text: 'Send a successful /v1/chat/completions request',
                validate: (s, t) => {
                    const ok = t.some(e => e.action === 'api-request' && e.path === '/chat/completions' && e.status === 200);
                    return ok ? met() : unmet('no successful /v1/chat/completions request recorded');
                },
            },
            {
                id: 'obj-2', text: 'Observe 422 error by sending "prompt" to /chat/completions',
                validate: (s, t) => {
                    const ok = t.some(e => e.action === 'api-request' && e.path === '/chat/completions' && e.status === 422);
                    return ok ? met() : unmet('no 422 response from a "prompt"-shaped /chat/completions request is recorded');
                },
            },
        ],
        hints: ['Go to NAI Tools → API Explorer', 'Send the default request (should succeed)', 'Change body to use "prompt" instead of "messages" to see the 422 error'],
        context: 'pc', startRoute: '/pc/nai-tools',
    },

    // ═══ Sprint 11 — New Scenarios ═══

    // Multi-Cluster & Calm
    {
        id: 'mc-01', exam: 'NCM-MCI', title: 'Register a Remote Cluster',
        difficulty: 'Beginner', time: '5 min',
        description: 'Register a new Prism Element cluster to Prism Central for multi-cluster management.',
        objectives: [
            {
                id: 'obj-1', text: 'Register a new cluster named "NTNX-Lab-Remote"',
                validate: (s) => {
                    const ok = s.getAll('registered_clusters').some(c => c.name === 'NTNX-Lab-Remote');
                    return ok ? met() : unmet('no cluster named NTNX-Lab-Remote is registered');
                },
            },
        ],
        hints: ['Navigate to PC → Clusters', 'Click "+ Register Cluster"', 'Enter name "NTNX-Lab-Remote" and a valid IP'],
        context: 'pc', startRoute: '/pc/clusters',
    },
    {
        id: 'mc-02', exam: 'NCM-MCI', title: 'Create a Calm Blueprint',
        difficulty: 'Intermediate', time: '10 min',
        description: 'Create a multi-VM blueprint in Calm with web, app, and database tiers.',
        objectives: [
            {
                id: 'obj-1', text: 'Create a blueprint named "Lab-3Tier"',
                validate: (s) => {
                    const ok = s.getAll('blueprints').some(b => b.name === 'Lab-3Tier');
                    return ok ? met() : unmet('no blueprint named Lab-3Tier exists');
                },
            },
            {
                id: 'obj-2', text: 'Blueprint has at least 2 services',
                validate: (s) => {
                    const bp = s.getAll('blueprints').find(b => b.name === 'Lab-3Tier');
                    return bp?.services?.length >= 2 ? met() : unmet('Lab-3Tier has fewer than 2 services');
                },
            },
        ],
        hints: ['Navigate to PC → Calm / Marketplace', 'Click "+ Create Blueprint"', 'In Services step, enter: WebServer, Database'],
        context: 'pc', startRoute: '/pc/calm',
    },
    {
        id: 'mc-03', exam: 'NCM-MCI', title: 'Launch App from Blueprint',
        difficulty: 'Intermediate', time: '10 min',
        description: 'Launch a running application from an existing Calm blueprint.',
        objectives: [
            {
                id: 'obj-1', text: 'Launch an application from any blueprint',
                validate: (s) => {
                    // Seed ships 2 applications — a new launch makes 3+.
                    const n = s.getAll('applications').length;
                    return n > 2 ? met() : unmet(`only ${n} application(s) exist — launch one from a blueprint`);
                },
            },
        ],
        hints: ['Go to Calm → Blueprints tab', 'Use the row action "Launch" on any blueprint', 'Check the Applications tab to confirm'],
        context: 'pc', startRoute: '/pc/calm',
    },
    {
        id: 'mc-04', exam: 'NCM-MCI', title: 'Clone Marketplace Item',
        difficulty: 'Beginner', time: '5 min',
        description: 'Clone a pre-built application from the Calm Marketplace to your blueprints.',
        objectives: [
            {
                id: 'obj-1', text: 'Clone any Marketplace item to Blueprints',
                validate: (s) => {
                    const ok = s.getAll('blueprints').some(b => b.source === 'marketplace');
                    return ok ? met() : unmet('no marketplace-sourced blueprint clone exists');
                },
            },
        ],
        hints: ['Go to Calm → Marketplace tab', 'Click "Clone to Blueprints" on any item', 'The clone appears in your Blueprints tab as draft'],
        context: 'pc', startRoute: '/pc/calm',
    },

    // Advanced CLI scenarios
    {
        id: 'cli-01', exam: 'NCM-MCI', title: 'CLI Mastery — Storage & Network',
        difficulty: 'Advanced', time: '15 min',
        description: 'Use NCLI to create storage containers and ACLI to manage networks from the command line.',
        objectives: [
            {
                id: 'obj-1', text: 'Create a container named "CLI-Container" using ncli',
                validate: (s) => {
                    const ok = s.getAll('containers').some(c => c.name === 'CLI-Container');
                    return ok ? met() : unmet('no container named CLI-Container exists');
                },
            },
            {
                id: 'obj-2', text: 'Create a network named "CLI-Net" using acli',
                validate: (s) => {
                    const ok = s.getAll('networks').some(n => n.name === 'CLI-Net');
                    return ok ? met() : unmet('no network named CLI-Net exists');
                },
            },
        ],
        hints: ['Open PE → CLI Terminal', 'Type: ncli container create name=CLI-Container rf=2', 'Type: acli net.create name=CLI-Net vlan=500'],
        context: 'pe', startRoute: '/pe/cli',
    },
    {
        id: 'cli-02', exam: 'NCM-MCI', title: 'CLI — Calm and Lifecycle',
        difficulty: 'Advanced', time: '10 min',
        description: 'Use the calm CLI to list blueprints and nuclei to check upgrade inventory.',
        objectives: [
            {
                id: 'obj-1', text: 'List blueprints using the calm CLI',
                validate: (s, t) => ranCli(t, /^calm\s+blueprint\b/) ? met() : unmet('no calm blueprint command recorded'),
            },
            {
                id: 'obj-2', text: 'Check upgrade inventory with nuclei',
                validate: (s, t) => ranCli(t, /^nuclei\b/) ? met() : unmet('no nuclei command recorded'),
            },
        ],
        hints: ['Open PE → CLI Terminal', 'Type: calm blueprint list', 'Type: nuclei inventory'],
        context: 'pe', startRoute: '/pe/cli',
    },

    // NCP-US expanded
    {
        id: 'us-04', exam: 'NCP-US', title: 'Create NFS Export for Linux',
        difficulty: 'Intermediate', time: '10 min',
        description: 'Create an NFS file share and understand multi-protocol considerations.',
        objectives: [
            {
                id: 'obj-1', text: 'Create an NFS share named "lab-nfs"',
                validate: (s) => {
                    const ok = s.getAll('file_shares').some(sh => sh.name === 'lab-nfs' && sh.protocol === 'NFS');
                    return ok ? met() : unmet('no NFS share named lab-nfs exists');
                },
            },
        ],
        hints: ['Navigate to PC → Files', 'Create a share with protocol NFS', 'NFS uses AUTH_SYS by default — LDAP required for multi-protocol'],
        context: 'pc', startRoute: '/pc/files',
    },
    {
        id: 'us-05', exam: 'NCP-US', title: 'Verify FSVM Deployment Requirements',
        difficulty: 'Beginner', time: '5 min',
        description: 'Check that minimum FSVM requirements (3 FSVMs, 12GB RAM each) are met.',
        objectives: [
            {
                // Observation of existing seed data. The state condition alone
                // auto-passes (seed ships 3 FSVMs) — REQ-SC-02 forbids that.
                // The learner must open the Files view to "verify" (T-14).
                id: 'obj-1', text: 'Verify at least 3 FSVMs are deployed',
                validate: (s, t) => {
                    if (!visited(t, '/pc/files')) return unmet('the Files view has not been opened to verify FSVMs');
                    return s.getAll('fsvms').length >= 3 ? met() : unmet('fewer than 3 FSVMs are deployed');
                },
            },
            {
                id: 'obj-2', text: 'Verify each FSVM has at least 12 GB RAM',
                validate: (s, t) => {
                    if (!visited(t, '/pc/files')) return unmet('the Files view has not been opened to verify FSVM memory');
                    return s.getAll('fsvms').every(f => f.memory_gb >= 12) ? met() : unmet('at least one FSVM has less than 12 GB RAM');
                },
            },
        ],
        hints: ['Navigate to PC → Files', 'Check the FSVMs section', 'Minimum: 3 FSVMs, 4 vCPUs, 12 GB RAM each'],
        context: 'pc', startRoute: '/pc/files',
    },

    // Audit / Operations
    {
        id: 'ops-01', exam: 'NCM-MCI', title: 'Review Audit Trail',
        difficulty: 'Beginner', time: '5 min',
        description: 'Perform some actions, then check the Audit Log to see recorded events.',
        objectives: [
            {
                id: 'obj-1', text: 'Create any entity (VM, container, blueprint, etc.)',
                validate: (s) => {
                    const ok = s.getAll('audit_log').some(l => l.action === 'create');
                    return ok ? met() : unmet('no create event is recorded in the audit log');
                },
            },
            {
                id: 'obj-2', text: 'View the audit log page',
                validate: (s, t) => visited(t, '/pc/audit') ? met() : unmet('the audit log page has not been opened'),
            },
        ],
        hints: ['First, create something (e.g., a VM)', 'Then navigate to PC → Audit Log', 'You should see the create event recorded'],
        context: 'pc', startRoute: '/pc/audit',
    },
    // Sprint 12 — LCM, Networking, Alerts, Projects (8 scenarios)
    {
        id: 'lcm-01', exam: 'NCM-MCI', title: 'LCM Firmware Update',
        difficulty: 'Intermediate', time: '10 min',
        description: 'Use the Life Cycle Manager to check for firmware/software updates and apply them.',
        objectives: [
            {
                id: 'obj-1', text: 'Navigate to LCM and run a scan',
                validate: (s, t) => {
                    if (!visited(t, '/pc/lcm')) return unmet('the LCM page has not been opened');
                    return ranAction(t, 'lcm-scan') ? met() : unmet('no LCM scan has been run');
                },
            },
            {
                id: 'obj-2', text: 'Apply an available update to any component',
                validate: (s) => {
                    // Seed ships 2 update-history rows — a new apply makes 3+.
                    const n = s.getAll('lcm_update_history').length;
                    return n > 2 ? met() : unmet(`only ${n} update(s) in history — apply a component update`);
                },
            },
        ],
        hints: ['Go to PC → LCM Updates', 'Click "Check for Updates"', 'Select components with updates and click "Update Selected"'],
        context: 'pc', startRoute: '/pc/lcm',
    },
    {
        id: 'lcm-02', exam: 'NCM-MCI', title: 'PC Settings — NTP & DNS',
        difficulty: 'Beginner', time: '5 min',
        description: 'Configure Prism Central NTP and DNS settings for proper time sync and name resolution.',
        objectives: [
            {
                id: 'obj-1', text: 'Add a second NTP server',
                validate: (s) => {
                    const settings = s.getAll('pc_settings')[0];
                    return settings?.ntp_servers?.length >= 3 ? met() : unmet('fewer than 3 NTP servers are configured');
                },
            },
            {
                id: 'obj-2', text: 'Add a backup DNS server',
                validate: (s) => {
                    const settings = s.getAll('pc_settings')[0];
                    return settings?.dns_servers?.length >= 2 ? met() : unmet('fewer than 2 DNS servers are configured');
                },
            },
        ],
        hints: ['Go to PC → Settings', 'Switch to the NTP tab and add another server', 'Switch to the DNS tab and add a backup server', 'Click Save on each tab'],
        context: 'pc', startRoute: '/pc/pc-settings',
    },
    {
        id: 'net-01', exam: 'NCM-MCI', title: 'Create a VPC with Subnet',
        difficulty: 'Intermediate', time: '10 min',
        description: 'Create a new VPC with overlay networking and configure a subnet with IP pool.',
        objectives: [
            {
                id: 'obj-1', text: 'Create a VPC named "Lab-VPC"',
                validate: (s) => {
                    const ok = s.getAll('vpcs').some(v => v.name === 'Lab-VPC');
                    return ok ? met() : unmet('no VPC named Lab-VPC exists');
                },
            },
            {
                id: 'obj-2', text: 'Create a subnet inside "Lab-VPC"',
                validate: (s) => {
                    const vpc = s.getAll('vpcs').find(v => v.name === 'Lab-VPC');
                    const ok = vpc && s.getAll('subnets').some(sub => sub.vpc_uuid === vpc.uuid);
                    return ok ? met() : unmet('no subnet exists inside Lab-VPC');
                },
            },
        ],
        hints: ['Go to PC → VPCs & Subnets', 'Click "+ Create" to create a VPC', 'Switch to Subnets tab, click "+ Create" and select your VPC'],
        context: 'pc', startRoute: '/pc/network',
    },
    {
        id: 'net-02', exam: 'NCM-MCI', title: 'Allocate a Floating IP',
        difficulty: 'Beginner', time: '5 min',
        description: 'Allocate a floating IP to a VPC for external access.',
        objectives: [
            {
                id: 'obj-1', text: 'Allocate a floating IP to any VPC',
                validate: (s) => {
                    // Seed ships 2 floating IPs — a new allocation makes 3+.
                    const n = s.getAll('floating_ips').length;
                    return n > 2 ? met() : unmet(`only ${n} floating IP(s) exist — allocate a new one`);
                },
            },
        ],
        hints: ['Go to Floating IPs tab', 'Click "+ Create" to allocate a new floating IP'],
        context: 'pc', startRoute: '/pc/network',
    },
    {
        id: 'alert-01', exam: 'NCM-MCI', title: 'Create Alert Policy & Resolve Alert',
        difficulty: 'Intermediate', time: '8 min',
        description: 'Create an alert policy for critical alerts and resolve an existing alert.',
        objectives: [
            {
                id: 'obj-1', text: 'Create an alert policy',
                validate: (s) => {
                    // Seed ships 2 policies — a new one makes 3+.
                    const n = s.getAll('alert_policies').length;
                    return n > 2 ? met() : unmet(`only ${n} alert policy(ies) exist — create a new policy`);
                },
            },
            {
                id: 'obj-2', text: 'Resolve the disk usage warning alert',
                validate: (s) => {
                    const a = s.getAll('alerts').find(x => x.uuid === 'alert-001');
                    return a?.resolved ? met() : unmet('the disk usage warning alert (alert-001) is not resolved');
                },
            },
        ],
        hints: ['Go to PC → Alerts', 'Click "+ Create Alert Policy"', 'Switch to Alerts tab, select the warning alert, click Resolve'],
        context: 'pc', startRoute: '/pc/alerts',
    },
    {
        id: 'proj-01', exam: 'NCM-MCI', title: 'Create a Self-Service Project',
        difficulty: 'Intermediate', time: '10 min',
        description: 'Create a project with resource quotas and user assignments for self-service.',
        objectives: [
            {
                id: 'obj-1', text: 'Create a project named "Lab-Project"',
                validate: (s) => {
                    const ok = s.getAll('projects').some(p => p.name === 'Lab-Project');
                    return ok ? met() : unmet('no project named Lab-Project exists');
                },
            },
            {
                id: 'obj-2', text: 'Project has vCPU quota set',
                validate: (s) => {
                    const p = s.getAll('projects').find(p => p.name === 'Lab-Project');
                    return p?.vcpu_quota > 0 ? met() : unmet('Lab-Project has no vCPU quota set');
                },
            },
        ],
        hints: ['Go to PC → Projects', 'Click "+ Create Project"', 'Set a name and resource quotas in the wizard'],
        context: 'pc', startRoute: '/pc/projects',
    },
    {
        id: 'cli-03', exam: 'NCM-MCI', title: 'CLI — LCM & Alert Commands',
        difficulty: 'Intermediate', time: '8 min',
        description: 'Use CLI commands to check LCM inventory, list alerts, and manage projects.',
        objectives: [
            {
                id: 'obj-1', text: 'Run lcm_inventory to view components',
                validate: (s, t) => ranCli(t, /^lcm_inventory\b/) ? met() : unmet('no lcm_inventory command recorded'),
            },
            {
                id: 'obj-2', text: 'Run alert list to view active alerts',
                validate: (s, t) => ranCli(t, /^alert\s+list\b/) ? met() : unmet('no alert list command recorded'),
            },
            {
                id: 'obj-3', text: 'Run project list to view projects',
                validate: (s, t) => ranCli(t, /^project\s+list\b/) ? met() : unmet('no project list command recorded'),
            },
        ],
        hints: ['Open the CLI terminal', 'Type "lcm_inventory" to see firmware/software', 'Type "alert list" for alerts', 'Type "project list" for projects'],
        context: 'pe', startRoute: '/pe/cli',
    },
    {
        id: 'scma-01', exam: 'NCM-MCI', title: 'Enable SCMA Security Hardening',
        difficulty: 'Beginner', time: '5 min',
        description: 'Enable Security Configuration Management Automation (SCMA) for STIG compliance.',
        objectives: [
            {
                id: 'obj-1', text: 'Enable SCMA in PC Settings',
                validate: (s) => {
                    const settings = s.getAll('pc_settings')[0];
                    return settings?.scma_enabled ? met() : unmet('SCMA is not enabled in PC Settings');
                },
            },
        ],
        hints: ['Go to PC → Settings', 'Switch to the SCMA tab', 'Toggle SCMA on and click Save'],
        context: 'pc', startRoute: '/pc/pc-settings',
    },
    // Sprint 13 — NCP-US scenarios (4)
    {
        id: 'us-repl-01', exam: 'NCP-US', title: 'Configure File Server Replication',
        difficulty: 'Intermediate', time: '10 min',
        description: 'Set up a Files share and configure replication to a remote site for disaster recovery.',
        objectives: [
            {
                id: 'obj-1', text: 'Create a Files share named "Lab-Shared"',
                validate: (s) => {
                    const ok = s.getAll('file_shares').some(sh => sh.name === 'Lab-Shared');
                    return ok ? met() : unmet('no file share named Lab-Shared exists');
                },
            },
            {
                // Old predicate was file_shares.length > 0 — seed ships 3 shares,
                // so it auto-passed. Require the named share plus the visit (T-14).
                id: 'obj-2', text: 'Navigate to Files view and verify the share appears',
                validate: (s, t) => {
                    if (!visited(t, '/pc/files')) return unmet('the Files view has not been opened');
                    return s.getAll('file_shares').some(sh => sh.name === 'Lab-Shared')
                        ? met() : unmet('Lab-Shared is not visible in the Files view');
                },
            },
        ],
        hints: ['Navigate to PC → Files', 'Click "+ Create Share"', 'Set name to "Lab-Shared" and select a protocol'],
        context: 'pc', startRoute: '/pc/files',
    },
    {
        id: 'us-bucket-01', exam: 'NCP-US', title: 'Create an Object Store Bucket',
        difficulty: 'Beginner', time: '8 min',
        description: 'Create a new bucket in Objects with versioning and a lifecycle policy.',
        objectives: [
            {
                // T-14 repair, choice = "corrected to real UI mutation paths".
                // The old predicate read state.getAll('buckets') — a collection
                // that does not exist (the store is object_buckets). The Objects
                // wizard already writes name, versioning and
                // lifecycle: { days, action }, so the objective is achievable
                // through the real UI path once the collection is fixed and the
                // objective matches the description (versioning + lifecycle).
                id: 'obj-1', text: 'Create a bucket named "lab-backups" with versioning and a lifecycle policy',
                validate: (s) => {
                    const ok = s.getAll('object_buckets').some(b =>
                        b.name === 'lab-backups' && b.versioning && b.lifecycle && b.lifecycle.days > 0);
                    return ok ? met() : unmet('no bucket named lab-backups with versioning and a lifecycle policy exists');
                },
            },
        ],
        hints: ['Navigate to PC → Objects', 'Click "+ Create Bucket"', 'Enable versioning and set a lifecycle retention window'],
        context: 'pc', startRoute: '/pc/objects',
    },
    {
        id: 'us-vol-01', exam: 'NCP-US', title: 'Volumes — iSCSI Target Migration',
        difficulty: 'Advanced', time: '12 min',
        description: 'Create a Volume Group for iSCSI storage and attach it to a VM client.',
        objectives: [
            {
                id: 'obj-1', text: 'Create a Volume Group named "Lab-VG"',
                validate: (s) => {
                    const ok = s.getAll('volume_groups').some(v => v.name === 'Lab-VG');
                    return ok ? met() : unmet('no volume group named Lab-VG exists');
                },
            },
        ],
        hints: ['Navigate to PC → Volumes', 'Click "+ Create Volume Group"', 'Add a disk and configure an iSCSI initiator IQN'],
        context: 'pc', startRoute: '/pc/volumes',
    },
    {
        id: 'us-analytics-01', exam: 'NCP-US', title: 'File Analytics — Audit Trail',
        difficulty: 'Intermediate', time: '8 min',
        description: 'Use File Analytics to review access patterns and audit file operations.',
        objectives: [
            {
                id: 'obj-1', text: 'Navigate to File Analytics and review dashboard',
                validate: (s, t) => visited(t, '/pc/analytics') ? met() : unmet('the File Analytics dashboard has not been opened'),
            },
        ],
        hints: ['Navigate to PC → File Analytics', 'Review the capacity trends and top users'],
        context: 'pc', startRoute: '/pc/analytics',
    },
    // Sprint 13 — NCP-CI scenarios (3)
    {
        id: 'ci-migrate-01', exam: 'NCP-CI', title: 'NC2 — Deploy Cloud Cluster',
        difficulty: 'Advanced', time: '15 min',
        description: 'Deploy a Nutanix Cloud Cluster on AWS and verify connectivity.',
        objectives: [
            {
                id: 'obj-1', text: 'Navigate to NC2 Deploy and review deployment options',
                validate: (s, t) => visited(t, '/pc/nc2-deploy') ? met() : unmet('the NC2 Deploy page has not been opened'),
            },
            {
                id: 'obj-2', text: 'Check NC2 Monitoring for cluster health',
                validate: (s, t) => visited(t, '/pc/nc2-monitoring') ? met() : unmet('the NC2 Monitoring page has not been opened'),
            },
        ],
        hints: ['Navigate to NC2 → Deploy Cluster', 'Review cloud provider options', 'Check monitoring dashboards'],
        context: 'pc', startRoute: '/pc/nc2-deploy',
    },
    {
        id: 'ci-monitor-01', exam: 'NCP-CI', title: 'NC2 Monitoring & Cost Comparison',
        difficulty: 'Intermediate', time: '10 min',
        description: 'Compare performance and cost metrics between on-prem and cloud clusters.',
        objectives: [
            {
                id: 'obj-1', text: 'View NC2 monitoring metrics for both clusters',
                validate: (s, t) => visited(t, '/pc/nc2-monitoring') ? met() : unmet('the NC2 Monitoring page has not been opened'),
            },
            {
                id: 'obj-2', text: 'Review cost estimates on the NC2 monitoring page',
                validate: (s, t) => visited(t, '/pc/nc2-monitoring') ? met() : unmet('the NC2 Monitoring cost estimates have not been reviewed'),
            },
        ],
        hints: ['Navigate to NC2 → Monitoring', 'Compare AWS vs Azure cluster metrics', 'Review hourly cost rates'],
        context: 'pc', startRoute: '/pc/nc2-monitoring',
    },
    {
        id: 'ci-scale-01', exam: 'NCP-CI', title: 'NC2 — Scale a Cloud Cluster',
        difficulty: 'Advanced', time: '10 min',
        description: 'Scale up an NC2 cluster by adding a node and configure an autoscale policy.',
        objectives: [
            {
                id: 'obj-1', text: 'View the scaling history for NC2 clusters',
                validate: (s, t) => visited(t, '/pc/nc2-scaling') ? met() : unmet('the NC2 Scaling page has not been opened'),
            },
            {
                id: 'obj-2', text: 'Review autoscale policies',
                validate: (s, t) => visited(t, '/pc/nc2-scaling') ? met() : unmet('the autoscale policies have not been reviewed'),
            },
        ],
        hints: ['Navigate to NC2 → Scaling', 'Review scaling history events', 'Check autoscale policy configurations'],
        context: 'pc', startRoute: '/pc/nc2-scaling',
    },
    // Sprint 13 — NCP-AI scenarios (3)
    {
        id: 'ai-model-01', exam: 'NCP-AI', title: 'NAI Model Registry',
        difficulty: 'Intermediate', time: '10 min',
        description: 'Browse the NAI model registry, review available models, and deploy an endpoint.',
        objectives: [
            {
                id: 'obj-1', text: 'Navigate to AI Models and view available models',
                validate: (s, t) => visited(t, '/pc/ai-models') ? met() : unmet('the AI Models page has not been opened'),
            },
            {
                id: 'obj-2', text: 'Check endpoint metrics for deployed models',
                validate: (s, t) => visited(t, '/pc/ai-monitoring') ? met() : unmet('the AI Monitoring page has not been opened for endpoint metrics'),
            },
        ],
        hints: ['Navigate to AI → Models', 'Review model frameworks and sizes', 'Check deployment status'],
        context: 'pc', startRoute: '/pc/ai-models',
    },
    {
        id: 'ai-monitor-01', exam: 'NCP-AI', title: 'NAI Endpoint Monitoring',
        difficulty: 'Intermediate', time: '8 min',
        description: 'Monitor NAI inference endpoints — check latency, throughput, GPU utilization, and error rates.',
        objectives: [
            {
                id: 'obj-1', text: 'View endpoint health and metrics',
                validate: (s, t) => visited(t, '/pc/ai-monitoring') ? met() : unmet('the AI Monitoring page has not been opened'),
            },
            {
                // Seed already has a degraded endpoint — state alone auto-passed.
                // Require the visit (observation objective, T-14).
                id: 'obj-2', text: 'Identify degraded endpoints',
                validate: (s, t) => {
                    if (!visited(t, '/pc/ai-monitoring')) return unmet('the AI Monitoring page has not been opened to identify degraded endpoints');
                    return s.getAll('ai_endpoint_metrics').some(e => e.status === 'degraded')
                        ? met() : unmet('no degraded endpoint is present to identify');
                },
            },
        ],
        hints: ['Navigate to AI → Monitoring', 'Look for endpoints with high error rates', 'Check GPU utilization percentages'],
        context: 'pc', startRoute: '/pc/ai-monitoring',
    },
    {
        id: 'ai-gpu-01', exam: 'NCP-AI', title: 'GPU OOM — Right-Size a Model',
        difficulty: 'Advanced', time: '10 min',
        description: 'Investigate a GPU out-of-memory condition and identify the model that needs quantization or scale-down.',
        objectives: [
            {
                // Seed already has a >90% GPU endpoint — state alone auto-passed.
                // Require the visit (observation objective, T-14).
                id: 'obj-1', text: 'Find the endpoint with >90% GPU utilization',
                validate: (s, t) => {
                    if (!visited(t, '/pc/ai-monitoring')) return unmet('the AI Monitoring page has not been opened to find high GPU use');
                    return s.getAll('ai_endpoint_metrics').some(e => e.gpu_util_pct > 90)
                        ? met() : unmet('no endpoint above 90% GPU utilization is present');
                },
            },
            {
                id: 'obj-2', text: 'Run nuclei ai.status in CLI to verify',
                validate: (s, t) => ranCli(t, /^nuclei\s+ai\.status\b/) ? met() : unmet('no nuclei ai.status command recorded'),
            },
        ],
        hints: ['Check AI Monitoring for high GPU usage', 'The SDXL image endpoint may be overloaded', 'Use CLI: nuclei ai.status'],
        context: 'pc', startRoute: '/pc/ai-monitoring',
    },
    // Sprint 13 — NCM-MCI scenarios (2)
    {
        id: 'mci-capacity-01', exam: 'NCM-MCI', title: 'PE Capacity Planning & Runway',
        difficulty: 'Intermediate', time: '10 min',
        description: 'Review PE capacity planning to understand resource runway and identify top consumers.',
        objectives: [
            {
                id: 'obj-1', text: 'Navigate to PE Capacity Planning and review CPU runway',
                validate: (s, t) => visited(t, '/pe/capacity') ? met() : unmet('the PE Capacity Planning page has not been opened'),
            },
            {
                id: 'obj-2', text: 'Identify the resource with shortest runway',
                validate: (s, t) => visited(t, '/pe/capacity') ? met() : unmet('the capacity runway has not been reviewed'),
            },
        ],
        hints: ['Navigate to PE → Capacity Planning (hamburger menu)', 'Memory typically has the shortest runway', 'Review the top consumer tables'],
        context: 'pe', startRoute: '/pe/capacity',
    },
    {
        id: 'mci-insights-01', exam: 'NCM-MCI', title: 'PC Insights — Optimization Review',
        difficulty: 'Intermediate', time: '8 min',
        description: 'Review Prism Central insights for optimization recommendations and anomaly detection.',
        objectives: [
            {
                // Seed already has active insights — state alone auto-passed.
                // Require the visit (observation objective, T-14).
                id: 'obj-1', text: 'Navigate to PC Insights and review active recommendations',
                validate: (s, t) => {
                    if (!visited(t, '/pc/insights')) return unmet('the PC Insights page has not been opened');
                    return s.getAll('insights').filter(i => i.status === 'active').length > 0
                        ? met() : unmet('no active insight is present to review');
                },
            },
            {
                id: 'obj-2', text: 'Identify critical insights requiring immediate action',
                validate: (s, t) => {
                    if (!visited(t, '/pc/insights')) return unmet('the PC Insights page has not been opened to identify critical items');
                    return s.getAll('insights').some(i => i.category === 'critical')
                        ? met() : unmet('no critical insight is present to identify');
                },
            },
        ],
        hints: ['Navigate to PC → Insights', 'Look for 🔴 critical items at the top', 'Review optimization suggestions for resource savings'],
        context: 'pc', startRoute: '/pc/insights',
    },
    // Sprint 46 (T-13) — CompTIA help-desk ticket scenarios (SPEC-04 REQ-AP-07,
    // SPEC-05 REQ-NP-02). Routed through TicketLabView; validators above.
    {
        id: 'aplus-dns-01', exam: 'COMPTIA-A-1201', title: 'Ticket HR-2214: Site loads by IP, not by name',
        difficulty: 'Beginner', time: '10 min',
        description: 'A help-desk ticket: the user can reach a website by IP address but not by name. Diagnose, fix the workstation, and document.',
        renderer: 'ticket',
        scenarioId: 'aplus-dns-01',
        validate: TICKET_VALIDATORS['aplus-dns-01'],
        ticket: {
            id: 'HR-2214', priority: 'P3', reportedBy: 'M. Alvarez (HR)',
            text: 'Since this morning I can open the intranet report portal by typing its IP address, but when I type the website name the browser says it cannot find it. Yesterday everything worked. I did not change anything.',
        },
        configFields: ['ip', 'gateway', 'dns'],
        editableField: 'dns',
        correctDns: '10.42.100.10',
        correctGateway: '10.42.100.1',
        hints: ['The user reaches services by IP — that rules out routing and the NIC.', 'Name resolution failing points at exactly one configuration field.', 'Run nslookup before and after the change to record the diagnosis.'],
        disclaimer: DISCLAIMER,
    },
    {
        id: 'netplus-gw-01', exam: 'COMPTIA-NET-009', title: 'Ticket SA-3391: Local share works, internet does not',
        difficulty: 'Beginner', time: '10 min',
        description: 'A network troubleshooting ticket: the workstation reaches its own subnet but nothing beyond it. Identify, fix, and verify.',
        renderer: 'ticket',
        scenarioId: 'netplus-gw-01',
        validate: TICKET_VALIDATORS['netplus-gw-01'],
        ticket: {
            id: 'SA-3391', priority: 'P3', reportedBy: 'D. Chen (Sales)',
            text: 'I can open shared folders and print, but I cannot reach anything outside our building — no websites, no webmail. Coworkers on the same floor are fine. A colleague was configuring my machine last week and may have "cleaned something up".',
        },
        configFields: ['ip', 'gateway', 'dns'],
        editableField: 'gateway',
        correctDns: '10.42.100.10',
        correctGateway: '10.42.200.1',
        topology: { subnets: ['10.42.200.0/24 — Sales', '10.42.100.0/24 — Services'], router: '10.42.200.1' },
        hints: ['Reaching hosts on the same subnet but nothing off-subnet is a classic default-gateway symptom.', 'The correct gateway for 10.42.200.0/24 is .1 — check the topology panel.', 'tracert after the fix verifies off-subnet reachability; document what you found.'],
        disclaimer: DISCLAIMER,
    },
];

export class ScenariosView extends BaseView {
    #activeScenario = null;
    #attemptRecorded = false;

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        // Group by exam — derive the exam list from the registry itself so
        // scenario entries are never invisible because of a hardcoded list.
        const exams = [...new Set(SCENARIOS.map(s => s.exam))];
        const grouped = {};
        exams.forEach(e => grouped[e] = SCENARIOS.filter(s => s.exam === e));

        el.innerHTML = `
            <div class="page-title">
                <h1>🧪 Guided Lab Scenarios</h1>
            </div>

            <div class="text-secondary text-sm" style="margin-bottom:var(--space-xl);">
                Complete hands-on lab exercises to practice for certification exams.
                Each scenario validates your actions against the simulator state.
            </div>

            <div id="scenario-list">
                ${exams.map(exam => `
                    <div class="card" style="margin-bottom:var(--space-lg);">
                        <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
                            ${exam}
                            <span class="text-secondary text-sm">${grouped[exam].length} scenarios</span>
                        </div>
                        <div class="card-body" style="padding:0;">
                            ${grouped[exam].map(s => `
                                <div class="scenario-item" data-id="${s.id}" style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border-light);cursor:pointer;transition:background 0.15s;">
                                    <div>
                                        <strong>${s.title}</strong>
                                        <div class="text-secondary text-sm">${s.description}</div>
                                    </div>
                                    <div style="display:flex;gap:12px;align-items:center;">
                                        <span class="text-secondary text-sm">${s.time}</span>
                                        <span class="status-badge ${s.difficulty === 'Beginner' ? 'good' : s.difficulty === 'Intermediate' ? 'warning' : 'critical'}"><span class="dot"></span>${s.difficulty}</span>
                                        <button class="btn btn-sm btn-primary start-scenario-btn" data-id="${s.id}">Start</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="card" id="scenario-history" style="margin-top:var(--space-xl);">
                <div class="card-header">History</div>
                <div class="card-body" id="scenario-history-list"></div>
            </div>

            <div id="active-scenario" style="display:none;"></div>
        `;

        return el;
    }

    afterRender() {
        document.querySelectorAll('.start-scenario-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.#startScenario(btn.dataset.id);
            });
        });

        document.querySelectorAll('.scenario-item').forEach(item => {
            item.addEventListener('mouseenter', () => item.style.background = 'var(--bg-secondary)');
            item.addEventListener('mouseleave', () => item.style.background = '');
        });

        this.#renderHistory();
    }

    destroy() {}

    #startScenario(id) {
        const scenario = SCENARIOS.find(s => s.id === id);
        if (!scenario) return;

        // Ticket scenarios run in the shared TicketLabView renderer (T-13);
        // the objective-checklist flow below stays for store-based scenarios.
        if (scenario.renderer === 'ticket') {
            const listDiv = document.getElementById('scenario-list');
            const activeDiv = document.getElementById('active-scenario');
            if (!listDiv || !activeDiv) return;
            listDiv.style.display = 'none';
            activeDiv.style.display = '';
            const lab = new TicketLabView();
            lab.render({ scenario }).then(el => {
                activeDiv.innerHTML = '';
                activeDiv.appendChild(el);
                lab.root = el;
                lab.afterRender({ scenario });
            });
            return;
        }

        this.#activeScenario = scenario;
        this.#attemptRecorded = false;
        const listDiv = document.getElementById('scenario-list');
        const activeDiv = document.getElementById('active-scenario');
        if (!listDiv || !activeDiv) return;

        listDiv.style.display = 'none';
        activeDiv.style.display = '';

        this.#renderActiveScenario(activeDiv, scenario);
    }

    /** SPEC-07: the UI evaluates the same (state, trace) entry point as CI. */
    #trace() {
        return state.getAll('action_trace');
    }

    #evalObjective(obj) {
        try {
            const result = obj.validate(state, this.#trace());
            return result?.passed === true;
        } catch {
            return false;
        }
    }

    #renderActiveScenario(container, scenario) {
        const results = scenario.objectives.map(obj => ({
            ...obj,
            passed: false,
        }));

        // Try initial validation — isolate each validator so one poisoned
        // objective doesn't leave the rest unrendered/unmarked.
        results.forEach(r => {
            r.passed = this.#evalObjective(r);
        });

        container.innerHTML = `
            <div class="card" style="margin-bottom:var(--space-lg);">
                <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <span class="status-badge info"><span class="dot"></span>${scenario.exam}</span>
                        <strong style="margin-left:8px;">${scenario.title}</strong>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button class="btn btn-sm btn-secondary" id="check-btn">✓ Check Progress</button>
                        <button class="btn btn-sm btn-secondary" id="hints-btn">💡 Show Hints</button>
                        <button class="btn btn-sm btn-secondary" id="navigate-btn">🔗 Go to View</button>
                        <button class="btn btn-sm btn-secondary" id="back-btn">← Back to Scenarios</button>
                    </div>
                </div>
                <div class="card-body">
                    <p>${scenario.description}</p>
                    <p class="text-secondary text-sm">⏱️ Estimated time: ${scenario.time} | Difficulty: ${scenario.difficulty}</p>
                </div>
            </div>

            <div class="card" style="margin-bottom:var(--space-lg);">
                <div class="card-header">Objectives</div>
                <div class="card-body" id="objectives-list">
                    ${results.map(r => `
                        <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border-light);" id="obj-${r.id}">
                            <span style="font-size:20px;">${r.passed ? '✅' : '⬜'}</span>
                            <span>${r.text}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="card" id="hints-panel" style="display:none;">
                <div class="card-header">💡 Hints</div>
                <div class="card-body">
                    <ol style="padding-left:20px;">
                        ${scenario.hints.map(h => `<li style="margin-bottom:8px;">${h}</li>`).join('')}
                    </ol>
                </div>
            </div>

            <div class="card" id="result-panel" style="display:none;">
                <div class="card-body" style="text-align:center;padding:32px;">
                    <div style="font-size:48px;" id="result-icon">🎉</div>
                    <h2 id="result-title">Scenario Complete!</h2>
                    <p id="result-message" class="text-secondary"></p>
                </div>
            </div>
        `;

        document.getElementById('back-btn')?.addEventListener('click', () => {
            container.style.display = 'none';
            document.getElementById('scenario-list').style.display = '';
        });

        document.getElementById('hints-btn')?.addEventListener('click', () => {
            const panel = document.getElementById('hints-panel');
            if (panel) panel.style.display = panel.style.display === 'none' ? '' : 'none';
        });

        document.getElementById('navigate-btn')?.addEventListener('click', async () => {
            // Record the navigation as a semantic action before leaving the view
            // so observation objectives can see it after the user returns.
            try {
                await state.create('action_trace', { action: 'route-entered', route: scenario.startRoute });
            } catch { /* trace write must never block navigation */ }
            window.location.hash = `#${scenario.startRoute}`;
        });

        document.getElementById('check-btn')?.addEventListener('click', () => {
            let allPassed = true;
            scenario.objectives.forEach(obj => {
                const passed = this.#evalObjective(obj);
                const el = document.getElementById(`obj-${obj.id}`);
                if (el) {
                    const icon = el.querySelector('span');
                    if (icon) icon.textContent = passed ? '✅' : '❌';
                }
                if (!passed) allPassed = false;
            });

            const resultPanel = document.getElementById('result-panel');
            if (resultPanel) {
                resultPanel.style.display = '';
                if (allPassed) {
                    document.getElementById('result-icon').textContent = '🎉';
                    document.getElementById('result-title').textContent = 'All Objectives Complete!';
                    document.getElementById('result-message').textContent = `Great job! You've completed "${scenario.title}".`;
                    toast.success(`Scenario "${scenario.title}" completed!`);
                    this.#recordAttempt(scenario);
                } else {
                    document.getElementById('result-icon').textContent = '🔄';
                    document.getElementById('result-title').textContent = 'Not Yet Complete';
                    document.getElementById('result-message').textContent = 'Some objectives are not met. Use the hints and navigate to the relevant view to complete them.';
                }
            }
        });
    }

    async #recordAttempt(scenario) {
        if (this.#attemptRecorded) return;
        this.#attemptRecorded = true;
        const existing = state.getAll('scenario_attempts')
            .filter(a => a.scenario_id === scenario.id && a.completed);
        await state.create('scenario_attempts', {
            scenario_id: scenario.id,
            scenario_title: scenario.title,
            exam: scenario.exam,
            attempt_number: existing.length + 1,
            completed: true,
            completed_at: new Date().toISOString(),
        });
        this.#renderHistory();
    }

    #renderHistory() {
        const list = document.getElementById('scenario-history-list');
        if (!list) return;
        const attempts = state.getAll('scenario_attempts');
        if (attempts.length === 0) {
            list.innerHTML = '<span class="text-secondary text-sm">No completed scenarios yet.</span>';
            return;
        }
        list.innerHTML = attempts.map(a => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-light);">
                <span>✅ <strong>${a.scenario_title}</strong> <span class="text-secondary text-sm">(${a.exam})</span></span>
                <span class="text-secondary text-sm">attempt #${a.attempt_number}${a.completed_at ? ` · ${new Date(a.completed_at).toLocaleString()}` : ''}</span>
            </div>
        `).join('');
    }
}
