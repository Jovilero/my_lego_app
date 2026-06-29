/* Lego Parts Tracker - Service Worker Nativo para funcionamiento Offline */

const CACHE_NAME = 'lego-parts-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './img/logo.svg',
  './manifest.json'
];

// 1. Evento de Instalación: Cachear recursos estáticos del shell de la app
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Cacheando el App Shell');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Evento de Activación: Limpiar cachés antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Limpiando caché antiguo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Evento Fetch: Interceptación inteligente para soporte offline
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Tratamiento especial para imágenes del CDN de Rebrickable (Caché dinámico)
  if (requestUrl.hostname.includes('rebrickable.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            // Devolver del caché inmediatamente
            return cachedResponse;
          }

          // Si no está en caché, hacer fetch de la red
          // Usamos un clon del request porque los requests son streams de un solo uso
          return fetch(event.request).then((networkResponse) => {
            // Guardar en caché y devolver la respuesta de red
            // Importante: Las respuestas de imágenes externas pueden ser opacas (status 0)
            // Aceptamos guardarlas para soporte offline de etiquetas <img>
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch((error) => {
            console.error('[Service Worker] Error al descargar imagen externa offline:', error);
            // Fallback: Si falla el fetch offline, el navegador mostrará el broken image,
            // que será manejado por el onerror en app.js para poner el icono de pieza.
          });
        });
      })
    );
    return;
  }

  // Estrategia Cache-First con actualización de red (Stale-While-Revalidate) para recursos de la app
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Hacemos un fetch en segundo plano para actualizar el caché silenciosamente
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {/* Silenciar fallos de red en offline */});
        
        return cachedResponse;
      }
      
      return fetch(event.request);
    })
  );
});
