"use client";

import { Compass, LocateFixed } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import type { GeolocationStatus } from "@/hooks/useGeolocation";

export function MapControls({
  onLocate,
  onRecenter,
  locationStatus,
}: {
  onLocate: () => void;
  onRecenter: () => void;
  locationStatus: GeolocationStatus;
}) {
  return (
    <div className="pointer-events-auto absolute bottom-4 right-3 flex flex-col gap-2">
      <IconButton
        aria-label="Use my current location"
        onClick={onLocate}
        active={locationStatus === "granted"}
        className="bg-paper shadow-sm"
      >
        <LocateFixed
          size={18}
          strokeWidth={1.75}
          className={locationStatus === "loading" ? "animate-pulse" : undefined}
        />
      </IconButton>
      <IconButton aria-label="Recenter on Jakarta" onClick={onRecenter} className="bg-paper shadow-sm">
        <Compass size={18} strokeWidth={1.75} />
      </IconButton>
    </div>
  );
}
