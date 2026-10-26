import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Settings from './pages/Settings';
import Marketplace from './pages/Marketplace';
import GamerDemo from './pages/GamerDemo';
import ImpactPage from './pages/ImpactPage';
import DigitalTwinPage from './pages/DigitalTwinPage';
import DroneFleetPage from './pages/DroneFleetPage';
import FieldTechARPage from './pages/FieldTechARPage';
import WeatherSyncPage from './pages/WeatherSyncPage';
import ErrorBoundary from './components/ErrorBoundary';
import { SettingsProvider } from './context/SettingsContext';
import { ThemeProvider } from './context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/forecast';
console.log("ACTIVE API URL:", API_URL);

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
          </BrowserRouter>
        </SettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
