import type { AudienceType, Cuisine, Place, PriceLevel } from "@/types/place";
import type { SocialMention } from "@/types/social";
import type { ViralScoreInput, GemScoreInput } from "@/types/scoring";
import { calculateViralScore } from "@/lib/scoring/viralScore";
import { calculateGemScore } from "@/lib/scoring/gemScore";
import { classifyPlace } from "@/lib/scoring/classifier";
import { jitterCoordinates, NEIGHBORHOOD_CENTERS } from "@/lib/geo/jakarta";
import { pick, randomFloat, randomInt, seededRandom } from "@/lib/utils/prng";
import { slugify } from "@/lib/utils/format";
import { CUISINE_SLUGS } from "@/types/place";
import { googlePlacePhotoUrl } from "@/lib/google/photoUrl";
import { placeSeeds, type PlaceSeed } from "./placeSeeds";
import { MENTION_VOLUME_PROFILES, GEM_SIGNAL_PROFILES } from "./archetypeProfiles";
import { CAPTION_TEMPLATES, CREATOR_HANDLES } from "./socialContent";

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = Date.now();

function audienceTypeFromScore(localScore: number): AudienceType {
  if (localScore >= 65) return "LOCAL";
  if (localScore <= 35) return "TOURIST";
  return "MIXED";
}

function randomTimestampInWindow(
  rand: () => number,
  daysAgoMin: number,
  daysAgoMax: number
): string {
  const daysAgo = randomFloat(rand, daysAgoMin, daysAgoMax);
  return new Date(NOW - daysAgo * DAY_MS).toISOString();
}

function buildMentionsForPlace(placeId: string, seed: PlaceSeed): SocialMention[] {
  const profile = MENTION_VOLUME_PROFILES[seed.archetype];
  const rand = seededRandom(`mentions:${placeId}`);

  const counts = {
    recent: randomInt(rand, ...profile.mentions7d),
    prior: randomInt(rand, ...profile.priorWeek),
    older: randomInt(rand, ...profile.older15to30d),
  };

  const windows: Array<{ count: number; min: number; max: number }> = [
    { count: counts.recent, min: 0, max: 7 },
    { count: counts.prior, min: 7, max: 14 },
    { count: counts.older, min: 14, max: 30 },
  ];

  const mentions: SocialMention[] = [];
  let index = 0;

  for (const window of windows) {
    for (let i = 0; i < window.count; i++) {
      const publishedAt = randomTimestampInWindow(rand, window.min, window.max);
      const views = Math.round(randomFloat(rand, ...profile.viewsPerPost));
      const engagementRate = randomFloat(rand, ...profile.engagementRate);
      const engaged = Math.round(views * engagementRate);
      const likeCount = Math.round(engaged * 0.78);
      const commentCount = Math.round(engaged * 0.14);
      const shareCount = Math.max(0, engaged - likeCount - commentCount);

      const caption = pick(rand, CAPTION_TEMPLATES).replace("{name}", seed.name);
      const creatorHandle = pick(rand, CREATOR_HANDLES);
      const externalPostId = `${placeId}-${index}`;

      mentions.push({
        id: `mention-${externalPostId}`,
        placeId,
        platform: "tiktok",
        externalPostId,
        postUrl: `https://www.tiktok.com/${creatorHandle}/video/${externalPostId}`,
        creatorHandle,
        caption,
        publishedAt,
        viewCount: views,
        likeCount,
        commentCount,
        shareCount,
        thumbnailUrl: null,
      });
      index++;
    }
  }

  return mentions.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

function deriveViralInput(
  mentions: SocialMention[],
  seed: PlaceSeed,
  rand: () => number
): ViralScoreInput {
  const profile = MENTION_VOLUME_PROFILES[seed.archetype];
  const now = NOW;

  const mentions7d = mentions.filter((m) => now - new Date(m.publishedAt).getTime() <= 7 * DAY_MS).length;
  const mentions30d = mentions.length;
  const previous7d = mentions.filter((m) => {
    const age = now - new Date(m.publishedAt).getTime();
    return age > 7 * DAY_MS && age <= 14 * DAY_MS;
  }).length;
  const totalViews = mentions.reduce((sum, m) => sum + m.viewCount, 0);
  const totalEngaged = mentions.reduce(
    (sum, m) => sum + m.likeCount + m.commentCount + m.shareCount,
    0
  );
  const averageEngagementRate = totalViews > 0 ? totalEngaged / totalViews : 0;
  const newest = mentions[0];
  const newestMentionAgeHours = newest
    ? Math.max(0, (now - new Date(newest.publishedAt).getTime()) / (60 * 60 * 1000))
    : 24 * 30;

  return {
    mentions7d,
    mentions30d,
    previous7d,
    totalViews,
    averageEngagementRate,
    newestMentionAgeHours,
    googleReviews7d: randomInt(rand, ...profile.googleReviews7d),
    previousGoogleReviews7d: randomInt(rand, ...profile.previousGoogleReviews7d),
  };
}

function deriveGemInput(
  seed: PlaceSeed,
  mentions30d: number,
  rand: () => number
): GemScoreInput {
  const profile = GEM_SIGNAL_PROFILES[seed.archetype];
  return {
    qualityRating: seed.baseRating,
    localAudienceScore: randomFloat(rand, ...profile.localAudienceScore),
    socialMentions30d: mentions30d,
    reviewSentiment: randomFloat(rand, ...profile.reviewSentiment),
    uniqueness: randomFloat(rand, ...profile.uniqueness),
  };
}

interface BuiltSeedData {
  places: Place[];
  socialMentions: SocialMention[];
  cuisines: Cuisine[];
}

let cache: BuiltSeedData | null = null;

function buildCuisines(): Cuisine[] {
  return CUISINE_SLUGS.map((slug) => ({
    id: slug,
    slug,
    name: slug
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
  }));
}

function buildSeedData(): BuiltSeedData {
  if (cache) return cache;

  const usedSlugs = new Set<string>();
  const places: Place[] = [];
  const allMentions: SocialMention[] = [];

  placeSeeds.forEach((seed, seedIndex) => {
    let slug = slugify(seed.name);
    while (usedSlugs.has(slug)) {
      slug = `${slug}-${seedIndex}`;
    }
    usedSlugs.add(slug);

    const placeId = slug;
    const mentions = buildMentionsForPlace(placeId, seed);
    allMentions.push(...mentions);

    const gemRand = seededRandom(`gem:${placeId}`);
    const viralInput = deriveViralInput(mentions, seed, seededRandom(`google:${placeId}`));
    const gemInput = deriveGemInput(seed, viralInput.mentions30d, gemRand);

    const viralScore = calculateViralScore(viralInput);
    const gemScore = calculateGemScore(gemInput);
    const classification = classifyPlace({ viralScore, gemScore });
    const localScore = Math.round(gemInput.localAudienceScore);

    const center = NEIGHBORHOOD_CENTERS[seed.neighborhood];
    const coordinates = jitterCoordinates(center, `coord:${placeId}`);

    const createdAgoRand = seededRandom(`created:${placeId}`);
    const createdAt = new Date(
      NOW - randomInt(createdAgoRand, 60, 900) * DAY_MS
    ).toISOString();

    places.push({
      id: placeId,
      googlePlaceId: seed.googlePlaceId ?? `mock-${placeId}`,
      name: seed.name,
      slug,
      description: seed.description,
      coordinates,
      address: seed.address,
      neighborhood: seed.neighborhood,
      placeType: seed.placeType,
      beverageType: seed.beverageType,
      priceLevel: seed.priceLevel as PriceLevel,
      googleRating: seed.baseRating,
      googleReviewCount: seed.baseReviewCount,
      googleMapsUrl: seed.googlePlaceId
        ? `https://www.google.com/maps/place/?q=place_id:${seed.googlePlaceId}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${seed.name} ${seed.address}`
          )}`,
      primaryImage: seed.googlePhotoName ? googlePlacePhotoUrl(seed.googlePhotoName) : null,
      cuisines: seed.cuisines,
      tags: seed.tags,
      openingHours: seed.openingHours,
      viralScore,
      gemScore,
      localScore,
      audienceType: audienceTypeFromScore(localScore),
      classification,
      createdAt,
      updatedAt: new Date(NOW - randomInt(createdAgoRand, 0, 5) * DAY_MS).toISOString(),
    });
  });

  cache = { places, socialMentions: allMentions, cuisines: buildCuisines() };
  return cache;
}

export function getSeedData(): BuiltSeedData {
  return buildSeedData();
}
