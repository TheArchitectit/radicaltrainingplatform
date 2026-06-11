/**
 * BridgeClient — JS side of the PostMessage bridge to C#.
 */
class BridgeClient {
    #pending = new Map();
    #idCounter = 0;

    constructor() {
        window.chrome?.webview?.addEventListener('message', (e) => this.#onMessage(e.data));
    }

    /** Send a message to C# and optionally await a response. */
    send(type, payload) {
        const id = String(++this.#idCounter);
        const msg = { type, payload, id };

        return new Promise((resolve, reject) => {
            this.#pending.set(id, { resolve, reject });
            window.chrome?.webview?.postMessage(msg);

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
        window.chrome?.webview?.postMessage({ type, payload });
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
