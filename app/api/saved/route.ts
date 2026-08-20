import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { savePlaceSchema } from "@/lib/utils/schemas";
import { getPlaceRepository } from "@/services/places";

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("saved_places")
    .select("place_id")
    .eq("user_id", auth.userId);

  if (error) {
    return NextResponse.json({ error: "Failed to load saved places" }, { status: 502 });
  }

  const placeIds = (data ?? []).map((r) => r.place_id);
  const places = await getPlaceRepository().getByIds(placeIds);

  return NextResponse.json({ placeIds, places });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = savePlaceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid place id" }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("saved_places")
    .upsert({ user_id: auth.userId, place_id: parsed.data.placeId }, { onConflict: "user_id,place_id" });

  if (error) {
    return NextResponse.json({ error: "Failed to save place" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
