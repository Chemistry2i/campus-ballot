// const asyncHandler = require('express-async-handler');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
// const User = require('../models/User');
// const sendEmail = require('../utils/sendEmail');   
// const sendSms = require('../utils/sendSms');

// // Helper: Generate JWT
// const generateToken = (userId) => {
//     return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
// };

// // @desc    Register new user
// const register = asyncHandler(async (req, res) => {
//     try {
//         console.log('[REGISTER BODY]:', req.body); // Log incoming request body

//         const { name, email, password, role, studentId, faculty, course, yearOfStudy, gender, phone } = req.body;

//         if (!name || !email || !password) {
//             console.log('[REGISTER ERROR]: Missing required fields');
//             return res.status(400).json({ message: 'Please provide all required fields.' });
//         }

//         const userExists = await User.findOne({ email });
//         if (userExists) {
//             console.log('[REGISTER ERROR]: User already exists with this email');
//             return res.status(400).json({ message: 'User already exists with this email.' });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const newUser = await User.create({
//             name,
//             email,
//             password: hashedPassword,
//             role,
//             studentId,
//             faculty,
//             course,
//             yearOfStudy,
//             gender,
//             phone 
//         });

//         // Create verification token
//         const verificationToken = crypto.randomBytes(32).toString('hex');
//         newUser.verificationToken = verificationToken;
//         newUser.verificationTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour
//         await newUser.save();

//         // Send verification email
//         const verifyUrl = `https://symmetrical-space-halibut-x56vpp9j9pxgf67vg-5173.app.github.dev/verify/${verificationToken}`;
//         const html = `
//             <h2>Verify Your Email</h2>
//             <p>Hello ${newUser.name},</p>
//             <p>Click the link below to verify your email:</p>
//             <a href="${verifyUrl}" target="_blank">Verify Email</a>
//         `;

//         await sendEmail({ to: newUser.email, subject: 'Verify your email', html });

//         // --- SEND SMS NOTIFICATION ---
//         if (newUser.phone) {
//             const smsResult = await sendSms(
//                 newUser.phone,
//                 `Welcome to the Kyambogo University Voting System, ${newUser.name}! Your registration was successful.`
//             );
//             if (smsResult) {
//                 console.log('[REGISTER]: Welcome SMS sent to:', newUser.phone);
//             } else {
//                 console.log('[REGISTER]: Failed to send welcome SMS to:', newUser.phone);
//             }
//         }

//         console.log('[REGISTER]: User registered & verification email sent to:', newUser.email);

//         res.status(201).json({
//             message: 'Registration successful. Please check your email to verify your account.',
//             token: generateToken(newUser._id),
//             user: {
//                 _id: newUser._id,
//                 name: newUser.name,
//                 email: newUser.email,
//                 role: newUser.role,
//                 isVerified: newUser.isVerified
//             }
//         });
//     } catch (error) {
//         console.error('[REGISTER ERROR]:', error.message, error);
//         res.status(500).json({ message: 'Server error during registration', error: error.message, errorObj: error });
//     }
// });

// // @desc    Login user
// const login = asyncHandler(async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         const user = await User.findOne({ email }).select('+password');

//         if (!user || !(await bcrypt.compare(password, user.password))) {
//             return res.status(401).json({ message: 'Invalid email or password' });
//         }

//         if (!user.isVerified) {
//             return res.status(403).json({ message: 'Please verify your email before logging in.' });
//         }

//         user.lastLogin = new Date();
//         await user.save();

//         console.log('[LOGIN]: User logged in:', user.email);

//         res.json({
//             message: 'Login successful',
//             token: generateToken(user._id),
//             user: {
//                 _id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//                 isVerified: user.isVerified
//             }
//         });
//     } catch (error) {
//         console.error('[LOGIN ERROR]:', error.message);
//         res.status(500).json({ message: 'Server error during login' });
//     }
// });

// // @desc    Logout user
// const logout = asyncHandler(async (req, res) => {
//     try {
//         console.log('[LOGOUT]: User logged out');
//         res.json({ message: 'Logout successful' });
//     } catch (error) {
//         console.error('[LOGOUT ERROR]:', error.message);
//         res.status(500).json({ message: 'Server error during logout' });
//     }
// });

// // @desc    Verify email
// const verifyEmail = asyncHandler(async (req, res) => {
//     try {
//         console.log('[VERIFY] Token received:', req.params.token);
//         const user = await User.findOne({
//             verificationToken: req.params.token,
//             verificationTokenExpiry: { $gt: Date.now() }
//         });

//         if (!user) {
//             console.log('[VERIFY] No user found or token expired');
//             return res.status(400).json({ message: 'Invalid or expired verification token.' });
//         }

//         user.isVerified = true;
//         user.verificationToken = null;
//         user.verificationTokenExpiry = null;
//         await user.save();

//         console.log('[VERIFY]: Email verified for:', user.email);
//         res.json({ message: 'Email verified successfully.' });
//     } catch (error) {
//         console.error('[VERIFY ERROR]:', error.message);
//         res.status(500).json({ message: 'Error verifying email' });
//     }
// });
// // @desc    Forgot password
// const forgotPassword = asyncHandler(async (req, res) => {
//     try {
//         const { email } = req.body;
//         const user = await User.findOne({ email });

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const token = crypto.randomBytes(32).toString('hex');
//         user.resetPasswordToken = token;
//         user.resetPasswordTokenExpiry = Date.now() + 1000 * 60 * 30; // 30 mins
//         await user.save();

//         const resetUrl = `https://symmetrical-space-halibut-x56vpp9j9pxgf67vg-5173.app.github.dev/reset-password/${token}`;
//         const html = `
//             <h2>Reset Your Password</h2>
//             <p>Hello ${user.name},</p>
//             <p>Click the link below to reset your password:</p>
//             <a href="${resetUrl}" target="_blank">Reset Password</a>
//         `;

//         await sendEmail({
//             to: user.email,
//             subject: 'Password Reset Request',
//             html
//         });

//         console.log('[FORGOT PASSWORD]: Token sent to', user.email);
//         res.json({ message: 'Reset token sent to your email.' });
//     } catch (error) {
//         console.error('[FORGOT PASSWORD ERROR]:', error.message);
//         res.status(500).json({ message: 'Server error during password reset request' });
//     }
// });

// // @desc    Reset password
// const resetPassword = asyncHandler(async (req, res) => {
//     try {
//         const user = await User.findOne({
//             resetPasswordToken: req.params.token,
//             resetPasswordTokenExpiry: { $gt: Date.now() }
//         });

//         if (!user) {
//             return res.status(400).json({ message: 'Invalid or expired reset token' });
//         }

//         user.password = await bcrypt.hash(req.body.password, 10);
//         user.resetPasswordToken = null;
//         user.resetPasswordTokenExpiry = null;
//         await user.save();

//         console.log('[RESET PASSWORD]: Password updated for:', user.email);
//         res.json({ message: 'Password reset successful' });
//     } catch (error) {
//         console.error('[RESET PASSWORD ERROR]:', error.message);
//         res.status(500).json({ message: 'Error resetting password' });
//     }
// });

// // @desc    Get profile
// const getProfile = asyncHandler(async (req, res) => {
//     try {
//         const user = await User.findById(req.user._id).select('-password');
//         if (!user) return res.status(404).json({ message: 'User not found' });

//         console.log('[GET PROFILE]:', user.email);
//         res.json({ message: 'Profile fetched', user });
//     } catch (error) {
//         console.error('[GET PROFILE ERROR]:', error.message);
//         res.status(500).json({ message: 'Error fetching profile' });
//     }
// });

// // @desc    Update profile
// const updateProfile = asyncHandler(async (req, res) => {
//     try {
//         const updates = req.body;
//         const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');

//         console.log('[UPDATE PROFILE]:', user.email);
//         res.json({ message: 'Profile updated', user });
//     } catch (error) {
//         console.error('[UPDATE PROFILE ERROR]:', error.message);
//         res.status(500).json({ message: 'Error updating profile' });
//     }
// });

// // @desc    Change password
// const changePassword = asyncHandler(async (req, res) => {
//     try {
//         const user = await User.findById(req.user._id).select('+password');
//         const { currentPassword, newPassword } = req.body;

//         if (!await bcrypt.compare(currentPassword, user.password)) {
//             return res.status(400).json({ message: 'Current password is incorrect' });
//         }

//         user.password = await bcrypt.hash(newPassword, 10);
//         await user.save();

//         console.log('[CHANGE PASSWORD]: Password changed for', user.email);
//         res.json({ message: 'Password changed successfully' });
//     } catch (error) {
//         console.error('[CHANGE PASSWORD ERROR]:', error.message);
//         res.status(500).json({ message: 'Error changing password' });
//     }
// });

// module.exports = {
//     register,
//     login,
//     logout,
//     verifyEmail,
//     forgotPassword,
//     resetPassword,
//     getProfile,
//     updateProfile,
//     changePassword
// };



const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const sendSms = require("../utils/sendSms");
const { logActivity, getIpAddress, getUserAgent } = require("../utils/logActivity");

/* -------------------------------------------------------
   Helper: Generate JWT
--------------------------------------------------------- */
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

/* -------------------------------------------------------
   @desc   Register new user
--------------------------------------------------------- */
const register = asyncHandler(async (req, res) => {
  try {
    console.log("[REGISTER BODY]:", req.body);

    const {
      name,
      email,
      password,
      role,
      studentId,
      faculty,
      course,
      yearOfStudy,
      gender,
      phone,
    } = req.body;

    // Normalize email early (trim + lowercase) to avoid case/whitespace duplicates
    const normalizedEmail = (email || '').toString().trim().toLowerCase();

    // Validate essential fields
    if (!name || !email || !password) {
      console.log("[REGISTER ERROR]: Missing required fields");
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }

    // If registering student, enforce institutional email format and studentId match
    if (role === 'student') {
      const sid = (studentId || '').toString().trim();
      // Server-side: ensure student ID is numeric
      if (!/^[0-9]+$/.test(sid)) {
        return res.status(400).json({ message: 'Student ID must contain only digits.' });
      }
      const mail = (email || '').toString().trim().toLowerCase();
      if (!sid) {
        return res.status(400).json({ message: 'Student ID is required for student registrations.' });
      }
      const parts = mail.split('@');
      if (parts.length !== 2) {
        return res.status(400).json({ message: 'Provide a valid institutional email like 2400812450@std.kyu.ac.ug' });
      }
      const [local, domain] = parts;
      if (domain !== 'std.kyu.ac.ug') {
        return res.status(400).json({ message: 'Student email must use the @std.kyu.ac.ug domain.' });
      }
      if (local !== sid) {
        return res.status(400).json({ message: 'The local part of the email must exactly match the Student ID.' });
      }
    }

    // Prevent duplicate emails (use normalized email)
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      console.log("[REGISTER ERROR]: User already exists with this email");
      return res
        .status(400)
        .json({ message: "User already exists with this email." });
    }

    // Create user (store normalized email)
    // Password will be hashed automatically by the User model's pre-save middleware
    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password: password, // Don't hash here - the model does it
      role,
      studentId,
      faculty,
      course,
      yearOfStudy,
      gender,
      phone,
    });

    // Create email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    newUser.verificationToken = verificationToken;
    newUser.verificationTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour
    await newUser.save();

    /* ------------------ EMAIL VERIFICATION ------------------ */
    const verifyUrl = `${process.env.BASE_URL}/verify/${verificationToken}`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; }
            .header { background: #667eea; color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: white; padding: 40px; }
            .greeting { font-size: 16px; margin-bottom: 20px; }
            .message { margin: 20px 0; line-height: 1.8; color: #555; }
            .button-container { text-align: center; margin: 30px 0; }
            .button { display: inline-block; padding: 14px 32px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: 600; }
            .button:hover { opacity: 0.9; }
            .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ddd; }
            .footer-link { color: #667eea; text-decoration: none; }
            .security-note { background: #e8f4f8; padding: 12px; border-left: 4px solid #667eea; margin: 20px 0; font-size: 13px; color: #555; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🗳️ Campus Ballot</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px;">University Voting Platform</p>
            </div>
            <div class="content">
              <p class="greeting">Hello ${newUser.name},</p>
              <p class="message">Thank you for registering with Campus Ballot! To complete your registration and gain access to our voting platform, please verify your email address by clicking the button below.</p>
              <div class="button-container">
                <a href="${verifyUrl}" class="button">Verify Email Address</a>
              </div>
              <div class="security-note">
                <strong>⏱️ Note:</strong> This verification link will expire in 1 hour. If you didn't create this account, you can safely ignore this email.
              </div>
              <p class="message">If the button above doesn't work, you can also copy and paste this link in your browser:</p>
              <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 3px; font-size: 12px;"><a href="${verifyUrl}" class="footer-link">${verifyUrl}</a></p>
            </div>
            <div class="footer">
              <p style="margin: 0 0 10px 0;"><strong>Campus Ballot</strong> • Kyambogo University Voting System</p>
              <p style="margin: 0;">If you have questions, contact us at <a href="mailto:support@campusballot.tech" class="footer-link">support@campusballot.tech</a></p>
              <p style="margin: 10px 0 0 0; font-size: 11px;">© 2026 Campus Ballot. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await sendEmail({
        to: newUser.email,
        subject: "Verify your email",
        html,
      });
      console.log("[REGISTER]: Verification email sent to:", newUser.email);
    } catch (err) {
      console.error("[REGISTER EMAIL ERROR]:", err.message);
    }

    /* ------------------ WELCOME SMS ------------------ */
   if (newUser.phone) {
    const smsResult = await sendSms(
        newUser.phone,
        `Welcome to the Kyambogo University Voting System, ${newUser.name}! Your registration was successful.`
    );
    
    if (smsResult && smsResult.success) {
        console.log('[REGISTER]: Welcome SMS sent successfully to:', newUser.phone);
    } else {
        console.log('[REGISTER]: Failed to send welcome SMS to:', newUser.phone, 'Error:', smsResult?.error);
    }
}

    /* ------------------ FINAL RESPONSE ------------------ */
    console.log("[REGISTER SUCCESS]:", newUser.email);
    res.status(201).json({
      message:
        "Registration successful! Please check your email to verify your account.",
      token: generateToken(newUser._id),
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
      },
    });
  } catch (error) {
    console.error("[REGISTER ERROR]:", error.message);
    res.status(500).json({
      message: "Server error during registration",
      error: error.message,
      stack: error.stack,
    });
  }
});

/* -------------------------------------------------------
   @desc   Login user
--------------------------------------------------------- */
const login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').toString().trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });
    }

    user.lastLogin = new Date();

    // Generate JWT
    const token = generateToken(user._id);

    // For students, enforce single-device login by saving the token
    if (user.role === 'student') {
      user.currentSessionToken = token;
    }
    await user.save();

    console.log("[LOGIN]:", user.email, "Role:", user.role);

    // Log activity for all users (admin, super_admin, and students)
    await logActivity({
      userId: user._id,
      action: 'login',
      entityType: 'System',
      details: `${user.role} logged in: ${user.email}`,
      status: 'success',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });

    // Prepare user response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      additionalRoles: user.additionalRoles || [],
      isVerified: user.isVerified,
      profilePicture: user.profilePicture,
    };

    // Add student-specific fields if user is a student
    if (user.role === 'student') {
      userResponse.studentId = user.studentId;
      userResponse.faculty = user.faculty;
      userResponse.course = user.course;
      userResponse.yearOfStudy = user.yearOfStudy;
      userResponse.gender = user.gender;
    }

    // Add candidate-specific fields if user is a candidate
    if (user.role === 'candidate' && user.candidateInfo) {
      console.log("[LOGIN] Adding candidate info for:", user.email);
      userResponse.candidateInfo = user.candidateInfo;
    }

    res.json({
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("[LOGIN ERROR]:", error.message);
    console.error("[LOGIN ERROR STACK]:", error.stack);
    console.error("[LOGIN ERROR DETAILS]:", {
      name: error.name,
      message: error.message,
      code: error.code,
      path: error.path,
      value: error.value
    });
    res.status(500).json({ 
      message: "Server error during login", 
      error: error.message,
      errorType: error.name 
    });
  }
});

/* -------------------------------------------------------
   @desc   Logout user
--------------------------------------------------------- */
const logout = asyncHandler(async (req, res) => {
  console.log("[LOGOUT]");
  
  // Log activity for all users
  if (req.user) {
    await logActivity({
      userId: req.user._id,
      action: 'logout',
      entityType: 'System',
      details: `${req.user.role} logged out: ${req.user.email}`,
      status: 'success',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });
      // For students, clear currentSessionToken to force logout on all devices
      if (req.user.role === 'student') {
        await User.findByIdAndUpdate(req.user._id, { $set: { currentSessionToken: null } });
      }
  }
  res.json({ message: "Logout successful" });
});

/* -------------------------------------------------------
   @desc   Verify email
--------------------------------------------------------- */
const verifyEmail = asyncHandler(async (req, res) => {
  try {
    console.log("[VERIFY TOKEN]:", req.params.token);
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    console.log("[VERIFY SUCCESS]:", user.email);
    res.json({ message: "Email verified successfully." });
  } catch (error) {
    console.error("[VERIFY ERROR]:", error.message);
    res.status(500).json({ message: "Error verifying email" });
  }
});

/* -------------------------------------------------------
   @desc   Forgot password
--------------------------------------------------------- */
const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = (email || '').toString().trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordTokenExpiry = Date.now() + 1000 * 60 * 30; // 30 mins
    await user.save();

    const resetUrl = `${process.env.BASE_URL}/reset-password/${token}`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; }
            .header { background: #667eea; color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: white; padding: 40px; }
            .greeting { font-size: 16px; margin-bottom: 20px; }
            .message { margin: 20px 0; line-height: 1.8; color: #555; }
            .button-container { text-align: center; margin: 30px 0; }
            .button { display: inline-block; padding: 14px 32px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: 600; }
            .button:hover { opacity: 0.9; }
            .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ddd; }
            .footer-link { color: #667eea; text-decoration: none; }
            .security-note { background: #fff3cd; padding: 12px; border-left: 4px solid #ffc107; margin: 20px 0; font-size: 13px; color: #856404; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🗳️ Campus Ballot</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px;">University Voting Platform</p>
            </div>
            <div class="content">
              <p class="greeting">Hello ${user.name},</p>
              <p class="message">We received a request to reset your Campus Ballot password. Click the button below to create a new password.</p>
              <div class="button-container">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <div class="security-note">
                <strong>⚠️ Security Alert:</strong> This password reset link will expire in 30 minutes. If you didn't request a password reset, please ignore this email or contact our support team immediately.
              </div>
              <p class="message">If the button above doesn't work, copy and paste this link in your browser:</p>
              <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 3px; font-size: 12px;"><a href="${resetUrl}" class="footer-link">${resetUrl}</a></p>
            </div>
            <div class="footer">
              <p style="margin: 0 0 10px 0;"><strong>Campus Ballot</strong> • Kyambogo University Voting System</p>
              <p style="margin: 0;">If you have questions, contact us at <a href="mailto:support@campusballot.tech" class="footer-link">support@campusballot.tech</a></p>
              <p style="margin: 10px 0 0 0; font-size: 11px;">© 2026 Campus Ballot. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        html,
      });
      console.log("[FORGOT PASSWORD]: Reset email sent to", user.email);
    } catch (err) {
      console.error("[FORGOT PASSWORD EMAIL ERROR]:", err.message);
    }

    res.json({ message: "Reset link sent to your email." });
  } catch (error) {
    console.error("[FORGOT PASSWORD ERROR]:", error.message);
    res.status(500).json({ message: "Server error during password reset" });
  }
});

/* -------------------------------------------------------
   @desc   Reset password
--------------------------------------------------------- */
const resetPassword = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordTokenExpiry: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired reset token" });

    user.password = req.body.password;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiry = null;
    await user.save();

    console.log("[RESET PASSWORD]:", user.email);
    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("[RESET PASSWORD ERROR]:", error.message);
    res.status(500).json({ message: "Error resetting password" });
  }
});

/* -------------------------------------------------------
   @desc   Get profile
--------------------------------------------------------- */
const getProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile fetched", user });
  } catch (error) {
    console.error("[GET PROFILE ERROR]:", error.message);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

/* -------------------------------------------------------
   @desc   Update profile
--------------------------------------------------------- */
const updateProfile = asyncHandler(async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-password");

    res.json({ message: "Profile updated", user });
  } catch (error) {
    console.error("[UPDATE PROFILE ERROR]:", error.message);
    res.status(500).json({ message: "Error updating profile" });
  }
});

/* -------------------------------------------------------
   @desc   Change password
--------------------------------------------------------- */
const changePassword = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    const { currentPassword, newPassword } = req.body;

    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("[CHANGE PASSWORD ERROR]:", error.message);
    res.status(500).json({ message: "Error changing password" });
  }
});

/* -------------------------------------------------------
   @desc   Resend password reset email
--------------------------------------------------------- */
const resendPasswordReset = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = (email || '').toString().trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = Date.now() + 1000 * 60 * 30; // 30 minutes
    await user.save();

    // Send password reset email
    const resetUrl = `${process.env.BASE_URL}/reset-password/${resetToken}`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; }
            .header { background: #667eea; color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: white; padding: 40px; }
            .greeting { font-size: 16px; margin-bottom: 20px; }
            .message { margin: 20px 0; line-height: 1.8; color: #555; }
            .button-container { text-align: center; margin: 30px 0; }
            .button { display: inline-block; padding: 14px 32px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: 600; }
            .button:hover { opacity: 0.9; }
            .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ddd; }
            .footer-link { color: #667eea; text-decoration: none; }
            .security-note { background: #fff3cd; padding: 12px; border-left: 4px solid #ffc107; margin: 20px 0; font-size: 13px; color: #856404; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🗳️ Campus Ballot</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px;">University Voting Platform</p>
            </div>
            <div class="content">
              <p class="greeting">Hello ${user.name},</p>
              <p class="message">A new password reset request has been generated for your Campus Ballot account. Click the button below to reset your password.</p>
              <div class="button-container">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <div class="security-note">
                <strong>⏱️ Note:</strong> This link will expire in 30 minutes. If you didn't request this, please ignore this email or contact support immediately.
              </div>
              <p class="message">If the button above doesn't work, copy and paste this link in your browser:</p>
              <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 3px; font-size: 12px;"><a href="${resetUrl}" class="footer-link">${resetUrl}</a></p>
            </div>
            <div class="footer">
              <p style="margin: 0 0 10px 0;"><strong>Campus Ballot</strong> • Kyambogo University Voting System</p>
              <p style="margin: 0;">If you have questions, contact us at <a href="mailto:support@campusballot.tech" class="footer-link">support@campusballot.tech</a></p>
              <p style="margin: 10px 0 0 0; font-size: 11px;">© 2026 Campus Ballot. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request - New Link",
        html,
      });
      console.log("[RESEND PASSWORD RESET]: Email sent to:", user.email);
      res.json({
        message: `New password reset link sent to ${email}. Please check your inbox and spam folder.`
      });
    } catch (emailError) {
      console.error("[RESEND PASSWORD RESET EMAIL ERROR]:", emailError.message);
      res.status(500).json({
        message: "Failed to send password reset email. Please try again later."
      });
    }
  } catch (error) {
    console.error("[RESEND PASSWORD RESET ERROR]:", error.message);
    res.status(500).json({ message: "Error resending password reset email" });
  }
});

/* -------------------------------------------------------
   @desc   Resend verification email
--------------------------------------------------------- */
const resendVerification = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = (email || '').toString().trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();

    // Send verification email
    const verifyUrl = `${process.env.BASE_URL}/verify/${verificationToken}`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; }
            .header { background: #667eea; color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: white; padding: 40px; }
            .greeting { font-size: 16px; margin-bottom: 20px; }
            .message { margin: 20px 0; line-height: 1.8; color: #555; }
            .button-container { text-align: center; margin: 30px 0; }
            .button { display: inline-block; padding: 14px 32px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: 600; }
            .button:hover { opacity: 0.9; }
            .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ddd; }
            .footer-link { color: #667eea; text-decoration: none; }
            .security-note { background: #e8f4f8; padding: 12px; border-left: 4px solid #667eea; margin: 20px 0; font-size: 13px; color: #555; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🗳️ Campus Ballot</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px;">University Voting Platform</p>
            </div>
            <div class="content">
              <p class="greeting">Hello ${user.name},</p>
              <p class="message">A new email verification link has been sent to your account. Please click the button below to complete your email verification.</p>
              <div class="button-container">
                <a href="${verifyUrl}" class="button">Verify Email Address</a>
              </div>
              <div class="security-note">
                <strong>⏱️ Note:</strong> This verification link will expire in 1 hour. If you didn't request a new verification link, you can safely ignore this email.
              </div>
              <p class="message">If the button above doesn't work, copy and paste this link in your browser:</p>
              <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 3px; font-size: 12px;"><a href="${verifyUrl}" class="footer-link">${verifyUrl}</a></p>
            </div>
            <div class="footer">
              <p style="margin: 0 0 10px 0;"><strong>Campus Ballot</strong> • Kyambogo University Voting System</p>
              <p style="margin: 0;">If you have questions, contact us at <a href="mailto:support@campusballot.tech" class="footer-link">support@campusballot.tech</a></p>
              <p style="margin: 10px 0 0 0; font-size: 11px;">© 2026 Campus Ballot. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Verify your email - New Link",
        html,
      });
      console.log("[RESEND VERIFICATION]: Email sent to:", user.email);
      res.json({
        message: `New verification link sent to ${email}. Please check your inbox and spam folder.`
      });
    } catch (emailError) {
      console.error("[RESEND VERIFICATION EMAIL ERROR]:", emailError.message);
      res.status(500).json({
        message: "Failed to send verification email. Please try again later."
      });
    }
  } catch (error) {
    console.error("[RESEND VERIFICATION ERROR]:", error.message);
    res.status(500).json({ message: "Error resending verification email" });
  }
});

module.exports = {
    register,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    changePassword,
    resendPasswordReset,
    resendVerification
};

