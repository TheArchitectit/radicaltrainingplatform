import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

const { window, document } = installDom();
const runner = makeRunner();
const container = document.createElement('main');
const { router } = await import('../../../RadicalTrainingPlatform.Web/js/core/Router.js');
const { PlaceholderView } = await import('../../../RadicalTrainingPlatform.Web/js/views/PlaceholderView.js');
const { PLACEHOLDER_COPY } = await import('../../../RadicalTrainingPlatform.Web/js/core/RouteLabels.js');

class DashboardView {
    async render() {
        const el = document.createElement('div');
        el.textContent = 'Real dashboard';
        return el;
    }
}

router.setContainer(container);
router.register('/pe/dashboard', DashboardView);
router.registerFallback(PlaceholderView);
const settle = () => new Promise(resolve => setImmediate(resolve));

await runner.test('unknown route renders placeholder without changing the URL', async () => {
    window.location.hash = '#/tracks/not-a-real-route/too-deep';
    router.start();
    await settle();
    assertEqual(router.currentPath, '/tracks/not-a-real-route/too-deep');
    assert(container.textContent.includes(PLACEHOLDER_COPY.title));
    assert(container.textContent.includes(PLACEHOLDER_COPY.body));
    assert(container.textContent.includes('Study Tracks'));
});

await runner.test('root still redirects to the dashboard', async () => {
    window.location.hash = '';
    router.start();
    await settle();
    assertEqual(window.location.hash, '/pe/dashboard');
    window.location.hash = '#/pe/dashboard';
    router.start();
    await settle();
    assert(container.textContent.includes('Real dashboard'));
    assert(!container.textContent.includes(PLACEHOLDER_COPY.title));
});

await runner.test('registered route does not use the fallback', async () => {
    window.location.hash = '#/pe/dashboard';
    router.start();
    await settle();
    assert(container.textContent.includes('Real dashboard'));
    assert(!container.textContent.includes(PLACEHOLDER_COPY.title));
});

process.exit(runner.done('router-fallback'));
