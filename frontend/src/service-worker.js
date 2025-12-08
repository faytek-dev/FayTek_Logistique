/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst, CacheFirst } from 'workbox-strategies';

clientsClaim();

// Précache tous les assets générés par le build
precacheAndRoute(self.__WB_MANIFEST);

// App Shell
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
    ({ request, url }) => {
        if (request.mode !== 'navigate') {
            return false;
        }
        if (url.pathname.startsWith('/_')) {
            return false;
        }
        if (url.pathname.match(fileExtensionRegexp)) {
            return false;
        }
        return true;
    },
    createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// Cache des images
registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: 'images',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
            }),
        ],
    })
);

// Cache des API calls avec stratégie Network First
registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new NetworkFirst({
        cacheName: 'api-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
            }),
        ],
    })
);

// Cache des assets statiques (CSS, JS)
registerRoute(
    ({ request }) =>
        request.destination === 'style' ||
        request.destination === 'script',
    new StaleWhileRevalidate({
        cacheName: 'static-resources',
    })
);

// Gestion des notifications push
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Logistics PWA';
    const options = {
        body: data.message || 'Nouvelle notification',
        icon: '/logo192.png',
        badge: '/logo192.png',
        vibrate: [200, 100, 200],
        tag: data.tag || 'notification',
        requireInteraction: data.requireInteraction || false,
        data: data.data || {},
        actions: data.actions || []
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Si une fenêtre est déjà ouverte, la focus
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // Sinon, ouvrir une nouvelle fenêtre
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Synchronisation en arrière-plan (pour les tâches hors ligne)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-tasks') {
        event.waitUntil(syncTasks());
    }
});

async function syncTasks() {
    // Récupérer les tâches en attente depuis IndexedDB
    // et les synchroniser avec le serveur
    console.log('Synchronizing tasks...');
}

// Message handler
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
