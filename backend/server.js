// backend/server.js

// Loading environment variables
require("dotenv").config();

// Core Modules
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const colors = require("colors");

// Config files
const dbConfig = require("./config/db");

// Route files
const authRoutes = require("./routes/authRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const electionRoutes = require("./routes/electionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");
const voteRoutes = require("./routes/voteRoutes");
const logRoutes = require("./routes/logRoutes");
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');


// Create Express App
const app = express();

// Constants
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

// --- MIDDLEWARE ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
// app.use(rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100,
//   message: "Too many requests, please try again later.",
//   standardHeaders: true,
//   legacyHeaders: false,
// }));

// Static files
// app.use(express.static("public"));

// Serve static files from React build
const path = require("path");
app.use(express.static(path.join(__dirname, "../frontend/build")));

// --- ROUTES ---
// Test Route
app.get("/", (req, res) => {
  res.send("Welcome to the University Voting System API");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/logs", logRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);


// Catch-all: send React index.html for any non-API route
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
// });

app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});


// --- START SERVER & CONNECT TO DB ---
app.listen(PORT, async () => {
  console.log(`\n🚀 Server is running on port ${PORT}`.blue);
  console.log(`🔓 CORS enabled for: ${CORS_ORIGIN}`.cyan);

  try {
    await dbConfig();
    console.log("✅ Database connected successfully".green);
  } catch (error) {
    console.error("❌ Database connection failed".red, error);
    process.exit(1);
  }
});
