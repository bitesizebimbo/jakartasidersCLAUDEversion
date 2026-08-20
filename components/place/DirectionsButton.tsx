"use client";

import { Navigation } from "lucide-react";
import type { Coordinates } from "@/types/geo";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";

function directionsUrl(destination: Coordinates, origin?: Coordinates | null) {
  const params = new URLSearchParams({
    api: "1",
    destination: `${destination.lat},${destination.lng}`,
    travelmode: "driving",
  });
  if (origin) {
    params.set("origin", `${origin.lat},${origin.lng}`);
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function DirectionsButton({
  placeId,
  destination,
  origin,
  className,
}: {
  placeId: string;
  destination: Coordinates;
  destinationName: string;
  origin?: Coordinates | null;
  className?: string;
}) {
  return (
    <Button
      variant="outline"
      className={className}
      onClick={() => {
        track("directions_clicked", { placeId, fromLocation: Boolean(origin) });
        window.open(directionsUrl(destination, origin), "_blank", "noopener,noreferrer");
      }}
    >
      <Navigation size={16} strokeWidth={1.75} />
      {origin ? "Directions from my location" : "Open in Google Maps"}
    </Button>
  );
}
