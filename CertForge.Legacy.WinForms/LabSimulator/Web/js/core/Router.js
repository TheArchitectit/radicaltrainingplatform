import { bus } from './EventBus.js';

/**
 * Router — Hash-based SPA routing for Prism views.
 */
class Router {
    #routes = new Map();
    #currentView = null;
    #viewContainer = null;

    constructor() {
        window.addEventListener('hashchange', () => this.#onHashChange());
    }

    /** Set the DOM element where views render. */
    setContainer(el) {
        this.#viewContainer = el;
    }

    /** Register a route: path → ViewClass. */
    register(path, ViewClass) {
        this.#routes.set(path, ViewClass);
    }

    /** Navigate to a path programmatically. */
    navigate(path) {
        window.location.hash = path;
    }

    /** Get current route path. */
    get currentPath() {
        return window.location.hash.slice(1) || '/';
    }

    /** Initialize by processing the current hash. */
    start() {
        this.#onHashChange();
    }

    #onHashChange() {
        const path = this.currentPath;
        const segments = path.split('/').filter(Boolean);
        
        // Try exact match first, then pattern match
        let ViewClass = this.#routes.get(path);
        let params = {};

        if (!ViewClass) {
            // Try wildcard/param matching: /pe/vms/:id
            for (const [pattern, VC] of this.#routes) {
                const match = this.#matchPattern(pattern, path);
                if (match) {
                    ViewClass = VC;
                    params = match;
                    break;
                }
            }
        }

        if (!ViewClass) {
            // Default: redirect to dashboard
            this.navigate('/pe/dashboard');
            return;
        }

        this.#renderView(ViewClass, params, path);
    }

    #matchPattern(pattern, path) {
        const patternParts = pattern.split('/').filter(Boolean);
        const pathParts = path.split('/').filter(Boolean);

        if (patternParts.length !== pathParts.length) return null;

        const params = {};
        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                params[patternParts[i].slice(1)] = pathParts[i];
            } else if (patternParts[i] !== pathParts[i]) {
                return null;
            }
        }
        return params;
    }

    async #renderView(ViewClass, params, path) {
        // Tear down current view
        if (this.#currentView?.destroy) {
            this.#currentView.destroy();
        }

        // Instantiate and render new view
        const view = new ViewClass();
        this.#currentView = view;

        if (this.#viewContainer) {
            this.#viewContainer.innerHTML = '';
            const el = await view.render(params);
            if (el) this.#viewContainer.appendChild(el);
            if (view.afterRender) view.afterRender(params);
        }

        bus.emit('route:changed', { path, params });
    }
}

export const router = new Router();
