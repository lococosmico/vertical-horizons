-- Hardening follow-up: append-only legal acceptance events, transactional
-- structured activity saves, and removal of direct attachment metadata deletes.

alter table public.legal_acceptances rename to legal_acceptances_legacy;
alter table public.legal_acceptances_legacy rename constraint legal_acceptances_pkey to legal_acceptances_legacy_pkey;
revoke all on public.legal_acceptances_legacy from public, anon, authenticated;
alter table public.legal_acceptances_legacy enable row level security;

create table public.legal_documents (
  document_type text primary key check (document_type in ('conditions','privacy')),
  version text not null check (char_length(version) between 1 and 80),
  document_url text not null,
  updated_at timestamptz not null default now()
);
insert into public.legal_documents(document_type,version,document_url) values
  ('conditions','vh-conditions-2026-11-23','/conditions.html'),
  ('privacy','vh-privacy-2026-11-23','/confidentialite.html');
alter table public.legal_documents enable row level security;
create policy "authenticated users read current legal documents" on public.legal_documents
  for select to authenticated using (true);
revoke all on public.legal_documents from public, anon;
grant select on public.legal_documents to authenticated;

create table public.legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null check (document_type in ('conditions','privacy')),
  document_version text not null check (char_length(document_version) between 1 and 80),
  accepted_at timestamptz not null default clock_timestamp(),
  acceptance_type text not null check (acceptance_type in ('signup','renewal')),
  context text not null check (context in ('web_signup','web_renewal'))
);
create index legal_acceptances_user_time_idx on public.legal_acceptances(user_id,accepted_at desc);
alter table public.legal_acceptances enable row level security;
create policy "user reads own legal acceptance events" on public.legal_acceptances
  for select to authenticated using (user_id=(select auth.uid()));
revoke all on public.legal_acceptances from public,anon,authenticated;
grant select on public.legal_acceptances to authenticated;

insert into public.legal_acceptances(user_id,document_type,document_version,accepted_at,acceptance_type,context)
select old.user_id,'conditions',old.conditions_version,old.accepted_at,'signup','web_signup'
from public.legal_acceptances_legacy old
union all
select old.user_id,'privacy',old.privacy_version,old.accepted_at,'signup','web_signup'
from public.legal_acceptances_legacy old;
drop table public.legal_acceptances_legacy;

create or replace function public.get_pending_legal_documents()
returns table(document_type text,version text,document_url text)
language plpgsql stable security invoker set search_path = '' as $$
begin
  if (select count(*) from public.legal_documents)<>2 then raise exception 'Required legal documents are not configured'; end if;
  return query select d.document_type,d.version,d.document_url
  from public.legal_documents d
  where not exists (
    select 1 from public.legal_acceptances a
    where a.user_id=(select auth.uid()) and a.document_type=d.document_type and a.document_version=d.version
  ) order by d.document_type;
end; $$;
revoke all on function public.get_pending_legal_documents() from public,anon;
grant execute on function public.get_pending_legal_documents() to authenticated;

create or replace function public.accept_current_legal_documents()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  if (select count(*) from public.legal_documents)<>2 then raise exception 'Required legal documents are not configured'; end if;
  insert into public.legal_acceptances(user_id,document_type,document_version,acceptance_type,context)
  select (select auth.uid()),d.document_type,d.version,'renewal','web_renewal'
  from public.legal_documents d
  where not exists (
    select 1 from public.legal_acceptances a
    where a.user_id=(select auth.uid()) and a.document_type=d.document_type and a.document_version=d.version
  );
end; $$;
revoke all on function public.accept_current_legal_documents() from public,anon;
grant execute on function public.accept_current_legal_documents() to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.raw_user_meta_data ->> 'legal_accepted' is distinct from 'true' then
    raise exception 'Conditions and privacy notice acceptance required';
  end if;
  if (select count(*) from public.legal_documents)<>2 then raise exception 'Required legal documents are not configured'; end if;
  insert into public.profiles(id,display_name)
  values(new.id,nullif(left(coalesce(new.raw_user_meta_data ->> 'display_name',''),100),''));
  insert into public.legal_acceptances(user_id,document_type,document_version,acceptance_type,context)
  select new.id,d.document_type,d.version,'signup','web_signup' from public.legal_documents d;
  return new;
end; $$;

-- A required new document version also blocks data APIs until the account has
-- accepted it. Coaches can evaluate a linked student's state without learning
-- acceptance status for unrelated accounts.
create or replace function public.has_current_legal_acceptance(target_user uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select target_user is not null
    and (target_user=(select auth.uid()) or (public.is_coach() and exists(
      select 1 from public.coach_access ca where ca.student_id=target_user and ca.coach_id=(select auth.uid()) and ca.status='active'
    )))
    and (select count(*) from public.legal_documents)=2
    and not exists(select 1 from public.legal_documents d where not exists(
      select 1 from public.legal_acceptances a where a.user_id=target_user and a.document_type=d.document_type and a.document_version=d.version
    ));
$$;
revoke all on function public.has_current_legal_acceptance(uuid) from public,anon;
grant execute on function public.has_current_legal_acceptance(uuid) to authenticated;

drop policy "profile owner or sharing coach reads" on public.profiles;
drop policy "profile owner inserts" on public.profiles;
drop policy "profile owner updates" on public.profiles;
create policy "profile owner or sharing coach reads" on public.profiles for select to authenticated
  using ((id=(select auth.uid()) and public.has_current_legal_acceptance(id)) or (public.is_coach() and public.has_current_legal_acceptance(id) and exists(
    select 1 from public.coach_access ca where ca.student_id=profiles.id and ca.coach_id=(select auth.uid()) and ca.status='active' and ca.share_data)));
create policy "profile owner inserts" on public.profiles for insert to authenticated
  with check (id=(select auth.uid()) and public.has_current_legal_acceptance(id));
create policy "profile owner updates" on public.profiles for update to authenticated
  using (id=(select auth.uid()) and public.has_current_legal_acceptance(id)) with check (id=(select auth.uid()) and public.has_current_legal_acceptance(id));

drop policy "owner or sharing coach reads activities" on public.activities;
drop policy "owner manages activities" on public.activities;
create policy "owner or sharing coach reads activities" on public.activities for select to authenticated
  using ((user_id=(select auth.uid()) and public.has_current_legal_acceptance(user_id)) or (public.is_coach() and public.has_current_legal_acceptance(user_id) and exists(
    select 1 from public.coach_access ca where ca.student_id=activities.user_id and ca.coach_id=(select auth.uid()) and ca.status='active' and ca.share_data)));
create policy "owner manages activities" on public.activities for all to authenticated
  using (user_id=(select auth.uid()) and public.has_current_legal_acceptance(user_id)) with check (user_id=(select auth.uid()) and public.has_current_legal_acceptance(user_id));

drop policy "owner or sharing coach reads goals" on public.goals;
drop policy "owner manages goals" on public.goals;
create policy "owner or sharing coach reads goals" on public.goals for select to authenticated
  using ((user_id=(select auth.uid()) and public.has_current_legal_acceptance(user_id)) or (public.is_coach() and public.has_current_legal_acceptance(user_id) and exists(
    select 1 from public.coach_access ca where ca.student_id=goals.user_id and ca.coach_id=(select auth.uid()) and ca.status='active' and ca.share_data)));
create policy "owner manages goals" on public.goals for all to authenticated
  using (user_id=(select auth.uid()) and public.has_current_legal_acceptance(user_id)) with check (user_id=(select auth.uid()) and public.has_current_legal_acceptance(user_id));

drop policy "owner or sharing coach reads projects" on public.projects;
drop policy "owner manages projects" on public.projects;
create policy "owner or sharing coach reads projects" on public.projects for select to authenticated
  using ((user_id=(select auth.uid()) and public.has_current_legal_acceptance(user_id)) or (public.is_coach() and public.has_current_legal_acceptance(user_id) and exists(
    select 1 from public.coach_access ca where ca.student_id=projects.user_id and ca.coach_id=(select auth.uid()) and ca.status='active' and ca.share_data)));
create policy "owner manages projects" on public.projects for all to authenticated
  using (user_id=(select auth.uid()) and public.has_current_legal_acceptance(user_id)) with check (user_id=(select auth.uid()) and public.has_current_legal_acceptance(user_id));

drop policy "owner or sharing coach reads ascents" on public.ascents;
drop policy "owner manages ascents" on public.ascents;
create policy "owner or sharing coach reads ascents" on public.ascents for select to authenticated
  using ((user_id=(select auth.uid()) and public.has_current_legal_acceptance(user_id)) or (public.is_coach() and public.has_current_legal_acceptance(user_id) and exists(
    select 1 from public.coach_access ca where ca.student_id=ascents.user_id and ca.coach_id=(select auth.uid()) and ca.status='active' and ca.share_data)));
create policy "owner manages ascents" on public.ascents for all to authenticated
  using (user_id=(select auth.uid()) and public.has_current_legal_acceptance(user_id)) with check (user_id=(select auth.uid()) and public.has_current_legal_acceptance(user_id));

drop policy "student or coach reads relationship" on public.coach_access;
create policy "student or coach reads relationship" on public.coach_access for select to authenticated
  using ((student_id=(select auth.uid()) or coach_id=(select auth.uid())) and public.has_current_legal_acceptance((select auth.uid())));
drop policy "coach alone reads and manages private notes" on public.coach_notes;
create policy "coach alone reads and manages private notes" on public.coach_notes for all to authenticated
  using (coach_id=(select auth.uid()) and public.is_coach() and public.has_current_legal_acceptance(coach_id))
  with check (coach_id=(select auth.uid()) and public.is_coach() and public.has_current_legal_acceptance(coach_id) and exists(
    select 1 from public.coach_access ca where ca.student_id=coach_notes.student_id and ca.coach_id=(select auth.uid()) and ca.status='active'));

drop policy "owner or sharing coach reads training" on public.training_exercises;
drop policy "owner manages training" on public.training_exercises;
create policy "owner or sharing coach reads training" on public.training_exercises for select to authenticated
  using ((user_id=(select auth.uid()) and public.has_current_legal_acceptance(user_id)) or (public.is_coach() and public.has_current_legal_acceptance(user_id) and exists(
    select 1 from public.coach_access ca where ca.student_id=training_exercises.user_id and ca.coach_id=(select auth.uid()) and ca.status='active' and ca.share_data)));
create policy "owner manages training" on public.training_exercises for all to authenticated
  using (user_id=(select auth.uid()) and public.has_current_legal_acceptance(user_id)) with check (user_id=(select auth.uid()) and public.has_current_legal_acceptance(user_id));

drop policy "owner or sharing coach reads activity goals" on public.activity_goals;
drop policy "owner manages activity goals" on public.activity_goals;
create policy "owner or sharing coach reads activity goals" on public.activity_goals for select to authenticated
  using ((user_id=(select auth.uid()) and public.has_current_legal_acceptance(user_id)) or (public.is_coach() and public.has_current_legal_acceptance(user_id) and exists(
    select 1 from public.coach_access ca where ca.student_id=activity_goals.user_id and ca.coach_id=(select auth.uid()) and ca.status='active' and ca.share_data)));
create policy "owner manages activity goals" on public.activity_goals for all to authenticated
  using (user_id=(select auth.uid()) and public.has_current_legal_acceptance(user_id)) with check (user_id=(select auth.uid()) and public.has_current_legal_acceptance(user_id));

drop policy "owner or sharing coach reads attachment metadata" on public.activity_attachments;
drop policy "owner manages attachment metadata" on public.activity_attachments;
create policy "owner or sharing coach reads attachment metadata" on public.activity_attachments for select to authenticated
  using ((user_id=(select auth.uid()) and public.has_current_legal_acceptance(user_id)) or (public.is_coach() and public.has_current_legal_acceptance(user_id) and exists(
    select 1 from public.coach_access ca where ca.student_id=activity_attachments.user_id and ca.coach_id=(select auth.uid()) and ca.status='active' and ca.share_data)));
create policy "owner manages attachment metadata" on public.activity_attachments for all to authenticated
  using (user_id=(select auth.uid()) and public.has_current_legal_acceptance(user_id)) with check (user_id=(select auth.uid()) and public.has_current_legal_acceptance(user_id));

drop policy "student reads own authorized coaching sessions" on public.coaching_sessions;
drop policy "coach manages sessions for linked students" on public.coaching_sessions;
create policy "student reads own authorized coaching sessions" on public.coaching_sessions for select to authenticated
  using (student_id=(select auth.uid()) and public.has_current_legal_acceptance(student_id) and exists(
    select 1 from public.coach_access ca where ca.student_id=coaching_sessions.student_id and ca.coach_id=coaching_sessions.coach_id and ca.status='active'));
create policy "coach manages sessions for linked students" on public.coaching_sessions for all to authenticated
  using (coach_id=(select auth.uid()) and public.is_coach() and public.has_current_legal_acceptance(coach_id) and public.has_current_legal_acceptance(student_id) and exists(
    select 1 from public.coach_access ca where ca.student_id=coaching_sessions.student_id and ca.coach_id=coaching_sessions.coach_id and ca.status='active'))
  with check (coach_id=(select auth.uid()) and public.is_coach() and public.has_current_legal_acceptance(coach_id) and public.has_current_legal_acceptance(student_id) and exists(
    select 1 from public.coach_access ca where ca.student_id=coaching_sessions.student_id and ca.coach_id=coaching_sessions.coach_id and ca.status='active'));

drop policy "owner or sharing coach reads photos" on storage.objects;
create policy "owner or sharing coach reads photos" on storage.objects for select to authenticated
  using (bucket_id='progress-photos' and (
    ((storage.foldername(name))[1]=(select auth.uid())::text and public.has_current_legal_acceptance((select auth.uid()))) or
    (public.is_coach() and exists(select 1 from public.coach_access ca where ca.student_id::text=(storage.foldername(name))[1] and ca.coach_id=(select auth.uid()) and ca.status='active' and ca.share_data and public.has_current_legal_acceptance(ca.student_id))
  )));
drop policy "user uploads own progress photos" on storage.objects;
create policy "user uploads own progress photos" on storage.objects for insert to authenticated
  with check (bucket_id='progress-photos' and (storage.foldername(name))[1]=(select auth.uid())::text and public.has_current_legal_acceptance((select auth.uid())));

-- Keep the signed-in user's upload capability; all metadata deletion must pass
-- through the owner-scoped Edge Function which removes the object first.
revoke delete on public.activity_attachments from authenticated;
drop policy "user deletes own progress photos" on storage.objects;
drop policy "user updates own progress photos" on storage.objects;

create or replace function public.save_activity(
  p_activity_id uuid,
  p_activity jsonb,
  p_goal_ids uuid[],
  p_exercises jsonb
)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  saved_id uuid;
  exercise jsonb;
  sort_index integer := 0;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  if jsonb_typeof(p_activity) <> 'object' or jsonb_typeof(coalesce(p_exercises,'[]'::jsonb)) <> 'array' then
    raise exception 'Invalid activity payload';
  end if;

  if p_activity_id is null or not exists(select 1 from public.activities where id=p_activity_id and user_id=(select auth.uid())) then
    insert into public.activities(id,user_id,title,activity_type,activity_date,location,duration_minutes,intensity,perceived_effort,description,personal_notes,status)
    values(coalesce(p_activity_id,extensions.gen_random_uuid()),(select auth.uid()),p_activity->>'title',p_activity->>'activity_type',(p_activity->>'activity_date')::timestamptz,
      nullif(p_activity->>'location',''),nullif(p_activity->>'duration_minutes','')::integer,
      nullif(p_activity->>'intensity','')::smallint,nullif(p_activity->>'perceived_effort','')::smallint,
      nullif(p_activity->>'description',''),nullif(p_activity->>'personal_notes',''),p_activity->>'status') returning id into saved_id;
  else
    update public.activities set title=p_activity->>'title',activity_type=p_activity->>'activity_type',
      activity_date=(p_activity->>'activity_date')::timestamptz,location=nullif(p_activity->>'location',''),
      duration_minutes=nullif(p_activity->>'duration_minutes','')::integer,intensity=nullif(p_activity->>'intensity','')::smallint,
      perceived_effort=nullif(p_activity->>'perceived_effort','')::smallint,description=nullif(p_activity->>'description',''),
      personal_notes=nullif(p_activity->>'personal_notes',''),status=p_activity->>'status'
    where id=p_activity_id and user_id=(select auth.uid()) returning id into saved_id;
    if saved_id is null then raise exception 'Activity not found'; end if;
    delete from public.activity_goals where activity_id=saved_id;
    delete from public.training_exercises where activity_id=saved_id;
  end if;

  if coalesce(array_length(p_goal_ids,1),0)>0 then
    insert into public.activity_goals(activity_id,goal_id,user_id)
    select saved_id,goal_id,(select auth.uid()) from unnest(p_goal_ids) as selected_goals(goal_id);
  end if;
  for exercise in select value from jsonb_array_elements(coalesce(p_exercises,'[]'::jsonb)) loop
    insert into public.training_exercises(activity_id,user_id,exercise_name,category,sort_order,sets,repetitions,load_kg,duration_seconds,rest_seconds,intensity,notes)
    values(saved_id,(select auth.uid()),exercise->>'exercise_name',exercise->>'category',sort_index,
      nullif(exercise->>'sets','')::smallint,nullif(exercise->>'repetitions','')::smallint,nullif(exercise->>'load_kg','')::numeric,
      nullif(exercise->>'duration_seconds','')::integer,nullif(exercise->>'rest_seconds','')::integer,
      nullif(exercise->>'intensity','')::smallint,nullif(exercise->>'notes',''));
    sort_index:=sort_index+1;
  end loop;
  return saved_id;
end; $$;
revoke all on function public.save_activity(uuid,jsonb,uuid[],jsonb) from public,anon;
grant execute on function public.save_activity(uuid,jsonb,uuid[],jsonb) to authenticated;

create table public.account_deletion_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  recovery_token_hash text not null unique,
  created_at timestamptz not null default now(),
  auth_deleted boolean not null default false,
  completed_at timestamptz
);
create unique index account_deletion_one_pending_idx on public.account_deletion_jobs(user_id) where completed_at is null;
alter table public.account_deletion_jobs enable row level security;
revoke all on public.account_deletion_jobs from public,anon,authenticated;
grant all on public.account_deletion_jobs to service_role;

-- No object-store transaction exists. These jobs preserve a retry handle if
-- Auth deletion succeeds but recursive Storage cleanup later fails.
