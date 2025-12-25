import { Router } from "express";
import * as productController from "./product.controller";
import { authenticate } from "../../shared/middlewares/auth.middleware";
import { validate } from "../../shared/middlewares/validate.middleware";
import { createProductSchema } from "./product.schema";

const router = Router();

// Public: Everyone can see products
router.get("/", productController.getProducts);

// Protected: Admin/Authenticated users can create products
router.post(
  "/",
  authenticate,
  validate(createProductSchema),
  productController.createProduct
);

export default router;
