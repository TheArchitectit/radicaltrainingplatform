/**
 * The click-reachable wizard section of the web accessibility gate
 * (tests/e2e/a11y-web.mjs): the shared `Wizard` component's dialog contract,
 * plus contrast and control names on the steps it renders.
 */
import { ROUTES, WIZARD_ROUTE, WIZARD_TRIGGER, PER_RULE_CAP, fail, pass, say } from './config.mjs';
import { AUDIT_EXPR } from './page-audit.mjs';
import { wizardOpen, dialogInspect, dialogFocusLast, dialogState } from './probes.mjs';

export async function auditWizard({ navigate, evaluate, pressKey }) {
    // ── Click-reachable UI: the create-VM wizard ──
    // Everything above audits the page as it loads. The shared `Wizard`
    // component is the app's main multi-step surface and is reachable
    // from ~25 views, but it is created by a click and torn down on
    // close, so it is never on screen during the per-route sweep — the
    // step-number contrast failure (white on `--prism-blue`, 2.70:1)
    // was found by reading the CSS, not by this gate. Opening it here is
    // what turns that fix from "believed correct" into "measured", and
    // it puts the dialog contract on a second component so a regression
    // in either is caught.
    say('');
    say('click-reachable wizard (the shared Wizard component):');
    // The real tree carries the wizard on `/pe/vms`; the stub shell has no
    // routes and falls back to its single target, which carries the same
    // control id.
    await navigate(ROUTES.find((r) => r.endsWith(`#${WIZARD_ROUTE}`)) || ROUTES[0]);
    const wizard = await evaluate(`(${String(wizardOpen)})(${JSON.stringify(WIZARD_TRIGGER)})`);
    if (!wizard.present) {
        fail(`no wizard trigger (#${WIZARD_TRIGGER}) on this route — the click-reachable `
            + 'surface could not be audited');
    } else if (!wizard.open) {
        fail('clicking the wizard trigger did not open the wizard — it could not be audited');
    } else {
        const wInfo = await evaluate(`(${String(dialogInspect)})()`);
        if (wInfo.role !== 'dialog' && wInfo.role !== 'alertdialog') {
            fail(`the wizard has no role="dialog" (role is ${JSON.stringify(wInfo.role)})`);
        }
        if (wInfo.ariaModal !== 'true') {
            fail(`the wizard does not set aria-modal="true" (it is ${JSON.stringify(wInfo.ariaModal)})`);
        }
        if (!(wInfo.labelledby && wInfo.labelledbyResolves) && !wInfo.ariaLabel) {
            fail('the wizard has no accessible name (no resolving aria-labelledby, no aria-label)');
        }
        if (!wInfo.activeInside) {
            fail(`opening the wizard left focus outside it (active element is ${wInfo.activeTag})`);
        }

        // Contrast and control names, on the wizard as it actually renders
        // — the step numbers and the per-step form controls exist only here.
        const wResult = await evaluate(AUDIT_EXPR);
        const wFindings = (wResult?.violations || [])
            .filter((v) => v.rule === 'contrast' || v.rule === 'control-name');
        if (!wFindings.length) {
            pass(`the open wizard renders with no contrast or control-name findings `
                + `(${wInfo.focusables} focusable controls)`);
        } else {
            for (const v of wFindings.slice(0, PER_RULE_CAP * 2)) {
                fail(`${v.rule} @ open wizard: ${v.detail}`);
            }
        }

        // The dialog contract, on the wizard: trap, Escape, focus restore.
        if (await evaluate(`(${String(dialogFocusLast)})()`)) {
            await pressKey('Tab', 'Tab', 9);
            let wState = await evaluate(`(${String(dialogState)})()`);
            if (!wState.inside) {
                fail(`Tab from the last control in the wizard moved focus outside it (to ${wState.active})`);
            } else {
                pass('Tab from the last control stays inside the wizard');
            }
            await pressKey('Escape', 'Escape', 27);
            wState = await evaluate(`(${String(dialogState)})()`);
            if (wState.open) fail('Escape did not close the wizard');
            else pass('Escape closes the wizard');
            if (wState.openerFocused) pass('closing the wizard restores focus to the opener');
            else fail(`closing the wizard did not restore focus to the opener (focus is on ${wState.active})`);
        }
        // If Escape did not close it, make sure nothing is left open for
        // the console check below.
        await evaluate(`(async () => { const m = document.querySelector('.modal-overlay');`
            + ` if (m) { const b = m.querySelector('.cancel-btn'); if (b) b.click(); else m.remove(); }`
            + ` return true; })()`);
    }
}
