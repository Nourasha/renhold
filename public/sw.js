// public/sw.js
const CACHE_NAME = "textilia-v7";
const STATIC_ASSETS = ["/", "/login", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/")));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    }),
  );
});

// Push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const title = data.title || "Textilia Oslo Renhold";
  const conversationId = data.conversationId || null;
  const senderId = data.senderId || null;

  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: {
      url: data.url || "/dashboard",
      conversationId,
      senderId,
    },
    tag: conversationId
      ? `chat-conversation-${conversationId}`
      : senderId
        ? `chat-user-${senderId}`
        : "chat-group",
    renotify: false,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Click notification -> open app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const path = event.notification.data?.url || "/dashboard";
  const targetUrl = new URL(path, self.location.origin).toString();

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (
            client.url.startsWith(self.location.origin) &&
            "focus" in client
          ) {
            return client.focus().then(() => {
              if ("navigate" in client) {
                return client.navigate(targetUrl);
              }
            });
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});

// Listen for messages from app to close chat notifications
self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || !data.type) return;

  event.waitUntil(
    (async () => {
      const notifications = await self.registration.getNotifications();

      if (data.type === "CLOSE_ALL_CHAT_NOTIFICATIONS") {
        for (const notification of notifications) {
          if (
            notification.tag?.startsWith("chat-conversation-") ||
            notification.tag?.startsWith("chat-user-") ||
            notification.tag === "chat-group"
          ) {
            notification.close();
          }
        }
        return;
      }

      if (data.type === "CLOSE_CHAT_NOTIFICATIONS") {
        for (const notification of notifications) {
          const nData = notification.data || {};
          const isGroupTarget =
            data.userId === null && notification.tag === "chat-group";

          const isPrivateTarget =
            !!data.userId &&
            (nData.senderId === data.userId ||
              notification.tag === `chat-user-${data.userId}`);

          if (isGroupTarget || isPrivateTarget) {
            notification.close();
          }
        }
      }
    })(),
  );
});
