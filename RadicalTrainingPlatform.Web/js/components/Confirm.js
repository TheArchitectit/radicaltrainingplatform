/**
 * Confirm — Modal confirmation dialog for destructive actions.
 *
 * Accessibility (S35-06). Before Sprints 35-36 this was a `<div class="modal">`:
 * no role, no name, no focus move, no trap, no Escape, and no way back. A
 * keyboard user who opened it had to Tab through the entire page behind it to
 * reach the buttons, and a screen reader user was never told a dialog had
 * opened at all. Now:
 *
 *   - role="dialog" + aria-modal="true" + aria-labelledby → the dialog has a
 *     name, and assistive technology is told the rest of the page is inert;
 *   - focus moves to Cancel on open — the safe option, so an accidental Enter
 *     cannot confirm a destructive action;
 *   - Tab and Shift+Tab wrap inside the dialog instead of escaping to the page;
 *   - Escape cancels, from anywhere;
 *   - closing returns focus to whatever opened the dialog, so the learner is
 *     not dropped back at the top of the document.
 *
 * The key handler is on `document`, not on the overlay: an overlay-level
 * handler only fires while focus is already inside, so it cannot recover from
 * the escape it exists to prevent.
 */
export function confirm({ title = 'Confirm', message = 'Are you sure?', confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false }) {
    return new Promise((resolve) => {
        // Captured before the dialog exists, so it is the control that opened it.
        const opener = document.activeElement;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" style="min-width:400px;max-width:480px;">
                <div class="modal-header">
                    <h2 id="confirm-dialog-title">${title}</h2>
                    <button class="modal-close" type="button" aria-label="Close dialog">×</button>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn cancel-btn" type="button">${cancelLabel}</button>
                    <button class="btn ${danger ? 'btn-danger' : 'btn-primary'} confirm-btn" type="button">${confirmLabel}</button>
                </div>
            </div>
        `;

        const close = (result) => {
            document.removeEventListener('keydown', onKeydown, true);
            overlay.remove();
            // Return focus where it was. If the opener has since left the
            // document, focus stays where the browser puts it rather than being
            // sent to an element that no longer exists.
            if (opener && typeof opener.focus === 'function' && document.contains(opener)) {
                opener.focus();
            }
            resolve(result);
        };

        const stopsIn = () => [...overlay.querySelectorAll(
            'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])')]
            .filter((el) => !el.hasAttribute('disabled'));

        function onKeydown(event) {
            if (event.key === 'Escape') {
                event.preventDefault();
                close(false);
                return;
            }
            if (event.key !== 'Tab') return;
            const stops = stopsIn();
            if (!stops.length) return;
            const first = stops[0];
            const last = stops[stops.length - 1];
            const active = document.activeElement;
            const outside = !overlay.contains(active);
            if (event.shiftKey && (active === first || outside)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (active === last || outside)) {
                event.preventDefault();
                first.focus();
            }
        }

        overlay.querySelector('.modal-close').addEventListener('click', () => close(false));
        overlay.querySelector('.cancel-btn').addEventListener('click', () => close(false));
        overlay.querySelector('.confirm-btn').addEventListener('click', () => close(true));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
        // Capture phase, so the trap holds even if a view's own handler stops
        // propagation on the way up.
        document.addEventListener('keydown', onKeydown, true);

        document.body.appendChild(overlay);
        // Focus Cancel, not Confirm: the safe default for a destructive action.
        overlay.querySelector('.cancel-btn').focus();
    });
}
