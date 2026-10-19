self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      let payload = {};

      try {
        const raw = event.data?.text() ?? "";

        try {
          payload = raw ? JSON.parse(raw) : {};
        } catch {
          payload = { body: raw };
        }
      } catch (error) {
        console.error("Failed to read push payload:", error);
      }

      const title = payload.title || "UNMG Sales Platform";

      await self.registration.showNotification(title, {
        body: payload.body || "You have a new notification.",
        icon: payload.icon || "/icon.png",
        badge: payload.badge || "/badge.png",
        data: payload.data || { url: "/" },
        actions: [
          { action: "view", title: "View" },
          { action: "dismiss", title: "Dismiss" },
        ],
      });
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  event.waitUntil(
    (async () => {
      const target = new URL(
        event.notification.data?.url ?? "/",
        self.location.origin,
      );

      if (target.origin !== self.location.origin) return;

      const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // First, focus a tab already at the destination.
      const existingTarget = clients.find(
        (client) => client.url === target.href,
      );

      if (existingTarget) {
        return existingTarget.focus();
      }
      
      // Otherwise, navigate an existing tab belonging to this app.
      const appClient = clients.find((client) => {
        return new URL(client.url).origin === self.location.origin;
      });

      if (appClient && "navigate" in appClient) {
        await appClient.navigate(target.href);
        return appClient.focus();
      }

      return self.clients.openWindow(target.href);
    })(),
  );
});
