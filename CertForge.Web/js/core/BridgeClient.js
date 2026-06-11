/**
 * BridgeClient — JS side of the PostMessage bridge to C#.
 * PWA-aware: detects WebView2, falls back to window.postMessage, then mock mode.
 */
class BridgeClient {
    #pending = new Map();
    #idCounter = 0;
    #mode = 'unknown';
    #postMessageTarget = null;

    constructor() {
        if (window.chrome?.webview) {
            this.#mode = 'webview2';
            window.chrome.webview.addEventListener('message', (e) => this.#onMessage(e.data));
        } else if (window.opener || window.parent !== window) {
            this.#mode = 'postmessage';
            this.#postMessageTarget = window.opener || window.parent;
            window.addEventListener('message', (e) => {
                if (e.origin && e.origin !== window.location.origin) return;
                this.#onMessage(e.data);
            });
        } else {
            this.#mode = 'standalone';
            console.log('[Bridge] Running in standalone mode (no host bridge). Mock responses enabled.');
        }
    }

    /** Send a message to C# and optionally await a response. */
    send(type, payload) {
        const id = String(++this.#idCounter);
        const msg = { type, payload, id };

        return new Promise((resolve, reject) => {
            this.#pending.set(id, { resolve, reject });

            if (this.#mode === 'webview2') {
                window.chrome.webview.postMessage(msg);
            } else if (this.#mode === 'postmessage') {
                this.#postMessageTarget.postMessage(msg, '*');
            } else {
                this.#mockResponse(type, payload, id, resolve, reject);
            }

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
        const msg = { type, payload };
        if (this.#mode === 'webview2') {
            window.chrome.webview.postMessage(msg);
        } else if (this.#mode === 'postmessage') {
            this.#postMessageTarget.postMessage(msg, '*');
        } else {
            console.log('[Bridge] Standalone post (no-op):', type, payload);
        }
    }

    /** Register a handler for messages from C#. */
    on(type, handler) {
        if (!this._handlers) this._handlers = new Map();
        if (!this._handlers.has(type)) this._handlers.set(type, new Set());
        this._handlers.get(type).add(handler);
    }

    /** Unregister a handler. */
    off(type, handler) {
        this._handlers?.get(type)?.delete(handler);
    }

    #onMessage(data) {
        if (!data || typeof data !== 'object') return;

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

    /** Generate mock responses for standalone mode. */
    #mockResponse(type, payload, id, resolve) {
        setTimeout(() => {
            let data;
            switch (type) {
                case 'cli':
                    data = { output: `Mock CLI response for: ${payload?.command || 'unknown'}`, exitCode: 0 };
                    break;
                case 'getState':
                    data = payload?.key ? { [payload.key]: 'mock-value' } : {};
                    break;
                case 'setState':
                    data = { success: true };
                    break;
                case 'getVMs':
                case 'getClusters':
                case 'getNetworks':
                    data = { items: [], total: 0 };
                    break;
                default:
                    data = { success: true, mock: true };
            }
            resolve(data);
            this.#pending.delete(id);
        }, 150);
    }
}

export const bridge = new BridgeClient();
