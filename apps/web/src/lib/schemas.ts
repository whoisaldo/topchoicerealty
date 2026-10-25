import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const createListingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  address: z.string().min(5, 'Address is required'),
  neighborhood: z.string().min(2, 'Neighborhood is required'),
  price: z.number().positive('Price must be positive'),
  beds: z.number().int().min(0, 'Beds must be non-negative'),
  baths: z.number().min(0, 'Baths must be non-negative'),
  sqft: z.number().positive('Square footage must be positive'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  imageUrls: z.array(z.string().url()).min(1, 'At least one image is required'),
  status: z.enum(['active', 'pending', 'sold']).default('active'),
});

// Form-facing variant: image URLs are edited as newline-separated text and
// converted to the imageUrls array on submit.
export const listingFormSchema = createListingSchema.omit({ imageUrls: true }).extend({
  imageUrlsText: z.string().min(1, 'At least one image URL is required'),
});

export const createInquirySchema = z.object({
  listingId: z.string().uuid('Invalid listing ID'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-+()]+$/.test(val),
      'Invalid phone number format'
    ),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  photoUrl: z.union([z.string().url('Must be a valid URL'), z.literal('')]).optional(),
  bio: z.string().max(500).optional(),
});

// number inputs registered with valueAsNumber produce NaN when left empty;
// treat that as "not provided" for optional prices.
const optionalPositivePrice = z.preprocess(
  (value) => (typeof value === 'number' && Number.isNaN(value) ? undefined : value),
  z.number().positive('Price must be positive').optional()
);

export const customerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone number is required'),
  address: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: optionalPositivePrice,
  notes: z.string().optional(),
});

// Stricter variant used when capturing the buyer as a listing is marked sold.
export const customerSaleSchema = customerSchema.extend({
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  purchasePrice: z
    .number({ invalid_type_error: 'Sale price is required' })
    .positive('Price must be positive'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type ListingFormInput = z.infer<typeof listingFormSchema>;
export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type CustomerSaleInput = z.infer<typeof customerSaleSchema>;
