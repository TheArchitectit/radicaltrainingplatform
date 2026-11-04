/**
 * Store-based scenarios — the core four-exam lab set.
 *
 * The original guided labs across NCM-MCI, NCP-US, NCP-CI and NCP-AI. Split
 * out of scenarios.js; SCENARIOS still assembles the registries in authored
 * order.
 */
import { met, unmet, observation, ranAction, ranCli } from './scenarios-shared.js';

export const STORE_CORE_SCENARIOS = [
    // NCM-MCI (4 scenarios)
    {
        id: 'mci-01', exam: 'NCM-MCI', title: 'Create and Power On a VM',
        fixtureSeed: 4138669076,
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
        fixtureSeed: 4189001933,
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
        fixtureSeed: 4172224314,
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
        fixtureSeed: 4088336219,
        difficulty: 'Advanced', time: '10 min',
        description: 'Use acli and ncli commands to list and manage cluster resources.',
        objectives: [
            {
                id: 'obj-1', text: 'Open the CLI terminal',
                observation: true,
                validate: (s, t) => observation(t, '/pe/cli', 'mci-04', 'obj-1', { what: 'the CLI terminal' }),
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
        fixtureSeed: 2016230447,
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
        fixtureSeed: 2033008066,
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
        fixtureSeed: 2049785685,
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
        fixtureSeed: 2545995575,
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
        fixtureSeed: 2562773194,
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
        fixtureSeed: 2579550813,
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
        fixtureSeed: 2462107480,
        difficulty: 'Beginner', time: '5 min',
        description: 'Attempt to deploy with invalid instance types and observe the validation errors.',
        objectives: [
            {
                id: 'obj-1', text: 'Open the AWS deploy wizard and observe instance type options',
                observation: true,
                validate: (s, t) => observation(t, '/pc/nc2-deploy', 'ci-04', 'obj-1', { what: 'the NC2 deploy wizard' }),
            },
        ],
        hints: ['Try selecting r5.metal — it should show a warning', 't3.xlarge is virtualized — won\'t work', 'Only i3.metal and i3en.metal are valid'],
        context: 'pc', startRoute: '/pc/nc2-deploy',
    },
    // NCP-AI (4 scenarios)
    {
        id: 'ai-01', exam: 'NCP-AI', title: 'Configure GPU with MIG',
        fixtureSeed: 645581177,
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
        fixtureSeed: 595248320,
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
        fixtureSeed: 612025939,
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
        fixtureSeed: 695914034,
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
];
