import Link from "next/link";
import { getExploreSections } from "@/services/recommendations/getExploreSections";
import { ExploreSectionRow } from "@/components/places/ExploreSectionRow";
import { NearYouSection } from "@/components/places/NearYouSection";
import { titleCase } from "@/lib/utils/format";

export const metadata = {
  title: "Explore — VIRAL / GEM",
};

export default async function ExplorePage() {
  const sections = await getExploreSections();

  return (
    <main className="min-h-0 flex-1 overflow-y-auto pb-8">
      <header className="dot-matrix border-b border-ink px-4 pb-6 pt-[calc(env(safe-area-inset-top)+20px)]">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-grey-500">Jakarta · V1</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">EXPLORE</h1>
        <p className="mt-1 max-w-md text-sm text-grey-600">
          What Jakarta is talking about — and what it hasn&apos;t discovered yet.
        </p>
      </header>

      <div className="flex flex-col gap-8 pt-6">
        <ExploreSectionRow {...sections.viralThisWeek} />
        <ExploreSectionRow {...sections.hiddenGems} />
        <ExploreSectionRow {...sections.internetJustFoundThese} />
        <ExploreSectionRow {...sections.locallyLoved} />

        <NearYouSection />

        <section className="space-y-4">
          <div className="px-4">
            <h2 className="text-lg font-semibold tracking-tight">SOUTH JAKARTA RIGHT NOW</h2>
            <p className="text-xs text-grey-500">
              Blok M, Senopati, Kemang, Cipete, Cilandak &amp; Pondok Indah — rotating daily
            </p>
          </div>
          <div className="flex flex-col gap-6">
            {sections.southJakartaRightNow.map((spotlight) =>
              spotlight.places.length === 0 ? null : (
                <div key={spotlight.neighborhood} className="space-y-2">
                  <div className="flex items-center justify-between px-4">
                    <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-grey-500">
                      {titleCase(spotlight.neighborhood)}
                    </h3>
                    <Link
                      href={`/?neighborhood=${spotlight.neighborhood}`}
                      className="font-mono text-[11px] uppercase tracking-wide text-grey-400 hover:text-ink"
                    >
                      View on map →
                    </Link>
                  </div>
                  <div className="flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
                    {spotlight.places.map((place) => (
                      <Link
                        key={place.id}
                        href={`/place/${place.slug}`}
                        className="flex w-44 shrink-0 flex-col gap-1 border border-grey-200 p-2.5 hover:border-ink"
                      >
                        <span className="line-clamp-1 text-sm font-medium">{place.name}</span>
                        <span className="font-mono text-[10px] uppercase tracking-wide text-grey-400">
                          {place.classification === "VIRAL"
                            ? "Viral ↑"
                            : place.classification === "HIDDEN_GEM"
                              ? "Gem ◇"
                              : "Watchlist"}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
