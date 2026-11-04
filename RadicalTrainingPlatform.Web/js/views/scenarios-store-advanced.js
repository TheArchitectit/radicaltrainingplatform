/**
 * Store-based scenarios — storage, analytics, cloud and AI operations.
 *
 * The Sprint 13 set: Files replication, Objects, Volumes, File Analytics, NC2
 * migration/monitoring/scaling, NAI models/monitoring/GPU, PE capacity and
 * PC insights.
 */
import { met, unmet, observation, ranCli } from './scenarios-shared.js';

export const STORE_ADVANCED_SCENARIOS = [
    // Sprint 13 — NCP-US scenarios (4)
    {
        id: 'us-repl-01', exam: 'NCP-US', title: 'Configure File Server Replication',
        fixtureSeed: 545274295,
        difficulty: 'Intermediate', time: '10 min',
        description: 'Set up a Files share and configure replication to a remote site for disaster recovery.',
        objectives: [
            {
                id: 'obj-1', text: 'Create a Files share named "Lab-Shared"',
                validate: (s) => {
                    const ok = s.getAll('file_shares').some(sh => sh.name === 'Lab-Shared');
                    return ok ? met() : unmet('no file share named Lab-Shared exists');
                },
            },
            {
                // Old predicate was file_shares.length > 0 — seed ships 3 shares,
                // so it auto-passed. Require the named share plus the visit (T-14).
                id: 'obj-2', text: 'Navigate to Files view and verify the share appears',
                observation: true,
                validate: (s, t) => observation(t, '/pc/files', 'us-repl-01', 'obj-2', {
                    what: 'the Files view',
                    also: () => s.getAll('file_shares').some(sh => sh.name === 'Lab-Shared')
                        ? met() : unmet('Lab-Shared is not visible in the Files view'),
                }),
            },
        ],
        hints: ['Navigate to PC → Files', 'Click "+ Create Share"', 'Set name to "Lab-Shared" and select a protocol'],
        context: 'pc', startRoute: '/pc/files',
    },
    {
        id: 'us-bucket-01', exam: 'NCP-US', title: 'Create an Object Store Bucket',
        fixtureSeed: 915177250,
        difficulty: 'Beginner', time: '8 min',
        description: 'Create a new bucket in Objects with versioning and a lifecycle policy.',
        objectives: [
            {
                // T-14 repair, choice = "corrected to real UI mutation paths".
                // The old predicate read state.getAll('buckets') — a collection
                // that does not exist (the store is object_buckets). The Objects
                // wizard already writes name, versioning and
                // lifecycle: { days, action }, so the objective is achievable
                // through the real UI path once the collection is fixed and the
                // objective matches the description (versioning + lifecycle).
                id: 'obj-1', text: 'Create a bucket named "lab-backups" with versioning and a lifecycle policy',
                validate: (s) => {
                    const ok = s.getAll('object_buckets').some(b =>
                        b.name === 'lab-backups' && b.versioning && b.lifecycle && b.lifecycle.days > 0);
                    return ok ? met() : unmet('no bucket named lab-backups with versioning and a lifecycle policy exists');
                },
            },
        ],
        hints: ['Navigate to PC → Objects', 'Click "+ Create Bucket"', 'Enable versioning and set a lifecycle retention window'],
        context: 'pc', startRoute: '/pc/objects',
    },
    {
        id: 'us-vol-01', exam: 'NCP-US', title: 'Volumes — iSCSI Target Migration',
        fixtureSeed: 338426179,
        difficulty: 'Advanced', time: '12 min',
        description: 'Create a Volume Group for iSCSI storage and attach it to a VM client.',
        objectives: [
            {
                id: 'obj-1', text: 'Create a Volume Group named "Lab-VG"',
                validate: (s) => {
                    const ok = s.getAll('volume_groups').some(v => v.name === 'Lab-VG');
                    return ok ? met() : unmet('no volume group named Lab-VG exists');
                },
            },
        ],
        hints: ['Navigate to PC → Volumes', 'Click "+ Create Volume Group"', 'Add a disk and configure an iSCSI initiator IQN'],
        context: 'pc', startRoute: '/pc/volumes',
    },
    {
        id: 'us-analytics-01', exam: 'NCP-US', title: 'File Analytics — Audit Trail',
        fixtureSeed: 166848784,
        difficulty: 'Intermediate', time: '8 min',
        description: 'Use File Analytics to review access patterns and audit file operations.',
        objectives: [
            {
                id: 'obj-1', text: 'Navigate to File Analytics and review dashboard',
                observation: true,
                validate: (s, t) => observation(t, '/pc/analytics', 'us-analytics-01', 'obj-1', { what: 'the File Analytics dashboard' }),
            },
        ],
        hints: ['Navigate to PC → File Analytics', 'Review the capacity trends and top users'],
        context: 'pc', startRoute: '/pc/analytics',
    },
    // Sprint 13 — NCP-CI scenarios (3)
    {
        id: 'ci-migrate-01', exam: 'NCP-CI', title: 'NC2 — Deploy Cloud Cluster',
        fixtureSeed: 1657861807,
        difficulty: 'Advanced', time: '15 min',
        description: 'Deploy a Nutanix Cloud Cluster on AWS and verify connectivity.',
        objectives: [
            {
                id: 'obj-1', text: 'Navigate to NC2 Deploy and review deployment options',
                observation: true,
                validate: (s, t) => observation(t, '/pc/nc2-deploy', 'ci-migrate-01', 'obj-1', { what: 'the NC2 Deploy page' }),
            },
            {
                id: 'obj-2', text: 'Check NC2 Monitoring for cluster health',
                observation: true,
                validate: (s, t) => observation(t, '/pc/nc2-monitoring', 'ci-migrate-01', 'obj-2', { what: 'the NC2 Monitoring page' }),
            },
        ],
        hints: ['Navigate to NC2 → Deploy Cluster', 'Review cloud provider options', 'Check monitoring dashboards'],
        context: 'pc', startRoute: '/pc/nc2-deploy',
    },
    {
        id: 'ci-monitor-01', exam: 'NCP-CI', title: 'NC2 Monitoring & Cost Comparison',
        fixtureSeed: 543742474,
        difficulty: 'Intermediate', time: '10 min',
        description: 'Compare performance and cost metrics between on-prem and cloud clusters.',
        objectives: [
            {
                id: 'obj-1', text: 'View NC2 monitoring metrics for both clusters',
                observation: true,
                validate: (s, t) => observation(t, '/pc/nc2-monitoring', 'ci-monitor-01', 'obj-1', { what: 'the NC2 Monitoring page' }),
            },
            {
                id: 'obj-2', text: 'Review cost estimates on the NC2 monitoring page',
                observation: true,
                validate: (s, t) => observation(t, '/pc/nc2-monitoring', 'ci-monitor-01', 'obj-2', { what: 'the NC2 Monitoring cost estimates' }),
            },
        ],
        hints: ['Navigate to NC2 → Monitoring', 'Compare AWS vs Azure cluster metrics', 'Review hourly cost rates'],
        context: 'pc', startRoute: '/pc/nc2-monitoring',
    },
    {
        id: 'ci-scale-01', exam: 'NCP-CI', title: 'NC2 — Scale a Cloud Cluster',
        fixtureSeed: 3121596862,
        difficulty: 'Advanced', time: '10 min',
        description: 'Scale up an NC2 cluster by adding a node and configure an autoscale policy.',
        objectives: [
            {
                id: 'obj-1', text: 'View the scaling history for NC2 clusters',
                observation: true,
                validate: (s, t) => observation(t, '/pc/nc2-scaling', 'ci-scale-01', 'obj-1', { what: 'the NC2 Scaling page' }),
            },
            {
                id: 'obj-2', text: 'Review autoscale policies',
                observation: true,
                validate: (s, t) => observation(t, '/pc/nc2-scaling', 'ci-scale-01', 'obj-2', { what: 'the autoscale policies' }),
            },
        ],
        hints: ['Navigate to NC2 → Scaling', 'Review scaling history events', 'Check autoscale policy configurations'],
        context: 'pc', startRoute: '/pc/nc2-scaling',
    },
    // Sprint 13 — NCP-AI scenarios (3)
    {
        id: 'ai-model-01', exam: 'NCP-AI', title: 'NAI Model Registry',
        fixtureSeed: 936441421,
        difficulty: 'Intermediate', time: '10 min',
        description: 'Browse the NAI model registry, review available models, and deploy an endpoint.',
        objectives: [
            {
                id: 'obj-1', text: 'Navigate to AI Models and view available models',
                observation: true,
                validate: (s, t) => observation(t, '/pc/ai-models', 'ai-model-01', 'obj-1', { what: 'the AI Models page' }),
            },
            {
                id: 'obj-2', text: 'Check endpoint metrics for deployed models',
                observation: true,
                validate: (s, t) => observation(t, '/pc/ai-monitoring', 'ai-model-01', 'obj-2', { what: 'the AI Monitoring page' }),
            },
        ],
        hints: ['Navigate to AI → Models', 'Review model frameworks and sizes', 'Check deployment status'],
        context: 'pc', startRoute: '/pc/ai-models',
    },
    {
        id: 'ai-monitor-01', exam: 'NCP-AI', title: 'NAI Endpoint Monitoring',
        fixtureSeed: 1681153620,
        difficulty: 'Intermediate', time: '8 min',
        description: 'Monitor NAI inference endpoints — check latency, throughput, GPU utilization, and error rates.',
        objectives: [
            {
                id: 'obj-1', text: 'View endpoint health and metrics',
                observation: true,
                validate: (s, t) => observation(t, '/pc/ai-monitoring', 'ai-monitor-01', 'obj-1', { what: 'the AI Monitoring page' }),
            },
            {
                // Seed already has a degraded endpoint — state alone auto-passed.
                // Require the visit (observation objective, T-14).
                id: 'obj-2', text: 'Identify degraded endpoints',
                observation: true,
                validate: (s, t) => observation(t, '/pc/ai-monitoring', 'ai-monitor-01', 'obj-2', {
                    what: 'the AI Monitoring page',
                    also: () => s.getAll('ai_endpoint_metrics').some(e => e.status === 'degraded')
                        ? met() : unmet('no degraded endpoint is present to identify'),
                }),
            },
        ],
        hints: ['Navigate to AI → Monitoring', 'Look for endpoints with high error rates', 'Check GPU utilization percentages'],
        context: 'pc', startRoute: '/pc/ai-monitoring',
    },
    {
        id: 'ai-gpu-01', exam: 'NCP-AI', title: 'GPU OOM — Right-Size a Model',
        fixtureSeed: 2521834816,
        difficulty: 'Advanced', time: '10 min',
        description: 'Investigate a GPU out-of-memory condition and identify the model that needs quantization or scale-down.',
        objectives: [
            {
                // Seed already has a >90% GPU endpoint — state alone auto-passed.
                // Require the visit (observation objective, T-14).
                id: 'obj-1', text: 'Find the endpoint with >90% GPU utilization',
                observation: true,
                validate: (s, t) => observation(t, '/pc/ai-monitoring', 'ai-gpu-01', 'obj-1', {
                    what: 'the AI Monitoring page',
                    also: () => s.getAll('ai_endpoint_metrics').some(e => e.gpu_util_pct > 90)
                        ? met() : unmet('no endpoint above 90% GPU utilization is present'),
                }),
            },
            {
                id: 'obj-2', text: 'Run nuclei ai.status in CLI to verify',
                validate: (s, t) => ranCli(t, /^nuclei\s+ai\.status\b/) ? met() : unmet('no nuclei ai.status command recorded'),
            },
        ],
        hints: ['Check AI Monitoring for high GPU usage', 'The SDXL image endpoint may be overloaded', 'Use CLI: nuclei ai.status'],
        context: 'pc', startRoute: '/pc/ai-monitoring',
    },
    // Sprint 13 — NCM-MCI scenarios (2)
    {
        id: 'mci-capacity-01', exam: 'NCM-MCI', title: 'PE Capacity Planning & Runway',
        fixtureSeed: 2530324997,
        difficulty: 'Intermediate', time: '10 min',
        description: 'Review PE capacity planning to understand resource runway and identify top consumers.',
        objectives: [
            {
                id: 'obj-1', text: 'Navigate to PE Capacity Planning and review CPU runway',
                observation: true,
                validate: (s, t) => observation(t, '/pe/capacity', 'mci-capacity-01', 'obj-1', { what: 'the PE Capacity Planning page' }),
            },
            {
                id: 'obj-2', text: 'Identify the resource with shortest runway',
                observation: true,
                validate: (s, t) => observation(t, '/pe/capacity', 'mci-capacity-01', 'obj-2', { what: 'the capacity runway' }),
            },
        ],
        hints: ['Navigate to PE → Capacity Planning (hamburger menu)', 'Memory typically has the shortest runway', 'Review the top consumer tables'],
        context: 'pe', startRoute: '/pe/capacity',
    },
    {
        id: 'mci-insights-01', exam: 'NCM-MCI', title: 'PC Insights — Optimization Review',
        fixtureSeed: 3038479938,
        difficulty: 'Intermediate', time: '8 min',
        description: 'Review Prism Central insights for optimization recommendations and anomaly detection.',
        objectives: [
            {
                // Seed already has active insights — state alone auto-passed.
                // Require the visit (observation objective, T-14).
                id: 'obj-1', text: 'Navigate to PC Insights and review active recommendations',
                observation: true,
                validate: (s, t) => observation(t, '/pc/insights', 'mci-insights-01', 'obj-1', {
                    what: 'the PC Insights page',
                    also: () => s.getAll('insights').filter(i => i.status === 'active').length > 0
                        ? met() : unmet('no active insight is present to review'),
                }),
            },
            {
                id: 'obj-2', text: 'Identify critical insights requiring immediate action',
                observation: true,
                validate: (s, t) => observation(t, '/pc/insights', 'mci-insights-01', 'obj-2', {
                    what: 'the PC Insights page',
                    also: () => s.getAll('insights').some(i => i.category === 'critical')
                        ? met() : unmet('no critical insight is present to identify'),
                }),
            },
        ],
        hints: ['Navigate to PC → Insights', 'Look for 🔴 critical items at the top', 'Review optimization suggestions for resource savings'],
        context: 'pc', startRoute: '/pc/insights',
    },
];
