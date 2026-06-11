const CACHE_NAME = 'labsim-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/tokens.css',
  './css/components.css',
  './js/app.js',
  './js/core/BridgeClient.js',
  './js/core/CLIService.js',
  './js/core/EventBus.js',
  './js/core/Router.js',
  './js/core/StateEngine.js',
  './js/core/StateStore.js',
  './js/components/CLITerminal.js',
  './js/components/Confirm.js',
  './js/components/EntityTable.js',
  './js/components/ThemeToggle.js',
  './js/components/Toast.js',
  './js/components/Wizard.js',
  './js/views/BaseView.js',
  './js/views/PlaceholderView.js',
  './js/views/ai-gpu.js',
  './js/views/ai-models.js',
  './js/views/ai-monitoring.js',
  './js/views/ai-nai.js',
  './js/views/ai-tools.js',
  './js/views/ci-console.js',
  './js/views/ci-deploy.js',
  './js/views/ci-monitoring.js',
  './js/views/ci-networking.js',
  './js/views/ci-scaling.js',
  './js/views/pc-alerts.js',
  './js/views/pc-api.js',
  './js/views/pc-audit.js',
  './js/views/pc-calm.js',
  './js/views/pc-categories.js',
  './js/views/pc-clusters.js',
  './js/views/pc-dashboard.js',
  './js/views/pc-flow.js',
  './js/views/pc-insights.js',
  './js/views/pc-lcm.js',
  './js/views/pc-leap.js',
  './js/views/pc-network.js',
  './js/views/pc-planning.js',
  './js/views/pc-projects.js',
  './js/views/pc-rbac.js',
  './js/views/pc-reports.js',
  './js/views/pc-settings.js',
  './js/views/pc-vms.js',
  './js/views/pc-xplay.js',
  './js/views/pe-capacity.js',
  './js/views/pe-cli.js',
  './js/views/pe-dashboard.js',
  './js/views/pe-hardware.js',
  './js/views/pe-health.js',
  './js/views/pe-images.js',
  './js/views/pe-network.js',
  './js/views/pe-protection.js',
  './js/views/pe-reports.js',
  './js/views/pe-settings.js',
  './js/views/pe-storage.js',
  './js/views/pe-vms.js',
  './js/views/scenarios.js',
  './js/views/service-pages.js',
  './js/views/us-analytics.js',
  './js/views/us-files.js',
  './js/views/us-objects.js',
  './js/views/us-volumes.js'
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for static assets, network-first for all else
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        // Return cached, but revalidate in background
        fetch(request)
          .then(response => {
            if (response.ok) {
              caches.open(CACHE_NAME).then(cache => cache.put(request, response));
            }
          })
          .catch(() => {}); // Offline — keep cached
        return cached;
      }

      // Not in cache — fetch from network
      return fetch(request)
        .then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseToCache));
          return response;
        })
        .catch(() => {
          // Network failed — return offline placeholder
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
    })
  );
});
