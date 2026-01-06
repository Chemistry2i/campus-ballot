/**
 * Quick test script to check a user's roles
 * Usage: node checkUserRoles.js <email>
 * Example: node checkUserRoles.js akello@gmail.com
 */

const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUserRoles = async (email) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`❌ User not found with email: ${email}`);
      process.exit(1);
    }

    console.log('=' .repeat(60));
    console.log('USER INFORMATION');
    console.log('='.repeat(60));
    console.log(`Name:              ${user.name}`);
    console.log(`Email:             ${user.email}`);
    console.log(`Student ID:        ${user.studentId || 'N/A'}`);
    console.log(`Primary Role:      ${user.role}`);
    console.log(`Additional Roles:  ${user.additionalRoles && user.additionalRoles.length > 0 ? JSON.stringify(user.additionalRoles) : '[]'}`);
    console.log(`Is Verified:       ${user.isVerified ? 'Yes' : 'No'}`);
    console.log('='.repeat(60));
    
    if (user.additionalRoles && user.additionalRoles.includes('candidate')) {
      console.log('\n✅ This user HAS the candidate role in additionalRoles');
      console.log('   They should see the role selection modal at login');
    } else {
      console.log('\n⚠️  This user DOES NOT have the candidate role');
      console.log('   They will login as a regular student');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

const email = process.argv[2];
if (!email) {
  console.log('Usage: node checkUserRoles.js <email>');
  console.log('Example: node checkUserRoles.js akello@gmail.com');
  process.exit(1);
}

checkUserRoles(email);
