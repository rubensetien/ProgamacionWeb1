// Service Worker para PWA Catálogo Regma
// Versión: 1.0.0

const CACHE_VERSION = 'regma-v1';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;
const CACHE_API = `${CACHE_VERSION}-api`;
const CACHE_IMAGES = `${CACHE_VERSION}-images`;

// Archivos críticos que se cachearán en la instalación
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/App.css',
  '/manifest.json',
  '/offline.html'
];

// Configuración de API
const API_URL = 'https://progamacionweb1.onrender.com';
const FRONTEND_URL = 'https://progamacionweb1-1.onrender.com';

// Cola de sincronización para peticiones fallidas
let syncQueue = [];

// ========================================
// INSTALACIÓN DEL SERVICE WORKER
// ========================================
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => {
        console.log('[SW] Cacheando archivos estáticos');
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn('[SW] Error al cachear algunos archivos:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// ========================================
// ACTIVACIÓN DEL SERVICE WORKER
// ========================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.startsWith(CACHE_VERSION)) {
              console.log('[SW] Eliminando caché antigua:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ========================================
// ESTRATEGIAS DE CACHÉ
// ========================================

// Network First (API calls) - Intenta red primero, luego caché
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    // Solo cachear respuestas GET exitosas (POST/PUT/DELETE no se pueden cachear)
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_API);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Red no disponible, buscando en caché:', request.url);
    
    // Solo buscar en caché si es GET
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Si es una petición API que falló (POST/PUT/DELETE), guardar en cola de sincronización
    if (request.method !== 'GET' && request.url.includes('/api/')) {
      await saveToSyncQueue(request);
    }
    
    throw error;
  }
}

// Cache First (Assets estáticos) - Intenta caché primero, luego red
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Error al obtener recurso:', request.url);
    throw error;
  }
}

// Stale While Revalidate (Imágenes) - Devuelve caché y actualiza en segundo plano
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_IMAGES);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// ========================================
// INTERCEPCIÓN DE PETICIONES (FETCH)
// ========================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar peticiones no HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Ignorar Socket.IO y WebSocket
  if (url.pathname.includes('/socket.io/') || url.protocol.startsWith('ws')) {
    return;
  }
  
  // ESTRATEGIA: API calls -> Network First
  if (url.origin === API_URL) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // ESTRATEGIA: Imágenes -> Stale While Revalidate
  if (request.destination === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  
  // ESTRATEGIA: Assets estáticos -> Cache First
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // DEFAULT: Network First para todo lo demás
  event.respondWith(networkFirst(request));
});

// ========================================
// SINCRONIZACIÓN EN SEGUNDO PLANO
// ========================================
async function saveToSyncQueue(request) {
  const requestData = {
    url: request.url,
    method: request.method,
    headers: {},
    body: null,
    timestamp: Date.now()
  };
  
  // Copiar headers
  for (let [key, value] of request.headers.entries()) {
    requestData.headers[key] = value;
  }
  
  // Copiar body si existe
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      requestData.body = await request.clone().text();
    } catch (e) {
      console.warn('[SW] No se pudo clonar el body de la petición');
    }
  }
  
  syncQueue.push(requestData);
  console.log('[SW] Petición guardada en cola de sincronización:', requestData.url);
}

// Registro de sincronización
self.addEventListener('sync', (event) => {
  console.log('[SW] Evento de sincronización:', event.tag);
  
  if (event.tag === 'sync-regma-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('[SW] Iniciando sincronización de datos...');
  
  const itemsToSync = [...syncQueue];
  syncQueue = [];
  
  for (const item of itemsToSync) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body
      });
      
      if (!response.ok) {
        // Si falla, volver a encolar
        syncQueue.push(item);
        console.warn('[SW] Sincronización fallida para:', item.url);
      } else {
        console.log('[SW] Sincronizado exitosamente:', item.url);
      }
    } catch (error) {
      // Si falla, volver a encolar
      syncQueue.push(item);
      console.error('[SW] Error en sincronización:', error);
    }
  }
  
  // Notificar a los clientes sobre el estado de sincronización
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_COMPLETE',
      pendingItems: syncQueue.length
    });
  });
}

// ========================================
// NOTIFICACIONES PUSH
// ========================================
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Nueva notificación de Regma',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'regma-notification',
    requireInteraction: false,
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.id || '1'
    },
    actions: [
      { action: 'view', title: 'Ver', icon: '/icons/icon-96x96.png' },
      { action: 'close', title: 'Cerrar', icon: '/icons/icon-96x96.png' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Catálogo Regma', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(FRONTEND_URL)
    );
  }
});

// ========================================
// MENSAJES DESDE LA APLICACIÓN
// ========================================
self.addEventListener('message', (event) => {
  console.log('[SW] Mensaje recibido:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
  
  if (event.data && event.data.type === 'REQUEST_SYNC') {
    event.waitUntil(syncData());
  }
});

// ========================================
// MANEJO DE ERRORES OFFLINE
// ========================================
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      // Si es una navegación, mostrar página offline
      if (event.request.mode === 'navigate') {
        return caches.match('/offline.html');
      }
      
      // Para otros recursos, devolver del caché si existe
      return caches.match(event.request);
    })
  );
});

console.log('[SW] Service Worker cargado correctamente');