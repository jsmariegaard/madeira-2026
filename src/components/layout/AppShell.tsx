import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { BaseIndicator } from './BaseIndicator';

const BASE_SELECTOR_ROUTES = ['/vejr', '/mad'];

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const showBaseSelector = BASE_SELECTOR_ROUTES.includes(pathname);

  return (
    <div className="flex flex-col h-dvh bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <header className="flex items-center justify-between px-4 py-2 bg-ocean dark:bg-slate-800 text-white shadow-md z-20 shrink-0">
        <h1 className="text-lg font-bold tracking-tight">Madeira 2026</h1>
        <BaseIndicator showBaseSelector={showBaseSelector} />
      </header>
      <main className="flex-1 overflow-auto relative">{children}</main>
      <BottomNav />
    </div>
  );
}
