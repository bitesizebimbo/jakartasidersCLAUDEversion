import { z } from "zod";
import { CUISINE_SLUGS } from "@/types/place";

export const placeQuerySchema = z.object({
  north: z.coerce.number().min(-90).max(90).optional(),
  south: z.coerce.number().min(-90).max(90).optional(),
  east: z.coerce.number().min(-180).max(180).optional(),
  west: z.coerce.number().min(-180).max(180).optional(),
  status: z.enum(["ALL", "VIRAL", "HIDDEN_GEM"]).optional(),
  placeTypes: z.string().optional(),
  beverage: z.enum(["alcohol", "non_alcohol", "both"]).optional(),
  cuisines: z.string().optional(),
  priceLevels: z.string().optional(),
  audience: z.enum(["MOSTLY_LOCAL", "MIXED", "MOSTLY_TOURIST"]).optional(),
  distanceKm: z.coerce.number().positive().optional(),
  neighborhood: z.string().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(120),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

export const cuisineSlugSchema = z.enum(CUISINE_SLUGS);

export const collectionNameSchema = z
  .string()
  .trim()
  .min(1, "Collection name is required")
  .max(60, "Keep it under 60 characters");

export const createCollectionSchema = z.object({
  name: collectionNameSchema,
});

export const renameCollectionSchema = z.object({
  id: z.string().uuid(),
  name: collectionNameSchema,
});

export const collectionPlaceSchema = z.object({
  collectionId: z.string().uuid(),
  placeId: z.string().uuid(),
});

export const savePlaceSchema = z.object({
  placeId: z.string().uuid(),
});
