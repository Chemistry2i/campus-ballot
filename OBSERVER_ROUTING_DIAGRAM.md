# Observer Dashboard - Routing Architecture Diagram

## Component Hierarchy

```
App.jsx
  └── Route: /observer/*
        └── ProtectedRoute (role: observer)
              └── ThemeProvider
                    └── ObserverLayout ← PERSISTENT CONTAINER
                          ├── ObserverSidebar ← ALWAYS VISIBLE
                          │     ├── User Profile
                          │     ├── Dashboard Link
                          │     ├── Assigned Elections (Dynamic)
                          │     └── Logout Button
                          │
                          ├── ObserverHeader ← ALWAYS VISIBLE
                          │     ├── Dynamic Page Title
                          │     ├── Theme Toggle
                          │     └── Mobile Menu
                          │
                          └── <Outlet /> ← DYNAMIC CONTENT AREA
                                │
                                ├── Route: index → Navigate to "dashboard"
                                ├── Route: dashboard → ObserverDashboardContent
                                └── Route: elections/:electionId → ElectionMonitor
```

## Navigation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  ObserverLayout (Persistent)                                    │
│  ┌───────────────┐  ┌──────────────────────────────────────┐   │
│  │               │  │  ObserverHeader (Persistent)         │   │
│  │  ObserverSide │  │  [Dashboard] [Theme Toggle] [Menu]   │   │
│  │  bar          │  └──────────────────────────────────────┘   │
│  │               │                                              │
│  │  [Dashboard]  │  ┌──────────────────────────────────────┐   │
│  │  [Elections]  │  │                                      │   │
│  │    • Election1│  │  <Outlet /> ← Content Changes Here  │   │
│  │    • Election2│  │                                      │   │
│  │    • Election3│  │  When user clicks navigation link,  │   │
│  │               │  │  only this area re-renders:          │   │
│  │  [Logout]     │  │                                      │   │
│  │               │  │  • Dashboard Statistics              │   │
│  └───────────────┘  │  • Election Monitor                  │   │
│                     │  • etc.                              │   │
│                     └──────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## URL to Component Mapping

| URL Path | Rendered Components | Description |
|----------|-------------------|-------------|
| `/observer` | ObserverLayout → Navigate → `/observer/dashboard` | Auto-redirect to dashboard |
| `/observer/dashboard` | ObserverLayout + ObserverDashboardContent | Main dashboard with stats |
| `/observer/elections/123` | ObserverLayout + ElectionMonitor | Monitor specific election |

## State Management

```
ObserverLayout (Parent State)
  ├── sidebarCollapsed: boolean ← Shared with all children
  ├── user: object ← User profile data
  └── isMobile: boolean ← Screen size detection
        │
        ↓ Passed via props/context
        │
        ├── ObserverSidebar uses: sidebarCollapsed, user, isMobile
        ├── ObserverHeader uses: sidebarCollapsed (for width calc)
        └── Child Routes: Can access via parent context if needed
```

## Sidebar Elections Loading

```
ObserverSidebar.jsx
  │
  ├── useEffect(() => {
  │     fetchAssignedElections();
  │   }, []);
  │
  ├── fetchAssignedElections()
  │     └── axios.get('/api/observer/assigned-elections')
  │           └── setAssignedElections(data)
  │
  └── Render:
        ├── Dashboard Link
        ├── "Assigned Elections" Heading (if elections.length > 0)
        └── elections.map(election =>
              <Link to={`/observer/elections/${election._id}`}>
                {election.title}
              </Link>
            )
```

## Event Flow: User Clicks Election Link

```
Step 1: User clicks "Spring 2024 Elections" in sidebar
  ↓
Step 2: React Router intercepts click (no page reload)
  ↓
Step 3: Router updates URL: /observer/elections/123abc
  ↓
Step 4: ObserverLayout REMAINS MOUNTED (no re-render)
  ↓
Step 5: ObserverSidebar REMAINS MOUNTED (highlights new active link)
  ↓
Step 6: ObserverHeader REMAINS MOUNTED (updates page title)
  ↓
Step 7: <Outlet /> re-renders with ElectionMonitor component
  ↓
Step 8: ElectionMonitor fetches election data with ID "123abc"
  ↓
Step 9: Content area smoothly transitions to new view
  ↓
Step 10: User sees election monitoring interface
```

## Key Implementation Features

### 1. No Full Page Reloads
- ✅ All navigation uses `<Link>` from React Router
- ✅ `useNavigate()` hook for programmatic navigation
- ❌ No `<a href>` tags anywhere in observer components

### 2. Persistent Layout
- ✅ `ObserverLayout` mounts once on `/observer/*`
- ✅ Sidebar and header stay in DOM during navigation
- ✅ Only `<Outlet />` content swaps out

### 3. Dynamic Content
- ✅ Sidebar loads assigned elections from API
- ✅ Header title changes based on current route
- ✅ Active link highlighting updates automatically

### 4. Performance
- ⚡ No layout thrashing during navigation
- ⚡ Sidebar collapse state preserved across routes
- ⚡ User data fetched once, shared across all routes

## Code Snippets

### App.jsx - Nested Routing Setup
```jsx
<Route path="/observer/*" element={<ObserverLayout />}>
  <Route index element={<Navigate to="dashboard" replace />} />
  <Route path="dashboard" element={<ObserverDashboardContent />} />
  <Route path="elections/:electionId" element={<ElectionMonitor />} />
</Route>
```

### ObserverLayout.jsx - Outlet Pattern
```jsx
<div className="observer-container">
  <ObserverSidebar 
    collapsed={sidebarCollapsed} 
    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
    user={user}
  />
  <div className="content-wrapper">
    <ObserverHeader />
    <main className="content-area">
      <Outlet /> {/* Child routes render here */}
    </main>
  </div>
</div>
```

### ObserverSidebar.jsx - Dynamic Elections
```jsx
const [assignedElections, setAssignedElections] = useState([]);

useEffect(() => {
  const fetchAssignedElections = async () => {
    const response = await axios.get('/api/observer/assigned-elections');
    setAssignedElections(response.data);
  };
  fetchAssignedElections();
}, []);

// Render:
{assignedElections.map(election => (
  <Link key={election._id} to={`/observer/elections/${election._id}`}>
    {election.title}
  </Link>
))}
```

---

**Architecture Pattern**: Layout Component with Outlet
**React Router Version**: v6
**Navigation Method**: Client-side only (SPA)
**State Persistence**: Parent layout maintains shared state
**Performance**: Optimized - only content area re-renders
