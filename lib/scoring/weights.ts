/**
 * Central, tunable weighting for the scoring model. Keep every weight here
 * so the model can be re-balanced without touching calculation logic.
 */
export const VIRAL_WEIGHTS = {
  mentionVelocity: 0.4,
  engagement: 0.25,
  recency: 0.2,
  googleReviewVelocity: 0.15,
} as const;

export const GEM_WEIGHTS = {
  quality: 0.3,
  localAudience: 0.25,
  lowSaturation: 0.2,
  reviewSentiment: 0.15,
  uniqueness: 0.1,
} as const;

export const CLASSIFICATION_THRESHOLDS = {
  viralThreshold: 65,
  gemThreshold: 65,
} as const;

/** Caps used to normalize raw counts onto a 0-100 curve. */
export const NORMALIZATION_CAPS = {
  mentions7d: 40,
  totalViews: 2_000_000,
  googleReviews7d: 25,
  newestMentionAgeHoursMax: 24 * 14,
  socialMentions30dSaturationCap: 60,
} as const;
