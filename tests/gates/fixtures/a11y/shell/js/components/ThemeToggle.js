/**
 * Fixture stub for the shell fixture's theme checks.
 *
 * This is what *correct* system-theme detection looks like: an explicit choice
 * wins, and with no choice stored the OS preference decides.
 * tests/gates/run_a11y_fixtures.sh mutates a copy of this file to prove the
 * gate's "prefers-color-scheme: light, no stored choice" check can fail — which
 * is the state the real ThemeToggle.js was in before Sprints 35-36, where the
 * fallback was the hard-coded string 'dark'.
 *
 * It is deliberately not the real RadicalTrainingPlatform.Web/js/components/
 * ThemeToggle.js — the fixture must not break when the real component changes.
 */
const STORAGE_KEY = 'nutanix-lab-theme';

export function getTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    // A two-state control has to report which state it is in (WCAG 4.1.2).
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
}

export function initTheme() {
    setTheme(getTheme());
    document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
        setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    });
}
