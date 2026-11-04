/**
 * In-page probes for the web accessibility gate (tests/e2e/a11y-web.mjs).
 *
 * Each probe is a self-contained browser-side function injected with String(fn)
 * and evaluated through the CDP driver. They report state; the decisions and
 * their messages live in the section modules that call them.
 */

// The dialog probe: open the app's own confirm dialog and report its semantics.
export function dialogOpen() {
    return (async () => {
        const mod = await import('/js/components/Confirm.js');
        const opener = document.getElementById('theme-toggle-btn')
            || document.querySelector('button')
            || document.body;
        opener.focus();
        window.__a11yOpener = opener;
        window.__a11yPromise = mod.confirm({
            title: 'Accessibility probe',
            message: 'This dialog is opened by the accessibility gate.',
        });
        await new Promise((r) => setTimeout(r, 60));
        return !!document.querySelector('.modal-overlay');
    })();
}

export function dialogInspect() {
    const overlay = document.querySelector('.modal-overlay');
    if (!overlay) return { present: false };
    const dialog = overlay.querySelector('[role="dialog"]')
        || overlay.querySelector('[role="alertdialog"]')
        || overlay.querySelector('.modal')
        || overlay;
    const labelledby = dialog.getAttribute('aria-labelledby') || overlay.getAttribute('aria-labelledby');
    const target = labelledby ? document.getElementById(labelledby.split(/\s+/)[0]) : null;
    const focusables = [...dialog.querySelectorAll(
        'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])')]
        .filter((el) => !el.hasAttribute('disabled'));
    return {
        present: true,
        role: dialog.getAttribute('role') || overlay.getAttribute('role') || null,
        ariaModal: dialog.getAttribute('aria-modal') || overlay.getAttribute('aria-modal') || null,
        labelledby,
        labelledbyResolves: !!target,
        ariaLabel: dialog.getAttribute('aria-label') || overlay.getAttribute('aria-label') || null,
        activeInside: dialog.contains(document.activeElement),
        activeTag: document.activeElement.tagName + (document.activeElement.id ? '#' + document.activeElement.id : ''),
        unnamedButtons: [...dialog.querySelectorAll('button')]
            .filter((b) => !(b.getAttribute('aria-label') || b.getAttribute('title') || b.textContent.trim()).trim())
            .map((b) => b.className || b.outerHTML.slice(0, 60)),
        focusables: focusables.length,
    };
}

export function dialogFocusLast() {
    const overlay = document.querySelector('.modal-overlay');
    if (!overlay) return false;
    const dialog = overlay.querySelector('[role="dialog"]') || overlay.querySelector('.modal') || overlay;
    const focusables = [...dialog.querySelectorAll(
        'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])')]
        .filter((el) => !el.hasAttribute('disabled'));
    if (!focusables.length) return false;
    focusables[focusables.length - 1].focus();
    return true;
}

export function dialogState() {
    const overlay = document.querySelector('.modal-overlay');
    return {
        open: !!overlay,
        inside: overlay ? overlay.contains(document.activeElement) : false,
        active: document.activeElement
            ? document.activeElement.tagName + (document.activeElement.id ? '#' + document.activeElement.id : '')
            : null,
        openerFocused: document.activeElement === window.__a11yOpener,
    };
}

// The click-reachable wizard probe.
//
// The shared `Wizard` component is the app's main multi-step surface and is
// reachable from ~25 views, but it exists only after a click, so the per-route
// audit above never opens it. That blind spot is exactly why the step-number
// contrast failure was found by reading the CSS rather than by this gate. This
// opens the real create-VM wizard by clicking the real control, so the fix is
// measured rather than believed.
export function wizardOpen(triggerId) {
    return (async () => {
        const btn = document.getElementById(triggerId);
        if (!btn) return { present: false, open: false };
        btn.focus();
        window.__a11yOpener = btn;
        btn.click();
        await new Promise((r) => setTimeout(r, 80));
        return { present: true, open: !!document.querySelector('.modal-overlay') };
    })();
}
