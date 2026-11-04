/**
 * Flows 6-7 of the keyboard-only demo-loop rehearsal (T-26 / S47-10).
 *
 * Extracted verbatim from tests/e2e/rehearsal-web.mjs. The scenario leg and
 * the reset leg. Failure strings and their order are the failing-side evidence
 * this fixture ships with, so they are copied without rewording.
 */
import { sleep } from './browser.mjs';
import { fail, note, pass, say } from './state.mjs';

// ══ Flow 6: scenario ══════════════════════════════════════════════
//
// Reachability first, and reported separately from completion: the
// ticket lab itself is keyboard-operable, but if no control in the
// shell leads to it then a keyboard user cannot get there at all.
async function runScenario(d) {
    say('');
    say('## Flow 6 — scenario');
    await d.goto('#/tracks');
    const scenarioReach = await d.evaluate(`(() => {
        const focusable = [...document.querySelectorAll('a[href], button, input, select, textarea')];
        const linkToScenarios = focusable.filter(
            e => ((e.getAttribute('href') || '') + (e.dataset?.route || '')).includes('/pc/scenarios'));
        const inertNavItems = [...document.querySelectorAll('.nav-item')]
            .filter(a => !a.getAttribute('href'));
        return {
            focusableLinksToScenarios: linkToScenarios.length,
            inertNavItems: inertNavItems.length,
            inertSample: inertNavItems.slice(0, 3).map(a => a.textContent.trim().slice(0, 24)),
        };
    })()`);
    if (scenarioReach.focusableLinksToScenarios > 0) {
        pass('the scenario view is reachable from a focusable control in the shell');
    } else {
        fail('the scenario view is NOT keyboard-reachable: the only control that leads to '
            + `/pc/scenarios is a nav item with no href (${scenarioReach.inertNavItems} such `
            + 'nav items in the shell), so it is not in the tab order and cannot be activated '
            + 'with Enter or Space');
        note('REQ-DEMO-05 gap — the demo loop\'s scenario leg is mouse-only to enter. The '
            + 'ticket lab inside it IS keyboard-operable (verified below), so the defect is '
            + 'the shell navigation, not the scenario itself.');
    }

    // Complete the ticket by keyboard once there, reached by hash.
    //
    // The predicate must name aplus-dns-01 exactly: every scenario row has
    // a .start-scenario-btn, but only the `ticket` renderer mounts the
    // TicketLabView, so a predicate that matched any Start button would
    // land on a store-based scenario and then blame the lab for the ids it
    // never had.
    await d.goto('#/pc/scenarios');
    // Start the walk from a defined point, because `tabTo` tabs on from
    // whatever currently holds focus. Focus survives a hash change
    // whenever it sits on a shell element — nav items live outside
    // #view-container, so re-rendering the view never detaches them — and
    // an earlier version of this leg was resting on the nav item directly
    // above the first scenario row. It reported "45 Tab presses" for a walk
    // that had skipped the entire shell and started mid-list, so the number
    // understated the real distance by 38 presses and the leg would have
    // passed even if nothing in the shell were reachable. Blurring first
    // makes "reachable by Tab" mean reachable from the top of the page.
    await d.evaluate(`document.activeElement?.blur?.()`);
    // aplus-dns-01 is the 44th scenario row, and the shell contributes ~39
    // stops before the list — ~83 presses in all. The cap is sized to that
    // measured distance plus headroom rather than to a round number that
    // happened to fit while the walk was starting halfway down.
    const startBtn = await d.tabTo(
        (d) => d.sid === 'aplus-dns-01', 'the aplus-dns-01 Start button', 120);
    if (!startBtn.ok) {
        fail(`the aplus-dns-01 Start button is not reachable by Tab `
            + `(stopped on ${JSON.stringify(startBtn.d)})`);
    } else {
        pass(`scenario Start reached by keyboard in ${startBtn.presses} Tab press(es)`);
        await d.key('Enter');
        await sleep(700);
        const mounted = await d.evaluate(`!!document.getElementById('ticket-cfg-dns')`);
        if (!mounted) {
            fail('Enter on Start did not mount the ticket lab');
        } else {
            pass('Enter on Start mounts the ticket lab');

            // The DNS field is the editable one for this scenario; the
            // others are disabled. Its `change` fires on blur, so type and
            // then Tab away rather than stopping at the field.
            const dnsField = await d.tabTo((d) => d.id === 'ticket-cfg-dns', '#ticket-cfg-dns');
            if (!dnsField.ok) {
                fail(`#ticket-cfg-dns not reachable by Tab (stopped on ${JSON.stringify(dnsField.d)})`);
            } else {
                pass(`the DNS field reached by keyboard in ${dnsField.presses} Tab press(es)`);
                await d.selectAll();
                await d.typeText('10.42.100.10');
                // Read the value WITHOUT blurring: the field's `change` only
                // fires on blur, and blurring here would move focus onto the
                // first checkbox, which the next tabTo would then Tab past.
                const dnsValue = await d.evaluate(
                    `document.getElementById('ticket-cfg-dns').value`);
                if (dnsValue === '10.42.100.10') pass('the DNS value was typed by keyboard');
                else fail(`the typed DNS value did not take (field holds ${JSON.stringify(dnsValue)})`);
            }

            // Run every diagnostic the scenario's validator requires, in the
            // order the fixed test set renders them. For aplus-dns-01 that
            // is BOTH ping-ip and nslookup (scenarios.js:120-125) — checking
            // only one leaves the ticket unresolved, and which one is missing
            // is only named in the verdict text. The first Tab here also
            // blurs the DNS field, committing the typed value.
            for (const testId of ['ping-ip', 'nslookup']) {
                const testBox = await d.tabTo(
                    (d) => d.dtest === testId, `the ${testId} diagnostic checkbox`);
                if (!testBox.ok) {
                    fail(`the ${testId} diagnostic is not reachable by Tab `
                        + `(stopped on ${JSON.stringify(testBox.d)})`);
                    continue;
                }
                pass(`the ${testId} diagnostic reached by keyboard in ${testBox.presses} Tab press(es)`);
                await d.key('Space');
                await sleep(300);
                const checked = await d.evaluate(`(() => {
                    const box = document.activeElement;
                    return box && box.type === 'checkbox' ? box.checked : null;
                })()`);
                if (checked === true) pass(`Space checks the ${testId} diagnostic`);
                else if (checked === null) fail('the focused element is not a checkbox');
                else fail(`Space did not check the ${testId} diagnostic`);
            }

            // The resolution note, then submit.
            const noteField = await d.tabTo((d) => d.tag === 'TEXTAREA', '#ticket-note');
            if (!noteField.ok) {
                fail(`the resolution note is not reachable by Tab (stopped on ${JSON.stringify(noteField.d)})`);
            } else {
                await d.typeText('DNS was pointing at the wrong server.');
                await sleep(200);
                pass('the resolution note accepts typed input');
            }

            const submit = await d.tabTo((d) => d.id === 'ticket-submit', '#ticket-submit');
            if (!submit.ok) {
                fail(`#ticket-submit not reachable by Tab (stopped on ${JSON.stringify(submit.d)})`);
            } else {
                await d.key('Enter');
                await sleep(700);
                // The success marker is the `.correct` verdict class, not the
                // word "resolved": the failure text is "Not resolved: …",
                // which contains it, so a substring test on the word alone
                // would report a failed ticket as a pass.
                const evidence = await d.evaluate(`(() => {
                    const v = document.querySelector('#ticket-evidence .verdict');
                    if (!v) return null;
                    return { correct: v.classList.contains('correct'), text: v.textContent.trim() };
                })()`);
                if (evidence && evidence.correct) {
                    pass(`the ticket resolves by keyboard: "${evidence.text.slice(0, 60)}"`);
                } else {
                    fail(`the ticket did not resolve by keyboard `
                        + `(verdict: ${JSON.stringify(evidence?.text ?? null)})`);
                }
            }
        }
    }
}

// ══ Flow 7: reset between groups ══════════════════════════════════
async function runReset(d) {
    say('');
    say('## Flow 7 — reset between groups');
    // Rendered visibility, not the `hidden` attribute. `DemoBanner.js` sets
    // `el.hidden` correctly, and `.demo-banner { display: flex }`
    // (css/study.css) used to beat the UA stylesheet's `[hidden] { display:none }`
    // (author rules win), so the label painted regardless of the attribute.
    // A check on `.hidden` alone reported a pass for a banner that was never
    // off, so this reads the layout box — and the attribute alongside it, so
    // a disagreement between the two is visible in the failure text.
    const bannerVisible = () => d.evaluate(`(() => {
        const b = document.getElementById('demo-banner');
        if (!b) return null;
        return { hiddenAttr: b.hidden, display: getComputedStyle(b).display,
                 height: b.offsetHeight, onScreen: b.offsetHeight > 0 };
    })()`);

    await d.goto('#/tracks');

    // Learner mode must not show the demo label. Demo mode is presenter-
    // entered: the banner's own link is the ONLY inbound route to #/demo in
    // the app, and it lives inside the element that is hidden whenever demo
    // mode is off — so a learner tabbing the shell must not find it. That
    // absence is what makes the label mean anything.
    //
    // This flow used to reach #/demo by tabbing to that link here. That only
    // worked because the banner was wrongly painted in learner mode, i.e.
    // the assertion was green on exactly the defect it exists to catch. It
    // now asserts the absence, then enters demo mode the way the presenter
    // does — by URL.
    const learnerBanner = await bannerVisible();
    if (learnerBanner?.onScreen) {
        fail('the demo banner is on screen in learner mode '
            + `(hidden attribute ${JSON.stringify(learnerBanner.hiddenAttr)}, `
            + `computed display ${JSON.stringify(learnerBanner.display)}, `
            + `${learnerBanner.height}px tall) — the label does not mark demo mode, `
            + 'so "is this the demo?" has no on-screen answer');
    } else {
        pass('learner mode shows no demo banner (the attribute and the layout box agree)');
    }

    const learnerDemoLink = await d.tabTo((d) => d.href === '#/demo', 'a demo-controls link', 30);
    if (learnerDemoLink.ok) {
        fail('a demo-controls link is reachable by Tab in learner mode '
            + `(stopped on ${JSON.stringify(learnerDemoLink.d)}) — demo controls are presenter-only`);
    } else {
        pass('no demo-controls link is reachable by Tab in learner mode');
    }

    // The presenter's entry path. The banner then makes the link reachable
    // on every screen for the rest of the demo.
    await d.goto('#/demo');
    {
        const beforeEnter = await bannerVisible();

        const enter = await d.tabTo((d) => d.id === 'demo-enter', '#demo-enter');
        if (!enter.ok) {
            fail(`#demo-enter not reachable by Tab (stopped on ${JSON.stringify(enter.d)})`);
        } else {
            await d.key('Enter');
            await sleep(700);
            const afterEnter = await bannerVisible();
            if (!afterEnter?.onScreen) {
                fail('entering demo mode did not show the demo banner');
            } else if (beforeEnter?.onScreen) {
                fail('the demo banner was already on screen BEFORE demo mode was entered '
                    + `(hidden attribute ${JSON.stringify(beforeEnter.hiddenAttr)}, `
                    + `computed display ${JSON.stringify(beforeEnter.display)}, `
                    + `${beforeEnter.height}px tall) — the label does not mark demo mode, it is `
                    + 'always painted, so "is this the demo?" has no on-screen answer. '
                    + 'Closed by the `[hidden] { display: none !important }` reset rule in '
                    + 'css/components.css; this branch is the regression guard for it.');
            } else {
                pass('Enter on "Enter demo mode" shows the demo banner (absent before, present after)');
            }

            const reset = await d.tabTo((d) => d.id === 'demo-reset', '#demo-reset');
            if (!reset.ok) {
                fail(`#demo-reset not reachable by Tab (stopped on ${JSON.stringify(reset.d)})`);
            } else {
                await d.key('Enter');
                await sleep(1200);
                const report = await d.evaluate(
                    `document.getElementById('demo-report')?.textContent.replace(/\\s+/g, ' ') || ''`);
                if (!/reseed verification/i.test(report)) {
                    fail(`the reseed verification report did not render (${report.slice(0, 120)})`);
                } else if (!/\d+\s*\/\s*\d+ scenarios reseeded/.test(report)) {
                    fail(`the reseed report states no count (${report.slice(0, 160)})`);
                } else if (!/all correct|NOT all correct/.test(report)) {
                    fail(`the reseed report states no outcome (${report.slice(0, 160)})`);
                } else {
                    pass('the station reset renders its reseed verification outcome');
                }

                // TM-48: "focus predictable after reset". The reset
                // re-renders the view by replaceChild, so the honest
                // question is whether focus is somewhere sensible rather
                // than stranded on a node that is no longer in the tree.
                const after = await d.active();
                const stranded = await d.evaluate(`(() => {
                    const e = document.activeElement;
                    return !!e && !document.contains(e);
                })()`);
                if (stranded) {
                    fail('after the reset, focus is on a detached node — not predictable');
                } else {
                    note(`focus after reset is <${after?.tag || 'null'}`
                        + `${after?.id ? '#' + after.id : ''}>; the view is re-rendered with `
                        + 'replaceChild and nothing restores focus, so a keyboard user resumes '
                        + 'from the top of the tab order.');
                }

                // The reset's own claim: the learner keys are cleared.
                // `store` is exported by StateStore.js; ProgressStore.js
                // exports `progress` and re-exports nothing named `store`.
                const cleared = await d.evaluate(`(async () => {
                    const mod = await import('/js/core/StateStore.js');
                    const keys = await mod.store.keys('progress/');
                    const scen = await mod.store.keys('scenario/');
                    return { progress: keys.length, scenario: scen.length };
                })()`);
                if (cleared && cleared.progress === 0 && cleared.scenario === 0) {
                    pass('the reset cleared the stored learner keys (progress/* and scenario/*)');
                } else {
                    fail(`the reset left learner keys behind: ${JSON.stringify(cleared)}`);
                }
            }
        }
    }
}

export { runScenario, runReset };
