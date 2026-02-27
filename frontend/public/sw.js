const CACHE_NAME = 'wastesync-cache-v3';
const urlsToCache = [
    '/',
    '/manifest.json',
    '/vite.svg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // For HTML requests, try the network first to avoid stale index.html
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});


// Listen for incoming Web Push Notifications
self.addEventListener('push', function (event) {
    if (event.data) {
        const payload = event.data.json();
        const options = {
            body: payload.body,
            icon: '/vite.svg', // Update to your app's actual icon logo when ready
            badge: '/vite.svg',
            vibrate: [200, 100, 200, 100, 200],
            data: {
                url: payload.url || '/'
            }
        };

        event.waitUntil(
            self.registration.showNotification(payload.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    // Open the app or focus the existing window to the specific URL
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            const urlToOpen = event.notification.data.url;

            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
