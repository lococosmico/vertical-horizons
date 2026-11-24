-- Add structured training, activity-goal links and private activity photos.
create table public.training_exercises (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  exercise_name text not null check (char_length(exercise_name) between 1 and 160),
  category text not null check (category in ('hangboard','campus','strength','core','endurance','intervals','technique','footwork','mobility','recovery','other')),
  sort_order smallint not null default 0 check (sort_order between 0 and 100),
  sets smallint check (sets between 0 and 1000),
  repetitions smallint check (repetitions between 0 and 10000),
  load_kg numeric(7,2) check (load_kg between 0 and 1000),
  duration_seconds integer check (duration_seconds between 0 and 86400),
  rest_seconds integer check (rest_seconds between 0 and 86400),
  intensity smallint check (intensity between 1 and 10),
  notes text check (char_length(notes) <= 2000),
  created_at timestamptz not null default now()
);
create index training_exercises_user_activity_idx on public.training_exercises(user_id,activity_id,sort_order);

create or replace function public.validate_training_activity()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not exists(select 1 from public.activities a where a.id=new.activity_id and a.user_id=new.user_id and a.activity_type in ('climbing_training','strength_training'))
  then raise exception 'Training block must belong to the same user and a training activity'; end if;
  return new;
end; $$;
create trigger training_exercises_validate before insert or update on public.training_exercises
  for each row execute function public.validate_training_activity();

create table public.activity_goals (
  activity_id uuid not null references public.activities(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(activity_id,goal_id)
);
create or replace function public.validate_activity_goal()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not exists(select 1 from public.activities a where a.id=new.activity_id and a.user_id=new.user_id)
    or not exists(select 1 from public.goals g where g.id=new.goal_id and g.user_id=new.user_id)
  then raise exception 'Activity and goal must belong to the same user'; end if;
  return new;
end; $$;
create trigger activity_goals_validate before insert or update on public.activity_goals
  for each row execute function public.validate_activity_goal();

create table public.activity_attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete cascade,
  object_path text not null unique check (object_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$'),
  content_type text not null check (content_type in ('image/jpeg','image/png','image/webp')),
  size_bytes integer not null check (size_bytes between 1 and 5242880),
  created_at timestamptz not null default now()
);
create index activity_attachments_user_activity_idx on public.activity_attachments(user_id,activity_id);
create or replace function public.validate_activity_attachment()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not exists(select 1 from public.activities a where a.id=new.activity_id and a.user_id=new.user_id)
  then raise exception 'Attachment must belong to the same user activity'; end if;
  if split_part(new.object_path,'/',1)<>new.user_id::text
    or split_part(new.object_path,'/',2)<>new.activity_id::text
  then raise exception 'Attachment path must be scoped to the same user activity'; end if;
  return new;
end; $$;
create trigger activity_attachments_validate before insert or update on public.activity_attachments
  for each row execute function public.validate_activity_attachment();

-- Coaching appointments are visible to the linked student; coaching notes remain private.
create table public.coaching_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  coach_id uuid not null references public.coach_admins(user_id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text check (char_length(location) <= 240),
  student_details text check (char_length(student_details) <= 3000),
  status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index coaching_sessions_student_date_idx on public.coaching_sessions(student_id,starts_at);
create trigger coaching_sessions_updated_at before update on public.coaching_sessions for each row execute function public.set_updated_at();
alter table public.coaching_sessions enable row level security;
create policy "student reads own authorized coaching sessions" on public.coaching_sessions for select to authenticated
  using (student_id=(select auth.uid()) and exists(select 1 from public.coach_access ca where ca.student_id=coaching_sessions.student_id and ca.coach_id=coaching_sessions.coach_id and ca.status='active'));
create policy "coach manages sessions for linked students" on public.coaching_sessions for all to authenticated
  using (coach_id=(select auth.uid()) and public.is_coach() and exists(select 1 from public.coach_access ca where ca.student_id=coaching_sessions.student_id and ca.coach_id=coaching_sessions.coach_id and ca.status='active'))
  with check (coach_id=(select auth.uid()) and public.is_coach() and exists(select 1 from public.coach_access ca where ca.student_id=coaching_sessions.student_id and ca.coach_id=coaching_sessions.coach_id and ca.status='active'));
grant select,insert,update,delete on public.coaching_sessions to authenticated;
revoke all on public.coaching_sessions from public,anon;

create or replace function public.my_progress_summary()
returns table(activity_count bigint,activities_this_month bigint,completed_minutes bigint,climbing_sessions bigint,ascent_records bigint,active_goals bigint,active_projects bigint)
language sql stable security invoker set search_path = '' as $$
  with month_bounds as (
    select (date_trunc('month',now() at time zone 'Europe/Zurich') at time zone 'Europe/Zurich') as month_start,
      ((date_trunc('month',now() at time zone 'Europe/Zurich') + interval '1 month') at time zone 'Europe/Zurich') as next_month
  )
  select
    (select count(*) from public.activities a where a.user_id=(select auth.uid())),
    (select count(*) from public.activities a cross join month_bounds b where a.user_id=(select auth.uid()) and a.activity_date>=b.month_start and a.activity_date<b.next_month and a.status='completed'),
    (select coalesce(sum(a.duration_minutes),0) from public.activities a where a.user_id=(select auth.uid()) and a.status='completed'),
    (select count(*) from public.activities a where a.user_id=(select auth.uid()) and a.activity_type in ('sport_climbing','bouldering','indoor_climbing','outdoor_climbing','multipitch','climbing_training')),
    (select count(*) from public.ascents a where a.user_id=(select auth.uid())),
    (select count(*) from public.goals g where g.user_id=(select auth.uid()) and g.status in ('not_started','in_progress')),
    (select count(*) from public.projects p where p.user_id=(select auth.uid()) and p.status='active');
$$;
revoke all on function public.my_progress_summary() from public;
grant execute on function public.my_progress_summary() to authenticated;

alter table public.training_exercises enable row level security;
alter table public.activity_goals enable row level security;
alter table public.activity_attachments enable row level security;

create policy "owner or sharing coach reads training" on public.training_exercises for select to authenticated
  using (user_id=(select auth.uid()) or (public.is_coach() and exists (
    select 1 from public.coach_access ca where ca.student_id=training_exercises.user_id and ca.coach_id=(select auth.uid()) and ca.status='active' and ca.share_data)));
create policy "owner manages training" on public.training_exercises for all to authenticated
  using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy "owner or sharing coach reads activity goals" on public.activity_goals for select to authenticated
  using (user_id=(select auth.uid()) or (public.is_coach() and exists (
    select 1 from public.coach_access ca where ca.student_id=activity_goals.user_id and ca.coach_id=(select auth.uid()) and ca.status='active' and ca.share_data)));
create policy "owner manages activity goals" on public.activity_goals for all to authenticated
  using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy "owner or sharing coach reads attachment metadata" on public.activity_attachments for select to authenticated
  using (user_id=(select auth.uid()) or (public.is_coach() and exists (
    select 1 from public.coach_access ca where ca.student_id=activity_attachments.user_id and ca.coach_id=(select auth.uid()) and ca.status='active' and ca.share_data)));
create policy "owner manages attachment metadata" on public.activity_attachments for all to authenticated
  using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));

grant select,insert,update,delete on public.training_exercises,public.activity_goals,public.activity_attachments to authenticated;
revoke all on public.training_exercises,public.activity_goals,public.activity_attachments from public,anon;
-- Activity deletion must pass through the Edge Function so private objects are removed first.
revoke delete on public.activities from authenticated;

-- Private images only; object paths begin with the authenticated user's UUID.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('progress-photos','progress-photos',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=false,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

create policy "user uploads own progress photos" on storage.objects for insert to authenticated
  with check (bucket_id='progress-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "owner or sharing coach reads photos" on storage.objects for select to authenticated
  using (bucket_id='progress-photos' and (
    (storage.foldername(name))[1]=(select auth.uid())::text or
    (public.is_coach() and exists(select 1 from public.coach_access ca where ca.student_id=((storage.foldername(name))[1])::uuid and ca.coach_id=(select auth.uid()) and ca.status='active' and ca.share_data))));
create policy "user updates own progress photos" on storage.objects for update to authenticated
  using (bucket_id='progress-photos' and (storage.foldername(name))[1]=(select auth.uid())::text)
  with check (bucket_id='progress-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "user deletes own progress photos" on storage.objects for delete to authenticated
  using (bucket_id='progress-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);

alter table public.coach_access add column share_consented_at timestamptz;
alter table public.coach_access add column revoked_at timestamptz;
create or replace function public.request_coach_access()
returns void language plpgsql security definer set search_path = '' as $$
declare coach uuid;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  select user_id into coach from public.coach_admins order by created_at limit 1;
  if coach is null then raise exception 'Coaching access is not configured'; end if;
  if coach=(select auth.uid()) then raise exception 'Coach cannot request student access'; end if;
  insert into public.coach_access(student_id,coach_id,status,share_data,requested_at)
  values((select auth.uid()),coach,'requested',false,now())
  on conflict(student_id) do update set coach_id=excluded.coach_id,status='requested',share_data=false,
    requested_at=now(),decided_at=null,share_consented_at=null,revoked_at=null;
end; $$;
revoke all on function public.request_coach_access() from public;
grant execute on function public.request_coach_access() to authenticated;

create or replace function public.decide_coach_access(student uuid, approved boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_coach() then raise exception 'Coach access required'; end if;
  update public.coach_access set status=case when approved then 'active' else 'revoked' end,
    share_data=false,decided_at=now(),revoked_at=case when approved then null else now() end
  where student_id=student and coach_id=(select auth.uid()) and status='requested';
  if not found then raise exception 'No pending request'; end if;
end; $$;
revoke all on function public.decide_coach_access(uuid,boolean) from public;
grant execute on function public.decide_coach_access(uuid,boolean) to authenticated;

create or replace function public.set_coach_data_sharing(enabled boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.coach_access set share_data=enabled,
    share_consented_at=case when enabled then now() else share_consented_at end,
    revoked_at=case when enabled then null else now() end
  where student_id=(select auth.uid()) and status='active';
  if not found then raise exception 'No active coach relationship'; end if;
end; $$;
revoke all on function public.set_coach_data_sharing(boolean) from public;
grant execute on function public.set_coach_data_sharing(boolean) to authenticated;

create or replace function public.revoke_coach_access()
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.coach_access set status='revoked',share_data=false,revoked_at=now(),decided_at=now()
  where student_id=(select auth.uid());
end; $$;
revoke all on function public.revoke_coach_access() from public;
grant execute on function public.revoke_coach_access() to authenticated;

-- Remove any broad default table grants that may exist in a customized Supabase project.
revoke all on public.coach_access,public.coach_admins from public,anon,authenticated;
grant select on public.coach_access,public.coach_admins to authenticated;

-- Malformed storage folder names cannot cause UUID cast errors or broaden reads.
drop policy "owner or sharing coach reads photos" on storage.objects;
create policy "owner or sharing coach reads photos" on storage.objects for select to authenticated
  using (bucket_id='progress-photos' and (
    (storage.foldername(name))[1]=(select auth.uid())::text or
    (public.is_coach() and exists(select 1 from public.coach_access ca where ca.student_id::text=(storage.foldername(name))[1] and ca.coach_id=(select auth.uid()) and ca.status='active' and ca.share_data))));
