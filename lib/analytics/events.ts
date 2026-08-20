export type AnalyticsEventName =
  | "map_place_opened"
  | "place_saved"
  | "place_unsaved"
  | "directions_clicked"
  | "search_performed"
  | "filter_changed"
  | "neighborhood_selected"
  | "collection_created"
  | "collection_place_added"
  | "social_post_clicked"
  | "location_enabled";

export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;
