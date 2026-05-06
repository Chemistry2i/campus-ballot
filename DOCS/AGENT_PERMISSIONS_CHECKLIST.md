# Agent Permission Enforcement - Implementation Checklist

## Pre-Launch Checklist

### Phase 1: Database Setup ✅ Ready
- [ ] MongoDB connection verified
- [ ] Migrations directory exists: `backend/migrations/`
- [ ] Migration files present:
  - [ ] `001_create_campaign_message_collection.js`
  - [ ] `002_create_campaign_event_collection.js`
- [ ] Run migrations:
  ```bash
  cd backend
  npm run migrate up
  ```
- [ ] Verify collections created:
  ```bash
  mongosh
  > use campus-ballot
  > db.campaign_messages.find().count()
  > db.campaign_events.find().count()
  ```

---

### Phase 2: Backend Verification ✅ Ready
- [ ] Files exist:
  - [ ] `/backend/middleware/checkAgentPermission.js` (82 lines)
  - [ ] `/backend/models/CampaignMessage.js` (131 lines)
  - [ ] `/backend/models/CampaignEvent.js` (179 lines)
  - [ ] `/backend/scripts/migrate.js` (migration runner)
  - [ ] Updated: `/backend/controllers/agentController.js` (+5 functions)
  - [ ] Updated: `/backend/routes/agentRoutes.js` (+5 routes)

- [ ] Import statements added to controllers:
  ```javascript
  const CampaignMessage = require('../models/CampaignMessage');
  const CampaignEvent = require('../models/CampaignEvent');
  ```

- [ ] Routes properly protected:
  ```javascript
  router.post('/campaign/messages', 
    protect, 
    checkAgentPermission(['postUpdates']), 
    postCampaignMessage
  );
  ```

- [ ] Test run:
  ```bash
  npm run test:agent
  ```

---

### Phase 3: Frontend Setup ✅ Ready
- [ ] Components created:
  - [ ] `/frontend/src/components/agent/CampaignMessage.jsx`
  - [ ] `/frontend/src/components/agent/ScheduleCampaignEvent.jsx`
  - [ ] `/frontend/src/components/agent/CampaignAnalytics.jsx`

- [ ] CSS files created:
  - [ ] `CampaignMessage.css`
  - [ ] `ScheduleCampaignEvent.css`
  - [ ] `CampaignAnalytics.css`

- [ ] Dependencies installed:
  ```bash
  cd frontend
  npm install recharts  # For charts
  ```

---

### Phase 4: Integration ⏳ Next Steps
- [ ] Import components in agent dashboard:
  ```jsx
  import CampaignMessage from '@/components/agent/CampaignMessage';
  import ScheduleCampaignEvent from '@/components/agent/ScheduleCampaignEvent';
  import CampaignAnalytics from '@/components/agent/CampaignAnalytics';
  ```

- [ ] Add to dashboard JSX:
  ```jsx
  <CampaignMessage candidateId={candidateId} agentPermissions={permissions} />
  <ScheduleCampaignEvent candidateId={candidateId} agentPermissions={permissions} />
  <CampaignAnalytics agentPermissions={permissions} />
  ```

- [ ] Verify auth token stored in localStorage:
  ```javascript
  localStorage.getItem('token')
  ```

- [ ] Verify user agentInfo populated:
  ```javascript
  user.agentInfo = {
    assignedCandidateId: ObjectId,
    permissions: ['postUpdates', 'manageTasks', 'viewStatistics'],
    approvalStatus: 'approved'
  }
  ```

---

### Phase 5: Testing ⏳ Next Steps

#### Manual Testing Flow
1. **Login as agent user:**
   - Navigate to agent dashboard
   - Verify "Post Campaign Message" button appears

2. **Post a message:**
   - Click button
   - Fill form with:
     - Text: "Test message"
     - Type: "announcement"
     - Visibility: "public"
     - Status: "published"
   - Click "Post Message"
   - Verify success toast

3. **View messages:**
   - Messages should appear in list
   - Verify agent name and timestamp

4. **Schedule event:**
   - Click "Schedule Campaign Event"
   - Fill form with:
     - Name: "Test Rally"
     - Type: "rally"
     - Date: Tomorrow at 2 PM
     - Venue: "Campus Main Hall"
   - Click "Schedule Event"
   - Verify success message

5. **View analytics:**
   - Click to analytics tab
   - Verify charts load
   - Try different time ranges
   - Verify data updates

#### Permission Testing
6. **Test permission denial:**
   - Remove 'postUpdates' from agent permissions
   - Try to post message
   - Verify 403 error: "Insufficient permissions"

7. **Test unapproved agent:**
   - Create agent with approvalStatus: 'pending'
   - Try to access any endpoint
   - Verify 403 error: "Agent not approved"

8. **Test non-agent access:**
   - Login as student (not agent)
   - Try to post message
   - Verify 403 error: "Agent role required"

---

### Phase 6: Performance Verification ⏳ Next Steps

```bash
# Check database indexes
mongosh
> use campus-ballot
> db.campaign_messages.getIndexes()
> db.campaign_events.getIndexes()

# Expected indexes:
# - {candidateId, postedAt}
# - {agentId, postedAt}
# - {electionId, status}
# - {completedAt} with TTL
```

---

### Phase 7: Documentation ⏳ Next Steps
- [ ] API Documentation updated with new endpoints
- [ ] Permission matrix documented
- [ ] Error codes documented
- [ ] User guide created

---

## Quick Commands Reference

### Run Migrations
```bash
cd backend
npm run migrate up          # Run all pending migrations
npm run migrate status      # Check migration status
npm run migrate down        # Rollback last migration
```

### Run Tests
```bash
cd backend
npm run test:agent          # Run agent permission tests
npm run test:watch          # Watch mode
npm run test                # All tests
```

### Development Server
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### Database Inspection
```bash
mongosh
use campus-ballot

# View collections
db.campaign_messages.find()
db.campaign_events.find()

# Count documents
db.campaign_messages.countDocuments()
db.campaign_events.countDocuments()

# Check indexes
db.campaign_messages.getIndexes()
```

---

## Success Indicators

✅ **Implementation is complete when:**

1. **Database**
   - [ ] Collections created with all indexes
   - [ ] Migrations recorded in Migration collection
   - [ ] Can insert test documents

2. **Backend**
   - [ ] All tests passing
   - [ ] No console errors on startup
   - [ ] Permission middleware blocking unauthorized access
   - [ ] Proper 403 errors with permission details

3. **Frontend**
   - [ ] Components render without errors
   - [ ] Forms submit successfully
   - [ ] Buttons disabled for users without permissions
   - [ ] Proper error messages shown

4. **Integration**
   - [ ] Agent can post messages
   - [ ] Agent can schedule events
   - [ ] Agent can view analytics
   - [ ] Non-agents see permission denied messages
   - [ ] Unapproved agents blocked

---

## Troubleshooting Guide

### Error: "Collection already exists"
**Cause:** Migration already ran  
**Solution:** Check `npm run migrate status`, migrations run only once

### Error: "Agent not assigned to candidate"
**Cause:** Agent trying to access wrong candidate  
**Solution:** Verify agent's assignedCandidateId matches

### Error: "Insufficient permissions"
**Cause:** Agent missing required permission  
**Solution:** Add permission to agent.permissions array via Admin Panel

### Error: "MongoDB connection failed"
**Cause:** MongoDB not running or wrong connection string  
**Solution:** 
```bash
# Check MongoDB
mongosh --eval "db.adminCommand('ping')"

# Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/campus-ballot
```

### Charts not displaying
**Cause:** Recharts not installed  
**Solution:** `npm install recharts`

### Components not importing
**Cause:** Wrong import paths  
**Solution:** Verify paths use correct relative paths from file location

---

## File Locations Summary

```
campus-ballot/
├── backend/
│   ├── middleware/
│   │   └── checkAgentPermission.js ✅
│   ├── models/
│   │   ├── CampaignMessage.js ✅
│   │   └── CampaignEvent.js ✅
│   ├── controllers/
│   │   └── agentController.js (UPDATED) ✅
│   ├── routes/
│   │   └── agentRoutes.js (UPDATED) ✅
│   ├── migrations/
│   │   ├── 001_create_campaign_message_collection.js ✅
│   │   └── 002_create_campaign_event_collection.js ✅
│   ├── scripts/
│   │   └── migrate.js ✅
│   ├── tests/
│   │   └── agent-permissions.test.js ✅
│   └── package.json
├── frontend/
│   └── src/components/agent/
│       ├── CampaignMessage.jsx ✅
│       ├── CampaignMessage.css ✅
│       ├── ScheduleCampaignEvent.jsx ✅
│       ├── ScheduleCampaignEvent.css ✅
│       ├── CampaignAnalytics.jsx ✅
│       └── CampaignAnalytics.css ✅
└── DOCS/
    ├── AGENT_PERMISSIONS_IMPLEMENTATION_GUIDE.md ✅
    └── AGENT_PERMISSIONS_CHECKLIST.md (this file)
```

---

## Next Phase After Completion

Once Agent Permission Enforcement is complete and tested:

1. **Vote Receipt System** (High Priority)
   - Generate unique receipt codes
   - Anonymous verification
   - Receipt storage & retrieval

2. **Advanced Analytics** (Medium Priority)
   - Real-time dashboard
   - Export functionality
   - Predictive analytics

3. **Observer Role** (Medium Priority)
   - Observer dashboard
   - Live election monitoring
   - Real-time reporting

---

## Support & Questions

**For implementation questions:**
- Check Backend Implementation Guide: `AGENT_PERMISSIONS_IMPLEMENTATION_GUIDE.md`
- Review API documentation in routes files
- Check test file for expected behaviors

**For permission issues:**
1. Check user.agentInfo.permissions array
2. Verify approvalStatus = 'approved'
3. Check middleware logs for detailed rejection reason

**For database issues:**
- Check MongoDB connection
- Verify collections exist: `show collections`
- Check indexes: `db.collection.getIndexes()`

---

**Last Updated:** 2026  
**Version:** 1.0  
**Status:** Ready for Implementation

