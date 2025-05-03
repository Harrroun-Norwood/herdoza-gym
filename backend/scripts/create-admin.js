require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const adminData = {
  firstName: "Admin",
  lastName: "User",
  email: "admin@herdoza-fitness.com",
  password: "admin123!@#",
  role: "admin",
  contactNumber: "09123456789",
};

async function createAdminUser() {
  try {
    // Connect to MongoDB Atlas with proper options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      retryWrites: true,
      w: "majority",
      authSource: "admin",
      dbName: "herdoza_fitness",
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log("Connected to MongoDB Atlas");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log("Admin user already exists");
      console.log("Email:", adminData.email);
      return;
    }

    // Create new admin user
    const admin = new User(adminData);
    await admin.save();

    console.log("Admin user created successfully");
    console.log("Email:", adminData.email);
    console.log("Password:", adminData.password);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
createAdminUser();
