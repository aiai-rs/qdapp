// sw.js - Service Worker (负责后台推送 & 修复弹窗)

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

    const title = data.title || '汇盈国际客服';

    const options = {
        body: data.body || '您收到了一条新消息',
        
        // === 图标设置 ===
        icon: '/icon-192.png', // 侧边大图
        badge: '/badge.png',   // 【重要】状态栏小图标 (必须是透明背景白色线条，否则安卓会显示白块)
        
        // === 强制弹窗设置 ===
        vibrate: [200, 100, 200], // 震动：震200ms, 停100ms, 震200ms
        tag: 'im-msg',            // 消息分组，避免重复
        renotify: true,           // 【重要】设为true，确保每条新消息都震动+弹窗
        requireInteraction: true, // 保持通知显示，直到用户点击
        
        data: { url: data.url || '/' }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// 监听通知点击事件
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // 点击后关闭通知

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // 如果 App 已经打开，直接聚焦
            for (const client of clientList) {
                if (client.url && 'focus' in client) {
                    return client.focus();
                }
            }
            // 如果没打开，打开 PWA 主页
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url || '/');
            }
        })
    );
});
