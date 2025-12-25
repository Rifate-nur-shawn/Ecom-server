import { Router } from "express";
import * as paymentController from "./payment.controller";
import { authenticate } from "../../shared/middlewares/auth.middleware";
import { validate } from "../../shared/middlewares/validate.middleware";
import { initPaymentSchema } from "./payment.schema";

const router = Router();

// Start Payment (Requires Login)
router.post(
  "/init",
  authenticate,
  validate(initPaymentSchema),
  paymentController.initPayment
);

// bKash Callback (Public - bKash server calls this, or user is redirected here)
router.get("/bkash/callback", paymentController.bkashCallback);

// Mock Page (For testing only)
router.get("/mock-bkash-page", paymentController.mockBkashPage);

export default router;
