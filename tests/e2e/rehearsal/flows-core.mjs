/**
 * Flows 1-5 of the keyboard-only demo-loop rehearsal (T-26 / S47-10).
 *
 * Extracted verbatim from tests/e2e/rehearsal-web.mjs. Boot, track picker,
 * lesson, practice and progress persistence. Failure strings and their order
 * are the failing-side evidence this fixture ships with, so they are copied
 * without rewording.
 */
import { sleep } from './browser.mjs';
import { fail, note, pass, say } from './state.mjs';

// ══ Flow 1: boot ══════════════════════════════════════════════════
async function runBoot(d, origin) {
    say('');
    say('## Flow 1 — boot');
    await d.send('Page.navigate', { url: `${origin}/index.html#/tracks` });
    await d.waitForExpr(`document.querySelector('#view-container')?.children.length > 0`,
        'the router to render #/tracks');
    pass('the PWA boots to #/tracks with a rendered view');
}

// ══ Flow 2: track picker (Tab + Enter) ════════════════════════════
async function runTrackPicker(d) {
    say('');
    say('## Flow 2 — track picker');
    const trackCard = await d.tabTo(
        (d) => d.href === '#/tracks/track-aplus', 'the A+ track card');
    if (!trackCard.ok) {
        fail(`the A+ track card is not reachable by Tab (stopped on ${JSON.stringify(trackCard.d)})`);
    } else {
        pass(`A+ track card reached by keyboard in ${trackCard.presses} Tab press(es)`);
        await d.key('Enter');
        await sleep(600);
        const hash = await d.evaluate('location.hash');
        if (hash === '#/tracks/track-aplus') pass('Enter on the track card opens the track');
        else fail(`Enter on the track card left the route at ${hash}`);
    }
}

// ══ Flow 3: lesson reader (Tab + Enter) ═══════════════════════════
async function runLesson(d, disclaimer) {
    say('');
    say('## Flow 3 — lesson');
    const lessonLink = await d.tabTo(
        (d) => (d.href || '').includes('/lessons/'), 'a released lesson link');
    if (!lessonLink.ok) {
        fail(`no released lesson link reachable by Tab (stopped on ${JSON.stringify(lessonLink.d)})`);
    } else {
        pass(`released lesson link reached by keyboard in ${lessonLink.presses} Tab press(es)`);
        await d.key('Enter');
        await sleep(700);
        const hash = await d.evaluate('location.hash');
        if (hash.includes('/lessons/')) pass('Enter on the lesson link opens the reader');
        else fail(`Enter on the lesson link left the route at ${hash}`);

        const bodyLen = await d.evaluate(
            `document.querySelector('.lesson-body')?.textContent.trim().length || 0`);
        if (bodyLen > 200) pass(`the lesson body renders ${bodyLen} characters of prose`);
        else fail(`the lesson body is empty or near-empty (${bodyLen} characters)`);

        const shown = await d.evaluate(
            `document.querySelector('.study-disclaimer')?.textContent.trim() || ''`);
        if (shown === disclaimer) pass('the lesson carries the exact REQ-BRAND-02 disclaimer');
        else fail(`the lesson disclaimer is not the required string: ${JSON.stringify(shown.slice(0, 120))}`);
    }
}

// ══ Flow 4: practice (Tab, Space, Enter) ══════════════════════════
async function runPractice(d) {
    say('');
    say('## Flow 4 — practice');
    const practiceLink = await d.tabTo(
        (d) => (d.href || '').startsWith('#/practice/'), 'the practice button');
    if (!practiceLink.ok) {
        fail(`no practice button reachable by Tab (stopped on ${JSON.stringify(practiceLink.d)})`);
    } else {
        pass(`practice button reached by keyboard in ${practiceLink.presses} Tab press(es)`);
        await d.key('Enter');
        await sleep(800);
        const hash = await d.evaluate('location.hash');
        if (hash.startsWith('#/practice/')) pass('Enter on the practice button opens a practice set');
        else fail(`Enter on the practice button left the route at ${hash}`);

        const rows = await d.evaluate(`document.querySelectorAll('.option-row').length`);
        if (rows > 0) pass(`the practice set renders ${rows} answer options`);
        else fail('the practice set rendered no answer options');

        const option = await d.tabTo(
            (d) => (d.cls || '').includes('option-row'), 'an answer option');
        if (!option.ok) {
            fail(`no answer option reachable by Tab (stopped on ${JSON.stringify(option.d)})`);
        } else {
            await d.key('Space');
            await sleep(250);
            const selected = await d.evaluate(
                `document.querySelector('.option-row.selected')?.dataset.letter || null`);
            if (selected) pass(`Space selects the focused option (${selected})`);
            else fail('Space on a focused option did not select it');

            const submit = await d.tabTo((d) => d.id === 'practice-submit', '#practice-submit');
            if (!submit.ok) {
                fail(`#practice-submit not reachable by Tab (stopped on ${JSON.stringify(submit.d)})`);
            } else {
                const disabled = await d.evaluate(
                    `document.getElementById('practice-submit').disabled`);
                if (disabled) fail('the submit button is still disabled after a keyboard selection');
                await d.key('Enter');
                await sleep(600);
                const verdict = await d.evaluate(
                    `document.querySelector('#practice-feedback .verdict')?.textContent.trim() || null`);
                if (verdict) pass(`Enter on submit grades the answer: "${verdict.slice(0, 60)}"`);
                else fail('Enter on the submit button produced no graded feedback');
            }
        }
    }
}

// ══ Flow 5: progress persistence across a reload ══════════════════
async function runPersistence(d) {
    say('');
    say('## Flow 5 — progress persistence');
    //
    // Two separate claims, because they can fail independently and mean
    // different things: (1) the scored answer is still IN storage, and
    // (2) the app SURFACES it on a cold load. A rehearsal that only asked
    // (1) would call this flow green while a presenter opening the app
    // cold sees a learner with no history.
    // Flow 4 left this view showing the graded verdict. Read that state
    // first, because it is what the previous version of this check was
    // accidentally measuring — and asserting it explicitly is what stops a
    // later no-op "reload" from being mistaken for a cold load again.
    const beforeReload = await d.evaluate(
        `document.querySelector('.practice-prior-note')?.textContent.trim() || null`);
    if (beforeReload === null) {
        pass('the post-submit verdict view carries no prior-progress note '
            + '(the note is a cold-load affordance, not a permanent banner)');
    } else {
        fail(`the prior-progress note is on screen BEFORE any reload ("${beforeReload}") — `
            + `this leg cannot tell a cold load from a warm one`);
    }

    // Force a REAL reload. `Page.navigate` to a URL whose hash is unchanged
    // is a same-document no-op in Chrome: it does not reload the document,
    // so it silently re-reads the DOM the previous flow left behind. This
    // leg used to do exactly that and reported a cold-load failure for it —
    // the app was surfacing stored progress correctly the whole time; the
    // "reload" never happened. The marker below is the guard: a future
    // regression back to a no-op navigate fails here rather than being
    // read as a product defect.
    await d.evaluate(`window.__rehearsalBoot = 1`);
    await d.send('Page.reload');
    await d.waitForExpr(`!!document.querySelector('.practice-progress')`,
        'practice to re-render after a reload');
    const reloaded = await d.evaluate(`window.__rehearsalBoot !== 1`);
    if (reloaded) {
        pass('the cold load was a genuine reload, not a same-document hash change');
    } else {
        fail('the document did not reload — this leg would be reading the previous '
            + 'flow DOM and reporting it as a cold load');
    }

    const stored = await d.evaluate(`(async () => {
        const mod = await import('/js/core/StateStore.js');
        const keys = await mod.store.keys('progress/');
        return keys.filter(k => !k.endsWith('/continuation') && !k.endsWith('/summary')).length;
    })()`);
    if (stored > 0) pass(`the scored answer is still in storage after a reload (${stored} item record(s))`);
    else fail('the scored answer is gone from storage after a reload — progress did not persist');

    const priorNote = await d.evaluate(
        `document.querySelector('.practice-prior-note')?.textContent.trim() || null`);
    if (priorNote && /previously answered/i.test(priorNote)) {
        pass(`a cold load surfaces the stored progress: "${priorNote}"`);
    } else {
        fail(`a cold load does not surface the stored progress (note was ${JSON.stringify(priorNote)}) `
            + `even though the record is present — the learner opens the app to a blank history`);
        // Two causes, and the message must not guess between them: either
        // the view read the store before it could see the records (the
        // REQ-UI-04 shape this leg was written for), or the reload silently
        // did not happen and this is the previous flow's DOM. The `reloaded`
        // assertion above already separates them; this only reports which.
        note(`cold-load note missing after ${reloaded ? 'a genuine reload' : 'a FAILED reload'}; `
            + `the stored record is present (${stored} item record(s)) and the mode is `
            + `${await d.evaluate(`(async () => (await import('/js/core/StateStore.js')).store.mode)()`)}`);
    }
}

export { runBoot, runTrackPicker, runLesson, runPractice, runPersistence };
