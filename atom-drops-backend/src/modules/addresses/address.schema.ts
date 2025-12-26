import { z } from 'zod';

export const createAddressSchema = z.object({
  body: z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().regex(/^01\d{9}$/, 'Invalid Bangladesh phone number'),
    address_line1: z.string().min(5, 'Address is too short'),
    address_line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    postal_code: z.string().min(4),
    country: z.string().default('Bangladesh'),
    is_default: z.boolean().default(false),
  }),
});

export const updateAddressSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    full_name: z.string().min(2).optional(),
    phone: z.string().regex(/^01\d{9}$/).optional(),
    address_line1: z.string().min(5).optional(),
    address_line2: z.string().optional(),
    city: z.string().min(2).optional(),
    state: z.string().min(2).optional(),
    postal_code: z.string().min(4).optional(),
    country: z.string().optional(),
    is_default: z.boolean().optional(),
  }),
});
