-- VIRAL / GEM — core schema
-- Places, cuisines, social mentions, saved places, and collections.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- users
-- Mirrors auth.users so the rest of the schema can foreign-key against a
-- table in the public schema without exposing auth.users directly.
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------- cuisines
create table if not exists public.cuisines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

-- --------------------------------------------------------------- places
create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  google_place_id text unique,
  name text not null,
  slug text not null unique,
  description text not null default '',
  latitude double precision not null,
  longitude double precision not null,
  address text not null default '',
  neighborhood text not null,
  place_type text not null check (
    place_type in ('restaurant', 'cafe', 'bar', 'street_food', 'bakery', 'dessert')
  ),
  beverage_type text not null check (
    beverage_type in ('alcohol', 'non_alcohol', 'both')
  ),
  price_level smallint not null check (price_level between 1 and 4),
  google_rating numeric(2, 1) not null default 0,
  google_review_count integer not null default 0,
  google_maps_url text not null default '',
  primary_image text,
  opening_hours text not null default '',
  tags text[] not null default '{}',
  viral_score smallint not null default 0 check (viral_score between 0 and 100),
  gem_score smallint not null default 0 check (gem_score between 0 and 100),
  local_score smallint not null default 0 check (local_score between 0 and 100),
  audience_type text not null default 'MIXED' check (
    audience_type in ('LOCAL', 'MIXED', 'TOURIST')
  ),
  classification text not null default 'WATCHLIST' check (
    classification in ('VIRAL', 'HIDDEN_GEM', 'WATCHLIST')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists places_neighborhood_idx on public.places (neighborhood);
create index if not exists places_classification_idx on public.places (classification);
create index if not exists places_latitude_idx on public.places (latitude);
create index if not exists places_longitude_idx on public.places (longitude);
create index if not exists places_viral_score_idx on public.places (viral_score desc);
create index if not exists places_gem_score_idx on public.places (gem_score desc);

-- -------------------------------------------------------- place_cuisines
create table if not exists public.place_cuisines (
  place_id uuid not null references public.places (id) on delete cascade,
  cuisine_id uuid not null references public.cuisines (id) on delete cascade,
  primary key (place_id, cuisine_id)
);

create index if not exists place_cuisines_cuisine_idx on public.place_cuisines (cuisine_id);

-- ------------------------------------------------------- social_mentions
create table if not exists public.social_mentions (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  platform text not null check (platform in ('tiktok', 'instagram')),
  external_post_id text not null,
  post_url text not null,
  creator_name text not null default '',
  caption text not null default '',
  published_at timestamptz not null,
  view_count integer not null default 0,
  like_count integer not null default 0,
  comment_count integer not null default 0,
  share_count integer not null default 0,
  thumbnail_url text,
  created_at timestamptz not null default now(),
  unique (platform, external_post_id)
);

create index if not exists social_mentions_place_published_idx
  on public.social_mentions (place_id, published_at desc);

-- ----------------------------------------------------------- saved_places
create table if not exists public.saved_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  place_id uuid not null references public.places (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, place_id)
);

create index if not exists saved_places_user_idx on public.saved_places (user_id);

-- ------------------------------------------------------------ collections
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists collections_user_idx on public.collections (user_id);

-- ------------------------------------------------------- collection_places
create table if not exists public.collection_places (
  collection_id uuid not null references public.collections (id) on delete cascade,
  place_id uuid not null references public.places (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (collection_id, place_id)
);

create index if not exists collection_places_place_idx on public.collection_places (place_id);
