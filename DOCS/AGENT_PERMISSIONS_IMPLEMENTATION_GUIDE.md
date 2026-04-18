# Agent Permission Enforcement - Implementation Guide

## Overview
This guide completes the Agent Permission Enforcement system for Campus Ballot, a critical security feature that validates agent permissions before allowing campaign operations.

**Status:** 75% Complete
- ✅ Backend: Fully implemented and ready
- ✅ Database: Migrations ready
- ✅ Frontend: Components created
- ⏳ Integration: Needs final wiring
- ⏳ Testing: Need to run test suite

---

## What Was Implemented

### 1. Backend Permission Middleware (`/backend/middleware/checkAgentPermission.js`)
**Purpose:** Validates agent permissions before endpoint execution

**How it works:**
```javascript
// Middleware chain in routes:
router.post(
    '/api/agents/campaign/messages',
    protect,  // Verify JWT token
    checkAgentPermission(['postUpdates']),  // Check specific permission
    postCampaignMessage
);
```

**Validates:**
- User has `agent` role
- Agent info exists
- Agent approval status is `approved`
- Required permissions array includes specified permission
- Returns detailed 403 error if fails

---

### 2. Data Models

#### CampaignMessage Model (`/backend/models/CampaignMessage.js`)
- **Purpose:** Store campaign announcements/updates
- **Immutable fields:** `postedAt`, `candidateId`, `electionId`, `agentId`
- **Features:**
  - Engagement tracking (likes, shares, replies)
  - Status lifecycle (published, scheduled, draft, archived)
  - Message type classification
  - Visibility controls (public, followers_only, private)

#### CampaignEvent Model (`/backend/models/CampaignEvent.js`)
- **Purpose:** Store scheduled campaign events
- **Features:**
  - Event lifecycle (scheduled → ongoing → completed)
  - Attendance tracking with check-in
  - Location coordinates + address
  - Streaming support (YouTube, Facebook, Twitch)
  - Budget tracking
  - Virtual fields: durationMinutes, attendanceRate

---

### 3. Controller Functions (`/backend/controllers/agentController.js`)

#### postCampaignMessage()
```javascript
POST /api/agents/campaign/messages
Required Permission: postUpdates
Body: {
    candidateId: ObjectId,
    text: string,
    messageType: 'announcement' | 'update' | 'question_response' | 'event_info',
    visibility: 'public' | 'followers_only' | 'private',
    status: 'published' | 'scheduled' | 'draft',
    scheduledFor: Date (if status === 'scheduled')
}
```

#### scheduleCampaignEvent()
```javascript
POST /api/agents/campaign/events
Required Permission: manageTasks
Body: {
    candidateId: ObjectId,
    name: string,
    eventType: 'rally' | 'town_hall' | 'press_conference' | 'debate' | 'meet_and_greet',
    startDateTime: Date,
    endDateTime: Date,
    location: { venue, city, latitude, longitude, addressString },
    isStreamed: boolean,
    streaming: { provider, streamUrl },
    budget: { estimated, currency }
}
```

#### getAgentAnalytics()
```javascript
GET /api/agents/campaign/analytics?timeRange=all|7days|30days|90days
Required Permission: viewStatistics
Returns: {
    messagesPosted: number,
    eventsScheduled: number,
    totalEngagement: number,
    reach: number,
    engagementTrend: Array,
    messageDistribution: Array,
    topMessages: Array,
    upcomingEvents: Array
}
```

---

### 4. Database Migrations

#### Running Migrations
```bash
# Create migrations directory if missing
mkdir -p backend/migrations

# Run all pending migrations
npm run migrate up

# Rollback last migration
npm run migrate down

# Check migration status
npm run migrate status
```

**Migrations created:**
1. `001_create_campaign_message_collection.js` - Creates collection with indexes
2. `002_create_campaign_event_collection.js` - Creates collection with indexes

**Indexes:**
- Candidate messages by date
- Agent messages by date
- Election messages by status
- Upcoming events (partial index)
- TTL indexes for cleanup

---

### 5. Frontend Components

#### CampaignMessage Component
```jsx
<CampaignMessage 
    candidateId={candidateId}
    agentPermissions={['postUpdates']}
/>
```
**Features:**
- Message posting form
- Scheduling support
- Draft saving
- Drag & drop for media
- Character counter

#### ScheduleCampaignEvent Component
```jsx
<ScheduleCampaignEvent
    candidateId={candidateId}
    agentPermissions={['manageTasks']}
/>
```
**Features:**
- Event scheduling form
- Date/time picker
- Location with coordinates
- Streaming setup
- Budget tracking

#### CampaignAnalytics Component
```jsx
<CampaignAnalytics
    agentPermissions={['viewStatistics']}
/>
```
**Features:**
- Overview stats cards
- Engagement trend chart
- Message distribution pie chart
- Performance metrics table
- Export to PDF

---

## Next Steps - Complete Implementation

### Step 1: Setup Database (5 minutes)
```bash
cd backend

# Create migrations directory
mkdir -p migrations

# Run migrations
npm run migrate up

# Verify collections created
mongosh
> use campus-ballot
> db.campaign_messages.find().count()
> db.campaign_events.find().count()
```

### Step 2: Install Frontend Dependencies (2 minutes)
```bash
cd frontend
npm install recharts  # For charts in CampaignAnalytics
```

### Step 3: Integrate Frontend Components (10 minutes)

**In Agent Dashboard or Campaign Management Page:**
```jsx
import CampaignMessage from '@/components/agent/CampaignMessage';
import ScheduleCampaignEvent from '@/components/agent/ScheduleCampaignEvent';
import CampaignAnalytics from '@/components/agent/CampaignAnalytics';

export default function AgentCampaignDashboard() {
    const { user } = useAuth();
    const agentPermissions = user?.agentInfo?.permissions || [];
    const candidateId = user?.agentInfo?.assignedCandidateId;

    return (
        <div className="agent-dashboard">
            <h1>Campaign Management</h1>
            
            <div className="campaign-tools">
                <CampaignMessage 
                    candidateId={candidateId}
                    agentPermissions={agentPermissions}
                />
                <ScheduleCampaignEvent 
                    candidateId={candidateId}
                    agentPermissions={agentPermissions}
                />
            </div>

            <CampaignAnalytics agentPermissions={agentPermissions} />
        </div>
    );
}
```

### Step 4: Add CSS Styling (10 minutes)

Create `/frontend/src/components/agent/CampaignMessage.css`:
```css
.campaign-message-container {
    margin: 20px 0;
}

.btn-post-message {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    transition: all 0.3s ease;
}

.btn-post-message:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
}

.message-form-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    cursor: pointer;
}

.modal-content {
    position: relative;
    background: white;
    border-radius: 12px;
    padding: 30px;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
}

.form-group textarea {
    resize: vertical;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.form-actions {
    display: flex;
    gap: 10px;
    margin-top: 30px;
    justify-content: flex-end;
}

.btn-cancel,
.btn-submit {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-cancel {
    background: #e0e0e0;
    color: #333;
}

.btn-submit {
    background: #667eea;
    color: white;
}

.permission-denied {
    background: #ffebee;
    border: 1px solid #ef5350;
    border-radius: 8px;
    padding: 20px;
    color: #c62828;
    text-align: center;
}
```

### Step 5: Run Tests (10 minutes)
```bash
cd backend

# Install test dependencies
npm install --save-dev jest supertest

# Add to package.json:
"scripts": {
    "test": "jest",
    "test:agent": "jest tests/agent-permissions.test.js",
    "test:watch": "jest --watch"
}

# Run tests
npm run test:agent

# Expected output:
# Agent Permission Enforcement
#   Agent Permission Middleware
#     ✓ Should deny access to non-agents
#     ✓ Should deny unapproved agents
#     ✓ Should allow approved agents with permissions
#     ✓ Should deny agents without required permission
#   Campaign Messages
#     ✓ Agent WITH permission CAN post message
#     ✓ Agent WITHOUT permission CANNOT post message
#   [etc...]
```

---

## Permission Model

### Agent Roles & Permissions

```
Agent Role: agent
├── Permissions Available:
│   ├── postUpdates → Can post campaign messages
│   ├── manageTasks → Can schedule events
│   ├── viewStatistics → Can view analytics
│   ├── updateMaterials → Can update campaign materials (future)
│   └── respondToQuestions → Can respond in forums (future)
└── Access Levels:
    ├── full → All permissions
    ├── limited → Subset of permissions
    └── read_only → View-only access
```

### Permission Assignment Flow

```
1. Admin creates agent in Agent model with permissions array
2. Agent user created with agentInfo containing permissions
3. Agent must be approved (approvalStatus = 'approved')
4. Middleware validates permissions for each operation
5. If permission granted → operation proceeds
6. If permission denied → 403 error with specific permission requirement
```

---

## API Endpoints Summary

| Method | Endpoint | Permission | Purpose |
|--------|----------|-----------|---------|
| POST | `/api/agents/campaign/messages` | postUpdates | Post campaign message |
| GET | `/api/agents/campaign/messages/:candidateId` | - | Retrieve messages |
| POST | `/api/agents/campaign/events` | manageTasks | Schedule event |
| GET | `/api/agents/campaign/events/:candidateId` | - | Retrieve events |
| GET | `/api/agents/campaign/analytics` | viewStatistics | View analytics |

---

## Troubleshooting

### "Insufficient permissions" Error
**Cause:** Agent doesn't have required permission
**Solution:** 
1. Check agent permissions array in database
2. Verify permission name matches exactly
3. Update permission using updateAgentPermissions endpoint

### "Agent not assigned to candidate"
**Cause:** Agent trying to access wrong candidate
**Solution:**
1. Verify agent's assignedCandidateId
2. Only agents assigned to candidate can access their data
3. Use admin endpoint to change assignment if needed

### Migration Fails
**Cause:** Collection already exists or database connection issue
**Solution:**
1. Check MongoDB connection
2. Verify migrations haven't run before
3. Use `npm run migrate status` to check
4. If needed, drop collection and rerun

---

## Next Feature: Vote Receipt System

After completing Agent Permissions, the next priority feature is:

**Vote Receipt & Verification** (8-10 hours)
- Generate unique receipt codes for each vote
- Anonymous vote verification (by code, not linking to voter)
- Receipt storage with encryption
- Voter verification portal

Would you like me to proceed with:
1. ✅ **Complete this** - Run migrations, tests, frontend integration
2. ⏳ **Start Vote Receipt** - Design and implement next feature
3. 📋 **Create documentation** - API docs, deployment guide, user manual

---

## File Manifest

**Backend Files Created:**
- ✅ `/backend/middleware/checkAgentPermission.js` - Permission validation
- ✅ `/backend/models/CampaignMessage.js` - Message model
- ✅ `/backend/models/CampaignEvent.js` - Event model
- ✅ `/backend/migrations/001_create_campaign_message_collection.js`
- ✅ `/backend/migrations/002_create_campaign_event_collection.js`
- ✅ `/backend/scripts/migrate.js` - Migration runner
- ✅ `/backend/tests/agent-permissions.test.js` - Test suite
- ✅ `/backend/controllers/agentController.js` - UPDATED with new functions
- ✅ `/backend/routes/agentRoutes.js` - UPDATED with new endpoints

**Frontend Files Created:**
- ✅ `/frontend/src/components/agent/CampaignMessage.jsx`
- ✅ `/frontend/src/components/agent/ScheduleCampaignEvent.jsx`
- ✅ `/frontend/src/components/agent/CampaignAnalytics.jsx`

**Documentation Files:**
- ✅ `AGENT_PERMISSIONS_IMPLEMENTATION_GUIDE.md` (this file)

---

## Time Estimates

| Task | Est. Time | Status |
|------|-----------|--------|
| Backend setup | ✅ Complete | DONE |
| Database schema | ✅ Complete | DONE |
| Frontend components | ✅ Complete | DONE |
| CSS styling | 10 mins | PENDING |
| Migration execution | 5 mins | PENDING |
| Test run | 10 mins | PENDING |
| Integration wiring | 15 mins | PENDING |
| Documentation | 20 mins | PENDING |
| **TOTAL** | **60 mins** | **Ready to complete** |

---

## Success Criteria

✅ Agent Permission Enforcement is complete when:
- [ ] Migrations run successfully
- [ ] All tests pass
- [ ] Frontend components integrate without errors
- [ ] Agents can only access operations they have permissions for
- [ ] Permission denials return clear 403 errors
- [ ] Non-agents cannot access agent endpoints
- [ ] Unapproved agents are blocked
- [ ] Analytics data is returned only to authorized agents

---

