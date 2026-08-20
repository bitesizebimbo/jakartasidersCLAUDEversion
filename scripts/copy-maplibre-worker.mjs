/**
 * Copies maplibre-gl's worker script into public/ so it's served from a
 * stable, same-origin URL.
 *
 * Why this is needed: MapLibre resolves its worker script URL relative to
 * `import.meta.url` inside its own module. That works when the package is
 * served as-is (e.g. a plain static file server), but Next.js's bundler
 * (Turbopack/webpack) rewrites `import.meta.url` to point at the bundled
 * chunk instead of the original node_modules file, so the computed worker
 * URL resolves to nothing — the worker script fails to load, the GeoJSON
 * clustering worker dies immediately, and no markers ever render even
 * though the map itself appears to load fine. maplibregl.setWorkerUrl()
 * (called in components/map/MapView.tsx) points MapLibre at this file
 * instead of relying on that broken auto-resolution.
 *
 * Runs automatically via the "postinstall" npm script.
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "node_modules", "maplibre-gl", "dist");
const destDir = path.join(__dirname, "..", "public");

mkdirSync(destDir, { recursive: true });

// maplibre-gl-worker.mjs imports ./maplibre-gl-shared.mjs as a sibling ES
// module — both must be served from the same directory, or the worker's
// module graph fails to resolve and the worker dies silently.
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(path.join(distDir, file), path.join(destDir, file));
  console.log(`Copied maplibre-gl asset to ${path.relative(process.cwd(), path.join(destDir, file))}`);
}
