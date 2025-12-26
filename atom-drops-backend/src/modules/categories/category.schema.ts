import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    parent_id: z.string().uuid().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    parent_id: z.string().uuid().optional().nullable(),
  }),
});

export const getCategoryProductsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("20"),
    sortBy: z
      .enum(["price_asc", "price_desc", "newest", "name"])
      .optional()
      .default("newest"),
  }),
});
