const STORAGE_KEY = 'nutanix-lab-theme';

/** The learner's explicit choice, or null if they have never made one. */
function storedTheme() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === 'light' || stored === 'dark' ? stored : null;
    } catch (e) {
        // Storage can be blocked (private windows, hardened settings). An
        // unreadable choice is the same as no choice, not a reason to fail.
        return null;
    }
}

/**
 * The operating system's preference, for a learner who has not chosen.
 *
 * The media query is the only signal available to a static page, and it is
 * consulted rather than assumed: before Sprints 35-36 the fallback was the
 * hard-coded string 'dark', so a learner whose OS asks for light got a dark
 * page and no way to say otherwise (S35-05).
 */
function systemTheme() {
    if (typeof matchMedia !== 'function') return 'dark';
    return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/** The theme in force: an explicit choice always wins over the OS. */
function getTheme() {
    return storedTheme() || systemTheme();
}

/** Put a theme on the document and report it on the toggle button. */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    // The button's name is static ("Dark mode"); `aria-pressed` carries the
    // state, so a screen reader hears "Dark mode, toggle button, pressed"
    // rather than having to infer the state from a colour-font emoji, which no
    // screen reader describes (S35-06).
    btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
}

/**
 * Choose a theme explicitly. This is the only path that persists — the OS
 * preference is re-read on every load until the learner overrides it, so a
 * change to the OS setting is still honoured the next time they open the app.
 */
function setTheme(theme) {
    applyTheme(theme);
    try {
        localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
        // The theme is still applied for this session; it just will not survive
        // a reload. Better than refusing to switch at all.
    }
}

function toggleTheme() {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

function initTheme() {
    // Deliberately not `setTheme(getTheme())`: applying must not persist, or
    // the first load would freeze the OS preference into an explicit choice.
    applyTheme(getTheme());
    document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);

    // Follow the OS while the learner has made no choice. An explicit choice is
    // sticky, so this listener is a no-op for anyone who has used the toggle.
    if (typeof matchMedia === 'function') {
        const query = matchMedia('(prefers-color-scheme: light)');
        const follow = () => { if (!storedTheme()) applyTheme(systemTheme()); };
        if (typeof query.addEventListener === 'function') query.addEventListener('change', follow);
        else if (typeof query.addListener === 'function') query.addListener(follow);
    }
}

export { initTheme, toggleTheme, getTheme, setTheme };
