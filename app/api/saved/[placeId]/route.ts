import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ placeId: string }> }
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { placeId } = await params;

  const { error } = await auth.supabase
    .from("saved_places")
    .delete()
    .eq("user_id", auth.userId)
    .eq("place_id", placeId);

  if (error) {
    return NextResponse.json({ error: "Failed to unsave place" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
