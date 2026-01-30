require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI);

async function createCandidateUser() {
  try {
    console.log('🎯 Creating candidate user with primary role...');

    const hashedPassword = await bcrypt.hash('candidate123', 10);

    // Delete existing test candidate if exists
    await User.deleteOne({ email: 'candidate@example.com' });

    // Create candidate user with primary role
    const candidateUser = new User({
      name: 'Candidate User',
      studentId: 'CAND2026',
      email: 'candidate@example.com',
      password: hashedPassword,
      role: 'candidate',  // PRIMARY ROLE: candidate
      faculty: 'Engineering',
      course: 'Computer Science',
      yearOfStudy: '3rd Year',
      gender: 'Male',
      isVerified: true
    });

    await candidateUser.save();

    console.log('✅ Successfully created candidate user:');
    console.log('📧 Email: candidate@example.com');
    console.log('🔒 Password: candidate123');
    console.log('👤 Primary Role: candidate');
    console.log('\n🚀 Login with these credentials');
    console.log('🎯 Should redirect to: /candidate');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

createCandidateUser();