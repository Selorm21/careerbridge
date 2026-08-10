// src/components/EmployerLayout.jsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

// ---------- inline icon set ----------
const Icon = ({ path, size = 18, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {path}
  </svg>
)
const icons = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.3 3-6 6.5-6s6.5 2.7 6.5 6" /><path d="M16 8.2a3 3 0 1 1 3.6 3M21.5 20c0-2.6-1.8-4.8-4.3-5.6" /></>,
  star: <path d="M12 3.5l2.5 5.5 6 .7-4.4 4.2 1.2 6-5.3-3-5.3 3 1.2-6-4.4-4.2 6-.7z" />,
  trophy: <><path d="M8 21h8M12 17v4" /><path d="M7 4h10v6a5 5 0 0 1-10 0V4z" /><path d="M7 5H4a3 3 0 0 0 3 4M17 5h3a3 3 0 0 1-3 4" /></>,
  inbox: <><path d="M3 12h4l2 3h6l2-3h4" /><path d="M5 5h14l2 7v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7z" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>,
}

export default function EmployerLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isHovered, setIsHovered] = useState(false)
  const [jobs, setJobs] = useState([])
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)
      const { data: jobsData } = await supabase.from('jobs').select('*').eq('employer_id', user.id)
      setJobs(jobsData || [])
    }
    getData()
  }, [])

  async function handleLogout() { 
    await supabase.auth.signOut()
    navigate('/')
  }

  const navItems = [
    { path: '/employer', icon: icons.grid, label: 'Overview' },
    { path: '/post-job', icon: icons.plus, label: 'Post a Job' },
    { path: '/browse-jobs', icon: icons.search, label: 'Browse All Jobs' },
    { path: '/analytics', icon: icons.grid, label: 'Analytics' },
  ]

  const initials = (name) => (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div style={styles.mainWrapper}>
      
      {/* 🌟 Ambient Glowing Background */}
      <div style={styles.bgEffects}>
        <div style={styles.glowOrb1} className="glowPulse"></div>
        <div style={styles.glowOrb2} className="glowPulse"></div>
        <div style={styles.gridPattern}></div>
      </div>

      {/* ============================================
          FLOATING SIDEBAR
      ============================================ */}
      <div 
        style={{
          ...styles.sidebar,
          width: isHovered ? '220px' : '80px',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoMark}><Icon path={icons.grid} size={16} /></div>
          {isHovered && <span style={styles.logoText}>CareerBridge</span>}
        </div>

        {/* Navigation */}
        <div style={styles.navList}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/employer' && location.pathname === '/employer')
            return (
              <div 
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  ...styles.navItem,
                  background: isActive ? 'rgba(17, 24, 39, 0.05)' : 'transparent',
                  justifyContent: isHovered ? 'flex-start' : 'center',
                  padding: isHovered ? '0 16px' : '0',
                }}
              >
                <div style={styles.navIconBox}>
                  <Icon path={item.icon} size={17} color={isActive ? '#0F172A' : '#94A3B8'} />
                </div>
                {isHovered && (
                  <span style={{
                    ...styles.navLabel,
                    color: isActive ? '#0F172A' : '#64748B',
                    fontWeight: isActive ? '700' : '500',
                    marginLeft: '12px',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.label}
                  </span>
                )}
                {isActive && <div style={styles.activeIndicator} />}
              </div>
            )
          })}
        </div>

        {/* Stats Box (Only visible when expanded) */}
        {isHovered && (
          <div style={styles.statsBox}>
            <div style={styles.statsBoxTitle}>At a glance</div>
            <div style={styles.statsBoxRow}><span style={styles.statsBoxLabel}>Active jobs</span><span style={styles.statsBoxVal}>{jobs.length}</span></div>
          </div>
        )}

        {/* Footer */}
        <div style={styles.sidebarFooter}>
          <div style={styles.userAvatar}>{initials(profile?.full_name || 'E')}</div>
          {isHovered && (
            <div>
              <div style={styles.userName}>{profile?.full_name || 'Employer'}</div>
              <div style={styles.userRole}>Employer</div>
            </div>
          )}
        </div>
        <div style={styles.logoutWrapper} onClick={handleLogout}>
          <Icon path={icons.logout} size={15} color="#94A3B8" />
          {isHovered && <span style={styles.logoutLabel}>Log out</span>}
        </div>
      </div>

      {/* ============================================
          RIGHT SIDE CONTENT
      ============================================ */}
      <div style={{
        ...styles.contentArea,
        marginLeft: isHovered ? '220px' : '80px',
      }}>
        <Outlet />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes pulseGlow{0%,100%{opacity:0.3}50%{opacity:0.6}}
        @keyframes fadeIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        .glowPulse{animation:pulseGlow 6s ease-in-out infinite}
      `}</style>
    </div>
  )
}

// ============================================
// 🎨 PREMIUM STYLES
// ============================================
const styles = {
  mainWrapper: {
    display: 'flex',
    minHeight: '100vh',
    background: '#F8FAFC',
    fontFamily: "'Inter', -apple-system, sans-serif",
    position: 'relative'
  },

  // Ambient Background Effects
  bgEffects: {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  glowOrb1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06), transparent 70%)',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: '-20%',
    left: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.04), transparent 70%)',
  },
  gridPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)',
    backgroundSize: '32px 32px',
  },

  // ============================================
  // 🧩 SIDEBAR STYLES
  // ============================================
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    padding: '24px 0',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.5)',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
    overflowY: 'auto',
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 0 20px rgba(0,0,0,0.02)',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '40px',
    width: '100%',
    padding: '0 16px',
  },
  logoMark: { 
    width: '40px', 
    height: '40px', 
    minWidth: '40px', 
    borderRadius: '12px', 
    background: '#0F172A', 
    color: '#fff', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(15,23,42,0.15)' 
  },
  logoText: { 
    fontSize: '20px', 
    fontWeight: '800', 
    color: '#0F172A', 
    letterSpacing: '-0.5px',
    animation: 'fadeIn 0.3s ease forwards' 
  },
  navList: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, width: '100%' },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '48px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  navIconBox: {
    width: '32px',
    height: '32px',
    minWidth: '32px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: { fontSize: '14px', lineHeight: '1', animation: 'fadeIn 0.3s ease forwards' },
  activeIndicator: {
    position: 'absolute',
    right: '6px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '4px',
    height: '20px',
    borderRadius: '2px',
    background: '#EA4E1B',
  },

  // Stats Box
  statsBox: { margin: '16px 16px 0', padding: '16px', background: 'rgba(248, 250, 252, 0.5)', borderRadius: '12px', animation: 'fadeIn 0.3s ease forwards' },
  statsBoxTitle: { fontSize: '11px', fontWeight: '700', color: '#94A3B8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.8px' },
  statsBoxRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  statsBoxLabel: { fontSize: '12.5px', color: '#475569', fontWeight: '500' },
  statsBoxVal: { fontSize: '13px', fontWeight: '800', color: '#0F172A' },

  // Footer / User
  sidebarFooter: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderTop: '1px solid rgba(226, 232, 240, 0.4)', marginTop: '10px' },
  userAvatar: { width: '34px', height: '34px', borderRadius: '10px', background: '#F1F5F9', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' },
  userName: { fontSize: '13.5px', fontWeight: '700', color: '#0F172A' },
  userRole: { fontSize: '12px', color: '#94A3B8' },
  logoutWrapper: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '0 16px', marginTop: '16px', cursor: 'pointer', color: '#64748B', fontWeight: '600', transition: 'color 0.2s' },
  logoutLabel: { fontSize: '14px', animation: 'fadeIn 0.3s ease forwards' },

  // ============================================
  // 📄 CONTENT AREA
  // ============================================
  contentArea: {
    flex: 1,
    padding: '32px 40px',
    maxWidth: '1440px',
    position: 'relative',
    width: '100%',
    transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  }
}