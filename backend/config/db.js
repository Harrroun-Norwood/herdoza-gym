// Database connection configuration
const mongoose = require("mongoose");

// MongoDB Atlas connection string
const mongoURI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/herdoza_fitness";

// Connect to MongoDB function
const connectDB = async () => {
  try {
    // Ensure MONGODB_URI starts with mongodb:// or mongodb+srv://
    if (
      process.env.MONGODB_URI &&
      !process.env.MONGODB_URI.match(/^mongodb(\+srv)?:\/\//)
    ) {
      throw new Error("Invalid MongoDB connection string format");
    }

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(mongoURI, options);
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
