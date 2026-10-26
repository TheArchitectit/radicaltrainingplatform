/**
 * Shared scenario walkthroughs (T-21).
 *
 * Extracted from scenario-sweep.mjs so the sweep and the TM-45 demo sweep
 * report drive scenarios through the *same* recorded action-script. Two
 * copies would drift, and a sweep report that walks differently from the
 * sweep is not evidence of the sweep.
 *
 * Lives in `lib/` deliberately: `run_web_fixtures.sh` globs
 * `tests/gates/web/*.mjs` (non-recursive) and treats every match as a
 * fixture that must exit 0 with PASS lines. This module has no runner.
 *
 * Each walkthrough mutates state + trace through the same fields the real
 * UI mutation path writes (see SPRINT-46.md Notes for the field map).
 */
import { state } from '../../../../RadicalTrainingPlatform.Web/js/core/StateEngine.js';

export { state };

/**
 * Evaluate every objective of a scenario against the current (state, trace).
 *
 * Ticket scenarios carry no `objectives` array — they expose a single
 * scenario-level `validate` (SPEC-07 keeps the same (state, trace) shape).
 * For those, the scenario itself is the one objective, so a sweep can report
 * them beside the store-based scenarios without special-casing the caller.
 */
export function evalScenario(s) {
    const trace = state.getAll('action_trace');
    const objectives = s.objectives || (s.validate
        ? [{ id: 'scenario', text: s.title, validate: s.validate }]
        : []);
    return objectives.map(obj => {
        try {
            const r = obj.validate(state, trace);
            return { id: obj.id, text: obj.text, passed: r?.passed === true, unmet: r?.unmetConditions || [] };
        } catch (e) {
            return { id: obj.id, text: obj.text, passed: false, unmet: [`validator threw: ${e.message}`] };
        }
    });
}

export async function traceAdd(action) {
    await state.create('action_trace', action);
}

/**
 * T-21: observation objectives (flagged `observation`) are not complete on
 * a visit — they need a recorded interpretation response. The walkthroughs
 * mutate state and record the visit; this records the interpretation the
 * real UI collects through the scenario's interpretation form.
 */
export async function recordInterpretations(s) {
    for (const obj of s.objectives || []) {
        if (!obj.observation) continue;
        await traceAdd({
            action: 'interpretation',
            scenarioId: s.id,
            objectiveId: obj.id,
            response: `Fixture interpretation for ${s.id}/${obj.id}.`,
        });
    }
}

export const WALKTHROUGHS = {
    'mci-01': async () => {
        await state.create('vms', {
            name: 'Lab-WebServer', vcpus: 2, memory_gb: 4, power_state: 'off',
            host_uuid: 'host-001', is_cvm: false,
            disks: [{ size_gb: 40, container: 'default', image: 'CentOS-8-GenericCloud' }],
            nics: [{ network_uuid: 'net-001' }],
        });
        const vm = state.getAll('vms').find(v => v.name === 'Lab-WebServer');
        await state.update('vms', vm.uuid, { power_state: 'on' });
    },
    'mci-02': async () => {
        await state.create('protection_domains', {
            name: 'PD-Lab-DR', type: 'availability',
            vms: ['vm-001'],
            schedule: { interval: 'hourly', retention_local: 24, retention_remote: 72 },
            remote_site: 'DR-Site',
        });
    },
    'mci-03': async () => {
        const at = state.getAll('categories').find(c => c.key === 'AppType');
        await state.update('categories', at.uuid, { values: [...at.values, 'Lab-App'] });
        await state.create('flow_policies', {
            name: 'Lab-AppPolicy', type: 'Application', mode: 'white',
            target_categories: [], source_categories: [], rules: [],
        });
    },
    'mci-04': async () => {
        await traceAdd({ action: 'route-entered', route: '/pe/cli' });
        await traceAdd({ action: 'cli-command', command: 'acli vm.list' });
        await traceAdd({ action: 'cli-command', command: 'ncli cluster get-params' });
    },
    'us-01': async () => {
        for (let i = 0; i < 3; i++) {
            await state.create('fsvms', {
                name: `Lab-FSVM-${i + 1}`, ip: `10.0.0.${20 + i}`,
                vcpus: 4, memory_gb: 12, host_uuid: 'host-001', status: 'healthy',
            });
        }
        await state.create('file_shares', {
            name: 'Lab-Share', protocol: 'SMB', path: '/Lab-Share',
            max_size_gb: 100, ssr_enabled: true, multi_protocol: false,
        });
    },
    'us-02': async () => {
        await state.create('object_buckets', {
            name: 'compliance-lab', store: 'object-store-001',
            versioning: true, worm_enabled: true, lifecycle: null,
        });
    },
    'us-03': async () => {
        await state.create('volume_groups', {
            name: 'Lab-VG', iscsi_target: 'iqn.2010-06.com.nutanix:lab-vg',
            disks: [], clients: [], chap_enabled: true, flash_mode: false,
        });
    },
    'ci-01': async () => {
        await state.create('nc2_clusters', {
            name: 'NC2-Lab-AWS', provider: 'AWS', instance_type: 'i3.metal',
            region: 'us-east-1', az: 'us-east-1a', node_count: 3, rf: 2,
            status: 'running', flow_gateway_count: 0,
        });
    },
    'ci-02': async () => {
        await state.create('nc2_clusters', {
            name: 'NC2-Lab-Azure', provider: 'Azure', instance_type: 'AN36',
            region: 'eastus', az: 'eastus-1', node_count: 3, rf: 2,
            status: 'running', flow_gateway_count: 2, subnet_prefix: '/24',
        });
    },
    'ci-03': async () => {
        await state.create('action_trace', { action: 'nc2-hibernate', cluster: 'NC2-Prod-AWS' });
        await state.create('action_trace', { action: 'nc2-resume', cluster: 'NC2-Prod-AWS' });
    },
    'ci-04': async () => {
        await traceAdd({ action: 'route-entered', route: '/pc/nc2-deploy' });
    },
    'ai-01': async () => {
        await state.create('gpu_devices', {
            name: 'GPU-Lab-Slot2', model: 'A100', mode: 'mig',
            host_uuid: 'host-002', status: 'available',
        });
    },
    'ai-02': async () => {
        await state.create('nai_endpoints', {
            name: 'lab-endpoint', engine: 'vllm', model: 'llama-3-8b',
            status: 'running', url: 'https://sim.lab/v1',
        });
    },
    'ai-03': async () => {
        await traceAdd({ action: 'vram-calculate', params: 70, precision: 'FP16' });
    },
    'ai-04': async () => {
        await traceAdd({ action: 'api-request', path: '/chat/completions', status: 200 });
        await traceAdd({ action: 'api-request', path: '/chat/completions', status: 422 });
    },
    'mc-01': async () => {
        await state.create('registered_clusters', {
            name: 'NTNX-Lab-Remote', ip: '10.0.0.50', status: 'registered',
        });
    },
    'mc-02': async () => {
        await state.create('blueprints', {
            name: 'Lab-3Tier', type: 'Multi-VM', status: 'draft',
            services: [{ name: 'WebServer' }, { name: 'Database' }], source: 'local',
        });
    },
    'mc-03': async () => {
        for (let i = 0; i < 3; i++) {
            await state.create('applications', {
                name: `Lab-App-${i + 1}`, blueprint: 'Lab-3Tier', status: 'running',
            });
        }
    },
    'mc-04': async () => {
        await state.create('blueprints', {
            name: 'Mysql-clone', type: 'Single VM', status: 'draft',
            services: [], source: 'marketplace',
        });
    },
    'cli-01': async () => {
        await state.create('containers', { name: 'CLI-Container', rf: 2, size_gb: 0 });
        await state.create('networks', { name: 'CLI-Net', vlan: 500, type: 'vlan' });
    },
    'cli-02': async () => {
        await traceAdd({ action: 'cli-command', command: 'calm blueprint list' });
        await traceAdd({ action: 'cli-command', command: 'nuclei inventory' });
    },
    'us-04': async () => {
        await state.create('file_shares', {
            name: 'lab-nfs', protocol: 'NFS', path: '/lab-nfs',
            max_size_gb: 50, ssr_enabled: false, multi_protocol: false,
        });
    },
    'us-05': async () => {
        await traceAdd({ action: 'route-entered', route: '/pc/files' });
    },
    'ops-01': async () => {
        await state.create('audit_log', { action: 'create', entity: 'vm', detail: 'created Lab-VM' });
        await traceAdd({ action: 'route-entered', route: '/pc/audit' });
    },
    'lcm-01': async () => {
        await traceAdd({ action: 'route-entered', route: '/pc/lcm' });
        await traceAdd({ action: 'lcm-scan' });
        await state.create('lcm_update_history', {
            component: 'AHV', entity: 'hypervisor',
            from_version: '20230302', to_version: '20230630',
            status: 'success', completed_at: new Date().toISOString(),
        });
    },
    'lcm-02': async () => {
        const s = state.getAll('pc_settings')[0];
        await state.update('pc_settings', s.uuid, {
            ntp_servers: ['ntp1', 'ntp2', 'ntp3'], dns_servers: ['dns1', 'dns2'],
        });
    },
    'net-01': async () => {
        const vpc = await state.create('vpcs', { name: 'Lab-VPC', cidr: '10.20.0.0/16' });
        await state.create('subnets', {
            name: 'Lab-Subnet', vpc_uuid: vpc.uuid, type: 'overlay',
            cidr: '10.20.1.0/24', gateway: '10.20.1.1',
            pool_start: '10.20.1.10', pool_end: '10.20.1.200', nat: true,
        });
    },
    'net-02': async () => {
        await state.create('floating_ips', {
            ip: '192.168.50.10', vpc_uuid: 'vpc-001', vpc_name: 'Default-VPC',
            assigned_to: null, status: 'available',
        });
    },
    'alert-01': async () => {
        await state.create('alert_policies', {
            name: 'Lab-Critical-Policy', severity: 'critical', enabled: true,
        });
        await state.update('alerts', 'alert-001', { resolved: true, resolved_at: new Date().toISOString() });
    },
    'proj-01': async () => {
        await state.create('projects', {
            name: 'Lab-Project', description: 'scenario walkthrough',
            vcpu_quota: 10, memory_quota_gb: 40, storage_quota_gb: 200,
            vcpu_used: 0, memory_used_gb: 0, storage_used_gb: 0,
            users: [], infrastructure: {},
        });
    },
    'cli-03': async () => {
        await traceAdd({ action: 'cli-command', command: 'lcm_inventory' });
        await traceAdd({ action: 'cli-command', command: 'alert list' });
        await traceAdd({ action: 'cli-command', command: 'project list' });
    },
    'scma-01': async () => {
        const s = state.getAll('pc_settings')[0];
        await state.update('pc_settings', s.uuid, { scma_enabled: true });
    },
    'us-repl-01': async () => {
        await state.create('file_shares', {
            name: 'Lab-Shared', protocol: 'SMB', path: '/Lab-Shared',
            max_size_gb: 200, ssr_enabled: false, multi_protocol: false,
        });
        await traceAdd({ action: 'route-entered', route: '/pc/files' });
    },
    'us-bucket-01': async () => {
        // Real Objects wizard shape: name + versioning + lifecycle {days, action}.
        await state.create('object_buckets', {
            name: 'lab-backups', store: 'object-store-001',
            versioning: true, worm_enabled: false,
            lifecycle: { days: 90, action: 'expire' },
        });
    },
    'us-vol-01': async () => {
        await state.create('volume_groups', {
            name: 'Lab-VG', iscsi_target: 'iqn.2010-06.com.nutanix:lab-vg',
            disks: [], clients: [], chap_enabled: false, flash_mode: false,
        });
    },
    'us-analytics-01': async () => {
        await traceAdd({ action: 'route-entered', route: '/pc/analytics' });
    },
    'ci-migrate-01': async () => {
        await traceAdd({ action: 'route-entered', route: '/pc/nc2-deploy' });
        await traceAdd({ action: 'route-entered', route: '/pc/nc2-monitoring' });
    },
    'ci-monitor-01': async () => {
        await traceAdd({ action: 'route-entered', route: '/pc/nc2-monitoring' });
    },
    'ci-scale-01': async () => {
        await traceAdd({ action: 'route-entered', route: '/pc/nc2-scaling' });
    },
    'ai-model-01': async () => {
        await traceAdd({ action: 'route-entered', route: '/pc/ai-models' });
        await traceAdd({ action: 'route-entered', route: '/pc/ai-monitoring' });
    },
    'ai-monitor-01': async () => {
        await traceAdd({ action: 'route-entered', route: '/pc/ai-monitoring' });
    },
    'ai-gpu-01': async () => {
        await traceAdd({ action: 'route-entered', route: '/pc/ai-monitoring' });
        await traceAdd({ action: 'cli-command', command: 'nuclei ai.status' });
    },
    'mci-capacity-01': async () => {
        await traceAdd({ action: 'route-entered', route: '/pe/capacity' });
    },
    'mci-insights-01': async () => {
        await traceAdd({ action: 'route-entered', route: '/pc/insights' });
    },

    // ── NCA beginner set (T-35, REQ-NCA-07) ──
    // These write the same trace actions NcaLabView writes on each answer.
    'nca-tool-01': async () => {
        await traceAdd({ action: 'tool-selected', task: 'task-1', tool: 'move' });
        await traceAdd({ action: 'tool-selected', task: 'task-2', tool: 'foundation' });
        await traceAdd({ action: 'tool-selected', task: 'task-3', tool: 'ssr' });
    },
    'nca-vm-01': async () => {
        // Same shape the PE VM wizard writes (see mci-01's walkthrough).
        await state.create('vms', {
            name: 'Lab-AppServer', vcpus: 4, memory_gb: 8, power_state: 'off',
            host_uuid: 'host-001', is_cvm: false,
            disks: [{ size_gb: 40, container: 'Gold-Container', image: 'CentOS-8-GenericCloud' }],
            nics: [{ network_uuid: 'net-002' }],
        });
        const vm = state.getAll('vms').find(v => v.name === 'Lab-AppServer');
        await state.update('vms', vm.uuid, { power_state: 'on' });
    },
    'nca-maint-01': async () => {
        await traceAdd({
            action: 'sequence-order',
            steps: ['health-check', 'evacuate-host', 'maintenance-mode', 'lcm-upgrade'],
        });
    },
    'nca-alert-01': async () => {
        await traceAdd({ action: 'alert-opened', alert: 'alert-001' });
        await traceAdd({ action: 'triage-selected', step: 'expand-container' });
    },
};

/**
 * Ticket scenarios are validated by TicketLabView against its own trace
 * (see ticket-scenarios.mjs). Their walkthrough writes through the same
 * `ticket_workstations` record + trace actions the ticket UI writes, so the
 * demo sweep can report them alongside the store-based scenarios.
 */
export const TICKET_WALKTHROUGHS = {
    'aplus-dns-01': async () => {
        await state.update('ticket_workstations', 'ws-dns-01', {
            config: { ip: '10.42.100.114', gateway: '10.42.100.1', dns: '10.42.100.10' },
            resolution_note: 'Pointed the workstation resolver at 10.42.100.10; name resolution restored.',
        });
        await traceAdd({ action: 'test-run', test: 'ping-ip' });
        await traceAdd({ action: 'test-run', test: 'nslookup' });
    },
    'netplus-gw-01': async () => {
        await state.update('ticket_workstations', 'ws-gw-01', {
            config: { ip: '10.42.200.207', gateway: '10.42.200.1', dns: '10.42.100.10' },
            resolution_note: 'Corrected the default gateway to 10.42.200.1 for the 10.42.200.0/24 subnet.',
        });
        await traceAdd({ action: 'test-run', test: 'tracert' });
    },
    'aplus-ipconf-01': async () => {
        await state.update('ticket_workstations', 'ws-ipconf-01', {
            config: { ip: '10.42.100.121', gateway: '10.42.100.1', dns: '10.42.100.10' },
            resolution_note: 'Address 10.42.100.118 duplicated a spare laptop left docked on the same switch port; moved to the assigned 10.42.100.121 and ping is steady.',
        });
        await traceAdd({ action: 'test-run', test: 'ipconfig' });
        await traceAdd({ action: 'test-run', test: 'ping-ip' });
    },
};

/** Run the recorded action-script for any scenario id. */
export async function runWalkthrough(s) {
    const walk = WALKTHROUGHS[s.id] || TICKET_WALKTHROUGHS[s.id];
    if (!walk) throw new Error(`no walkthrough recorded for scenario ${s.id}`);
    await walk();
    await recordInterpretations(s);
}
