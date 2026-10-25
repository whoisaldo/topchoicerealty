import { HttpError, route, row, uuidParam } from '../_lib/http.js';
import { AGENT_REF, supabase } from '../_lib/supabase.js';
import { serializeListing } from '../_lib/serialize.js';

export default route({
  GET: async (req, res) => {
    const id = uuidParam(req, 'id');

    const listing = row(
      await supabase
        .from('listings')
        .select(`*, agent:users!listings_agent_id_fkey(${AGENT_REF})`)
        .eq('id', id)
        .maybeSingle()
    );

    if (!listing) throw new HttpError(404, 'Listing not found');
    res.status(200).json({ listing: serializeListing(listing) });
  },
});
