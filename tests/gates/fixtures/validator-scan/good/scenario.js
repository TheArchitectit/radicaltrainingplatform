// Passing fixture — real state-based validators must not be flagged.
const SCENARIOS = [
    {
        id: 'fixture-good', exam: 'TEST', title: 'Honest validator',
        objectives: [
            { id: 'obj-1', text: 'Named VM exists', validate: () => state.getAll('vms').some(v => v.name === 'Lab-WebServer') },
            { id: 'obj-2', text: 'Trace-honoring', validate: () => trace.some(t => t.action === 'test-run') },
        ],
    },
];
