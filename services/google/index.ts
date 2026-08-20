import "server-only";
import type { PlacesProvider } from "./PlacesProvider";
import { GooglePlacesProvider } from "./GooglePlacesProvider";
import { MockPlacesProvider } from "./MockPlacesProvider";

let cached: PlacesProvider | null = null;

/** Returns the live Google Places provider when configured, otherwise a seed-backed mock. */
export function getPlacesProvider(): PlacesProvider {
  if (cached) return cached;

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  cached = apiKey ? new GooglePlacesProvider(apiKey) : new MockPlacesProvider();
  return cached;
}

export type { PlacesProvider } from "./PlacesProvider";
