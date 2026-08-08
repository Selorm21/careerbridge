import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const C = {
  bg: '#F8F9FB',
  ink: '#0F172A',
  sub: '#94A3B8',
  border: '#EEF1F5',
  card: '#FFFFFF',
  navText: '#475569',
  activeBg: '#EEF5FF',
  activeText: '#2563EB',
  red: '#DC2626',
}

const Icon = ({ children, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
)

const icons = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),

  applications: (
    <>
      <path d="M20 6 9 17l-5-5" />
    </>
  ),

  recommended: (
    <>
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    </>
  ),

  interviews: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),

  jobs: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),

  profile: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21c.8-4 3.1-6 7-6s6.2 2 7 6" />
    </>
  ),

  resume: (
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </>
  ),

  analytics: (
    <>
      <path d="M4 19V5" />
      <path d="M4 19h17" />
      <path d="m7 15 4-5 3 2 5-7" />
    </>
  ),

  logout: (
    <>
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 19V5a2 2 0 0 0-2-2h-5" />
    </>
  ),
}

export default function StudentLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const [profile, setProfile] = useState(null)
  const [applications, setApplications] = useState([])

  useEffect(() => {
    async function loadUserData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          navigate('/login')
          return
        }

        const [{ data: profileData }, { data: applicationsData }] =
          await Promise.all([
            supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single(),

            supabase
              .from('applications')
              .select('*')
              .eq('student_id', user.id),
          ])

        setProfile(profileData || null)
        setApplications(applicationsData || [])
      } catch (error) {
        console.error('Failed to load student layout:', error)
      }
    }

    loadUserData()
  }, [navigate])

  const initials = (name) => {
    if (!name) return 'EA'

    return name
      .split(' ')
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const navItems = [
    {
      label: 'Overview',
      path: '/student',
      icon: 'overview',
    },
    {
      label: 'Applications',
      path: '/applications',
      icon: 'applications',
      badge: applications.length,
    },
    {
      label: 'Recommended',
      path: '/recommended',
      icon: 'recommended',
      badge: 1,
    },
    {
      label: 'Interviews',
      path: '/interviews',
      icon: 'interviews',
      badge: applications.filter(
        (application) => application.status === 'interview'
      ).length,
    },
    {
      label: 'Browse jobs',
      path: '/browse-jobs',
      icon: 'jobs',
    },
    {
      label: 'My profile',
      path: '/student-profile',
      icon: 'profile',
    },
    {
      label: 'Resume builder',
      path: '/resume-builder',
      icon: 'resume',
    },
    {
      label: 'Analytics',
      path: '/analytics',
      icon: 'analytics',
    },
  ]

  const isActive = (path) => {
    if (path === '/student') {
      return location.pathname === '/student'
    }

    return location.pathname.startsWith(path)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div style={styles.app}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.logo}>
          CareerBridge
        </div>

        {/* User */}
        <div style={styles.userSection}>
          <div style={styles.avatar}>
            {initials(profile?.full_name || 'Ernest Amuzu')}
          </div>

          <div>
            <div style={styles.userName}>
              {profile?.full_name || 'Ernest Amuzu'}
            </div>

            <div style={styles.userRole}>
              Student
            </div>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Navigation */}
        <nav style={styles.navigation}>
          {navItems.map((item) => {
            const active = isActive(item.path)

            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                style={{
                  ...styles.navButton,
                  ...(active ? styles.navButtonActive : {}),
                }}
              >
                <Icon size={18}>
                  {icons[item.icon]}
                </Icon>

                <span style={{ flex: 1 }}>
                  {item.label}
                </span>

                {item.badge !== undefined && item.badge > 0 && (
                  <span style={styles.badge}>
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={styles.logout}
        >
          <Icon size={17}>
            {icons.logout}
          </Icon>

          <span>Log out</span>
        </button>
      </aside>

      {/* PAGE CONTENT */}
      <main style={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}

const styles = {
  app: {
    minHeight: '100vh',
    background: C.bg,
    display: 'flex',
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  sidebar: {
    width: '358px',
    flexShrink: 0,
    background: '#fff',
    borderRight: `1px solid ${C.border}`,
    padding: '28px 20px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },

  logo: {
    fontSize: '21px',
    fontWeight: '800',
    color: C.ink,
    marginBottom: '22px',
    paddingLeft: '20px',
  },

  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '0 20px',
    marginBottom: '20px',
  },

  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '800',
  },

  userName: {
    fontSize: '15px',
    fontWeight: '700',
    color: C.ink,
  },

  userRole: {
    fontSize: '13px',
    color: C.sub,
    marginTop: '3px',
  },

  divider: {
    height: '1px',
    background: '#E5E7EB',
    margin: '0 20px 25px',
  },

  navigation: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    flex: 1,
  },

  navButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '13px',
    border: 'none',
    background: 'transparent',
    color: C.navText,
    padding: '11px 15px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    textAlign: 'left',
    transition: 'all .15s ease',
  },

  navButtonActive: {
    background: '#EEF5FF',
    color: '#2563EB',
  },

  badge: {
    minWidth: '24px',
    height: '22px',
    padding: '0 6px',
    borderRadius: '7px',
    background: C.red,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '800',
  },

  logout: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '11px',
    background: '#fff',
    border: `1px solid ${C.border}`,
    borderRadius: '11px',
    color: C.navText,
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  content: {
    flex: 1,
    minWidth: 0,
    minHeight: '100vh',
    overflow: 'hidden',
  },
}