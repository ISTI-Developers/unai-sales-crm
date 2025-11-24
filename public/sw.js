self.addEventListener('push', function (event) {
  const data = event.data?.json()
  if (!data) return;

  const { title, ...payload } = data;

  event.waitUntil(
    self.registration.showNotification(title, payload)
  )
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const url = event.notification.data.url;
  event.waitUntil(clients.openWindow(url ?? '/')) // redirect user if clicked
})
