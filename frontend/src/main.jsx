import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './App.css';

// Prevenir zoom accidental en dispositivos móviles
document.addEventListener('touchmove', (e) => {
  if (e.scale !== 1) {
    e.preventDefault();
  }
}, { passive: false });

// Detectar modo PWA
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('📱 App ejecutándose como PWA');
  document.documentElement.classList.add('pwa-mode');
}

// Detectar estado de conexión
window.addEventListener('online', () => {
  console.log('🟢 Conexión restaurada');
});

window.addEventListener('offline', () => {
  console.log('🔴 Sin conexión a internet');
});

// Renderizar la aplicación
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
