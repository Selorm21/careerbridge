import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

export default function CoordinatorDashboard() {
  const [profile, setProfile] = useState(null)
  const [students, setStudents] = useState([])
  const [employers, setEmployers] = useState([])
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const navigate = useNavigate()

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)

      const { data: studentsData } = await supabase.from('profiles').select('*').eq('role', 'student')
      setStudents(studentsData || [])

      const { data: employersData } = await supabase.from('profiles').select('*').eq('role', 'employer')
      setEmployers(employersData || [])

      const { data: appsData } = await supabase.from('applications').select('*, jobs(*), profiles(*)')
      setApplications(appsData || [])

      const { data: jobsData } = await supabase.from('jobs').select('*')
      setJobs(jobsData || [])
    }
    getData()
  }, [])

  async function handleLogout() { await supabase.auth.signOut() }

  const placementRate = applications.length > 0
    ? Math.round((applications.filter(a => a.status === 'offer').length / applications.length) * 100)
    : 0

  function exportToCSV() {
    const rows = [
      ['Student Name', 'Email', 'University', 'Course', 'Skills', 'Applications', 'Status'],
      ...students.map(s => {
        const studentApps = applications.filter(a => a.student_id === s.id)
        const latestStatus = studentApps[0]?.status || 'No applications'
        return [s.full_name, s.email, s.university || '-', s.course || '-', s.skills || '-', studentApps.length, latestStatus]
      })
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'careerbridge_placements.csv'
    a.click()
  }

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .pageIn{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) forwards}
        .sideBtn{transition:all .2s ease;cursor:pointer}
        .sideBtn:hover{background:#1E293B!important;color:#fff!important}
        .logoutBtn{transition:all .2s ease}
        .logoutBtn:hover{background:#FEF2F2!important;color:#DC2626!important}
        .exportBtn{transition:all .2s ease}
        .exportBtn:hover{transform:translateY(-2px);box-shadow:0 8px 16px rgba(5,150,105,0.25)!important}
        .studentRow{transition:all .2s ease}
        .studentRow:hover{background:#F8FAFC!important}
        @media(max-width:768px){
          .sidebar{display:none!important}
          .layout{grid-template-columns:1fr!important}
          .metricsRow{grid-template-columns:1fr 1fr!important}
          .main{padding:20px 16px!important}
        }
      `}</style>

      <div className="layout" style={S.layout}>
        <aside className="sidebar" style={S.sidebar}>
          <div style={S.sidebarTop}>
            <div style={S.sidebarLogo}>CareerBridge</div>
            <div style={S.avatarWrap}>
              <div style={{...S.avatar, background: 'linear-gradient(135deg, #7C3AED, #A78BFA)'}}>
                {profile?.full_name?.charAt(0) || 'C'}
              </div>
              <div>
                <div style={S.avatarName}>{profile?.full_name || 'Coordinator'}</div>
                <div style={S.avatarRole}>University Coordinator</div>
              </div>
            </div>
          </div>

          <nav style={S.sideNav}>
            <div className="sideBtn" style={{...S.sideNavItem, ...(activeTab==='overview' ? S.sideNavActive : {})}} onClick={() => setActiveTab('overview')}>
              <span style={S.sideNavIcon}>📊</span> Overview
            </div>
            <div className="sideBtn" style={{...S.sideNavItem, ...(activeTab==='students' ? S.sideNavActive : {})}} onClick={() => setActiveTab('students')}>
              <span style={S.sideNavIcon}>🎓</span> Students
              <span style={S.navBadge}>{students.length}</span>
            </div>
            <div className="sideBtn" style={{...S.sideNavItem, ...(activeTab==='employers' ? S.sideNavActive : {})}} onClick={() => setActiveTab('employers')}>
              <span style={S.sideNavIcon}>🏢</span> Employers
              <span style={S.navBadge}>{employers.length}</span>
            </div>
            <div className="sideBtn" style={{...S.sideNavItem, ...(activeTab==='placements' ? S.sideNavActive : {})}} onClick={() => setActiveTab('placements')}>
              <span style={S.sideNavIcon}>📋</span> Placements
              <span style={S.navBadge}>{applications.filter(a => a.status === 'offer').length}</span>
            </div>
            <div className="sideBtn" style={S.sideNavItem} onClick={() => navigate('/analytics')}>
              <span style={S.sideNavIcon}>📈</span> Analytics
            </div>
          </nav>

          <div style={S.statsBox}>
            <div style={S.statsBoxTitle}>At a glance</div>
            <div style={S.statsBoxRow}><span style={S.statsBoxLabel}>Students</span><span style={S.statsBoxVal}>{students.length}</span></div>
            <div style={S.statsBoxRow}><span style={S.statsBoxLabel}>Employers</span><span style={S.statsBoxVal}>{employers.length}</span></div>
            <div style={S.statsBoxRow}><span style={S.statsBoxLabel}>Placements</span><span style={{...S.statsBoxVal, color:'#34D399'}}>{applications.filter(a => a.status === 'offer').length}</span></div>
            <div style={S.statsBoxRow}><span style={S.statsBoxLabel}>Placement rate</span><span style={{...S.statsBoxVal, color:'#A78BFA'}}>{placementRate}%</span></div>
          </div>

          <button className="logoutBtn" style={S.logoutBtn} onClick={handleLogout}>← Log out</button>
        </aside>

        <main className="main" style={S.main}>
          <div className="pageIn" style={S.topBar}>
            <div>
              <h1 style={S.heading}>University Coordinator Dashboard</h1>
              <p style={S.headSub}>Monitor student placements and employer activity</p>
            </div>
            <button className="exportBtn" style={S.exportBtn} onClick={exportToCSV}>⬇ Export CSV</button>
          </div>

          <div className="metricsRow" style={S.metricsRow}>
            {[
              { label: 'Total Students', val: students.length, color: '#2563EB', bg: '#EFF6FF', icon: '🎓' },
              { label: 'Total Employers', val: employers.length, color: '#7C3AED', bg: '#F5F3FF', icon: '🏢' },
              { label: 'Total Applications', val: applications.length, color: '#D97706', bg: '#FFFBEB', icon: '📤' },
              { label: 'Placements', val: applications.filter(a => a.status === 'offer').length, color: '#059669', bg: '#ECFDF5', icon: '🏆' },
              { label: 'Interviews', val: applications.filter(a => a.status === 'interview').length, color: '#0891B2', bg: '#ECFEFF', icon: '🎯' },
              { label: 'Placement Rate', val: `${placementRate}%`, color: '#059669', bg: '#ECFDF5', icon: '📊' },
            ].map((m, i) => (
              <div key={i} style={{...S.metCard, borderTop: `3px solid ${m.color}`}}>
                <div style={{...S.metIcon, background: m.bg}}>{m.icon}</div>
                <div style={{...S.metVal, color: m.color}}>{m.val}</div>
                <div style={S.metLabel}>{m.label}</div>
              </div>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div style={S.grid2}>
              <div style={S.card}>
                <div style={S.cardHead}>
                  <div style={S.cardTitle}>Recent Placements</div>
                  <span style={S.cardLink} onClick={() => setActiveTab('placements')}>View all →</span>
                </div>
                {applications.filter(a => a.status === 'offer').slice(0,5).map(app => (
                  <div key={app.id} style={S.placementRow}>
                    <div>
                      <div style={S.placementName}>{app.profiles?.full_name}</div>
                      <div style={S.placementMeta}>{app.jobs?.title} at {app.jobs?.company}</div>
                    </div>
                    <span style={S.offerBadge}>✓ Offer</span>
                  </div>
                ))}
                {applications.filter(a => a.status === 'offer').length === 0 && (
                  <div style={S.empty}><div style={S.emptyIcon}>📭</div><div>No placements yet</div></div>
                )}
              </div>

              <div style={S.card}>
                <div style={S.cardHead}>
                  <div style={S.cardTitle}>Recently Registered Students</div>
                  <span style={S.cardLink} onClick={() => setActiveTab('students')}>View all →</span>
                </div>
                {students.slice(0,5).map(s => (
                  <div key={s.id} style={S.studentRow}>
                    <div style={S.studentAvatar}>{s.full_name?.charAt(0)}</div>
                    <div>
                      <div style={S.studentName}>{s.full_name}</div>
                      <div style={S.studentMeta}>{s.course || 'No course set'} · {s.university || 'No university set'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardTitle}>All Students ({students.length})</div>
                <button className="exportBtn" style={{...S.exportBtn, fontSize:'13px', padding:'8px 16px'}} onClick={exportToCSV}>⬇ Export</button>
              </div>
              <table style={S.table}>
                <thead>
                  <tr>
                    {['Name', 'Email', 'University', 'Course', 'Skills', 'Applications', 'Status'].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => {
                    const studentApps = applications.filter(a => a.student_id === s.id)
                    const bestStatus = studentApps.find(a => a.status === 'offer')?.status ||
                      studentApps.find(a => a.status === 'interview')?.status ||
                      studentApps[0]?.status || 'No applications'
                    return (
                      <tr key={s.id} className="studentRow" style={S.tr}>
                        <td style={S.td}><div style={S.tdName}>{s.full_name}</div></td>
                        <td style={S.td}>{s.email}</td>
                        <td style={S.td}>{s.university || '-'}</td>
                        <td style={S.td}>{s.course || '-'}</td>
                        <td style={S.td}>{s.skills ? s.skills.split(',').slice(0,3).join(', ') : '-'}</td>
                        <td style={{...S.td, textAlign:'center'}}>{studentApps.length}</td>
                        <td style={S.td}>
                          <span style={{
                            padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'700',
                            background: bestStatus === 'offer' ? '#ECFDF5' : bestStatus === 'interview' ? '#FFFBEB' : '#F1F5F9',
                            color: bestStatus === 'offer' ? '#059669' : bestStatus === 'interview' ? '#D97706' : '#64748B'
                          }}>{bestStatus}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'employers' && (
            <div style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardTitle}>All Employers ({employers.length})</div>
              </div>
              {employers.map(e => {
                const employerJobs = jobs.filter(j => j.employer_id === e.id)
                const employerApps = applications.filter(a => employerJobs.some(j => j.id === a.job_id))
                return (
                  <div key={e.id} style={S.employerRow}>
                    <div style={S.employerLeft}>
                      <div style={{...S.studentAvatar, background:'linear-gradient(135deg,#059669,#34D399)'}}>{e.full_name?.charAt(0)}</div>
                      <div>
                        <div style={S.studentName}>{e.full_name}</div>
                        <div style={S.studentMeta}>{e.email}</div>
                      </div>
                    </div>
                    <div style={S.employerStats}>
                      <div style={S.empStat}><div style={S.empStatVal}>{employerJobs.length}</div><div style={S.empStatLabel}>Jobs posted</div></div>
                      <div style={S.empStat}><div style={S.empStatVal}>{employerApps.length}</div><div style={S.empStatLabel}>Applications</div></div>
                      <div style={S.empStat}><div style={{...S.empStatVal, color:'#059669'}}>{employerApps.filter(a => a.status === 'offer').length}</div><div style={S.empStatLabel}>Offers made</div></div>
                    </div>
                  </div>
                )
              })}
              {employers.length === 0 && <div style={S.empty}><div style={S.emptyIcon}>🏢</div><div>No employers yet</div></div>}
            </div>
          )}

          {activeTab === 'placements' && (
            <div style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardTitle}>All Placements ({applications.filter(a => a.status === 'offer').length})</div>
                <button className="exportBtn" style={{...S.exportBtn, fontSize:'13px', padding:'8px 16px'}} onClick={exportToCSV}>⬇ Export CSV</button>
              </div>
              {applications.filter(a => a.status === 'offer').map(app => (
                <div key={app.id} style={S.placementRow}>
                  <div style={S.placementLeft}>
                    <div style={S.studentAvatar}>{app.profiles?.full_name?.charAt(0)}</div>
                    <div>
                      <div style={S.placementName}>{app.profiles?.full_name}</div>
                      <div style={S.placementMeta}>{app.profiles?.course} · {app.profiles?.university}</div>
                    </div>
                  </div>
                  <div style={S.placementRight}>
                    <div style={S.placementJob}>{app.jobs?.title}</div>
                    <div style={S.placementCompany}>{app.jobs?.company} · {app.jobs?.location}</div>
                  </div>
                  <span style={S.offerBadge}>✓ Placed</span>
                </div>
              ))}
              {applications.filter(a => a.status === 'offer').length === 0 && (
                <div style={S.empty}><div style={S.emptyIcon}>📭</div><div>No placements yet</div></div>
              )}
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
  navBadge: { marginLeft: 'auto', background: '#7C3AED', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px' },

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
  exportBtn: { padding: '11px 22px', background: '#059669', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', boxShadow: '0 4px 12px rgba(5,150,105,0.22)' },

  metricsRow: { display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '12px', marginBottom: '24px' },
  metCard: { background: '#fff', borderRadius: '14px', padding: '16px', border: '1px solid #F0F2F5', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' },
  metIcon: { width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', marginBottom: '10px' },
  metVal: { fontSize: '24px', fontWeight: '800', marginBottom: '4px' },
  metLabel: { fontSize: '11.5px', color: '#94A3B8', fontWeight: '600' },

  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  card: { background: '#fff', borderRadius: '16px', padding: '22px', border: '1px solid #F0F2F5', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', marginBottom: '16px' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  cardTitle: { fontSize: '15px', fontWeight: '800', color: '#0F172A' },
  cardLink: { fontSize: '13px', color: '#2563EB', fontWeight: '700', cursor: 'pointer' },

  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#94A3B8', padding: '10px 12px', borderBottom: '1px solid #F0F2F5', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid #F8FAFC', transition: 'background .2s ease' },
  td: { padding: '12px 12px', fontSize: '13px', color: '#374151' },
  tdName: { fontWeight: '700', color: '#0F172A' },

  studentRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #F8FAFC', cursor: 'default' },
  studentAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#3B82F6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', flexShrink: 0 },
  studentName: { fontSize: '14px', fontWeight: '700', color: '#0F172A', marginBottom: '2px' },
  studentMeta: { fontSize: '12px', color: '#94A3B8' },

  employerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #F8FAFC' },
  employerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  employerStats: { display: 'flex', gap: '24px' },
  empStat: { textAlign: 'center' },
  empStatVal: { fontSize: '18px', fontWeight: '800', color: '#0F172A' },
  empStatLabel: { fontSize: '11px', color: '#94A3B8', fontWeight: '600' },

  placementRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F8FAFC', gap: '12px' },
  placementLeft: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1 },
  placementRight: { flex: 1 },
  placementName: { fontSize: '14px', fontWeight: '700', color: '#0F172A', marginBottom: '2px' },
  placementMeta: { fontSize: '12px', color: '#94A3B8' },
  placementJob: { fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '2px' },
  placementCompany: { fontSize: '12px', color: '#94A3B8' },
  offerBadge: { background: '#ECFDF5', color: '#059669', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' },

  empty: { textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: '14px' },
  emptyIcon: { fontSize: '32px', marginBottom: '10px' }
}