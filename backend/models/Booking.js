const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sessionType: {
    type: String,
    enum: ["mmaPerSession", "mmaBulkSession", "mmaZumba", "zumba", "studio"],
    required: true,
  },
  date: {
    type: String, // Storing as formatted string to maintain format consistency with frontend
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  endDate: {
    type: String, // For bulk sessions, will be null for single sessions
    default: null,
  },
  zumbaSchedule: {
    type: String, // For MMA+Zumba packages, e.g. "Monday 7:00 PM"
    default: null,
  },
  price: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["Gcash", "Onsite"],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending",
  },
  status: {
    type: String,
    enum: [
      "pending",
      "approved",
      "rejected",
      "active",
      "completed",
      "cancelled",
    ],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Booking", BookingSchema);
