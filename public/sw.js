// SmartPipeX Service Worker
// Handles caching, offline functionality, and push notifications

const CACHE_NAME = 'smartpipex-v1.0.0';
const OFFLINE_URL = '/offline';

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/dashboard',
  '/dashboard/analytics',
  '/dashboard/alerts',
  '/dashboard/settings',
  '/offline',
  '/manifest.json',
  // Add critical CSS and JS files when available
];

// API endpoints to cache
const API_CACHE_URLS = [
  '/api/data/live',
  '/api/data/history',
  '/api/data/alerts',
  '/api/data/predict',
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static files');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        // Force activation of new service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log(
                `🗑️  Service Worker: Deleting old cache: ${cacheName}`
              );
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests with caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle static resources with cache-first strategy
  event.respondWith(handleStaticRequest(request));
});

// Network-first strategy for API requests
async function handleApiRequest(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('🔄 Service Worker: API request failed, serving from cache');

    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline API response for critical endpoints
    if (request.url.includes('/api/data/live')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Offline',
          message: 'Device is offline. Please check your connection.',
          data: {
            timestamp: new Date().toISOString(),
            inputFlow: 0,
            outputFlow: 0,
            leakDetected: false,
            waterLoss: 0,
            offline: true,
          },
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    throw error;
  }
}

// Handle navigation requests with fallback to offline page
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('🔄 Service Worker: Navigation failed, checking cache');

    // Try cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback to offline page
    console.log('📱 Service Worker: Serving offline page');
    return cache.match(OFFLINE_URL);
  }
}

// Cache-first strategy for static resources
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    // Cache the response for future use
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('❌ Service Worker: Failed to fetch resource:', request.url);
    throw error;
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('🔔 Service Worker: Push notification received');

  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    title: data.title || 'SmartPipeX Alert',
    body: data.body || 'Pipeline monitoring alert',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View Dashboard',
        icon: '/icons/view-action.png',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-action.png',
      },
    ],
    tag: data.tag || 'smartpipex-alert',
    renotify: true,
    requireInteraction: data.urgent || false,
    silent: false,
    vibrate: data.urgent ? [200, 100, 200, 100, 200] : [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(options.title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Service Worker: Notification clicked');

  event.notification.close();

  if (event.action === 'view') {
    // Open dashboard
    event.waitUntil(clients.openWindow('/dashboard'));
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open dashboard
    event.waitUntil(clients.openWindow('/dashboard'));
  }
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync triggered');

  if (event.tag === 'background-sync-alerts') {
    event.waitUntil(syncOfflineAlerts());
  }

  if (event.tag === 'background-sync-settings') {
    event.waitUntil(syncOfflineSettings());
  }
});

// Sync offline alerts when connection is restored
async function syncOfflineAlerts() {
  try {
    // Get offline alerts from IndexedDB or localStorage
    const offlineAlerts = await getOfflineData('alerts');

    if (offlineAlerts && offlineAlerts.length > 0) {
      // Send offline alerts to server
      for (const alert of offlineAlerts) {
        await fetch('/api/alerts/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert),
        });
      }

      // Clear offline alerts after successful sync
      await clearOfflineData('alerts');
      console.log('✅ Service Worker: Offline alerts synced');
    }
  } catch (error) {
    console.error('❌ Service Worker: Failed to sync offline alerts', error);
  }
}

// Sync offline settings when connection is restored
async function syncOfflineSettings() {
  try {
    const offlineSettings = await getOfflineData('settings');

    if (offlineSettings) {
      await fetch('/api/settings/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offlineSettings),
      });

      await clearOfflineData('settings');
      console.log('✅ Service Worker: Offline settings synced');
    }
  } catch (error) {
    console.error('❌ Service Worker: Failed to sync offline settings', error);
  }
}

// Helper functions for offline data management
async function getOfflineData(key) {
  // In a real implementation, you'd use IndexedDB
  // For now, using a simple in-memory approach
  return null;
}

async function clearOfflineData(key) {
  // Clear offline data after sync
  return true;
}

// Send messages to clients
async function sendMessageToClients(message) {
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage(message);
  });
}

// Periodic background sync for critical updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'critical-updates') {
    event.waitUntil(checkCriticalUpdates());
  }
});

async function checkCriticalUpdates() {
  try {
    const response = await fetch('/api/data/live');
    const data = await response.json();

    // Check for critical leaks
    if (
      data.data &&
      data.data.leakDetected &&
      data.data.severity === 'critical'
    ) {
      // Show immediate notification
      await self.registration.showNotification('CRITICAL LEAK DETECTED', {
        body: `Critical leak detected: ${data.data.waterLoss}L/min loss`,
        icon: '/icons/icon-192x192.png',
        tag: 'critical-leak',
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200],
        actions: [
          { action: 'view', title: 'View Details' },
          { action: 'acknowledge', title: 'Acknowledge' },
        ],
      });
    }
  } catch (error) {
    console.error('❌ Service Worker: Failed to check critical updates', error);
  }
}

console.log('📱 SmartPipeX Service Worker loaded successfully');
