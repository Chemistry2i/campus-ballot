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
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("[AUTH] 🚫 User not found with decoded ID");
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    req.user = user;
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
const adminOnly = authorize("admin");

module.exports = {
  protect,
  authorize,
  adminOnly,
};
