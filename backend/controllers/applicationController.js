const asyncHandler = require('express-async-handler');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const emailTemplates = require('../utils/emailTemplates');

// @desc    Candidate self-application
// @route   POST /api/applications
// @access  Authenticated (candidate)
const createApplication = asyncHandler(async (req, res) => {
  try {
    console.log('Application submission received');
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    
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
    // Use Cloudinary URLs if available
    if (req.files && req.files.photo && req.files.photo[0]) {
      // Multer-Cloudinary puts the URL in file.path
      photo = req.files.photo[0].path;
    }
    if (req.files && req.files.symbol && req.files.symbol[0]) {
      symbol = req.files.symbol[0].path;
    }
    
    if (!user || !election || !name || !position || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const validElection = await Election.findById(election);
    if (!validElection) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Check if election is active - prevent applications during voting
    if (validElection.status === 'active') {
      return res.status(403).json({ 
        message: 'Applications are closed - this election is currently in voting progress. Please try again after voting ends.' 
      });
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
    console.log('Application created successfully:', candidate._id);
    
    // Send pending application email to the user
    try {
      const applicantUser = await User.findById(user);
      if (applicantUser && applicantUser.email) {
        const emailTemplate = emailTemplates.applicationSubmitted({
          candidateName: name,
          electionTitle: validElection.title,
          position: position,
          userEmail: applicantUser.email
        });
        
        await sendEmail({
          to: applicantUser.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html
        });
        
        console.log('[EMAIL SENT] Application pending email sent to:', applicantUser.email);
      }
    } catch (emailError) {
      console.error('[EMAIL ERROR] Failed to send application pending email:', emailError.message);
      // Don't fail the entire request if email fails
    }
    
    res.status(201).json({ message: 'Application submitted', candidate });
  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = { createApplication };
