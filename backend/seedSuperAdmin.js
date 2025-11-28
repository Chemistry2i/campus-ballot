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

const seedSuperAdmin = async () => {
  try {
    await connectDB();

    const superAdminEmail = "superadmin@kyu.ac.ug";

    const superAdminExists = await User.findOne({ email: superAdminEmail });

    if (superAdminExists) {
      console.log("ℹ️ Super Admin already exists with email:", superAdminEmail);
    } else {
      const hashedPassword = await bcrypt.hash("SuperAdminStrongPass123!", 12);

      const superAdmin = await User.create({
        name: "Super Admin",
        email: superAdminEmail,
        password: hashedPassword,
        role: "super_admin",
        isVerified: true,
      });

      console.log("✅ Super Admin user created:", superAdmin.email);
    }

    await mongoose.disconnect();
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding super admin:", err);
    process.exit(1);
  }
};

seedSuperAdmin();
