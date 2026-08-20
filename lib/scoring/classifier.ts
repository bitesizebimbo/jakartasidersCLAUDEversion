import type {
  ClassificationInput,
  ClassificationThresholds,
} from "@/types/scoring";
import type { PlaceClassification } from "@/types/place";
import { CLASSIFICATION_THRESHOLDS } from "./weights";

/**
 * Classifies a place from its Viral and Gem scores. Thresholds are
 * configurable (see lib/scoring/weights.ts) rather than hardcoded here.
 */
export function classifyPlace(
  input: ClassificationInput,
  thresholds: ClassificationThresholds = CLASSIFICATION_THRESHOLDS
): PlaceClassification {
  if (input.viralScore >= thresholds.viralThreshold) {
    return "VIRAL";
  }
  if (input.gemScore >= thresholds.gemThreshold) {
    return "HIDDEN_GEM";
  }
  return "WATCHLIST";
}

export interface WhyThisStatus {
  headline: string;
  detail: string;
}

/** Produces the "WHY THIS STATUS" copy shown on the place detail page. */
export function explainClassification(params: {
  classification: PlaceClassification;
  mentions7d: number;
  weekOnWeekChangePct: number;
  localAudienceScore: number;
}): WhyThisStatus {
  const { classification, mentions7d, weekOnWeekChangePct, localAudienceScore } = params;

  if (classification === "VIRAL") {
    const trendCopy =
      weekOnWeekChangePct > 0
        ? `up ${Math.round(weekOnWeekChangePct)}% week-on-week`
        : "holding steady at a high volume";
    return {
      headline: "Social activity spiked recently",
      detail: `Social activity increased significantly over the last 7 days, with ${mentions7d} recent food-related mentions, ${trendCopy}.`,
    };
  }

  if (classification === "HIDDEN_GEM") {
    return {
      headline: "Strong quality, low exposure",
      detail: `Strong ratings and local interest (${Math.round(
        localAudienceScore
      )}% estimated local audience) with relatively low recent social-media exposure.`,
    };
  }

  return {
    headline: "Still building momentum",
    detail:
      "This place hasn't crossed the Viral or Hidden Gem threshold yet — it's on the radar and being tracked.",
  };
}
