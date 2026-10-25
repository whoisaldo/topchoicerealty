import { requiredRow, route, rows } from '../_lib/http.js';
import { isAdmin, ownedBy, requireUser } from '../_lib/auth.js';
import { LISTING_REF, supabase } from '../_lib/supabase.js';
import { createCustomerSchema, customersQuerySchema } from '../_lib/schemas.js';
import { ilikeAny } from '../_lib/search.js';
import { customerInsert, serializeCustomer } from '../_lib/serialize.js';

// customers.listing_id and listings.customer_id are two separate relationships between
// the same pair of tables, so the embed has to name the constraint.
const SELECT = `*, listing:listings!customers_listing_id_fkey(${LISTING_REF})`;

export default route({
  GET: async (req, res) => {
    const user = await requireUser(req);
    const { q } = customersQuerySchema.parse(req.query);

    let query = ownedBy(supabase.from('customers').select(SELECT), user);

    if (q) {
      query = query
        .or(ilikeAny(['first_name', 'last_name', 'email', 'phone'], q))
        .limit(50);
    }

    const customers = rows(
      await query
        .order('purchase_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
    );

    res.status(200).json({ customers: customers.map(serializeCustomer) });
  },

  POST: async (req, res) => {
    const user = await requireUser(req);
    const input = createCustomerSchema.parse(req.body);

    const customer = requiredRow(
      await supabase.from('customers').insert(customerInsert(input, user.id)).select('id').single()
    );

    // Creating a customer against a listing is what marks that listing sold — the old
    // linkCustomerToListing behaviour, which the Dashboard's "sold" flow depends on.
    if (input.listingId) {
      const { error } = await supabase.rpc('link_customer_to_listing', {
        p_listing_id: input.listingId,
        p_customer_id: customer.id,
        // Omitted for admins, which the function reads as "don't scope by owner" so they
        // can mark any agent's listing sold.
        ...(isAdmin(user) ? {} : { p_agent_id: user.id }),
      });
      if (error) throw error;
    }

    const created = requiredRow(
      await supabase.from('customers').select(SELECT).eq('id', customer.id).single()
    );

    res.status(201).json({ customer: serializeCustomer(created) });
  },
});
