import type { FeatureCollection, Point } from "geojson";
import type { PlaceWithDistance } from "@/types/place";

export interface PlaceFeatureProperties {
  id: string;
  slug: string;
  name: string;
  classification: string;
  viralScore: number;
  gemScore: number;
}

export function placesToFeatureCollection(
  places: PlaceWithDistance[]
): FeatureCollection<Point, PlaceFeatureProperties> {
  return {
    type: "FeatureCollection",
    features: places.map((place) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [place.coordinates.lng, place.coordinates.lat] },
      properties: {
        id: place.id,
        slug: place.slug,
        name: place.name,
        classification: place.classification,
        viralScore: place.viralScore,
        gemScore: place.gemScore,
      },
    })),
  };
}
