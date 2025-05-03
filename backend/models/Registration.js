const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
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
  sessionInfo: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  payment: {
    method: {
      type: String,
      enum: ["Gcash", "Onsite"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    proofSubmitted: {
      type: Boolean,
      default: false,
    },
    fbMessageUrl: {
      type: String,
      default: "https://www.facebook.com/messages/t/507998136002998",
    },
    fbProofSubmissionTime: {
      type: Date,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Registration", registrationSchema);
