import { useEffect, useState } from 'react';
import { useBase } from '../../context/BaseContext';

const API_KEY = import.meta.env.VITE_OWM_API_KEY || '';

interface ForecastItem {
  dt: number;
  main: { temp: number; humidity: number };
  weather: { description: string; icon: string }[];
  wind: { speed: number };
  pop: number;
}

interface ForecastData {
  list: ForecastItem[];
  city: { name: string };
}

const LOCATIONS = [
  { label: 'Pico do Arieiro', lat: 32.7356, lon: -16.9281 },
];

const WEBCAMS = [
  { label: 'Funchal - Havnen', url: 'https://www.skylinewebcams.com/en/webcam/portugal/madeira/funchal/funchal-marina.html' },
  { label: 'Funchal - Byen', url: 'https://www.skylinewebcams.com/en/webcam/portugal/madeira/funchal/funchal.html' },
  { label: 'Câmara de Lobos', url: 'https://www.skylinewebcams.com/en/webcam/portugal/madeira/camara-de-lobos/camara-de-lobos.html' },
  { label: 'Pico do Arieiro (Windy)', url: 'https://www.windy.com/webcams/1597157053' },
  { label: 'Netmadeira Webcams', url: 'https://www.netmadeira.com/webcams-madeira' },
];

function getCacheKey(lat: number, lon: number) {
  return `weather_${lat}_${lon}`;
}

async function fetchWeather(lat: number, lon: number): Promise<ForecastData | null> {
  if (!API_KEY) return null;
  const key = getCacheKey(lat, lon);
  const cached = localStorage.getItem(key);
  if (cached) {
    const { data, ts } = JSON.parse(cached);
    if (Date.now() - ts < 30 * 60 * 1000) return data;
  }
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=da`
    );
    if (!res.ok) return null;
    const data = await res.json();
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
    return data;
  } catch {
    // Return cached if available
    if (cached) return JSON.parse(cached).data;
    return null;
  }
}

function formatTime(dt: number) {
  return new Date(dt * 1000).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
}

function formatDay(dt: number) {
  return new Date(dt * 1000).toLocaleDateString('da-DK', { weekday: 'short', day: 'numeric', month: 'short' });
}

function ForecastCard({ label, lat, lon }: { label: string; lat: number; lon: number }) {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchWeather(lat, lon).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [lat, lon]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-sm mb-2">{label}</h3>
        <p className="text-slate-400 text-sm">Henter vejrdata...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-sm mb-2">{label}</h3>
        <p className="text-slate-400 text-sm">
          {API_KEY ? 'Kunne ikke hente vejrdata. Tjek forbindelsen.' : 'Ingen API-nøgle konfigureret (VITE_OWM_API_KEY)'}
        </p>
      </div>
    );
  }

  const hourly = data.list.slice(0, 8);
  // Daily: pick one entry per day (noon-ish)
  const dailyMap = new Map<string, ForecastItem>();
  for (const item of data.list) {
    const day = new Date(item.dt * 1000).toDateString();
    const hour = new Date(item.dt * 1000).getHours();
    if (!dailyMap.has(day) || Math.abs(hour - 12) < Math.abs(new Date(dailyMap.get(day)!.dt * 1000).getHours() - 12)) {
      dailyMap.set(day, item);
    }
  }
  const daily = [...dailyMap.values()].slice(0, 5);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
      <h3 className="font-semibold text-sm mb-3">{label}</h3>

      {/* Hourly (next 8 × 3h) */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        {hourly.map((item) => (
          <div key={item.dt} className="flex flex-col items-center min-w-[60px] text-xs">
            <span className="text-slate-500 dark:text-slate-400">{formatTime(item.dt)}</span>
            <img
              src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
              alt={item.weather[0].description}
              className="w-8 h-8"
            />
            <span className="font-semibold">{Math.round(item.main.temp)}°</span>
            <span className="text-sky-500">{Math.round(item.pop * 100)}%</span>
          </div>
        ))}
      </div>

      {/* 5-day */}
      <div className="space-y-1">
        {daily.map((item) => (
          <div key={item.dt} className="flex items-center gap-2 text-xs">
            <span className="w-16 text-slate-500 dark:text-slate-400">{formatDay(item.dt)}</span>
            <img
              src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
              alt={item.weather[0].description}
              className="w-6 h-6"
            />
            <span className="font-semibold">{Math.round(item.main.temp)}°</span>
            <span className="text-slate-400 capitalize flex-1">{item.weather[0].description}</span>
            <span className="text-sky-500">{Math.round(item.pop * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WeatherView() {
  const { currentBase, allBases } = useBase();

  return (
    <div className="p-4 space-y-4 pb-6">
      <div className="text-center">
        <h2 className="text-lg font-bold">Vejr & Webcams</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tjek webcams inden I kører — stol aldrig kun på vejrudsigten!
        </p>
      </div>

      {/* Current base forecast */}
      <ForecastCard label={currentBase.name} lat={currentBase.lat} lon={currentBase.lon} />

      {/* Pico do Arieiro (mountain weather) */}
      {LOCATIONS.map((loc) => (
        <ForecastCard key={loc.label} label={loc.label} lat={loc.lat} lon={loc.lon} />
      ))}

      {/* Other bases */}
      {allBases
        .filter((b) => b.id !== currentBase.id)
        .map((base) => (
          <ForecastCard key={base.id} label={base.name} lat={base.lat} lon={base.lon} />
        ))}

      {/* Webcams */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Live Webcams</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">
          Webcams er sandheden — tjek bjergtoppene for skydække!
        </p>
        {WEBCAMS.map((cam) => (
          <a
            key={cam.label}
            href={cam.url}
            target="_blank"
            rel="noopener"
            className="block bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-sm">{cam.label}</span>
                <span className="text-xs text-slate-400 ml-2">netmadeira.com</span>
              </div>
              <span className="text-ocean dark:text-sky-400 text-sm">Åbn →</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
