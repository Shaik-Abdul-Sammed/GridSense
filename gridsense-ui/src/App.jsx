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

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SettingsProvider>
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
