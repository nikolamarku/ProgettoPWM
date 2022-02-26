'use strict';

var cacheVersion = 1;
var currentCache = {
    offline: 'offline-cache' + cacheVersion
};

var offlineUrl = "offline-index.html";

this.addEventListener('install', event => {
    event.waitUntil(
        caches.open(currentCache.offline).then(function (cache) {
            return cache.addAll([
                'img/add.svg',
                'img/copy.svg',
                'img/delete.svg',
                'img/down.svg',
                'img/up.svg',
                'js/bootstrap.min.js.map',
                'js/bootstrap.min.js',
                'js/cryptohelper.js',
                'js/jquery.min.js',
                'js/passmanager.js',
                'js/utils.js',
                'css/style.css',
                'css/bootstrap.min.css',
                'css/bootstrap.min.css.map',
                offlineUrl
            ]);
        })
    );
});

this.addEventListener('fetch', event => {
    // request.mode = navigate isn't supported in all browsers
    // so include a check for Accept: text/html header.
    if (event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
        event.respondWith(
            fetch(event.request.url).catch(error => {
                // Return the offline page
                return caches.match(offlineUrl);
            })
        );
    }
    else {
        // Respond with everything else if we can
        event.respondWith(caches.match(event.request)
            .then(function (response) {
                return response || fetch(event.request);
            })
        );
    }
});