// src/pages/StudentDashboard.jsx
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabase'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getScoreColor } from '../matchScore'
import {
  ListChecks, Sparkles, CalendarClock, Search, UserCircle,
  FileText, Send, Award, ArrowRight, Pencil, MapPin, Clock,
  ChevronRight, Check, Eye, RefreshCw
} from 'lucide-react'
import DashboardShell from '../components/DashboardShell'
import useMediaQuery from '../hooks/useMediaQuery'

// ────────────────────────────────────────────────────────────
// DESIGN TOKENS (kept from original)
// ────────────────────────────────────────────────────────────
const DESIGN = {
  colors: {
    primary: {
      500: '#6366F1',
      600: '#4F46E5',
    },
    gradients: {
      cosmic: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
      fire: 'linear-gradient(135deg, #F59E0B 0%, #F97316 50%, #EF4444 100%)',
      ocean: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #10B981 100%)',
      aurora: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 50%, #34D399 100%)',
    },
    success: '#10B981',
    danger: '#EF4444',
    gray: {
      50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1',
      400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155',
      800: '#1E293B', 900: '#0F172A',
    },
  },
}

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [recommendedJobs, setRecommendedJobs] = useState([])
  const [interviews, setInterviews] = useState([])

  const [aiAnalysis, setAiAnalysis] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const containerRef = useRef(null)
  const isMobile = useMediaQuery('(max-width: 1024px)')

  // ============================================================
  // NAV
  // ============================================================
  const navItems = [
    { path: '/student', label: 'Overview', icon: <ListChecks size={18} />, exact: true },
    { path: '/student/browse-jobs', label: 'Browse Jobs', icon: <Search size={18} /> },
    { path: '/student/my-applications', label: 'My Applications', icon: <ListChecks size={18} /> },
    { path: '/student/analytics', label: 'Analytics', icon: <Sparkles size={18} /> },
    { path: '/student/resume-builder', label: 'Resume', icon: <FileText size={18} /> },
    { path: '/student/documents', label: 'Documents', icon: <CalendarClock size={18} /> },
    { path: '/student/profile', label: 'Profile', icon: <UserCircle size={18} /> },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  // ============================================================
  // AI
  // ============================================================
  const getAIRecommendations = async (currentProfile, currentJobs) => {
    if (!currentProfile || !currentJobs?.length) return
    setAiLoading(true)
    setAiError('')
    try {
      const jobsText = currentJobs.map((job, i) => `
JOB ${i + 1}
Title: ${job.title || 'Not provided'}
Company: ${job.company || 'Not provided'}
Location: ${job.location || 'Not provided'}
Required Skills: ${job.skills || 'Not provided'}
Current Skill Match: ${job.score || 0}%
Matched Skills: ${job.matched?.join(', ') || 'None'}
`).join('\n')

      const prompt = `You are CareerBridge AI...
Analyze the student's profile and recommended jobs.

STUDENT PROFILE
Name: ${currentProfile.full_name || 'Not provided'}
University: ${currentProfile.university || 'Not provided'}
Course: ${currentProfile.course || 'Not provided'}
Skills: ${currentProfile.skills || 'Not provided'}
Bio: ${currentProfile.bio || 'Not provided'}
Graduation Year: ${currentProfile.graduation_year || 'Not provided'}

RECOMMENDED JOBS
${jobsText}

Provide: 1. TOP RECOMMENDATION 2. STRONGEST SKILLS 3. SKILL GAPS 4. CAREER ADVICE 5. NEXT STEP. Keep concise.`

      const { data, error } = await supabase.functions.invoke('gemini', { body: { prompt } })
      if (error) { setAiError('Unable to generate AI career insights right now.'); return }
      if (!data?.response) { setAiError('The AI returned an empty response.'); return }
      setAiAnalysis(data.response)
    } catch (e) {
      console.error(e)
      setAiError('Something went wrong while generating your AI career insights.')
    } finally {
      setAiLoading(false)
    }
  }

  // ============================================================
  // LOAD DATA
  // ============================================================
  useEffect(() => {
    async function getData() {
      setLoading(true)
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) { setLoading(false); return }

        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(profileData)

        const { data: appsData } = await supabase.from('applications').select('*, jobs(*)').eq('student_id', user.id).order('created_at', { ascending: false })
        const safeApps = appsData || []
        setApplications(safeApps)

        const { data: interviewsData } = await supabase.from('interviews').select('*').eq('student_id', user.id)
        setInterviews(interviewsData || [])

        const { data: jobsData } = await supabase.from('jobs').select('*')
        const studentSkills = profileData?.skills || ''
        const appliedIds = safeApps.map(a => a.job_id)

        if (studentSkills && jobsData) {
          const studentSkillList = studentSkills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean)
          const scored = jobsData
            .filter(job => !appliedIds.includes(job.id))
            .map(job => {
              const jobSkills = job.skills?.toLowerCase().split(',').map(s => s.trim()).filter(Boolean) || []
              const matched = jobSkills.filter(s => studentSkillList.some(sk => sk.includes(s) || s.includes(sk)))
              const total = jobSkills.length || 1
              return { ...job, score: Math.round((matched.length / total) * 100), matched }
            })
            .filter(j => j.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 4)

          setRecommendedJobs(scored)
          if (profileData && scored.length > 0) await getAIRecommendations(profileData, scored)
        }
      } catch (e) {
        console.error('Dashboard loading error:', e)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [])

  const refreshAIAnalysis = () => getAIRecommendations(profile, recommendedJobs)

  const getStatusStyle = (status) => {
    if (status === 'applied') return { bg: '#EEF2FF', color: '#6366F1', dot: '#6366F1', label: 'Applied' }
    if (status === 'interview') return { bg: '#FEF3C7', color: '#D97706', dot: '#D97706', label: 'Interview' }
    if (status === 'offer') return { bg: '#D1FAE5', color: '#059669', dot: '#059669', label: 'Offer' }
    if (status === 'rejected') return { bg: '#FEE2E2', color: '#DC2626', dot: '#DC2626', label: 'Rejected' }
    return { bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF', label: 'Pending' }
  }

  const metrics = [
    { label: 'Applications Sent', val: applications.length, Icon: Send, iconBg: 'rgba(99,102,241,.12)', iconColor: '#6366F1', change: '+12%', changeType: 'up' },
    { label: 'Interviews', val: applications.filter(a => a.status === 'interview').length, Icon: CalendarClock, iconBg: 'rgba(245,158,11,.12)', iconColor: '#F59E0B', change: '+3', changeType: 'up' },
    { label: 'Offers', val: applications.filter(a => a.status === 'offer').length, Icon: Award, iconBg: 'rgba(16,185,129,.12)', iconColor: '#10B981', change: '+1', changeType: 'up' },
    { label: 'Profile Views', val: 47, Icon: Eye, iconBg: 'rgba(59,130,246,.12)', iconColor: '#3B82F6', change: '+8', changeType: 'up' },
  ]

  const formatDate = (d) => {
    const date = new Date(d)
    const days = Math.ceil(Math.abs(new Date() - date) / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const strength = profile ? (
    (profile.full_name ? 20 : 0) + (profile.university ? 20 : 0) +
    (profile.course ? 20 : 0) + (profile.skills ? 20 : 0) + (profile.bio ? 20 : 0)
  ) : 0

  const strengthLevel = strength >= 80 ? '🌟 Excellent' : strength >= 60 ? '💪 Good' : strength >= 40 ? '📈 Fair' : '⚡ Needs Work'
  const strengthColor = strength >= 80 ? '#10B981' : strength >= 60 ? '#F59E0B' : strength >= 40 ? '#F59E0B' : '#EF4444'

  if (loading) {
    return (
      <div style={s.loadingContainer}>
        <div style={s.loadingOrbit}>
          <div style={s.loadingOrbitRing} />
          <div style={s.loadingOrbitRing} />
          <div style={s.loadingOrbitRing} />
          <div style={s.loadingCenter} />
        </div>
        <p style={s.loadingText}>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <DashboardShell
      brandLabel="STUDENT"
      accent="#6366F1"
      navItems={navItems}
      profile={{ full_name: profile?.full_name || 'Student', role_label: 'Student account' }}
      onLogout={handleLogout}
      logoMark={<Sparkles size={18} color="#fff" />}
    >
      <div ref={containerRef} style={s.container}>
        {/* Background effects */}
        <div style={s.backgroundEffects}>
          <div style={s.glowOrb1} />
          <div style={s.glowOrb2} />
          <div style={s.gridPattern} />
        </div>

        {/* Welcome */}
        <div style={s.welcomeSection}>
          <div style={s.welcomeContent}>
            <div style={s.welcomeBadge}><Sparkles size={14} color="#6366F1" /> Welcome back</div>
            <h1 style={s.welcomeTitle}>
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {profile?.full_name?.split(' ')[0] || 'Student'} 👋
            </h1>
            <p style={s.welcomeSubtitle}>Here's what's happening with your job search today.</p>
          </div>
          <div style={s.welcomeActions}>
            <button style={s.primaryButton} onClick={() => navigate('/student/browse-jobs')}>
              <Search size={18} /> Browse Jobs <ChevronRight size={16} />
            </button>
            <button style={s.secondaryButton} onClick={() => navigate('/student/profile')}>
              <UserCircle size={18} /> Profile
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div style={s.metricsGrid}>
          {metrics.map((m, i) => (
            <div key={i} style={s.metricCard} className="sd-metric">
              <div style={s.metricHeader}>
                <div style={{ ...s.metricIcon, background: m.iconBg, color: m.iconColor }}>
                  <m.Icon size={20} />
                </div>
                {m.change && (
                  <span style={{ ...s.metricChange, color: m.changeType === 'up' ? '#10B981' : '#EF4444' }}>
                    {m.changeType === 'up' ? '↑' : '↓'} {m.change}
                  </span>
                )}
              </div>
              <div style={s.metricValue}>{m.val}</div>
              <div style={s.metricLabel}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ ...s.mainGrid, gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr' }}>
          {/* Left column */}
          <div style={s.leftColumn}>
            {/* Recommended */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <div style={s.cardTitleGroup}>
                  <div style={s.cardIcon}><Sparkles size={18} color="#6366F1" /></div>
                  <div>
                    <h3 style={s.cardTitle}>Recommended for You</h3>
                    <p style={s.cardSubtitle}>Smart matches based on your skills</p>
                  </div>
                </div>
                {recommendedJobs.length > 0 && (
                  <button style={s.viewAllBtn} onClick={() => navigate('/student/browse-jobs')}>
                    View all <ChevronRight size={14} />
                  </button>
                )}
              </div>

              {recommendedJobs.length === 0 ? (
                <div style={s.emptyState}>
                  <div style={s.emptyStateIcon}>🎯</div>
                  <p style={s.emptyStateTitle}>No recommendations yet</p>
                  <p style={s.emptyStateSub}>Add skills to your profile to get personalized matches</p>
                  <button style={s.emptyStateBtn} onClick={() => navigate('/student/profile')}>Add Skills</button>
                </div>
              ) : (
                <div style={{ ...s.jobsGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)' }}>
                  {recommendedJobs.map(job => {
                    const { color, bg } = getScoreColor(job.score)
                    return (
                      <div key={job.id} style={s.jobCard} onClick={() => navigate('/student/browse-jobs')}>
                        <div style={s.jobCardTop}>
                          <div style={s.jobCompanyIcon}>{job.company?.charAt(0) || 'J'}</div>
                          <div style={{ ...s.matchScore, background: bg, color }}>{job.score}%</div>
                        </div>
                        <h4 style={s.jobTitle}>{job.title}</h4>
                        <p style={s.jobCompany}>{job.company}</p>
                        <p style={s.jobLocation}><MapPin size={12} /> {job.location}</p>
                        <div style={s.jobSkills}>
                          {job.matched?.slice(0, 3).map((skill, i) => (
                            <span key={i} style={s.jobSkill}><Check size={10} /> {skill}</span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* AI */}
            <div style={{ ...s.card, marginTop: 20 }}>
              <div style={s.cardHeader}>
                <div style={s.cardTitleGroup}>
                  <div style={s.aiIcon}><Sparkles size={19} color="#fff" /></div>
                  <div>
                    <h3 style={s.cardTitle}>AI Career Insights</h3>
                    <p style={s.cardSubtitle}>Personalized advice powered by CareerBridge AI</p>
                  </div>
                </div>
                {recommendedJobs.length > 0 && (
                  <button style={s.aiRefreshButton} onClick={refreshAIAnalysis} disabled={aiLoading} aria-label="Refresh AI insights">
                    <RefreshCw size={15} className={aiLoading ? 'sd-spin' : ''} />
                  </button>
                )}
              </div>

              {aiLoading ? (
                <div style={s.aiLoading}>
                  <div style={s.aiLoadingIcon}><Sparkles size={24} /></div>
                  <div>
                    <p style={s.aiLoadingTitle}>Analyzing your profile...</p>
                    <p style={s.aiLoadingText}>Comparing your skills with opportunities.</p>
                  </div>
                </div>
              ) : aiError ? (
                <div style={s.aiError}>
                  <div style={s.aiErrorIcon}>⚠️</div>
                  <div>
                    <p style={s.aiErrorTitle}>AI analysis unavailable</p>
                    <p style={s.aiErrorText}>{aiError}</p>
                    <button style={s.aiRetryButton} onClick={refreshAIAnalysis}>Try Again</button>
                  </div>
                </div>
              ) : aiAnalysis ? (
                <div style={s.aiAnalysisText}>
                  {aiAnalysis.split('\n').map((line, i) => {
                    const t = line.trim()
                    if (!t) return <div key={i} style={{ height: 8 }} />
                    const isHeading = /^[1-5]\./.test(t) || t.endsWith(':')
                    const isBullet = /^[-•*]/.test(t)
                    if (isHeading) return <div key={i} style={s.aiHeading}>{t}</div>
                    if (isBullet) return (
                      <div key={i} style={s.aiBullet}>
                        <span style={s.aiBulletDot}>•</span>
                        <span>{t.replace(/^[-•*]\s*/, '')}</span>
                      </div>
                    )
                    return <p key={i} style={s.aiParagraph}>{t}</p>
                  })}
                </div>
              ) : (
                <div style={s.aiEmptyState}>
                  <div style={s.aiEmptyIcon}>✨</div>
                  <p style={s.aiEmptyTitle}>
                    {recommendedJobs.length === 0
                      ? 'Build your profile to unlock AI insights'
                      : 'AI insights are being prepared'}
                  </p>
                  <p style={s.aiEmptyText}>
                    {recommendedJobs.length === 0
                      ? 'Add your skills, course and bio so CareerBridge AI can provide personalized guidance.'
                      : 'We need a moment to analyze your opportunities.'}
                  </p>
                  {recommendedJobs.length === 0 && (
                    <button style={s.aiProfileButton} onClick={() => navigate('/student/profile')}>
                      Complete Profile <ArrowRight size={15} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Applications */}
            <div style={{ ...s.card, marginTop: 20 }}>
              <div style={s.cardHeader}>
                <div style={s.cardTitleGroup}>
                  <div style={{ ...s.cardIcon, background: 'rgba(16,185,129,.12)' }}>
                    <ListChecks size={18} color="#10B981" />
                  </div>
                  <div>
                    <h3 style={s.cardTitle}>Recent Applications</h3>
                    <p style={s.cardSubtitle}>Your latest activity and status</p>
                  </div>
                </div>
                {applications.length > 0 && (
                  <button style={s.viewAllBtn} onClick={() => navigate('/student/my-applications')}>
                    View all <ChevronRight size={14} />
                  </button>
                )}
              </div>

              {applications.length === 0 ? (
                <div style={s.emptyState}>
                  <div style={s.emptyStateIcon}>📝</div>
                  <p style={s.emptyStateTitle}>No applications yet</p>
                  <p style={s.emptyStateSub}>Start browsing jobs and apply to opportunities</p>
                  <button style={s.emptyStateBtn} onClick={() => navigate('/student/browse-jobs')}>Browse Jobs</button>
                </div>
              ) : (
                <div style={s.applicationsList}>
                  {applications.slice(0, 4).map(app => {
                    const st = getStatusStyle(app.status)
                    return (
                      <div key={app.id} style={s.applicationItem}>
                        <div style={s.applicationLeft}>
                          <div style={{ ...s.applicationAvatar, background: st.bg, color: st.color }}>
                            {app.jobs?.company?.charAt(0) || 'J'}
                          </div>
                          <div>
                            <div style={s.applicationTitle}>{app.jobs?.title}</div>
                            <div style={s.applicationMeta}>{app.jobs?.company} · {app.jobs?.location}</div>
                            <div style={s.applicationDate}><Clock size={12} /> {formatDate(app.created_at)}</div>
                          </div>
                        </div>
                        <div style={{ ...s.statusBadge, background: st.bg, color: st.color }}>
                          <span style={{ ...s.statusDot, background: st.dot }} />
                          {st.label}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div style={s.rightColumn}>
            <div style={s.card}>
              <div style={s.profileCard}>
                <div style={s.profileAvatarWrapper}>
                  <div style={s.profileAvatarRing} />
                  <div style={s.profileAvatar}>{profile?.full_name?.charAt(0) || 'S'}</div>
                </div>
                <h3 style={s.profileName}>{profile?.full_name || 'Student'}</h3>
                <p style={s.profileRole}>Student</p>

                <div style={s.profileStrength}>
                  <div style={s.strengthHeader}>
                    <span style={s.strengthLabel}>Profile Strength</span>
                    <span style={{ ...s.strengthPercent, color: strengthColor }}>{strength}%</span>
                  </div>
                  <div style={s.strengthBar}>
                    <div style={{ ...s.strengthFill, width: `${strength}%`, background: strengthColor }} />
                  </div>
                  <p style={s.strengthLevel}>{strengthLevel}</p>
                </div>

                <div style={s.profileDetails}>
                  <div style={s.profileDetail}>
                    <span style={s.profileDetailLabel}>University</span>
                    <span style={s.profileDetailValue}>{profile?.university || 'Not set'}</span>
                  </div>
                  <div style={s.profileDetail}>
                    <span style={s.profileDetailLabel}>Course</span>
                    <span style={s.profileDetailValue}>{profile?.course || 'Not set'}</span>
                  </div>
                  <div style={{ ...s.profileDetail, borderBottom: 'none' }}>
                    <span style={s.profileDetailLabel}>Graduation</span>
                    <span style={s.profileDetailValue}>{profile?.graduation_year || 'Not set'}</span>
                  </div>
                </div>

                {profile?.skills && (
                  <div style={s.skillsSection}>
                    <p style={s.skillsLabel}>Skills</p>
                    <div style={s.skillsChips}>
                      {profile.skills.split(',').slice(0, 5).map((skill, i) => (
                        <span key={i} style={s.skillChip}>{skill.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}

                <button style={s.editProfileBtn} onClick={() => navigate('/student/profile')}>
                  <Pencil size={14} /> Edit Profile
                </button>
              </div>
            </div>

            <div style={{ ...s.card, marginTop: 16 }}>
              <h3 style={s.quickActionsTitle}>Quick Actions</h3>
              <div style={s.quickActionsGrid}>
                <div style={s.quickAction} onClick={() => navigate('/student/browse-jobs')}>
                  <div style={{ ...s.quickActionIcon, background: 'rgba(99,102,241,.12)', color: '#6366F1' }}><Search size={20} /></div>
                  <span style={s.quickActionLabel}>Browse Jobs</span>
                </div>
                <div style={s.quickAction} onClick={() => navigate('/student/profile')}>
                  <div style={{ ...s.quickActionIcon, background: 'rgba(245,158,11,.12)', color: '#F59E0B' }}><Pencil size={20} /></div>
                  <span style={s.quickActionLabel}>Edit Profile</span>
                </div>
                <div style={s.quickAction} onClick={() => navigate('/student/my-applications')}>
                  <div style={{ ...s.quickActionIcon, background: 'rgba(16,185,129,.12)', color: '#10B981' }}><ListChecks size={20} /></div>
                  <span style={s.quickActionLabel}>Applications</span>
                </div>
                <div style={s.quickAction} onClick={() => navigate('/student/resume-builder')}>
                  <div style={{ ...s.quickActionIcon, background: 'rgba(59,130,246,.12)', color: '#3B82F6' }}><FileText size={20} /></div>
                  <span style={s.quickActionLabel}>Resume</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes sd-spin { to { transform: rotate(360deg); } }
        .sd-spin { animation: sd-spin 1s linear infinite; }
        .sd-metric { transition: transform .3s ease, box-shadow .3s ease; }
        @media (hover: hover) {
          .sd-metric:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(99,102,241,.12); }
        }
      `}</style>
    </DashboardShell>
  )
}

// ────────────────────────────────────────────────────────────
// STYLES
// ────────────────────────────────────────────────────────────
const s = {
  container: { padding: 'clamp(16px, 3vw, 32px)', maxWidth: 1440, margin: '0 auto', position: 'relative' },

  backgroundEffects: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' },
  glowOrb1: { position: 'absolute', top: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,.08), transparent 70%)' },
  glowOrb2: { position: 'absolute', bottom: '-20%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,.06), transparent 70%)' },
  gridPattern: { position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99,102,241,.05) 1px, transparent 0)', backgroundSize: '40px 40px' },

  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 24 },
  loadingOrbit: { position: 'relative', width: 60, height: 60 },
  loadingOrbitRing: { position: 'absolute', inset: 0, border: '3px solid transparent', borderRadius: '50%', borderTopColor: '#6366F1', animation: 'sd-spin 1.2s linear infinite' },
  loadingCenter: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 12, height: 12, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' },
  loadingText: { fontSize: 14, color: '#64748B', fontWeight: 500 },

  welcomeSection: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 28, position: 'relative', zIndex: 1 },
  welcomeContent: { flex: '1 1 260px', minWidth: 0 },
  welcomeBadge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', background: 'rgba(99,102,241,.08)', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#6366F1', marginBottom: 8 },
  welcomeTitle: { fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' },
  welcomeSubtitle: { fontSize: 'clamp(13px, 1.4vw, 15px)', color: '#64748B', margin: '4px 0 0 0' },
  welcomeActions: { display: 'flex', flexWrap: 'wrap', gap: 12 },
  primaryButton: { display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontSize: 14, minHeight: 44, boxShadow: '0 4px 20px rgba(99,102,241,.3)' },
  secondaryButton: { display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', background: 'rgba(255,255,255,.8)', color: '#334155', border: '1px solid #E2E8F0', borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontSize: 14, minHeight: 44 },

  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28, position: 'relative', zIndex: 1 },
  metricCard: { background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: 'clamp(16px, 2vw, 22px)', border: '1px solid rgba(226,232,240,.6)', position: 'relative' },
  metricHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  metricIcon: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  metricChange: { fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 12, background: 'rgba(255,255,255,.8)' },
  metricValue: { fontSize: 'clamp(22px, 2.4vw, 28px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' },
  metricLabel: { fontSize: 13, color: '#64748B', fontWeight: 500, marginTop: 2 },

  mainGrid: { display: 'grid', gap: 20, position: 'relative', zIndex: 1 },
  leftColumn: { minWidth: 0 },
  rightColumn: { minWidth: 0 },

  card: { background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: 'clamp(16px, 2.5vw, 24px)', border: '1px solid rgba(226,232,240,.6)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  cardTitleGroup: { display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 },
  cardIcon: { width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 },
  cardSubtitle: { fontSize: 13, color: '#64748B', margin: 0 },
  viewAllBtn: { display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#6366F1', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: 0 },

  jobsGrid: { display: 'grid', gap: 12 },
  jobCard: { padding: 16, borderRadius: 12, border: '1px solid #F1F5F9', background: 'rgba(255,255,255,.8)', cursor: 'pointer' },
  jobCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  jobCompanyIcon: { width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, rgba(99,102,241,.1), rgba(139,92,246,.1))', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 },
  matchScore: { padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700 },
  jobTitle: { fontSize: 14, fontWeight: 600, color: '#0F172A', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis' },
  jobCompany: { fontSize: 13, color: '#64748B', margin: '0 0 4px 0' },
  jobLocation: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#94A3B8', margin: '0 0 8px 0' },
  jobSkills: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  jobSkill: { display: 'flex', alignItems: 'center', gap: 3, padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500, background: 'rgba(99,102,241,.06)', color: '#4F46E5' },

  aiIcon: { width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(99,102,241,.25)' },
  aiRefreshButton: { width: 40, height: 40, borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  aiLoading: { display: 'flex', alignItems: 'center', gap: 16, padding: 22, borderRadius: 14, background: 'linear-gradient(135deg, rgba(99,102,241,.06), rgba(139,92,246,.04))', border: '1px solid rgba(99,102,241,.1)' },
  aiLoadingIcon: { width: 46, height: 46, flexShrink: 0, borderRadius: 14, background: 'rgba(99,102,241,.1)', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  aiLoadingTitle: { margin: '0 0 4px 0', fontSize: 14, fontWeight: 700, color: '#1E293B' },
  aiLoadingText: { margin: 0, fontSize: 12, lineHeight: 1.5, color: '#64748B' },
  aiError: { display: 'flex', alignItems: 'flex-start', gap: 14, padding: 18, borderRadius: 14, background: '#FEF2F2', border: '1px solid #FECACA' },
  aiErrorIcon: { width: 38, height: 38, flexShrink: 0, borderRadius: 10, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  aiErrorTitle: { margin: '0 0 4px 0', fontSize: 14, fontWeight: 700, color: '#991B1B' },
  aiErrorText: { margin: '0 0 10px 0', fontSize: 12, lineHeight: 1.5, color: '#B91C1C' },
  aiRetryButton: { border: 'none', background: '#EF4444', color: '#fff', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  aiAnalysisText: { padding: 18, borderRadius: 14, background: '#F8FAFC', border: '1px solid #EEF2F7' },
  aiHeading: { fontSize: 13, fontWeight: 800, color: '#0F172A', margin: '12px 0 7px 0' },
  aiParagraph: { fontSize: 13, lineHeight: 1.65, color: '#475569', margin: '5px 0' },
  aiBullet: { display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, lineHeight: 1.6, color: '#475569', margin: '5px 0' },
  aiBulletDot: { color: '#6366F1', fontWeight: 900, fontSize: 16, lineHeight: 1.3 },
  aiEmptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 20px', textAlign: 'center', borderRadius: 14, background: 'linear-gradient(135deg, rgba(99,102,241,.04), rgba(139,92,246,.03))' },
  aiEmptyIcon: { width: 52, height: 52, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 25, background: 'rgba(99,102,241,.08)', marginBottom: 12 },
  aiEmptyTitle: { fontSize: 14, fontWeight: 700, color: '#1E293B', margin: 0 },
  aiEmptyText: { maxWidth: 520, fontSize: 12, lineHeight: 1.6, color: '#64748B', margin: '5px 0 15px 0' },
  aiProfileButton: { display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', border: 'none', borderRadius: 9, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' },

  applicationsList: { display: 'flex', flexDirection: 'column', gap: 8 },
  applicationItem: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, border: '1px solid #F1F5F9' },
  applicationLeft: { display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: '1 1 200px' },
  applicationAvatar: { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 },
  applicationTitle: { fontSize: 14, fontWeight: 600, color: '#0F172A' },
  applicationMeta: { fontSize: 12.5, color: '#64748B' },
  applicationDate: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#94A3B8' },
  statusBadge: { display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' },
  statusDot: { width: 6, height: 6, borderRadius: '50%' },

  profileCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  profileAvatarWrapper: { position: 'relative', marginBottom: 12 },
  profileAvatarRing: { position: 'absolute', inset: -4, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', opacity: 0.3 },
  profileAvatar: { width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, position: 'relative' },
  profileName: { fontSize: 18, fontWeight: 700, color: '#0F172A', margin: 0 },
  profileRole: { fontSize: 14, color: '#64748B', margin: '0 0 16px 0' },
  profileStrength: { width: '100%', marginBottom: 16 },
  strengthHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  strengthLabel: { fontSize: 12, fontWeight: 500, color: '#64748B' },
  strengthPercent: { fontSize: 14, fontWeight: 700 },
  strengthBar: { height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: 3, transition: 'width 1s ease' },
  strengthLevel: { fontSize: 12, fontWeight: 600, color: '#64748B', margin: '4px 0 0 0' },
  profileDetails: { width: '100%', textAlign: 'left', marginTop: 12 },
  profileDetail: { display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid #F1F5F9' },
  profileDetailLabel: { fontSize: 13, color: '#64748B' },
  profileDetailValue: { fontSize: 13, fontWeight: 600, color: '#1E293B', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis' },
  skillsSection: { width: '100%', textAlign: 'left', marginTop: 12 },
  skillsLabel: { fontSize: 12, fontWeight: 600, color: '#64748B', margin: '0 0 8px 0' },
  skillsChips: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  skillChip: { padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: 'rgba(99,102,241,.08)', color: '#4F46E5' },
  editProfileBtn: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, marginTop: 16, background: 'rgba(255,255,255,.8)', border: '1px solid #E2E8F0', borderRadius: 10, color: '#334155', fontWeight: 600, fontSize: 14, cursor: 'pointer', minHeight: 44 },

  quickActionsTitle: { fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 16px 0' },
  quickActionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  quickAction: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 12px', borderRadius: 12, border: '1px solid #F1F5F9', background: 'rgba(255,255,255,.8)', cursor: 'pointer' },
  quickActionIcon: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { fontSize: 12, fontWeight: 600, color: '#475569' },

  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', textAlign: 'center' },
  emptyStateIcon: { fontSize: 40, marginBottom: 12 },
  emptyStateTitle: { fontSize: 16, fontWeight: 600, color: '#1E293B', margin: 0 },
  emptyStateSub: { fontSize: 13, color: '#64748B', margin: '4px 0 16px 0' },
  emptyStateBtn: { padding: '10px 24px', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer', minHeight: 44 },
}