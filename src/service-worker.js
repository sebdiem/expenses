const appName = 'expenses';
const version = '%VERSION%';

const expectedCaches = [`${appName}-static-${version}`];

self.addEventListener('install', event => {
  self.skipWaiting(); // enable page update on refresh (instead of closing reopening tab)
  event.waitUntil(
    caches.open(`${appName}-static-${version}`)
      .then(cache => cache.addAll([
        '/',
        '/%APP_JS%',
        '/%APP_CSS%',
      ]))
  );
  console.log("creating cache", `${appName}-static-${version}`);
});

self.addEventListener('activate', event => {
  // delete any caches that aren't in expectedCaches
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (!expectedCaches.includes(key)) {
          console.log("deleting cache", key);
          return caches.delete(key);
        }
      })
    )).then(() => {
      console.log('caches cleared');
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
