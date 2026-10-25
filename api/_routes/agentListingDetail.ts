import { HttpError, route, row, uuidParam } from '../_lib/http.js';
import { ownedBy, requireUser } from '../_lib/auth.js';
import { supabase } from '../_lib/supabase.js';
import { updateListingSchema } from '../_lib/schemas.js';
import { listingUpdate, serializeListing } from '../_lib/serialize.js';

const NOT_FOUND = 'Listing not found or unauthorized';

export default route({
  PUT: async (req, res) => {
    const user = await requireUser(req);
    const id = uuidParam(req, 'id');
    const updates = listingUpdate(updateListingSchema.parse(req.body));

    // ownedBy is what enforces ownership — same as the old findOneAndUpdate({ _id, agentId }).
    const listing = row(
      await ownedBy(supabase.from('listings').update(updates).eq('id', id), user)
        .select('*')
        .maybeSingle()
    );

    if (!listing) throw new HttpError(404, NOT_FOUND);
    res.status(200).json({ listing: serializeListing(listing) });
  },

  DELETE: async (req, res) => {
    const user = await requireUser(req);
    const id = uuidParam(req, 'id');

    const deleted = row(
      await ownedBy(supabase.from('listings').delete().eq('id', id), user)
        .select('id')
        .maybeSingle()
    );

    if (!deleted) throw new HttpError(404, NOT_FOUND);
    res.status(200).json({ ok: true });
  },
});
