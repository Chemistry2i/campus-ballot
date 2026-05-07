const express = require('express');
const router = express.Router();
const {
    createReceipt,
    getReceiptById,
    getUserReceipts,
    verifyReceipt,
    sendReceiptEmail,
    getElectionReceipts,
    getReceiptStatistics
} = require('../controllers/receiptController');
const { protect } = require('../middleware/authMiddleware');

/**
 * POST /api/receipts
 * Create a new receipt after votes are cast
 * Called from frontend after voting
 */
router.post('/', protect, async (req, res) => {
    try {
        const { electionId, votes } = req.body;
        const userId = req.user._id;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        if (!electionId || !votes || votes.length === 0) {
            return res.status(400).json({ 
                error: 'Missing required fields: electionId, votes' 
            });
        }

        const receipt = await createReceipt(userId, electionId, votes, ipAddress, userAgent);

        res.status(201).json({
            success: true,
            message: 'Receipt created successfully',
            receipt: {
                receiptId: receipt.receiptId,
                electionId: receipt.election,
                createdAt: receipt.createdAt,
                expiresAt: receipt.expiresAt,
                verified: receipt.verified,
                votes: receipt.votes
            }
        });
    } catch (error) {
        console.error('Error in POST /api/receipts:', error);
        res.status(400).json({ 
            error: error.message 
        });
    }
});

/**
 * GET /api/receipts/:receiptId
 * Get receipt by receipt ID (ANONYMOUS - no vote details)
 * Returns only basic receipt information without revealing voting choices
 * This maintains voter anonymity during verification
 */
router.get('/:receiptId', async (req, res) => {
    try {
        const { receiptId } = req.params;

        const receipt = await getReceiptById(receiptId);

        // Calculate expiration date
        const expiresAt = new Date(receipt.createdAt);
        expiresAt.setDate(expiresAt.getDate() + 30);

        res.json({
            success: true,
            receipt: {
                receiptId: receipt.receiptId,
                election: receipt.election,
                verified: receipt.verified,
                createdAt: receipt.createdAt,
                expiresAt: expiresAt,
                isExpired: receipt.isExpired,
                // IMPORTANT: votes and user details are NOT included to maintain voter anonymity
                // During verification, users only need to confirm the receipt exists and is valid
            }
        });
    } catch (error) {
        console.error('Error in GET /api/receipts/:receiptId:', error);
        res.status(404).json({ 
            error: error.message 
        });
    }
});

/**
 * GET /api/receipts/user/my-receipts
 * Get all receipts for logged-in user - FULL DETAILS for their own receipts
 * Authenticated users can see their own voting history
 */
router.get('/user/my-receipts', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const { electionId } = req.query;

        const receipts = await getUserReceipts(userId, electionId);

        res.json({
            success: true,
            count: receipts.length,
            receipts: receipts.map(r => ({
                receiptId: r.receiptId,
                election: r.election,
                votes: r.votes,  // User can see their own votes
                createdAt: r.createdAt,
                expiresAt: r.expiresAt,
                verified: r.verified,
                emailSent: r.emailSent,
                isExpired: r.isExpired
            }))
        });
    } catch (error) {
        console.error('Error in GET /api/receipts/user/my-receipts:', error);
        res.status(500).json({ 
            error: error.message 
        });
    }
});

/**
 * POST /api/receipts/:receiptId/verify
 * Verify a receipt's signature
 * Public endpoint - allows anyone to verify a receipt
 */
router.post('/:receiptId/verify', async (req, res) => {
    try {
        const { receiptId } = req.params;

        const result = await verifyReceipt(receiptId);

        res.json({
            success: result.valid,
            ...result
        });
    } catch (error) {
        console.error('Error in POST /api/receipts/:receiptId/verify:', error);
        res.status(500).json({ 
            error: error.message 
        });
    }
});

/**
 * POST /api/receipts/:receiptId/email
 * Send receipt via email to user
 * Requires authentication
 */
router.post('/:receiptId/email', protect, async (req, res) => {
    try {
        const { receiptId } = req.params;
        const receipt = await getReceiptById(receiptId);

        // Verify receipt belongs to current user
        if (receipt.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                error: 'Unauthorized - receipt does not belong to you' 
            });
        }

        const result = await sendReceiptEmail(receiptId, req.user.email);

        res.json({
            success: result.success,
            message: result.message
        });
    } catch (error) {
        console.error('Error in POST /api/receipts/:receiptId/email:', error);
        res.status(500).json({ 
            error: error.message 
        });
    }
});

/**
 * GET /api/receipts/election/:electionId
 * Get all receipts for an election
 * Requires admin/observer role
 */
router.get('/election/:electionId', protect, async (req, res) => {
    try {
        const { electionId } = req.params;
        const { verified } = req.query;

        // Check authorization - user must be admin/observer for this election
        // TODO: Add role verification middleware

        const filters = {};
        if (verified !== undefined) {
            filters.verified = verified === 'true';
        }

        const receipts = await getElectionReceipts(electionId, filters);

        res.json({
            success: true,
            count: receipts.length,
            receipts: receipts.map(r => ({
                receiptId: r.receiptId,
                user: {
                    name: r.user.name,
                    email: r.user.email
                },
                createdAt: r.createdAt,
                verified: r.verified,
                emailSent: r.emailSent
            }))
        });
    } catch (error) {
        console.error('Error in GET /api/receipts/election/:electionId:', error);
        res.status(500).json({ 
            error: error.message 
        });
    }
});

/**
 * GET /api/receipts/election/:electionId/stats
 * Get receipt statistics for an election
 * Requires admin/super_admin role
 */
router.get('/election/:electionId/stats', protect, async (req, res) => {
    try {
        const { electionId } = req.params;

        // Check authorization - user must be admin/super_admin
        // TODO: Add role verification middleware

        const stats = await getReceiptStatistics(electionId);

        res.json({
            success: true,
            electionId: electionId,
            statistics: stats
        });
    } catch (error) {
        console.error('Error in GET /api/receipts/election/:electionId/stats:', error);
        res.status(500).json({ 
            error: error.message 
        });
    }
});

module.exports = router;
