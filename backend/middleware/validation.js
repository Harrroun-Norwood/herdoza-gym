// Simple validation middleware
const validateRegistration = (req, res, next) => {
  const { name, email, contact, membershipType, sessionInfo } = req.body;

  // Basic validation
  if (!name || !email || !contact || !membershipType || !sessionInfo) {
    return res.status(400).json({
      status: "error",
      message: "All fields are required",
    });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid email format",
    });
  }

  // Membership type validation
  const validTypes = ["gym", "mma", "dance"];
  if (!validTypes.includes(membershipType)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid membership type",
    });
  }

  next();
};

const validateAnnouncement = (req, res, next) => {
  const { title, description, date, imageUrl } = req.body;

  // Basic validation
  if (!title || !description || !date || !imageUrl) {
    return res.status(400).json({
      status: "error",
      message: "All fields are required",
    });
  }

  // Title length validation
  if (title.length < 3 || title.length > 100) {
    return res.status(400).json({
      status: "error",
      message: "Title must be between 3 and 100 characters",
    });
  }

  // Description length validation
  if (description.length < 10 || description.length > 500) {
    return res.status(400).json({
      status: "error",
      message: "Description must be between 10 and 500 characters",
    });
  }

  next();
};

const validatePassword = (password) => {
  // At least 8 characters long
  if (password.length < 8) return false;

  // Must contain at least one uppercase letter
  if (!/[A-Z]/.test(password)) return false;

  // Must contain at least one lowercase letter
  if (!/[a-z]/.test(password)) return false;

  // Must contain at least one number
  if (!/[0-9]/.test(password)) return false;

  // Must contain at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

  return true;
};

const passwordValidationMiddleware = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateAnnouncement,
  passwordValidationMiddleware,
};
