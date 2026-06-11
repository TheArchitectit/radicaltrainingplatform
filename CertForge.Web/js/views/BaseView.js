/**
 * BaseView — Abstract view lifecycle contract.
 * All views extend this class.
 */
export class BaseView {
    /**
     * Render the view and return a DOM element.
     * @param {Object} params — Route parameters
     * @returns {HTMLElement}
     */
    async render(params) {
        const el = document.createElement('div');
        el.className = 'view';
        el.innerHTML = '<p>View not implemented</p>';
        return el;
    }

    /** Called after the view element is inserted into the DOM. */
    afterRender(params) {}

    /** Called before the view is removed. Clean up listeners here. */
    destroy() {}

    /** Helper: create an element with optional class and text. */
    el(tag, className, text) {
        const e = document.createElement(tag);
        if (className) e.className = className;
        if (text) e.textContent = text;
        return e;
    }

    /** Helper: shorthand for innerHTML-based rendering. */
    html(template) {
        const el = document.createElement('div');
        el.className = 'view';
        el.innerHTML = template;
        return el;
    }
}
