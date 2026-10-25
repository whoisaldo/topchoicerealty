import { z } from 'zod';

// Ported from the old apps/api/src/utils/validators.ts so the accepted input is
// unchanged, apart from the purchaseDate fix noted below.

const email = z.string().email('Invalid email address').toLowerCase().trim();

const phone = z
  .string()
  .trim()
  .refine((value) => value.replace(/\D/g, '').length >= 10, 'Invalid phone number');

/**
 * Both customer forms use `<input type="date">`, which yields "YYYY-MM-DD", but the old
 * server required a full ISO-8601 datetime — so every customer save with a date 400'd.
 * Accepting both fixes that without touching the forms.
 */
const dateString = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date')
  .transform((value) => new Date(value).toISOString());

const uuid = z.string().uuid('Invalid ID format');

export const loginSchema = z.object({
  email,
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: phone.optional(),
  photoUrl: z.string().url('Invalid URL').optional(),
  bio: z.string().trim().max(500).optional(),
});

// The filter bar sends "" for every field the user hasn't set, so an empty string has
// to mean "absent" rather than fail as a malformed number.
const blankToUndefined = (value: unknown) =>
  value === '' || value === null || value === undefined ? undefined : value;

const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess((value) => {
    const present = blankToUndefined(value);
    return present === undefined ? undefined : Number(present);
  }, schema.optional());

const numberWithDefault = (schema: z.ZodNumber, fallback: number) =>
  z.preprocess((value) => {
    const present = blankToUndefined(value);
    return present === undefined ? undefined : Number(present);
  }, schema.default(fallback));

export const listingsQuerySchema = z.object({
  q: z.string().trim().optional(),
  minPrice: optionalNumber(z.number().min(0)),
  maxPrice: optionalNumber(z.number().min(0)),
  beds: optionalNumber(z.number().min(0)),
  neighborhood: z.string().trim().optional(),
  status: z.preprocess(blankToUndefined, z.enum(['active', 'pending', 'sold']).default('active')),
  page: numberWithDefault(z.number().int().min(1), 1),
  limit: numberWithDefault(z.number().int().min(1).max(100), 12),
});

export const createListingSchema = z.object({
  title: z.string().trim().min(5).max(200),
  address: z.string().trim().min(5),
  neighborhood: z.string().trim().min(2),
  price: z.number().positive().max(1_000_000_000),
  beds: z.number().int().min(0).max(20),
  baths: z.number().min(0).max(20),
  sqft: z.number().positive().max(100_000),
  description: z.string().trim().min(20).max(5000),
  imageUrls: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required').max(20),
  status: z.enum(['active', 'pending', 'sold']).default('active'),
});

export const updateListingSchema = createListingSchema.partial();

export const updateListingStatusSchema = z.object({
  status: z.enum(['active', 'pending', 'sold']),
});

export const customersQuerySchema = z.object({
  q: z.string().trim().optional(),
});

export const createCustomerSchema = z.object({
  firstName: z.string().trim().min(2).max(50),
  lastName: z.string().trim().min(2).max(50),
  email,
  phone,
  address: z.string().trim().max(200).optional(),
  purchaseDate: dateString.optional(),
  purchasePrice: z.number().positive().max(1_000_000_000).optional(),
  notes: z.string().trim().max(1000).optional(),
  listingId: uuid.optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createInquirySchema = z.object({
  listingId: uuid,
  name: z.string().trim().min(2).max(100),
  email,
  phone: phone.optional(),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000),
});
