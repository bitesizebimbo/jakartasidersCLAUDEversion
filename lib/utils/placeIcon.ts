import {
  Beer,
  Cake,
  Coffee,
  IceCreamCone,
  type LucideIcon,
  Soup,
  UtensilsCrossed,
} from "lucide-react";
import type { PlaceType } from "@/types/place";

export const PLACE_TYPE_ICON: Record<PlaceType, LucideIcon> = {
  restaurant: UtensilsCrossed,
  cafe: Coffee,
  bar: Beer,
  street_food: Soup,
  bakery: Cake,
  dessert: IceCreamCone,
};
