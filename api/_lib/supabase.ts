import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';
import type { Database } from './database.types.js';

// Service role: every table has RLS enabled with no policies, so this key is the only
// way in. It must never reach the browser — the React app talks to these functions,
// never to Supabase directly.
//
// Regenerate the types after any migration:
//   supabase gen types typescript --linked > api/_lib/database.types.ts
export const supabase = createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** Columns embedded for a listing's agent. Mirrors the old .populate() projection. */
export const AGENT_REF = 'id, name, email, phone, photo_url, bio';

/** Columns embedded for a customer's linked listing. */
export const LISTING_REF = 'id, title, address, price';
