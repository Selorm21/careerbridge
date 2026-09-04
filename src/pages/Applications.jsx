import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import {
  Search, ListChecks, Clock, MapPin, Briefcase, 
  ChevronRight, Filter, X, Calendar, ArrowUpDown,
  CheckCircle2, Clock as ClockIcon, XCircle, CalendarCheck
} from 'lucide-react'

// ============================================
// 🎨 DESIGN SYSTEM (matches StudentDashboard)
// ============================================
const DESIGN = {
  colors: {
    primary: {
      50: '#EEF2FF',
      100: '#E0E7FF',
      200: '#C7D2FE',
      300: '#A5B4FC',
      400: '#818CF8',
      500: '#6366F1',
      600: '#4F46E5',
      700: '#4338CA',
      800: '#3730A3',
      900: '#312E81',
    },
    gradients: {
      cosmic: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
      ocean: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #10B981 100%)',
    },
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    gray: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    }
  },
  shadows: {
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
}

export default function Applications() {
  const [applications, setApplications] = useState([])
  const [filteredApps, setFilteredApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchApplications() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs (
            id,
            title,
            company,
            location,
            type,
            created_at
          )
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching applications:', error)
      } else {
        setApplications(data || [])
        setFilteredApps(data || [])
      }
      setLoading(false)
    }

    fetchApplications()
  }, [])

  // Filter and search logic
  useEffect(() => {
    let result = [...applications]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(app => 
        app.jobs?.title?.toLowerCase().includes(query) ||
        app.jobs?.company?.toLowerCase().includes(query) ||
        app.jobs?.location?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(app => app.status === statusFilter)
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    } else if (sortBy === 'company') {
      result.sort((a, b) => (a.jobs?.company || '').localeCompare(b.jobs?.company || ''))
    }

    setFilteredApps(result)
  }, [searchQuery, statusFilter, sortBy, applications])

  function getStatusStyle(status) {
    const statusMap = {
      'applied': { bg: '#EEF2FF', color: '#6366F1', dot: '#6366F1', label: 'Applied', icon: ClockIcon },
      'interview': { bg: '#FEF3C7', color: '#D97706', dot: '#D97706', label: 'Interview', icon: CalendarCheck },
      'offer': { bg: '#D1FAE5', color: '#059669', dot: '#059669', label: 'Offer', icon: CheckCircle2 },
      'rejected': { bg: '#FEE2E2', color: '#DC2626', dot: '#DC2626', label: 'Rejected', icon: XCircle },
    }
    return statusMap[status] || statusMap['applied']
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'applied', label: 'Applied' },
    { value: 'interview', label: 'Interview' },
    { value: 'offer', label: 'Offer' },
    { value: 'rejected', label: 'Rejected' },
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'company', label: 'By Company' },
  ]

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingOrbit}>
          <div style={styles.loadingOrbitRing} />
          <div style={styles.loadingOrbitRing} />
          <div style={styles.loadingOrbitRing} />
          <div style={styles.loadingCenter} />
        </div>
        <p style={styles.loadingText}>Loading your applications...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* 🌟 Background Effects */}
      <div style={styles.backgroundEffects}>
        <div style={styles.glowOrb1} />
        <div style={styles.glowOrb2} />
        <div style={styles.gridPattern} />
      </div>

      {/* 📋 Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerBadge}>
            <ListChecks size={14} color={DESIGN.colors.primary[500]} />
            My Applications
          </div>
          <h1 style={styles.headerTitle}>All Applications</h1>
          <p style={styles.headerSubtitle}>
            Track all your job applications in one place
          </p>
        </div>
        <div style={styles.headerStats}>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{applications.length}</span>
            <span style={styles.statLabel}>Total Applied</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>
              {applications.filter(a => a.status === 'interview').length}
            </span>
            <span style={styles.statLabel}>Interviews</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>
              {applications.filter(a => a.status === 'offer').length}
            </span>
            <span style={styles.statLabel}>Offers</span>
          </div>
        </div>
      </div>

      {/* 🔍 Search & Filters */}
      <div style={styles.filterSection}>
        <div style={styles.searchWrapper}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by job title, company, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery && (
            <button 
              style={styles.clearBtn}
              onClick={() => setSearchQuery('')}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div style={styles.filterControls}>
          <div style={styles.filterGroup}>
            <Filter size={16} style={styles.filterIcon} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.select}
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <ArrowUpDown size={16} style={styles.filterIcon} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.select}
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 📄 Results Count */}
      <div style={styles.resultsCount}>
        <span>
          Showing <strong>{filteredApps.length}</strong> of <strong>{applications.length}</strong> applications
        </span>
      </div>

      {/* 📋 Applications List */}
      {filteredApps.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyStateIcon}>📭</div>
          <h3 style={styles.emptyStateTitle}>No applications found</h3>
          <p style={styles.emptyStateSub}>
            {searchQuery || statusFilter !== 'all' 
              ? "Try adjusting your search or filters"
              : "You haven't applied to any jobs yet. Start browsing!"}
          </p>
          <button 
            style={styles.emptyStateBtn}
            onClick={() => navigate('/student/browse-jobs')}
          >
            Browse Jobs
            <ChevronRight size={16} />
          </button>
        </div>
      ) : (
        <div style={styles.applicationsGrid}>
          {filteredApps.map((app) => {
            const status = getStatusStyle(app.status)
            const StatusIcon = status.icon
            return (
              <div 
                key={app.id} 
                style={styles.applicationCard}
                className="application-card"
                onClick={() => navigate(`/student/application/${app.id}`)}
              >
                <div style={styles.cardLeft}>
                  <div style={{...styles.companyAvatar, background: status.bg, color: status.color}}>
                    {app.jobs?.company?.charAt(0) || 'J'}
                  </div>
                  <div style={styles.cardContent}>
                    <h4 style={styles.jobTitle}>{app.jobs?.title || 'Unknown Position'}</h4>
                    <div style={styles.companyInfo}>
                      <Briefcase size={14} color={DESIGN.colors.gray[400]} />
                      <span>{app.jobs?.company || 'Unknown Company'}</span>
                    </div>
                    <div style={styles.metaInfo}>
                      <div style={styles.metaItem}>
                        <MapPin size={14} color={DESIGN.colors.gray[400]} />
                        <span>{app.jobs?.location || 'Location not specified'}</span>
                      </div>
                      <div style={styles.metaItem}>
                        <Calendar size={14} color={DESIGN.colors.gray[400]} />
                        <span>Applied {formatDate(app.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={styles.cardRight}>
                  <div style={{...styles.statusBadge, background: status.bg, color: status.color}}>
                    <StatusIcon size={14} />
                    {status.label}
                  </div>
                  <button 
                    style={styles.viewBtn}
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/student/application/${app.id}`)
                    }}
                  >
                    View Details
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        * { box-sizing: border-box; }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #F8FAFC;
          margin: 0;
        }

        @keyframes orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        .application-card {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
        }
        
        .application-card:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 20px 40px rgba(99, 102, 241, 0.1);
          border-color: #6366F1;
        }

        @media (max-width: 768px) {
          .container { padding: 16px !important; }
          .header { flex-direction: column !important; align-items: stretch !important; gap: 16px !important; }
          .headerStats { flex-direction: row !important; }
          .filterSection { flex-direction: column !important; }
          .filterControls { flex-direction: column !important; width: 100% !important; }
          .filterGroup { width: 100% !important; }
          .applicationCard { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
          .cardRight { flex-direction: row !important; justify-content: space-between !important; align-items: center !important; }
          .statCard { padding: 8px 12px !important; }
          .statNumber { font-size: 20px !important; }
        }
      `}</style>
    </div>
  )
}

// ============================================
// 🎨 STYLES (matches StudentDashboard)
// ============================================
const styles = {
  container: {
    padding: '24px 32px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: "'Inter', -apple-system, sans-serif",
    position: 'relative',
  },

  backgroundEffects: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 0,
    overflow: 'hidden',
  },
  glowOrb1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08), transparent 70%)',
    animation: 'glow-pulse 8s ease-in-out infinite',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: '-20%',
    left: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.06), transparent 70%)',
    animation: 'glow-pulse 10s ease-in-out infinite reverse',
  },
  gridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.05) 1px, transparent 0)',
    backgroundSize: '40px 40px',
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '24px',
    position: 'relative',
    zIndex: 1,
  },
  loadingOrbit: {
    position: 'relative',
    width: '60px',
    height: '60px',
  },
  loadingOrbitRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    border: '3px solid transparent',
    borderRadius: '50%',
    borderTopColor: DESIGN.colors.primary[500],
    animation: 'orbit 1.2s linear infinite',
  },
  loadingCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: DESIGN.colors.gradients.cosmic,
  },
  loadingText: {
    fontSize: '14px',
    color: DESIGN.colors.gray[500],
    fontWeight: '500',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
    position: 'relative',
    zIndex: 1,
  },
  headerContent: {
    flex: 1,
  },
  headerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 14px',
    background: 'rgba(99, 102, 241, 0.08)',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    color: DESIGN.colors.primary[500],
    marginBottom: '8px',
  },
  headerTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: DESIGN.colors.gray[900],
    margin: 0,
    letterSpacing: '-0.5px',
    background: DESIGN.colors.gradients.cosmic,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  headerSubtitle: {
    fontSize: '15px',
    color: DESIGN.colors.gray[500],
    margin: '4px 0 0 0',
  },
  headerStats: {
    display: 'flex',
    gap: '12px',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    padding: '12px 20px',
    borderRadius: '12px',
    border: '1px solid rgba(226, 232, 240, 0.6)',
    textAlign: 'center',
    minWidth: '80px',
  },
  statNumber: {
    display: 'block',
    fontSize: '24px',
    fontWeight: '800',
    color: DESIGN.colors.gray[900],
  },
  statLabel: {
    fontSize: '11px',
    color: DESIGN.colors.gray[500],
    fontWeight: '500',
  },

  filterSection: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    position: 'relative',
    zIndex: 1,
    flexWrap: 'wrap',
  },
  searchWrapper: {
    flex: 1,
    minWidth: '200px',
    position: 'relative',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid rgba(226, 232, 240, 0.6)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    transition: 'all 0.3s ease',
  },
  searchIcon: {
    color: DESIGN.colors.gray[400],
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    padding: '12px 10px',
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '14px',
    color: DESIGN.colors.gray[800],
    fontFamily: "'Inter', sans-serif",
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: DESIGN.colors.gray[400],
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  filterControls: {
    display: 'flex',
    gap: '12px',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    padding: '0 12px',
    borderRadius: '12px',
    border: '1px solid rgba(226, 232, 240, 0.6)',
  },
  filterIcon: {
    color: DESIGN.colors.gray[400],
  },
  select: {
    padding: '10px 4px',
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '13px',
    fontWeight: '500',
    color: DESIGN.colors.gray[700],
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },

  resultsCount: {
    fontSize: '13px',
    color: DESIGN.colors.gray[500],
    marginBottom: '16px',
    position: 'relative',
    zIndex: 1,
  },

  applicationsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    position: 'relative',
    zIndex: 1,
  },
  applicationCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '14px',
    border: '1px solid rgba(226, 232, 240, 0.6)',
    transition: 'all 0.3s ease',
  },
  cardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1,
  },
  companyAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '18px',
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
  },
  jobTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: DESIGN.colors.gray[900],
    margin: '0 0 4px 0',
  },
  companyInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: DESIGN.colors.gray[600],
    marginBottom: '4px',
  },
  metaInfo: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    color: DESIGN.colors.gray[500],
  },
  cardRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
    flexShrink: 0,
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  viewBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    color: DESIGN.colors.primary[500],
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  emptyStateIcon: {
    fontSize: '56px',
    marginBottom: '16px',
  },
  emptyStateTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: DESIGN.colors.gray[800],
    margin: '0 0 8px 0',
  },
  emptyStateSub: {
    fontSize: '15px',
    color: DESIGN.colors.gray[500],
    margin: '0 0 20px 0',
  },
  emptyStateBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 28px',
    background: DESIGN.colors.gradients.cosmic,
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
  },
}