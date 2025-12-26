import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    product_id: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(10).max(1000).optional(),
  }),
});

export const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().min(10).max(1000).optional(),
  }),
});

export const getProductReviewsSchema = z.object({
  params: z.object({
    productId: z.string().uuid(),
  }),
  query: z.object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("10"),
    rating: z.string().optional(),
  }),
});
