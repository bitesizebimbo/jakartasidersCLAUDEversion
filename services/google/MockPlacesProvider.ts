import type { ExternalPlaceDetails, PlaceSearchResult } from "@/types/place";
import { seedPlaces } from "@/data/seed/places";
import type { PlacesProvider } from "./PlacesProvider";

/**
 * Deterministic mock backed by the seed dataset, used whenever
 * GOOGLE_PLACES_API_KEY is not configured. Lets the whole app run without
 * any external credentials.
 */
export class MockPlacesProvider implements PlacesProvider {
  async search(query: string): Promise<PlaceSearchResult[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return seedPlaces
      .filter((p) => p.name.toLowerCase().includes(normalized))
      .slice(0, 10)
      .map((p) => ({
        googlePlaceId: p.googlePlaceId ?? `mock-${p.slug}`,
        name: p.name,
        coordinates: p.coordinates,
        address: p.address,
      }));
  }

  async getPlaceDetails(placeId: string): Promise<ExternalPlaceDetails | null> {
    const place = seedPlaces.find(
      (p) => p.googlePlaceId === placeId || `mock-${p.slug}` === placeId
    );
    if (!place) return null;

    return {
      googlePlaceId: placeId,
      name: place.name,
      coordinates: place.coordinates,
      address: place.address,
      neighborhood: place.neighborhood,
      rating: place.googleRating,
      reviewCount: place.googleReviewCount,
      openingHours: place.openingHours ? [place.openingHours] : null,
      googleMapsUrl: place.googleMapsUrl,
      priceLevel: place.priceLevel,
      category: place.placeType,
    };
  }
}
