/**
 * app-loader.js — Generic simulator bootstrapper.
 * Reads manifest.json, dynamically imports views, wires the router.
 * Vendor-neutral: works for Nutanix, AWS, Azure, or any vendor.
 */
import { Router } from './core/Router.js';
import { EventBus } from './core/EventBus.js';
import { BridgeClient } from './core/BridgeClient.js';

const bus = new EventBus();
const router = new Router();
const bridge = new BridgeClient();

// ─── Boot sequence ──────────────────────────────────────────────

async function boot() {
    // 1. Load vendor manifest
    const manifest = await fetch('./manifest.json').then(r => r.json());

    // 2. Set page title
    document.title = manifest.displayName || 'Lab Simulator';

    // 3. Apply theme from manifest
    applyTheme(manifest.theme || {});

    // 4. Populate context switcher from manifest
    populateContexts(manifest.contexts || []);

    // 5. Set up routing — dynamically import each view declared in manifest
    router.setContainer(document.getElementById('view-container'));

    for (const [path, config] of Object.entries(manifest.routes || {})) {
        try {
            const module = await import(`./${config.file}`);
            const ViewClass = module.default || module[config.view];
            if (ViewClass) {
                router.register(path, ViewClass);
            }
        } catch (e) {
            console.warn(`[AppLoader] Failed to load view ${config.view} from ${config.file}:`, e);
        }
    }

    // 6. Navigate to root route
    router.navigate(manifest.rootRoute || '/dashboard');
    router.start();

    // 7. Notify C# bridge we're ready
    bridge.post('ready', { vendor: manifest.vendor });

    // 8. Wire sidebar navigation from manifest routes
    buildSidebar(manifest);
}

// ─── Theme Application ──────────────────────────────────────────

function applyTheme(theme) {
    const root = document.documentElement;
    if (theme.primary)   root.style.setProperty('--primary', theme.primary);
    if (theme.secondary) root.style.setProperty('--secondary', theme.secondary);
    if (theme.accent)    root.style.setProperty('--accent', theme.accent);
}

// ─── Context Switcher ───────────────────────────────────────────

function populateContexts(contexts) {
    const select = document.getElementById('context-switcher');
    if (!select || contexts.length === 0) return;

    contexts.forEach(ctx => {
        const opt = document.createElement('option');
        opt.value = ctx.id;
        opt.textContent = `${ctx.icon || ''} ${ctx.label}`;
        select.appendChild(opt);
    });
}

// ─── Sidebar ────────────────────────────────────────────────────

function buildSidebar(manifest) {
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;

    const routes = manifest.routes || {};
    for (const [path, config] of Object.entries(routes)) {
        const a = document.createElement('a');
        a.href = `#${path}`;
        a.textContent = config.title || path;
        a.className = 'sidebar-link';
        nav.appendChild(a);
    }
}

// ─── Go ──────────────────────────────────────────────────────────

boot().catch(e => console.error('[AppLoader] Boot failed:', e));
