/**
 * Store-based scenarios — multi-cluster, Calm, CLI and daily operations.
 *
 * The Sprint 11-12 set: cluster registration, blueprints, CLI mastery, Files
 * verification, the audit trail, LCM, networking, alerts, projects and SCMA.
 */
import { met, unmet, observation, ranAction, ranCli, visited } from './scenarios-shared.js';

export const STORE_OPERATIONS_SCENARIOS = [
    // ═══ Sprint 11 — New Scenarios ═══

    // Multi-Cluster & Calm
    {
        id: 'mc-01', exam: 'NCM-MCI', title: 'Register a Remote Cluster',
        fixtureSeed: 3007443415,
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
        fixtureSeed: 3024221034,
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
        fixtureSeed: 3040998653,
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
        fixtureSeed: 2923555320,
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
        fixtureSeed: 2659987263,
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
        fixtureSeed: 2676764882,
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
        fixtureSeed: 1932342352,
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
        fixtureSeed: 1949119971,
        difficulty: 'Beginner', time: '5 min',
        description: 'Check that minimum FSVM requirements (3 FSVMs, 12GB RAM each) are met.',
        objectives: [
            {
                // Observation of existing seed data. The state condition alone
                // auto-passes (seed ships 3 FSVMs) — REQ-SC-02 forbids that.
                // The learner must open the Files view to "verify" (T-14).
                id: 'obj-1', text: 'Verify at least 3 FSVMs are deployed',
                observation: true,
                validate: (s, t) => observation(t, '/pc/files', 'us-05', 'obj-1', {
                    what: 'the Files view',
                    also: () => s.getAll('fsvms').length >= 3 ? met() : unmet('fewer than 3 FSVMs are deployed'),
                }),
            },
            {
                id: 'obj-2', text: 'Verify each FSVM has at least 12 GB RAM',
                observation: true,
                validate: (s, t) => observation(t, '/pc/files', 'us-05', 'obj-2', {
                    what: 'the Files view',
                    also: () => s.getAll('fsvms').every(f => f.memory_gb >= 12) ? met() : unmet('at least one FSVM has less than 12 GB RAM'),
                }),
            },
        ],
        hints: ['Navigate to PC → Files', 'Check the FSVMs section', 'Minimum: 3 FSVMs, 4 vCPUs, 12 GB RAM each'],
        context: 'pc', startRoute: '/pc/files',
    },

    // Audit / Operations
    {
        id: 'ops-01', exam: 'NCM-MCI', title: 'Review Audit Trail',
        fixtureSeed: 1117254661,
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
                observation: true,
                validate: (s, t) => observation(t, '/pc/audit', 'ops-01', 'obj-2', { what: 'the audit log page' }),
            },
        ],
        hints: ['First, create something (e.g., a VM)', 'Then navigate to PC → Audit Log', 'You should see the create event recorded'],
        context: 'pc', startRoute: '/pc/audit',
    },
    // Sprint 12 — LCM, Networking, Alerts, Projects (8 scenarios)
    {
        id: 'lcm-01', exam: 'NCM-MCI', title: 'LCM Firmware Update',
        fixtureSeed: 2725195401,
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
        fixtureSeed: 2674862544,
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
        fixtureSeed: 950603700,
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
        fixtureSeed: 1000936557,
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
        fixtureSeed: 1683502799,
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
        fixtureSeed: 3479966294,
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
        fixtureSeed: 2693542501,
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
        fixtureSeed: 3103121751,
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
];
