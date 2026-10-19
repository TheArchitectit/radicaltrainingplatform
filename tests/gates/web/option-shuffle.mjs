/**
 * T-24 / R-09 — seeded option shuffle with stable option IDs.
 *
 * Acceptance: "Seeded option shuffle with stable item IDs; no scoring
 * regression on multi-select."
 *
 * Failing side this fixture names: every bank in the reviewed set was authored
 * with the key on A (pre-repair: NCP-AI-Part1.md, 80/80), so a learner who never
 * reads the stem can farm accuracy by position. The cheap fix — reorder the
 * buttons — is a scoring regression waiting to happen, because the click and
 * the saved selection are both *positions*, and grading them as if they were
 * identities scores the wrong option on every shuffled item. This fixture fails
 * against exactly that: it grades the same choice through many permutations and
 * requires the verdict to be identical to the unshuffled one, for single- and
 * multi-select alike.
 *
 * Asserted:
 *   - a stable option ID is `<item id>#<source letter>`, independent of position;
 *   - the refusals are named, not silent: sequence items and letter-referential
 *     wording ("all of the above", "both A and C") are never shuffled;
 *   - `optionOrder` is a deterministic permutation for a given (item, seed) and
 *     actually varies across seeds;
 *   - grading is invariant across permutations, on the shipped banks and on a
 *     multi-select item the banks do not yet contain;
 *   - the practice view renders a shuffled order, and clicking the row that
 *     *holds* the right answer scores Correct wherever it landed.
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

installDom();
const runner = makeRunner();

const {
    optionId, optionIds, sourceLetterOf, shuffleRefusal, isShufflable,
    optionOrder, displayMap, toStableIds, correctDisplayLetters,
} = await import('../../../RadicalTrainingPlatform.Web/js/core/OptionShuffle.js');
const { ITEMS, EXAMS } = await import('../../../RadicalTrainingPlatform.Web/js/study-content.js');
const { grade, selectionToKeys, PracticeView } =
    await import('../../../RadicalTrainingPlatform.Web/js/views/practice.js');
const { progress } = await import('../../../RadicalTrainingPlatform.Web/js/core/ProgressStore.js');

const item = (id, options, keys, extra = {}) => ({ id, options, keys, ...extra });

const SINGLE = item('EXAM/bank.md/Q1',
    { A: 'DHCP', B: 'DNS', C: 'The default gateway', D: 'The subnet mask' }, ['B']);
const MULTI = item('EXAM/bank.md/Q2',
    { A: 'DNS server setting', B: 'Wi-Fi passphrase', C: 'DNS service', D: 'NIC driver' },
    ['A', 'C'], { isMultiSelect: true });
const ORDERED = item('EXAM/bank.md/Q3',
    { A: 'Discover', B: 'Offer', C: 'Request', D: 'Acknowledge' },
    ['A', 'B', 'C', 'D'], { isOrdered: true });

const SEEDS = Array.from({ length: 24 }, (_, i) => (i * 2654435761) >>> 0);

// ─── Identity ────────────────────────────────────────────────────────────

await runner.test('a stable option ID is the item id plus the source letter, not a position', async () => {
    assertEqual(optionId(SINGLE, 'B'), 'EXAM/bank.md/Q1#B');
    assertEqual(optionIds(SINGLE).join(','), 'EXAM/bank.md/Q1#A,EXAM/bank.md/Q1#B,EXAM/bank.md/Q1#C,EXAM/bank.md/Q1#D');
    assertEqual(sourceLetterOf(SINGLE, 'EXAM/bank.md/Q1#B'), 'B');
    assertEqual(sourceLetterOf(SINGLE, 'EXAM/bank.md/Q2#B'), null, 'another item\'s ID is not this item\'s letter');
    assertEqual(sourceLetterOf(SINGLE, 'EXAM/bank.md/Q1'), null, 'a bare item id carries no letter');
});

// ─── Refusals, each one named ────────────────────────────────────────────

await runner.test('sequence items are never shuffled — position is the answer (R-03)', async () => {
    assertEqual(shuffleRefusal(ORDERED), 'ordered');
    assert(!isShufflable(ORDERED));
    for (const seed of SEEDS) {
        assertEqual(optionOrder(ORDERED, seed).join(','), optionIds(ORDERED).join(','),
            'an ordered item must render in its authored order under every seed');
    }
});

await runner.test('letter-referential wording is never shuffled', async () => {
    const cases = [
        item('X/1', { A: 'DNS', B: 'DHCP', C: 'All of the above', D: 'None of the above' }, ['C']),
        item('X/2', { A: 'DNS', B: 'DHCP', C: 'Both A and B', D: 'Neither' }, ['C']),
        item('X/3', { A: 'DNS', B: 'DHCP', C: 'Gateway', D: 'Mask' }, ['C'],
            { stem: 'Which of options A and D is wrong?' }),
        item('X/4', { A: 'DNS', B: 'DHCP', C: 'Gateway', D: 'Answer B only' }, ['A']),
        item('X/4a', { A: 'DNS', B: 'DHCP', C: 'Gateway', D: 'Mask' }, ['C'],
            { stem: 'Which values differ between A and D?' }),
        item('X/4b', { A: 'DNS', B: 'DHCP', C: 'Gateway', D: 'Mask' }, ['C'],
            { stem: 'Either B or C will work; which is preferred?' }),
        item('X/4c', { A: 'DNS', B: 'DHCP', C: 'Gateway', D: 'Mask' }, ['C'],
            { stem: 'Compare C, and D before answering.' }),
    ];
    for (const c of cases) {
        assertEqual(shuffleRefusal(c), 'letter-referential', `${c.id} must be refused`);
        assertEqual(optionOrder(c, 7).join(','), optionIds(c).join(','), `${c.id} keeps authored order`);
    }
});

await runner.test('degenerate items are refused for their own named reason', async () => {
    assertEqual(shuffleRefusal(item('X/5', { A: 'Only' }, ['A'])), 'too-few-options');
    assertEqual(shuffleRefusal(item('X/6', {}, [])), 'no-options');
    assertEqual(shuffleRefusal(null), 'no-options');
});

await runner.test('an ordinary choice item is shufflable', async () => {
    assertEqual(shuffleRefusal(SINGLE), null);
    assert(isShufflable(SINGLE));
    assert(isShufflable(MULTI), 'multi-select shuffles too — its identity is the set, not a position');
});

await runner.test('ordinary prose containing the letter "a" or "f" is not a letter reference', async () => {
    // The "letter and letter" pattern once had no word boundary after its
    // first letter, so under /i the "f" of "for" and the "c" of "core" matched
    // `[A-F]`, and "for a development team" silently refused a shuffle. The
    // pattern must see two *single* letters; these stems are ordinary prose.
    const prose = [
        item('X/8', { A: 'It removes the need for a second NIC', B: 'It doubles the core count',
            C: 'It renames the DORA metrics', D: 'It adds a VLAN' }, ['A'],
            { stem: 'What is the primary effect of this change for a development team?' }),
        item('X/9', { A: 'Core count', B: 'Cache size', C: 'Frame size', D: 'Fan speed' }, ['B'],
            { stem: 'Which value does the hypervisor report under load, for a given host?' }),
    ];
    for (const c of prose) {
        assertEqual(shuffleRefusal(c), null, `${c.id} names no option letter and must shuffle`);
        assert(isShufflable(c));
    }
});

// ─── Determinism and variation ───────────────────────────────────────────

await runner.test('the order is a permutation of the stable IDs, deterministic per (item, seed)', async () => {
    const authored = optionIds(SINGLE).join(',');
    for (const seed of SEEDS) {
        const order = optionOrder(SINGLE, seed);
        assertEqual([...order].sort().join(','), [...authored.split(',')].sort().join(','),
            'every stable ID appears exactly once');
        assertEqual(optionOrder(SINGLE, seed).join(','), order.join(','),
            'the same (item, seed) must give the same order — a resumed run depends on it');
    }
});

await runner.test('the order actually varies across seeds', async () => {
    const seen = new Set(SEEDS.map(s => optionOrder(SINGLE, s).join(',')));
    assert(seen.size > 1, `expected more than one order across ${SEEDS.length} seeds, saw ${seen.size}`);
});

await runner.test('display letters address positions, and every option is reachable exactly once', async () => {
    const seed = SEEDS[3];
    const map = displayMap(SINGLE, seed);
    const order = optionOrder(SINGLE, seed);
    Object.keys(map).forEach((letter, i) => assertEqual(map[letter], order[i], `display ${letter} holds ${order[i]}`));
    assertEqual(Object.keys(map).join(''), 'ABCD', 'display letters are dense, from A');
    assertEqual(new Set(Object.values(map)).size, 4, 'no option is displayed twice');
    // Each display letter's text is the authored text of the stable ID there.
    for (const [letter, id] of Object.entries(map)) {
        assert(SINGLE.options[sourceLetterOf(SINGLE, id)] !== undefined,
            `display ${letter} must hold an authored option`);
    }
    assertEqual(correctDisplayLetters(SINGLE, seed).length, 1);
    const shown = correctDisplayLetters(SINGLE, seed)[0];
    assertEqual(SINGLE.options[sourceLetterOf(SINGLE, map[shown])], SINGLE.options.B,
        'the letter the learner is told is correct must hold the authored correct text');
});

await runner.test('toStableIds drops letters that are not on this item', async () => {
    const seed = SEEDS[5];
    assertEqual(toStableIds(SINGLE, seed, ['A']).length, 1);
    assertEqual(toStableIds(SINGLE, seed, ['A', 'Z', '9', null]).length, 1,
        'a stale or junk selection must not become a phantom choice');
    assertEqual(toStableIds(SINGLE, seed, []).length, 0);
    assertEqual(toStableIds(SINGLE, seed, undefined).length, 0);
});

// ─── The acceptance: no scoring regression ───────────────────────────────

await runner.test('single-select: grading is identical across every permutation', async () => {
    const unshuffled = grade(SINGLE, [...SINGLE.keys]);
    assert(unshuffled.isCorrect, 'the authored answer is correct');
    for (const seed of SEEDS) {
        const displayed = correctDisplayLetters(SINGLE, seed);
        assertEqual(displayed.length, 1);
        const outcome = grade(SINGLE, selectionToKeys(SINGLE, seed, displayed));
        assert(outcome.isCorrect, `seed ${seed}: the correct option must score correct wherever it is displayed`);
        // Every wrong position fails, and fails for the same reason.
        for (const letter of Object.keys(displayMap(SINGLE, seed))) {
            if (displayed.includes(letter)) continue;
            const wrong = grade(SINGLE, selectionToKeys(SINGLE, seed, [letter]));
            assert(!wrong.isCorrect, `seed ${seed}: display ${letter} is not the answer`);
            assertEqual(wrong.reason, 'set-mismatch');
        }
    }
});

await runner.test('multi-select: grading is identical across every permutation', async () => {
    assert(MULTI.keys.length > 1, 'this vector must actually be multi-select');
    for (const seed of SEEDS) {
        const displayed = correctDisplayLetters(MULTI, seed);
        assertEqual(displayed.length, 2);
        // Order-insensitive: the two correct rows in either click order.
        assert(grade(MULTI, selectionToKeys(MULTI, seed, displayed)).isCorrect);
        assert(grade(MULTI, selectionToKeys(MULTI, seed, [...displayed].reverse())).isCorrect,
            'multi-select set equality must survive the shuffle');
        // Count-sensitive: a subset and a superset both fail.
        assertEqual(grade(MULTI, selectionToKeys(MULTI, seed, [displayed[0]])).reason, 'set-mismatch');
        assertEqual(grade(MULTI, selectionToKeys(MULTI, seed, [displayed[0], displayed[1], 'A'])).isCorrect,
            false, 'adding a wrong option must fail');
        // And the letters that are NOT correct must not score correct.
        const others = Object.keys(displayMap(MULTI, seed)).filter(l => !displayed.includes(l));
        for (const letter of others) {
            assert(!grade(MULTI, selectionToKeys(MULTI, seed, [letter])).isCorrect);
        }
    }
});

await runner.test('every shipped item scores identically shuffled and unshuffled', async () => {
    assert(ITEMS.length > 0, 'the compiled bank must not be empty');
    let checked = 0;
    for (const it of ITEMS) {
        for (const seed of SEEDS.slice(0, 8)) {
            const displayed = correctDisplayLetters(it, seed);
            assertEqual(displayed.length, it.keys.length);
            const shuffled = grade(it, selectionToKeys(it, seed, displayed));
            const authored = grade(it, [...it.keys]);
            assertEqual(shuffled.isCorrect, authored.isCorrect,
                `${it.id} seed ${seed}: verdict changed under shuffle`);
            checked += 1;
        }
    }
    assert(checked >= 100, `expected a broad sweep, checked ${checked}`);
});

// ─── The runtime path ────────────────────────────────────────────────────

const EXAM = 'COMPTIA-A-1201';
const EXAM_ITEMS = ITEMS.filter(i => i.examId === EXAM);
// A seed that demonstrably reorders the first item, so the render assertion is
// not "the shuffle happened to be the identity".
const SEED = SEEDS.find(s => optionOrder(EXAM_ITEMS[0], s).join(',') !== optionIds(EXAM_ITEMS[0]).join(','));

/** Render the practice view with a continuation that pins the run seed. */
async function renderPractice(seed) {
    await progress.init();
    await progress.saveContinuation(EXAM, {
        index: 0, selection: [], results: [], total: EXAM_ITEMS.length, seed,
    });
    const view = new PracticeView();
    const el = await view.render({ examId: EXAM });
    view.root = el;
    view.afterRender({ examId: EXAM });
    return { view, el };
}

await runner.test('the practice view renders the seeded order, not the authored one', async () => {
    const { el } = await renderPractice(SEED);
    const rows = el.querySelectorAll('.option-row');
    assertEqual(rows.length, Object.keys(EXAM_ITEMS[0].options).length,
        'one row per option, no more and no fewer');
    const rendered = rows.map(r => r.dataset.letter).join('');
    assertEqual(rendered, 'ABCD', 'display letters run A..D in display order');

    const expected = optionOrder(EXAM_ITEMS[0], SEED);
    const expectedText = expected.map(id => EXAM_ITEMS[0].options[sourceLetterOf(EXAM_ITEMS[0], id)]);
    const renderedText = rows.map(r => r.querySelector('.option-text').textContent);
    assertEqual(renderedText.join('|'), expectedText.join('|'),
        'each display row holds the text of the stable ID at that position');
    assert(renderedText.join('|') !== Object.values(EXAM_ITEMS[0].options).join('|'),
        'this seed must actually reorder the first item, or this fixture proves nothing');
});

await runner.test('clicking the row that holds the answer scores Correct', async () => {
    const { el } = await renderPractice(SEED);
    const target = EXAM_ITEMS[0];
    const correctText = target.options[target.keys[0]];
    const rows = el.querySelectorAll('.option-row');
    const row = rows.find(r => r.querySelector('.option-text').textContent === correctText);
    assert(row, 'the correct option is rendered somewhere');
    row.dispatchEvent({ type: 'click' });
    el.querySelector('#practice-submit').dispatchEvent({ type: 'click' });
    await new Promise(resolve => setTimeout(resolve, 0));

    // Two-step query: the stub's selector matcher has no descendant combinator.
    const verdict = el.querySelector('#practice-feedback')?.querySelector('.verdict');
    assert(verdict, 'submitting renders a verdict');
    assert(verdict.className.includes('correct'),
        `choosing the option that holds the answer must score Correct (got "${verdict.textContent}")`);
});

await runner.test('clicking a row that holds a wrong answer scores wrong, and feedback names the display letter', async () => {
    const { el } = await renderPractice(SEED);
    const target = EXAM_ITEMS[0];
    const correctText = target.options[target.keys[0]];
    const rows = el.querySelectorAll('.option-row');
    const row = rows.find(r => r.querySelector('.option-text').textContent !== correctText);
    row.dispatchEvent({ type: 'click' });
    el.querySelector('#practice-submit').dispatchEvent({ type: 'click' });
    await new Promise(resolve => setTimeout(resolve, 0));

    const verdict = el.querySelector('#practice-feedback')?.querySelector('.verdict');
    assert(verdict.className.includes('wrong'), 'a wrong choice must not score correct');
    const expectedLetter = correctDisplayLetters(target, SEED).join(', ');
    assert(verdict.textContent.includes(expectedLetter),
        `feedback must name the letter the learner saw (${expectedLetter}), got "${verdict.textContent}"`);
});

await runner.test('a resumed run keeps its order; a pre-T-24 continuation restarts', async () => {
    // Same seed on the second render → identical order, so a saved display
    // selection still points at the same option.
    const first = await renderPractice(SEED);
    const firstText = first.el.querySelectorAll('.option-row')
        .map(r => r.querySelector('.option-text').textContent).join('|');
    const second = await renderPractice(SEED);
    const secondText = second.el.querySelectorAll('.option-row')
        .map(r => r.querySelector('.option-text').textContent).join('|');
    assertEqual(secondText, firstText, 'the seed must reproduce the order across a reload');

    // A continuation written before T-24 has no seed: its selection is display
    // letters under an unknown order, so the run must restart rather than grade
    // it against a fresh one.
    await progress.saveContinuation(EXAM, {
        index: 3, selection: ['B'], results: [{ isCorrect: true }], total: EXAM_ITEMS.length,
    });
    const legacy = await progress.loadContinuation(EXAM);
    assertEqual(legacy.seed, null, 'an unseeded write stores null, not a guessed seed');
    const view = new PracticeView();
    const el = await view.render({ examId: EXAM });
    view.root = el;
    view.afterRender({ examId: EXAM });
    assertEqual(el.querySelector('.practice-progress').textContent.trim(), `1 / ${EXAM_ITEMS.length}`,
        'a pre-T-24 continuation must restart at the first item, not resume into an unknown order');
    assertEqual(el.querySelectorAll('.option-row.selected').length, 0, 'and must carry no stale selection');
});

await runner.test('the seed round-trips through the continuation record', async () => {
    await progress.init();
    const r = await progress.saveContinuation(EXAM, {
        index: 1, selection: [], results: [], total: EXAM_ITEMS.length, seed: SEED,
    });
    assertEqual(r.saved, true);
    assertEqual(r.record.seed, SEED);
    const back = await progress.loadContinuation(EXAM);
    assertEqual(back.seed, SEED, 'the order must travel with the selection it belongs to');
    await progress.clearContinuation(EXAM);
});

process.exit(runner.done('option-shuffle'));
