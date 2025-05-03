const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Booking = require("../models/Booking");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const Registration = require("../models/Registration");
const Member = require("../models/Member");

// Get current date utilities
function getCurrentMonthRange() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { firstDay, lastDay };
}

/**
 * GET /api/admin/dashboard-stats
 * Get dashboard statistics for admin
 */
router.get("/dashboard-stats", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const currentDate = new Date();
    const { firstDay: firstDayOfMonth } = getCurrentMonthRange();

    // Run all queries in parallel for better performance and real-time accuracy
    const [newMembers, pendingApproval, activeMembers, expiredMembers] =
      await Promise.all([
        // New members this month
        User.countDocuments({
          createdAt: { $gte: firstDayOfMonth },
        }),

        // Pending approvals (real-time check)
        User.countDocuments({
          membershipStatus: "pending",
        }),

        // Active members (check expiry date)
        User.countDocuments({
          membershipStatus: "active",
          membershipExpiry: { $gt: currentDate },
        }),

        // Expired members (real-time check)
        User.countDocuments({
          $or: [
            { membershipStatus: "expired" },
            {
              membershipStatus: "active",
              membershipExpiry: { $lte: currentDate },
            },
          ],
        }),
      ]);

    res.status(200).json({
      newMembers,
      pendingApproval,
      activeMembers,
      expiredMembers,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/admin/pending-registrations
 * Get list of pending registrations for admin
 */
router.get(
  "/pending-registrations",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      // Find users with pending status and memberships
      const pendingUsers = await User.find(
        { membershipStatus: "pending" },
        {
          firstName: 1,
          lastName: 1,
          email: 1,
          membershipType: 1,
          membershipStatus: 1,
          createdAt: 1,
        }
      ).sort({ createdAt: -1 });

      // Format the response
      const formattedUsers = pendingUsers.map((user) => ({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        membershipType: user.membershipType,
        status: user.membershipStatus,
        registrationDate: user.createdAt,
      }));

      res.status(200).json(formattedUsers);
    } catch (error) {
      console.error("Error fetching pending registrations:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * GET /api/admin/todays-schedule
 * Get today's schedule/bookings for admin
 */
router.get("/todays-schedule", isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Get current date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get end of day
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all bookings for today
    const todaysBookings = await Booking.find({
      startTime: { $gte: today, $lt: tomorrow },
    }).populate("userId", "firstName lastName");

    // Format the response
    const schedule = todaysBookings.map((booking) => {
      // Format time as string
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);
      const timeString = `${startTime.getHours()}:${String(
        startTime.getMinutes()
      ).padStart(2, "0")} - ${endTime.getHours()}:${String(
        endTime.getMinutes()
      ).padStart(2, "0")}`;

      // Determine icon based on booking type
      let icon = "ri-calendar-line";
      if (booking.type === "mma") {
        icon = "ri-boxing-line";
      } else if (booking.type === "dance" || booking.type === "zumba") {
        icon = "ri-heart-pulse-line";
      } else if (booking.type === "gym") {
        icon = "ri-fitness-line";
      }

      return {
        id: booking._id,
        title: booking.title || `${booking.type.toUpperCase()} Session`,
        time: timeString,
        instructor: booking.instructor || "Not assigned",
        type: booking.type,
        icon: icon,
        user: booking.userId
          ? `${booking.userId.firstName} ${booking.userId.lastName}`
          : "Anonymous",
      };
    });

    res.status(200).json(schedule);
  } catch (error) {
    console.error("Error fetching today's schedule:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/admin/monthly-schedule
 * Get schedule for the current month
 */
router.get("/monthly-schedule", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { firstDay, lastDay } = getCurrentMonthRange();

    // Get all bookings for current month
    const monthlyBookings = await Booking.find({
      startTime: {
        $gte: firstDay,
        $lte: lastDay,
      },
    }).populate("userId", "firstName lastName");

    // Format the response
    const schedule = monthlyBookings.map((booking) => {
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);

      return {
        id: booking._id,
        date: startTime.toISOString(),
        title: booking.title || `${booking.type.toUpperCase()} Session`,
        time: `${startTime.getHours()}:${String(
          startTime.getMinutes()
        ).padStart(2, "0")} - ${endTime.getHours()}:${String(
          endTime.getMinutes()
        ).padStart(2, "0")}`,
        instructor: booking.instructor || "Not assigned",
        type: booking.type,
        user: booking.userId
          ? `${booking.userId.firstName} ${booking.userId.lastName}`
          : "Anonymous",
      };
    });

    res.status(200).json(schedule);
  } catch (error) {
    console.error("Error fetching monthly schedule:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/admin/approve-membership
 * Approve a pending membership
 */
router.post(
  "/approve-membership",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Find the user and update membership status
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.membershipStatus !== "pending") {
        return res
          .status(400)
          .json({ message: "Membership is not pending approval" });
      }

      // Update to active status
      user.membershipStatus = "active";

      // Set expiry date based on membership type if not already set
      if (!user.membershipExpiry) {
        const now = new Date();

        if (user.membershipType === "regular") {
          // 1 day pass
          user.membershipExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        } else if (user.membershipType === "half") {
          // 15 days pass
          user.membershipExpiry = new Date(now.setDate(now.getDate() + 15));
        } else if (user.membershipType === "full") {
          // 30 days pass
          user.membershipExpiry = new Date(now.setDate(now.getDate() + 30));
        } else if (user.membershipType === "trainer-single") {
          // 1 day pass with trainer
          user.membershipExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          user.trainerSessions.total = 1;
          user.trainerSessions.remaining = 1;
        } else if (user.membershipType === "trainer-25") {
          // 25 days with trainer sessions
          user.membershipExpiry = new Date(now.setDate(now.getDate() + 25));
          user.trainerSessions.total = 25;
          user.trainerSessions.remaining = 25;
        }
      }

      await user.save();

      res.status(200).json({
        message: "Membership approved successfully",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          membershipStatus: user.membershipStatus,
          membershipExpiry: user.membershipExpiry,
          membershipType: user.membershipType,
        },
      });
    } catch (error) {
      console.error("Error approving membership:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Registration Management
router.get("/registrations", isAdmin, async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching registrations" });
  }
});

router.post("/registrations/:id/approve", isAdmin, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    // Create new member from registration
    const member = new Member({
      name: registration.name,
      email: registration.email,
      contact: registration.contact,
      membershipType: registration.membershipType,
      sessionInfo: registration.sessionInfo,
      dateOfMembership: new Date(),
      dateOfExpiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: "active",
    });

    await member.save();
    await Registration.findByIdAndDelete(req.params.id);

    res.json({ message: "Registration approved and member created" });
  } catch (error) {
    res.status(500).json({ message: "Error approving registration" });
  }
});

router.post("/registrations/:id/reject", isAdmin, async (req, res) => {
  try {
    await Registration.findByIdAndDelete(req.params.id);
    res.json({ message: "Registration rejected" });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting registration" });
  }
});

// Members Management
router.get("/members", isAdmin, async (req, res) => {
  try {
    const members = await Member.find().sort({ dateOfMembership: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Error fetching members" });
  }
});

// Admin booking approval routes
router.put(
  "/bookings/:id/approve",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      booking.status = "approved";
      booking.approvedAt = new Date();
      booking.approvedBy = req.user.id;
      await booking.save();

      res.json({ message: "Booking approved successfully", booking });
    } catch (error) {
      console.error("Error approving booking:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.put(
  "/bookings/:id/reject",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      booking.status = "rejected";
      booking.rejectedAt = new Date();
      booking.rejectedBy = req.user.id;
      await booking.save();

      res.json({ message: "Booking rejected successfully", booking });
    } catch (error) {
      console.error("Error rejecting booking:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
