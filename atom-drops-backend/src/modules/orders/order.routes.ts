import { Router } from "express";
import * as orderController from "./order.controller";
import { authenticate } from "../../shared/middlewares/auth.middleware";
import { validate } from "../../shared/middlewares/validate.middleware";
import { createOrderSchema } from "./order.schema";

const router = Router();

// Protect all routes below this line
router.use(authenticate);

router.post("/", validate(createOrderSchema), orderController.createOrder);
router.get("/my", orderController.getMyOrders);

export default router;
