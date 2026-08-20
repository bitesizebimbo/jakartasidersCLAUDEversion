import Link from "next/link";
import type { PlaceWithDistance } from "@/types/place";
import { PRICE_LABELS } from "@/types/place";
import { ClassificationBadge } from "./ClassificationBadge";
import { PlaceImage } from "./PlaceImage";
import { formatDistance } from "@/lib/geo/distance";
import { titleCase } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function PlaceCard({
  place,
  className,
}: {
  place: PlaceWithDistance;
  className?: string;
}) {
  return (
    <Link
      href={`/place/${place.slug}`}
      className={cn(
        "group flex w-64 shrink-0 flex-col border border-grey-200 bg-paper transition-colors hover:border-ink",
        className
      )}
    >
      <div className="relative">
        <PlaceImage placeType={place.placeType} className="h-32 w-full" />
        <ClassificationBadge
          classification={place.classification}
          size="sm"
          className="absolute left-2 top-2"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-ink">{place.name}</h3>
        <p className="line-clamp-1 text-xs text-grey-500">
          {titleCase(place.neighborhood)} · {titleCase(place.placeType.replace("_", " "))} ·{" "}
          {PRICE_LABELS[place.priceLevel]}
        </p>
        <div className="mt-auto flex items-center justify-between pt-1 font-mono text-[11px] text-grey-500">
          <span>★ {place.googleRating.toFixed(1)}</span>
          {place.distanceKm !== null && place.distanceKm !== undefined && (
            <span>{formatDistance(place.distanceKm)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
