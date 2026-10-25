-- Default p_agent_id to null so callers can omit it to mean "unscoped".
--
-- The previous migration already made null mean unscoped; this only adds the default,
-- which lets the generated TypeScript types mark the argument optional instead of
-- requiring a non-null uuid the API cannot supply for admins.
--
-- An admin marking another agent's listing sold cannot use a single owner id here: the
-- listing belongs to that agent while the newly created customer belongs to the admin,
-- so no one value satisfies both ownership checks. Unscoped is the correct semantic.
create or replace function public.link_customer_to_listing(
  p_listing_id  uuid,
  p_customer_id uuid,
  p_agent_id    uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.listings
     set customer_id = p_customer_id,
         sold_date   = now(),
         status      = 'sold'
   where id = p_listing_id
     and (p_agent_id is null or agent_id = p_agent_id);

  update public.customers
     set listing_id = p_listing_id
   where id = p_customer_id
     and (p_agent_id is null or agent_id = p_agent_id);
end;
$$;

revoke all on function public.link_customer_to_listing(uuid, uuid, uuid) from public, anon, authenticated;
