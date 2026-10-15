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
 *
 * Accessibility (S37-…). This component is reachable from ~25 views and is the
 * app's main multi-step surface, but it existed only behind a click, so neither
 * the Sprint 35-36 audit nor anything since had ever opened it — the step-number
 * contrast failure was found by reading the CSS, not by the gate. It now carries
 * the same dialog contract as `Confirm.js`:
 *
 *   - role="dialog" + aria-modal="true" + aria-labelledby → a name, and the rest
 *     of the page announced as inert while it is open;
 *   - focus moves into the step body on open and on every step change, so a
 *     keyboard user lands in the form rather than at the top of the document;
 *   - Tab and Shift+Tab wrap inside the wizard;
 *   - Escape cancels, from anywhere — the handler is on `document`, not the
 *     overlay, because an overlay-level handler only fires while focus is already
 *     inside and so cannot recover from the escape it exists to prevent;
 *   - closing returns focus to whatever opened the wizard.
 *
 * The title id is per-instance rather than fixed. `Confirm.js` uses a constant id
 * and two simultaneous confirmations would collide (a recorded residual defect);
 * a wizard can be opened from a view that already has one open, so it does not
 * repeat that mistake.
 */
let wizardSeq = 0;

export class Wizard {
    #config;
    #data = {};
    #currentStep = 0;
    #overlay = null;
    #opener = null;
    #titleId = `wizard-dialog-title-${++wizardSeq}`;
    #onKeydown = null;

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
        // Captured before the dialog exists, so it is the control that opened it.
        this.#opener = document.activeElement;
        this.#currentStep = 0;
        this.#render();
    }

    close() {
        this.#teardown();
        this.#config.onCancel?.();
    }

    getData() {
        return { ...this.#data };
    }

    /** Remove the overlay and its document-level listener, and restore focus. */
    #teardown() {
        if (this.#onKeydown) {
            document.removeEventListener('keydown', this.#onKeydown, true);
            this.#onKeydown = null;
        }
        this.#overlay?.remove();
        this.#overlay = null;
        const opener = this.#opener;
        this.#opener = null;
        // If the opener has since left the document, focus stays where the
        // browser puts it rather than being sent to a node that no longer exists.
        if (opener && typeof opener.focus === 'function' && document.contains(opener)) {
            opener.focus();
        }
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
            <div class="modal" role="dialog" aria-modal="true" aria-labelledby="${this.#titleId}" style="min-width:600px;max-width:800px;">
                <div class="modal-header">
                    <h2 id="${this.#titleId}">${this.#config.title}</h2>
                    <button class="modal-close" type="button" aria-label="Close wizard">×</button>
                </div>
                <div class="wizard-steps">${stepsHtml}</div>
                <div class="modal-body wizard-body" id="wizard-step-body"></div>
                <div class="wizard-errors" id="wizard-errors" style="padding:0 24px;color:var(--status-critical-ink);font-size:12px;"></div>
                <div class="modal-footer">
                    <button class="btn cancel-btn" type="button">Cancel</button>
                    ${!isFirst ? '<button class="btn back-btn" type="button">← Back</button>' : ''}
                    <button class="btn btn-primary next-btn" type="button">${isLast ? 'Submit' : 'Next →'}</button>
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

        // Associate each step's labels with its controls. Every view that builds
        // a step writes `<label class="form-label">VM Name</label>` next to its
        // `<input class="form-input">` with no `for`/`id` pair, so the control has
        // no accessible name at all — the wizard's inputs were unnamed in all ~25
        // views and nothing measured it, because nothing opened a wizard. Doing it
        // here rather than in each view means a view cannot forget, and a new step
        // gets it for free.
        this.#labelStepControls(body);

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

        // Escape and the Tab trap. Re-bound on every render because each step
        // replaces the overlay; the previous listener is dropped first so two
        // steps do not leave two handlers fighting over the same key.
        if (this.#onKeydown) document.removeEventListener('keydown', this.#onKeydown, true);
        this.#onKeydown = (event) => this.#handleKeydown(event);
        document.addEventListener('keydown', this.#onKeydown, true);

        this.#focusInto(body);
    }

    /**
     * Give every unassociated `<label>` in the step body a `for` pointing at the
     * control it sits with, generating an id when the control has none.
     *
     * A label is skipped when it already has a `for`, or when it *wraps* its
     * control (implicit association, which needs no `for`), or when the control
     * already carries its own name via `aria-label`/`aria-labelledby` — in each
     * case the name exists and adding one would be noise. The generated id is
     * namespaced by the dialog's title id, which is unique per instance, so two
     * wizards on one page cannot collide.
     */
    #labelStepControls(body) {
        if (!body) return;
        let n = 0;
        for (const label of body.querySelectorAll('label:not([for])')) {
            if (label.querySelector('input, select, textarea')) continue;
            const group = label.parentElement;
            if (!group) continue;
            const control = group.querySelector('input:not([type="hidden"]), select, textarea');
            if (!control) continue;
            if (control.getAttribute('aria-label') || control.getAttribute('aria-labelledby')) continue;
            if (!control.id) control.id = `${this.#titleId}-field-${++n}`;
            label.setAttribute('for', control.id);
        }
    }

    /**
     * Focus the first control in the step body, or the dialog itself when the
     * step has none. Landing on the first field is what makes a wizard usable
     * from the keyboard; a step with only prose would otherwise drop focus to
     * `<body>` and leave the trap with nothing to hold.
     */
    #focusInto(body) {
        const first = body?.querySelector(
            'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])');
        if (first) {
            first.focus();
            return;
        }
        const dialog = this.#overlay.querySelector('.modal');
        dialog.setAttribute('tabindex', '-1');
        dialog.focus();
    }

    #stopsIn() {
        return [...this.#overlay.querySelectorAll(
            'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])')]
            .filter((el) => !el.hasAttribute('disabled'));
    }

    #handleKeydown(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            this.close();
            return;
        }
        if (event.key !== 'Tab') return;
        const stops = this.#stopsIn();
        if (!stops.length) return;
        const first = stops[0];
        const last = stops[stops.length - 1];
        const active = document.activeElement;
        const outside = !this.#overlay.contains(active);
        if (event.shiftKey && (active === first || outside)) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && (active === last || outside)) {
            event.preventDefault();
            first.focus();
        }
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
            // Complete: same teardown as Cancel, so the Escape/Tab handler is
            // removed and focus returns to the opener on the way out.
            const data = { ...this.#data };
            this.#teardown();
            this.#config.onComplete?.(data);
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
