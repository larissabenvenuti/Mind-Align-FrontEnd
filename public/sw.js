self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: data.icon || "/favicon.ico",
      badge: data.badge || "/favicon.ico",
      data: data.data,
      vibrate: [200, 100, 200], 
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});