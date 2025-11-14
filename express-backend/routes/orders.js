const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { connectDB } = require("../db/connect");

// POST new order
router.post("/", async (req, res) => {
  try {
    const order = req.body;

    if (!order || !order.lessons || !Array.isArray(order.lessons) || order.lessons.length === 0) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    const db = await connectDB();
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

module.exports = router;
