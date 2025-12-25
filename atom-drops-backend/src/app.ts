import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { errorHandler } from "./shared/middlewares/error.middleware";
import {
  apiLimiter,
  authLimiter,
} from "./shared/middlewares/rate-limit.middleware";
import authRoutes from "./modules/auth/auth.routes";
import productRoutes from "./modules/products/product.routes";
import orderRoutes from "./modules/orders/order.routes";
import paymentRoutes from "./modules/payments/payment.routes";

const app: Application = express();

// 1. Security Middlewares
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// 2. Rate limiting (only in production to avoid slowing down development)
if (env.NODE_ENV === "production") {
  app.use("/api", apiLimiter);
}

// 3. Body Parsers
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

// 4. Health Check Route
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "Atom Drops Backend is running correctly",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// 5. API Routes
app.use("/api/v1/auth", authLimiter, authRoutes); // Auth routes with stricter rate limiting
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);

// 6. 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// 7. Global Error Handler (must be last)
app.use(errorHandler);

export default app;
