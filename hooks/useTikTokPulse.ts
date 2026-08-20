import { useQuery } from "@tanstack/react-query";
import type { SocialDataResult, TikTokPulse } from "@/types/social";

async function fetchPulse(placeId: string): Promise<SocialDataResult<TikTokPulse>> {
  const res = await fetch(`/api/social/${placeId}`);
  if (!res.ok) {
    return { status: "unavailable", reason: "Social trend data unavailable" };
  }
  return res.json();
}

export function useTikTokPulse(placeId: string) {
  return useQuery({
    queryKey: ["tiktok-pulse", placeId],
    queryFn: () => fetchPulse(placeId),
    staleTime: 60_000,
  });
}
