self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon-192.png',  // 通知的右侧大图（可以用彩色）
        badge: '/badge.png',    // 【重要】状态栏小图标（必须是透明底+白色图案）
        data: { url: data.url || '/' },
        vibrate: [200, 100, 200],
        tag: 'hy-msg',
        renotify: true,
        requireInteraction: true // 强制通知停留，直到用户点击
    });
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes('/') && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow('/');
        })
    );
});
