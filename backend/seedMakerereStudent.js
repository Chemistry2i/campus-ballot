const mongoose = require('mongoose');
require('dotenv').config();

async function seedStudent() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const Organization = require('./models/Organization');
  const User = require('./models/User');
  
  // Find or create Makerere University
  let makerere = await Organization.findOne({ name: /makerere/i });
  
  if (!makerere) {
    console.log('Makerere University not found. Creating it...');
    
    // Find BAKUSA federation to set as parent
    const bakusa = await Organization.findOne({ code: 'BAKUSA' });
    
    makerere = new Organization({
      name: 'Makerere University',
      code: 'MAK',
      type: 'university',
      parent: bakusa ? bakusa._id : null,
      description: 'Makerere University Students Association',
      status: 'active',
      settings: {
        allowSelfRegistration: true,
        requireEmailVerification: true,
        allowFederationVoting: true
      }
    });
    await makerere.save();
    console.log('Created Makerere University with ID:', makerere._id);
  }
  
  console.log('Found:', makerere.name, '- ID:', makerere._id);
  
  // Create test student
  const studentData = {
    name: 'Test Makerere Student',
    email: 'student1.mak@test.com',
    password: 'Test123!',
    role: 'student',
    studentId: 'MAK2026001',
    organization: makerere._id,
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
