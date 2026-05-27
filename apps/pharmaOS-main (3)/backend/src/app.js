import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler } from "./middleware/errorHandler.js";
import { authenticate, setTokenBlacklist } from "./middleware/auth.js";

// Import routes
import authRouter from "./routes/auth.js";
import prescriptionsRouter from "./routes/prescriptions.js";
import cartRouter from "./routes/cart.js";
import { tokenBlacklist } from "./controllers/auth.js";
import productsRouter from "./routes/products.js";
import publicProductsRouter from "./routes/publicProducts.js";
import publicOrderTrackingRouter from "./routes/publicOrderTracking.js";
import ordersRouter from "./routes/orders.js";
import alertsRouter from "./routes/alerts.js";
import transactionsRouter from "./routes/transactions.js";
import analyticsRouter from "./routes/analytics.js";
import importRouter from "./routes/import.js";
import promptRouter from "./routes/prompt.js";
import reportsRouter from "./routes/reports.js";
import customersRouter from "./routes/customers.js";
import suppliersRouter from "./routes/suppliers.js";
import purchasesRouter from "./routes/purchases.js";
import expensesRouter from "./routes/expenses.js";
import incomesRouter from "./routes/incomes.js";
import settingsRouter from "./routes/settings.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(
  /\/$/,
  "",
);
app.use(
  cors({
    origin: [clientUrl, "http://localhost:3000"],
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.disable("etag");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prevent browser caching for API responses to avoid stale 304 responses on dynamic data
app.use("/api", (req, res, next) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// Serve static files from frontend/dist (only in development/monolith mode)
const isProduction = process.env.NODE_ENV === "production";
const frontendPath = path.join(__dirname, "../../../frontend/dist");

if (!isProduction) {
  app.use(express.static(frontendPath));
}

// Health check (public)
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Connect token blacklist to middleware
setTokenBlacklist(tokenBlacklist);

// Auth routes (public — no JWT required)
app.use("/api/auth", authRouter);

// Public products route (no auth required for frontend browsing)
app.use("/api/public/products", publicProductsRouter);

// Public order tracking route (no auth required)
app.use("/api/orders/track", publicOrderTrackingRouter);

// Apply JWT authentication to all remaining API routes
app.use("/api", authenticate);

// Protected API Routes
app.use("/api/cart", cartRouter);
app.use("/api/prescriptions", prescriptionsRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/alerts", alertsRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/import", importRouter);
app.use("/api/prompt", promptRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/customers", customersRouter);
app.use("/api/suppliers", suppliersRouter);
app.use("/api/purchases", purchasesRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/incomes", incomesRouter);
app.use("/api/settings", settingsRouter);

// SPA Fallback: Serve index.html for any non-API routes (only in development/monolith mode)
if (!isProduction) {
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Global error handler (must be last)
app.use(errorHandler);

export default app;
