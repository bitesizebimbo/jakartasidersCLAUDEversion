import { NextResponse } from "next/server";
import { getSocialTrendProvider } from "@/services/social";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ placeId: string }> }
) {
  const { placeId } = await params;

  try {
    const social = getSocialTrendProvider();
    const pulse = await social.getTikTokPulse(placeId);
    return NextResponse.json(pulse);
  } catch {
    return NextResponse.json(
      { status: "unavailable", reason: "Social trend data unavailable" },
      { status: 200 }
    );
  }
}
