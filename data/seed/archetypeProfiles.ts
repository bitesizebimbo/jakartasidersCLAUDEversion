import type { SeedArchetype } from "./placeSeeds";

export interface MentionVolumeProfile {
  mentions7d: [number, number];
  priorWeek: [number, number];
  older15to30d: [number, number];
  viewsPerPost: [number, number];
  engagementRate: [number, number];
  googleReviews7d: [number, number];
  previousGoogleReviews7d: [number, number];
}

export interface GemSignalProfile {
  localAudienceScore: [number, number];
  reviewSentiment: [number, number];
  uniqueness: [number, number];
}

export const MENTION_VOLUME_PROFILES: Record<SeedArchetype, MentionVolumeProfile> = {
  viral: {
    mentions7d: [24, 42],
    priorWeek: [6, 15],
    older15to30d: [4, 12],
    viewsPerPost: [40_000, 260_000],
    engagementRate: [0.11, 0.24],
    googleReviews7d: [9, 21],
    previousGoogleReviews7d: [2, 6],
  },
  moderate: {
    mentions7d: [5, 10],
    priorWeek: [5, 11],
    older15to30d: [8, 16],
    viewsPerPost: [4_000, 25_000],
    engagementRate: [0.04, 0.09],
    googleReviews7d: [3, 7],
    previousGoogleReviews7d: [3, 7],
  },
  gem: {
    mentions7d: [0, 3],
    priorWeek: [0, 3],
    older15to30d: [2, 7],
    viewsPerPost: [800, 6_000],
    engagementRate: [0.03, 0.08],
    googleReviews7d: [1, 3],
    previousGoogleReviews7d: [1, 3],
  },
  watchlist: {
    mentions7d: [2, 6],
    priorWeek: [6, 12],
    older15to30d: [7, 15],
    viewsPerPost: [2_000, 14_000],
    engagementRate: [0.02, 0.05],
    googleReviews7d: [1, 4],
    previousGoogleReviews7d: [2, 5],
  },
};

export const GEM_SIGNAL_PROFILES: Record<SeedArchetype, GemSignalProfile> = {
  viral: {
    localAudienceScore: [28, 52],
    reviewSentiment: [70, 88],
    uniqueness: [40, 68],
  },
  moderate: {
    localAudienceScore: [45, 68],
    reviewSentiment: [65, 82],
    uniqueness: [32, 58],
  },
  gem: {
    localAudienceScore: [70, 92],
    reviewSentiment: [80, 96],
    uniqueness: [55, 88],
  },
  watchlist: {
    localAudienceScore: [40, 64],
    reviewSentiment: [55, 74],
    uniqueness: [22, 46],
  },
};
