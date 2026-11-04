import { state } from '../core/StateEngine.js';
import { CLINutanixCommands } from './CLINutanixCommands.js';
import { CLIPlatformCommands } from './CLIPlatformCommands.js';

/**
 * CLIService — Command parser and executor for Nutanix CLI tools.
 * Supports: acli, ncli, ncc, genesis, cluster, logbay, curator_cli,
 * zeus_config_printer, manage_ovs, ovs-vsctl, ovs-ofctl, allssh, curl
 *
 * Command implementations live in CLINutanixCommands.js (the product CLIs) and
 * CLIPlatformCommands.js (status, inventory and reporting); this file keeps the
 * dispatch table, the SPEC-07 action trace and the tokenizer. The public
 * surface — `execute(input)` — is unchanged.
 */
export class CLIService {
    #nutanix = new CLINutanixCommands();
    #platform = new CLIPlatformCommands();

    async execute(input) {
        const trimmed = input.trim();
        if (!trimmed) return '';

        // SPEC-07 action trace: CLI work must be observable by scenario
        // validators across view navigation. Fire-and-forget — a trace write
        // failure must never block the command itself.
        state.create('action_trace', { action: 'cli-command', command: trimmed }).catch(() => {});

        const parts = this.#tokenize(trimmed);
        const cmd = parts[0]?.toLowerCase();
        const args = parts.slice(1);

        const nutanix = this.#nutanix;
        const platform = this.#platform;

        const handlers = {
            'acli': () => nutanix.acli(args),
            'ncli': () => nutanix.ncli(args),
            'ncc': () => nutanix.ncc(args),
            'genesis': () => nutanix.genesis(args),
            'cluster': () => nutanix.cluster(args),
            'logbay': () => nutanix.logbay(args),
            'curator_cli': () => nutanix.curatorCli(args),
            'zeus_config_printer': () => nutanix.zeus(args),
            'manage_ovs': () => nutanix.manageOvs(args),
            'ovs-vsctl': () => nutanix.ovsVsctl(args),
            'ovs-ofctl': () => nutanix.ovsOfctl(args),
            'allssh': () => nutanix.allssh(args),
            'curl': () => nutanix.curl(args),
            'nuclei': () => platform.nuclei(args),
            'calm': () => nutanix.calm(args),
            'upgrade_check': () => platform.upgradeCheck(args),
            'host_disks_check': () => platform.hostDisksCheck(args),
            'links': () => platform.links(),
            'df': () => platform.df(),
            'uptime': () => platform.uptime(),
            'whoami': () => 'nutanix',
            'hostname': () => state.hosts[0]?.name || 'NTNX-CVM',
            'date': () => new Date().toString(),
            'lcm_inventory': () => platform.lcmInventory(args),
            'alert': () => platform.alertCmd(args),
            'project': () => platform.projectCmd(args),
            'help': () => this.#help(),
            'clear': () => '__CLEAR__',
        };

        const handler = handlers[cmd];
        if (!handler) return `bash: ${cmd}: command not found\nType 'help' for available commands.`;
        return await handler();
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
}
