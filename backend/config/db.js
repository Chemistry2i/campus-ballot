const mongoose = require("mongoose");
const colors = require("colors");

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully".green);
  } catch (error) {
    console.error("MongoDB connection failed".red, error);
    process.exit(1); // Exit process with failure
  }
};

// Export the connectDB function
module.exports = connectDB;