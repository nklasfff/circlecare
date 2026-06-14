-- CircleCare — initial schema
-- Familier, medlemmer+roller, opgaver, kalender-begivenheder,
-- kommunikations-spor + emne-tråde, samt RLS og dæknings-view.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type relation_t      as enum ('son','daughter','father','mother','grandchild');
create type role_t          as enum ('coordinator','food','doctor','transport');
create type task_status_t   as enum ('todo','doing','done');
create type task_cat_t      as enum ('medicine','food','transport','appointment','other');
create type event_cat_t     as enum ('visit','medical','meal','transport','other');
create type track_kind_t    as enum ('siblings','with_parent','with_grandchildren');
create type thread_status_t as enum ('open','resolved');

-- ---------------------------------------------------------------------------
-- Tabeller
-- ---------------------------------------------------------------------------
create table families (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);

create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_color text,
  created_at   timestamptz not null default now()
);

create table memberships (
  id                uuid primary key default gen_random_uuid(),
  family_id         uuid not null references families(id) on delete cascade,
  profile_id        uuid references profiles(id) on delete set null, -- NULL = intet login endnu
  label             text,        -- visningsnavn for medlemmer uden login (far/mor/børnebørn)
  relation          relation_t not null,
  is_care_recipient boolean not null default false,
  created_at        timestamptz not null default now(),
  unique (family_id, profile_id)
);
create index on memberships (family_id);
create index on memberships (profile_id);

create table member_roles (
  membership_id uuid not null references memberships(id) on delete cascade,
  role          role_t not null,
  primary key (membership_id, role)
);

create table tasks (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references families(id) on delete cascade,
  title       text not null,
  notes       text,
  assigned_to uuid references memberships(id) on delete set null,  -- ansvarlig
  status      task_status_t not null default 'todo',
  due_at      timestamptz,
  category    task_cat_t not null default 'other',
  recurrence  jsonb,                                               -- gentagelse
  created_by  uuid references memberships(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index on tasks (family_id, due_at);

create table events (
  id         uuid primary key default gen_random_uuid(),
  family_id  uuid not null references families(id) on delete cascade,
  title      text not null,
  location   text,
  starts_at  timestamptz not null,
  ends_at    timestamptz,
  covered_by uuid references memberships(id) on delete set null,   -- hvem dækker
  category   event_cat_t not null default 'other',
  notes      text,
  created_at timestamptz not null default now()
);
create index on events (family_id, starts_at);

create table tracks (
  id        uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  kind      track_kind_t not null,
  name      text not null,
  unique (family_id, kind)
);

create table track_members (
  track_id      uuid not null references tracks(id) on delete cascade,
  membership_id uuid not null references memberships(id) on delete cascade,
  primary key (track_id, membership_id)
);

create table threads (
  id               uuid primary key default gen_random_uuid(),
  track_id         uuid not null references tracks(id) on delete cascade,
  title            text not null,                       -- emnet
  status           thread_status_t not null default 'open',
  created_by       uuid references memberships(id) on delete set null,
  created_at       timestamptz not null default now(),
  last_activity_at timestamptz not null default now()
);
create index on threads (track_id, last_activity_at desc);

create table messages (
  id         uuid primary key default gen_random_uuid(),
  thread_id  uuid not null references threads(id) on delete cascade,
  author     uuid references memberships(id) on delete set null,
  body       text not null,
  created_at timestamptz not null default now()
);
create index on messages (thread_id, created_at);

-- ---------------------------------------------------------------------------
-- Dæknings-view: opgaver + begivenheder samlet. Driver "er det dækket?".
-- ---------------------------------------------------------------------------
create view v_coverage
with (security_invoker = true)
as
  select family_id, 'task'::text as kind, id, title, category::text,
         due_at as at, assigned_to as responsible,
         (assigned_to is null) as uncovered, status::text as status
  from tasks
  union all
  select family_id, 'event'::text, id, title, category::text,
         starts_at, covered_by,
         (covered_by is null), null::text
  from events;

-- ---------------------------------------------------------------------------
-- Helper-funktioner (SECURITY DEFINER for at undgå RLS-rekursion)
-- ---------------------------------------------------------------------------
create or replace function public.is_family_member(p_family uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from memberships m
    where m.family_id = p_family and m.profile_id = auth.uid()
  );
$$;

create or replace function public.shares_family(p_profile uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from memberships me
    join memberships them on them.family_id = me.family_id
    where me.profile_id = auth.uid() and them.profile_id = p_profile
  );
$$;

create or replace function public.is_track_member(p_track uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from track_members tm
    join memberships m on m.id = tm.membership_id
    where tm.track_id = p_track and m.profile_id = auth.uid()
  );
$$;

create or replace function public.is_thread_member(p_thread uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from threads t
    join track_members tm on tm.track_id = t.track_id
    join memberships m on m.id = tm.membership_id
    where t.id = p_thread and m.profile_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
-- Opret profil automatisk når en bruger registreres.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Hold tasks.updated_at opdateret.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger tasks_touch
  before update on tasks
  for each row execute function public.touch_updated_at();

-- Bump thread-aktivitet ved ny besked (sortering i tråd-listen).
create or replace function public.bump_thread_activity()
returns trigger language plpgsql as $$
begin
  update threads set last_activity_at = now() where id = new.thread_id;
  return new;
end;
$$;
create trigger messages_bump
  after insert on messages
  for each row execute function public.bump_thread_activity();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table families     enable row level security;
alter table profiles     enable row level security;
alter table memberships  enable row level security;
alter table member_roles enable row level security;
alter table tasks        enable row level security;
alter table events       enable row level security;
alter table tracks       enable row level security;
alter table track_members enable row level security;
alter table threads      enable row level security;
alter table messages     enable row level security;

-- families: medlemmer kan se deres familie.
create policy families_select on families
  for select using (public.is_family_member(id));

-- profiles: egen + dem man deler familie med.
create policy profiles_select on profiles
  for select using (id = auth.uid() or public.shares_family(id));
create policy profiles_update on profiles
  for update using (id = auth.uid());
create policy profiles_insert on profiles
  for insert with check (id = auth.uid());

-- memberships + roller: synlige for familiemedlemmer.
create policy memberships_select on memberships
  for select using (public.is_family_member(family_id));
create policy member_roles_select on member_roles
  for select using (exists (
    select 1 from memberships m
    where m.id = member_roles.membership_id and public.is_family_member(m.family_id)
  ));

-- tasks: fuld adgang for familiemedlemmer.
create policy tasks_all on tasks
  for all using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

-- events: fuld adgang for familiemedlemmer.
create policy events_all on events
  for all using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

-- tracks: synlige for familiemedlemmer.
create policy tracks_select on tracks
  for select using (public.is_family_member(family_id));
create policy track_members_select on track_members
  for select using (exists (
    select 1 from tracks t
    where t.id = track_members.track_id and public.is_family_member(t.family_id)
  ));

-- threads: kun spor-deltagere.
create policy threads_select on threads
  for select using (public.is_track_member(track_id));
create policy threads_insert on threads
  for insert with check (public.is_track_member(track_id));
create policy threads_update on threads
  for update using (public.is_track_member(track_id));

-- messages: læs hvis spor-deltager; skriv kun som sig selv.
create policy messages_select on messages
  for select using (public.is_thread_member(thread_id));
create policy messages_insert on messages
  for insert with check (
    public.is_thread_member(thread_id)
    and author in (
      select m.id from memberships m where m.profile_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Realtime: udsend ændringer på de tabeller dækningsbilledet og chat lytter på.
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table threads;
