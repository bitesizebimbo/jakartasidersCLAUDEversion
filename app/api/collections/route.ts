import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { createCollectionSchema } from "@/lib/utils/schemas";

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("collections")
    .select("id, name, created_at, updated_at, collection_places(count)")
    .eq("user_id", auth.userId)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to load collections" }, { status: 502 });
  }

  const collections = (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    placeCount: Array.isArray(c.collection_places) ? (c.collection_places[0]?.count ?? 0) : 0,
  }));

  return NextResponse.json({ collections });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = createCollectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid name" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("collections")
    .insert({ user_id: auth.userId, name: parsed.data.name })
    .select("id, name, created_at, updated_at")
    .single();

  if (error) {
    const isDuplicate = error.code === "23505";
    return NextResponse.json(
      { error: isDuplicate ? "You already have a collection with that name" : "Failed to create collection" },
      { status: isDuplicate ? 409 : 502 }
    );
  }

  return NextResponse.json({
    collection: {
      id: data.id,
      name: data.name,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      placeCount: 0,
    },
  });
}
