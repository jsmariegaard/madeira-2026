import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useBase } from '../../context/BaseContext';
import { bases } from '../../data/bases';

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

interface POI {
  id: string;
  name: string;
  category: string;
  lat: number;
  lon: number;
  description: string;
  icon: string;
  url?: string;
}

interface Hike {
  id: string;
  name: string;
  difficulty: string;
  duration: string;
  distance: string;
  lat: number;
  lon: number;
  description: string;
  fee: boolean;
  feeUrl: string | null;
}

interface Restaurant {
  id: string;
  name: string;
  category: string;
  lat: number;
  lon: number;
  cuisine: string;
  notes: string;
  priceRange: number;
  googleMapsUrl: string;
  googleRating: number | null;
  tripadvisorRating: number | null;
}

function makeIcon(className: string) {
  return new L.Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    className,
  });
}

const accomIcon = makeIcon('hue-rotate-[200deg] saturate-200 brightness-110');
const hikeIcon = makeIcon('hue-rotate-[90deg] saturate-200');
const foodIcon = makeIcon('hue-rotate-[320deg] saturate-200 brightness-125');

function directionsUrl(lat: number, lon: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`;
}

function PopupLinks({ lat, lon, url, label }: { lat: number; lon: number; url?: string | null; label?: string }) {
  return (
    <div className="flex gap-3 mt-2 pt-1.5 border-t border-slate-200">
      <a
        href={directionsUrl(lat, lon)}
        target="_blank"
        rel="noopener"
        className="text-xs font-medium text-blue-600 no-underline hover:underline"
      >
        Rutevejledning →
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
  const [pois, setPois] = useState<POI[]>([]);
  const [hikes, setHikes] = useState<Hike[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data/pois.json')
      .then((r) => r.json())
      .then(setPois)
      .catch(() => {});
    fetch(import.meta.env.BASE_URL + 'data/hikes.json')
      .then((r) => r.json())
      .then(setHikes)
      .catch(() => {});
    fetch(import.meta.env.BASE_URL + 'data/restaurants.json')
      .then((r) => r.json())
      .then(setRestaurants)
      .catch(() => {});
  }, []);

  const handleLocate = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {}
    );
  };

  return (
    <div className="h-full relative">
      <MapContainer
        center={[currentBase.lat, currentBase.lon]}
        zoom={12}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
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
                <PopupLinks lat={base.accommodation.lat} lon={base.accommodation.lon} />
              </div>
            </Popup>
          </Marker>
        ))}

        {/* POI markers (default red) */}
        {pois.map((poi) => (
          <Marker key={poi.id} position={[poi.lat, poi.lon]}>
            <Popup>
              <div className="text-sm min-w-[180px]">
                <strong>{poi.name}</strong>
                <br />
                <span className="text-slate-600">{poi.description}</span>
                <PopupLinks lat={poi.lat} lon={poi.lon} url={poi.url} label="Læs mere →" />
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Hike markers (green) */}
        {hikes.map((hike) => (
          <Marker key={hike.id} position={[hike.lat, hike.lon]} icon={hikeIcon}>
            <Popup>
              <div className="text-sm min-w-[180px]">
                <strong className="text-green-800">{hike.name}</strong>
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
          <Marker key={r.id} position={[r.lat, r.lon]} icon={foodIcon}>
            <Popup>
              <div className="text-sm min-w-[180px]">
                <strong className="text-pink-800">{r.name}</strong>
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
                <PopupLinks lat={r.lat} lon={r.lon} url={r.googleMapsUrl} label="Google Maps →" />
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
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-500"></span> Overnatning</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Seværdighed</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span> Vandring</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-400"></span> Mad & Drikke</div>
      </div>

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
