import type { Place, PlaceWithDistance } from "@/types/place";
import type { PlaceListParams } from "./types";

/**
 * Domain-level data access for the app's own place catalog (distinct from
 * `services/google`, which enriches/looks up places from Google's index).
 * Implementations back onto either the seed dataset (no credentials
 * required) or Supabase/Postgres.
 */
export interface PlaceRepository {
  list(params: PlaceListParams): Promise<PlaceWithDistance[]>;
  getBySlug(slug: string): Promise<Place | null>;
  getById(id: string): Promise<Place | null>;
  getByIds(ids: string[]): Promise<Place[]>;
  search(query: string, origin?: Place["coordinates"]): Promise<PlaceWithDistance[]>;
  getNearby(place: Place, radiusKm: number, limit: number): Promise<PlaceWithDistance[]>;
}
