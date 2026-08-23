import type { PlaceClassification } from "@/types/place";
import { MARKER_COLORS } from "./googleMapsConfig";

const ICON_SIZE = 40;
const CENTER = ICON_SIZE / 2;

function svgDataUrl(inner: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 ${ICON_SIZE} ${ICON_SIZE}">${inner}</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const CLASSIFICATION_INNER: Record<PlaceClassification, string> = {
  VIRAL: `
    <circle cx="${CENTER}" cy="${CENTER}" r="17" fill="${MARKER_COLORS.signal}" fill-opacity="0.16" />
    <circle cx="${CENTER}" cy="${CENTER}" r="9" fill="${MARKER_COLORS.signal}" stroke="${MARKER_COLORS.paper}" stroke-width="1.5" />
  `,
  HIDDEN_GEM: `
    <circle cx="${CENTER}" cy="${CENTER}" r="8" fill="${MARKER_COLORS.paper}" stroke="${MARKER_COLORS.ink}" stroke-width="2" />
  `,
  WATCHLIST: `
    <circle cx="${CENTER}" cy="${CENTER}" r="4" fill="${MARKER_COLORS.watchlist}" fill-opacity="0.6" />
  `,
};

export function placeMarkerIcon(classification: PlaceClassification): google.maps.Icon {
  return {
    url: svgDataUrl(CLASSIFICATION_INNER[classification]),
    scaledSize: new google.maps.Size(ICON_SIZE, ICON_SIZE),
    anchor: new google.maps.Point(CENTER, CENTER),
  };
}

export function userLocationIcon(): google.maps.Icon {
  const inner = `
    <circle cx="${CENTER}" cy="${CENTER}" r="10" fill="${MARKER_COLORS.ink}" fill-opacity="0.12" />
    <circle cx="${CENTER}" cy="${CENTER}" r="5" fill="${MARKER_COLORS.ink}" stroke="${MARKER_COLORS.paper}" stroke-width="2" />
  `;
  return {
    url: svgDataUrl(inner),
    scaledSize: new google.maps.Size(ICON_SIZE, ICON_SIZE),
    anchor: new google.maps.Point(CENTER, CENTER),
  };
}

export function clusterMarkerIcon(count: number): google.maps.Icon {
  const radius = count >= 30 ? 26 : count >= 20 ? 20 : count >= 10 ? 16 : 16;
  const size = radius * 2 + 8;
  const center = size / 2;
  const inner = `<circle cx="${center}" cy="${center}" r="${radius}" fill="${MARKER_COLORS.ink}" fill-opacity="0.88" stroke="${MARKER_COLORS.paper}" stroke-width="2" />`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${inner}</svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(center, center),
  };
}
