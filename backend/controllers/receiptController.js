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
 * Verify a receipt signature - ANONYMOUSLY
 * Returns verification status WITHOUT vote details to maintain voter anonymity
 */
const verifyReceipt = async (receiptId) => {
    try {
        const receipt = await Receipt.findOne({ receiptId });

        if (!receipt) {
            return {
                valid: false,
                message: 'Receipt not found or verification code is invalid',
                receiptId: receiptId,
                timestamp: new Date(),
                // NO VOTE DETAILS - maintain anonymity
            };
        }

        const secret = getReceiptSecret();
        const isValid = receipt.verifySignature(secret);

        // Check if receipt is expired
        const now = new Date();
        const expiresAt = new Date(receipt.createdAt);
        expiresAt.setDate(expiresAt.getDate() + 30); // 30-day expiration
        const isExpired = now > expiresAt;

        if (isExpired) {
            return {
                valid: false,
                message: 'Receipt has expired (30-day validity period)',
                receiptId: receiptId,
                createdAt: receipt.createdAt,
                expiresAt: expiresAt,
                isExpired: true,
                timestamp: new Date(),
                // NO VOTE DETAILS - maintain anonymity
            };
        }

        // Return anonymized verification response
        return {
            valid: isValid,
            message: isValid 
                ? 'Receipt verified successfully. Your vote was recorded.' 
                : 'Receipt verification failed. This code may be invalid or tampered with.',
            receiptId: receiptId,
            createdAt: receipt.createdAt,
            expiresAt: expiresAt,
            isExpired: false,
            timestamp: new Date(),
            // IMPORTANT: NO VOTE DETAILS returned to maintain voter anonymity
            // The receipt details (who/what you voted for) are NEVER disclosed during verification
        };
    } catch (error) {
        console.error('Error verifying receipt:', error);
        return {
            valid: false,
            message: 'An error occurred during verification. Please try again.',
            receiptId: receiptId,
            timestamp: new Date()
            // NO VOTE DETAILS - maintain anonymity
        };
    }
};

/**
 * Send receipt via email - ANONYMIZED
 * Does NOT include vote details to maintain voter anonymity
 */
const sendReceiptEmail = async (receiptId, recipientEmail) => {
    try {
        const receipt = await Receipt.findOne({ receiptId })
            .populate('user', 'name email')
            .populate('election', 'title');

        if (!receipt) {
            throw new Error('Receipt not found');
        }

        // Calculate expiration date (30 days from creation)
        const expiresAt = new Date(receipt.createdAt);
        expiresAt.setDate(expiresAt.getDate() + 30);

        // Anonymous receipt email - NO vote details
        const emailHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 40px 20px;">
                <div style="background: white; border-radius: 10px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    
                    <div style="text-align: center; margin-bottom: 40px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">🗳️</div>
                        <h1 style="color: #10b981; margin: 0; font-size: 28px;">Campus Ballot</h1>
                        <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">Official Vote Confirmation</p>
                    </div>
                    
                    <div style="background: #dbeafe; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; border-radius: 4px; color: #075985;">
                        <strong>✓ Your vote has been successfully recorded</strong>
                    </div>
                    
                    <h2 style="color: #212529; font-size: 18px; margin: 30px 0 15px 0; border-bottom: 2px solid #10b981; padding-bottom: 10px;">Receipt Information</h2>
                    
                    <table style="width: 100%;">
                        <tr>
                            <td style="padding: 10px 0; color: #666;">Election:</td>
                            <td style="padding: 10px 0; font-weight: 600; color: #212529;">${receipt.election.title}</td>
                        </tr>
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; color: #666;">Verification Code:</td>
                            <td style="padding: 10px; font-weight: 600; color: #10b981; font-family: monospace; letter-spacing: 2px;">${receipt.receiptId}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666;">Date:</td>
                            <td style="padding: 10px 0; font-weight: 600; color: #212529;">${receipt.createdAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                        </tr>
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 10px; color: #666;">Time:</td>
                            <td style="padding: 10px; font-weight: 600; color: #212529;">${receipt.createdAt.toLocaleTimeString()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666;">Valid Until:</td>
                            <td style="padding: 10px 0; font-weight: 600; color: #212529;">${expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        </tr>
                    </table>
                    
                    <div style="background: #eef4ff; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 4px; color: #059669;">
                        <h3 style="margin: 0 0 10px 0; font-size: 14px;">🔒 Your Vote is Anonymous</h3>
                        <p style="margin: 0; font-size: 13px; line-height: 1.6;">
                            This email does NOT contain details of who or what you voted for. Your voting preferences are completely confidential. 
                            Only you have this verification code, which proves you participated and your votes were recorded.
                        </p>
                    </div>
                    
                    <h3 style="color: #212529; font-size: 16px; margin: 30px 0 10px 0;">How to Use Your Receipt:</h3>
                    <ol style="margin: 0; padding-left: 20px; color: #495057; line-height: 1.8;">
                        <li>Save this email and your verification code for your records</li>
                        <li>Use the verification code to confirm your vote was recorded in the system</li>
                        <li>The verification code is personal to you - do not share it with others</li>
                        <li>This receipt proves you voted but maintains complete anonymity</li>
                    </ol>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                    
                    <p style="color: #666; font-size: 12px; margin: 0;">
                        For questions about your receipt or the election process, contact the election observers or administration.
                    </p>
                    <p style="color: #999; font-size: 11px; margin: 10px 0 0 0;">
                        This is an automated message from Campus Ballot Election System. Please keep this receipt for your records.
                    </p>
                </div>
            </div>
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
