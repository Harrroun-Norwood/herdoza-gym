const express = require("express");
const router = express.Router();
const User = require("../models/User");

/**
 * Middleware to ensure user is authenticated
 */
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized access" });
};

/**
 * GET /api/user/profile
 * Get current user profile
 */
router.get("/profile", isAuthenticated, async (req, res) => {
  try {
    // User is already attached to req by Passport
    // Remove sensitive info before sending
    const user = req.user;
    const userProfile = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      displayName: user.displayName,
      contactNumber: user.contactNumber,
      profilePicture: user.profilePicture,
      membershipStatus: user.membershipStatus,
      membershipExpiry: user.membershipExpiry,
      membershipType: user.membershipType,
      trainerSessions: user.trainerSessions || {
        total: 0,
        used: 0,
        remaining: 0,
      },
    };

    res.status(200).json({ user: userProfile });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/user/update-membership
 * Update user membership status
 */
router.post("/update-membership", isAuthenticated, async (req, res) => {
  try {
    const {
      type,
      duration,
      fee,
      hasTrainer,
      paymentMethod,
      status = "paid",
    } = req.body;
    const userId = req.user._id;

    // Get the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate expiry date
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(expiryDate.getDate() + duration);

    // Create membership history entry
    const membershipEntry = {
      type,
      startDate: now,
      endDate: expiryDate,
      fee,
      paymentMethod,
      paymentStatus: status,
      hasTrainer: hasTrainer || false,
    };

    // Add to membership history
    if (!user.membershipHistory) {
      user.membershipHistory = [];
    }
    user.membershipHistory.push(membershipEntry);

    // Update current membership status
    if (status === "paid") {
      user.membershipStatus = "active";
      user.membershipExpiry = expiryDate;
      user.membershipType = type;

      // Handle trainer sessions if applicable
      if (hasTrainer) {
        if (!user.trainerSessions) {
          user.trainerSessions = {
            total: 0,
            used: 0,
            remaining: 0,
          };
        }

        // For 25-session package
        if (type === "trainer-25") {
          user.trainerSessions.total += 25;
          user.trainerSessions.remaining += 25;
        }

        // For single session
        if (type === "trainer-single") {
          user.trainerSessions.total += 1;
          user.trainerSessions.remaining += 1;
        }
      }
    } else {
      // If it's pending payment, mark it accordingly
      user.membershipStatus = "pending";
    }

    await user.save();

    res.status(200).json({
      message: "Membership updated successfully",
      membership: {
        status: user.membershipStatus,
        expiry: user.membershipExpiry,
        type: user.membershipType,
        trainerSessions: user.trainerSessions,
      },
    });
  } catch (error) {
    console.error("Error updating membership:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/user/trainer-session/use
 * Mark a trainer session as used
 */
router.post("/trainer-session/use", isAuthenticated, async (req, res) => {
  try {
    const { trainer, notes } = req.body;
    const userId = req.user._id;

    // Get the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has trainer sessions
    if (!user.trainerSessions || user.trainerSessions.remaining <= 0) {
      return res.status(400).json({ message: "No trainer sessions available" });
    }

    // Record the session usage
    user.trainerSessions.used += 1;
    user.trainerSessions.remaining -= 1;

    // Add to history
    if (!user.trainerSessions.history) {
      user.trainerSessions.history = [];
    }

    user.trainerSessions.history.push({
      date: new Date(),
      trainer: trainer || "Unspecified",
      notes: notes || "",
    });

    await user.save();

    res.status(200).json({
      message: "Trainer session recorded successfully",
      remainingSessions: user.trainerSessions.remaining,
    });
  } catch (error) {
    console.error("Error using trainer session:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/user/trainer-sessions
 * Get trainer session history and status
 */
router.get("/trainer-sessions", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return trainer session data
    res.status(200).json({
      trainerSessions: user.trainerSessions || {
        total: 0,
        used: 0,
        remaining: 0,
        history: [],
      },
    });
  } catch (error) {
    console.error("Error fetching trainer sessions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
