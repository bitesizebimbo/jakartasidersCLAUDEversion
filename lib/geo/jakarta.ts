import type { Coordinates } from "@/types/geo";
import type { NeighborhoodSlug } from "@/types/place";
import { seededRandom } from "@/lib/utils/prng";

/** Approximate geographic centers for each covered neighborhood. */
export const NEIGHBORHOOD_CENTERS: Record<NeighborhoodSlug, Coordinates> = {
  "blok-m": { lat: -6.244, lng: 106.7996 },
  senopati: { lat: -6.228, lng: 106.809 },
  scbd: { lat: -6.2249, lng: 106.809 },
  kemang: { lat: -6.2607, lng: 106.8133 },
  cipete: { lat: -6.2635, lng: 106.799 },
  cilandak: { lat: -6.288, lng: 106.8 },
  "pondok-indah": { lat: -6.266, lng: 106.783 },
  petogogan: { lat: -6.239, lng: 106.801 },
  menteng: { lat: -6.195, lng: 106.834 },
  cikini: { lat: -6.189, lng: 106.839 },
  thamrin: { lat: -6.195, lng: 106.823 },
  tebet: { lat: -6.226, lng: 106.85 },
  glodok: { lat: -6.148, lng: 106.814 },
  "kota-tua": { lat: -6.137, lng: 106.813 },
  "kelapa-gading": { lat: -6.161, lng: 106.906 },
  pik: { lat: -6.109, lng: 106.74 },
};

/** Jakarta-wide default map viewport, centered to favor South Jakarta density. */
export const JAKARTA_DEFAULT_VIEWPORT = {
  center: { lat: -6.235, lng: 106.815 } as Coordinates,
  zoom: 12,
};

export const JAKARTA_BOUNDS = {
  north: -6.05,
  south: -6.37,
  east: 106.98,
  west: 106.68,
};

/** Deterministic small offset (~50-350m) so places within a neighborhood don't overlap. */
export function jitterCoordinates(center: Coordinates, seed: string): Coordinates {
  const rand = seededRandom(seed);
  const angle = rand() * Math.PI * 2;
  const radiusDegrees = 0.0006 + rand() * 0.0024;
  return {
    lat: center.lat + Math.sin(angle) * radiusDegrees,
    lng: center.lng + Math.cos(angle) * radiusDegrees,
  };
}
