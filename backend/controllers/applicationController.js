const asyncHandler = require('express-async-handler');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');

// @desc    Candidate self-application
// @route   POST /api/applications
// @access  Authenticated (candidate)
const createApplication = asyncHandler(async (req, res) => {
  try {
    // Multer puts files in req.files and text fields in req.body
    const {
      user,
      election,
      name,
      position,
      party,
      description,
      manifesto
    } = req.body;
    let photo = null;
    let symbol = null;
    
    if (req.files && req.files.photo && req.files.photo[0]) {
      const fname = req.files.photo[0].filename || req.files.photo[0].path.split(/[\\/]/).pop();
      photo = `/uploads/${fname}`;
    }
    
    if (req.files && req.files.symbol && req.files.symbol[0]) {
      const fname = req.files.symbol[0].filename || req.files.symbol[0].path.split(/[\\/]/).pop();
      symbol = `/uploads/${fname}`;
    }
    
    if (!user || !election || !name || !position || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const validElection = await Election.findById(election);
    if (!validElection) {
      return res.status(404).json({ message: 'Election not found' });
    }
    const candidate = await Candidate.create({
      user,
      election,
      name,
      photo,
      symbol,
      position,
      party,
      description,
      manifesto,
      status: 'pending',
    });
    await Election.findByIdAndUpdate(
      election,
      { $addToSet: { candidates: candidate._id } }
    );
    res.status(201).json({ message: 'Application submitted', candidate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { createApplication };
