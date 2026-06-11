import { bus } from './core/EventBus.js';
import { bridge } from './core/BridgeClient.js';
import { router } from './core/Router.js';
import { state } from './core/StateEngine.js';
import { PeDashboardView } from './views/pe-dashboard.js';
import { PeVmsView } from './views/pe-vms.js';
import { PeStorageView } from './views/pe-storage.js';
import { PeNetworkView } from './views/pe-network.js';
import { PeImagesView } from './views/pe-images.js';
import { PeProtectionView } from './views/pe-protection.js';
import { PeHardwareView } from './views/pe-hardware.js';
import { PeHealthView } from './views/pe-health.js';
import { PeSettingsView } from './views/pe-settings.js';
import { PeCliView } from './views/pe-cli.js';
import { PcDashboardView } from './views/pc-dashboard.js';
import { PcCategoriesView } from './views/pc-categories.js';
import { PcFlowView } from './views/pc-flow.js';
import { PcLeapView } from './views/pc-leap.js';
import { PcPlanningView } from './views/pc-planning.js';
import { PcXplayView } from './views/pc-xplay.js';
import { PcRbacView } from './views/pc-rbac.js';
import { PcReportsView } from './views/pc-reports.js';
import { PcApiView } from './views/pc-api.js';
import { UsFilesView } from './views/us-files.js';
import { UsAnalyticsView } from './views/us-analytics.js';
import { UsObjectsView } from './views/us-objects.js';
import { UsVolumesView } from './views/us-volumes.js';
import { CiConsoleView } from './views/ci-console.js';
import { CiDeployView } from './views/ci-deploy.js';
import { CiNetworkingView } from './views/ci-networking.js';
import { AiGpuView } from './views/ai-gpu.js';
import { AiNaiView } from './views/ai-nai.js';
import { AiToolsView } from './views/ai-tools.js';
import { ScenariosView } from './views/scenarios.js';
import { ServicePagesView } from './views/service-pages.js';
import { PcVmsView } from './views/pc-vms.js';
import { PcCalmView } from './views/pc-calm.js';
import { PcAuditView } from './views/pc-audit.js';
import { PcClustersView } from './views/pc-clusters.js';
import { PcLcmView } from './views/pc-lcm.js';
import { PcSettingsView } from './views/pc-settings.js';
import { PcNetworkView } from './views/pc-network.js';
import { PcAlertsView } from './views/pc-alerts.js';
import { PcProjectsView } from './views/pc-projects.js';
import { PeReportsView } from './views/pe-reports.js';
import { PeCapacityView } from './views/pe-capacity.js';
import { PcInsightsView } from './views/pc-insights.js';
import { AiModelsView } from './views/ai-models.js';
import { AiMonitoringView } from './views/ai-monitoring.js';
import { CiMonitoringView } from './views/ci-monitoring.js';
import { CiScalingView } from './views/ci-scaling.js';
import { initTheme } from './components/ThemeToggle.js';

/**
 * App — Bootstrap the Nutanix Lab Simulator.
 */
class App {
    #context = 'pe'; // 'pe' or 'pc'
    #hamburgerOpen = false;

    async init() {
        // Initialize state engine
        await state.init();

        // Initialize theme
        initTheme();

        // Set up routing
        router.setContainer(document.getElementById('view-container'));
        this.#registerRoutes();

        // Wire up navigation
        this.#wireNavigation();

        // Start router
        router.start();

        // Notify C# bridge we're ready
        bridge.post('ready');

        // Listen for route changes to update nav highlights
        bus.on('route:changed', ({ path }) => this.#onRouteChanged(path));
    }

    #registerRoutes() {
        // PE routes
        router.register('/pe/dashboard', PeDashboardView);
        router.register('/pe/vms', PeVmsView);
        router.register('/pe/storage', PeStorageView);
        router.register('/pe/network', PeNetworkView);
        router.register('/pe/images', PeImagesView);
        router.register('/pe/protection', PeProtectionView);
        router.register('/pe/hardware', PeHardwareView);
        router.register('/pe/health', PeHealthView);
        router.register('/pe/settings', PeSettingsView);
        router.register('/pe/cli', PeCliView);

        // PC routes
        router.register('/pc/dashboard', PcDashboardView);
        router.register('/pc/vms', PcVmsView);
        router.register('/pc/categories', PcCategoriesView);
        router.register('/pc/flow', PcFlowView);
        router.register('/pc/leap', PcLeapView);
        router.register('/pc/planning', PcPlanningView);
        router.register('/pc/xplay', PcXplayView);
        router.register('/pc/rbac', PcRbacView);
        router.register('/pc/reports', PcReportsView);
        router.register('/pc/api', PcApiView);

        // Unified Storage routes
        router.register('/pc/files', UsFilesView);
        router.register('/pc/analytics', UsAnalyticsView);
        router.register('/pc/objects', UsObjectsView);
        router.register('/pc/volumes', UsVolumesView);

        // Cloud Integration (NC2) routes
        router.register('/pc/nc2-console', CiConsoleView);
        router.register('/pc/nc2-deploy', CiDeployView);
        router.register('/pc/nc2-networking', CiNetworkingView);

        // AI Infrastructure routes
        router.register('/pc/gpu', AiGpuView);
        router.register('/pc/nai', AiNaiView);
        router.register('/pc/nai-tools', AiToolsView);

        // Scenarios & Tools routes
        router.register('/pc/scenarios', ScenariosView);
        router.register('/pe/services', ServicePagesView);

        // Sprint 11 — New routes
        router.register('/pc/calm', PcCalmView);
        router.register('/pc/audit', PcAuditView);
        router.register('/pc/clusters', PcClustersView);

        // Sprint 12 — New routes
        router.register('/pc/lcm', PcLcmView);
        router.register('/pc/pc-settings', PcSettingsView);
        router.register('/pc/network', PcNetworkView);
        router.register('/pc/alerts', PcAlertsView);
        router.register('/pc/projects', PcProjectsView);

        // Sprint 13 — New routes
        router.register('/pe/reports', PeReportsView);
        router.register('/pe/capacity', PeCapacityView);
        router.register('/pc/insights', PcInsightsView);
        router.register('/pc/ai-models', AiModelsView);
        router.register('/pc/ai-monitoring', AiMonitoringView);
        router.register('/pc/nc2-monitoring', CiMonitoringView);
        router.register('/pc/nc2-scaling', CiScalingView);
    }

    #wireNavigation() {
        // Hamburger toggle
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const hamburgerOverlay = document.getElementById('hamburger-overlay');
        const hamburgerBackdrop = document.getElementById('hamburger-backdrop');

        hamburgerBtn?.addEventListener('click', () => this.#toggleHamburger());
        hamburgerBackdrop?.addEventListener('click', () => this.#closeHamburger());

        // Nav item clicks (PE hamburger)
        document.querySelectorAll('#hamburger-overlay .nav-item[data-route]').forEach(item => {
            item.addEventListener('click', () => {
                router.navigate(item.dataset.route);
                this.#closeHamburger();
            });
        });

        // Nav item clicks (PC sidebar)
        document.querySelectorAll('#pc-sidebar .nav-item[data-route]').forEach(item => {
            item.addEventListener('click', () => {
                router.navigate(item.dataset.route);
            });
        });

        // Context switcher
        const ctxSwitcher = document.getElementById('context-switcher');
        ctxSwitcher?.addEventListener('change', (e) => {
            this.#setContext(e.target.value);
        });
    }

    #toggleHamburger() {
        this.#hamburgerOpen = !this.#hamburgerOpen;
        document.getElementById('hamburger-overlay')?.classList.toggle('open', this.#hamburgerOpen);
        document.getElementById('hamburger-backdrop')?.classList.toggle('open', this.#hamburgerOpen);
    }

    #closeHamburger() {
        this.#hamburgerOpen = false;
        document.getElementById('hamburger-overlay')?.classList.remove('open');
        document.getElementById('hamburger-backdrop')?.classList.remove('open');
    }

    #setContext(ctx) {
        this.#context = ctx;
        const pcSidebar = document.getElementById('pc-sidebar');
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const ctxLabel = document.getElementById('context-label');

        if (ctx === 'pc') {
            pcSidebar?.classList.add('active');
            hamburgerBtn.style.display = 'none';
            ctxLabel.textContent = 'Prism Central';
            this.#closeHamburger();
            router.navigate('/pc/dashboard');
        } else {
            pcSidebar?.classList.remove('active');
            hamburgerBtn.style.display = 'flex';
            ctxLabel.textContent = 'Prism Element';
            router.navigate('/pe/dashboard');
        }
    }

    #onRouteChanged({ path }) {
        // Update breadcrumb
        const bc = document.getElementById('breadcrumb');
        if (bc) {
            const parts = path.split('/').filter(Boolean);
            const ctx = parts[0] === 'pc' ? 'Prism Central' : 'Prism Element';
            const page = parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' > ');
            bc.innerHTML = `<a href="#/${parts[0]}/dashboard">${ctx}</a><span class="separator">›</span><span class="current">${page || 'Dashboard'}</span>`;
        }

        // Highlight active nav items
        document.querySelectorAll('.nav-item[data-route]').forEach(item => {
            item.classList.toggle('active', item.dataset.route === path);
        });

        // Sync context switcher
        const isPC = path.startsWith('/pc');
        if ((isPC && this.#context !== 'pc') || (!isPC && this.#context !== 'pe')) {
            this.#context = isPC ? 'pc' : 'pe';
            const switcher = document.getElementById('context-switcher');
            if (switcher) switcher.value = this.#context;
            document.getElementById('pc-sidebar')?.classList.toggle('active', isPC);
            document.getElementById('hamburger-btn').style.display = isPC ? 'none' : 'flex';
            document.getElementById('context-label').textContent = isPC ? 'Prism Central' : 'Prism Element';
        }
    }
}

// Boot
const app = new App();
app.init().catch(err => console.error('[App] Init failed:', err));
