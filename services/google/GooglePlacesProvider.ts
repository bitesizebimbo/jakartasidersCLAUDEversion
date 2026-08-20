import type { ExternalPlaceDetails, PlaceSearchResult, PriceLevel } from "@/types/place";
import type { PlacesProvider } from "./PlacesProvider";

const TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const DETAILS_URL = "https://places.googleapis.com/v1/places";

const PRICE_LEVEL_MAP: Record<string, PriceLevel> = {
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

/**
 * Live implementation using the Google Places API (New). Only instantiated
 * server-side, and only when GOOGLE_PLACES_API_KEY is configured — never
 * exposed to the client.
 */
export class GooglePlacesProvider implements PlacesProvider {
  constructor(private readonly apiKey: string) {}

  async search(query: string): Promise<PlaceSearchResult[]> {
    const res = await fetch(TEXT_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.location,places.formattedAddress",
      },
      body: JSON.stringify({
        textQuery: `${query} Jakarta`,
        languageCode: "en",
      }),
    });

    if (!res.ok) {
      throw new Error(`Google Places search failed: ${res.status}`);
    }

    const json = (await res.json()) as {
      places?: Array<{
        id: string;
        displayName?: { text: string };
        location?: { latitude: number; longitude: number };
        formattedAddress?: string;
      }>;
    };

    return (json.places ?? []).map((p) => ({
      googlePlaceId: p.id,
      name: p.displayName?.text ?? "",
      coordinates: {
        lat: p.location?.latitude ?? 0,
        lng: p.location?.longitude ?? 0,
      },
      address: p.formattedAddress ?? "",
    }));
  }

  async getPlaceDetails(placeId: string): Promise<ExternalPlaceDetails | null> {
    const res = await fetch(`${DETAILS_URL}/${placeId}`, {
      headers: {
        "X-Goog-Api-Key": this.apiKey,
        "X-Goog-FieldMask":
          "id,displayName,location,formattedAddress,rating,userRatingCount,regularOpeningHours,googleMapsUri,priceLevel,primaryType,photos",
      },
    });

    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Google Places details failed: ${res.status}`);
    }

    const p = (await res.json()) as {
      id: string;
      displayName?: { text: string };
      location?: { latitude: number; longitude: number };
      formattedAddress?: string;
      rating?: number;
      userRatingCount?: number;
      regularOpeningHours?: { weekdayDescriptions?: string[] };
      googleMapsUri?: string;
      priceLevel?: string;
      primaryType?: string;
      photos?: Array<{ name: string }>;
    };

    return {
      googlePlaceId: p.id,
      name: p.displayName?.text ?? "",
      coordinates: {
        lat: p.location?.latitude ?? 0,
        lng: p.location?.longitude ?? 0,
      },
      address: p.formattedAddress ?? "",
      neighborhood: null,
      rating: p.rating ?? null,
      reviewCount: p.userRatingCount ?? null,
      openingHours: p.regularOpeningHours?.weekdayDescriptions ?? null,
      googleMapsUrl: p.googleMapsUri ?? `https://www.google.com/maps/place/?q=place_id:${p.id}`,
      priceLevel: p.priceLevel ? PRICE_LEVEL_MAP[p.priceLevel] ?? null : null,
      category: p.primaryType ?? null,
      photos: p.photos?.map((photo) => photo.name) ?? [],
    };
  }
}
