const CACHE_NAME = 'barangay-safety-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache for offline access
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/logo.png',
  '/manifest.json'
];

// Campaign data will be cached dynamically
const CACHE_PREFIX = 'campaign-';

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE).catch(err => {
          console.log('[Service Worker] Some assets failed to cache:', err);
          // Continue even if some assets fail
          return Promise.resolve();
        });
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && !cacheName.startsWith(CACHE_PREFIX)) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests except Supabase API calls
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version
          return cachedResponse;
        }

        // Network request
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not successful
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone response since it can only be consumed once
            const responseToCache = response.clone();

            // Cache the response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If offline and request is for a page, serve offline page
            if (event.request.destination === 'document') {
              console.log('[Service Worker] Serving offline page for:', event.request.url);
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// Handle campaign caching
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_CAMPAIGN') {
    const { campaignId, campaignData } = event.data;
    
    caches.open(`${CACHE_PREFIX}${campaignId}`)
      .then((cache) => {
        // Cache campaign data
        const response = new Response(JSON.stringify(campaignData), {
          headers: { 'Content-Type': 'application/json' }
        });
        cache.put(`/campaign-${campaignId}`, response);
        
        console.log('[Service Worker] Campaign cached:', campaignId);
      });
  }
  
  if (event.data && event.data.type === 'GET_CACHED_CAMPAIGNS') {
    caches.keys()
      .then((cacheNames) => {
        const campaignCaches = cacheNames.filter(name => name.startsWith(CACHE_PREFIX));
        return Promise.all(
          campaignCaches.map(cacheName => 
            caches.open(cacheName).then(cache => cache.keys())
          )
        );
      })
      .then((allKeys) => {
        const campaignIds = allKeys.flat().map(key => 
          key.url.split('/').pop().replace('campaign-', '')
        );
        event.ports[0].postMessage({ campaignIds });
      });
  }
  
  // NEW: Return actual campaign data from cache (used when offline)
  if (event.data && event.data.type === 'GET_ALL_CACHED_CAMPAIGN_DATA') {
    caches.keys()
      .then((cacheNames) => {
        const campaignCaches = cacheNames.filter(name => name.startsWith(CACHE_PREFIX));
        return Promise.all(
          campaignCaches.map(cacheName => 
            caches.open(cacheName)
              .then(cache => cache.keys().then(keys => ({ cache, keys })))
          )
        );
      })
      .then((cacheEntries) => {
        return Promise.all(
          cacheEntries.map(({ cache, keys }) => 
            Promise.all(
              keys.map(request => 
                cache.match(request).then(response => {
                  if (response) return response.json();
                  return null;
                })
              )
            )
          )
        );
      })
      .then((allCampaignData) => {
        // Flatten and filter out nulls
        const campaigns = allCampaignData.flat().filter(Boolean);
        event.ports[0].postMessage({ campaigns });
      })
      .catch((error) => {
        console.error('[Service Worker] Error getting cached campaign data:', error);
        event.ports[0].postMessage({ campaigns: [] });
      });
  }
  
  if (event.data && event.data.type === 'CLEAR_CAMPAIGN_CACHE') {
    const { campaignId } = event.data;
    caches.delete(`${CACHE_PREFIX}${campaignId}`)
      .then(() => {
        console.log('[Service Worker] Campaign cache cleared:', campaignId);
        event.ports[0].postMessage({ success: true });
      });
  }
});