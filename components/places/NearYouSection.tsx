"use client";

import { LocateFixed } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useGeolocation } from "@/hooks/useGeolocation";
import { PlaceCard } from "./PlaceCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { PlaceWithDistance } from "@/types/place";

export function NearYouSection() {
  const geolocation = useGeolocation();
  const { coordinates } = geolocation;

  const { data: places, isLoading } = useQuery({
    queryKey: ["near-you", coordinates?.lat, coordinates?.lng],
    queryFn: async (): Promise<PlaceWithDistance[]> => {
      const params = new URLSearchParams({
        lat: String(coordinates!.lat),
        lng: String(coordinates!.lng),
        distanceKm: "5",
      });
      const res = await fetch(`/api/places?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load nearby places");
      const json = await res.json();
      return json.places ?? [];
    },
    enabled: Boolean(coordinates),
  });

  return (
    <section className="space-y-3">
      <div className="px-4">
        <h2 className="text-lg font-semibold tracking-tight">NEAR YOU</h2>
        <p className="text-xs text-grey-500">Based on your current location</p>
      </div>

      {!coordinates ? (
        <div className="px-4">
          <EmptyState
            icon={<LocateFixed size={20} strokeWidth={1.5} />}
            title="Share your location"
            description="See what's viral or hidden nearby. We only use this on demand — nothing is tracked in the background."
            className="items-start px-0 py-4 text-left"
            action={
              <Button size="sm" variant="outline" onClick={geolocation.requestLocation}>
                {geolocation.status === "loading" ? "Locating…" : "Use my location"}
              </Button>
            }
          />
          {geolocation.status === "denied" && (
            <p className="mt-2 text-xs text-signal">{geolocation.error}</p>
          )}
        </div>
      ) : isLoading ? (
        <p className="px-4 font-mono text-xs uppercase tracking-widest text-grey-500">Loading…</p>
      ) : places && places.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      ) : (
        <div className="px-4">
          <EmptyState
            title="NOTHING HERE YET"
            description="Nothing within 5km — try expanding your search on the map."
            className="items-start px-0 py-4 text-left"
          />
        </div>
      )}
    </section>
  );
}
