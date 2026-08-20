import { NextResponse } from "next/server";
import { z } from "zod";

const PHOTO_NAME_PATTERN = /^places\/[^/]+\/photos\/[^/]+$/;

const querySchema = z.object({
  name: z.string().regex(PHOTO_NAME_PATTERN, "Invalid photo reference"),
  maxWidthPx: z.coerce.number().int().min(1).max(4800).default(800),
});

/**
 * Server-side proxy for the Google Places Photo media endpoint. Keeps
 * GOOGLE_PLACES_API_KEY out of the client entirely, and streams the
 * actual image bytes back (rather than redirecting) so this works as a
 * plain same-origin `src` for next/image with no remotePatterns needed.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid photo request" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Google Places photos aren't configured" }, { status: 501 });
  }

  const { name, maxWidthPx } = parsed.data;
  const mediaUrl = `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${maxWidthPx}&key=${apiKey}`;

  try {
    const res = await fetch(mediaUrl);
    if (!res.ok || !res.body) {
      return NextResponse.json({ error: "Photo unavailable" }, { status: 502 });
    }

    return new NextResponse(res.body, {
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json({ error: "Photo unavailable" }, { status: 502 });
  }
}
