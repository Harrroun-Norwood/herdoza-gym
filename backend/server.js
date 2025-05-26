require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { doubleCsrf } = require("csrf-csrf");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const { connectDB } = require("./config/db");
const { logger } = require("./utils/logger");
const limiters = require("./middleware/rateLimiter");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Production specific middleware
if (process.env.NODE_ENV === "production") {
  // Trust proxy (important for secure cookies behind a proxy)
  app.set("trust proxy", 1);

  // Serve static files from the frontend build
  app.use(express.static(path.join(__dirname, "../IPT-TAILWIND/dist")));
}

// Security headers
app.use(helmet());

// CSRF Protection
const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || "your-secret-key",
  cookieName: "x-csrf-token",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
});

// Connect to MongoDB
connectDB()
  .then(() => console.log("Database connection established"))
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5173", // Vite frontend default
    "http://localhost:5174", // Potential secondary Vite port
    "http://localhost:3000", // Local backend
    "http://localhost:3001", // Static admin panel
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:5500", // VS Code Live Server
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:
        process.env.MONGODB_URI || "mongodb://localhost:27017/herdoza_fitness",
      ttl: 24 * 60 * 60, // Session TTL in seconds (1 day)
      touchAfter: 24 * 3600, // Time period in seconds between session updates
      collectionName: "sessions",
      autoRemove: "native", // Use MongoDB's TTL index
      crypto: {
        secret: false, // Disable crypto since we're using express-session's secret
      },
      autoCreate: true, // Automatically create the sessions collection
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport");

// Add CSRF protection after session middleware
app.use(doubleCsrfProtection);

// Generate CSRF token endpoint
app.get("/api/csrf-token", (req, res) => {
  res.json({ token: generateToken(req, res) });
});

// Health check endpoint for Render
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "healthy", environment: process.env.NODE_ENV });
});

// Apply rate limiting to different route groups
app.use("/api/auth", limiters.auth);
app.use("/api/admin", limiters.admin);
app.use("/api", limiters.api);

// Routes
app.use("/api/registration", require("./routes/registration"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/members", require("./routes/members"));
app.use("/api/booking", require("./routes/booking"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({
    status: "error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
