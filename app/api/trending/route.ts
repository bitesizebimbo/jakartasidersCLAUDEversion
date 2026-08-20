import { NextResponse } from "next/server";
import { getPlaceRepository } from "@/services/places";
import { getSocialTrendProvider } from "@/services/social";

export async function GET() {
  try {
    const social = getSocialTrendProvider();
    const trending = await social.getTrendingPlaces();

    if (trending.status === "unavailable") {
      return NextResponse.json({ status: "unavailable", reason: trending.reason }, { status: 200 });
    }

    const repo = getPlaceRepository();
    const topIds = trending.data.slice(0, 12).map((t) => t.placeId);
    const places = await repo.getByIds(topIds);
    const placeById = new Map(places.map((p) => [p.id, p]));

    const results = trending.data
      .filter((t) => placeById.has(t.placeId))
      .slice(0, 12)
      .map((t) => ({
        place: placeById.get(t.placeId)!,
        mentions7d: t.mentions7d,
        weekOnWeekChangePct: t.weekOnWeekChangePct,
      }));

    return NextResponse.json({ status: "ok", trending: results });
  } catch {
    return NextResponse.json({ error: "Failed to load trending places" }, { status: 502 });
  }
}
