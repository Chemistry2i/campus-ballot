/**
 * Test script to add candidate role to a specific user
 * Usage: node addCandidateRole.js <candidateId>
 */

const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
const User = require('./models/User');
require('dotenv').config();

const addCandidateRole = async (candidateId) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const candidate = await Candidate.findById(candidateId);
    
    if (!candidate) {
      console.log(`❌ Candidate not found with ID: ${candidateId}`);
      process.exit(1);
    }

    console.log(`Found candidate: ${candidate.name}`);
    console.log(`Status: ${candidate.status}`);
    console.log(`User ID: ${candidate.user}\n`);

    if (!candidate.user) {
      console.log(`❌ This candidate has no user linked`);
      process.exit(1);
    }

    console.log(`Fetching user...`);
    const user = await User.findById(candidate.user);
    
    if (!user) {
      console.log(`❌ User not found with ID: ${candidate.user}`);
      process.exit(1);
    }

    console.log(`User: ${user.name} (${user.email})`);
    console.log(`Current role: ${user.role}`);
    console.log(`Current additionalRoles: ${JSON.stringify(user.additionalRoles || [])}\n`);

    if (user.additionalRoles && user.additionalRoles.includes('candidate')) {
      console.log(`✅ User already has candidate role!`);
      process.exit(0);
    }

    console.log(`Adding 'candidate' to additionalRoles...`);
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $addToSet: { additionalRoles: 'candidate' } },
      { new: true }
    );

    console.log(`\n✅ SUCCESS!`);
    console.log(`Updated role: ${updatedUser.role}`);
    console.log(`Updated additionalRoles: ${JSON.stringify(updatedUser.additionalRoles)}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

const candidateId = process.argv[2];
if (!candidateId) {
  console.log('Usage: node addCandidateRole.js <candidateId>');
  console.log('Example: node addCandidateRole.js 695d71f2a4a58df8f3315d4a');
  process.exit(1);
}

addCandidateRole(candidateId);
