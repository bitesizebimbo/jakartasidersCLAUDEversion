"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { BoundingBox, Coordinates } from "@/types/geo";
import type { NeighborhoodSlug, PlaceWithDistance } from "@/types/place";
import { DEFAULT_FILTERS, countActiveFilters, type PlaceFilters } from "@/types/filters";
import { MapView, type FlyToTarget } from "./MapView";
import { MapUnavailable } from "./MapUnavailable";
import { MapControls } from "./MapControls";
import { SearchBar } from "@/components/filters/SearchBar";
import { NeighborhoodSelector } from "@/components/filters/NeighborhoodSelector";
import { FilterSheet } from "@/components/filters/FilterSheet";
import { PlaceBottomSheet } from "@/components/place/PlaceBottomSheet";
import { IconButton } from "@/components/ui/IconButton";
import { JAKARTA_BOUNDS, JAKARTA_DEFAULT_VIEWPORT, NEIGHBORHOOD_CENTERS } from "@/lib/geo/jakarta";
import { usePlaces } from "@/hooks/usePlaces";
import { useGeolocation } from "@/hooks/useGeolocation";
import { track } from "@/lib/analytics";
import { ErrorState } from "@/components/ui/ErrorState";

export function MapExperience({
  initialPlaces,
  initialNeighborhood = null,
}: {
  initialPlaces: PlaceWithDistance[];
  initialNeighborhood?: NeighborhoodSlug | null;
}) {
  const [mapFailed, setMapFailed] = useState(false);
  const [bounds, setBounds] = useState<BoundingBox | null>(JAKARTA_BOUNDS);
  const [filters, setFilters] = useState<PlaceFilters>({
    ...DEFAULT_FILTERS,
    neighborhood: initialNeighborhood,
  });
  const [selectedPlace, setSelectedPlace] = useState<PlaceWithDistance | null>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [flyTo, setFlyTo] = useState<FlyToTarget | null>(
    initialNeighborhood
      ? { center: NEIGHBORHOOD_CENTERS[initialNeighborhood], zoom: 14.5, token: 0 }
      : null
  );

  const geolocation = useGeolocation();
  const userLocation: Coordinates | null = geolocation.coordinates;

  const { data: places, isLoading, isError, refetch } = usePlaces(bounds, filters, userLocation);
  const visiblePlaces = places ?? initialPlaces;

  function handleSelectFromMap(placeId: string) {
    const place = visiblePlaces.find((p) => p.id === placeId);
    if (place) {
      setSelectedPlace(place);
      track("map_place_opened", { placeId, source: "marker" });
    }
  }

  function handleSelectFromSearch(place: PlaceWithDistance) {
    setSelectedPlace(place);
    setFlyTo({ center: place.coordinates, zoom: 16, token: Date.now() });
    track("map_place_opened", { placeId: place.id, source: "search" });
  }

  function handleNeighborhoodSelect(slug: NeighborhoodSlug | null) {
    setFilters((prev) => ({ ...prev, neighborhood: slug }));
    if (slug) {
      setFlyTo({ center: NEIGHBORHOOD_CENTERS[slug], zoom: 14.5, token: Date.now() });
    }
  }

  function handleRecenter() {
    setFlyTo({ center: JAKARTA_DEFAULT_VIEWPORT.center, zoom: JAKARTA_DEFAULT_VIEWPORT.zoom, token: Date.now() });
  }

  function handleLocate() {
    geolocation.requestLocation();
  }

  return (
    <div className="relative h-full w-full">
      {!mapFailed ? (
        <MapView
          places={visiblePlaces}
          onSelectPlace={handleSelectFromMap}
          onBoundsChange={setBounds}
          onError={() => setMapFailed(true)}
          userLocation={userLocation}
          flyTo={flyTo}
          className="h-full w-full"
        />
      ) : (
        <MapUnavailable places={visiblePlaces} />
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-3 px-4 pt-[calc(env(safe-area-inset-top)+12px)]">
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <SearchBar origin={userLocation} onSelectPlace={handleSelectFromSearch} />
          </div>
          <IconButton
            aria-label="Open filters"
            active={countActiveFilters(filters) > 0}
            onClick={() => setFilterSheetOpen(true)}
            className="relative shrink-0 bg-paper shadow-sm"
          >
            <SlidersHorizontal size={17} strokeWidth={1.75} />
            {countActiveFilters(filters) > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center bg-signal font-mono text-[9px] font-bold text-paper">
                {countActiveFilters(filters)}
              </span>
            )}
          </IconButton>
        </div>
        <div className="pointer-events-auto">
          <NeighborhoodSelector active={filters.neighborhood} onSelect={handleNeighborhoodSelect} />
        </div>
      </div>

      {!mapFailed && (
        <MapControls onLocate={handleLocate} onRecenter={handleRecenter} locationStatus={geolocation.status} />
      )}

      {isError && (
        <div className="absolute inset-x-4 top-32 z-10 border border-ink bg-paper shadow-lg">
          <ErrorState
            title="Couldn't load places"
            description="Check your connection and try again."
            onRetry={() => refetch()}
          />
        </div>
      )}

      {isLoading && !places && (
        <div className="pointer-events-none absolute left-1/2 top-24 z-10 -translate-x-1/2 border border-ink bg-paper px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-grey-500 shadow-sm">
          Loading places…
        </div>
      )}

      {!isLoading && !isError && visiblePlaces.length === 0 && (
        <div className="pointer-events-none absolute inset-x-4 top-32 z-10 border border-ink bg-paper px-4 py-3 text-center shadow-lg">
          <p className="font-mono text-xs uppercase tracking-widest text-grey-500">Nothing here yet</p>
          <p className="mt-1 text-xs text-grey-500">
            Try expanding the map or removing a filter.
          </p>
        </div>
      )}

      <PlaceBottomSheet
        place={selectedPlace}
        onOpenChange={(open) => !open && setSelectedPlace(null)}
        userLocation={userLocation}
      />

      <FilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        filters={filters}
        onChange={setFilters}
      />
    </div>
  );
}
