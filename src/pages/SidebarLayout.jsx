import React, { useState } from 'react'
import StudentDashboard from '../pages/StudentDashboard'
import BrowseJobs from '../pages/BrowseJobs'
import Analytics from '../pages/Analytics'
import CoordinatorDashboard from '../pages/CoordinatorDashboard'
import Students from '../pages/Students'
import Employers from '../pages/Employers'
import Settings from '../pages/Settings'
import ResumeBuilder from '../pages/ResumeBuilder'
import StudentProfile from '../pages/StudentProfile'
import PostJob from '../pages/PostJob'
import AdminDashboard from '../pages/AdminDashboard'

// Small icon wrapper (replace with your Icon component if needed)
const Icon = ({ children }) => <span style={{ width: 18, display: 'inline-block' }}>{children}</span>

const NAV = [
  { key: 'overview', label: 'Overview', icon: '🏠' },
  { key: 'browseJobs', label: 'Browse jobs', icon: '🔍' },
  { key: 'applications', label: 'Applications', icon: '✅' },
  { key: 'recommended', label: 'Recommended', icon: '⭐' },
  { key: 'interviews', label: 'Interviews', icon: '📅' },
  { key: 'myProfile', label: 'My profile', icon: '👤' },
  { key: 'resumeBuilder', label: 'Resume builder', icon: '📄' },
  { key: 'analytics', label: 'Analytics', icon: '📊' },
  { key: 'students', label: 'Students', icon: '👥' },
  { key: 'employers', label: 'Employers', icon: '🏢' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
]

export default function SidebarLayout({ initial = 'overview', profile = {} }) {
  const [active, setActive] = useState(initial)

  function renderMain() {
    // Render the existing page components inside an "embedded" wrapper.
    // We hide any .sidebar inside embedded so the nested page sidebars do not appear.
    switch (active) {
      case 'overview': return <div className="embedded"><StudentDashboard /></div>
      case 'browseJobs': return <div className="embedded"><BrowseJobs /></div>
      case 'applications': return <div className="embedded"><StudentDashboard activeTab="applications" /></div>
      case 'recommended': return <div className="embedded"><StudentDashboard activeTab="recommended" /></div>
      case 'interviews': return <div className="embedded"><StudentDashboard activeTab="interviews" /></div>
      case 'myProfile': return <div className="embedded"><StudentProfile /></div>
      case 'resumeBuilder': return <div className="embedded"><ResumeBuilder /></div>
      case 'analytics': return <div className="embedded"><Analytics /></div>
      case 'students': return <div className="embedded"><Students /></div>
      case 'employers': return <div className="embedded"><Employers /></div>
      case 'settings': return <div className="embedded"><Settings /></div>
      default: return <div className="embedded"><StudentDashboard /></div>
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '232px 1fr', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        /* hide sidebars rendered inside embedded content */
        .embedded .sidebar { display: none !important; }
        /* ensure the embedded page's main gets full width */
        .embedded .main, .embedded .mainEl, .embedded .mainPad { padding: 0; }
        /* small reset so embedded content doesn't stretch */
        .embedded { background: transparent; }
      `}</style>

      <aside style={{
        background: '#fff', borderRight: '1px solid rgba(15,23,42,0.04)',
        padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: '#0F172A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>CB</div>
            <div style={{ fontWeight: 800 }}>CareerBridge</div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {NAV.map(item => (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: 'none',
                  background: active === item.key ? '#0F172A' : 'transparent',
                  color: active === item.key ? '#fff' : '#0F172A',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textAlign: 'left'
                }}
              >
                <Icon>{item.icon}</Icon>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div style={{ marginTop: 18, borderTop: '1px solid rgba(15,23,42,0.04)', paddingTop: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {(profile?.full_name || 'U').charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>{profile?.full_name || 'Your Profile'}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{profile?.role || 'Student'}</div>
            </div>
          </div>
        </div>
      </aside>

      <main style={{ background: '#F8FAFC', padding: 22 }}>
        {renderMain()}
      </main>
    </div>
  )
}