export interface GeoPoint {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;

export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export function withinRange(a: GeoPoint, b: GeoPoint, radiusKm: number): boolean {
  return haversineKm(a, b) <= radiusKm;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export interface RouteLeg {
  from: GeoPoint;
  to: GeoPoint;
  distanceKm: number;
  durationMinutes: number;
}

export function toRadSegment(a: GeoPoint): GeoPoint {
  return { lat: toRad(a.lat), lng: toRad(a.lng) };
}

/**
 * Deterministic mock routing: straight-line "as the crow flies" scaled by a
 * road-factor of 1.35, plus per-leg speed. Never used for real navigation.
 */
export function mockRouteSegments(points: GeoPoint[], avgSpeedKmh = 30): RouteLeg[] {
  const legs: RouteLeg[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const distanceKm = haversineKm(points[i]!, points[i + 1]!) * 1.35;
    const durationMinutes = Math.round((distanceKm / avgSpeedKmh) * 60);
    legs.push({ from: points[i]!, to: points[i + 1]!, distanceKm: Math.round(distanceKm), durationMinutes });
  }
  return legs;
}

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}