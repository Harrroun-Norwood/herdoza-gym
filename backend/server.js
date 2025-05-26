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
        defaultSrc: ["'self'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "'unsafe-hashes'",
          "cdn.jsdelivr.net",
          "cdnjs.cloudflare.com",
        ],
        scriptSrcAttr: ["'unsafe-inline'", "'unsafe-hashes'", "'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "*"],
        imgSrc: ["'self'", "data:", "blob:", "*"],
        fontSrc: ["'self'", "data:", "cdn.jsdelivr.net", "*"],
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

// Serve static files with proper MIME types
const serveStaticWithMime = (directory) => {
  return express.static(path.join(__dirname, "..", directory), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".js") || filePath.endsWith(".mjs")) {
        res.setHeader("Content-Type", "application/javascript; charset=UTF-8");
      } else if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css; charset=UTF-8");
      }
    },
  });
};

// Serve static files for main site and admin
app.use("/", serveStaticWithMime("IPT-TAILWIND"));
app.use("/dist", serveStaticWithMime("IPT-TAILWIND/dist"));
app.use("/assets", serveStaticWithMime("IPT-TAILWIND/assets"));
app.use("/scripts", serveStaticWithMime("IPT-TAILWIND/scripts"));
app.use("/admin", serveStaticWithMime("admin"));

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
    // Set proper MIME types for JavaScript modules
    if (path.endsWith(".js")) {
      res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    }
    // CSS files
    else if (path.endsWith(".css")) {
      res.setHeader("Content-Type", "text/css; charset=utf-8");
    }
    // Images
    else if (path.endsWith(".png")) {
      res.setHeader("Content-Type", "image/png");
    } else if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
      res.setHeader("Content-Type", "image/jpeg");
    } else if (path.endsWith(".svg")) {
      res.setHeader("Content-Type", "image/svg+xml");
    }

    // Set caching headers
    res.setHeader("Cache-Control", "public, max-age=31536000");
  },
};

// Serve IPT-TAILWIND static files
app.use("/IPT-TAILWIND", serveStaticWithMime("IPT-TAILWIND"));
app.use("/admin", serveStaticWithMime("admin"));
app.use("/assets", serveStaticWithMime("IPT-TAILWIND/assets"));
app.use("/scripts", serveStaticWithMime("IPT-TAILWIND/scripts"));
app.use("/dist", serveStaticWithMime("IPT-TAILWIND/dist"));

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
