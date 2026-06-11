/**
 * Confirm — Modal confirmation dialog for destructive actions.
 */
export function confirm({ title = 'Confirm', message = 'Are you sure?', confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false }) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal" style="min-width:400px;max-width:480px;">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn cancel-btn">${cancelLabel}</button>
                    <button class="btn ${danger ? 'btn-danger' : 'btn-primary'} confirm-btn">${confirmLabel}</button>
                </div>
            </div>
        `;

        const close = (result) => {
            overlay.remove();
            resolve(result);
        };

        overlay.querySelector('.modal-close').addEventListener('click', () => close(false));
        overlay.querySelector('.cancel-btn').addEventListener('click', () => close(false));
        overlay.querySelector('.confirm-btn').addEventListener('click', () => close(true));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });

        document.body.appendChild(overlay);
    });
}
