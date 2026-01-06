/**
 * Script to add 'candidate' to additionalRoles for all approved candidates
 * Run this once to fix existing approved candidates who were approved before the role system was implemented
 * 
 * Usage: node fixCandidateRoles.js
 */

const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
const User = require('./models/User');
require('dotenv').config();

const fixCandidateRoles = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all approved candidates
    const approvedCandidates = await Candidate.find({ status: 'approved' }).populate('user');
    console.log(`\n📊 Found ${approvedCandidates.length} approved candidates`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Update each candidate's user
    for (const candidate of approvedCandidates) {
      if (!candidate.user) {
        console.log(`⚠️  Skipping ${candidate.name} - no user linked`);
        skipped++;
        continue;
      }

      try {
        const user = await User.findById(candidate.user._id);
        
        if (!user) {
          console.log(`❌ User not found for candidate ${candidate.name}`);
          errors++;
          continue;
        }

        // Check if 'candidate' is already in additionalRoles
        if (user.additionalRoles && user.additionalRoles.includes('candidate')) {
          console.log(`✓ ${user.name} already has candidate role`);
          skipped++;
          continue;
        }

        // Add 'candidate' to additionalRoles
        await User.findByIdAndUpdate(
          user._id,
          { $addToSet: { additionalRoles: 'candidate' } },
          { new: true }
        );

        console.log(`✅ Added candidate role to ${user.name} (${user.email})`);
        updated++;
      } catch (err) {
        console.error(`❌ Error updating ${candidate.name}:`, err.message);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📈 Summary:');
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Run the script
fixCandidateRoles();
