import { HttpError, route, row, uuidParam } from '../_lib/http.js';
import { ownedBy, requireUser } from '../_lib/auth.js';
import { supabase } from '../_lib/supabase.js';
import { updateListingStatusSchema } from '../_lib/schemas.js';
import { serializeListing } from '../_lib/serialize.js';

export default route({
  PATCH: async (req, res) => {
    const user = await requireUser(req);
    const id = uuidParam(req, 'id');
    const { status } = updateListingStatusSchema.parse(req.body);

    const listing = row(
      await ownedBy(supabase.from('listings').update({ status }).eq('id', id), user)
        .select('*')
        .maybeSingle()
    );

    if (!listing) throw new HttpError(404, 'Listing not found or unauthorized');
    res.status(200).json({ listing: serializeListing(listing) });
  },
});
