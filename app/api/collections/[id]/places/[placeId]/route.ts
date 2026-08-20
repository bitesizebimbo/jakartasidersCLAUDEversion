import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; placeId: string }> }
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { id, placeId } = await params;

  const { error } = await auth.supabase
    .from("collection_places")
    .delete()
    .eq("collection_id", id)
    .eq("place_id", placeId);

  if (error) {
    return NextResponse.json({ error: "Failed to remove place from collection" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
