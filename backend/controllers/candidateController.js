const asyncHandler = require("express-async-handler");
const Candidate = require("../models/Candidate");
const Election = require("../models/Election");
const User = require("../models/User");
const Agent = require("../models/Agent");
const sendEmail = require("../utils/sendEmail");
const emailTemplates = require("../utils/emailTemplates");
const { logActivity, getIpAddress, getUserAgent } = require("../utils/logActivity");

// Helper to escape regex special characters
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

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

    // Handle files (photo and symbol) - store Cloudinary URLs if available
    let photo = null;
    let symbol = null;
    if (req.files) {
      if (req.files.photo && req.files.photo[0]) {
        // Use Cloudinary URL if available, fallback to local path
        photo = req.files.photo[0].path || null;
      }
      if (req.files.symbol && req.files.symbol[0]) {
        symbol = req.files.symbol[0].path || null;
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

    // Emit realtime update
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('candidate:created', { candidate });
        io.to(`election_${candidate.election}`).emit('candidate:created', { candidate });
      }
    } catch (e) {
      console.error('Socket emit error (candidate created):', e.message);
    }

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
    const isAdmin = ["admin", "super_admin", "federation_admin"].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You do not have permission to update this candidate" });
    }

    // INTEGRITY CHECK: Prevent modifying critical fields if already approved
    // Changing position or election after approval corrupts voting data
    if (candidate.status === 'approved' && req.user.role !== 'admin') {
       // Candidates cannot change these fields once approved
       delete req.body.position;
       delete req.body.party;
       delete req.body.symbol;
    }

    const fields = [
      "name", "photo", "position", "symbol",
      "party", "description", "manifesto",
      "email", "phone", "studentId", "department", "yearOfStudy", "bio"
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        candidate[field] = req.body[field];
      }
    });
    
    const arrayFields = ["campaignPromises", "qualifications", "achievements"];

    arrayFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        candidate[field] = req.body[field];
      }
    });

    if (req.body.socialMedia !== undefined) {
      candidate.socialMedia = req.body.socialMedia;
    }

    const updated = await candidate.save();
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('candidate:updated', { candidate: updated });
        io.to(`election_${updated.election}`).emit('candidate:updated', { candidate: updated });
      }
    } catch (e) {
      console.error('Socket emit error (candidate updated):', e.message);
    }
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
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('candidate:deleted', { id: candidate._id });
        io.to(`election_${candidate.election}`).emit('candidate:deleted', { id: candidate._id });
      }
    } catch (e) {
      console.error('Socket emit error (candidate deleted):', e.message);
    }
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
    const candidate = await Candidate.findById(req.params.id)
      .populate('user', 'email name')
      .populate('election', 'title');

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    console.log(`[CANDIDATE APPROVAL] Starting approval for candidate: ${candidate.name}`);
    console.log(`[CANDIDATE APPROVAL] Candidate user ID: ${candidate.user._id}`);

    candidate.status = "approved";
    await candidate.save();

    // Add 'candidate' to the user's additionalRoles if not already present
    // This allows the student to access both Student and Candidate dashboards
    if (candidate.user) {
      try {
        console.log(`[CANDIDATE APPROVAL] Updating user ${candidate.user._id} with candidate role...`);
        
        const updatedUser = await User.findByIdAndUpdate(
          candidate.user._id,
          { $addToSet: { additionalRoles: 'candidate' } },
          { new: true }
        );
        
        if (updatedUser) {
          console.log(`[CANDIDATE APPROVAL] ✅ SUCCESS! User updated: ${updatedUser.name} (${updatedUser.email})`);
          console.log(`[CANDIDATE APPROVAL] Primary role: ${updatedUser.role}`);
          console.log(`[CANDIDATE APPROVAL] Additional roles: ${JSON.stringify(updatedUser.additionalRoles)}`);
          
          // Send approval email
          try {
            const emailTemplate = emailTemplates.applicationApproved({
              candidateName: candidate.name,
              electionTitle: candidate.election.title,
              position: candidate.position,
              userEmail: updatedUser.email
            });
            
            await sendEmail({
              to: updatedUser.email,
              subject: emailTemplate.subject,
              html: emailTemplate.html
            });
            
            console.log('[EMAIL SENT] Approval email sent to:', updatedUser.email);
          } catch (emailError) {
            console.error('[EMAIL ERROR] Failed to send approval email:', emailError.message);
            // Don't fail the entire request if email fails
          }
        } else {
          console.error(`[CANDIDATE APPROVAL] ❌ ERROR: User not found with ID ${candidate.user._id}`);
        }
      } catch (userUpdateError) {
        console.error(`[CANDIDATE APPROVAL] ❌ ERROR updating user:`, userUpdateError);
      }
    } else {
      console.warn(`[CANDIDATE APPROVAL] ⚠️ WARNING: Candidate ${candidate.name} has no user field linked!`);
    }
    
    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'update',
      entityType: 'Candidate',
      entityId: candidate._id.toString(),
      details: `Approved candidate: ${candidate.name} for ${candidate.position}`,
      status: 'success',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });
    
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('candidate:approved', { id: candidate._id, candidate });
        io.to(`election_${candidate.election}`).emit('candidate:approved', { id: candidate._id, candidate });
      }
    } catch (e) {
      console.error('Socket emit error (candidate approved):', e.message);
    }
    res.json({ message: "Candidate approved" });
  } catch (error) {
    console.error(`[CANDIDATE APPROVAL] ❌ FATAL ERROR:`, error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Disqualify a candidate
// @route   PUT /api/candidates/:id/disqualify
// @access  Admin only
const disqualifyCandidate = asyncHandler(async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('user', 'email name')
      .populate('election', 'title');

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const { reason } = req.body; // Optional reason for disqualification

    candidate.status = "disqualified";
    await candidate.save();
    
    // Send disqualification email
    if (candidate.user && candidate.user.email) {
      try {
        const emailTemplate = emailTemplates.applicationDisqualified({
          candidateName: candidate.name,
          electionTitle: candidate.election.title,
          position: candidate.position,
          userEmail: candidate.user.email,
          reason: reason || undefined
        });
        
        await sendEmail({
          to: candidate.user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html
        });
        
        console.log('[EMAIL SENT] Disqualification email sent to:', candidate.user.email);
      } catch (emailError) {
        console.error('[EMAIL ERROR] Failed to send disqualification email:', emailError.message);
        // Don't fail the entire request if email fails
      }
    }
    
    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'update',
      entityType: 'Candidate',
      entityId: candidate._id.toString(),
      details: `Disqualified candidate: ${candidate.name} for ${candidate.position}${reason ? ` - Reason: ${reason}` : ''}`,
      status: 'success',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });
    
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('candidate:disqualified', { id: candidate._id, candidate });
        io.to(`election_${candidate.election}`).emit('candidate:disqualified', { id: candidate._id, candidate });
      }
    } catch (e) {
      console.error('Socket emit error (candidate disqualified):', e.message);
    }
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

// @desc    Get candidate dashboard with election stats
// @route   GET /api/candidates/dashboard
// @access  Protected (Candidate only)
const getCandidateDashboard = asyncHandler(async (req, res) => {
  try {
    const Ballot = require("../models/Ballot");

    // Find all candidacies for this user
    const candidacies = await Candidate.find({ user: req.user._id })
      .populate("election", "title status startDate endDate positions voters candidates")
      .sort({ createdAt: -1 });

    if (!candidacies || candidacies.length === 0) {
      return res.json({
        elections: [],
        stats: {
          totalElections: 0,
          activeElections: 0,
          upcomingElections: 0,
          completedElections: 0,
          wonElections: 0,
          totalVotes: 0,
          pendingTasks: 0,
          activeAgents: 0
        }
      });
    }

    const now = new Date();

    const electionsWithStats = await Promise.all(
      candidacies.map(async (candidacy) => {
        // Skip if election was deleted
        if (!candidacy.election) return null;

        // Calculate real-time status based on dates
        const startDate = new Date(candidacy.election.startDate);
        const endDate = new Date(candidacy.election.endDate);
        
        let computedStatus;
        if (now < startDate) {
          computedStatus = 'upcoming';
        } else if (now >= startDate && now <= endDate) {
          computedStatus = 'ongoing';
        } else {
          computedStatus = 'completed';
        }

        // Count votes for this candidate (both valid and all)
        const voteCount = await Ballot.countDocuments({
          candidate: candidacy._id
        });

        // Get total votes cast in this election for this position
        const totalPositionVotes = await Ballot.countDocuments({
          election: candidacy.election._id,
          position: candidacy.position
        });

        // Get competing candidates for ranking
        const competingCandidates = await Candidate.find({
          election: candidacy.election._id,
          position: candidacy.position,
          status: 'approved'
        });

        const candidateVotes = await Promise.all(
          competingCandidates.map(async (c) => {
            const votes = await Ballot.countDocuments({
              candidate: c._id
            });
            return { candidateId: c._id.toString(), votes };
          })
        );

        candidateVotes.sort((a, b) => b.votes - a.votes);
        const ranking = candidateVotes.findIndex(cv => cv.candidateId === candidacy._id.toString()) + 1;
        
        // Only mark as winner if election is completed and candidate is ranked #1
        const isWinner = computedStatus === 'completed' && ranking === 1 && voteCount > 0;

        // Calculate vote percentage
        const votePercentage = totalPositionVotes > 0 
          ? Math.round((voteCount / totalPositionVotes) * 100) 
          : 0;

        return {
          _id: candidacy._id,
          candidateId: candidacy._id,
          electionId: candidacy.election._id,
          title: candidacy.election.title,
          position: candidacy.position,
          status: computedStatus,
          dbStatus: candidacy.election.status, // Keep original for reference
          startDate: candidacy.election.startDate,
          endDate: candidacy.election.endDate,
          currentVotes: voteCount,
          totalPositionVotes,
          votePercentage,
          totalVoters: candidacy.election.voters ? candidacy.election.voters.length : 0,
          totalCandidates: competingCandidates.length,
          ranking: ranking || 'N/A',
          isWinner,
          candidateStatus: candidacy.status,
          photo: candidacy.photo,
          symbol: candidacy.symbol
        };
      })
    );

    // Filter out null entries (deleted elections)
    const validElections = electionsWithStats.filter(e => e !== null);

    const totalVotes = validElections.reduce((sum, e) => sum + e.currentVotes, 0);
    const activeElections = validElections.filter(e => e.status === 'ongoing').length;
    const upcomingElections = validElections.filter(e => e.status === 'upcoming').length;
    const completedElections = validElections.filter(e => e.status === 'completed').length;
    const wonElections = validElections.filter(e => e.isWinner).length;

    // Get active agents count for this candidate
    // Agent.candidate stores the User ID (the candidate's user ID)
    const activeAgentsCount = await Agent.countDocuments({
      candidate: req.user._id,
      status: 'active'
    });

    // Debug log
    console.log('[Dashboard] User ID:', req.user._id, 'Active Agents:', activeAgentsCount);

    res.json({
      elections: validElections,
      stats: {
        totalElections: validElections.length,
        activeElections,
        upcomingElections,
        completedElections,
        wonElections,
        totalVotes,
        pendingTasks: 0,
        activeAgents: activeAgentsCount
      }
    });
  } catch (error) {
    console.error('Error fetching candidate dashboard:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get detailed election stats for a candidate
// @route   GET /api/candidates/election/:electionId/stats
// @access  Protected (Candidate only)
const getCandidateElectionStats = asyncHandler(async (req, res) => {
  try {
    const { electionId } = req.params;
    const Ballot = require("../models/Ballot");

    const candidacy = await Candidate.findOne({
      user: req.user._id,
      election: electionId
    }).populate("election", "title status startDate endDate positions voters");

    if (!candidacy) {
      return res.status(404).json({ message: "You are not a candidate in this election" });
    }

    const voteCount = await Ballot.countDocuments({
      candidate: candidacy._id,
      status: 'valid'
    });

    const allPositionVotes = await Ballot.find({
      election: electionId,
      position: candidacy.position,
      status: 'valid'
    }).populate('candidate');

    const totalPositionVotes = allPositionVotes.length;
    const votePercentage = totalPositionVotes > 0 ? ((voteCount / totalPositionVotes) * 100).toFixed(1) : 0;

    const competingCandidates = await Candidate.find({
      election: electionId,
      position: candidacy.position,
      status: 'approved'
    });

    const candidateVotes = await Promise.all(
      competingCandidates.map(async (c) => {
        const votes = await Ballot.countDocuments({
          candidate: c._id,
          status: 'valid'
        });
        return {
          candidateId: c._id.toString(),
          name: c.name,
          votes
        };
      })
    );

    candidateVotes.sort((a, b) => b.votes - a.votes);
    const ranking = candidateVotes.findIndex(cv => cv.candidateId === candidacy._id.toString()) + 1;

    const myVoteRecords = await Ballot.find({
      candidate: candidacy._id,
      status: 'valid'
    }).sort({ createdAt: 1 });

    const votesByDate = {};
    myVoteRecords.forEach(vote => {
      const date = new Date(vote.createdAt).toISOString().split('T')[0];
      votesByDate[date] = (votesByDate[date] || 0) + 1;
    });

    let cumulative = 0;
    const votesTrend = Object.keys(votesByDate).map(date => {
      cumulative += votesByDate[date];
      return {
        date,
        votes: cumulative,
        time: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    });

    const myVotes = await Ballot.find({
      candidate: candidacy._id,
      status: 'valid'
    }); // No populate user needed, demographics are on Ballot

    const departmentBreakdown = {};
    const yearBreakdown = {};

    myVotes.forEach(vote => {
      const dept = vote.department || 'Unknown';
      const year = vote.yearOfStudy || 'Unknown';
      departmentBreakdown[dept] = (departmentBreakdown[dept] || 0) + 1;
      yearBreakdown[year] = (yearBreakdown[year] || 0) + 1;
    });

    const departmentStats = Object.entries(departmentBreakdown).map(([department, votes]) => ({
      department,
      votes,
      percentage: voteCount > 0 ? ((votes / voteCount) * 100).toFixed(1) : 0
    })).sort((a, b) => b.votes - a.votes);

    const yearStats = Object.entries(yearBreakdown).map(([year, votes]) => ({
      year,
      votes,
      percentage: voteCount > 0 ? ((votes / voteCount) * 100).toFixed(1) : 0
    })).sort((a, b) => {
      const order = { '1': 1, '2': 2, '3': 3, '4': 4, 'Unknown': 5 };
      return (order[a.year] || 5) - (order[b.year] || 5);
    });

    const competitionData = candidateVotes.map(cv => ({
      name: cv.name,
      votes: cv.votes,
      percentage: totalPositionVotes > 0 ? ((cv.votes / totalPositionVotes) * 100).toFixed(1) : 0
    }));

    res.json({
      election: {
        id: candidacy.election._id,
        title: candidacy.election.title,
        position: candidacy.position,
        startDate: candidacy.election.startDate,
        endDate: candidacy.election.endDate,
        status: candidacy.election.status,
        totalVoters: candidacy.election.voters ? candidacy.election.voters.length : 0
      },
      candidate: {
        name: candidacy.name,
        photo: candidacy.photo,
        symbol: candidacy.symbol,
        currentVotes: voteCount,
        votePercentage: parseFloat(votePercentage),
        ranking,
        totalCandidates: competingCandidates.length
      },
      votesTrend,
      departmentBreakdown: departmentStats,
      yearBreakdown: yearStats,
      competitionData
    });
  } catch (error) {
    console.error('Error fetching election stats:', error);
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
    const { page = 1, limit = 10 } = req.query;
    const q = req.query.q ? String(req.query.q) : '';
    const query = q 
      ? { name: { $regex: escapeRegex(q), $options: "i" } }
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
  getCandidateDashboard,
  getCandidateElectionStats,
  getCandidatesByElectionAndPosition,
  searchCandidates,
  withdrawMyCandidacy,
};