// Database connection configuration
const mongoose = require("mongoose");

// MongoDB Atlas connection string
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/herdoza_fitness";

// Connect to MongoDB function
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
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
