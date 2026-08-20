import { MapPinOff } from "lucide-react";
import type { PlaceWithDistance } from "@/types/place";
import { PlaceCard } from "@/components/places/PlaceCard";
import { titleCase } from "@/lib/utils/format";

/**
 * Graceful fallback when no Mapbox token is configured — the discovery
 * experience keeps working as a neighborhood-grouped list instead of a
 * blank screen.
 */
export function MapUnavailable({ places }: { places: PlaceWithDistance[] }) {
  const byNeighborhood = new Map<string, PlaceWithDistance[]>();
  for (const place of places) {
    const list = byNeighborhood.get(place.neighborhood) ?? [];
    list.push(place);
    byNeighborhood.set(place.neighborhood, list);
  }

  return (
    <div className="dot-matrix flex h-full flex-col overflow-y-auto bg-off-white">
      <div className="flex items-center gap-3 border-b border-ink bg-paper px-4 py-3">
        <MapPinOff size={18} strokeWidth={1.5} className="text-grey-500" />
        <div>
          <p className="text-sm font-semibold">Live map unavailable</p>
          <p className="font-mono text-[11px] text-grey-500">
            Add NEXT_PUBLIC_MAPBOX_TOKEN to enable the interactive map. Browsing by list still
            works.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-4 py-5">
        {Array.from(byNeighborhood.entries()).map(([neighborhood, list]) => (
          <section key={neighborhood} className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-grey-500">
              {titleCase(neighborhood)}
            </h2>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
              {list.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
