-- Fixed-window counter backing api/_lib/rateLimit.ts. The increment and the window
-- roll happen in a single statement so two concurrent invocations can't both pass.
create or replace function public.check_rate_limit(
  p_key            text,
  p_max            integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  insert into public.rate_limits as rl (key, count, window_start)
       values (p_key, 1, now())
  on conflict (key) do update
     set count = case
                   when rl.window_start < now() - make_interval(secs => p_window_seconds) then 1
                   else rl.count + 1
                 end,
         window_start = case
                   when rl.window_start < now() - make_interval(secs => p_window_seconds) then now()
                   else rl.window_start
                 end
  returning rl.count into v_count;

  return v_count <= p_max;
end;
$$;

revoke all on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
