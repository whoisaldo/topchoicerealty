-- Let the mark-sold RPC run unscoped for admins.
--
-- p_agent_id NULL now means "do not restrict by owner". Agents still pass their own id,
-- so the ownership check is unchanged for them; the API decides which to send.
create or replace function public.link_customer_to_listing(
  p_listing_id  uuid,
  p_customer_id uuid,
  p_agent_id    uuid
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
