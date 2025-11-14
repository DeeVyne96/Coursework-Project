const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db = null;

async function connectDB() {
  if (db) return db; // if already connected, return db

  try {
    await client.connect();
    db = client.db("learnhub");
    console.log("✅ Connected to MongoDB Atlas");
    return db;
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err);
    throw err;
  }
}

module.exports = { connectDB, client };
