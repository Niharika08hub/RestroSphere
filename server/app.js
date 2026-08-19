const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Test Route
app.post("/test", (req, res) => {
  res.json({
    success: true,
    body: req.body,
  });
});

// Auth Routes
app.use("/api/auth", authRoutes);

// Home Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "RestroSphere Backend Running 🚀",
  });
});

module.exports = app;