/**
 * Fixture stub for the shell fixture's modal probe.
 *
 * This is what a *correct* dialog looks like, reduced to what the gate checks:
 * role and aria-modal on the container, an accessible name that resolves, focus
 * moved inside on open, a Tab trap, Escape to close, and focus restored to
 * whatever opened it. tests/gates/run_a11y_fixtures.sh mutates a copy of this
 * file to prove each of those checks can fail.
 *
 * It is deliberately not the real RadicalTrainingPlatform.Web/js/components/
 * Confirm.js — the fixture must not break when the real component changes.
 */
export function confirm({ title = 'Confirm' } = {}) {
    return new Promise((resolve) => {
        const opener = document.activeElement;
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal" role="dialog" aria-modal="true" aria-labelledby="fixture-dialog-title">
                <h2 id="fixture-dialog-title">${title}</h2>
                <button class="modal-close" aria-label="Close">×</button>
                <button class="cancel-btn">Cancel</button>
                <button class="confirm-btn">Confirm</button>
            </div>
        `;

        const close = (result) => {
            overlay.remove();
            if (opener && typeof opener.focus === 'function') opener.focus();
            resolve(result);
        };

        overlay.querySelector('.modal-close').addEventListener('click', () => close(false));
        overlay.querySelector('.cancel-btn').addEventListener('click', () => close(false));
        overlay.querySelector('.confirm-btn').addEventListener('click', () => close(true));

        overlay.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                close(false);
                return;
            }
            if (event.key !== 'Tab') return;
            const stops = [...overlay.querySelectorAll('button')];
            if (!stops.length) return;
            const first = stops[0];
            const last = stops[stops.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });

        document.body.appendChild(overlay);
        overlay.querySelector('.cancel-btn').focus();
    });
}
