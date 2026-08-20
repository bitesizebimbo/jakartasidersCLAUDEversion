import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin, Clock, Star } from "lucide-react";
import { getPlaceRepository } from "@/services/places";
import { getSocialTrendProvider } from "@/services/social";
import { explainClassification } from "@/lib/scoring/classifier";
import { PRICE_LABELS } from "@/types/place";
import { ClassificationBadge } from "@/components/places/ClassificationBadge";
import { ViralScore } from "@/components/places/ViralScore";
import { GemScore } from "@/components/places/GemScore";
import { AudienceMeter } from "@/components/places/AudienceMeter";
import { PlaceImage } from "@/components/places/PlaceImage";
import { PlaceCard } from "@/components/places/PlaceCard";
import { PlaceDetailActions } from "@/components/place/PlaceDetailActions";
import { TikTokPulse } from "@/components/social/TikTokPulse";
import { titleCase } from "@/lib/utils/format";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const place = await getPlaceRepository().getBySlug(slug);
  if (!place) return { title: "Place not found — VIRAL / GEM" };
  return {
    title: `${place.name} — ${titleCase(place.neighborhood)} | VIRAL / GEM`,
    description: place.description,
  };
}

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const repo = getPlaceRepository();
  const place = await repo.getBySlug(slug);
  if (!place) notFound();

  const [nearby, similar, pulseResult] = await Promise.all([
    repo.getNearby(place, 2, 6),
    repo.list({ cuisines: place.cuisines, limit: 9 }).then((list) => list.filter((p) => p.id !== place.id).slice(0, 6)),
    getSocialTrendProvider().getTikTokPulse(place.id),
  ]);

  const why =
    pulseResult.status === "ok"
      ? explainClassification({
          classification: place.classification,
          mentions7d: pulseResult.data.posts7d,
          weekOnWeekChangePct: pulseResult.data.weekOnWeekChangePct,
          localAudienceScore: place.localScore,
        })
      : {
          headline: "Score-based classification",
          detail:
            "This classification is based on Viral and Gem Score signals gathered over time. Live social data is currently unavailable.",
        };

  return (
    <main className="min-h-0 flex-1 overflow-y-auto pb-8">
      <div className="relative">
        <PlaceImage placeType={place.placeType} className="h-56 w-full" iconSize={40} />
        <div className="absolute left-4 top-4">
          <ClassificationBadge classification={place.classification} />
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-8 px-5 pt-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{place.name}</h1>
          <p className="text-sm text-grey-600">
            {titleCase(place.neighborhood)} · {place.cuisines.map(titleCase).join(", ")} ·{" "}
            {titleCase(place.placeType.replace("_", " "))} · {PRICE_LABELS[place.priceLevel]}
          </p>
          <p className="flex items-center gap-1 text-sm">
            <Star size={14} className="fill-ink" />
            {place.googleRating.toFixed(1)}
            <span className="text-grey-500">({place.googleReviewCount} reviews)</span>
          </p>
        </header>

        <PlaceDetailActions
          placeId={place.id}
          slug={place.slug}
          destination={place.coordinates}
          destinationName={place.name}
        />

        <section className="grid grid-cols-2 gap-6 border-y border-grey-200 py-6">
          <ViralScore score={place.viralScore} size="lg" />
          <GemScore score={place.gemScore} size="lg" />
        </section>

        <section className="space-y-2">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-grey-500">
            Why this status
          </h2>
          <p className="text-sm font-medium">{why.headline}</p>
          <p className="text-sm leading-relaxed text-grey-600">{why.detail}</p>
        </section>

        <section>
          <TikTokPulse placeId={place.id} />
        </section>

        <section>
          <AudienceMeter audienceType={place.audienceType} localScore={place.localScore} />
        </section>

        <section className="space-y-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-grey-500">Details</h2>
          <p className="text-sm leading-relaxed text-grey-700">{place.description}</p>
          <div className="space-y-2 text-sm text-grey-600">
            <p className="flex items-start gap-2">
              <MapPin size={15} className="mt-0.5 shrink-0" strokeWidth={1.75} />
              {place.address}
            </p>
            <p className="flex items-start gap-2">
              <Clock size={15} className="mt-0.5 shrink-0" strokeWidth={1.75} />
              {place.openingHours}
            </p>
          </div>
          {place.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {place.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-grey-200 px-2 py-0.5 text-[11px] uppercase tracking-wide text-grey-500"
                >
                  {tag.replace("-", " ")}
                </span>
              ))}
            </div>
          )}
        </section>

        {similar.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-grey-500">
              Similar places
            </h2>
            <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 no-scrollbar">
              {similar.map((p) => (
                <PlaceCard key={p.id} place={p} />
              ))}
            </div>
          </section>
        )}

        {nearby.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-grey-500">Nearby</h2>
            <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 no-scrollbar">
              {nearby.map((p) => (
                <PlaceCard key={p.id} place={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
