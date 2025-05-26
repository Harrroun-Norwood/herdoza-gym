require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

async function testConnection() {
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
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
  } finally {
    await client.close();
    console.log("Connection closed");
  }
}

testConnection().catch(console.error);
