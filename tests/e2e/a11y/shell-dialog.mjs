/**
 * The confirm-dialog section of the web accessibility gate
 * (tests/e2e/a11y-web.mjs, S35-06): role, name, focus move, trap, Escape and
 * focus restore.
 */
import { ROUTES, fail, pass, say } from './config.mjs';
import { dialogOpen, dialogInspect, dialogFocusLast, dialogState } from './probes.mjs';

export async function auditDialog({ navigate, evaluate, pressKey }) {
    // ── Dialog semantics, focus management (S35-06) ──
    say('');
    say('modal dialog (role, name, focus move, trap, Escape, restore):');
    await navigate(ROUTES[0]);
    await evaluate(`(${String(dialogOpen)})()`);
    const info = await evaluate(`(${String(dialogInspect)})()`);
    if (!info.present) {
        fail('the confirm dialog did not open — the modal could not be audited');
    } else {
        if (info.role !== 'dialog' && info.role !== 'alertdialog') {
            fail(`the modal has no role="dialog" (role is ${JSON.stringify(info.role)})`);
        }
        if (info.ariaModal !== 'true') {
            fail(`the modal does not set aria-modal="true" (it is ${JSON.stringify(info.ariaModal)})`);
        }
        if (!(info.labelledby && info.labelledbyResolves) && !info.ariaLabel) {
            fail('the modal has no accessible name (no resolving aria-labelledby, no aria-label)');
        }
        if (!info.activeInside) {
            fail(`opening the modal left focus outside it (active element is ${info.activeTag})`);
        }
        if (info.unnamedButtons.length) {
            fail(`the modal has ${info.unnamedButtons.length} button(s) with no accessible name: `
                + info.unnamedButtons.join(', '));
        }
        if (info.role === 'dialog' && info.ariaModal === 'true' && info.activeInside
            && !info.unnamedButtons.length) {
            pass(`the modal is a named, modal, focus-moving dialog (${info.focusables} focusable controls)`);
        }

        // Focus trap: focus the last control, Tab, and require focus to
        // stay inside. Without a trap, Tab leaves for the page behind.
        if (await evaluate(`(${String(dialogFocusLast)})()`)) {
            await pressKey('Tab', 'Tab', 9);
            let state = await evaluate(`(${String(dialogState)})()`);
            if (!state.inside) {
                fail(`Tab from the last control in the modal moved focus outside it (to ${state.active})`);
            } else {
                pass('Tab from the last control stays inside the modal');
            }
            // Escape must close it.
            await pressKey('Escape', 'Escape', 27);
            state = await evaluate(`(${String(dialogState)})()`);
            if (state.open) fail('Escape did not close the modal');
            else pass('Escape closes the modal');
            // …and focus must come back to whatever opened it.
            if (state.openerFocused) pass('closing the modal restores focus to the opener');
            else fail(`closing the modal did not restore focus to the opener (focus is on ${state.active})`);
        }
    }
    // Resolve the promise the probe left pending so it is not an
    // unhandled rejection in the console check below.
    await evaluate(`(async () => { const m = document.querySelector('.modal-overlay');`
        + ` if (m) { const b = m.querySelector('.cancel-btn'); if (b) b.click(); else m.remove(); }`
        + ` try { await window.__a11yPromise; } catch (e) {} return true; })()`);
}
