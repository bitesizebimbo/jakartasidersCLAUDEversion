export interface ViralScoreInput {
  mentions7d: number;
  mentions30d: number;
  previous7d: number;
  totalViews: number;
  averageEngagementRate: number;
  /** Age of the newest mention, in hours. */
  newestMentionAgeHours: number;
  googleReviews7d: number;
  previousGoogleReviews7d: number;
}

export interface GemScoreInput {
  /** Google rating, 0-5 */
  qualityRating: number;
  /** Estimated local audience share, 0-100 */
  localAudienceScore: number;
  /** Total social mentions in the last 30 days; higher saturation lowers the gem score. */
  socialMentions30d: number;
  /** Review sentiment, 0-100 */
  reviewSentiment: number;
  /** Uniqueness of concept/menu/setting, 0-100 */
  uniqueness: number;
}

export interface ClassificationInput {
  viralScore: number;
  gemScore: number;
}

export interface ClassificationThresholds {
  viralThreshold: number;
  gemThreshold: number;
}
