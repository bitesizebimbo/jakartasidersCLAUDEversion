import type { SupabaseClient } from "@supabase/supabase-js";
import type { Place, PlaceWithDistance } from "@/types/place";
import type { Coordinates } from "@/types/geo";
import { distanceFrom } from "@/lib/geo/distance";
import type { PlaceRepository } from "./PlaceRepository";
import { type PlaceListParams } from "./types";
import { mapPlaceRow, type PlaceRow } from "./mappers";

const PLACE_SELECT = "*, place_cuisines(cuisines(slug))";

function withDistance(place: Place, origin?: Coordinates): PlaceWithDistance {
  if (!origin) return { ...place, distanceKm: null, walkMinutes: null };
  const result = distanceFrom(origin, place.coordinates);
  return { ...place, distanceKm: result.km, walkMinutes: result.walkMinutes };
}

/** Reads the app's place catalog from Supabase/Postgres. */
export class SupabasePlaceRepository implements PlaceRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list(params: PlaceListParams): Promise<PlaceWithDistance[]> {
    let query = this.client.from("places").select(PLACE_SELECT);

    if (params.bounds) {
      query = query
        .lte("latitude", params.bounds.north)
        .gte("latitude", params.bounds.south)
        .lte("longitude", params.bounds.east)
        .gte("longitude", params.bounds.west);
    }
    if (params.status && params.status !== "ALL") {
      query = query.eq("classification", params.status);
    }
    if (params.placeTypes?.length) {
      query = query.in("place_type", params.placeTypes);
    }
    if (params.beverage) {
      query = query.in("beverage_type", [params.beverage, "both"]);
    }
    if (params.priceLevels?.length) {
      query = query.in("price_level", params.priceLevels);
    }
    if (params.neighborhood) {
      query = query.eq("neighborhood", params.neighborhood);
    }

    const { data, error } = await query.limit(params.limit ?? 500);
    if (error) throw error;

    let places = (data as unknown as PlaceRow[]).map(mapPlaceRow);

    if (params.cuisines?.length) {
      places = places.filter((p) => params.cuisines!.some((c) => p.cuisines.includes(c)));
    }
    if (params.audience) {
      places = places.filter((p) => {
        if (params.audience === "MOSTLY_LOCAL") return p.audienceType === "LOCAL";
        if (params.audience === "MOSTLY_TOURIST") return p.audienceType === "TOURIST";
        return p.audienceType === "MIXED";
      });
    }

    let withDist = places.map((p) => withDistance(p, params.origin));
    if (params.origin && params.distanceKm) {
      withDist = withDist.filter((p) => (p.distanceKm ?? Infinity) <= params.distanceKm!);
    }
    if (params.origin) {
      withDist.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    } else {
      withDist.sort((a, b) => b.viralScore - a.viralScore);
    }

    return withDist;
  }

  async getBySlug(slug: string): Promise<Place | null> {
    const { data, error } = await this.client
      .from("places")
      .select(PLACE_SELECT)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? mapPlaceRow(data as unknown as PlaceRow) : null;
  }

  async getById(id: string): Promise<Place | null> {
    const { data, error } = await this.client
      .from("places")
      .select(PLACE_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapPlaceRow(data as unknown as PlaceRow) : null;
  }

  async getByIds(ids: string[]): Promise<Place[]> {
    if (ids.length === 0) return [];
    const { data, error } = await this.client
      .from("places")
      .select(PLACE_SELECT)
      .in("id", ids);
    if (error) throw error;
    return (data as unknown as PlaceRow[]).map(mapPlaceRow);
  }

  async search(query: string, origin?: Coordinates): Promise<PlaceWithDistance[]> {
    const { data, error } = await this.client
      .from("places")
      .select(PLACE_SELECT)
      .or(`name.ilike.%${query}%,neighborhood.ilike.%${query}%,address.ilike.%${query}%`)
      .limit(50);
    if (error) throw error;

    const places = (data as unknown as PlaceRow[]).map(mapPlaceRow);
    const withDist = places.map((p) => withDistance(p, origin));
    withDist.sort((a, b) => b.viralScore - a.viralScore);
    return withDist;
  }

  async getNearby(place: Place, radiusKm: number, limit: number): Promise<PlaceWithDistance[]> {
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos((place.coordinates.lat * Math.PI) / 180));

    const { data, error } = await this.client
      .from("places")
      .select(PLACE_SELECT)
      .neq("id", place.id)
      .gte("latitude", place.coordinates.lat - latDelta)
      .lte("latitude", place.coordinates.lat + latDelta)
      .gte("longitude", place.coordinates.lng - lngDelta)
      .lte("longitude", place.coordinates.lng + lngDelta);
    if (error) throw error;

    const withDist = (data as unknown as PlaceRow[])
      .map((row) => withDistance(mapPlaceRow(row), place.coordinates))
      .filter((p) => (p.distanceKm ?? Infinity) <= radiusKm);

    withDist.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    return withDist.slice(0, limit);
  }
}
