const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const SUBDOMAINS = ['a', 'b', 'c'];

// Madeira bounding box (with margin)
const BOUNDS = { minLat: 32.60, maxLat: 32.90, minLon: -17.30, maxLon: -16.65 };

function lon2tile(lon: number, zoom: number) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

function lat2tile(lat: number, zoom: number) {
  return Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
}

export function countTiles(minZoom: number, maxZoom: number): number {
  let count = 0;
  for (let z = minZoom; z <= maxZoom; z++) {
    const xMin = lon2tile(BOUNDS.minLon, z);
    const xMax = lon2tile(BOUNDS.maxLon, z);
    const yMin = lat2tile(BOUNDS.maxLat, z);
    const yMax = lat2tile(BOUNDS.minLat, z);
    count += (xMax - xMin + 1) * (yMax - yMin + 1);
  }
  return count;
}

export async function cacheTiles(
  minZoom: number,
  maxZoom: number,
  onProgress: (done: number, total: number) => void,
  signal?: AbortSignal
): Promise<void> {
  const total = countTiles(minZoom, maxZoom);
  let done = 0;

  for (let z = minZoom; z <= maxZoom; z++) {
    const xMin = lon2tile(BOUNDS.minLon, z);
    const xMax = lon2tile(BOUNDS.maxLon, z);
    const yMin = lat2tile(BOUNDS.maxLat, z);
    const yMax = lat2tile(BOUNDS.minLat, z);

    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        if (signal?.aborted) return;
        const s = SUBDOMAINS[(x + y) % 3];
        const url = TILE_URL.replace('{s}', s).replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y));
        try {
          await fetch(url, { mode: 'cors' });
        } catch {
          // tile fetch failed, skip
        }
        done++;
        if (done % 10 === 0 || done === total) onProgress(done, total);
      }
    }
  }
}
