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
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.3 3-6 6.5-6s6.5 2.7 6.5 6" /><path d="M16 8.2a3 3 0 1 1 3.6 3M21.5 20c0-2.6-1.8-4.8-4.3-5.6" /></>,
  star: <path d="M12 3.5l2.5 5.5 6 .7-4.4 4.2 1.2 6-5.3-3-5.3 3 1.2-6-4.4-4.2 6-.7z" />,
  trophy: <><path d="M8 21h8M12 17v4" /><path d="M7 4h10v6a5 5 0 0 1-10 0V4z" /><path d="M7 5H4a3 3 0 0 0 3 4M17 5h3a3 3 0 0 1-3 4" /></>,
  inbox: <><path d="M3 12h4l2 3h6l2-3h4" /><path d="M5 5h14l2 7v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7z" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
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

  const initials = (name) => (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div style={S.container}>
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
        .postBtn{transition:all .2s ease}
        .postBtn:hover{transform:translateY(-2px);box-shadow:0 10px 22px rgba(234,78,27,0.3)!important}
        .viewBtn{transition:all .2s ease}
        .viewBtn:hover{background:#FFF4EE!important;color:${C.accent}!important;border-color:#FFDCC7!important}
        .quickAction{transition:all .2s ease}
        .quickAction:hover{background:#FFF4EE!important;border-color:#FFDCC7!important}
        .progressBar{background:linear-gradient(90deg,${C.teal},#3ECFB8);background-size:200% 100%;animation:shimmer 2s linear infinite}
        @media(max-width:1024px){
          .grid2{grid-template-columns:1fr!important}
        }
        @media(max-width:768px){
          .main{padding:20px 16px!important}
          .metricsRow{grid-template-columns:1fr 1fr!important}
        }
      `}</style>

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

        {/* ------------- OVERVIEW CONTENT ------------- */}
        <div className="grid2" style={S.grid2}>
          <div className="cardIn c3" style={S.card}>
            <div style={S.cardHead}>
              <div style={S.cardTitle}>Recent Job Listings</div>
              {/* 🟢 Changed from internal state to direct URL navigation */}
              <span style={S.cardLink} onClick={() => navigate('/employer/listings')}>View all →</span>
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
                <div className="quickAction" style={S.quickAction} onClick={() => navigate('/analytics')}>
                  <Icon path={icons.grid} size={20} style={{ color: C.accent }} />
                  <span style={S.qaLabel}>Analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// ============================================================
// 🎨 STYLES
// ============================================================
const S = {
  container: { minHeight: '100vh', background: C.bg, fontFamily: "'Inter', -apple-system, sans-serif" },

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