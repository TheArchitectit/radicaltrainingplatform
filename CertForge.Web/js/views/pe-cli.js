import { BaseView } from './BaseView.js';
import { CLITerminal } from '../components/CLITerminal.js';

/**
 * PE CLI Terminal — Interactive Nutanix CLI simulator.
 */
export class PeCliView extends BaseView {
    #terminal = null;

    async render() {
        const el = document.createElement('div');
        el.className = 'view';
        el.style.cssText = 'display:flex;flex-direction:column;height:100%;padding:0;';

        const header = document.createElement('div');
        header.className = 'page-title';
        header.style.padding = 'var(--space-lg) var(--space-xl) 0';
        header.innerHTML = `<h1>CLI Terminal</h1><span class="text-secondary text-sm">14 tools available — Type 'help' to see commands</span>`;
        el.appendChild(header);

        const termWrapper = document.createElement('div');
        termWrapper.style.cssText = 'flex:1;padding:var(--space-lg) var(--space-xl) var(--space-xl);min-height:0;';

        this.#terminal = new CLITerminal();
        termWrapper.appendChild(this.#terminal.render());
        el.appendChild(termWrapper);

        return el;
    }

    afterRender() {
        this.#terminal?.focus();
    }

    destroy() {
        this.#terminal?.destroy();
    }
}
