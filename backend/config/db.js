// Database connection configuration
const mongoose = require("mongoose");

// MongoDB Atlas connection string
const mongoURI =
  process.env.MONGODB_URI ||
  "mongodb://atlas-sql-6800b0407bd8bb4c0bb13529-1kan3.a.query.mongodb.net/herdoza_fitness?ssl=true&authSource=admin";

// Connect to MongoDB function with Atlas-specific configuration
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      retryWrites: true,
      w: "majority",
    });
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB Atlas: ${error.message}`);
    process.exit(1);
  }
};

// Export the connection function and mongoose instance
module.exports = {
  connectDB,
  mongoose,
};
