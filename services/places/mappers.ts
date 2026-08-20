import type {
  AudienceType,
  BeverageType,
  CuisineSlug,
  NeighborhoodSlug,
  Place,
  PlaceClassification,
  PlaceType,
  PriceLevel,
} from "@/types/place";

/** Raw shape returned by a Supabase `places` select (snake_case columns). */
export interface PlaceRow {
  id: string;
  google_place_id: string | null;
  name: string;
  slug: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  neighborhood: string;
  place_type: string;
  beverage_type: string;
  price_level: number;
  google_rating: number;
  google_review_count: number;
  google_maps_url: string;
  primary_image: string | null;
  opening_hours: string;
  tags: string[] | null;
  viral_score: number;
  gem_score: number;
  local_score: number;
  audience_type: string;
  classification: string;
  created_at: string;
  updated_at: string;
  place_cuisines?: { cuisines: { slug: string } | null }[] | null;
}

export function mapPlaceRow(row: PlaceRow): Place {
  const cuisines =
    row.place_cuisines
      ?.map((pc) => pc.cuisines?.slug)
      .filter((slug): slug is string => Boolean(slug)) ?? [];

  return {
    id: row.id,
    googlePlaceId: row.google_place_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    coordinates: { lat: row.latitude, lng: row.longitude },
    address: row.address,
    neighborhood: row.neighborhood as NeighborhoodSlug,
    placeType: row.place_type as PlaceType,
    beverageType: row.beverage_type as BeverageType,
    priceLevel: row.price_level as PriceLevel,
    googleRating: row.google_rating,
    googleReviewCount: row.google_review_count,
    googleMapsUrl: row.google_maps_url,
    primaryImage: row.primary_image,
    cuisines: cuisines as CuisineSlug[],
    tags: row.tags ?? [],
    openingHours: row.opening_hours,
    viralScore: row.viral_score,
    gemScore: row.gem_score,
    localScore: row.local_score,
    audienceType: row.audience_type as AudienceType,
    classification: row.classification as PlaceClassification,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
