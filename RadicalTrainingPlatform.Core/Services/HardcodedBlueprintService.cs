using RadicalTrainingPlatform.Core.Abstractions;
using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core;

/// <summary>
/// Provides exam blueprint data, question-to-objective mapping, and Nutanix Bible references.
/// Data sourced from official Nutanix exam blueprint PDFs.
/// </summary>
public class HardcodedBlueprintService : IBlueprintService
{
    private static readonly Dictionary<string, ExamBlueprint> _blueprints = new(StringComparer.OrdinalIgnoreCase);
    private static readonly object _initLock = new();
    private static bool _initialized;

    public HardcodedBlueprintService()
    {
        lock (_initLock)
        {
            if (_initialized) return;
            InitNcpAi();
            InitNcpUs();
            InitNcpCi();
            InitNcmMci();
            // No InitNca75: the beta block is gone. See the retired-block note
            // at the foot of this file (S48-02 / T-32, REQ-NCA-05).
            _initialized = true;
        }
    }

    public ExamBlueprint? GetBlueprint(string examCode)
    {
        // Normalize exam code
        var key = examCode.Replace(" ", "").ToUpperInvariant();
        // Order matters: "NCM-MCI" contains "CI" — the MCI/NCM check must come
        // BEFORE the bare-CI check or NCM-MCI silently routed to the NCP-CI
        // blueprint (shipped bug; invisible to the old non-null-only test).
        if (key.Contains("MCI") || key.Contains("MCM") || key.Contains("NCM")) return _blueprints.GetValueOrDefault("NCM-MCI");
        if (key.Contains("AI")) return _blueprints.GetValueOrDefault("NCP-AI");
        if (key.Contains("US")) return _blueprints.GetValueOrDefault("NCP-US");
        if (key.Contains("CI")) return _blueprints.GetValueOrDefault("NCP-CI");
        // NCA-75 has no hardcoded entry any more (S48-02 / T-32): it falls
        // through to the dictionary lookup below, finds nothing, and returns
        // null. ManifestBlueprintService serves it from the manifest instead.
        return _blueprints.GetValueOrDefault(examCode);
    }

    /// <summary>
    /// Calculates how many questions map to each objective using keyword matching.
    /// Returns dict of objectiveId → question count.
    /// </summary>
    public Dictionary<string, int> CalculateCoverage(string examCode, List<string> questionTexts)
    {
        var bp = GetBlueprint(examCode);
        if (bp == null) return new();

        var coverage = new Dictionary<string, int>();
        foreach (var section in bp.Sections)
            foreach (var obj in section.Objectives)
            {
                int count = 0;
                foreach (var q in questionTexts)
                {
                    if (obj.Keywords.Any(kw => q.Contains(kw, StringComparison.OrdinalIgnoreCase)))
                        count++;
                }
                coverage[obj.Id] = count;
            }
        return coverage;
    }

    /// <summary>
    /// Gets the blueprint objectives that match a specific question.
    /// </summary>
    public List<(string ObjId, string ObjTitle)> GetObjectivesForQuestion(string examCode, string questionText)
    {
        var bp = GetBlueprint(examCode);
        if (bp == null) return new();

        var matches = new List<(string, string)>();
        foreach (var section in bp.Sections)
            foreach (var obj in section.Objectives)
            {
                if (obj.Keywords.Any(kw => questionText.Contains(kw, StringComparison.OrdinalIgnoreCase)))
                    matches.Add((obj.Id, obj.Title));
            }
        return matches;
    }

    /// <summary>
    /// Gets relevant Nutanix Bible section names for an exam.
    /// </summary>
    public List<(string Section, string Description)> GetBibleSections(string examCode)
    {
        var key = examCode.Replace(" ", "").ToUpperInvariant();

        if (key.Contains("AI")) return new()
        {
            ("Kubernetes & NKP", "NKP architecture, Kubernetes on Nutanix, GPU passthrough"),
            ("Prism Central", "Central management, RBAC, projects"),
            ("Security", "Certificates, TLS, RBAC, API key management"),
            ("Nutanix Volumes (CSI)", "Persistent storage via CSI driver"),
        };

        if (key.Contains("US")) return new()
        {
            ("Nutanix Files", "Distributed file services, FSVMs, SMB/NFS"),
            ("Nutanix Objects", "S3-compatible object storage, buckets, WORM"),
            ("Nutanix Volumes", "Block storage, iSCSI, Volume Groups"),
            ("Data Protection", "Snapshots, replication, Smart DR"),
            ("Data Lens", "SaaS analytics for Files and Objects"),
        };

        if (key.Contains("CI")) return new()
        {
            ("NC2 on AWS", "i3.metal, Direct Connect, VPC networking"),
            ("NC2 on Azure", "BareMetal, ExpressRoute, Flow Gateway"),
            ("Networking", "VPN, BGP, overlay networks, Flow"),
            ("Prism Central", "Management, monitoring, Leap DR"),
            ("Data Protection", "Leap, async/sync replication, recovery plans"),
        };

        if (key.Contains("MCI") || key.Contains("NCM")) return new()
        {
            ("DSF Internals", "Stargate, Curator, OpLog, Extent Store, MapReduce"),
            ("Prism Central", "Analysis, reports, alerts, X-Play, Runway"),
            ("Security", "Flow, SCMA, AIDE, lockdown, encryption, RBAC"),
            ("Networking", "AHV networking, VPCs, Flow Network Security"),
            ("Data Protection", "Protection domains, Leap, Metro, recovery plans"),
            ("APIs", "v3 REST API, CRUD operations, automation"),
            ("Storage", "Containers, RF, compression, dedup, erasure coding"),
            ("CLI Commands", "ncli, acli, nuclei, logbay, NCC"),
        };

        if ((key.Contains("NCA") || key == "NCA") && (key.Contains("75") || key.Length <= 3)) return new()
        {
            ("Lifecycle Management (LCM)", "LCM components, upgrade workflow, dark site mode"),
            ("Prism Element & Prism Central", "Cluster management, user roles, authentication"),
            ("AHV Networking", "VLANs, bonds, IPAM, bridge configuration"),
            ("Storage Containers & Policies", "Containers, RF, compression, dedup, EC-X"),
            ("NCC & Health Monitoring", "NCC checks, alerts, events, Pulse, log collection"),
            ("AOS 7.5 New Features", "AES, VM Startup Policies, vTPM, Elastic VM Storage"),
            ("CLI Tools", "nCLI, aCLI, command reference"),
        };

        return new();
    }

    // ========== NCP-AI 6.10 ==========
    private static void InitNcpAi()
    {
        var bp = new ExamBlueprint
        {
            ExamCode = "NCP-AI",
            ExamTitle = "Nutanix Certified Professional – Artificial Intelligence",
            QuestionCount = 75,
            TimeLimitMinutes = 120,
            PassingScore = "3000/6000",
            Sections = new()
            {
                new BlueprintSection
                {
                    ExamCode = "NCP-AI", SectionNumber = 1,
                    SectionTitle = "Deploy a Nutanix Enterprise AI Environment",
                    Objectives = new()
                    {
                        new() { Id = "1.1", Title = "Validate installation prerequisites",
                            Knowledge = new() { "Prerequisites", "Limitations", "Install procedure", "Core components" },
                            Keywords = new() { "prerequisite", "GPU", "NKP", "install", "deploy", "NAI", "GPT-in-a-Box", "VRAM", "passthrough", "Operator", "API Gateway" } },
                        new() { Id = "1.2", Title = "Install NAI components",
                            Knowledge = new() { "NKP vs non-NKP install", "Version compatibility", "Dark site", "Storage classes" },
                            Keywords = new() { "NKP", "kubectl", "air-gap", "dark site", "CSI", "StorageClass", "PVC", "GPU Operator", "device plugin" } },
                        new() { Id = "1.3", Title = "Configure DNS, URL, and certificates",
                            Knowledge = new() { "FQDN", "TLS certificates", "Validate login" },
                            Keywords = new() { "FQDN", "DNS", "certificate", "TLS", "ingress", "self-signed", "cert-manager" } },
                    }
                },
                new BlueprintSection
                {
                    ExamCode = "NCP-AI", SectionNumber = 2,
                    SectionTitle = "Configure a Nutanix Enterprise AI Environment",
                    Objectives = new()
                    {
                        new() { Id = "2.1", Title = "Onboard users to NAI",
                            Knowledge = new() { "User vs admin roles", "User management", "RBAC" },
                            Keywords = new() { "user", "admin", "role", "RBAC", "project", "multi-tenant", "onboard" } },
                        new() { Id = "2.2", Title = "Import Large Language Models",
                            Knowledge = new() { "Import methods", "Repo keys", "Manual import" },
                            Keywords = new() { "HuggingFace", "NGC", "import", "model", "SafeTensors", "GGUF", "ONNX", "air-gap", "token" } },
                        new() { Id = "2.3", Title = "Create endpoints",
                            Knowledge = new() { "Model selection", "GPU sizing", "Instance scaling", "Inference engine" },
                            Keywords = new() { "endpoint", "vLLM", "TensorRT", "GPU", "replica", "auto-scal", "inference", "A100", "H100", "L40S", "quantiz" } },
                        new() { Id = "2.4", Title = "Create and apply API keys",
                            Knowledge = new() { "Generate keys", "View keys", "Deactivate", "Add to endpoint" },
                            Keywords = new() { "API key", "revoke", "rotate", "deactivate", "Bearer" } },
                        new() { Id = "2.5", Title = "Deliver endpoints to consumer",
                            Knowledge = new() { "Endpoint URI", "Tool calling", "curl commands" },
                            Keywords = new() { "completions", "chat", "curl", "base_url", "tool_call", "function" } },
                    }
                },
                new BlueprintSection
                {
                    ExamCode = "NCP-AI", SectionNumber = 3,
                    SectionTitle = "Perform Day 2 Operations",
                    Objectives = new()
                    {
                        new() { Id = "3.1", Title = "Prepare requirements for connecting apps",
                            Knowledge = new() { "Sample request", "OpenAI-compliant config", "Endpoint types" },
                            Keywords = new() { "sample", "OpenAI", "v1/chat", "v1/completions", "v1/embeddings", "temperature", "max_tokens" } },
                        new() { Id = "3.2", Title = "Interpret performance and optimize",
                            Knowledge = new() { "Observability metrics", "Resource allocation" },
                            Keywords = new() { "TTFT", "throughput", "latency", "batch size", "PagedAttention", "KV cache", "HPA", "queue depth" } },
                        new() { Id = "3.3", Title = "Monitor access activity for outlier detection",
                            Knowledge = new() { "Top 5 API keys", "Endpoint dashboard", "Deactivate keys", "Audit events" },
                            Keywords = new() { "audit", "outlier", "anomal", "dashboard", "Top 5", "usage spike" } },
                        new() { Id = "3.4", Title = "Select appropriate LLM for output quality",
                            Knowledge = new() { "Prompt evaluation", "Quality techniques", "Guardrails", "Rerank models" },
                            Keywords = new() { "LoRA", "fine-tun", "rerank", "guardrail", "RAG", "chunking", "temperature" } },
                    }
                },
                new BlueprintSection
                {
                    ExamCode = "NCP-AI", SectionNumber = 4,
                    SectionTitle = "Troubleshoot a Nutanix Enterprise AI Environment",
                    Objectives = new()
                    {
                        new() { Id = "4.1", Title = "Troubleshoot performance and resource utilization",
                            Knowledge = new() { "Infrastructure metrics", "GPU filtering", "GPU type", "CPU fallback" },
                            Keywords = new() { "nvidia-smi", "GPU util", "Prism Central", "node selector", "CPU fallback", "CUDA" } },
                        new() { Id = "4.2", Title = "Remediate health check failures",
                            Knowledge = new() { "Cluster health", "Component failures", "K8s resources", "Stack layer", "Course of action" },
                            Keywords = new() { "NotReady", "CrashLoopBackOff", "ImagePullBackOff", "kubectl", "health check", "readiness probe" } },
                        new() { Id = "4.3", Title = "Troubleshoot model import and endpoint creation",
                            Knowledge = new() { "Download failures", "CSI driver", "EULA", "Token", "Scheduling", "Prerequisites", "Container images" },
                            Keywords = new() { "model import", "download fail", "Insufficient", "Pending", "scheduling", "imagePullSecret" } },
                    }
                },
                new BlueprintSection
                {
                    ExamCode = "NCP-AI", SectionNumber = 5,
                    SectionTitle = "Connect Applications to NAI",
                    Objectives = new()
                    {
                        new() { Id = "5.1", Title = "Configure and validate application with endpoint",
                            Knowledge = new() { "Model vs endpoint types", "Test endpoint", "Validate response" },
                            Keywords = new() { "application", "connect", "validate", "response", "200", "streaming" } },
                        new() { Id = "5.2", Title = "Configure RAG architecture",
                            Knowledge = new() { "RAG pipeline", "Vector DB", "Embeddings", "Context window" },
                            Keywords = new() { "RAG", "vector", "embedding", "retriev", "context window", "chunk" } },
                    }
                },
            }
        };
        _blueprints["NCP-AI"] = bp;
    }

    // ========== NCP-US 6.10 ==========
    private static void InitNcpUs()
    {
        var bp = new ExamBlueprint
        {
            ExamCode = "NCP-US",
            ExamTitle = "Nutanix Certified Professional – Unified Storage",
            QuestionCount = 75,
            TimeLimitMinutes = 120,
            PassingScore = "3000/6000",
            Sections = new()
            {
                new BlueprintSection
                {
                    ExamCode = "NCP-US", SectionNumber = 1,
                    SectionTitle = "Configure and Manage Nutanix Files",
                    Objectives = new()
                    {
                        new() { Id = "1.1", Title = "Deploy and configure Nutanix Files",
                            Knowledge = new() { "FSVM sizing", "File server creation", "DNS/AD", "Network config" },
                            Keywords = new() { "FSVM", "File Server", "Files", "SMB", "NFS", "DNS", "Active Directory", "3 FSVM", "minerva" } },
                        new() { Id = "1.2", Title = "Create and manage shares",
                            Knowledge = new() { "Share types", "Permissions", "Multi-protocol", "Distributed shares" },
                            Keywords = new() { "share", "SMB share", "NFS export", "permission", "distributed", "standard", "multi-protocol", "mixed mode" } },
                        new() { Id = "1.3", Title = "Configure Files data protection",
                            Knowledge = new() { "Snapshots", "Smart DR", "Replication", "Failover" },
                            Keywords = new() { "snapshot", "Smart DR", "replicat", "failover", "failback", "RPO", "file server" } },
                        new() { Id = "1.4", Title = "Configure Files tiering and optimization",
                            Knowledge = new() { "Smart Tiering", "Standard Tiering", "Advanced Tiering" },
                            Keywords = new() { "tier", "Smart Tier", "cold data", "capacity tier", "performance tier" } },
                        new() { Id = "1.5", Title = "Monitor Files with Data Lens",
                            Knowledge = new() { "Data Lens", "File Analytics", "Audit", "Anomaly detection" },
                            Keywords = new() { "Data Lens", "File Analytics", "audit", "anomal", "ransomware", "analytics" } },
                    }
                },
                new BlueprintSection
                {
                    ExamCode = "NCP-US", SectionNumber = 2,
                    SectionTitle = "Configure and Manage Nutanix Objects",
                    Objectives = new()
                    {
                        new() { Id = "2.1", Title = "Deploy and configure Nutanix Objects",
                            Knowledge = new() { "Object store", "Workers", "MSP", "Networking" },
                            Keywords = new() { "Object", "object store", "worker", "MSP", "S3", "bucket", "endpoint" } },
                        new() { Id = "2.2", Title = "Manage buckets and access",
                            Knowledge = new() { "Bucket policies", "IAM", "Access keys", "Versioning" },
                            Keywords = new() { "bucket", "IAM", "access key", "policy", "versioning", "lifecycle" } },
                        new() { Id = "2.3", Title = "Configure WORM and compliance",
                            Knowledge = new() { "WORM", "Object Lock", "Legal hold", "Retention" },
                            Keywords = new() { "WORM", "immutab", "Object Lock", "retention", "legal hold", "compliance" } },
                        new() { Id = "2.4", Title = "Configure Objects data protection",
                            Knowledge = new() { "Replication", "Federation", "Mine", "Namespaces" },
                            Keywords = new() { "replicat", "federation", "Mine", "namespace", "cross-site", "backup" } },
                        new() { Id = "2.5", Title = "Monitor Objects with Data Lens",
                            Knowledge = new() { "Data Lens for Objects", "Usage analytics" },
                            Keywords = new() { "Data Lens", "Object", "usage", "analytics", "dashboard" } },
                    }
                },
                new BlueprintSection
                {
                    ExamCode = "NCP-US", SectionNumber = 3,
                    SectionTitle = "Configure and Manage Nutanix Volumes",
                    Objectives = new()
                    {
                        new() { Id = "3.1", Title = "Deploy and configure Volume Groups",
                            Knowledge = new() { "Volume Groups", "iSCSI", "Targets", "LUNs" },
                            Keywords = new() { "Volume Group", "iSCSI", "target", "LUN", "initiator", "3260", "CHAP" } },
                        new() { Id = "3.2", Title = "Configure Volumes for external access",
                            Knowledge = new() { "External clients", "Multipathing", "Load balancing" },
                            Keywords = new() { "external", "client", "multipath", "load balanc", "MPIO", "iSCSI client" } },
                        new() { Id = "3.3", Title = "Manage Volumes data protection",
                            Knowledge = new() { "VG snapshots", "Cloning", "Replication" },
                            Keywords = new() { "snapshot", "clone", "replicat", "Volume Group", "consistency group" } },
                    }
                },
                new BlueprintSection
                {
                    ExamCode = "NCP-US", SectionNumber = 4,
                    SectionTitle = "Troubleshoot Unified Storage",
                    Objectives = new()
                    {
                        new() { Id = "4.1", Title = "Troubleshoot Files issues",
                            Knowledge = new() { "FSVM health", "Share access", "Performance", "DR issues" },
                            Keywords = new() { "troubleshoot", "FSVM", "share access", "permission denied", "minerva_nvm", "Smart DR" } },
                        new() { Id = "4.2", Title = "Troubleshoot Objects issues",
                            Knowledge = new() { "Object store health", "S3 API errors", "Performance" },
                            Keywords = new() { "troubleshoot", "Object", "S3", "403", "NoSuchBucket", "worker" } },
                        new() { Id = "4.3", Title = "Troubleshoot Volumes issues",
                            Knowledge = new() { "iSCSI connectivity", "Multipathing", "Performance" },
                            Keywords = new() { "troubleshoot", "iSCSI", "Volume Group", "path", "timeout", "initiator" } },
                    }
                },
            }
        };
        _blueprints["NCP-US"] = bp;
    }

    // ========== NCP-CI 6.10 ==========
    private static void InitNcpCi()
    {
        var bp = new ExamBlueprint
        {
            ExamCode = "NCP-CI",
            ExamTitle = "Nutanix Certified Professional – Cloud Integration",
            QuestionCount = 75,
            TimeLimitMinutes = 120,
            PassingScore = "3000/6000",
            Sections = new()
            {
                new BlueprintSection
                {
                    ExamCode = "NCP-CI", SectionNumber = 1,
                    SectionTitle = "Planning Deployment",
                    Objectives = new()
                    {
                        new() { Id = "1.1", Title = "Prepare the cloud environment",
                            Knowledge = new() { "Cloud provider", "Region", "Account", "Node type", "Tenancy" },
                            Keywords = new() { "AWS", "Azure", "region", "i3.metal", "i3en.metal", "BareMetal", "IAM", "service principal", "Resource Provider" } },
                        new() { Id = "1.2", Title = "Subscribe to NC2 service",
                            Knowledge = new() { "my.nutanix.com", "RBAC", "Subscription plans" },
                            Keywords = new() { "my.nutanix.com", "subscription", "PAYG", "license", "NC2 Console" } },
                        new() { Id = "1.3", Title = "Determine implementation requirements",
                            Knowledge = new() { "Redundancy", "Use cases", "Compatibility", "Integrations" },
                            Keywords = new() { "RF2", "redundancy", "compatibility", "hibernat", "Calm", "NKE" } },
                        new() { Id = "1.4", Title = "Identify networking requirements",
                            Knowledge = new() { "VPN", "Direct Connect", "ExpressRoute", "SDWAN", "CIDR" },
                            Keywords = new() { "VPN", "Direct Connect", "ExpressRoute", "BGP", "CIDR", "/25", "delegated subnet", "Megaport", "SDWAN", "VPC Endpoint" } },
                    }
                },
                new BlueprintSection
                {
                    ExamCode = "NCP-CI", SectionNumber = 2,
                    SectionTitle = "Deploying the Environment",
                    Objectives = new()
                    {
                        new() { Id = "2.1", Title = "Deploy the cloud cluster",
                            Knowledge = new() { "Cluster sizing", "Deployment types", "PC topology", "Flow Gateway" },
                            Keywords = new() { "deploy", "cluster", "node", "Prism Central", "Flow Gateway", "ECMP", "Route Server", "L2 stretch", "Floating IP" } },
                        new() { Id = "2.2", Title = "Configure cluster networking",
                            Knowledge = new() { "VPC peering", "Transit Gateway", "Route tables", "NSG" },
                            Keywords = new() { "VPC peering", "Transit Gateway", "route table", "NSG", "Security Group", "subnet" } },
                        new() { Id = "2.3", Title = "Configure workloads on NC2",
                            Knowledge = new() { "VM migration", "Categories", "Hibernation" },
                            Keywords = new() { "migrate", "category", "hibernat", "pause", "workload" } },
                        new() { Id = "2.4", Title = "Manage cluster lifecycle",
                            Knowledge = new() { "Scale", "Upgrade", "Node add/remove" },
                            Keywords = new() { "scale", "upgrade", "node add", "node remove", "expand", "lifecycle" } },
                    }
                },
                new BlueprintSection
                {
                    ExamCode = "NCP-CI", SectionNumber = 3,
                    SectionTitle = "Day 2 Operations & Data Protection",
                    Objectives = new()
                    {
                        new() { Id = "3.1", Title = "Monitor and manage NC2 clusters",
                            Knowledge = new() { "Alerts", "Syslog", "Datadog", "SMTP" },
                            Keywords = new() { "alert", "syslog", "Datadog", "SMTP", "monitor", "CloudWatch", "Azure Monitor" } },
                        new() { Id = "3.2", Title = "Configure data protection",
                            Knowledge = new() { "Leap", "DR", "Backup", "Cluster Protect" },
                            Keywords = new() { "Leap", "DR", "recovery plan", "backup", "Cluster Protect", "async", "sync", "replicat" } },
                        new() { Id = "3.3", Title = "Troubleshoot NC2 issues",
                            Knowledge = new() { "Networking", "Connectivity", "Performance" },
                            Keywords = new() { "troubleshoot", "connectivity", "delegated subnet", "NSG", "Flow Gateway", "latency" } },
                    }
                },
            }
        };
        _blueprints["NCP-CI"] = bp;
    }

    // ========== NCM-MCI 6.10 ==========
    private static void InitNcmMci()
    {
        var bp = new ExamBlueprint
        {
            ExamCode = "NCM-MCI",
            ExamTitle = "Nutanix Certified Master – Multicloud Infrastructure",
            QuestionCount = 17,
            TimeLimitMinutes = 180,
            PassingScore = "3000/6000 (Live Lab)",
            Sections = new()
            {
                new BlueprintSection
                {
                    ExamCode = "NCM-MCI", SectionNumber = 1,
                    SectionTitle = "Monitoring & Troubleshooting",
                    Objectives = new()
                    {
                        new() { Id = "1.1", Title = "Use Prism Analysis Tools to Identify Performance Issues",
                            Knowledge = new() { "Performance graphs", "Correlate events", "Create analysis graphs", "Resource constraints", "MSSQL Instance Details" },
                            Keywords = new() { "analysis", "performance graph", "anomal", "MSSQL", "SQL Server", "CPU", "latency", "metric", "entity chart" } },
                        new() { Id = "1.2", Title = "Perform Health Check and Collect Logs",
                            Knowledge = new() { "Prism log collection", "CLI log gathering", "Audit logs", "NCC checks", "Cluster config" },
                            Keywords = new() { "logbay", "NCC", "health check", "audit", "log collect", "allssh", "zeus_config", "cluster status" } },
                        new() { Id = "1.3", Title = "Interpret Alerts and Take Appropriate Actions",
                            Knowledge = new() { "Root cause analysis", "KB article resolution" },
                            Keywords = new() { "alert", "root cause", "KB", "knowledge base", "remediat" } },
                        new() { Id = "1.4", Title = "Create Reports and Custom Metrics",
                            Knowledge = new() { "Entity/metric selection", "Custom alerts", "Report creation", "Report evaluation" },
                            Keywords = new() { "report", "custom alert", "threshold", "schedule", "dashboard", "metric" } },
                    }
                },
                new BlueprintSection
                {
                    ExamCode = "NCM-MCI", SectionNumber = 2,
                    SectionTitle = "Optimize & Scale",
                    Objectives = new()
                    {
                        new() { Id = "2.1", Title = "Utilize Runway Scenario for Workload Changes",
                            Knowledge = new() { "Planning Dashboard", "Greenfield sizing", "Cluster expansion" },
                            Keywords = new() { "Runway", "planning", "capacity", "sizing", "greenfield", "expansion", "forecast" } },
                        new() { Id = "2.2", Title = "Implement Workload-Based Best Practices",
                            Knowledge = new() { "BPG documents", "EUC/vGPU config", "SQL Server BPG", "Container settings" },
                            Keywords = new() { "BPG", "best practice", "vGPU", "EUC", "VDI", "SQL Server", "Technote", "workload" } },
                        new() { Id = "2.3", Title = "Utilize APIs for Management Tasks",
                            Knowledge = new() { "CRUD operations", "API data gathering" },
                            Keywords = new() { "API", "v3", "REST", "CRUD", "POST", "GET", "filter", "pagination", "nuclei" } },
                        new() { Id = "2.4", Title = "Cluster Resiliency and X-Play",
                            Knowledge = new() { "Cluster policies", "Resiliency", "Rebuild Capacity", "X-Play REST API" },
                            Keywords = new() { "resiliency", "Rebuild Capacity", "X-Play", "playbook", "REST", "node awareness", "block awareness" } },
                        new() { Id = "2.5", Title = "Create/Configure VMs for Workloads",
                            Knowledge = new() { "Advanced VM settings", "High-intensity workloads", "Storage config", "X-Play monitoring" },
                            Keywords = new() { "VM", "NUMA", "vCPU", "memory", "SCSI", "virtio", "vNIC", "affinity" } },
                    }
                },
                new BlueprintSection
                {
                    ExamCode = "NCM-MCI", SectionNumber = 3,
                    SectionTitle = "Security",
                    Objectives = new()
                    {
                        new() { Id = "3.1", Title = "Advanced Cluster Security and Hardening",
                            Knowledge = new() { "SCMA", "AIDE", "Hardening", "RBAC", "Lockdown", "Network segmentation" },
                            Keywords = new() { "SCMA", "AIDE", "STIG", "lockdown", "SSH", "harden", "security", "RBAC", "custom role", "segmentation" } },
                        new() { Id = "3.2", Title = "Flow Virtual Networking and Security",
                            Knowledge = new() { "VPCs", "Gateways", "Multi-tenancy", "App policies", "VDI policies" },
                            Keywords = new() { "Flow", "VPC", "microseg", "security policy", "VDI policy", "isolation", "quarantine", "overlay" } },
                        new() { Id = "3.3", Title = "Configure SYSLOG for Log Management",
                            Knowledge = new() { "Remote syslog", "Per-module export", "Troubleshoot syslog" },
                            Keywords = new() { "syslog", "SIEM", "remote log", "severity", "module", "UDP", "TCP", "TLS" } },
                        new() { Id = "3.4", Title = "Implement Authentication Best Practices",
                            Knowledge = new() { "Certificates", "AD/SAML/Local auth", "Custom roles", "Account management" },
                            Keywords = new() { "certificate", "CA", "Active Directory", "SAML", "SSO", "IDP", "LDAP", "password", "account" } },
                        new() { Id = "3.5", Title = "Implement Encryption Including KMS",
                            Knowledge = new() { "Data-at-Rest", "Data-in-Transit", "VM-specific encryption" },
                            Keywords = new() { "encrypt", "KMS", "Data-at-Rest", "Data-in-Transit", "storage policy", "key management" } },
                    }
                },
                new BlueprintSection
                {
                    ExamCode = "NCM-MCI", SectionNumber = 4,
                    SectionTitle = "Design & Architecture",
                    Objectives = new()
                    {
                        new() { Id = "4.1", Title = "Configure Products and Features for Business Needs",
                            Knowledge = new() { "RF1 containers", "Load-Balanced Volume Groups", "Storage efficiency" },
                            Keywords = new() { "RF1", "RF=1", "Load-Balanced", "Volume Group", "compression", "dedup", "erasure coding", "storage efficiency" } },
                        new() { Id = "4.2", Title = "Align Configuration to NVD",
                            Knowledge = new() { "VLAN validation", "CVM resources", "CPU oversubscription", "HA validation" },
                            Keywords = new() { "NVD", "validated design", "VLAN", "CVM", "oversubscription", "HA", "admission control" } },
                    }
                },
                new BlueprintSection
                {
                    ExamCode = "NCM-MCI", SectionNumber = 5,
                    SectionTitle = "Business Continuity",
                    Objectives = new()
                    {
                        new() { Id = "5.1", Title = "Create Protection Policies Based on RPO/RTO",
                            Knowledge = new() { "Protection mechanisms", "Troubleshoot PD/PP", "Auto target assignment" },
                            Keywords = new() { "protection", "RPO", "RTO", "protection domain", "protection policy", "NearSync", "Metro", "async", "sync" } },
                        new() { Id = "5.2", Title = "Create Recovery Plans for Applications",
                            Knowledge = new() { "Recovery plan creation", "Scripts", "Stages", "Network/IP mapping", "Async to sync conversion" },
                            Keywords = new() { "recovery plan", "failover", "failback", "stage", "boot group", "network mapping", "IP mapping", "script" } },
                        new() { Id = "5.3", Title = "Execute DR Including Troubleshooting",
                            Knowledge = new() { "RP test errors", "VM IP issues", "RP failure", "Metro AHV troubleshooting" },
                            Keywords = new() { "DR", "disaster recovery", "test failover", "Metro", "witness", "split-brain", "VM network not found" } },
                    }
                },
            }
        };
        _blueprints["NCM-MCI"] = bp;
    }

    // ========== NCA 7.5 — RETIRED (S48-02 / T-32, REQ-NCA-05) ==========
    //
    // The beta NCA-75 blueprint that used to live here is deleted, not merely
    // superseded. It described four sections — "Describe Lifecycle Management",
    // "Describe Nutanix Basic Administration", "Maintain Environmental Health",
    // "Describe Cluster Configuration Options" — weighted 20/30/25/25 across 17
    // objectives. The June 15, 2026 guide publishes four different sections and
    // 14 objectives, and a learner who saw a beta title was studying a
    // superseded structure.
    //
    // NCA-75's blueprint is now content/exams/NCA-75/exam.json, served by
    // ManifestBlueprintService (REQ-MAN-04). Deleting rather than annotating is
    // deliberate: an annotated-but-live block still renders beta section titles
    // in every code path where the manifest is not loaded, and REQ-NCA-05
    // requires that the beta section titles never render. GetBlueprint("NCA-75")
    // therefore returns null from this service by design — the regression that
    // would re-introduce it is pinned by ManifestBlueprintTests.
}
