import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Base, bases, getBaseByDate, getBaseByProximity } from '../data/bases';

interface BaseContextType {
  currentBase: Base;
  setManualBase: (id: Base['id'] | null) => void;
  manualOverride: Base['id'] | null;
  allBases: Base[];
}

const BaseContext = createContext<BaseContextType | null>(null);

export function BaseProvider({ children }: { children: ReactNode }) {
  const [manualOverride, setManualOverride] = useState<Base['id'] | null>(null);
  const [geoBase, setGeoBase] = useState<Base | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const nearest = getBaseByProximity(pos.coords.latitude, pos.coords.longitude);
        setGeoBase(nearest);
      },
      () => { /* ignore errors silently */ },
      { enableHighAccuracy: false, maximumAge: 60000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const currentBase = manualOverride
    ? bases.find((b) => b.id === manualOverride)!
    : geoBase ?? getBaseByDate();

  return (
    <BaseContext.Provider value={{ currentBase, setManualBase: setManualOverride, manualOverride, allBases: bases }}>
      {children}
    </BaseContext.Provider>
  );
}

export function useBase() {
  const ctx = useContext(BaseContext);
  if (!ctx) throw new Error('useBase must be used within BaseProvider');
  return ctx;
}
