import { NextResponse } from "next/server";
import { getPlaceRepository } from "@/services/places";
import { searchQuerySchema } from "@/lib/utils/schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = searchQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json({ error: "Missing or invalid search query" }, { status: 400 });
  }

  const { q, lat, lng } = parsed.data;
  const origin = lat !== undefined && lng !== undefined ? { lat, lng } : undefined;

  try {
    const repo = getPlaceRepository();
    const places = await repo.search(q, origin);
    return NextResponse.json({ places, query: q });
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 502 });
  }
}
