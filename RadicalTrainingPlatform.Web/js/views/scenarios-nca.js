/**
 * NCA 7.5 beginner decision labs and their validators (T-35, REQ-NCA-07).
 *
 * The lab manifests are the contract the validators check against. The
 * entries run in NcaLabView, and each reads the LAST recorded answer so a
 * learner who changes their mind is judged on their final choice.
 */
import { DISCLAIMER, met, unmet } from './scenarios-shared.js';

// ── NCA beginner-set validators (T-35, REQ-NCA-07) ──
//
// Each answer is recorded as a semantic action with stable IDs, and
// re-answering appends a NEW record rather than mutating the old one. These
// read the LAST record for a question, so a learner who changes their mind is
// judged on their final answer — not on having once clicked the right thing by
// accident, and not failed for having clicked a wrong thing first.

function lastRecord(trace, action, match = () => true) {
    const recs = (trace || []).filter(t => t.action === action && match(t));
    return recs.length ? recs[recs.length - 1] : null;
}

function lastToolFor(trace, task) {
    return lastRecord(trace, 'tool-selected', t => t.task === task)?.tool || null;
}

function lastSequence(trace) {
    return lastRecord(trace, 'sequence-order')?.steps || [];
}

function lastTriage(trace) {
    return lastRecord(trace, 'triage-selected')?.step || null;
}

function alertOpened(trace, alertUuid) {
    return (trace || []).some(t => t.action === 'alert-opened' && t.alert === alertUuid);
}

/**
 * The tool list and the task→tool mapping nca-tool-01 validates against
 * (SPEC-07 07.5: "validator checks the selection against the manifest's
 * tool/objective mapping"). This is the manifest.
 */
export const NCA_TOOL_LAB = {
    prompt: 'Pick the tool that fits each job. Only one tool per job is right.',
    tools: [
        { id: 'move', label: 'Nutanix Move' },
        { id: 'ngt', label: 'Nutanix Guest Tools (NGT)' },
        { id: 'foundation', label: 'Foundation' },
        { id: 'witness', label: 'Witness' },
        { id: 'ssr', label: 'Self-Service Restore (SSR)' },
        { id: 'xray', label: 'X-Ray' },
        { id: 'collector', label: 'Collector' },
    ],
    tasks: [
        {
            id: 'task-1', answer: 'move',
            prompt: 'Migrate 40 running VMs off an ageing ESXi cluster onto AHV with the least downtime.',
        },
        {
            id: 'task-2', answer: 'foundation',
            prompt: 'Image twelve new nodes so they can be discovered and join the cluster.',
        },
        {
            id: 'task-3', answer: 'ssr',
            prompt: 'A user needs a folder back that they deleted from a file share, without an admin restore job.',
        },
    ],
};

/**
 * nca-maint-01's ordered sequence. `steps` is the contract — the correct
 * order — and `shuffledOrder` is how the buttons are presented. The shuffled
 * order is a fixed literal, not a runtime shuffle: the presentation must be
 * deterministic across runs, and the validator checks the correct order
 * regardless of how the buttons were laid out.
 */
export const NCA_MAINT_SEQUENCE = {
    prompt: 'Put the node maintenance and upgrade steps in a safe order.',
    steps: [
        { id: 'health-check', label: 'Run cluster health checks and confirm no outstanding faults' },
        { id: 'evacuate-host', label: 'Evacuate the host — live-migrate its VMs to other nodes' },
        { id: 'maintenance-mode', label: 'Enter maintenance mode and service the node' },
        { id: 'lcm-upgrade', label: 'Apply the LCM software and firmware update' },
    ],
    shuffledOrder: ['lcm-upgrade', 'health-check', 'maintenance-mode', 'evacuate-host'],
};

/**
 * nca-alert-01's seeded alert and the next-step choices. The alert itself is
 * already in the simulated cluster (StateEngine `alerts`, uuid alert-001);
 * `detail` is what the learner reads when they open it, and opening it is
 * recorded so "click the right answer without reading" fails (SPEC-07 07.5).
 */
export const NCA_ALERT_LAB = {
    prompt: 'Read the alert, then choose the next step.',
    alertUuid: 'alert-001',
    detail: 'Gold-Container is at 74% of its 12 TB provisioned capacity and still climbing. '
        + 'The cluster is healthy, all four hosts are normal, and no other container is above 60%. '
        + 'The alert is a capacity warning, not a hardware fault — nothing is failing, but the '
        + 'container will run out of room if the trend continues.',
    steps: [
        { id: 'expand-container', label: 'Expand the Gold-Container capacity and re-check usage' },
        { id: 'restart-cvm', label: 'Restart the CVM on the host that raised the alert' },
        { id: 'resolve-now', label: 'Mark the alert resolved and move on to other work' },
        { id: 'vendor-case', label: 'Open a vendor support case straight away' },
    ],
};

// ── NCA 7.5 beginner set (T-35, REQ-NCA-07) ──
// Four deterministic beginner scenarios, one per lesson that names them:
// s1_3 → nca-tool-01, s2_1 → nca-vm-01, s3_2 → nca-maint-01, s4_2 → nca-alert-01.
export const NCA_SCENARIOS = [
    {
        id: 'nca-tool-01', exam: 'NCA-75', title: 'Pick the Right Tool',
        fixtureSeed: 2718281828,
        difficulty: 'Beginner', time: '10 min',
        description: 'Match three real jobs to the Nutanix tool that does them. Powers lesson 1.3.',
        renderer: 'nca-lab',
        lab: { mode: 'tool-select', ...NCA_TOOL_LAB },
        objectives: [
            {
                id: 'obj-1', text: 'Choose Nutanix Move to migrate the ESXi VMs',
                validate: (s, t) => {
                    const got = lastToolFor(t, 'task-1');
                    if (got === NCA_TOOL_LAB.tasks[0].answer) return met();
                    return unmet(got
                        ? `the migration job was assigned to ${got}, not the tool that performs VM migrations`
                        : 'no tool has been chosen for the ESXi migration job');
                },
            },
            {
                id: 'obj-2', text: 'Choose Foundation to image the new nodes',
                validate: (s, t) => {
                    const got = lastToolFor(t, 'task-2');
                    if (got === NCA_TOOL_LAB.tasks[1].answer) return met();
                    return unmet(got
                        ? `the node-imaging job was assigned to ${got}, not the imaging tool`
                        : 'no tool has been chosen for the node-imaging job');
                },
            },
            {
                id: 'obj-3', text: 'Choose Self-Service Restore for the deleted folder',
                validate: (s, t) => {
                    const got = lastToolFor(t, 'task-3');
                    if (got === NCA_TOOL_LAB.tasks[2].answer) return met();
                    return unmet(got
                        ? `the restore job was assigned to ${got}, not the tool that lets a user restore their own files`
                        : 'no tool has been chosen for the deleted-folder job');
                },
            },
        ],
        hints: ['Read each job for the verb: migrate, image, restore — each maps to one tool.', 'Move migrates from other platforms; Foundation images bare nodes; SSR returns files to the user.'],
        disclaimer: DISCLAIMER,
    },
    {
        id: 'nca-vm-01', exam: 'NCA-75', title: 'Create and Power On a VM',
        fixtureSeed: 3141592653,
        difficulty: 'Beginner', time: '10 min',
        description: 'Create a VM in the PE simulator with the requested resources, connect it to the right network, and power it on. Powers lesson 2.1.',
        objectives: [
            {
                id: 'obj-1', text: 'Create a VM named "Lab-AppServer" with 4 vCPUs',
                validate: (s) => {
                    const vm = s.getAll('vms').find(v => v.name === 'Lab-AppServer');
                    if (!vm) return unmet('no VM named Lab-AppServer exists');
                    return vm.vcpus === 4 ? met() : unmet(`Lab-AppServer has ${vm.vcpus} vCPU(s), not the 4 requested`);
                },
            },
            {
                id: 'obj-2', text: 'Give Lab-AppServer 8 GB of memory',
                validate: (s) => {
                    const vm = s.getAll('vms').find(v => v.name === 'Lab-AppServer');
                    if (!vm) return unmet('no VM named Lab-AppServer exists');
                    return vm.memory_gb === 8 ? met() : unmet(`Lab-AppServer has ${vm.memory_gb} GB, not the 8 GB requested`);
                },
            },
            {
                // The VM wizard writes nics: [{ network_uuid }]. Resolve the
                // uuid against the real network list so a fabricated name
                // cannot satisfy the objective (same repair class as mci-01).
                id: 'obj-3', text: 'Connect Lab-AppServer to the Production-200 network',
                validate: (s) => {
                    const vm = s.getAll('vms').find(v => v.name === 'Lab-AppServer');
                    if (!vm) return unmet('no VM named Lab-AppServer exists');
                    const nets = s.getAll('networks');
                    const ok = vm.nics?.some(n => nets.find(net => net.uuid === n.network_uuid)?.name === 'Production-200');
                    return ok ? met() : unmet('Lab-AppServer is not connected to Production-200');
                },
            },
            {
                id: 'obj-4', text: 'Power on Lab-AppServer',
                validate: (s) => {
                    const vm = s.getAll('vms').find(v => v.name === 'Lab-AppServer');
                    if (!vm) return unmet('no VM named Lab-AppServer exists');
                    return vm.power_state === 'on' ? met() : unmet('Lab-AppServer is not powered on');
                },
            },
        ],
        hints: ['Navigate to PE → VMs', 'Click "+ Create VM"', 'Use the 4-step wizard: General → Disks → NICs → Review', 'Power on from the VM list or the detail page'],
        context: 'pe', startRoute: '/pe/vms',
        disclaimer: DISCLAIMER,
    },
    {
        id: 'nca-maint-01', exam: 'NCA-75', title: 'Order a Safe Maintenance Sequence',
        fixtureSeed: 1618033988,
        difficulty: 'Beginner', time: '10 min',
        description: 'Put a node service and upgrade into a safe order. Powers lesson 3.2.',
        renderer: 'nca-lab',
        lab: { mode: 'sequence', ...NCA_MAINT_SEQUENCE },
        objectives: [
            {
                id: 'obj-1', text: 'Include all four steps, each exactly once',
                validate: (s, t) => {
                    const got = lastSequence(t);
                    if (!got.length) return unmet('no maintenance sequence has been built yet');
                    const wanted = NCA_MAINT_SEQUENCE.steps.map(x => x.id);
                    const missing = wanted.filter(id => !got.includes(id));
                    const extra = got.filter(id => !wanted.includes(id));
                    const dupes = got.filter((id, i) => got.indexOf(id) !== i);
                    if (dupes.length) return unmet(`the sequence repeats a step (${[...new Set(dupes)].join(', ')}) — each step belongs in it once`);
                    if (missing.length) return unmet(`the sequence is missing ${missing.join(', ')}`);
                    if (extra.length) return unmet(`the sequence contains a step that is not part of this task (${extra.join(', ')})`);
                    return met();
                },
            },
            {
                id: 'obj-2', text: 'Order them safely: health checks → evacuate → service → update',
                validate: (s, t) => {
                    const got = lastSequence(t);
                    const wanted = NCA_MAINT_SEQUENCE.steps.map(x => x.id);
                    if (!got.length) return unmet('no maintenance sequence has been built yet');
                    if (got.length !== wanted.length) {
                        return unmet(`the sequence has ${got.length} step(s); it needs all ${wanted.length} before the order can be judged`);
                    }
                    if (!got.every((id, i) => id === wanted[i])) {
                        return unmet('the steps are not in a safe order — checks and evacuation must come before the node is serviced, and the update comes last');
                    }
                    return met();
                },
            },
        ],
        hints: ['Never service a node that still holds workloads — evacuate first.', 'Checks come before anything changes.', 'The update is applied once the node is healthy and back in service.'],
        disclaimer: DISCLAIMER,
    },
    {
        id: 'nca-alert-01', exam: 'NCA-75', title: 'Read an Alert, Choose the Next Step',
        fixtureSeed: 1414213562,
        difficulty: 'Beginner', time: '10 min',
        description: 'Interpret a seeded cluster alert and pick the next step. Powers lesson 4.2.',
        renderer: 'nca-lab',
        lab: { mode: 'alert-triage', ...NCA_ALERT_LAB },
        objectives: [
            {
                id: 'obj-1', text: 'Open the alert detail and read it before deciding',
                validate: (s, t) => (alertOpened(t, NCA_ALERT_LAB.alertUuid)
                    ? met()
                    : unmet('the alert detail has not been opened — deciding without reading is not completion')),
            },
            {
                id: 'obj-2', text: 'Choose the next step that matches what the alert actually says',
                validate: (s, t) => {
                    if (!alertOpened(t, NCA_ALERT_LAB.alertUuid)) {
                        return unmet('the alert detail has not been opened — read the alert before choosing a next step');
                    }
                    const got = lastTriage(t);
                    if (got === 'expand-container') return met();
                    return unmet(got
                        ? `the next step chosen (${got}) does not match a capacity warning on a healthy cluster`
                        : 'no next step has been chosen yet');
                },
            },
        ],
        hints: ['Open the alert detail first — the summary line does not say whether anything is failing.', 'A capacity warning on a healthy cluster is not a hardware fault and not a support case.'],
        disclaimer: DISCLAIMER,
    },
];
