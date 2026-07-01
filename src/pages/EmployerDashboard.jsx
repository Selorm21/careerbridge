import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

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
        .jobRow:hover{border-color:#DBEAFE!important;box-shadow:0 8px 24px rgba(37,99,235,0.09)!important}
        .sideBtn{transition:all .2s ease;cursor:pointer}
        .sideBtn:hover{background:#EFF6FF!important;color:#2563EB!important}
        .logoutBtn{transition:all .2s ease}
        .logoutBtn:hover{background:#FEF2F2!important;color:#DC2626!important;border-color:#FECACA!important}
        .progressBar{background:linear-gradient(90deg,#059669,#34D399);background-size:200% 100%;animation:shimmer 2s linear infinite}
        .postBtn{transition:all .2s ease}
        .postBtn:hover{transform:translateY(-2px);box-shadow:0 10px 22px rgba(37,99,235,0.3)!important}
        .viewBtn{transition:all .2s ease}
        .viewBtn:hover{background:#EFF6FF!important;color:#2563EB!important}
      `}</style>

<div style={S.layout}>
        <aside style={S.sidebar}>
          <div style={S.sidebarTop}>
            <div style={S.sidebarLogo}>CareerBridge</div>
            <div style={S.avatarWrap}>
              <div style={{...S.avatar, background: 'linear-gradient(135deg, #059669, #34D399)'}}>
                {profile?.full_name?.charAt(0) || 'E'}
              </div>
              <div>
                <div style={S.avatarName}>{profile?.full_name || 'Employer'}</div>
                <div style={S.avatarRole}>Employer</div>
              </div>
            </div>
          </div>

          <nav style={S.sideNav}>
            <div className="sideBtn" style={{...S.sideNavItem, ...(activeTab==='overview' ? S.sideNavActive : {})}} onClick={() => setActiveTab('overview')}>
              <span style={S.sideNavIcon}>📊</span> Overview
            </div>
            <div className="sideBtn" style={{...S.sideNavItem, ...(activeTab==='listings' ? S.sideNavActive : {})}} onClick={() => setActiveTab('listings')}>
              <span style={S.sideNavIcon}>💼</span> My Listings
              {jobs.length > 0 && <span style={S.navBadge}>{jobs.length}</span>}
            </div>
            <div className="sideBtn" style={S.sideNavItem} onClick={() => navigate('/post-job')}>
              <span style={S.sideNavIcon}>➕</span> Post a Job
            </div>
            <div className="sideBtn" style={S.sideNavItem} onClick={() => navigate('/browse-jobs')}>
              <span style={S.sideNavIcon}>🔍</span> Browse All Jobs
            </div>
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
            <div style={S.statsBoxRow}>
              <span style={S.statsBoxLabel}>Shortlisted</span>
              <span style={{...S.statsBoxVal, color:'#34D399'}}>{totalShortlisted}</span>
            </div>
          </div>

          <button className="logoutBtn" style={S.logoutBtn} onClick={handleLogout}>← Log out</button>
        </aside>

        <main style={S.main}>
          <div className="pageIn" style={S.topBar}>
            <div>
              <h1 style={S.heading}>Welcome back, {profile?.full_name?.split(' ')[0] || 'Employer'} 👋</h1>
              <p style={S.headSub}>Manage your job listings and find the best candidates</p>
            </div>
            <button className="postBtn" style={S.postBtn} onClick={() => navigate('/post-job')}>+ Post a job</button>
          </div>

          <div style={S.metricsRow}>
            {[
              { label: 'Active Listings', val: jobs.length, color: '#2563EB', bg: '#EFF6FF', icon: '💼' },
              { label: 'Total Applicants', val: totalApplicants, color: '#059669', bg: '#ECFDF5', icon: '👥' },
              { label: 'Shortlisted', val: totalShortlisted, color: '#D97706', bg: '#FFFBEB', icon: '⭐' },
              { label: 'Hired', val: 0, color: '#7C3AED', bg: '#F5F3FF', icon: '🏆' },
            ].map((m, i) => (
              <div key={i} className={`metCard cardIn c${i+1}`} style={{...S.metCard, borderTop: `3px solid ${m.color}`}}>
                <div style={{...S.metIcon, background: m.bg}}>{m.icon}</div>
                <div style={{...S.metVal, color: m.color}}>{m.val}</div>
                <div style={S.metLabel}>{m.label}</div>
              </div>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div style={S.grid2}>
              <div className="cardIn c3" style={S.card}>
                <div style={S.cardHead}>
                  <div style={S.cardTitle}>Recent Job Listings</div>
                  <span style={S.cardLink} onClick={() => setActiveTab('listings')}>View all →</span>
                </div>
                {jobs.length === 0 && (
                  <div style={S.empty}>
                    <div style={S.emptyIcon}>📭</div>
                    <div style={S.emptyText}>No jobs posted yet</div>
                    <div style={S.emptySubText}>Post your first job to start receiving applications</div>
                    <button className="postBtn" style={{...S.postBtn, marginTop:'14px', fontSize:'13px', padding:'10px 20px'}} onClick={() => navigate('/post-job')}>Post a job</button>
                  </div>
                )}
                {jobs.slice(0,4).map(job => (
                  <div key={job.id} className="jobRow" style={S.jobRow}>
                    <div style={S.jobLeft}>
                      <div style={S.jobTitle}>{job.title}</div>
                      <div style={S.jobMeta}>{job.company} · {job.location} · {job.type}</div>
                      {job.skills && (
                        <div style={S.skillsWrap}>
                          {job.skills.split(',').slice(0,3).map((s,i) => (
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
                <div className="cardIn c4" style={{...S.card, marginBottom:'16px'}}>
                  <div style={S.cardTitle}>Company Profile</div>
                  <div style={S.profileRow}><span style={S.profileLabel}>Name</span><span style={S.profileVal}>{profile?.full_name || '-'}</span></div>
                  <div style={S.profileRow}><span style={S.profileLabel}>Email</span><span style={S.profileVal}>{profile?.email || '-'}</span></div>
                  <div style={{...S.profileRow, border:'none'}}><span style={S.profileLabel}>Role</span><span style={S.roleBadge}>Employer</span></div>
                </div>
                <div className="cardIn c4" style={S.card}>
                  <div style={S.cardTitle}>Quick Actions</div>
                  <div style={S.quickActions}>
                    <div style={S.quickAction} onClick={() => navigate('/post-job')}>
                      <span style={S.qaIcon}>➕</span>
                      <span style={S.qaLabel}>Post Job</span>
                    </div>
                    <div style={S.quickAction} onClick={() => navigate('/browse-jobs')}>
                      <span style={S.qaIcon}>🔍</span>
                      <span style={S.qaLabel}>Browse Jobs</span>
                    </div>
                    <div style={S.quickAction} onClick={() => setActiveTab('listings')}>
                      <span style={S.qaIcon}>💼</span>
                      <span style={S.qaLabel}>My Listings</span>
                    </div>
                    <div style={S.quickAction}>
                      <span style={S.qaIcon}>📊</span>
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
                <button className="postBtn" style={{...S.postBtn, fontSize:'13px', padding:'9px 18px'}} onClick={() => navigate('/post-job')}>+ Post new job</button>
              </div>
              {jobs.length === 0 && (
                <div style={S.empty}>
                  <div style={S.emptyIcon}>📭</div>
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
                        {job.skills.split(',').slice(0,4).map((s,i) => (
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
  page: { minHeight: '100vh', background: '#F1F5F9', fontFamily: "'Inter', -apple-system, sans-serif" },
  layout: { display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100vh' },

  sidebar: { background: '#0F172A', display: 'flex', flexDirection: 'column', padding: '0', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' },
  sidebarTop: { padding: '28px 24px 20px' },
  sidebarLogo: { fontSize: '18px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px', marginBottom: '28px' },
  avatarWrap: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { width: '42px', height: '42px', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', flexShrink: 0 },
  avatarName: { fontSize: '14px', fontWeight: '700', color: '#F1F5F9' },
  avatarRole: { fontSize: '11.5px', color: '#64748B', fontWeight: '500' },

  sideNav: { padding: '20px 12px', flex: 1 },
  sideNavItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: '#94A3B8', marginBottom: '4px' },
  sideNavActive: { background: '#1E293B', color: '#fff' },
  sideNavIcon: { fontSize: '16px' },
  navBadge: { marginLeft: 'auto', background: '#059669', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px' },

  statsBox: { margin: '0 12px', padding: '16px', background: '#1E293B', borderRadius: '12px', marginBottom: '16px' },
  statsBoxTitle: { fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.8px' },
  statsBoxRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  statsBoxLabel: { fontSize: '12.5px', color: '#94A3B8', fontWeight: '500' },
  statsBoxVal: { fontSize: '13px', fontWeight: '800', color: '#F1F5F9' },

  logoutBtn: { margin: '0 12px 24px', padding: '11px', background: 'transparent', border: '1px solid #1E293B', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#64748B', textAlign: 'left' },

  main: { padding: '32px 36px', overflowY: 'auto' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  heading: { fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' },
  headSub: { fontSize: '14px', color: '#94A3B8' },
  postBtn: { padding: '11px 22px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' },

  metricsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' },
  metCard: { background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #F0F2F5', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' },
  metIcon: { width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' },
  metVal: { fontSize: '28px', fontWeight: '800', marginBottom: '4px' },
  metLabel: { fontSize: '12.5px', color: '#94A3B8', fontWeight: '600' },

  grid2: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px' },
  rightCol: {},
  card: { background: '#fff', borderRadius: '16px', padding: '22px', border: '1px solid #F0F2F5', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', marginBottom: '0' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  cardTitle: { fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' },
  cardLink: { fontSize: '13px', color: '#2563EB', fontWeight: '700', cursor: 'pointer', marginBottom: '16px' },

  jobRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '10px', border: '1px solid #F8FAFC', marginBottom: '10px', background: '#FAFAFA' },
  jobLeft: { flex: 1 },
  jobTitle: { fontSize: '14px', fontWeight: '700', color: '#0F172A', marginBottom: '3px' },
  jobMeta: { fontSize: '12px', color: '#94A3B8', marginBottom: '6px' },
  skillsWrap: { display: 'flex', flexWrap: 'wrap', gap: '5px' },
  skillChip: { background: '#EFF6FF', color: '#2563EB', padding: '3px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: '600' },
  viewBtn: { padding: '8px 16px', background: '#F8FAFC', color: '#374151', border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', marginLeft: '12px' },

  profileRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #F8FAFC' },
  profileLabel: { fontSize: '12.5px', color: '#94A3B8', fontWeight: '500' },
  profileVal: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  roleBadge: { background: '#ECFDF5', color: '#059669', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },

  quickActions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' },
  quickAction: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 10px', background: '#F8FAFC', borderRadius: '12px', cursor: 'pointer', border: '1px solid #F0F2F5', transition: 'all .2s ease' },
  qaIcon: { fontSize: '22px' },
  qaLabel: { fontSize: '12px', fontWeight: '700', color: '#374151', textAlign: 'center' },

  empty: { textAlign: 'center', padding: '40px 0', color: '#94A3B8' },
  emptyIcon: { fontSize: '36px', marginBottom: '10px' },
  emptyText: { fontSize: '14px', fontWeight: '700', color: '#64748B', marginBottom: '4px' },
  emptySubText: { fontSize: '13px' }
}