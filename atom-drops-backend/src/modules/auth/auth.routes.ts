import { Router } from "express";
import * as authController from "./auth.controller";
import { validate } from "../../shared/middlewares/validate.middleware";
import { registerSchema, loginSchema } from "./auth.schema";

const router = Router();

// Make sure validate is imported and used correctly
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

// Test without validation
// router.post("/register", authController.register);
// router.post("/login", authController.login);

export default router;
