import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId");
  if (!placeId) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("collection_places")
    .select("collection_id, collections!inner(user_id)")
    .eq("place_id", placeId)
    .eq("collections.user_id", auth.userId);

  if (error) {
    return NextResponse.json({ error: "Failed to load collections for place" }, { status: 502 });
  }

  return NextResponse.json({ collectionIds: (data ?? []).map((r) => r.collection_id) });
}
