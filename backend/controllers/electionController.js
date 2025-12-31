const asyncHandler = require("express-async-handler");
const Election = require("../models/Election");
const Candidate = require("../models/Candidate");
const { logActivity, getIpAddress, getUserAgent } = require("../utils/logActivity");

// @desc    Create a new election
// @route   POST /api/elections
// @access  Admin only
const createElection = asyncHandler(async (req, res) => {
  try {
    const { title, description, startDate, endDate, positions, eligibility } = req.body;

    if (!title || !description || !startDate || !endDate || !positions) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await Election.findOne({ title });
    if (exists) {
      return res.status(400).json({ message: "Election with this title already exists" });
    }

    // Determine status based on dates
    const now = new Date();
    let computedStatus = 'upcoming';
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    if (now < sDate) computedStatus = 'upcoming';
    else if (now >= sDate && now <= eDate) computedStatus = 'ongoing';
    else if (now > eDate) computedStatus = 'completed';

    const election = await Election.create({
      title,
      description,
      startDate,
      endDate,
      positions,
      eligibility,
      status: computedStatus,
      createdBy: req.user._id,
    });

    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'create',
      entityType: 'Election',
      entityId: election._id.toString(),
      details: `Created election: ${title}`,
      status: 'success',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });

    try {
      const io = req.app.get('io');
      if (io) io.emit('election:created', { election });
    } catch (e) {
      console.error('Socket emit error (election created):', e.message);
    }

    res.status(201).json({ message: "Election created successfully", election });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all elections (paginated, optimized)
// @route   GET /api/elections
// @access  Protected
const getAllElections = asyncHandler(async (req, res) => {
  try {
    // Pagination params
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    // Only populate candidates if requested
    const populateCandidates = req.query.withCandidates === 'true';

    // Build query
    let query = Election.find()
      .populate("createdBy", "name email role")
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (populateCandidates) {
      query = query.populate({
        path: "candidates",
        match: { status: "approved" },
        select: "name party photo status votes position"
      });
    }

    let elections = await query;
    const total = await Election.countDocuments();
    const now = new Date();

    elections = elections.map(election => {
      if (now < election.startDate) {
        election.status = "upcoming";
      } else if (now >= election.startDate && now <= election.endDate) {
        election.status = "ongoing";
      } else if (now > election.endDate) {
        election.status = "completed";
      }
      return election;
    });

    res.json({
      elections,
      total,
      page,
      limit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// @desc    Get a single election by ID
// @route   GET /api/elections/:id
// @access  Protected
const getElectionById = asyncHandler(async (req, res) => {
  try {
    const election = await Election.findById(req.params.id).populate("createdBy", "name email role");
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
      // Compute status from dates to ensure freshness
      try {
        const now = new Date();
        if (election.startDate && election.endDate) {
          if (now < election.startDate) election.status = 'upcoming';
          else if (now >= election.startDate && now <= election.endDate) election.status = 'ongoing';
          else if (now > election.endDate) election.status = 'completed';
        }
      } catch (e) {
        // ignore
      }
      res.json(election);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update an election
// @route   PUT /api/elections/:id
// @access  Admin only
const updateElection = asyncHandler(async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    const fields = ["title", "description", "startDate", "endDate", "positions", "eligibility", "status"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        // Defensive mapping: accept legacy 'active' sent by older frontends
        if (field === 'status' && typeof req.body.status === 'string') {
          let s = req.body.status;
          if (s === 'active') s = 'ongoing';
          // map 'ended' to 'completed' for backward compatibility until we rename everywhere
          if (s === 'ended') s = 'completed';
          election[field] = s;
        } else {
          election[field] = req.body[field];
        }
      }
    });
    election.updatedBy = req.user._id;

    // Recompute status if dates changed or status not explicitly provided
    const now = new Date();
    if (!req.body.status) {
      const sDate = election.startDate ? new Date(election.startDate) : null;
      const eDate = election.endDate ? new Date(election.endDate) : null;
      if (sDate && eDate) {
        if (now < sDate) election.status = 'upcoming';
        else if (now >= sDate && now <= eDate) election.status = 'ongoing';
        else if (now > eDate) election.status = 'completed';
      }
    }

    const updated = await election.save();
    
    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'update',
      entityType: 'Election',
      entityId: updated._id.toString(),
      details: `Updated election: ${updated.title}`,
      status: 'success',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });
    
    try {
      const io = req.app.get('io');
      if (io) io.emit('election:updated', { election: updated });
    } catch (e) {
      console.error('Socket emit error (election updated):', e.message);
    }
    res.json({ message: "Election updated", election: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete an election
// @route   DELETE /api/elections/:id
// @access  Admin only
const deleteElection = asyncHandler(async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    const electionId = election._id.toString();
    const electionTitle = election.title;
    await election.deleteOne();
    
    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'delete',
      entityType: 'Election',
      entityId: electionId,
      details: `Deleted election: ${electionTitle}`,
      status: 'success',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });
    
    try {
      const io = req.app.get('io');
      if (io) io.emit('election:deleted', { id: electionId });
    } catch (e) {
      console.error('Socket emit error (election deleted):', e.message);
    }
    res.json({ message: "Election deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Publish results for an election
// @route   PUT /api/elections/:id/publish-results
// @access  Admin only
const publishResults = asyncHandler(async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    election.resultsPublished = true;
    await election.save();
    try {
      const io = req.app.get('io');
      if (io) io.emit('election:results:published', { id: election._id });
    } catch (e) {
      console.error('Socket emit error (results published):', e.message);
    }
    res.json({ message: "Results published" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get results for an election
// @route   GET /api/elections/:id/results
// @access  Protected
const getElectionResults = asyncHandler(async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    if (!election.resultsPublished) {
      return res.status(403).json({ message: "Results not published yet" });
    }
    // Get candidates and their votes
    const candidates = await Candidate.find({ election: election._id }).select("name position votes status");
    res.json({ election: election.title, results: candidates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all candidates for an election
// @route   GET /api/elections/:id/candidates
// @access  Protected
const getElectionCandidates = asyncHandler(async (req, res) => {
  try {
    const candidates = await Candidate.find({ election: req.params.id })
      .populate("user", "name email")
      .select("-manifesto");
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add a position to an election
// @route   POST /api/elections/:id/positions
// @access  Admin only
const addPositionToElection = asyncHandler(async (req, res) => {
  try {
    const { position } = req.body;
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    if (!position) {
      return res.status(400).json({ message: "Position is required" });
    }
    if (election.positions.includes(position)) {
      return res.status(400).json({ message: "Position already exists" });
    }
    election.positions.push(position);
    await election.save();
    res.json({ message: "Position added", positions: election.positions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Remove a position from an election
// @route   DELETE /api/elections/:id/positions/:position
// @access  Admin only
const removePositionFromElection = asyncHandler(async (req, res) => {
  try {
    const { position } = req.params;
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    election.positions = election.positions.filter((pos) => pos !== position);
    await election.save();
    res.json({ message: "Position removed", positions: election.positions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get active (ongoing) elections
// @route   GET /api/elections/active
// @access  Protected
const getActiveElections = asyncHandler(async (req, res) => {
  try {
    const now = new Date();
    const elections = await Election.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
      status: "ongoing"
    });
    res.json(elections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get upcoming elections
// @route   GET /api/elections/upcoming
// @access  Protected
const getUpcomingElections = asyncHandler(async (req, res) => {
  try {
    const now = new Date();
    const elections = await Election.find({
      startDate: { $gt: now },
      status: "upcoming"
    });
    res.json(elections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get completed elections
// @route   GET /api/elections/completed
// @access  Protected
const getCompletedElections = asyncHandler(async (req, res) => {
  try {
    const now = new Date();
    const elections = await Election.find({
      endDate: { $lt: now },
      status: "completed"
    });
    res.json(elections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Search elections
// @route   GET /api/elections/search
// @access  Protected
const searchElections = asyncHandler(async (req, res) => {
  try {
    const { q, status } = req.query;
    let filter = {};
    if (q) {
      filter.title = { $regex: q, $options: "i" };
    }
    if (status) {
      filter.status = status;
    }
    const elections = await Election.find(filter);
    res.json(elections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Close an election (set status to completed)
// @route   PUT /api/elections/:id/close
// @access  Admin only
const closeElection = asyncHandler(async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    election.status = "completed";
    await election.save();
    try {
      const io = req.app.get('io');
      if (io) io.emit('election:closed', { id: election._id });
    } catch (e) {
      console.error('Socket emit error (election closed):', e.message);
    }
    res.json({ message: "Election closed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  createElection,
  getAllElections,
  getElectionById,
  updateElection,
  deleteElection,
  publishResults,
  getElectionResults,
  getElectionCandidates,
  addPositionToElection,
  removePositionFromElection,
  getActiveElections,
  getUpcomingElections,
  getCompletedElections,
  searchElections,
  closeElection
};