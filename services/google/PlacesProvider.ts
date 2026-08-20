import type { ExternalPlaceDetails, PlaceSearchResult } from "@/types/place";

/**
 * Abstraction over an external places data source (Google Places API).
 * Keep all provider-specific request/response shapes behind this
 * interface so components and API routes never talk to a vendor SDK
 * directly.
 */
export interface PlacesProvider {
  search(query: string): Promise<PlaceSearchResult[]>;
  getPlaceDetails(placeId: string): Promise<ExternalPlaceDetails | null>;
}
