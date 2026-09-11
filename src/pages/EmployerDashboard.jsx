// src/pages/EmployerDashboard.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

const Icon = ({ children, size = 20, strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

const icons = {
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M3 12h18" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  star: <path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.8L12 16.8l-5.25 2.8 1-5.8L3.5 9.7l5.9-.9L12 3.5z" />,
  trophy: <><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v6a5 5 0 0 1-10 0V4z" /><path d="M7 5H4a3 3 0 0 0 3 4" /><path d="M17 5h3a3 3 0 0 1-3 4" /></>,
  arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  mapPin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  chart: <><path d="M4 19V5" /><path d="M4 19h17" /><path d="M8 15v-4" /><path d="M12 15V8" /><path d="M16 15V5" /><path d="M20 15v-7" /></>,
  sparkle: <><path d="m12 3 1.3 5.7L19 10l-5.7 1.3L12 17l-1.3-5.7L5 10l5.7-1.3L12 3Z" /><path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z" /></>,
}

const C = {
  page: '#F6F8FC',
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
}

export default function EmployerDashboard() {
  const [profile, setProfile] = useState(null)
  const [jobs, setJobs] = useState([])
  const [totalApplicants, setTotalApplicants] = useState(0)
  const [totalShortlisted, setTotalShortlisted] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    async function getData() {
      try {
        setLoading(true)
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) return

        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (mounted && profileData) setProfile({ ...profileData, email: profileData.email || user.email })

        const { data: jobsData } = await supabase.from('jobs').select('*').eq('employer_id', user.id).order('created_at', { ascending: false })
        const safeJobs = Array.isArray(jobsData) ? jobsData : []
        if (mounted) setJobs(safeJobs)

        if (safeJobs.length === 0) {
          if (mounted) { setTotalApplicants(0); setTotalShortlisted(0) }
          return
        }

        const jobIds = safeJobs.map(j => j.id).filter(Boolean)
        const { data: appsData } = await supabase.from('applications').select('*').in('job_id', jobIds)
        const applications = Array.isArray(appsData) ? appsData : []
        const shortlisted = applications.filter(a => a.status === 'interview' || a.status === 'offer').length

        if (mounted) {
          setTotalApplicants(applications.length)
          setTotalShortlisted(shortlisted)
        }
      } catch (err) {
        console.error('Employer dashboard error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    getData()
    return () => { mounted = false }
  }, [])

  const goTo = (path) => {
    if (path.startsWith('/employer')) navigate(path)
    else navigate(`/employer${path}`)
  }

  const getInitials = (name) => {
    if (!name) return 'E'
    return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
  }

  const displayName = profile?.full_name || 'Employer'
  const firstName = profile?.full_name?.split(/\s+/)[0] || 'Employer'

  const formatDate = (date) => {
    if (!date) return 'Recently posted'
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'Recently posted'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // ---- Shell nav ----
  const navItems = [
    { path: '/employer', label: 'Overview', icon: <Icon path={icons.briefcase} size={18} />, exact: true },
    { path: '/employer/post-job', label: 'Post a Job', icon: <Icon path={icons.plus} size={18} /> },
    { path: '/employer/my-jobs', label: 'My Job Listings', icon: <Icon path={icons.briefcase} size={18} /> },
    { path: '/employer/applicants', label: 'View Applicants', icon: <Icon path={icons.users} size={18} /> },
    { path: '/employer/analytics', label: 'Analytics', icon: <Icon path={icons.chart} size={18} /> },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <DashboardShellWrapper
      navItems={navItems}
      profile={{ full_name: displayName, role_label: 'Employer account' }}
      onLogout={handleLogout}
    >
      <div className="ed-main" style={s.main}>
        {/* Hero */}
        <section className="ed-hero" style={s.hero}>
          <div style={{ minWidth: 0 }}>
            <div style={s.eyebrow}>
              <span style={s.liveDot} /> Employer workspace
            </div>
            <h1 className="ed-hero-title" style={s.heroTitle}>
              Good to see you, <span style={s.heroHighlight}>{firstName}</span>
            </h1>
            <p style={s.heroDescription}>
              Build your team with confidence. Manage your opportunities, discover exceptional candidates, and keep your hiring pipeline moving.
            </p>
            <div className="ed-hero-actions" style={s.heroActions}>
              <button type="button" style={s.primaryButton} onClick={() => goTo('/post-job')}>
                <Icon size={18}>{icons.plus}</Icon> Post a new job
              </button>
              <button type="button" style={s.secondaryButton} onClick={() => goTo('/applicants')}>
                <Icon size={18}>{icons.users}</Icon> Explore talent
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={s.heroPanel}>
            <div style={s.heroPanelTop}>
              <div>
                <div style={s.panelEyebrow}>Hiring overview</div>
                <div style={s.panelHeading}>Your recruitment activity</div>
              </div>
              <div style={s.sparkleIcon}><Icon size={19}>{icons.sparkle}</Icon></div>
            </div>
            <div className="ed-stats-grid" style={s.statsGrid}>
              <StatCard icon={icons.briefcase} number={jobs.length} label="Job listings" tone="blue" />
              <StatCard icon={icons.users} number={totalApplicants} label="Applicants" tone="orange" />
              <StatCard icon={icons.star} number={totalShortlisted} label="Shortlisted" tone="amber" />
              <StatCard icon={icons.trophy} number={0} label="Hired" tone="purple" />
            </div>
          </div>
        </section>

        {/* Main grid */}
        <div className="ed-content-grid" style={s.contentGrid}>
          {/* Jobs */}
          <section style={s.card}>
            <div style={s.cardHeader}>
              <div>
                <div style={s.cardTitle}>Recent job listings</div>
                <div style={s.cardSubtitle}>Keep track of the opportunities you're actively managing.</div>
              </div>
              <button type="button" style={s.viewAll} onClick={() => goTo('/my-jobs')}>
                View all <Icon size={15}>{icons.arrow}</Icon>
              </button>
            </div>

            {loading ? (
              <div style={s.loadingState}>
                <div style={s.loadingCircle} />
                <div>
                  <div style={s.loadingTitle}>Loading your listings...</div>
                  <div style={s.loadingText}>Fetching your latest recruitment activity.</div>
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <div style={s.emptyState}>
                <div style={s.emptyIllustration}><Icon size={28}>{icons.briefcase}</Icon></div>
                <div style={s.emptyTitle}>Your hiring journey starts here</div>
                <div style={s.emptyText}>Create your first job listing and start discovering candidates.</div>
                <button type="button" style={s.primaryButton} onClick={() => goTo('/post-job')}>
                  <Icon size={17}>{icons.plus}</Icon> Create your first job
                </button>
              </div>
            ) : (
              <div>
                {jobs.slice(0, 5).map((job, index) => (
                  <div key={job.id} style={{
                    ...s.jobRow,
                    borderBottom: index === Math.min(jobs.length, 5) - 1 ? 'none' : `1px solid ${C.border}`,
                  }}>
                    <div style={s.jobInfo}>
                      <div style={s.jobIcon}><Icon size={19}>{icons.briefcase}</Icon></div>
                      <div style={{ minWidth: 0 }}>
                        <div style={s.jobTitle}>{job.title || 'Untitled position'}</div>
                        <div style={s.jobDetails}>
                          {job.company && <span>{job.company}</span>}
                          {job.location && (<><span style={s.detailSeparator}> • </span><span style={s.detailWithIcon}><Icon size={13}>{icons.mapPin}</Icon> {job.location}</span></>)}
                          {job.type && (<><span style={s.detailSeparator}> • </span><span>{job.type}</span></>)}
                        </div>
                        <div style={s.postedDate}><Icon size={13}>{icons.clock}</Icon> Posted {formatDate(job.created_at)}</div>
                      </div>
                    </div>
                    <button type="button" style={s.jobButton} onClick={() => goTo(`/applicants/${job.id}`)}>
                      View applicants <Icon size={15}>{icons.chevron}</Icon>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Right column */}
          <div className="ed-right-column" style={s.rightColumn}>
            <section style={s.card}>
              <div style={s.profileTop}>
                <div style={s.avatar}>{getInitials(displayName)}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={s.profileName}>{displayName}</div>
                  <div style={s.profileRole}>Employer account</div>
                </div>
                <div style={s.verifiedIcon}><Icon size={15}>{icons.shield}</Icon></div>
              </div>
              <div style={s.profileDivider} />
              <div style={s.profileRow}>
                <div style={s.profileLabel}><Icon size={15}>{icons.mail}</Icon> Email</div>
                <div style={s.profileValue}>{profile?.email || 'Not available'}</div>
              </div>
              <div style={s.profileRow}>
                <div style={s.profileLabel}><Icon size={15}>{icons.shield}</Icon> Account</div>
                <div style={s.verifiedBadge}>Verified</div>
              </div>
            </section>

            <section style={s.card}>
              <div style={s.cardTitle}>Quick actions</div>
              <div style={s.cardSubtitle}>Everything you need, one click away.</div>
              <div style={s.actionList}>
                <ActionCard icon={icons.plus} title="Post a job" description="Create a new opportunity" tone="orange" onClick={() => goTo('/post-job')} />
                <ActionCard icon={icons.users} title="Browse talent" description="Discover potential candidates" tone="blue" onClick={() => goTo('/applicants')} />
                <ActionCard icon={icons.chart} title="View analytics" description="Understand your hiring activity" tone="purple" onClick={() => goTo('/analytics')} />
              </div>
            </section>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ed-spin { to { transform: rotate(360deg); } }
        .ed-main { padding: clamp(16px, 3vw, 34px) clamp(16px, 3vw, 34px) 60px; max-width: 1380px; margin: 0 auto; }
        .ed-hero { display: grid; grid-template-columns: 1.05fr 1fr; gap: 30px; align-items: center; margin-bottom: 28px; }
        .ed-content-grid { display: grid; grid-template-columns: 1.65fr .85fr; gap: 24px; align-items: start; }
        .ed-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media (max-width: 1050px) {
          .ed-hero { grid-template-columns: 1fr; }
          .ed-content-grid { grid-template-columns: 1fr; }
          .ed-right-column { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        }
        @media (max-width: 760px) {
          .ed-hero-title { font-size: 30px !important; letter-spacing: -1px !important; }
          .ed-right-column { grid-template-columns: 1fr; }
          .ed-hero-actions { flex-direction: column; }
          .ed-hero-actions > button { width: 100%; }
          .ed-stats-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 380px) {
          .ed-stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </DashboardShellWrapper>
  )
}

// Local wrapper so this file stays self-contained (mirrors DashboardShell import)
import DashboardShell from '../components/DashboardShell'
function DashboardShellWrapper({ children, ...props }) {
  return (
    <DashboardShell
      brandLabel="EMPLOYER"
      accent="#F59E0B"
      logoMark={<Icon size={19} strokeWidth={2}>{icons.briefcase}</Icon>}
      {...props}
    >
      {children}
    </DashboardShell>
  )
}

// ────────────────────────────────────────────────────────────
function StatCard({ icon, number, label, tone }) {
  const tones = {
    blue: { background: C.blueSoft, color: C.blue },
    orange: { background: C.accentSoft, color: C.accent },
    amber: { background: C.amberSoft, color: C.amber },
    purple: { background: C.purpleSoft, color: C.purple },
  }
  const t = tones[tone] || tones.blue
  return (
    <div style={s.statCard}>
      <div style={{ ...s.statIcon, background: t.background, color: t.color }}>
        <Icon size={19}>{icon}</Icon>
      </div>
      <div style={s.statNumber}>{number}</div>
      <div style={s.statLabel}>{label}</div>
    </div>
  )
}

function ActionCard({ icon, title, description, tone, onClick }) {
  const tones = {
    orange: { background: C.accentSoft, color: C.accent },
    blue: { background: C.blueSoft, color: C.blue },
    purple: { background: C.purpleSoft, color: C.purple },
  }
  const t = tones[tone] || tones.blue
  return (
    <button type="button" onClick={onClick} style={s.actionCard}>
      <div style={{ ...s.actionIcon, background: t.background, color: t.color }}>
        <Icon size={18}>{icon}</Icon>
      </div>
      <div style={s.actionContent}>
        <div style={s.actionTitle}>{title}</div>
        <div style={s.actionDescription}>{description}</div>
      </div>
      <Icon size={17}>{icons.chevron}</Icon>
    </button>
  )
}

const s = {
  main: { width: '100%', position: 'relative', zIndex: 1 },

  hero: { marginBottom: 28 },
  eyebrow: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 11px', borderRadius: 999, background: '#FFFFFF', border: `1px solid ${C.border}`, color: C.secondary, fontSize: 12, fontWeight: 700, marginBottom: 18, boxShadow: '0 2px 8px rgba(16,24,40,.025)' },
  liveDot: { width: 7, height: 7, borderRadius: '50%', background: C.green, boxShadow: `0 0 0 4px ${C.greenSoft}` },
  heroTitle: { margin: 0, fontSize: 'clamp(28px, 3.5vw, 42px)', lineHeight: 1.08, letterSpacing: '-1.5px', fontWeight: 800, color: C.ink },
  heroHighlight: { color: C.accent },
  heroDescription: { maxWidth: 590, margin: '17px 0 25px', color: C.muted, fontSize: 15, lineHeight: 1.7 },
  heroActions: { display: 'flex', alignItems: 'center', gap: 11, flexWrap: 'wrap' },
  primaryButton: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 18px', border: 'none', borderRadius: 11, background: C.accent, color: '#FFFFFF', fontSize: 13, fontWeight: 700, cursor: 'pointer', minHeight: 44, boxShadow: '0 6px 18px rgba(234,78,27,.18)' },
  secondaryButton: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 17px', border: `1px solid ${C.border}`, borderRadius: 11, background: '#FFFFFF', color: C.ink, fontSize: 13, fontWeight: 700, cursor: 'pointer', minHeight: 44 },

  heroPanel: { background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFBFD 100%)', border: `1px solid ${C.border}`, borderRadius: 22, padding: 20, boxShadow: C.shadow },
  heroPanelTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 17, gap: 12, flexWrap: 'wrap' },
  panelEyebrow: { color: C.faint, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 },
  panelHeading: { fontSize: 15, fontWeight: 750, color: C.ink },
  sparkleIcon: { width: 38, height: 38, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent, background: C.accentSoft },

  statsGrid: { display: 'grid', gap: 10 },
  statCard: { minHeight: 115, padding: 15, borderRadius: 15, border: `1px solid ${C.border}`, background: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  statIcon: { width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statNumber: { marginTop: 8, fontSize: 25, lineHeight: 1, fontWeight: 800, letterSpacing: '-.8px', color: C.ink },
  statLabel: { marginTop: 5, fontSize: 11, fontWeight: 600, color: C.muted },

  contentGrid: { display: 'grid', gap: 24, alignItems: 'start' },
  card: { background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 20, padding: 'clamp(16px, 2.5vw, 23px)', boxShadow: C.shadow, minWidth: 0 },
  cardHeader: { display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, paddingBottom: 18, marginBottom: 2, borderBottom: `1px solid ${C.border}` },
  cardTitle: { fontSize: 15, fontWeight: 800, color: C.ink },
  cardSubtitle: { marginTop: 5, color: C.muted, fontSize: 12, lineHeight: 1.5 },
  viewAll: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0, border: 'none', background: 'transparent', color: C.accent, fontSize: 12, fontWeight: 700, cursor: 'pointer', minHeight: 44 },

  jobRow: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '17px 4px' },
  jobInfo: { display: 'flex', alignItems: 'center', gap: 13, minWidth: 0, flex: '1 1 220px' },
  jobIcon: { flex: '0 0 auto', width: 42, height: 42, borderRadius: 12, background: C.blueSoft, color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  jobTitle: { fontSize: 14, fontWeight: 750, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis' },
  jobDetails: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 5, color: C.muted, fontSize: 11 },
  detailSeparator: { color: '#CBD5E1' },
  detailWithIcon: { display: 'inline-flex', alignItems: 'center', gap: 3 },
  postedDate: { display: 'flex', alignItems: 'center', gap: 4, marginTop: 5, color: C.faint, fontSize: 10, fontWeight: 500 },
  jobButton: { flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '10px 14px', borderRadius: 9, border: `1px solid ${C.border}`, background: '#FFFFFF', color: C.secondary, fontSize: 11, fontWeight: 700, cursor: 'pointer', minHeight: 40 },

  rightColumn: { display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 },
  profileTop: { display: 'flex', alignItems: 'center', gap: 12 },
  avatar: { flex: '0 0 auto', width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(145deg, #172033, #344054)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800 },
  profileName: { fontSize: 14, fontWeight: 800, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  profileRole: { marginTop: 4, color: C.muted, fontSize: 11 },
  verifiedIcon: { marginLeft: 'auto', width: 28, height: 28, borderRadius: '50%', background: C.greenSoft, color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  profileDivider: { height: 1, background: C.border, margin: '18px 0 8px' },
  profileRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 15, padding: '10px 0' },
  profileLabel: { display: 'flex', alignItems: 'center', gap: 7, color: C.muted, fontSize: 11, fontWeight: 600 },
  profileValue: { maxWidth: '60%', color: C.secondary, fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' },
  verifiedBadge: { padding: '4px 8px', borderRadius: 999, background: C.greenSoft, color: C.green, fontSize: 10, fontWeight: 750 },

  actionList: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 },
  actionCard: { width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: 10, borderRadius: 12, border: `1px solid ${C.border}`, background: '#FAFBFC', color: C.secondary, textAlign: 'left', cursor: 'pointer', minHeight: 44 },
  actionIcon: { flex: '0 0 auto', width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  actionContent: { flex: 1, minWidth: 0 },
  actionTitle: { color: C.ink, fontSize: 12, fontWeight: 750 },
  actionDescription: { marginTop: 3, color: C.muted, fontSize: 10, lineHeight: 1.35 },

  emptyState: { padding: '48px 25px 35px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  emptyIllustration: { width: 58, height: 58, borderRadius: 17, background: C.accentSoft, color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 15, fontWeight: 800, color: C.ink },
  emptyText: { maxWidth: 400, margin: '7px auto 18px', color: C.muted, fontSize: 12, lineHeight: 1.6 },

  loadingState: { display: 'flex', alignItems: 'center', gap: 13, padding: '45px 10px', color: C.muted },
  loadingCircle: { width: 30, height: 30, flex: '0 0 auto', borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.accent, animation: 'ed-spin .8s linear infinite' },
  loadingTitle: { fontSize: 12, fontWeight: 700, color: C.ink },
  loadingText: { marginTop: 3, fontSize: 10, color: C.muted },
}