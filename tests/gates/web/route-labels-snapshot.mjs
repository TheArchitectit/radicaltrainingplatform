/**
 * T-43 / R-22 cosmetics snapshot — fixed breadcrumb and placeholder labels.
 *
 * Failing side of the old breadcrumb (app.js #onRouteChanged): path
 * segments were naively title-cased (`pc-settings` → "Pc-settings",
 * `nai-tools` → "Nai-tools", `ai-models` → "Ai-models") and every non-PC
 * root was labeled "Prism Element" — so `/tracks` claimed a Prism Element
 * crumb. Placeholder copy claimed "Coming Soon" / "under development" for
 * surfaces that are real product routes.
 *
 * Passing side: ROUTE_LABELS matches the sidebar (index.html nav) exactly,
 * breadcrumbFor names the study surface for /tracks and /practice, and
 * dynamic IDs are never fake-title-cased.
 */
import { readFileSync } from 'node:fs';
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

installDom();
const runner = makeRunner();

const {
    ROUTE_LABELS,
    breadcrumbFor,
    labelForSegment,
    PLACEHOLDER_COPY,
} = await import('../../../RadicalTrainingPlatform.Web/js/core/RouteLabels.js');

const { PlaceholderView } = await import('../../../RadicalTrainingPlatform.Web/js/views/PlaceholderView.js');

// ─── Sidebar labels in index.html are the display-label source of truth ──

const indexHtml = readFileSync(
    new URL('../../../RadicalTrainingPlatform.Web/index.html', import.meta.url),
    'utf8'
);

const navLabels = new Map();
for (const match of indexHtml.matchAll(/data-route="([^"]+)"[^>]*>(?:<span class="icon">[^<]*<\/span>\s*)?([^<]+)/g)) {
    navLabels.set(match[1], match[2].trim());
}

await runner.test('index.html has nav labels to pin against', async () => {
    assert(navLabels.size >= 40, `expected a full sidebar, found ${navLabels.size} nav items`);
});

await runner.test('ROUTE_LABELS matches every sidebar label exactly', async () => {
    for (const [route, label] of navLabels) {
        assertEqual(
            ROUTE_LABELS[route],
            label,
            `ROUTE_LABELS[${route}] must match the sidebar label`
        );
    }
});

await runner.test('every ROUTE_LABELS entry is backed by the sidebar (no invented labels)', async () => {
    // /practice has no sidebar row (it is reached from study tracks) — allowed.
    const allowedExtra = new Set(['/practice']);
    for (const route of Object.keys(ROUTE_LABELS)) {
        if (allowedExtra.has(route)) continue;
        assert(navLabels.has(route), `ROUTE_LABELS[${route}] is not a sidebar route — do not invent labels`);
    }
});

// ─── Breadcrumb snapshot — fixed labels, correct context ─────────────────

await runner.test('breadcrumb page labels use the sidebar wording (not slugified)', async () => {
    // The archived failures, pinned out:
    assertEqual(breadcrumbFor('/pc/pc-settings').page, 'Settings', 'pc-settings must not be "Pc-settings"');
    assertEqual(breadcrumbFor('/pc/nai-tools').page, 'NAI Tools', 'nai-tools must not be "Nai-tools"');
    assertEqual(breadcrumbFor('/pc/ai-models').page, 'AI Models', 'ai-models must not be "Ai-models"');
    assertEqual(breadcrumbFor('/pc/nc2-networking').page, 'Networking', 'nc2-networking must not be "Nc2-networking"');
    assertEqual(breadcrumbFor('/pe/storage').page, 'Storage Containers', 'pe/storage must use the sidebar label');
    assertEqual(breadcrumbFor('/pc/network').page, 'VPCs & Subnets', 'pc/network must use the sidebar label');
});

await runner.test('breadcrumb context is Prism Central / Prism Element / Study Tracks', async () => {
    assertEqual(breadcrumbFor('/pc/dashboard').context, 'Prism Central');
    assertEqual(breadcrumbFor('/pc/vms').context, 'Prism Central');
    assertEqual(breadcrumbFor('/pe/dashboard').context, 'Prism Element');
    assertEqual(breadcrumbFor('/pe/health').context, 'Prism Element');
    assertEqual(breadcrumbFor('/tracks').context, 'Study Tracks', '/tracks must not claim Prism Element');
    assertEqual(breadcrumbFor('/practice/COMPTIA-A-1201').context, 'Study Tracks', '/practice must not claim Prism Element');
});

await runner.test('breadcrumb root href and default page', async () => {
    assertEqual(breadcrumbFor('/pc').href, '#/pc/dashboard');
    assertEqual(breadcrumbFor('/pe').href, '#/pe/dashboard');
    assertEqual(breadcrumbFor('/tracks').href, '#/tracks');
    assertEqual(breadcrumbFor('/tracks').page, 'All Tracks');
    assertEqual(breadcrumbFor('/practice').page, 'Practice');
    assertEqual(breadcrumbFor('/pc').page, 'Dashboard');
    assertEqual(breadcrumbFor('/pe').page, 'Dashboard');
});

await runner.test('dynamic IDs stay honest IDs (never fake-title-cased)', async () => {
    // Content IDs must not be renamed into display labels (R-18 / never renumber).
    assertEqual(labelForSegment('COMPTIA-A-1201'), 'COMPTIA-A-1201');
    assertEqual(breadcrumbFor('/tracks/COMPTIA-A-1201').page, 'COMPTIA-A-1201');
    assertEqual(breadcrumbFor('/practice/COMPTIA-NET-009').page, 'COMPTIA-NET-009');
    assertEqual(labelForSegment('core1-a2-fixtures.md'), 'core1-a2-fixtures.md');
});

await runner.test('nested study pages label the known middle segments', async () => {
    assertEqual(breadcrumbFor('/tracks/COMPTIA-A-1201/lessons').page, 'COMPTIA-A-1201 > Lessons');
});

// ─── Placeholder surface — honest copy, no "Coming Soon" ────────────────

await runner.test('PLACEHOLDER_COPY is honest (not Coming Soon / under development)', async () => {
    assert(PLACEHOLDER_COPY.title, 'placeholder title must be set');
    assert(!/coming soon/i.test(PLACEHOLDER_COPY.title), 'placeholder title must not say Coming Soon');
    assert(!/coming soon/i.test(PLACEHOLDER_COPY.body), 'placeholder body must not say Coming Soon');
    assert(!/under development/i.test(PLACEHOLDER_COPY.body), 'placeholder body must not claim under development');
});

await runner.test('PlaceholderView renders the fixed copy and route context', async () => {
    const view = new PlaceholderView(undefined, '/tracks');
    const el = await view.render();
    const text = el.textContent;
    assert(text.includes(PLACEHOLDER_COPY.title), 'placeholder must use the fixed title');
    assert(text.includes(PLACEHOLDER_COPY.body), 'placeholder must use the fixed body');
    assert(text.includes('Study Tracks'), 'placeholder context must follow breadcrumbFor');
    assert(!/coming soon/i.test(text), 'placeholder must not render Coming Soon');
    assert(!/under development/i.test(text), 'placeholder must not render under development');
});

// ─── Regression pin: the old slugified / wrong-context failures ─────────

await runner.test('OldFailure_SlugifiedBreadcrumbLabels_ArePinnedOut', async () => {
    const failures = [
        ['Pc-settings', breadcrumbFor('/pc/pc-settings').page],
        ['Nai-tools', breadcrumbFor('/pc/nai-tools').page],
        ['Ai-models', breadcrumbFor('/pc/ai-models').page],
        ['Nc2-networking', breadcrumbFor('/pc/nc2-networking').page],
    ];
    for (const [old, now] of failures) {
        assert(now !== old, `label must never regress to "${old}" (got "${now}")`);
    }
    assertNotPrismElementForStudy('/tracks');
    assertNotPrismElementForStudy('/practice/COMPTIA-A-1201');
});

function assertNotPrismElementForStudy(path) {
    const ctx = breadcrumbFor(path).context;
    assert(ctx !== 'Prism Element', `${path} must not report Prism Element (got "${ctx}")`);
}

process.exit(runner.done('route-labels-snapshot'));
