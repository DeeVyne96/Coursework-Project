const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require('cors');
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;
const uri = process.env.MONGO_URI;


app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // allow any origin
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// GET lessons
app.get("/lessons", async (req, res) => {
  try {
    const lessons = await lessonsCollection.find({}).toArray();
    res.json(lessons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
});

// POST orders
app.post("/orders", async (req, res) => {
  try {
    const order = req.body;

    if (!order || !order.lessons || !Array.isArray(order.lessons) || order.lessons.length === 0) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    const db = client.db("learnhub");
    const ordersCollection = db.collection("order");
    const lessonsCollection = db.collection("lesson");

    for (let item of order.lessons) {
      if (!item._id || typeof item.qty !== "number") {
        return res.status(400).json({ error: "Invalid lesson in order" });
      }
    }

    const result = await ordersCollection.insertOne(order);

    for (let item of order.lessons) {
      await lessonsCollection.updateOne(
        { _id: new ObjectId(item._id) },
        { $inc: { space: -item.qty } }
      );
    }

    res.status(201).json({ message: "Order submitted successfully!", orderId: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit order" });
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const client = new MongoClient(uri);
let lessonsCollection;

async function connectDB() {
  try {
    await client.connect();
    const db = client.db("learnhub");
    lessonsCollection = db.collection("lesson");
    console.log("Connected to MongoDB Atlas");

    // Start server only after DB connection
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error(err);
  }
}

connectDB();
