import type { Coordinates, DistanceResult } from "@/types/geo";

const EARTH_RADIUS_KM = 6371;
const AVERAGE_WALK_KM_PER_HOUR = 4.8;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Great-circle distance between two coordinates, in kilometers. */
export function haversineDistanceKm(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  return EARTH_RADIUS_KM * c;
}

export function distanceFrom(a: Coordinates, b: Coordinates): DistanceResult {
  const km = haversineDistanceKm(a, b);
  const walkMinutes = Math.round((km / AVERAGE_WALK_KM_PER_HOUR) * 60);
  return { km, walkMinutes };
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} M`;
  }
  return `${km.toFixed(1)} KM`;
}

export function formatWalkOrDistance(distance: DistanceResult): string {
  if (distance.walkMinutes <= 15) {
    return `${distance.walkMinutes} MIN WALK`;
  }
  return formatDistance(distance.km);
}

export function isWithinBoundingBox(
  point: Coordinates,
  box: { north: number; south: number; east: number; west: number }
): boolean {
  return (
    point.lat <= box.north &&
    point.lat >= box.south &&
    point.lng <= box.east &&
    point.lng >= box.west
  );
}
