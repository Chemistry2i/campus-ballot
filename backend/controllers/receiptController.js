const Receipt = require('../models/Receipt');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const Election = require('../models/Election');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Get the receipt verification secret from environment
const getReceiptSecret = () => {
    return process.env.RECEIPT_VERIFICATION_SECRET || 'campus-ballot-receipt-secret-key';
};

/**
 * Create a receipt for votes cast
 * @param {Object} voteData - Contains user, election, and votes array
 * @param {Object} ipAddress - IP address of the voter
 * @param {Object} userAgent - Browser information
 */
const createReceipt = async (userId, electionId, votesArray, ipAddress, userAgent) => {
    try {
        // Check if receipt already exists for this user/election combination
        const existingReceipt = await Receipt.findOne({ 
            user: userId, 
            election: electionId 
        });

        if (existingReceipt && !existingReceipt.isExpired) {
            throw new Error('Receipt already exists for this election. A new receipt can be requested after expiration.');
        }

        // Generate unique receipt ID
        const receiptId = Receipt.generateReceiptId();

        // Normalize votes data - add candidate names for display
        const normalizedVotes = [];
        for (const vote of votesArray) {
            let candidateName = null;
            
            if (vote.candidate) {
                const candidate = await Candidate.findById(vote.candidate);
                candidateName = candidate ? candidate.name : null;
            }

            normalizedVotes.push({
                position: vote.position,
                candidate: vote.candidate,
                candidateName: candidateName,
                abstained: !vote.candidate
            });
        }

        // Create receipt document
        const receipt = new Receipt({
            receiptId: receiptId,
            user: userId,
            election: electionId,
            votes: normalizedVotes,
            ipAddress: ipAddress,
            userAgent: userAgent,
            signature: '' // will set after creation
        });

        // Generate signature
        const secret = getReceiptSecret();
        receipt.signature = receipt.generateSignature(secret);

        // Verify signature immediately to ensure it's valid
        receipt.verified = receipt.verifySignature(secret);
        receipt.verifiedAt = new Date();

        await receipt.save();

        return receipt;
    } catch (error) {
        console.error('Error creating receipt:', error);
        throw error;
    }
};

/**
 * Get receipt by ID
 */
const getReceiptById = async (receiptId) => {
    try {
        const receipt = await Receipt.findOne({ receiptId })
            .populate('user', 'name email')
            .populate('election', 'title position')
            .populate('votes.candidate', 'name photo');

        if (!receipt) {
            throw new Error('Receipt not found');
        }

        return receipt;
    } catch (error) {
        console.error('Error retrieving receipt:', error);
        throw error;
    }
};

/**
 * Get all receipts for a user
 */
const getUserReceipts = async (userId, electionId = null) => {
    try {
        const query = { user: userId };
        if (electionId) {
            query.election = electionId;
        }

        const receipts = await Receipt.find(query)
            .sort({ createdAt: -1 })
            .populate('election', 'title startDate endDate')
            .populate('votes.candidate', 'name');

        return receipts;
    } catch (error) {
        console.error('Error retrieving user receipts:', error);
        throw error;
    }
};

/**
 * Verify a receipt signature
 */
const verifyReceipt = async (receiptId) => {
    try {
        const receipt = await Receipt.findOne({ receiptId });

        if (!receipt) {
            return {
                valid: false,
                message: 'Receipt not found',
                receipt: null
            };
        }

        const secret = getReceiptSecret();
        const isValid = receipt.verifySignature(secret);

        return {
            valid: isValid,
            message: isValid ? 'Receipt is valid' : 'Receipt signature verification failed',
            receipt: isValid ? receipt : null,
            receiptId: receiptId,
            verifiedAt: receipt.verifiedAt,
            isExpired: receipt.isExpired
        };
    } catch (error) {
        console.error('Error verifying receipt:', error);
        return {
            valid: false,
            message: error.message,
            receipt: null
        };
    }
};

/**
 * Send receipt via email
 */
const sendReceiptEmail = async (receiptId, recipientEmail) => {
    try {
        const receipt = await Receipt.findOne({ receiptId })
            .populate('user', 'name email')
            .populate('election', 'title')
            .populate('votes.candidate', 'name');

        if (!receipt) {
            throw new Error('Receipt not found');
        }

        // Format votes for email display
        const votesHTML = receipt.votes.map(v => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${v.position}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">
                    ${v.candidateName || '<em>Abstained</em>'}
                </td>
            </tr>
        `).join('');

        const emailHTML = `
            <h2>Election Receipt - ${receipt.election.title}</h2>
            <p>Dear ${receipt.user.name},</p>
            <p>Your votes have been successfully recorded. Below is your receipt for verification purposes.</p>
            
            <h3>Receipt Details</h3>
            <p><strong>Receipt ID:</strong> ${receipt.receiptId}</p>
            <p><strong>Election:</strong> ${receipt.election.title}</p>
            <p><strong>Date:</strong> ${receipt.createdAt.toLocaleDateString()}</p>
            
            <h3>Your Votes</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f0f0f0;">
                        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #333;">Position</th>
                        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #333;">Vote</th>
                    </tr>
                </thead>
                <tbody>
                    ${votesHTML}
                </tbody>
            </table>
            
            <h3>Verification</h3>
            <p>You can verify this receipt at any time by providing the Receipt ID to election observers or through our verification portal.</p>
            <p><strong>Receipt expires on:</strong> ${receipt.expiresAt.toLocaleDateString()}</p>
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #666;">
                This is an automated email. Please keep this receipt for your records.
                Do not share this receipt ID with anyone.
            </p>
        `;

        // Configure email transporter
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: recipientEmail,
            subject: `Vote Receipt - ${receipt.election.title}`,
            html: emailHTML,
            replyTo: process.env.EMAIL_SUPPORT || process.env.EMAIL_USER
        };

        await transporter.sendMail(mailOptions);

        // Update receipt to mark email as sent
        receipt.emailSent = true;
        receipt.emailSentAt = new Date();
        await receipt.save();

        return { success: true, message: 'Receipt email sent successfully' };
    } catch (error) {
        console.error('Error sending receipt email:', error);
        // Don't throw - email sending is non-critical
        return { success: false, message: error.message };
    }
};

/**
 * Get receipts for an election (admin/observer view)
 */
const getElectionReceipts = async (electionId, filters = {}) => {
    try {
        const query = { election: electionId };

        if (filters.verified !== undefined) {
            query.verified = filters.verified;
        }

        const receipts = await Receipt.find(query)
            .sort({ createdAt: -1 })
            .populate('user', 'name email')
            .populate('votes.candidate', 'name');

        return receipts;
    } catch (error) {
        console.error('Error retrieving election receipts:', error);
        throw error;
    }
};

/**
 * Generate receipt statistics for an election
 */
const getReceiptStatistics = async (electionId) => {
    try {
        const receipts = await Receipt.find({ election: electionId });

        const stats = {
            totalReceipts: receipts.length,
            verifiedReceipts: receipts.filter(r => r.verified).length,
            unverifiedReceipts: receipts.filter(r => !r.verified).length,
            emailsSent: receipts.filter(r => r.emailSent).length,
            expiredReceipts: receipts.filter(r => r.isExpired).length,
            activeReceipts: receipts.filter(r => !r.isExpired).length
        };

        return stats;
    } catch (error) {
        console.error('Error generating receipt statistics:', error);
        throw error;
    }
};

module.exports = {
    createReceipt,
    getReceiptById,
    getUserReceipts,
    verifyReceipt,
    sendReceiptEmail,
    getElectionReceipts,
    getReceiptStatistics
};
