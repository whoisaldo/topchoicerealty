import { route, rows } from '../_lib/http.js';
import { ownedBy, requireUser } from '../_lib/auth.js';
import { supabase } from '../_lib/supabase.js';

// Inquiries had no read path at all — they were written by POST /api/inquiries and only
// ever surfaced by email. An admin needs to see them, so this exposes them read-only.
const SELECT =
  '*, listing:listings!inquiries_listing_id_fkey(id, title, address), agent:users!inquiries_agent_id_fkey(id, name, email)';

export default route({
  GET: async (req, res) => {
    const user = await requireUser(req);

    const inquiries = rows(
      await ownedBy(supabase.from('inquiries').select(SELECT), user).order('created_at', {
        ascending: false,
      })
    );

    res.status(200).json({
      inquiries: inquiries.map((inquiry) => ({
        id: inquiry.id,
        _id: inquiry.id,
        listingId: inquiry.listing ?? inquiry.listing_id,
        agentId: inquiry.agent ?? inquiry.agent_id,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone ?? undefined,
        message: inquiry.message,
        emailStatus: inquiry.email_status,
        createdAt: inquiry.created_at,
      })),
    });
  },
});
