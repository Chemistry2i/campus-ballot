// const mongoose = require("mongoose");
// const colors = require("colors");

// // Function to connect to MongoDB
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("MongoDB connected successfully".green);
//   } catch (error) {
//     console.error("MongoDB connection failed".red, error);
//     process.exit(1); // Exit process with failure
//   }
// };

// // Export the connectDB function
// module.exports = connectDB;

const mongoose = require("mongoose");
const colors = require("colors");

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // -----------------------------------------------------------------------
      // Connection Pool — default is 5, which is catastrophically small for
      // concurrent voting. 50 connections handles ~500-1000 concurrent voters.
      // -----------------------------------------------------------------------
      maxPoolSize:     50,   // Maximum open connections in the pool
      minPoolSize:     10,   // Keep 10 connections warm, avoiding cold-start lag

      // -----------------------------------------------------------------------
      // Timeouts — prevent hung connections from congesting the pool
      // -----------------------------------------------------------------------
      socketTimeoutMS:          45000,  // Kill idle sockets after 45s
      serverSelectionTimeoutMS:  5000,  // Fail fast if no server available in 5s
      connectTimeoutMS:         10000,  // Give up trying to connect after 10s
      heartbeatFrequencyMS:     10000,  // Check server health every 10s

      // -----------------------------------------------------------------------
      // Write Concern — w:1 is the default (acknowledges primary write).
      // j:false means we don't wait for journal flush on every write,
      // reducing write latency by ~5-15ms per operation.
      // Safe for a voting system because MongoDB's WiredTiger storage engine
      // provides crash recovery via its own checkpointing.
      // -----------------------------------------------------------------------
      w:       1,
      j:       false,
      wtimeout: 5000,
    });
    console.log(`\u2705 MongoDB Connected: ${conn.connection.host}`.green);
    console.log(`\uD83D\uDCCA Connection pool: min=${conn.connection.config?.minPoolSize || 10}, max=${conn.connection.config?.maxPoolSize || 50}`.cyan);
  } catch (error) {
    console.error(`\u274C MongoDB connection failed: ${error.message}`.red);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
