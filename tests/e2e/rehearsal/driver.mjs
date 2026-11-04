/**
 * Keyboard driver over one attached CDP session.
 *
 * Extracted from tests/e2e/rehearsal-web.mjs (T-26 / S47-10). Every activation
 * the flows perform goes through here: a Tab to the control and then Enter or
 * Space, never element.click(). That is the point of the rehearsal, so the
 * primitives live in one place and the flows cannot accidentally bypass them.
 */
import { ACTIVE, KEY, sleep } from './browser.mjs';

function createDriver(cdp, sessionId) {
    /** Send on the attached page session; flows never touch the raw id. */
    const send = (method, params = {}) => cdp.send(method, params, sessionId);

    const evaluate = async (expression) => {
        const r = await cdp.send('Runtime.evaluate',
            { expression, returnByValue: true, awaitPromise: true }, sessionId);
        if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
        return r.result.value;
    };

    const key = async (name) => {
        const k = KEY[name];
        await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...k }, sessionId);
        if (k.text) await cdp.send('Input.dispatchKeyEvent', { type: 'char', ...k }, sessionId);
        await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', ...k }, sessionId);
        await sleep(70);
    };

    // Punctuation needs its real code and virtual key: a '.' sent with a
    // letter's keycode is silently dropped by the renderer, which is how a
    // typed "10.42.100.10" arrives as "104210010" and the rehearsal then
    // blames the app for a value it never entered.
    const PUNCT = {
        '.': { code: 'Period', vk: 190 },
        '-': { code: 'Minus', vk: 189 },
        ' ': { code: 'Space', vk: 32 },
        '/': { code: 'Slash', vk: 191 },
        ':': { code: 'Semicolon', vk: 186 },
        ',': { code: 'Comma', vk: 188 },
        "'": { code: 'Quote', vk: 222 },
    };

    /** Type one character the way a keyboard would, not via value assignment. */
    const typeChar = async (ch) => {
        const upper = ch.toUpperCase();
        let code, vk;
        if (ch >= '0' && ch <= '9') {
            code = `Digit${ch}`; vk = ch.charCodeAt(0);
        } else if (PUNCT[ch]) {
            ({ code, vk } = PUNCT[ch]);
        } else {
            code = `Key${upper}`; vk = upper.charCodeAt(0);
        }
        const base = { key: ch, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, text: ch };
        await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...base }, sessionId);
        await cdp.send('Input.dispatchKeyEvent', { type: 'char', ...base }, sessionId);
        await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', ...base }, sessionId);
        await sleep(25);
    };

    const typeText = async (text) => { for (const ch of text) await typeChar(ch); };

    /** Select the whole field (Ctrl+A) so typing replaces it. */
    const selectAll = async () => {
        const mods = { key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65, nativeVirtualKeyCode: 65, modifiers: 2 };
        await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...mods }, sessionId);
        await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', ...mods }, sessionId);
        await sleep(80);
    };

    const active = () => evaluate(ACTIVE);

    /**
     * Tab forward until the focused element satisfies `pred`. Returns how
     * many presses it took, or ok:false after `max`. This is the whole
     * reachability test: a control the keyboard cannot reach simply never
     * matches, and the caller fails the leg.
     */
    const tabTo = async (pred, label, max = 60) => {
        for (let i = 1; i <= max; i++) {
            await key('Tab');
            const d = await active();
            if (d && pred(d)) return { ok: true, presses: i, d };
        }
        return { ok: false, presses: max, d: await active(), label };
    };

    const goto = async (hash) => {
        await evaluate(`location.hash = ${JSON.stringify(hash)}`);
        await sleep(600);
    };

    const waitForExpr = async (expression, what, timeoutMs = 15000) => {
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
            try { if (await evaluate(expression)) return true; } catch { /* mid-navigation */ }
            await sleep(150);
        }
        throw new Error(`timed out waiting for ${what}`);
    };

    return {
        cdp, sessionId, send, evaluate, key, typeChar, typeText, selectAll,
        active, tabTo, goto, waitForExpr,
    };
}

export { createDriver };
