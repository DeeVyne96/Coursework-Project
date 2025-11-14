const express = require("express");
const router = express.Router();
const { connectDB } = require("../db/connect");
const { ObjectId } = require("mongodb"); // ✅ import ObjectId at top

// GET /lessons?search=math&sort=price&order=asc
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const lessonsCollection = db.collection("lesson");

    const searchQuery = req.query.search || "";
    const sortBy = req.query.sort || "topic";
    const order = req.query.order === "desc" ? -1 : 1;

    const query = searchQuery
      ? {
          $or: [
            { topic: { $regex: searchQuery, $options: "i" } },
            { location: { $regex: searchQuery, $options: "i" } },
            { price: { $regex: searchQuery, $options: "i" } },
          ],
        }
      : {};
    const lessons = await lessonsCollection
      .find(query)
      .sort({ [sortBy]: order })
      .toArray();

    res.json(lessons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
});

// PUT /lessons/:id
router.put("/:id", async (req, res) => {
  try {
    const lessonId = req.params.id;
    const updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No data provided for update" });
    }
    const db = await connectDB();
    const lessonsCollection = db.collection("lesson");

    const result = await lessonsCollection.updateOne(
      { _id: new ObjectId(lessonId) }, // ✅ clean usage
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    res.json({ message: "Lesson updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update lesson" });
  }
});

module.exports = router;
