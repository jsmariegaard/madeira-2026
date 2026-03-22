import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BaseProvider } from './context/BaseContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppShell } from './components/layout/AppShell';
import { MapView } from './components/map/MapView';
import { WeatherView } from './components/weather/WeatherView';
import { GastroView } from './components/gastro/GastroView';
import { LogisticsView } from './components/logistics/LogisticsView';

export default function App() {
  return (
    <ThemeProvider>
      <BaseProvider>
        <HashRouter>
          <AppShell>
            <Routes>
              <Route path="/kort" element={<MapView />} />
              <Route path="/vejr" element={<WeatherView />} />
              <Route path="/mad" element={<GastroView />} />
              <Route path="/logistik" element={<LogisticsView />} />
              <Route path="*" element={<Navigate to="/kort" replace />} />
            </Routes>
          </AppShell>
        </HashRouter>
      </BaseProvider>
    </ThemeProvider>
  );
}
