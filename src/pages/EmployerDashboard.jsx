import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

// ---------- inline icon set (shared visual language across CareerBridge pages) ----------
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

const C = {
  bg: '#F8F9FB',
  ink: '#0F172A',
  sub: '#94A3B8',
  border: '#EEF1F5',
  card: '#FFFFFF',
  navActiveBg: '#111827',
  navActiveText: '#FFFFFF',
  navText: '#475569',
  accent: '#EA4E1B',
  teal: '#0E9C8F',
  navy: '#0B3B57',
  gold: '#F0A93A',
  green: '#0E9C6B',
  red: '#DC2626',
  blue: '#2563EB',
}

export default function EmployerDashboard() {
  const [profile, setProfile] = useState(null)
  const [jobs, setJobs] = useState([])
  const [totalApplicants, setTotalApplicants] = useState(0)
  const [totalShortlisted, setTotalShortlisted] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')
  const navigate = useNavigate()

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)
      const { data: jobsData } = await supabase.from('jobs').select('*').eq('employer_id', user.id).order('created_at', { ascending: false })
      setJobs(jobsData || [])
      if (jobsData && jobsData.length > 0) {
        const jobIds = jobsData.map(j => j.id)
        const { data: appsData } = await supabase.from('applications').select('*').in('job_id', jobIds)
        setTotalApplicants(appsData?.length || 0)
        setTotalShortlisted(appsData?.filter(a => a.status === 'interview' || a.status === 'offer').length || 0)
      }
    }
    getData()
  }, [])

  async function handleLogout() { await supabase.auth.signOut() }

  const initials = (name) => (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .pageIn{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) forwards}
        .cardIn{animation:fadeUp .6s cubic-bezier(.16,1,.3,1) forwards}
        .c2{animation-delay:.08s;opacity:0}
        .c3{animation-delay:.16s;opacity:0}
        .c4{animation-delay:.24s;opacity:0}
        .metCard{transition:transform .25s ease,box-shadow .25s ease;cursor:default}
        .metCard:hover{transform:translateY(-5px);box-shadow:0 20px 40px rgba(15,23,42,0.1)!important}
        .jobRow{transition:all .2s ease}
        .jobRow:hover{border-color:#FFDCC7!important;box-shadow:0 8px 24px rgba(234,78,27,0.09)!important}
        .navBtn{transition:all .15s ease;cursor:pointer}
        .navBtn:hover{background:#F1F5F9!important}
        .navBtn.active:hover{background:${C.navActiveBg}!important}
        .logoutBtn{transition:all .2s ease}
        .logoutBtn:hover{background:#FEF2F2!important;color:${C.red}!important;border-color:#FECACA!important}
        .progressBar{background:linear-gradient(90deg,${C.teal},#3ECFB8);background-size:200% 100%;animation:shimmer 2s linear infinite}
        .postBtn{transition:all .2s ease}
        .postBtn:hover{transform:translateY(-2px);box-shadow:0 10px 22px rgba(234,78,27,0.3)!important}
        .viewBtn{transition:all .2s ease}
        .viewBtn:hover{background:#FFF4EE!important;color:${C.accent}!important;border-color:#FFDCC7!important}
        .quickAction{transition:all .2s ease}
        .quickAction:hover{background:#FFF4EE!important;border-color:#FFDCC7!important}
        @media(max-width:1024px){
          .grid2{grid-template-columns:1fr!important}
        }
        @media(max-width:768px){
          .sidebar{display:none!important}
          .main{padding:20px 16px!important}
          .metricsRow{grid-template-columns:1fr 1fr!important}
        }
      `}</style>

      <div style={S.layout}>
        <aside className="sidebar" style={S.sidebar}>
          <div style={S.logoRow}>
            <div style={S.logoMark}><Icon path={icons.grid} size={16} /></div>
            <span style={S.logoText}>CareerBridge</span>
          </div>

          <nav style={S.navList}>
            <button className={`navBtn${activeTab === 'overview' ? ' active' : ''}`} style={{ ...S.navItem, ...(activeTab === 'overview' ? S.navItemActive : {}) }} onClick={() => setActiveTab('overview')}>
              <Icon path={icons.grid} size={17} /> Overview
            </button>
            <button className={`navBtn${activeTab === 'listings' ? ' active' : ''}`} style={{ ...S.navItem, ...(activeTab === 'listings' ? S.navItemActive : {}) }} onClick={() => setActiveTab('listings')}>
              <Icon path={icons.briefcase} size={17} /> My Listings
              {jobs.length > 0 && <span style={S.navBadge}>{jobs.length}</span>}
            </button>
            <button className="navBtn" style={S.navItem} onClick={() => navigate('/post-job')}>
              <Icon path={icons.plus} size={17} /> Post a Job
            </button>
            <button className="navBtn" style={S.navItem} onClick={() => navigate('/browse-jobs')}>
              <Icon path={icons.search} size={17} /> Browse All Jobs
            </button>
            <button className="navBtn" style={S.navItem} onClick={() => navigate('/analytics')}>
              <Icon path={icons.grid} size={17} /> Analytics
            </button>
          </nav>

          <div style={S.statsBox}>
            <div style={S.statsBoxTitle}>At a glance</div>
            <div style={S.statsBoxRow}>
              <span style={S.statsBoxLabel}>Active jobs</span>
              <span style={S.statsBoxVal}>{jobs.length}</span>
            </div>
            <div style={S.statsBoxRow}>
              <span style={S.statsBoxLabel}>Total applicants</span>
              <span style={S.statsBoxVal}>{totalApplicants}</span>
            </div>
            <div style={{ ...S.statsBoxRow, marginBottom: 0 }}>
              <span style={S.statsBoxLabel}>Shortlisted</span>
              <span style={{ ...S.statsBoxVal, color: C.teal }}>{totalShortlisted}</span>
            </div>
          </div>

          <div style={S.sidebarFooter}>
            <div style={S.userAvatar}>{initials(profile?.full_name || 'Employer')}</div>
            <div>
              <div style={S.userName}>{profile?.full_name || 'Employer'}</div>
              <div style={S.userRole}>Employer</div>
            </div>
          </div>
          <button className="logoutBtn" style={S.logoutBtn} onClick={handleLogout}>
            <Icon path={icons.logout} size={15} /> Log out
          </button>
        </aside>

        <main className="main" style={S.main}>
          <div className="pageIn" style={S.topBar}>
            <div>
              <h1 style={S.heading}>Welcome back, {profile?.full_name?.split(' ')[0] || 'Employer'}</h1>
              <p style={S.headSub}>Manage your job listings and find the best candidates</p>
            </div>
            <button className="postBtn" style={S.postBtn} onClick={() => navigate('/post-job')}>
              <Icon path={icons.plus} size={16} /> Post a job
            </button>
          </div>

          <div className="metricsRow" style={S.metricsRow}>
            {[
              { label: 'Active Listings', val: jobs.length, color: C.blue, bg: '#EFF6FF', icon: icons.briefcase },
              { label: 'Total Applicants', val: totalApplicants, color: C.teal, bg: '#ECFDF5', icon: icons.users },
              { label: 'Shortlisted', val: totalShortlisted, color: C.gold, bg: '#FEFCE8', icon: icons.star },
              { label: 'Hired', val: 0, color: C.accent, bg: '#FFF1EA', icon: icons.trophy },
            ].map((m, i) => (
              <div key={i} className={`metCard cardIn c${i + 1}`} style={{ ...S.metCard, borderTop: `3px solid ${m.color}` }}>
                <div style={{ ...S.metIcon, background: m.bg, color: m.color }}><Icon path={m.icon} size={18} /></div>
                <div style={{ ...S.metVal, color: m.color }}>{m.val}</div>
                <div style={S.metLabel}>{m.label}</div>
              </div>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="grid2" style={S.grid2}>
              <div className="cardIn c3" style={S.card}>
                <div style={S.cardHead}>
                  <div style={S.cardTitle}>Recent Job Listings</div>
                  <span style={S.cardLink} onClick={() => setActiveTab('listings')}>View all →</span>
                </div>
                {jobs.length === 0 && (
                  <div style={S.empty}>
                    <div style={{ color: C.sub, display: 'flex', justifyContent: 'center', marginBottom: '10px' }}><Icon path={icons.inbox} size={32} /></div>
                    <div style={S.emptyText}>No jobs posted yet</div>
                    <div style={S.emptySubText}>Post your first job to start receiving applications</div>
                    <button className="postBtn" style={{ ...S.postBtn, marginTop: '14px', fontSize: '13px', padding: '10px 20px' }} onClick={() => navigate('/post-job')}>
                      <Icon path={icons.plus} size={14} /> Post a job
                    </button>
                  </div>
                )}
                {jobs.slice(0, 4).map(job => (
                  <div key={job.id} className="jobRow" style={S.jobRow}>
                    <div style={S.jobLeft}>
                      <div style={S.jobTitle}>{job.title}</div>
                      <div style={S.jobMeta}>{job.company} · {job.location} · {job.type}</div>
                      {job.skills && (
                        <div style={S.skillsWrap}>
                          {job.skills.split(',').slice(0, 3).map((s, i) => (
                            <span key={i} style={S.skillChip}>{s.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button className="viewBtn" style={S.viewBtn} onClick={() => navigate(`/applicants/${job.id}`)}>View applicants</button>
                  </div>
                ))}
              </div>

              <div style={S.rightCol}>
                <div className="cardIn c4" style={{ ...S.card, marginBottom: '16px' }}>
                  <div style={S.cardTitle}>Company Profile</div>
                  <div style={S.profileRow}><span style={S.profileLabel}>Name</span><span style={S.profileVal}>{profile?.full_name || '-'}</span></div>
                  <div style={S.profileRow}><span style={S.profileLabel}>Email</span><span style={S.profileVal}>{profile?.email || '-'}</span></div>
                  <div style={{ ...S.profileRow, border: 'none' }}><span style={S.profileLabel}>Role</span><span style={S.roleBadge}>Employer</span></div>
                </div>
                <div className="cardIn c4" style={S.card}>
                  <div style={S.cardTitle}>Quick Actions</div>
                  <div style={S.quickActions}>
                    <div className="quickAction" style={S.quickAction} onClick={() => navigate('/post-job')}>
                      <Icon path={icons.plus} size={20} style={{ color: C.accent }} />
                      <span style={S.qaLabel}>Post Job</span>
                    </div>
                    <div className="quickAction" style={S.quickAction} onClick={() => navigate('/browse-jobs')}>
                      <Icon path={icons.search} size={20} style={{ color: C.accent }} />
                      <span style={S.qaLabel}>Browse Jobs</span>
                    </div>
                    <div className="quickAction" style={S.quickAction} onClick={() => setActiveTab('listings')}>
                      <Icon path={icons.briefcase} size={20} style={{ color: C.accent }} />
                      <span style={S.qaLabel}>My Listings</span>
                    </div>
                    <div className="quickAction" style={S.quickAction} onClick={() => navigate('/analytics')}>
                      <Icon path={icons.grid} size={20} style={{ color: C.accent }} />
                      <span style={S.qaLabel}>Analytics</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="cardIn" style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardTitle}>All Job Listings ({jobs.length})</div>
                <button className="postBtn" style={{ ...S.postBtn, fontSize: '13px', padding: '9px 18px' }} onClick={() => navigate('/post-job')}>
                  <Icon path={icons.plus} size={14} /> Post new job
                </button>
              </div>
              {jobs.length === 0 && (
                <div style={S.empty}>
                  <div style={{ color: C.sub, display: 'flex', justifyContent: 'center', marginBottom: '10px' }}><Icon path={icons.inbox} size={32} /></div>
                  <div style={S.emptyText}>No jobs posted yet</div>
                </div>
              )}
              {jobs.map(job => (
                <div key={job.id} className="jobRow" style={S.jobRow}>
                  <div style={S.jobLeft}>
                    <div style={S.jobTitle}>{job.title}</div>
                    <div style={S.jobMeta}>{job.company} · {job.location} · {job.type}</div>
                    {job.skills && (
                      <div style={S.skillsWrap}>
                        {job.skills.split(',').slice(0, 4).map((s, i) => (
                          <span key={i} style={S.skillChip}>{s.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="viewBtn" style={S.viewBtn} onClick={() => navigate(`/applicants/${job.id}`)}>View applicants</button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: C.bg, fontFamily: "'Inter', -apple-system, sans-serif" },
  layout: { display: 'grid', gridTemplateColumns: '232px 1fr', minHeight: '100vh' },

  // sidebar (shared light style with Analytics / BrowseJobs / StudentProfile / ResumeBuilder)
  sidebar: { background: C.card, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', padding: '22px 16px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px', marginBottom: '24px' },
  logoMark: { width: '30px', height: '30px', borderRadius: '9px', background: C.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: '17px', fontWeight: '800', color: C.ink, letterSpacing: '-0.4px' },
  navList: { display: 'flex', flexDirection: 'column', gap: '4px' },
  navItem: { display: 'flex', alignItems: 'center', gap: '11px', padding: '10px 12px', borderRadius: '10px', border: 'none', background: 'transparent', color: C.navText, fontSize: '14px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' },
  navItemActive: { background: C.navActiveBg, color: C.navActiveText },
  navBadge: { marginLeft: 'auto', background: C.teal, color: '#fff', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px' },

  statsBox: { margin: '16px 0 0', padding: '16px', background: '#F8FAFC', border: `1px solid ${C.border}`, borderRadius: '12px' },
  statsBoxTitle: { fontSize: '11px', fontWeight: '700', color: C.sub, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.8px' },
  statsBoxRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  statsBoxLabel: { fontSize: '12.5px', color: C.navText, fontWeight: '500' },
  statsBoxVal: { fontSize: '13px', fontWeight: '800', color: C.ink },

  sidebarFooter: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 10px', borderTop: `1px solid ${C.border}`, marginTop: '16px' },
  userAvatar: { width: '34px', height: '34px', borderRadius: '10px', background: '#F1F5F9', color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' },
  userName: { fontSize: '13.5px', fontWeight: '700', color: C.ink, maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole: { fontSize: '12px', color: C.sub },
  logoutBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', marginTop: '10px', padding: '10px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: C.navText },

  main: { padding: '32px 36px', overflowY: 'auto' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '28px' },
  heading: { fontSize: '22px', fontWeight: '800', color: C.ink, marginBottom: '4px' },
  headSub: { fontSize: '14px', color: C.sub },
  postBtn: { display: 'flex', alignItems: 'center', gap: '7px', padding: '11px 22px', background: C.accent, color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', boxShadow: '0 4px 12px rgba(234,78,27,0.28)' },

  metricsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' },
  metCard: { background: C.card, borderRadius: '14px', padding: '20px', border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.04)' },
  metIcon: { width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' },
  metVal: { fontSize: '28px', fontWeight: '800', marginBottom: '4px' },
  metLabel: { fontSize: '12.5px', color: C.sub, fontWeight: '600' },

  grid2: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px' },
  rightCol: {},
  card: { background: C.card, borderRadius: '16px', padding: '22px', border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.04)', marginBottom: '0' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  cardTitle: { fontSize: '15px', fontWeight: '800', color: C.ink, marginBottom: '16px' },
  cardLink: { fontSize: '13px', color: C.accent, fontWeight: '700', cursor: 'pointer', marginBottom: '16px' },

  jobRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '10px', border: `1px solid ${C.border}`, marginBottom: '10px', background: '#FAFBFC' },
  jobLeft: { flex: 1 },
  jobTitle: { fontSize: '14px', fontWeight: '700', color: C.ink, marginBottom: '3px' },
  jobMeta: { fontSize: '12px', color: C.sub, marginBottom: '6px' },
  skillsWrap: { display: 'flex', flexWrap: 'wrap', gap: '5px' },
  skillChip: { background: '#FFF4EE', color: C.accent, padding: '3px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: '600' },
  viewBtn: { padding: '8px 16px', background: C.card, color: C.navText, border: `1px solid ${C.border}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', marginLeft: '12px' },

  profileRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: `1px solid ${C.border}` },
  profileLabel: { fontSize: '12.5px', color: C.sub, fontWeight: '500' },
  profileVal: { fontSize: '13px', fontWeight: '600', color: C.navText },
  roleBadge: { background: '#ECFDF5', color: C.teal, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },

  quickActions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' },
  quickAction: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 10px', background: '#FAFBFC', borderRadius: '12px', cursor: 'pointer', border: `1px solid ${C.border}` },
  qaLabel: { fontSize: '12px', fontWeight: '700', color: C.navText, textAlign: 'center' },

  empty: { textAlign: 'center', padding: '40px 0', color: C.sub },
  emptyText: { fontSize: '14px', fontWeight: '700', color: C.navText, marginBottom: '4px' },
  emptySubText: { fontSize: '13px' }
}
