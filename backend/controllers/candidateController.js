const asyncHandler = require("express-async-handler");
const Candidate = require("../models/Candidate");
const Election = require("../models/Election");

// @desc    Create a candidate (Admin only)
// @route   POST /api/candidates
// @access  Admin only
const createCandidate = asyncHandler(async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can create candidates" });
    }

    // Multer puts files in req.files and text fields in req.body
    const {
      election,
      name,
      position,
      description,
      party,
      manifesto
    } = req.body;

    // Handle files (photo and symbol)
    let photo = null;
    let symbol = null;
    if (req.files) {
      if (req.files.photo && req.files.photo[0]) {
        photo = req.files.photo[0].filename || req.files.photo[0].path;
      }
      if (req.files.symbol && req.files.symbol[0]) {
        symbol = req.files.symbol[0].filename || req.files.symbol[0].path;
      }
    }

    if (!election || !name || !position || !description) {
      return res.status(400).json({ message: "Missing required candidate fields" });
    }

    const validElection = await Election.findById(election);
    if (!validElection) {
      return res.status(404).json({ message: "Election not found" });
    }

    const candidate = await Candidate.create({
      user: req.user._id, // Admin who added the candidate
      election,
      name,
      photo,
      position,
      symbol,
      party,
      description,
      manifesto,
      status: "pending"
    });

    // Add candidate to the election's candidates array
    await Election.findByIdAndUpdate(
      election,
      { $addToSet: { candidates: candidate._id } }
    );

    res.status(201).json({
      message: "Candidate created successfully",
      candidate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all candidates
// @route   GET /api/candidates
// @access  Protected
const getAllCandidates = asyncHandler(async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .populate("user", "name email role")
      .populate("election", "title");

    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get candidate by ID
// @route   GET /api/candidates/:id
// @access  Protected
const getCandidateById = asyncHandler(async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate("user", "name email role")
      .populate("election", "title");

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all approved candidates with their vote counts
// @route   GET /api/candidates/approved-votes
// @access  Protected or Admin (as you prefer)
const getApprovedCandidatesVotes = asyncHandler(async (req, res) => {
  try {
    const candidates = await Candidate.find({ status: "approved" })
      .select("name votes");
    res.json({
      candidateNames: candidates.map(c => c.name),
      candidateVotes: candidates.map(c => c.votes || 0),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a candidate
// @route   PUT /api/candidates/:id
// @access  Admin or Candidate Owner
const updateCandidate = asyncHandler(async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const isOwner = candidate.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You do not have permission to update this candidate" });
    }

    const fields = [
      "name", "photo", "position", "symbol",
      "party", "description", "manifesto", "status"
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        candidate[field] = req.body[field];
      }
    });

    const updated = await candidate.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a candidate
// @route   DELETE /api/candidates/:id
// @access  Admin only
const deleteCandidate = asyncHandler(async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Remove candidate from election's candidates array
    await Election.findByIdAndUpdate(
      candidate.election,
      { $pull: { candidates: candidate._id } }
    );

    await candidate.deleteOne();
    res.json({ message: "Candidate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get candidates by election
// @route   GET /api/candidates/election/:electionId
// @access  Protected
const getCandidatesByElection = asyncHandler(async (req, res) => {
  try {
    const candidates = await Candidate.find({ election: req.params.electionId })
      .populate("user", "name email role")
      .populate("election", "title");

    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Approve a candidate
// @route   PUT /api/candidates/:id/approve
// @access  Admin only
const approveCandidate = asyncHandler(async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    candidate.status = "approved";
    await candidate.save();

    res.json({ message: "Candidate approved" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Disqualify a candidate
// @route   PUT /api/candidates/:id/disqualify
// @access  Admin only
const disqualifyCandidate = asyncHandler(async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    candidate.status = "disqualified";
    await candidate.save();

    res.json({ message: "Candidate disqualified" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get logged-in student's candidacies
// @route   GET /api/candidates/me/candidacy
// @access  Student only
const getMyCandidacy = asyncHandler(async (req, res) => {
  try {
    const candidacies = await Candidate.find({ user: req.user._id })
      .populate("election", "title status");

    if (!candidacies || candidacies.length === 0) {
      return res.status(404).json({ message: "You have not applied as a candidate in any election" });
    }

    res.json(candidacies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get candidates by election and position
// @route   GET /api/candidates/election/:electionId/position/:position
// @access  Protected
const getCandidatesByElectionAndPosition = asyncHandler(async (req, res) => {
  try {
    const { electionId, position } = req.params;
    const candidates = await Candidate.find({ election: electionId, position })
      .populate("user", "name email role")
      .populate("election", "title");
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Search or paginate candidates
// @route   GET /api/candidates/search
// @access  Protected
const searchCandidates = asyncHandler(async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const query = q
      ? { name: { $regex: q, $options: "i" } }
      : {};

    const candidates = await Candidate.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("user", "name email role")
      .populate("election", "title");

    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Withdraw own candidacy
// @route   DELETE /api/candidates/me/candidacy
// @access  Candidate only
const withdrawMyCandidacy = asyncHandler(async (req, res) => {
  try {
    const candidacy = await Candidate.findOne({ user: req.user._id });
    if (!candidacy) {
      return res.status(404).json({ message: "You have not applied as a candidate" });
    }

    // Remove candidate from election's candidates array
    await Election.findByIdAndUpdate(
      candidacy.election,
      { $pull: { candidates: candidacy._id } }
    );

    await candidacy.deleteOne();
    res.json({ message: "Candidacy withdrawn successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  getApprovedCandidatesVotes,
  updateCandidate,
  deleteCandidate,
  getCandidatesByElection,
  approveCandidate,
  disqualifyCandidate,
  getMyCandidacy,
  getCandidatesByElectionAndPosition,
  searchCandidates,
  withdrawMyCandidacy,
};