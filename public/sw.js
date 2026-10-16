self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data?.json() ?? {};
  } catch {
    payload = {
      title: "UNMG Sales Platform",
      body: event.data?.text() ?? "",
    };
  }

  const title = payload.title ?? "UNMG Sales Platform";

  const options = {
    body: payload.body ?? "",
    icon: payload.icon ?? "/icon.png",
    badge: payload.badge ?? "/badge.png",
    data: payload.data,
    actions: [
      { action: "view", title: "View" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  const action = event.action;

  notification.close();

  if (action === "dismiss") return;

  if (action === "view" || action === "") {
    event.waitUntil(
      (async () => {
        const target = new URL(
          notification.data?.url ?? "/",
          self.location.origin,
        );

        // // Only allow navigation within this website.
        // if (target.origin !== self.location.origin) {
        //   return;
        // }

        const clientList = await self.clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });

        for (const client of clientList) {
          if ("navigate" in client) {
            await client.navigate(target.href);
            return client.focus();
          }
        }

        return self.clients.openWindow(target.href);
      })(),
    );
  }
});
