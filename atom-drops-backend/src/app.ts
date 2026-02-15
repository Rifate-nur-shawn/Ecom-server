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

// Import all route modules
import authRoutes from "./modules/auth/auth.routes";
import productRoutes from "./modules/products/product.routes";
import orderRoutes from "./modules/orders/order.routes";
import paymentRoutes from "./modules/payments/payment.routes";
import addressRoutes from "./modules/addresses/address.routes";
import cartRoutes from "./modules/cart/cart.routes";
import categoryRoutes from "./modules/categories/category.routes";
import reviewRoutes from "./modules/reviews/review.routes";
import adminRoutes from "./modules/admin/admin.routes";

const app: Application = express();
const allowedOrigins = [
  env.FRONTEND_URL,
  ...(env.FRONTEND_URLS
    ? env.FRONTEND_URLS.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : []),
];

// 1. Security Middlewares
app.disable("x-powered-by");
if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet()); // Security headers
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation"));
    },
    credentials: true,
  })
);

// 2. Rate limiting (only in production to avoid slowing down development)
if (env.NODE_ENV === "production") {
  app.use("/api", apiLimiter);
}

// 3. Body Parsers
app.use(express.json({ limit: "1mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "1mb" })); // Parse URL-encoded bodies
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
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/addresses", addressRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/admin", adminRoutes);

// 6. 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// 7. Global Error Handler (must be last)
app.use(errorHandler);

export default app;
