// seedAdmin.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

dotenv.config();

// Connect to DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = "admin@campusvote.com";

    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log("ℹ️ Admin already exists with email:", adminEmail);
    } else {
      const hashedPassword = await bcrypt.hash("AdminStrongPass123!", 12);

      // we shall add  all required fields for your User model
      const admin = await User.create({
        name: "Musisi Kizito",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        // Adding other required fields if your schema needs them
        // Example:
        // phone: "0700000000",
        // profilePicture: null,
      });

      console.log("✅ Admin user created:", admin.email);
    }

    await mongoose.disconnect();
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding admin:", err);
    process.exit(1);
  }
}
seedAdmin();