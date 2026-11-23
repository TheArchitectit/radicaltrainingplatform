/**
 * Service-worker registration (S41, local security baseline).
 *
 * Extracted from an inline <script> in index.html so the app can ship a
 * Content-Security-Policy with `script-src 'self'` and no `'unsafe-inline'`.
 * The policy is in index.html; this file is the reason it can be strict.
 */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .catch(err => console.error('[PWA] Service Worker registration failed:', err));
}
