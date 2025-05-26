// Database connection configuration
const mongoose = require("mongoose");
const { MongoClient, ServerApiVersion } = require("mongodb");

// MongoDB Atlas connection string
const mongoURI =
  "mongodb+srv://Harroun:nuorrah77@herdozafitnessgym.7cgyvgr.mongodb.net/?retryWrites=true&w=majority&appName=HerdozaFitnessGym";

// Connect to MongoDB function
const connectDB = async () => {
  try {
    const options = {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
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
