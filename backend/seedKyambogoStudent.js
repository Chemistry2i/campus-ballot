const mongoose = require('mongoose');
require('dotenv').config();

async function seedStudent() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const Organization = require('./models/Organization');
  const User = require('./models/User');
  
  // Find Kyambogo University
  const kyambogo = await Organization.findOne({ name: /kyambogo/i });
  if (!kyambogo) {
    console.log('Kyambogo University not found. Available orgs:');
    const orgs = await Organization.find({}, 'name code type');
    console.log(orgs.map(o => o.name + ' (' + o.type + ')').join('\n'));
    process.exit(1);
  }
  
  console.log('Found:', kyambogo.name, '- ID:', kyambogo._id);
  
  // Create test student
  const studentData = {
    name: 'Test Kyambogo Student',
    email: 'student1.kyu@test.com',
    password: 'Test123!',
    role: 'student',
    studentId: 'KYU2026001',
    organization: kyambogo._id,
    isVerified: true,
    emailVerified: true,
    accountStatus: 'active'
  };
  
  // Check if exists
  const existing = await User.findOne({ email: studentData.email });
  if (existing) {
    console.log('Student already exists:', existing.email);
    process.exit(0);
  }
  
  const student = new User(studentData);
  await student.save();
  console.log('Created student:', student.email, 'Password: Test123!');
  
  process.exit(0);
}

seedStudent().catch(err => { console.error(err); process.exit(1); });
