import assert from 'node:assert/strict';
import { after, mock, test } from 'node:test';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import the real API with isolated configuration. No request may reach a live service.
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'smoke-test-placeholder';
process.env.JWT_SECRET = 'smoke-test-placeholder-for-session-signing';
mock.method(globalThis, 'fetch', async () => {
  throw new Error('Network access is disabled during API smoke tests');
});
after(() => mock.restoreAll());

const { default: router } = await import('../api/router.js');
const { setSession } = await import('../api/_lib/auth.js');
const { createCustomerSchema, listingsQuerySchema } = await import('../api/_lib/schemas.js');

function captureResponse() {
  const result = {
    status: 200,
    headers: {} as Record<string, string>,
    body: {} as Record<string, unknown>,
  };
  const response = {
    status(code: number) {
      result.status = code;
      return response;
    },
    setHeader(name: string, value: string) {
      result.headers[name] = value;
      return response;
    },
    json(body: Record<string, unknown>) {
      result.body = body;
      return response;
    },
  };
  return { result, response: response as unknown as VercelResponse };
}

async function request(
  path: string,
  method = 'GET',
  options: { body?: unknown; query?: Record<string, string>; cookie?: string } = {}
) {
  const req = {
    method,
    query: { __path: path, ...options.query },
    body: options.body,
    headers: options.cookie ? { cookie: options.cookie } : {},
    url: `/api/${path}`,
    socket: {},
  } as unknown as VercelRequest;
  const { result, response } = captureResponse();
  await router(req, response);
  return result;
}

test('the API starts and dispatches rewritten paths and HTTP methods', async () => {
  const health = await request('health');
  assert.equal(health.status, 200);
  assert.equal(health.body.status, 'ok');

  const unsupported = await request('health', 'POST');
  assert.equal(unsupported.status, 405);
  assert.equal(unsupported.headers.Allow, 'GET');
  assert.deepEqual((await request('unknown')).body, { error: 'Not found' });
  assert.equal((await request('unknown')).status, 404);
});

test('agent reads and writes reject anonymous requests before accessing the database', async () => {
  const routes = [
    ['auth/me', 'GET'],
    ['auth/profile', 'PUT'],
    ['agent/listings', 'GET'],
    ['agent/listings', 'POST'],
    ['agent/listings/bad-id', 'PUT'],
    ['agent/listings/bad-id', 'DELETE'],
    ['agent/listings/bad-id/status', 'PATCH'],
    ['agent/customers', 'GET'],
    ['agent/customers', 'POST'],
    ['agent/customers/bad-id', 'PUT'],
    ['agent/customers/bad-id', 'DELETE'],
    ['agent/inquiries', 'GET'],
  ];
  for (const [path, method] of routes) {
    assert.equal((await request(path, method)).status, 401, `${method} /api/${path}`);
  }
});

test('invalid public inputs return validation errors before accessing the database', async () => {
  assert.equal((await request('listings/bad-id')).status, 400);
  assert.equal((await request('listings', 'GET', { query: { page: '0' } })).status, 400);
  assert.equal((await request('listings', 'GET', { query: { limit: '101' } })).status, 400);
  assert.equal((await request('inquiries', 'POST', { body: {} })).status, 400);
});

test('sessions use HTTP-only cookies, reject tampering, and clear on logout', async () => {
  const { result, response } = captureResponse();
  await setSession(response, '00000000-0000-4000-8000-000000000001');
  assert.match(result.headers['Set-Cookie'], /HttpOnly/);
  assert.match(result.headers['Set-Cookie'], /SameSite=Lax/);

  const cookie = result.headers['Set-Cookie'].split(';')[0];
  const [header, payload, signature] = cookie.split('.');
  const tampered = `${header}.${payload}.${signature[0] === 'A' ? 'B' : 'A'}${signature.slice(1)}`;
  assert.equal((await request('auth/me', 'GET', { cookie: tampered })).status, 401);

  const logout = await request('auth/logout', 'POST');
  assert.equal(logout.status, 200);
  assert.match(logout.headers['Set-Cookie'], /Max-Age=0/);
});

test('API schemas accept empty listing filters and the customer form date format', () => {
  const filters = listingsQuerySchema.parse({
    minPrice: '', maxPrice: '', beds: '', status: '', page: '', limit: '',
  });
  assert.equal(filters.minPrice, undefined);
  assert.equal(filters.maxPrice, undefined);
  assert.equal(filters.beds, undefined);
  assert.equal(filters.status, 'active');
  assert.equal(filters.page, 1);
  assert.equal(filters.limit, 12);

  const customer = createCustomerSchema.parse({
    firstName: 'Test',
    lastName: 'Customer',
    email: 'TEST@example.com',
    phone: '5555555555',
    purchaseDate: '2026-07-31',
  });
  assert.equal(customer.purchaseDate, '2026-07-31T00:00:00.000Z');
  assert.equal(customer.email, 'test@example.com');
});
