const passport = require("passport");
const User = require("../models/User");
const { logger } = require("../utils/logger");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, contactNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      contactNumber,
    });

    await user.save();

    // Log in the user after registration
    req.login(user, (err) => {
      if (err) {
        logger.error("Login error after registration:", err);
        return res
          .status(500)
          .json({ message: "Error logging in after registration" });
      }

      // Return user data without sensitive information
      return res.status(201).json({
        message: "Registration successful",
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    });
  } catch (error) {
    logger.error("Registration error:", error);
    res.status(500).json({
      message: "Error registering user",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        logger.error("Login error:", err);
        return res.status(500).json({ message: "Login error" });
      }

      if (!user) {
        return res
          .status(401)
          .json({ message: info.message || "Invalid credentials" });
      }

      req.login(user, (err) => {
        if (err) {
          logger.error("Session error:", err);
          return res.status(500).json({ message: "Error creating session" });
        }

        // Return user data without sensitive information
        return res.status(200).json({
          message: "Login successful",
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        });
      });
    })(req, res, next);
  } catch (error) {
    logger.error("Unexpected login error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      logger.error("Logout error:", err);
      return res.status(500).json({ message: "Error logging out" });
    }
    req.session.destroy((err) => {
      if (err) {
        logger.error("Session destruction error:", err);
        return res.status(500).json({ message: "Error destroying session" });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });
};

exports.getProfile = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    logger.error("Get profile error:", error);
    res.status(500).json({
      message: "Error fetching profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with admin role
    const admin = await User.findOne({ email, role: "admin" });
    if (!admin) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    // Verify password
    const isValid = await admin.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Send response
    res.json({
      token,
      name: `${admin.firstName} ${admin.lastName}`,
      email: admin.email,
    });
  } catch (error) {
    logger.error("Admin login error:", error);
    res.status(500).json({
      message: "Error during admin login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
