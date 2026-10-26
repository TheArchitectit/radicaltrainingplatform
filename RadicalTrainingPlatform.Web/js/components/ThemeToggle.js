const STORAGE_KEY = 'nutanix-lab-theme';

// Storage can throw (private mode, blocked site data); the theme is only a
// convenience, so fall back to dark rather than failing the boot.
function getTheme() {
    try { return localStorage.getItem(STORAGE_KEY) || 'dark'; } catch { return 'dark'; }
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* not persisted */ }
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

function initTheme() {
    setTheme(getTheme());
    document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);
}

export { initTheme, toggleTheme, getTheme, setTheme };
