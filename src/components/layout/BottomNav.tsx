import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/kort', label: 'Kort', icon: '🗺️' },
  { to: '/vejr', label: 'Vejr', icon: '⛅' },
  { to: '/mad', label: 'Mad', icon: '🍽️' },
  { to: '/logistik', label: 'Logistik', icon: '✈️' },
] as const;

export function BottomNav() {
  return (
    <nav className="flex shrink-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-20">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
              isActive
                ? 'text-ocean dark:text-sky-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`
          }
        >
          <span className="text-xl mb-0.5">{tab.icon}</span>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
