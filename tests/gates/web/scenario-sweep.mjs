/**
 * TM-45 scenario sweep (REQ-SC-02/03/04, T-14/S46-04).
 *
 * 1. Fresh-seed negativity: after state.reset() with an empty action trace,
 *    every objective of every store-based scenario evaluates false.
 * 2. Walkthrough solvability: a recorded action-script per scenario mutates
 *    the simulated store + trace through the same fields the real UI writes,
 *    and every objective then evaluates true (100%).
 * 3. Wrong-state negativity: for repaired scenarios, an incorrect final
 *    state fails and the failure message names the unmet objective.
 *
 * Evaluates the same (state, trace) entry point the UI uses.
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

const dom = installDom();
const runner = makeRunner();

const { state } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateEngine.js');
const { SCENARIOS, TICKET_VALIDATORS } = await import('../../../RadicalTrainingPlatform.Web/js/views/scenarios.js');

// Ticket scenarios are validated by TicketLabView against its own trace;
// they are covered by ticket-scenarios.mjs. This sweep covers store-based
// scenarios.
const STORE_SCENARIOS = SCENARIOS.filter(s => s.renderer !== 'ticket');

function evalScenario(s) {
    const trace = state.getAll('action_trace');
    return s.objectives.map(obj => {
        try {
            const r = obj.validate(state, trace);
            return { id: obj.id, passed: r?.passed === true, unmet: r?.unmetConditions || [] };
        } catch (e) {
            return { id: obj.id, passed: false, unmet: [`validator threw: ${e.message}`] };
        }
    });
}

async function traceAdd(action) {
    await state.create('action_trace', action);
}

/**
 * Walkthroughs. Each mutates state + trace through the same fields the real
 * UI mutation path writes (see SPRINT-46.md Notes for the field map).
 */
const WALKTHROUGHS = {
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
};

await runner.test('every store-based scenario has a walkthrough', async () => {
    const missing = STORE_SCENARIOS.filter(s => !WALKTHROUGHS[s.id]);
    assertEqual(missing.map(s => s.id).join(',') || '(none)', '(none)',
        `missing walkthroughs for: ${missing.map(s => s.id).join(', ')}`);
});

// ── 1. Fresh-seed negativity (REQ-SC-02) ──

await runner.test('every objective of every store-based scenario fails on a fresh seed', async () => {
    await state.init();
    await state.reset();
    const autoPass = [];
    for (const s of STORE_SCENARIOS) {
        for (const r of evalScenario(s)) {
            if (r.passed) autoPass.push(`${s.id}/${r.id}`);
        }
    }
    assertEqual(autoPass.join(',') || '(none)', '(none)',
        `objectives that auto-pass on a fresh seed (REQ-SC-02): ${autoPass.join(', ')}`);
});

// ── 2. Walkthrough solvability (REQ-SC-03) ──

await runner.test('every store-based scenario reaches 100% via its walkthrough', async () => {
    const failures = [];
    for (const s of STORE_SCENARIOS) {
        const walk = WALKTHROUGHS[s.id];
        if (!walk) { failures.push(`${s.id}: no walkthrough`); continue; }
        await state.reset();
        await walk();
        const results = evalScenario(s);
        for (const r of results) {
            if (!r.passed) {
                failures.push(`${s.id}/${r.id}: unmet after walkthrough — ${r.unmet.join('; ')}`);
            }
        }
    }
    assertEqual(failures.join(' | ') || '(none)', '(none)',
        `walkthrough solvability failures (REQ-SC-03): ${failures.join(' | ')}`);
});

// ── 3. Wrong-state negativity for repaired scenarios (REQ-SC-04) ──

await runner.test('us-bucket-01 fails without versioning+lifecycle (repaired contract)', async () => {
    await state.reset();
    // Wrong-state: bucket exists but is missing the versioning/lifecycle contract.
    await state.create('object_buckets', {
        name: 'lab-backups', store: 'object-store-001',
        versioning: false, worm_enabled: false, lifecycle: null,
    });
    const s = STORE_SCENARIOS.find(x => x.id === 'us-bucket-01');
    const results = evalScenario(s);
    assertEqual(results[0].passed, false, 'bucket without versioning/lifecycle must fail');
    assert(results[0].unmet.length > 0, 'failure must name an unmet condition');
    assert(results[0].unmet.some(m => /versioning|lifecycle/i.test(m)),
        `unmet message should name the contract, got: ${results[0].unmet.join('; ')}`);
});

await runner.test('us-bucket-01 fails when the wrong collection name is used', async () => {
    await state.reset();
    // The pre-repair bug read state.getAll('buckets') — a collection that
    // does not exist. Writing to that wrong collection must not pass.
    await state.create('buckets', {
        name: 'lab-backups', versioning: true,
        lifecycle: { days: 90, action: 'expire' },
    }).catch(() => {});
    const s = STORE_SCENARIOS.find(x => x.id === 'us-bucket-01');
    const results = evalScenario(s);
    assertEqual(results[0].passed, false,
        'entities written to the wrong collection must not satisfy the objective');
});

await runner.test('mci-01 fails without power-on (obj-4 names the unmet objective)', async () => {
    await state.reset();
    await state.create('vms', {
        name: 'Lab-WebServer', vcpus: 2, memory_gb: 4, power_state: 'off',
        host_uuid: 'host-001', is_cvm: false,
        disks: [{ size_gb: 40, container: 'default', image: 'CentOS-8-GenericCloud' }],
        nics: [{ network_uuid: 'net-001' }],
    });
    const s = STORE_SCENARIOS.find(x => x.id === 'mci-01');
    const results = evalScenario(s);
    const byId = Object.fromEntries(results.map(r => [r.id, r]));
    assertEqual(byId['obj-4'].passed, false, 'obj-4 must fail while the VM is off');
    assert(byId['obj-4'].unmet.some(m => /powered on/i.test(m)),
        `unmet message should name the power-state objective, got: ${byId['obj-4'].unmet.join('; ')}`);
    assertEqual(byId['obj-1'].passed, true, 'obj-1 should already be met by the created VM');
});

await runner.test('ci-03 obj-2 fails without resume (mutual-exclusion repaired via trace)', async () => {
    await state.reset();
    await state.create('action_trace', { action: 'nc2-hibernate', cluster: 'NC2-Prod-AWS' });
    const s = STORE_SCENARIOS.find(x => x.id === 'ci-03');
    const results = evalScenario(s);
    const byId = Object.fromEntries(results.map(r => [r.id, r]));
    assertEqual(byId['obj-1'].passed, true, 'obj-1 should pass after hibernate');
    assertEqual(byId['obj-2'].passed, false, 'obj-2 must fail before resume');
    assert(byId['obj-2'].unmet.some(m => /resumed/i.test(m)),
        `unmet message should name the resume objective, got: ${byId['obj-2'].unmet.join('; ')}`);
});

await runner.test('mci-01 fails when the image/network field shapes are wrong (old bug class)', async () => {
    await state.reset();
    // Pre-repair shapes: image === 'CentOS-8' and n.subnet === 'VM-100'.
    await state.create('vms', {
        name: 'Lab-WebServer', vcpus: 2, memory_gb: 4, power_state: 'on',
        host_uuid: 'host-001', is_cvm: false,
        disks: [{ size_gb: 40, container: 'default', image: 'CentOS-8' }],
        nics: [{ subnet: 'VM-100' }],
    });
    const s = STORE_SCENARIOS.find(x => x.id === 'mci-01');
    const results = evalScenario(s);
    const byId = Object.fromEntries(results.map(r => [r.id, r]));
    assertEqual(byId['obj-2'].passed, false,
        'the old image string "CentOS-8" is not what the UI writes — must not pass');
    assertEqual(byId['obj-3'].passed, false,
        'the old n.subnet shape is not what the UI writes — must not pass');
});

// ── 4. Ticket validators keep their (state, trace) shape (SPEC-07) ──

await runner.test('ticket validators expose the universal (state, trace) shape', async () => {
    for (const id of ['aplus-dns-01', 'netplus-gw-01']) {
        assert(typeof TICKET_VALIDATORS[id] === 'function', `${id} validator must be a function`);
        const entry = SCENARIOS.find(s => s.id === id);
        assertEqual(entry.validate, TICKET_VALIDATORS[id],
            `${id} registry entry must reference the shared ticket validator`);
    }
});

process.exit(runner.done('scenario-sweep fixture'));
