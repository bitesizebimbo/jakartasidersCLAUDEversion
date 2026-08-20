import { NextResponse } from "next/server";
import { getPlaceRepository } from "@/services/places";
import { NEIGHBORHOOD_CENTERS } from "@/lib/geo/jakarta";
import { NEIGHBORHOODS, type NeighborhoodSlug } from "@/types/place";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const neighborhood = NEIGHBORHOODS.find((n) => n.slug === slug);

  if (!neighborhood) {
    return NextResponse.json({ error: "Unknown neighborhood" }, { status: 404 });
  }

  try {
    const repo = getPlaceRepository();
    const places = await repo.list({ neighborhood: slug as NeighborhoodSlug, limit: 100 });
    return NextResponse.json({
      neighborhood,
      center: NEIGHBORHOOD_CENTERS[slug as NeighborhoodSlug],
      places,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load neighborhood" }, { status: 502 });
  }
}
