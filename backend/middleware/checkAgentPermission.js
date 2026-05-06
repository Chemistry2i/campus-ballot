/**
 * Agent Permission Enforcement Middleware
 * Validates that agents have required permissions before allowing actions
 * 
 * Usage:
 *   router.post('/route', protect, checkAgentPermission(['permission1', 'permission2']), controller)
 */

const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * Check if user has agent role and required permissions
 * @param {string|string[]} requiredPermissions - Single permission or array of permissions needed
 * @returns {Function} Express middleware
 */
const checkAgentPermission = (requiredPermissions = []) => {
    // Normalize to array
    const permissions = Array.isArray(requiredPermissions) 
        ? requiredPermissions 
        : [requiredPermissions];

    return asyncHandler(async (req, res, next) => {
        // Verify user is authenticated
        if (!req.user) {
            return res.status(401).json({ 
                error: 'Authentication required' 
            });
        }

        // Verify user is agent
        if (req.user.role !== 'agent') {
            return res.status(403).json({ 
                error: 'Access denied: Agent role required',
                userRole: req.user.role
            });
        }

        // Get full user with agent info
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(401).json({ 
                error: 'User not found' 
            });
        }

        // Check if agent info exists
        if (!user.agentInfo) {
            return res.status(403).json({ 
                error: 'Agent profile incomplete - contact administrator' 
            });
        }

        // Check agent approval status
        if (user.agentInfo.approvalStatus !== 'approved') {
            return res.status(403).json({ 
                error: `Agent account is ${user.agentInfo.approvalStatus}`,
                status: user.agentInfo.approvalStatus
            });
        }

        // Check if user has required permissions
        if (permissions.length > 0) {
            const userPermissions = user.agentInfo.permissions || [];
            
            const hasAllPermissions = permissions.every(perm => 
                userPermissions.includes(perm)
            );

            if (!hasAllPermissions) {
                const missingPermissions = permissions.filter(
                    p => !userPermissions.includes(p)
                );

                return res.status(403).json({
                    error: 'Insufficient permissions',
                    required: permissions,
                    missing: missingPermissions,
                    available: userPermissions
                });
            }
        }

        // Attach agent info to request for use in controller
        req.agent = {
            userId: user._id,
            candidateIds: user.agentInfo.assignedCandidates || [user.agentInfo.assignedCandidateId],
            permissions: user.agentInfo.permissions,
            accessLevel: user.agentInfo.accessLevel,
            approvalStatus: user.agentInfo.approvalStatus,
            teamRole: user.agentInfo.team?.role
        };

        next();
    });
};

module.exports = checkAgentPermission;
