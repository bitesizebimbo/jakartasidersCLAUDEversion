export function getMapboxToken(): string | null {
  return process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? null;
}

export function isMapboxConfigured(): boolean {
  return Boolean(getMapboxToken());
}

/** Monochrome, technical map style — falls back to Mapbox's light style with a filtered palette. */
export const MAP_STYLE_URL = "mapbox://styles/mapbox/light-v11";

export const CLUSTER_RADIUS = 50;
export const CLUSTER_MAX_ZOOM = 15;
