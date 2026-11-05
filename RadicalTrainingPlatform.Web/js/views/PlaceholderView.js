import { BaseView } from './BaseView.js';
import { PLACEHOLDER_COPY, breadcrumbFor } from '../core/RouteLabels.js';

/**
 * Placeholder view for routes not yet implemented.
 * Copy is fixed (T-43 / R-22) — never "Coming Soon" for a real surface.
 */
export class PlaceholderView extends BaseView {
    #title;
    #route;

    constructor(title = PLACEHOLDER_COPY.title, route = '') {
        super();
        this.#title = title || PLACEHOLDER_COPY.title;
        this.#route = route;
    }

    async render(_params, path = this.#route) {
        const crumb = breadcrumbFor(path);
        return this.html(`
            <div class="empty-state" style="padding-top: 80px;">
                <div class="icon">🚧</div>
                <h3>${this.#title}</h3>
                <p>${PLACEHOLDER_COPY.body}</p>
                <p class="text-secondary text-sm" style="margin-top: var(--space-md);">
                    Context: ${crumb.context}
                </p>
            </div>
        `);
    }
}
