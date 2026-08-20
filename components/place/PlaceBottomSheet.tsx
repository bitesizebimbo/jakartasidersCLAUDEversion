"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PlaceWithDistance } from "@/types/place";
import type { Coordinates } from "@/types/geo";
import { PRICE_LABELS } from "@/types/place";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ClassificationBadge } from "@/components/places/ClassificationBadge";
import { PlaceImage } from "@/components/places/PlaceImage";
import { SaveButton } from "@/components/saved/SaveButton";
import { DirectionsButton } from "./DirectionsButton";
import { useTikTokPulse } from "@/hooks/useTikTokPulse";
import { formatDistance } from "@/lib/geo/distance";
import { formatPercentChange, titleCase } from "@/lib/utils/format";
import { track } from "@/lib/analytics";

function AudienceLine({ audienceType, localScore }: { audienceType: string; localScore: number }) {
  const label =
    audienceType === "LOCAL"
      ? `${localScore}% LOCAL`
      : audienceType === "TOURIST"
        ? `${100 - localScore}% VISITOR`
        : `${localScore}% LOCAL / ${100 - localScore}% VISITOR`;
  return <span>{label}</span>;
}

function PulseLine({ placeId }: { placeId: string }) {
  const { data } = useTikTokPulse(placeId);
  if (!data || data.status === "unavailable") {
    return <span className="text-grey-400">Social trend data unavailable</span>;
  }
  return (
    <span>
      {data.data.posts7d} posts / 7 days{" "}
      <span className={data.data.weekOnWeekChangePct >= 0 ? "text-signal" : "text-grey-500"}>
        {formatPercentChange(data.data.weekOnWeekChangePct)}
      </span>
    </span>
  );
}

export function PlaceBottomSheet({
  place,
  onOpenChange,
  userLocation,
}: {
  place: PlaceWithDistance | null;
  onOpenChange: (open: boolean) => void;
  userLocation: Coordinates | null;
}) {
  return (
    <BottomSheet
      open={Boolean(place)}
      onOpenChange={onOpenChange}
      title={place?.name ?? "Place preview"}
      className="max-w-md sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
    >
      {place && (
        <div className="flex flex-col">
          <div className="relative">
            <PlaceImage placeType={place.placeType} className="h-36 w-full" />
            <div className="absolute right-3 top-3">
              <SaveButton placeId={place.id} redirectTo={`/place/${place.slug}`} />
            </div>
          </div>

          <div className="flex flex-col gap-4 p-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight">{place.name}</h2>
              <p className="text-sm text-grey-600">
                {titleCase(place.neighborhood)} · {titleCase(place.cuisines[0] ?? place.placeType)} ·{" "}
                {PRICE_LABELS[place.priceLevel]}
              </p>
              <ClassificationBadge classification={place.classification} />
            </div>

            <dl className="grid grid-cols-2 gap-4 border-y border-grey-200 py-4 font-mono text-xs">
              <div className="space-y-0.5">
                <dt className="uppercase tracking-widest text-grey-400">Viral Score</dt>
                <dd className="text-lg font-semibold">{place.viralScore.toString().padStart(3, "0")} / 100</dd>
              </div>
              <div className="space-y-0.5">
                <dt className="uppercase tracking-widest text-grey-400">Gem Score</dt>
                <dd className="text-lg font-semibold">{place.gemScore.toString().padStart(3, "0")} / 100</dd>
              </div>
              <div className="col-span-2 space-y-0.5">
                <dt className="uppercase tracking-widest text-grey-400">TikTok Pulse</dt>
                <dd>
                  <PulseLine placeId={place.id} />
                </dd>
              </div>
              <div className="space-y-0.5">
                <dt className="uppercase tracking-widest text-grey-400">Audience</dt>
                <dd>
                  <AudienceLine audienceType={place.audienceType} localScore={place.localScore} />
                </dd>
              </div>
              <div className="space-y-0.5">
                <dt className="uppercase tracking-widest text-grey-400">Google</dt>
                <dd>
                  {place.googleRating.toFixed(1)} · {place.googleReviewCount} reviews
                </dd>
              </div>
              {place.distanceKm !== null && place.distanceKm !== undefined && (
                <div className="space-y-0.5">
                  <dt className="uppercase tracking-widest text-grey-400">Distance</dt>
                  <dd>{formatDistance(place.distanceKm)}</dd>
                </div>
              )}
            </dl>

            <div className="flex flex-col gap-2 pb-2">
              <Link
                href={`/place/${place.slug}`}
                onClick={() => track("map_place_opened", { placeId: place.id })}
                className="flex h-11 items-center justify-center gap-2 border border-ink bg-ink text-sm font-medium uppercase tracking-wide text-paper transition-colors hover:bg-ink-soft"
              >
                View Place
                <ArrowRight size={15} />
              </Link>
              <DirectionsButton
                placeId={place.id}
                destination={place.coordinates}
                destinationName={place.name}
                origin={userLocation}
              />
            </div>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
