import { HttpError, route, row, uuidParam } from '../_lib/http.js';
import { ownedBy, requireUser } from '../_lib/auth.js';
import { LISTING_REF, supabase } from '../_lib/supabase.js';
import { updateCustomerSchema } from '../_lib/schemas.js';
import { customerUpdate, serializeCustomer } from '../_lib/serialize.js';

const SELECT = `*, listing:listings!customers_listing_id_fkey(${LISTING_REF})`;
const NOT_FOUND = 'Customer not found or unauthorized';

export default route({
  PUT: async (req, res) => {
    const user = await requireUser(req);
    const id = uuidParam(req, 'id');
    const updates = customerUpdate(updateCustomerSchema.parse(req.body));

    const customer = row(
      await ownedBy(supabase.from('customers').update(updates).eq('id', id), user)
        .select(SELECT)
        .maybeSingle()
    );

    if (!customer) throw new HttpError(404, NOT_FOUND);
    res.status(200).json({ customer: serializeCustomer(customer) });
  },

  DELETE: async (req, res) => {
    const user = await requireUser(req);
    const id = uuidParam(req, 'id');

    const deleted = row(
      await ownedBy(supabase.from('customers').delete().eq('id', id), user)
        .select('id')
        .maybeSingle()
    );

    if (!deleted) throw new HttpError(404, NOT_FOUND);
    res.status(200).json({ ok: true });
  },
});
