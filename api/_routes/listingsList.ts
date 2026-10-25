import { route, rows } from '../_lib/http.js';
import { AGENT_REF, supabase } from '../_lib/supabase.js';
import { listingsQuerySchema } from '../_lib/schemas.js';
import { ilikeAny } from '../_lib/search.js';
import { serializeListing } from '../_lib/serialize.js';

export default route({
  GET: async (req, res) => {
    const { q, minPrice, maxPrice, beds, neighborhood, status, page, limit } =
      listingsQuerySchema.parse(req.query);

    let query = supabase
      .from('listings')
      .select(`*, agent:users!listings_agent_id_fkey(${AGENT_REF})`, { count: 'exact' })
      .eq('status', status);

    if (q) query = query.or(ilikeAny(['title', 'address', 'description'], q));
    if (minPrice !== undefined) query = query.gte('price', minPrice);
    if (maxPrice !== undefined) query = query.lte('price', maxPrice);
    if (beds !== undefined) query = query.gte('beds', beds);
    if (neighborhood) query = query.eq('neighborhood', neighborhood);

    const offset = (page - 1) * limit;
    const result = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const total = result.count ?? 0;
    res.status(200).json({
      listings: rows(result).map(serializeListing),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  },
});
