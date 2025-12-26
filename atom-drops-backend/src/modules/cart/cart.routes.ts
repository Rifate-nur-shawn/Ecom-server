import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth.middleware";
import { validate } from "../../shared/middlewares/validate.middleware";
import * as cartController from "./cart.controller";
import { addToCartSchema, updateCartItemSchema } from "./cart.schema";

const router = Router();

router.use(authenticate);

router.get("/", cartController.getCart);
router.post("/items", validate(addToCartSchema), cartController.addToCart);
router.patch(
  "/items/:itemId",
  validate(updateCartItemSchema),
  cartController.updateCartItem
);
router.delete("/items/:itemId", cartController.removeFromCart);
router.delete("/", cartController.clearCart);

export default router;
