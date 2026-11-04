using RadicalTrainingPlatform.Core.Abstractions;
using RadicalTrainingPlatform.Core.Models;

namespace RadicalTrainingPlatform.Core;

/// <summary>
/// Provides exam blueprint data, question-to-objective mapping, and Nutanix Bible references.
/// Data sourced from official Nutanix exam blueprint PDFs.
/// </summary>
public partial class HardcodedBlueprintService : IBlueprintService
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
