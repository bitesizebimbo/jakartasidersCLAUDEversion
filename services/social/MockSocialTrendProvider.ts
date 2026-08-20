import type { Place } from "@/types/place";
import type {
  SocialDataResult,
  SocialMention,
  TikTokPulse,
  TrendingPlace,
} from "@/types/social";
import { seedSocialMentions } from "@/data/seed/socialMentions";
import { percentChange, round } from "@/lib/scoring/normalize";
import type { SocialTrendProvider } from "./SocialTrendProvider";

const DAY_MS = 24 * 60 * 60 * 1000;

function mentionsForPlace(placeId: string): SocialMention[] {
  return seedSocialMentions.filter((m) => m.placeId === placeId);
}

function withinDays(mention: SocialMention, days: number, now: number): boolean {
  return now - new Date(mention.publishedAt).getTime() <= days * DAY_MS;
}

/**
 * Seed-backed provider used whenever no compliant real social-listening
 * source is configured. Designed so a future `TikTokProvider` or
 * `SocialListeningProvider` can implement the same interface without any
 * changes to calling code.
 */
export class MockSocialTrendProvider implements SocialTrendProvider {
  async searchPlaceMentions(place: Place): Promise<SocialDataResult<SocialMention[]>> {
    return { status: "ok", data: mentionsForPlace(place.id) };
  }

  async getRecentMentions(
    placeId: string,
    days: number
  ): Promise<SocialDataResult<SocialMention[]>> {
    const now = Date.now();
    const mentions = mentionsForPlace(placeId).filter((m) => withinDays(m, days, now));
    return { status: "ok", data: mentions };
  }

  async getMentionVelocity(placeId: string): Promise<SocialDataResult<number>> {
    const now = Date.now();
    const mentions = mentionsForPlace(placeId);
    const last7d = mentions.filter((m) => withinDays(m, 7, now)).length;
    const prior7d = mentions.filter(
      (m) =>
        now - new Date(m.publishedAt).getTime() > 7 * DAY_MS &&
        now - new Date(m.publishedAt).getTime() <= 14 * DAY_MS
    ).length;
    return { status: "ok", data: round(percentChange(last7d, prior7d)) };
  }

  async getTrendingPlaces(): Promise<SocialDataResult<TrendingPlace[]>> {
    const now = Date.now();
    const byPlace = new Map<string, SocialMention[]>();
    for (const mention of seedSocialMentions) {
      const list = byPlace.get(mention.placeId) ?? [];
      list.push(mention);
      byPlace.set(mention.placeId, list);
    }

    const trending: TrendingPlace[] = Array.from(byPlace.entries()).map(([placeId, mentions]) => {
      const mentions7d = mentions.filter((m) => withinDays(m, 7, now)).length;
      const prior7d = mentions.filter(
        (m) =>
          now - new Date(m.publishedAt).getTime() > 7 * DAY_MS &&
          now - new Date(m.publishedAt).getTime() <= 14 * DAY_MS
      ).length;
      return {
        placeId,
        mentions7d,
        weekOnWeekChangePct: round(percentChange(mentions7d, prior7d)),
      };
    });

    return { status: "ok", data: trending.sort((a, b) => b.mentions7d - a.mentions7d) };
  }

  async getTikTokPulse(placeId: string): Promise<SocialDataResult<TikTokPulse>> {
    const now = Date.now();
    const mentions = mentionsForPlace(placeId);
    const posts7d = mentions.filter((m) => withinDays(m, 7, now)).length;
    const posts30d = mentions.filter((m) => withinDays(m, 30, now)).length;
    const priorWeekCount = mentions.filter(
      (m) =>
        now - new Date(m.publishedAt).getTime() > 7 * DAY_MS &&
        now - new Date(m.publishedAt).getTime() <= 14 * DAY_MS
    ).length;

    const recentMentions = [...mentions]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 8);

    return {
      status: "ok",
      data: {
        posts7d,
        posts30d,
        weekOnWeekChangePct: round(percentChange(posts7d, priorWeekCount)),
        recentMentions,
      },
    };
  }
}
