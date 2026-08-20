import type { ViralScoreInput } from "@/types/scoring";
import { clamp, normalizeLinear, normalizeLog, percentChange, round } from "./normalize";
import { NORMALIZATION_CAPS, VIRAL_WEIGHTS } from "./weights";

/**
 * Calculates a 0-100 Viral Score from raw social + review signals.
 *
 * Weighting (see lib/scoring/weights.ts):
 *  - 40% TikTok mention velocity (7d volume + week-on-week growth)
 *  - 25% TikTok engagement (avg engagement rate + view volume)
 *  - 20% TikTok recency (how fresh the newest mention is)
 *  - 15% Google review velocity (7d review growth)
 */
export function calculateViralScore(input: ViralScoreInput): number {
  const velocityScore = mentionVelocityScore(input);
  const engagementScore = engagementScoreFor(input);
  const recencyScore = recencyScoreFor(input);
  const reviewVelocityScore = googleReviewVelocityScore(input);

  const weighted =
    velocityScore * VIRAL_WEIGHTS.mentionVelocity +
    engagementScore * VIRAL_WEIGHTS.engagement +
    recencyScore * VIRAL_WEIGHTS.recency +
    reviewVelocityScore * VIRAL_WEIGHTS.googleReviewVelocity;

  return round(clamp(weighted, 0, 100));
}

function mentionVelocityScore(input: ViralScoreInput): number {
  const volumeScore = normalizeLog(input.mentions7d, NORMALIZATION_CAPS.mentions7d);
  const growthPct = percentChange(input.mentions7d, input.previous7d);
  const growthScore = normalizeLinear(growthPct, -50, 250);
  return volumeScore * 0.6 + growthScore * 0.4;
}

function engagementScoreFor(input: ViralScoreInput): number {
  const engagementRateScore = normalizeLinear(input.averageEngagementRate, 0, 0.25);
  const viewsScore = normalizeLog(input.totalViews, NORMALIZATION_CAPS.totalViews);
  return engagementRateScore * 0.6 + viewsScore * 0.4;
}

function recencyScoreFor(input: ViralScoreInput): number {
  const { newestMentionAgeHoursMax } = NORMALIZATION_CAPS;
  if (input.newestMentionAgeHours <= 0) return 100;
  if (input.newestMentionAgeHours >= newestMentionAgeHoursMax) return 0;
  return 100 - normalizeLinear(input.newestMentionAgeHours, 0, newestMentionAgeHoursMax);
}

function googleReviewVelocityScore(input: ViralScoreInput): number {
  const volumeScore = normalizeLog(
    input.googleReviews7d,
    NORMALIZATION_CAPS.googleReviews7d
  );
  const growthPct = percentChange(input.googleReviews7d, input.previousGoogleReviews7d);
  const growthScore = normalizeLinear(growthPct, -50, 200);
  return volumeScore * 0.6 + growthScore * 0.4;
}
