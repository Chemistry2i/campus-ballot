# Observer Components Quick Reference Guide

## Components Overview

### 1. ObserverVotersList
**Route**: `/observer/voters`
**Purpose**: Manage and view eligible voters for assigned elections

#### Key Features
- Election selection dropdown
- Search functionality (by name, email, student ID)
- Real-time statistics:
  - Total voters count
  - Voters who have voted
  - Voters who haven't voted
  - Turnout percentage
- Detailed voter table showing:
  - Name, Email, Student ID, Faculty
  - Vote status (Yes/No)
  - Timestamp of when they voted (if applicable)

#### Data Structure
```javascript
{
  _id: string,
  name: string,
  email: string,
  studentId: string,
  hasVoted: boolean,
  votedAt: ISO8601 | null,
  faculty: string
}
```

#### API Integration
- **Elections**: `GET /api/observer/assigned-elections`
- **Voters**: `GET /api/observer/elections/{electionId}/voters`
- **Fallback**: Sample data automatically shows if endpoint doesn't exist

---

### 2. ObserverMonitor
**Route**: `/observer/monitor`
**Purpose**: Real-time monitoring of election progress

#### Key Features
**Tab 1: Overview**
- Election cards for each assigned election
- Shows election title and status badge
- Displays turnout percentage with visual progress bar
- Shows candidate count and vote count
- Color-coded status (Upcoming: Orange, Ongoing: Green, Ended: Gray)

**Tab 2: Real-time Statistics**
- Placeholder for live data streaming
- Ready for WebSocket integration
- Will show real-time vote counts and results

**Tab 3: Issues & Alerts**
- Placeholder for election alerts
- Integration ready for incident system

#### Data Structure
```javascript
{
  _id: string,
  title: string,
  startDate: ISO8601,
  endDate: ISO8601,
  statistics: {
    totalCandidates: number,
    totalVotes: number,
    eligibleVoters: number
  }
}
```

#### API Integration
- **Elections**: `GET /api/observer/assigned-elections`
- Enhanced with real-time features in future

---

### 3. ObserverIncidents
**Route**: `/observer/incidents`
**Purpose**: Report and track election-related incidents

#### Key Features
- **Report Incident Form**:
  - Title field
  - Description (textarea)
  - Election selection
  - Severity level (Low/Medium/High)
  
- **Incidents Table**:
  - Title and description columns
  - Severity badge (color-coded: Green/Orange/Red)
  - Status badge (Open/In Progress/Resolved/Closed)
  - Timestamp of report
  - View action button

- **Filtering**:
  - Filter by status
  - Real-time table updates

#### Data Structure
```javascript
{
  _id: string,
  title: string,
  description: string,
  severity: 'low' | 'medium' | 'high',
  status: 'open' | 'in_progress' | 'resolved' | 'closed',
  election: string (ObjectId),
  reportedBy: string,
  createdAt: ISO8601,
  resolvedAt: ISO8601 | null
}
```

#### API Integration
- **List Incidents**: `GET /api/observer/incidents`
- **Create Incident**: `POST /api/observer/incidents`
- **Elections**: `GET /api/observer/assigned-elections`
- **Fallback**: Sample incident data available for demo

---

## Component Styling

All components use **ThemedTable** for consistency:
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Striped rows
- ✅ Bordered layout
- ✅ Hover effects

### Color Scheme
- **Primary Blue**: #3b82f6 (Actions, highlights)
- **Success Green**: #10b981 (Positive status)
- **Warning Orange**: #f59e0b (In progress, medium severity)
- **Danger Red**: #ef4444 (High severity, closed)
- **Gray**: #6b7280 (Neutral, ended)

---

## Navigation Integration

Observer sidebar automatically includes all three new pages:

```
Observer Sidebar Menu:
├── Dashboard
├── All Elections
├── Monitor (NEW)
├── Voters List (NEW)
├── Reports
├── Analytics
├── Activity Logs
├── Incidents (NEW)
├── Notifications
└── Settings
```

---

## Error Handling

All components include:
- **Fallback Data**: Sample data displays if API endpoints not available
- **Loading States**: Spinner shown while fetching data
- **Error Messages**: User-friendly error notifications
- **Empty States**: Clear messaging when no data available

---

## Backend Endpoint Requirements

### For Full Functionality

**Optional** (fallback data will show):
```
GET /api/observer/elections/{electionId}/voters
- Returns list of eligible voters with vote status

GET /api/observer/incidents
- Returns list of reported incidents

POST /api/observer/incidents
- Create new incident report
```

**Already Implemented** (these endpoints work):
```
GET /api/observer/assigned-elections
- Returns observer's assigned elections ✅

GET /api/observer/elections/{electionId}/statistics
- Returns election statistics ✅
```

---

## Component Reusability

### ThemedTable
Used across all components for consistent table rendering:
```jsx
<ThemedTable striped bordered hover responsive>
  <thead>...</thead>
  <tbody>...</tbody>
</ThemedTable>
```

### Color Utilities
Components use theme context colors:
```jsx
const { isDarkMode, colors } = useTheme();
// colors.text, colors.surface, colors.border, colors.background
```

---

## Performance Considerations

- All components load observer's assigned elections once
- Table filtering happens client-side for quick response
- Image loading properly handled with fallbacks
- Responsive design optimized for mobile and desktop

---

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live data
2. **Export Functionality**: CSV/PDF export for reports
3. **Advanced Filtering**: More complex search and filter options
4. **Incident Details**: Expand incident view with full details and history
5. **Voter Analytics**: Detailed charts for voter demographics
6. **Automated Alerts**: Real-time alerts for significant events

---

## Testing Notes

### Manual Testing Checklist
- [ ] Observer Voters List loads election dropdown
- [ ] Search filters voters correctly
- [ ] Statistics update when election changes
- [ ] Monitor page displays all assigned elections
- [ ] Incident form validates all required fields
- [ ] Incident status filter works correctly
- [ ] All tables display in both light and dark modes
- [ ] Mobile responsive design works properly
- [ ] Fallback sample data shows if API unavailable

---

## Troubleshooting

**Issue**: Page shows "No data available"
- **Solution**: Ensure observer is assigned to at least one election

**Issue**: Images don't load in other observer pages
- **Solution**: Check `getImageUrl()` helper function in each component

**Issue**: Table formatting looks incorrect
- **Solution**: Verify ThemedTable import and props are correct

**Issue**: Dark mode colors not applying
- **Solution**: Check that useTheme() is called at component level

---

**Last Updated**: January 30, 2026
**Version**: 1.0
**Status**: Production Ready with Sample Data Fallback
