/**
 * List all candidates and their associated users
 */

const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
const User = require('./models/User');
require('dotenv').config();

const listCandidates = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const candidates = await Candidate.find().sort({ createdAt: -1 });
    
    console.log(`Found ${candidates.length} candidates\n`);
    console.log('='.repeat(100));

    for (const candidate of candidates) {
      console.log(`Name: ${candidate.name}`);
      console.log(`Position: ${candidate.position}`);
      console.log(`Status: ${candidate.status}`);
      console.log(`Candidate ID: ${candidate._id}`);
      console.log(`User ID: ${candidate.user || 'NOT LINKED'}`);
      
      if (candidate.user) {
        const user = await User.findById(candidate.user);
        if (user) {
          console.log(`  └─ User: ${user.name} (${user.email})`);
          console.log(`  └─ Primary Role: ${user.role}`);
          console.log(`  └─ Additional Roles: ${JSON.stringify(user.additionalRoles || [])}`);
        } else {
          console.log(`  └─ ❌ USER NOT FOUND IN DATABASE`);
        }
      }
      
      console.log('-'.repeat(100));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

listCandidates();
