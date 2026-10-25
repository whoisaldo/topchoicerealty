import type { VercelRequest, VercelResponse } from '@vercel/node';

import health from './_routes/health.js';
import agents from './_routes/agents.js';
import inquiries from './_routes/inquiries.js';
import authLogin from './_routes/authLogin.js';
import authLogout from './_routes/authLogout.js';
import authMe from './_routes/authMe.js';
import authProfile from './_routes/authProfile.js';
import listingsList from './_routes/listingsList.js';
import listingsNeighborhoods from './_routes/listingsNeighborhoods.js';
import listingDetail from './_routes/listingDetail.js';
import agentListings from './_routes/agentListings.js';
import agentListingDetail from './_routes/agentListingDetail.js';
import agentListingStatus from './_routes/agentListingStatus.js';
import agentCustomers from './_routes/agentCustomers.js';
import agentCustomerDetail from './_routes/agentCustomerDetail.js';
import agentInquiries from './_routes/agentInquiries.js';

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<unknown> | unknown;

/**
 * Single entry point for the whole API.
 *
 * Vercel's Hobby plan allows 12 serverless functions per deployment and the API has 15
 * endpoints, so filesystem routing (one file per endpoint) can't be used. Each handler
 * still lives in its own module under _routes/; this only dispatches to them.
 *
 * Requests arrive through the `/api/(.*)` rewrite in vercel.json, which passes the
 * matched path as `__path`. A file-based catch-all (`api/[...path].ts`) does not work
 * here: the legacy api/ builder compiles it to `^/api/([^/]+)$`, so anything nested
 * 404s before reaching the function.
 *
 * A ':id' segment binds that path segment to req.query.id, which is what the handlers
 * read via uuidParam().
 */
const ROUTES: Array<[string, Handler]> = [
  ['health', health],
  ['agents', agents],
  ['inquiries', inquiries],
  ['auth/login', authLogin],
  ['auth/logout', authLogout],
  ['auth/me', authMe],
  ['auth/profile', authProfile],
  ['listings', listingsList],
  ['listings/neighborhoods', listingsNeighborhoods],
  ['listings/:id', listingDetail],
  ['agent/listings', agentListings],
  ['agent/listings/:id', agentListingDetail],
  ['agent/listings/:id/status', agentListingStatus],
  ['agent/customers', agentCustomers],
  ['agent/customers/:id', agentCustomerDetail],
  ['agent/inquiries', agentInquiries],
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  const routed = req.query.__path;
  const raw = Array.isArray(routed) ? routed[0] : routed;
  const segments = (raw ?? '').split('/').filter(Boolean).map(decodeURIComponent);

  for (const [pattern, route] of ROUTES) {
    const parts = pattern.split('/');
    if (parts.length !== segments.length) continue;

    let id: string | undefined;
    const matched = parts.every((part, index) => {
      if (part === ':id') {
        id = segments[index];
        return true;
      }
      return part === segments[index];
    });

    if (!matched) continue;
    if (id !== undefined) req.query.id = id;
    return route(req, res);
  }

  res.status(404).json({ error: 'Not found' });
}
