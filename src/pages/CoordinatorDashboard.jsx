import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

const Icon = ({ path, size = 18, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {path}
  </svg>
)
const icons = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.3 3-6 6.5-6s6.5 2.7 6.5 6" /><path d="M16 8.2a3 3 0 1 1 3.6 3M21.5 20c0-2.6-1.8-4.8-4.3-5.6" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
  analytics: <><path d="M5 20V10M12 20V4M19 20v-7" /></>,
  trophy: <><path d="M8 21h8M12 17v4" /><path d="M7 4h10v6a5 5 0 0 1-10 0V4z" /><path d="M7 5H4a3 3 0 0 0 3 4M17 5h3a3 3 0 0 1-3 4" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>,
  download: <><path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 21h14" /></>,
  chevron: <path d="M9 18l6-6-6-6" />,
  star: <path d="M12 3.5l2.5 5.5 6 .7-4.4 4.2 1.2 6-5.3-3-5.3 3 1.2-6-4.4-4.2 6-.7z" />,
  target: <><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 3" /></>,
  file: <><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v5h5" /></>,
}

export default function CoordinatorDashboard() {
  const [profile, setProfile] = useState(null)
  const [students, setStudents] = useState([])
  const [employers, setEmployers] = useState([])
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [isHovered, setIsHovered] = useState(false)
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

  async function handleLogout() { 
    await supabase.auth.signOut()
    navigate('/')
  }

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
        
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes pulseGlow{0%,100%{opacity:0.3}50%{opacity:0.6}}
        @keyframes cbFloat{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(15px,-10px,0) scale(1.04)}}
        @keyframes fadeIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        
        .pageIn{animation:fadeUp .6s cubic-bezier(.16,1,.3,1) forwards}
        .glowPulse{animation:pulseGlow 6s ease-in-out infinite}
        
        .sideBtn{transition:all .2s ease;cursor:pointer; border-radius: 12px;}
        .sideBtn:hover{background:rgba(0,0,0,0.03)!important}
        .sideBtn.active{background:rgba(245,158,11,0.12)!important;color:#0F172A!important}
        
        .logoutBtn{transition:all .2s ease; border-radius: 12px;}
        .logoutBtn:hover{background:rgba(239,68,68,0.06)!important;color:#DC2626!important}
        
        .exportBtn{transition:all 0.2s cubic-bezier(.34,1.56,.64,1)}
        .exportBtn:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 12px 28px rgba(16,185,129,0.3)!important}
        
        .metCard{transition:all 0.3s cubic-bezier(.34,1.56,.64,1)}
        .metCard:hover{transform:translateY(-4px) scale(1.02);box-shadow:0 20px 40px rgba(0,0,0,0.06)!important;border-color:#F59E0B!important;}
        
        .studentRow{transition:all .2s ease;cursor:default}
        .studentRow:hover{background:#FAFBFC!important}
        .studentRow:last-child{border-bottom:none}
        
        .docRow{transition:all .2s ease}
        .docRow:hover{background:#F8FAFC!important}
        
        @media(max-width:1024px){.main{margin-left: 80px !important;}}
        @media(max-width:768px){.main{padding:20px 16px!important}.metricsRow{grid-template-columns:1fr 1fr!important}}
      `}</style>

      {/* 🌟 Ambient Glowing Background (Shared Design) */}
      <div style={S.bgEffects}>
        <div style={S.meshOne} className="glowPulse" />
        <div style={S.meshTwo} className="glowPulse" />
        <div style={S.gridPattern} />
      </div>

      <div style={S.layout}>
        {/* ======================================================
            FLOATING GLASS SIDEBAR (HOVER TO EXPAND)
        ====================================================== */}
        <aside 
          className="sidebar" 
          style={{
            ...S.sidebar,
            width: isHovered ? '260px' : '80px',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div style={S.sidebarTop}>
            {/* LOGO */}
            <div style={S.logoRow}>
              <div style={S.logoMark}><Icon path={icons.grid} size={18} /></div>
              {isHovered && <span style={S.logoText}>CareerBridge</span>}
            </div>
            
            {/* USER */}
            <div style={S.avatarWrap}>
              <div style={S.avatar}>{profile?.full_name?.charAt(0) || 'C'}</div>
              {isHovered && (
                <div>
                  <div style={S.avatarName}>{profile?.full_name || 'Coordinator'}</div>
                  <div style={S.avatarRole}>University Coordinator</div>
                </div>
              )}
            </div>
            {isHovered && <div style={S.divider} />}
          </div>

          {/* NAVIGATION */}
          <nav style={S.sideNav}>
            {[
              { id: 'overview', icon: icons.grid, label: 'Overview' },
              { id: 'students', icon: icons.users, label: 'Students', count: students.length },
              { id: 'employers', icon: icons.briefcase, label: 'Employers', count: employers.length },
              { id: 'placements', icon: icons.trophy, label: 'Placements', count: applications.filter(a => a.status === 'offer').length },
              { id: 'documents', icon: icons.file, label: 'Documents' },
            ].map(item => {
              const isActive = activeTab === item.id
              return (
                <div 
                  key={item.id}
                  className={`sideBtn ${isActive ? 'active' : ''}`}
                  style={{
                    ...S.sideNavItem,
                    background: isActive ? 'rgba(245,158,11,0.12)' : 'transparent',
                    justifyContent: isHovered ? 'flex-start' : 'center',
                    padding: isHovered ? '0 16px' : '0',
                  }} 
                  onClick={() => setActiveTab(item.id)}
                >
                  <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon path={item.icon} size={18} color={isActive ? '#F59E0B' : '#64748B'} />
                  </div>
                  {isHovered && (
                    <span style={{ ...S.navLabel, color: isActive ? '#0F172A' : '#64748B', fontWeight: isActive ? '700' : '500', marginLeft: '12px', whiteSpace: 'nowrap' }}>
                      {item.label}
                    </span>
                  )}
                  {isHovered && item.count !== undefined && item.count > 0 && (
                    <span style={{ ...S.badge, marginLeft: 'auto', background: isActive ? 'rgba(245,158,11,0.2)' : '#F1F5F9', color: isActive ? '#F59E0B' : '#64748B' }}>
                      {item.count}
                    </span>
                  )}
                  {isActive && <div style={S.activeIndicator} />}
                </div>
              )
            })}
          </nav>

          {/* STATS BOX (Only shown when expanded) */}
          {isHovered && (
            <div style={S.statsBox}>
              <div style={S.statsBoxTitle}>At a glance</div>
              <div style={S.statsBoxRow}><span style={S.statsBoxLabel}>Students</span><span style={S.statsBoxVal}>{students.length}</span></div>
              <div style={S.statsBoxRow}><span style={S.statsBoxLabel}>Employers</span><span style={S.statsBoxVal}>{employers.length}</span></div>
              <div style={S.statsBoxRow}><span style={S.statsBoxLabel}>Placements</span><span style={{...S.statsBoxVal, color:'#10B981'}}>{applications.filter(a => a.status === 'offer').length}</span></div>
              <div style={S.statsBoxRow}><span style={S.statsBoxLabel}>Rate</span><span style={{...S.statsBoxVal, color:'#F59E0B'}}>{placementRate}%</span></div>
            </div>
          )}

          {/* BOTTOM SECTION */}
          <div style={S.bottomSection}>
            {isHovered && <div style={S.divider} />}
            <div className="logoutBtn" style={{
              ...S.logoutBtn,
              justifyContent: isHovered ? 'flex-start' : 'center',
              padding: isHovered ? '0 16px' : '0',
            }} onClick={handleLogout}>
              <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon path={icons.logout} size={18} color="#64748B" />
              </div>
              {isHovered && <span style={{ ...S.navLabel, marginLeft: '12px' }}>Sign out</span>}
            </div>
          </div>
        </aside>

        {/* ======================================================
            MAIN CONTENT
        ====================================================== */}
        <main className="main" style={{
          ...S.main,
          marginLeft: isHovered ? '260px' : '80px',
        }}>
          <div className="pageIn" style={S.topBar}>
            <div>
              <h1 style={S.heading}>University Coordinator Dashboard</h1>
              <p style={S.headSub}>Monitor student placements and employer activity</p>
            </div>
            <button className="exportBtn" style={S.exportBtn} onClick={exportToCSV}>
              <Icon path={icons.download} size={16} /> Export CSV
            </button>
          </div>

          {/* ---------- METRICS ROW ---------- */}
          <div className="metricsRow" style={S.metricsRow}>
            {[
              { label: 'Total Students', val: students.length, color: '#2563EB', bg: '#EFF6FF', icon: icons.users },
              { label: 'Total Employers', val: employers.length, color: '#7C3AED', bg: '#F5F3FF', icon: icons.briefcase },
              { label: 'Total Applications', val: applications.length, color: '#D97706', bg: '#FFFBEB', icon: icons.plus },
              { label: 'Placements', val: applications.filter(a => a.status === 'offer').length, color: '#10B981', bg: '#ECFDF5', icon: icons.trophy },
              { label: 'Interviews', val: applications.filter(a => a.status === 'interview').length, color: '#0891B2', bg: '#ECFEFF', icon: icons.target },
              { label: 'Placement Rate', val: `${placementRate}%`, color: '#10B981', bg: '#ECFDF5', icon: icons.star },
            ].map((m, i) => (
              <div key={i} className="metCard" style={{...S.metCard, borderTop: `4px solid ${m.color}`}}>
                <div style={{...S.metIcon, background: m.bg, color: m.color}}><Icon path={m.icon} size={18} /></div>
                <div style={{...S.metVal, color: m.color}}>{m.val}</div>
                <div style={S.metLabel}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* ---------- OVERVIEW TAB ---------- */}
          {activeTab === 'overview' && (
            <div style={S.grid2}>
              <div style={S.card}>
                <div style={S.cardHead}>
                  <div style={S.cardTitle}>Recent Placements</div>
                  <span style={S.cardLink} onClick={() => setActiveTab('placements')}>View all <Icon path={icons.chevron} size={14} /></span>
                </div>
                {applications.filter(a => a.status === 'offer').slice(0,5).map(app => (
                  <div key={app.id} style={S.placementRow}>
                    <div style={S.placementLeft}>
                      <div style={S.studentAvatar}>{app.profiles?.full_name?.charAt(0)}</div>
                      <div>
                        <div style={S.placementName}>{app.profiles?.full_name}</div>
                        <div style={S.placementMeta}>{app.jobs?.title} at {app.jobs?.company}</div>
                      </div>
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
                  <span style={S.cardLink} onClick={() => setActiveTab('students')}>View all <Icon path={icons.chevron} size={14} /></span>
                </div>
                {students.slice(0,5).map(s => (
                  <div key={s.id} className="studentRow" style={S.studentRow}>
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

          {/* ---------- STUDENTS TAB ---------- */}
          {activeTab === 'students' && (
            <div style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardTitle}>All Students ({students.length})</div>
                <button className="exportBtn" style={{...S.exportBtn, fontSize:'13px', padding:'8px 16px'}} onClick={exportToCSV}>
                  <Icon path={icons.download} size={14} /> Export
                </button>
              </div>
              <div style={S.tableWrap}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      {['Name','Email','University','Course','Skills','Applications','Status'].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => {
                      const studentApps = applications.filter(a => a.student_id === s.id)
                      const bestStatus = studentApps.find(a=>a.status==='offer')?.status || studentApps.find(a=>a.status==='interview')?.status || studentApps[0]?.status || 'No applications'
                      return (
                        <tr key={s.id} className="studentRow" style={S.tr}>
                          <td style={S.td}><div style={S.tdName}>{s.full_name}</div></td>
                          <td style={S.td}>{s.email}</td>
                          <td style={S.td}>{s.university||'-'}</td>
                          <td style={S.td}>{s.course||'-'}</td>
                          <td style={S.td}>{s.skills ? s.skills.split(',').slice(0,3).join(', ') : '-'}</td>
                          <td style={{...S.td,textAlign:'center'}}>{studentApps.length}</td>
                          <td style={S.td}>
                            <span style={S.getBadge(bestStatus)}>{bestStatus}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------- EMPLOYERS TAB ---------- */}
          {activeTab === 'employers' && (
            <div style={S.card}>
              <div style={S.cardHead}><div style={S.cardTitle}>All Employers ({employers.length})</div></div>
              {employers.map(e => {
                const employerJobs = jobs.filter(j=>j.employer_id===e.id)
                const employerApps = applications.filter(a=>employerJobs.some(j=>j.id===a.job_id))
                return (
                  <div key={e.id} style={S.employerRow}>
                    <div style={S.employerLeft}>
                      <div style={{...S.studentAvatar,background:'linear-gradient(135deg,#10B981,#34D399)'}}>{e.full_name?.charAt(0)}</div>
                      <div><div style={S.studentName}>{e.full_name}</div><div style={S.studentMeta}>{e.email}</div></div>
                    </div>
                    <div style={S.employerStats}>
                      <div style={S.empStat}><div style={S.empStatVal}>{employerJobs.length}</div><div style={S.empStatLabel}>Jobs posted</div></div>
                      <div style={S.empStat}><div style={S.empStatVal}>{employerApps.length}</div><div style={S.empStatLabel}>Applications</div></div>
                      <div style={S.empStat}><div style={{...S.empStatVal,color:'#10B981'}}>{employerApps.filter(a=>a.status==='offer').length}</div><div style={S.empStatLabel}>Offers made</div></div>
                    </div>
                  </div>
                )
              })}
              {employers.length===0&&<div style={S.empty}><div style={S.emptyIcon}>🏢</div><div>No employers yet</div></div>}
            </div>
          )}

          {/* ---------- PLACEMENTS TAB ---------- */}
          {activeTab === 'placements' && (
            <div style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardTitle}>All Placements ({applications.filter(a=>a.status==='offer').length})</div>
                <button className="exportBtn" style={{...S.exportBtn,fontSize:'13px',padding:'8px 16px'}} onClick={exportToCSV}>
                  <Icon path={icons.download} size={14} /> Export CSV
                </button>
              </div>
              {applications.filter(a=>a.status==='offer').map(app=>(
                <div key={app.id} style={S.placementRow}>
                  <div style={S.placementLeft}>
                    <div style={S.studentAvatar}>{app.profiles?.full_name?.charAt(0)}</div>
                    <div><div style={S.placementName}>{app.profiles?.full_name}</div><div style={S.placementMeta}>{app.profiles?.course} · {app.profiles?.university}</div></div>
                  </div>
                  <div style={S.placementRight}>
                    <div style={S.placementJob}>{app.jobs?.title}</div>
                    <div style={S.placementCompany}>{app.jobs?.company} · {app.jobs?.location}</div>
                  </div>
                  <span style={S.offerBadge}>✓ Placed</span>
                </div>
              ))}
              {applications.filter(a=>a.status==='offer').length===0&&<div style={S.empty}><div style={S.emptyIcon}>📭</div><div>No placements yet</div></div>}
            </div>
          )}

          {/* ---------- DOCUMENTS TAB ---------- */}
          {activeTab === 'documents' && (
            <DocumentsVerification />
          )}
        </main>
      </div>
    </div>
  )
}

// ============================================================
// DOCUMENTS VERIFICATION SUBCOMPONENT
// ============================================================
function DocumentsVerification() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    async function fetchDocs() {
      const { data } = await supabase.from('documents').select('*, profiles(full_name, email, university, course)').order('uploaded_at', { ascending: false })
      setDocuments(data || [])
      setLoading(false)
    }
    fetchDocs()
  }, [])

  async function updateStatus(id, status) {
    setUpdating(id)
    await supabase.from('documents').update({ status }).eq('id', id)
    const { data } = await supabase.from('documents').select('*, profiles(full_name, email, university, course)').order('uploaded_at', { ascending: false })
    setDocuments(data || [])
    setUpdating(null)
  }

  function getStatusStyle(status) {
    if (status === 'verified') return { bg: 'rgba(16,185,129,0.1)', color: '#10B981' }
    if (status === 'rejected') return { bg: 'rgba(239,68,68,0.1)', color: '#EF4444' }
    return { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' }
  }

  const docLabel = { transcript: '🎓 Transcript', national_id: '🪪 National ID', recommendation: '📝 Recommendation' }

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>Loading documents...</div>

  return (
    <div style={S.card}>
      <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>📁 Document Verification ({documents.length})</div>
      {documents.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No documents uploaded yet</div>}
      {documents.map(doc => {
        const st = getStatusStyle(doc.status)
        return (
          <div key={doc.id} className="docRow" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderRadius: '12px', border: '1px solid #F0F2F5', marginBottom: '10px', background: '#FFFFFF' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', marginBottom: '2px' }}>{doc.profiles?.full_name}</div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>{doc.profiles?.email} · {doc.profiles?.university}</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{docLabel[doc.doc_type]}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {doc.file_url && <a href={doc.file_url} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#2563EB', fontWeight: '700', textDecoration: 'none' }}>View <Icon path={icons.chevron} size={14} /></a>}
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: st.bg, color: st.color }}>{doc.status}</span>
              <button onClick={() => updateStatus(doc.id, 'verified')} disabled={updating===doc.id||doc.status==='verified'} style={{ padding: '6px 12px', background: '#ECFDF5', color: '#059669', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>✓ Verify</button>
              <button onClick={() => updateStatus(doc.id, 'rejected')} disabled={updating===doc.id||doc.status==='rejected'} style={{ padding: '6px 12px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>✗ Reject</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ============================================================
// 🎨 PREMIUM STYLES
// ============================================================
const S = {
  page: { minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Inter', -apple-system, sans-serif", position: 'relative', overflow: 'hidden' },
  
  // Ambient Background
  bgEffects: {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  meshOne: {
    position: 'absolute',
    width: '700px', height: '700px',
    top: '-300px', right: '-180px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,158,11,.085), transparent 68%)',
    filter: 'blur(20px)',
    animation: 'cbFloat 18s ease-in-out infinite',
  },
  meshTwo: {
    position: 'absolute',
    width: '650px', height: '650px',
    bottom: '-350px', left: '-220px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,.055), transparent 68%)',
    filter: 'blur(25px)',
    animation: 'cbFloat 23s ease-in-out infinite reverse',
  },
  gridPattern: {
    position: 'absolute',
    inset: 0,
    opacity: 0.35,
    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(15,23,42,.035) 1px, transparent 0)',
    backgroundSize: '34px 34px',
  },

  layout: { display: 'grid', gridTemplateColumns: '1fr', minHeight: '100vh', position: 'relative', zIndex: 1 },
  
  // Sidebar (Glass Floating - Same as Employer)
  sidebar: { 
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 32px)',
    minHeight: 0,
    boxSizing: 'border-box',
    margin: '16px 0 16px 16px',
    padding: '20px 10px 12px',
    background: 'linear-gradient(145deg, rgba(255,255,255,.78), rgba(255,255,255,.56))',
    backdropFilter: 'blur(30px) saturate(150%)',
    WebkitBackdropFilter: 'blur(30px) saturate(150%)',
    border: '1px solid rgba(255,255,255,.82)',
    borderRadius: '26px',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
    overflow: 'hidden',
    transition: 'width .34s cubic-bezier(.22,1,.36,1)',
    boxShadow: '0 25px 70px rgba(15,23,42,.08), 0 8px 24px rgba(15,23,42,.04), inset 0 1px 0 rgba(255,255,255,.95)',
  },
  sidebarTop: { width: '100%', flexShrink: 0, padding: '0 8px' },
  logoRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '32px', width: '100%', padding: '0 4px' },
  logoMark: { width: '46px', height: '46px', minWidth: '46px', borderRadius: '15px', background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 45%, #D97706 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px rgba(245,158,11,.24), inset 0 1px 0 rgba(255,255,255,.35)' },
  logoText: { fontSize: '20px', lineHeight: 1, fontWeight: '800', letterSpacing: '-.7px', color: '#0F172A', whiteSpace: 'nowrap', animation: 'fadeIn .25s ease forwards' },
  avatarWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px', width: '100%', padding: '0 4px' },
  avatar: { width: '40px', height: '40px', minWidth: '40px', borderRadius: '14px', background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800', flexShrink: 0 },
  avatarName: { fontSize: '14px', fontWeight: '700', color: '#0F172A' },
  avatarRole: { fontSize: '12px', color: '#64748B', fontWeight: '500' },
  divider: { height: '1px', background: 'rgba(226,232,240,0.4)', margin: '10px 0' },
  
  sideNav: { display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 auto', minHeight: 0, overflowY: 'auto', overflowX: 'hidden', width: '100%', padding: '0 6px' },
  sideNavItem: { display: 'flex', alignItems: 'center', width: '100%', height: '48px', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative' },
  navLabel: { fontSize: '14px', lineHeight: '1', animation: 'fadeIn .25s ease forwards' },
  activeIndicator: { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '4px', height: '20px', borderRadius: '4px', background: '#F59E0B', boxShadow: '0 0 12px rgba(245,158,11,0.3)' },
  badge: { fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', transition: 'all .2s ease' },
  
  statsBox: { flexShrink: 0, margin: '12px 8px', padding: '14px', borderRadius: '16px', background: 'rgba(248,250,252,0.6)', border: '1px solid rgba(226,232,240,0.4)', animation: 'fadeIn .25s ease forwards' },
  statsBoxTitle: { fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.8px' },
  statsBoxRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  statsBoxLabel: { fontSize: '12px', color: '#475569', fontWeight: '500' },
  statsBoxVal: { fontSize: '14px', fontWeight: '800', color: '#0F172A' },

  bottomSection: { width: '100%', marginTop: 'auto', paddingTop: '8px', flexShrink: 0, padding: '0 8px' },
  logoutBtn: { display: 'flex', alignItems: 'center', width: '100%', height: '48px', borderRadius: '14px', cursor: 'pointer', color: '#64748B', fontWeight: '600', transition: 'all 0.2s ease' },

  // Main Content
  main: { transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', padding: '32px 40px', overflowY: 'auto', minHeight: '100vh' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  heading: { fontSize: '28px', fontWeight: '900', color: '#0F172A', marginBottom: '4px', letterSpacing: '-1px' },
  headSub: { fontSize: '15px', color: '#64748B' },
  exportBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 22px', background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' },
  
  // Metrics
  metricsRow: { display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '14px', marginBottom: '32px' },
  metCard: { background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', borderRadius: '16px', padding: '18px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 20px rgba(15,23,42,0.03)' },
  metIcon: { width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' },
  metVal: { fontSize: '28px', fontWeight: '800', marginBottom: '4px' },
  metLabel: { fontSize: '12.5px', color: '#64748B', fontWeight: '600' },
  
  // Grid & Cards
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  card: { background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 20px rgba(15,23,42,0.03)' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  cardTitle: { fontSize: '16px', fontWeight: '800', color: '#0F172A' },
  cardLink: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#F59E0B', fontWeight: '700', cursor: 'pointer' },
  
  // Tables & Rows
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748B', padding: '12px 14px', borderBottom: '1px solid rgba(226,232,240,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid rgba(226,232,240,0.4)', transition: 'background .2s ease' },
  td: { padding: '12px 14px', fontSize: '13px', color: '#1E293B' },
  tdName: { fontWeight: '700', color: '#0F172A' },
  
  studentRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid rgba(226,232,240,0.4)', cursor: 'default' },
  studentAvatar: { width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#60A5FA)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', flexShrink: 0 },
  studentName: { fontSize: '14px', fontWeight: '700', color: '#0F172A', marginBottom: '2px' },
  studentMeta: { fontSize: '12px', color: '#64748B' },
  
  employerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(226,232,240,0.4)' },
  employerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  employerStats: { display: 'flex', gap: '24px' },
  empStat: { textAlign: 'center' },
  empStatVal: { fontSize: '18px', fontWeight: '800', color: '#0F172A' },
  empStatLabel: { fontSize: '11px', color: '#64748B', fontWeight: '600' },
  
  placementRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(226,232,240,0.4)', gap: '12px' },
  placementLeft: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1 },
  placementRight: { flex: 1 },
  placementName: { fontSize: '14px', fontWeight: '700', color: '#0F172A', marginBottom: '2px' },
  placementMeta: { fontSize: '12px', color: '#64748B' },
  placementJob: { fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '2px' },
  placementCompany: { fontSize: '12px', color: '#64748B' },
  offerBadge: { background: '#ECFDF5', color: '#10B981', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' },
  
  // Helpers & Empty States
  getBadge: (status) => {
    const styles = {
      'offer': { background: '#ECFDF5', color: '#10B981' },
      'interview': { background: '#FFFBEB', color: '#F59E0B' },
      'applied': { background: '#EFF6FF', color: '#2563EB' },
    }
    const s = styles[status] || { background: '#F1F5F9', color: '#64748B' }
    return { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', ...s }
  },
  empty: { textAlign: 'center', padding: '40px 0', color: '#64748B', fontSize: '14px' },
  emptyIcon: { fontSize: '32px', marginBottom: '10px' }
}