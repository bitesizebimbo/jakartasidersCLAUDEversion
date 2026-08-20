import { NextResponse } from "next/server";
import { getPlaceRepository } from "@/services/places";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const repo = getPlaceRepository();

  try {
    const place = await repo.getBySlug(slug);
    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    const nearby = await repo.getNearby(place, 2, 8);
    return NextResponse.json({ place, nearby });
  } catch {
    return NextResponse.json({ error: "Failed to load place" }, { status: 502 });
  }
}
