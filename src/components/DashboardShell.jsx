// src/components/DashboardShell.jsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useMediaQuery from '../hooks/useMediaQuery';

/**
 * Shared dashboard shell:
 *  - Desktop: hover-expand rail sidebar
 *  - Mobile: top bar + slide-in drawer
 *
 * Nav item shape:
 *   { path?, label, icon, badge?, exact?, active?, onClick? }
 *
 *   - If item.onClick is provided → calls it instead of navigating
 *   - If item.active is provided → uses it directly (for tab-based nav)
 *   - Otherwise → uses isActive(item.path) for route-based nav
 */
export default function DashboardShell({
  brandLabel = 'CAREERBRIDGE',
  accent = '#EA4E1B',
  navItems = [],
  profile = null,
  onLogout,
  logoMark,
  children,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 900px)');

  const [isHovered, setIsHovered] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Close drawer on Escape
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  // ---- Route-based active check ----
  const isActive = (path, exact = false) => {
    // Items without a path (tab-based) are never route-active
    if (!path) return false;
    // Ignore hash-only "paths" used by tab nav
    if (path.startsWith('#')) return false;
    if (exact) return location.pathname === path;
    if (path === '/' || path === '') return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // ---- Item click handler ----
  const handleNavClick = (item) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path && !item.path.startsWith('#')) {
      navigate(item.path);
    }
    setDrawerOpen(false);
  };

  const initials = (name) => {
    if (!name) return 'U';
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const desktopWidth = isHovered ? 260 : 82;
  const contentMargin = isMobile ? 0 : desktopWidth;

  // ---- Resolve active state for any item ----
  const resolveActive = (item) => {
    if (item.active !== undefined) return item.active;
    return isActive(item.path, item.exact);
  };

  return (
    <div style={styles.wrapper}>
      {/* ============================================================
          MOBILE TOP BAR
          ============================================================ */}
      {isMobile && (
        <header style={styles.mobileBar}>
          <button
            type="button"
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            style={styles.burger}
            onClick={() => setDrawerOpen(true)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#0F172A" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <span style={styles.mobileBrand}>CareerBridge</span>
          <div style={{ width: 40 }} />
        </header>
      )}

      {/* ============================================================
          DESKTOP RAIL SIDEBAR
          ============================================================ */}
      {!isMobile && (
        <aside
          style={{
            ...styles.rail,
            width: desktopWidth,
            borderColor: `${accent}22`,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div style={styles.railTop}>
            <div
              style={{
                ...styles.logoMark,
                background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              }}
            >
              {logoMark}
            </div>
            {isHovered && (
              <div style={styles.brandCol}>
                <span style={styles.brandName}>CareerBridge</span>
                <span style={{ ...styles.brandTag, color: accent }}>
                  {brandLabel}
                </span>
              </div>
            )}
          </div>

          <nav style={styles.railNav}>
            {navItems.map((item, idx) => {
              const active = resolveActive(item);
              return (
                <button
                  key={item.path || item.label || idx}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  style={{
                    ...styles.railItem,
                    justifyContent: isHovered ? 'flex-start' : 'center',
                    padding: isHovered ? '0 14px' : 0,
                    background: active ? `${accent}18` : 'transparent',
                  }}
                  title={!isHovered ? item.label : undefined}
                >
                  <span
                    style={{
                      ...styles.railIcon,
                      color: active ? accent : '#64748B',
                    }}
                  >
                    {item.icon}
                  </span>
                  {isHovered && (
                    <span
                      style={{
                        ...styles.railLabel,
                        color: active ? '#0F172A' : '#475569',
                        fontWeight: active ? 700 : 500,
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                  {isHovered && item.badge != null && item.badge > 0 && (
                    <span
                      style={{
                        ...styles.railBadge,
                        background: active ? `${accent}30` : '#F1F5F9',
                        color: active ? accent : '#64748B',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div style={styles.railBottom}>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                style={{
                  ...styles.railItem,
                  justifyContent: isHovered ? 'flex-start' : 'center',
                  padding: isHovered ? '0 14px' : 0,
                  color: '#64748B',
                }}
                title={!isHovered ? 'Sign out' : undefined}
              >
                <span style={styles.railIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <path d="M16 17l5-5-5-5" />
                    <path d="M21 12H9" />
                  </svg>
                </span>
                {isHovered && <span style={styles.railLabel}>Sign out</span>}
              </button>
            )}
          </div>
        </aside>
      )}

      {/* ============================================================
          MOBILE DRAWER
          ============================================================ */}
      {isMobile && drawerOpen && (
        <>
          <div
            style={styles.drawerOverlay}
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside
            style={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
          >
            <div style={styles.drawerHead}>
              <div
                style={{
                  ...styles.logoMark,
                  background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                }}
              >
                {logoMark}
              </div>
              <div style={styles.brandCol}>
                <span style={styles.brandName}>CareerBridge</span>
                <span style={{ ...styles.brandTag, color: accent }}>
                  {brandLabel}
                </span>
              </div>
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setDrawerOpen(false)}
                style={styles.drawerClose}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="#0F172A" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {profile?.full_name && (
              <div style={styles.drawerProfile}>
                <div
                  style={{
                    ...styles.drawerAvatar,
                    background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                  }}
                >
                  {initials(profile.full_name)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={styles.drawerName}>{profile.full_name}</div>
                  <div style={styles.drawerRole}>
                    {profile.role_label || brandLabel}
                  </div>
                </div>
              </div>
            )}

            <nav style={styles.drawerNav}>
              {navItems.map((item, idx) => {
                const active = resolveActive(item);
                return (
                  <button
                    key={item.path || item.label || idx}
                    type="button"
                    onClick={() => handleNavClick(item)}
                    style={{
                      ...styles.drawerItem,
                      background: active ? `${accent}14` : 'transparent',
                    }}
                  >
                    <span
                      style={{
                        ...styles.drawerIcon,
                        color: active ? accent : '#64748B',
                      }}
                    >
                      {item.icon}
                    </span>
                    <span
                      style={{
                        ...styles.drawerLabel,
                        color: active ? '#0F172A' : '#475569',
                        fontWeight: active ? 700 : 500,
                      }}
                    >
                      {item.label}
                    </span>
                    {item.badge != null && item.badge > 0 && (
                      <span
                        style={{
                          ...styles.railBadge,
                          background: active ? `${accent}30` : '#F1F5F9',
                          color: active ? accent : '#64748B',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {onLogout && (
              <div style={styles.drawerBottom}>
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    onLogout();
                  }}
                  style={styles.drawerLogout}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <path d="M16 17l5-5-5-5" />
                    <path d="M21 12H9" />
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </aside>
        </>
      )}

      {/* ============================================================
          CONTENT
          ============================================================ */}
      <main
        style={{
          ...styles.content,
          marginLeft: contentMargin,
          paddingTop: isMobile ? 76 : 0,
        }}
      >
        {children}
      </main>

      <style>{`
        @keyframes cbDrawerIn {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes cbOverlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    minHeight: '100dvh',
    width: '100%',
    background: '#F8FAFC',
    display: 'flex',
    position: 'relative',
  },

  // -------- Desktop rail --------
  rail: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100dvh - 32px)',
    minHeight: 0,
    boxSizing: 'border-box',
    margin: '16px 0 16px 16px',
    padding: '20px 10px 12px',
    background: 'linear-gradient(145deg, rgba(255,255,255,.78), rgba(255,255,255,.56))',
    backdropFilter: 'blur(30px) saturate(150%)',
    WebkitBackdropFilter: 'blur(30px) saturate(150%)',
    border: '1px solid rgba(255,255,255,.82)',
    borderRadius: 26,
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
    overflow: 'hidden',
    transition: 'width .34s cubic-bezier(.22,1,.36,1)',
    boxShadow:
      '0 25px 70px rgba(15,23,42,.08), 0 8px 24px rgba(15,23,42,.04), inset 0 1px 0 rgba(255,255,255,.95)',
  },
  railTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 4px',
    minHeight: 48,
    flexShrink: 0,
  },
  logoMark: {
    width: 46,
    height: 46,
    minWidth: 46,
    borderRadius: 15,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 24px rgba(15,23,42,.18), inset 0 1px 0 rgba(255,255,255,.35)',
  },
  brandCol: { display: 'flex', flexDirection: 'column', minWidth: 0 },
  brandName: {
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: '-.6px',
    color: '#0F172A',
    whiteSpace: 'nowrap',
  },
  brandTag: {
    marginTop: 4,
    fontSize: 8,
    fontWeight: 800,
    letterSpacing: 1.4,
  },
  railNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    marginTop: 20,
    flex: '1 1 auto',
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingTop: 12,
    borderTop: '1px solid rgba(148,163,184,.18)',
  },
  railItem: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: 48,
    borderRadius: 14,
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    transition: 'background .2s ease, transform .2s ease',
    textAlign: 'left',
  },
  railIcon: {
    width: 32,
    minWidth: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  railLabel: {
    marginLeft: 11,
    fontSize: 13.5,
    letterSpacing: '-.15px',
    whiteSpace: 'nowrap',
  },
  railBadge: {
    marginLeft: 'auto',
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 20,
  },
  railBottom: {
    marginTop: 'auto',
    paddingTop: 8,
    flexShrink: 0,
  },

  // -------- Content --------
  content: {
    flex: '1 1 auto',
    minWidth: 0,
    width: '100%',
    boxSizing: 'border-box',
    transition: 'margin-left .3s cubic-bezier(.4,0,.2,1)',
    padding: '32px 40px',
  },

  // -------- Mobile top bar --------
  mobileBar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 90,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px',
    background: 'rgba(255,255,255,.85)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    borderBottom: '1px solid rgba(226,232,240,.6)',
  },
  burger: {
    width: 40,
    height: 40,
    borderRadius: 10,
    border: '1px solid #E2E8F0',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileBrand: { fontSize: 16, fontWeight: 800, color: '#0F172A' },

  // -------- Drawer --------
  drawerOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,.5)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    zIndex: 200,
    animation: 'cbOverlayIn .2s ease forwards',
  },
  drawer: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: 'min(320px, 86vw)',
    background: '#fff',
    zIndex: 201,
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 16px',
    animation: 'cbDrawerIn .28s cubic-bezier(.2,.8,.2,1) forwards',
    boxShadow: '0 20px 60px rgba(15,23,42,.2)',
    overflowY: 'auto',
  },
  drawerHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    borderBottom: '1px solid #EEF2F7',
  },
  drawerClose: {
    marginLeft: 'auto',
    width: 40,
    height: 40,
    borderRadius: 10,
    border: '1px solid #E2E8F0',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 4px',
  },
  drawerAvatar: {
    width: 44,
    height: 44,
    minWidth: 44,
    borderRadius: 14,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    fontWeight: 800,
  },
  drawerName: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0F172A',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  drawerRole: { fontSize: 12, color: '#64748B', marginTop: 2 },
  drawerNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: '1 1 auto',
    minHeight: 0,
  },
  drawerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    minHeight: 48,
    padding: '0 12px',
    borderRadius: 12,
    border: 'none',
    textAlign: 'left',
    transition: 'background .2s ease',
  },
  drawerIcon: {
    width: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  drawerLabel: { fontSize: 14.5, whiteSpace: 'nowrap' },
  drawerBottom: {
    marginTop: 'auto',
    paddingTop: 16,
    borderTop: '1px solid #EEF2F7',
  },
  drawerLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    minHeight: 48,
    padding: '0 12px',
    borderRadius: 12,
    border: 'none',
    background: 'transparent',
    color: '#DC2626',
    fontSize: 14.5,
    fontWeight: 600,
    textAlign: 'left',
  },
};