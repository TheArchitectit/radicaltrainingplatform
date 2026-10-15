/**
 * Fixture stub for the shell fixture's click-reachable wizard probe.
 *
 * This is what a *correct* multi-step wizard looks like, reduced to what the
 * gate checks: role and aria-modal on the container, an accessible name that
 * resolves, focus moved into the step body on open, a Tab trap, Escape to
 * close, and focus restored to whatever opened it — plus step markers whose
 * digits clear AA, which is the check that had no fixture at all until the gate
 * learned to open a wizard (the step-number failure in the real component was
 * found by reading the CSS, not by any audit).
 *
 * It is deliberately not the real RadicalTrainingPlatform.Web/js/components/
 * Wizard.js — the fixture must not break when the real component changes. The
 * class names match, because the gate's checks are written against the real
 * markup (`.modal`, `.modal-close`, `.cancel-btn`, `.next-btn`, `.step-number`).
 */
export class Wizard {
    constructor(config = {}) {
        this.config = config;
        this.step = 0;
    }

    open() {
        this.opener = document.activeElement;
        this.render();
    }

    render() {
        document.querySelector('.modal-overlay')?.remove();
        const steps = this.config.steps || [{ label: 'One' }, { label: 'Two' }];

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal" role="dialog" aria-modal="true" aria-labelledby="fixture-wizard-title">
                <div class="modal-header">
                    <h2 id="fixture-wizard-title">${this.config.title || 'Wizard'}</h2>
                    <button class="modal-close" type="button" aria-label="Close wizard">×</button>
                </div>
                <div class="wizard-steps">${steps.map((s, i) => `
                    <div class="wizard-step ${i === this.step ? 'active' : i < this.step ? 'completed' : ''}">
                        <span class="step-number">${i < this.step ? '✓' : i + 1}</span>${s.label}
                    </div>`).join('')}</div>
                <div class="modal-body wizard-body">
                    <label for="fixture-wizard-field">Name</label>
                    <input id="fixture-wizard-field" type="text">
                </div>
                <div class="modal-footer">
                    <button class="btn cancel-btn" type="button">Cancel</button>
                    <button class="btn btn-primary next-btn" type="button">Next →</button>
                </div>
            </div>
        `;

        const close = () => {
            document.removeEventListener('keydown', onKeydown, true);
            overlay.remove();
            if (this.opener && document.contains(this.opener)) this.opener.focus();
            this.config.onCancel?.();
        };

        const onKeydown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                close();
                return;
            }
            if (event.key !== 'Tab') return;
            const stops = [...overlay.querySelectorAll('button, input')];
            if (!stops.length) return;
            const first = stops[0];
            const last = stops[stops.length - 1];
            const outside = !overlay.contains(document.activeElement);
            if (event.shiftKey && (document.activeElement === first || outside)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (document.activeElement === last || outside)) {
                event.preventDefault();
                first.focus();
            }
        };

        overlay.querySelector('.modal-close').addEventListener('click', close);
        overlay.querySelector('.cancel-btn').addEventListener('click', close);
        overlay.querySelector('.next-btn').addEventListener('click', () => {
            this.step += 1;
            this.render();
        });
        document.addEventListener('keydown', onKeydown, true);

        document.body.appendChild(overlay);
        overlay.querySelector('#fixture-wizard-field').focus();
    }
}
