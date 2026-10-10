/**
 * R-22 bullet 5 — router render race: concurrent renders are not serialized.
 *
 * Defect: Router.#onHashChange calls the async #renderView without awaiting
 * it. Two rapid hash changes race: if the first route's render is slow
 * (async work in render()), the second route can complete first and then be
 * torn down/replaced by the stale first render's element.
 *
 * Fixture installs a controllable render gate: route A's render blocks until
 * the fixture releases it, while route B completes immediately. Pre-fix the
 * container ends up holding route A's element after navigating A -> B;
 * post-fix the stale render is discarded and B remains mounted.
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

const dom = installDom();
const runner = makeRunner();

class BaseStub {
    async render() {
        const el = dom.document.createElement('div');
        el.dataset.view = this.constructor.name;
        return el;
    }
}

await runner.test('stale render from an earlier route must not clobber the newer view', async () => {
    const { router } = await import('../../../RadicalTrainingPlatform.Web/js/core/Router.js');
    const { bus } = await import('../../../RadicalTrainingPlatform.Web/js/core/EventBus.js');

    const container = dom.document.createElement('div');
    dom.document.body.appendChild(container);
    router.setContainer(container);

    // Route A: render() blocks until released.
    let releaseA;
    const gateA = new Promise(r => { releaseA = r; });
    class SlowView extends BaseStub {
        async render() {
            const el = await super.render();
            await gateA;
            return el;
        }
    }
    class FastView extends BaseStub {}

    router.register('/race/slow', SlowView);
    router.register('/race/fast', FastView);

    dom.window.location.hash = '/race/slow';
    dom.window._fire('hashchange');
    await new Promise(r => setTimeout(r, 25)); // let slow render reach its gate
    assertEqual(container.children.length, 0, 'slow view should not have rendered yet');

    dom.window.location.hash = '/race/fast';
    dom.window._fire('hashchange');
    await new Promise(r => setTimeout(r, 25));
    assertEqual(container.children.length, 1, 'fast view should be mounted');
    assertEqual(container.children[0].dataset.view, 'FastView', 'fast view element should be in the container');

    // Release the stale slow render and let the router settle.
    releaseA();
    await new Promise(r => setTimeout(r, 25));

    assertEqual(container.children.length, 1, 'container must hold exactly one view after the stale render lands');
    assertEqual(container.children[0].dataset.view, 'FastView',
        'stale slow-view render must NOT replace the newer fast view');
});

await runner.test('destroy is still called on the outgoing view', async () => {
    const { router } = await import('../../../RadicalTrainingPlatform.Web/js/core/Router.js');
    const destroyed = [];

    class TrackView extends BaseStub {
        destroy() { destroyed.push(this.constructor.name); }
    }
    router.register('/race/track', TrackView);

    dom.window.location.hash = '/race/track';
    dom.window._fire('hashchange');
    await new Promise(r => setTimeout(r, 25));

    dom.window.location.hash = '/race/fast';
    dom.window._fire('hashchange');
    await new Promise(r => setTimeout(r, 25));

    assert(destroyed.includes('TrackView'), 'outgoing view must be destroyed');
});

process.exit(runner.done('router-serialization fixture'));
