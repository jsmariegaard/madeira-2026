import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useBase } from '../../context/BaseContext';
import { bases } from '../../data/bases';
import { FavoriteButton } from '../shared/FavoriteButton';
import { useFavorites, type FavoriteStatus } from '../../context/FavoritesContext';
import { cacheTiles, countTiles } from '../../utils/tileCacher';
import { mapsUrl, mapsSearchUrl } from '../../utils/urls';
import { useData } from '../../hooks/useData';
import type { POI, Hike, Restaurant } from '../../types';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


function makeIcon(className: string, favStatus?: FavoriteStatus) {
  const favClass = favStatus === 'yes' ? 'fav-yes' : favStatus === 'no' ? 'fav-no' : '';
  return new L.Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    className: `${className} ${favClass}`.trim(),
  });
}

const accomIcon = makeIcon('hue-rotate-[200deg] saturate-200 brightness-110');

function poiIcon(fav?: FavoriteStatus) { return makeIcon('', fav); }
function hikeIcon(fav?: FavoriteStatus) { return makeIcon('hue-rotate-[90deg] saturate-200', fav); }
function foodIcon(fav?: FavoriteStatus) { return makeIcon('hue-rotate-[320deg] saturate-200 brightness-125', fav); }


function PopupLinks({ lat, lon, url, label, name }: { lat: number; lon: number; url?: string | null; label?: string; name?: string }) {
  return (
    <div className="flex gap-3 mt-2 pt-1.5 border-t border-slate-200">
      <a
        href={name ? mapsSearchUrl(name) : mapsUrl(lat, lon)}
        target="_blank"
        rel="noopener"
        className="text-xs font-medium text-blue-600 no-underline hover:underline"
      >
        Google Maps →
      </a>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener"
          className="text-xs font-medium text-blue-600 no-underline hover:underline"
        >
          {label || 'Mere info →'}
        </a>
      )}
    </div>
  );
}

function FlyToBase({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  const initial = useState(true);
  useEffect(() => {
    if (initial[0]) {
      initial[1](false);
      return;
    }
    map.flyTo([lat, lon], 12, { duration: 1 });
  }, [lat, lon, map, initial]);
  return null;
}

export function MapView() {
  const { currentBase } = useBase();
  const { getFavorite } = useFavorites();
  const pois = useData<POI>('data/pois.json');
  const hikes = useData<Hike>('data/hikes.json');
  const restaurants = useData<Restaurant>('data/restaurants.json');
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [cacheProgress, setCacheProgress] = useState<{ done: number; total: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleLocate = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {}
    );
  };

  const handleCacheTiles = async () => {
    if (cacheProgress) {
      abortRef.current?.abort();
      setCacheProgress(null);
      return;
    }
    const total = countTiles(10, 14);
    const ok = confirm(`Download ${total} kortfliser til offline brug?\nDette tager et par minutter.`);
    if (!ok) return;
    const ac = new AbortController();
    abortRef.current = ac;
    setCacheProgress({ done: 0, total });
    await cacheTiles(10, 14, (done, t) => setCacheProgress({ done, total: t }), ac.signal);
    setCacheProgress(null);
  };

  return (
    <div className="h-full relative">
      <MapContainer
        center={[currentBase.lat, currentBase.lon]}
        zoom={12}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <LayersControl position="topleft">
          <LayersControl.BaseLayer checked name="Standard">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Topografisk">
            <TileLayer
              attribution='&copy; <a href="https://www.opentopomap.org">OpenTopoMap</a>'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              maxZoom={17}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellit">
            <TileLayer
              attribution='&copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        <FlyToBase lat={currentBase.lat} lon={currentBase.lon} />

        {/* Accommodation markers (blue) */}
        {bases.map((base) => (
          <Marker key={base.id} position={[base.accommodation.lat, base.accommodation.lon]} icon={accomIcon}>
            <Popup>
              <div className="text-sm min-w-[180px]">
                <strong className="text-blue-800">{base.accommodation.name}</strong>
                <br />
                <span className="text-slate-600">{base.accommodation.address}</span>
                <br />
                <span className="text-xs text-slate-500">{base.accommodation.checkIn} → {base.accommodation.checkOut}</span>
                <PopupLinks lat={base.accommodation.lat} lon={base.accommodation.lon} name={base.accommodation.name} />
              </div>
            </Popup>
          </Marker>
        ))}

        {/* POI markers (default red) */}
        {pois.map((poi) => (
          <Marker key={poi.id} position={[poi.lat, poi.lon]} icon={poiIcon(getFavorite(`poi-${poi.id}`))}>
            <Popup>
              <div className="text-sm min-w-[180px]">
                <div className="flex items-start justify-between gap-1">
                  <strong>{poi.name}</strong>
                  <FavoriteButton id={`poi-${poi.id}`} />
                </div>
                <span className="text-slate-600">{poi.description}</span>
                <PopupLinks lat={poi.lat} lon={poi.lon} url={poi.url} label="Læs mere →" name={poi.name} />
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Hike markers (green) */}
        {hikes.map((hike) => (
          <Marker key={hike.id} position={[hike.lat, hike.lon]} icon={hikeIcon(getFavorite(`hike-${hike.id}`))}>
            <Popup>
              <div className="text-sm min-w-[180px]">
                <div className="flex items-start justify-between gap-1">
                  <strong className="text-green-800">{hike.name}</strong>
                  <FavoriteButton id={`hike-${hike.id}`} />
                </div>
                <br />
                <span className="text-slate-600">{hike.description}</span>
                <br />
                <span className="text-xs font-medium">
                  {hike.difficulty} · {hike.duration} · {hike.distance}
                </span>
                {hike.fee && hike.feeUrl && (
                  <>
                    <br />
                    <a href={hike.feeUrl} target="_blank" rel="noopener" className="text-xs text-orange-600 no-underline font-medium">
                      Betal miljøgebyr (€3) →
                    </a>
                  </>
                )}
                <PopupLinks lat={hike.lat} lon={hike.lon} />
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Restaurant markers (pink/magenta) */}
        {restaurants.map((r) => (
          <Marker key={r.id} position={[r.lat, r.lon]} icon={foodIcon(getFavorite(`rest-${r.id}`))}>
            <Popup>
              <div className="text-sm min-w-[180px]">
                <div className="flex items-start justify-between gap-1">
                  <strong className="text-pink-800">{r.name}</strong>
                  <FavoriteButton id={`rest-${r.id}`} />
                </div>
                <br />
                <span className="text-slate-600">{r.cuisine} · {'€'.repeat(r.priceRange)}</span>
                <br />
                <span className="text-xs text-slate-500">{r.notes}</span>
                {(r.googleRating || r.tripadvisorRating) && (
                  <div className="flex gap-2 mt-1 text-xs">
                    {r.googleRating && <span>Google: {r.googleRating}/5</span>}
                    {r.tripadvisorRating && <span>TripAdvisor: {r.tripadvisorRating}/5</span>}
                  </div>
                )}
                <PopupLinks lat={r.lat} lon={r.lon} url={r.googleMapsUrl} label="Google Maps →" name={r.name} />
              </div>
            </Popup>
          </Marker>
        ))}

        {/* User position */}
        {userPos && (
          <Marker position={userPos}>
            <Popup>Din position</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Legend */}
      <div className="absolute top-2 right-2 z-[1000] bg-white/90 dark:bg-slate-800/90 rounded-lg px-3 py-2 text-xs shadow-md space-y-0.5">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Overnatning</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Seværdighed</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-500"></span> Vandring</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-400"></span> Mad & Drikke</div>
      </div>

      {/* Tile cache button */}
      <button
        onClick={handleCacheTiles}
        className="absolute bottom-20 right-4 z-[1000] bg-white dark:bg-slate-800 text-ocean dark:text-sky-400 shadow-lg rounded-full w-12 h-12 flex items-center justify-center text-xl border border-slate-200 dark:border-slate-600"
        aria-label="Gem kort offline"
        title="Gem kort offline"
      >
        {cacheProgress ? '⏹' : '💾'}
      </button>
      {cacheProgress && (
        <div className="absolute bottom-20 right-18 z-[1000] bg-white dark:bg-slate-800 shadow-lg rounded-lg px-3 py-2 text-xs border border-slate-200 dark:border-slate-600">
          <div className="font-medium mb-1">Gemmer kort...</div>
          <div className="w-32 bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
            <div
              className="bg-ocean h-1.5 rounded-full transition-all"
              style={{ width: `${Math.round((cacheProgress.done / cacheProgress.total) * 100)}%` }}
            />
          </div>
          <div className="text-slate-500 mt-0.5">{cacheProgress.done} / {cacheProgress.total}</div>
        </div>
      )}

      {/* Locate button */}
      <button
        onClick={handleLocate}
        className="absolute bottom-4 right-4 z-[1000] bg-white dark:bg-slate-800 text-ocean dark:text-sky-400 shadow-lg rounded-full w-12 h-12 flex items-center justify-center text-xl border border-slate-200 dark:border-slate-600"
        aria-label="Find min position"
      >
        📍
      </button>
    </div>
  );
}
