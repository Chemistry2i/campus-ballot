const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, hasRole } = require('../middleware/authMiddleware');

// @route   POST /api/user/register-as-candidate
// @desc    Register current student as a candidate
// @access  Private (Student only)
router.post('/register-as-candidate', protect, hasRole('student'), async (req, res) => {
  try {
    const { electionId, position, manifesto } = req.body;

    // Check if user is already a candidate
    if (req.user.additionalRoles && req.user.additionalRoles.includes('candidate')) {
      return res.status(400).json({ message: 'You are already registered as a candidate' });
    }

    // Update user to add candidate role
    req.user.additionalRoles = req.user.additionalRoles || [];
    req.user.additionalRoles.push('candidate');
    req.user.candidateInfo = {
      electionId,
      position,
      manifesto,
      status: 'pending' // Requires admin approval
    };

    await req.user.save();

    res.status(200).json({
      message: 'Successfully registered as candidate. Awaiting approval.',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        additionalRoles: req.user.additionalRoles,
        candidateInfo: req.user.candidateInfo
      }
    });
  } catch (error) {
    console.error('Error registering as candidate:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/user/register-as-agent
// @desc    Register current student as an agent
// @access  Private (Student only)
router.post('/register-as-agent', protect, hasRole('student'), async (req, res) => {
  try {
    const { candidateId, permissions } = req.body;

    // Check if user is already an agent
    if (req.user.additionalRoles && req.user.additionalRoles.includes('agent')) {
      return res.status(400).json({ message: 'You are already registered as an agent' });
    }

    // Verify candidate exists
    const candidate = await User.findById(candidateId);
    if (!candidate || !candidate.additionalRoles.includes('candidate')) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Update user to add agent role
    req.user.additionalRoles = req.user.additionalRoles || [];
    req.user.additionalRoles.push('agent');
    req.user.agentInfo = {
      assignedCandidateId: candidateId,
      permissions: permissions || []
    };

    await req.user.save();

    res.status(200).json({
      message: 'Successfully registered as agent',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        additionalRoles: req.user.additionalRoles,
        agentInfo: req.user.agentInfo
      }
    });
  } catch (error) {
    console.error('Error registering as agent:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/user/my-roles
// @desc    Get current user's all roles
// @access  Private
router.get('/my-roles', protect, async (req, res) => {
  try {
    res.status(200).json({
      primaryRole: req.user.role,
      additionalRoles: req.user.additionalRoles || [],
      allRoles: [req.user.role, ...(req.user.additionalRoles || [])],
      candidateInfo: req.user.candidateInfo,
      agentInfo: req.user.agentInfo
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/user/remove-role/:roleType
// @desc    Remove a role from user (candidate or agent)
// @access  Private
router.delete('/remove-role/:roleType', protect, async (req, res) => {
  try {
    const { roleType } = req.params;

    if (!['candidate', 'agent'].includes(roleType)) {
      return res.status(400).json({ message: 'Invalid role type' });
    }

    // Remove role from additionalRoles array
    req.user.additionalRoles = (req.user.additionalRoles || []).filter(r => r !== roleType);

    // Clear related info
    if (roleType === 'candidate') {
      req.user.candidateInfo = undefined;
    } else if (roleType === 'agent') {
      req.user.agentInfo = undefined;
    }

    await req.user.save();

    res.status(200).json({
      message: `${roleType} role removed successfully`,
      user: {
        id: req.user._id,
        name: req.user.name,
        additionalRoles: req.user.additionalRoles
      }
    });
  } catch (error) {
    console.error('Error removing role:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
