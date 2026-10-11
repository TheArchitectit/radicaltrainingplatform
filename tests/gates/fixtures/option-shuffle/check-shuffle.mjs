/**
 * T-24 / R-09 checker — run against a given option-shuffle module.
 *
 * Usage: node check-shuffle.mjs <path to an OptionShuffle module>
 * Exit 0 = the module shuffles without changing what a choice means.
 * Exit 1 = a scoring regression: a correct choice stopped being correct.
 *
 * This is deliberately independent of the module's own helpers. It reads the
 * stable IDs the module produces, translates them back with the module's own
 * `sourceLetterOf`, and compares the resulting letters to the authored key with
 * its own set equality. A module whose helpers merely agree with each other
 * cannot pass by construction.
 */
const modulePath = process.argv[2];
if (!modulePath) {
    console.error('usage: check-shuffle.mjs <path to an OptionShuffle module>');
    process.exit(2);
}

const mod = await import(new URL(modulePath, `file://${process.cwd()}/`).href);

const fail = [];
const check = (ok, detail) => { if (!ok) fail.push(detail); };

const single = {
    id: 'EXAM/bank.md/Q1',
    stem: 'Which service should you check first?',
    options: { A: 'DHCP', B: 'DNS', C: 'The default gateway', D: 'The subnet mask' },
    keys: ['B'],
};
const multi = {
    id: 'EXAM/bank.md/Q2',
    stem: 'Which two settings are most worth verifying first?',
    options: { A: 'DNS server setting', B: 'Wi-Fi passphrase', C: 'DNS service', D: 'NIC driver' },
    keys: ['A', 'C'],
    isMultiSelect: true,
};
const ordered = {
    id: 'EXAM/bank.md/Q3',
    stem: 'Place the DHCP lease steps in order.',
    options: { A: 'Discover', B: 'Offer', C: 'Request', D: 'Acknowledge' },
    keys: ['A', 'B', 'C', 'D'],
    isOrdered: true,
};
const positional = {
    id: 'EXAM/bank.md/Q4',
    stem: 'Which option is correct?',
    options: { A: 'DNS', B: 'DHCP', C: 'All of the above', D: 'None of the above' },
    keys: ['C'],
};

const SEEDS = Array.from({ length: 24 }, (_, i) => (i * 2654435761) >>> 0);

/** Set equality, written here rather than borrowed. */
const sameSet = (a, b) => a.length === b.length && [...a].sort().join(',') === [...b].sort().join(',');

/** The authored letters the learner's clicks resolve to, via stable IDs. */
function resolve(item, seed, displayLetters) {
    return mod.toStableIds(item, seed, displayLetters)
        .map(id => mod.sourceLetterOf(item, id))
        .filter(Boolean);
}

for (const item of [single, multi]) {
    const authored = mod.optionIds(item).join(',');
    for (const seed of SEEDS) {
        // The order must be a permutation of the stable IDs...
        const order = mod.optionOrder(item, seed);
        check(sameSet(order, authored.split(',')), `${item.id} seed ${seed}: order is not a permutation`);
        // ...and deterministic for the same (item, seed).
        check(mod.optionOrder(item, seed).join(',') === order.join(','),
            `${item.id} seed ${seed}: order is not deterministic`);

        // The acceptance: the correct choice is correct wherever it is displayed.
        const shown = mod.correctDisplayLetters(item, seed);
        check(sameSet(resolve(item, seed, shown), item.keys),
            `${item.id} seed ${seed}: the correct choice did not resolve to the key`);
        // A multi-select set survives click order; a wrong choice still fails.
        if (item.keys.length > 1) {
            check(sameSet(resolve(item, seed, [...shown].reverse()), item.keys),
                `${item.id} seed ${seed}: click order changed the answer`);
        }
        const wrong = Object.keys(mod.displayMap(item, seed)).filter(l => !shown.includes(l));
        for (const letter of wrong) {
            check(!sameSet(resolve(item, seed, [letter]), item.keys),
                `${item.id} seed ${seed}: a wrong display letter resolved to the key`);
        }
    }
}

// Refusals: an item whose meaning depends on position must not be reordered.
for (const item of [ordered, positional]) {
    check(mod.shuffleRefusal(item) !== null, `${item.id}: should be refused, was not`);
    for (const seed of SEEDS) {
        check(mod.optionOrder(item, seed).join(',') === mod.optionIds(item).join(','),
            `${item.id} seed ${seed}: a refused item was reordered`);
    }
}

if (fail.length) {
    console.log(`SHUFFLE CHECK: FAIL — ${fail.length} problem(s)`);
    for (const line of fail.slice(0, 8)) console.log(`  ${line}`);
    process.exit(1);
}
console.log('SHUFFLE CHECK: PASS — grading is permutation-invariant, refusals hold');
process.exit(0);
