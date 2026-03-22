import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useBase } from '../../context/BaseContext';
import { bases } from '../../data/bases';

// Fix default marker icon issue with bundlers
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

const accomIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: 'hue-rotate-[200deg] saturate-200 brightness-110',
});

const hikeIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: 'hue-rotate-[90deg] saturate-200',
});

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

        {/* Accommodation markers */}
        {bases.map((base) => (
          <Marker key={base.id} position={[base.accommodation.lat, base.accommodation.lon]} icon={accomIcon}>
            <Popup>
              <div className="text-sm">
                <strong className="text-ocean">{base.accommodation.name}</strong>
                <br />
                <span className="text-slate-600">{base.accommodation.address}</span>
                <br />
                <span className="text-xs">{base.accommodation.checkIn} → {base.accommodation.checkOut}</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* POI markers */}
        {pois.map((poi) => (
          <Marker key={poi.id} position={[poi.lat, poi.lon]}>
            <Popup>
              <div className="text-sm">
                <strong>{poi.name}</strong>
                <br />
                <span className="text-slate-600">{poi.description}</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Hike markers */}
        {hikes.map((hike) => (
          <Marker key={hike.id} position={[hike.lat, hike.lon]} icon={hikeIcon}>
            <Popup>
              <div className="text-sm">
                <strong className="text-laurel">{hike.name}</strong>
                <br />
                <span className="text-slate-600">{hike.description}</span>
                <br />
                <span className="text-xs font-medium">
                  {hike.difficulty} · {hike.duration} · {hike.distance}
                </span>
                {hike.fee && hike.feeUrl && (
                  <>
                    <br />
                    <a href={hike.feeUrl} target="_blank" rel="noopener" className="text-xs text-ocean underline">
                      Betal miljøgebyr (€3)
                    </a>
                  </>
                )}
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
