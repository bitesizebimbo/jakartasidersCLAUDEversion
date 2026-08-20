/**
 * Looks up each seed place against the real Google Places API (New) and
 * writes a REVIEW REPORT — it never modifies data/seed files itself.
 *
 * This app's seed dataset is synthetic (see data/seed/placeSeeds.ts):
 * realistic-sounding names, fabricated ratings/reviews/scores. Some names
 * may coincidentally resemble real Jakarta venues, but none are verified.
 * Blindly auto-attaching a fuzzy-matched real business's real Google
 * photos/identity to a fabricated record would misattribute that
 * business's imagery to invented data — so every match here needs a
 * human to actually look at it before it's used.
 *
 * Usage:
 *   1. Set GOOGLE_PLACES_API_KEY in .env.local (or your shell env).
 *   2. npm run google:lookup
 *   3. Review google-place-matches.json (git-ignored). For any match
 *      you've personally verified is correct, add its googlePlaceId /
 *      googlePhotoName to that entry in data/seed/placeSeeds.ts by hand.
 */
import { writeFileSync } from "node:fs";
import { placeSeeds } from "../data/seed/placeSeeds";
import { NEIGHBORHOODS } from "../types/place";

try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local present — fall back to whatever is already in process.env.
}

const apiKey = process.env.GOOGLE_PLACES_API_KEY;
if (!apiKey) {
  console.error(
    "Missing GOOGLE_PLACES_API_KEY. Set it in .env.local or your shell environment before running this script."
  );
  process.exit(1);
}

const neighborhoodName = (slug: string) =>
  NEIGHBORHOODS.find((n) => n.slug === slug)?.name ?? slug;

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Crude token-overlap heuristic — a starting point for triage, not a verdict. */
function nameSimilarity(a: string, b: string): number {
  const tokensA = new Set(normalize(a));
  const tokensB = new Set(normalize(b));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let overlap = 0;
  for (const t of tokensA) if (tokensB.has(t)) overlap++;
  return overlap / Math.max(tokensA.size, tokensB.size);
}

function confidenceLabel(score: number): "HIGH" | "MEDIUM" | "LOW" {
  if (score >= 0.7) return "HIGH";
  if (score >= 0.35) return "MEDIUM";
  return "LOW";
}

interface SearchCandidate {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
}

interface DetailsResult {
  photos?: Array<{ name: string }>;
}

async function searchTopCandidate(query: string): Promise<SearchCandidate | null> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey!,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount",
    },
    body: JSON.stringify({ textQuery: query, languageCode: "en" }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { places?: SearchCandidate[] };
  return json.places?.[0] ?? null;
}

async function fetchFirstPhotoName(placeId: string): Promise<string | null> {
  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: { "X-Goog-Api-Key": apiKey!, "X-Goog-FieldMask": "photos" },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as DetailsResult;
  return json.photos?.[0]?.name ?? null;
}

interface MatchReport {
  seedSlugHint: string;
  seedName: string;
  neighborhood: string;
  query: string;
  matchName: string | null;
  matchAddress: string | null;
  matchGooglePlaceId: string | null;
  matchRating: number | null;
  matchReviewCount: number | null;
  matchPhotoName: string | null;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "NO_MATCH";
  similarity: number;
}

async function main() {
  const results: MatchReport[] = [];

  for (const seed of placeSeeds) {
    const query = `${seed.name}, ${neighborhoodName(seed.neighborhood)}, Jakarta, Indonesia`;
    process.stdout.write(`Looking up: ${seed.name}... `);

    const candidate = await searchTopCandidate(query);

    if (!candidate) {
      console.log("no match");
      results.push({
        seedSlugHint: seed.name,
        seedName: seed.name,
        neighborhood: seed.neighborhood,
        query,
        matchName: null,
        matchAddress: null,
        matchGooglePlaceId: null,
        matchRating: null,
        matchReviewCount: null,
        matchPhotoName: null,
        confidence: "NO_MATCH",
        similarity: 0,
      });
      continue;
    }

    const candidateName = candidate.displayName?.text ?? "";
    const similarity = nameSimilarity(seed.name, candidateName);
    const photoName = await fetchFirstPhotoName(candidate.id);

    console.log(`${confidenceLabel(similarity)} — "${candidateName}"`);

    results.push({
      seedSlugHint: seed.name,
      seedName: seed.name,
      neighborhood: seed.neighborhood,
      query,
      matchName: candidateName,
      matchAddress: candidate.formattedAddress ?? null,
      matchGooglePlaceId: candidate.id,
      matchRating: candidate.rating ?? null,
      matchReviewCount: candidate.userRatingCount ?? null,
      matchPhotoName: photoName,
      confidence: confidenceLabel(similarity),
      similarity,
    });

    // Be polite to the API rather than firing 50+ requests instantly.
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  const outPath = "google-place-matches.json";
  writeFileSync(outPath, JSON.stringify(results, null, 2));

  const high = results.filter((r) => r.confidence === "HIGH").length;
  const medium = results.filter((r) => r.confidence === "MEDIUM").length;
  const low = results.filter((r) => r.confidence === "LOW").length;
  const none = results.filter((r) => r.confidence === "NO_MATCH").length;

  console.log(`\nWrote ${results.length} results to ${outPath}`);
  console.log(`HIGH: ${high}  MEDIUM: ${medium}  LOW: ${low}  NO_MATCH: ${none}`);
  console.log(
    "\nReview every match yourself before using it — this is a starting point, not a verdict. " +
      "For each place you've personally confirmed, copy its googlePlaceId (matchGooglePlaceId) " +
      "and googlePhotoName (matchPhotoName) into that entry in data/seed/placeSeeds.ts."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
