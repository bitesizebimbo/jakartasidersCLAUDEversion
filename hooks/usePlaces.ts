"use client";

import { useQuery } from "@tanstack/react-query";
import type { BoundingBox, Coordinates } from "@/types/geo";
import type { PlaceFilters } from "@/types/filters";
import type { PlaceWithDistance } from "@/types/place";

export function buildPlacesQuery(
  bounds: BoundingBox | null,
  filters: PlaceFilters,
  origin: Coordinates | null
): string {
  const params = new URLSearchParams();

  if (bounds) {
    params.set("north", String(bounds.north));
    params.set("south", String(bounds.south));
    params.set("east", String(bounds.east));
    params.set("west", String(bounds.west));
  }
  if (filters.status !== "ALL") params.set("status", filters.status);
  if (filters.placeTypes.length) params.set("placeTypes", filters.placeTypes.join(","));
  if (filters.beverage) params.set("beverage", filters.beverage);
  if (filters.cuisines.length) params.set("cuisines", filters.cuisines.join(","));
  if (filters.priceLevels.length) params.set("priceLevels", filters.priceLevels.join(","));
  if (filters.audience) params.set("audience", filters.audience);
  if (filters.neighborhood) params.set("neighborhood", filters.neighborhood);
  if (filters.distanceKm) params.set("distanceKm", String(filters.distanceKm));
  if (origin) {
    params.set("lat", String(origin.lat));
    params.set("lng", String(origin.lng));
  }

  return params.toString();
}

async function fetchPlaces(query: string): Promise<PlaceWithDistance[]> {
  const res = await fetch(`/api/places?${query}`);
  if (!res.ok) throw new Error("Failed to load places");
  const json = await res.json();
  return json.places ?? [];
}

export function usePlaces(
  bounds: BoundingBox | null,
  filters: PlaceFilters,
  origin: Coordinates | null,
  options?: { enabled?: boolean }
) {
  const query = buildPlacesQuery(bounds, filters, origin);
  return useQuery({
    queryKey: ["places", query],
    queryFn: () => fetchPlaces(query),
    enabled: options?.enabled ?? true,
    placeholderData: (prev) => prev,
  });
}
