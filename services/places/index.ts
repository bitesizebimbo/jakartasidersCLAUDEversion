import "server-only";
import { createSupabasePublicClient } from "@/lib/supabase/publicClient";
import type { PlaceRepository } from "./PlaceRepository";
import { MockPlaceRepository } from "./MockPlaceRepository";
import { SupabasePlaceRepository } from "./SupabasePlaceRepository";

let cached: PlaceRepository | null = null;

/**
 * Returns the active place repository. Uses Supabase when configured,
 * otherwise falls back to the seed-backed mock — the map, search, and
 * filters all work with zero external credentials.
 */
export function getPlaceRepository(): PlaceRepository {
  if (cached) return cached;

  const client = createSupabasePublicClient();
  cached = client ? new SupabasePlaceRepository(client) : new MockPlaceRepository();
  return cached;
}

export type { PlaceRepository } from "./PlaceRepository";
export type { PlaceListParams, BoundingBoxParams } from "./types";
