"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PlaceWithDistance } from "@/types/place";
import { useAuth } from "@/hooks/useAuth";
import { track } from "@/lib/analytics";

interface SavedPlacesResponse {
  placeIds: string[];
  places: PlaceWithDistance[];
}

async function fetchSavedPlaces(): Promise<SavedPlacesResponse> {
  const res = await fetch("/api/saved");
  if (!res.ok) return { placeIds: [], places: [] };
  const json = await res.json();
  return { placeIds: json.placeIds ?? [], places: json.places ?? [] };
}

function useSavedPlacesQuery() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["saved-places", user?.id],
    queryFn: fetchSavedPlaces,
    enabled: Boolean(user),
    staleTime: 15_000,
  });
}

export function useSavedPlaceIds() {
  const query = useSavedPlacesQuery();
  return { ...query, data: query.data?.placeIds };
}

export function useSavedPlacesWithDetails() {
  const query = useSavedPlacesQuery();
  return { ...query, data: query.data?.places };
}

export function useToggleSavedPlace() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ placeId, saved }: { placeId: string; saved: boolean }) => {
      const res = await fetch(saved ? `/api/saved/${placeId}` : "/api/saved", {
        method: saved ? "DELETE" : "POST",
        headers: saved ? undefined : { "Content-Type": "application/json" },
        body: saved ? undefined : JSON.stringify({ placeId }),
      });
      if (!res.ok) throw new Error("Failed to update saved place");
      return { placeId, saved: !saved };
    },
    onSuccess: ({ placeId, saved }) => {
      track(saved ? "place_saved" : "place_unsaved", { placeId });
      queryClient.invalidateQueries({ queryKey: ["saved-places", user?.id] });
    },
  });
}
