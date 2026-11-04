/**
 * The in-page WCAG audit for the web accessibility gate
 * (tests/e2e/a11y-web.mjs).
 */
// ── The in-page audit ───────────────────────────────────────────────────────
// Written as a real function and injected with String(fn), so the browser-side
// code is readable JavaScript rather than an escaped template literal. It must
// stay self-contained: no reference to anything outside its own body.

export function pageAudit() {
    const out = [];
    const add = (rule, detail) => out.push({ rule, detail });

    // ── colour maths (WCAG 2.x relative luminance) ──
    const parseColor = (c) => {
        const m = /^rgba?\(([^)]+)\)$/.exec(c || '');
        if (!m) return null;
        const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
        if (p.length < 3 || p.some((n) => Number.isNaN(n))) return null;
        return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const over = (fg, bg) => ({
        r: fg.r * fg.a + bg.r * (1 - fg.a),
        g: fg.g * fg.a + bg.g * (1 - fg.a),
        b: fg.b * fg.a + bg.b * (1 - fg.a),
        a: 1,
    });
    const lum = (c) => {
        const f = (v) => {
            const s = v / 255;
            return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const ratio = (a, b) => {
        const l1 = lum(a), l2 = lum(b);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };

    // ── visibility ──
    // The `hidden` attribute is honoured explicitly because `.demo-banner`
    // sets `display: flex`, which would otherwise beat the UA `hidden` rule.
    const shown = (el) => {
        if (el.closest('[hidden]')) return false;
        for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
            const cs = getComputedStyle(n);
            if (cs.display === 'none' || cs.visibility === 'hidden') return false;
            if (parseFloat(cs.opacity) === 0) return false;
        }
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
    };

    const describe = (el) => {
        let s = el.tagName.toLowerCase();
        if (el.id) s += '#' + el.id;
        const cls = typeof el.className === 'string' ? el.className.trim() : '';
        if (cls) s += '.' + cls.split(/\s+/).join('.');
        return s;
    };

    // Effective background: composite every solid ancestor fill, root first,
    // starting from the browser's white canvas.
    const effectiveBg = (el) => {
        const chain = [];
        for (let n = el; n && n.nodeType === 1; n = n.parentElement) chain.push(n);
        chain.reverse();
        let bg = { r: 255, g: 255, b: 255, a: 1 };
        for (const n of chain) {
            const c = parseColor(getComputedStyle(n).backgroundColor);
            if (c && c.a > 0) bg = over(c, bg);
        }
        return bg;
    };

    // ── accessible name (a deliberately reduced accname computation) ──
    // `fromContent` is the accname "name from content" step, and it is only
    // valid for roles that allow it — button, link, heading, cell. A landmark
    // is NOT one of them: a <nav> wrapping a link named "Home" is still an
    // unnamed landmark, and two of them cannot be told apart. Falling back to
    // textContent for landmarks would make this rule unable to fire at all.
    const nameOf = (el, { fromContent = true } = {}) => {
        const by = el.getAttribute('aria-labelledby');
        if (by) {
            const parts = by.split(/\s+/)
                .map((id) => document.getElementById(id))
                .filter(Boolean)
                .map((n) => n.textContent.trim())
                .filter(Boolean);
            if (parts.length) return { name: parts.join(' '), src: 'aria-labelledby' };
        }
        const al = el.getAttribute('aria-label');
        if (al && al.trim()) return { name: al.trim(), src: 'aria-label' };

        if (el.tagName === 'IMG') {
            const alt = el.getAttribute('alt');
            return alt && alt.trim() ? { name: alt.trim(), src: 'alt' } : { name: '', src: 'alt' };
        }

        if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
            if (el.id) {
                const lab = document.querySelector('label[for="' + CSS.escape(el.id) + '"]');
                if (lab && lab.textContent.trim()) return { name: lab.textContent.trim(), src: 'label' };
            }
            const wrap = el.closest('label');
            if (wrap && wrap.textContent.trim()) return { name: wrap.textContent.trim(), src: 'wrapping label' };
            const title = el.getAttribute('title');
            if (title && title.trim()) return { name: title.trim(), src: 'title' };
            const ph = el.getAttribute('placeholder');
            if (ph && ph.trim()) return { name: ph.trim(), src: 'placeholder-only' };
            if ((el.type === 'submit' || el.type === 'button') && el.value) {
                return { name: el.value, src: 'value' };
            }
            return { name: '', src: 'none' };
        }

        if (fromContent) {
            const text = (el.textContent || '').trim();
            if (text) return { name: text, src: 'text' };
        }
        const title = el.getAttribute('title');
        if (title && title.trim()) return { name: title.trim(), src: 'title' };
        return { name: '', src: 'none' };
    };

    const FOCUSABLE = 'a[href], button, input:not([type="hidden"]), select, textarea,'
        + ' [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
    const focusableNow = () => [...document.querySelectorAll(FOCUSABLE)]
        .filter((el) => shown(el) && !el.closest('[inert]') && !el.hasAttribute('disabled'));

    // ── 3.1.1 Language of page ──
    if (!(document.documentElement.getAttribute('lang') || '').trim()) {
        add('html-lang', '<html> has no lang attribute');
    }

    // ── 1.4.3 Contrast (minimum) ──
    // Only elements that directly own a text node: an element's `color` is what
    // applies to its own text, and its children are visited on their own. The
    // direct text is kept per element so an emoji-only run can be recognised
    // below from the glyphs actually painted in the measured colour.
    const hosts = new Map();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
        const t = walker.currentNode;
        if (!t.nodeValue || !t.nodeValue.trim()) continue;
        const el = t.parentElement;
        if (!el) continue;
        hosts.set(el, (hosts.get(el) || '') + t.nodeValue);
    }
    // Emoji render as colour glyphs from a font, not in the CSS `color`, so a
    // ratio computed from `color` says nothing about them. A run of nothing but
    // pictographs is therefore not a text-contrast question — but a run that
    // mixes glyphs with words is, and is measured. Non-text contrast (1.4.11)
    // is not measured either way; see the header.
    //
    // The lookahead is load-bearing, and its absence was a real hole: Unicode
    // classifies the ASCII digits `0-9`, `#`, `*` and the combining keycap as
    // `Emoji_Component`, so the character-class alone matched a bare "1". Every
    // numeral-only text run — wizard step numbers, badge counts, table tallies —
    // was therefore skipped as if it were an emoji, and a white-on-blue step
    // number at 2.69:1 went unmeasured even after the gate learned to open the
    // wizard that renders it. Requiring at least one genuinely pictographic
    // character (or an emoji presentation selector / keycap / ZWJ) keeps real
    // emoji out of the contrast maths and puts digits back in it.
    const PICTOGRAPHIC =
        /^(?=.*[\p{Extended_Pictographic}️⃣‍])[\p{Extended_Pictographic}\p{Emoji_Component}️‍⃣\s]+$/u;
    for (const [el, directText] of hosts) {
        if (!shown(el)) continue;
        if (PICTOGRAPHIC.test(directText)) continue;
        const cs = getComputedStyle(el);
        const raw = parseColor(cs.color);
        if (!raw) continue;
        const bg = effectiveBg(el);
        const fg = raw.a < 1 ? over(raw, bg) : raw;
        const px = parseFloat(cs.fontSize) || 16;
        const weight = parseInt(cs.fontWeight, 10) || 400;
        const large = px >= 24 || (px >= 18.66 && weight >= 700);
        const need = large ? 3 : 4.5;
        const got = ratio(fg, bg);
        if (got + 0.005 < need) {
            add('contrast', describe(el) + ' — ' + got.toFixed(2) + ':1, needs ' + need
                + ':1 (text "' + directText.trim().replace(/\s+/g, ' ').slice(0, 40) + '")');
        }
    }

    // ── 4.1.2 Name, Role, Value ──
    for (const el of focusableNow()) {
        const { name, src } = nameOf(el);
        if (!name) add('control-name', describe(el) + ' has no accessible name');
        else if (src === 'placeholder-only') {
            add('input-placeholder-only', describe(el) + ' is named only by its placeholder ('
                + JSON.stringify(name) + ')');
        }
    }

    // ── 1.4.1 Use of Colour: a link in prose must differ by more than colour ──
    // Scoped to links whose parent owns a real run of text of its own, so nav
    // items and breadcrumbs (a link beside a `›` separator) are not in scope.
    for (const a of document.querySelectorAll('a[href]')) {
        if (!shown(a)) continue;
        const parent = a.parentElement;
        if (!parent) continue;
        let prose = '';
        for (const n of parent.childNodes) if (n.nodeType === 3) prose += n.nodeValue;
        if (prose.replace(/\s+/g, ' ').trim().length < 12) continue;
        const cs = getComputedStyle(a);
        const ps = getComputedStyle(parent);
        const differsByMore = cs.textDecorationLine !== ps.textDecorationLine
            || cs.borderBottomWidth !== ps.borderBottomWidth
            || cs.fontWeight !== ps.fontWeight
            || cs.fontStyle !== ps.fontStyle
            || cs.backgroundColor !== ps.backgroundColor;
        if (!differsByMore) {
            add('link-in-text-block', describe(a) + ' ("'
                + (a.textContent || '').trim().slice(0, 30)
                + '") is a link in a run of prose that differs from the surrounding'
                + ' text by colour alone');
        }
    }

    // ── 1.1.1 Non-text Content ──
    for (const img of document.querySelectorAll('img')) {
        if (!shown(img)) continue;
        if (!img.hasAttribute('alt')) {
            add('img-alt', 'img ' + (img.getAttribute('src') || '(no src)') + ' has no alt attribute');
        }
    }

    // ── 1.3.1 / 2.4.1 Landmarks ──
    const LANDMARK = {
        NAV: 'navigation', ASIDE: 'complementary', MAIN: 'main',
        HEADER: 'banner', FOOTER: 'contentinfo', FORM: 'form',
    };
    const landmarks = [];
    for (const el of document.querySelectorAll(
        'nav, aside, main, header, footer, form,'
        + ' [role="navigation"], [role="complementary"], [role="main"],'
        + ' [role="banner"], [role="contentinfo"], [role="search"], [role="region"]')) {
        if (!shown(el)) continue;
        const role = el.getAttribute('role') || LANDMARK[el.tagName] || null;
        if (!role) continue;
        landmarks.push({ el, role, name: nameOf(el, { fromContent: false }).name });
    }
    const counts = {};
    for (const l of landmarks) counts[l.role] = (counts[l.role] || 0) + 1;
    const mains = landmarks.filter((l) => l.role === 'main');
    if (mains.length !== 1) {
        add('landmark-main', 'found ' + mains.length + ' main landmarks, expected exactly 1');
    }
    for (const l of landmarks) {
        if (counts[l.role] > 1 && !l.name) {
            add('landmark-named', describe(l.el) + ' is one of ' + counts[l.role] + ' "' + l.role
                + '" landmarks with no accessible name, so they cannot be told apart');
        }
    }

    // ── 1.3.1 Heading structure, 2.4.6 Headings and Labels ──
    const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter(shown);
    const h1s = headings.filter((h) => h.tagName === 'H1');
    if (h1s.length === 0) {
        add('page-has-heading-one', 'the page has no <h1>');
    } else if (h1s.length > 1) {
        add('page-has-heading-one', 'the page has ' + h1s.length + ' <h1> elements: '
            + h1s.map((h) => JSON.stringify(h.textContent.trim().slice(0, 30))).join(', '));
    }
    let prev = 0;
    for (const h of headings) {
        const level = Number(h.tagName[1]);
        if (prev && level > prev + 1) {
            add('heading-order', '<' + h.tagName.toLowerCase() + '> "'
                + h.textContent.trim().replace(/\s+/g, ' ').slice(0, 40)
                + '" follows <h' + prev + '>, skipping a level');
        }
        prev = level;
    }

    // ── 2.4.1 Bypass Blocks (skip link) ──
    const mainEl = document.querySelector('main, [role="main"]');
    if (mainEl) {
        const first = focusableNow()[0];
        let ok = false;
        if (first && first.tagName === 'A' && /skip/i.test(first.textContent || '')) {
            const href = first.getAttribute('href') || '';
            if (href.startsWith('#')) {
                const target = document.getElementById(href.slice(1));
                ok = !!target && (target === mainEl || target.contains(mainEl) || mainEl.contains(target));
            }
        }
        if (!ok) {
            add('skip-link', first
                ? 'the first focusable element is ' + describe(first) + ' ('
                    + JSON.stringify((first.textContent || '').trim().slice(0, 30))
                    + '), not a skip link to the main content'
                : 'the document has no focusable elements at all');
        }
    }

    // ── 4.1.3 Status Messages (live region) ──
    const toasts = document.getElementById('toast-container');
    if (toasts) {
        const role = toasts.getAttribute('role');
        const live = toasts.getAttribute('aria-live');
        if (!live && role !== 'status' && role !== 'alert' && role !== 'log') {
            add('live-region', '#toast-container is not a live region (no aria-live,'
                + ' no role=status/alert) — toast messages are never announced');
        }
    }

    // ── 2.4.7 Focus Visible ──
    // Differential measurement: fingerprint the computed styles unfocused and
    // focused. `focus({focusVisible:true})` is what makes `:focus-visible`
    // match for a programmatically focused element.
    const fingerprint = (el) => {
        const cs = getComputedStyle(el);
        // Position and opacity are in here because "reveal on focus" is a real
        // indicator technique — the skip link is the one in this tree — and a
        // fingerprint of colours and borders alone would report it as missing.
        return [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.boxShadow,
            cs.borderColor, cs.backgroundColor, cs.textDecorationLine,
            cs.position, cs.left, cs.top, cs.transform, cs.opacity, cs.visibility].join('|');
    };
    for (const el of focusableNow().slice(0, 25)) {
        const before = fingerprint(el);
        let focused = false;
        try {
            el.focus({ focusVisible: true });
            focused = document.activeElement === el;
        } catch (e) {
            try { el.focus(); focused = document.activeElement === el; } catch (e2) { focused = false; }
        }
        const after = focused ? fingerprint(el) : before;
        if (focused && document.activeElement === el) document.activeElement.blur();
        // Skip rather than flag when focus could not be placed: an element that
        // cannot take focus is a different (and separately reported) problem,
        // not evidence of a missing focus indicator.
        if (!focused) continue;
        if (before === after) {
            add('focus-visible', describe(el) + ' shows no visible focus indicator'
                + ' (computed styles are identical focused and unfocused)');
        }
    }

    return {
        violations: out,
        stats: { textHosts: hosts.size, focusables: focusableNow().length, headings: headings.length },
    };
}

/**
 * The expression the driver evaluates for one audit pass. `String(pageAudit)`
 * is why the function above must not close over module-scope names.
 */
export const AUDIT_EXPR = `(${String(pageAudit)})()`;
