/**
 * Wizard — Multi-step wizard framework for create/edit workflows.
 *
 * Usage:
 *   const wizard = new Wizard({
 *     title: 'Create VM',
 *     steps: [
 *       { label: 'General', render: (data) => html, validate: (data) => errors },
 *       { label: 'Disks', render: (data) => html },
 *       { label: 'NICs', render: (data) => html },
 *       { label: 'Review', render: (data) => html },
 *     ],
 *     onComplete: async (data) => { ... },
 *     initialData: {},
 *   });
 *   wizard.open();
 */
export class Wizard {
    #config;
    #data = {};
    #currentStep = 0;
    #overlay = null;

    constructor(config) {
        this.#config = {
            title: 'Wizard',
            steps: [],
            onComplete: null,
            onCancel: null,
            initialData: {},
            ...config,
        };
        this.#data = { ...this.#config.initialData };
    }

    open() {
        this.#currentStep = 0;
        this.#render();
    }

    close() {
        this.#overlay?.remove();
        this.#overlay = null;
        this.#config.onCancel?.();
    }

    getData() {
        return { ...this.#data };
    }

    #render() {
        if (this.#overlay) this.#overlay.remove();

        const steps = this.#config.steps;
        const step = steps[this.#currentStep];

        this.#overlay = document.createElement('div');
        this.#overlay.className = 'modal-overlay';

        const stepsHtml = steps.map((s, i) => {
            const cls = i < this.#currentStep ? 'completed' : i === this.#currentStep ? 'active' : '';
            const num = i < this.#currentStep ? '✓' : i + 1;
            const connector = i < steps.length - 1
                ? `<div class="wizard-connector ${i < this.#currentStep ? 'completed' : ''}"></div>`
                : '';
            return `<div class="wizard-step ${cls}"><span class="step-number">${num}</span>${s.label}</div>${connector}`;
        }).join('');

        const isFirst = this.#currentStep === 0;
        const isLast = this.#currentStep === steps.length - 1;

        this.#overlay.innerHTML = `
            <div class="modal" style="min-width:600px;max-width:800px;">
                <div class="modal-header">
                    <h2>${this.#config.title}</h2>
                    <button class="modal-close">×</button>
                </div>
                <div class="wizard-steps">${stepsHtml}</div>
                <div class="modal-body wizard-body" id="wizard-step-body"></div>
                <div class="wizard-errors" id="wizard-errors" style="padding:0 24px;color:var(--status-critical);font-size:12px;"></div>
                <div class="modal-footer">
                    <button class="btn cancel-btn">Cancel</button>
                    ${!isFirst ? '<button class="btn back-btn">← Back</button>' : ''}
                    <button class="btn btn-primary next-btn">${isLast ? 'Submit' : 'Next →'}</button>
                </div>
            </div>
        `;

        // Render step content
        const body = this.#overlay.querySelector('#wizard-step-body');
        const content = step.render(this.#data);
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            body.appendChild(content);
        }

        // Bind step inputs to data
        if (step.bind) step.bind(body, this.#data);

        // Wire events
        this.#overlay.querySelector('.modal-close').addEventListener('click', () => this.close());
        this.#overlay.querySelector('.cancel-btn').addEventListener('click', () => this.close());
        this.#overlay.addEventListener('click', (e) => { if (e.target === this.#overlay) this.close(); });

        const backBtn = this.#overlay.querySelector('.back-btn');
        if (backBtn) backBtn.addEventListener('click', () => this.#goBack());

        this.#overlay.querySelector('.next-btn').addEventListener('click', () => this.#goNext(body));

        document.body.appendChild(this.#overlay);
    }

    #collectInputs(body) {
        body.querySelectorAll('[data-field]').forEach(input => {
            const field = input.dataset.field;
            if (input.type === 'checkbox') {
                this.#data[field] = input.checked;
            } else if (input.type === 'number') {
                this.#data[field] = Number(input.value);
            } else {
                this.#data[field] = input.value;
            }
        });
    }

    #goNext(body) {
        // Collect inputs
        this.#collectInputs(body);

        // Validate
        const step = this.#config.steps[this.#currentStep];
        if (step.validate) {
            const errors = step.validate(this.#data);
            if (errors && errors.length > 0) {
                const errEl = this.#overlay.querySelector('#wizard-errors');
                errEl.innerHTML = errors.map(e => `<div>• ${e}</div>`).join('');
                return;
            }
        }

        if (this.#currentStep < this.#config.steps.length - 1) {
            this.#currentStep++;
            this.#render();
        } else {
            // Complete
            this.#overlay.remove();
            this.#overlay = null;
            this.#config.onComplete?.(this.#data);
        }
    }

    #goBack() {
        if (this.#currentStep > 0) {
            const body = this.#overlay.querySelector('#wizard-step-body');
            this.#collectInputs(body);
            this.#currentStep--;
            this.#render();
        }
    }
}
