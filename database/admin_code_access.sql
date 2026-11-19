create table public.campus_code_attempts (
 user_id uuid primary key references auth.users(id) on delete cascade,
 window_start timestamptz not null default now(),
 attempts integer not null default 0
);
alter table public.campus_code_attempts enable row level security;
revoke all on public.campus_code_attempts from public,anon,authenticated;
grant select,insert,update,delete on public.campus_code_attempts to service_role;
create function public.campus_code_attempt(p_user uuid) returns boolean
language plpgsql security invoker set search_path = '' as $$
declare v_count integer;
begin
 insert into public.campus_code_attempts as a (user_id,window_start,attempts)
 values (p_user,now(),1)
 on conflict (user_id) do update set
 attempts=case when a.window_start < now()-interval '15 minutes' then 1 else a.attempts+1 end,
 window_start=case when a.window_start < now()-interval '15 minutes' then now() else a.window_start end
 returning attempts into v_count;
 return v_count<=5;
end; $$;
revoke all on function public.campus_code_attempt(uuid) from public,anon,authenticated;
grant execute on function public.campus_code_attempt(uuid) to service_role;
