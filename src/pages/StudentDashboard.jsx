import { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabase'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getScoreColor } from '../matchScore'
import {
  LayoutGrid, ListChecks, Sparkles, CalendarClock, Search, UserCircle,
  FileText, BarChart3, Send, CheckCircle2, XCircle, ArrowRight,
  Pencil, MapPin, Clock, StickyNote, ChevronRight, Plus, Check,
  TrendingUp, Award, Briefcase, Users, Star, Eye, Zap, Target,
  Rocket, Shield, Crown, Gem, Coffee, Code, Layers, Palette
} from 'lucide-react'

// ============================================
// 🎨 PREMIUM DESIGN SYSTEM
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
      sunset: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 50%, #EC4899 100%)',
      ocean: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #10B981 100%)',
      aurora: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 50%, #34D399 100%)',
      fire: 'linear-gradient(135deg, #F59E0B 0%, #F97316 50%, #EF4444 100%)',
      crystal: 'linear-gradient(135deg, #E0E7FF 0%, #F3E8FF 50%, #FCE7F3 100%)',
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
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    glow: '0 0 40px rgba(99, 102, 241, 0.15)',
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    full: '9999px',
  },
}

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [recommendedJobs, setRecommendedJobs] = useState([])
  const [interviews, setInterviews] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [isHovering, setIsHovering] = useState(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const containerRef = useRef(null)

  useEffect(() => {
    if (tabParam && ['overview', 'applications', 'recommended', 'interviews'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  useEffect(() => {
    async function getData() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)

      const { data: appsData } = await supabase.from('applications').select('*, jobs(*)').eq('student_id', user.id).order('created_at', { ascending: false })
      setApplications(appsData || [])

      const { data: interviewsData } = await supabase.from('interviews').select('*').eq('student_id', user.id)
      setInterviews(interviewsData || [])

      const { data: jobsData } = await supabase.from('jobs').select('*')
      const studentSkills = profileData?.skills || ''
      const appliedJobIds = appsData?.map(a => a.job_id) || []

      if (studentSkills && jobsData) {
        const scored = jobsData
          .filter(job => !appliedJobIds.includes(job.id))
          .map(job => {
            const studentSkillList = studentSkills.toLowerCase().split(',').map(s => s.trim())
            const matched = job.skills?.toLowerCase().split(',').map(s => s.trim()).filter(s =>
              studentSkillList.some(sk => sk.includes(s) || s.includes(sk))
            ) || []
            const total = job.skills?.split(',').length || 1
            const score = Math.round((matched.length / total) * 100)
            return { ...job, score, matched }
          })
          .filter(job => job.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 4)
        setRecommendedJobs(scored)
      }
      setLoading(false)
    }
    getData()
  }, [])

  function getStatusStyle(status) {
    if (status === 'applied') return { bg: '#EEF2FF', color: '#6366F1', dot: '#6366F1', label: 'Applied' }
    if (status === 'interview') return { bg: '#FEF3C7', color: '#D97706', dot: '#D97706', label: 'Interview' }
    if (status === 'offer') return { bg: '#D1FAE5', color: '#059669', dot: '#059669', label: 'Offer' }
    if (status === 'rejected') return { bg: '#FEE2E2', color: '#DC2626', dot: '#DC2626', label: 'Rejected' }
    return { bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF', label: 'Pending' }
  }

  const metrics = [
    { 
      label: 'Applications Sent', 
      val: applications.length, 
      Icon: Send, 
      gradient: DESIGN.colors.gradients.cosmic,
      iconBg: 'rgba(99, 102, 241, 0.12)',
      iconColor: '#6366F1',
      change: '+12%',
      changeType: 'up',
      description: 'vs last month'
    },
    { 
      label: 'Interviews', 
      val: applications.filter(a => a.status === 'interview').length, 
      Icon: CalendarClock, 
      gradient: DESIGN.colors.gradients.fire,
      iconBg: 'rgba(245, 158, 11, 0.12)',
      iconColor: '#F59E0B',
      change: '+3',
      changeType: 'up',
      description: 'vs last month'
    },
    { 
      label: 'Offers', 
      val: applications.filter(a => a.status === 'offer').length, 
      Icon: Award, 
      gradient: DESIGN.colors.gradients.ocean,
      iconBg: 'rgba(16, 185, 129, 0.12)',
      iconColor: '#10B981',
      change: '+1',
      changeType: 'up',
      description: 'vs last month'
    },
    { 
      label: 'Profile Views', 
      val: 47, 
      Icon: Eye, 
      gradient: DESIGN.colors.gradients.aurora,
      iconBg: 'rgba(59, 130, 246, 0.12)',
      iconColor: '#3B82F6',
      change: '+8',
      changeType: 'up',
      description: 'vs last month'
    },
  ]

  const handleTabChange = (tab) => {
    const stateTabs = ['overview', 'applications', 'recommended', 'interviews']
    if (stateTabs.includes(tab)) {
      if (tab === 'overview') navigate('/student')
      else navigate(`/student?tab=${tab}`)
    } else {
      navigate(`/student/${tab}`)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const strength = profile ? (
    (profile.full_name ? 20 : 0) +
    (profile.university ? 20 : 0) +
    (profile.course ? 20 : 0) +
    (profile.skills ? 20 : 0) +
    (profile.bio ? 20 : 0)
  ) : 0

  const strengthLevel = strength >= 80 ? '🌟 Excellent' : strength >= 60 ? '💪 Good' : strength >= 40 ? '📈 Fair' : '⚡ Needs Work'
  const strengthColor = strength >= 80 ? '#10B981' : strength >= 60 ? '#F59E0B' : strength >= 40 ? '#F59E0B' : '#EF4444'

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingOrbit}>
          <div style={styles.loadingOrbitRing} />
          <div style={styles.loadingOrbitRing} />
          <div style={styles.loadingOrbitRing} />
          <div style={styles.loadingCenter} />
        </div>
        <p style={styles.loadingText}>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} style={styles.container}>
      {/* 🌟 Background Effects */}
      <div style={styles.backgroundEffects}>
        <div style={styles.glowOrb1} />
        <div style={styles.glowOrb2} />
        <div style={styles.glowOrb3} />
        <div style={styles.gridPattern} />
      </div>

      {/* ============================================
          🚀 WELCOME SECTION
      ============================================ */}
      <div style={styles.welcomeSection}>
        <div style={styles.welcomeContent}>
          <div style={styles.welcomeBadge}>
            <Sparkles size={14} color={DESIGN.colors.primary[500]} />
            Welcome back
          </div>
          <h1 style={styles.welcomeTitle}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {profile?.full_name?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p style={styles.welcomeSubtitle}>
            Here's what's happening with your job search today.
          </p>
        </div>
        <div style={styles.welcomeActions}>
          <button style={styles.primaryButton} onClick={() => handleTabChange('browse')}>
            <Search size={18} />
            Browse Jobs
            <ChevronRight size={16} />
          </button>
          <button style={styles.secondaryButton} onClick={() => handleTabChange('profile')}>
            <UserCircle size={18} />
            Profile
          </button>
        </div>
      </div>

      {/* ============================================
          💎 METRICS CARDS
      ============================================ */}
      <div style={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <div key={index} style={styles.metricCard} className="metric-card">
            <div style={styles.metricGlow} />
            <div style={styles.metricContent}>
              <div style={styles.metricHeader}>
                <div style={{...styles.metricIcon, background: metric.iconBg, color: metric.iconColor}}>
                  <metric.Icon size={20} />
                </div>
                {metric.change && (
                  <span style={{
                    ...styles.metricChange,
                    color: metric.changeType === 'up' ? DESIGN.colors.success : DESIGN.colors.danger
                  }}>
                    {metric.changeType === 'up' ? '↑' : '↓'} {metric.change}
                  </span>
                )}
              </div>
              <div style={styles.metricValue}>{metric.val}</div>
              <div style={styles.metricLabel}>{metric.label}</div>
              <div style={styles.metricDescription}>{metric.description}</div>
              <div style={{...styles.metricBar, background: metric.gradient}} />
            </div>
          </div>
        ))}
      </div>

      {/* ============================================
          📊 MAIN CONTENT
      ============================================ */}
      <div style={styles.mainGrid}>
        {/* LEFT COLUMN */}
        <div style={styles.leftColumn}>
          {/* 🎯 Recommended Jobs */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitleGroup}>
                <div style={styles.cardIcon}>
                  <Sparkles size={18} color={DESIGN.colors.primary[500]} />
                </div>
                <div>
                  <h3 style={styles.cardTitle}>Recommended for You</h3>
                  <p style={styles.cardSubtitle}>AI-powered matches based on your skills</p>
                </div>
              </div>
              {recommendedJobs.length > 0 && (
                <button style={styles.viewAllBtn} onClick={() => handleTabChange('recommended')}>
                  View all
                  <ChevronRight size={14} />
                </button>
              )}
            </div>

            {recommendedJobs.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>🎯</div>
                <p style={styles.emptyStateTitle}>No recommendations yet</p>
                <p style={styles.emptyStateSub}>Add skills to your profile to get personalized job matches</p>
                <button style={styles.emptyStateBtn} onClick={() => handleTabChange('profile')}>
                  Add Skills
                </button>
              </div>
            ) : (
              <div style={styles.jobsGrid}>
                {recommendedJobs.map((job, idx) => {
                  const { color, bg } = getScoreColor(job.score)
                  return (
                    <div 
                      key={job.id} 
                      style={styles.jobCard} 
                      className="job-card"
                      onClick={() => handleTabChange('browse')}
                      onMouseEnter={() => setIsHovering(job.id)}
                      onMouseLeave={() => setIsHovering(null)}
                    >
                      <div style={styles.jobCardTop}>
                        <div style={styles.jobCompanyIcon}>
                          {job.company.charAt(0)}
                        </div>
                        <div style={{...styles.matchScore, background: bg, color}}>
                          {job.score}%
                        </div>
                      </div>
                      <h4 style={styles.jobTitle}>{job.title}</h4>
                      <p style={styles.jobCompany}>{job.company}</p>
                      <p style={styles.jobLocation}>
                        <MapPin size={12} />
                        {job.location}
                      </p>
                      <div style={styles.jobSkills}>
                        {job.matched.slice(0, 3).map((skill, i) => (
                          <span key={i} style={styles.jobSkill}>
                            <Check size={10} />
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 📝 Recent Applications */}
          <div style={{...styles.card, marginTop: '20px'}}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitleGroup}>
                <div style={{...styles.cardIcon, background: 'rgba(16, 185, 129, 0.12)'}}>
                  <ListChecks size={18} color={DESIGN.colors.success} />
                </div>
                <div>
                  <h3 style={styles.cardTitle}>Recent Applications</h3>
                  <p style={styles.cardSubtitle}>Your latest activity and status</p>
                </div>
              </div>
              {applications.length > 0 && (
                <button style={styles.viewAllBtn} onClick={() => handleTabChange('applications')}>
                  View all
                  <ChevronRight size={14} />
                </button>
              )}
            </div>

            {applications.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>📝</div>
                <p style={styles.emptyStateTitle}>No applications yet</p>
                <p style={styles.emptyStateSub}>Start browsing jobs and apply to opportunities</p>
                <button style={styles.emptyStateBtn} onClick={() => handleTabChange('browse')}>
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div style={styles.applicationsList}>
                {applications.slice(0, 4).map((app) => {
                  const st = getStatusStyle(app.status)
                  return (
                    <div key={app.id} style={styles.applicationItem} className="application-item">
                      <div style={styles.applicationLeft}>
                        <div style={{...styles.applicationAvatar, background: st.bg, color: st.color}}>
                          {app.jobs?.company?.charAt(0) || 'J'}
                        </div>
                        <div>
                          <div style={styles.applicationTitle}>{app.jobs?.title}</div>
                          <div style={styles.applicationMeta}>
                            {app.jobs?.company} · {app.jobs?.location}
                          </div>
                          <div style={styles.applicationDate}>
                            <Clock size={12} />
                            {formatDate(app.created_at)}
                          </div>
                        </div>
                      </div>
                      <div style={{...styles.statusBadge, background: st.bg, color: st.color}}>
                        <span style={{...styles.statusDot, background: st.dot}} />
                        {st.label}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={styles.rightColumn}>
          {/* 👤 Profile Card */}
          <div style={styles.card}>
            <div style={styles.profileCard}>
              <div style={styles.profileAvatarWrapper}>
                <div style={styles.profileAvatarRing} />
                <div style={styles.profileAvatar}>
                  {profile?.full_name?.charAt(0) || 'S'}
                </div>
              </div>
              <h3 style={styles.profileName}>{profile?.full_name || 'Student'}</h3>
              <p style={styles.profileRole}>Student</p>
              
              <div style={styles.profileStrength}>
                <div style={styles.strengthHeader}>
                  <span style={styles.strengthLabel}>Profile Strength</span>
                  <span style={{...styles.strengthPercent, color: strengthColor}}>{strength}%</span>
                </div>
                <div style={styles.strengthBar}>
                  <div style={{...styles.strengthFill, width: `${strength}%`, background: strengthColor}} />
                </div>
                <p style={styles.strengthLevel}>{strengthLevel}</p>
              </div>

              <div style={styles.profileDetails}>
                <div style={styles.profileDetail}>
                  <span style={styles.profileDetailLabel}>University</span>
                  <span style={styles.profileDetailValue}>{profile?.university || 'Not set'}</span>
                </div>
                <div style={styles.profileDetail}>
                  <span style={styles.profileDetailLabel}>Course</span>
                  <span style={styles.profileDetailValue}>{profile?.course || 'Not set'}</span>
                </div>
                <div style={{...styles.profileDetail, borderBottom: 'none'}}>
                  <span style={styles.profileDetailLabel}>Graduation</span>
                  <span style={styles.profileDetailValue}>{profile?.graduation_year || 'Not set'}</span>
                </div>
              </div>

              {profile?.skills && (
                <div style={styles.skillsSection}>
                  <p style={styles.skillsLabel}>Skills</p>
                  <div style={styles.skillsChips}>
                    {profile.skills.split(',').slice(0, 5).map((skill, i) => (
                      <span key={i} style={styles.skillChip}>{skill.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              <button style={styles.editProfileBtn} onClick={() => handleTabChange('profile')}>
                <Pencil size={14} />
                Edit Profile
              </button>
            </div>
          </div>

          {/* ⚡ Quick Actions */}
          <div style={{...styles.card, marginTop: '16px'}}>
            <h3 style={styles.quickActionsTitle}>Quick Actions</h3>
            <div style={styles.quickActionsGrid}>
              <div style={styles.quickAction} onClick={() => handleTabChange('browse')}>
                <div style={{...styles.quickActionIcon, background: 'rgba(99, 102, 241, 0.12)', color: DESIGN.colors.primary[500]}}>
                  <Search size={20} />
                </div>
                <span style={styles.quickActionLabel}>Browse Jobs</span>
              </div>
              <div style={styles.quickAction} onClick={() => handleTabChange('profile')}>
                <div style={{...styles.quickActionIcon, background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B'}}>
                  <Pencil size={20} />
                </div>
                <span style={styles.quickActionLabel}>Edit Profile</span>
              </div>
              <div style={styles.quickAction} onClick={() => handleTabChange('applications')}>
                <div style={{...styles.quickActionIcon, background: 'rgba(16, 185, 129, 0.12)', color: '#10B981'}}>
                  <ListChecks size={20} />
                </div>
                <span style={styles.quickActionLabel}>Applications</span>
              </div>
              <div style={styles.quickAction} onClick={() => handleTabChange('resume')}>
                <div style={{...styles.quickActionIcon, background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6'}}>
                  <FileText size={20} />
                </div>
                <span style={styles.quickActionLabel}>Resume</span>
              </div>
            </div>
          </div>

          {/* 📈 Quick Stats */}
          <div style={{...styles.card, marginTop: '16px'}}>
            <div style={styles.quickStatsGrid}>
              <div style={styles.quickStat}>
                <div style={styles.quickStatValue}>92%</div>
                <div style={styles.quickStatLabel}>Application Success Rate</div>
              </div>
              <div style={styles.quickStat}>
                <div style={styles.quickStatValue}>4.8</div>
                <div style={styles.quickStatLabel}>Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          🎨 STYLES
      ============================================ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        * { box-sizing: border-box; }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #F8FAFC;
          margin: 0;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 0.4; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        
        @keyframes orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        .metric-card {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        
        .metric-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 20px 40px rgba(99, 102, 241, 0.15), 0 0 60px rgba(99, 102, 241, 0.05);
        }
        
        .job-card {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        
        .job-card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 20px 40px rgba(99, 102, 241, 0.12);
          border-color: #6366F1;
        }
        
        .application-item {
          transition: all 0.3s ease;
          cursor: default;
        }
        
        .application-item:hover {
          background: #F8FAFC;
          border-color: #CBD5E1;
          transform: translateX(4px);
        }

        @media (max-width: 1200px) {
          .mainGrid { grid-template-columns: 1fr !important; }
          .rightColumn { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        }
        
        @media (max-width: 768px) {
          .metricsGrid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
          .rightColumn { grid-template-columns: 1fr !important; }
          .jobsGrid { grid-template-columns: 1fr !important; }
          .welcomeSection { flex-direction: column !important; align-items: stretch !important; gap: 16px !important; }
          .welcomeActions { flex-direction: column !important; }
          .primaryButton, .secondaryButton { width: 100% !important; justify-content: center !important; }
          .container { padding: 16px !important; }
          .metricCard { padding: 16px !important; }
          .card { padding: 16px !important; }
        }
      `}</style>
    </div>
  )
}

// ============================================
// 🎨 STYLES
// ============================================
const styles = {
  container: {
    padding: '24px 32px',
    maxWidth: '1440px',
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
  glowOrb3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.04), transparent 70%)',
    animation: 'glow-pulse 12s ease-in-out infinite',
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

  welcomeSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    position: 'relative',
    zIndex: 1,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeBadge: {
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
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: DESIGN.colors.gray[900],
    margin: 0,
    letterSpacing: '-0.5px',
    background: DESIGN.colors.gradients.cosmic,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  welcomeSubtitle: {
    fontSize: '15px',
    color: DESIGN.colors.gray[500],
    margin: '4px 0 0 0',
  },
  welcomeActions: {
    display: 'flex',
    gap: '12px',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 28px',
    background: DESIGN.colors.gradients.cosmic,
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'rgba(255, 255, 255, 0.8)',
    color: DESIGN.colors.gray[700],
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
    backdropFilter: 'blur(10px)',
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '28px',
    position: 'relative',
    zIndex: 1,
  },
  metricCard: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '20px 24px',
    border: '1px solid rgba(226, 232, 240, 0.6)',
    position: 'relative',
    overflow: 'hidden',
  },
  metricGlow: {
    position: 'absolute',
    top: '-50%',
    right: '-50%',
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.03), transparent 70%)',
    pointerEvents: 'none',
  },
  metricContent: {
    position: 'relative',
    zIndex: 1,
  },
  metricHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  metricIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.3s ease',
  },
  metricChange: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '2px 10px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.8)',
  },
  metricValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: DESIGN.colors.gray[900],
    letterSpacing: '-0.5px',
  },
  metricLabel: {
    fontSize: '13px',
    color: DESIGN.colors.gray[500],
    fontWeight: '500',
    marginTop: '2px',
  },
  metricDescription: {
    fontSize: '11px',
    color: DESIGN.colors.gray[400],
    marginTop: '2px',
  },
  metricBar: {
    height: '3px',
    width: '40px',
    borderRadius: '2px',
    marginTop: '12px',
  },

  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 1fr',
    gap: '20px',
    position: 'relative',
    zIndex: 1,
  },
  leftColumn: {},
  rightColumn: {},

  card: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid rgba(226, 232, 240, 0.6)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  cardTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  cardIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(99, 102, 241, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: DESIGN.colors.gray[900],
    margin: 0,
  },
  cardSubtitle: {
    fontSize: '13px',
    color: DESIGN.colors.gray[500],
    margin: 0,
  },
  viewAllBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    color: DESIGN.colors.primary[500],
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  jobsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  jobCard: {
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #F1F5F9',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(5px)',
  },
  jobCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
  jobCompanyIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
    color: DESIGN.colors.primary[500],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px',
  },
  matchScore: {
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '700',
  },
  jobTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: DESIGN.colors.gray[900],
    margin: '0 0 2px 0',
  },
  jobCompany: {
    fontSize: '13px',
    color: DESIGN.colors.gray[500],
    margin: '0 0 4px 0',
  },
  jobLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: DESIGN.colors.gray[400],
    margin: '0 0 8px 0',
  },
  jobSkills: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
  },
  jobSkill: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '500',
    background: 'rgba(99, 102, 241, 0.06)',
    color: DESIGN.colors.primary[600],
  },

  applicationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  applicationItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid #F1F5F9',
    transition: 'all 0.3s ease',
  },
  applicationLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  applicationAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px',
    flexShrink: 0,
  },
  applicationTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: DESIGN.colors.gray[900],
  },
  applicationMeta: {
    fontSize: '13px',
    color: DESIGN.colors.gray[500],
  },
  applicationDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: DESIGN.colors.gray[400],
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
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },

  profileCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  profileAvatarWrapper: {
    position: 'relative',
    marginBottom: '12px',
  },
  profileAvatarRing: {
    position: 'absolute',
    inset: '-4px',
    borderRadius: '50%',
    background: DESIGN.colors.gradients.cosmic,
    opacity: 0.3,
    animation: 'pulse-ring 2s ease-in-out infinite',
  },
  profileAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: DESIGN.colors.gradients.cosmic,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '700',
    position: 'relative',
    zIndex: 1,
    boxShadow: '0 8px 30px rgba(99, 102, 241, 0.3)',
  },
  profileName: {
    fontSize: '18px',
    fontWeight: '700',
    color: DESIGN.colors.gray[900],
    margin: 0,
  },
  profileRole: {
    fontSize: '14px',
    color: DESIGN.colors.gray[500],
    margin: '0 0 16px 0',
  },
  profileStrength: {
    width: '100%',
    marginBottom: '16px',
  },
  strengthHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  strengthLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: DESIGN.colors.gray[500],
  },
  strengthPercent: {
    fontSize: '14px',
    fontWeight: '700',
  },
  strengthBar: {
    height: '6px',
    background: '#F1F5F9',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 1s ease',
  },
  strengthLevel: {
    fontSize: '12px',
    fontWeight: '600',
    color: DESIGN.colors.gray[500],
    margin: '4px 0 0 0',
  },
  profileDetails: {
    width: '100%',
    textAlign: 'left',
    marginTop: '12px',
  },
  profileDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #F1F5F9',
  },
  profileDetailLabel: {
    fontSize: '13px',
    color: DESIGN.colors.gray[500],
  },
  profileDetailValue: {
    fontSize: '13px',
    fontWeight: '600',
    color: DESIGN.colors.gray[800],
  },
  skillsSection: {
    width: '100%',
    textAlign: 'left',
    marginTop: '12px',
  },
  skillsLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: DESIGN.colors.gray[500],
    margin: '0 0 8px 0',
  },
  skillsChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  skillChip: {
    padding: '4px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    background: 'rgba(99, 102, 241, 0.08)',
    color: DESIGN.colors.primary[600],
  },
  editProfileBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    marginTop: '16px',
    background: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    color: DESIGN.colors.gray[700],
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  quickActionsTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: DESIGN.colors.gray[900],
    margin: '0 0 16px 0',
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  quickAction: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 12px',
    borderRadius: '12px',
    border: '1px solid #F1F5F9',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(5px)',
  },
  quickActionIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: DESIGN.colors.gray[600],
  },

  quickStatsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  quickStat: {
    textAlign: 'center',
    padding: '12px',
  },
  quickStatValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: DESIGN.colors.gray[900],
    background: DESIGN.colors.gradients.cosmic,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  quickStatLabel: {
    fontSize: '12px',
    color: DESIGN.colors.gray[500],
    marginTop: '4px',
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 20px',
    textAlign: 'center',
  },
  emptyStateIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  emptyStateTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: DESIGN.colors.gray[800],
    margin: 0,
  },
  emptyStateSub: {
    fontSize: '13px',
    color: DESIGN.colors.gray[500],
    margin: '4px 0 16px 0',
  },
  emptyStateBtn: {
    padding: '8px 24px',
    background: DESIGN.colors.gradients.cosmic,
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
  },
}