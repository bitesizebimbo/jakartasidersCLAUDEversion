/**
 * Builds a same-origin URL for a Google Places photo resource name (e.g.
 * "places/{id}/photos/{photoId}"), proxied through app/api/places/photo
 * so the Google Places API key never reaches the client.
 */
export function googlePlacePhotoUrl(photoName: string, maxWidthPx = 800): string {
  const params = new URLSearchParams({ name: photoName, maxWidthPx: String(maxWidthPx) });
  return `/api/places/photo?${params.toString()}`;
}
