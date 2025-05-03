// Database connection test script
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const { connectDB } = require("../config/db");

console.log("Testing MongoDB connection...");
console.log("Using connection string:", process.env.MONGODB_URI);

connectDB()
  .then((conn) => {
    console.log("✅ MongoDB connection successful!");
    console.log(`Connected to: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);

    // List all collections in the database
    return conn.connection.db.listCollections().toArray();
  })
  .then((collections) => {
    console.log("\nAvailable collections:");
    if (collections.length === 0) {
      console.log("- No collections found (database is empty)");
    } else {
      collections.forEach((collection) => {
        console.log(`- ${collection.name}`);
      });
    }

    console.log("\nConnection test complete. You can now use your database!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed!");
    console.error(`Error: ${error.message}`);
    process.exit(1);
  });
