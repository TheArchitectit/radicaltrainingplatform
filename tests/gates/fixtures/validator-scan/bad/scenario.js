// Failing fixture — a constant-true validator must be flagged (REQ-SC-01).
const SCENARIOS = [
    {
        id: 'fixture-auto-pass', exam: 'TEST', title: 'Auto-pass defect',
        objectives: [
            { id: 'obj-1', text: 'Always passes', validate: () => true },
        ],
    },
];
