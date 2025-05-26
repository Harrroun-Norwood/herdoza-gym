const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

// Register new user
router.post("/signup", authController.register);

// Login user
router.post("/login", authController.login);

// Admin login
router.post("/admin/login", authController.adminLogin);

// Get current user
router.get("/user", authController.getProfile);

// Logout user
router.post("/logout", authController.logout);

module.exports = router;
