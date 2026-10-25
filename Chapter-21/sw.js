const CACHE_NAME = 'netlify-onoff-v3';
const OFFLINE_PAGE = '/offline.html';

const ASSETS_TO_CACHE = [
'/',
'index.html',
'/offline.html',
'/manifest.json',
'/icon-192.png',
'/icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // We reageren alleen op GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        // STEP 1: Examine if the request (a page, icon or manifest) is present in the cache
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse; // Found !! Serve Direct (Index, Icons, etc.)
            }

            // STEP 2: Not in cache? (like Page 2). Try the network.
            return fetch(event.request).catch(() => {
                // STEP 3: Network fails and we are navigating? Show the offline page.
                if (event.request.mode === 'navigate') {
                    return caches.match(OFFLINE_PAGE);
                }
            });
        })
    );
});
