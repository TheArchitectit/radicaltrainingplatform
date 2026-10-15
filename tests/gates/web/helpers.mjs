/**
 * Minimal DOM/window stubs for web runtime fixtures (R-22).
 * Zero-dependency: no jsdom. Enough surface for BaseView/Router/view afterRender.
 */
import { readFileSync } from 'node:fs';

export class StubElement {
    constructor(tagName = 'div') {
        this.tagName = tagName.toUpperCase();
        this.children = [];
        this.parent = null;
        this.attributes = {};
        this.style = {};
        this.dataset = {};
        this.classList = {
            _set: new Set(),
            add: (...c) => c.forEach(x => this.classList._set.add(x)),
            remove: (...c) => c.forEach(x => this.classList._set.delete(x)),
            toggle: (c) => (this.classList._set.has(c) ? this.classList._set.delete(c) : this.classList._set.add(c)),
            contains: (c) => this.classList._set.has(c),
        };
        this._innerHTML = '';
        this._ownText = '';
        this.value = '';
        this.disabled = false;
        this._listeners = new Map();
    }

    get className() {
        return [...this.classList._set].join(' ');
    }
    set className(v) {
        this.classList._set = new Set(String(v).split(/\s+/).filter(Boolean));
    }

    get innerHTML() { return this._innerHTML; }
    set innerHTML(html) {
        this._innerHTML = String(html ?? '');
        this.children = [];
        this._ownText = '';
        if (this._doc) parseInto(this, this._innerHTML, this._doc);
    }

    get textContent() {
        return this._ownText + this.children.map(c => c.textContent).join('');
    }
    set textContent(v) {
        this._ownText = String(v ?? '');
        this.children = [];
    }

    get firstChild() { return this.children[0] || null; }

    /**
     * The real DOM property. Five views re-render by asking their root for
     * `parentElement` and replacing themselves in it; without this the getter
     * was `undefined`, so those views quietly re-rendered nothing in every
     * fixture and the path was never exercised. Null for a detached node,
     * which is what the DOM reports too.
     */
    get parentElement() { return this.parent; }

    appendChild(child) {
        child.parent = this;
        this.children.push(child);
        return child;
    }

    removeChild(child) {
        this.children = this.children.filter(c => c !== child);
        return child;
    }

    replaceChildren(...nodes) {
        this.children = [];
        this._ownText = '';
        for (const node of nodes) this.appendChild(node);
    }

    remove() { this.parent?.removeChild(this); }

    /**
     * The real DOM method, mirrored. Five views re-render by replacing their
     * root (`practice.js`, `demo-mode.js`, `nca-lab.js`, `ticket-lab.js`,
     * `flashcards.js`), and until this existed no fixture could drive that
     * path — the stub simply had no such method, so the interaction was
     * untestable rather than tested. Returns the replaced node, as the DOM does.
     */
    replaceChild(newChild, oldChild) {
        const i = this.children.indexOf(oldChild);
        if (i === -1) throw new Error('replaceChild: the node to replace is not a child of this node');
        newChild.parent = this;
        oldChild.parent = null;
        this.children[i] = newChild;
        return oldChild;
    }

    setAttribute(name, value) {
        this.attributes[name] = String(value);
        if (name.startsWith('data-')) {
            this.dataset[name.slice(5).replace(/-(\w)/g, (_, c) => c.toUpperCase())] = String(value);
        }
    }
    getAttribute(name) { return this.attributes[name] ?? null; }
    removeAttribute(name) { delete this.attributes[name]; }

    addEventListener(type, fn) {
        if (!this._listeners.has(type)) this._listeners.set(type, []);
        this._listeners.get(type).push(fn);
    }
    removeEventListener(type, fn) {
        const list = this._listeners.get(type) || [];
        this._listeners.set(type, list.filter(f => f !== fn));
    }
    dispatchEvent(evt) {
        (this._listeners.get(evt?.type) || []).forEach(fn => fn(evt));
        return true;
    }

    querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }

    querySelectorAll(sel) {
        const out = [];
        const match = makeMatcher(sel);
        const walk = (node) => {
            for (const child of node.children) {
                if (match(child)) out.push(child);
                walk(child);
            }
        };
        walk(this);
        return out;
    }

    focus() {}
    click() { this.dispatchEvent({ type: 'click', target: this, stopPropagation() {} }); }
}

function makeMatcher(sel) {
    // supports: tag, .class, #id, [attr], [attr="value"], and simple compounds (e.g. button.tab)
    const id = sel.match(/#([\w-]+)/);
    const cls = [...sel.matchAll(/\.([\w-]+)/g)].map(m => m[1]);
    const attrEq = [...sel.matchAll(/\[([\w-]+)="([^"]*)"\]/g)];
    const attrAny = [...sel.matchAll(/\[([\w-]+)\]/g)].filter(m => !m.input.slice(m.index).match(/^\[[\w-]+="/));
    const tag = sel.match(/^([a-zA-Z][\w-]*)/);
    return (el) => {
        if (tag && el.tagName !== tag[1].toUpperCase()) return false;
        if (id && el.getAttribute('id') !== id[1]) return false;
        for (const c of cls) if (!el.classList.contains(c)) return false;
        for (const [, name, value] of attrEq) {
            const v = name === 'value' ? el.value : el.getAttribute(name) || el.dataset[attrToData(name)];
            if (String(v) !== value) return false;
        }
        for (const [, name] of attrAny) {
            const has = el.getAttribute(name) != null || el.dataset[attrToData(name)] != null;
            if (!has) return false;
        }
        return true;
    };
}

function attrToData(name) {
    return name.replace(/-(\w)/g, (_, c) => c.toUpperCase());
}

const TAG_RE = /<\/?([a-zA-Z][\w-]*)((?:\s+[\w:-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*(\/?)>/g;

function parseInto(parent, html, doc) {
    const stack = [parent];
    let last = 0;
    let m;
    TAG_RE.lastIndex = 0;
    while ((m = TAG_RE.exec(html)) != null) {
        const text = html.slice(last, m.index);
        if (text.trim()) {
            const textNode = new StubElement('#text');
            textNode._doc = doc;
            textNode._ownText = text;
            stack[stack.length - 1].appendChild(textNode);
        }
        const [full, tagName, attrText, selfClose] = m;
        const isClose = full.startsWith('</');
        const isSelf = selfClose === '/' || /^(br|hr|img|input|meta|link)$/i.test(tagName);
        if (isClose) {
            if (stack.length > 1) stack.pop();
        } else {
            const el = new StubElement(tagName);
            el._doc = doc;
            const attrRe = /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
            let a;
            while ((a = attrRe.exec(attrText || '')) != null) {
                const name = a[1];
                const value = a[2] ?? a[3] ?? a[4] ?? '';
                el.setAttribute(name, value);
                if (name === 'class') el.className = value;
                if (name === 'id') doc._byId.set(value, el);
            }
            stack[stack.length - 1].appendChild(el);
            if (!isSelf) stack.push(el);
        }
        last = TAG_RE.lastIndex;
    }
    const tail = html.slice(last);
    if (tail.trim()) {
        const textNode = new StubElement('#text');
        textNode._doc = doc;
        textNode._ownText = tail;
        stack[stack.length - 1].appendChild(textNode);
    }
}

export function createDocument() {
    const doc = {
        _byId: new Map(),
        createElement(tag) {
            const el = new StubElement(tag);
            el._doc = doc;
            return el;
        },
        createTextNode(text) {
            const el = new StubElement('#text');
            el.textContent = text;
            return el;
        },
        getElementById(id) {
            return doc._byId.get(id) || null;
        },
        querySelector(sel) { return doc.querySelectorAll(sel)[0] || null; },
        querySelectorAll(sel) {
            const out = [];
            const match = makeMatcher(sel);
            const walk = (node) => {
                for (const child of node.children || []) {
                    if (match(child)) out.push(child);
                    walk(child);
                }
            };
            walk({ children: [...doc._roots] });
            return out;
        },
        addEventListener() {},
        removeEventListener() {},
        body: null,
        _roots: [],
    };
    doc.body = doc.createElement('body');
    doc._roots.push(doc.body);
    return doc;
}

export function createWindow() {
    const listeners = new Map();
    return {
        location: { hash: '', href: '', reload() {} },
        addEventListener(type, fn) {
            if (!listeners.has(type)) listeners.set(type, []);
            listeners.get(type).push(fn);
        },
        removeEventListener() {},
        dispatchEvent(evt) {
            (listeners.get(evt?.type) || []).forEach(fn => fn(evt));
            return true;
        },
        _fire(type) {
            (listeners.get(type) || []).forEach(fn => fn({ type }));
        },
    };
}

/** Install document/window/localStorage stubs on globalThis. */
export function installDom() {
    const document = createDocument();
    const window = createWindow();
    const storage = new Map();
    globalThis.document = document;
    globalThis.window = window;
    globalThis.localStorage = {
        getItem: (k) => (storage.has(k) ? storage.get(k) : null),
        setItem: (k, v) => storage.set(k, String(v)),
        removeItem: (k) => storage.delete(k),
        clear: () => storage.clear(),
        key: (i) => [...storage.keys()][i] ?? null,
        get length() { return storage.size; },
    };
    // Force StateStore's IndexedDB path to fail so it falls back to localStorage.
    delete globalThis.indexedDB;
    if (!globalThis.crypto?.randomUUID) {
        Object.defineProperty(globalThis, 'crypto', {
            value: { randomUUID: () => `uuid-${++installDom._n}` },
            configurable: true,
        });
    }
    return { document, window, localStorage: globalThis.localStorage };
}
installDom._n = 0;

/** Tiny assertion runner: run(name, fn) collects failures, returns exit code. */
export function makeRunner() {
    const failures = [];
    return {
        failures,
        async test(name, fn) {
            try {
                await fn();
                console.log(`  PASS ${name}`);
            } catch (e) {
                failures.push(name);
                console.log(`  FAIL ${name}: ${e && e.message}`);
            }
        },
        done(label) {
            if (failures.length) {
                console.log(`${label}: ${failures.length} failure(s)`);
                return 1;
            }
            console.log(`${label}: all fixtures passed`);
            return 0;
        },
    };
}

/**
 * The route patterns `js/app.js` actually registers, read the same way the
 * a11y gate reads them (regex over the source, not a hand-kept list).
 *
 * Fixtures use this to check that a link the app renders points at a route
 * the app can serve. A dead link is invisible to every other gate here — the
 * markup is valid, the href is a string, and nothing 404s in a hash router
 * until a learner clicks it.
 */
export function registeredRoutePatterns(appJsUrl) {
    const source = readFileSync(appJsUrl, 'utf8');
    return [...source.matchAll(/router\.register\(\s*'([^']+)'/g)].map(m => m[1]);
}

/** True when `href` (a `#/...` link) matches a registered pattern. */
export function hrefIsRouted(href, patterns) {
    const path = String(href || '').replace(/^#/, '');
    const parts = path.split('/').filter(Boolean);
    return patterns.some(pattern => {
        const pp = pattern.split('/').filter(Boolean);
        if (pp.length !== parts.length) return false;
        return pp.every((seg, i) => seg.startsWith(':') || seg === parts[i]);
    });
}

export function assert(cond, msg) {
    if (!cond) throw new Error(msg || 'assertion failed');
}

export function assertEqual(actual, expected, msg) {
    if (actual !== expected) {
        throw new Error(`${msg || 'assertEqual'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
}
