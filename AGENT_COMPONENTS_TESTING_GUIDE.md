# Agent Components Testing Guide

## Quick Test Steps

### 1. AgentCandidates Component

#### Info Tab
1. Navigate to Agent Dashboard → Candidates section
2. Verify candidate photo displays at top (80x80px rounded)
3. Check contact information shows email and phone
4. Confirm role badge displays with correct color
5. Verify status badge (active/inactive) shows correctly
6. Check election information displays
7. Verify campaign symbol shows if available
8. Check task statistics sidebar (Active: X, Completed: Y)

#### Materials Tab
1. Click "Campaign Materials" tab
2. Verify material count badge shows correct number
3. Check materials display in grid layout (3 columns on desktop)
4. Confirm each material shows:
   - Image preview OR PDF icon
   - Category badge (top-right corner)
   - Title
   - Description (if available)
   - View button (blue)
   - Download button (gray)
5. Test "View" button opens material in new tab
6. Test "Download" button downloads the file
7. Verify hover effect on material cards
8. Check empty state if no materials exist

#### Statistics Tab
1. Click "Statistics" tab
2. Verify three metric cards show:
   - Active Tasks (blue gradient)
   - Completed Tasks (green gradient)  
   - Campaign Materials (purple gradient)
3. Check task completion rate progress bar
4. Verify percentage calculation is correct
5. Confirm role status badge displays
6. Check campaign status badge displays

### 2. AgentDashboard Component

#### Overview Section
1. Navigate to Agent Dashboard
2. Verify no "Week 1, Week 2" mock data shows
3. Check charts display real task data
4. Confirm line chart shows task trends
5. Verify bar chart shows performance metrics
6. Check pie chart displays distribution

#### Statistics Cards
1. Verify "Total Candidates" shows real count
2. Check "Active Tasks" matches actual tasks
3. Confirm "Completed Tasks" is accurate
4. Verify other metrics (voterOutreach, engagement, efficiency) show from API

#### Analytics
1. Scroll to analytics section
2. Verify charts update based on real task dates
3. Check week grouping is correct
4. Confirm completed vs pending tasks are accurate

### 3. AgentAnalytics Component

#### Analytics Cards
1. Navigate to Agent → Analytics
2. Verify four cards display:
   - Total Tasks
   - Tasks Completed
   - Active Tasks
   - Candidates
3. Check values match API data
4. Verify trend indicators show
5. Test hover effect on cards

#### Charts Section
1. Scroll to "Task Performance Overview"
2. Verify bar chart displays:
   - Active tasks (blue bars)
   - Completed tasks (green bars)
3. Check chart is responsive
4. Hover over bars to see tooltip
5. Verify tooltip shows correct values

#### Pie Chart
1. Check "Task Distribution" pie chart
2. Verify slices show:
   - Completed (green)
   - Active (blue)
3. Check percentages calculate correctly
4. Hover to see tooltip with exact values

#### Progress Bars
1. Scroll to progress bar section
2. Verify active tasks progress bar (blue gradient)
3. Check completed tasks progress bar (green gradient)
4. Confirm percentages match data

## API Endpoint Tests

### Test Each Endpoint
```bash
# 1. Get Dashboard Data
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/agent/dashboard

# 2. Get Agent Stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/agent/stats

# 3. Get Campaign Materials
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/candidates/CANDIDATE_ID/materials
```

### Expected Responses

#### /api/agent/dashboard
```json
{
  "candidates": [...],
  "tasks": [
    {
      "_id": "...",
      "title": "Task title",
      "status": "completed|pending|in-progress",
      "dueDate": "2025-01-20T00:00:00.000Z"
    }
  ]
}
```

#### /api/agent/stats
```json
{
  "totalCandidates": 1,
  "tasksActive": 3,
  "tasksCompleted": 5,
  "role": "agent",
  "status": "active",
  "permissions": {...}
}
```

#### /api/candidates/{id}/materials
```json
[
  {
    "file": "uploads/materials/...",
    "title": "Campaign Poster",
    "description": "...",
    "category": "poster"
  }
]
```

## Visual Checks

### Dark Mode
- [ ] All charts render correctly in dark mode
- [ ] Text is readable (proper contrast)
- [ ] Cards have correct background colors
- [ ] Borders are visible but subtle
- [ ] Charts use theme-aware colors

### Light Mode  
- [ ] All elements visible and clear
- [ ] No contrast issues
- [ ] Charts are easy to read
- [ ] Hover states work correctly

### Responsive Design
- [ ] Desktop (1920px+): 3-column grids work
- [ ] Tablet (768px): 2-column grids
- [ ] Mobile (480px): 1-column, stacked layout
- [ ] Charts remain readable on small screens
- [ ] Tab navigation works on mobile

## Data Validation

### No Mock Data Present
```bash
# Search for any remaining mock data
cd frontend/src/components/agent
grep -r "mock\|Mock\|MOCK" .
grep -r "Week 1.*Week 2" .
grep -r "Math.random" .
```

Should return: **No results** (all mock data removed)

### Real Data Sources
1. Check browser Network tab
2. Verify API calls to:
   - `/api/agent/dashboard`
   - `/api/agent/stats`
   - `/api/candidates/*/materials`
3. Confirm responses contain real data
4. Check no hardcoded arrays in code

## Error Handling Tests

### Missing Data
1. **No candidate photo**: Should show FaUserTie icon
2. **No campaign symbol**: Section should hide
3. **No materials**: Should show empty state message
4. **API error**: Should gracefully handle and show fallback

### Network Issues
1. Disconnect internet
2. Reload page
3. Verify error handling works
4. Check fallback data displays

## Performance Tests

### Load Times
- [ ] Initial page load < 2 seconds
- [ ] Chart rendering < 500ms
- [ ] Material images load progressively
- [ ] No blocking API calls

### Memory Usage
- [ ] No memory leaks on tab switching
- [ ] Charts dispose properly
- [ ] Images cleaned up when unmounted

## Cross-Browser Testing

### Chrome
- [ ] All features work
- [ ] Charts render correctly
- [ ] Animations smooth

### Firefox
- [ ] Charts display properly
- [ ] Hover effects work
- [ ] API calls successful

### Safari
- [ ] All gradients render
- [ ] Charts compatible
- [ ] Dark mode works

### Edge
- [ ] Full compatibility
- [ ] No layout issues

## Accessibility Tests

### Keyboard Navigation
- [ ] Tab through all elements
- [ ] Tab buttons accessible
- [ ] Charts have proper labels
- [ ] Download buttons reachable

### Screen Readers
- [ ] Alt text on images
- [ ] ARIA labels present
- [ ] Chart data accessible
- [ ] Status badges announced

## Common Issues & Solutions

### Issue: Charts not showing
**Solution**: Check if Recharts is installed: `npm install recharts`

### Issue: Materials not loading
**Solution**: Verify API endpoint and candidate ID is correct

### Issue: Images not displaying
**Solution**: Check `getImageUrl()` helper function and backend file serving

### Issue: Dark mode colors wrong
**Solution**: Verify using `colors` from `useTheme()` hook

### Issue: Mock data still showing
**Solution**: Clear browser cache and reload

## Sign-Off Checklist

Before marking complete, verify:
- [ ] All mock data removed
- [ ] Real API endpoints connected
- [ ] Charts display real task data
- [ ] Materials tab fully functional
- [ ] Statistics tab shows accurate data
- [ ] Candidate photos display correctly
- [ ] Dark mode works perfectly
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Performance acceptable

## Test Accounts

Use these accounts for testing:
- **Agent Role**: username: `agent1` / password: `password123`
- **Coordinator Role**: username: `coordinator1` / password: `password123`

## Automated Testing (Optional)

```javascript
// Jest test example
describe('AgentCandidates', () => {
  it('should fetch and display materials', async () => {
    // Mock API response
    // Render component
    // Assert materials display
  });
  
  it('should calculate completion rate', () => {
    const stats = { tasksActive: 3, tasksCompleted: 7 };
    const rate = (stats.tasksCompleted / (stats.tasksActive + stats.tasksCompleted)) * 100;
    expect(rate).toBe(70);
  });
});
```

---

**Last Updated:** January 2025  
**Status:** Ready for testing
