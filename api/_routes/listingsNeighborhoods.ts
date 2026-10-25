import { route, rows } from '../_lib/http.js';
import { supabase } from '../_lib/supabase.js';

export default route({
  GET: async (_req, res) => {
    // Matches the old Listing.distinct('neighborhood'): every neighborhood, not just
    // the ones with an active listing.
    const listings = rows(await supabase.from('listings').select('neighborhood'));
    const unique = new Set(listings.map((listing) => listing.neighborhood as string));
    res.status(200).json({ neighborhoods: [...unique].sort() });
  },
});
