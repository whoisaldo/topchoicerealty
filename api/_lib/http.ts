import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<unknown> | unknown;

/**
 * Dispatches by HTTP method and normalises every failure to `{ error: string }`,
 * which is the shape every call site in the React app reads
 * (`error.response?.data?.error`).
 */
export function route(handlers: Partial<Record<string, Handler>>) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const handler = handlers[req.method ?? ''];
    if (!handler) {
      res.setHeader('Allow', Object.keys(handlers).join(', '));
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      await handler(req, res);
    } catch (err) {
      if (err instanceof ZodError) {
        const issue = err.issues[0];
        const path = issue.path.join('.');
        res.status(400).json({ error: path ? `${path}: ${issue.message}` : issue.message });
        return;
      }
      if (err instanceof HttpError) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      // Invalid UUID in a path segment. The old API surfaced Mongoose's CastError
      // here as a 400; without that, a malformed id would come back as a 500.
      if (isPostgresError(err, '22P02')) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
      }
      console.error(`${req.method} ${req.url} failed:`, err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

function isPostgresError(err: unknown, code: string): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === code;
}

/**
 * Read helpers.
 *
 * These deliberately type rows as `Record<string, any>` rather than leaning on
 * supabase-js's select-string inference: that inference resolves correctly under this
 * repo's tsconfig but collapses to `{}` under Vercel's build, which turns every
 * `.map()` and field access into a build-time error. Reads flow straight into the
 * serializers, which accept exactly this shape, so nothing is lost — writes still go
 * through the fully typed `listingInsert`/`customerUpdate`/... builders.
 */
export type DbRow = Record<string, any>;

/** A list result. */
export function rows(result: { data: unknown; error: unknown }): DbRow[] {
  if (result.error) throw result.error;
  return (result.data ?? []) as DbRow[];
}

/** A `.maybeSingle()` result, where a missing row is valid. */
export function row(result: { data: unknown; error: unknown }): DbRow | null {
  if (result.error) throw result.error;
  return (result.data ?? null) as DbRow | null;
}

/** A `.single()` result, where a missing row means something is wrong. */
export function requiredRow(result: { data: unknown; error: unknown }): DbRow {
  const found = row(result);
  if (!found) throw new Error('Expected a row from the database');
  return found;
}

/** Reads a single-value path/query param. */
export function param(req: VercelRequest, name: string): string {
  const value = req.query[name];
  const single = Array.isArray(value) ? value[0] : value;
  if (!single) throw new HttpError(400, `Missing ${name}`);
  return single;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Path ids are validated up front so a bad id is a clean 400, not a database round trip. */
export function uuidParam(req: VercelRequest, name: string): string {
  const value = param(req, name);
  if (!UUID_RE.test(value)) throw new HttpError(400, 'Invalid ID format');
  return value;
}

/** Client IP, used to key rate limits. */
export function clientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return raw?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
}
