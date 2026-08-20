import type { StyleSpecification } from "maplibre-gl";

/**
 * Free, keyless raster basemap (CARTO Positron, built on OpenStreetMap
 * data). No API token or signup required — the interactive map works out
 * of the box in any environment. Swap this for a Mapbox/MapTiler vector
 * style later if a token becomes available; nothing else needs to change.
 */
export const MAP_STYLE: StyleSpecification = {
  version: 8,
  glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
  sources: {
    basemap: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        "https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
      maxzoom: 20,
    },
  },
  layers: [
    {
      id: "basemap",
      type: "raster",
      source: "basemap",
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

export const CLUSTER_RADIUS = 50;
export const CLUSTER_MAX_ZOOM = 15;
