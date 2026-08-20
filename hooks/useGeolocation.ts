"use client";

import { useCallback, useState } from "react";
import type { Coordinates } from "@/types/geo";
import { track } from "@/lib/analytics";

export type GeolocationStatus = "idle" | "loading" | "granted" | "denied" | "unsupported";

interface GeolocationState {
  status: GeolocationStatus;
  coordinates: Coordinates | null;
  error: string | null;
}

/**
 * On-demand geolocation — never watches continuously and never persists
 * location history. Only requests a fix when the caller explicitly asks
 * (e.g. tapping "Use my location"), consistent with the product's
 * location-permission principles.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    status: "idle",
    coordinates: null,
    error: null,
  });

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ status: "unsupported", coordinates: null, error: "Geolocation isn't supported on this device." });
      return;
    }

    setState((prev) => ({ ...prev, status: "loading", error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: "granted",
          coordinates: { lat: position.coords.latitude, lng: position.coords.longitude },
          error: null,
        });
        track("location_enabled");
      },
      (error) => {
        setState({
          status: "denied",
          coordinates: null,
          error: error.code === error.PERMISSION_DENIED
            ? "Location access was denied."
            : "Couldn't get your location.",
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 }
    );
  }, []);

  return { ...state, requestLocation };
}
