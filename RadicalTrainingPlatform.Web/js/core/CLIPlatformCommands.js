import { state } from './StateEngine.js';

/**
 * CLIPlatformCommands — status, inventory and reporting commands: nuclei,
 * upgrade_check, host_disks_check, links, df, uptime, lcm_inventory, alert
 * and project.
 *
 * Split out of CLIService.js so each file stays reviewable. CLIService owns the
 * dispatch table, the action trace and the tokenizer; these are the command
 * implementations it dispatches to. Method bodies are unchanged from the
 * original single-file service.
 */
export class CLIPlatformCommands {
    // ── NUCLEI (LCM / Foundation) ──
    nuclei(args) {
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

    // ── UPGRADE CHECK ──
    upgradeCheck(args) {
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
    hostDisksCheck(args) {
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
    links() {
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
    df() {
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
    uptime() {
        const days = Math.floor(Math.random() * 30) + 15;
        return ` ${new Date().toLocaleTimeString()} up ${days} days, 14:23, 1 user, load average: 0.42, 0.38, 0.31`;
    }

    // ── LCM INVENTORY ──
    lcmInventory(args) {
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
    async alertCmd(args) {
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
    projectCmd(args) {
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
}
