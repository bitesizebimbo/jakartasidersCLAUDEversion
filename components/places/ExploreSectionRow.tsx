import type { PlaceWithDistance } from "@/types/place";
import { PlaceCard } from "./PlaceCard";
import { EmptyState } from "@/components/ui/EmptyState";

export function ExploreSectionRow({
  title,
  subtitle,
  places,
}: {
  title: string;
  subtitle?: string;
  places: PlaceWithDistance[];
}) {
  return (
    <section className="space-y-3">
      <div className="px-4">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-grey-500">{subtitle}</p>}
      </div>
      {places.length === 0 ? (
        <div className="px-4">
          <EmptyState
            title="NOTHING HERE YET"
            description="Check back soon as more places cross this threshold."
            className="items-start px-0 py-4 text-left"
          />
        </div>
      ) : (
        <div className="-mx-0 flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </section>
  );
}
