import { z } from 'zod';

export const initPaymentSchema = z.object({
  body: z.object({
    order_id: z.string().uuid("Invalid Order ID"),
  }),
});