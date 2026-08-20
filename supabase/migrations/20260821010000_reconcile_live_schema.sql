-- Reconcile the live Softbare schema with the public arena/vault application.
-- Additive and safe: no rows are deleted and no demo content is inserted.

alter table public.users
  add column if not exists total_votes integer not null default 0;

-- The public arena needs a stable, typed RPC result. The original function
-- returned only four columns and had an integer/numeric mismatch in production.
drop function if exists public.get_tension_contenders();

create function public.get_tension_contenders()
returns table (
  id uuid,
  image_url text,
  actor_id uuid,
  elo_rating numeric,
  total_wins integer,
  total_battles integer,
  actors jsonb
)
language sql
stable
set search_path = public, extensions
as $$
  with seed as (
    select l.*
    from public.looks l
    order by random()
    limit 1
  ),
  partner as (
    select l.*
    from public.looks l
    cross join seed s
    where l.id <> s.id
    order by abs(l.elo_rating::numeric - s.elo_rating::numeric), random()
    limit 1
  )
  select
    x.id,
    x.image_url,
    x.actor_id,
    x.elo_rating::numeric,
    x.total_wins,
    x.total_battles,
    jsonb_build_object('name', a.name)
  from (
    select * from seed
    union all
    select * from partner
  ) x
  join public.actors a on a.id = x.actor_id;
$$;

grant execute on function public.get_tension_contenders() to anon, authenticated;

-- Public profile pages and the authenticated header need to resolve usernames.
drop policy if exists users_select_public on public.users;
create policy users_select_public
  on public.users for select
  to anon, authenticated
  using (true);

drop policy if exists users_update_own on public.users;
create policy users_update_own
  on public.users for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Keep profile creation trigger-safe and remove accidental public RPC access.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  base_name text;
  candidate text;
  suffix integer := 0;
begin
  base_name := lower(regexp_replace(
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'voter'),
    '[^a-z0-9]+', '-', 'g'
  ));
  base_name := trim(both '-' from base_name);
  if base_name = '' then base_name := 'voter'; end if;
  candidate := base_name;
  while exists (select 1 from public.users where username = candidate) loop
    suffix := suffix + 1;
    candidate := base_name || '-' || suffix::text;
  end loop;

  insert into public.users (id, username)
  values (new.id, candidate)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.enforce_vault_limit()
returns trigger
language plpgsql
set search_path = public, extensions
as $$
declare
  cap integer;
  used integer;
begin
  select vault_limit into cap from public.users where id = new.user_id;
  if cap is null then raise exception 'Profile missing for vault insert'; end if;
  select count(*) into used from public.vaults where user_id = new.user_id;
  if used >= cap then raise exception 'Vault limit reached'; end if;
  return new;
end;
$$;

-- The vote trigger must update ratings/counters atomically despite RLS on the
-- public tables. Direct RPC execution is revoked below; only the vote trigger
-- can invoke this function.
create or replace function public.update_elo_ratings()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  k_factor numeric := 32;
  winner_current_elo numeric;
  loser_current_elo numeric;
  expected_winner numeric;
begin
  select elo_rating into winner_current_elo
  from public.looks where id = new.winner_look_id for update;
  select elo_rating into loser_current_elo
  from public.looks where id = new.loser_look_id for update;

  expected_winner := 1 / (1 + power(10, (loser_current_elo - winner_current_elo) / 400.0));

  update public.looks
  set elo_rating = winner_current_elo + k_factor * (1 - expected_winner),
      total_battles = total_battles + 1,
      total_wins = total_wins + 1
  where id = new.winner_look_id;

  update public.looks
  set elo_rating = loser_current_elo + k_factor * (0 - (1 - expected_winner)),
      total_battles = total_battles + 1
  where id = new.loser_look_id;

  update public.users
  set total_votes = total_votes + 1
  where id = new.user_id;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.enforce_vault_limit() from public, anon, authenticated;
revoke execute on function public.update_elo_ratings() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
