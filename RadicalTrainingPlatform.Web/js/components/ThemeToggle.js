const STORAGE_KEY = 'nutanix-lab-theme';

function getTheme() {
    return localStorage.getItem(STORAGE_KEY) || 'dark';
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
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
