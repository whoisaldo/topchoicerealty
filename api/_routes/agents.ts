import { route, rows } from '../_lib/http.js';
import { supabase } from '../_lib/supabase.js';
import { serializeUser } from '../_lib/serialize.js';

export default route({
  GET: async (_req, res) => {
    const agents = rows(
      await supabase
        .from('users')
        .select('id, email, name, phone, photo_url, bio, role, created_at')
        .eq('role', 'agent')
        .order('name', { ascending: true })
    );

    res.status(200).json({ agents: agents.map(serializeUser) });
  },
});
