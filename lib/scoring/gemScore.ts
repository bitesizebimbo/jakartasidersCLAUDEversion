import type { GemScoreInput } from "@/types/scoring";
import { clamp, normalizeLinear, round } from "./normalize";
import { GEM_WEIGHTS, NORMALIZATION_CAPS } from "./weights";

/**
 * Calculates a 0-100 Hidden Gem Score, independent from the Viral Score.
 * A Hidden Gem is not "the absence of virality" — it is quality plus local
 * love plus relatively low social exposure.
 *
 * Weighting (see lib/scoring/weights.ts):
 *  - 30% quality rating
 *  - 25% local audience score
 *  - 20% low social saturation (inverse of recent mention volume)
 *  - 15% review sentiment
 *  - 10% uniqueness
 */
export function calculateGemScore(input: GemScoreInput): number {
  const qualityScore = normalizeLinear(input.qualityRating, 3, 5);
  const localAudienceScore = clamp(input.localAudienceScore, 0, 100);
  const saturationScore = lowSaturationScore(input.socialMentions30d);
  const sentimentScore = clamp(input.reviewSentiment, 0, 100);
  const uniquenessScore = clamp(input.uniqueness, 0, 100);

  const weighted =
    qualityScore * GEM_WEIGHTS.quality +
    localAudienceScore * GEM_WEIGHTS.localAudience +
    saturationScore * GEM_WEIGHTS.lowSaturation +
    sentimentScore * GEM_WEIGHTS.reviewSentiment +
    uniquenessScore * GEM_WEIGHTS.uniqueness;

  return round(clamp(weighted, 0, 100));
}

function lowSaturationScore(socialMentions30d: number): number {
  const saturation = normalizeLinear(
    socialMentions30d,
    0,
    NORMALIZATION_CAPS.socialMentions30dSaturationCap
  );
  return 100 - saturation;
}
