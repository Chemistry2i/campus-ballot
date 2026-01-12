// scripts/migrateCandidateImageUrls.js
// Run this script with: node scripts/migrateCandidateImageUrls.js
// It will update all candidate photo/symbol fields to use full Cloudinary URLs if not already.

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Candidate = require('../models/Candidate');

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

function isFullCloudinaryUrl(url) {
  return url && url.startsWith('http');
}

function buildCloudinaryUrl(publicId) {
  // If the publicId already has a file extension, use as is; else default to .jpg
  if (!publicId) return null;
  if (publicId.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    return `${BASE_URL}/${publicId}`;
  }
  // Default to .jpg if no extension
  return `${BASE_URL}/${publicId}.jpg`;
}

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const candidates = await Candidate.find({
    $or: [
      { photo: { $exists: true, $ne: null, $not: /^http/ } },
      { symbol: { $exists: true, $ne: null, $not: /^http/ } }
    ]
  });

  let updated = 0;
  for (const candidate of candidates) {
    let changed = false;
    if (candidate.photo && !isFullCloudinaryUrl(candidate.photo)) {
      candidate.photo = buildCloudinaryUrl(candidate.photo.replace(/^\/uploads\//, '').replace(/^campus-ballot\/candidates\//, 'campus-ballot/candidates/'));
      changed = true;
    }
    if (candidate.symbol && !isFullCloudinaryUrl(candidate.symbol)) {
      candidate.symbol = buildCloudinaryUrl(candidate.symbol.replace(/^\/uploads\//, '').replace(/^campus-ballot\/candidates\//, 'campus-ballot/candidates/'));
      changed = true;
    }
    if (changed) {
      await candidate.save();
      updated++;
      console.log(`Updated candidate ${candidate._id}`);
    }
  }
  console.log(`Migration complete. Updated ${updated} candidates.`);
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
