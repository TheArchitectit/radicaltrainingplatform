/**
 * T-24 / R-09 live-repo assertion.
 *
 * The checker beside this file proves the shuffle module is permutation-safe
 * in isolation. This proves the *shipped practice view* actually routes the
 * learner's click through it: render the real view on the real compiled bank,
 * click the row that holds the correct text, and require Correct — with the
 * order pinned to a seed that demonstrably reorders the item, so the assertion
 * cannot pass by the shuffle happening to be the identity.
 */
import { installDom } from '../../web/helpers.mjs';

installDom();

const { ITEMS } = await import('../../../../RadicalTrainingPlatform.Web/js/study-content.js');
const { optionOrder, optionIds, sourceLetterOf } =
    await import('../../../../RadicalTrainingPlatform.Web/js/core/OptionShuffle.js');
const { PracticeView } = await import('../../../../RadicalTrainingPlatform.Web/js/views/practice.js');
const { progress } = await import('../../../../RadicalTrainingPlatform.Web/js/core/ProgressStore.js');

const EXAM = 'COMPTIA-A-1201';
const items = ITEMS.filter(i => i.examId === EXAM);
if (!items.length) {
    console.log('LIVE RENDER: FAIL — no released items for the live exam');
    process.exit(1);
}

const authored = optionIds(items[0]).join(',');
let seed = null;
for (let s = 1; s < 5000 && seed === null; s += 1) {
    if (optionOrder(items[0], s).join(',') !== authored) seed = s;
}
if (seed === null) {
    console.log('LIVE RENDER: FAIL — no seed reorders the first item; the shuffle is not reaching the view');
    process.exit(1);
}

await progress.init();
await progress.saveContinuation(EXAM, {
    index: 0, selection: [], results: [], total: items.length, seed,
});

const view = new PracticeView();
const el = await view.render({ examId: EXAM });
view.root = el;
view.afterRender({ examId: EXAM });

const rows = el.querySelectorAll('.option-row');
const expected = optionOrder(items[0], seed)
    .map(id => items[0].options[sourceLetterOf(items[0], id)]);
const rendered = rows.map(r => r.querySelector('.option-text').textContent);

if (rendered.join('|') !== expected.join('|')) {
    console.log('LIVE RENDER: FAIL — the view did not render the seeded order');
    console.log(`  expected ${expected.join(' | ')}`);
    console.log(`  rendered ${rendered.join(' | ')}`);
    process.exit(1);
}
if (rendered.join('|') === Object.values(items[0].options).join('|')) {
    console.log('LIVE RENDER: FAIL — the view rendered the authored order under a reordering seed');
    process.exit(1);
}

const correctText = items[0].options[items[0].keys[0]];
const row = rows.find(r => r.querySelector('.option-text').textContent === correctText);
row.dispatchEvent({ type: 'click' });
el.querySelector('#practice-submit').dispatchEvent({ type: 'click' });
await new Promise(resolve => setTimeout(resolve, 0));

const verdict = el.querySelector('#practice-feedback')?.querySelector('.verdict');
if (!verdict || !verdict.className.includes('correct')) {
    console.log(`LIVE RENDER: FAIL — the correct option scored "${verdict ? verdict.textContent : '(no verdict)'}"`);
    process.exit(1);
}

await progress.clearContinuation(EXAM);
console.log(`LIVE RENDER: PASS — seed ${seed} reordered the item and the correct choice still scored Correct`);
process.exit(0);
