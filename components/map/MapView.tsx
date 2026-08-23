"use client";

import { useEffect, useRef } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { MarkerClusterer, type Renderer } from "@googlemaps/markerclusterer";
import type { Coordinates } from "@/types/geo";
import type { BoundingBox } from "@/types/geo";
import type { PlaceWithDistance } from "@/types/place";
import { getGoogleMapsApiKey, MAP_STYLE } from "@/lib/maps/googleMapsConfig";
import { clusterMarkerIcon, placeMarkerIcon, userLocationIcon } from "@/lib/maps/markerIcons";
import { JAKARTA_DEFAULT_VIEWPORT } from "@/lib/geo/jakarta";

export interface FlyToTarget {
  center: Coordinates;
  zoom: number;
  /** Change this on every request, even to the same coordinates, so effects re-fire. */
  token: number | string;
}

export interface MapViewProps {
  places: PlaceWithDistance[];
  onSelectPlace: (placeId: string) => void;
  onBoundsChange: (bounds: BoundingBox) => void;
  onError?: () => void;
  userLocation: Coordinates | null;
  flyTo: FlyToTarget | null;
  className?: string;
}

let optionsSet = false;

const clusterRenderer: Renderer = {
  render({ count, position }) {
    return new google.maps.Marker({
      position,
      icon: clusterMarkerIcon(count),
      label: { text: String(count), color: "#ffffff", fontSize: "12px", fontWeight: "600" },
      zIndex: 1000 + count,
    });
  },
};

export function MapView({
  places,
  onSelectPlace,
  onBoundsChange,
  onError,
  userLocation,
  flyTo,
  className,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersByIdRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const loadedRef = useRef(false);
  const onBoundsChangeRef = useRef(onBoundsChange);
  const onSelectPlaceRef = useRef(onSelectPlace);
  const onErrorRef = useRef(onError);
  const placesRef = useRef(places);

  useEffect(() => {
    onBoundsChangeRef.current = onBoundsChange;
    onSelectPlaceRef.current = onSelectPlace;
    onErrorRef.current = onError;
    placesRef.current = places;
  }, [onBoundsChange, onSelectPlace, onError, places]);

  function syncMarkers(map: google.maps.Map, list: PlaceWithDistance[]) {
    const clusterer = clustererRef.current;
    if (!clusterer) return;

    const existing = markersByIdRef.current;
    const nextIds = new Set(list.map((p) => p.id));

    const toRemove: google.maps.Marker[] = [];
    for (const [id, marker] of existing) {
      if (!nextIds.has(id)) {
        toRemove.push(marker);
        existing.delete(id);
      }
    }
    if (toRemove.length) clusterer.removeMarkers(toRemove, true);

    const toAdd: google.maps.Marker[] = [];
    for (const place of list) {
      if (existing.has(place.id)) continue;
      const marker = new google.maps.Marker({
        position: { lat: place.coordinates.lat, lng: place.coordinates.lng },
        icon: placeMarkerIcon(place.classification),
      });
      marker.addListener("click", () => {
        onSelectPlaceRef.current(place.id);
        map.panTo(marker.getPosition()!);
        if (map.getZoom()! < 15) map.setZoom(15);
      });
      existing.set(place.id, marker);
      toAdd.push(marker);
    }
    if (toAdd.length) clusterer.addMarkers(toAdd, true);

    clusterer.render();
  }

  useEffect(() => {
    if (!containerRef.current) return;
    const markersById = markersByIdRef.current;

    const apiKey = getGoogleMapsApiKey();
    if (!apiKey) {
      onErrorRef.current?.();
      return;
    }

    let cancelled = false;
    if (!optionsSet) {
      setOptions({ key: apiKey, v: "weekly" });
      optionsSet = true;
    }

    importLibrary("maps")
      .then(async () => {
        await importLibrary("marker");
        if (cancelled || !containerRef.current) return;

        const map = new google.maps.Map(containerRef.current, {
          center: { lat: JAKARTA_DEFAULT_VIEWPORT.center.lat, lng: JAKARTA_DEFAULT_VIEWPORT.center.lng },
          zoom: JAKARTA_DEFAULT_VIEWPORT.zoom,
          styles: MAP_STYLE,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
        });
        mapRef.current = map;
        loadedRef.current = true;

        clustererRef.current = new MarkerClusterer({ map, renderer: clusterRenderer });
        syncMarkers(map, placesRef.current);

        const emitBounds = () => {
          const b = map.getBounds();
          if (!b) return;
          const ne = b.getNorthEast();
          const sw = b.getSouthWest();
          onBoundsChangeRef.current({ north: ne.lat(), south: sw.lat(), east: ne.lng(), west: sw.lng() });
        };
        map.addListener("idle", emitBounds);
        emitBounds();
      })
      .catch(() => {
        if (!cancelled) onErrorRef.current?.();
      });

    return () => {
      cancelled = true;
      clustererRef.current?.clearMarkers();
      clustererRef.current = null;
      markersById.clear();
      userMarkerRef.current?.setMap(null);
      userMarkerRef.current = null;
      mapRef.current = null;
      loadedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    syncMarkers(map, places);
  }, [places]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;

    if (!userLocation) {
      userMarkerRef.current?.setMap(null);
      userMarkerRef.current = null;
      return;
    }

    if (!userMarkerRef.current) {
      userMarkerRef.current = new google.maps.Marker({
        map,
        icon: userLocationIcon(),
        zIndex: 999,
      });
    }
    userMarkerRef.current.setPosition({ lat: userLocation.lat, lng: userLocation.lng });
  }, [userLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyTo) return;
    map.panTo({ lat: flyTo.center.lat, lng: flyTo.center.lng });
    map.setZoom(flyTo.zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyTo?.token]);

  return (
    <div
      ref={containerRef}
      className={className}
      aria-label="Jakarta places map"
      role="application"
    />
  );
}
