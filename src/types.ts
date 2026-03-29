export interface POI {
  id: string;
  name: string;
  category: string;
  lat: number;
  lon: number;
  description: string;
  icon: string;
  url?: string;
}

export interface Hike {
  id: string;
  name: string;
  difficulty: string;
  duration: string;
  distance: string;
  lat: number;
  lon: number;
  description: string;
  fee: boolean;
  feeUrl: string | null;
}

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  lat: number;
  lon: number;
  baseId: string;
  priceRange: number;
  cuisine: string;
  notes: string;
  googleMapsUrl: string;
  googleRating: number | null;
  tripadvisorRating: number | null;
  tripadvisorUrl: string | null;
}
