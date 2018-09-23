const appName = 'expenses';
const version = '2';

const expectedCaches = [`{appName}-static-${version}`];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(`${appName}-static-${version}`)
      .then(cache => cache.addAll([
        '/',
        '/app.js',
        '/app.css'
      ]))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
