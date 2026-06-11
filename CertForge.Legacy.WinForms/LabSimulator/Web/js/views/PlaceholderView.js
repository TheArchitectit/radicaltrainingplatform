import { BaseView } from './BaseView.js';

/**
 * Placeholder view for routes not yet implemented.
 */
export class PlaceholderView extends BaseView {
    #title;
    #context;

    constructor(title = 'Coming Soon', context = 'pe') {
        super();
        this.#title = title;
        this.#context = context;
    }

    async render() {
        return this.html(`
            <div class="empty-state" style="padding-top: 80px;">
                <div class="icon">🚧</div>
                <h3>${this.#title}</h3>
                <p>This view is under development.</p>
                <p class="text-secondary text-sm" style="margin-top: var(--space-md);">
                    Context: ${this.#context === 'pe' ? 'Prism Element' : 'Prism Central'}
                </p>
            </div>
        `);
    }
}
