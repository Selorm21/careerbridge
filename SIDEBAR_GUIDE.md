# Unified Sidebar Component Guide

## Overview

The `Sidebar` component provides a consistent, reusable navigation sidebar across all pages in CareerBridge. This replaces the duplicated inline sidebar code in each page.

## Location

`src/components/Sidebar.jsx`

## Features

- ✅ Consistent styling across all roles (student, employer, coordinator, admin)
- ✅ Role-based color schemes for avatars
- ✅ Support for badge counts on nav items
- ✅ Built-in logout functionality
- ✅ Automatic user initials in avatar
- ✅ Sticky positioning (stays visible while scrolling)
- ✅ Responsive design (hides on mobile)

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `profile` | Object | Yes | User profile object with `full_name` field |
| `role` | String | Yes | User role: `'student'`, `'employer'`, `'coordinator'`, or `'admin'` |
| `activeTab` | String | No | Currently active tab ID for highlighting |
| `onTabChange` | Function | No | Callback when a tab is clicked |
| `navItems` | Array | Yes | Array of navigation items (see below) |
| `showLogout` | Boolean | No | Show logout button (default: `true`) |

## Navigation Items Format

Each item in the `navItems` array should have this structure:

```javascript
{
  id: 'unique-id',           // Unique identifier
  icon: '📊',               // Emoji or icon (string)
  label: 'Label text',      // Display label
  path: '/route-path',      // (Optional) Route to navigate to
  action: () => {},         // (Optional) Custom function to execute
  badge: 5                  // (Optional) Badge count/text to show
}
```

### When to Use Each Property

- **`path`**: For navigation links (uses React Router)
- **`action`**: For custom functions (logout, modal open, etc.)
- **Neither**: Falls back to `onTabChange(id)` for tab switching

## Usage Example

### Student Dashboard (Already Updated)

```javascript
import Sidebar from '../components/Sidebar'

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [applications, setApplications] = useState([])

  const navItems = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'applications', icon: '✓', label: 'Applications', badge: applications.length },
    { id: 'recommended', icon: '✨', label: 'Recommended' },
    { id: 'interviews', icon: '📅', label: 'Interviews' },
    { id: 'browse', icon: '🔍', label: 'Browse jobs', path: '/browse-jobs' },
    { id: 'profile', icon: '👤', label: 'My profile', path: '/student-profile' },
  ]

  return (
    <div style={S.layout}>
      <Sidebar 
        profile={profile}
        role="student"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        navItems={navItems}
        showLogout={true}
      />
      {/* Main content */}
    </div>
  )
}
```

## Styling

The Sidebar is self-contained and uses inline styles. If you need to customize colors or sizing:

1. **Avatar colors**: Edit `roleColors` object in `Sidebar.jsx`
   ```javascript
   const roleColors = {
     student: 'linear-gradient(135deg, #4F46E5, #6366F1)',
     employer: 'linear-gradient(135deg, #EA580C, #F97316)',
     coordinator: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
     admin: 'linear-gradient(135deg, #DC2626, #F87171)'
   }
   ```

2. **Active tab color**: Look for `S.sideNavActive` styling

3. **Width**: Change `gridTemplateColumns` in parent layout (e.g., `'260px 1fr'`)

## Pages to Update Next

To maintain consistency, update these pages to use the new `Sidebar` component:

- [ ] BrowseJobs.jsx
- [ ] StudentProfile.jsx
- [ ] ResumeBuilder.jsx
- [ ] PostJob.jsx
- [ ] EmployerDashboard.jsx
- [ ] ViewApplicants.jsx
- [ ] Analytics.jsx
- [ ] ScheduleInterview.jsx
- [ ] CoordinatorDashboard.jsx
- [ ] DocumentUpload.jsx
- [ ] AdminDashboard.jsx

## Migration Checklist for Each Page

1. Import the Sidebar component:
   ```javascript
   import Sidebar from '../components/Sidebar'
   ```

2. Remove the inline `<aside className="sidebar">...</aside>` code

3. Define `navItems` array specific to that role/page

4. Add `Sidebar` component to JSX:
   ```javascript
   <Sidebar 
     profile={profile}
     role="student"  // or employer, coordinator, admin
     activeTab={activeTab}
     onTabChange={setActiveTab}
     navItems={navItems}
   />
   ```

5. Update parent layout styles (remove old sidebar CSS)

6. Test navigation and active state highlighting

## Benefits

✨ **Consistency**: Same look and feel across all pages  
🎯 **Maintainability**: Update sidebar logic in one place  
⚡ **Performance**: Reduced code duplication  
♿ **Accessibility**: Consistent structure for screen readers  
📱 **Responsive**: Mobile-friendly (hides on small screens)

## Questions?

If you have questions about the Sidebar component, refer to the `StudentDashboard.jsx` for a complete working example.
