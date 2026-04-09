const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const connectDB = require("./config/mongodb");
const {resolveTenant} = require("./middleware/tenant.middleware");
const logger = require("./utils/logger");
// Load env variables first before anything else
dotenv.config();

// ── Startup security checks ──
if (!process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET.length < 32) {
  console.error("FATAL: JWT_ACCESS_SECRET must be at least 32 characters. Generate with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"");
  process.exit(1);
}
if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32) {
  console.error("FATAL: JWT_REFRESH_SECRET must be at least 32 characters.");
  process.exit(1);
}

// Connect to MongoDB
connectDB();

const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Set secure HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    frameguard: { action: "deny" },
  })
);

// CORS — must be before rate limiters so preflight OPTIONS aren't rate-limited
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // Allow localhost and any subdomain of localhost
      if (
        origin === process.env.CLIENT_URL ||
        /^https?:\/\/[\w-]+\.localhost(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-vendor-subdomain"],
  })
);

// Rate limiting — max 1000 requests per 15 mins per IP (high for dev/testing)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, 
  message: { message: "Too many auth attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth", authLimiter);


// ============================================
// GENERAL MIDDLEWARE
// ============================================

// Parse incoming JSON bodies
app.use(express.json({ limit: "10kb" })); // limit body size

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Parse cookies (needed for httpOnly JWT cookies)
app.use(cookieParser());

// Compress all responses
app.use(compression());

// HTTP request logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}
app.use(resolveTenant);


// ============================================
// ROUTES
// ============================================

// Health check — to verify server is running
app.get("/api/health", (req, res) => {
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  res.status(200).json({
    status: "ok",
    environment: process.env.NODE_ENV,
    dbStatus: dbStates[mongoose.connection.readyState] || "unknown",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});


// Auth routes (will be added in next step)
app.use("/api/auth", require("./routes/auth.routes"));

app.use("/api/admin/vendors", require("./routes/vendor.routes"));
app.use("/api/store", require("./routes/store.routes")); // public storefront routes


app.use("/api/vendor", require("./routes/vendorSelf.routes"));

app.use("/api/vendor/products", require("./routes/product.routes"));
app.use("/api", require("./routes/storeProduct.routes"));

// Address routes
app.use("/api/addresses", require("./routes/address.routes"));

// Cart routes
app.use("/api/cart", require("./routes/cart.routes"));

// Order routes
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/customer", require("./routes/customerOrder.routes"));

// ============================================
// 404 HANDLER — for undefined routes
// ============================================
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ============================================
// GLOBAL ERROR HANDLER — always keep this last
// ============================================
app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ============================================
// START SERVER + GRACEFUL SHUTDOWN
// ============================================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info("HTTP server closed.");
    mongoose.connection.close(false).then(() => {
      logger.info("MongoDB connection closed.");
      process.exit(0);
    });
  });
  // Force exit after 10 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));