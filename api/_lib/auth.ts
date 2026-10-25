import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SignJWT, jwtVerify } from 'jose';
import { parse, serialize } from 'cookie';
import bcrypt from 'bcryptjs';
import { env } from './env.js';
import { supabase } from './supabase.js';
import { HttpError, row } from './http.js';

// express-session + connect-mongo kept session state in the database and required a
// long-lived process. A signed cookie carries the same single value the old session
// held (`userId`) with nothing to store server-side.
const COOKIE_NAME = 'tcr_session';
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const SALT_ROUNDS = 10;

const secret = new TextEncoder().encode(env.jwtSecret);

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function setSession(res: VercelResponse, userId: string): Promise<void> {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret);

  res.setHeader(
    'Set-Cookie',
    serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: MAX_AGE_SECONDS,
    })
  );
}

export function clearSession(res: VercelResponse): void {
  res.setHeader(
    'Set-Cookie',
    serialize(COOKIE_NAME, '', {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
  );
}

async function sessionUserId(req: VercelRequest): Promise<string | null> {
  const token = parse(req.headers.cookie ?? '')[COOKIE_NAME];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.sub ?? null;
  } catch {
    // Expired or tampered-with cookie is simply "not logged in".
    return null;
  }
}

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  phone: string;
  photo_url: string | null;
  bio: string | null;
  role: string;
  created_at: string;
};

const USER_COLUMNS = 'id, email, name, phone, photo_url, bio, role, created_at';

/** Returns the signed-in user, or null. Never throws for an anonymous request. */
export async function getUser(req: VercelRequest): Promise<AuthUser | null> {
  const userId = await sessionUserId(req);
  if (!userId) return null;

  const { data } = await supabase.from('users').select(USER_COLUMNS).eq('id', userId).maybeSingle();
  return (data as AuthUser | null) ?? null;
}

/** Returns the signed-in user or throws 401 — the old `requireAuth` middleware. */
export async function requireUser(req: VercelRequest): Promise<AuthUser> {
  const user = await getUser(req);
  if (!user) throw new HttpError(401, 'Authentication required');
  return user;
}

/**
 * Admins operate across every agent's data. Regular agents see only their own rows.
 * This is the only privilege the role carries — there is no separate admin surface.
 */
export function isAdmin(user: AuthUser): boolean {
  return user.role === 'admin';
}

/**
 * Restricts a query to rows the user owns, which is what enforces ownership on every
 * agent endpoint. Admins are returned the query untouched, so they reach all rows.
 *
 * Applying this to writes as well as reads matters: without the filter an UPDATE or
 * DELETE matching only on `id` would let any signed-in agent modify another's records.
 */
export function ownedBy<T extends { eq(column: 'agent_id', value: string): T }>(
  query: T,
  user: AuthUser
): T {
  return isAdmin(user) ? query : query.eq('agent_id', user.id);
}

/** Looks up a user by email for login. Returns the row including the password hash. */
export async function findUserForLogin(email: string) {
  const result = await supabase
    .from('users')
    .select(`${USER_COLUMNS}, password_hash`)
    .eq('email', email)
    .maybeSingle();

  return row(result) as (AuthUser & { password_hash: string }) | null;
}
