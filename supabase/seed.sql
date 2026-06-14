-- CircleCare — demo-seed: familien Hansen.
-- Kører ved `supabase db reset`. Alle medlemmer oprettes uden login
-- (profile_id NULL, navn via label). Søskende kobler deres magic-link-login
-- til deres plads med funktionen claim_demo_seat() længere nede.

insert into families (id, name) values
  ('11111111-1111-1111-1111-111111111111', 'Familien Hansen');

-- Medlemmer (label = visningsnavn indtil et login kobles på)
insert into memberships (id, family_id, label, relation, is_care_recipient) values
  ('a0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Far (Jens)', 'father', true),
  ('a0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Mor (Inge)', 'mother', true),
  ('a0000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Peter', 'son', false),
  ('a0000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Maria', 'daughter', false),
  ('a0000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Anne', 'daughter', false),
  ('a0000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'Lars', 'son', false),
  ('a0000000-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'Lucas', 'grandchild', false);

-- Roller
insert into member_roles (membership_id, role) values
  ('a0000000-0000-0000-0000-000000000003', 'coordinator'),
  ('a0000000-0000-0000-0000-000000000004', 'food'),
  ('a0000000-0000-0000-0000-000000000005', 'doctor'),
  ('a0000000-0000-0000-0000-000000000006', 'transport');

-- Opgaver i indeværende uge (mandag = date_trunc('week', current_date))
insert into tasks (family_id, title, assigned_to, status, due_at, category) values
  ('11111111-1111-1111-1111-111111111111', 'Tag blodtryksmedicin',
     'a0000000-0000-0000-0000-000000000001', 'todo',
     (current_date + time '18:00'), 'medicine'),
  ('11111111-1111-1111-1111-111111111111', 'Køb medicin på apoteket',
     null, 'todo',
     (date_trunc('week', current_date) + interval '2 day' + time '11:00'), 'other'),
  ('11111111-1111-1111-1111-111111111111', 'Lav mad til ugen',
     'a0000000-0000-0000-0000-000000000004', 'todo',
     (date_trunc('week', current_date) + interval '6 day' + time '12:00'), 'food'),
  ('11111111-1111-1111-1111-111111111111', 'Kør far til lægen',
     'a0000000-0000-0000-0000-000000000006', 'todo',
     (date_trunc('week', current_date) + interval '4 day' + time '09:45'), 'transport');

-- Kalender-begivenheder i indeværende uge
insert into events (family_id, title, location, starts_at, covered_by, category) values
  ('11111111-1111-1111-1111-111111111111', 'Maria kommer forbi', 'Hjemme',
     (current_date + time '14:30'),
     'a0000000-0000-0000-0000-000000000004', 'visit'),
  ('11111111-1111-1111-1111-111111111111', 'Peter kommer forbi – gåtur', 'Parken',
     (date_trunc('week', current_date) + interval '1 day' + time '15:00'),
     'a0000000-0000-0000-0000-000000000003', 'visit'),
  ('11111111-1111-1111-1111-111111111111', 'Lægebesøg – Dr. Jensen', 'Lægehuset',
     (date_trunc('week', current_date) + interval '4 day' + time '10:00'),
     null, 'medical');

-- Kommunikations-spor + deltagere
insert into tracks (id, family_id, kind, name) values
  ('b0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'siblings', 'Søskende'),
  ('b0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'with_parent', 'Med far'),
  ('b0000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'with_grandchildren', 'Med børnebørn');

insert into track_members (track_id, membership_id)
select t.id, m.id
from tracks t
join memberships m on m.family_id = t.family_id
where (t.kind = 'siblings'            and m.relation in ('son','daughter'))
   or (t.kind = 'with_parent'         and m.relation in ('son','daughter','father'))
   or (t.kind = 'with_grandchildren'  and m.relation in ('son','daughter','grandchild'));

-- En åben emne-tråd som eksempel
insert into threads (id, track_id, title, created_by) values
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
   'Smartwatch til far?', 'a0000000-0000-0000-0000-000000000003');
insert into messages (thread_id, author, body) values
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003',
   'Skal vi gå sammen om et Apple Watch SE til far?');

-- ---------------------------------------------------------------------------
-- claim_demo_seat: kobl den indloggede bruger til en navngiven plads i
-- demo-familien. Kør fra appen eller SQL-editoren efter første login, fx:
--   select claim_demo_seat('Peter');
-- ---------------------------------------------------------------------------
create or replace function public.claim_demo_seat(p_label text)
returns void language plpgsql security definer set search_path = public as $$
declare v_membership uuid;
begin
  select id into v_membership
  from memberships
  where family_id = '11111111-1111-1111-1111-111111111111'
    and label = p_label and profile_id is null
  limit 1;

  if v_membership is null then
    raise exception 'Ingen ledig plads med navnet %', p_label;
  end if;

  update memberships set profile_id = auth.uid() where id = v_membership;
  update profiles set display_name = p_label where id = auth.uid();
end;
$$;
