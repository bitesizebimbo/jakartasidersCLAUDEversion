export type SocialPlatform = "tiktok" | "instagram";

export interface SocialMention {
  id: string;
  placeId: string;
  platform: SocialPlatform;
  externalPostId: string;
  postUrl: string;
  creatorHandle: string;
  caption: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  thumbnailUrl: string | null;
}

export interface TrendingPlace {
  placeId: string;
  mentions7d: number;
  weekOnWeekChangePct: number;
}

export interface TikTokPulse {
  posts7d: number;
  posts30d: number;
  weekOnWeekChangePct: number;
  recentMentions: SocialMention[];
}

/**
 * Result wrapper distinguishing "genuinely zero activity" from
 * "the provider failed / has no data" — never collapse the latter to 0.
 */
export type SocialDataResult<T> =
  | { status: "ok"; data: T }
  | { status: "unavailable"; reason: string };
