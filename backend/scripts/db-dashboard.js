// Advanced Database Dashboard for Herdoza Fitness Center
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const User = require("../models/User");
const Booking = require("../models/Booking");

console.log("=".repeat(80));
console.log("HERDOZA FITNESS CENTER - ADVANCED DATABASE DASHBOARD");
console.log("=".repeat(80));

// Function to display a formatted table
function displayTable(headers, rows) {
  // Calculate column widths
  const colWidths = headers.map((header, index) => {
    const dataWidths = rows.map((row) => String(row[index]).length);
    return Math.max(header.length, ...dataWidths) + 2;
  });

  // Create separator line
  const separator = colWidths.map((width) => "-".repeat(width)).join("+");

  // Print header
  console.log("+" + separator + "+");
  console.log(
    "|" +
      headers.map((header, i) => header.padEnd(colWidths[i])).join("|") +
      "|"
  );
  console.log("+" + separator + "+");

  // Print rows
  rows.forEach((row) => {
    console.log(
      "|" +
        row.map((cell, i) => String(cell).padEnd(colWidths[i])).join("|") +
        "|"
    );
  });

  // Print bottom border
  console.log("+" + separator + "+");
}

// Function to get detailed membership insights
async function getMembershipInsights() {
  try {
    console.log("\n📈 MEMBERSHIP INSIGHTS");
    console.log("-".repeat(80));

    // Get membership distribution
    const membershipCounts = await User.aggregate([
      { $group: { _id: "$membershipType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const headers = ["Membership Type", "Count", "Percentage"];
    const totalUsers = await User.countDocuments();
    const rows = membershipCounts.map((item) => [
      item._id || "none",
      item.count,
      ((item.count / totalUsers) * 100).toFixed(2) + "%",
    ]);

    console.log("\nMembership Distribution:");
    displayTable(headers, rows);

    // Get most active users (by booking count)
    const activeUsers = await Booking.aggregate([
      { $group: { _id: "$userId", bookingCount: { $sum: 1 } } },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 0,
          name: {
            $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"],
          },
          email: "$userDetails.email",
          bookingCount: 1,
        },
      },
    ]);

    console.log("\nTop 5 Most Active Users:");
    if (activeUsers.length > 0) {
      const userHeaders = ["Name", "Email", "Booking Count"];
      const userRows = activeUsers.map((user) => [
        user.name,
        user.email,
        user.bookingCount,
      ]);
      displayTable(userHeaders, userRows);
    } else {
      console.log("No booking data available.");
    }
  } catch (error) {
    console.error("Error getting membership insights:", error);
  }
}

// Function to get detailed booking analytics
async function getBookingAnalytics() {
  try {
    console.log("\n🗓️ BOOKING ANALYTICS");
    console.log("-".repeat(80));

    // Get booking counts by type
    const bookingsByType = await Booking.aggregate([
      { $group: { _id: "$sessionType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const headers = ["Session Type", "Count", "Revenue (₱)"];
    const rows = [];

    for (const booking of bookingsByType) {
      // Calculate total revenue for this booking type
      const revenueData = await Booking.aggregate([
        { $match: { sessionType: booking._id, paymentStatus: "paid" } },
        { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
      ]);

      const revenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

      rows.push([booking._id, booking.count, revenue.toLocaleString()]);
    }

    console.log("\nBookings by Session Type:");
    displayTable(headers, rows);

    // Payment method breakdown
    const paymentMethods = await Booking.aggregate([
      { $group: { _id: "$paymentMethod", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const paymentStatusBreakdown = await Booking.aggregate([
      { $group: { _id: "$paymentStatus", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    console.log("\nPayment Method Breakdown:");
    displayTable(
      ["Payment Method", "Count"],
      paymentMethods.map((item) => [item._id, item.count])
    );

    console.log("\nPayment Status Breakdown:");
    displayTable(
      ["Payment Status", "Count"],
      paymentStatusBreakdown.map((item) => [item._id, item.count])
    );
  } catch (error) {
    console.error("Error getting booking analytics:", error);
  }
}

// Function to get MMA service details
async function getMMAServiceDetails() {
  try {
    console.log("\n🥊 MMA SERVICE DETAILS");
    console.log("-".repeat(80));

    // Get MMA booking types breakdown
    const mmaBookings = await Booking.find({
      sessionType: { $in: ["mmaPerSession", "mmaBulkSession", "mmaZumba"] },
    });

    const mmaPerSession = mmaBookings.filter(
      (b) => b.sessionType === "mmaPerSession"
    ).length;
    const mmaBulkSession = mmaBookings.filter(
      (b) => b.sessionType === "mmaBulkSession"
    ).length;
    const mmaZumba = mmaBookings.filter(
      (b) => b.sessionType === "mmaZumba"
    ).length;

    console.log("\nMMA Service Distribution:");
    displayTable(
      ["Service Type", "Count", "Percentage"],
      [
        [
          "Single Session",
          mmaPerSession,
          ((mmaPerSession / mmaBookings.length) * 100).toFixed(2) + "%",
        ],
        [
          "25-Day Package",
          mmaBulkSession,
          ((mmaBulkSession / mmaBookings.length) * 100).toFixed(2) + "%",
        ],
        [
          "MMA + Zumba",
          mmaZumba,
          ((mmaZumba / mmaBookings.length) * 100).toFixed(2) + "%",
        ],
      ]
    );

    // Get users with trainer sessions
    const usersWithTrainers = await User.countDocuments({
      $or: [
        { membershipType: "trainer-single" },
        { membershipType: "trainer-25" },
      ],
    });

    console.log(`\nUsers with active trainer sessions: ${usersWithTrainers}`);

    // Get trainer session usage statistics
    const trainerUsageStats = await User.aggregate([
      {
        $match: {
          "trainerSessions.total": { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: "$trainerSessions.total" },
          usedSessions: { $sum: "$trainerSessions.used" },
          remainingSessions: { $sum: "$trainerSessions.remaining" },
        },
      },
    ]);

    if (trainerUsageStats.length > 0) {
      const usage = trainerUsageStats[0];
      const usagePercentage = (
        (usage.usedSessions / usage.totalSessions) *
        100
      ).toFixed(2);

      console.log("\nTrainer Session Usage:");
      console.log(`Total sessions purchased: ${usage.totalSessions}`);
      console.log(`Sessions used: ${usage.usedSessions} (${usagePercentage}%)`);
      console.log(`Sessions remaining: ${usage.remainingSessions}`);
    } else {
      console.log("\nNo trainer session data available.");
    }
  } catch (error) {
    console.error("Error getting MMA service details:", error);
  }
}

// Function to get fitness gym membership details
async function getGymMembershipDetails() {
  try {
    console.log("\n💪 FITNESS GYM MEMBERSHIP DETAILS");
    console.log("-".repeat(80));

    // Get membership history stats
    const membershipHistoryStats = await User.aggregate([
      { $unwind: "$membershipHistory" },
      { $group: { _id: "$membershipHistory.type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    console.log("\nMembership History by Type:");
    if (membershipHistoryStats.length > 0) {
      displayTable(
        ["Membership Type", "Count"],
        membershipHistoryStats.map((item) => [item._id, item.count])
      );
    } else {
      console.log("No membership history data available.");
    }

    // Get active memberships by expiration timeline
    const now = new Date();
    const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const oneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const expiringThisWeek = await User.countDocuments({
      membershipStatus: "active",
      membershipExpiry: { $gte: now, $lte: oneWeek },
    });

    const expiringThisMonth = await User.countDocuments({
      membershipStatus: "active",
      membershipExpiry: { $gte: now, $lte: oneMonth },
    });

    console.log("\nUpcoming Membership Expirations:");
    console.log(`Memberships expiring within 7 days: ${expiringThisWeek}`);
    console.log(`Memberships expiring within 30 days: ${expiringThisMonth}`);
  } catch (error) {
    console.error("Error getting gym membership details:", error);
  }
}

// Function to get detailed database health check
async function getDatabaseHealth(conn) {
  try {
    console.log("\n🔍 DATABASE HEALTH CHECK");
    console.log("-".repeat(80));

    // Get collection stats
    const collections = await conn.connection.db.listCollections().toArray();
    const collectionStats = [];

    for (const collection of collections) {
      const stats = await conn.connection.db
        .collection(collection.name)
        .stats();
      collectionStats.push({
        name: collection.name,
        count: stats.count,
        size: (stats.size / 1024).toFixed(2) + " KB",
        avgObjSize: stats.avgObjSize
          ? (stats.avgObjSize / 1024).toFixed(2) + " KB"
          : "N/A",
      });
    }

    console.log("\nCollection Statistics:");
    displayTable(
      ["Collection", "Documents", "Size", "Avg Doc Size"],
      collectionStats.map((stats) => [
        stats.name,
        stats.count,
        stats.size,
        stats.avgObjSize,
      ])
    );

    // Get database stats
    const dbStats = await conn.connection.db.stats();
    console.log("\nDatabase Size:");
    console.log(
      `Total size: ${(dbStats.dataSize / (1024 * 1024)).toFixed(2)} MB`
    );
    console.log(
      `Storage size: ${(dbStats.storageSize / (1024 * 1024)).toFixed(2)} MB`
    );
    console.log(`Total collections: ${dbStats.collections}`);
    console.log(`Total indexes: ${dbStats.indexes}`);
  } catch (error) {
    console.error("Error checking database health:", error);
  }
}

// Main function to run the dashboard
async function runDatabaseDashboard() {
  let conn;
  try {
    console.log("Connecting to MongoDB Atlas...");
    conn = await connectDB();
    console.log(`✅ Connected to: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);

    await getDatabaseHealth(conn);
    await getMembershipInsights();
    await getBookingAnalytics();
    await getMMAServiceDetails();
    await getGymMembershipDetails();

    console.log("\n=".repeat(80));
    console.log("DATABASE DASHBOARD COMPLETE");
    console.log("=".repeat(80));
  } catch (error) {
    console.error("❌ Dashboard generation failed:", error);
  } finally {
    if (conn) {
      await mongoose.disconnect();
      console.log("\nDatabase connection closed.");
    }
  }
}

// Run the dashboard
runDatabaseDashboard();
