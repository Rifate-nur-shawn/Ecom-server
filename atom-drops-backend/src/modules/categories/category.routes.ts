import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth.middleware";
import { validate } from "../../shared/middlewares/validate.middleware";
import * as categoryController from "./category.controller";
import {
  createCategorySchema,
  updateCategorySchema,
  getCategoryProductsSchema,
} from "./category.schema";

const router = Router();

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/slug/:slug", categoryController.getCategoryBySlug);
router.get("/:id", categoryController.getCategory);
router.get(
  "/:id/products",
  validate(getCategoryProductsSchema),
  categoryController.getCategoryProducts
);

// Admin routes (require authentication)
router.post(
  "/",
  authenticate,
  validate(createCategorySchema),
  categoryController.createCategory
);
router.patch(
  "/:id",
  authenticate,
  validate(updateCategorySchema),
  categoryController.updateCategory
);
router.delete("/:id", authenticate, categoryController.deleteCategory);

export default router;
