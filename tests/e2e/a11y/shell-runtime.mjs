/**
 * The runtime component semantics section of the web accessibility gate
 * (tests/e2e/a11y-web.mjs, S35-02 / S35-06 / S35-07): aria-expanded,
 * aria-pressed and the toast live region, each asserted as state tracking
 * rather than as a fixed literal.
 */
import { ROUTES, fail, pass, say } from './config.mjs';
import { sleep } from './cdp.mjs';

export async function auditRuntimeSemantics({ navigate, evaluate, waitForExpr }) {
    // ── Runtime component semantics (S35-02 / S35-06 / S35-07) ──
    // Three claims the conformance report makes that no static check can
    // hold, because each is a value a component writes at runtime: the
    // hamburger's `aria-expanded` tracks the overlay, the theme toggle's
    // `aria-pressed` tracks the theme, and a toast lands in the live
    // region with a named dismiss control. Driving them here means a
    // regression fails the gate instead of quietly invalidating a claim
    // in the report. They are asserted as *state tracking* — the value
    // must change with the thing it describes — not as a fixed literal,
    // so this cannot pass by the attribute being hard-coded.
    say('');
    say('runtime component semantics:');
    await navigate(ROUTES[0]);

    const hamState = await evaluate(
        `(() => { const b = document.getElementById('hamburger-btn');`
        + ` const o = document.getElementById('hamburger-overlay');`
        + ` return { expanded: b.getAttribute('aria-expanded'),`
        + `          controls: b.getAttribute('aria-controls'),`
        + `          resolves: !!(b.getAttribute('aria-controls')`
        + `              && document.getElementById(b.getAttribute('aria-controls')) === o),`
        + `          name: (b.getAttribute('aria-label') || b.textContent || '').trim() }; })()`);
    if (!hamState.name) fail('the hamburger button has no accessible name');
    if (!hamState.resolves) {
        fail(`the hamburger's aria-controls=${JSON.stringify(hamState.controls)} `
            + 'does not resolve to the overlay it controls');
    }
    if (hamState.expanded !== 'false') {
        fail(`the closed hamburger button reports aria-expanded=${JSON.stringify(hamState.expanded)}`);
    } else {
        await evaluate(`document.getElementById('hamburger-btn').click()`);
        await waitForExpr(
            `!document.getElementById('hamburger-overlay').hasAttribute('inert')`,
            'the hamburger overlay to open');
        const opened = await evaluate(
            `document.getElementById('hamburger-btn').getAttribute('aria-expanded')`);
        await evaluate(`document.getElementById('hamburger-btn').click()`);
        await sleep(200);
        const reclosed = await evaluate(
            `document.getElementById('hamburger-btn').getAttribute('aria-expanded')`);
        if (opened !== 'true' || reclosed !== 'false') {
            fail('the hamburger button does not track the overlay it controls '
                + `(closed=${JSON.stringify(hamState.expanded)}, open=${JSON.stringify(opened)}, `
                + `re-closed=${JSON.stringify(reclosed)})`);
        } else if (hamState.name && hamState.resolves) {
            pass('the hamburger button is named and its aria-expanded tracks the overlay');
        }
    }

    // The theme toggle is a two-state control: `aria-pressed` has to
    // agree with the theme actually applied, both before and after a
    // click. Clicking twice restores the starting theme.
    const toggleBefore = await evaluate(
        `(() => { const b = document.getElementById('theme-toggle-btn');`
        + ` return { pressed: b.getAttribute('aria-pressed'),`
        + `          theme: document.documentElement.getAttribute('data-theme'),`
        + `          name: (b.getAttribute('aria-label') || b.textContent || '').trim() }; })()`);
    const agrees = (s) => (s.theme === 'dark') === (s.pressed === 'true');
    await evaluate(`document.getElementById('theme-toggle-btn').click()`);
    await sleep(120);
    const toggleAfter = await evaluate(
        `(() => { const b = document.getElementById('theme-toggle-btn');`
        + ` return { pressed: b.getAttribute('aria-pressed'),`
        + `          theme: document.documentElement.getAttribute('data-theme') }; })()`);
    await evaluate(`document.getElementById('theme-toggle-btn').click()`);
    await sleep(120);
    if (!toggleBefore.name) {
        fail('the theme toggle has no accessible name');
    } else if (!agrees(toggleBefore) || !agrees(toggleAfter)
        || toggleBefore.theme === toggleAfter.theme) {
        fail('the theme toggle does not track the theme it applies '
            + `(before: theme=${JSON.stringify(toggleBefore.theme)} `
            + `aria-pressed=${JSON.stringify(toggleBefore.pressed)}; after: `
            + `theme=${JSON.stringify(toggleAfter.theme)} `
            + `aria-pressed=${JSON.stringify(toggleAfter.pressed)})`);
    } else {
        pass('the theme toggle is named and its aria-pressed tracks the applied theme');
    }

    // A toast must land in the live region, be dismissable by a named
    // control, and an *error* toast must be the interrupting kind —
    // otherwise every toast reads the same and a failure queues behind
    // whatever the reader is saying.
    const toastState = await evaluate(
        `(async () => { const m = await import('/js/components/Toast.js');`
        + ` const c = document.getElementById('toast-container');`
        + ` const live = c.getAttribute('aria-live');`
        + ` const region = c.getAttribute('role');`
        + ` m.toast.error('a11y gate: synthetic error toast');`
        + ` m.toast.success('a11y gate: synthetic success toast');`
        + ` const toasts = [...c.querySelectorAll('.toast')];`
        + ` const read = (t) => ({ cls: t.className,`
        + `     role: t.getAttribute('role'),`
        + `     dismiss: (() => { const b = t.querySelector('.toast-close');`
        + `         return b ? (b.getAttribute('aria-label') || b.textContent || '').trim() : null; })() });`
        + ` const out = { live, region, toasts: toasts.map(read) };`
        + ` toasts.forEach((t) => t.remove());`
        + ` return out; })()`);
    const errToast = (toastState?.toasts || []).find((t) => /\berror\b/.test(t.cls));
    const okToast = (toastState?.toasts || []).find((t) => /\bsuccess\b/.test(t.cls));
    if (toastState?.live !== 'polite' || !toastState?.region) {
        fail(`the toast container is not a live region (role=${JSON.stringify(toastState?.region)}, `
            + `aria-live=${JSON.stringify(toastState?.live)})`);
    } else if (!errToast || !okToast) {
        fail('a toast did not render into #toast-container');
    } else if (errToast.role !== 'alert') {
        fail(`an error toast is not role="alert" (role=${JSON.stringify(errToast.role)})`);
    } else if (okToast.role === 'alert') {
        fail('a non-error toast is also role="alert" — the two kinds are indistinguishable');
    } else if (!errToast.dismiss || !okToast.dismiss) {
        fail(`a toast dismiss control has no accessible name `
            + `(error=${JSON.stringify(errToast.dismiss)}, success=${JSON.stringify(okToast.dismiss)})`);
    } else {
        pass('a toast is a live-region message with a named dismiss control, '
            + 'and only the error kind is role="alert"');
    }
}
