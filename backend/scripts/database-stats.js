// Database statistics script
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const User = require("../models/User");
const Booking = require("../models/Booking");

console.log("=".repeat(60));
console.log("HERDOZA FITNESS CENTER - DATABASE STATISTICS");
console.log("=".repeat(60));

// Function to get total counts
async function getTotalCounts() {
  try {
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();

    console.log("\n📊 OVERALL STATISTICS");
    console.log("-".repeat(60));
    console.log(`Total registered users: ${totalUsers}`);
    console.log(`Total bookings: ${totalBookings}`);
    return { totalUsers, totalBookings };
  } catch (error) {
    console.error("Error getting total counts:", error);
    return { totalUsers: 0, totalBookings: 0 };
  }
}

// Function to get gym membership statistics
async function getGymMembershipStats() {
  try {
    const activeMembers = await User.countDocuments({
      membershipStatus: "active",
      membershipType: { $in: ["regular", "half", "full"] },
    });

    const regularPassMembers = await User.countDocuments({
      membershipStatus: "active",
      membershipType: "regular",
    });

    const halfPassMembers = await User.countDocuments({
      membershipStatus: "active",
      membershipType: "half",
    });

    const fullPassMembers = await User.countDocuments({
      membershipStatus: "active",
      membershipType: "full",
    });

    const pendingMembers = await User.countDocuments({
      membershipStatus: "pending",
    });
    const expiredMembers = await User.countDocuments({
      membershipStatus: "expired",
    });

    console.log("\n💪 FITNESS GYM MEMBERSHIP STATISTICS");
    console.log("-".repeat(60));
    console.log(`Active gym members: ${activeMembers}`);
    console.log(`  - Regular Pass (1-day): ${regularPassMembers}`);
    console.log(`  - Half Pass (15-day): ${halfPassMembers}`);
    console.log(`  - Full Pass (30-day): ${fullPassMembers}`);
    console.log(`Pending memberships: ${pendingMembers}`);
    console.log(`Expired memberships: ${expiredMembers}`);

    return {
      activeMembers,
      regularPassMembers,
      halfPassMembers,
      fullPassMembers,
      pendingMembers,
      expiredMembers,
    };
  } catch (error) {
    console.error("Error getting gym membership stats:", error);
    return {};
  }
}

// Function to get MMA statistics
async function getMMAStats() {
  try {
    const mmaPerSessionBookings = await Booking.countDocuments({
      sessionType: "mmaPerSession",
    });
    const mmaBulkSessionBookings = await Booking.countDocuments({
      sessionType: "mmaBulkSession",
    });
    const mmaZumbaBookings = await Booking.countDocuments({
      sessionType: "mmaZumba",
    });

    const totalMMABookings =
      mmaPerSessionBookings + mmaBulkSessionBookings + mmaZumbaBookings;

    const activeTrainers = await User.countDocuments({
      membershipStatus: "active",
      membershipType: { $in: ["trainer-single", "trainer-25"] },
    });

    const singleTrainerSessions = await User.countDocuments({
      membershipStatus: "active",
      membershipType: "trainer-single",
    });

    const bulkTrainerSessions = await User.countDocuments({
      membershipStatus: "active",
      membershipType: "trainer-25",
    });

    console.log("\n🥊 MIXED MARTIAL ARTS STATISTICS");
    console.log("-".repeat(60));
    console.log(`Total MMA bookings: ${totalMMABookings}`);
    console.log(`  - Per-session bookings: ${mmaPerSessionBookings}`);
    console.log(`  - 25-session package bookings: ${mmaBulkSessionBookings}`);
    console.log(`  - MMA+Zumba bookings: ${mmaZumbaBookings}`);
    console.log(`Active trainer sessions: ${activeTrainers}`);
    console.log(`  - Single trainer sessions: ${singleTrainerSessions}`);
    console.log(`  - 25-day trainer packages: ${bulkTrainerSessions}`);

    return {
      totalMMABookings,
      mmaPerSessionBookings,
      mmaBulkSessionBookings,
      mmaZumbaBookings,
      activeTrainers,
      singleTrainerSessions,
      bulkTrainerSessions,
    };
  } catch (error) {
    console.error("Error getting MMA stats:", error);
    return {};
  }
}

// Function to get dance studio statistics
async function getDanceStudioStats() {
  try {
    const zumbaBookings = await Booking.countDocuments({
      sessionType: "zumba",
    });
    const studioBookings = await Booking.countDocuments({
      sessionType: "studio",
    });

    console.log("\n💃 DANCE STUDIO & ZUMBA STATISTICS");
    console.log("-".repeat(60));
    console.log(`Zumba session bookings: ${zumbaBookings}`);
    console.log(`Dance studio bookings: ${studioBookings}`);

    return { zumbaBookings, studioBookings };
  } catch (error) {
    console.error("Error getting dance studio stats:", error);
    return {};
  }
}

// Function to get payment statistics
async function getPaymentStats() {
  try {
    const gcashPayments = await Booking.countDocuments({
      paymentMethod: "Gcash",
    });
    const onsitePayments = await Booking.countDocuments({
      paymentMethod: "Onsite",
    });
    const pendingPayments = await Booking.countDocuments({
      paymentStatus: "pending",
    });
    const completedPayments = await Booking.countDocuments({
      paymentStatus: "paid",
    });

    console.log("\n💰 PAYMENT STATISTICS");
    console.log("-".repeat(60));
    console.log(`GCash payments: ${gcashPayments}`);
    console.log(`Onsite payments: ${onsitePayments}`);
    console.log(`Pending payments: ${pendingPayments}`);
    console.log(`Completed payments: ${completedPayments}`);

    return {
      gcashPayments,
      onsitePayments,
      pendingPayments,
      completedPayments,
    };
  } catch (error) {
    console.error("Error getting payment stats:", error);
    return {};
  }
}

// Function to get the collections in the database
async function getCollections(conn) {
  try {
    const collections = await conn.connection.db.listCollections().toArray();

    console.log("\n📁 DATABASE COLLECTIONS");
    console.log("-".repeat(60));

    if (collections.length === 0) {
      console.log("No collections found (database is empty)");
    } else {
      collections.forEach((collection) => {
        console.log(`- ${collection.name}`);
      });
    }

    return collections;
  } catch (error) {
    console.error("Error getting collections:", error);
    return [];
  }
}

// Main function to run all statistics
async function runDatabaseStatistics() {
  try {
    console.log("Connecting to MongoDB...");
    console.log("Using connection string:", process.env.MONGODB_URI);

    const conn = await connectDB();
    console.log(`✅ Connected to: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);

    await getCollections(conn);
    await getTotalCounts();
    await getGymMembershipStats();
    await getMMAStats();
    await getDanceStudioStats();
    await getPaymentStats();

    console.log("\n=".repeat(60));
    console.log("STATS COLLECTION COMPLETE");
    console.log("=".repeat(60));

    // Close the connection
    await mongoose.disconnect();
    console.log("\nDatabase connection closed.");

    return true;
  } catch (error) {
    console.error("❌ Statistics collection failed:", error);
    // Try to disconnect if there was an error
    try {
      await mongoose.disconnect();
      console.log("Database connection closed.");
    } catch (err) {
      console.error("Error closing database connection:", err);
    }
    return false;
  }
}

// Run the stats collector
runDatabaseStatistics();
