/**
 * Toast — Notification system for success/error/warning messages.
 *
 * Accessibility (S35-06): a toast that is only visible is a toast a screen
 * reader user never receives. `#toast-container` is the live region (it carries
 * `role="status" aria-live="polite"` in index.html, and `aria-atomic="false"`
 * so a second toast does not re-announce the first). Errors additionally carry
 * `role="alert"` so a failure interrupts rather than queueing behind whatever
 * the reader is currently saying. The dismiss control is named, because "×"
 * is not a name.
 */
const TOAST_DURATION = 4000;

class ToastManager {
    #container = null;

    #getContainer() {
        if (!this.#container) {
            this.#container = document.getElementById('toast-container');
        }
        return this.#container;
    }

    show(message, type = 'info') {
        const container = this.#getContainer();
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        // `role="alert"` on the error toast asserts it above the container's
        // polite default. The other types inherit the container's region, so
        // they are announced without interrupting.
        if (type === 'error') toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <span class="toast-message">${message}</span>
            <button class="toast-close" type="button" aria-label="Dismiss notification">×</button>
        `;

        toast.querySelector('.toast-close').addEventListener('click', () => this.#dismiss(toast));
        container.appendChild(toast);

        setTimeout(() => this.#dismiss(toast), TOAST_DURATION);
    }

    success(message) { this.show(message, 'success'); }
    error(message) { this.show(message, 'error'); }
    warning(message) { this.show(message, 'warning'); }
    info(message) { this.show(message, 'info'); }

    #dismiss(toast) {
        toast.style.animation = 'toast-in 0.2s ease reverse';
        setTimeout(() => toast.remove(), 200);
    }
}

export const toast = new ToastManager();
