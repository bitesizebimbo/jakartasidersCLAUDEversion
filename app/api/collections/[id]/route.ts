import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { collectionNameSchema } from "@/lib/utils/schemas";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = collectionNameSchema.safeParse(body?.name);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid name" }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("collections")
    .update({ name: parsed.data })
    .eq("id", id)
    .eq("user_id", auth.userId);

  if (error) {
    return NextResponse.json({ error: "Failed to rename collection" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const { error } = await auth.supabase
    .from("collections")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.userId);

  if (error) {
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
