import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Auto-recover from stale Vite deployment chunks (stale chunk hash on new deployment)
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    console.warn('Vite preload error detected, reloading page to fetch latest version...', event);
    window.location.reload();
  });

  window.addEventListener('error', (event) => {
    const msg = String(event?.message || '');
    if (
      msg.includes('dynamically imported module') ||
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Importing a module script failed')
    ) {
      console.warn('Dynamic import chunk failure detected, auto-reloading to synchronize latest build...', event);
      window.location.reload();
    }
  });
}

// Silence Three.js Clock deprecation notice from R3F internal render loop
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('THREE.Clock: This module has been deprecated') ||
      args[0].includes('THREE.Timer'))
  ) {
    return;
  }
  originalWarn(...args);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
