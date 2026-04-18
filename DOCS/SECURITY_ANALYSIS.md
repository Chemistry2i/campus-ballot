# Campus-Ballot System: Comprehensive Security & Architecture Analysis

**Generated:** April 18, 2026  
**Analysis Date:** Q1 2026

---

## EXECUTIVE SUMMARY

The Campus-Ballot system is an election-voting platform for universities with a complex multi-role architecture. This analysis covers user roles, permissions, security mechanisms, vulnerabilities, business logic, and data models.

**Key Findings:**
- ✅ Good: JWT-based authentication with single-device enforcement
- ✅ Good: Role-based access control (RBAC) implemented
- ⚠️ Warning: Mixed protection levels across endpoints
- ⚠️ Warning: Incomplete permission checks on some routes
- ⚠️ Warning: Sensitive credentials in plaintext .env file
- ⚠️ Warning: Some election-related validation gaps

---

## 1. USER ROLES & PERMISSIONS MATRIX

### 1.1 Defined User Roles

#### Location: [backend/models/User.js](backend/models/User.js#L13-L21)

```
Primary Role Enum:
  - 'student'          (default role for public registration)
  - 'admin'            (organization-level election administrator)
  - 'super_admin'      (system-wide administrator)
  - 'federation_admin' (federation-level administrator)
  - 'candidate'        (election candidate/aspirant)
  - 'agent'            (candidate's representative/assistant)
  - 'observer'         (election monitor/observer)
```

**Additional Roles Support:**  
Users can have multiple roles via `additionalRoles` array: `['candidate', 'agent']`

### 1.2 Role-Specific Fields in User Model

| Role | Specific Fields | Location |
|------|-----------------|----------|
| **candidate** | `candidateInfo` (electionId, position, manifesto, status) | [User.js#L44-L54](backend/models/User.js#L44-L54) |
| **agent** | `agentInfo` (assignedCandidateId, permissions[]) | [User.js#L55-L64](backend/models/User.js#L55-L64) |
| **observer** | `observerInfo` (assignedElections[], accessLevel, organization) | [User.js#L65-L76](backend/models/User.js#L65-L76) |
| **student** | `studentId, faculty, yearOfStudy, course` | [User.js#L80-L112](backend/models/User.js#L80-L112) |

### 1.3 Permission Matrix: Role → Endpoint Access

#### Auth Endpoints
| Endpoint | Method | Role(s) | Location |
|----------|--------|---------|----------|
| `/api/auth/register` | POST | Public | [authRoutes.js#L9](backend/routes/authRoutes.js#L9) |
| `/api/auth/login` | POST | Public | [authRoutes.js#L12](backend/routes/authRoutes.js#L12) |
| `/api/auth/logout` | POST | Protected (any auth user) | [authRoutes.js#L15](backend/routes/authRoutes.js#L15) |
| `/api/auth/profile` | GET | Protected | [authRoutes.js#L24](backend/routes/authRoutes.js#L24) |
| `/api/auth/profile` | PUT | Protected | [authRoutes.js#L27](backend/routes/authRoutes.js#L27) |

#### Election Endpoints
| Endpoint | Method | Role(s) | Location |
|----------|--------|---------|----------|
| `GET /api/elections` | GET | Protected (any) | [electionRoutes.js#L23](backend/routes/electionRoutes.js#L23) |
| `POST /api/elections` | POST | `admin`, `super_admin` | [electionRoutes.js#L20](backend/routes/electionRoutes.js#L20) |
| `PUT /api/elections/:id` | PUT | `admin`, `super_admin` | [electionRoutes.js#L41](backend/routes/electionRoutes.js#L41) |
| `DELETE /api/elections/:id` | DELETE | `admin`, `super_admin` | [electionRoutes.js#L44](backend/routes/electionRoutes.js#L44) |
| `PUT /api/elections/:id/publish-results` | PUT | `admin`, `super_admin` | [electionRoutes.js#L47](backend/routes/electionRoutes.js#L47) |

#### Vote Endpoints
| Endpoint | Method | Role(s) | Location |
|----------|--------|---------|----------|
| `POST /api/votes` | POST | Protected (any auth) + rate-limited | [voteRoutes.js#L13](backend/routes/voteRoutes.js#L13) |
| `GET /api/votes/me` | GET | Protected (any auth) | [voteRoutes.js#L16](backend/routes/voteRoutes.js#L16) |
| `GET /api/votes/election/:id` | GET | `admin`, `super_admin` | [voteRoutes.js#L19](backend/routes/voteRoutes.js#L19) |
| `GET /api/votes` | GET | `admin`, `super_admin` | [voteRoutes.js#L25](backend/routes/voteRoutes.js#L25) |

#### Candidate Endpoints
| Endpoint | Method | Role(s) | Location |
|----------|--------|---------|----------|
| `POST /api/candidates` | POST | `admin`, `super_admin` | [candidateRoutes.js#L18-L26](backend/routes/candidateRoutes.js#L18-L26) |
| `GET /api/candidates` | GET | Protected | [candidateRoutes.js#L29](backend/routes/candidateRoutes.js#L29) |
| `GET /api/candidates/me/candidacy` | GET | Protected | [candidateRoutes.js#L32](backend/routes/candidateRoutes.js#L32) |
| `DELETE /api/candidates/me/candidacy` | DELETE | Protected | [candidateRoutes.js#L35](backend/routes/candidateRoutes.js#L35) |
| `PUT /api/candidates/:id/approve` | PUT | `admin`, `super_admin` | [candidateRoutes.js#L60](backend/routes/candidateRoutes.js#L60) |
| `PUT /api/candidates/:id/disqualify` | PUT | `admin`, `super_admin` | [candidateRoutes.js#L63](backend/routes/candidateRoutes.js#L63) |

#### Observer Endpoints
| Endpoint | Method | Role(s) | Location |
|----------|--------|---------|----------|
| `GET /api/observer/dashboard` | GET | `observer` | [observerRoutes.js#L26](backend/routes/observerRoutes.js#L26) |
| `GET /api/observer/elections/:id/statistics` | GET | `observer` (with election access) | [observerRoutes.js#L32](backend/routes/observerRoutes.js#L32) |
| `GET /api/observer/elections/:id/audit-logs` | GET | `observer` (with election access) | [observerRoutes.js#L33](backend/routes/observerRoutes.js#L33) |
| `POST /api/observer/incidents` | POST | `observer` | [observerRoutes.js#L47](backend/routes/observerRoutes.js#L47) |

#### Super Admin Endpoints
| Endpoint | Method | Role(s) | Location |
|----------|--------|---------|----------|
| `GET /api/super-admin/admins` | GET | `super_admin` | [superAdminRoutes.js#L16](backend/routes/superAdminRoutes.js#L16) |
| `POST /api/super-admin/admins` | POST | `super_admin` | [superAdminRoutes.js#L17](backend/routes/superAdminRoutes.js#L17) |
| `GET /api/super-admin/observers` | GET | `super_admin` | [superAdminRoutes.js#L23](backend/routes/superAdminRoutes.js#L23) |
| `POST /api/super-admin/observers` | POST | `super_admin` | [superAdminRoutes.js#L24](backend/routes/superAdminRoutes.js#L24) |

#### Public Endpoints (NO AUTHENTICATION)
| Endpoint | Method | Access | Location |
|----------|--------|--------|----------|
| `GET /api/public/candidates` | GET | Public | [publicRoutes.js#L27](backend/routes/publicRoutes.js#L27) |
| `GET /api/public/candidates/:id` | GET | Public | [publicRoutes.js#L48](backend/routes/publicRoutes.js#L48) |
| `GET /api/public/elections` | GET | Public | [publicRoutes.js#L71](backend/routes/publicRoutes.js#L71) |
| `GET /api/health` | GET | Public | [server.js#L134](backend/server.js#L134) |

#### User Management Endpoints
| Endpoint | Method | Role(s) | Location |
|----------|--------|---------|----------|
| `GET /api/users` | GET | `admin`, `super_admin` | [userRoutes.js#L19](backend/routes/userRoutes.js#L19) |
| `GET /api/users/:id` | GET | `admin`, `super_admin` | [userRoutes.js#L22](backend/routes/userRoutes.js#L22) |
| `PUT /api/users/:id` | PUT | `admin`, `super_admin` | [userRoutes.js#L25](backend/routes/userRoutes.js#L25) |
| `DELETE /api/users/:id` | DELETE | `admin`, `super_admin` | [userRoutes.js#L28](backend/routes/userRoutes.js#L28) |
| `PUT /api/users/:id/suspend` | PUT | `admin`, `super_admin` | [userRoutes.js#L31](backend/routes/userRoutes.js#L31) |
| `GET /api/users/me/profile` | GET | Protected | [userRoutes.js#L37](backend/routes/userRoutes.js#L37) |

### 1.4 Authorization Middleware Functions

Location: [backend/middleware/authMiddleware.js](backend/middleware/authMiddleware.js)

```javascript
// Core middleware functions:
- protect                  // Verifies JWT, enforces single-device session
- authorize(...roles)      // Role-based access (primary role only)
- adminOnly               // Shorthand for admin|super_admin|federation_admin
- superAdminOnly          // super_admin only
- federationAdminOnly     // super_admin|federation_admin
- hasRole(...roles)       // Multi-role check (primary + additional roles)
- studentOrCandidate      // student|candidate
- studentOrAgent          // student|agent
- candidateOnly           // candidate only
- agentOnly               // agent only
- observerOnly            // observer only
- observerWithAccess()    // Observer with election-specific access validation
- optionalAuth            // Non-failing auth (sets req.user if valid token)
```

**Primary Auth Logic:** [authMiddleware.js#L60-L100](backend/middleware/authMiddleware.js#L60-L100)
- Checks cookie first, then Authorization header
- Validates JWT signature
- Verifies `currentSessionToken` matches (single-device enforcement)
- Updates `lastSeen` timestamp

---

## 2. SECURITY VULNERABILITIES & GAPS

### 2.1 CRITICAL ISSUES

#### 🔴 CRITICAL-1: Credentials in Version Control
**Severity:** CRITICAL  
**Location:** [backend/.env](backend/.env)

**Issue:**
```env
MONGODB_URI=mongodb+srv://e-voting:campusballot@e-voting.elynjgj.mongodb.net/?appName=e-voting
JWT_SECRET=my_jwt_secret
EMAIL_PASS=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
AFRICASTALKING_API_KEY=atsk_82dd9bf8ed8e777e176c6d0a771788d31c06ef47574366f83aac3a43e1b71675d8027f26
CLOUDINARY_API_SECRET=tM6gzwpMwSPk4pFgaOaxj5WfKQ0
DD_API_KEY=31577119e0b7638e4611f917dd0220da
```

**Impact:**
- Database can be accessed by anyone with repository access
- Email sending functionality compromised
- SMS gateway compromised (Africa's Talking)
- Datadog monitoring compromised
- Image storage (Cloudinary) compromised

**Remediation:**
```bash
# 1. Rotate ALL credentials immediately
# 2. Remove .env from version control
git rm --cached backend/.env
echo "backend/.env" >> .gitignore

# 3. Use environment variable management:
# - Render.com secrets
# - GitHub Secrets (if using CI/CD)
# - HashiCorp Vault
# - AWS Secrets Manager

# 4. Audit database access logs
# 5. Change JWT_SECRET to a strong value
# 6. Regenerate all API keys
```

---

#### 🔴 CRITICAL-2: Weak JWT Secret
**Severity:** CRITICAL  
**Location:** [backend/.env](backend/.env#L4)

**Issue:**
```env
JWT_SECRET=my_jwt_secret  # Weak, predictable secret
```

**Impact:**
- JWTs can be forged by attackers
- Session hijacking possible
- No forward secrecy

**Remediation:**
```javascript
// Generate strong 256-bit secret:
const crypto = require('crypto');
console.log(crypto.randomBytes(32).toString('hex'));
// Use output for JWT_SECRET

// Example strong secret:
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
```

**Implementation:** [backend/controllers/authController.js#L308](backend/controllers/authController.js#L308)
```javascript
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
```

---

#### 🔴 CRITICAL-3: Weak Password Requirements
**Severity:** HIGH  
**Location:** [backend/models/User.js#L18-L21](backend/models/User.js#L18-L21)

**Current Policy:**
```javascript
password: {
    minlength: [8, 'Password must be at least 8 characters long'],
    // No complexity requirements
}
```

**Issue:**
- Only length requirement (8 chars)
- No enforcement of:
  - Uppercase letters
  - Lowercase letters
  - Numbers
  - Special characters

**Example Weak Passwords Allowed:**
- `password1` ❌ (no uppercase, no special chars)
- `12345678` ❌ (all numbers)
- `abcdefgh` ❌ (all lowercase)

**Remediation:**
```javascript
// Update User.js password validation:
password: {
    type: String,
    required: true,
    minlength: [12, 'Password must be at least 12 characters'],
    validate: {
        validator: function(v) {
            // At least one uppercase, lowercase, number, special char
            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
            return regex.test(v);
        },
        message: 'Password must contain uppercase, lowercase, number, and special character'
    }
}

// Add validation in authController register/reset:
const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    if (!regex.test(password)) {
        throw new Error('Password must be 12+ chars with uppercase, lowercase, number, and special char');
    }
};

// Register: [authController.js#L314-L370]
// Reset Password: [authController.js#L500+]
```

---

### 2.2 HIGH SEVERITY ISSUES

#### 🟠 HIGH-1: Registration Allows Role Elevation
**Severity:** HIGH  
**Location:** [backend/controllers/authController.js#L314-L370](backend/controllers/authController.js#L314-L370)

**Current Issue:**
```javascript
const register = asyncHandler(async (req, res) => {
  // Line 334-335: Accepts role from request but then FORCES it
  const role = 'student';  // Good - forces student role
  
  // BUT: admins created via seedAdmin.js or other scripts
  // No verification that only super_admin can create admins
});
```

**However:** The public registration correctly forces `role: 'student'`.

**Remaining Gap:** Admin/super_admin creation endpoints exist but need verification.

**Recommendation:**
```javascript
// In super-admin controller (create admin):
const createAdmin = asyncHandler(async (req, res) => {
  // VERIFY: Only super_admin can create admins
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only super admin can create admins' });
  }
  
  // Force role to 'admin' - don't accept from request
  const admin = await User.create({
    ...req.body,
    role: 'admin',  // Force, don't accept from request
    organization: req.body.organization  // Must be specified
  });
});
```

---

#### 🟠 HIGH-2: Missing Input Validation on Voting
**Severity:** HIGH  
**Location:** [backend/controllers/voteController.js#L16-L70](backend/controllers/voteController.js#L16-L70)

**Current Validation:**
```javascript
const castVote = asyncHandler(async (req, res) => {
  const { electionId, position, candidateId, abstain } = req.body;

  if (!electionId || !position) {
    return res.status(400).json({ message: "electionId and position are required" });
  }
  // MISSING: No type checking, no sanitization
});
```

**Issues:**
- No validation that `candidateId` is valid MongoDB ObjectId
- No validation that `position` matches election positions
- No XSS protection on string inputs
- No SQL/NoSQL injection checks (though using Mongoose helps)

**Remediation:**
```javascript
const validateVoteInput = (req, res, next) => {
  const { electionId, position, candidateId } = req.body;
  
  // Validate ObjectIds
  if (!mongoose.Types.ObjectId.isValid(electionId)) {
    return res.status(400).json({ message: 'Invalid electionId' });
  }
  
  if (candidateId && !mongoose.Types.ObjectId.isValid(candidateId)) {
    return res.status(400).json({ message: 'Invalid candidateId' });
  }
  
  // Validate position is string (not object/array)
  if (typeof position !== 'string' || position.length === 0) {
    return res.status(400).json({ message: 'Invalid position' });
  }
  
  // Sanitize strings
  req.body.position = req.body.position.trim().slice(0, 200);
  
  next();
};

// Apply to vote endpoint:
// [voteRoutes.js#L13]
// router.post('/', protect, validateVoteInput, voteLimiter, castVote);
```

---

#### 🟠 HIGH-3: Insufficient Access Control on Observer Endpoints
**Severity:** HIGH  
**Location:** [backend/routes/observerRoutes.js#L28-L40](backend/routes/observerRoutes.js#L28-L40)

**Current Implementation:**
```javascript
router.get("/elections/:electionId/statistics", 
  observerWithAccess(true),  // Checks election assignment
  getElectionStatistics
);
```

**Issue:** `observerWithAccess()` implementation has a gap.

**Gap Check** [authMiddleware.js#L227-L255](backend/middleware/authMiddleware.js#L227-L255):
```javascript
const observerWithAccess = (checkElectionId = false) => {
  return asyncHandler(async (req, res, next) => {
    // ...
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
```

**Issue:** Observers with `accessLevel: 'full'` bypass election-specific checks entirely. Need verification that full access is only for authorized observers.

**Remediation:**
```javascript
const observerWithAccess = (checkElectionId = false) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user.role !== 'observer') {
      if (!['admin', 'super_admin'].includes(req.user.role)) {
        return res.status(403).json({ message: "Observer role required" });
      }
      // Admins can access all
      return next();
    }

    // Observer-specific checks
    if (checkElectionId) {
      const electionId = req.params.electionId || req.query.electionId || req.body.electionId;
      
      if (!electionId) {
        return res.status(400).json({ message: "Election ID required" });
      }

      // ALWAYS verify election assignment, regardless of accessLevel
      const hasAccess = req.user.observerInfo?.assignedElections?.some(
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
```

---

#### 🟠 HIGH-4: Unprotected Dashboard Stats Endpoint
**Severity:** MEDIUM-HIGH  
**Location:** [backend/routes/adminRoutes.js#L31](backend/routes/adminRoutes.js#L31)

**Current Implementation:**
```javascript
router.get('/dashboard-stats', async (req, res) => {  // NO PROTECTION!
  try {
    const totalUsers = await User.countDocuments();
    const totalVotes = await Vote.countDocuments();
    const totalElections = await Election.countDocuments();
    // ... returns system-wide statistics
  }
});
```

**Issue:**
- **NOT PROTECTED** - anyone can fetch system statistics
- Exposes election data, vote counts, user counts
- Useful for reconnaissance attacks
- Information disclosure vulnerability

**Exposed Information:**
- Total user count
- Total vote count
- Total elections
- Active elections count
- Pending candidates count
- Roles distribution

**Remediation:**
```javascript
// [adminRoutes.js#L31]
router.get('/dashboard-stats', protect, adminOnly, async (req, res) => {
  // NOW requires authentication and admin role
  try {
    // ... existing code
  }
});
```

---

### 2.3 MEDIUM SEVERITY ISSUES

#### 🟡 MEDIUM-1: No Rate Limiting on Registration
**Severity:** MEDIUM  
**Location:** [backend/routes/authRoutes.js#L9](backend/routes/authRoutes.js#L9)

**Current Implementation:**
```javascript
router.post('/register', register);  // No rate limiter
```

**Issue:**
- Account enumeration attacks possible
- Email bombing (via verification emails)
- Brute force registration attempts

**Compare to voting:** [voteRoutes.js#L13](backend/voteRoutes.js#L13)
```javascript
router.post('/', protect, voteLimiter, castVote);  // Has voteLimiter!
```

**Remediation:**
```javascript
// [middleware/rateLimiter.js]
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,      // 1 hour
  max: 5,                         // 5 registration attempts per IP per hour
  message: "Too many registrations, try again later",
  skipSuccessfulRequests: true    // Don't count successful registrations
});

// [authRoutes.js#L9]
router.post('/register', registerLimiter, register);
```

---

#### 🟡 MEDIUM-2: No Rate Limiting on Login
**Severity:** MEDIUM  
**Location:** [backend/routes/authRoutes.js#L12](backend/routes/authRoutes.js#L12)

**Current Implementation:**
```javascript
router.post('/login', login);  // No rate limiter
```

**Issue:**
- Brute force password attacks possible
- Credential stuffing attacks
- No protection against automated login attempts

**Remediation:**
```javascript
// [middleware/rateLimiter.js]
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,       // 15 minutes
  max: 5,                         // 5 failed login attempts per IP
  skipSuccessfulRequests: true,   // Reset counter on successful login
  message: "Too many login attempts, try again later"
});

// [authRoutes.js#L12]
router.post('/login', loginLimiter, login);
```

---

#### 🟡 MEDIUM-3: Password Reset Token Not Invalidated On Login
**Severity:** MEDIUM  
**Location:** [backend/controllers/authController.js#L470-L530](backend/controllers/authController.js#L470-L530)

**Issue:**
- If a password reset token is sent but not used, it remains valid for 30 minutes
- If user logs in via another method (different device), old token still valid
- Token reuse possible if sent to multiple recipients

**Current Implementation:**
```javascript
// In login function (line 470+):
user.lastLogin = new Date();
const token = generateToken(user._id);
user.currentSessionToken = token;
await user.save();
// MISSING: user.resetPasswordToken = null;
// MISSING: user.resetPasswordTokenExpiry = null;
```

**Remediation:**
```javascript
const login = asyncHandler(async (req, res) => {
  // ... existing code ...
  
  user.lastLogin = new Date();
  const token = generateToken(user._id);
  
  // Clear any pending password reset tokens
  user.resetPasswordToken = null;
  user.resetPasswordTokenExpiry = null;
  
  // Enforce single-device login
  user.currentSessionToken = token;
  await user.save();
  
  // ... rest of code ...
});
```

---

#### 🟡 MEDIUM-4: Email Verification Bypass Possible
**Severity:** MEDIUM  
**Location:** [backend/controllers/authController.js#L423-L444](backend/controllers/authController.js#L423-L444)

**Issue:**
- User can login BEFORE verifying email if verification email fails to send
- Actually, checking code shows this is prevented: [authController.js#L473]

**Current Check:**
```javascript
if (!user.isVerified) {
  return res.status(403).json({ 
    message: "Please verify your email before logging in." 
  });
}
```

**This is properly implemented.** ✅ No issue here.

---

#### 🟡 MEDIUM-5: Vote Anonymity Issue - Demographics Stored
**Severity:** MEDIUM  
**Location:** [backend/models/Ballot.js#L10-L16](backend/models/Ballot.js#L10-L16)

**Current Implementation:**
```javascript
const ballotSchema = new mongoose.Schema({
  election: { ... },
  position: { ... },
  candidate: { ... },
  // Anonymous demographics for analytics
  faculty: String,
  department: String,
  yearOfStudy: String,
  gender: String,
  status: { ... }
});
```

**Issue:**
- While ballot is anonymous (no direct user link), storing demographics + vote enables:
  - Statistical de-anonymization attacks
  - Combined with metadata (time, IP), could identify voters
  - Pattern analysis to link voters to votes

**Example Attack:**
- "Male student from Faculty of Engineering who voted at 2:45 PM"
- Cross-reference with election logs to identify individual

**Vote Recording Logic:** [voteController.js#L60-L65](backend/controllers/voteController.js#L60-L65)
```javascript
const ballot = await Ballot.create([{
  election: electionId,
  position,
  candidate: abstain ? undefined : candidateId,
  // These need stronger protection:
  faculty: req.user.faculty,
  department: req.user.department,
  yearOfStudy: req.user.yearOfStudy,
  gender: req.user.gender
}], { session });
```

**Remediation:**
```javascript
// Option 1: Remove identifiable demographics from ballot
// Keep only aggregated stats
const ballot = await Ballot.create([{
  election: electionId,
  position,
  candidate: abstain ? undefined : candidateId
  // Remove: faculty, department, yearOfStudy, gender
}], { session });

// Option 2: Store hashed demographics (still identifiable with link attack)
const ballot = await Ballot.create([{
  election: electionId,
  position,
  candidate: abstain ? undefined : candidateId,
  // Hash demographics separately without linking to user
  demographicsHash: crypto.createHash('sha256')
    .update(`${req.user.faculty}${req.user.department}`)
    .digest('hex')
}], { session });

// Option 3: Keep demographics but ensure proper separation
// - Use separate collection for vote analytics
// - No direct link between voter and ballot
// - Aggregate demographics only, never return individual ballots with demographics
```

---

### 2.4 LOW SEVERITY ISSUES

#### 🟢 LOW-1: Verbose Error Messages Leak Information
**Severity:** LOW  
**Location:** Multiple endpoints

**Examples:**
```javascript
// [authController.js#L472]
if (!user || !(await bcrypt.compare(password, user.password))) {
  return res.status(401).json({ 
    message: "Invalid email or password"  // Good - doesn't say which
  });
}

// But in other places:
// [candidateController.js]
if (!candidate) {
  return res.status(404).json({ message: 'Candidate not found' });
}
```

**Issue:**
- Returns different errors for "not found" vs "permission denied"
- Attacker can enumerate resources (does a candidate with ID X exist?)

**Recommendation:**
```javascript
// Use generic responses for missing resources:
if (!candidate) {
  return res.status(403).json({ 
    message: 'Access denied' // Don't differentiate
  });
}
```

---

#### 🟢 LOW-2: Socket.IO Room Validation Incomplete
**Severity:** LOW  
**Location:** [backend/server.js#L256-L271](backend/server.js#L256-L271)

**Current Implementation:**
```javascript
socket.on('join', (room) => {
  if (!room) return;

  // Only block admin rooms without auth
  if ((room.startsWith('election_') || room.startsWith('admin_')) 
    && (!socket.user || socket.user.role !== 'admin')) {
    socket.emit('error', 'Not authorized to join this room');
    return;
  }

  socket.join(room);
});
```

**Issue:**
- Election rooms not properly validated
- A regular user could join `election_<id>` room if they know the structure
- Should validate election-specific assignment

**Remediation:**
```javascript
socket.on('join', async (room) => {
  if (!room) return;

  // Admin rooms require admin role
  if (room.startsWith('admin_') && 
    (!socket.user || socket.user.role !== 'admin')) {
    socket.emit('error', 'Not authorized');
    return;
  }

  // Election rooms require observer/admin with assignment
  if (room.startsWith('election_')) {
    if (!socket.user) {
      socket.emit('error', 'Authentication required');
      return;
    }
    
    const electionId = room.replace('election_', '');
    
    if (socket.user.role === 'admin') {
      socket.join(room);
      return;
    }
    
    if (socket.user.role === 'observer') {
      const hasAccess = socket.user.observerInfo?.assignedElections
        ?.some(id => id.toString() === electionId);
      
      if (!hasAccess) {
        socket.emit('error', 'Not assigned to this election');
        return;
      }
    } else {
      socket.emit('error', 'Not authorized');
      return;
    }
  }

  socket.join(room);
});
```

---

## 3. BUSINESS LOGIC & FEATURES

### 3.1 Election Management

#### Election Model Structure
**Location:** [backend/models/Election.js](backend/models/Election.js)

| Field | Type | Purpose |
|-------|------|---------|
| `title` | String | Election name (unique) |
| `description` | String | Election details |
| `organization` | ObjectId | Organization running election |
| `scope` | Enum: university\|federation\|custom | Who can vote |
| `allowedOrganizations` | ObjectId[] | For custom scope |
| `startDate` | Date | Election begins |
| `endDate` | Date | Election closes |
| `status` | Enum: upcoming\|ongoing\|completed | Current state |
| `positions` | String[] | Election positions (e.g., ["President", "VP"]) |
| `candidates` | ObjectId[] | Candidate references |
| `resultsPublished` | Boolean | Results visibility |
| `allowedFaculties` | String[] | Restrict to faculties |
| `eligibility` | Object | Faculty/year/course/GPA restrictions |

#### Voting Rules (Business Logic)
**Location:** [backend/controllers/voteController.js#L16-L95](backend/controllers/voteController.js#L16-L95)

1. **Time Window Enforcement** (server-side)
   ```javascript
   if (start && now < start) return 403 "Voting has not started"
   if (end && now > end) return 403 "Voting has ended"
   ```

2. **Faculty Eligibility Check**
   ```javascript
   if (election.allowedFaculties?.length > 0) {
     if (!election.allowedFaculties.includes(req.user.faculty)) {
       return 403 "Your faculty is not eligible"
     }
   }
   ```

3. **Double Voting Prevention** (Database unique index)
   ```javascript
   // [Vote.js#L27]
   voteSchema.index({ user: 1, election: 1, position: 1 }, { unique: true });
   ```

4. **Transaction Safety**
   ```javascript
   // Atomic vote recording:
   // 1. Create VoterRecord (claims spot)
   // 2. Create Ballot (records vote)
   // 3. Increment Candidate.votes
   // All succeed or all fail
   ```

5. **Vote Anonymity**
   - VoterRecord links User → Election (can vote only once)
   - Ballot is anonymous (no user field)
   - Demographics stored separately for analytics

#### Candidate Approval Workflow
**Location:** [backend/controllers/candidateController.js](backend/controllers/candidateController.js)

Status Flow:
```
pending → approved (by admin)
        → rejected (by admin)

Can also:
  - Get disqualified (after approved)
  - Withdraw candidacy
```

**Approval Endpoints:**
- `PUT /api/candidates/:id/approve` - Admin approves
- `PUT /api/candidates/:id/disqualify` - Admin disqualifies
- `DELETE /api/candidates/me/candidacy` - Candidate withdraws

---

### 3.2 Voting Mechanism

#### Vote Recording Flow

```
User submits vote (POST /api/votes)
  ↓
Server validates:
  - Election exists
  - Voting window open (server time)
  - User eligible (faculty check)
  - Candidate valid for position
  - User hasn't voted this position/election
  ↓
Start transaction:
  - Create Vote record (user+election+position) - UNIQUE constraint prevents double vote
  - Create Ballot record (anonymous) - no user link
  - Increment Candidate.votes counter
  ↓
Log activity (for audit trail)
  ↓
Emit socket event for real-time dashboard
  ↓
Return success
```

**Vote Model:**
```javascript
{
  user: ObjectId,          // WHO voted (for voting history, not eligibility)
  election: ObjectId,      // WHICH election
  candidate: ObjectId,     // WHO they voted for (optional - can abstain)
  position: String,        // WHICH position
  status: 'valid'|'invalid'
}
```

**Ballot Model (Anonymous):**
```javascript
{
  election: ObjectId,
  position: String,
  candidate: ObjectId,      // NO user field
  // Demographics for analytics only
  faculty: String,
  department: String,
  yearOfStudy: String,
  gender: String,
  status: 'valid'|'void'|'spoiled'
}
```

---

### 3.3 Result Calculation

**Location:** [backend/controllers/electionController.js](backend/controllers/electionController.js)
**Report Generation:** [backend/controllers/reportController.js](backend/controllers/reportController.js)

#### Vote Counting Logic
```javascript
// Count votes per candidate per position per election
const ballots = await Ballot.find({
  election: electionId,
  position: position,
  status: 'valid'
});

const voteCounts = {};
ballots.forEach(ballot => {
  if (ballot.candidate) {
    voteCounts[ballot.candidate] = (voteCounts[ballot.candidate] || 0) + 1;
  }
});
```

#### Results Models
```javascript
Vote = {
  user: ObjectId,      // For audit trail
  election: ObjectId,
  candidate: ObjectId,
  position: String,
  status: 'valid'|'invalid'
}

Ballot = {
  election: ObjectId,  // Anonymous - no user link
  candidate: ObjectId,
  position: String,
  status: 'valid'|'void'|'spoiled'  // For manual adjustments
}
```

#### Results Publication
**Endpoint:** `PUT /api/elections/:id/publish-results`
**Access:** Admin/Super Admin only

```javascript
const publishResults = asyncHandler(async (req, res) => {
  // Set election.resultsPublished = true
  // Results become visible to public via:
  // GET /api/public/elections/:id/results
});
```

---

### 3.4 Audit Trails & Logging

**Location:** [backend/models/Log.js](backend/models/Log.js)

```javascript
const logSchema = new mongoose.Schema({
  user: ObjectId,          // WHO performed action
  action: 'login'|'logout'|'vote'|'create'|'update'|'delete',
  entityType: 'User'|'Election'|'Vote'|'Candidate'|...,
  entityId: String,        // WHAT they acted on
  details: String,         // Human-readable description
  status: 'success'|'failure',
  ipAddress: String,       // WHERE from
  userAgent: String,       // WHAT device
  errorMessage: String,
  createdAt: Date
});
```

**Logging Calls:**
- Login: [authController.js#L485-L492](backend/controllers/authController.js#L485-L492)
- Voting: [voteController.js#L86-L93](backend/controllers/voteController.js#L86-L93)
- Admin actions: [superAdminController.js](backend/controllers/superAdminController.js)

**Audit Log Access:**
- Super Admin: `GET /api/super-admin/reports/analytics` - All logs
- Observers: `GET /api/observer/elections/:id/audit-logs` - Election-specific logs

---

### 3.5 Email Notifications

**Location:** [backend/utils/sendEmail.js](backend/utils/sendEmail.js)
**Templates:** [backend/utils/emailTemplates.js](backend/utils/emailTemplates.js)

**Triggers:**
1. **Registration**: Verification email with token link
2. **Email Verification**: Success confirmation
3. **Password Reset**: Reset link (30-min expiry)
4. **Election Updates**: To candidates/observers
5. **Vote Confirmation**: To voters (optional)

**Email Configuration:**
```env
EMAIL_USER=wambogohassan63@gmail.com
EMAIL_PASS=xkeysib-... (SendGrid API key)
EMAIL_FROM=noreply@campusballot.tech
```

---

### 3.6 SMS Notifications

**Location:** [backend/utils/sendSms.js](backend/utils/sendSms.js)
**Provider:** Africa's Talking

**Triggers:**
- Welcome SMS on registration
- OTP for verification (if implemented)
- Election reminders

**Configuration:**
```env
AFRICASTALKING_API_KEY=atsk_82...
AFRICASTALKING_USERNAME=sandbox
```

---

## 4. DATA MODELS

### 4.1 Core Models

#### User Model
**File:** [backend/models/User.js](backend/models/User.js)

| Field | Type | Purpose |
|-------|------|---------|
| `name` | String | User name |
| `email` | String (unique) | Email address |
| `password` | String (hashed) | Bcrypt hashed password |
| `organization` | ObjectId | University/Federation |
| `role` | Enum | Primary role |
| `additionalRoles` | String[] | student + candidate/agent |
| `studentId` | String | Campus ID (students) |
| `faculty` | String | Student faculty |
| `course` | String | Student course |
| `department` | String | Employee/staff dept |
| `yearOfStudy` | String | 1st, 2nd, 3rd, 4th year |
| `gender` | Enum | Male/Female/Other |
| `phone` | String | Contact phone |
| `isVerified` | Boolean | Email verified |
| `verificationToken` | String | Email verification token |
| `verificationTokenExpiry` | Date | Token expiry (1 hour) |
| `resetPasswordToken` | String | Password reset token |
| `resetPasswordTokenExpiry` | Date | Token expiry (30 mins) |
| `currentSessionToken` | String | Current JWT (single-device) |
| `votingStatus` | Array | [{electionId, hasVoted}] |
| `accountStatus` | Enum | active/suspended/deactivated |
| `lastLogin` | Date | Last login timestamp |
| `lastSeen` | Date | Last activity |
| `profilePicture` | String | Profile photo URL |
| `candidateInfo` | Object | Candidate fields (if candidate) |
| `agentInfo` | Object | Agent fields (if agent) |
| `observerInfo` | Object | Observer fields (if observer) |

**Indexes:**
- `email` (unique)
- `studentId` (unique, sparse)
- `role`
- `faculty`
- `accountStatus`
- `isVerified`

---

#### Election Model
**File:** [backend/models/Election.js](backend/models/Election.js)

| Field | Type | Purpose |
|-------|------|---------|
| `title` | String (unique) | Election name |
| `description` | String | Detailed description |
| `organization` | ObjectId | Organization reference |
| `scope` | Enum | university/federation/custom |
| `allowedOrganizations` | ObjectId[] | Custom scope orgs |
| `startDate` | Date | Voting begins |
| `endDate` | Date | Voting ends |
| `status` | Enum | upcoming/ongoing/completed |
| `createdBy` | ObjectId | Admin who created |
| `positions` | String[] | Election positions |
| `candidates` | ObjectId[] | Candidate references |
| `resultsPublished` | Boolean | Public results |
| `updatedBy` | ObjectId | Last modifier |
| `allowedFaculties` | String[] | Restricted faculties |
| `eligibility` | Object | Eligibility rules |

**Indexes:**
- `title` (unique)
- `status`
- `startDate`
- `endDate`
- `createdBy`
- `scope`
- `eligibility.faculty`

---

#### Vote Model
**File:** [backend/models/Vote.js](backend/models/Vote.js)

| Field | Type | Purpose |
|-------|------|---------|
| `user` | ObjectId | Voter (audit trail) |
| `election` | ObjectId | Election voted in |
| `candidate` | ObjectId | Chosen candidate (optional) |
| `position` | String | Position voted for |
| `status` | Enum | valid/invalid |

**Unique Index:**
```javascript
{ user: 1, election: 1, position: 1 }  // One vote per user per election per position
```

---

#### Ballot Model
**File:** [backend/models/Ballot.js](backend/models/Ballot.js)

| Field | Type | Purpose |
|-------|------|---------|
| `election` | ObjectId | Election |
| `position` | String | Position voted for |
| `candidate` | ObjectId | Chosen candidate |
| `faculty` | String | Anonymous analytics |
| `department` | String | Anonymous analytics |
| `yearOfStudy` | String | Anonymous analytics |
| `gender` | String | Anonymous analytics |
| `status` | Enum | valid/void/spoiled |

**Note:** NO user field - anonymous vote record

---

#### Candidate Model
**File:** [backend/models/Candidate.js](backend/models/Candidate.js)

| Field | Type | Purpose |
|-------|------|---------|
| `user` | ObjectId | Candidate user |
| `election` | ObjectId | Election running for |
| `name` | String | Candidate name |
| `photo` | String | Photo URL |
| `position` | String | Position (President, VP, etc.) |
| `symbol` | String | Election symbol |
| `party` | String | Political party |
| `description` | String | Manifesto summary |
| `manifesto` | String | Full manifesto |
| `email` | String | Contact email |
| `phone` | String | Contact phone |
| `studentId` | String | Student ID |
| `department` | String | Department |
| `yearOfStudy` | String | Year of study |
| `bio` | String | Biography |
| `campaignPromises` | String[] | Campaign points |
| `qualifications` | String[] | Qualifications |
| `achievements` | String[] | Past achievements |
| `socialMedia` | Object | Media links |
| `votes` | Number | Vote count |
| `status` | Enum | pending/approved/rejected/disqualified |

---

#### Log Model
**File:** [backend/models/Log.js](backend/models/Log.js)

| Field | Type | Purpose |
|-------|------|---------|
| `user` | ObjectId | WHO performed action |
| `action` | Enum | Action type |
| `entityType` | Enum | Entity affected |
| `entityId` | String | Entity's ID |
| `details` | String | Description |
| `status` | Enum | success/failure |
| `ipAddress` | String | Source IP |
| `userAgent` | String | Browser/Device |
| `errorMessage` | String | Error if failed |

**Indexes:**
- `user`
- `action`
- `entityType`
- `status`
- `createdAt` (for audit trails)

---

### 4.2 Supporting Models

#### Organization Model
**Purpose:** Universities and Federations
**File:** [backend/models/Organization.js](backend/models/Organization.js)

```javascript
{
  name: String,
  code: String,
  type: 'university'|'federation',
  parent: ObjectId,  // Parent federation for universities
  logo: String,
  status: 'active'|'inactive'
}
```

---

#### Notification Model
**File:** [backend/models/Notification.js](backend/models/Notification.js)

```javascript
{
  user: ObjectId,
  type: 'election'|'vote'|'candidate'|'admin',
  title: String,
  message: String,
  read: Boolean,
  actionUrl: String,
  createdAt: Date
}
```

---

## 5. RECOMMENDATIONS & BEST PRACTICES

### 5.1 Immediate Actions (Critical)

1. **🔴 Remove .env from Git**
   ```bash
   git rm --cached backend/.env
   echo "backend/.env" >> .gitignore
   git commit -m "Remove sensitive env file"
   ```

2. **🔴 Rotate ALL Credentials**
   - MongoDB password
   - JWT_SECRET
   - Email API key
   - Africa's Talking API key
   - Cloudinary API secret
   - Datadog API key

3. **🔴 Deploy environment secrets**
   - Use Render.com environment variables
   - Or GitHub Secrets for CI/CD
   - Or HashiCorp Vault

### 5.2 Short-term (1-2 weeks)

4. **Enhance Password Policy**
   - Minimum 12 characters
   - Require uppercase, lowercase, number, special char
   - Implement in validation rules

5. **Add Rate Limiting**
   - Registration: 5 per hour per IP
   - Login: 5 per 15 minutes per IP
   - Password reset: 3 per hour per email

6. **Protect Dashboard Stats**
   - `GET /api/admin/dashboard-stats` should require `protect, adminOnly`

7. **Input Validation**
   - Add comprehensive input validation for all endpoints
   - Use libraries like `joi`, `yup`, or `express-validator`

### 5.3 Medium-term (1-2 months)

8. **Enhance Vote Anonymity**
   - Remove or hash demographic data from published ballots
   - Keep aggregate statistics only

9. **CSRF Protection**
   - Implement CSRF tokens
   - Use `cors` with proper origin validation

10. **SQL Injection / NoSQL Injection**
    - Currently using Mongoose (good)
    - Add explicit input sanitization
    - Implement parameterized queries

11. **Add 2FA/MFA**
    - Email OTP for sensitive operations
    - TOTP for admin accounts

### 5.4 Logging & Monitoring

12. **Audit Trail Completeness**
    - Log all admin actions
    - Log election state changes
    - Log result publication

13. **Monitoring & Alerting**
    - Monitor failed login attempts
    - Alert on unusual voting patterns
    - Monitor admin activities

---

## 6. COMPLIANCE & GOVERNANCE

### 6.1 Data Protection
- **Personal Data:** Names, IDs, emails, phone numbers
- **Recommendation:** GDPR compliance if EU users
- **Retention:** Clear data retention policies

### 6.2 Election Integrity
- **Vote Anonymity:** Properly implemented with Vote/Ballot separation
- **Double Voting:** Prevented with unique index
- **Audit Trail:** Comprehensive logging enabled

### 6.3 Segregation of Duties
- Students cannot approve candidates
- Only admins can publish results
- Only super admin can create admins

---

## 7. SUMMARY TABLE

| Category | Status | Issue Count | Severity |
|----------|--------|-------------|----------|
| **Authentication** | ⚠️ | 3 | CRITICAL |
| **Authorization** | ✅ | 3 | MEDIUM |
| **Input Validation** | ⚠️ | 2 | HIGH |
| **Rate Limiting** | ⚠️ | 2 | MEDIUM |
| **Vote Anonymity** | ⚠️ | 1 | MEDIUM |
| **Error Handling** | ✅ | 1 | LOW |
| **Logging & Audit** | ✅ | 0 | — |
| **Encryption** | ✅ | 0 | — |

---

## FILES REFERENCED

**Key Controllers:**
- [authController.js](backend/controllers/authController.js)
- [voteController.js](backend/controllers/voteController.js)
- [electionController.js](backend/controllers/electionController.js)
- [candidateController.js](backend/controllers/candidateController.js)
- [observerController.js](backend/controllers/observerController.js)
- [superAdminController.js](backend/controllers/superAdminController.js)

**Key Middleware:**
- [authMiddleware.js](backend/middleware/authMiddleware.js)
- [rateLimiter.js](backend/middleware/rateLimiter.js)

**Key Models:**
- [User.js](backend/models/User.js)
- [Election.js](backend/models/Election.js)
- [Vote.js](backend/models/Vote.js)
- [Ballot.js](backend/models/Ballot.js)
- [Candidate.js](backend/models/Candidate.js)
- [Log.js](backend/models/Log.js)

**Routes:**
- [authRoutes.js](backend/routes/authRoutes.js)
- [voteRoutes.js](backend/routes/voteRoutes.js)
- [electionRoutes.js](backend/routes/electionRoutes.js)
- [candidateRoutes.js](backend/routes/candidateRoutes.js)
- [observerRoutes.js](backend/routes/observerRoutes.js)
- [superAdminRoutes.js](backend/routes/superAdminRoutes.js)
- [adminRoutes.js](backend/routes/adminRoutes.js)
- [publicRoutes.js](backend/routes/publicRoutes.js)

**Server:**
- [server.js](backend/server.js)

---

## APPENDIX A: API ENDPOINTS CHECKLIST

**Protected Endpoints:** ✅ = Has auth check, ❌ = No auth check

| Endpoint | Method | Protected | Role Restricted |
|----------|--------|-----------|-----------------|
| `/api/auth/register` | POST | ❌ | ❌ |
| `/api/auth/login` | POST | ❌ | ❌ |
| `/api/auth/logout` | POST | ✅ | ❌ |
| `/api/auth/profile` | GET | ✅ | ❌ |
| `/api/elections` | GET | ✅ | ❌ |
| `/api/elections` | POST | ✅ | ✅ (admin) |
| `/api/votes` | POST | ✅ | ❌ (+rate limit) |
| `/api/votes` | GET | ✅ | ✅ (admin) |
| `/api/candidates` | POST | ✅ | ✅ (admin) |
| `/api/candidates` | GET | ✅ | ❌ |
| `/api/admin/dashboard-stats` | GET | ❌ | ❌ | ⚠️ VULNERABLE |
| `/api/public/candidates` | GET | ❌ | ❌ |
| `/api/public/elections` | GET | ❌ | ❌ |
| `/api/observer/dashboard` | GET | ✅ | ✅ (observer) |
| `/api/super-admin/admins` | GET | ✅ | ✅ (super_admin) |

---

**End of Security Analysis Report**

*For questions or clarifications, refer to specific file locations linked throughout this document.*
