const express = require("express"); 
const cors = require("cors"); 
const { connectDB } = require("./db/connect");

// Import route modules
const lessonsRoutes = require("./routes/lessons");
const ordersRoutes = require("./routes/orders");

const app = express();
const port = process.env.PORT || 3000; // Use env PORT or default 3000

// ===== MIDDLEWARE =====
app.use(cors());

// Parse JSON bodies for POST requests
app.use(express.json());

// Simple logger middleware to track incoming requests
app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.url}`);
  next();
});

// Optional: set additional CORS headers manually
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

//Test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// ===== DATABASE CONNECTION & ROUTES =====
connectDB()
  .then((db) => {
    // Save collections in app.locals for use inside routers
    app.locals.lessonsCollection = db.collection("lesson");
    app.locals.ordersCollection = db.collection("order");

    // ===== ROUTES =====
    app.use("/lessons", lessonsRoutes);
    app.use("/orders", ordersRoutes);

    // Start server after DB connection
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Cannot start server without DB connection", err);
  });
