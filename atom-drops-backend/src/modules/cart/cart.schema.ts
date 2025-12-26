import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().min(1).max(99).default(1),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    itemId: z.string().uuid(),
  }),
  body: z.object({
    quantity: z.number().int().min(0).max(99),
  }),
});
