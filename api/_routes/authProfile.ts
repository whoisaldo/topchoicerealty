import { HttpError, route, row } from '../_lib/http.js';
import { requireUser } from '../_lib/auth.js';
import { supabase } from '../_lib/supabase.js';
import { updateProfileSchema } from '../_lib/schemas.js';
import { profileUpdate, serializeUser } from '../_lib/serialize.js';

export default route({
  PUT: async (req, res) => {
    const user = await requireUser(req);
    const updates = profileUpdate(updateProfileSchema.parse(req.body));

    if (Object.keys(updates).length === 0) {
      res.status(200).json({ user: serializeUser(user) });
      return;
    }

    const updated = row(
      await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select('id, email, name, phone, photo_url, bio, role, created_at')
        .maybeSingle()
    );

    if (!updated) throw new HttpError(404, 'User not found');
    res.status(200).json({ user: serializeUser(updated) });
  },
});
