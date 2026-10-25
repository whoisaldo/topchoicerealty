/**
 * Postgres rows (snake_case, uuid `id`) -> the JSON shapes the React app already expects,
 * and request bodies (camelCase) -> columns.
 *
 * The old API was inconsistent: `serializeUser` emitted `id`, while `GET /agents` and
 * every listing/customer response carried Mongo's `_id`. Rather than change ~10
 * components, both keys are emitted. `apps/web/src/lib/types.ts` is unchanged.
 */
import type { z } from 'zod';
import type { Database } from './database.types.js';
import type {
  createCustomerSchema,
  createListingSchema,
  updateProfileSchema,
} from './schemas.js';

type Row = Record<string, any>;

const optional = <T>(value: T | null | undefined): T | undefined => value ?? undefined;

const num = (value: unknown): number => Number(value);

const optionalNum = (value: unknown): number | undefined =>
  value === null || value === undefined ? undefined : Number(value);

export function serializeUser(row: Row) {
  return {
    id: row.id,
    _id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    photoUrl: optional(row.photo_url),
    bio: optional(row.bio),
    role: row.role,
    createdAt: row.created_at,
  };
}

/** The embedded agent on a listing — the old `.populate('agentId', ...)` shape. */
function serializeAgentRef(row: Row) {
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    photoUrl: optional(row.photo_url),
    bio: optional(row.bio),
  };
}

function serializeListingRef(row: Row) {
  return {
    id: row.id,
    _id: row.id,
    title: row.title,
    address: row.address,
    price: num(row.price),
  };
}

export function serializeListing(row: Row) {
  return {
    id: row.id,
    _id: row.id,
    title: row.title,
    address: row.address,
    neighborhood: row.neighborhood,
    price: num(row.price),
    beds: num(row.beds),
    baths: num(row.baths),
    sqft: num(row.sqft),
    description: row.description,
    imageUrls: row.image_urls ?? [],
    status: row.status,
    // Populated object on public routes, bare id on /agent/listings — matching the
    // frontend's `agentId: User | string` union.
    agentId: row.agent ? serializeAgentRef(row.agent) : row.agent_id,
    customerId: optional(row.customer_id),
    soldDate: optional(row.sold_date),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function serializeCustomer(row: Row) {
  return {
    id: row.id,
    _id: row.id,
    agentId: row.agent_id,
    listingId: row.listing ? serializeListingRef(row.listing) : optional(row.listing_id),
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    address: optional(row.address),
    purchaseDate: optional(row.purchase_date),
    purchasePrice: optionalNum(row.purchase_price),
    notes: optional(row.notes),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ------------------------------------------------------------ request -> columns

/** Drops keys the caller didn't send, so a partial update leaves other columns alone. */
function prune<T extends object>(row: T): T {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined)) as T;
}

type Tables = Database['public']['Tables'];
type ListingInput = z.infer<typeof createListingSchema>;
type CustomerInput = z.infer<typeof createCustomerSchema>;

export function listingInsert(input: ListingInput, agentId: string): Tables['listings']['Insert'] {
  return {
    title: input.title,
    address: input.address,
    neighborhood: input.neighborhood,
    price: input.price,
    beds: input.beds,
    baths: input.baths,
    sqft: input.sqft,
    description: input.description,
    image_urls: input.imageUrls,
    status: input.status,
    agent_id: agentId,
  };
}

export function listingUpdate(input: Partial<ListingInput>): Tables['listings']['Update'] {
  return prune({
    title: input.title,
    address: input.address,
    neighborhood: input.neighborhood,
    price: input.price,
    beds: input.beds,
    baths: input.baths,
    sqft: input.sqft,
    description: input.description,
    image_urls: input.imageUrls,
    status: input.status,
  });
}

export function customerInsert(
  input: CustomerInput,
  agentId: string
): Tables['customers']['Insert'] {
  return prune({
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    phone: input.phone,
    address: input.address,
    purchase_date: input.purchaseDate,
    purchase_price: input.purchasePrice,
    notes: input.notes,
    listing_id: input.listingId,
    agent_id: agentId,
  });
}

export function customerUpdate(input: Partial<CustomerInput>): Tables['customers']['Update'] {
  return prune({
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    phone: input.phone,
    address: input.address,
    purchase_date: input.purchaseDate,
    purchase_price: input.purchasePrice,
    notes: input.notes,
    listing_id: input.listingId,
  });
}

export function profileUpdate(
  input: z.infer<typeof updateProfileSchema>
): Tables['users']['Update'] {
  return prune({
    name: input.name,
    phone: input.phone,
    photo_url: input.photoUrl,
    bio: input.bio,
  });
}
