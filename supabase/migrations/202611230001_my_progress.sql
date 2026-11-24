-- My Progress initial private data model. Apply with Supabase CLI or SQL editor.
create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 100),
  preferred_name text check (char_length(preferred_name) <= 100),
  experience_years smallint check (experience_years between 0 and 100),
  climbing_experience text check (char_length(climbing_experience) <= 4000),
  current_levels jsonb not null default '{}'::jsonb check (jsonb_typeof(current_levels) = 'object'),
  preferred_styles text[] not null default '{}',
  objectives text check (char_length(objectives) <= 4000),
  strengths text check (char_length(strengths) <= 4000),
  areas_to_improve text check (char_length(areas_to_improve) <= 4000),
  training_frequency text check (char_length(training_frequency) <= 200),
  preferred_sports text[] not null default '{}',
  personal_notes text check (char_length(personal_notes) <= 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  activity_type text not null check (activity_type in ('sport_climbing','bouldering','indoor_climbing','outdoor_climbing','multipitch','climbing_training','strength_training','running','trail_running','hiking','skiing','cycling','yoga','mobility','other')),
  title text not null check (char_length(title) between 1 and 160),
  activity_date timestamptz not null,
  location text check (char_length(location) <= 240),
  duration_minutes integer check (duration_minutes between 0 and 1440),
  intensity smallint check (intensity between 1 and 10),
  perceived_effort smallint check (perceived_effort between 1 and 10),
  description text check (char_length(description) <= 8000),
  personal_notes text check (char_length(personal_notes) <= 8000),
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  status text not null default 'completed' check (status in ('planned','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index activities_user_date_idx on public.activities(user_id, activity_date desc);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text check (char_length(description) <= 5000),
  category text not null default 'other' check (category in ('climbing','technique','endurance','strength','consistency','multipitch','running','other')),
  target_date date,
  status text not null default 'not_started' check (status in ('not_started','in_progress','achieved','paused','abandoned')),
  progress_note text check (char_length(progress_note) <= 2000),
  personal_notes text check (char_length(personal_notes) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete set null,
  name text not null check (char_length(name) between 1 and 200),
  location text check (char_length(location) <= 240),
  sector text check (char_length(sector) <= 160),
  grade text check (char_length(grade) <= 40),
  discipline text check (discipline in ('sport','boulder','trad','multipitch','other')),
  started_on date,
  status text not null default 'active' check (status in ('active','completed','paused','abandoned')),
  notes text check (char_length(notes) <= 8000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.ascents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  activity_id uuid,
  project_id uuid,
  climbed_on date not null,
  route_name text not null check (char_length(route_name) between 1 and 200),
  crag text check (char_length(crag) <= 200),
  sector text check (char_length(sector) <= 160),
  region text check (char_length(region) <= 160),
  discipline text not null check (discipline in ('sport','boulder','trad','multipitch','indoor','other')),
  grade text check (char_length(grade) <= 40),
  attempt_count smallint check (attempt_count between 1 and 999),
  status text not null check (status in ('project','attempted','completed','repeated')),
  style text check (style in ('onsight','flash','redpoint','top_rope','lead','boulder','other')),
  comments text check (char_length(comments) <= 4000),
  created_at timestamptz not null default now(),
  foreign key (activity_id) references public.activities(id) on delete set null,
  foreign key (project_id) references public.projects(id) on delete set null
);
create index ascents_user_date_idx on public.ascents(user_id, climbed_on desc);

create or replace function public.validate_ascent_links()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.activity_id is not null and not exists (
    select 1 from public.activities a where a.id=new.activity_id and a.user_id=new.user_id
  ) then raise exception 'Activity must belong to the same user'; end if;
  if new.project_id is not null and not exists (
    select 1 from public.projects p where p.id=new.project_id and p.user_id=new.user_id
  ) then raise exception 'Project must belong to the same user'; end if;
  return new;
end; $$;
create trigger ascents_validate_links before insert or update on public.ascents
  for each row execute function public.validate_ascent_links();

create or replace function public.validate_project_goal()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.goal_id is not null and not exists (
    select 1 from public.goals g where g.id=new.goal_id and g.user_id=new.user_id
  ) then raise exception 'Goal must belong to the same user'; end if;
  return new;
end; $$;
create trigger projects_validate_goal before insert or update on public.projects
  for each row execute function public.validate_project_goal();

-- The single coach is provisioned explicitly by the site owner after creating their account.
create table public.coach_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create unique index coach_admin_single_owner_idx on public.coach_admins ((true));
create table public.coach_access (
  student_id uuid primary key references auth.users(id) on delete cascade,
  coach_id uuid not null references public.coach_admins(user_id) on delete cascade,
  status text not null default 'requested' check (status in ('requested','active','revoked')),
  share_data boolean not null default false,
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  check (student_id <> coach_id)
);
create index coach_access_coach_status_idx on public.coach_access(coach_id,status);

create table public.coach_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  coach_id uuid not null references public.coach_admins(user_id) on delete cascade,
  noted_at timestamptz not null default now(),
  note text not null check (char_length(note) between 1 and 8000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index coach_notes_student_date_idx on public.coach_notes(student_id, noted_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end; $$;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger activities_updated_at before update on public.activities for each row execute function public.set_updated_at();
create trigger goals_updated_at before update on public.goals for each row execute function public.set_updated_at();
create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();
create trigger coach_notes_updated_at before update on public.coach_notes for each row execute function public.set_updated_at();

create table public.legal_acceptances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  conditions_version text not null check (char_length(conditions_version) between 1 and 80),
  privacy_version text not null check (char_length(privacy_version) between 1 and 80),
  accepted_at timestamptz not null default now()
);
alter table public.legal_acceptances enable row level security;
create policy "user reads own legal acceptance" on public.legal_acceptances for select to authenticated using (user_id=(select auth.uid()));
revoke all on public.legal_acceptances from public,anon,authenticated;
grant select on public.legal_acceptances to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if nullif(new.raw_user_meta_data ->> 'conditions_version','') is null
    or nullif(new.raw_user_meta_data ->> 'privacy_version','') is null
  then raise exception 'Conditions and privacy notice acceptance required'; end if;
  insert into public.profiles(id, display_name)
  values (new.id, nullif(left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 100), ''));
  insert into public.legal_acceptances(user_id,conditions_version,privacy_version)
  values(new.id,left(new.raw_user_meta_data ->> 'conditions_version',80),left(new.raw_user_meta_data ->> 'privacy_version',80));
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_coach()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.coach_admins where user_id = (select auth.uid()));
$$;
revoke all on function public.is_coach() from public;
grant execute on function public.is_coach() to authenticated;

-- The student explicitly requests access; only the provisioned coach can approve it.
create or replace function public.request_coach_access()
returns void language plpgsql security definer set search_path = '' as $$
declare coach uuid;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  select user_id into coach from public.coach_admins order by created_at limit 1;
  if coach is null then raise exception 'Coaching access is not configured'; end if;
  if coach = (select auth.uid()) then raise exception 'Coach cannot request student access'; end if;
  insert into public.coach_access(student_id,coach_id,status,share_data,requested_at)
  values ((select auth.uid()),coach,'requested',false,now())
  on conflict (student_id) do update set coach_id=excluded.coach_id,status='requested',share_data=false,requested_at=now(),decided_at=null;
end; $$;
revoke all on function public.request_coach_access() from public;
grant execute on function public.request_coach_access() to authenticated;

create or replace function public.set_coach_data_sharing(enabled boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.coach_access set share_data=enabled
  where student_id=(select auth.uid()) and status='active';
  if not found then raise exception 'No active coach relationship'; end if;
end; $$;
revoke all on function public.set_coach_data_sharing(boolean) from public;
grant execute on function public.set_coach_data_sharing(boolean) to authenticated;

create or replace function public.revoke_coach_access()
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.coach_access set status='revoked',share_data=false,decided_at=now()
  where student_id=(select auth.uid());
end; $$;
revoke all on function public.revoke_coach_access() from public;
grant execute on function public.revoke_coach_access() to authenticated;

-- Students cannot approve their own request: only the owner-marked coach calls this RPC.
create or replace function public.decide_coach_access(student uuid, approved boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_coach() then raise exception 'Coach access required'; end if;
  update public.coach_access set status=case when approved then 'active' else 'revoked' end,
    share_data=false,decided_at=now()
  where student_id=student and coach_id=(select auth.uid()) and status='requested';
  if not found then raise exception 'No pending request'; end if;
end; $$;
revoke all on function public.decide_coach_access(uuid,boolean) from public;
grant execute on function public.decide_coach_access(uuid,boolean) to authenticated;

alter table public.profiles enable row level security;
alter table public.activities enable row level security;
alter table public.goals enable row level security;
alter table public.projects enable row level security;
alter table public.ascents enable row level security;
alter table public.coach_admins enable row level security;
alter table public.coach_access enable row level security;
alter table public.coach_notes enable row level security;

create policy "profile owner or sharing coach reads" on public.profiles for select to authenticated
  using (id=(select auth.uid()) or (public.is_coach() and exists (
    select 1 from public.coach_access ca where ca.student_id=profiles.id and ca.coach_id=(select auth.uid()) and ca.status='active' and ca.share_data)));
create policy "profile owner inserts" on public.profiles for insert to authenticated with check (id=(select auth.uid()));
create policy "profile owner updates" on public.profiles for update to authenticated using (id=(select auth.uid())) with check (id=(select auth.uid()));

create policy "owner or sharing coach reads activities" on public.activities for select to authenticated
  using (user_id=(select auth.uid()) or (public.is_coach() and exists (
    select 1 from public.coach_access ca where ca.student_id=activities.user_id and ca.coach_id=(select auth.uid()) and ca.status='active' and ca.share_data)));
create policy "owner manages activities" on public.activities for all to authenticated
  using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));

create policy "owner or sharing coach reads goals" on public.goals for select to authenticated
  using (user_id=(select auth.uid()) or (public.is_coach() and exists (
    select 1 from public.coach_access ca where ca.student_id=goals.user_id and ca.coach_id=(select auth.uid()) and ca.status='active' and ca.share_data)));
create policy "owner manages goals" on public.goals for all to authenticated
  using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));

create policy "owner or sharing coach reads projects" on public.projects for select to authenticated
  using (user_id=(select auth.uid()) or (public.is_coach() and exists (
    select 1 from public.coach_access ca where ca.student_id=projects.user_id and ca.coach_id=(select auth.uid()) and ca.status='active' and ca.share_data)));
create policy "owner manages projects" on public.projects for all to authenticated
  using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));

create policy "owner or sharing coach reads ascents" on public.ascents for select to authenticated
  using (user_id=(select auth.uid()) or (public.is_coach() and exists (
    select 1 from public.coach_access ca where ca.student_id=ascents.user_id and ca.coach_id=(select auth.uid()) and ca.status='active' and ca.share_data)));
create policy "owner manages ascents" on public.ascents for all to authenticated
  using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));

create policy "coach identity is private" on public.coach_admins for select to authenticated using (user_id=(select auth.uid()));
create policy "student or coach reads relationship" on public.coach_access for select to authenticated
  using (student_id=(select auth.uid()) or coach_id=(select auth.uid()));
-- No direct client INSERT/UPDATE/DELETE policies exist on coach_access; changes go through RPCs.
create policy "coach alone reads and manages private notes" on public.coach_notes for all to authenticated
  using (coach_id=(select auth.uid()) and public.is_coach())
  with check (coach_id=(select auth.uid()) and public.is_coach() and exists (
    select 1 from public.coach_access ca where ca.student_id=coach_notes.student_id and ca.coach_id=(select auth.uid()) and ca.status='active'));

-- Minimal table privileges; RLS remains the row-level boundary.
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.activities, public.goals, public.projects, public.ascents to authenticated;
grant select on public.coach_admins, public.coach_access to authenticated;
grant select, insert, update, delete on public.coach_notes to authenticated;
revoke all on public.profiles,public.activities,public.goals,public.projects,public.ascents,public.coach_admins,public.coach_access,public.coach_notes from public,anon;
