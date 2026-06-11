import { bus } from './EventBus.js';
import { store } from './StateStore.js';

/**
 * StateEngine — Central state management for the simulated Nutanix cluster.
 * All entity CRUD goes through here; views subscribe to change events.
 */
class StateEngine {
    #state = {};
    #initialized = false;

    async init() {
        await store.init();
        const saved = await store.get('clusterState');
        if (saved) {
            this.#state = saved;
        } else {
            this.#state = this.#createSeedState();
            await this.#persist();
        }
        this.#initialized = true;
        bus.emit('state:ready', this.#state);
    }

    get isReady() { return this.#initialized; }

    // ── Generic accessors ──

    getAll(collection) {
        return [...(this.#state[collection] || [])];
    }

    getById(collection, id) {
        return (this.#state[collection] || []).find(e => e.uuid === id) || null;
    }

    async create(collection, entity) {
        if (!entity.uuid) entity.uuid = crypto.randomUUID();
        if (!entity.created_at) entity.created_at = new Date().toISOString();
        entity.updated_at = entity.created_at;

        if (!this.#state[collection]) this.#state[collection] = [];
        this.#state[collection].push(entity);
        await this.#persist();
        this.#logAudit(collection, 'create', entity);
        bus.emit(`${collection}:created`, entity);
        bus.emit('state:changed', { collection, action: 'create', entity });
        return entity;
    }

    async update(collection, id, changes) {
        const list = this.#state[collection] || [];
        const idx = list.findIndex(e => e.uuid === id);
        if (idx === -1) throw new Error(`${collection}/${id} not found`);

        Object.assign(list[idx], changes, { updated_at: new Date().toISOString() });
        await this.#persist();
        this.#logAudit(collection, 'update', list[idx]);
        bus.emit(`${collection}:updated`, list[idx]);
        bus.emit('state:changed', { collection, action: 'update', entity: list[idx] });
        return list[idx];
    }

    async remove(collection, id) {
        const list = this.#state[collection] || [];
        const idx = list.findIndex(e => e.uuid === id);
        if (idx === -1) return;

        const removed = list.splice(idx, 1)[0];
        await this.#persist();
        this.#logAudit(collection, 'delete', removed);
        bus.emit(`${collection}:deleted`, removed);
        bus.emit('state:changed', { collection, action: 'delete', entity: removed });
        return removed;
    }

    // ── Cluster info ──

    get cluster() { return this.#state.cluster || {}; }

    get hosts() { return this.getAll('hosts'); }

    // ── Convenience accessors ──

    get vms() { return this.getAll('vms'); }
    get containers() { return this.getAll('containers'); }
    get networks() { return this.getAll('networks'); }
    get images() { return this.getAll('images'); }
    get protectionDomains() { return this.getAll('protection_domains'); }

    // ── Audit logging ──

    #logAudit(collection, action, entity) {
        if (collection === 'audit_log') return; // no recursion
        const name = entity?.name || entity?.title || entity?.username || entity?.uuid || '';
        const detail = action === 'delete' ? `Removed ${collection} item` : action === 'update' ? `Modified ${collection} item` : `Created ${collection} item`;
        if (!this.#state.audit_log) this.#state.audit_log = [];
        this.#state.audit_log.push({
            uuid: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            action, collection,
            entity_name: name,
            details: detail,
        });
        bus.emit('audit_log:created', { collection, action, entity_name: name });
    }

    // ── Reset ──

    async reset() {
        this.#state = this.#createSeedState();
        await this.#persist();
        bus.emit('state:reset');
        bus.emit('state:ready', this.#state);
    }

    // ── State Export / Import ──

    exportState() {
        return JSON.stringify(this.#state, null, 2);
    }

    async importState(json) {
        const data = JSON.parse(json);
        if (!data.cluster) throw new Error('Invalid state: missing cluster');
        this.#state = data;
        await this.#persist();
        bus.emit('state:reset');
        bus.emit('state:ready', this.#state);
    }

    // ── Persistence ──

    async #persist() {
        await store.set('clusterState', this.#state);
    }

    // ── Seed Data ──

    #createSeedState() {
        return {
            cluster: {
                name: 'NTNX-POC-Cluster-01',
                version: 'AOS 6.10.1.2',
                hypervisor: 'AHV 20230302.10015',
                numNodes: 4,
                clusterVIP: '10.42.100.37',
                dataServicesIP: '10.42.100.38',
                ntp: 'pool.ntp.org',
                dns: ['10.42.100.10'],
                timezone: 'America/Los_Angeles',
                rf: 2,
                domain: 'ntnxlab.local',
            },
            hosts: [
                { uuid: 'host-001', name: 'NTNX-A-CVM', ip: '10.42.100.29', ipmi: '10.42.100.33', cpu_cores: 16, memory_gb: 64, ssd_tb: 1.92, hdd_tb: 4.0, status: 'normal' },
                { uuid: 'host-002', name: 'NTNX-B-CVM', ip: '10.42.100.30', ipmi: '10.42.100.34', cpu_cores: 16, memory_gb: 64, ssd_tb: 1.92, hdd_tb: 4.0, status: 'normal' },
                { uuid: 'host-003', name: 'NTNX-C-CVM', ip: '10.42.100.31', ipmi: '10.42.100.35', cpu_cores: 16, memory_gb: 64, ssd_tb: 1.92, hdd_tb: 4.0, status: 'normal' },
                { uuid: 'host-004', name: 'NTNX-D-CVM', ip: '10.42.100.32', ipmi: '10.42.100.36', cpu_cores: 16, memory_gb: 64, ssd_tb: 1.92, hdd_tb: 4.0, status: 'normal' },
            ],
            containers: [
                { uuid: 'ctr-001', name: 'default-container', rf: 2, compression: 'inline', dedup: 'off', erasure_coding: false, capacity_tb: 12.0, used_tb: 3.2 },
                { uuid: 'ctr-002', name: 'SelfServiceContainer', rf: 2, compression: 'inline', dedup: 'off', erasure_coding: false, capacity_tb: 12.0, used_tb: 1.8 },
                { uuid: 'ctr-003', name: 'Gold-Container', rf: 2, compression: 'post_process', dedup: 'post_process', erasure_coding: true, capacity_tb: 12.0, used_tb: 5.1 },
                { uuid: 'ctr-004', name: 'VDI-Container', rf: 2, compression: 'inline', dedup: 'inline', erasure_coding: false, capacity_tb: 12.0, used_tb: 2.4 },
                { uuid: 'ctr-005', name: 'NutanixManagementShare', rf: 2, compression: 'off', dedup: 'off', erasure_coding: false, capacity_tb: 12.0, used_tb: 0.3 },
                { uuid: 'ctr-006', name: 'ISO-Library', rf: 2, compression: 'off', dedup: 'off', erasure_coding: false, capacity_tb: 12.0, used_tb: 0.9 },
            ],
            networks: [
                { uuid: 'net-001', name: 'VM-Network-100', vlan_id: 100, subnet: '10.42.100.0/24', gateway: '10.42.100.1', ipam: true, dns: ['10.42.100.10'], pool_start: '10.42.100.50', pool_end: '10.42.100.200' },
                { uuid: 'net-002', name: 'Production-200', vlan_id: 200, subnet: '10.42.200.0/24', gateway: '10.42.200.1', ipam: true, dns: ['10.42.100.10'], pool_start: '10.42.200.10', pool_end: '10.42.200.250' },
                { uuid: 'net-003', name: 'DMZ-300', vlan_id: 300, subnet: '10.42.300.0/24', gateway: '10.42.300.1', ipam: false, dns: [], pool_start: '', pool_end: '' },
                { uuid: 'net-004', name: 'Backup-400', vlan_id: 400, subnet: '10.42.400.0/24', gateway: '10.42.400.1', ipam: false, dns: [], pool_start: '', pool_end: '' },
            ],
            images: [
                { uuid: 'img-001', name: 'CentOS-8-GenericCloud', type: 'DISK_IMAGE', size_gb: 8, source: 'https://cloud.centos.org/centos/8/x86_64/images/CentOS-8-GenericCloud-8.4.qcow2' },
                { uuid: 'img-002', name: 'Ubuntu-22.04-Server', type: 'DISK_IMAGE', size_gb: 4, source: 'https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img' },
                { uuid: 'img-003', name: 'Windows-Server-2022', type: 'ISO_IMAGE', size_gb: 5.2, source: 'local://iso-library/win2022.iso' },
            ],
            vms: [
                { uuid: 'vm-001', name: 'NTNX-A-CVM', vcpus: 8, memory_gb: 32, power_state: 'on', host_uuid: 'host-001', is_cvm: true, disks: [{ size_gb: 40, container: 'default-container' }], nics: [{ network_uuid: 'net-001', ip: '10.42.100.29' }] },
                { uuid: 'vm-002', name: 'NTNX-B-CVM', vcpus: 8, memory_gb: 32, power_state: 'on', host_uuid: 'host-002', is_cvm: true, disks: [{ size_gb: 40, container: 'default-container' }], nics: [{ network_uuid: 'net-001', ip: '10.42.100.30' }] },
                { uuid: 'vm-003', name: 'NTNX-C-CVM', vcpus: 8, memory_gb: 32, power_state: 'on', host_uuid: 'host-003', is_cvm: true, disks: [{ size_gb: 40, container: 'default-container' }], nics: [{ network_uuid: 'net-001', ip: '10.42.100.31' }] },
                { uuid: 'vm-004', name: 'NTNX-D-CVM', vcpus: 8, memory_gb: 32, power_state: 'on', host_uuid: 'host-004', is_cvm: true, disks: [{ size_gb: 40, container: 'default-container' }], nics: [{ network_uuid: 'net-001', ip: '10.42.100.32' }] },
                { uuid: 'vm-005', name: 'Prism-Central', vcpus: 6, memory_gb: 26, power_state: 'on', host_uuid: 'host-001', is_cvm: false, disks: [{ size_gb: 500, container: 'default-container' }], nics: [{ network_uuid: 'net-001', ip: '10.42.100.39' }] },
                { uuid: 'vm-006', name: 'Web-Server-01', vcpus: 2, memory_gb: 4, power_state: 'on', host_uuid: 'host-002', is_cvm: false, disks: [{ size_gb: 50, container: 'Gold-Container', image: 'CentOS-8-GenericCloud' }], nics: [{ network_uuid: 'net-002', ip: '10.42.200.11' }] },
                { uuid: 'vm-007', name: 'Web-Server-02', vcpus: 2, memory_gb: 4, power_state: 'on', host_uuid: 'host-003', is_cvm: false, disks: [{ size_gb: 50, container: 'Gold-Container', image: 'CentOS-8-GenericCloud' }], nics: [{ network_uuid: 'net-002', ip: '10.42.200.12' }] },
                { uuid: 'vm-008', name: 'App-Server-01', vcpus: 4, memory_gb: 8, power_state: 'on', host_uuid: 'host-004', is_cvm: false, disks: [{ size_gb: 80, container: 'Gold-Container', image: 'Ubuntu-22.04-Server' }], nics: [{ network_uuid: 'net-002', ip: '10.42.200.20' }] },
                { uuid: 'vm-009', name: 'DB-Server-01', vcpus: 4, memory_gb: 16, power_state: 'on', host_uuid: 'host-001', is_cvm: false, disks: [{ size_gb: 200, container: 'Gold-Container', image: 'CentOS-8-GenericCloud' }], nics: [{ network_uuid: 'net-002', ip: '10.42.200.30' }] },
                { uuid: 'vm-010', name: 'AD-Server', vcpus: 2, memory_gb: 4, power_state: 'on', host_uuid: 'host-002', is_cvm: false, disks: [{ size_gb: 60, container: 'default-container', image: 'Windows-Server-2022' }], nics: [{ network_uuid: 'net-001', ip: '10.42.100.10' }] },
                { uuid: 'vm-011', name: 'Test-VM', vcpus: 1, memory_gb: 2, power_state: 'off', host_uuid: 'host-003', is_cvm: false, disks: [{ size_gb: 20, container: 'SelfServiceContainer' }], nics: [{ network_uuid: 'net-001' }] },
            ],
            protection_domains: [
                { uuid: 'pd-001', name: 'DR-WebTier', type: 'async', vms: ['vm-006', 'vm-007'], schedule: { interval: 'hourly', retention_local: 3, retention_remote: 2 }, remote_site: 'DR-Site-01' },
                { uuid: 'pd-002', name: 'DR-Database', type: 'async', vms: ['vm-009'], schedule: { interval: 'every_15_min', retention_local: 4, retention_remote: 3 }, remote_site: 'DR-Site-01' },
                { uuid: 'pd-003', name: 'Metro-Critical', type: 'metro', vms: ['vm-008'], schedule: { interval: 'synchronous' }, remote_site: 'Metro-Site-01' },
            ],
            alerts: [
                { uuid: 'alert-001', severity: 'warning', title: 'Disk usage above 70%', entity: 'Gold-Container', created_at: '2026-04-01T18:30:00Z', resolved: false },
                { uuid: 'alert-002', severity: 'info', title: 'NCC check completed', entity: 'Cluster', created_at: '2026-04-01T20:00:00Z', resolved: true },
            ],
            categories: [
                { uuid: 'cat-001', key: 'AppType', values: ['Web', 'Database', 'App', 'Infrastructure'] },
                { uuid: 'cat-002', key: 'Environment', values: ['Production', 'Development', 'Testing', 'Staging'] },
                { uuid: 'cat-003', key: 'AppTier', values: ['Web', 'App', 'DB'] },
            ],
            flow_policies: [
                { uuid: 'flow-001', name: 'Quarantine-Default', type: 'quarantine', mode: 'applied', target_categories: [], source_categories: [], rules: [{ direction: 'inbound', action: 'deny', ports: [] }, { direction: 'outbound', action: 'deny', ports: [] }] },
                { uuid: 'flow-002', name: 'Isolation-DMZ', type: 'isolation', mode: 'applied', target_categories: [{ key: 'Environment', value: 'Production' }], source_categories: [], rules: [{ direction: 'inbound', action: 'whitelist', ports: ['80', '443'] }] },
                { uuid: 'flow-003', name: 'WebApp-Security', type: 'application', mode: 'monitor', target_categories: [{ key: 'AppType', value: 'Web' }], source_categories: [{ key: 'AppTier', value: 'Web' }], rules: [{ direction: 'inbound', action: 'whitelist', ports: ['80', '443', '22'] }] },
            ],
            protection_policies: [
                { uuid: 'pp-001', name: 'Gold-RPO-1hr', rpo: '1_hour', remote_site: 'DR-Site-01', snapshot_type: 'crash_consistent', categories: [{ key: 'Environment', value: 'Production' }] },
                { uuid: 'pp-002', name: 'Silver-RPO-24hr', rpo: '24_hours', remote_site: 'DR-Site-01', snapshot_type: 'crash_consistent', categories: [{ key: 'Environment', value: 'Development' }] },
            ],
            recovery_plans: [
                { uuid: 'rp-001', name: 'WebTier-Recovery', boot_groups: [{ order: 1, vms: ['vm-010'], delay_seconds: 0 }, { order: 2, vms: ['vm-009'], delay_seconds: 60 }, { order: 3, vms: ['vm-006', 'vm-007'], delay_seconds: 120 }], network_mapping: { source: 'Production-200', target: 'DR-Prod-200' }, pre_script: null, post_script: '/scripts/validate-dns.sh', status: 'ready', last_test: '2026-03-15' },
            ],
            users: [
                { uuid: 'user-001', username: 'admin', email: 'admin@ntnxlab.local', role: 'Cluster Admin', source: 'local', last_login: '2026-04-01' },
                { uuid: 'user-002', username: 'operator', email: 'ops@ntnxlab.local', role: 'Cluster Admin', source: 'local', last_login: '2026-03-28' },
                { uuid: 'user-003', username: 'viewer', email: 'viewer@ntnxlab.local', role: 'Viewer', source: 'local', last_login: null },
                { uuid: 'user-004', username: 'ad-jdoe', email: 'jdoe@ntnxlab.local', role: 'User Admin', source: 'ad', last_login: '2026-03-30' },
            ],
            roles: [
                { uuid: 'role-001', name: 'Cluster Admin', type: 'built_in', permissions: ['VM.Create', 'VM.Delete', 'VM.PowerOps', 'VM.Update', 'Storage.Create', 'Storage.Delete', 'Network.Create', 'Network.Delete', 'Cluster.View', 'Cluster.Update', 'User.Manage', 'Alert.View', 'Alert.Resolve'] },
                { uuid: 'role-002', name: 'User Admin', type: 'built_in', permissions: ['VM.Create', 'VM.Delete', 'VM.PowerOps', 'VM.Update', 'Cluster.View', 'Alert.View', 'Alert.Resolve'] },
                { uuid: 'role-003', name: 'Viewer', type: 'built_in', permissions: ['Cluster.View', 'Alert.View'] },
            ],
            ad_config: [],
            playbooks: [
                { uuid: 'pb-001', name: 'Alert-Notify-Admins', trigger: { type: 'alert', severity: 'critical' }, actions: [{ type: 'email', target: 'admin@ntnxlab.local' }], enabled: true, execution_count: 12, last_run: '2026-03-29' },
                { uuid: 'pb-002', name: 'Auto-Snapshot-Daily', trigger: { type: 'schedule', schedule: 'daily' }, actions: [{ type: 'snapshot', target: 'All Production VMs' }], enabled: true, execution_count: 30, last_run: '2026-04-01' },
            ],
            reports: [],
            fsvms: [
                { uuid: 'fsvm-001', name: 'FSVM-01', ip: '10.42.100.51', vcpus: 4, memory_gb: 12, host_uuid: 'host-001', status: 'healthy' },
                { uuid: 'fsvm-002', name: 'FSVM-02', ip: '10.42.100.52', vcpus: 4, memory_gb: 12, host_uuid: 'host-002', status: 'healthy' },
                { uuid: 'fsvm-003', name: 'FSVM-03', ip: '10.42.100.53', vcpus: 4, memory_gb: 12, host_uuid: 'host-003', status: 'healthy' },
            ],
            file_shares: [
                { uuid: 'share-001', name: 'Engineering', protocol: 'SMB', path: '\\\\NTNX-Files\\Engineering', max_size_gb: 500, ssr_enabled: true, multi_protocol: false },
                { uuid: 'share-002', name: 'HR-Docs', protocol: 'SMB', path: '\\\\NTNX-Files\\HR-Docs', max_size_gb: 100, ssr_enabled: true, multi_protocol: false },
                { uuid: 'share-003', name: 'linux-home', protocol: 'NFS', path: '/export/linux-home', max_size_gb: null, ssr_enabled: false, multi_protocol: false },
            ],
            object_stores: [
                { uuid: 'os-001', name: 'ntnx-objects', capacity_tb: 10, endpoint: 'ntnx-objects.ntnxlab.local', status: 'online' },
            ],
            object_buckets: [
                { uuid: 'bucket-001', name: 'backup-2026', store: 'ntnx-objects', versioning: true, worm_enabled: false, lifecycle: { days: 90, action: 'delete' } },
                { uuid: 'bucket-002', name: 'compliance-archive', store: 'ntnx-objects', versioning: true, worm_enabled: true, lifecycle: null },
            ],
            volume_groups: [
                { uuid: 'vg-001', name: 'SQL-Data-VG', iscsi_target: 'iqn.2025-01.local.ntnxlab:sql-data-vg', disks: [{ index: 0, size_gb: 100, container: 'Gold-Container' }, { index: 1, size_gb: 100, container: 'Gold-Container' }], clients: [{ iqn: 'iqn.2025-01.com.server01:initiator', type: 'external' }], chap_enabled: true, flash_mode: false },
                { uuid: 'vg-002', name: 'Oracle-Log-VG', iscsi_target: 'iqn.2025-01.local.ntnxlab:oracle-log-vg', disks: [{ index: 0, size_gb: 50, container: 'Gold-Container' }], clients: [], chap_enabled: false, flash_mode: true },
            ],
            nc2_clusters: [
                { uuid: 'nc2-001', name: 'NC2-Prod-AWS', provider: 'AWS', region: 'us-east-1', az: 'us-east-1a', instance_type: 'i3.metal', node_count: 4, rf: 'RF2', vpc_cidr: '10.100.0.0/16', subnet_cidr: '10.100.1.0/25', flow_gateway_count: 0, network_mode: 'native', billing: 'PAYG', status: 'running', aos_version: '6.10.1.2', ahv_version: '20230302.10015' },
                { uuid: 'nc2-002', name: 'NC2-DR-Azure', provider: 'Azure', region: 'eastus', az: 'eastus-az1', instance_type: 'BareMetal-AHV', node_count: 3, rf: 'RF2', vpc_cidr: '10.200.0.0/16', subnet_cidr: '10.200.1.0/24', flow_gateway_count: 2, network_mode: 'noNAT', billing: '1yr', status: 'running', aos_version: '6.10.1.2', ahv_version: '20230302.10015' },
            ],
            gpu_devices: [
                { uuid: 'gpu-001', name: 'GPU-Node1-Slot0', model: 'A100', host: 'AHV-Node-01', mode: 'passthrough', mig_partitions: 0, assigned_to: 'NAI-Worker-01' },
                { uuid: 'gpu-002', name: 'GPU-Node1-Slot1', model: 'A100', host: 'AHV-Node-01', mode: 'mig', mig_partitions: 7, assigned_to: null },
                { uuid: 'gpu-003', name: 'GPU-Node2-Slot0', model: 'L40S', host: 'AHV-Node-02', mode: 'passthrough', mig_partitions: 0, assigned_to: 'NAI-Worker-02' },
                { uuid: 'gpu-004', name: 'GPU-Node3-Slot0', model: 'T4', host: 'AHV-Node-03', mode: 'passthrough', mig_partitions: 0, assigned_to: null },
            ],
            nai_endpoints: [
                { uuid: 'nai-001', name: 'llama-prod', model: 'llama-2-7b-chat', engine: 'vllm', format: 'safetensors', gpu_count: 1, replicas: 2, min_replicas: 2, max_replicas: 5, api_key: 'nai-prod-key-001', status: 'running', url: 'https://llama-prod.nai.ntnxlab.local/v1' },
                { uuid: 'nai-002', name: 'codellama-dev', model: 'codellama-34b', engine: 'vllm', format: 'gptq', gpu_count: 1, replicas: 1, min_replicas: 1, max_replicas: 3, api_key: 'nai-dev-key-002', status: 'running', url: 'https://codellama-dev.nai.ntnxlab.local/v1' },
            ],
            // Sprint 11 — New collections
            registered_clusters: [
                { uuid: 'rc-001', name: 'NTNX-POC-Cluster-01', vip: '10.42.100.37', version: 'AOS 6.10.1.2', hypervisor: 'AHV', node_count: 4, rf: 2, vm_count: 11, status: 'healthy', storage_usage: 12.7, storage_capacity: 48.0, last_health_check: '2026-04-01T18:00:00Z' },
                { uuid: 'rc-002', name: 'NTNX-DR-Site-01', vip: '10.42.200.37', version: 'AOS 6.10.1.2', hypervisor: 'AHV', node_count: 3, rf: 2, vm_count: 5, status: 'healthy', storage_usage: 6.2, storage_capacity: 36.0, last_health_check: '2026-04-01T18:00:00Z' },
                { uuid: 'rc-003', name: 'NTNX-ESXi-Prod', vip: '10.42.300.37', version: 'AOS 6.8.1', hypervisor: 'ESXi', node_count: 6, rf: 3, vm_count: 42, status: 'healthy', storage_usage: 28.1, storage_capacity: 72.0, last_health_check: '2026-04-01T17:30:00Z' },
            ],
            blueprints: [
                { uuid: 'bp-001', name: 'WebApp-3Tier', type: 'Multi-VM', status: 'active', services: [{ name: 'WebServer', type: 'VM', substrate: 'AHV' }, { name: 'AppServer', type: 'VM', substrate: 'AHV' }, { name: 'Database', type: 'VM', substrate: 'AHV' }], project: 'Engineering', created_at: '2026-03-15', updated_at: '2026-03-28' },
                { uuid: 'bp-002', name: 'Dev-Sandbox', type: 'Single-VM', status: 'active', services: [{ name: 'DevBox', type: 'VM', substrate: 'AHV' }], project: 'Engineering', created_at: '2026-03-20', updated_at: '2026-03-20' },
                { uuid: 'bp-003', name: 'MongoDB-HA', type: 'Multi-VM', status: 'published', services: [{ name: 'Primary', type: 'VM', substrate: 'AHV' }, { name: 'Secondary-1', type: 'VM', substrate: 'AHV' }, { name: 'Secondary-2', type: 'VM', substrate: 'AHV' }], project: 'Data Team', created_at: '2026-02-10', updated_at: '2026-03-01' },
            ],
            applications: [
                { uuid: 'app-001', name: 'WebApp-3Tier-prod', blueprint: 'WebApp-3Tier', status: 'running', services: [{ name: 'WebServer' }, { name: 'AppServer' }, { name: 'Database' }], project: 'Engineering', created_at: '2026-03-29' },
                { uuid: 'app-002', name: 'Dev-Sandbox-jdoe', blueprint: 'Dev-Sandbox', status: 'running', services: [{ name: 'DevBox' }], project: 'Engineering', created_at: '2026-04-01' },
            ],
            runbooks: [
                { uuid: 'rb-001', name: 'Cluster-Health-Check', type: 'Operational', status: 'active', run_count: 15, last_run: '2026-04-01T12:00:00Z' },
                { uuid: 'rb-002', name: 'VM-Snapshot-Cleanup', type: 'Remediation', status: 'active', run_count: 8, last_run: '2026-03-30T06:00:00Z' },
            ],
            audit_log: [],
            // Sprint 12 — New collections
            lcm_inventory: [
                { uuid: 'lcm-001', name: 'AOS', category: 'software', entity: 'NTNX-POC-Cluster-01', current_version: '6.10.1.2', available_version: null, update_available: false, status: 'up_to_date', update_size_mb: 0 },
                { uuid: 'lcm-002', name: 'AHV', category: 'software', entity: 'NTNX-POC-Cluster-01', current_version: '20230302.10015', available_version: '20240401.10016', update_available: true, status: 'update_available', update_size_mb: 420 },
                { uuid: 'lcm-003', name: 'Prism Central', category: 'software', entity: 'Prism-Central-01', current_version: 'pc.2024.2', available_version: null, update_available: false, status: 'up_to_date', update_size_mb: 0 },
                { uuid: 'lcm-004', name: 'NCC', category: 'software', entity: 'NTNX-POC-Cluster-01', current_version: '4.7.0', available_version: '4.8.0', update_available: true, status: 'update_available', update_size_mb: 85 },
                { uuid: 'lcm-005', name: 'Foundation', category: 'software', entity: 'NTNX-POC-Cluster-01', current_version: '5.7.1', available_version: null, update_available: false, status: 'up_to_date', update_size_mb: 0 },
                { uuid: 'lcm-006', name: 'BMC Firmware', category: 'firmware', entity: 'NTNX-A-CVM', current_version: '7.09', available_version: null, update_available: false, status: 'up_to_date', update_size_mb: 0 },
                { uuid: 'lcm-007', name: 'BIOS', category: 'firmware', entity: 'NTNX-A-CVM', current_version: '42.7.1', available_version: '42.7.2', update_available: true, status: 'update_available', update_size_mb: 32 },
                { uuid: 'lcm-008', name: 'HBA Firmware', category: 'firmware', entity: 'NTNX-A-CVM', current_version: '16.17.01.00', available_version: null, update_available: false, status: 'up_to_date', update_size_mb: 0 },
                { uuid: 'lcm-009', name: 'SSD Firmware', category: 'firmware', entity: 'NTNX-A-CVM', current_version: 'GDC5602Q', available_version: null, update_available: false, status: 'up_to_date', update_size_mb: 0 },
                { uuid: 'lcm-010', name: 'NIC Firmware', category: 'firmware', entity: 'NTNX-A-CVM', current_version: '22.00.48', available_version: null, update_available: false, status: 'up_to_date', update_size_mb: 0 },
            ],
            lcm_update_history: [
                { uuid: 'lcmh-001', component: 'AOS', entity: 'NTNX-POC-Cluster-01', from_version: '6.8.1', to_version: '6.10.1.2', status: 'success', completed_at: '2026-03-20T14:30:00Z' },
                { uuid: 'lcmh-002', component: 'NCC', entity: 'NTNX-POC-Cluster-01', from_version: '4.6.2', to_version: '4.7.0', status: 'success', completed_at: '2026-03-20T15:00:00Z' },
            ],
            pc_settings: [
                { uuid: 'pc-settings-001', pc_name: 'Prism-Central-01', pc_ip: '10.42.100.39', pc_version: 'pc.2024.2', timezone: 'America/Los_Angeles', ntp_servers: ['pool.ntp.org', '0.us.pool.ntp.org'], dns_servers: ['10.42.100.10'], smtp_server: '', smtp_port: 25, smtp_from: 'prism-central@ntnxlab.local', smtp_security: 'none', ssl_issuer: 'Self-Signed', ssl_expires: '2027-04-01', ssl_subject: 'CN=prism-central.ntnxlab.local', pulse_enabled: true, pulse_email: 'admin@ntnxlab.local', scma_enabled: false, scma_schedule: 'daily' },
            ],
            vpcs: [
                { uuid: 'vpc-001', name: 'Production-VPC', cidr: '172.16.0.0/16', external_subnet: 'VM-Network-100', dns_servers: ['10.42.100.10'], status: 'active', routes: [{ destination: '0.0.0.0/0', target: 'External Gateway', type: 'default' }, { destination: '172.16.0.0/16', target: 'Local', type: 'local' }] },
                { uuid: 'vpc-002', name: 'Dev-VPC', cidr: '192.168.0.0/16', external_subnet: 'VM-Network-100', dns_servers: ['10.42.100.10'], status: 'active', routes: [{ destination: '0.0.0.0/0', target: 'External Gateway', type: 'default' }, { destination: '192.168.0.0/16', target: 'Local', type: 'local' }] },
            ],
            subnets: [
                { uuid: 'sub-001', name: 'Web-Tier', vpc_uuid: 'vpc-001', type: 'Overlay', cidr: '172.16.1.0/24', gateway: '172.16.1.1', pool_start: '172.16.1.10', pool_end: '172.16.1.250', nat: true },
                { uuid: 'sub-002', name: 'App-Tier', vpc_uuid: 'vpc-001', type: 'Overlay', cidr: '172.16.2.0/24', gateway: '172.16.2.1', pool_start: '172.16.2.10', pool_end: '172.16.2.250', nat: true },
                { uuid: 'sub-003', name: 'DB-Tier', vpc_uuid: 'vpc-001', type: 'Overlay', cidr: '172.16.3.0/24', gateway: '172.16.3.1', pool_start: '172.16.3.10', pool_end: '172.16.3.100', nat: false },
                { uuid: 'sub-004', name: 'Dev-Default', vpc_uuid: 'vpc-002', type: 'Overlay', cidr: '192.168.1.0/24', gateway: '192.168.1.1', pool_start: '192.168.1.10', pool_end: '192.168.1.250', nat: true },
            ],
            floating_ips: [
                { uuid: 'fip-001', ip: '10.42.100.60', vpc_uuid: 'vpc-001', vpc_name: 'Production-VPC', assigned_to: 'Web-Server-01', status: 'assigned' },
                { uuid: 'fip-002', ip: '10.42.100.61', vpc_uuid: 'vpc-001', vpc_name: 'Production-VPC', assigned_to: null, status: 'available' },
            ],
            alert_policies: [
                { uuid: 'ap-001', name: 'Critical-Email-Admins', entity_type: 'All', severity_filter: ['critical'], action: 'email', enabled: true },
                { uuid: 'ap-002', name: 'Storage-Warning-SNMP', entity_type: 'Storage Container', severity_filter: ['warning', 'critical'], action: 'snmp', enabled: true },
            ],
            projects: [
                { uuid: 'proj-001', name: 'Engineering', description: 'Engineering team project', vcpu_quota: 100, memory_quota_gb: 256, storage_quota_gb: 2000, vcpu_used: 24, memory_used_gb: 68, storage_used_gb: 430, vm_count: 6, users: [{ username: 'admin', role: 'Project Admin' }, { username: 'jdoe', role: 'Developer' }], infrastructure: { clusters: ['NTNX-POC-Cluster-01'], networks: ['Production-200'], categories: [{ key: 'Environment', value: 'Development' }], vpcs: ['vpc-002'] } },
                { uuid: 'proj-002', name: 'Data Team', description: 'Data engineering and analytics', vcpu_quota: 64, memory_quota_gb: 128, storage_quota_gb: 1000, vcpu_used: 12, memory_used_gb: 32, storage_used_gb: 280, vm_count: 3, users: [{ username: 'operator', role: 'Project Admin' }], infrastructure: { clusters: ['All'], networks: ['All'], categories: [], vpcs: [] } },
            ],
            // Sprint 13 — New collections
            pe_reports: [
                { uuid: 'rpt-001', name: 'Weekly Capacity Summary', type: 'Capacity', generated_at: '2026-04-01T08:00:00Z', size_kb: 245, status: 'ready', format: 'PDF' },
                { uuid: 'rpt-002', name: 'Monthly Performance Report', type: 'Performance', generated_at: '2026-03-31T06:00:00Z', size_kb: 512, status: 'ready', format: 'PDF' },
                { uuid: 'rpt-003', name: 'Configuration Audit', type: 'Configuration', generated_at: '2026-04-01T09:30:00Z', size_kb: 180, status: 'ready', format: 'CSV' },
                { uuid: 'rpt-004', name: 'VM Inventory Export', type: 'Custom', generated_at: '2026-03-28T14:00:00Z', size_kb: 98, status: 'ready', format: 'CSV' },
                { uuid: 'rpt-005', name: 'Storage Trend Analysis', type: 'Capacity', generated_at: null, size_kb: 0, status: 'generating', format: 'PDF' },
            ],
            scheduled_reports: [
                { uuid: 'sr-001', name: 'Weekly Capacity Summary', schedule: 'Weekly', next_run: '2026-04-07T08:00:00Z', recipients: 'admin@ntnxlab.local', enabled: true },
                { uuid: 'sr-002', name: 'Monthly Performance Report', schedule: 'Monthly', next_run: '2026-05-01T06:00:00Z', recipients: 'admin@ntnxlab.local, ops@ntnxlab.local', enabled: true },
                { uuid: 'sr-003', name: 'Daily Health Check', schedule: 'Daily', next_run: '2026-04-02T06:00:00Z', recipients: 'admin@ntnxlab.local', enabled: false },
            ],
            capacity_data: [
                { uuid: 'cap-001', resource: 'cpu', current_pct: 62, runway_days: 145, trend: [45, 48, 51, 55, 58, 60, 62], top_consumers: [{ name: 'VM-DB-Prod-01', usage: 18 }, { name: 'VM-App-Server-02', usage: 14 }, { name: 'VM-Web-Cluster', usage: 12 }] },
                { uuid: 'cap-002', resource: 'memory', current_pct: 74, runway_days: 88, trend: [58, 62, 65, 68, 70, 72, 74], top_consumers: [{ name: 'VM-DB-Prod-01', usage: 32 }, { name: 'VM-Analytics-01', usage: 24 }, { name: 'VM-Web-Cluster', usage: 16 }] },
                { uuid: 'cap-003', resource: 'storage', current_pct: 55, runway_days: 210, trend: [40, 42, 45, 48, 50, 53, 55], top_consumers: [{ name: 'Default-Container', usage: 2400 }, { name: 'Backup-Container', usage: 1800 }, { name: 'Prod-Container', usage: 1200 }] },
            ],
            insights: [
                { uuid: 'ins-001', category: 'critical', title: 'Memory pressure on VM-DB-Prod-01', description: 'VM-DB-Prod-01 has been above 90% memory utilization for 72 hours. Consider adding memory or migrating workloads.', impact: 'Performance degradation risk', status: 'active', detected_at: '2026-04-01T10:00:00Z' },
                { uuid: 'ins-002', category: 'optimization', title: 'Oversized VM detected: VM-Test-Idle', description: 'VM-Test-Idle has averaged <5% CPU and <10% memory for 30 days. Consider right-sizing to 2 vCPU / 4 GB.', impact: 'Save 6 vCPU, 12 GB memory', status: 'active', detected_at: '2026-04-01T08:00:00Z' },
                { uuid: 'ins-003', category: 'optimization', title: 'Storage container thin-provisioned heavily', description: 'Default-Container is 3.2x overprovisioned. Monitor closely or add capacity.', impact: 'Data availability risk if usage spikes', status: 'active', detected_at: '2026-03-30T14:00:00Z' },
                { uuid: 'ins-004', category: 'info', title: 'AOS update available', description: 'AOS 6.11.0 is available. Review release notes for security fixes and new features.', impact: 'Security and feature improvements', status: 'active', detected_at: '2026-04-01T06:00:00Z' },
                { uuid: 'ins-005', category: 'critical', title: 'Anomaly: Unusual IOPS spike on SSD tier', description: 'SSD tier IOPS jumped 340% between 02:00-04:00. Correlates with backup job. Consider staggering backup schedules.', impact: 'May cause latency for production workloads', status: 'active', detected_at: '2026-04-01T04:30:00Z' },
            ],
            anomalies: [
                { uuid: 'anom-001', entity: 'NTNX-A-CVM', metric: 'IOPS', expected: 1200, actual: 5280, deviation_pct: 340, detected_at: '2026-04-01T03:15:00Z', status: 'active' },
                { uuid: 'anom-002', entity: 'VM-DB-Prod-01', metric: 'Memory Usage', expected: 75, actual: 94, deviation_pct: 25, detected_at: '2026-04-01T10:00:00Z', status: 'active' },
                { uuid: 'anom-003', entity: 'Default-Container', metric: 'Write Latency', expected: 1.2, actual: 4.8, deviation_pct: 300, detected_at: '2026-03-31T22:00:00Z', status: 'acknowledged' },
            ],
            ai_models: [
                { uuid: 'aim-001', name: 'Llama-3.1-8B', framework: 'vLLM', version: '3.1', size_gb: 16, status: 'deployed', quantization: 'FP16', updated_at: '2026-03-28T10:00:00Z' },
                { uuid: 'aim-002', name: 'Mistral-7B-Instruct', framework: 'vLLM', version: '0.3', size_gb: 14, status: 'deployed', quantization: 'FP16', updated_at: '2026-03-25T08:00:00Z' },
                { uuid: 'aim-003', name: 'Stable-Diffusion-XL', framework: 'PyTorch', version: '1.0', size_gb: 6.9, status: 'available', quantization: 'FP16', updated_at: '2026-03-20T12:00:00Z' },
                { uuid: 'aim-004', name: 'BERT-Large-Uncased', framework: 'ONNX', version: '1.0', size_gb: 1.3, status: 'available', quantization: 'INT8', updated_at: '2026-03-15T09:00:00Z' },
                { uuid: 'aim-005', name: 'Whisper-Large-v3', framework: 'PyTorch', version: '3.0', size_gb: 3.1, status: 'downloading', quantization: 'FP16', updated_at: '2026-04-01T14:00:00Z' },
            ],
            ai_endpoint_metrics: [
                { uuid: 'aem-001', endpoint: 'llama-chat', model: 'Llama-3.1-8B', replicas: 2, requests_min: 45, avg_latency_ms: 320, p99_latency_ms: 890, gpu_util_pct: 78, status: 'healthy', error_rate: 0.2 },
                { uuid: 'aem-002', endpoint: 'mistral-code', model: 'Mistral-7B-Instruct', replicas: 1, requests_min: 22, avg_latency_ms: 180, p99_latency_ms: 450, gpu_util_pct: 55, status: 'healthy', error_rate: 0.1 },
                { uuid: 'aem-003', endpoint: 'sdxl-images', model: 'Stable-Diffusion-XL', replicas: 1, requests_min: 8, avg_latency_ms: 2400, p99_latency_ms: 5200, gpu_util_pct: 92, status: 'degraded', error_rate: 3.5 },
            ],
            nc2_metrics: [
                { uuid: 'nc2m-001', cluster: 'NC2-AWS-Prod', provider: 'AWS', cpu_pct: 58, memory_pct: 65, storage_pct: 42, iops: 8500, latency_ms: 1.8, throughput_mbs: 420, uptime_pct: 99.95, hourly_rate: 12.50, instance_type: 'i3.metal' },
                { uuid: 'nc2m-002', cluster: 'NC2-Azure-DR', provider: 'Azure', cpu_pct: 22, memory_pct: 30, storage_pct: 18, iops: 3200, latency_ms: 2.1, throughput_mbs: 280, uptime_pct: 99.90, hourly_rate: 11.80, instance_type: 'Standard_L8s_v3' },
            ],
            nc2_scaling_history: [
                { uuid: 'nc2sh-001', cluster: 'NC2-AWS-Prod', action: 'scale_up', from_nodes: 3, to_nodes: 4, initiated_by: 'admin', status: 'completed', timestamp: '2026-03-20T10:00:00Z' },
                { uuid: 'nc2sh-002', cluster: 'NC2-Azure-DR', action: 'scale_up', from_nodes: 2, to_nodes: 3, initiated_by: 'auto-scale', status: 'completed', timestamp: '2026-03-25T14:30:00Z' },
                { uuid: 'nc2sh-003', cluster: 'NC2-AWS-Prod', action: 'scale_down', from_nodes: 4, to_nodes: 3, initiated_by: 'admin', status: 'completed', timestamp: '2026-03-28T08:00:00Z' },
            ],
            nc2_autoscale_policies: [
                { uuid: 'nc2asp-001', name: 'CPU-Scale-AWS', cluster: 'NC2-AWS-Prod', metric: 'CPU', threshold_pct: 80, action: 'add_node', cooldown_min: 30, enabled: true },
                { uuid: 'nc2asp-002', name: 'Memory-Scale-Azure', cluster: 'NC2-Azure-DR', metric: 'Memory', threshold_pct: 85, action: 'add_node', cooldown_min: 45, enabled: false },
            ],
        };
    }
}

export const state = new StateEngine();
