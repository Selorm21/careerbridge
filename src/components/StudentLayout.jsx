// src/components/StudentLayout.jsx
import { Outlet, useLocation, Link } from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '../supabase'
import { 
  LayoutGrid, Search, Sparkles, FileText, CalendarClock, 
  UserCircle, LogOut, Rocket 
} from 'lucide-react'

export default function StudentLayout() {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const navItems = [
    { path: '/student', icon: LayoutGrid, label: 'Overview' },
    { path: '/student/browse-jobs', icon: Search, label: 'Browse Jobs' },
    { path: '/student/analytics', icon: Sparkles, label: 'Analytics' },
    { path: '/student/resume-builder', icon: FileText, label: 'Resume' },
    { path: '/student/documents', icon: CalendarClock, label: 'Documents' },
    { path: '/student/profile', icon: UserCircle, label: 'Profile' },
  ];

  return (
    <div style={styles.mainWrapper}>
      
      {/* SIDEBAR */}
      <div 
        style={{
          ...styles.sidebar,
          width: isHovered ? '220px' : '80px',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Logo */}
        <div style={styles.logoWrapper}>
          <div style={styles.logoIcon}>
            <Rocket size={24} color="#fff" />
          </div>
          {isHovered && <span style={styles.brandText}>CareerBridge</span>}
        </div>

        {/* Navigation Links */}
        <div style={styles.navContainer}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                style={{
                  ...styles.navItem,
                  background: isActive ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                  justifyContent: isHovered ? 'flex-start' : 'center',
                  padding: isHovered ? '0 24px' : '0',
                  textDecoration: 'none',
                }}
              >
                <div style={{
                  ...styles.navIconBox,
                  background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                }}>
                  <item.icon 
                    size={20} 
                    color={isActive ? '#6366F1' : '#94A3B8'} 
                  />
                </div>
                
                {isHovered && (
                  <span style={{
                    ...styles.navLabel,
                    color: isActive ? '#4338CA' : '#64748B',
                    fontWeight: isActive ? '600' : '500',
                    marginLeft: '12px',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.label}
                  </span>
                )}
                
                {isActive && <div style={styles.activeIndicator} />}
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <div style={styles.logoutSection}>
          <div 
            onClick={() => supabase.auth.signOut()}
            style={{
              ...styles.navItem,
              justifyContent: isHovered ? 'flex-start' : 'center',
              padding: isHovered ? '0 24px' : '0',
              cursor: 'pointer',
            }}
          >
            <div style={styles.navIconBox}>
              <LogOut size={20} color="#94A3B8" />
            </div>
            {isHovered && (
              <span style={{...styles.navLabel, marginLeft: '12px', whiteSpace: 'nowrap', color: '#64748B'}}>
                Log Out
              </span>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE CONTENT */}
      <div style={{
        ...styles.contentArea,
        marginLeft: isHovered ? '220px' : '80px',
      }}>
        <Outlet />
      </div>
    </div>
  );
}

const styles = {
  mainWrapper: {
    display: 'flex',
    minHeight: '100vh',
    background: '#F8FAFC',
    fontFamily: "'Inter', sans-serif",
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    padding: '24px 0',
    background: '#FFFFFF',
    borderRight: '1px solid #F1F5F9',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
    overflowY: 'auto',
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '2px 0 12px rgba(0,0,0,0.03)',
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '40px',
    gap: '12px',
    width: '100%',
    padding: '0 16px',
  },
  logoIcon: {
    width: '48px',
    height: '48px',
    minWidth: '48px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
  },
  brandText: {
    fontSize: '20px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'fadeIn 0.3s ease forwards',
  },
  navContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
    width: '100%',
  },
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
  navLabel: {
    fontSize: '14px',
    lineHeight: '1',
    animation: 'fadeIn 0.3s ease forwards',
  },
  activeIndicator: {
    position: 'absolute',
    right: '6px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '4px',
    height: '20px',
    borderRadius: '2px',
    background: '#6366F1',
  },
  logoutSection: {
    marginTop: 'auto',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '16px',
    borderTop: '1px solid #F1F5F9',
  },
  contentArea: {
    flex: 1,
    padding: '24px 32px',
    maxWidth: '1440px',
    position: 'relative',
    width: '100%',
    transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  }
};