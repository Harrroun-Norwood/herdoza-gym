require("dotenv").config();
const { MongoClient } = require("mongodb");

async function testConnection() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    console.log("Attempting to connect to MongoDB Atlas...");
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas");

    const db = client.db("herdoza_fitness");
    const collections = await db.listCollections().toArray();

    console.log("\nAvailable collections:");
    collections.forEach((collection) => {
      console.log(`- ${collection.name}`);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    await client.close();
    console.log("Connection closed");
  }
}

testConnection().catch(console.error);
