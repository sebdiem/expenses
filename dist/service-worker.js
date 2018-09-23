const appName = 'expenses';
const version = '2';

const expectedCaches = [`${appName}-static-${version}`];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(`${appName}-static-${version}`)
      .then(cache => cache.addAll([
        '/',
        '/app.js',
        '/app.css'
      ]))
  );
  console.log("creating cache", `${appName}-static-${version}`);
});

self.addEventListener('activate', event => {
  // delete any caches that aren't in expectedCaches
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        console.log(expectedCaches, key)
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
