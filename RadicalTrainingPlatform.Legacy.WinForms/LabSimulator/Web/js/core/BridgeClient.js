/**
 * BridgeClient — JS side of the PostMessage bridge to C#.
 *
 * Two host transports, auto-detected at construction:
 *   1. WebView2 (legacy WinForms): window.chrome.webview.
 *   2. CefGlue (Avalonia desktop): window.dotnetBridge.call(json), with the
 *      C# side pushing responses back through window.__cefBridgeDispatch.
 *
 * Previously only the WebView2 path was implemented, so under CefGlue every
 * send() found no chrome.webview and timed out after 10s, and the C# reply
 * channel (window.__cefBridgeDispatch) had no listener — the bridge was inert
 * in both directions on the desktop app.
 */
class BridgeClient {
    #pending = new Map();
    #idCounter = 0;
    #transport = null; // 'webview2' | 'cef'

    constructor() {
        if (typeof window !== 'undefined' && window.chrome?.webview?.postMessage) {
            this.#transport = 'webview2';
            window.chrome.webview.addEventListener('message', (e) => this.#onMessage(e.data));
        } else if (typeof window !== 'undefined' && window.dotnetBridge?.call) {
            this.#transport = 'cef';
            // C# delivers messages by calling window.__cefBridgeDispatch(msg).
            // Drain anything it queued before we finished constructing.
            window.__cefBridgeDispatch = (msg) => this.#onMessage(msg);
            const queued = window.__cefBridgeQueue;
            if (Array.isArray(queued)) {
                window.__cefBridgeQueue = [];
                queued.forEach((msg) => this.#onMessage(msg));
            }
        } else {
            // Neither host present (plain browser preview): messages are dropped.
            console.warn('[Bridge] no host transport found; bridge disabled');
        }
    }

    /** Send a message to C# and optionally await a response. */
    send(type, payload) {
        const id = String(++this.#idCounter);
        const msg = { type, payload, id };

        return new Promise((resolve, reject) => {
            if (!this.#transport) {
                reject(new Error(`Bridge unavailable for ${type}`));
                return;
            }
            this.#pending.set(id, { resolve, reject });
            this.#postRaw(msg);

            // Timeout after 10s
            setTimeout(() => {
                if (this.#pending.has(id)) {
                    this.#pending.delete(id);
                    reject(new Error(`Bridge timeout for ${type}`));
                }
            }, 10000);
        });
    }

    /** Fire-and-forget message to C#. */
    post(type, payload) {
        if (!this.#transport) return;
        this.#postRaw({ type, payload });
    }

    #postRaw(msg) {
        if (this.#transport === 'webview2') {
            window.chrome.webview.postMessage(msg);
        } else if (this.#transport === 'cef') {
            // CefGlue exposes a synchronous string-arg entry point.
            window.dotnetBridge.call(JSON.stringify(msg));
        }
    }

    /** Register a handler for messages from C#. */
    on(type, handler) {
        if (!this._handlers) this._handlers = new Map();
        if (!this._handlers.has(type)) this._handlers.set(type, new Set());
        this._handlers.get(type).add(handler);
    }

    #onMessage(data) {
        // Handle response to a pending request
        if (data.type === 'response' && data.payload?.id) {
            const p = this.#pending.get(data.payload.id);
            if (p) {
                this.#pending.delete(data.payload.id);
                data.payload.success ? p.resolve(data.payload.data) : p.reject(new Error(data.payload.error));
            }
            return;
        }

        // Dispatch to registered handlers
        this._handlers?.get(data.type)?.forEach(h => {
            try { h(data.payload); } catch (e) { console.error(`[Bridge] Handler error for ${data.type}:`, e); }
        });
    }
}

export const bridge = new BridgeClient();
