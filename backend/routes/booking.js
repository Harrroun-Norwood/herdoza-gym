const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const User = require("../models/User");
const { isAuthenticated } = require("../middleware/auth");

/**
 * POST /api/user/book-session
 * Book a new session
 */
router.post("/book-session", isAuthenticated, async (req, res) => {
  try {
    const {
      sessionType,
      date,
      time,
      endDate,
      zumbaSchedule,
      price,
      paymentMethod,
    } = req.body;

    const userId = req.user._id;

    // Create a new booking
    const booking = new Booking({
      userId,
      sessionType,
      date,
      time,
      endDate: endDate || null,
      zumbaSchedule: zumbaSchedule || null,
      price,
      paymentMethod,
      paymentStatus: paymentMethod === "Gcash" ? "paid" : "pending",
    });

    // Save the booking
    await booking.save();

    // Return success response
    res.status(201).json({
      success: true,
      message: "Session booked successfully",
      booking,
    });
  } catch (error) {
    console.error("Error booking session:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * GET /api/user/bookings
 * Get user's bookings
 */
router.get("/bookings", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all bookings for the user
    const bookings = await Booking.find({ userId });

    // Group bookings by type
    const groupedBookings = {
      mmaPerSession: [],
      mmaBulkSession: [],
      mmaZumba: [],
      zumba: [],
      studio: [],
    };

    bookings.forEach((booking) => {
      if (groupedBookings[booking.sessionType]) {
        groupedBookings[booking.sessionType].push({
          date: booking.date,
          time: booking.time,
          endDate: booking.endDate,
          zumbaSchedule: booking.zumbaSchedule,
          price: booking.price,
          paymentMethod: booking.paymentMethod,
          paymentStatus: booking.paymentStatus,
          status: booking.status,
        });
      }
    });

    // Return the grouped bookings
    res.status(200).json({
      success: true,
      bookings: groupedBookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * ADMIN ROUTES
 * These routes are for admin-only access
 */

// Middleware to check if user is an admin
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Get user from database
    const user = await User.findById(req.user._id);

    // Check if user is admin
    if (user && user.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Admin access required" });
    }
  } catch (error) {
    console.error("Error checking admin status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * GET /api/admin/bookings
 * Get all bookings (admin only)
 */
router.get("/admin/bookings", isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Optional query parameters for filtering
    const { sessionType, status, paymentStatus } = req.query;

    // Build filter object
    const filter = {};
    if (sessionType) filter.sessionType = sessionType;
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    // Find bookings with optional filtering
    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 }) // Sort by most recent first
      .populate("userId", "firstName lastName email contactNumber"); // Get user details

    // Transform data to include user information
    const bookingsWithUserInfo = bookings.map((booking) => {
      const user = booking.userId;
      return {
        id: booking._id,
        userId: user._id,
        userName: user ? `${user.firstName} ${user.lastName}` : "Unknown User",
        userEmail: user ? user.email : "No email",
        userPhone: user ? user.contactNumber : "No phone",
        sessionType: booking.sessionType,
        date: booking.date,
        time: booking.time,
        endDate: booking.endDate,
        zumbaSchedule: booking.zumbaSchedule,
        price: booking.price,
        paymentMethod: booking.paymentMethod,
        paymentStatus: booking.paymentStatus,
        status: booking.status,
        createdAt: booking.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      count: bookingsWithUserInfo.length,
      bookings: bookingsWithUserInfo,
    });
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * PUT /api/admin/bookings/:id/approve
 * Approve a booking (admin only)
 */
router.put(
  "/admin/bookings/:id/approve",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const bookingId = req.params.id;

      // Find and update the booking
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Update status to approved
      booking.status = "approved";

      // If payment is onsite and being approved, mark as paid
      if (booking.paymentMethod === "Onsite") {
        booking.paymentStatus = "paid";
      }

      await booking.save();

      res.status(200).json({
        success: true,
        message: "Booking approved successfully",
        booking,
      });
    } catch (error) {
      console.error("Error approving booking:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

/**
 * PUT /api/admin/bookings/:id/reject
 * Reject a booking (admin only)
 */
router.put(
  "/admin/bookings/:id/reject",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const bookingId = req.params.id;

      // Find and update the booking
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Update status to rejected
      booking.status = "rejected";
      await booking.save();

      res.status(200).json({
        success: true,
        message: "Booking rejected successfully",
        booking,
      });
    } catch (error) {
      console.error("Error rejecting booking:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

/**
 * DELETE /api/admin/bookings/:id
 * Delete a booking (admin only)
 */
router.delete(
  "/admin/bookings/:id",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const bookingId = req.params.id;

      // Find and delete the booking
      const booking = await Booking.findByIdAndDelete(bookingId);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.status(200).json({
        success: true,
        message: "Booking deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

module.exports = router;
