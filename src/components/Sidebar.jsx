import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Sidebar({ profile, role, activeTab, onTabChange, navItems, showLogout = true }) {
  const navigate = useNavigate()

  // Get avatar initials
  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Color schemes per role
  const roleColors = {
    student: 'linear-gradient(135deg, #4F46E5, #6366F1)',
    employer: 'linear-gradient(135deg, #EA580C, #F97316)',
    coordinator: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
    admin: 'linear-gradient(135deg, #DC2626, #F87171)'
  }

  const roleLabels = {
    student: 'Student',
    employer: 'Employer',
    coordinator: 'University Coordinator',
    admin: 'Administrator'
  }

  return (
    <aside style={S.sidebar}>
      {/* Logo Section */}
      <div style={S.sidebarTop}>
        <div style={S.sidebarLogo}>CareerBridge</div>
        <div style={S.avatarWrap}>
          <div style={{ ...S.avatar, background: roleColors[role] || roleColors.student }}>
            {getInitials(profile?.full_name || 'User')}
          </div>
          <div>
            <div style={S.avatarName}>{profile?.full_name || 'User'}</div>
            <div style={S.avatarRole}>{roleLabels[role] || 'User'}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={S.sideNav}>
        {navItems && navItems.map((item) => (
          <div
            key={item.id}
            className="sideBtn"
            style={{
              ...S.sideNavItem,
              ...(activeTab === item.id ? S.sideNavActive : {})
            }}
            onClick={() => {
              if (item.action) {
                item.action()
              } else if (item.path) {
                navigate(item.path)
              } else if (onTabChange) {
                onTabChange(item.id)
              }
            }}
          >
            <span style={S.sideNavIcon}>{item.icon}</span>
            {item.label}
            {item.badge && <span style={S.navBadge}>{item.badge}</span>}
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      {showLogout && (
        <button
          style={S.logoutBtn}
          onClick={() => supabase.auth.signOut()}
        >
          ← Log out
        </button>
      )}
    </aside>
  )
}

const S = {
  sidebar: {
    background: '#FFFFFF',
    borderRight: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 16px',
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto',
    boxSizing: 'border-box'
  },

  sidebarTop: {
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #E5E7EB'
  },

  sidebarLogo: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '16px',
    letterSpacing: '-0.3px'
  },

  avatarWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    flexShrink: 0
  },

  avatarName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#111827',
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  avatarRole: {
    fontSize: '12px',
    color: '#6B7280',
    marginTop: '2px'
  },

  sideNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    marginBottom: '16px'
  },

  sideNavItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '10px',
    border: 'none',
    background: 'transparent',
    color: '#4B5563',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    position: 'relative'
  },

  sideNavActive: {
    background: '#EFF6FF',
    color: '#2563EB'
  },

  sideNavIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    fontSize: '16px',
    flexShrink: 0
  },

  navBadge: {
    marginLeft: 'auto',
    background: '#DC2626',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '6px',
    minWidth: '20px',
    textAlign: 'center'
  },

  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    background: 'transparent',
    border: '1px solid #E5E7EB',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    color: '#4B5563',
    transition: 'all 0.15s ease',
    marginTop: 'auto'
  }
}
