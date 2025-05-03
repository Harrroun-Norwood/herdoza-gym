const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    contact: {
      type: String,
      required: true,
    },
    membershipType: {
      type: String,
      required: true,
      enum: ["gym", "mma", "dance"],
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "expired", "suspended"],
      default: "active",
    },
    dateOfMembership: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dateOfExpiration: {
      type: Date,
      required: true,
    },
    membershipDuration: {
      type: String,
      required: true,
      enum: ["1 Month", "3 Months", "6 Months", "1 Year"],
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["paid", "pending", "overdue"],
      default: "paid",
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Gcash", "Onsite"],
    },
    paymentHistory: [
      {
        amount: Number,
        date: Date,
        method: String,
        status: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add index for efficient queries
memberSchema.index({ email: 1 }, { unique: true });
memberSchema.index({ status: 1 });
memberSchema.index({ membershipType: 1 });
memberSchema.index({ dateOfExpiration: 1 });

module.exports = mongoose.model("Member", memberSchema);
