// backend/server.js

// Loading environment variables
require('dotenv').config();

// Initialize Datadog Tracing as the very first thing (agentless for Render)
const tracer = require('dd-trace').init({
  apiKey: process.env.DD_API_KEY,
  site: process.env.DD_SITE || 'datadoghq.com',
});
console.log(`🟣 Datadog tracing enabled (agentless). Service: ${process.env.DD_SERVICE}, Env: ${process.env.DD_ENV}, Site: ${process.env.DD_SITE || 'datadoghq.com'}`);

// require("dotenv").config();

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
const candidateMaterialRoutes = require('./routes/candidateMaterialRoutes');
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
const applicationRoutes = require('./routes/applicationRoutes');
const agentRoutes = require('./routes/agentRoutes');
const publicRoutes = require('./routes/publicRoutes');
const engagementRoutes = require('./routes/engagementRoutes');
const observerRoutes = require('./routes/observerRoutes');
const backupController = require('./controllers/backupController');
const cron = require('node-cron');


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
// Add strong Content Security Policy (CSP)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", "https://symmetrical-space-halibut-x56vpp9j9pxgf67vg-5173.app.github.dev", "https://api.campusballot.tech"],
      scriptSrc: [
        "'self'",
        "https://symmetrical-space-halibut-x56vpp9j9pxgf67vg-5173.app.github.dev",
        "https://api.campusballot.tech",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net"
      ],
      styleSrc: [
        "'self'",
        "https://symmetrical-space-halibut-x56vpp9j9pxgf67vg-5173.app.github.dev",
        "https://api.campusballot.tech",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",
        "'unsafe-inline'"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://res.cloudinary.com",
        "https://symmetrical-space-halibut-x56vpp9j9pxgf67vg-5173.app.github.dev",
        "https://api.campusballot.tech"
      ],
      connectSrc: [
        "'self'",
        "https://symmetrical-space-halibut-x56vpp9j9pxgf67vg-5173.app.github.dev",
        "https://api.campusballot.tech"
      ],
      fontSrc: [
        "'self'",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",
        "https://symmetrical-space-halibut-x56vpp9j9pxgf67vg-5173.app.github.dev",
        "https://api.campusballot.tech"
      ],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);
app.use(morgan("dev"));
app.use(cors({
  origin: [
    "https://symmetrical-space-halibut-x56vpp9j9pxgf67vg-5173.app.github.dev",
    "https://api.campusballot.tech",
    "https://symmetrical-space-halibut-x56vpp9j9pxgf67vg-5173.app.github.dev",
    "https://legendary-space-journey-74p9qrwrq99hpppj-5000.app.github.dev"
  ],
  credentials: true
}));

// --- ADD THE HEALTH CHECK HERE ---
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({ 
    status: 'warm', 
    database: dbStatus,
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString()
  });
});

// --- API Response Time Tracking Middleware ---
if (!global.__apiResponseTimes) global.__apiResponseTimes = [];
app.use((req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const ms = diff[0] * 1000 + diff[1] / 1e6;
    // Only track API routes
    if (req.originalUrl.startsWith('/api/')) {
      global.__apiResponseTimes.push(ms);
      // Keep only last 100 response times
      if (global.__apiResponseTimes.length > 100) {
        global.__apiResponseTimes.shift();
      }
    }
  });
  next();
});

// Custom rate limiter: higher limits for admin, super admin, observer
const { ipKeyGenerator } = require("express-rate-limit");

const customRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req, res) => {
    let limit = 100;
    try {
      const user = req.user || (req.session && req.session.user);
      if (user && ["admin", "super admin", "observer"].includes(user.role)) {
        limit = 1000;
      }
    } catch (e) {}
    return limit;
  },
  keyGenerator: (req, res) => {
    if (req.user && req.user.id) return req.user.id;
    // Use the recommended helper for IPs
    return ipKeyGenerator(req, res);
  },
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(customRateLimiter);

// Static files
app.use(express.static("public"));

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
// Public routes (no authentication required)
app.use("/api/public", publicRoutes);
// Agent routes must come BEFORE candidate routes to avoid route conflicts
app.use('/api/candidates/agents', agentRoutes);
// Agent dashboard routes (for agents viewing their own dashboard)
app.use('/api/agent', require('./routes/agentDashboardRoutes'));
app.use('/api/candidate/engagement', engagementRoutes);
app.use('/api/candidate', candidateMaterialRoutes);
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
app.use('/api/applications', applicationRoutes);
app.use('/api/observer', observerRoutes);
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
      "https://symmetrical-space-halibut-x56vpp9j9pxgf67vg-5173.app.github.dev",
      "https://symmetrical-space-halibut-x56vpp9j9pxgf67vg-5173.app.github.dev",
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

  // Schedule automatic backups based on stored schedule
  try {
    scheduleBackups(app);
  } catch (err) {
    console.error('Failed to schedule backups:', err.message);
  }
});

function scheduleBackups(app) {
  const existing = app.get('backupTask');
  if (existing) existing.stop();

  const setup = async () => {
    const cfg = await backupController.getScheduleConfig();
    if (!cfg.enabled) {
      console.log('📦 Backups: schedule disabled');
      app.set('backupTask', null);
      return;
    }
    const [hh, mm] = (cfg.time || '02:00').split(':');
    const hour = Number(hh) || 2;
    const minute = Number(mm) || 0;
    const cronExpr = buildCron(cfg.frequency, minute, hour);

    const task = cron.schedule(cronExpr, async () => {
      try {
        const result = await backupController.performBackup({ app, type: 'scheduled' });
        console.log(`📦 Scheduled backup created at ${result.timestamp}`);
      } catch (e) {
        console.error('Scheduled backup failed:', e.message);
      }
    }, { timezone: 'UTC' });

    app.set('backupTask', task);
    console.log(`📦 Backups scheduled: ${cfg.frequency} at ${cfg.time} (cron: ${cronExpr})`);
  };

  setup();
  app.set('scheduleBackups', () => scheduleBackups(app));
}

function buildCron(freq, minute, hour) {
  const m = Math.max(0, Math.min(59, minute));
  const h = Math.max(0, Math.min(23, hour));
  if (freq === 'weekly') return `0 ${m} ${h} * * 0`; // Sundays
  if (freq === 'monthly') return `0 ${m} ${h} 1 * *`; // First of month
  return `0 ${m} ${h} * * *`; // Daily
}
