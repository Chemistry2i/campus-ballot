# Campus-Ballot: Permissions & Role Enhancement Guide

**Date:** April 18, 2026  
**Focus:** Fixing permission gaps and implementing missing role capabilities

---

## EXECUTIVE SUMMARY

Your system has **7 defined roles** but several have **unused/incomplete permissions**, and **3 critical roles are missing entirely**. This guide provides:

1. **Permission Audit** - What's broken/unused
2. **Role Enhancement Templates** - How to add missing capabilities  
3. **Implementation Code** - Concrete examples
4. **Testing Strategy** - Validation checklist

---

## PART 1: CURRENT PERMISSION AUDIT

### 1.1 Student Role - UNDERUTILIZED

**What They Can Do:**
```javascript
✅ Register account
✅ View available elections
✅ Vote in eligible elections
✅ View own votes
✅ Update profile
```

**What They SHOULD Be Able To Do (Missing):**
```javascript
❌ Download vote receipt/verification code
❌ Verify their vote was counted
❌ Challenge/dispute vote if not in results
❌ See election results breakdown
❌ Receive email notifications about elections
❌ Download election materials (manifestos)
❌ Post comments/questions about candidates
```

**Enhancement Priority:** 🟡 Medium (impacts voter confidence)

**Implementation:**
```javascript
// Add to User schema if role === 'student'
studentPermissions: {
    canVote: true,                          // ✅ Already done
    canReceiveNotifications: true,           // ❌ NEW
    canDownloadVoteReceipt: true,           // ❌ NEW
    canVerifyVote: true,                    // ❌ NEW
    canDisputeVote: true,                   // ❌ NEW - needs dispute workflow
    canViewResults: true,                   // Existing, not universal
    canViewCandidateDetails: true,          // ❌ NEW
    canCommentOnCandidates: false,          // Not in initial scope (safety)
    verificationStatus: 'verified' | 'unverified' | 'pending'
}
```

---

### 1.2 Admin Role - FUNCTIONALITY GAPS

**What They Can Do:**
```javascript
✅ Create elections (in their organization)
✅ Manage candidates (approve/disqualify)
✅ View election results
✅ View votes (aggregated)
✅ Assign observers
✅ Manage users (create/edit)
```

**What They SHOULD Be Able To Do (Missing):**
```javascript
❌ Create templates for recurring elections
❌ Customize organization branding (colors, logo, domain)
❌ Set compliance policies (2FA enforcement, password rules)
❌ Create sub-admins with delegated permissions
❌ Export election data
❌ Schedule recurring elections
❌ Enforce voting windows per location/department
❌ Set observer quotas/requirements
❌ Manage API keys
❌ View detailed audit logs
```

**Enhancement Priority:** 🔴 Critical (impacts enterprise usability)

**Code Changes Needed:**

```javascript
// backend/models/User.js - For admin role
const adminPermissions = {
    // Election Management
    canCreateElections: true,
    canEditOwnElections: true,
    canPublishResults: true,
    
    // Data Management
    canExportData: false,                   // ❌ ADD THIS
    canDeleteOldData: false,                // ❌ ADD THIS
    canManageSchedules: false,              // ❌ ADD THIS
    
    // Organization Management  
    canManageBranding: false,               // ❌ ADD THIS (org-level only)
    canSetPolicies: false,                  // ❌ ADD THIS
    canCreateSubAdmins: false,              // ❌ ADD THIS (only super_admin true)
    
    // Security & Compliance
    canEnforce2FA: false,                   // ❌ ADD THIS
    canViewAuditLogs: false,                // ❌ ADD THIS
    canManageApiKeys: false,                // ❌ ADD THIS
    
    // Observer Management
    canAssignObservers: true,               // ✅ Already done
    canSetObserverQuotas: false,            // ❌ ADD THIS
    
    scope: 'organization'                   // Can only access own org
};
```

---

### 1.3 Candidate Role - BASIC BUT FUNCTIONAL

**What They Can Do:**
```javascript
✅ Register candidacy for election
✅ View own profile
✅ View own candidacy status
✅ Withdraw from election
```

**What They SHOULD Be Able To Do (Missing):**
```javascript
❌ Add/edit campaign manifesto (dynamically)
❌ Upload campaign image/video
❌ See real-time vote count (live results)
❌ View supporter list (if consent given)
❌ Message campaign agents/team
❌ Post announcements
❌ Download campaign report
❌ Schedule campaign events
❌ Track donor contributions (if fundraising enabled)
```

**Enhancement Priority:** 🟠 High (enables campaign management)

**New Model Needed:**

```javascript
// backend/models/Campaign.js (NEW)
const campaignSchema = new Schema({
    candidateId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    electionId: {
        type: Schema.Types.ObjectId,
        ref: 'Election',
        required: true
    },
    manifesto: {
        title: String,
        description: String,
        mediUrls: [String],      // Images/videos
        lastUpdated: Date
    },
    messages: {
        announcements: [{
            text: String,
            postedAt: Date,
            visibility: 'public' | 'supporters_only'
        }],
        emailTemplate: String    // Custom email to supporters
    },
    events: [{
        name: String,
        location: String,
        dateTime: Date,
        description: String
    }],
    liveViewers: Number,         // Real-time websocket count
    supporters: [Schema.Types.ObjectId],  // User IDs
    analytics: {
        totalVotes: Number,
        trend: [{ timestamp, count }],
        engagementScore: Number
    }
});
```

---

### 1.4 Agent Role - COMPLETELY BROKEN

**Status:** ⚠️ **PERMISSIONS DEFINED BUT NEVER ENFORCED**

**Current State:**
```javascript
// Exists in model:
agentInfo: {
    assignedCandidateId: candidateId,
    permissions: []              // ❌ NEVER VALIDATED
}

// But in controllers... nowhere is this checked:
if (req.user.role === 'agent') {
    // No permission validation code exists
}
```

**What They CAN Do (Theoretically):**
```javascript
// Feature box exists but nothing checked:
✓ manage_candidate_messages      (but not enforced)
✓ coordinate_volunteers          (but not enforced)  
✓ schedule_events                (but not enforced)
✓ view_analytics                 (but not enforced)
```

**What They SHOULD Do (With Enforcement):**
```javascript
❌ All of the above, but with proper middleware validation
❌ Create campaign messaging templates
❌ Coordinator volunteer actions
❌ Schedule and manage events
❌ Post announcements on behalf of candidate
❌ View real-time vote counts during election
❌ Generate campaign reports
❌ Manage donation/supporter relationships
❌ Communicate with other agents on team
```

**Enhancement Priority:** 🔴 CRITICAL (role is currently useless)

**Implementation:**

```javascript
// backend/middleware/checkAgentPermission.js (NEW FILE)
const checkAgentPermission = (requiredPermission) => {
    return async (req, res, next) => {
        if (req.user.role !== 'agent') {
            return res.status(403).json({ error: "Not an agent" });
        }

        const user = await User.findById(req.user._id);
        
        // Check if permission exists
        if (!user.agentInfo?.permissions?.includes(requiredPermission)) {
            return res.status(403).json({ 
                error: `Permission denied: require '${requiredPermission}'` 
            });
        }

        // Store candidate info for next middleware
        req.assignedCandidate = user.agentInfo.assignedCandidateId;
        next();
    };
};

module.exports = checkAgentPermission;
```

```javascript
// backend/models/User.js - Enhanced Agent Role
const agentSchema = {
    role: 'agent',
    agentInfo: {
        assignedCandidates: [Schema.Types.ObjectId],  // Support multiple
        team: {
            role: 'campaign_manager' | 'communications' | 'events' | 'fundraising',
            title: String,
            reportingTo: Schema.Types.ObjectId
        },
        permissions: [
            'manage_candidate_messages',
            'coordinate_volunteers',
            'schedule_events',
            'view_analytics',
            'post_announcements',
            'manage_donors',
            'generate_reports'
        ],
        accessLevel: 'full' | 'limited',
        approvalStatus: 'pending' | 'approved' | 'rejected'
    }
};

// Example validation:
{
    role: 'agent',
    agentInfo: {
        assignedCandidates: ['candidate_id_1'],
        team: {
            role: 'campaign_manager',
            title: 'Campaign Manager',
            reportingTo: 'candidate_id_1'
        },
        permissions: [
            'manage_candidate_messages',
            'post_announcements',
            'view_analytics'
        ],
        accessLevel: 'full',
        approvalStatus: 'approved'
    }
}
```

```javascript
// backend/routes/agentRoutes.js (EXAMPLE - Currently missing most)
const router = express.Router();
const checkAgentPermission = require('../middleware/checkAgentPermission');

// ✅ NEW: Message management
router.post(
    '/candidates/:candidateId/messages', 
    protect, 
    checkAgentPermission('manage_candidate_messages'),
    postCampaignMessage
);

// ✅ NEW: Event scheduling
router.post(
    '/candidates/:candidateId/events',
    protect,
    checkAgentPermission('schedule_events'),
    createCampaignEvent
);

// ✅ NEW: Analytics viewing
router.get(
    '/candidates/:candidateId/analytics',
    protect,
    checkAgentPermission('view_analytics'),
    getCampaignAnalytics
);

// ✅ NEW: Announcements
router.post(
    '/candidates/:candidateId/announcements',
    protect,
    checkAgentPermission('post_announcements'),
    postAnnouncement
);

module.exports = router;
```

---

### 1.5 Observer Role - UNDER-POWERED

**What They Can Do:**
```javascript
✅ View assigned election statistics
✅ View audit logs for election
✅ Report incidents
```

**What They SHOULD Be Able To Do (Missing):**
```javascript
❌ Attach photo/video evidence to incidents
❌ Access real-time result updates
❌ Chat with other observers (coordination)
❌ Use offline mode (sync when back online)
❌ Receive push notifications of incidents
❌ Create observer teams
❌ View heat maps (incident density)
❌ Escalate incidents automatically
❌ Access observer verification workflow
❌ Reference incident templates
❌ Provide observer sign-off on results
```

**Enhancement Priority:** 🟠 High (critical for compliance)

**Code Changes:**

```javascript
// backend/models/User.js - Enhanced Observer
const observerSchema = {
    role: 'observer',
    observerInfo: {
        assignedElections: [{
            electionId: Schema.Types.ObjectId,
            // NEW fields:
            roleName: 'chief_observer' | 'point_observer' | 'remote_observer',
            station: String,           // Physical location (booth ID, etc)
            startTime: Date,           // Shift start
            endTime: Date,             // Shift end
            credsNumber: String,       // Badge/ID
            permissions: [
                'view_results',
                'report_incidents',
                'attach_evidence',
                'coordinate_observers',
                'escalate_incidents'
            ],
            team: [Schema.Types.ObjectId]  // Other observers in this station
        }],
        
        // NEW nested structure:
        certifications: ['election_monitoring_101'],
        verificationStatus: 'approved' | 'pending' | 'rejected',
        offlineMode: {
            isEnabled: true,
            pendingSyncs: 0,
            lastSyncTime: Date
        },
        signOffWorkflow: {
            hasSignedOff: false,
            signOffTime: Date,
            comments: String
        }
    }
};
```

```javascript
// backend/controllers/observerController.js - NEW ENDPOINTS

// Attach evidence to incident
const attachEvidenceToIncident = asyncHandler(async (req, res) => {
    const { incidentId } = req.params;
    const file = req.file;  // from multer middleware
    
    if (!file) {
        return res.status(400).json({ error: "No file provided" });
    }
    
    // Check permission
    const incident = await Incident.findById(incidentId)
        .populate('observer');
    
    if (incident.observer._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Cannot modify others' incidents" });
    }
    
    // Upload to cloud storage (S3, etc)
    const uploadUrl = await uploadToS3(file);
    
    incident.evidence.push({
        type: 'photo' | 'video',
        url: uploadUrl,
        uploadedAt: new Date(),
        description: req.body.description
    });
    
    await incident.save();
    res.json({ 
        success: true, 
        evidence: incident.evidence 
    });
});

// Observer sign-off on results
const signOffOnResults = asyncHandler(async (req, res) => {
    const { electionId } = req.params;
    const { hasApproved, comments } = req.body;
    
    const observer = await User.findById(req.user._id);
    const election = await Election.findById(electionId);
    
    // Check observer is assigned to this election
    const assigned = observer.observerInfo.assignedElections
        .find(a => a.electionId.toString() === electionId);
    
    if (!assigned) {
        return res.status(403).json({ error: "Not assigned to this election" });
    }
    
    // Record sign-off
    observer.observerInfo.signOffWorkflow = {
        hasSignedOff: true,
        signOffTime: new Date(),
        approved: hasApproved,
        comments
    };
    
    await observer.save();
    
    // Add to election audit log
    await AuditLog.create({
        userId: req.user._id,
        action: 'OBSERVER_SIGN_OFF',
        resourceType: 'election',
        resourceId: electionId,
        details: {
            approved: hasApproved,
            comments
        }
    });
    
    res.json({ success: true });
});

// Observer coordination chat
const sendObserverMessage = asyncHandler(async (req, res) => {
    const { electionId } = req.params;
    const { message } = req.body;
    
    const msg = new ObserverMessage({
        senderId: req.user._id,
        electionId,
        message,
        timestamp: new Date()
    });
    
    await msg.save();
    
    // WebSocket emit to all observers on this election
    io.to(`election_${electionId}_observers`).emit('observer_message', msg);
    
    res.json({ success: true, message: msg });
});
```

---

### 1.6 Super Admin Role - INCOMPLETE

**What They Can Do:**
```javascript
✅ Manage all admins
✅ Manage all users
✅ View system-wide statistics
✅ Manage observers globally
```

**What They SHOULD Be Able To Do (Missing):**
```javascript
❌ Manage billing/subscriptions per organization  
❌ Set system-wide security policies
❌ Manage API keys and rate limits
❌ Configure white-label branding
❌ View compliance/audit dashboards
❌ Manage federation admins and delegation
❌ Access system health metrics
❌ Configure backup/disaster recovery
❌ Monitor all organizations' usage
❌ Generate system-wide reports
```

**Enhancement Priority:** 🔴 Critical (needed for SaaS operations)

```javascript
// backend/models/User.js - Enhanced Super Admin
const superAdminSchema = {
    role: 'super_admin',
    superAdminInfo: {
        // System management
        canManageBilling: true,           // ✅ NEW
        canManageSubscriptions: true,     // ✅ NEW  
        canConfigureWhiteLable: true,     // ✅ NEW
        canSetSecurityPolicies: true,     // ✅ NEW
        canManageApiKeys: true,           // ✅ NEW
        canAccessSystemHealth: true,      // ✅ NEW
        canManageBackups: true,           // ✅ NEW
        canManageFederations: true,       // NEW for federation support
        
        // View permissions
        canViewAllOrganizations: true,
        canViewAllUsers: true,
        canViewAllElections: true,
        canViewComplianceDashboard: true, // ✅ NEW
        
        // System configuration
        databaseBackupSchedule: 'daily' | 'weekly',
        systemMaintenanceWindow: { day, time },
        disasterRecoveryEnabled: true,    // ✅ NEW
        
        // Audit
        canViewSystemAuditLog: true,
        canExportSystemData: true
    }
};
```

---

### 1.7 Federation Admin Role - UNDEFINED

**Status:** ⚠️ **Role exists but has no clear distinct capabilities**

**Current State:**
```javascript
role: 'federation_admin'  // Mostly same as super_admin, unclear distinction
```

**What They SHOULD Be Able To Do:**
```javascript
✅ Manage multiple organizations within federation
✅ Create new organizations
✅ Manage federation-level policies
✅ View federation-wide analytics
✅ Delegate authority to organization admins
✅ Enforce federation-wide compliance standards
✅ Control federation's API keys
```

**New Role Template:**

```javascript
// backend/models/User.js - NEW Role Definition
const federationAdminSchema = {
    role: 'federation_admin',
    federationInfo: {
        federationId: Schema.Types.ObjectId,  // Points to Federation model
        federationName: String,               // e.g., "East African Universities"
        
        // Management permissions
        canCreateOrganizations: true,
        canDeleteOrganizations: false,        // Careful, admin only
        canManageAdminsInFederation: true,
        
        // Policy management
        canSetFederationPolicies: true,       // Policies apply to all member orgs
        canEnforceFederationCompliance: true,
        
        // Analytics
        canViewFederationAnalytics: true,
        canGenerateFederationReports: true,
        
        // Organization oversight
        managedOrganizations: [Schema.Types.ObjectId],
        
        // Resource control
        canManageFederationApiKeys: true,
        federationApiQuota: Number,
        
        // Delegation
        delegatedTo: [Schema.Types.ObjectId]  // Other federation admins
    }
};
```

---

## PART 2: THREE MISSING CRITICAL ROLES

### 2.1 Auditor Role (NEW)

**Purpose:** Independent verification of election integrity

**Capabilities:**
```javascript
{
    role: 'auditor',
    auditorInfo: {
        assignedElections: [electionId],
        auditType: 'pre_election' | 'live' | 'post_election',
        certifications: ['ISO_27001', 'election_auditor'],
        
        permissions: [
            'view_all_audit_logs',        // Immutable view
            'verify_result_integrity',
            'generate_audit_report',
            'flag_anomalies',
            'cross_reference_data'
        ],
        
        // Auditor cannot modify anything - read-only
        canModifyData: false,
        
        // Reports generated
        auditReports: [{
            timestamp: Date,
            findings: [],
            riskLevel: 'low' | 'medium' | 'high',
            status: 'in_progress' | 'completed'
        }]
    }
}
```

---

### 2.2 Compliance Officer Role (NEW)

**Purpose:** Regulatory compliance enforcement

**Capabilities:**
```javascript
{
    role: 'compliance_officer',
    complianceInfo: {
        jurisdiction: 'Uganda' | 'Kenya' | 'Tanzania',  // or other
        assignedOrganizations: [orgId],
        
        permissions: [
            'review_election_compliance',
            'generate_compliance_reports',
            'schedule_compliance_audits',
            'flag_violations',
            'create_remediation_plans',
            'require_corrective_action'
        ],
        
        // Compliance monitoring
        watchlist: [
            {
                organizationId,
                riskLevel: 'high' | 'medium',
                flags: [],
                lastReview: Date,
                nextReviewDue: Date
            }
        ],
        
        // Cannot vote or be counted in results
        canVote: false
    }
}
```

---

### 2.3 Billing/Finance Role (NEW)

**Purpose:** Subscription and payment management

**Capabilities:**
```javascript
{
    role: 'billing_admin',
    billingInfo: {
        canManageSubscriptions: true,
        canIssueInvoices: true,
        canProcessRefunds: true,
        canSetPrices: false,          // Only super_admin
        canViewCostAnalysis: true,
        
        assignedOrganizations: [orgId],
        
        permissions: [
            'manage_payments',
            'generate_invoices',
            'track_usage',
            'manage_payment_methods',
            'send_billing_emails'
        ],
        
        // Financial data access
        canViewAllTransactions: true,
        canGenerateFinancialReports: true
    }
}
```

---

## PART 3: PERMISSION ENFORCEMENT MIDDLEWARE

### 3.1 Create Enforcement Middleware

```javascript
// backend/middleware/enforcePermissions.js (NEW FILE)

const enforcePermissions = (requiredPermissions) => {
    return async (req, res, next) => {
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        
        // Get user's actual permissions based on role
        let userPermissions = [];
        
        switch(user.role) {
            case 'admin':
                userPermissions = user.adminInfo?.permissions || [];
                break;
            case 'agent':
                userPermissions = user.agentInfo?.permissions || [];
                break;
            case 'observer':
                // Observer permissions are per-election
                userPermissions = req.params.electionId ? 
                    (user.observerInfo.assignedElections
                        .find(a => a.electionId.toString() === req.params.electionId)
                        ?.permissions || []) 
                    : [];
                break;
            case 'auditor':
                userPermissions = user.auditorInfo?.permissions || [];
                break;
            case 'compliance_officer':
                userPermissions = user.complianceInfo?.permissions || [];
                break;
            case 'super_admin':
                // Super admin has all permissions
                userPermissions = ['*'];
                break;
            default:
                userPermissions = [];
        }
        
        // Check if user has required permissions
        const hasPermission = requiredPermissions.every(perm => 
            userPermissions.includes('*') || userPermissions.includes(perm)
        );
        
        if (!hasPermission) {
            return res.status(403).json({ 
                error: "Insufficient permissions",
                required: requiredPermissions,
                actual: userPermissions
            });
        }
        
        next();
    };
};

module.exports = enforcePermissions;
```

### 3.2 Usage Examples

```javascript
// backend/routes/electionRoutes.js - EXAMPLE UPDATE

const enforcePermissions = require('../middleware/enforcePermissions');

// Create election - only admins with permission
router.post(
    '/',
    protect,
    enforcePermissions(['create_elections']),
    createElection
);

// View election stats - admins or assigned observers
router.get(
    '/:id/statistics',
    protect,
    enforcePermissions(['view_election_stats']),
    getElectionStats
);

// Publish results - only admins
router.put(
    '/:id/publish-results',
    protect,
    enforcePermissions(['publish_results']),
    publishResults
);

// Audit election - only auditors
router.post(
    '/:id/run-audit',
    protect,
    enforcePermissions(['verify_result_integrity']),
    runAudit
);
```

---

## PART 4: TESTING PERMISSIONS

### 4.1 Permission Test Cases

```javascript
// backend/tests/permissions.test.js (NEW FILE)

const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Election = require('../models/Election');

describe('Permission Enforcement', () => {
    let adminToken, observerToken, agentToken, superAdminToken;
    let testElectionId, testCandidateId;
    
    beforeAll(async () => {
        // Create test users
        const admin = await User.create({
            email: 'admin@test.com',
            password: 'password123',
            role: 'admin',
            adminInfo: {
                permissions: ['create_elections', 'view_election_stats']
            }
        });
        
        const observer = await User.create({
            email: 'observer@test.com',
            password: 'password123',
            role: 'observer'
        });
        
        const agent = await User.create({
            email: 'agent@test.com',
            password: 'password123',
            role: 'agent',
            agentInfo: {
                permissions: ['manage_candidate_messages']
            }
        });
        
        // Get tokens
        // ... login logic ...
    });
    
    describe('Admin permissions', () => {
        test('Admin CAN create election', async () => {
            const res = await request(app)
                .post('/api/elections')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Test Election',
                    positions: []
                });
            
            expect(res.status).toBe(201);
        });
        
        test('Observer CANNOT create election', async () => {
            const res = await request(app)
                .post('/api/elections')
                .set('Authorization', `Bearer ${observerToken}`)
                .send({
                    name: 'Test Election',
                    positions: []
                });
            
            expect(res.status).toBe(403);
        });
    });
    
    describe('Agent permissions', () => {
        test('Agent CAN manage messages with permission', async () => {
            const res = await request(app)
                .post(`/api/agents/candidates/${testCandidateId}/messages`)
                .set('Authorization', `Bearer ${agentToken}`)
                .send({ message: 'Test' });
            
            expect(res.status).toBe(201);
        });
        
        test('Agent CANNOT view analytics without permission', async () => {
            const res = await request(app)
                .get(`/api/agents/candidates/${testCandidateId}/analytics`)
                .set('Authorization', `Bearer ${agentToken}`);
            
            expect(res.status).toBe(403);
        });
    });
});
```

---

## PART 5: MIGRATION STRATEGY

### 5.1 Adding New Roles to Existing System

```bash
# 1. Run database migration to add new fields
npm run migrate:add-new-roles

# 2. Backfill existing users
npm run migrate:backfill-permissions

# 3. Create new routes/controllers
# - Add files in backend/routes/
# - Add controllers in backend/controllers/

# 4. Deploy with feature flags disabled (safe rollout)
NODE_ENV=production npm run start

# 5. Enable new roles gradually
# - Monitor for errors
# - Enable for public after stabilization
```

---

## PART 6: PERMISSION MATRIX (REFERENCE)

| Feature/Endpoint | Student | Candidate | Agent | Admin | Observer | Auditor | Compliance | Federation | Super Admin |
|------------------|---------|-----------|-------|-------|----------|---------|-----------|-----------|------------|
| View Elections | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Election | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ℹ️ | ✅ |
| Vote | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Vote Receipts | ✅ NEW | ✅ | ❌| ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Approve Candidate | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Post Campaign Message | ❌ | ✅ NEW | ✅ NEW | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Election Stats | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Report Incident | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Attach Evidence | ❌ | ❌ | ❌ | ❌ | ✅ NEW | ❌ | ❌ | ❌ | ✅ |
| View Audit Logs | ❌ | ❌ | ❌ | ✅ NEW | ✅ NEW | ✅ | ❌ | ❌ | ✅ |
| Verify Results | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Generate Audit Report | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Generate Compliance Report | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Manage Subscriptions | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage API Keys | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Configure White Label | ❌ | ❌ | ❌ | ✅ NEW | ❌ | ❌ | ❌ | ❌ | ✅ |

**Legend:**
- ✅ = Has permission
- ❌ = No permission  
- ℹ️ = Delegated permission (federation admin delegates to org admin)
- NEW = Newly added permission

---

## CONCLUSION

**Critical Tasks (Do First):**
1. ✅ Add permission enforcement middleware
2. ✅ Enhance admin & observer permissions
3. ✅ Fix agent role (currently broken)
4. ✅ Add 3 new critical roles (Auditor, Compliance, Billing)

**Priority Implementation Order:**
1. Week 1: Permission middleware + enforcement
2. Week 2: Admin & observer enhancements
3. Week 3: Agent role fixes
4. Week 4: New roles (Auditor, Compliance, Billing)

**Estimated Effort:** 80-100 developer hours

