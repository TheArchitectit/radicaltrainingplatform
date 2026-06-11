import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { toast } from '../components/Toast.js';

/**
 * PE Settings — Cluster configuration management.
 */
export class PeSettingsView extends BaseView {
    async render() {
        const c = state.cluster;

        return this.html(`
            <div class="page-title">
                <h1>Settings</h1>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-lg);">
                <!-- Cluster Details -->
                <div class="card">
                    <div class="card-header flex justify-between items-center">
                        <span>Cluster Details</span>
                        <button class="btn save-cluster-btn" style="font-size:11px;padding:4px 12px;">Save</button>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label">Cluster Name</label>
                            <input class="form-input" id="set-cluster-name" value="${c.name}" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Cluster Virtual IP</label>
                            <input class="form-input font-mono" id="set-cluster-vip" value="${c.clusterVIP}" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Data Services IP</label>
                            <input class="form-input font-mono" id="set-ds-ip" value="${c.dataServicesIP}" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Timezone</label>
                            <input class="form-input" id="set-timezone" value="${c.timezone}" />
                        </div>
                    </div>
                </div>

                <!-- DNS/NTP -->
                <div class="card">
                    <div class="card-header flex justify-between items-center">
                        <span>DNS / NTP</span>
                        <button class="btn save-dns-btn" style="font-size:11px;padding:4px 12px;">Save</button>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label">DNS Servers</label>
                            <input class="form-input font-mono" id="set-dns" value="${(c.dns || []).join(', ')}" placeholder="Comma-separated" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">NTP Server</label>
                            <input class="form-input" id="set-ntp" value="${c.ntp}" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Domain</label>
                            <input class="form-input" id="set-domain" value="${c.domain}" />
                        </div>
                    </div>
                </div>

                <!-- Security -->
                <div class="card">
                    <div class="card-header">Security</div>
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label" style="display:flex;align-items:center;gap:8px;">
                                <input type="checkbox" id="set-ssh-lockdown" />
                                SSH Lockdown (lock SSH access to CVMs)
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="form-label" style="display:flex;align-items:center;gap:8px;">
                                <input type="checkbox" id="set-dare" />
                                Data-at-Rest Encryption (DARE)
                            </label>
                            <div class="form-error" style="color:var(--status-warning);font-size:11px;">⚠️ Enabling DARE is irreversible</div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">SSL Certificate</label>
                            <button class="btn" id="replace-ssl-btn">Replace Certificate</button>
                        </div>
                    </div>
                </div>

                <!-- Syslog & SNMP -->
                <div class="card">
                    <div class="card-header flex justify-between items-center">
                        <span>Syslog / SNMP</span>
                        <button class="btn save-syslog-btn" style="font-size:11px;padding:4px 12px;">Save</button>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label">Syslog Server</label>
                            <input class="form-input font-mono" id="set-syslog-server" placeholder="e.g., 10.42.100.50" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Syslog Port</label>
                            <input class="form-input" id="set-syslog-port" type="number" value="514" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Protocol</label>
                            <select class="form-input" id="set-syslog-proto">
                                <option value="UDP">UDP</option>
                                <option value="TCP">TCP</option>
                                <option value="TLS">TCP+TLS</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">SNMP Community</label>
                            <input class="form-input" id="set-snmp" placeholder="e.g., public" />
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    afterRender() {
        document.querySelector('.save-cluster-btn')?.addEventListener('click', () => {
            toast.success('Cluster settings saved');
        });
        document.querySelector('.save-dns-btn')?.addEventListener('click', () => {
            toast.success('DNS/NTP settings saved');
        });
        document.querySelector('.save-syslog-btn')?.addEventListener('click', () => {
            toast.success('Syslog/SNMP settings saved');
        });
        document.getElementById('replace-ssl-btn')?.addEventListener('click', () => {
            toast.info('SSL certificate replacement simulated');
        });
    }
}
