// backend/server.js

// Loading environment variables
require("dotenv").config();

// Core Modules
const express = require("express");
const path = require('path');
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
const devRoutes = require('./routes/devRoutes');
const reportRoutes = require('./routes/reportRoutes');
const metaRoutes = require('./routes/metaRoutes');
const contactRoutes = require('./routes/contactRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');


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
  origin: [
    "https://studious-space-robot-674g6rw49gg3rxr5-5173.app.github.dev",           // local dev
    "https://studious-space-robot-674g6rw49gg3rxr5-5173.app.github.dev",
    CORS_ORIGIN   // deployed frontend
  ],
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
app.use(express.static("public"));
// Serve uploaded files (images) from the uploads folder
// Add headers so images can be embedded/loaded cross-origin by the frontend dev server
app.use('/uploads', (req, res, next) => {
  // Allow the resource to be loaded cross-origin (needed when frontend runs on a different origin)
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  // Allow simple cross-origin GETs (images) from any origin in dev; CORS middleware still applies for APIs
  res.setHeader('Access-Control-Allow-Origin', '*');
  return next();
}, express.static(path.join(__dirname, 'uploads')));

// Serve static files from React build
// const path = require("path");
// app.use(express.static(path.join(__dirname, "../frontend/build")));

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
app.use('/api/dev', devRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/user', require('./routes/roleManagement'));


// Catch-all: send React index.html for any non-API route
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
// });

// app.use(express.static(path.join(__dirname, "../frontend/build")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
// });


// --- SOCKET.IO + START SERVER & CONNECT TO DB ---
const http = require('http');
const { Server: IOServer } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const server = http.createServer(app);
const io = new IOServer(server, {
  cors: {
    origin: [
      "https://studious-space-robot-674g6rw49gg3rxr5-5173.app.github.dev",
      "https://studious-space-robot-674g6rw49gg3rxr5-5173.app.github.dev",
      CORS_ORIGIN
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Authenticate sockets when possible. If a token is provided, verify and attach user to socket.
io.use(async (socket, next) => {
  try {
    const token = socket.handshake?.auth?.token || (socket.handshake?.headers?.authorization ? socket.handshake.headers.authorization.split(' ')[1] : null);
    if (!token) return next(); // allow unauthenticated sockets for public events

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('Authentication error'));

    socket.user = user;
    return next();
  } catch (err) {
    console.log('Socket auth error:', err.message);
    return next(new Error('Authentication error'));
  }
});

// Simple socket handlers (rooms used by frontend if needed)
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id, 'user:', socket.user ? socket.user.email : 'anonymous');

  socket.on('join', (room) => {
    if (!room) return;

    // enforce role-based access for certain namespaces
    if ((room.startsWith('election_') || room.startsWith('admin_')) && (!socket.user || socket.user.role !== 'admin')) {
      socket.emit('error', 'Not authorized to join this room');
      return;
    }

    socket.join(room);
  });

  socket.on('leave', (room) => {
    if (room) socket.leave(room);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', socket.id, reason);
  });
});

// Make io available to controllers via app
app.set('io', io);

// Start server and DB
server.listen(PORT, async () => {
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
