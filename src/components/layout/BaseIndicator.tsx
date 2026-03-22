import { useBase } from '../../context/BaseContext';
import { useTheme } from '../../context/ThemeContext';

export function BaseIndicator() {
  const { currentBase, setManualBase, manualOverride, allBases } = useBase();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <select
        value={manualOverride ?? ''}
        onChange={(e) => setManualBase(e.target.value === '' ? null : (e.target.value as typeof currentBase.id))}
        className="bg-ocean-light dark:bg-slate-700 text-white text-sm rounded px-2 py-1 border border-white/20 outline-none"
      >
        <option value="">Auto: {currentBase.name}</option>
        {allBases.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      <button
        onClick={toggleTheme}
        className="text-lg p-1 rounded hover:bg-white/10 transition-colors"
        aria-label="Skift tema"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  );
}
