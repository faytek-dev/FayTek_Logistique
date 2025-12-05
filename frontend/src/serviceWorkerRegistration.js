export function register(config) {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

            navigator.serviceWorker
                .register(swUrl)
                .then((registration) => {
                    console.log('✅ Service Worker registered:', registration);

                    registration.onupdatefound = () => {
                        const installingWorker = registration.installing;
                        if (installingWorker == null) {
                            return;
                        }
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                    console.log('New content is available; please refresh.');
                                    if (config && config.onUpdate) {
                                        config.onUpdate(registration);
                                    }
                                } else {
                                    console.log('Content is cached for offline use.');
                                    if (config && config.onSuccess) {
                                        config.onSuccess(registration);
                                    }
                                }
                            }
                        };
                    };
                })
                .catch((error) => {
                    console.error('Error during service worker registration:', error);
                });
        });
    }
}

export function unregister() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => {
                registration.unregister();
            })
            .catch((error) => {
                console.error(error.message);
            });
    }
}

// Demander la permission pour les notifications
export async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    return false;
}

// Envoyer une notification locale
export function showNotification(title, options) {
    if ('serviceWorker' in navigator && 'Notification' in window) {
        if (Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification(title, {
                    icon: '/logo192.png',
                    badge: '/logo192.png',
                    vibrate: [200, 100, 200],
                    ...options
                });
            });
        }
    }
}
