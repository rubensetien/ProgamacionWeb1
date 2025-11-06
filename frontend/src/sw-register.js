// sw-register.js - Registro del Service Worker

export const registerServiceWorker = () => {
  // Verificar si el navegador soporta Service Workers
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers no están soportados en este navegador');
    return;
  }

  window.addEventListener('load', async () => {
    try {
      // Registrar el service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
        updateViaCache: 'none' // Siempre buscar actualizaciones
      });

      console.log('✅ Service Worker registrado correctamente:', registration.scope);

      // Detectar actualizaciones del SW
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('🔄 Nueva versión del Service Worker detectada');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Hay una nueva versión disponible
            showUpdateNotification(newWorker);
          }
        });
      });

      // Escuchar mensajes del Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        handleSWMessage(event.data);
      });

      // Verificar actualizaciones cada 1 hora
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);

      // Configurar sincronización en segundo plano
      if ('sync' in registration) {
        setupBackgroundSync();
      }

      // Detectar cambios de conectividad
      setupConnectivityListener(registration);

    } catch (error) {
      console.error('❌ Error al registrar Service Worker:', error);
    }
  });
};

// Mostrar notificación de actualización disponible
function showUpdateNotification(worker) {
  const updateBanner = document.createElement('div');
  updateBanner.id = 'sw-update-banner';
  updateBanner.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px;
      text-align: center;
      z-index: 10000;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      animation: slideDown 0.3s ease-out;
    ">
      <style>
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
      </style>
      <p style="margin: 0 0 12px 0; font-size: 14px;">
        🎉 <strong>Nueva versión disponible!</strong> Actualiza para obtener las últimas mejoras.
      </p>
      <button id="sw-update-btn" style="
        background: white;
        color: #667eea;
        border: none;
        padding: 10px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        margin-right: 8px;
        transition: transform 0.2s;
      " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        Actualizar ahora
      </button>
      <button id="sw-dismiss-btn" style="
        background: transparent;
        color: white;
        border: 1px solid white;
        padding: 10px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        transition: transform 0.2s;
      " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        Más tarde
      </button>
    </div>
  `;

  document.body.appendChild(updateBanner);

  // Botón de actualizar
  document.getElementById('sw-update-btn').addEventListener('click', () => {
    worker.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  });

  // Botón de cerrar
  document.getElementById('sw-dismiss-btn').addEventListener('click', () => {
    updateBanner.remove();
  });
}

// Manejar mensajes del Service Worker
function handleSWMessage(data) {
  console.log('📨 Mensaje del Service Worker:', data);

  switch (data.type) {
    case 'SYNC_COMPLETE':
      console.log('✅ Sincronización completada');
      
      if (data.pendingItems > 0) {
        console.log(`⚠️ ${data.pendingItems} elementos pendientes de sincronización`);
        showSyncNotification(`Aún hay ${data.pendingItems} elementos pendientes`);
      } else {
        showSyncNotification('✅ Todos los datos sincronizados correctamente');
      }
      break;

    case 'OFFLINE':
      showOfflineNotification();
      break;

    case 'ONLINE':
      showOnlineNotification();
      break;

    default:
      console.log('Mensaje no reconocido:', data);
  }
}

// Configurar sincronización en segundo plano
function setupBackgroundSync() {
  navigator.serviceWorker.ready.then((registration) => {
    // Verificar soporte de Background Sync
    if ('sync' in registration) {
      console.log('✅ Background Sync habilitado');
      
      // Registrar sincronización periódica
      window.addEventListener('online', () => {
        registration.sync.register('sync-regma-data')
          .then(() => console.log('🔄 Sincronización programada'))
          .catch((err) => console.error('Error al programar sincronización:', err));
      });
    } else {
      console.warn('⚠️ Background Sync no está soportado');
    }
  });
}

// Detectar cambios de conectividad
function setupConnectivityListener(registration) {
  let wasOffline = !navigator.onLine;

  const updateOnlineStatus = () => {
    const isOnline = navigator.onLine;

    if (isOnline && wasOffline) {
      console.log('🌐 Conexión restaurada');
      showOnlineNotification();
      
      // Intentar sincronizar datos
      if ('sync' in registration) {
        registration.sync.register('sync-regma-data');
      } else {
        // Fallback: enviar mensaje al SW para sincronizar
        navigator.serviceWorker.controller?.postMessage({ type: 'REQUEST_SYNC' });
      }
    } else if (!isOnline && !wasOffline) {
      console.log('📡 Conexión perdida - Modo offline');
      showOfflineNotification();
    }

    wasOffline = !isOnline;
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
}

// Notificación de sincronización
function showSyncNotification(message) {
  const notification = createNotification(message, '#10b981', '✅');
  setTimeout(() => notification.remove(), 4000);
}

// Notificación de modo offline
function showOfflineNotification() {
  const notification = createNotification(
    '📡 Sin conexión - Trabajando en modo offline',
    '#f59e0b',
    '⚠️'
  );
  notification.id = 'offline-notification';
  
  // Remover cuando se conecte
  const removeOnOnline = () => {
    notification.remove();
    window.removeEventListener('online', removeOnOnline);
  };
  window.addEventListener('online', removeOnOnline);
}

// Notificación de conexión restaurada
function showOnlineNotification() {
  const notification = createNotification(
    '🌐 Conexión restaurada - Sincronizando datos...',
    '#10b981',
    '✅'
  );
  setTimeout(() => notification.remove(), 4000);
}

// Crear notificación personalizada
function createNotification(message, color, icon) {
  const notification = document.createElement('div');
  notification.className = 'pwa-notification';
  notification.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: ${color};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      max-width: 350px;
      animation: slideIn 0.3s ease-out;
      display: flex;
      align-items: center;
      gap: 12px;
    ">
      <style>
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      </style>
      <span style="font-size: 24px;">${icon}</span>
      <span style="font-size: 14px; font-weight: 500;">${message}</span>
    </div>
  `;
  document.body.appendChild(notification);
  return notification;
}

// Verificar si la app está instalada
export const checkInstallation = () => {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('✅ PWA instalada y ejecutándose en modo standalone');
    return true;
  }
  return false;
};

// Prompt de instalación
export const setupInstallPrompt = () => {
  let deferredPrompt;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevenir que Chrome muestre el prompt automáticamente
    e.preventDefault();
    deferredPrompt = e;

    console.log('💾 PWA puede ser instalada');

    // Mostrar banner de instalación personalizado
    showInstallBanner(deferredPrompt);
  });

  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA instalada exitosamente');
    deferredPrompt = null;
  });
};

// Banner de instalación
function showInstallBanner(deferredPrompt) {
  // No mostrar si ya fue cerrado en esta sesión
  if (sessionStorage.getItem('installBannerDismissed')) {
    return;
  }

  const installBanner = document.createElement('div');
  installBanner.id = 'install-banner';
  installBanner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      text-align: center;
      z-index: 10000;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
      animation: slideUp 0.3s ease-out;
    ">
      <style>
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      </style>
      <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
        📱 Instala Catálogo Regma en tu dispositivo
      </p>
      <p style="margin: 0 0 16px 0; font-size: 14px; opacity: 0.9;">
        Accede más rápido y trabaja sin conexión
      </p>
      <button id="install-btn" style="
        background: white;
        color: #667eea;
        border: none;
        padding: 12px 32px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        margin-right: 8px;
        transition: transform 0.2s;
      " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        Instalar
      </button>
      <button id="dismiss-install-btn" style="
        background: transparent;
        color: white;
        border: 1px solid white;
        padding: 12px 32px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        transition: transform 0.2s;
      " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        Ahora no
      </button>
    </div>
  `;

  document.body.appendChild(installBanner);

  // Botón de instalar
  document.getElementById('install-btn').addEventListener('click', async () => {
    installBanner.remove();
    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);
    deferredPrompt = null;
  });

  // Botón de cerrar
  document.getElementById('dismiss-install-btn').addEventListener('click', () => {
    installBanner.remove();
    sessionStorage.setItem('installBannerDismissed', 'true');
  });
}

// Limpiar caché manualmente (útil para desarrollo)
export const clearAppCache = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    
    // Enviar mensaje al SW para limpiar caché
    registration.active?.postMessage({ type: 'CLEAR_CACHE' });
    
    // Limpiar también el localStorage si es necesario
    console.log('🗑️ Caché limpiado');
  }
};