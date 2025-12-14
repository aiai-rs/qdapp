// sw.js - Service Worker (负责后台推送)

self.addEventListener('install', (event) => {
    self.skipWaiting(); // 强制立即生效
    console.log('SW: Installed');
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
    console.log('SW: Activated');
});

// 监听后台推送事件 (锁屏弹窗核心)
self.addEventListener('push', (event) => {
    let data = {};
    try {
        data = event.data.json();
    } catch (e) {
        data = { title: '新消息', body: event.data.text() };
    }

    const options = {
        body: data.body,
        icon: '/icon-192.png', // 确保你有这个图标
        badge: '/icon-192.png', // 安卓状态栏小图标
        vibrate: [200, 100, 200], // 震动模式
        data: { url: data.url || '/' },
        requireInteraction: true // 保持弹窗直到用户点击
    };

    event.waitUntil(
        self.registration.showNotification(data.title || '汇盈国际客服', options)
    );
});

// 监听通知点击事件
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // 点击后关闭通知

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // 如果 App 已经打开，直接聚焦
            for (const client of clientList) {
                if (client.url.includes('/') && 'focus' in client) {
                    return client.focus();
                }
            }
            // 如果没打开，打开 PWA
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
