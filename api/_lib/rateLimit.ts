import { supabase } from './supabase.js';
import { HttpError } from './http.js';

/**
 * express-rate-limit used an in-memory store, which on serverless is per-instance and
 * therefore no limit at all. This keeps the counter in Postgres; the increment and the
 * window roll happen in one statement so concurrent invocations can't both pass.
 */
export async function rateLimit(
  key: string,
  max: number,
  windowSeconds: number,
  message: string
): Promise<void> {
  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_key: key,
    p_max: max,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    // Never let a limiter outage take down the endpoint it protects.
    console.error('Rate limit check failed:', error);
    return;
  }

  if (data === false) throw new HttpError(429, message);
}
