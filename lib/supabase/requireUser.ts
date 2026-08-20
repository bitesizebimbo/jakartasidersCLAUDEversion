import "server-only";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "./server";

export type RequireUserResult =
  | { ok: true; supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>; userId: string }
  | { ok: false; response: NextResponse };

/** Route-handler guard: resolves the signed-in user or a ready-to-return error response. */
export async function requireUser(): Promise<RequireUserResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Saving isn't configured in this environment yet." },
        { status: 501 }
      ),
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Sign in required" }, { status: 401 }),
    };
  }

  return { ok: true, supabase, userId: user.id };
}
