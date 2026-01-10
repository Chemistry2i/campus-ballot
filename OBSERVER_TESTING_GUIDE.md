# Observer Role - Quick Testing Guide

## Quick Start Testing

### 1. Start the Application

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 2. Create an Observer (as Super Admin)

**Step 1**: Login as super admin
**Step 2**: Navigate to: `/super-admin/manage-observers`
**Step 3**: Click "Add Observer"
**Step 4**: Fill in the form:

```
Name: John Observer
Email: observer@test.com
Password: observer123
Organization: Election Commission
Access Level: election-specific
Assigned Elections: [Select at least one election]
```

**Step 5**: Click "Create Observer"

### 3. Login as Observer

**Step 1**: Logout from super admin
**Step 2**: Login with observer credentials:
- Email: `observer@test.com`
- Password: `observer123`

**Step 3**: You should be redirected to: `/observer/dashboard`

### 4. Test Observer Features

#### Dashboard View
- ✅ Should see total/active/upcoming/completed elections count
- ✅ Should see access level badge
- ✅ Should see list of assigned elections

#### Election Monitoring
**Step 1**: Click on any assigned election
**Step 2**: Should navigate to: `/observer/elections/:electionId`

**Statistics Tab**:
- ✅ Election status and dates
- ✅ Eligible voters count
- ✅ Voter turnout percentage with progress bar
- ✅ Total votes cast

**Candidates Tab**:
- ✅ Candidates grouped by position
- ✅ Candidate details (name, faculty, course, year, status)
- ✅ Status badges (approved/pending/rejected)

**Audit Logs Tab**:
- ✅ System activity logs
- ✅ Timestamp, user, action columns
- ✅ Pagination if many logs

### 5. Test Access Control

#### Should Work ✅
```bash
# Observer can access assigned elections
GET /api/observer/dashboard
GET /api/observer/elections/:assignedElectionId/statistics
GET /api/observer/elections/:assignedElectionId/candidates
GET /api/observer/elections/:assignedElectionId/audit-logs
```

#### Should Fail ❌
```bash
# Observer cannot access unassigned elections
GET /api/observer/elections/:unassignedElectionId/statistics
# Expected: 403 Forbidden

# Observer cannot modify data
POST /api/elections
PUT /api/elections/:id
DELETE /api/elections/:id
# Expected: 403 Forbidden

# Observer cannot access admin routes
GET /api/admin/*
# Expected: 403 Forbidden
```

### 6. Test Super Admin Management

**As Super Admin**:

#### Update Observer
- Navigate to: `/super-admin/manage-observers`
- Click "Edit" on an observer
- Change organization or assigned elections
- Click "Update"
- ✅ Changes should be saved

#### Delete Observer
- Click "Delete" on an observer
- Confirm deletion
- ✅ Observer should be removed from list

#### View Observer Activity
- Check observer activity logs
- ✅ Should see login, dashboard access, election views

---

## API Testing with cURL

### Create Observer (Super Admin)
```bash
curl -X POST http://localhost:5000/api/super-admin/observers \
  -H "Content-Type: application/json" \
  -b "token=YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "name": "Test Observer",
    "email": "observer@test.com",
    "password": "observer123",
    "organization": "Test Commission",
    "accessLevel": "election-specific",
    "assignedElections": ["ELECTION_ID_HERE"]
  }'
```

### Get Observer Dashboard
```bash
curl http://localhost:5000/api/observer/dashboard \
  -b "token=OBSERVER_TOKEN"
```

### Get Election Statistics
```bash
curl http://localhost:5000/api/observer/elections/ELECTION_ID/statistics \
  -b "token=OBSERVER_TOKEN"
```

---

## Common Issues & Solutions

### Issue 1: Observer can't login
**Solution**: Ensure observer was created with `isVerified: true` (done automatically)

### Issue 2: No elections showing on dashboard
**Solution**: 
1. Check if elections were assigned during creation
2. Super admin can edit observer and assign elections
3. Verify elections exist in the database

### Issue 3: 403 Forbidden on election access
**Solution**: 
1. Check if observer is assigned to that specific election
2. Verify access level (election-specific requires assignment)
3. Check if election ID is correct

### Issue 4: Statistics not loading
**Solution**:
1. Check if votes exist for that election
2. Verify eligible voters query is correct
3. Check browser console for errors

---

## Test Scenarios

### Scenario 1: Election-Specific Observer
```
Given: Observer with election-specific access
When: Observer assigned to Election A only
Then: 
  - Can access Election A statistics ✅
  - Cannot access Election B statistics ❌
  - Dashboard shows only Election A ✅
```

### Scenario 2: Full Access Observer
```
Given: Observer with full access
When: System has Elections A, B, C
Then: 
  - Can access all elections ✅
  - Dashboard shows all elections ✅
  - Can monitor any election ✅
```

### Scenario 3: Observer Privacy Protection
```
Given: Observer viewing election statistics
When: Observer accesses election data
Then: 
  - Can see turnout percentage ✅
  - Can see total votes ✅
  - Cannot see who voted for whom ✅
  - Cannot see voter identities linked to votes ✅
```

---

## Expected Behavior Summary

| Action | Permission | Result |
|--------|-----------|--------|
| View dashboard | ✅ Allowed | Shows assigned elections |
| View election stats | ✅ Allowed | Real-time aggregated data |
| View candidates | ✅ Allowed | Public candidate info |
| View audit logs | ✅ Allowed | System activity logs |
| Create election | ❌ Denied | 403 Forbidden |
| Modify election | ❌ Denied | 403 Forbidden |
| Vote in election | ❌ Denied | Not eligible |
| Access unassigned election | ❌ Denied | 403 Forbidden |
| Approve candidates | ❌ Denied | 403 Forbidden |

---

## Performance Expectations

- Dashboard load: < 1 second
- Statistics load: < 2 seconds
- Audit logs load: < 1 second (with pagination)
- Tab switching: Instant (cached)

---

## Browser Testing

Test in:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (responsive design)

---

## Next Steps After Testing

1. ✅ Verify all functionality works
2. ✅ Test edge cases (no elections, no votes, etc.)
3. ✅ Check responsive design on different screen sizes
4. ✅ Validate security (try to bypass restrictions)
5. ✅ Test concurrent observers
6. ✅ Load test with multiple elections
7. Document any issues found
8. Create user training materials

---

**Testing Status**: Ready for Testing
**Estimated Testing Time**: 30-45 minutes
**Priority**: High (Critical for transparency)
