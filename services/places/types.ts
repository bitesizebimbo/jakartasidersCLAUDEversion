import type { Coordinates } from "@/types/geo";
import type {
  AudienceType,
  BeverageType,
  CuisineSlug,
  NeighborhoodSlug,
  PlaceType,
  PriceLevel,
} from "@/types/place";
import type { DiscoveryStatus } from "@/types/filters";

export interface BoundingBoxParams {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface PlaceListParams {
  bounds?: BoundingBoxParams;
  status?: DiscoveryStatus;
  placeTypes?: PlaceType[];
  beverage?: BeverageType;
  cuisines?: CuisineSlug[];
  priceLevels?: PriceLevel[];
  audience?: "MOSTLY_LOCAL" | "MIXED" | "MOSTLY_TOURIST";
  neighborhood?: NeighborhoodSlug;
  origin?: Coordinates;
  distanceKm?: number;
  limit?: number;
}

export function audienceBucketMatches(
  audienceType: AudienceType,
  filter: "MOSTLY_LOCAL" | "MIXED" | "MOSTLY_TOURIST"
): boolean {
  if (filter === "MOSTLY_LOCAL") return audienceType === "LOCAL";
  if (filter === "MOSTLY_TOURIST") return audienceType === "TOURIST";
  return audienceType === "MIXED";
}
