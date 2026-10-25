import { requiredRow, route, rows } from '../_lib/http.js';
import { ownedBy, requireUser } from '../_lib/auth.js';
import { AGENT_REF, supabase } from '../_lib/supabase.js';
import { createListingSchema } from '../_lib/schemas.js';
import { listingInsert, serializeListing } from '../_lib/serialize.js';

export default route({
  GET: async (req, res) => {
    const user = await requireUser(req);

    // The agent is embedded so an admin, who sees every agent's listings here, can tell
    // them apart. Agents get their own record back, which they already know.
    const listings = rows(
      await ownedBy(
        supabase.from('listings').select(`*, agent:users!listings_agent_id_fkey(${AGENT_REF})`),
        user
      ).order('created_at', { ascending: false })
    );

    res.status(200).json({ listings: listings.map(serializeListing) });
  },

  // An admin creating a listing owns it themselves; there is no "create on behalf of".
  POST: async (req, res) => {
    const user = await requireUser(req);
    const input = createListingSchema.parse(req.body);

    const listing = requiredRow(
      await supabase
        .from('listings')
        .insert(listingInsert(input, user.id))
        .select('*')
        .single()
    );

    res.status(201).json({ listing: serializeListing(listing) });
  },
});
