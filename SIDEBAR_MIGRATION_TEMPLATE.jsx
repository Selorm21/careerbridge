// TEMPLATE: Use this as a reference when converting other pages to use the unified Sidebar

import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

// Example for Student pages
export default function StudentPageTemplate() {
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('tab1')
  const navigate = useNavigate()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)
    }
    loadProfile()
  }, [])

  // Define navigation items for students
  const studentNavItems = [
    { id: 'tab1', icon: '📊', label: 'Dashboard' },
    { id: 'tab2', icon: '🔍', label: 'Browse jobs', path: '/browse-jobs' },
    { id: 'tab3', icon: '👤', label: 'My profile', path: '/student-profile' },
    { id: 'tab4', icon: '📄', label: 'Resume builder', path: '/resume-builder' },
    { id: 'tab5', icon: '📁', label: 'Documents', path: '/documents' },
  ]

  return (
    <div style={S.page}>
      <style>{`
        /* Your page-specific animations and transitions */
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
        .pageIn { animation: fadeUp 0.4s ease forwards }
        @media(max-width:768px) {
          .layout { grid-template-columns: 1fr !important }
          .main { padding: 20px 16px !important }
        }
      `}</style>

      <div style={S.layout}>
        {/* Use the unified Sidebar */}
        <Sidebar 
          profile={profile}
          role="student"
          activeTab={activeTab}
          onTabChange={setActiveTab}
          navItems={studentNavItems}
          showLogout={true}
        />

        {/* Main content area */}
        <main className="main" style={S.main}>
          <div className="pageIn" style={S.heading}>
            <h1>Page Title</h1>
            <p>Subtitle text here</p>
          </div>

          {activeTab === 'tab1' && (
            <div style={S.card}>
              {/* Tab 1 Content */}
            </div>
          )}

          {activeTab === 'tab2' && (
            <div style={S.card}>
              {/* Tab 2 Content */}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: '#FAFAFA', fontFamily: "'Inter', -apple-system, sans-serif" },
  layout: { display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100vh', gap: '24px', padding: '40px' },
  main: { padding: '22px', overflowY: 'auto' },
  heading: { marginBottom: '20px' },
  card: { background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #E4E4E7' },
}

// ============================================================================
// EXAMPLE FOR EMPLOYER PAGES
// ============================================================================

export function EmployerPageTemplate() {
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const employerNavItems = [
    { id: 'overview', icon: '📊', label: 'Dashboard' },
    { id: 'jobs', icon: '💼', label: 'My jobs' },
    { id: 'applicants', icon: '👥', label: 'Applicants' },
    { id: 'post', icon: '➕', label: 'Post a job', path: '/post-job' },
    { id: 'analytics', icon: '📈', label: 'Analytics', path: '/analytics' },
  ]

  return (
    <div style={S.layout}>
      <Sidebar 
        profile={profile}
        role="employer"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        navItems={employerNavItems}
      />
      <main style={S.main}>
        {/* Employer page content */}
      </main>
    </div>
  )
}

// ============================================================================
// EXAMPLE FOR COORDINATOR PAGES
// ============================================================================

export function CoordinatorPageTemplate() {
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const coordinatorNavItems = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'students', icon: '🎓', label: 'Students' },
    { id: 'employers', icon: '🏢', label: 'Employers' },
    { id: 'placements', icon: '✅', label: 'Placements' },
  ]

  return (
    <div style={S.layout}>
      <Sidebar 
        profile={profile}
        role="coordinator"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        navItems={coordinatorNavItems}
      />
      <main style={S.main}>
        {/* Coordinator page content */}
      </main>
    </div>
  )
}

// ============================================================================
// EXAMPLE FOR ADMIN PAGES
// ============================================================================

export function AdminPageTemplate() {
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const adminNavItems = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'users', icon: '👥', label: 'Users' },
    { id: 'companies', icon: '🏢', label: 'Companies' },
    { id: 'jobs', icon: '💼', label: 'Jobs' },
    { id: 'reports', icon: '📋', label: 'Reports' },
  ]

  return (
    <div style={S.layout}>
      <Sidebar 
        profile={profile}
        role="admin"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        navItems={adminNavItems}
      />
      <main style={S.main}>
        {/* Admin page content */}
      </main>
    </div>
  )
}

// ============================================================================
// KEY POINTS WHEN MIGRATING PAGES
// ============================================================================
/*
1. IMPORT:
   - Add: import Sidebar from '../components/Sidebar'
   - Remove: All inline sidebar code

2. STATE:
   - Keep: profile, activeTab states
   - Keep: Any data loading effects
   - Remove: Old sidebar styling state

3. NAV ITEMS:
   - Define array with correct role items
   - Use emojis as icons (or replace with component icons)
   - Set correct paths for navigation
   - Add badges for counts (notifications, applications, etc.)

4. LAYOUT:
   - Keep: grid layout with 260px first column
   - Replace: <aside>...</aside> with <Sidebar /> component
   - Keep: main content area structure

5. STYLING:
   - Remove: All sidebar-related inline styles
   - Keep: Page-specific animations and card styles
   - Update: Media queries if needed

6. TESTING:
   - Check sidebar appearance (logo, avatar, nav items)
   - Verify active tab highlighting
   - Test logout button
   - Test navigation to other pages
   - Check responsive behavior

*/
