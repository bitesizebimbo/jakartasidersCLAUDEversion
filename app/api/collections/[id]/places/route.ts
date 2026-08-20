import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { getPlaceRepository } from "@/services/places";
import { z } from "zod";

const bodySchema = z.object({ placeId: z.string().uuid() });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const { data, error } = await auth.supabase
    .from("collection_places")
    .select("place_id, collections!inner(user_id)")
    .eq("collection_id", id)
    .eq("collections.user_id", auth.userId);

  if (error) {
    return NextResponse.json({ error: "Failed to load collection places" }, { status: 502 });
  }

  const placeIds = (data ?? []).map((r) => r.place_id);
  const places = await getPlaceRepository().getByIds(placeIds);

  return NextResponse.json({ places });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid place id" }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("collection_places")
    .upsert({ collection_id: id, place_id: parsed.data.placeId }, { onConflict: "collection_id,place_id" });

  if (error) {
    return NextResponse.json({ error: "Failed to add place to collection" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
