require("dotenv").config();
const { MongoClient } = require("mongodb");

async function testConnection() {
  const client = new MongoClient(process.env.MONGODB_URI, {
    tlsAllowInvalidCertificates: true, // Only for testing
    directConnection: true,
    retryWrites: true,
    retryReads: true,
    maxPoolSize: 1,
    tls: true,
  });

  try {
    console.log("Attempting to connect to MongoDB Atlas...");
    console.log("Node.js version:", process.version);
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas");

    const adminDb = client.db("admin");
    await adminDb.command({ ping: 1 });
    console.log("Pinged deployment successfully!");

    const db = client.db("herdoza_fitness");
    const collections = await db.listCollections().toArray();
    console.log("\nAvailable collections:");
    collections.forEach((coll) => console.log(`- ${coll.name}`));
  } catch (err) {
    console.error("Connection error:", err);
    if (err.code === "CERT_HAS_EXPIRED") {
      console.log("\nTLS Certificate issue detected. Please check:");
      console.log("1. Your system time is correct");
      console.log("2. Your Node.js version is up to date");
      console.log("3. Your system's CA certificates are up to date");
    }
  } finally {
    await client.close();
    console.log("Connection closed");
  }
}

testConnection().catch(console.error);
