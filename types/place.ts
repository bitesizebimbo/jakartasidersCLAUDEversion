import type { Coordinates } from "./geo";

export type PlaceType =
  | "restaurant"
  | "cafe"
  | "bar"
  | "street_food"
  | "bakery"
  | "dessert";

export const PLACE_TYPES: { value: PlaceType; label: string }[] = [
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Cafe" },
  { value: "bar", label: "Bar" },
  { value: "street_food", label: "Street Food" },
  { value: "bakery", label: "Bakery" },
  { value: "dessert", label: "Dessert" },
];

export type BeverageType = "alcohol" | "non_alcohol" | "both";

export const BEVERAGE_TYPES: { value: BeverageType; label: string }[] = [
  { value: "alcohol", label: "Alcohol available" },
  { value: "non_alcohol", label: "Non-alcohol focused" },
  { value: "both", label: "Both" },
];

/** 1 = $, 2 = $$, 3 = $$$, 4 = $$$$ */
export type PriceLevel = 1 | 2 | 3 | 4;

export const PRICE_LABELS: Record<PriceLevel, string> = {
  1: "$",
  2: "$$",
  3: "$$$",
  4: "$$$$",
};

export type PlaceClassification = "VIRAL" | "HIDDEN_GEM" | "WATCHLIST";

export type AudienceType = "LOCAL" | "MIXED" | "TOURIST";

export const CUISINE_SLUGS = [
  "indonesian",
  "padang",
  "javanese",
  "sundanese",
  "balinese",
  "chinese",
  "japanese",
  "korean",
  "thai",
  "vietnamese",
  "indian",
  "middle_eastern",
  "italian",
  "french",
  "western",
  "fusion",
  "dessert",
  "coffee",
] as const;

export type CuisineSlug = (typeof CUISINE_SLUGS)[number];

export interface Cuisine {
  id: string;
  name: string;
  slug: CuisineSlug;
}

export const NEIGHBORHOODS = [
  { slug: "blok-m", name: "Blok M", region: "South Jakarta" },
  { slug: "senopati", name: "Senopati", region: "South Jakarta" },
  { slug: "scbd", name: "SCBD", region: "South Jakarta" },
  { slug: "kemang", name: "Kemang", region: "South Jakarta" },
  { slug: "cipete", name: "Cipete", region: "South Jakarta" },
  { slug: "cilandak", name: "Cilandak", region: "South Jakarta" },
  { slug: "pondok-indah", name: "Pondok Indah", region: "South Jakarta" },
  { slug: "petogogan", name: "Petogogan", region: "South Jakarta" },
  { slug: "menteng", name: "Menteng", region: "Central Jakarta" },
  { slug: "cikini", name: "Cikini", region: "Central Jakarta" },
  { slug: "thamrin", name: "Thamrin", region: "Central Jakarta" },
  { slug: "tebet", name: "Tebet", region: "South Jakarta" },
  { slug: "glodok", name: "Glodok", region: "West Jakarta" },
  { slug: "kota-tua", name: "Kota Tua", region: "West Jakarta" },
  { slug: "kelapa-gading", name: "Kelapa Gading", region: "North Jakarta" },
  { slug: "pik", name: "PIK", region: "North Jakarta" },
] as const;

export type NeighborhoodSlug = (typeof NEIGHBORHOODS)[number]["slug"];

export interface Place {
  id: string;
  googlePlaceId: string | null;
  name: string;
  slug: string;
  description: string;
  coordinates: Coordinates;
  address: string;
  neighborhood: NeighborhoodSlug;
  placeType: PlaceType;
  beverageType: BeverageType;
  priceLevel: PriceLevel;
  googleRating: number;
  googleReviewCount: number;
  googleMapsUrl: string;
  primaryImage: string | null;
  cuisines: CuisineSlug[];
  tags: string[];
  openingHours: string;
  viralScore: number;
  gemScore: number;
  localScore: number;
  audienceType: AudienceType;
  classification: PlaceClassification;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceWithDistance extends Place {
  distanceKm: number | null;
  walkMinutes: number | null;
}

export interface PlaceSearchResult {
  googlePlaceId: string;
  name: string;
  coordinates: Coordinates;
  address: string;
}

export interface ExternalPlaceDetails {
  googlePlaceId: string;
  name: string;
  coordinates: Coordinates;
  address: string;
  neighborhood: string | null;
  rating: number | null;
  reviewCount: number | null;
  openingHours: string[] | null;
  googleMapsUrl: string;
  priceLevel: PriceLevel | null;
  category: string | null;
}
