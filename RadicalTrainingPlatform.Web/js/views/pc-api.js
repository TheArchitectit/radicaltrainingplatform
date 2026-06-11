import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { toast } from '../components/Toast.js';

/**
 * REST API v3 Simulator — Postman-like pane for practicing Nutanix API calls.
 * Supports POST for /list (exam trap!), GET/PUT/DELETE for entities.
 * Enforces spec_version on PUT (409 without it).
 * Returns task UUIDs for async operations.
 */
export class PcApiView extends BaseView {
    #history = [];

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        el.innerHTML = `
            <div class="page-title">
                <h1>API Explorer</h1>
                <span class="text-secondary text-sm">Nutanix REST API v3 Simulator</span>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-lg);">
                <!-- Request Builder -->
                <div class="card">
                    <div class="card-header">Request</div>
                    <div class="card-body">
                        <div style="display:flex;gap:8px;margin-bottom:12px;">
                            <select class="form-input" id="api-method" style="width:120px;">
                                <option value="POST" selected>POST</option>
                                <option value="GET">GET</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                            </select>
                            <input class="form-input" id="api-url" value="/api/nutanix/v3/vms/list" placeholder="/api/nutanix/v3/..." style="flex:1;font-family:var(--font-mono);font-size:12px;" />
                        </div>

                        <div class="form-group">
                            <label class="form-label" style="display:flex;justify-content:space-between;">
                                <span>Request Body</span>
                                <span class="text-secondary text-sm">JSON</span>
                            </label>
                            <textarea class="form-input" id="api-body" rows="10" style="font-family:var(--font-mono);font-size:12px;resize:vertical;">{
  "kind": "vm",
  "length": 50,
  "offset": 0
}</textarea>
                        </div>

                        <div style="display:flex;gap:8px;">
                            <button class="btn btn-primary" id="send-api-btn">Send Request</button>
                            <button class="btn btn-secondary" id="clear-api-btn">Clear</button>
                        </div>

                        <!-- Quick Templates -->
                        <div style="margin-top:16px;">
                            <div class="text-sm" style="font-weight:600;margin-bottom:8px;">Quick Templates</div>
                            <div style="display:flex;flex-wrap:wrap;gap:6px;">
                                <button class="btn btn-secondary btn-sm api-template" data-template="list-vms">POST /vms/list</button>
                                <button class="btn btn-secondary btn-sm api-template" data-template="list-subnets">POST /subnets/list</button>
                                <button class="btn btn-secondary btn-sm api-template" data-template="get-vm">GET /vms/{uuid}</button>
                                <button class="btn btn-secondary btn-sm api-template" data-template="list-images">POST /images/list</button>
                                <button class="btn btn-secondary btn-sm api-template" data-template="list-clusters">POST /clusters/list</button>
                                <button class="btn btn-secondary btn-sm api-template" data-template="create-vm">POST /vms</button>
                                <button class="btn btn-secondary btn-sm api-template" data-template="update-vm">PUT /vms/{uuid}</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Response Viewer -->
                <div class="card">
                    <div class="card-header" style="display:flex;justify-content:space-between;">
                        <span>Response</span>
                        <span class="text-secondary text-sm" id="api-status"></span>
                    </div>
                    <div class="card-body">
                        <pre id="api-response" style="background:var(--gray-900,#1e1e1e);color:#d4d4d4;padding:16px;border-radius:6px;font-size:12px;overflow:auto;max-height:500px;min-height:300px;white-space:pre-wrap;">// Response will appear here</pre>
                    </div>
                </div>
            </div>

            <!-- Exam Tips -->
            <div class="card" style="margin-top:var(--space-lg);">
                <div class="card-header">⚠️ API Exam Tips</div>
                <div class="card-body" style="font-size:13px;">
                    <ul style="padding-left:20px;margin:0;">
                        <li><strong>POST for listing:</strong> Nutanix API v3 uses <code>POST /entity/list</code> to retrieve entities, NOT <code>GET /entity</code>. This is a common exam trap.</li>
                        <li><strong>spec_version required:</strong> <code>PUT</code> requests MUST include <code>metadata.spec_version</code> from the GET response, or you'll get a 409 Conflict.</li>
                        <li><strong>Async operations:</strong> Create/Update/Delete return a <code>task_uuid</code>. Poll <code>GET /tasks/{uuid}</code> for completion.</li>
                        <li><strong>Base URL:</strong> <code>https://&lt;PC_IP&gt;:9440/api/nutanix/v3/</code> — port 9440, HTTPS required.</li>
                    </ul>
                </div>
            </div>
        `;

        return el;
    }

    afterRender() {
        document.getElementById('send-api-btn')?.addEventListener('click', () => this.#sendRequest());
        document.getElementById('clear-api-btn')?.addEventListener('click', () => this.#clearResponse());

        document.querySelectorAll('.api-template').forEach(btn => {
            btn.addEventListener('click', () => this.#applyTemplate(btn.dataset.template));
        });
    }

    #applyTemplate(template) {
        const methodEl = document.getElementById('api-method');
        const urlEl = document.getElementById('api-url');
        const bodyEl = document.getElementById('api-body');

        const templates = {
            'list-vms': { method: 'POST', url: '/api/nutanix/v3/vms/list', body: '{\n  "kind": "vm",\n  "length": 50,\n  "offset": 0\n}' },
            'list-subnets': { method: 'POST', url: '/api/nutanix/v3/subnets/list', body: '{\n  "kind": "subnet",\n  "length": 50,\n  "offset": 0\n}' },
            'list-images': { method: 'POST', url: '/api/nutanix/v3/images/list', body: '{\n  "kind": "image",\n  "length": 50,\n  "offset": 0\n}' },
            'list-clusters': { method: 'POST', url: '/api/nutanix/v3/clusters/list', body: '{\n  "kind": "cluster",\n  "length": 50,\n  "offset": 0\n}' },
            'get-vm': { method: 'GET', url: '/api/nutanix/v3/vms/vm-006', body: '' },
            'create-vm': { method: 'POST', url: '/api/nutanix/v3/vms', body: '{\n  "spec": {\n    "name": "API-Test-VM",\n    "resources": {\n      "num_vcpus_per_socket": 2,\n      "num_sockets": 1,\n      "memory_size_mib": 4096\n    }\n  },\n  "metadata": {\n    "kind": "vm"\n  }\n}' },
            'update-vm': { method: 'PUT', url: '/api/nutanix/v3/vms/vm-006', body: '{\n  "spec": {\n    "name": "Web-Server-01-Updated",\n    "resources": {\n      "num_vcpus_per_socket": 4,\n      "num_sockets": 1,\n      "memory_size_mib": 8192\n    }\n  },\n  "metadata": {\n    "kind": "vm",\n    "spec_version": 1\n  }\n}' },
        };

        const t = templates[template];
        if (t) {
            methodEl.value = t.method;
            urlEl.value = t.url;
            bodyEl.value = t.body;
        }
    }

    async #sendRequest() {
        const method = document.getElementById('api-method').value;
        const url = document.getElementById('api-url').value.trim();
        const bodyStr = document.getElementById('api-body').value.trim();
        const statusEl = document.getElementById('api-status');
        const responseEl = document.getElementById('api-response');

        if (!url) { toast.warning('URL is required'); return; }

        let body = null;
        if (bodyStr && (method === 'POST' || method === 'PUT')) {
            try { body = JSON.parse(bodyStr); }
            catch (e) { toast.error('Invalid JSON in request body'); return; }
        }

        statusEl.textContent = 'Sending...';
        responseEl.textContent = '// Loading...';

        // Simulate network delay
        await new Promise(r => setTimeout(r, 300 + Math.random() * 500));

        const result = this.#processRequest(method, url, body);
        statusEl.textContent = `${result.status} ${result.statusText}`;
        statusEl.style.color = result.status < 400 ? 'var(--status-good)' : 'var(--status-critical)';
        responseEl.textContent = JSON.stringify(result.body, null, 2);
    }

    #clearResponse() {
        document.getElementById('api-response').textContent = '// Response will appear here';
        document.getElementById('api-status').textContent = '';
    }

    #processRequest(method, url, body) {
        // Parse URL: /api/nutanix/v3/{entity}[/{uuid}][/list]
        const path = url.replace(/^\/api\/nutanix\/v3\/?/, '');
        const parts = path.split('/').filter(Boolean);
        const entity = parts[0]; // vms, subnets, images, clusters
        const idOrAction = parts[1]; // uuid or 'list'

        // ── POST /entity/list ── (exam-critical: listing uses POST, not GET)
        if (method === 'POST' && idOrAction === 'list') {
            return this.#handleList(entity, body);
        }

        // ── GET /entity ── (common mistake: should use POST /list)
        if (method === 'GET' && !idOrAction) {
            return { status: 405, statusText: 'Method Not Allowed', body: {
                api_version: '3.1',
                code: 405,
                message_list: [{ message: `Use POST /${entity}/list to retrieve ${entity}. GET is not supported for listing in API v3.`, reason: 'METHOD_NOT_ALLOWED' }],
                state: 'ERROR',
            }};
        }

        // ── GET /entity/{uuid} ──
        if (method === 'GET' && idOrAction) {
            return this.#handleGet(entity, idOrAction);
        }

        // ── POST /entity ── (create)
        if (method === 'POST' && !idOrAction) {
            return this.#handleCreate(entity, body);
        }

        // ── PUT /entity/{uuid} ── (update — needs spec_version!)
        if (method === 'PUT' && idOrAction) {
            return this.#handleUpdate(entity, idOrAction, body);
        }

        // ── DELETE /entity/{uuid} ──
        if (method === 'DELETE' && idOrAction) {
            return this.#handleDelete(entity, idOrAction);
        }

        return { status: 404, statusText: 'Not Found', body: { api_version: '3.1', code: 404, message_list: [{ message: 'Endpoint not found', reason: 'NOT_FOUND' }], state: 'ERROR' }};
    }

    #handleList(entity, body) {
        const mapping = { vms: 'vms', subnets: 'networks', images: 'images', clusters: null };
        const collection = mapping[entity];

        if (collection === undefined) {
            return { status: 404, statusText: 'Not Found', body: { code: 404, message_list: [{ message: `Unknown entity: ${entity}` }] }};
        }

        let entities;
        if (entity === 'clusters') {
            entities = [{ uuid: 'cluster-001', ...state.cluster }];
        } else {
            entities = state.getAll(collection);
        }

        const length = body?.length || 20;
        const offset = body?.offset || 0;
        const page = entities.slice(offset, offset + length);

        return { status: 200, statusText: 'OK', body: {
            api_version: '3.1',
            metadata: { kind: body?.kind || entity, length: page.length, offset, total_matches: entities.length },
            entities: page.map(e => this.#wrapEntity(entity, e)),
        }};
    }

    #handleGet(entity, uuid) {
        const mapping = { vms: 'vms', subnets: 'networks', images: 'images' };
        const collection = mapping[entity];
        if (!collection) return { status: 404, statusText: 'Not Found', body: { code: 404, message_list: [{ message: `Unknown entity: ${entity}` }] }};

        const item = state.getById(collection, uuid);
        if (!item) return { status: 404, statusText: 'Not Found', body: { code: 404, message_list: [{ message: `${entity}/${uuid} not found` }] }};

        return { status: 200, statusText: 'OK', body: this.#wrapEntity(entity, item) };
    }

    #handleCreate(entity, body) {
        if (!body?.spec) return { status: 400, statusText: 'Bad Request', body: { code: 400, message_list: [{ message: 'Request body must include "spec"' }] }};

        const taskUuid = crypto.randomUUID();
        return { status: 202, statusText: 'Accepted', body: {
            api_version: '3.1',
            status: { state: 'PENDING' },
            metadata: { kind: entity.replace(/s$/, ''), uuid: crypto.randomUUID(), spec_version: 0 },
            task_uuid: taskUuid,
            spec: body.spec,
        }};
    }

    #handleUpdate(entity, uuid, body) {
        // EXAM TRAP: spec_version is required on PUT
        if (!body?.metadata?.spec_version && body?.metadata?.spec_version !== 0) {
            return { status: 409, statusText: 'Conflict', body: {
                api_version: '3.1',
                code: 409,
                message_list: [{
                    message: 'spec_version is required in metadata for PUT operations. Get the current spec_version from a GET response first.',
                    reason: 'CONFLICT',
                    details: 'This is a common exam trap. Always include metadata.spec_version from the most recent GET response to prevent concurrent update conflicts.'
                }],
                state: 'ERROR',
            }};
        }

        const mapping = { vms: 'vms', subnets: 'networks', images: 'images' };
        const collection = mapping[entity];
        if (!collection) return { status: 404, statusText: 'Not Found', body: { code: 404, message_list: [{ message: `Unknown entity: ${entity}` }] }};

        const item = state.getById(collection, uuid);
        if (!item) return { status: 404, statusText: 'Not Found', body: { code: 404, message_list: [{ message: `${entity}/${uuid} not found` }] }};

        const taskUuid = crypto.randomUUID();
        return { status: 202, statusText: 'Accepted', body: {
            api_version: '3.1',
            status: { state: 'PENDING' },
            metadata: { kind: entity.replace(/s$/, ''), uuid, spec_version: body.metadata.spec_version + 1 },
            task_uuid: taskUuid,
        }};
    }

    #handleDelete(entity, uuid) {
        const taskUuid = crypto.randomUUID();
        return { status: 202, statusText: 'Accepted', body: {
            api_version: '3.1',
            status: { state: 'PENDING' },
            metadata: { kind: entity.replace(/s$/, ''), uuid },
            task_uuid: taskUuid,
        }};
    }

    #wrapEntity(kind, data) {
        return {
            metadata: { kind: kind.replace(/s$/, ''), uuid: data.uuid, spec_version: 1 },
            spec: data,
            status: { state: 'COMPLETE' },
        };
    }
}
