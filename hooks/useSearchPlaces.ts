"use client";

import { useQuery } from "@tanstack/react-query";
import type { Coordinates } from "@/types/geo";
import type { PlaceWithDistance } from "@/types/place";
import { useDebounce } from "./useDebounce";

async function search(query: string, origin: Coordinates | null): Promise<PlaceWithDistance[]> {
  const params = new URLSearchParams({ q: query });
  if (origin) {
    params.set("lat", String(origin.lat));
    params.set("lng", String(origin.lng));
  }
  const res = await fetch(`/api/search?${params.toString()}`);
  if (!res.ok) throw new Error("Search failed");
  const json = await res.json();
  return json.places ?? [];
}

export function useSearchPlaces(query: string, origin: Coordinates | null) {
  const debounced = useDebounce(query.trim(), 300);

  return useQuery({
    queryKey: ["search", debounced],
    queryFn: () => search(debounced, origin),
    enabled: debounced.length > 0,
  });
}
