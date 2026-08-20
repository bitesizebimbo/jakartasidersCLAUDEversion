import { MapExperience } from "@/components/map/MapExperience";
import { getPlaceRepository } from "@/services/places";
import { JAKARTA_BOUNDS } from "@/lib/geo/jakarta";
import { NEIGHBORHOODS, type NeighborhoodSlug } from "@/types/place";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ neighborhood?: string }>;
}) {
  const repo = getPlaceRepository();
  const initialPlaces = await repo.list({ bounds: JAKARTA_BOUNDS, limit: 500 });

  const { neighborhood } = await searchParams;
  const initialNeighborhood = NEIGHBORHOODS.some((n) => n.slug === neighborhood)
    ? (neighborhood as NeighborhoodSlug)
    : null;

  return (
    <main className="relative min-h-0 flex-1">
      <MapExperience initialPlaces={initialPlaces} initialNeighborhood={initialNeighborhood} />
    </main>
  );
}
