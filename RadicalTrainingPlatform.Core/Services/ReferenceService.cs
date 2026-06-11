using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core;

static class ReferenceService
{
    private static readonly Dictionary<string, List<(string[] Keywords, string Reference)>> _data = BuildData();

    private static Dictionary<string, List<(string[], string)>> BuildData()
    {
        var d = new Dictionary<string, List<(string[], string)>>();

        // ──── NCP-US ────
        d["NCP-US"] = new()
        {
            (new[] { "FSVM", "File Server", "Files", "file server VM" },
             "📁 Nutanix Files\n• Min 3 FSVMs for production HA\n• Max 16 FSVMs per file server\n• Each FSVM: 4 vCPU / 12 GB RAM default\n• Requires client-side + storage network\n• Log: minerva_nvm.log\n• Rolling upgrades (one FSVM at a time)\n• Supports SMB and NFS protocols\n• TLD (Top-Level Directory) distribution across FSVMs"),

            (new[] { "Objects", "bucket", "S3", "WORM", "lifecycle" },
             "🪣 Nutanix Objects\n• Runs on Microservices Platform (MSP)\n• Min 3 worker nodes\n• S3-compatible API\n• WORM: 24-hour grace period for compliance\n• Lifecycle policies are retroactive\n• Versioning at bucket level\n• Multi-cluster support via Prism Central"),

            (new[] { "Volumes", "iSCSI", "VG", "volume group", "CHAP", "MPIO" },
             "💾 Nutanix Volumes\n• iSCSI block storage\n• CHAP authentication supported\n• VG load balancing via acli\n• MPIO multipath for Windows/Linux\n• External client access via Data Services IP\n• Max 64 disks per VG\n• Supports live migration of VGs"),

            (new[] { "Data Lens", "Analytics", "audit", "File Analytics" },
             "📊 Data Lens & File Analytics\n• Data Lens: SaaS cloud-based, multi-cluster\n• File Analytics: on-prem VM, per file server\n• Audit trails for file access\n• Anomaly detection (ransomware)\n• Dashboard for capacity & usage trends\n• Data age analysis\n• Permission reporting"),

            (new[] { "share", "SMB", "NFS", "export", "TLD", "DFS", "tiering" },
             "📂 Shares & Exports\n• SMB: Standard & Distributed shares\n• Distributed = TLD sharding across FSVMs\n• NFS: Nested mount points supported\n• DFS namespace for Windows integration\n• Home directory support\n• SSR (Self-Service Restore) snapshots\n• Quotas at share/user level\n• Smart Tiering: Move cold data to S3-compatible object storage"),

            (new[] { "snapshot", "replication", "protection", "DR", "recovery" },
             "🔄 Data Protection (Files/Objects)\n• Snapshot-based replication\n• SmartDR for Files failover\n• RPO configurable per share\n• Active-passive replication\n• Planned & unplanned failover\n• Reverse replication on failback"),

            (new[] { "upgrade", "LCM", "deploy", "provision" },
             "⬆️ Deployment & Upgrades\n• LCM (Life Cycle Manager) for upgrades\n• Rolling upgrades minimize downtime\n• Pre-upgrade checks automatic\n• Foundation for initial deployment\n• 1-click upgrades via Prism"),

            (new[] { "DNS", "A record", "VIP", "virtual IP", "FSVM VIP", "name resolution", "client access", "hostname" },
             "🌐 Files Networking & DNS\n• Each FSVM requires DNS A record for client access\n• File server VIP must have valid DNS A record\n• DNS resolution critical for SMB share access\n• FSVM client-side IP must be resolvable by clients\n• A records map FSVM hostname → IP addresses\n• Multiple FSVMs load-balance via DNS round-robin\n• Intermittent access failures often due to missing DNS entries"),

            (new[] { "Active Directory", "Kerberos", "computer account", "domain", "NTLM", "AD", "domain joined", "password sync", "authentication" },
             "🔐 Files Active Directory & Kerberos\n• File server must be domain-joined to Active Directory\n• Computer account in AD required for Kerberos auth\n• Computer account password must be synchronized\n• Missing/deleted AD account causes auth failures\n• Kerberos requires both user AND computer account\n• NTLM fallback if Kerberos unavailable\n• Verify computer account exists and password is synced"),

            (new[] { "NTLMv1", "NTLMv2", "SMB signing", "CIFS", "legacy", "signing negotiation" },
             "🔒 SMB Authentication & Signing\n• NTLMv2 preferred over legacy NTLMv1\n• Legacy clients (Windows 7) may only support NTLMv1\n• SMB signing ensures message integrity\n• SMB signing required: disables legacy NTLM\n• Linux CIFS clients may need signing explicitly enabled\n• Verify NTLM authentication level on both server and client"),

            (new[] { "afs info", "afs command", "AFS CLI", "FSVM flavor", "FSVM status", "FSVM diagnostics", "AFS" },
             "📁 FSVM Diagnostics & CLI\n• 'afs info.list': Get FSVM deployment information\n• 'afs info' subcommands: FSVM status and configuration\n• Use AFS CLI for FSVM diagnostics via SSH\n• FSVM must be powered on and SSH accessible\n• Prism health checks validate minerva_nvm service\n• minerva_nvm.log: Primary source for service errors"),

            (new[] { "NCC", "ncc log_collector", "logbay", "diagnostic", "logs", "support bundle", "debug" },
             "🔧 NCC Diagnostic Tools\n• NCC (Nutanix Cluster Check): Diagnostic utility\n• 'ncc log_collector run_all': Generate diagnostic bundle\n• logbay: Centralized log collection and upload\n• Diagnostic bundles required for support portal\n• Log files essential for root cause analysis\n• Regular log collection prevents data loss"),
        };

        // ──── NCP-CI ────
        d["NCP-CI"] = new()
        {
            (new[] { "AWS", "i3", "VPC", "Direct Connect", "NVMe", "EC2" },
             "☁️ NC2 on AWS\n• Uses i3.metal bare-metal instances\n• VPC requires /25 subnet minimum\n• All nodes must be in same AZ\n• Direct Connect for hybrid connectivity\n• Local NVMe storage (NOT EBS)\n• Foundation not needed\n• No nested virtualization"),

            (new[] { "Azure", "BareMetal", "delegated", "Route Server", "ECMP", "BGP" },
             "☁️ NC2 on Azure\n• Uses Azure BareMetal infrastructure\n• Delegated subnet required\n• Flow Gateway VMs for routing\n• ECMP max 4 paths\n• BGP peering with Azure Route Server\n• ExpressRoute for hybrid connectivity"),

            (new[] { "NC2", "cloud", "hybrid", "subscription", "license", "hibernate" },
             "🌐 Nutanix Cloud Clusters (NC2)\n• Runs full AOS + AHV stack\n• Foundation NOT needed (pre-imaged)\n• Subscription-based licensing\n• Node hibernation to save costs\n• Prism Central for management\n• Same Nutanix features as on-prem"),

            (new[] { "Leap", "failover", "recovery", "DR", "Move", "migration" },
             "🔄 DR & Migration\n• Leap spans on-prem ↔ NC2\n• Nutanix Move for VM migration\n• Planned failover: graceful, no data loss\n• Unplanned failover: immediate, possible RPO gap\n• Recovery plans define VM order & networks"),

            (new[] { "Flow", "networking", "VPN", "subnet", "gateway" },
             "🌐 Cloud Networking\n• Flow Virtual Networking for overlay\n• VPN Gateway for site-to-site\n• VTEP tunnels between sites\n• Subnet extension for DR\n• Network segmentation policies"),

            (new[] { "cost", "TCO", "billing", "node", "scale" },
             "💰 Cost & Scaling\n• Per-node subscription pricing\n• Hibernate nodes to reduce costs\n• Scale out/in based on demand\n• No upfront hardware purchase\n• Metered billing options"),
        };

        // ──── NCP-AI ────
        d["NCP-AI"] = new()
        {
            (new[] { "GPU", "A100", "H100", "L40S", "T4", "passthrough", "vGPU" },
             "🎮 GPU Support\n• A100: 80GB HBM2e — training & large inference\n• H100: 80GB HBM3 — latest gen, highest perf\n• L40S: 48GB GDDR6 — inference optimized\n• T4: 16GB GDDR6 — entry-level inference\n• GPU passthrough via AHV\n• vGPU profiles for sharing\n• NVIDIA driver required in guest VM"),

            (new[] { "NAI", "NKP", "Kubernetes", "operator", "inference" },
             "🤖 Nutanix AI (NAI)\n• Runs on NKP (Nutanix Kubernetes Platform)\n• NAI Operator manages lifecycle\n• Inference endpoints auto-scaled\n• Model serving via containers\n• Supports vLLM and TensorRT-LLM engines\n• Health checks and auto-recovery"),

            (new[] { "model", "HuggingFace", "NGC", "quantiz", "FP16", "INT8", "INT4", "LoRA", "fine-tun", "gated", "access token", "license", "llama" },
             "🧠 Model Management & Access\n• Sources: HuggingFace, NVIDIA NGC, manual upload\n• Gated models (Llama 2, etc.) require HuggingFace access token\n• Model licensing and access control via Hub\n• Quantization: FP16 → INT8 → INT4 (smaller = faster)\n• LoRA: Low-Rank Adaptation fine-tuning\n• Model size determines GPU requirements\n• 7B params ≈ 14GB FP16 / 7GB INT8 / 3.5GB INT4"),

            (new[] { "API", "OpenAI", "endpoint", "chat", "completion", "token", "SSE", "streaming" },
             "🔌 API & Integration\n• OpenAI-compatible REST API\n• Endpoint: /v1/chat/completions\n• Bearer token authentication\n• SSE (Server-Sent Events) for streaming\n• Temperature, top_p, max_tokens params\n• System/user/assistant message roles"),

            (new[] { "vLLM", "TensorRT", "serving", "engine", "batch" },
             "⚡ Inference Engines\n• vLLM: Open-source, PagedAttention\n• TensorRT-LLM: NVIDIA optimized\n• Continuous batching for throughput\n• KV-cache management\n• Tensor parallelism across GPUs"),

            (new[] { "RAG", "retrieval", "vector", "embedding", "context" },
             "📚 RAG (Retrieval-Augmented Generation)\n• Combines search with generation\n• Vector embeddings for similarity\n• Context window augmentation\n• Reduces hallucination\n• Enterprise knowledge integration"),

            (new[] { "timeout", "configuration", "request timeout", "long-running", "inference timeout", "max_tokens", "settings" },
             "⚙️ Inference Configuration\n• Request timeout for long-running inference\n• max_tokens parameter limits response length\n• Temperature, top_p for response quality tuning\n• Streaming vs batch configurations\n• Server-side timeout policies in NAI config\n• Client-side timeout handling best practices"),

            (new[] { "capacity", "planning", "GPU count", "concurrent", "throughput", "scaling", "provisioning", "sizing" },
             "📊 Capacity Planning & GPU Sizing\n• GPU count = (concurrent_users × avg_tokens) / GPU_throughput\n• Throughput varies by model size, quantization, batch size\n• vLLM continuous batching improves GPU utilization\n• Concurrent user limits depend on context window\n• Over-provision for peak load and failover\n• Monitor GPU memory and utilization for scaling"),
        };

        // ──── NCA-75 ────
        d["NCA-75"] = new()
        {
            (new[] { "LCM", "Lifecycle Manager", "upgrade", "catalog", "bundle", "dark site", "air-gap", "firmware", "software", "component", "inventory", "prerequisite" },
             "⬆️ Lifecycle Management (LCM)\n• LCM (Lifecycle Manager): one-click upgrades for AOS, AHV, firmware\n• Upgrade workflow: Inventory -> Download -> Prechecks -> Upgrade\n• Pre-upgrade health checks run automatically\n• Dark site mode: air-gapped environments, manual bundle upload\n• Rolling upgrades minimize cluster downtime\n• Component dependencies verified before upgrade\n• Proxy configuration for internet-restricted sites\n• LCM bundle: packaged set of compatible upgrades\n• Rollback support for failed upgrades\n• Scheduled upgrades for maintenance windows"),

            (new[] { "AES", "ADSF", "AOS 7.5", "elastic storage", "distributed storage", "ADSF" },
             "💾 Adaptive Elastic Storage (AES) / Elastic VM Storage\n• AES (Adaptive Elastic Storage): dynamic VM storage allocation\n• Elastic VM Storage: expand/shrink VM storage on demand\n• No pre-allocation of full vDisk size\n• Thin provisioning with real-time growth\n• Available in AOS 7.5+\n• Reduces wasted storage from over-provisioned VMs\n• Works with existing containers and storage policies"),

            (new[] { "VM Startup Policy", "startup order", "boot policy", "VM boot", "boot sequence", "dependency" },
             "🖥️ VM Startup Policies\n• Define VM boot order and dependencies\n• Categories: Startup policy groups VMs by priority\n• Boot delay between VM groups\n• Sequential vs parallel startup modes\n• Used for planned cluster shutdown and restart\n• Ensures critical VMs start before dependent VMs\n• Configured via Prism Central"),

            (new[] { "vTPM", "TPM", "trusted platform", "virtual TPM", "security", "encryption" },
             "🔐 Virtual TPM (vTPM)\n• vTPM: Virtual Trusted Platform Module for VMs\n• Required for Windows 11 and certain security features\n• Provides hardware-backed security to guest VMs\n• Supports BitLocker and measured boot\n• vTPM state is stored encrypted on cluster storage\n• Available on AHV in AOS 7.5+\n• Per-VM enablement in VM settings"),

            (new[] { "NearSync", "Near Sync", "RPO", "journal", "replication", "1 minute", "15 minute" },
             "🔄 NearSync Replication\n• NearSync: RPO of 1–15 minutes\n• Journal-based replication (not snapshot-based)\n• Lower RPO than async, less overhead than sync\n• Requires journal on source and target\n• Protects against data loss with minimal lag\n• Leap integration for orchestrated failover\n• Bandwidth efficient for WAN replication"),

            (new[] { "Metro Availability", "Metro", "active-active", "stretch cluster", "zero RPO", "witness", "split brain" },
             "🌐 Metro Availability\n• Metro Availability: synchronous replication for zero RPO\n• Active-active stretch cluster across two sites\n• VMs can run at either site\n• Witness VM required for split-brain protection\n• Automatic failover with zero data loss\n• Network latency <5ms recommended\n• Third site witness prevents split-brain scenarios\n• Supported on AHV with AOS"),

            (new[] { "EC-X", "erasure coding", "EC", "erasure", "coding", "space efficient", "1.3:1" },
             "💾 EC-X Erasure Coding\n• EC-X: space-efficient data protection vs RF\n• RF2 = 2x space overhead; EC-X = ~1.3x overhead\n• Same fault tolerance as RF2 with less capacity used\n• Post-process: cold data converted to EC after threshold\n• Inline EC: available in newer AOS versions\n• Requires minimum cluster size\n• Best for cold/archive data on SSD/HDD tiers\n• Curator service manages EC background jobs"),
        };

        // ──── NCM-MCI ────
        d["NCM-MCI"] = new()
        {
            (new[] { "DSF", "OpLog", "Unified Cache", "Curator", "EC-X", "Stargate", "extent" },
             "💿 Distributed Storage Fabric (DSF)\n• OpLog: SSD-based write buffer (coalescing)\n• Unified Cache: single-tier read cache\n• Curator: background garbage collection, EC\n• EC-X: Erasure Coding (space efficient vs RF)\n• Stargate: I/O manager (port 2009)\n• Extent store on SSD/HDD tiers\n• Data locality: keep data on same node as VM"),

            (new[] { "AHV", "bridge", "bond", "LACP", "active-backup", "balance-slb", "OVS" },
             "🌐 AHV Networking\n• OVS (Open vSwitch) based\n• Bond modes: active-backup, balance-slb, LACP\n• Default: active-backup (no switch config)\n• balance-slb: TX load balancing\n• LACP: requires switch support, best throughput\n• br0 = management bridge\n• br1+ = VM network bridges"),

            (new[] { "acli", "ncli", "genesis", "zeus", "CLI" },
             "⌨️ CLI Reference\n• acli: AHV management (vm.*, net.*)\n• ncli: cluster management (cluster/container/host)\n• genesis: service lifecycle manager\n• zeus_config_printer: Zookeeper config dump\n• nuclei: Prism Central CLI\n• All run from any CVM via SSH"),

            (new[] { "Stargate", "Prism", "Curator", "Medusa", "Cassandra", "port", "service" },
             "🔧 Core Services & Ports\n• Stargate: 2009 (I/O path)\n• Prism: 9080 (web UI)\n• Curator: 2010 (background tasks)\n• Medusa/Cassandra: metadata store\n• Zookeeper: cluster config consensus\n• Genesis: service auto-restart\n• Cerebro: replication manager"),

            (new[] { "Async", "NearSync", "Sync", "RPO", "Leap", "BCDR", "recovery", "protection", "replicate" },
             "🔄 BCDR Tiers\n• Async: RPO 1 hour+ (snapshot-based)\n• NearSync: RPO 1–15 min (journal-based)\n• Sync: Zero RPO (write acknowledged both sites)\n• Leap: orchestrated DR recovery plans\n• Metro Availability: active-active stretch\n• Witness VM for split-brain protection"),

            (new[] { "Flow", "microseg", "VPC", "security", "policy" },
             "🛡️ Flow Networking\n• Microsegmentation: app-centric policies\n• VPC: isolated virtual networks\n• Categories for policy grouping\n• AppType, AppTier, Environment categories\n• Monitor → Apply mode transition\n• Visualization for traffic analysis"),

            (new[] { "LCM", "upgrade", "Foundation", "imaging", "AOS" },
             "⬆️ Lifecycle & Imaging\n• LCM: one-click upgrades (AOS, AHV, firmware)\n• Foundation: initial node imaging\n• Pre-upgrade checks automated\n• Rolling upgrades for zero downtime\n• Compatibility matrix enforcement"),

            (new[] { "Prism Central", "Prism Element", "PC", "PE", "category", "alert" },
             "🖥️ Prism Management\n• Prism Element (PE): per-cluster management\n• Prism Central (PC): multi-cluster management\n• Categories for tagging/grouping\n• Custom dashboards and reports\n• Alert policies and SNMP\n• Role-Based Access Control (RBAC)\n• Analysis dashboard for capacity planning"),

            (new[] { "VM", "vCPU", "memory", "NUMA", "affinity", "vMotion", "live migration", "CPU ready", "memory ballooning", "overcommit", "NGT", "VSS", "vDisk", "affinity rule" },
             "🖥️ VM Performance & Configuration\n• CPU ready time >10%: VM vCPU contention\n• NUMA: Keep vCPUs & memory local to socket\n• Memory ballooning: Host reclaiming VM memory; indicates overcommit\n• vMotion: Live VM migration between hosts\n• VM affinity: Hard (enforce) vs Soft (prefer)\n• NGT VSS: Application-consistent Windows snapshots\n• vDisk: Per-disk IOPS & latency tuning\n• Overcommit ratio: Typical 2:1 CPU"),

            (new[] { "v3 API", "REST", "v2.0 API", "HTTP", "POST", "GET", "PUT", "DELETE", "endpoint", "JSON", "pagination", "offset", "sort_order", "sort_attribute" },
             "🔌 Nutanix REST API v3\n• Intent-based v3 API uses POST for all list operations\n• POST /api/nutanix/v3/vms: create VM\n• GET /api/nutanix/v3/vms/{uuid}: get details\n• PUT /api/nutanix/v3/vms/{uuid}: update VM\n• Pagination: {kind, length, offset, sort_order, sort_attribute}\n• v2.0 API: legacy, uses REST conventions (GET for list)\n• Bearer token auth: Authorization: Bearer {token}"),

            (new[] { "performance tuning", "latency", "IOPS", "throughput", "optimization", "capacity planning", "CPU runway", "storage runway", "QoS", "hot vDisk" },
             "⚡ Performance Tuning & Capacity\n• CPU ready time: Prism > Dashboard > Host CPU\n• Per-vDisk latency: Prism > Storage > Volume Groups\n• Capacity runway: Prism > Analysis > CPU/Storage forecast\n• QoS per-container: Throttle IOPS to protect workloads\n• Workload isolation: Separate containers for OLTP vs VDI\n• Safe CPU alloc: Physical cores × utilization ÷ overcommit ratio"),

            (new[] { "deduplication", "compression", "inline", "post-process", "EC savings", "storage container", "RF2", "RF3", "replication factor", "ILM", "tiering", "shadow clone", "data reduction" },
             "💾 Storage Advanced Features\n• Dedup: Fingerprint-based, works with compression\n• Inline compression: Real-time (LZ4), low latency\n• Post-process compression: Delayed, higher ratio\n• EC-X: Space efficient (1.3:1 vs RF2 2:1)\n• RF2 = 2x space, 1 fault; RF3 = 3x space, 2 fault\n• ILM: Auto-move cold data to HDD tier\n• Shadow Clones: VDI read-only cache (>30% read ops)"),

            (new[] { "metrics", "monitoring", "dashboard", "health check", "NCC", "statistics", "alerting", "SNMP", "cache hit rate", "replication lag" },
             "📊 Metrics & Monitoring\n• Prism dashboards: CPU, memory, storage, latency, IOPS\n• Cache hit rate: Unified Cache hits ÷ total reads\n• NCC health checks: run filtered by category\n• Pending snapshots: Leap > Protection Domains > Job Status\n• Replication lag: snapshot creation vs replication rate\n• Data reduction ratio: Prism > Storage > Containers"),

            (new[] { "STIG", "hardening", "compliance", "SCMA", "encryption", "SSH", "key-based auth", "cluster lockdown", "password policy", "RBAC", "audit" },
             "🛡️ Security & Hardening\n• Cluster lockdown: Enforce key-based SSH via Prism > Security\n• STIG compliance: Nutanix STIG/CIS benchmarks\n• Encryption: Data at rest (containers) + in transit (TLS)\n• RBAC: Role-based access via Prism > Administration > Roles\n• Audit logging: Track admin actions and file access\n• Password policies: Min length, complexity, expiration"),

            (new[] { "X-Ray", "benchmark", "workload simulation", "stress test", "performance baseline" },
             "📈 X-Ray Benchmarking\n• X-Ray: Official Nutanix workload simulation tool\n• Workloads: VDI, OLTP, OLAP, web tier\n• Baseline: Before/after optimization comparison\n• Output: IOPS, latency, throughput reports\n• Portal: x-ray.nutanix.com"),
        };

        return d;
    }

    public static string GetReferenceForQuestion(Question q)
    {
        if (!_data.TryGetValue(q.ExamCode, out var entries))
            return "";

        var stemLower = q.Stem.ToLowerInvariant();
        var optionsText = string.Join(" ", q.Options.Select(o => o.Text)).ToLowerInvariant();
        var searchText = stemLower + " " + optionsText;

        var matches = new List<(int score, string text)>();
        foreach (var (keywords, reference) in entries)
        {
            int score = keywords.Count(k => searchText.Contains(k.ToLowerInvariant()));
            if (score > 0)
                matches.Add((score, reference));
        }

        if (matches.Count == 0)
            return "";

        matches.Sort((a, b) => b.score.CompareTo(a.score));
        return string.Join("\n\n", matches.Take(2).Select(m => m.text));
    }

    // ── KB / Documentation Link Mappings ──

    private static readonly Dictionary<string, List<(string[] Keywords, string Title, string Url)>> _kbLinks = BuildKBLinks();

    private static Dictionary<string, List<(string[], string, string)>> BuildKBLinks()
    {
        var d = new Dictionary<string, List<(string[], string, string)>>();

        // ──── NCP-US ────
        d["NCP-US"] = new()
        {
            (new[] { "FSVM", "file server", "files", "SMB", "NFS", "share", "minerva", "TLD", "distributed", "export", "home directory", "SSR", "self-service" },
             "Nutanix Files Administration Guide",
             "https://portal.nutanix.com/page/documents/details?targetId=Files-v4_5:fil-files-administration-c.html"),

            (new[] { "Objects", "bucket", "S3", "WORM", "lifecycle", "object store", "MSP", "versioning" },
             "Nutanix Objects Guide",
             "https://portal.nutanix.com/page/documents/details?targetId=Objects-v4_3:top-objects-guide-c.html"),

            (new[] { "Volumes", "iSCSI", "VG", "volume group", "CHAP", "MPIO", "block storage", "data services IP" },
             "Nutanix Volumes Guide",
             "https://portal.nutanix.com/page/documents/details?targetId=Volumes-Guide-v4_7:vol-volumes-overview-c.html"),

            (new[] { "Data Lens", "data lens", "SaaS", "cloud analytics", "multi-cluster analytics" },
             "Nutanix Data Lens Guide",
             "https://portal.nutanix.com/page/documents/details?targetId=Data-Lens:top-data-lens-overview.html"),

            (new[] { "File Analytics", "analytics", "audit", "anomaly", "ransomware", "dashboard", "permission", "data age" },
             "Nutanix File Analytics Guide",
             "https://portal.nutanix.com/page/documents/details?targetId=File-Analytics-v3_2:ana-file-analytics-overview-c.html"),

            (new[] { "snapshot", "replication", "protection", "DR", "recovery", "SmartDR", "failover", "RPO" },
             "Nutanix Files Administration — Data Protection",
             "https://portal.nutanix.com/page/documents/details?targetId=Files-v4_5:fil-files-administration-c.html"),

            (new[] { "upgrade", "LCM", "deploy", "provision", "foundation" },
             "Nutanix Files Administration — Deployment",
             "https://portal.nutanix.com/page/documents/details?targetId=Files-v4_5:fil-files-administration-c.html"),
        };

        // ──── NCP-CI ────
        d["NCP-CI"] = new()
        {
            (new[] { "AWS", "i3", "VPC", "Direct Connect", "NVMe", "EC2", "bare metal", "NC2 AWS" },
             "NC2 on AWS — Getting Started",
             "https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html"),

            (new[] { "Azure", "BareMetal", "delegated", "Route Server", "ECMP", "BGP", "ExpressRoute", "NC2 Azure" },
             "NC2 on Azure — Getting Started",
             "https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-Azure:nc2-azure-getting-started-c.html"),

            (new[] { "Move", "migration", "migrate", "V2V", "VM migration", "cutover" },
             "Nutanix Move Guide",
             "https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Move-v4_9:top-nutanix-move-overview.html"),

            (new[] { "Flow", "networking", "VPN", "subnet", "gateway", "overlay", "VTEP", "virtual networking" },
             "Flow Virtual Networking Guide",
             "https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Flow-Networking-Guide:flow-networking-overview-c.html"),

            (new[] { "NC2", "cloud cluster", "hybrid", "subscription", "license", "hibernate", "cloud clusters" },
             "NC2 on AWS — Cloud Clusters Overview",
             "https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html"),

            (new[] { "Leap", "failover", "recovery", "DR", "disaster", "protection", "recovery plan" },
             "NC2 on AWS — Disaster Recovery",
             "https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html"),

            (new[] { "cost", "TCO", "billing", "node", "scale", "pricing", "metered" },
             "NC2 on AWS — Licensing & Scaling",
             "https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html"),
        };

        // ──── NCP-AI ────
        d["NCP-AI"] = new()
        {
            (new[] { "NAI", "GPT-in-a-Box", "inference", "AI", "model serving", "endpoint" },
             "Nutanix AI (NAI) Overview",
             "https://portal.nutanix.com/page/documents/details?targetId=Nutanix-AI-v1_0:top-nutanix-ai-overview.html"),

            (new[] { "NKP", "Kubernetes", "operator", "platform", "cluster", "kubectl" },
             "Nutanix Kubernetes Platform (NKP) Guide",
             "https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Kubernetes-Platform-v2_11:top-overview.html"),

            (new[] { "GPU", "A100", "H100", "L40S", "T4", "passthrough", "vGPU", "NVIDIA", "graphics" },
             "AHV GPU Passthrough Guide",
             "https://portal.nutanix.com/page/documents/details?targetId=AHV-Admin-Guide-v6_10:ahv-gpu-passthrough-c.html"),

            (new[] { "model", "HuggingFace", "NGC", "quantiz", "FP16", "INT8", "INT4", "LoRA", "fine-tun", "training" },
             "Nutanix AI — Model Management",
             "https://portal.nutanix.com/page/documents/details?targetId=Nutanix-AI-v1_0:top-nutanix-ai-overview.html"),

            (new[] { "vLLM", "TensorRT", "serving", "engine", "batch", "PagedAttention" },
             "Nutanix AI — Inference Engines",
             "https://portal.nutanix.com/page/documents/details?targetId=Nutanix-AI-v1_0:top-nutanix-ai-overview.html"),

            (new[] { "RAG", "retrieval", "vector", "embedding", "context", "hallucination" },
             "Nutanix AI — RAG Overview",
             "https://portal.nutanix.com/page/documents/details?targetId=Nutanix-AI-v1_0:top-nutanix-ai-overview.html"),

            (new[] { "API", "OpenAI", "endpoint", "chat", "completion", "token", "SSE", "streaming", "REST" },
             "Nutanix AI — API Reference",
             "https://portal.nutanix.com/page/documents/details?targetId=Nutanix-AI-v1_0:top-nutanix-ai-overview.html"),
        };

        // ──── NCM-MCI ────
        d["NCM-MCI"] = new()
        {
            (new[] { "Prism Central", "Prism Element", "PC", "PE", "dashboard", "category", "alert", "RBAC", "Prism" },
             "Prism Web Console Guide",
             "https://portal.nutanix.com/page/documents/details?targetId=Prism-Central-Guide-vpc_2024_3:mul-welcome-pc-c.html"),

            (new[] { "acli", "ncli", "CLI", "command", "nuclei", "zeus_config" },
             "AOS CLI Reference",
             "https://portal.nutanix.com/page/documents/details?targetId=Command-Ref-AOS-v6_10:man-acli-ref-r.html"),

            (new[] { "AHV", "bridge", "bond", "LACP", "active-backup", "balance-slb", "OVS", "hypervisor" },
             "AHV Administration Guide",
             "https://portal.nutanix.com/page/documents/details?targetId=AHV-Admin-Guide-v6_10:ahv-ahv-admin-c.html"),

            (new[] { "Flow", "microseg", "security", "policy", "AppType", "AppTier", "microsegmentation" },
             "Flow Security Guide",
             "https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Flow-Security-Guide:flow-microseg-overview-c.html"),

            (new[] { "Leap", "DR", "disaster", "BCDR", "recovery", "protection", "replicate", "Metro", "witness" },
             "Leap Disaster Recovery Guide",
             "https://portal.nutanix.com/page/documents/details?targetId=Leap-DR-Guide:leap-leap-overview.html"),

            (new[] { "DSF", "OpLog", "Unified Cache", "Curator", "EC-X", "Stargate", "extent", "storage fabric" },
             "The Nutanix Bible",
             "https://www.nutanixbible.com/"),

            (new[] { "genesis", "Medusa", "Cassandra", "Zookeeper", "Cerebro", "port", "service", "architecture" },
             "The Nutanix Bible",
             "https://www.nutanixbible.com/"),

            (new[] { "LCM", "upgrade", "Foundation", "imaging", "AOS", "firmware" },
             "Prism Web Console — LCM",
             "https://portal.nutanix.com/page/documents/details?targetId=Prism-Central-Guide-vpc_2024_3:mul-welcome-pc-c.html"),

            (new[] { "Async", "NearSync", "Sync", "RPO", "snapshot", "replication" },
             "Leap Disaster Recovery — Protection Policies",
             "https://portal.nutanix.com/page/documents/details?targetId=Leap-DR-Guide:leap-leap-overview.html"),

            (new[] { "v3 API", "REST", "v2.0", "HTTP", "POST", "GET", "endpoint", "pagination", "JSON", "bearer token" },
             "Nutanix v3 REST API Documentation",
             "https://portal.nutanix.com/page/documents/details?targetId=API-Ref-v3:api-api-overview.html"),

            (new[] { "VM", "vCPU", "NUMA", "memory", "CPU ready", "ballooning", "affinity", "vMotion", "NGT", "VSS" },
             "AHV VM Management Guide",
             "https://portal.nutanix.com/page/documents/details?targetId=AHV-Admin-Guide-v6_10:ahv-vm-mgmt-c.html"),

            (new[] { "capacity planning", "CPU runway", "storage runway", "overcommit", "IOPS", "latency", "throughput", "metrics" },
             "Prism — Capacity Planning",
             "https://portal.nutanix.com/page/documents/details?targetId=Prism-Central-Guide-vpc_2024_3:mul-dashboard-capacity-c.html"),

            (new[] { "X-Ray", "benchmark", "workload simulation", "performance baseline" },
             "Nutanix X-Ray Benchmarking",
             "https://x-ray.nutanix.com/"),

            (new[] { "STIG", "hardening", "SSH", "cluster lockdown", "compliance", "SCMA", "encryption" },
             "Security Hardening Best Practices",
             "https://portal.nutanix.com/page/documents/details?targetId=Security-Best-Practices:sec-security-hardening-c.html"),

            (new[] { "deduplication", "compression", "EC savings", "shadow clone", "ILM", "data reduction", "RF2", "RF3" },
             "Nutanix Bible — Storage Features",
             "https://www.nutanixbible.com/"),

            (new[] { "NCC", "health check", "monitoring", "alerting", "diagnostic" },
             "Prism — Health & Monitoring",
             "https://portal.nutanix.com/page/documents/details?targetId=Prism-Central-Guide-vpc_2024_3:mul-health-monitoring-c.html"),
        };

        return d;
    }

    private static readonly List<(string Title, string Url)> _generalResources = new()
    {
        ("Nutanix University", "https://www.nutanix.com/university"),
        ("Nutanix Community (NEXT)", "https://next.nutanix.com/"),
        ("Nutanix Portal KB Search", "https://portal.nutanix.com/page/kbs/list"),
    };

    public static List<(string Title, string Url)> GetKBLinksForQuestion(Question q)
    {
        var results = new List<(string Title, string Url)>();

        if (!_kbLinks.TryGetValue(q.ExamCode, out var entries))
            return results;

        var stemLower = q.Stem.ToLowerInvariant();
        var optionsText = string.Join(" ", q.Options.Select(o => o.Text)).ToLowerInvariant();
        var searchText = stemLower + " " + optionsText;

        var scored = new List<(int score, string title, string url)>();
        foreach (var (keywords, title, url) in entries)
        {
            int score = keywords.Count(k => searchText.Contains(k.ToLowerInvariant()));
            if (score > 0)
                scored.Add((score, title, url));
        }

        scored.Sort((a, b) => b.score.CompareTo(a.score));

        // Deduplicate by URL, keep highest-scored entry per URL
        var seen = new HashSet<string>();
        foreach (var (_, title, url) in scored)
        {
            if (seen.Add(url))
                results.Add((title, url));
        }

        return results;
    }

    public static List<(string Title, string Url)> GetGeneralResources() => _generalResources;
}
