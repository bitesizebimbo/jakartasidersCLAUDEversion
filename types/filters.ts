import type {
  AudienceType,
  BeverageType,
  CuisineSlug,
  NeighborhoodSlug,
  PlaceClassification,
  PlaceType,
  PriceLevel,
} from "./place";

export type DiscoveryStatus = "ALL" | "VIRAL" | "HIDDEN_GEM";

export type DistanceFilter = 1 | 3 | 5 | 10 | null;

export type AudienceFilter = "MOSTLY_LOCAL" | "MIXED" | "MOSTLY_TOURIST" | null;

export interface PlaceFilters {
  query: string;
  status: DiscoveryStatus;
  placeTypes: PlaceType[];
  beverage: BeverageType | null;
  cuisines: CuisineSlug[];
  priceLevels: PriceLevel[];
  audience: AudienceFilter;
  distanceKm: DistanceFilter;
  neighborhood: NeighborhoodSlug | null;
}

export const DEFAULT_FILTERS: PlaceFilters = {
  query: "",
  status: "ALL",
  placeTypes: [],
  beverage: null,
  cuisines: [],
  priceLevels: [],
  audience: null,
  distanceKm: null,
  neighborhood: null,
};

export function isDefaultFilters(filters: PlaceFilters): boolean {
  return (
    filters.query === "" &&
    filters.status === "ALL" &&
    filters.placeTypes.length === 0 &&
    filters.beverage === null &&
    filters.cuisines.length === 0 &&
    filters.priceLevels.length === 0 &&
    filters.audience === null &&
    filters.distanceKm === null &&
    filters.neighborhood === null
  );
}

export function countActiveFilters(filters: PlaceFilters): number {
  let count = 0;
  if (filters.status !== "ALL") count++;
  count += filters.placeTypes.length;
  if (filters.beverage) count++;
  count += filters.cuisines.length;
  count += filters.priceLevels.length;
  if (filters.audience) count++;
  if (filters.distanceKm) count++;
  if (filters.neighborhood) count++;
  return count;
}

export type { PlaceClassification, AudienceType };
