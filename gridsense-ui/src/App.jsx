import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { SettingsProvider } from './context/SettingsContext';
import { ThemeProvider } from './context/ThemeContext';

// Resilient dynamic import helper that automatically recovers if deployment hashes change
function lazyWithRetry(componentImport) {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.warn('Dynamic chunk load failed. Auto-refreshing to fetch latest version...', error);
      const hasReloaded = sessionStorage.getItem('gridsense_chunk_reloaded');
      if (!hasReloaded) {
        sessionStorage.setItem('gridsense_chunk_reloaded', 'true');
        window.location.reload();
        return new Promise(() => {}); // Hold execution while reload takes place
      }
      throw error;
    }
  });
}

// Dynamic code splitting via lazyWithRetry() to accelerate initial page load and prevent stale chunk errors
const Analytics = lazyWithRetry(() => import('./pages/Analytics'));
const History = lazyWithRetry(() => import('./pages/History'));
const Settings = lazyWithRetry(() => import('./pages/Settings'));
const Marketplace = lazyWithRetry(() => import('./pages/Marketplace'));
const ImpactPage = lazyWithRetry(() => import('./pages/ImpactPage'));
const GamerDemo = lazyWithRetry(() => import('./pages/GamerDemo'));
const DigitalTwinPage = lazyWithRetry(() => import('./pages/DigitalTwinPage'));
const DroneFleetPage = lazyWithRetry(() => import('./pages/DroneFleetPage'));
const FieldTechARPage = lazyWithRetry(() => import('./pages/FieldTechARPage'));
const WeatherSyncPage = lazyWithRetry(() => import('./pages/WeatherSyncPage'));

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/forecast';

export default function App() {
  // Strict API connection debugging: detect if deployed on Slate or remote cloud but pointing to localhost
  const isLocalhostApi = API_URL.includes('localhost') || API_URL.includes('127.0.0.1');
  const isRemoteDeployment =
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('onslate.in') ||
      (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'));

  const showLocalhostErrorBanner = isLocalhostApi && isRemoteDeployment;

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SettingsProvider>
          {/* Massive Production Configuration Alert Banner */}
          {showLocalhostErrorBanner && (
            <div className="bg-rose-600 border-b-4 border-rose-950 text-white font-mono font-black text-xs sm:text-sm px-4 py-3.5 text-center shadow-2xl z-50 sticky top-0 flex items-center justify-center gap-2 animate-pulse">
              <span>
                🚨 CONFIGURATION ERROR: Frontend is trying to connect to localhost ({API_URL}). Please update VITE_API_URL in Catalyst Slate.
              </span>
            </div>
          )}

          <BrowserRouter>
            <Suspense
              fallback={
                <div className="h-screen flex items-center justify-center text-cyan-500 font-mono text-sm bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading Module...</span>
                  </div>
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="history" element={<History />} />
                  <Route path="marketplace" element={<Marketplace />} />
                  <Route path="settings" element={<Settings />} />

                  {/* Hackathon Interactive Features & Gamer Demo Routes */}
                  <Route path="impact" element={<ImpactPage />} />
                  <Route path="pitch" element={<ImpactPage />} />
                  <Route path="innovation" element={<ImpactPage />} />
                  <Route path="defender" element={<GamerDemo />} />
                  <Route path="game" element={<GamerDemo />} />
                  <Route path="gamer" element={<GamerDemo />} />
                  <Route path="twin" element={<DigitalTwinPage />} />
                  <Route path="substation3d" element={<DigitalTwinPage />} />
                  <Route path="drones" element={<DroneFleetPage />} />
                  <Route path="ar" element={<FieldTechARPage />} />
                  <Route path="weather" element={<WeatherSyncPage />} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </SettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
