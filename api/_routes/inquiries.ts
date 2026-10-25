import { clientIp, HttpError, route } from '../_lib/http.js';
import { supabase } from '../_lib/supabase.js';
import { createInquirySchema } from '../_lib/schemas.js';
import { sendInquiryEmail } from '../_lib/email.js';
import { rateLimit } from '../_lib/rateLimit.js';
import type { Database } from '../_lib/database.types.js';

// This is the only handler that reads columns off a joined row directly, and the type
// supabase-js infers from an embedded select resolves to `{}` under Vercel's build even
// though it resolves correctly under the repo tsconfig. Stating the shape and asserting
// it keeps both checkers happy; the select below is what has to match it.
type ListingWithAgent = Database['public']['Tables']['listings']['Row'] & {
  agent: { id: string; name: string; email: string } | null;
};

export default route({
  POST: async (req, res) => {
    const input = createInquirySchema.parse(req.body);

    await rateLimit(
      `inquiry:${clientIp(req)}-${input.listingId}`,
      3,
      60 * 60,
      'Too many inquiries for this listing, please try again later'
    );

    const found = await supabase
      .from('listings')
      .select('*, agent:users!listings_agent_id_fkey(id, name, email)')
      .eq('id', input.listingId)
      .maybeSingle();

    if (found.error) throw found.error;
    const listing = found.data as unknown as ListingWithAgent | null;

    if (!listing) throw new HttpError(404, 'Listing not found');
    if (listing.status !== 'active') {
      throw new HttpError(400, 'This listing is no longer accepting inquiries');
    }

    const agent = listing.agent;
    if (!agent) throw new HttpError(500, 'Agent not found');

    const created = await supabase
      .from('inquiries')
      .insert({
        listing_id: listing.id,
        agent_id: agent.id,
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        message: input.message,
        email_status: 'queued',
      })
      .select('id')
      .single();

    if (created.error) throw created.error;
    const inquiryId = (created.data as unknown as { id: string }).id;

    // Delivery failure must not fail the visitor's request — it is recorded on the row.
    const emailStatus = await sendInquiryEmail(
      input,
      {
        id: listing.id,
        title: listing.title,
        address: listing.address,
        neighborhood: listing.neighborhood,
        price: Number(listing.price),
        beds: Number(listing.beds),
        baths: Number(listing.baths),
      },
      agent
    );

    await supabase.from('inquiries').update({ email_status: emailStatus }).eq('id', inquiryId);

    res.status(200).json({ ok: true, inquiry: { id: inquiryId } });
  },
});
