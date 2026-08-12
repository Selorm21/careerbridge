import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

// ============================================================
// ICON SYSTEM
// ============================================================
const Icon = ({ children, size = 20, strokeWidth = 1.8 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    aria-hidden="true"
  >
    {children}
  </svg>
)

const icons = {
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  star: <path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.8L12 16.8l-5.25 2.8 1-5.8L3.5 9.7l5.9-.9L12 3.5z" />,
  trophy: (
    <>
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v6a5 5 0 0 1-10 0V4z" />
      <path d="M7 5H4a3 3 0 0 0 3 4" />
      <path d="M17 5h3a3 3 0 0 1-3 4" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  mapPin: (
    <>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  chart: (
    <>
      <path d="M4 19V5" />
      <path d="M4 19h17" />
      <path d="M8 15v-4" />
      <path d="M12 15V8" />
      <path d="M16 15V5" />
      <path d="M20 15v-7" />
    </>
  ),
  sparkle: (
    <>
      <path d="m12 3 1.3 5.7L19 10l-5.7 1.3L12 17l-1.3-5.7L5 10l5.7-1.3L12 3Z" />
      <path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z" />
    </>
  ),
}

// ============================================================
// DESIGN TOKENS
// ============================================================
const C = {
  page: '#F6F8FC',
  white: '#FFFFFF',
  ink: '#101828',
  secondary: '#475467',
  muted: '#667085',
  faint: '#98A2B3',
  border: '#E7EAF0',
  accent: '#EA4E1B',
  accentDark: '#D83E0E',
  accentSoft: '#FFF1EC',
  blue: '#2563EB',
  blueSoft: '#EFF6FF',
  green: '#12B76A',
  greenSoft: '#ECFDF3',
  amber: '#F79009',
  amberSoft: '#FFFAEB',
  purple: '#7F56D9',
  purpleSoft: '#F4F3FF',
  shadow: '0 1px 2px rgba(16,24,40,.03), 0 12px 32px rgba(16,24,40,.04)',
  shadowHover: '0 8px 24px rgba(16,24,40,.07), 0 24px 60px rgba(16,24,40,.06)',
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function EmployerDashboard() {
  const [profile, setProfile] = useState(null)
  const [jobs, setJobs] = useState([])
  const [totalApplicants, setTotalApplicants] = useState(0)
  const [totalShortlisted, setTotalShortlisted] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // ==========================================================
  // LOAD DASHBOARD DATA
  // ==========================================================
  useEffect(() => {
    let mounted = true
    async function getData() {
      try {
        setLoading(true)
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          console.warn('Authentication error or no user found.')
          return
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (!profileError && mounted) {
          setProfile({
            ...profileData,
            email: profileData?.email || user.email,
          })
        }

        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('employer_id', user.id)
          .order('created_at', { ascending: false })

        if (jobsError) {
          console.error('Jobs error:', jobsError)
          if (mounted) setJobs([])
          return
        }

        const safeJobs = Array.isArray(jobsData) ? jobsData : []
        if (mounted) setJobs(safeJobs)

        if (safeJobs.length === 0) {
          if (mounted) {
            setTotalApplicants(0)
            setTotalShortlisted(0)
          }
          return
        }

        const jobIds = safeJobs.map((job) => job.id).filter(Boolean)
        const { data: appsData, error: appsError } = await supabase
          .from('applications')
          .select('*')
          .in('job_id', jobIds)

        if (appsError) {
          console.error('Applications error:', appsError)
          if (mounted) {
            setTotalApplicants(0)
            setTotalShortlisted(0)
          }
          return
        }

        const applications = Array.isArray(appsData) ? appsData : []
        const shortlisted = applications.filter(
          (app) => app.status === 'interview' || app.status === 'offer'
        ).length

        if (mounted) {
          setTotalApplicants(applications.length)
          setTotalShortlisted(shortlisted)
        }
      } catch (error) {
        console.error('Employer dashboard error:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    getData()
    return () => { mounted = false }
  }, [])

  // ==========================================================
  // HELPERS
  // ==========================================================
    const goTo = (path) => {
    // If the path already starts with /employer, navigate directly.
    // Otherwise, prepend /employer.
    if (path.startsWith('/employer')) {
      navigate(path)
    } else {
      navigate(`/employer${path}`)
    }
  }

  const getInitials = (name) => {
    if (!name) return 'E'
    return name.trim().split(/\s+/).map((word) => word[0]).slice(0, 2).join('').toUpperCase()
  }

  const firstName = profile?.full_name?.split(/\s+/)[0] || 'Employer'
  const displayName = profile?.full_name || 'Employer'
  
  const formatDate = (date) => {
    if (!date) return 'Recently posted'
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) return 'Recently posted'
    return parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // ==========================================================
  // RENDER
  // ==========================================================
  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', sans-serif; background: ${C.page}; }
        button { font-family: inherit; }

        @keyframes dashboardEnter {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatGlow {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, 10px, 0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .dashboard-shell { animation: dashboardEnter .65s cubic-bezier(.16,1,.3,1); }
        .ambient { animation: floatGlow 8s ease-in-out infinite; }
        
        .stat-card { transition: transform .25s cubic-bezier(.16,1,.3,1), box-shadow .25s ease, border-color .25s ease; }
        .stat-card:hover { transform: translateY(-5px); box-shadow: ${C.shadowHover} !important; border-color: #D9DEE8 !important; }
        
        .job-row { transition: transform .22s ease, border-color .22s ease, box-shadow .22s ease; }
        .job-row:hover { transform: translateY(-2px); border-color: #D9DEE8 !important; box-shadow: 0 8px 22px rgba(16,24,40,.05); }
        
        .primary-button { transition: transform .2s ease, background .2s ease, box-shadow .2s ease; }
        .primary-button:hover { background: ${C.accentDark} !important; transform: translateY(-1px); box-shadow: 0 10px 24px rgba(234,78,27,.22) !important; }
        
        .secondary-button { transition: background .2s ease, border-color .2s ease, transform .2s ease; }
        .secondary-button:hover { background: #F8FAFC !important; border-color: #CBD2DC !important; transform: translateY(-1px); }
        
        .action-card { transition: transform .22s ease, border-color .22s ease, background .22s ease, box-shadow .22s ease; }
        .action-card:hover { transform: translateY(-3px); background: #FFFFFF !important; border-color: #D9DEE8 !important; box-shadow: 0 8px 22px rgba(16,24,40,.05); }
        
        .view-link:hover { color: ${C.accentDark} !important; }
        .job-button:hover { background: ${C.accentSoft} !important; border-color: #F5B19B !important; color: ${C.accentDark} !important; }

        @media (max-width: 1050px) {
          .hero-layout { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .content-grid { grid-template-columns: 1fr !important; }
          .right-column { display: grid !important; grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 760px) {
          .main-content { padding: 24px 16px !important; }
          .hero-title { font-size: 32px !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .right-column { grid-template-columns: 1fr !important; }
          .job-row { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
          .job-button { width: 100%; }
          .hero-actions { flex-direction: column !important; }
          .hero-actions button { width: 100%; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .hero-title { font-size: 28px !important; }
        }
      `}</style>

      {/* Ambient Background */}
      <div className="ambient" style={{
        position: 'fixed', width: 520, height: 520,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(234,78,27,.065), transparent 70%)',
        top: -230, right: -160,
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div className="ambient" style={{
        position: 'fixed', width: 500, height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,.045), transparent 70%)',
        bottom: -280, left: -200,
        pointerEvents: 'none', zIndex: 0,
      }} />

      <main className="main-content dashboard-shell" style={S.main}>
        
        {/* ======================================================
            HERO SECTION
        ====================================================== */}
        <section className="hero-layout" style={S.hero}>
          <div>
            <div style={S.eyebrow}>
              <span style={S.liveDot} /> Employer workspace
            </div>
            <h1 className="hero-title" style={S.heroTitle}>
              Good to see you,{' '}
              <span style={S.heroHighlight}>{firstName}</span>
            </h1>
            <p style={S.heroDescription}>
              Build your team with confidence. Manage your opportunities, discover exceptional candidates, and keep your hiring pipeline moving.
            </p>
            <div className="hero-actions" style={S.heroActions}>
              <button type="button" className="primary-button" style={S.primaryButton} onClick={() => goTo('/post-job')}>
                <Icon size={18}>{icons.plus}</Icon> Post a new job
              </button>
              <button type="button" className="secondary-button" style={S.secondaryButton} onClick={() => goTo('/browse-jobs')}>
                <Icon size={18}>{icons.users}</Icon> Explore talent
              </button>
            </div>
          </div>

          {/* Stats Panel */}
          <div style={S.heroPanel}>
            <div style={S.heroPanelTop}>
              <div>
                <div style={S.panelEyebrow}>Hiring overview</div>
                <div style={S.panelHeading}>Your recruitment activity</div>
              </div>
              <div style={S.sparkleIcon}><Icon size={19}>{icons.sparkle}</Icon></div>
            </div>
            <div className="stats-grid" style={S.statsGrid}>
              <StatCard icon={icons.briefcase} number={jobs.length} label="Job listings" tone="blue" />
              <StatCard icon={icons.users} number={totalApplicants} label="Applicants" tone="orange" />
              <StatCard icon={icons.star} number={totalShortlisted} label="Shortlisted" tone="amber" />
              <StatCard icon={icons.trophy} number={0} label="Hired" tone="purple" />
            </div>
          </div>
        </section>

        {/* ======================================================
            MAIN CONTENT GRID
        ====================================================== */}
        <div className="content-grid" style={S.contentGrid}>
          
          {/* Left: Recent Jobs */}
          <section style={S.card}>
            <div style={S.cardHeader}>
              <div>
                <div style={S.cardTitle}>Recent job listings</div>
                <div style={S.cardSubtitle}>Keep track of the opportunities you're actively managing.</div>
              </div>
              <button type="button" className="view-link" style={S.viewAll} onClick={() => goTo('/listings')}>
                View all <Icon size={15}>{icons.arrow}</Icon>
              </button>
            </div>

            {/* Loading */}
            {loading ? (
              <div style={S.loadingState}>
                <div style={S.loadingCircle} />
                <div>
                  <div style={S.loadingTitle}>Loading your listings...</div>
                  <div style={S.loadingText}>Fetching your latest recruitment activity.</div>
                </div>
              </div>
            ) : jobs.length === 0 ? (
              /* Empty State */
              <div style={S.emptyState}>
                <div style={S.emptyIllustration}><Icon size={28}>{icons.briefcase}</Icon></div>
                <div style={S.emptyTitle}>Your hiring journey starts here</div>
                <div style={S.emptyText}>Create your first job listing and start discovering qualified candidates.</div>
                <button type="button" className="primary-button" style={S.emptyButton} onClick={() => goTo('/post-job')}>
                  <Icon size={17}>{icons.plus}</Icon> Create your first job
                </button>
              </div>
            ) : (
              /* List Jobs */
              <div>
                {jobs.slice(0, 5).map((job, index) => (
                  <div 
                    key={job.id} 
                    className="job-row" 
                    style={{
                      ...S.jobRow,
                      borderBottom: index === Math.min(jobs.length, 5) - 1 ? 'none' : `1px solid ${C.border}`
                    }}
                  >
                    <div style={S.jobInfo}>
                      <div style={S.jobIcon}><Icon size={19}>{icons.briefcase}</Icon></div>
                      <div style={{ minWidth: 0 }}>
                        <div style={S.jobTitle}>{job.title || 'Untitled position'}</div>
                        <div style={S.jobDetails}>
                          {job.company && <span>{job.company}</span>}
                          {job.location && (
                            <>
                              <span style={S.detailSeparator}> • </span>
                              <span style={S.detailWithIcon}>
                                <Icon size={13}>{icons.mapPin}</Icon> {job.location}
                              </span>
                            </>
                          )}
                          {job.type && (
                            <>
                              <span style={S.detailSeparator}> • </span>
                              <span>{job.type}</span>
                            </>
                          )}
                        </div>
                        <div style={S.postedDate}>
                          <Icon size={13}>{icons.clock}</Icon> Posted {formatDate(job.created_at)}
                        </div>
                      </div>
                    </div>
                    <button type="button" className="job-button" style={S.jobButton} onClick={() => goTo(`/applicants/${job.id}`)}>
                      View applicants <Icon size={15}>{icons.chevron}</Icon>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Right: Sidebar */}
          <div className="right-column" style={S.rightColumn}>
            
            {/* Profile */}
            <section style={S.card}>
              <div style={S.profileTop}>
                <div style={S.avatar}>{getInitials(displayName)}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={S.profileName}>{displayName}</div>
                  <div style={S.profileRole}>Employer account</div>
                </div>
                <div style={S.verifiedIcon}><Icon size={15}>{icons.shield}</Icon></div>
              </div>
              <div style={S.profileDivider} />
              <div style={S.profileRow}>
                <div style={S.profileLabel}><Icon size={15}>{icons.mail}</Icon> Email</div>
                <div style={S.profileValue}>{profile?.email || 'Not available'}</div>
              </div>
              <div style={S.profileRow}>
                <div style={S.profileLabel}><Icon size={15}>{icons.shield}</Icon> Account</div>
                <div style={S.verifiedBadge}>Verified</div>
              </div>
            </section>

            {/* Quick Actions */}
            <section style={S.card}>
              <div style={S.cardTitle}>Quick actions</div>
              <div style={S.cardSubtitle}>Everything you need, one click away.</div>
              <div style={S.actionList}>
                <ActionCard 
                  icon={icons.plus} 
                  title="Post a job" 
                  description="Create a new opportunity" 
                  tone="orange" 
                  onClick={() => goTo('/post-job')} 
                />
                <ActionCard 
                  icon={icons.users} 
                  title="Browse talent" 
                  description="Discover potential candidates" 
                  tone="blue" 
                  onClick={() => goTo('/browse-jobs')} 
                />
                <ActionCard 
                  icon={icons.chart} 
                  title="View analytics" 
                  description="Understand your hiring activity" 
                  tone="purple" 
                  onClick={() => goTo('/analytics')} 
                />
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  )
}

// ============================================================
// STAT CARD SUBCOMPONENT
// ============================================================
function StatCard({ icon, number, label, tone = 'blue' }) {
  const tones = {
    blue: { background: C.blueSoft, color: C.blue },
    orange: { background: C.accentSoft, color: C.accent },
    amber: { background: C.amberSoft, color: C.amber },
    purple: { background: C.purpleSoft, color: C.purple },
  }
  const current = tones[tone] || tones.blue
  return (
    <div className="stat-card" style={S.statCard}>
      <div style={{ ...S.statIcon, background: current.background, color: current.color }}>
        <Icon size={19}>{icon}</Icon>
      </div>
      <div style={S.statNumber}>{number}</div>
      <div style={S.statLabel}>{label}</div>
    </div>
  )
}

// ============================================================
// ACTION CARD SUBCOMPONENT
// ============================================================
function ActionCard({ icon, title, description, tone = 'blue', onClick }) {
  const tones = {
    orange: { background: C.accentSoft, color: C.accent },
    blue: { background: C.blueSoft, color: C.blue },
    purple: { background: C.purpleSoft, color: C.purple },
  }
  const current = tones[tone] || tones.blue
  return (
    <button type="button" className="action-card" onClick={onClick} style={S.actionCard}>
      <div style={{ ...S.actionIcon, background: current.background, color: current.color }}>
        <Icon size={18}>{icon}</Icon>
      </div>
      <div style={S.actionContent}>
        <div style={S.actionTitle}>{title}</div>
        <div style={S.actionDescription}>{description}</div>
      </div>
      <Icon size={17}>{icons.chevron}</Icon>
    </button>
  )
}

// ============================================================
// STYLES
// ============================================================
const S = {
  page: { minHeight: '100vh', background: C.page, color: C.ink, position: 'relative', overflow: 'hidden' },
  main: { width: '100%', maxWidth: '1380px', margin: '0 auto', padding: '34px 34px 60px', position: 'relative', zIndex: 1 },

  // Hero
  hero: { display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: '30px', alignItems: 'center', marginBottom: '28px' },
  eyebrow: { 
    display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '7px 11px', 
    borderRadius: '999px', background: '#FFFFFF', border: `1px solid ${C.border}`, 
    color: C.secondary, fontSize: '12px', fontWeight: 700, marginBottom: '18px', 
    boxShadow: '0 2px 8px rgba(16,24,40,.025)' 
  },
  liveDot: { width: '7px', height: '7px', borderRadius: '50%', background: C.green, boxShadow: `0 0 0 4px ${C.greenSoft}` },
  heroTitle: { margin: 0, fontSize: '42px', lineHeight: 1.08, letterSpacing: '-1.8px', fontWeight: 800, color: C.ink },
  heroHighlight: { color: C.accent },
  heroDescription: { maxWidth: '590px', margin: '17px 0 25px', color: C.muted, fontSize: '15px', lineHeight: 1.7 },
  heroActions: { display: 'flex', alignItems: 'center', gap: '11px' },
  primaryButton: { 
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 18px', 
    border: 'none', borderRadius: '11px', background: C.accent, color: '#FFFFFF', fontSize: '13px', 
    fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 18px rgba(234,78,27,.18)' 
  },
  secondaryButton: { 
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px 17px', 
    border: `1px solid ${C.border}`, borderRadius: '11px', background: '#FFFFFF', color: C.ink, 
    fontSize: '13px', fontWeight: 700, cursor: 'pointer' 
  },

  // Hero Panel
  heroPanel: { 
    background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFBFD 100%)', 
    border: `1px solid ${C.border}`, borderRadius: '22px', padding: '20px', boxShadow: C.shadow 
  },
  heroPanelTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '17px' },
  panelEyebrow: { color: C.faint, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '4px' },
  panelHeading: { fontSize: '15px', fontWeight: 750, color: C.ink },
  sparkleIcon: { width: '38px', height: '38px', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent, background: C.accentSoft },
  
  // Stats
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  statCard: { 
    minHeight: '115px', padding: '15px', borderRadius: '15px', border: `1px solid ${C.border}`, 
    background: '#FFFFFF', boxShadow: '0 1px 2px rgba(16,24,40,.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' 
  },
  statIcon: { width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statNumber: { marginTop: '8px', fontSize: '25px', lineHeight: 1, fontWeight: 800, letterSpacing: '-.8px', color: C.ink },
  statLabel: { marginTop: '5px', fontSize: '11px', fontWeight: 600, color: C.muted },

  // Content Grid
  contentGrid: { display: 'grid', gridTemplateColumns: '1.65fr .85fr', gap: '28px', alignItems: 'start' },
  card: { background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: '20px', padding: '23px', boxShadow: C.shadow },
  cardHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', paddingBottom: '18px', marginBottom: '2px', borderBottom: `1px solid ${C.border}` },
  cardTitle: { fontSize: '15px', fontWeight: 800, color: C.ink },
  cardSubtitle: { marginTop: '5px', color: C.muted, fontSize: '12px', lineHeight: 1.5 },
  viewAll: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: 0, border: 'none', background: 'transparent', color: C.accent, fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },

  // Jobs
  jobRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', padding: '17px 4px' },
  jobInfo: { display: 'flex', alignItems: 'center', gap: '13px', minWidth: 0 },
  jobIcon: { flex: '0 0 auto', width: '42px', height: '42px', borderRadius: '12px', background: C.blueSoft, color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  jobTitle: { fontSize: '14px', fontWeight: 750, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  jobDetails: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginTop: '5px', color: C.muted, fontSize: '11px' },
  detailSeparator: { color: '#CBD5E1' },
  detailWithIcon: { display: 'inline-flex', alignItems: 'center', gap: '3px' },
  postedDate: { display: 'flex', alignItems: 'center', gap: '4px', marginTop: '5px', color: C.faint, fontSize: '10px', fontWeight: 500 },
  jobButton: { flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px 11px', borderRadius: '9px', border: `1px solid ${C.border}`, background: '#FFFFFF', color: C.secondary, fontSize: '11px', fontWeight: 700, cursor: 'pointer' },

  // Right Sidebar
  rightColumn: { display: 'flex', flexDirection: 'column', gap: '18px' },
  profileTop: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { flex: '0 0 auto', width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(145deg, #172033, #344054)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 800, letterSpacing: '.5px', boxShadow: '0 7px 16px rgba(16,24,40,.14)' },
  profileName: { fontSize: '14px', fontWeight: 800, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  profileRole: { marginTop: '4px', color: C.muted, fontSize: '11px' },
  verifiedIcon: { marginLeft: 'auto', width: '28px', height: '28px', borderRadius: '50%', background: C.greenSoft, color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  profileDivider: { height: '1px', background: C.border, margin: '18px 0 8px' },
  profileRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', padding: '10px 0' },
  profileLabel: { display: 'flex', alignItems: 'center', gap: '7px', color: C.muted, fontSize: '11px', fontWeight: 600 },
  profileValue: { maxWidth: '190px', color: C.secondary, fontSize: '11px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' },
  verifiedBadge: { padding: '4px 8px', borderRadius: '999px', background: C.greenSoft, color: C.green, fontSize: '10px', fontWeight: 750 },

  // Actions
  actionList: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' },
  actionCard: { width: '100%', display: 'flex', alignItems: 'center', gap: '11px', padding: '10px', borderRadius: '12px', border: `1px solid ${C.border}`, background: '#FAFBFC', color: C.secondary, textAlign: 'left', cursor: 'pointer' },
  actionIcon: { flex: '0 0 auto', width: '34px', height: '34px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  actionContent: { flex: 1, minWidth: 0 },
  actionTitle: { color: C.ink, fontSize: '12px', fontWeight: 750 },
  actionDescription: { marginTop: '3px', color: C.muted, fontSize: '10px', lineHeight: 1.35 },

  // Empty State
  emptyState: { padding: '48px 25px 35px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  emptyIllustration: { width: '58px', height: '58px', borderRadius: '17px', background: C.accentSoft, color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' },
  emptyTitle: { fontSize: '15px', fontWeight: 800, color: C.ink },
  emptyText: { maxWidth: '400px', margin: '7px auto 18px', color: C.muted, fontSize: '12px', lineHeight: 1.6 },
  emptyButton: { padding: '10px 15px', fontSize: '12px' },

  // Loading
  loadingState: { display: 'flex', alignItems: 'center', gap: '13px', padding: '45px 10px', color: C.muted },
  loadingCircle: { width: '30px', height: '30px', flex: '0 0 auto', borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.accent, animation: 'spin .8s linear infinite' },
  loadingTitle: { fontSize: '12px', fontWeight: 700, color: C.ink },
  loadingText: { marginTop: '3px', fontSize: '10px', color: C.muted },
}