import { state } from '../core/StateEngine.js';

/**
 * CLIService — Command parser and executor for Nutanix CLI tools.
 * Supports: acli, ncli, ncc, genesis, cluster, logbay, curator_cli,
 * zeus_config_printer, manage_ovs, ovs-vsctl, ovs-ofctl, allssh, curl
 */
export class CLIService {
    execute(input) {
        const trimmed = input.trim();
        if (!trimmed) return '';

        const parts = this.#tokenize(trimmed);
        const cmd = parts[0]?.toLowerCase();
        const args = parts.slice(1);

        const handlers = {
            'acli': () => this.#acli(args),
            'ncli': () => this.#ncli(args),
            'ncc': () => this.#ncc(args),
            'genesis': () => this.#genesis(args),
            'cluster': () => this.#cluster(args),
            'logbay': () => this.#logbay(args),
            'curator_cli': () => this.#curatorCli(args),
            'zeus_config_printer': () => this.#zeus(args),
            'manage_ovs': () => this.#manageOvs(args),
            'ovs-vsctl': () => this.#ovsVsctl(args),
            'ovs-ofctl': () => this.#ovsOfctl(args),
            'allssh': () => this.#allssh(args),
            'curl': () => this.#curl(args),
            'nuclei': () => this.#nuclei(args),
            'calm': () => this.#calm(args),
            'upgrade_check': () => this.#upgradeCheck(args),
            'host_disks_check': () => this.#hostDisksCheck(args),
            'links': () => this.#links(),
            'df': () => this.#df(),
            'uptime': () => this.#uptime(),
            'whoami': () => 'nutanix',
            'hostname': () => state.hosts[0]?.name || 'NTNX-CVM',
            'date': () => new Date().toString(),
            'lcm_inventory': () => this.#lcmInventory(args),
            'alert': () => this.#alertCmd(args),
            'project': () => this.#projectCmd(args),
            'help': () => this.#help(),
            'clear': () => '__CLEAR__',
        };

        const handler = handlers[cmd];
        if (!handler) return `bash: ${cmd}: command not found\nType 'help' for available commands.`;
        return handler();
    }

    #tokenize(input) {
        const tokens = [];
        let current = '';
        let inQuote = false;
        let quoteChar = '';

        for (const ch of input) {
            if (inQuote) {
                if (ch === quoteChar) { inQuote = false; continue; }
                current += ch;
            } else if (ch === '"' || ch === "'") {
                inQuote = true; quoteChar = ch;
            } else if (ch === ' ') {
                if (current) { tokens.push(current); current = ''; }
            } else {
                current += ch;
            }
        }
        if (current) tokens.push(current);
        return tokens;
    }

    #help() {
        return `Available Nutanix CLI Tools:
──────────────────────────────
  acli           AHV CLI (VM, network, image, container management)
  ncli           Nutanix CLI (cluster, container, PD, security, host)
  ncc            Nutanix Cluster Check (health checks, targeted checks)
  genesis        Service management (restart, service start/stop/restart)
  cluster        Cluster management utilities
  logbay         Log collection
  curator_cli    Storage curator (scans, dedup stats)
  zeus_config_printer   Cluster configuration dump
  manage_ovs     Open vSwitch management
  ovs-vsctl      OVS configuration
  ovs-ofctl      OVS flow tables
  allssh         Run command on all CVMs
  curl           HTTP client (API calls)
  nuclei         LCM / Foundation / NAI status
  calm           Calm automation CLI (blueprint, app management)
  upgrade_check  AOS / AHV upgrade compatibility check
  host_disks_check   Physical disk inventory
  links          Network interface status
  df             Disk usage summary
  uptime         System uptime
  whoami         Current user
  hostname       CVM hostname
  date           Current date/time
  lcm_inventory  LCM software/firmware inventory
  alert          Alert management (list, resolve)
  project        Project management (list, info)
  help           This help message
  clear          Clear terminal

Usage examples:
  acli vm.list
  acli container.list
  ncli cluster info
  ncli host add ip=10.42.100.50 hypervisor=ahv
  ncli host list
  ncli container stats name=Default-Container
  ncc health_checks run_all
  ncc --target cvm
  genesis service restart prism
  nuclei ai.status
  acli vm.create name=MyVM memory=4G num_vcpus=2
  calm blueprint list
  curl -k https://10.42.100.37:9440/api/nutanix/v3/vms/list -X POST -d '{}'`;
    }

    // ── ACLI ──
    #acli(args) {
        if (args.length === 0) return 'Usage: acli <command>\nCommands: vm.list, vm.create, vm.get, vm.on, vm.off, vm.delete, net.list, net.create, image.list, container.list, container.stats';
        const sub = args[0]?.toLowerCase();
        const params = this.#parseKV(args.slice(1));

        switch (sub) {
            case 'vm.list': return this.#acliVmList();
            case 'vm.get': return this.#acliVmGet(params);
            case 'vm.create': return this.#acliVmCreate(params);
            case 'vm.on': return this.#acliVmPower(params, 'on');
            case 'vm.off': return this.#acliVmPower(params, 'off');
            case 'vm.delete': return this.#acliVmDelete(params);
            case 'net.list': return this.#acliNetList();
            case 'net.create': return this.#acliNetCreate(params);
            case 'image.list': return this.#acliImageList();
            case 'container.list': return this.#ncliContainerList();
            case 'container.stats': return this.#ncliContainerStats(params);
            default: return `acli: unknown command '${sub}'`;
        }
    }

    #acliVmList() {
        const vms = state.vms;
        if (vms.length === 0) return 'No VMs found.';
        const header = 'Name                          Power    vCPUs  Memory   IP Address';
        const sep = '─'.repeat(70);
        const rows = vms.map(v => {
            const ip = v.nics?.[0]?.ip || 'N/A';
            return `${v.name.padEnd(30)}${v.power_state.padEnd(9)}${String(v.vcpus).padEnd(7)}${v.memory_gb + ' GB'.padEnd(9)}${ip}`;
        });
        return [header, sep, ...rows].join('\n');
    }

    #acliVmGet(params) {
        const name = params.name || params._positional?.[0];
        if (!name) return 'Usage: acli vm.get <name>';
        const vm = state.vms.find(v => v.name === name);
        if (!vm) return `Error: VM '${name}' not found`;
        return `VM: ${vm.name}
  UUID: ${vm.uuid}
  Power State: ${vm.power_state}
  vCPUs: ${vm.vcpus}
  Memory: ${vm.memory_gb} GB
  Host: ${state.getById('hosts', vm.host_uuid)?.name || 'N/A'}
  Disks: ${(vm.disks || []).map(d => `${d.size_gb}GB on ${d.container}`).join(', ')}
  NICs: ${(vm.nics || []).map(n => n.ip || n.network_uuid).join(', ')}`;
    }

    #acliVmCreate(params) {
        if (!params.name) return 'Usage: acli vm.create name=<name> memory=<size> num_vcpus=<n>';
        const memStr = params.memory || '4G';
        const memGB = memStr.toLowerCase().endsWith('g') ? parseInt(memStr) : Math.round(parseInt(memStr) / 1024);
        const vcpus = parseInt(params.num_vcpus || params.vcpus || '2');

        if (state.vms.some(v => v.name === params.name)) return `Error: VM '${params.name}' already exists`;

        const hosts = state.hosts;
        const host = hosts[Math.floor(Math.random() * hosts.length)];

        state.create('vms', {
            name: params.name,
            vcpus: vcpus || 2,
            memory_gb: memGB || 4,
            power_state: 'off',
            host_uuid: host.uuid,
            is_cvm: false,
            disks: [{ size_gb: 40, container: 'default-container' }],
            nics: [{ network_uuid: state.networks[0]?.uuid }],
        });

        return `VM '${params.name}' created successfully.\n  vCPUs: ${vcpus}, Memory: ${memGB} GB, Host: ${host.name}`;
    }

    #acliVmPower(params, targetState) {
        const name = params.name || params._positional?.[0];
        if (!name) return `Usage: acli vm.${targetState} <name>`;
        const vm = state.vms.find(v => v.name === name);
        if (!vm) return `Error: VM '${name}' not found`;
        if (vm.is_cvm) return `Error: Cannot change power state of Controller VM`;
        state.update('vms', vm.uuid, { power_state: targetState });
        return `VM '${name}' powered ${targetState}.`;
    }

    #acliVmDelete(params) {
        const name = params.name || params._positional?.[0];
        if (!name) return 'Usage: acli vm.delete <name>';
        const vm = state.vms.find(v => v.name === name);
        if (!vm) return `Error: VM '${name}' not found`;
        if (vm.is_cvm) return `Error: Cannot delete Controller VM`;
        state.remove('vms', vm.uuid);
        return `VM '${name}' deleted.`;
    }

    #acliNetList() {
        const nets = state.networks;
        if (nets.length === 0) return 'No networks found.';
        const header = 'Name                     VLAN   Subnet              IPAM';
        const sep = '─'.repeat(65);
        const rows = nets.map(n => `${n.name.padEnd(25)}${String(n.vlan_id).padEnd(7)}${(n.subnet || 'N/A').padEnd(20)}${n.ipam ? 'Yes' : 'No'}`);
        return [header, sep, ...rows].join('\n');
    }

    #acliNetCreate(params) {
        if (!params.name) return 'Usage: acli net.create name=<name> vlan=<id>';
        state.create('networks', {
            name: params.name, vlan_id: parseInt(params.vlan || '0'), subnet: params.subnet || '',
            gateway: params.gateway || '', ipam: false, dns: [], pool_start: '', pool_end: '',
        });
        return `Network '${params.name}' created (VLAN ${params.vlan || 0}).`;
    }

    #acliImageList() {
        const imgs = state.images;
        if (imgs.length === 0) return 'No images found.';
        const header = 'Name                          Type          Size';
        const sep = '─'.repeat(55);
        const rows = imgs.map(i => `${i.name.padEnd(30)}${i.type.padEnd(14)}${i.size_gb} GB`);
        return [header, sep, ...rows].join('\n');
    }

    // ── NCLI ──
    #ncli(args) {
        if (args.length === 0) return 'Usage: ncli <entity> <action>\nEntities: cluster, container, protection-domain, security, host';
        const entity = args[0]?.toLowerCase();
        const action = args[1]?.toLowerCase();
        const params = this.#parseKV(args.slice(2));

        switch (entity) {
            case 'cluster':
                if (action === 'info' || action === 'get-params') return this.#ncliClusterInfo();
                return `ncli cluster: unknown action '${action}'. Try: info, get-params`;
            case 'container':
                if (action === 'list' || action === 'ls') return this.#ncliContainerList();
                if (action === 'create') return this.#ncliContainerCreate(params);
                if (action === 'stats') return this.#ncliContainerStats(params);
                return `ncli container: unknown action '${action}'. Try: list, create, stats`;
            case 'protection-domain':
            case 'pd':
                if (action === 'list' || action === 'ls') return this.#ncliPDList();
                return `ncli pd: unknown action '${action}'. Try: list`;
            case 'security':
                return this.#ncliSecurity(action);
            case 'host':
                if (action === 'add') return this.#ncliHostAdd(params);
                if (action === 'verify') return this.#ncliHostVerify(params);
                if (action === 'list' || action === 'ls') return this.#ncliHostList();
                return `ncli host: unknown action '${action}'. Try: add, verify, list`;
            default:
                return `ncli: unknown entity '${entity}'`;
        }
    }

    #ncliClusterInfo() {
        const c = state.cluster;
        return `    Cluster Name          : ${c.name}
    Cluster VIP           : ${c.clusterVIP}
    Data Services IP      : ${c.dataServicesIP}
    Number of Nodes       : ${c.numNodes}
    NOS Version           : ${c.version}
    Hypervisor            : ${c.hypervisor}
    Replication Factor    : ${c.rf}
    Domain                : ${c.domain}
    NTP Server            : ${c.ntp}
    DNS Servers           : ${(c.dns || []).join(', ')}
    Timezone              : ${c.timezone}`;
    }

    #ncliContainerList() {
        const ctrs = state.containers;
        const header = 'Name                     RF   Compression    Dedup         Used/Total';
        const sep = '─'.repeat(75);
        const rows = ctrs.map(c => `${c.name.padEnd(25)}${('RF' + c.rf).padEnd(5)}${c.compression.padEnd(15)}${c.dedup.padEnd(14)}${c.used_tb.toFixed(1)}/${c.capacity_tb} TB`);
        return [header, sep, ...rows].join('\n');
    }

    #ncliContainerCreate(params) {
        if (!params.name) return 'Usage: ncli container create name=<name> rf=<2|3>';
        state.create('containers', {
            name: params.name, rf: parseInt(params.rf || '2'), compression: params.compression || 'off',
            dedup: 'off', erasure_coding: false, capacity_tb: 12.0, used_tb: 0,
        });
        return `Container '${params.name}' created (RF${params.rf || 2}).`;
    }

    #ncliPDList() {
        const pds = state.protectionDomains;
        if (pds.length === 0) return 'No protection domains found.';
        const header = 'Name                     Type        VMs   Remote Site';
        const sep = '─'.repeat(65);
        const rows = pds.map(p => `${p.name.padEnd(25)}${p.type.padEnd(12)}${String((p.vms || []).length).padEnd(6)}${p.remote_site || 'N/A'}`);
        return [header, sep, ...rows].join('\n');
    }

    #ncliSecurity(action) {
        if (action === 'list' || action === 'ls')
            return `SSH Lockdown: Disabled\nDARE: Disabled\nCertificate: Self-signed (expires 2027-01-01)`;
        return `ncli security: try 'ncli security list'`;
    }

    #ncliHostAdd(params) {
        const ip = params.ip || params._positional?.[0];
        if (!ip) return 'Usage: ncli host add ip=<ip> hypervisor=<ahv|esx> username=<user>';
        const hv = params.hypervisor || 'ahv';
        return `Discovering host ${ip}...\n  Hypervisor: ${hv.toUpperCase()}\n  CPU: 32 cores\n  Memory: 256 GB\n  Pre-check: [PASS]\nHost ${ip} added to cluster successfully.\nRun 'ncli host verify ip=${ip}' to confirm.`;
    }

    #ncliHostVerify(params) {
        const ip = params.ip || params._positional?.[0];
        if (!ip) return 'Usage: ncli host verify ip=<ip>';
        return `Verifying host ${ip}...\n  CVM connectivity: [PASS]\n  Hypervisor version: [PASS]\n  Time sync (NTP): [PASS]\n  Storage controller: [PASS]\n  Network reachability: [PASS]\nHost ${ip} verification: ALL CHECKS PASSED`;
    }

    #ncliHostList() {
        const hosts = state.hosts;
        if (hosts.length === 0) return 'No hosts found.';
        const header = 'Name                     IP               CPU Cores  Memory     SSD      HDD';
        const sep = '─'.repeat(80);
        const rows = hosts.map(h => `${h.name.padEnd(25)}${h.ip.padEnd(17)}${String(h.cpu_cores || 16).padEnd(11)}${(h.memory_gb || 128) + ' GB'.padEnd(11)}${h.ssd_tb} TB   ${h.hdd_tb} TB`);
        return [header, sep, ...rows].join('\n');
    }

    #ncliContainerStats(params) {
        const name = params.name || params._positional?.[0];
        const ctrs = state.containers;
        const target = name ? ctrs.find(c => c.name === name) : ctrs[0];
        if (!target) return name ? `Container '${name}' not found.` : 'No containers found.';
        const pct = Math.round((target.used_tb / target.capacity_tb) * 100);
        return `Container: ${target.name}
  UUID: ${target.uuid}
  Replication Factor: RF${target.rf}
  Compression: ${target.compression}
  Dedup: ${target.dedup}
  Erasure Coding: ${target.erasure_coding ? 'Enabled' : 'Disabled'}
  Capacity: ${target.capacity_tb} TB
  Used: ${target.used_tb} TB (${pct}%)
  Free: ${(target.capacity_tb - target.used_tb).toFixed(1)} TB
  IOPS (avg): ${Math.floor(Math.random() * 5000 + 2000)}
  Latency (avg): ${(Math.random() * 2 + 0.5).toFixed(1)} ms`;
    }

    // ── NCC ──
    #ncc(args) {
        const sub = args[0]?.toLowerCase();
        if (sub === 'health_checks' && args[1]?.toLowerCase() === 'run_all') {
            const checks = ['CVM Health', 'Disk Health', 'Network Health', 'Storage Space', 'Data Resiliency', 'NTP Sync', 'Certificate Check'];
            return checks.map(c => `[PASS] ${c}`).join('\n') + `\n\n✓ All ${checks.length} checks passed.`;
        }
        if (sub === 'health_checks') return 'Usage: ncc health_checks run_all';
        if (sub === '--target') {
            const target = args[1] || '';
            if (!target) return 'Usage: ncc --target <component>\nTargets: cvm, host, cluster, network, storage, disk, vm';
            const checks = {
                cvm: ['CVM Memory', 'CVM Disk Space', 'CVM Services', 'CVM Connectivity'],
                host: ['Host BMC', 'Host Boot Drive', 'Host CPU', 'Host Memory'],
                cluster: ['Cluster Quorum', 'Metadata Ring', 'Cassandra Health', 'Zookeeper'],
                network: ['NIC Status', 'Bond Status', 'MTU Configuration', 'VLAN Config'],
                storage: ['Container Health', 'Replication Status', 'Disk Balance', 'Curator Status'],
                disk: ['SSD Health', 'HDD Health', 'Disk Firmware', 'SMART Data'],
                vm: ['VM Health', 'Guest Tools', 'VM NIC', 'VM Disk'],
            };
            const targetChecks = checks[target.toLowerCase()] || [`${target} General Check`];
            return `NCC Targeted Check: ${target}\n${'─'.repeat(40)}\n` + targetChecks.map(c => `[PASS] ${c}`).join('\n') + `\n\n✓ All ${targetChecks.length} ${target} checks passed.`;
        }
        return 'Usage: ncc health_checks run_all\n       ncc --target <component>';
    }

    // ── GENESIS ──
    #genesis(args) {
        const sub = args[0]?.toLowerCase();
        const svc = args.length > 1 ? args.slice(1).join(' ') : '';
        if (sub === 'start') return `Error: 'genesis start' is not a valid command.\nHint: genesis is always running. Use 'genesis restart' instead.`;
        if (sub === 'restart') return 'genesis restarting... done.\nAll services restarted successfully.';
        if (sub === 'status') return 'genesis is running (PID 12345)\nAll cluster services: UP';
        if (sub === 'service') {
            const action = args[1]?.toLowerCase();
            const svcName = args.slice(2).join(' ') || '';
            if (!svcName) return 'Usage: genesis service <start|stop|restart> <service_name>\nServices: prism, stargate, cassandra, zookeeper, curator, acropolis, uhura, ergon, lazan, cerebro';
            if (action === 'start') return `Starting service '${svcName}'...\n  PID: ${Math.floor(Math.random() * 90000 + 10000)}\n  Status: RUNNING\nService '${svcName}' started successfully.`;
            if (action === 'stop') return `Stopping service '${svcName}'...\n  Status: STOPPED\nService '${svcName}' stopped.`;
            if (action === 'restart') return `Restarting service '${svcName}'...\n  Stopping: OK\n  Starting: OK\n  PID: ${Math.floor(Math.random() * 90000 + 10000)}\nService '${svcName}' restarted successfully.`;
            return `genesis service: unknown action '${action}'. Try: start, stop, restart`;
        }
        return `Usage: genesis <restart|status>\n       genesis service <start|stop|restart> <service_name>\nNote: 'genesis start' does NOT exist (common exam trap!)`;
    }

    // ── CLUSTER ──
    #cluster(args) {
        const sub = args[0]?.toLowerCase();
        if (sub === 'status') return `Cluster: ${state.cluster.name}\nStatus: UP\nNodes: ${state.hosts.length} (all healthy)\nVersion: ${state.cluster.version}`;
        if (sub === 'start') return 'Starting cluster services...\nAll services started successfully.';
        if (sub === 'stop') return 'Warning: This will stop all cluster services.\nCluster services stopped. (Simulated)';
        if (sub === 'version') return state.cluster.version;
        return 'Usage: cluster <status|start|stop|version>';
    }

    // ── LOGBAY ──
    #logbay(args) {
        if (args[0] === 'collect') return 'Collecting logs...\nLog bundle saved to /home/nutanix/data/logbay/NX-logbay-2026-04-01.tar.gz (42 MB)';
        return 'Usage: logbay collect';
    }

    // ── CURATOR CLI ──
    #curatorCli(args) {
        return `Curator Status:
  Last Full Scan:  2026-04-01 18:00 (completed in 45 min)
  Last Partial:    2026-04-01 19:30 (completed in 8 min)
  MapReduce Jobs:  12 completed, 0 running
  Dedup Savings:   2.1 TB
  Compression:     3.4 TB saved (2.1:1 ratio)
  Garbage:         0.3 TB (pending cleanup)`;
    }

    // ── ZEUS CONFIG PRINTER ──
    #zeus(args) {
        const c = state.cluster;
        return `Zeus Configuration:
  cluster_name: "${c.name}"
  cluster_uuid: "00061a72-4d3c-0ea7-0000-000000028f11"
  cluster_version: "${c.version}"
  num_nodes: ${c.numNodes}
  replication_factor: ${c.rf}
  external_ip: "${c.clusterVIP}"
  ntp_server: "${c.ntp}"
  dns_server: "${(c.dns || []).join('", "')}"`;
    }

    // ── OVS ──
    #manageOvs(args) {
        if (args[0] === '--status') return 'Open vSwitch: Running\nBridge br0: UP (4 ports)\nBondMode: active-backup\nLACP: disabled';
        return 'Usage: manage_ovs --status';
    }

    #ovsVsctl(args) {
        if (args[0] === 'show') return `Bridge "br0"\n    Port "br0"\n        Interface "br0" type: internal\n    Port "eth0"\n        Interface "eth0"\n    Port "eth1"\n        Interface "eth1"`;
        if (args[0] === 'list-br') return 'br0';
        return 'Usage: ovs-vsctl <show|list-br>';
    }

    #ovsOfctl(args) {
        if (args[0] === 'dump-flows' || (args[0] === 'dump-flows' && args[1])) {
            return `NXST_FLOW reply:\n  cookie=0x0, table=0, priority=100, in_port=1, actions=output:2\n  cookie=0x0, table=0, priority=0, actions=NORMAL`;
        }
        return 'Usage: ovs-ofctl dump-flows <bridge>';
    }

    // ── ALLSSH ──
    #allssh(args) {
        if (args.length === 0) return 'Usage: allssh "<command>"';
        const cmd = args.join(' ');
        return state.hosts.map(h => `===== ${h.name} (${h.ip}) =====\n  (executed: ${cmd})`).join('\n');
    }

    // ── CURL (API simulator) ──
    #curl(args) {
        const url = args.find(a => a.startsWith('http'));
        if (!url) return 'Usage: curl -k https://<cluster-vip>:9440/api/nutanix/v3/<resource>/list -X POST -d \'{}\'';
        if (url.includes('/v3/vms/list')) {
            return JSON.stringify({ entities: state.vms.map(v => ({ metadata: { uuid: v.uuid }, spec: { name: v.name }, status: { state: v.power_state } })), metadata: { total_matches: state.vms.length } }, null, 2);
        }
        if (url.includes('/v3/subnets/list')) {
            return JSON.stringify({ entities: state.networks.map(n => ({ metadata: { uuid: n.uuid }, spec: { name: n.name, resources: { vlan_id: n.vlan_id } } })), metadata: { total_matches: state.networks.length } }, null, 2);
        }
        return `{"error": "Unsupported API endpoint. Try /api/nutanix/v3/vms/list or /v3/subnets/list with POST"}`;
    }

    // ── NUCLEI (LCM / Foundation) ──
    #nuclei(args) {
        const sub = args[0]?.toLowerCase();
        if (sub === 'inventory') {
            const c = state.cluster;
            return `LCM Inventory:
  AOS:               ${c.version} (latest: 6.11.0)
  AHV:               ${c.hypervisor} (latest: 20230302.20001)
  NCC:               4.7.0 (latest: 4.7.1)
  Foundation:        5.7.1 (latest: 5.8.0)
  Firmware Pack:     2.7 (latest: 2.8)
  Prism Central:     pc.2024.3 (latest: pc.2024.4)

  Upgrades available: 4`;
        }
        if (sub === 'update' || sub === 'upgrade') {
            return 'Performing pre-check...\n[PASS] Cluster health OK\n[PASS] Space check OK\n[PASS] Compatibility check OK\nUpdate plan ready. Use LCM in Prism to apply. (Simulated)';
        }
        if (sub === 'ai.status' || (sub === 'ai' && args[1]?.toLowerCase() === 'status')) {
            const models = state.getAll('ai_models');
            const endpoints = state.getAll('ai_endpoint_metrics');
            let output = 'NAI (Nutanix AI) Status\n' + '═'.repeat(50) + '\n';
            output += `Models registered: ${models.length}\n`;
            output += `Endpoints active:  ${endpoints.length}\n\n`;
            output += 'Model'.padEnd(25) + 'Framework'.padEnd(10) + 'Status\n' + '─'.repeat(50) + '\n';
            models.forEach(m => { output += `${m.name.padEnd(25)}${m.framework.padEnd(10)}${m.status}\n`; });
            if (endpoints.length) {
                output += '\nEndpoint'.padEnd(20) + 'Req/min'.padEnd(10) + 'Latency'.padEnd(10) + 'GPU%'.padEnd(8) + 'Status\n' + '─'.repeat(55) + '\n';
                endpoints.forEach(e => { output += `${e.endpoint.padEnd(20)}${String(e.requests_min).padEnd(10)}${e.avg_latency_ms + 'ms'.padEnd(10)}${e.gpu_util_pct + '%'.padEnd(8)}${e.status}\n`; });
            }
            return output;
        }
        return 'Usage: nuclei <inventory|update|ai.status>';
    }

    // ── CALM CLI ──
    #calm(args) {
        const entity = args[0]?.toLowerCase();
        const action = args[1]?.toLowerCase();

        if (entity === 'blueprint' || entity === 'bp') {
            if (action === 'list' || action === 'ls') {
                const bps = state.getAll('blueprints');
                if (bps.length === 0) return 'No blueprints found.';
                const header = 'Name                          Type          Status     Services';
                const sep = '─'.repeat(70);
                const rows = bps.map(b => `${(b.name || '').padEnd(30)}${(b.type || '').padEnd(14)}${(b.status || '').padEnd(11)}${b.services?.length || 0}`);
                return [header, sep, ...rows].join('\n');
            }
            if (action === 'create') {
                const params = this.#parseKV(args.slice(2));
                if (!params.name) return 'Usage: calm blueprint create name=<name>';
                state.create('blueprints', { name: params.name, type: params.type || 'Single-VM', status: 'draft', services: [], project: params.project || '' });
                return `Blueprint '${params.name}' created (draft).`;
            }
            return 'Usage: calm blueprint <list|create>';
        }

        if (entity === 'app' || entity === 'application') {
            if (action === 'list' || action === 'ls') {
                const apps = state.getAll('applications');
                if (apps.length === 0) return 'No applications found.';
                const header = 'Name                          Blueprint               Status';
                const sep = '─'.repeat(70);
                const rows = apps.map(a => `${(a.name || '').padEnd(30)}${(a.blueprint || '').padEnd(24)}${a.status || ''}`);
                return [header, sep, ...rows].join('\n');
            }
            return 'Usage: calm app <list>';
        }

        if (entity === 'runbook' || entity === 'rb') {
            if (action === 'list' || action === 'ls') {
                const rbs = state.getAll('runbooks');
                if (rbs.length === 0) return 'No runbooks found.';
                const header = 'Name                          Type            Status    Runs';
                const sep = '─'.repeat(65);
                const rows = rbs.map(r => `${(r.name || '').padEnd(30)}${(r.type || '').padEnd(16)}${(r.status || '').padEnd(10)}${r.run_count || 0}`);
                return [header, sep, ...rows].join('\n');
            }
            return 'Usage: calm runbook <list>';
        }

        return 'Usage: calm <blueprint|app|runbook> <list|create>';
    }

    // ── UPGRADE CHECK ──
    #upgradeCheck(args) {
        const c = state.cluster;
        return `AOS Upgrade Compatibility Check
─────────────────────────────
Current Version:  ${c.version}
Target Version:   AOS 6.11.0
Hypervisor:       ${c.hypervisor}
Node Count:       ${c.numNodes}

Pre-Checks:
  [PASS] Minimum NCC version (4.6.0+)
  [PASS] Cluster health (all nodes healthy)
  [PASS] Metadata ring healthy
  [PASS] No running LCM operations
  [PASS] Sufficient free space (>10% required)
  [PASS] Compatible hypervisor version
  [WARN] Non-AHV hosts cannot do 1-click AHV upgrade

Result: COMPATIBLE — upgrade may proceed via LCM
Note: Always run NCC before upgrading (exam tip!)`;
    }

    // ── HOST DISKS CHECK ──
    #hostDisksCheck(args) {
        const hosts = state.hosts;
        let output = 'Physical Disk Inventory\n' + '─'.repeat(70) + '\n';
        hosts.forEach(h => {
            output += `\n  Host: ${h.name} (${h.ip})\n`;
            output += `    SSD Tier:  ${h.ssd_tb} TB (${Math.round(h.ssd_tb * 1024)} GB) — Healthy\n`;
            output += `    HDD Tier:  ${h.hdd_tb} TB — Healthy\n`;
            output += `    Total Raw: ${(h.ssd_tb + h.hdd_tb).toFixed(1)} TB\n`;
        });
        const totalRaw = hosts.reduce((s, h) => s + h.ssd_tb + h.hdd_tb, 0);
        output += `\n  Cluster Total Raw: ${totalRaw.toFixed(1)} TB`;
        output += `\n  Usable (RF${state.cluster.rf}):   ${(totalRaw / state.cluster.rf).toFixed(1)} TB`;
        return output;
    }

    // ── LINKS (network interfaces) ──
    #links() {
        return `eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP
    link/ether 50:6b:4b:xx:xx:xx
    inet 10.42.100.29/24 brd 10.42.100.255 scope global eth0
eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP
    link/ether 50:6b:4b:xx:xx:yy
    inet 10.42.100.129/24 brd 10.42.100.255 scope global eth1
eth2: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 9000 state DOWN
    link/ether 50:6b:4b:xx:xx:zz
vnet0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP
    link/ether fe:xx:xx:xx:xx:01`;
    }

    // ── DF (disk usage) ──
    #df() {
        const ctrs = state.getAll('containers');
        let output = 'Filesystem             Size    Used    Avail   Use%  Mounted on\n' + '─'.repeat(70) + '\n';
        ctrs.forEach(c => {
            const avail = (c.capacity_tb - c.used_tb).toFixed(1);
            const pct = Math.round((c.used_tb / c.capacity_tb) * 100);
            output += `/dev/ntnx/${c.name.padEnd(20)} ${c.capacity_tb.toFixed(0).padStart(4)}T   ${c.used_tb.toFixed(1).padStart(5)}T   ${avail.padStart(5)}T   ${String(pct).padStart(3)}%  /mnt/${c.name}\n`;
        });
        return output.trimEnd();
    }

    // ── UPTIME ──
    #uptime() {
        const days = Math.floor(Math.random() * 30) + 15;
        return ` ${new Date().toLocaleTimeString()} up ${days} days, 14:23, 1 user, load average: 0.42, 0.38, 0.31`;
    }

    // ── LCM INVENTORY ──
    #lcmInventory(args) {
        const sub = args[0]?.toLowerCase();
        if (!sub || sub === 'list') {
            const items = state.getAll('lcm_inventory');
            if (items.length === 0) return 'No LCM inventory data. Run LCM scan first.';
            let output = 'LCM Software/Firmware Inventory\n' + '═'.repeat(80) + '\n';
            output += 'Component'.padEnd(20) + 'Category'.padEnd(12) + 'Entity'.padEnd(22) + 'Current'.padEnd(18) + 'Available'.padEnd(18) + 'Status\n';
            output += '─'.repeat(80) + '\n';
            items.forEach(i => {
                output += `${i.name.padEnd(20)}${i.category.padEnd(12)}${i.entity.padEnd(22)}${i.current_version.padEnd(18)}${(i.available_version || '—').padEnd(18)}${i.status}\n`;
            });
            const updates = items.filter(i => i.update_available).length;
            output += `\n${items.length} components, ${updates} update(s) available.`;
            return output;
        }
        return 'Usage: lcm_inventory [list]';
    }

    // ── ALERT ──
    async #alertCmd(args) {
        const sub = args[0]?.toLowerCase();
        if (!sub || sub === 'list') {
            const alerts = state.getAll('alerts');
            if (alerts.length === 0) return 'No alerts.';
            let output = 'Alert List\n' + '═'.repeat(70) + '\n';
            output += 'Severity'.padEnd(12) + 'Entity'.padEnd(20) + 'Title'.padEnd(30) + 'Status\n';
            output += '─'.repeat(70) + '\n';
            alerts.forEach(a => {
                output += `${a.severity.padEnd(12)}${(a.entity || '').padEnd(20)}${a.title.substring(0, 28).padEnd(30)}${a.resolved ? 'Resolved' : 'Active'}\n`;
            });
            return output;
        }
        if (sub === 'resolve') {
            const id = args[1];
            if (!id) return 'Usage: alert resolve <uuid>';
            const alert = state.getById('alerts', id);
            if (!alert) return `Alert ${id} not found.`;
            await state.update('alerts', id, { resolved: true, resolved_at: new Date().toISOString() });
            return `Alert ${id} resolved.`;
        }
        return 'Usage: alert [list|resolve <uuid>]';
    }

    // ── PROJECT ──
    #projectCmd(args) {
        const sub = args[0]?.toLowerCase();
        if (!sub || sub === 'list') {
            const projects = state.getAll('projects');
            if (projects.length === 0) return 'No projects configured.';
            let output = 'Projects\n' + '═'.repeat(70) + '\n';
            output += 'Name'.padEnd(20) + 'VMs'.padEnd(6) + 'vCPU Used/Quota'.padEnd(18) + 'Mem Used/Quota'.padEnd(18) + 'Users\n';
            output += '─'.repeat(70) + '\n';
            projects.forEach(p => {
                output += `${p.name.padEnd(20)}${String(p.vm_count || 0).padEnd(6)}${`${p.vcpu_used || 0}/${p.vcpu_quota || '∞'}`.padEnd(18)}${`${p.memory_used_gb || 0}/${p.memory_quota_gb || '∞'} GB`.padEnd(18)}${(p.users || []).length}\n`;
            });
            return output;
        }
        return 'Usage: project [list]';
    }

    #parseKV(args) {
        const result = { _positional: [] };
        for (const arg of args) {
            const eq = arg.indexOf('=');
            if (eq > 0) {
                result[arg.slice(0, eq).toLowerCase()] = arg.slice(eq + 1);
            } else {
                result._positional.push(arg);
            }
        }
        return result;
    }
}
