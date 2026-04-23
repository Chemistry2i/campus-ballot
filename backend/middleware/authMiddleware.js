// const jwt = require("jsonwebtoken");
// const asyncHandler = require("express-async-handler");
// const User = require("../models/User"); // Adjust the path based on your structure

// // Middleware to protect routes (authentication check)
// const protect = asyncHandler(async (req, res, next) => {
//   let token;

//   // Try to get token from cookie
//   if (req.cookies && req.cookies.token) {
//     token = req.cookies.token;
//   }

//   // Optionally support Bearer token in header
//   if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
//     token = req.headers.authorization.split(" ")[1];
//   }

//   if (!token) {
//     res.status(401);
//     throw new Error("Not authorized, token missing");
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id).select("-password");

//     if (!req.user) {
//       res.status(401);
//       throw new Error("Not authorized, user not found");
//     }

//     next();
//   } catch (err) {
//     res.status(401);
//     throw new Error("Not authorized, token failed");
//   }
// });

// // Middleware to restrict access by user role (authorization check)
// const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       res.status(401);
//       throw new Error("Not authenticated");
//     }

//     if (!roles.includes(req.user.role)) {
//       res.status(403);
//       throw new Error(`User role '${req.user.role}' is not authorized to access this resource`);
//     }

//     next();
//   };
// };

// module.exports = {
//   protect,
//   authorize
// };


const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// 🔐 Middleware to protect routes (JWT verification)
const protect = asyncHandler(async (req, res, next) => {
  try {
    let token;

    // Check cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Check Authorization header
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      console.log("[AUTH] 🔒 Token missing");
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // For students, select currentSessionToken for single-device enforcement
    const user = await User.findById(decoded.id).select("-password +currentSessionToken");

    if (!user) {
      console.log("[AUTH] 🚫 User not found with decoded ID");
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    // Enforce active session check for ALL users (Invalidates tokens after logout)
    if (!user.currentSessionToken || user.currentSessionToken !== token) {
      console.log("[AUTH] 🚫 Token does not match current session token (Logged out or new login)");
      return res.status(401).json({ message: "Session expired or logged in on another device." });
    }

    // Block access for suspended users
    if (user.accountStatus === 'suspended') {
      console.log("[AUTH] 🚫 User account is suspended");
      return res.status(403).json({ message: "Account suspended. Please contact support." });
    }

    req.user = user;
    // Update lastSeen for active user tracking
    if (user) {
      user.lastSeen = new Date();
      await user.save();
    }
    next();
  } catch (err) {
    console.log("[AUTH ERROR] ❌", {
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });

    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
});

// 🛡️ Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        console.log("[AUTH] ❗ User not authenticated");
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (!roles.includes(req.user.role)) {
        console.log(`[AUTH] 🚫 Role '${req.user.role}' not authorized`);
        return res.status(403).json({
          message: `Access denied: '${req.user.role}' is not authorized`,
        });
      }

      next();
    } catch (err) {
      console.log("[AUTH ERROR] ❌", err);
      return res.status(500).json({ message: "Server error in authorization" });
    }
  };
};

// Shortcut for admin-only routes
const adminOnly = authorize("admin", "super_admin", "federation_admin");

// Super Admin only middleware
const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Super Admin only." });
  }
};

// Federation Admin or Super Admin only middleware
const federationAdminOnly = (req, res, next) => {
  if (req.user && ['super_admin', 'federation_admin'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Federation Admin or Super Admin only." });
  }
};

// 🎯 Multi-role authorization (checks primary role OR additional roles)
const hasRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        console.log("[AUTH] ❗ User not authenticated");
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Check primary role
      const userRoles = [req.user.role, ...(req.user.additionalRoles || [])];
      const hasPermission = allowedRoles.some(role => userRoles.includes(role));

      if (!hasPermission) {
        console.log(`[AUTH] 🚫 User roles [${userRoles.join(', ')}] not authorized. Required: [${allowedRoles.join(', ')}]`);
        return res.status(403).json({
          message: `Access denied: requires one of [${allowedRoles.join(', ')}]`,
        });
      }

      console.log(`[AUTH] ✅ User authorized with roles: [${userRoles.join(', ')}]`);
      next();
    } catch (err) {
      console.log("[AUTH ERROR] ❌", err);
      return res.status(500).json({ message: "Server error in authorization" });
    }
  };
};

// Helper middleware for specific role combinations
const studentOrCandidate = hasRole('student', 'candidate');
const studentOrAgent = hasRole('student', 'agent');
const candidateOnly = hasRole('candidate');
const agentOnly = hasRole('agent');
const observerOnly = hasRole('observer');
const adminOrObserver = hasRole('admin', 'super_admin', 'observer');

// Observer-specific middleware with election scope check
const observerWithAccess = (checkElectionId = false) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const isObserver = req.user.role === 'observer';
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);

    // Admins have full access
    if (isAdmin) {
      return next();
    }

    // Check if user is observer
    if (!isObserver) {
      return res.status(403).json({ message: "Access denied: Observer role required" });
    }

    // If election-specific access check is required
    if (checkElectionId && req.user.observerInfo?.accessLevel === 'election-specific') {
      const electionId = req.params.electionId || req.query.electionId || req.body.electionId;
      
      if (!electionId) {
        return res.status(400).json({ message: "Election ID required" });
      }

      const hasAccess = req.user.observerInfo.assignedElections?.some(
        id => id.toString() === electionId.toString()
      );

      if (!hasAccess) {
        return res.status(403).json({ 
          message: "Access denied: Not assigned to this election" 
        });
      }
    }

    next();
  });
};

// 👤 Optional authentication - sets req.user if token exists, but doesn't fail if missing
const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    let token;

    // Check cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Check Authorization header
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      // No token, just continue without user
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (user) {
      req.user = user;
    }

    next();
  } catch (err) {
    // Token invalid, but continue without user
    console.log("[OPTIONAL AUTH] Token present but invalid, continuing without user");
    next();
  }
});

module.exports = {
  protect,
  authorize,
  adminOnly,
  superAdminOnly,
  federationAdminOnly,
  hasRole,
  studentOrCandidate,
  studentOrAgent,
  candidateOnly,
  agentOnly,
  observerOnly,
  adminOrObserver,
  observerWithAccess,
  optionalAuth
};
