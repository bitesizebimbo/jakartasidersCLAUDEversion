"use client";

import { useMemo, useState } from "react";
import type { PlaceWithDistance } from "@/types/place";
import { MapView, type FlyToTarget } from "@/components/map/MapView";
import { MapUnavailable } from "@/components/map/MapUnavailable";
import { PlaceBottomSheet } from "@/components/place/PlaceBottomSheet";
import { useGeolocation } from "@/hooks/useGeolocation";

export function SavedMapView({ places }: { places: PlaceWithDistance[] }) {
  const [mapFailed, setMapFailed] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceWithDistance | null>(null);
  const { coordinates } = useGeolocation();

  const flyTo = useMemo<FlyToTarget | null>(() => {
    if (places.length === 0) return null;
    const avgLat = places.reduce((sum, p) => sum + p.coordinates.lat, 0) / places.length;
    const avgLng = places.reduce((sum, p) => sum + p.coordinates.lng, 0) / places.length;
    const token = places.map((p) => p.id).join(",");
    return { center: { lat: avgLat, lng: avgLng }, zoom: 12.5, token };
  }, [places]);

  if (mapFailed) {
    return <MapUnavailable places={places} />;
  }

  return (
    <div className="relative h-[70vh] w-full border border-grey-200">
      <MapView
        places={places}
        onSelectPlace={(id) => {
          const place = places.find((p) => p.id === id);
          if (place) setSelectedPlace(place);
        }}
        onBoundsChange={() => {}}
        onError={() => setMapFailed(true)}
        userLocation={coordinates}
        flyTo={flyTo}
        className="h-full w-full"
      />
      <PlaceBottomSheet
        place={selectedPlace}
        onOpenChange={(open) => !open && setSelectedPlace(null)}
        userLocation={coordinates}
      />
    </div>
  );
}
