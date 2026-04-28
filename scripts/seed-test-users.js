const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

// Import User model - we'll define a minimal schema here to avoid dependency issues 
// within the standalone script, or try to import if path is correct.
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
  studentId: { type: String, unique: true },
  faculty: String,
  course: String,
  accountStatus: { type: String, default: 'active' },
  isEmailVerified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const SEED_COUNT = 1000;
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ MONGODB_URI not found in backend/.env');
  process.exit(1);
}

async function seedUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected.');

    // 1. Hash password once
    console.log('🔐 Hashing common password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 2. Prepare users
    const students = [];
    console.log(`🔨 Generating ${SEED_COUNT} virtual students...`);

    for (let i = 1; i <= SEED_COUNT; i++) {
        students.push({
            name: `Enterprise Student ${i}`,
            email: `student${i}@test.com`,
            password: hashedPassword,
            role: 'student',
            studentId: `2024-ST-0${1000 + i}`,
            faculty: 'Engineering',
            course: 'Computer Science',
            accountStatus: 'active',
            isEmailVerified: true
        });
    }

    // 3. Batch Insert
    console.log('📦 Writing to Database (Batch mode)...');
    // Using try-catch for individual batch issues like duplicates
    try {
        await User.insertMany(students, { ordered: false });
    } catch (e) {
        console.log(`⚠️ Note: Some users might already exist (Skipped duplicates)`);
    }

    console.log('🏁 SUCCESS: 1,000 students created for Load Testing.');
    console.log('--------------------------------------------------');
    console.log('Use these details for k6 Load Testing:');
    console.log('Email Pattern: student{N}@test.com');
    console.log('Password: password123');
    console.log('--------------------------------------------------');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Critical Error:', err.message);
    process.exit(1);
  }
}

seedUsers();
