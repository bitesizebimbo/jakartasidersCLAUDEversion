# VIRAL / GEM — Jakarta Food Discovery

Discover what Jakarta is talking about, and what it hasn't discovered yet.

A mobile-first, map-first discovery product for Jakarta restaurants, cafes, bars, bakeries, and
street food — built around one core distinction: **VIRAL ≠ GOOD**, and **HIDDEN GEM ≠
UNPOPULAR**. Every place is scored independently for social momentum (Viral Score) and quality +
local love + low exposure (Gem Score), and classified accordingly.

Jakarta only for V1.

## Stack

- **Next.js 16** (App Router, Turbopack, React 19)
- **TypeScript**, strict mode
- **Tailwind CSS v4**
- **Supabase** (Postgres, Auth, RLS) — optional, the app runs fully on seed data without it
- **Mapbox GL JS** — optional, falls back to a neighborhood-grouped list without a token
- **Zod** for input validation
- **TanStack Query** for client data fetching/caching
- **Lucide** icons

## Architecture

```
app/            Routes (App Router). Server Components fetch via services/ directly;
                Client Components fetch via app/api/* route handlers.
components/     UI, grouped by domain (map, places, filters, social, saved, navigation, auth, ui).
lib/            Framework-agnostic logic: scoring, geo, Supabase clients, analytics, utils.
services/       Provider abstractions — places, social, google, recommendations.
                Every external integration sits behind an interface with a mock implementation,
                so the app never breaks when a credential is missing.
types/          Shared domain types (Place, SocialMention, Filters, Scoring inputs, ...).
data/seed/      Deterministic seed dataset — 54 real-feeling Jakarta venues, generated from
                weighted "archetypes" and run through the same scoring engine used in production.
supabase/       SQL migrations (schema, RLS, triggers).
scripts/        One-off scripts (Supabase seeding).
```

Key principle: **scoring logic never lives in a component.** `lib/scoring` is pure, typed,
UI-independent, and covers three concerns:

- `viralScore.ts` — 40% mention velocity, 25% engagement, 20% recency, 15% Google review velocity
- `gemScore.ts` — 30% quality, 25% local audience, 20% low social saturation, 15% sentiment, 10% uniqueness
- `classifier.ts` — turns the two scores into `VIRAL` / `HIDDEN_GEM` / `WATCHLIST`, with
  configurable thresholds (`lib/scoring/weights.ts`)

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in whatever you have — everything is optional, see below
npm run dev
```

Open http://localhost:3000. With no environment variables set at all, the app is fully usable:
map falls back to a list view, places/search/filters/explore run on the seed dataset, and
saving/sign-in show a clear "not configured yet" state instead of breaking.

### Scripts

| Command            | What it does                                              |
| ------------------- | ---------------------------------------------------------- |
| `npm run dev`       | Start the dev server (Turbopack)                           |
| `npm run build`     | Production build                                           |
| `npm run start`     | Run the production build                                   |
| `npm run lint`      | ESLint                                                      |
| `npm run typecheck` | `tsc --noEmit`                                              |
| `npm run db:seed`   | Push `data/seed` into a real Supabase project               |

## Environment variables

See `.env.example` for the full list. Nothing is required to run the app — each integration
degrades gracefully when its variables are missing:

| Feature | Env vars | Without it |
| --- | --- | --- |
| Interactive map | `NEXT_PUBLIC_MAPBOX_TOKEN` | Falls back to a neighborhood-grouped list view |
| Sign-in / saved / collections | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Save/collections show a "not configured" state; browsing still works |
| Place catalog persistence | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (seeding only) | Reads/writes use the in-memory seed dataset (`services/places/MockPlaceRepository`) |
| Google Places enrichment | `GOOGLE_PLACES_API_KEY` | `services/google` falls back to a seed-backed mock provider |
| Social/TikTok intelligence | _(none yet)_ | Always uses `MockSocialTrendProvider`, seeded from `data/seed/socialMentions.ts` — see below |

## Supabase setup (optional)

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the project URL and anon key into `NEXT_PUBLIC_SUPABASE_URL` /
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Copy the service role key into
   `SUPABASE_SERVICE_ROLE_KEY` (and `SUPABASE_URL`) — **never** expose the service role key to
   the client.
3. Run the migrations in `supabase/migrations/` in order, either via the Supabase SQL editor or
   the Supabase CLI:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
   This creates `users`, `places`, `cuisines`, `place_cuisines`, `social_mentions`,
   `saved_places`, `collections`, `collection_places`, all foreign keys/indexes, and Row Level
   Security policies (public read on the discovery catalog; owner-only read/write on saved
   places and collections).
4. Seed the catalog from the deterministic seed dataset:
   ```bash
   npm run db:seed
   ```
5. **Google OAuth**: in the Supabase dashboard, go to Authentication → Providers → Google, and
   add your Google OAuth client ID/secret (from the Google Cloud Console — set the authorized
   redirect URI to `https://<your-project-ref>.supabase.co/auth/v2/callback`). The app's own
   callback route (`app/auth/callback/route.ts`) exchanges the resulting code for a session.

Once configured, `services/places` automatically switches from the mock repository to
`SupabasePlaceRepository` — no code changes needed.

## Map provider setup (optional)

Create a Mapbox account, generate a public access token, and set `NEXT_PUBLIC_MAPBOX_TOKEN`.
The token is safe to expose to the client (restrict it by URL in the Mapbox dashboard for
production). Marker clustering uses Mapbox's native GeoJSON clustering rather than per-marker
React components, so panning/zooming stays cheap even with hundreds of points.

## Google Places setup (optional)

`services/google/GooglePlacesProvider.ts` implements the `PlacesProvider` interface against the
Places API (New). Enable the Places API in Google Cloud Console, create a server-side API key,
and set `GOOGLE_PLACES_API_KEY`. This is used for future place lookup/enrichment flows — the
app's own catalog (map, search, filters, explore) is served by `services/places`, not this
provider.

## Social / TikTok intelligence (mock mode)

There is currently no compliant, ToS-safe real-time TikTok data source wired up, and the app
deliberately does not scrape. `services/social/SocialTrendProvider.ts` defines the interface
(`searchPlaceMentions`, `getRecentMentions`, `getMentionVelocity`, `getTrendingPlaces`,
`getTikTokPulse`); `MockSocialTrendProvider` implements it against a deterministically generated
set of realistic-looking mentions (`data/seed/socialMentions.ts`), which is also what feeds the
Viral Score inputs at seed time — so the "TikTok Pulse" panel and the Viral Score always agree.

To add a real provider later: implement `SocialTrendProvider`, wire it up in
`services/social/index.ts` behind an env var check (mirroring how `services/google` gates the
live Google Places provider), and nothing else in the app needs to change. Every call site
handles the `SocialDataResult<T>` "unavailable" case already — a failed/unconfigured provider
never renders as "0 posts."

## Design system

Monochrome, editorial, technical — inspired by the visual restraint of the Nothing brand,
without reusing any of its assets. Black/white/off-white/grey, one restrained accent color
(`--color-signal`) reserved for viral/trend signals only, Geist Sans for UI text, Geist Mono for
every score/metric/timestamp. See `app/globals.css` for the token set.

## What's intentionally out of scope for V1

- Multi-city support (Jakarta only)
- In-app turn-by-turn navigation (directions open in Google Maps)
- Real TikTok/social scraping (mock provider, real-adapter-ready)
- Admin/CMS tooling for managing the place catalog
