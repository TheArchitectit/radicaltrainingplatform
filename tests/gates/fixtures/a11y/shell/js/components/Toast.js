/**
 * Fixture stub for the shell fixture's toast checks.
 *
 * This is what *correct* toast semantics look like: the message lands in the
 * live region, the dismiss control has a name, and only the error kind carries
 * `role="alert"` — so a failure interrupts and a success queues.
 * tests/gates/run_a11y_fixtures.sh mutates a copy of this file to prove the
 * gate's error-toast check can fail, which is the state the real Toast.js was
 * in before Sprints 35-36: every toast was visually identical and only one of
 * them was announced, and the dismiss control was a bare "×".
 *
 * It is deliberately not the real RadicalTrainingPlatform.Web/js/components/
 * Toast.js — the fixture must not break when the real component changes.
 */
class ToastManager {
    show(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        if (type === 'error') toast.setAttribute('role', 'alert');
        toast.innerHTML = `<span class="toast-message">${message}</span>`
            + `<button class="toast-close" type="button" aria-label="Dismiss notification">×</button>`;

        container.appendChild(toast);
    }

    success(message) { this.show(message, 'success'); }
    error(message) { this.show(message, 'error'); }
    warning(message) { this.show(message, 'warning'); }
    info(message) { this.show(message, 'info'); }
}

export const toast = new ToastManager();
