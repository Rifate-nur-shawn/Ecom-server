import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import authRoutes from "./modules/auth/auth.routes";
import productRoutes from "./modules/products/product.routes";
import orderRoutes from "./modules/orders/order.routes";
import paymentRoutes from "./modules/payments/payment.routes";

const app: Application = express();

// 1. Middlewares
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse cookies

// 2. Health Check Route
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Atom Drops Backend is running correctly",
  });
});

// Mount Modules
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);

export default app;
