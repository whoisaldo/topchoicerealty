# Top Choice Realty

Real estate web application for property listings and agent management.

## Features

- **Property Listings**: Browse and search available properties with filtering by price, location, bedrooms, etc.
- **Agent Dashboard**: Manage property listings, customer inquiries, and client information
- **Customer Inquiries**: Contact form for potential buyers to reach out about properties
- **Email Notifications**: Automated emails sent to agents when inquiries are submitted
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite (SPA)
- **Backend**: Vercel Serverless Functions (TypeScript)
- **Database**: Supabase Postgres
- **Authentication**: bcrypt password hashing, signed httpOnly session cookie (JWT)
- **Email**: SMTP integration for notifications (optional)

## Layout

```
api/            Serverless API
  router.ts       Single entry point; dispatches on path
  _routes/        One module per endpoint
  _lib/           Supabase client, auth, validation, serializers
apps/web/       React SPA
scripts/seed.ts Seeds Supabase with demo agents and listings
supabase/       SQL migrations
```

Everything under `/api/*` is served by one function. Vercel's Hobby plan caps a
deployment at 12 functions, and there are 15 endpoints, so `vercel.json` rewrites
`/api/(.*)` into `api/router.ts` rather than using one file per route.

## Setup

Use Node.js 22 and pnpm 10. The locked Supabase client requires native WebSocket
support and cannot start on Node.js 20.

```bash
pnpm install
cp env.example .env      # fill in Supabase URL, service role key, JWT secret
pnpm seed                # demo data: 3 agents, 8 listings
```

### Running locally

```bash
vercel dev               # full stack: SPA + /api functions
pnpm dev:web             # frontend only (API calls will fail)
```

Run `pnpm typecheck`, `pnpm test`, `pnpm lint`, and `pnpm build` before opening a
pull request. The API smoke tests use placeholder configuration and block network
access; they do not need a database or SMTP account.

Demo accounts after seeding — password `test12345`:
`john.doe@`, `jane.lee@`, `ola.tleis@` `topchoicerealty.com`.

### Accounts and roles

`users.role` is `agent` or `admin` (a CHECK constraint; there is no third value).

| | `agent` | `admin` |
|---|---|---|
| Own listings / customers | full CRUD | full CRUD |
| **Other agents'** listings, customers, inquiries | no access (404) | full access |
| Listed on the public "Meet Our Team" page | yes | no |

Ownership is enforced by `ownedBy()` in `api/_lib/auth.ts`, which appends
`agent_id = <user>` to a query for agents and leaves it untouched for admins. It is
applied to reads *and* writes — without it an UPDATE or DELETE matching only on `id`
would let any signed-in agent modify another agent's records. Every handler under
`api/_routes/agent*` goes through it; there are no raw `agent_id` filters left.

Create an account with:

```bash
pnpm create-user <email> "<Full Name>" [agent|admin] [phone]
```

It generates a random password and writes it to `.credentials/<email>.txt`
(gitignored, mode 600) rather than printing it. Change it after first login and delete
the file. `pnpm seed` only removes the three demo agents, so accounts made this way
survive a re-seed.

Known gap: the agent Dashboard has no owner column, so an admin sees every agent's
listings in one undifferentiated table. The API returns the owner on each row
(`agentId` is the populated agent object) if you want to surface it.

### Database changes

Migrations live in `supabase/migrations/`. After applying one, regenerate the types
the API is checked against:

```bash
supabase db push
supabase gen types typescript --linked > api/_lib/database.types.ts
```

Every table has RLS enabled with no policies. The API reaches Postgres with the
service role key, which bypasses RLS; the browser never talks to Supabase directly,
so the anon key is unused and no row is reachable without going through the API.
