import { useEffect, useRef, useState } from 'react';
import { FavoriteButton } from '../shared/FavoriteButton';

interface EventLink {
  label: string;
  url: string;
}

interface ProgramEvent {
  time: string;
  title: string;
  type: 'transport' | 'accommodation' | 'activity' | 'food' | 'hike';
  note: string;
  details?: string;
  links?: EventLink[];
}

interface ProgramDay {
  date: string;
  weekday: string;
  label: string;
  baseId: string;
  checkIn: string | null;
  checkOut: string | null;
  events: ProgramEvent[];
}

const typeStyles: Record<string, { bg: string; icon: string }> = {
  transport: { bg: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800', icon: '🚗' },
  accommodation: { bg: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800', icon: '🏠' },
  activity: { bg: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800', icon: '⭐' },
  food: { bg: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800', icon: '🍽️' },
  hike: { bg: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800', icon: '🥾' },
};

const baseColors: Record<string, string> = {
  funchal: 'bg-ocean text-white',
  calheta: 'bg-sun text-slate-900',
  canical: 'bg-lava text-white',
};

const TRIP_START = '2026-03-30';
const TRIP_END = '2026-04-06';

function isToday(dateStr: string): boolean {
  return new Date().toISOString().split('T')[0] === dateStr;
}

function isDuringTrip(): boolean {
  const today = new Date().toISOString().split('T')[0];
  return today >= TRIP_START && today <= TRIP_END;
}

function currentTimeMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function formatCurrentTime(): string {
  return new Date().toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
}

function hasExpandableContent(event: ProgramEvent): boolean {
  return !!(event.details || (event.links && event.links.length > 0));
}

const FAVORITABLE_TYPES = new Set(['activity', 'food', 'hike']);

function eventId(event: ProgramEvent): string {
  return `prog-${event.title.toLowerCase().replace(/[^a-zæøå0-9]+/g, '-').replace(/-+$/, '')}`;
}

function EventRow({ event }: { event: ProgramEvent }) {
  const [open, setOpen] = useState(false);
  const style = typeStyles[event.type] || typeStyles.activity;
  const expandable = hasExpandableContent(event);

  return (
    <div className={`${style.bg} border-l-4`}>
      <button
        type="button"
        onClick={() => expandable && setOpen(!open)}
        className={`flex gap-3 px-4 py-3 w-full text-left ${expandable ? 'cursor-pointer active:bg-black/5 dark:active:bg-white/5' : 'cursor-default'}`}
      >
        <div className="shrink-0 w-12 text-right">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{event.time}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{style.icon}</span>
            <span className="text-sm font-medium flex-1">{event.title}</span>
            {FAVORITABLE_TYPES.has(event.type) && (
              <span onClick={(e) => e.stopPropagation()}>
                <FavoriteButton id={eventId(event)} />
              </span>
            )}
            {expandable && (
              <span className={`text-xs text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
            )}
          </div>
          {event.note && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{event.note}</p>
          )}
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="px-4 pb-3 pl-[76px]">
          {event.details && (
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">{event.details}</p>
          )}
          {event.links && event.links.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target={link.url.startsWith('#') ? '_self' : '_blank'}
                  rel="noopener"
                  className="inline-block text-xs font-medium bg-ocean/10 dark:bg-sky-400/20 text-ocean dark:text-sky-400 px-2.5 py-1 rounded-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ProgramView() {
  const [days, setDays] = useState<ProgramDay[]>([]);
  const todayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data/program.json')
      .then((r) => r.json())
      .then(setDays)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [days]);

  return (
    <div className="p-4 pb-6 max-w-lg mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold">Program</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          30. marts – 6. april 2026 · Tryk på en aktivitet for detaljer
        </p>
      </div>

      <div className="space-y-6">
        {days.map((day) => {
          const today = isToday(day.date);
          return (
            <div
              key={day.date}
              ref={today ? todayRef : undefined}
              className={`rounded-xl overflow-hidden border ${
                today
                  ? 'border-sun shadow-lg shadow-sun/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {/* Day header */}
              <div className={`px-4 py-3 ${baseColors[day.baseId] || 'bg-slate-600 text-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm">{day.weekday} {day.date.split('-')[2]}. {getMonth(day.date)}</span>
                    {today && <span className="ml-2 text-xs bg-white/20 rounded-full px-2 py-0.5">I dag</span>}
                  </div>
                  <span className="text-xs font-medium opacity-80">{day.label}</span>
                </div>
                {(day.checkOut || day.checkIn) && (
                  <div className="text-xs mt-1 opacity-80">
                    {day.checkOut && <span>Check-ud: {day.checkOut}</span>}
                    {day.checkOut && day.checkIn && <span> → </span>}
                    {day.checkIn && <span>Check-in: {day.checkIn}</span>}
                  </div>
                )}
              </div>

              {/* Events timeline */}
              <div className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                {today && isDuringTrip() && currentTimeMinutes() < parseTime(day.events[0]?.time || '23:59') && (
                  <div className="flex items-center gap-2 px-4 py-0.5">
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <div className="flex-1 h-px bg-red-500" />
                    <span className="text-[10px] font-medium text-red-500 shrink-0">Nu {formatCurrentTime()}</span>
                  </div>
                )}
                {day.events.map((event, i) => {
                  const showNow = today && isDuringTrip() && (() => {
                    const now = currentTimeMinutes();
                    const thisTime = parseTime(event.time);
                    const nextTime = i < day.events.length - 1 ? parseTime(day.events[i + 1].time) : 24 * 60;
                    return now >= thisTime && now < nextTime;
                  })();
                  return (
                    <div key={i}>
                      <EventRow event={event} />
                      {showNow && (
                        <div className="flex items-center gap-2 px-4 py-0.5">
                          <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                          <div className="flex-1 h-px bg-red-500" />
                          <span className="text-[10px] font-medium text-red-500 shrink-0">Nu {formatCurrentTime()}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getMonth(dateStr: string): string {
  const month = parseInt(dateStr.split('-')[1]);
  return month === 3 ? 'mar' : 'apr';
}
