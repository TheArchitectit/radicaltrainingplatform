/**
 * RouteLabels (T-43 / R-22 cosmetics) — fixed display labels for the
 * breadcrumb and placeholder surfaces.
 *
 * Failing side of the old breadcrumb: path segments were naively
 * title-cased (`pc-settings` → "Pc-settings", `nai-tools` → "Nai-tools",
 * `ai-models` → "Ai-models") and every non-PC root was labeled
 * "Prism Element" — so `/tracks` claimed a Prism Element crumb. Labels
 * here match the sidebar (`index.html` nav) exactly; dynamic IDs stay
 * honest IDs (never re-titled into a display name we do not have).
 */
export const ROUTE_LABELS = {
    '/pc/dashboard': 'Dashboard',
    '/pc/vms': 'VMs',
    '/pc/categories': 'Categories',
    '/pc/clusters': 'Clusters',
    '/pc/network': 'VPCs & Subnets',
    '/pc/flow': 'Flow Security',
    '/pc/leap': 'Leap DR',
    '/pc/alerts': 'Alerts',
    '/pc/planning': 'Planning',
    '/pc/xplay': 'X-Play',
    '/pc/reports': 'Reports',
    '/pc/insights': 'Insights',
    '/pc/rbac': 'Users & Roles',
    '/pc/projects': 'Projects',
    '/pc/api': 'API Explorer',
    '/pc/audit': 'Audit Log',
    '/pc/lcm': 'LCM Updates',
    '/pc/pc-settings': 'Settings',
    '/pc/files': 'Files',
    '/pc/analytics': 'File Analytics',
    '/pc/objects': 'Objects',
    '/pc/volumes': 'Volumes',
    '/pc/nc2-console': 'NC2 Console',
    '/pc/nc2-deploy': 'Deploy Cluster',
    '/pc/nc2-networking': 'Networking',
    '/pc/nc2-monitoring': 'Monitoring',
    '/pc/nc2-scaling': 'Scaling',
    '/pc/gpu': 'GPU Config',
    '/pc/nai': 'NAI Endpoints',
    '/pc/nai-tools': 'NAI Tools',
    '/pc/ai-models': 'AI Models',
    '/pc/ai-monitoring': 'AI Monitoring',
    '/pc/scenarios': 'Guided Scenarios',
    '/pc/calm': 'Calm / Marketplace',
    '/pe/dashboard': 'Dashboard',
    '/pe/vms': 'VMs',
    '/pe/storage': 'Storage Containers',
    '/pe/network': 'Network Config',
    '/pe/images': 'Images',
    '/pe/protection': 'Protection Domains',
    '/pe/hardware': 'Hardware',
    '/pe/health': 'Health',
    '/pe/settings': 'Settings',
    '/pe/cli': 'CLI Terminal',
    '/pe/services': 'Service Diagnostics',
    '/pe/reports': 'Reports',
    '/pe/capacity': 'Capacity Planning',
    '/tracks': 'Study Tracks',
    '/flashcards': 'Flashcards',
    '/search': 'Search',
    // /practice has no sidebar row — it is reached from a study track — so the
    // snapshot fixture carries it as an explicit allowed extra.
    '/practice': 'Practice',
};

/**
 * Labels for path pieces that are not full sidebar routes (study
 * sub-paths). Kept separate so ROUTE_LABELS stays a pure mirror of the
 * sidebar and the snapshot can pin that.
 */
export const SEGMENT_LABELS = {
    lessons: 'Lessons',
};

/** Static label for a known route; otherwise the raw segment (honest ID). */
export function labelForSegment(segment) {
    if (!segment) return '';
    if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];
    if (ROUTE_LABELS['/' + segment]) return ROUTE_LABELS['/' + segment];
    // Nested last segments (e.g. /pc/pc-settings → 'pc-settings').
    for (const [route, label] of Object.entries(ROUTE_LABELS)) {
        if (route.endsWith('/' + segment)) return label;
    }
    // Dynamic IDs and filenames stay as written — never fake-title-cased.
    return segment;
}

/**
 * The roots that are study surfaces rather than simulator chrome. Listed once
 * so `breadcrumbFor` cannot answer "Prism Element" for a study route: the old
 * breadcrumb labeled every non-PC root "Prism Element", so /tracks claimed a
 * Prism Element crumb. /flashcards (S37-03) and /search (S37-07) join them.
 */
const STUDY_ROOTS = {
    tracks: 'All Tracks',
    practice: ROUTE_LABELS['/practice'],
    flashcards: ROUTE_LABELS['/flashcards'],
    search: ROUTE_LABELS['/search'],
};

/**
 * Breadcrumb facts for a hash path. Context is the study surface, Prism
 * Central, or Prism Element — never "Prism Element" for a study route.
 */
export function breadcrumbFor(path) {
    const parts = String(path || '').split('/').filter(Boolean);
    const root = parts[0] || 'pe';

    let context;
    let href;
    if (root === 'pc') {
        context = 'Prism Central';
        href = '#/pc/dashboard';
    } else if (Object.prototype.hasOwnProperty.call(STUDY_ROOTS, root)) {
        context = 'Study Tracks';
        href = '#/tracks';
    } else {
        context = 'Prism Element';
        href = '#/pe/dashboard';
    }

    const rest = parts.slice(1);
    let page;
    if (!rest.length) {
        // A study root's own landing page, from the one table above — so a
        // fourth study route cannot silently fall through to 'Dashboard'.
        page = STUDY_ROOTS[root] || ROUTE_LABELS['/' + root + '/dashboard'] || 'Dashboard';
    } else {
        page = rest.map(labelForSegment).join(' > ');
    }

    return { context, href, page };
}

/** Fixed placeholder copy — never "Coming Soon" for a real product surface. */
export const PLACEHOLDER_COPY = {
    title: 'Not in this build',
    body: 'This section is not part of the current study build.',
};
