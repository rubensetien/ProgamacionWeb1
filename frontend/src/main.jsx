import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'
import { registerServiceWorker, setupInstallPrompt } from './sw-register.js'

// Registrar Service Worker para PWA
registerServiceWorker();

// Configurar prompt de instalación
setupInstallPrompt();

// Registrar manejadores para PWA
if ('serviceWorker' in navigator) {
  // Detectar si está en modo standalone (instalada)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  if (isStandalone) {
    console.log('✅ Ejecutando como PWA instalada');
    document.body.classList.add('pwa-installed');
  }

  // Prevenir el comportamiento de pull-to-refresh en móviles
  let startY = 0;
  document.addEventListener('touchstart', (e) => {
    startY = e.touches[0].pageY;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    const y = e.touches[0].pageY;
    // Desactivar pull-to-refresh cuando el usuario está en el tope de la página
    if (startY <= y && window.scrollY === 0) {
      e.preventDefault();
    }
  }, { passive: false });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)