"use client";

import { useState } from "react";
import { FolderPlus } from "lucide-react";
import type { Coordinates } from "@/types/geo";
import { SaveButton } from "@/components/saved/SaveButton";
import { DirectionsButton } from "./DirectionsButton";
import { Button } from "@/components/ui/Button";
import { CollectionPicker } from "@/components/saved/CollectionPicker";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useGeolocation } from "@/hooks/useGeolocation";

export function PlaceDetailActions({
  placeId,
  slug,
  destination,
  destinationName,
}: {
  placeId: string;
  slug: string;
  destination: Coordinates;
  destinationName: string;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { user } = useAuth();
  const { openModal } = useAuthModal();
  const geolocation = useGeolocation();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SaveButton placeId={placeId} variant="full" redirectTo={`/place/${slug}`} />
      <Button
        variant="outline"
        onClick={() => (user ? setPickerOpen(true) : openModal(`/place/${slug}`))}
      >
        <FolderPlus size={16} strokeWidth={1.75} />
        Add to collection
      </Button>
      {!geolocation.coordinates && (
        <Button variant="ghost" size="sm" onClick={geolocation.requestLocation}>
          Use my location for directions
        </Button>
      )}
      <DirectionsButton
        placeId={placeId}
        destination={destination}
        destinationName={destinationName}
        origin={geolocation.coordinates}
      />
      <CollectionPicker open={pickerOpen} onOpenChange={setPickerOpen} placeId={placeId} />
    </div>
  );
}
