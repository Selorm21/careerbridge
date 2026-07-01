import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const navigate = useNavigate()

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)
      const { data: appsData } = await supabase.from('applications').select('*, jobs(*)').eq('student_id', user.id).order('created_at', { ascending: false })
      setApplications(appsData || [])
    }
    getData()
  }, [])

  async function handleLogout() { await supabase.auth.signOut() }

  function getStatusStyle(status) {
    if (status === 'applied') return { bg: '#EFF6FF', color: '#2563EB', dot: '#2563EB' }
    if (status === 'interview') return { bg: '#FFFBEB', color: '#D97706', dot: '#D97706' }
    if (status === 'offer') return { bg: '#ECFDF5', color: '#059669', dot: '#059669' }
    if (status === 'rejected') return { bg: '#FEF2F2', color: '#DC2626', dot: '#DC2626' }
    return { bg: '#F1F5F9', color: '#64748B', dot: '#64748B' }
  }

  const profileStrength = () => {
    let score = 0
    if (profile?.full_name) score += 20
    if (profile?.university) score += 20
    if (profile?.course) score += 20
    if (profile?.skills) score += 20
    if (profile?.bio) score += 20
    return score
  }

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
        .pageIn{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) forwards}
        .cardIn{animation:fadeUp .6s cubic-bezier(.16,1,.3,1) forwards}
        .c2{animation-delay:.08s;opacity:0}
        .c3{animation-delay:.16s;opacity:0}
        .c4{animation-delay:.24s;opacity:0}
        .c5{animation-delay:.32s;opacity:0}
        .metCard{transition:transform .25s ease,box-shadow .25s ease;cursor:default}
        .metCard:hover{transform:translateY(-5px);box-shadow:0 20px 40px rgba(15,23,42,0.1)!important}
        .jobCard{transition:all .2s ease}
        .jobCard:hover{border-color:#DBEAFE!important;box-shadow:0 8px 24px rgba(37,99,235,0.09)!important}
        .sideBtn{transition:all .2s ease;cursor:pointer}
        .sideBtn:hover{background:#EFF6FF!important;color:#2563EB!important}
        .tab{transition:all .2s ease;cursor:pointer}
        .tab:hover{color:#2563EB!important}
        .logoutBtn{transition:all .2s ease}
        .logoutBtn:hover{background:#FEF2F2!important;color:#DC2626!important;border-color:#FECACA!important}
        .progressBar{background:linear-gradient(90deg,#2563EB,#3B82F6);background-size:200% 100%;animation:shimmer 2s linear infinite}
        .dotPulse{animation:pulse 2s ease-in-out infinite}
      `}</style>

<div className="mobile-only" style={S.mobileNav}>
        <div style={S.mobileNavItem} onClick={() => setActiveTab('overview')}>
          <span style={S.mobileNavIcon}>📊</span>
          <span style={{...S.mobileNavLabel, color: activeTab==='overview' ? '#2563EB' : '#94A3B8'}}>Overview</span>
        </div>
        <div style={S.mobileNavItem} onClick={() => setActiveTab('applications')}>
          <span style={S.mobileNavIcon}>📋</span>
          <span style={{...S.mobileNavLabel, color: activeTab==='applications' ? '#2563EB' : '#94A3B8'}}>Applications</span>
        </div>
        <div style={S.mobileNavItem} onClick={() => navigate('/browse-jobs')}>
          <span style={S.mobileNavIcon}>🔍</span>
          <span style={S.mobileNavLabel}>Jobs</span>
        </div>
        <div style={S.mobileNavItem} onClick={() => navigate('/student-profile')}>
          <span style={S.mobileNavIcon}>👤</span>
          <span style={S.mobileNavLabel}>Profile</span>
        </div>
        <div style={S.mobileNavItem} onClick={handleLogout}>
          <span style={S.mobileNavIcon}>🚪</span>
          <span style={S.mobileNavLabel}>Logout</span>
        </div>
      </div>
      <div style={S.layout}>
        <aside style={S.sidebar}>
          <div style={S.sidebarTop}>
            <div style={S.sidebarLogo}>CareerBridge</div>
            <div style={S.avatarWrap}>
              <div style={S.avatar}>{profile?.full_name?.charAt(0) || 'S'}</div>
              <div>
                <div style={S.avatarName}>{profile?.full_name || 'Student'}</div>
                <div style={S.avatarRole}>Student</div>
              </div>
            </div>
          </div>

          <nav style={S.sideNav}>
            <div className="sideBtn" style={{...S.sideNavItem, ...(activeTab==='overview' ? S.sideNavActive : {})}} onClick={() => setActiveTab('overview')}>
              <span style={S.sideNavIcon}>📊</span> Overview
            </div>
            <div className="sideBtn" style={{...S.sideNavItem, ...(activeTab==='applications' ? S.sideNavActive : {})}} onClick={() => setActiveTab('applications')}>
              <span style={S.sideNavIcon}>📋</span> Applications
              {applications.length > 0 && <span style={S.navBadge}>{applications.length}</span>}
            </div>
            <div className="sideBtn" style={S.sideNavItem} onClick={() => navigate('/browse-jobs')}>
              <span style={S.sideNavIcon}>🔍</span> Browse Jobs
            </div>
            <div className="sideBtn" style={S.sideNavItem} onClick={() => navigate('/student-profile')}>
              <span style={S.sideNavIcon}>👤</span> My Profile
            </div>
          </nav>

          <div style={S.profileStrengthBox}>
            <div style={S.strengthLabel}>Profile strength</div>
            <div style={S.strengthTrack}>
              <div className="progressBar" style={{...S.strengthFill, width: `${profileStrength()}%`}}></div>
            </div>
            <div style={S.strengthPct}>{profileStrength()}% complete</div>
            {profileStrength() < 100 && (
              <div style={S.strengthTip} onClick={() => navigate('/student-profile')}>Complete profile →</div>
            )}
          </div>

          <button className="logoutBtn" style={S.logoutBtn} onClick={handleLogout}>← Log out</button>
        </aside>

        <main style={S.main}>
          <div className="pageIn" style={S.topBar}>
            <div>
              <h1 style={S.heading}>Good day, {profile?.full_name?.split(' ')[0] || 'Student'} 👋</h1>
              <p style={S.headSub}>Here's what's happening with your job search</p>
            </div>
            <button style={S.browseBtn} onClick={() => navigate('/browse-jobs')}>+ Browse jobs</button>
          </div>

          <div style={S.metricsRow}>
            {[
              { label: 'Applications', val: applications.length, color: '#2563EB', bg: '#EFF6FF', icon: '📤' },
              { label: 'Interviews', val: applications.filter(a=>a.status==='interview').length, color: '#D97706', bg: '#FFFBEB', icon: '🎯' },
              { label: 'Offers', val: applications.filter(a=>a.status==='offer').length, color: '#059669', bg: '#ECFDF5', icon: '🏆' },
              { label: 'Rejected', val: applications.filter(a=>a.status==='rejected').length, color: '#DC2626', bg: '#FEF2F2', icon: '❌' },
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
                  <div style={S.cardTitle}>Recent Applications</div>
                  <span style={S.cardLink} onClick={() => setActiveTab('applications')}>View all →</span>
                </div>
                {applications.length === 0 && (
                  <div style={S.empty}>
                    <div style={S.emptyIcon}>📭</div>
                    <div style={S.emptyText}>No applications yet</div>
                    <div style={S.emptySubText}>Start browsing jobs to apply</div>
                  </div>
                )}
                {applications.slice(0,4).map(app => {
                  const st = getStatusStyle(app.status)
                  return (
                    <div key={app.id} className="jobCard" style={S.appRow}>
                      <div style={S.appLeft}>
                        <div style={S.appTitle}>{app.jobs?.title}</div>
                        <div style={S.appMeta}>{app.jobs?.company} · {app.jobs?.location}</div>
                      </div>
                      <div style={{...S.statusBadge, background: st.bg, color: st.color}}>
                        <span className="dotPulse" style={{...S.statusDot, background: st.dot}}></span>
                        {app.status}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={S.rightCol}>
                <div className="cardIn c4" style={{...S.card, marginBottom:'16px'}}>
                  <div style={S.cardHead}>
                    <div style={S.cardTitle}>My Profile</div>
                    <span style={S.cardLink} onClick={() => navigate('/student-profile')}>Edit →</span>
                  </div>
                  <div style={S.profileRow}><span style={S.profileLabel}>University</span><span style={S.profileVal}>{profile?.university || <span style={S.notSet}>Not set</span>}</span></div>
                  <div style={S.profileRow}><span style={S.profileLabel}>Course</span><span style={S.profileVal}>{profile?.course || <span style={S.notSet}>Not set</span>}</span></div>
                  <div style={S.profileRow}><span style={S.profileLabel}>Grad year</span><span style={S.profileVal}>{profile?.graduation_year || <span style={S.notSet}>Not set</span>}</span></div>
                  {profile?.skills && (
                    <div style={S.skillsWrap}>
                      {profile.skills.split(',').slice(0,5).map((s,i) => (
                        <span key={i} style={S.skillChip}>{s.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="cardIn c5" style={S.card}>
                  <div style={S.cardTitle}>Quick Actions</div>
                  <div style={S.quickActions}>
                    <div style={S.quickAction} onClick={() => navigate('/browse-jobs')}>
                      <span style={S.qaIcon}>🔍</span>
                      <span style={S.qaLabel}>Browse Jobs</span>
                    </div>
                    <div style={S.quickAction} onClick={() => navigate('/student-profile')}>
                      <span style={S.qaIcon}>✏️</span>
                      <span style={S.qaLabel}>Edit Profile</span>
                    </div>
                    <div style={S.quickAction} onClick={() => setActiveTab('applications')}>
                      <span style={S.qaIcon}>📋</span>
                      <span style={S.qaLabel}>Applications</span>
                    </div>
                    <div style={S.quickAction}>
                      <span style={S.qaIcon}>🤖</span>
                      <span style={S.qaLabel}>Analyse CV</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="cardIn" style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardTitle}>All Applications ({applications.length})</div>
              </div>
              {applications.length === 0 && (
                <div style={S.empty}>
                  <div style={S.emptyIcon}>📭</div>
                  <div style={S.emptyText}>No applications yet</div>
                  <div style={S.emptySubText}>Browse jobs and apply to get started</div>
                </div>
              )}
              {applications.map(app => {
                const st = getStatusStyle(app.status)
                return (
                  <div key={app.id} className="jobCard" style={S.appRow}>
                    <div style={S.appLeft}>
                      <div style={S.appTitle}>{app.jobs?.title}</div>
                      <div style={S.appMeta}>{app.jobs?.company} · {app.jobs?.location} · {app.jobs?.type}</div>
                    </div>
                    <div style={{...S.statusBadge, background: st.bg, color: st.color}}>
                      <span className="dotPulse" style={{...S.statusDot, background: st.dot}}></span>
                      {app.status}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: '#F1F5F9', fontFamily: "'Inter', -apple-system, sans-serif" },
  layout: { display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100vh', position: 'relative' },

  sidebar: { background: '#0F172A', display: 'flex', flexDirection: 'column', padding: '0', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' },
  sidebarTop: { padding: '28px 24px 20px' },
  sidebarLogo: { fontSize: '18px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px', marginBottom: '28px' },
  avatarWrap: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #3B82F6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', flexShrink: 0 },
  avatarName: { fontSize: '14px', fontWeight: '700', color: '#F1F5F9' },
  avatarRole: { fontSize: '11.5px', color: '#64748B', fontWeight: '500' },

  sideNav: { padding: '20px 12px', flex: 1 },
  sideNavItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: '#94A3B8', marginBottom: '4px' },
  sideNavActive: { background: '#1E293B', color: '#fff' },
  sideNavIcon: { fontSize: '16px' },
  navBadge: { marginLeft: 'auto', background: '#2563EB', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px' },

  profileStrengthBox: { margin: '0 12px', padding: '16px', background: '#1E293B', borderRadius: '12px', marginBottom: '16px' },
  strengthLabel: { fontSize: '12px', fontWeight: '600', color: '#64748B', marginBottom: '8px' },
  strengthTrack: { height: '6px', background: '#0F172A', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' },
  strengthFill: { height: '100%', borderRadius: '3px', transition: 'width 1s ease' },
  strengthPct: { fontSize: '12px', fontWeight: '700', color: '#F1F5F9' },
  strengthTip: { fontSize: '12px', color: '#3B82F6', marginTop: '6px', cursor: 'pointer', fontWeight: '600' },

  logoutBtn: { margin: '0 12px 24px', padding: '11px', background: 'transparent', border: '1px solid #1E293B', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#64748B', textAlign: 'left' },

  main: { padding: '32px 36px', overflowY: 'auto' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  heading: { fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' },
  headSub: { fontSize: '14px', color: '#94A3B8' },
  browseBtn: { padding: '11px 22px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', boxShadow: '0 4px 12px rgba(37,99,235,0.25)', transition: 'all .2s ease' },

  metricsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' },
  metCard: { background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #F0F2F5', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' },
  metIcon: { width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' },
  metVal: { fontSize: '28px', fontWeight: '800', marginBottom: '4px' },
  metLabel: { fontSize: '12.5px', color: '#94A3B8', fontWeight: '600' },

  grid2: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '16px' },
  rightCol: {},
  card: { background: '#fff', borderRadius: '16px', padding: '22px', border: '1px solid #F0F2F5', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', marginBottom: '0' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  cardTitle: { fontSize: '15px', fontWeight: '800', color: '#0F172A' },
  cardLink: { fontSize: '13px', color: '#2563EB', fontWeight: '700', cursor: 'pointer' },

  appRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 14px', borderRadius: '10px', border: '1px solid #F8FAFC', marginBottom: '8px', background: '#FAFAFA' },
  appLeft: {},
  appTitle: { fontSize: '14px', fontWeight: '700', color: '#0F172A', marginBottom: '3px' },
  appMeta: { fontSize: '12px', color: '#94A3B8' },
  statusBadge: { display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' },
  statusDot: { width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0 },

  profileRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #F8FAFC' },
  profileLabel: { fontSize: '12.5px', color: '#94A3B8', fontWeight: '500' },
  profileVal: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  notSet: { color: '#CBD5E1', fontStyle: 'italic', fontWeight: '400' },
  skillsWrap: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' },
  skillChip: { background: '#EFF6FF', color: '#2563EB', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },

  quickActions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' },
  quickAction: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 10px', background: '#F8FAFC', borderRadius: '12px', cursor: 'pointer', border: '1px solid #F0F2F5', transition: 'all .2s ease' },
  qaIcon: { fontSize: '22px' },
  qaLabel: { fontSize: '12px', fontWeight: '700', color: '#374151', textAlign: 'center' },

  empty: { textAlign: 'center', padding: '40px 0', color: '#94A3B8' },
  emptyIcon: { fontSize: '36px', marginBottom: '10px' },
  emptyText: { fontSize: '14px', fontWeight: '700', color: '#64748B', marginBottom: '4px' },

  emptySubText: { fontSize: '13px' }
  
}