import { useState } from 'react';
import { useBase } from '../../context/BaseContext';
import { FavoriteButton } from '../shared/FavoriteButton';
import { mapsSearchUrl } from '../../utils/urls';
import { useData } from '../../hooks/useData';
import type { Restaurant } from '../../types';

const categoryLabels: Record<string, string> = {
  restaurant: 'Restaurant',
  cafe: 'Café',
  bar: 'Bar',
  poncha: 'Poncha',
};

const priceLabel = (n: number) => '€'.repeat(n);

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.3;
  return (
    <span className="text-yellow-500 text-xs tracking-tight">
      {'★'.repeat(full)}{half ? '½' : ''}
    </span>
  );
}

export function GastroView() {
  const { currentBase } = useBase();
  const restaurants = useData<Restaurant>('data/restaurants.json');
  const [filter, setFilter] = useState<string | null>(null);

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
      <div className="flex gap-2 justify-center flex-wrap">
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
          <div
            key={r.id}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-sm">{r.name}</h3>
              <FavoriteButton id={`rest-${r.id}`} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {r.cuisine} · {priceLabel(r.priceRange)}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{r.notes}</p>

            {/* Ratings */}
            {(r.googleRating || r.tripadvisorRating) && (
              <div className="flex gap-4 mt-2">
                {r.googleRating && (
                  <a href={r.googleMapsUrl} target="_blank" rel="noopener" className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-medium">Google</span>
                    <Stars rating={r.googleRating} />
                    <span className="text-slate-400">{r.googleRating}</span>
                  </a>
                )}
                {r.tripadvisorRating && r.tripadvisorUrl && (
                  <a href={r.tripadvisorUrl} target="_blank" rel="noopener" className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-medium">TripAdvisor</span>
                    <Stars rating={r.tripadvisorRating} />
                    <span className="text-slate-400">{r.tripadvisorRating}</span>
                  </a>
                )}
              </div>
            )}

            {/* Action links */}
            <div className="flex gap-3 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <a
                href={mapsSearchUrl(r.name)}
                target="_blank"
                rel="noopener"
                className="text-xs font-medium text-ocean dark:text-sky-400"
              >
                Google Maps →
              </a>
              {r.tripadvisorUrl && (
                <a
                  href={r.tripadvisorUrl}
                  target="_blank"
                  rel="noopener"
                  className="text-xs font-medium text-ocean dark:text-sky-400"
                >
                  TripAdvisor →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
