const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

// Register new user
router.post("/signup", authController.signup);

// Login user
router.post("/login", authController.login);

// Admin login
router.post("/admin/login", authController.adminLogin);

// Get current user
router.get("/user", authController.getCurrentUser);

// Logout user
router.post("/logout", authController.logout);

module.exports = router;
