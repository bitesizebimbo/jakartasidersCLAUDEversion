"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Coordinates } from "@/types/geo";
import type { BoundingBox } from "@/types/geo";
import type { PlaceWithDistance } from "@/types/place";
import { MAP_STYLE, CLUSTER_RADIUS, CLUSTER_MAX_ZOOM } from "@/lib/maps/mapConfig";
import { placesToFeatureCollection } from "@/lib/maps/placesToGeoJSON";
import { JAKARTA_DEFAULT_VIEWPORT } from "@/lib/geo/jakarta";

const SOURCE_ID = "places";
const USER_SOURCE_ID = "user-location";

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

function addPlacesLayers(map: maplibregl.Map) {
  map.addSource(SOURCE_ID, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
    cluster: true,
    clusterRadius: CLUSTER_RADIUS,
    clusterMaxZoom: CLUSTER_MAX_ZOOM,
  });

  map.addLayer({
    id: "clusters",
    type: "circle",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": "#0a0a0a",
      "circle-opacity": 0.88,
      "circle-radius": ["step", ["get", "point_count"], 16, 10, 20, 30, 26],
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });

  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": ["Noto Sans Regular"],
      "text-size": 12,
    },
    paint: { "text-color": "#ffffff" },
  });

  // Halo behind viral points for a restrained "pulse" emphasis.
  map.addLayer({
    id: "viral-halo",
    type: "circle",
    source: SOURCE_ID,
    filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "classification"], "VIRAL"]],
    paint: {
      "circle-radius": 17,
      "circle-color": "#ff3b2f",
      "circle-opacity": 0.16,
    },
  });

  map.addLayer({
    id: "unclustered-watchlist",
    type: "circle",
    source: SOURCE_ID,
    filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "classification"], "WATCHLIST"]],
    paint: {
      "circle-radius": 4,
      "circle-color": "#a3a099",
      "circle-opacity": 0.6,
    },
  });

  map.addLayer({
    id: "unclustered-gem",
    type: "circle",
    source: SOURCE_ID,
    filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "classification"], "HIDDEN_GEM"]],
    paint: {
      "circle-radius": 8,
      "circle-color": "#ffffff",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#0a0a0a",
    },
  });

  map.addLayer({
    id: "unclustered-viral",
    type: "circle",
    source: SOURCE_ID,
    filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "classification"], "VIRAL"]],
    paint: {
      "circle-radius": 9,
      "circle-color": "#ff3b2f",
      "circle-stroke-width": 1.5,
      "circle-stroke-color": "#ffffff",
    },
  });

  map.addSource(USER_SOURCE_ID, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });

  map.addLayer({
    id: "user-location-ring",
    type: "circle",
    source: USER_SOURCE_ID,
    paint: {
      "circle-radius": 10,
      "circle-color": "#0a0a0a",
      "circle-opacity": 0.12,
    },
  });

  map.addLayer({
    id: "user-location-dot",
    type: "circle",
    source: USER_SOURCE_ID,
    paint: {
      "circle-radius": 5,
      "circle-color": "#0a0a0a",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });
}

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
  const mapRef = useRef<maplibregl.Map | null>(null);
  const loadedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [JAKARTA_DEFAULT_VIEWPORT.center.lng, JAKARTA_DEFAULT_VIEWPORT.center.lat],
      zoom: JAKARTA_DEFAULT_VIEWPORT.zoom,
      attributionControl: false,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    // Only treat pre-load failures (e.g. the basemap/tiles are unreachable)
    // as fatal — individual post-load tile errors shouldn't tear down a
    // working map.
    map.on("error", () => {
      if (!loadedRef.current) onErrorRef.current?.();
    });

    map.on("load", () => {
      addPlacesLayers(map);
      loadedRef.current = true;

      // Paint whatever place data we already have the moment the style
      // finishes loading — the places-sync effect below only re-fires on
      // prop changes, so without this, data that arrived before "load"
      // fired would never make it onto the map.
      const placesSource = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
      placesSource?.setData(placesToFeatureCollection(placesRef.current));

      const emitBounds = () => {
        const b = map.getBounds();
        if (!b) return;
        onBoundsChangeRef.current({
          north: b.getNorth(),
          south: b.getSouth(),
          east: b.getEast(),
          west: b.getWest(),
        });
      };

      map.on("moveend", () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(emitBounds, 250);
      });
      emitBounds();

      for (const layerId of ["unclustered-viral", "unclustered-gem", "unclustered-watchlist"]) {
        map.on("mouseenter", layerId, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layerId, () => {
          map.getCanvas().style.cursor = "";
        });
        map.on("click", layerId, (e: maplibregl.MapLayerMouseEvent) => {
          const feature = e.features?.[0];
          const id = feature?.properties?.id as string | undefined;
          if (!id) return;
          onSelectPlaceRef.current(id);
          const coords = (feature!.geometry as GeoJSON.Point).coordinates as [number, number];
          map.easeTo({ center: coords, zoom: Math.max(map.getZoom(), 15), duration: 500 });
        });
      }

      map.on("click", "clusters", (e: maplibregl.MapLayerMouseEvent) => {
        const feature = e.features?.[0];
        const clusterId = feature?.properties?.cluster_id;
        const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
        if (clusterId === undefined) return;
        source.getClusterExpansionZoom(clusterId).then((zoom: number) => {
          const coords = (feature!.geometry as GeoJSON.Point).coordinates as [number, number];
          map.easeTo({ center: coords, zoom, duration: 500 });
        });
      });
      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    source?.setData(placesToFeatureCollection(places));
  }, [places]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const source = map.getSource(USER_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData({
      type: "FeatureCollection",
      features: userLocation
        ? [
            {
              type: "Feature",
              geometry: { type: "Point", coordinates: [userLocation.lng, userLocation.lat] },
              properties: {},
            },
          ]
        : [],
    });
  }, [userLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyTo) return;
    map.flyTo({ center: [flyTo.center.lng, flyTo.center.lat], zoom: flyTo.zoom, essential: true, duration: 900 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyTo?.token]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ filter: "grayscale(0.15) contrast(1.02)" }}
      aria-label="Jakarta places map"
      role="application"
    />
  );
}
