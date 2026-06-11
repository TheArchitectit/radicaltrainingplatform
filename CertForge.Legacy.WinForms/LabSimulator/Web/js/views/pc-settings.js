import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Confirm.js';

/**
 * PC Settings — Tabbed config: NTP, DNS, SMTP, SSL, Pulse, SCMA.
 * Mirrors real Prism Central Settings page for exam practice.
 */
export class PcSettingsView extends BaseView {
    #activeTab = 'general';
    #unsubs = [];

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        const header = document.createElement('div');
        header.className = 'page-title';
        header.innerHTML = '<h1>Prism Central Settings</h1>';
        el.appendChild(header);

        const tabs = document.createElement('div');
        tabs.className = 'tabs';
        tabs.innerHTML = `
            <button class="tab active" data-tab="general">General</button>
            <button class="tab" data-tab="ntp">NTP</button>
            <button class="tab" data-tab="dns">Name Servers</button>
            <button class="tab" data-tab="smtp">SMTP</button>
            <button class="tab" data-tab="ssl">SSL Certificate</button>
            <button class="tab" data-tab="pulse">Pulse</button>
            <button class="tab" data-tab="scma">SCMA</button>
            <button class="tab" data-tab="data">Data Management</button>
        `;
        el.appendChild(tabs);

        const content = document.createElement('div');
        content.id = 'settings-content';
        el.appendChild(content);

        return el;
    }

    afterRender() {
        this.#renderTab(this.#activeTab);

        document.querySelectorAll('.tabs .tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.#activeTab = tab.dataset.tab;
                this.#renderTab(this.#activeTab);
            });
        });

        this.#wireDataTab();
    }

    destroy() { this.#unsubs.forEach(fn => fn()); }

    #renderTab(tab) {
        const c = document.getElementById('settings-content');
        if (!c) return;
        c.innerHTML = '';

        const cfg = state.getAll('pc_settings')[0] || this.#defaults();
        const card = document.createElement('div');
        card.className = 'card';
        card.style.marginTop = 'var(--space-lg)';

        switch(tab) {
            case 'general': card.innerHTML = this.#generalTab(cfg); break;
            case 'ntp': card.innerHTML = this.#ntpTab(cfg); break;
            case 'dns': card.innerHTML = this.#dnsTab(cfg); break;
            case 'smtp': card.innerHTML = this.#smtpTab(cfg); break;
            case 'ssl': card.innerHTML = this.#sslTab(cfg); break;
            case 'pulse': card.innerHTML = this.#pulseTab(cfg); break;
            case 'scma': card.innerHTML = this.#scmaTab(cfg); break;
            case 'data': card.innerHTML = this.#dataTab(); break;
        }
        c.appendChild(card);

        // Wire save buttons
        c.querySelectorAll('.btn-save-settings').forEach(btn => {
            btn.addEventListener('click', () => this.#save(cfg));
        });
    }

    #defaults() {
        return {
            uuid: 'pc-settings-001',
            pc_name: 'Prism-Central-01',
            pc_ip: '10.42.100.39',
            pc_version: 'pc.2024.2',
            timezone: 'America/Los_Angeles',
            ntp_servers: ['pool.ntp.org', '0.us.pool.ntp.org'],
            dns_servers: ['10.42.100.10'],
            smtp_server: '',
            smtp_port: 25,
            smtp_from: 'prism-central@ntnxlab.local',
            smtp_security: 'none',
            ssl_issuer: 'Self-Signed',
            ssl_expires: '2027-04-01',
            ssl_subject: 'CN=prism-central.ntnxlab.local',
            pulse_enabled: true,
            pulse_email: 'admin@ntnxlab.local',
            scma_enabled: false,
            scma_schedule: 'daily',
        };
    }

    #field(label, value, id, type = 'text', disabled = false) {
        return `<div style="margin-bottom:var(--space-md);">
            <label style="display:block;font-weight:600;margin-bottom:4px;">${label}</label>
            <input type="${type}" id="${id}" value="${value || ''}" ${disabled ? 'disabled' : ''}
                   style="width:100%;padding:8px;border:1px solid var(--border-subtle);border-radius:4px;background:var(--surface-secondary);color:var(--text-primary);"/>
        </div>`;
    }

    #toggle(label, checked, id) {
        return `<div style="margin-bottom:var(--space-md);display:flex;align-items:center;gap:12px;">
            <label style="font-weight:600;">${label}</label>
            <label class="switch" style="position:relative;display:inline-block;width:44px;height:24px;">
                <input type="checkbox" id="${id}" ${checked ? 'checked' : ''} style="opacity:0;width:0;height:0;">
                <span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:${checked ? 'var(--prism-blue)' : 'var(--border-subtle)'};border-radius:12px;transition:.3s;">
                    <span style="position:absolute;height:18px;width:18px;left:${checked ? '22px' : '3px'};bottom:3px;background:white;border-radius:50%;transition:.3s;"></span>
                </span>
            </label>
        </div>`;
    }

    #saveBtn() { return '<div style="margin-top:var(--space-lg);"><button class="btn btn-primary btn-save-settings">💾 Save Settings</button></div>'; }

    #generalTab(cfg) {
        return `<div class="card-header">General Settings</div><div class="card-body">
            ${this.#field('PC Name', cfg.pc_name, 'set-name')}
            ${this.#field('PC IP Address', cfg.pc_ip, 'set-ip', 'text', true)}
            ${this.#field('PC Version', cfg.pc_version, 'set-version', 'text', true)}
            ${this.#field('Timezone', cfg.timezone, 'set-tz')}
            ${this.#saveBtn()}
        </div>`;
    }

    #ntpTab(cfg) {
        const servers = (cfg.ntp_servers || []).join('\n');
        return `<div class="card-header">NTP Servers</div><div class="card-body">
            <p class="text-secondary text-sm" style="margin-bottom:var(--space-md);">Configure Network Time Protocol servers for clock synchronization. One server per line.</p>
            <div style="margin-bottom:var(--space-md);">
                <label style="display:block;font-weight:600;margin-bottom:4px;">NTP Servers</label>
                <textarea id="set-ntp" rows="4" style="width:100%;padding:8px;border:1px solid var(--border-subtle);border-radius:4px;background:var(--surface-secondary);color:var(--text-primary);font-family:monospace;">${servers}</textarea>
            </div>
            ${this.#saveBtn()}
        </div>`;
    }

    #dnsTab(cfg) {
        const servers = (cfg.dns_servers || []).join('\n');
        return `<div class="card-header">Name Servers (DNS)</div><div class="card-body">
            <p class="text-secondary text-sm" style="margin-bottom:var(--space-md);">Configure DNS servers for name resolution. One server per line.</p>
            <div style="margin-bottom:var(--space-md);">
                <label style="display:block;font-weight:600;margin-bottom:4px;">DNS Servers</label>
                <textarea id="set-dns" rows="4" style="width:100%;padding:8px;border:1px solid var(--border-subtle);border-radius:4px;background:var(--surface-secondary);color:var(--text-primary);font-family:monospace;">${servers}</textarea>
            </div>
            ${this.#saveBtn()}
        </div>`;
    }

    #smtpTab(cfg) {
        return `<div class="card-header">SMTP Configuration</div><div class="card-body">
            <p class="text-secondary text-sm" style="margin-bottom:var(--space-md);">Configure SMTP server for email alerts and notifications.</p>
            ${this.#field('SMTP Server', cfg.smtp_server, 'set-smtp-server')}
            ${this.#field('Port', cfg.smtp_port, 'set-smtp-port', 'number')}
            ${this.#field('From Address', cfg.smtp_from, 'set-smtp-from', 'email')}
            <div style="margin-bottom:var(--space-md);">
                <label style="display:block;font-weight:600;margin-bottom:4px;">Security Mode</label>
                <select id="set-smtp-sec" style="width:100%;padding:8px;border:1px solid var(--border-subtle);border-radius:4px;background:var(--surface-secondary);color:var(--text-primary);">
                    <option value="none" ${cfg.smtp_security === 'none' ? 'selected' : ''}>None</option>
                    <option value="starttls" ${cfg.smtp_security === 'starttls' ? 'selected' : ''}>STARTTLS</option>
                    <option value="ssl" ${cfg.smtp_security === 'ssl' ? 'selected' : ''}>SSL/TLS</option>
                </select>
            </div>
            ${this.#saveBtn()}
        </div>`;
    }

    #sslTab(cfg) {
        return `<div class="card-header">SSL Certificate</div><div class="card-body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-lg);margin-bottom:var(--space-lg);">
                <div>
                    <div class="text-secondary text-sm">Issuer</div>
                    <div style="font-weight:600;">${cfg.ssl_issuer}</div>
                </div>
                <div>
                    <div class="text-secondary text-sm">Subject</div>
                    <div style="font-weight:600;font-family:monospace;">${cfg.ssl_subject}</div>
                </div>
                <div>
                    <div class="text-secondary text-sm">Expires</div>
                    <div style="font-weight:600;">${cfg.ssl_expires}</div>
                </div>
                <div>
                    <div class="text-secondary text-sm">Status</div>
                    <div style="color:var(--status-good);font-weight:600;">✅ Valid</div>
                </div>
            </div>
            <p class="text-secondary text-sm">To replace the SSL certificate, upload a new PEM-encoded certificate and private key.</p>
            <button class="btn btn-primary" style="margin-top:var(--space-md);" onclick="alert('Certificate upload simulated — this is a lab environment.')">📤 Replace Certificate</button>
        </div>`;
    }

    #pulseTab(cfg) {
        return `<div class="card-header">Nutanix Pulse</div><div class="card-body">
            <p class="text-secondary text-sm" style="margin-bottom:var(--space-lg);">Pulse sends anonymized telemetry and health data to Nutanix Support for proactive monitoring and case management.</p>
            ${this.#toggle('Enable Pulse', cfg.pulse_enabled, 'set-pulse')}
            ${this.#field('Notification Email', cfg.pulse_email, 'set-pulse-email', 'email')}
            <div class="card" style="background:var(--surface-tertiary);margin-top:var(--space-lg);">
                <div class="card-body">
                    <div style="font-weight:600;margin-bottom:8px;">📡 Pulse Status</div>
                    <div class="text-secondary text-sm">Last transmission: ${new Date().toLocaleString()}</div>
                    <div class="text-secondary text-sm">Connection: <span style="color:var(--status-good);">Connected</span></div>
                </div>
            </div>
            ${this.#saveBtn()}
        </div>`;
    }

    #scmaTab(cfg) {
        return `<div class="card-header">Security Configuration Management Automation (SCMA)</div><div class="card-body">
            <p class="text-secondary text-sm" style="margin-bottom:var(--space-lg);">SCMA continuously monitors security configuration settings against STIG baselines and automatically remediates drift.</p>
            ${this.#toggle('Enable SCMA', cfg.scma_enabled, 'set-scma')}
            <div style="margin-bottom:var(--space-md);">
                <label style="display:block;font-weight:600;margin-bottom:4px;">Check Schedule</label>
                <select id="set-scma-sched" style="width:100%;padding:8px;border:1px solid var(--border-subtle);border-radius:4px;background:var(--surface-secondary);color:var(--text-primary);">
                    <option value="hourly" ${cfg.scma_schedule === 'hourly' ? 'selected' : ''}>Hourly</option>
                    <option value="daily" ${cfg.scma_schedule === 'daily' ? 'selected' : ''}>Daily</option>
                    <option value="weekly" ${cfg.scma_schedule === 'weekly' ? 'selected' : ''}>Weekly</option>
                </select>
            </div>
            <div class="card" style="background:var(--surface-tertiary);margin-top:var(--space-lg);">
                <div class="card-body">
                    <div style="font-weight:600;margin-bottom:8px;">🔒 SCMA Status</div>
                    <div class="text-secondary text-sm">Baseline: DISA STIG v2r3</div>
                    <div class="text-secondary text-sm">Last check: ${cfg.scma_enabled ? new Date().toLocaleString() : 'N/A'}</div>
                    <div class="text-secondary text-sm">Compliance: <span style="color:${cfg.scma_enabled ? 'var(--status-good)' : 'var(--text-secondary)'};">${cfg.scma_enabled ? '98.2%' : 'Disabled'}</span></div>
                </div>
            </div>
            ${this.#saveBtn()}
        </div>`;
    }

    async #save(cfg) {
        const updates = {};
        const el = (id) => document.getElementById(id);

        if (el('set-name')) updates.pc_name = el('set-name').value;
        if (el('set-tz')) updates.timezone = el('set-tz').value;
        if (el('set-ntp')) updates.ntp_servers = el('set-ntp').value.split('\n').map(s => s.trim()).filter(Boolean);
        if (el('set-dns')) updates.dns_servers = el('set-dns').value.split('\n').map(s => s.trim()).filter(Boolean);
        if (el('set-smtp-server')) updates.smtp_server = el('set-smtp-server').value;
        if (el('set-smtp-port')) updates.smtp_port = parseInt(el('set-smtp-port').value) || 25;
        if (el('set-smtp-from')) updates.smtp_from = el('set-smtp-from').value;
        if (el('set-smtp-sec')) updates.smtp_security = el('set-smtp-sec').value;
        if (el('set-pulse')) updates.pulse_enabled = el('set-pulse').checked;
        if (el('set-pulse-email')) updates.pulse_email = el('set-pulse-email').value;
        if (el('set-scma')) updates.scma_enabled = el('set-scma').checked;
        if (el('set-scma-sched')) updates.scma_schedule = el('set-scma-sched').value;

        if (cfg.uuid) {
            await state.update('pc_settings', cfg.uuid, updates);
        } else {
            await state.create('pc_settings', { ...this.#defaults(), ...updates });
        }
        toast('Settings saved successfully.', 'success');
    }

    #dataTab() {
        return `<div class="card-header">Data Management</div><div class="card-body">
            <p class="text-secondary text-sm" style="margin-bottom:var(--space-lg);">Export the full simulator state for backup, or import a previously exported state file.</p>
            <div style="display:flex;gap:var(--space-md);margin-bottom:var(--space-xl);">
                <button class="btn btn-primary" id="btn-export-state">📥 Export State</button>
                <button class="btn btn-secondary" id="btn-import-state">📤 Import State</button>
                <input type="file" id="import-file" accept=".json" style="display:none;" />
            </div>
            <div class="card" style="background:var(--surface-tertiary);">
                <div class="card-body">
                    <div style="font-weight:600;margin-bottom:8px;">⚠️ Reset State</div>
                    <p class="text-secondary text-sm" style="margin-bottom:var(--space-md);">Reset all simulator data back to the default seed state. This cannot be undone.</p>
                    <button class="btn btn-danger" id="btn-reset-state">🗑️ Reset to Default</button>
                </div>
            </div>
        </div>`;
    }

    #wireDataTab() {
        const exportBtn = document.getElementById('btn-export-state');
        const importBtn = document.getElementById('btn-import-state');
        const importFile = document.getElementById('import-file');
        const resetBtn = document.getElementById('btn-reset-state');

        exportBtn?.addEventListener('click', () => {
            const json = state.exportState();
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `nutanix-lab-state-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast('State exported successfully.', 'success');
        });

        importBtn?.addEventListener('click', () => importFile?.click());

        importFile?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const text = await file.text();
                await state.importState(text);
                toast('State imported successfully. Refreshing...', 'success');
                setTimeout(() => location.reload(), 1000);
            } catch (err) {
                toast(`Import failed: ${err.message}`, 'warning');
            }
        });

        resetBtn?.addEventListener('click', async () => {
            const ok = await confirm({ title: 'Reset State', message: 'Reset ALL simulator data to defaults? This cannot be undone.', danger: true });
            if (!ok) return;
            await state.reset();
            toast('State reset to defaults. Refreshing...', 'success');
            setTimeout(() => location.reload(), 1000);
        });
    }
}
