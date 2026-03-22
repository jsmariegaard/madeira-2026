import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type FavoriteStatus = 'yes' | 'no' | 'maybe' | null;

interface FavoritesContextType {
  getFavorite: (id: string) => FavoriteStatus;
  setFavorite: (id: string, status: FavoriteStatus) => void;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

const STORAGE_KEY = 'madeira26-favorites';

function loadFavorites(): Record<string, FavoriteStatus> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveFavorites(favs: Record<string, FavoriteStatus>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Record<string, FavoriteStatus>>(loadFavorites);

  const getFavorite = useCallback((id: string) => favorites[id] ?? null, [favorites]);

  const setFavorite = useCallback((id: string, status: FavoriteStatus) => {
    setFavorites((prev) => {
      const next = { ...prev };
      if (status === null) {
        delete next[id];
      } else {
        next[id] = status;
      }
      saveFavorites(next);
      return next;
    });
  }, []);

  return (
    <FavoritesContext.Provider value={{ getFavorite, setFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
