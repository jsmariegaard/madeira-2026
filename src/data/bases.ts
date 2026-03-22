export interface Base {
  id: 'funchal' | 'calheta' | 'canical';
  name: string;
  lat: number;
  lon: number;
  dateFrom: string; // ISO date
  dateTo: string;
  accommodation: {
    name: string;
    address: string;
    lat: number;
    lon: number;
    checkIn: string;
    checkOut: string;
  };
  vibe: string;
  activities: string[];
}

export const bases: Base[] = [
  {
    id: 'funchal',
    name: 'Funchal',
    lat: 32.6505,
    lon: -16.8977,
    dateFrom: '2026-03-30',
    dateTo: '2026-04-02',
    accommodation: {
      name: 'Carvalhal Old Town',
      address: 'Travessa Conde Carvalhal 18/12, Funchal',
      lat: 32.6505,
      lon: -16.8977,
      checkIn: '30. marts',
      checkOut: '2. april',
    },
    vibe: 'Historisk atmosfære, smalle gader, tæt på havnepromenaden',
    activities: [
      'Kabelbane til Monte',
      'Kurveslædetur (Toboggan)',
      'Mercado dos Lavradores',
      'Rua de Santa Maria',
    ],
  },
  {
    id: 'calheta',
    name: 'Calheta',
    lat: 32.7238,
    lon: -17.1648,
    dateFrom: '2026-04-02',
    dateTo: '2026-04-04',
    accommodation: {
      name: 'GuestReady – Escape with Ocean & Mountain Views',
      address: 'Caminho Lombo Atoguia 296, Calheta',
      lat: 32.7238,
      lon: -17.1648,
      checkIn: '2. april',
      checkOut: '4. april',
    },
    vibe: 'Solrigt, moderne og afslappet. En af de få sandstrande',
    activities: [
      'Levada 25 Fontes / Alecrim',
      'Paul da Serra højsletten',
      'Calheta sandstrand',
      'Sukkerrørsfabrikken',
    ],
  },
  {
    id: 'canical',
    name: 'Caniçal',
    lat: 32.7424,
    lon: -16.7098,
    dateFrom: '2026-04-04',
    dateTo: '2026-04-06',
    accommodation: {
      name: 'Dreams Madeira Resort Spa & Marina',
      address: 'Sítio da Piedade, 9200-044 Caniçal',
      lat: 32.7424,
      lon: -16.7098,
      checkIn: '4. april',
      checkOut: '6. april',
    },
    vibe: 'Luksus, rå kystnatur og autentisk fiskerby',
    activities: [
      'PR8 Ponta de São Lourenço',
      'Hvalmuseet',
      'Frisk seafood i byen',
      'Resort spa & pool',
    ],
  },
];

export function getBaseByDate(date: Date = new Date()): Base {
  const iso = date.toISOString().split('T')[0];
  for (const base of bases) {
    if (iso >= base.dateFrom && iso < base.dateTo) {
      return base;
    }
  }
  // Default to nearest base by date
  if (iso < bases[0].dateFrom) return bases[0];
  return bases[bases.length - 1];
}

export function getBaseByProximity(lat: number, lon: number): Base {
  let closest = bases[0];
  let minDist = Infinity;
  for (const base of bases) {
    const d = haversine(lat, lon, base.lat, base.lon);
    if (d < minDist) {
      minDist = d;
      closest = base;
    }
  }
  return closest;
}

/** Haversine distance in km */
export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
