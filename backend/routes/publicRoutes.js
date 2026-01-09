const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const CampaignMaterial = require('../models/CampaignMaterial');

// @desc    Get all approved candidates (public)
// @route   GET /api/public/candidates
// @access  Public
router.get('/candidates', async (req, res) => {
  try {
    const { election, position, search } = req.query;
    
    const filter = { status: 'approved' };
    
    if (election) {
      filter.election = election;
    }
    
    if (position) {
      filter.position = { $regex: position, $options: 'i' };
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { party: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const candidates = await Candidate.find(filter)
      .populate('election', 'title status startDate endDate')
      .populate('user', 'name email department profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching public candidates:', error);
    res.status(500).json({ message: 'Failed to fetch candidates' });
  }
});

// @desc    Get single candidate details (public)
// @route   GET /api/public/candidates/:id
// @access  Public
router.get('/candidates/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('election', 'title status startDate endDate description')
      .populate('user', 'name email department profilePicture bio');
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    // Increment view count if exists
    if (typeof candidate.views === 'number') {
      candidate.views += 1;
      await candidate.save();
    }
    
    res.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ message: 'Failed to fetch candidate' });
  }
});

// @desc    Get candidate's campaign materials (public)
// @route   GET /api/public/candidates/:id/materials
// @access  Public
router.get('/candidates/:id/materials', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    // Get materials uploaded by this candidate's user
    const materials = await CampaignMaterial.find({ user: candidate.user })
      .sort({ createdAt: -1 });
    
    res.json(materials);
  } catch (error) {
    console.error('Error fetching candidate materials:', error);
    res.status(500).json({ message: 'Failed to fetch materials' });
  }
});

// @desc    Get all active elections with candidates (public)
// @route   GET /api/public/elections
// @access  Public
router.get('/elections', async (req, res) => {
  try {
    const elections = await Election.find({
      status: { $in: ['active', 'upcoming', 'ongoing'] }
    })
      .populate({
        path: 'candidates',
        match: { status: 'approved' },
        populate: { path: 'user', select: 'name profilePicture department' }
      })
      .sort({ startDate: -1 });
    
    res.json(elections);
  } catch (error) {
    console.error('Error fetching public elections:', error);
    res.status(500).json({ message: 'Failed to fetch elections' });
  }
});

// @desc    Get candidates for specific election (public)
// @route   GET /api/public/elections/:id/candidates
// @access  Public
router.get('/elections/:id/candidates', async (req, res) => {
  try {
    const { position } = req.query;
    
    const filter = { 
      election: req.params.id,
      status: 'approved'
    };
    
    if (position) {
      filter.position = { $regex: position, $options: 'i' };
    }
    
    const candidates = await Candidate.find(filter)
      .populate('election', 'title status startDate endDate')
      .populate('user', 'name email department profilePicture')
      .sort({ position: 1, name: 1 });
    
    // Get unique positions for this election
    const positions = await Candidate.distinct('position', { 
      election: req.params.id,
      status: 'approved'
    });
    
    res.json({ candidates, positions });
  } catch (error) {
    console.error('Error fetching election candidates:', error);
    res.status(500).json({ message: 'Failed to fetch candidates' });
  }
});

module.exports = router;
