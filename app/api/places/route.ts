import { NextResponse } from "next/server";
import { getPlaceRepository } from "@/services/places";
import { placeQuerySchema } from "@/lib/utils/schemas";
import type { PlaceListParams } from "@/services/places/types";
import type {
  BeverageType,
  CuisineSlug,
  NeighborhoodSlug,
  PlaceType,
  PriceLevel,
} from "@/types/place";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = placeQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
  }

  const q = parsed.data;

  const params: PlaceListParams = {
    status: q.status,
    neighborhood: q.neighborhood as NeighborhoodSlug | undefined,
    beverage: q.beverage as BeverageType | undefined,
    audience: q.audience,
    distanceKm: q.distanceKm,
    limit: 500,
  };

  if (q.north !== undefined && q.south !== undefined && q.east !== undefined && q.west !== undefined) {
    params.bounds = { north: q.north, south: q.south, east: q.east, west: q.west };
  }
  if (q.placeTypes) {
    params.placeTypes = q.placeTypes.split(",") as PlaceType[];
  }
  if (q.cuisines) {
    params.cuisines = q.cuisines.split(",") as CuisineSlug[];
  }
  if (q.priceLevels) {
    params.priceLevels = q.priceLevels.split(",").map(Number) as PriceLevel[];
  }
  if (q.lat !== undefined && q.lng !== undefined) {
    params.origin = { lat: q.lat, lng: q.lng };
  }

  try {
    const repo = getPlaceRepository();
    const places = await repo.list(params);
    return NextResponse.json({ places });
  } catch {
    return NextResponse.json({ error: "Failed to load places" }, { status: 502 });
  }
}
