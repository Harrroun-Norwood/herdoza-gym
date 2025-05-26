require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const { connectDB } = require("./config/db");
const { logger } = require("./utils/logger");
const limiters = require("./middleware/rateLimiter");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy in production
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Security headers with correct CSP for images and assets
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "'unsafe-hashes'",
          "*",
        ],
        scriptSrcAttr: ["'unsafe-inline'", "'unsafe-hashes'"],
        styleSrc: ["'self'", "'unsafe-inline'", "*"],
        imgSrc: ["'self'", "data:", "blob:", "*"],
        fontSrc: ["'self'", "data:", "*"],
        connectSrc: ["'self'", "*"],
        mediaSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://herdoza-fitness-gym.onrender.com",
      "https://herdoza-gym.onrender.com",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:3001",
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving with caching
const cacheTime = process.env.NODE_ENV === "production" ? 86400000 : 0; // 1 day in production
const staticOptions = {
  maxAge: cacheTime,
  etag: true,
  index: false,
  setHeaders: (res, path) => {
    if (path.endsWith(".css")) {
      res.setHeader("Content-Type", "text/css");
    }
    if (path.endsWith(".js")) {
      res.setHeader("Content-Type", "application/javascript");
    }
    if (path.endsWith(".png")) {
      res.setHeader("Content-Type", "image/png");
    }
    if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
      res.setHeader("Content-Type", "image/jpeg");
    }
    if (path.endsWith(".svg")) {
      res.setHeader("Content-Type", "image/svg+xml");
    }
  },
};

// Serve frontend static files and assets
app.use(
  express.static(path.join(__dirname, "../IPT-TAILWIND/dist"), staticOptions)
);
app.use(
  "/assets",
  express.static(
    path.join(__dirname, "../IPT-TAILWIND/dist/assets"),
    staticOptions
  )
);

// Serve admin files
app.use(
  "/admin",
  express.static(path.join(__dirname, "../admin"), staticOptions)
);
app.use(
  "/admin/dist",
  express.static(path.join(__dirname, "../admin/dist"), staticOptions)
);
app.use(
  "/admin/style",
  express.static(path.join(__dirname, "../admin/style"), staticOptions)
);
app.use(
  "/admin/javascript",
  express.static(path.join(__dirname, "../admin/javascript"), staticOptions)
);
app.use(
  "/admin/assets",
  express.static(path.join(__dirname, "../admin/assets"), staticOptions)
);

// Set proper MIME types
app.use(
  express.static("public", {
    setHeaders: (res, path) => {
      if (path.endsWith(".js") || path.endsWith(".mjs")) {
        res.setHeader("Content-Type", "application/javascript");
      } else if (path.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    },
  })
);

// Serve admin static files with proper MIME types
app.use(
  "/admin",
  express.static("admin", {
    setHeaders: (res, path) => {
      if (path.endsWith(".js") || path.endsWith(".mjs")) {
        res.setHeader("Content-Type", "application/javascript");
      } else if (path.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    },
  })
);

// API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/bookings", require("./routes/booking"));
app.use("/api/members", require("./routes/members"));
app.use("/api/registrations", require("./routes/registration"));
app.use("/api/users", require("./routes/user"));

// Admin routes
app.get(["/admin", "/admin/*"], (req, res) => {
  res.sendFile(
    path.join(__dirname, "../admin/dist/admin_login_interface.html")
  );
});

// Admin routes
app.get(["/admin", "/admin/*"], (req, res) => {
  if (
    req.path.startsWith("/admin/javascript/") ||
    req.path.startsWith("/admin/style/") ||
    req.path.startsWith("/admin/assets/")
  ) {
    return; // Let static routes handle themselves
  }
  res.sendFile(path.join(__dirname, "../admin/admin_login_interface.html"));
});

// Frontend routes - serve index.html for client-side routing
app.get("*", (req, res) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/admin")) {
    return; // Let API and admin routes handle themselves
  }
  res.sendFile(path.join(__dirname, "../IPT-TAILWIND/dist/index.html"));
});

// Connect to MongoDB
connectDB()
  .then(() => console.log("Database connection established"))
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
