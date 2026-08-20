import type { Place, PlaceWithDistance } from "@/types/place";
import type { Coordinates } from "@/types/geo";
import { seedPlaces } from "@/data/seed/places";
import { distanceFrom, isWithinBoundingBox } from "@/lib/geo/distance";
import type { PlaceRepository } from "./PlaceRepository";
import { audienceBucketMatches, type PlaceListParams } from "./types";

function withDistance(place: Place, origin?: Coordinates): PlaceWithDistance {
  if (!origin) {
    return { ...place, distanceKm: null, walkMinutes: null };
  }
  const result = distanceFrom(origin, place.coordinates);
  return { ...place, distanceKm: result.km, walkMinutes: result.walkMinutes };
}

function matchesParams(place: Place, params: PlaceListParams): boolean {
  if (params.bounds && !isWithinBoundingBox(place.coordinates, params.bounds)) {
    return false;
  }
  if (params.status && params.status !== "ALL" && place.classification !== params.status) {
    return false;
  }
  if (params.placeTypes?.length && !params.placeTypes.includes(place.placeType)) {
    return false;
  }
  if (params.beverage && params.beverage !== "both" && place.beverageType !== params.beverage && place.beverageType !== "both") {
    return false;
  }
  if (params.cuisines?.length && !params.cuisines.some((c) => place.cuisines.includes(c))) {
    return false;
  }
  if (params.priceLevels?.length && !params.priceLevels.includes(place.priceLevel)) {
    return false;
  }
  if (params.audience && !audienceBucketMatches(place.audienceType, params.audience)) {
    return false;
  }
  if (params.neighborhood && place.neighborhood !== params.neighborhood) {
    return false;
  }
  return true;
}

/**
 * In-memory repository backed by the deterministic seed dataset. This is
 * the default repository whenever Supabase is not configured — the whole
 * discovery experience works with zero external credentials.
 */
export class MockPlaceRepository implements PlaceRepository {
  async list(params: PlaceListParams): Promise<PlaceWithDistance[]> {
    const results = seedPlaces.filter((p) => matchesParams(p, params));

    let withDist = results.map((p) => withDistance(p, params.origin));

    if (params.origin && params.distanceKm) {
      withDist = withDist.filter((p) => (p.distanceKm ?? Infinity) <= params.distanceKm!);
    }
    if (params.origin) {
      withDist.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    } else {
      withDist.sort((a, b) => b.viralScore - a.viralScore);
    }

    if (params.limit) {
      withDist = withDist.slice(0, params.limit);
    }

    return withDist;
  }

  async getBySlug(slug: string): Promise<Place | null> {
    return seedPlaces.find((p) => p.slug === slug) ?? null;
  }

  async getById(id: string): Promise<Place | null> {
    return seedPlaces.find((p) => p.id === id) ?? null;
  }

  async getByIds(ids: string[]): Promise<Place[]> {
    const idSet = new Set(ids);
    return seedPlaces.filter((p) => idSet.has(p.id));
  }

  async search(query: string, origin?: Coordinates): Promise<PlaceWithDistance[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    const results = seedPlaces.filter((p) => {
      const haystack = [
        p.name,
        p.neighborhood,
        p.placeType,
        ...p.cuisines,
        ...p.tags,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });

    const withDist = results.map((p) => withDistance(p, origin));
    withDist.sort((a, b) => b.viralScore - a.viralScore);
    return withDist;
  }

  async getNearby(place: Place, radiusKm: number, limit: number): Promise<PlaceWithDistance[]> {
    const withDist = seedPlaces
      .filter((p) => p.id !== place.id)
      .map((p) => withDistance(p, place.coordinates))
      .filter((p) => (p.distanceKm ?? Infinity) <= radiusKm);

    withDist.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    return withDist.slice(0, limit);
  }
}
