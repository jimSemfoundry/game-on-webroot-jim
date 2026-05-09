/* global self, BroadcastChannel */

let notificationIcon = "/favicon.ico";

try {
  const channel = new BroadcastChannel("notification_logo");
  channel.onmessage = (event) => {
    const icon = event?.data?.icon;
    if (typeof icon === "string" && icon) {
      notificationIcon = icon;
    }
  };
} catch {
  // Ignore BroadcastChannel unsupported cases.
}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { data: { body: event.data.text() } };
  }

  const notification = payload.notification || {};
  const data = payload.data || {};

  const title = notification.title || data.title || "Notification";
  const body = notification.body || data.body || "";
  const icon = notification.icon || data.icon || notificationIcon;
  const badge = data.badge || icon;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      data,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification?.data || {};
  const targetUrl = data.click_action || data.link || data.url || "/";

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of clients) {
        if ("focus" in client) {
          await client.focus();
          if ("navigate" in client) {
            await client.navigate(targetUrl);
          }
          return;
        }
      }

      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })(),
  );
});
