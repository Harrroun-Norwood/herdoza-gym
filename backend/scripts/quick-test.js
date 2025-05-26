require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri =
  "mongodb+srv://Harroun:nuorrah77@herdozafitnessgym.7cgyvgr.mongodb.net/?retryWrites=true&w=majority&appName=HerdozaFitnessGym";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");

    const database = client.db("herdoza_fitness");
    const collections = await database.listCollections().toArray();

    console.log("\nCollections:");
    for (const collection of collections) {
      console.log(`- ${collection.name}`);
    }

    console.log("\nPinging deployment...");
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
