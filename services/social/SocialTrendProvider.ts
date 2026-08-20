import type { Place } from "@/types/place";
import type { SocialDataResult, SocialMention, TikTokPulse, TrendingPlace } from "@/types/social";

/**
 * Abstraction over social listening data. Never scrape client-side —
 * every implementation of this interface runs server-side and returns a
 * `SocialDataResult` so callers can distinguish "zero activity" from
 * "the provider failed."
 */
export interface SocialTrendProvider {
  searchPlaceMentions(place: Place): Promise<SocialDataResult<SocialMention[]>>;
  getRecentMentions(placeId: string, days: number): Promise<SocialDataResult<SocialMention[]>>;
  getMentionVelocity(placeId: string): Promise<SocialDataResult<number>>;
  getTrendingPlaces(): Promise<SocialDataResult<TrendingPlace[]>>;
  getTikTokPulse(placeId: string): Promise<SocialDataResult<TikTokPulse>>;
}
