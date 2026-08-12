// src/components/EmployerLayout.jsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

// ============================================================
// ICONS
// ============================================================
const Icon = ({ path, size = 18, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {path}
  </svg>
)

const icons = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  analytics: (
    <>
      <path d="M5 20V10" />
      <path d="M12 20V4" />
      <path d="M19 20v-7" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20c0-3.3 3-6 6.5-6s6.5 2.7 6.5 6" />
      <path d="M16 8.2a3 3 0 1 1 3.6 3" />
      <path d="M21.5 20c0-2.6-1.8-4.8-4.3-5.6" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  chevron: <path d="M9 18l6-6-6-6" />,
  sparkle: (
    <>
      <path d="M12 3l1.2 4.8L18 9l-4.8 1.2L12 15l-1.2-4.8L6 9l4.8-1.2z" />
      <path d="M19 15l.6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6z" />
    </>
  ),
  usersSmall: (
    <>
      <circle cx="9" cy="8" r="2.8" />
      <path d="M3.5 19c.5-3.2 2.4-5 5.5-5s5 1.8 5.5 5" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ),
}

// ============================================================
// MAIN LAYOUT
// ============================================================
export default function EmployerLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isHovered, setIsHovered] = useState(false)
  const [jobs, setJobs] = useState([])
  const [profile, setProfile] = useState(null)
  const [totalApplicants, setTotalApplicants] = useState(0)

  useEffect(() => {
    let mounted = true
    async function getData() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) return

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!profileError && mounted) {
          setProfile({ ...profileData, email: profileData?.email || user.email })
        }

        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('employer_id', user.id)
          .order('created_at', { ascending: false })

        if (jobsError) {
          if (mounted) { setJobs([]); setTotalApplicants(0) }
          return
        }

        const safeJobs = Array.isArray(jobsData) ? jobsData : []
        if (!mounted) return
        setJobs(safeJobs)

        if (safeJobs.length === 0) {
          setTotalApplicants(0)
          return
        }

        const jobIds = safeJobs.map((job) => job.id).filter(Boolean)
        if (jobIds.length === 0) {
          setTotalApplicants(0)
          return
        }

        const { count: applicantCount, error: applicantsError } = await supabase
          .from('applications')
          .select('id', { count: 'exact', head: true })
          .in('job_id', jobIds)

        if (applicantsError) {
          if (mounted) setTotalApplicants(0)
          return
        }

        if (mounted) setTotalApplicants(applicantCount || 0)
      } catch (error) {
        console.error('EmployerLayout error:', error)
      }
    }
    getData()
    return () => { mounted = false }
  }, [])

  async function handleLogout() {
    try {
      await supabase.auth.signOut()
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const navItems = [
    { path: '/employer', icon: icons.grid, label: 'Overview' },
    { path: '/employer/post-job', icon: icons.plus, label: 'Post a Job' },
    { path: '/employer/browse-jobs', icon: icons.search, label: 'Browse All Jobs' },
    { path: '/employer/applicants', icon: icons.users, label: 'View Applicants' },
    { path: '/employer/analytics', icon: icons.analytics, label: 'Analytics' },
  ]

  const initials = (name) => {
    if (!name) return 'E'
    return name.trim().split(/\s+/).map((word) => word[0]).slice(0, 2).join('').toUpperCase()
  }

  const isRouteActive = (path) => {
    if (path === '/employer') return location.pathname === '/employer'
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  return (
    <div style={styles.mainWrapper}>
      <div style={styles.backgroundLayer}>
        <div style={styles.meshOne} />
        <div style={styles.meshTwo} />
        <div style={styles.meshThree} />
        <div style={styles.noiseLayer} />
        <div style={styles.gridPattern} />
      </div>

      <aside
        style={{
          ...styles.sidebar,
          width: isHovered ? '272px' : '82px',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={styles.sidebarTop}>
          <div style={styles.logoRow}>
            <div
              style={{
                ...styles.logoMark,
                transform: isHovered ? 'rotate(-3deg) scale(1.02)' : 'none',
              }}
            >
              <Icon path={icons.grid} size={19} strokeWidth={2} />
            </div>
            {isHovered && (
              <div style={styles.brandContainer}>
                <span style={styles.logoText}>CareerBridge</span>
                <span style={styles.brandTag}>EMPLOYER</span>
              </div>
            )}
          </div>
          <div style={styles.divider} />
        </div>

        <nav style={styles.navList}>
          {isHovered && <div style={styles.navHeading}>Workspace</div>}
          {navItems.map((item) => {
            const isActive = isRouteActive(item.path)
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                className={isActive ? 'cb-nav-item active' : 'cb-nav-item'}
                style={{
                  ...styles.navItem,
                  justifyContent: isHovered ? 'flex-start' : 'center',
                  padding: isHovered ? '0 14px' : '0',
                }}
              >
                {isActive && <div style={styles.activeBackground} />}
                <div
                  style={{
                    ...styles.navIconBox,
                    color: isActive ? '#F59E0B' : '#64748B',
                    background: isActive ? 'rgba(245,158,11,0.12)' : 'transparent',
                  }}
                >
                  <Icon path={item.icon} size={18} strokeWidth={isActive ? 2 : 1.8} />
                </div>
                {isHovered && (
                  <span
                    style={{
                      ...styles.navLabel,
                      color: isActive ? '#111827' : '#64748B',
                      fontWeight: isActive ? '700' : '500',
                    }}
                  >
                    {item.label}
                  </span>
                )}
                {isActive && isHovered && <div style={styles.activeDot} />}
              </div>
            )
          })}
        </nav>

        {isHovered && (
          <div style={styles.statsBox}>
            <div style={styles.statsHeader}>
              <div>
                <div style={styles.statsTitle}>At a glance</div>
                <div style={styles.statsSubtitle}>Your recruitment activity</div>
              </div>
              <div style={styles.statsSpark}>
                <Icon path={icons.sparkle} size={15} />
              </div>
            </div>
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <div style={styles.statIcon}><Icon path={icons.usersSmall} size={16} /></div>
                <div>
                  <div style={styles.statNumber}>{totalApplicants}</div>
                  <div style={styles.statLabel}>Applicants</div>
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statIcon}><Icon path={icons.briefcase} size={15} /></div>
                <div>
                  <div style={styles.statNumber}>{jobs.length}</div>
                  <div style={styles.statLabel}>Active jobs</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={styles.bottomSection}>
          <div
            style={{
              ...styles.profileCard,
              justifyContent: isHovered ? 'flex-start' : 'center',
            }}
          >
            <div style={styles.avatarWrapper}>
              <div style={styles.userAvatar}>{initials(profile?.full_name || 'Employer')}</div>
              <div style={styles.onlineDot} />
            </div>
            {isHovered && (
              <div style={styles.userInfo}>
                <div style={styles.userName}>{profile?.full_name || 'Employer'}</div>
                <div style={styles.userRole}>Employer account</div>
              </div>
            )}
          </div>

          <div
            onClick={handleLogout}
            className="cb-logout"
            style={{
              ...styles.logoutWrapper,
              justifyContent: isHovered ? 'flex-start' : 'center',
              padding: isHovered ? '0 14px' : '0',
            }}
          >
            <div style={styles.logoutIconWrapper}>
              <Icon path={icons.logout} size={17} />
            </div>
            {isHovered && <span style={styles.logoutLabel}>Sign out</span>}
            {isHovered && (
              <Icon path={icons.chevron} size={14} style={{ marginLeft: 'auto', opacity: 0.4 }} />
            )}
          </div>
        </div>
      </aside>

      <main
        style={{
          ...styles.contentArea,
          marginLeft: isHovered ? '272px' : '82px',
        }}
      >
        <Outlet />
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes cbFadeIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
        @keyframes cbPulse { 0%,100% { opacity:.45; transform:scale(1); } 50% { opacity:.8; transform:scale(1.04); } }
        @keyframes cbFloat { 0%,100% { transform:translate3d(0,0,0) scale(1); } 50% { transform:translate3d(15px,-10px,0) scale(1.04); } }
        .cb-nav-item { transition: transform .22s cubic-bezier(.2,.8,.2,1), background .22s ease; }
        .cb-nav-item:hover { transform: translateX(3px); background: rgba(15,23,42,.035); }
        .cb-nav-item.active:hover { transform: translateX(3px); }
        .cb-logout { transition: background .2s ease, color .2s ease, transform .2s ease; }
        .cb-logout:hover { background: rgba(239,68,68,.06); color: #DC2626; transform: translateX(2px); }
        @media (max-width: 768px) { .cb-nav-item { min-height: 48px; } }
      `}</style>
    </div>
  )
}

// ============================================================
// 🎨 PREMIUM LAYOUT STYLES
// ============================================================
const styles = {
  mainWrapper: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    background: '#F8FAFC',
    fontFamily: "'Inter', -apple-system, sans-serif",
    position: 'relative',
    overflowX: 'hidden',
  },
  backgroundLayer: {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  meshOne: {
    position: 'absolute',
    width: '700px', height: '700px',
    top: '-300px', right: '-180px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,158,11,.085), transparent 68%)',
    filter: 'blur(20px)',
    animation: 'cbFloat 18s ease-in-out infinite',
  },
  meshTwo: {
    position: 'absolute',
    width: '650px', height: '650px',
    bottom: '-350px', left: '-220px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,.055), transparent 68%)',
    filter: 'blur(25px)',
    animation: 'cbFloat 23s ease-in-out infinite reverse',
  },
  meshThree: {
    position: 'absolute',
    width: '500px', height: '500px',
    top: '40%', right: '20%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,.035), transparent 68%)',
    filter: 'blur(30px)',
  },
  noiseLayer: {
    position: 'absolute',
    inset: 0,
    opacity: 0.025,
    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 180 180\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'.4\'/%3E%3C/svg%3E")',
  },
  gridPattern: {
    position: 'absolute',
    inset: 0,
    opacity: 0.35,
    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(15,23,42,.035) 1px, transparent 0)',
    backgroundSize: '34px 34px',
  },

  // ✅ FIXED SIDEBAR: Perfectly contained layout
  sidebar: {
    display: 'flex',
    flexDirection: 'column',

    /* Keeps the floating sidebar completely inside the viewport */
    height: 'calc(100vh - 32px)',
    minHeight: 0,
    boxSizing: 'border-box',

    margin: '16px 0 16px 16px',
    padding: '20px 10px 12px',

    background: 'linear-gradient(145deg, rgba(255,255,255,.78), rgba(255,255,255,.56))',
    backdropFilter: 'blur(30px) saturate(150%)',
    WebkitBackdropFilter: 'blur(30px) saturate(150%)',

    border: '1px solid rgba(255,255,255,.82)',
    borderRadius: '26px',

    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,

    overflow: 'hidden',

    transition: 'width .34s cubic-bezier(.22,1,.36,1)',

    boxShadow: '0 25px 70px rgba(15,23,42,.08), 0 8px 24px rgba(15,23,42,.04), inset 0 1px 0 rgba(255,255,255,.95)',
  },

  sidebarTop: {
    width: '100%',
    flexShrink: 0,
  },

  navList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',

    /* This is the important part */
    flex: '1 1 auto',
    minHeight: 0,

    width: '100%',

    /* Allows navigation to shrink instead of pushing Logout down */
    overflowY: 'auto',
    overflowX: 'hidden',

    /* Keeps scrollbar subtle */
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(148,163,184,.25) transparent',
  },

  logoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    minHeight: '48px',
    padding: '0 4px',
  },
  logoMark: {
    width: '46px', height: '46px', minWidth: '46px',
    borderRadius: '15px',
    background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 45%, #D97706 100%)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 24px rgba(245,158,11,.24), inset 0 1px 0 rgba(255,255,255,.35)',
    transition: 'transform .3s cubic-bezier(.2,.8,.2,1)',
  },
  brandContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    minWidth: 0,
    animation: 'cbFadeIn .25s ease forwards',
  },
  logoText: {
    fontSize: '20px', lineHeight: 1, fontWeight: '800',
    letterSpacing: '-.7px', color: '#0F172A', whiteSpace: 'nowrap',
  },
  brandTag: {
    marginTop: '5px', fontSize: '8px', lineHeight: 1,
    fontWeight: '800', letterSpacing: '1.5px', color: '#F59E0B',
  },
  divider: {
    height: '1px',
    margin: '20px 8px 18px',
    background: 'linear-gradient(90deg, transparent, rgba(148,163,184,.22), transparent)',
  },
  navHeading: {
    padding: '0 14px 9px',
    fontSize: '9px', fontWeight: '800', color: '#94A3B8',
    textTransform: 'uppercase', letterSpacing: '1.4px',
    animation: 'cbFadeIn .25s ease forwards',
  },
  navItem: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '50px',
    borderRadius: '15px',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  activeBackground: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(90deg, rgba(245,158,11,.13), rgba(245,158,11,.055))',
    border: '1px solid rgba(245,158,11,.10)',
    borderRadius: '15px',
    pointerEvents: 'none',
  },
  navIconBox: {
    position: 'relative', zIndex: 2,
    width: '36px', height: '36px', minWidth: '36px',
    borderRadius: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all .22s ease',
  },
  navLabel: {
    position: 'relative', zIndex: 2,
    fontSize: '13.5px', lineHeight: 1,
    letterSpacing: '-.15px', whiteSpace: 'nowrap',
    marginLeft: '11px',
    animation: 'cbFadeIn .25s ease forwards',
  },
  activeDot: {
    position: 'absolute',
    right: '13px',
    width: '5px', height: '5px',
    borderRadius: '50%',
    background: '#F59E0B',
    boxShadow: '0 0 0 4px rgba(245,158,11,.08), 0 0 12px rgba(245,158,11,.35)',
    animation: 'cbPulse 2s ease-in-out infinite',
  },

  // ✅ FIXED: Shrinkable stats box
  statsBox: {
    flexShrink: 0,
    margin: '12px 4px 12px',
    padding: '16px',
    borderRadius: '18px',
    background: 'linear-gradient(145deg, rgba(255,255,255,.75), rgba(248,250,252,.55))',
    border: '1px solid rgba(255,255,255,.8)',
    boxShadow: '0 12px 30px rgba(15,23,42,.045)',
    animation: 'cbFadeIn .28s ease forwards',
  },
  statsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px',
  },
  statsTitle: { fontSize: '11px', fontWeight: '800', color: '#334155', letterSpacing: '.3px' },
  statsSubtitle: { marginTop: '3px', fontSize: '9px', color: '#94A3B8', fontWeight: '500' },
  statsSpark: {
    width: '28px', height: '28px',
    borderRadius: '9px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#F59E0B',
    background: 'rgba(245,158,11,.10)',
  },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  statItem: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '9px',
    borderRadius: '12px',
    background: 'rgba(248,250,252,.75)',
  },
  statIcon: {
    width: '28px', height: '28px', minWidth: '28px',
    borderRadius: '9px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#64748B',
    background: '#FFFFFF',
  },
  statNumber: { fontSize: '15px', fontWeight: '800', lineHeight: 1, color: '#0F172A' },
  statLabel: { marginTop: '4px', fontSize: '8px', fontWeight: '600', color: '#94A3B8', whiteSpace: 'nowrap' },

  // ✅ FIXED: Pinned to bottom
  bottomSection: {
    width: '100%',
    marginTop: 'auto',
    paddingTop: '8px',
    flexShrink: 0,
  },
  profileCard: {
    display: 'flex', alignItems: 'center', gap: '10px',
    minHeight: '58px', padding: '8px 8px',
    borderRadius: '15px',
    transition: 'background .2s ease',
  },
  avatarWrapper: { position: 'relative' },
  userAvatar: {
    width: '40px', height: '40px', minWidth: '40px',
    borderRadius: '13px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)',
    color: '#334155', fontSize: '12px', fontWeight: '800',
    border: '1px solid rgba(255,255,255,.9)',
    boxShadow: '0 5px 15px rgba(15,23,42,.06)',
  },
  onlineDot: {
    position: 'absolute',
    right: '-1px', bottom: '-1px',
    width: '10px', height: '10px',
    borderRadius: '50%',
    background: '#22C55E',
    border: '2px solid #FFFFFF',
    boxShadow: '0 0 0 2px rgba(34,197,94,.08)',
  },
  userInfo: { minWidth: 0, animation: 'cbFadeIn .25s ease forwards' },
  userName: {
    maxWidth: '160px',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    fontSize: '12.5px', fontWeight: '700', color: '#0F172A',
  },
  userRole: { marginTop: '3px', fontSize: '9.5px', fontWeight: '500', color: '#94A3B8' },
  logoutWrapper: {
    display: 'flex', alignItems: 'center',
    width: '100%', height: '42px',
    borderRadius: '13px',
    cursor: 'pointer',
    color: '#64748B',
    marginTop: '4px', fontWeight: '600',
  },
  logoutIconWrapper: {
    width: '36px', height: '36px', minWidth: '36px',
    borderRadius: '11px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all .2s ease',
  },
  logoutLabel: { marginLeft: '11px', fontSize: '13px', animation: 'cbFadeIn .25s ease forwards' },
  
  // Content
  contentArea: {
    flex: '1 1 auto',
    minWidth: 0,
    width: 'auto',
    maxWidth: 'none',
    boxSizing: 'border-box',
    padding: '32px 40px',
    position: 'relative',
    transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  }
}