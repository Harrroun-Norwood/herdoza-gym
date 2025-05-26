require("dotenv").config();
const mongoose = require("mongoose");
const dns = require("dns").promises;
const https = require("https");
const { MongoClient, ServerApiVersion } = require("mongodb");

async function getPublicIP() {
  return new Promise((resolve, reject) => {
    https
      .get("https://api.ipify.org?format=json", (resp) => {
        let data = "";
        resp.on("data", (chunk) => {
          data += chunk;
        });
        resp.on("end", () => {
          try {
            resolve(JSON.parse(data).ip);
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

async function testConnection() {
  try {
    console.log("\n=== MongoDB Connection Test ===");
    console.log("Testing connection from IP:", await getPublicIP());

    // Test DNS resolution
    console.log("\nResolving MongoDB host...");
    const mongoUrl = new URL(process.env.MONGODB_URI);
    const host = mongoUrl.hostname;

    dns.resolve(host, (err, addresses) => {
      if (err) {
        console.error("DNS resolution failed:", err);
      } else {
        console.log("MongoDB host resolves to:", addresses);
      }
    }); // Test MongoDB connection
    console.log("\nTesting MongoDB connection...");
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log("\n✅ Connection successful!");
    console.log("Connected to:", conn.connection.host);
    console.log("Database:", conn.connection.name);
    console.log("MongoDB version:", conn.connection.serverDescription.version);

    // Test basic operations
    console.log("\nTesting basic operations...");
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(
      "Available collections:",
      collections.map((c) => c.name).join(", ")
    );

    await mongoose.disconnect();
    console.log("\nConnection test completed successfully! 🎉");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Connection test failed!");
    console.error("Error type:", error.name);
    console.error("Error message:", error.message);

    if (error.name === "MongoServerError" && error.code === 8000) {
      console.log("\n⚠️ This might be an IP whitelist issue.");
      console.log(
        "Make sure these Render IPs are whitelisted in MongoDB Atlas:"
      );
      console.log("- 13.228.225.19");
      console.log("- 18.142.128.26");
      console.log("- 54.254.162.138");
    }

    if (error.name === "MongoServerError" && error.code === 18) {
      console.log("\n⚠️ This appears to be an authentication issue.");
      console.log("Please check your username and password in MONGODB_URI");
    }

    process.exit(1);
  }
}

testConnection();
