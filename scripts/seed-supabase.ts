/**
 * Pushes the deterministic seed dataset (data/seed) into a real Supabase
 * project. Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (the
 * service role key bypasses RLS, so it must only ever be used server-side
 * / from a trusted script like this one — never in client code).
 *
 * Usage: npm run db:seed
 */
import { createClient } from "@supabase/supabase-js";
import { seedPlaces } from "../data/seed/places";
import { seedSocialMentions } from "../data/seed/socialMentions";
import { seedCuisines } from "../data/seed/cuisines";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in your environment before running db:seed."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

async function main() {
  console.log(`Seeding ${seedCuisines.length} cuisines...`);
  const { error: cuisineError } = await supabase
    .from("cuisines")
    .upsert(
      seedCuisines.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
      { onConflict: "slug" }
    );
  if (cuisineError) throw cuisineError;

  const { data: cuisineRows, error: cuisineFetchError } = await supabase
    .from("cuisines")
    .select("id, slug");
  if (cuisineFetchError) throw cuisineFetchError;
  const cuisineIdBySlug = new Map((cuisineRows ?? []).map((c) => [c.slug, c.id]));

  console.log(`Seeding ${seedPlaces.length} places...`);
  const { error: placesError } = await supabase.from("places").upsert(
    seedPlaces.map((p) => ({
      id: p.id,
      google_place_id: p.googlePlaceId,
      name: p.name,
      slug: p.slug,
      description: p.description,
      latitude: p.coordinates.lat,
      longitude: p.coordinates.lng,
      address: p.address,
      neighborhood: p.neighborhood,
      place_type: p.placeType,
      beverage_type: p.beverageType,
      price_level: p.priceLevel,
      google_rating: p.googleRating,
      google_review_count: p.googleReviewCount,
      google_maps_url: p.googleMapsUrl,
      primary_image: p.primaryImage,
      opening_hours: p.openingHours,
      tags: p.tags,
      viral_score: p.viralScore,
      gem_score: p.gemScore,
      local_score: p.localScore,
      audience_type: p.audienceType,
      classification: p.classification,
    })),
    { onConflict: "slug" }
  );
  if (placesError) throw placesError;

  console.log("Linking place cuisines...");
  const placeCuisineRows = seedPlaces.flatMap((p) =>
    p.cuisines
      .map((slug) => cuisineIdBySlug.get(slug))
      .filter((id): id is string => Boolean(id))
      .map((cuisineId) => ({ place_id: p.id, cuisine_id: cuisineId }))
  );
  const { error: linkError } = await supabase
    .from("place_cuisines")
    .upsert(placeCuisineRows, { onConflict: "place_id,cuisine_id" });
  if (linkError) throw linkError;

  console.log(`Seeding ${seedSocialMentions.length} social mentions...`);
  const { error: mentionsError } = await supabase.from("social_mentions").upsert(
    seedSocialMentions.map((m) => ({
      id: m.id,
      place_id: m.placeId,
      platform: m.platform,
      external_post_id: m.externalPostId,
      post_url: m.postUrl,
      creator_name: m.creatorHandle,
      caption: m.caption,
      published_at: m.publishedAt,
      view_count: m.viewCount,
      like_count: m.likeCount,
      comment_count: m.commentCount,
      share_count: m.shareCount,
      thumbnail_url: m.thumbnailUrl,
    })),
    { onConflict: "platform,external_post_id" }
  );
  if (mentionsError) throw mentionsError;

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
