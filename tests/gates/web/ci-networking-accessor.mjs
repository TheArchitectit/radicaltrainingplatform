/**
 * R-22 bullet 2 — accessor mismatch: ci-networking calls state.get().
 *
 * Defect: StateEngine has getById(collection, id) but no get(); the
 * ci-networking view calls state.get('nc2_clusters', uuid), which throws
 * TypeError and leaves the networking panel stuck on the initial render.
 *
 * Fixture drives the real StateEngine against the real view and asserts:
 *   1. state.get() is undefined pre-fix (the mismatch itself),
 *   2. selecting a cluster re-renders the networking panel with AWS data.
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

const dom = installDom();
const runner = makeRunner();

await runner.test('ci-networking renders cluster networking via the real state engine', async () => {
    const { state } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateEngine.js');
    const { CiNetworkingView } = await import('../../../RadicalTrainingPlatform.Web/js/views/ci-networking.js');

    // The mismatch itself: no state.get accessor exists.
    assertEqual(typeof state.get, 'undefined', 'precondition: StateEngine must not expose get()');

    await state.init();

    const view = new CiNetworkingView();
    const el = await view.render();
    dom.document.body.appendChild(el);
    view.root = el; // Router contract (bullet 1 fix); view uses document.getElementById here
    view.afterRender();

    // Seed data: nc2-001 is the AWS cluster.
    const aws = state.getById('nc2_clusters', 'nc2-001');
    assert(aws, 'seed cluster nc2-001 must exist');
    assertEqual(aws.provider, 'AWS', 'nc2-001 should be the AWS cluster');

    // A real <select> defaults to its first option; the stub needs it set
    // explicitly (the stub has no option-tracking).
    const select = dom.document.getElementById('cluster-select');
    assert(select, 'cluster-select must exist');
    select.value = 'nc2-001';
    select.dispatchEvent({ type: 'change', target: select });

    const content = dom.document.getElementById('networking-content');
    assert(content, 'networking-content panel must exist after afterRender');
    assert(content.innerHTML.includes('AWS'), 'AWS cluster networking should render');
    assert(content.innerHTML.includes(aws.region), 'AWS region should appear in the panel');

    // Switch to the Azure cluster and assert the panel refreshes.
    const azure = state.getById('nc2_clusters', 'nc2-002');
    assertEqual(azure.provider, 'Azure', 'nc2-002 should be the Azure cluster');

    select.value = 'nc2-002';
    select.dispatchEvent({ type: 'change', target: select });
    assert(content.innerHTML.includes('Azure'), 'switching clusters should re-render with Azure data');
});

process.exit(runner.done('ci-networking-accessor fixture'));
