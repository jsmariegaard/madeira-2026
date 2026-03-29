import { useState } from 'react';

const AVIATION_KEY = import.meta.env.VITE_AVIATION_KEY || '';

interface FlightInfo {
  flight: string;
  route: string;
  date: string;
  departure: string;
  arrival: string;
  status?: string;
}

const flights: FlightInfo[] = [
  {
    flight: 'DK1124',
    route: 'København (CPH) → Funchal (FNC)',
    date: '30. marts 2026',
    departure: '08:10',
    arrival: '12:10',
  },
  {
    flight: 'DK1125',
    route: 'Funchal (FNC) → København (CPH)',
    date: '6. april 2026',
    departure: '13:30',
    arrival: '19:05',
  },
];

function FlightCard({ info }: { info: FlightInfo }) {
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    if (!AVIATION_KEY) {
      setLiveStatus('Ingen API-nøgle (VITE_AVIATION_KEY)');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.aviationstack.com/v1/flights?access_key=${AVIATION_KEY}&flight_iata=${info.flight}`
      );
      const data = await res.json();
      if (data.data?.[0]) {
        const f = data.data[0];
        setLiveStatus(f.flight_status || 'Ingen status tilgængelig');
      } else {
        setLiveStatus('Fly ikke fundet (muligvis ikke i luften endnu)');
      }
    } catch {
      setLiveStatus('Kunne ikke hente status');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="bg-ocean text-white text-xs font-bold px-2 py-0.5 rounded">{info.flight}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{info.date}</span>
      </div>
      <p className="text-sm font-medium">{info.route}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Afgang: {info.departure} · Ankomst: {info.arrival}
      </p>
      {liveStatus && (
        <p className="text-xs mt-2 font-medium text-sun">{liveStatus}</p>
      )}
      <button
        onClick={fetchStatus}
        disabled={loading}
        className="mt-2 text-xs text-ocean dark:text-sky-400 font-medium disabled:opacity-50"
      >
        {loading ? 'Henter...' : 'Opdater live status →'}
      </button>
    </div>
  );
}

export function LogisticsView() {
  return (
    <div className="p-4 space-y-4 pb-6">
      <div className="text-center">
        <h2 className="text-lg font-bold">Logistik & Transport</h2>
      </div>

      {/* Flights */}
      <section>
        <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">✈️ Fly</h3>
        <div className="space-y-3">
          {flights.map((f) => (
            <FlightCard key={f.flight} info={f} />
          ))}
        </div>
      </section>

      {/* Car rental */}
      <section>
        <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">🚗 Billeje</h3>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm space-y-2">
          <p className="text-sm font-medium">Skoda Scala (Automatgear)</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Funchal Easy Rentacar</p>
          <a
            href="tel:+351291000000"
            className="inline-block mt-1 bg-ocean text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-ocean-light transition-colors"
          >
            Ring til biludlejer
          </a>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            💡 Vejene på Madeira er stejle og fyldt med tunneller. Automatgear er det rigtige valg!
          </p>
        </div>
      </section>

      {/* Trail status */}
      <section>
        <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">🥾 Vandrestier</h3>
        <div className="space-y-2">
          <a
            href="https://ifcn.madeira.gov.pt/en/atividades-de-natureza/percursos-pedestres-recomendados.html"
            target="_blank"
            rel="noopener"
            className="block bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-sm">IFCN Vandreruter</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tjek lukkede stier inden I tager afsted</p>
              </div>
              <span className="text-ocean dark:text-sky-400 text-sm">Åbn →</span>
            </div>
          </a>
          <a
            href="https://simplifica.madeira.gov.pt"
            target="_blank"
            rel="noopener"
            className="block bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-sm">SIMplifica – Miljøgebyr</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Betal €3 gebyr for PR8, 25 Fontes m.fl.</p>
              </div>
              <span className="text-ocean dark:text-sky-400 text-sm">Betal →</span>
            </div>
          </a>
        </div>
      </section>

      {/* Easter note */}
      <section>
        <div className="bg-sand/30 dark:bg-yellow-900/20 rounded-xl p-4 border border-sand dark:border-yellow-800">
          <h3 className="font-semibold text-sm mb-1">🐣 Påsken 2026</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Påskedag er 5. april. Forvent ændrede åbningstider og smukke blomsterprocessioner i byerne.
            Glæd jer til at se Funchal pyntet med blomster — det er en af de smukkeste tider at besøge øen!
          </p>
        </div>
      </section>
    </div>
  );
}
