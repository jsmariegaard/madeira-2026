# Madeira 2026 - Project Guidelines

## Skills
- **verify-coordinates**: Always verify lat/lon coordinates via Nominatim before adding locations to data files. See `.claude/skills/verify-coordinates.md`.
- **verify-links**: Always verify external URLs are not 404 before adding them to the app. See `.claude/skills/verify-links.md`.

## Data Files
- `public/data/pois.json` - Points of interest
- `public/data/restaurants.json` - Restaurants and cafés
- `public/data/hikes.json` - Hiking trails
- `public/data/program.json` - Day-by-day itinerary

## Shared Code
- `src/types.ts` - Shared TypeScript interfaces (POI, Hike, Restaurant)
- `src/hooks/useData.ts` - Generic JSON data fetching hook
- `src/utils/urls.ts` - Google Maps URL helper
- `src/utils/tileCacher.ts` - Offline tile caching utility

## Coordinates
All locations are on Madeira island. Valid bounding box:
- Latitude: 32.62 to 32.87
- Longitude: -17.27 to -16.65
