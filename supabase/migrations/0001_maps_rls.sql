alter table public.maps enable row level security;

drop policy if exists "maps_select_own" on public.maps;
drop policy if exists "maps_insert_own" on public.maps;
drop policy if exists "maps_update_own" on public.maps;
drop policy if exists "maps_delete_own" on public.maps;

create policy "maps_select_own"
on public.maps
for select
to authenticated
using (user_id = auth.uid());

create policy "maps_insert_own"
on public.maps
for insert
to authenticated
with check (user_id = auth.uid());

create policy "maps_update_own"
on public.maps
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "maps_delete_own"
on public.maps
for delete
to authenticated
using (user_id = auth.uid());
