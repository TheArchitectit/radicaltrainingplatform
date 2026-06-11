/**
 * Toast — Notification system for success/error/warning messages.
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
        toast.innerHTML = `
            <span class="toast-message">${message}</span>
            <button class="toast-close">×</button>
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
