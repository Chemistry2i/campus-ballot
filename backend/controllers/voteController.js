const asyncHandler = require("express-async-handler");
const VoterRecord = require("../models/Vote");
const Ballot = require("../models/Ballot");
const Candidate = require("../models/Candidate");
const Election = require("../models/Election");
const { logActivity, getIpAddress, getUserAgent } = require("../utils/logActivity");

// ---------------------------------------------------------------------------
// Dashboard stats cache — decoupled from the hot vote path.
// The aggregation runs in the background every DASHBOARD_UPDATE_INTERVAL ms
// at most, and results are broadcast via Socket.io without blocking any vote.
// ---------------------------------------------------------------------------
let dashboardStatsTimer = null;
const DASHBOARD_UPDATE_INTERVAL = 5000; // 5 seconds debounce

/**
 * Refreshes dashboard stats in the background and emits via socket.
 * Called after a successful vote but NOT awaited — fully non-blocking.
 */
function scheduleDashboardUpdate(io, electionId) {
  if (!io) return;
  // Clear any pending timer and restart — debounce bursts of votes
  if (dashboardStatsTimer) clearTimeout(dashboardStatsTimer);
  dashboardStatsTimer = setTimeout(async () => {
    try {
      // Emit a lightweight event immediately so clients know a vote happened
      io.to(`election_${electionId}`).emit('vote:update', { electionId });

      // Heavier aggregation: runs off the request lifecycle entirely
      const [votesPerElectionAgg, allElections, candidateVotesAgg] = await Promise.all([
        Ballot.aggregate([
          { $group: { _id: '$election', count: { $sum: 1 } } },
          { $lookup: { from: 'elections', localField: '_id', foreignField: '_id', as: 'election' } },
          { $unwind: { path: '$election', preserveNullAndEmptyArrays: true } },
          { $project: { election: '$_id', title: '$election.title', count: 1 } }
        ]),
        Election.find({}, { title: 1 }).lean(),
        Candidate.find({ election: electionId }, { name: 1, votes: 1 }).lean()
      ]);

      const votesPerElection = allElections.map(e => {
        const found = votesPerElectionAgg.find(v => String(v.election) === String(e._id));
        return { election: e._id, title: e.title, count: found ? found.count : 0 };
      });

      io.emit('dashboard:update', { votesPerElection, candidateVotes: candidateVotesAgg });
    } catch (err) {
      console.error('[DASHBOARD] Background stats update failed:', err.message);
    }
  }, DASHBOARD_UPDATE_INTERVAL);
}

// @desc    Cast a vote
// @route   POST /api/votes
// @access  User
const castVote = asyncHandler(async (req, res) => {
  try {
    const { electionId, position, candidateId, abstain } = req.body;

    if (!electionId || !position) {
      console.log({ message: "Missing electionId or position" });
      return res.status(400).json({ message: "electionId and position are required" });
    }

    // Check if election exists
    const election = await Election.findById(electionId);
    if (!election) {
      console.log({ message: "Election not found" });
      return res.status(400).json({ message: "Election not found" });
    }

    // ✅ SECURITY FIX: Validate voter is from the same organization as election
    // Students can only vote in elections within their organization
    if (election.organization && String(req.user.organization) !== String(election.organization)) {
      console.log({ message: 'Voter not eligible', userOrg: req.user.organization, electionOrg: election.organization });
      return res.status(403).json({ message: 'You are not eligible to participate in this election (different organization).' });
    }

    // Enforce voting time window on the server (use server time)
    const now = new Date();
    const start = election.startDate ? new Date(election.startDate) : null;
    const end = election.endDate ? new Date(election.endDate) : null;

    if (start && now < start) {
      console.log({ message: 'Voting has not started yet', now, start });
      return res.status(403).json({ message: 'Voting has not started yet' });
    }

    if (end && now > end) {
      console.log({ message: 'Voting has ended', now, end });
      return res.status(403).json({ message: 'Voting has ended' });
    }

    // Check if user's faculty is allowed to vote (if allowedFaculties is specified)
    if (election.allowedFaculties && election.allowedFaculties.length > 0) {
      const userFaculty = req.user.faculty;
      if (!userFaculty) {
        return res.status(403).json({ message: 'Your faculty information is missing. Please update your profile.' });
      }
      if (!election.allowedFaculties.includes(userFaculty)) {
        return res.status(403).json({ message: 'Your faculty is not eligible to participate in this election.' });
      }
    }

    // If not abstain, check candidate
    let candidate = null;
    if (!abstain) {
      if (!candidateId) {
        return res.status(400).json({ message: "candidateId is required unless abstaining" });
      }
      candidate = await Candidate.findOne({ _id: candidateId, election: electionId, position });
      if (!candidate) {
        console.log({ message: "Candidate not found for this position/election" });
        return res.status(400).json({ message: "Candidate not found for this position/election" });
      }
    }

    // Check if user has already voted for this position in this election
    const existingRecord = await VoterRecord.findOne({ user: req.user._id, election: electionId, position });
    if (existingRecord) {
      console.log({ message: "User has already voted for this position in this election" });
      return res.status(400).json({ message: "You have already voted for this position in this election" });
    }

    // -----------------------------------------------------------------------
    // Write 1: Claim the voter slot.
    // The unique compound index { user, election, position } on VoterRecord
    // guarantees atomicity at the DB level — no transaction needed.
    // If two concurrent requests race, MongoDB will reject one with E11000.
    // -----------------------------------------------------------------------
    try {
      await VoterRecord.create({
        user: req.user._id,
        election: electionId,
        position
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ message: "You have already voted for this position in this election" });
      }
      throw err;
    }

    // Write 2: Cast the anonymous ballot
    await Ballot.create({
      election: electionId,
      position,
      candidate: abstain ? undefined : candidateId,
      faculty:     req.user.faculty,
      department:  req.user.department,
      yearOfStudy: req.user.yearOfStudy,
      gender:      req.user.gender
    });

    // Write 3: Atomically increment candidate vote counter
    if (candidate) {
      await Candidate.updateOne({ _id: candidate._id }, { $inc: { votes: 1 } });
    }

    // Respond immediately — user is done waiting
    res.status(201).json({ message: "Vote cast successfully" });

    // -----------------------------------------------------------------------
    // Everything below runs AFTER the response is sent.
    // Neither audit logging nor dashboard stats should ever delay the voter.
    // -----------------------------------------------------------------------

    // Fire-and-forget audit log — do NOT await
    logActivity({
      userId: req.user._id,
      action: 'vote',
      entityType: 'Election',
      entityId: election._id.toString(),
      details: `Voted for position: ${position} in ${election.title}`,
      status: 'success',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    }).catch(err => console.error('[VOTE] logActivity failed:', err.message));

    // Schedule a debounced background dashboard update — fully off the request thread
    scheduleDashboardUpdate(req.app.get('io'), electionId);

  } catch (error) {
    console.error('[VOTE] Error casting vote:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

// @desc    Cast multiple votes for different positions in one election (batch voting)
// @route   POST /api/votes/batch
// @access  User
// @body    { electionId, votes: [{ position, candidateId, abstain }, ...] }
const castBatchVotes = asyncHandler(async (req, res) => {
  try {
    const { electionId, votes } = req.body;

    if (!electionId || !Array.isArray(votes) || votes.length === 0) {
      return res.status(400).json({ message: 'electionId and votes array are required' });
    }

    // Check if election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(400).json({ message: 'Election not found' });
    }

    // ✅ SECURITY FIX: Validate voter is from the same organization as election
    if (election.organization && String(req.user.organization) !== String(election.organization)) {
      return res.status(403).json({ message: 'You are not eligible to participate in this election (different organization).' });
    }

    // Enforce voting time window
    const now = new Date();
    const start = election.startDate ? new Date(election.startDate) : null;
    const end = election.endDate ? new Date(election.endDate) : null;

    if (start && now < start) {
      return res.status(403).json({ message: 'Voting has not started yet' });
    }
    if (end && now > end) {
      return res.status(403).json({ message: 'Voting has ended' });
    }

    // Validate all positions and candidates exist
    const allPositionsValid = votes.every(v => election.positions?.includes(v.position) || true);
    if (!allPositionsValid) {
      return res.status(400).json({ message: 'Invalid position(s) for this election' });
    }

    // Check faculty eligibility
    if (election.allowedFaculties && election.allowedFaculties.length > 0) {
      const userFaculty = req.user.faculty;
      if (!userFaculty) {
        return res.status(403).json({ message: 'Your faculty information is missing. Please update your profile.' });
      }
      if (!election.allowedFaculties.includes(userFaculty)) {
        return res.status(403).json({ message: 'Your faculty is not eligible to participate in this election.' });
      }
    }

    // Check if user has already voted for any of these positions
    const existingVotes = await VoterRecord.find({
      user: req.user._id,
      election: electionId,
      position: { $in: votes.map(v => v.position) }
    });

    if (existingVotes.length > 0) {
      const votedPositions = existingVotes.map(v => v.position);
      return res.status(400).json({
        message: `You have already voted for position(s): ${votedPositions.join(', ')}`,
        votedPositions
      });
    }

    // Validate all candidates
    const candidateIds = votes.filter(v => !v.abstain).map(v => v.candidateId);
    const candidates = await Candidate.find({
      _id: { $in: candidateIds },
      election: electionId
    });

    if (candidates.length !== candidateIds.length) {
      return res.status(400).json({ message: 'One or more candidates not found for this election' });
    }

    // Atomically create voter records for all positions
    const voterRecords = votes.map(v => ({
      user: req.user._id,
      election: electionId,
      position: v.position
    }));

    try {
      await VoterRecord.insertMany(voterRecords);
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ message: 'You have already voted for one or more positions' });
      }
      throw err;
    }

    // Cast all ballots and increment candidate votes
    const ballots = [];
    const candidateUpdates = [];

    for (const vote of votes) {
      ballots.push({
        election: electionId,
        position: vote.position,
        candidate: vote.abstain ? undefined : vote.candidateId,
        faculty: req.user.faculty,
        department: req.user.department,
        yearOfStudy: req.user.yearOfStudy,
        gender: req.user.gender
      });

      if (!vote.abstain) {
        candidateUpdates.push(
          Candidate.updateOne(
            { _id: vote.candidateId },
            { $inc: { votes: 1 } }
          )
        );
      }
    }

    // Insert all ballots and update all candidate vote counts
    await Promise.all([
      Ballot.insertMany(ballots),
      Promise.all(candidateUpdates)
    ]);

    // Respond immediately with success
    res.status(201).json({
      message: `Successfully submitted ${votes.length} vote(s)`,
      votesSubmitted: votes.length,
      electionId: election._id
    });

    // Fire-and-forget audit log
    logActivity({
      userId: req.user._id,
      action: 'batch_vote',
      entityType: 'Election',
      entityId: election._id.toString(),
      details: `Submitted ${votes.length} votes for ${election.title}`,
      status: 'success',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    }).catch(err => console.error('[BATCH_VOTE] logActivity failed:', err.message));

    // Schedule dashboard update
    scheduleDashboardUpdate(req.app.get('io'), electionId);

  } catch (error) {
    console.error('[BATCH_VOTE] Error casting batch votes:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

// @desc    Get positions user hasn't voted for in an election
// @route   GET /api/votes/election/:electionId/available-positions
// @access  User
const getAvailablePositions = asyncHandler(async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Get positions user has already voted for
    const votedPositions = await VoterRecord.find({
      user: req.user._id,
      election: electionId
    }).distinct('position');

    // Get all positions for this election
    const allPositions = election.positions || [];

    // Calculate available positions
    const availablePositions = allPositions.filter(p => !votedPositions.includes(p));

    res.json({
      electionId,
      allPositions,
      votedPositions,
      availablePositions,
      canVote: availablePositions.length > 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get own voting history
// @route   GET /api/votes/me
// @access  User
const getMyVotes = asyncHandler(async (req, res) => {
  try {
    // We can only show THAT they voted, not WHO they voted for (Anonymity)
    const votes = await VoterRecord.find({ user: req.user._id })
      .populate("election", "title");
    
    console.log({ message: "Fetched user's voting history" });
    res.json(votes);
  } catch (error) {
    console.log({ message: "Error fetching voting history", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all votes for an election
// @route   GET /api/votes/election/:electionId
// @access  Admin
const getVotesByElection = asyncHandler(async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(500, parseInt(req.query.limit) || 100);
    const skip  = (page - 1) * limit;

    const [votes, total] = await Promise.all([
      Ballot.find({ election: req.params.electionId })
        .populate('candidate', 'name position party')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Ballot.countDocuments({ election: req.params.electionId })
    ]);

    res.json({ votes, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[VOTE] Error fetching votes by election:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all votes for a candidate
// @route   GET /api/votes/candidate/:candidateId
// @access  Admin
const getVotesByCandidate = asyncHandler(async (req, res) => {
  try {
    // Admins can see ballots for a candidate, but NO USER INFO
    const votes = await Ballot.find({ candidate: req.params.candidateId })
      .populate("election", "title");
    console.log({ message: "Fetched votes for candidate" });
    res.json(votes);
  } catch (error) {
    console.log({ message: "Error fetching votes by candidate", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all votes (system-wide)
// @route   GET /api/votes
// @access  Admin
const getAllVotes = asyncHandler(async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(500, parseInt(req.query.limit) || 100);
    const skip  = (page - 1) * limit;

    const [votes, total] = await Promise.all([
      Ballot.find()
        .populate('election',  'title')
        .populate('candidate', 'name position party')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Ballot.estimatedDocumentCount()   // Fast — uses collection metadata, not a full scan
    ]);

    res.json({ votes, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[VOTE] Error fetching all votes:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  castVote,
  castBatchVotes,
  getAvailablePositions,
  getMyVotes,
  getVotesByElection,
  getVotesByCandidate,
  getAllVotes
};