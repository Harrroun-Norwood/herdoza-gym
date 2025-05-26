require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  ssl: true,
  tls: true,
  tlsInsecure: false,
});

async function run() {
  try {
    console.log("Attempting to connect to MongoDB Atlas...");
    await client.connect();
    console.log("Connected to MongoDB Atlas");

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // List databases
    const dbs = await client.db().admin().listDatabases();
    console.log("\nAvailable databases:");
    dbs.databases.forEach((db) => {
      console.log(`- ${db.name}`);
    });
  } catch (error) {
    console.error("Connection error:", error);
    if (error.code === "ENOTFOUND") {
      console.log("\nDNS resolution failed. Make sure:");
      console.log("1. Your connection string is correct");
      console.log("2. You have internet connectivity");
    } else if (error.code === "ECONNREFUSED") {
      console.log("\nConnection refused. Make sure:");
      console.log("1. Your IP is whitelisted in MongoDB Atlas");
      console.log("2. Your username and password are correct");
    }
  } finally {
    await client.close();
    console.log("\nConnection closed");
  }
}

run().catch(console.dir);
