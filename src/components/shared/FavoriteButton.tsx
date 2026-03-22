import { useFavorites, type FavoriteStatus } from '../../context/FavoritesContext';

const OPTIONS: { status: FavoriteStatus; icon: string; label: string }[] = [
  { status: 'yes', icon: '👍', label: 'Ja' },
  { status: 'maybe', icon: '🤔', label: 'Måske' },
  { status: 'no', icon: '👎', label: 'Nej' },
];

export function FavoriteButton({ id }: { id: string }) {
  const { getFavorite, setFavorite } = useFavorites();
  const current = getFavorite(id);

  return (
    <span className="inline-flex gap-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.status}
          onClick={(e) => {
            e.stopPropagation();
            setFavorite(id, current === opt.status ? null : opt.status);
          }}
          className={`w-6 h-6 text-xs rounded transition-all ${
            current === opt.status
              ? 'scale-110 opacity-100'
              : 'opacity-30 hover:opacity-60'
          }`}
          aria-label={opt.label}
          title={opt.label}
        >
          {opt.icon}
        </button>
      ))}
    </span>
  );
}
