const rateLimit = require("express-rate-limit");

// Generic API rate limiter
const api = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// More strict limiter for authentication routes
const auth = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: "Too many login attempts, please try again after 15 minutes",
});

// Admin panel rate limiter
const admin = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 200, // limit each IP to 200 requests per hour
});

module.exports = {
  api,
  auth,
  admin,
};
