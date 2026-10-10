/**
 * R-22 bullet 1 — view lifecycle: `this.root` is never assigned.
 *
 * Defect: Router.#renderView calls view.afterRender(params) but never hands
 * the rendered element back to the view, so views that reference this.root
 * (pc-insights, pe-capacity, pe-reports) throw TypeError in afterRender.
 *
 * Fixture drives the real Router lifecycle against PcInsightsView and asserts:
 *   1. the render lifecycle completes without an unhandled rejection,
 *   2. view.root is the element the view rendered,
 *   3. tab clicks switch the active class and re-render tab content.
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

const dom = installDom();
const runner = makeRunner();

await runner.test('router lifecycle assigns view.root and afterRender completes', async () => {
    const { router } = await import('../../../RadicalTrainingPlatform.Web/js/core/Router.js');
    const { PcInsightsView } = await import('../../../RadicalTrainingPlatform.Web/js/views/pc-insights.js');

    const container = dom.document.createElement('div');
    dom.document.body.appendChild(container);
    router.setContainer(container);

    const seen = [];
    class CapturingInsights extends PcInsightsView {
        constructor() { super(); seen.push(this); }
    }
    router.register('/test/insights', CapturingInsights);

    // Capture the render promise rejection: Router.#renderView is not awaited
    // by #onHashChange, so a throw in render/afterRender surfaces as an
    // unhandled rejection. The fixture must fail on it, not crash on it.
    let rejection = null;
    const onUnhandled = (e) => { rejection = rejection || e; };
    process.on('unhandledRejection', onUnhandled);
    try {
        dom.window.location.hash = '/test/insights';
        dom.window._fire('hashchange');
        await new Promise(r => setTimeout(r, 250));

        assert(!rejection, `render lifecycle threw: ${rejection && (rejection.stack || rejection.message)}`);

        const view = seen[seen.length - 1];
        assert(view, 'router should have instantiated the view');
        assert(view.root, 'view.root must be assigned by the router');
        assertEqual(view.root.tagName, 'DIV', 'view.root should be the rendered element');
        assert(container.children.includes(view.root), 'rendered element should be in the container');

        // afterRender populated the default tab without throwing
        const tabContent = view.root.querySelector('#tab-content');
        assert(tabContent, 'tab-content container should exist');
        assert(tabContent.children.length > 0, 'default recommendations tab should render content');
    } finally {
        process.off('unhandledRejection', onUnhandled);
    }
});

await runner.test('tab clicks switch active class and re-render content', async () => {
    const { router } = await import('../../../RadicalTrainingPlatform.Web/js/core/Router.js');
    void router;
    const { PcInsightsView } = await import('../../../RadicalTrainingPlatform.Web/js/views/pc-insights.js');
    void PcInsightsView;

    // The view instance captured in the previous test is still mounted.
    const container = dom.document.body.children.find(c => c.querySelector && c.querySelector('#tab-content'));
    assert(container, 'mounted insights view should still be in the container');
    const root = container.children[0];
    assert(root, 'rendered root element should be present');

    const tabs = root.querySelectorAll('.tab');
    assertEqual(tabs.length, 3, 'insights view should render three tabs');
    const anomaliesTab = tabs.find(t => t.dataset.tab === 'anomalies');
    assert(anomaliesTab, 'anomalies tab should exist');

    anomaliesTab.click();

    const active = root.querySelectorAll('.tab.active');
    assertEqual(active.length, 1, 'exactly one tab should be active after click');
    assertEqual(active[0].dataset.tab, 'anomalies', 'clicked tab should become active');
    const tabContent = root.querySelector('#tab-content');
    assert(tabContent.children.length > 0, 'anomalies tab should render content');
});

process.exit(runner.done('root-lifecycle fixture'));
