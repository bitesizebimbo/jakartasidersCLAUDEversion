-- Row Level Security: public read on the discovery catalog, private
-- read/write on everything user-owned.

alter table public.users enable row level security;
alter table public.places enable row level security;
alter table public.cuisines enable row level security;
alter table public.place_cuisines enable row level security;
alter table public.social_mentions enable row level security;
alter table public.saved_places enable row level security;
alter table public.collections enable row level security;
alter table public.collection_places enable row level security;

-- users: everyone can read public profile fields, but only the owner may
-- update their own row. Rows are created only by the auth trigger.
create policy "users_select_all" on public.users
  for select using (true);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- places / cuisines / place_cuisines / social_mentions: public, read-only
-- discovery catalog. Writes happen via the service role (ingestion jobs),
-- never directly from client roles.
create policy "places_select_all" on public.places
  for select using (true);

create policy "cuisines_select_all" on public.cuisines
  for select using (true);

create policy "place_cuisines_select_all" on public.place_cuisines
  for select using (true);

create policy "social_mentions_select_all" on public.social_mentions
  for select using (true);

-- saved_places: fully owner-scoped.
create policy "saved_places_select_own" on public.saved_places
  for select using (auth.uid() = user_id);

create policy "saved_places_insert_own" on public.saved_places
  for insert with check (auth.uid() = user_id);

create policy "saved_places_delete_own" on public.saved_places
  for delete using (auth.uid() = user_id);

-- collections: fully owner-scoped.
create policy "collections_select_own" on public.collections
  for select using (auth.uid() = user_id);

create policy "collections_insert_own" on public.collections
  for insert with check (auth.uid() = user_id);

create policy "collections_update_own" on public.collections
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "collections_delete_own" on public.collections
  for delete using (auth.uid() = user_id);

-- collection_places: scoped through ownership of the parent collection.
create policy "collection_places_select_own" on public.collection_places
  for select using (
    exists (
      select 1 from public.collections c
      where c.id = collection_places.collection_id
        and c.user_id = auth.uid()
    )
  );

create policy "collection_places_insert_own" on public.collection_places
  for insert with check (
    exists (
      select 1 from public.collections c
      where c.id = collection_places.collection_id
        and c.user_id = auth.uid()
    )
  );

create policy "collection_places_delete_own" on public.collection_places
  for delete using (
    exists (
      select 1 from public.collections c
      where c.id = collection_places.collection_id
        and c.user_id = auth.uid()
    )
  );
