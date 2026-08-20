import "server-only";
import type { Coordinates } from "@/types/geo";
import type { NeighborhoodSlug, PlaceWithDistance } from "@/types/place";
import { getPlaceRepository } from "@/services/places";
import { getSocialTrendProvider } from "@/services/social";

const SOUTH_JAKARTA_NEIGHBORHOODS: NeighborhoodSlug[] = [
  "blok-m",
  "senopati",
  "scbd",
  "kemang",
  "cipete",
  "cilandak",
  "pondok-indah",
];

export interface ExploreSection {
  key: string;
  title: string;
  subtitle: string;
  places: PlaceWithDistance[];
}

export interface NeighborhoodSpotlight {
  neighborhood: NeighborhoodSlug;
  places: PlaceWithDistance[];
}

export interface ExploreSections {
  viralThisWeek: ExploreSection;
  hiddenGems: ExploreSection;
  internetJustFoundThese: ExploreSection;
  locallyLoved: ExploreSection;
  nearYou: ExploreSection | null;
  southJakartaRightNow: NeighborhoodSpotlight[];
}

function dayIndex(): number {
  const start = Date.UTC(new Date().getUTCFullYear(), 0, 0);
  const now = Date.now();
  return Math.floor((now - start) / (24 * 60 * 60 * 1000));
}

export async function getExploreSections(origin?: Coordinates): Promise<ExploreSections> {
  const repo = getPlaceRepository();
  const social = getSocialTrendProvider();

  const [allPlaces, trendingResult] = await Promise.all([
    repo.list({ limit: 500 }),
    social.getTrendingPlaces(),
  ]);

  const viralThisWeek = [...allPlaces]
    .filter((p) => p.classification === "VIRAL")
    .sort((a, b) => b.viralScore - a.viralScore)
    .slice(0, 10);

  const hiddenGems = [...allPlaces]
    .filter((p) => p.classification === "HIDDEN_GEM")
    .sort((a, b) => b.gemScore - a.gemScore)
    .slice(0, 10);

  let internetJustFoundThese: PlaceWithDistance[] = [];
  if (trendingResult.status === "ok") {
    const growthByPlace = new Map(trendingResult.data.map((t) => [t.placeId, t.weekOnWeekChangePct]));
    internetJustFoundThese = [...allPlaces]
      .filter((p) => (growthByPlace.get(p.id) ?? 0) > 40)
      .sort((a, b) => (growthByPlace.get(b.id) ?? 0) - (growthByPlace.get(a.id) ?? 0))
      .slice(0, 8);
  }

  const locallyLoved = [...allPlaces]
    .filter((p) => p.audienceType === "LOCAL")
    .sort((a, b) => b.localScore - a.localScore)
    .slice(0, 10);

  let nearYou: ExploreSection | null = null;
  if (origin) {
    const near = await repo.list({ origin, distanceKm: 5, limit: 10 });
    nearYou = {
      key: "near-you",
      title: "NEAR YOU",
      subtitle: "Within 5km of where you are right now",
      places: near,
    };
  }

  const rotation = dayIndex() % SOUTH_JAKARTA_NEIGHBORHOODS.length;
  const rotatedNeighborhoods = [
    ...SOUTH_JAKARTA_NEIGHBORHOODS.slice(rotation),
    ...SOUTH_JAKARTA_NEIGHBORHOODS.slice(0, rotation),
  ];

  const southJakartaRightNow: NeighborhoodSpotlight[] = rotatedNeighborhoods.map((n) => ({
    neighborhood: n,
    places: allPlaces
      .filter((p) => p.neighborhood === n)
      .sort((a, b) => b.viralScore + b.gemScore - (a.viralScore + a.gemScore))
      .slice(0, 5),
  }));

  return {
    viralThisWeek: {
      key: "viral-this-week",
      title: "VIRAL THIS WEEK",
      subtitle: "Strongest recent trend activity across Jakarta",
      places: viralThisWeek,
    },
    hiddenGems: {
      key: "hidden-gems",
      title: "HIDDEN GEMS",
      subtitle: "High Gem Score, still under the radar",
      places: hiddenGems,
    },
    internetJustFoundThese: {
      key: "internet-just-found-these",
      title: "THE INTERNET JUST FOUND THESE",
      subtitle: "Online activity accelerating fast this week",
      places: internetJustFoundThese,
    },
    locallyLoved: {
      key: "locals-love-these",
      title: "LOCALS LOVE THESE",
      subtitle: "High local-audience score",
      places: locallyLoved,
    },
    nearYou,
    southJakartaRightNow,
  };
}
