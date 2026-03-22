import { useEffect, useState } from 'react';
import { useBase } from '../../context/BaseContext';

interface Restaurant {
  id: string;
  name: string;
  category: string;
  lat: number;
  lon: number;
  baseId: string;
  priceRange: number;
  cuisine: string;
  notes: string;
  googleMapsUrl: string;
}

const categoryLabels: Record<string, string> = {
  restaurant: 'Restaurant',
  cafe: 'Café',
  bar: 'Bar',
  poncha: 'Poncha',
};

const priceLabel = (n: number) => '€'.repeat(n);

export function GastroView() {
  const { currentBase } = useBase();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data/restaurants.json')
      .then((r) => r.json())
      .then(setRestaurants)
      .catch(() => {});
  }, []);

  const filtered = restaurants
    .filter((r) => r.baseId === currentBase.id)
    .filter((r) => !filter || r.category === filter);

  const categories = [...new Set(restaurants.filter((r) => r.baseId === currentBase.id).map((r) => r.category))];

  return (
    <div className="p-4 space-y-4 pb-6">
      <div className="text-center">
        <h2 className="text-lg font-bold">Mad & Drikke</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Anbefalinger nær {currentBase.name}
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setFilter(null)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            !filter
              ? 'bg-ocean text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          Alle
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === cat
                ? 'bg-ocean text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {categoryLabels[cat] || cat}
          </button>
        ))}
      </div>

      {/* Restaurant cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-8">
            Ingen resultater for dette filter.
          </p>
        )}
        {filtered.map((r) => (
          <a
            key={r.id}
            href={r.googleMapsUrl}
            target="_blank"
            rel="noopener"
            className="block bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{r.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {r.cuisine} · {priceLabel(r.priceRange)}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{r.notes}</p>
              </div>
              <span className="text-ocean dark:text-sky-400 text-xs shrink-0">Kort →</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
