// src/pages/CoordinatorDashboard.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell'
import DocumentVerification from '../components/DocumentVerification'

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
  trophy: <><path d="M8 21h8M12 17v4" /><path d="M7 4h10v6a5 5 0 0 1-10 0V4z" /><path d="M7 5H4a3 3 0 0 0 3 4M17 5h3a3 3 0 0 1-3 4" /></>,
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

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/') }

  const placementRate = applications.length > 0
    ? Math.round((applications.filter(a => a.status === 'offer').length / applications.length) * 100)
    : 0

  function exportToCSV() {
    const rows = [
      ['Student Name', 'Email', 'University', 'Course', 'Index Number', 'Skills', 'Applications', 'Status'],
      ...students.map(s => {
        const studentApps = applications.filter(a => a.student_id === s.id)
        const latestStatus = studentApps[0]?.status || 'No applications'
        return [s.full_name || 'Unknown', s.email || '-', s.university || '-', s.course || '-', s.index_number || '-', s.skills || '-', studentApps.length, latestStatus]
      }),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'careerbridge_placements.csv'
    a.click()
  }

  const navItems = [
    { path: '/coordinator', label: 'Dashboard', icon: <Icon path={icons.grid} size={18} />, exact: true },
  ]

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'students', label: `Students (${students.length})` },
    { id: 'employers', label: `Employers (${employers.length})` },
    { id: 'placements', label: `Placements (${applications.filter(a => a.status === 'offer').length})` },
    { id: 'documents', label: 'Documents' },
  ]

  return (
    <DashboardShell
      brandLabel="COORDINATOR"
      accent="#F59E0B"
      navItems={navItems}
      profile={{ full_name: profile?.full_name || 'Coordinator', role_label: 'University Coordinator' }}
      onLogout={handleLogout}
      logoMark={<Icon path={icons.grid} size={18} />}
    >
      <div className="cd-main" style={S.main}>
        <div style={S.topBar}>
          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            <h1 style={S.heading}>University Coordinator Dashboard</h1>
            <p style={S.headSub}>Monitor student placements and employer activity</p>
          </div>
          <button style={S.exportBtn} onClick={exportToCSV}>
            <Icon path={icons.download} size={16} /> Export CSV
          </button>
        </div>

        <div className="cd-metrics" style={S.metricsRow}>
          {[
            { label: 'Total Students', val: students.length, color: '#2563EB', bg: '#EFF6FF', icon: icons.users },
            { label: 'Total Employers', val: employers.length, color: '#7C3AED', bg: '#F5F3FF', icon: icons.briefcase },
            { label: 'Total Applications', val: applications.length, color: '#D97706', bg: '#FFFBEB', icon: icons.plus },
            { label: 'Placements', val: applications.filter(a => a.status === 'offer').length, color: '#10B981', bg: '#ECFDF5', icon: icons.trophy },
            { label: 'Interviews', val: applications.filter(a => a.status === 'interview').length, color: '#0891B2', bg: '#ECFEFF', icon: icons.target },
            { label: 'Placement Rate', val: `${placementRate}%`, color: '#10B981', bg: '#ECFDF5', icon: icons.star },
          ].map((m, i) => (
            <div key={i} style={{ ...S.metCard, borderTop: `4px solid ${m.color}` }}>
              <div style={{ ...S.metIcon, background: m.bg, color: m.color }}><Icon path={m.icon} size={18} /></div>
              <div style={{ ...S.metVal, color: m.color }}>{m.val}</div>
              <div style={S.metLabel}>{m.label}</div>
            </div>
          ))}
        </div>

        <div className="cd-tabs" style={S.tabs}>
          {tabs.map(t => (
            <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
              style={{ ...S.tab, ...(activeTab === t.id ? S.tabActive : {}) }}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="cd-grid2" style={S.grid2}>
            <div style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardTitle}>Recent Placements</div>
                <span style={S.cardLink} onClick={() => setActiveTab('placements')}>View all <Icon path={icons.chevron} size={14} /></span>
              </div>
              {applications.filter(a => a.status === 'offer').slice(0, 5).map(app => (
                <div key={app.id} style={S.placementRow}>
                  <div style={S.placementLeft}>
                    <div style={S.studentAvatar}>{app.profiles?.full_name?.charAt(0)}</div>
                    <div style={{ minWidth: 0 }}>
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
              {students.slice(0, 5).map(s => (
                <div key={s.id} style={S.studentRow}>
                  <div style={S.studentAvatar}>{s.full_name?.charAt(0)}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={S.studentName}>{s.full_name || 'Unknown Student'}</div>
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
              <button style={{ ...S.exportBtn, fontSize: 13, padding: '8px 16px' }} onClick={exportToCSV}>
                <Icon path={icons.download} size={14} /> Export
              </button>
            </div>
            <div className="table-scroll" style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    {['Name', 'Email', 'University', 'Course', 'Index Number', 'Skills', 'Applications', 'Status'].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => {
                    const studentApps = applications.filter(a => a.student_id === s.id)
                    const bestStatus = studentApps.find(a => a.status === 'offer')?.status || studentApps.find(a => a.status === 'interview')?.status || studentApps[0]?.status || 'No applications'
                    return (
                      <tr key={s.id} style={S.tr}>
                        <td style={S.td}><div style={S.tdName}>{s.full_name || 'Unknown'}</div></td>
                        <td style={S.td}>{s.email || '-'}</td>
                        <td style={S.td}>{s.university || '-'}</td>
                        <td style={S.td}>{s.course || '-'}</td>
                        <td style={S.td}>{s.index_number || '-'}</td>
                        <td style={S.td}>{s.skills ? s.skills.split(',').slice(0, 3).join(', ') : '-'}</td>
                        <td style={{ ...S.td, textAlign: 'center' }}>{studentApps.length}</td>
                        <td style={S.td}><span style={S.getBadge(bestStatus)}>{bestStatus}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'employers' && (
          <div style={S.card}>
            <div style={S.cardHead}><div style={S.cardTitle}>All Employers ({employers.length})</div></div>
            {employers.map(e => {
              const employerJobs = jobs.filter(j => j.employer_id === e.id)
              const employerApps = applications.filter(a => employerJobs.some(j => j.id === a.job_id))
              return (
                <div key={e.id} style={S.employerRow}>
                  <div style={S.employerLeft}>
                    <div style={{ ...S.studentAvatar, background: 'linear-gradient(135deg,#10B981,#34D399)' }}>{e.full_name?.charAt(0)}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={S.studentName}>{e.full_name}</div>
                      <div style={S.studentMeta}>{e.email}</div>
                    </div>
                  </div>
                  <div style={S.employerStats}>
                    <div style={S.empStat}><div style={S.empStatVal}>{employerJobs.length}</div><div style={S.empStatLabel}>Jobs posted</div></div>
                    <div style={S.empStat}><div style={S.empStatVal}>{employerApps.length}</div><div style={S.empStatLabel}>Applications</div></div>
                    <div style={S.empStat}><div style={{ ...S.empStatVal, color: '#10B981' }}>{employerApps.filter(a => a.status === 'offer').length}</div><div style={S.empStatLabel}>Offers made</div></div>
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
              <button style={{ ...S.exportBtn, fontSize: 13, padding: '8px 16px' }} onClick={exportToCSV}>
                <Icon path={icons.download} size={14} /> Export CSV
              </button>
            </div>
            {applications.filter(a => a.status === 'offer').map(app => (
              <div key={app.id} style={S.placementRow}>
                <div style={S.placementLeft}>
                  <div style={S.studentAvatar}>{app.profiles?.full_name?.charAt(0)}</div>
                  <div style={{ minWidth: 0 }}>
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

        {activeTab === 'documents' && <DocumentVerification />}
      </div>

      <style>{`
        .cd-main { padding: clamp(16px, 3vw, 32px) clamp(16px, 3vw, 40px) 60px; max-width: 1400px; margin: 0 auto; }
        .cd-metrics { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 14px; margin-bottom: 28px; }
        .cd-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .cd-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 24px; }
        .cd-tabs::-webkit-scrollbar { height: 4px; }
        @media (max-width: 1200px) { .cd-metrics { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 900px) { .cd-grid2 { grid-template-columns: 1fr; } }
        @media (max-width: 760px) { .cd-metrics { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
        @media (max-width: 420px) { .cd-metrics { grid-template-columns: 1fr; } }
      `}</style>
    </DashboardShell>
  )
}

const S = {
  main: { position: 'relative' },
  topBar: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24 },
  heading: { fontSize: 'clamp(20px, 2.8vw, 28px)', fontWeight: 900, color: '#0F172A', marginBottom: 4, letterSpacing: '-1px' },
  headSub: { fontSize: 'clamp(13px, 1.4vw, 15px)', color: '#64748B' },
  exportBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, boxShadow: '0 4px 12px rgba(16,185,129,0.25)', minHeight: 44, whiteSpace: 'nowrap' },

  metricsRow: { display: 'grid', gap: 14, marginBottom: 28 },
  metCard: { background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', borderRadius: 16, padding: 18, border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 20px rgba(15,23,42,0.03)', minWidth: 0 },
  metIcon: { width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  metVal: { fontSize: 'clamp(22px, 2.4vw, 28px)', fontWeight: 800, marginBottom: 4 },
  metLabel: { fontSize: 12.5, color: '#64748B', fontWeight: 600 },

  tabs: { display: 'flex', gap: 6, marginBottom: 24 },
  tab: { padding: '9px 16px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 40 },
  tabActive: { background: '#0F172A', color: '#fff', borderColor: '#0F172A' },

  grid2: { display: 'grid', gap: 20 },
  card: { background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', borderRadius: 20, padding: 'clamp(16px, 2.5vw, 24px)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 20px rgba(15,23,42,0.03)', minWidth: 0 },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 800, color: '#0F172A' },
  cardLink: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#F59E0B', fontWeight: 700, cursor: 'pointer' },

  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 900 },
  th: { textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748B', padding: '12px 14px', borderBottom: '1px solid rgba(226,232,240,0.6)', textTransform: 'uppercase', letterSpacing: '.5px', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid rgba(226,232,240,0.4)' },
  td: { padding: '12px 14px', fontSize: 13, color: '#1E293B' },
  tdName: { fontWeight: 700, color: '#0F172A' },

  studentRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(226,232,240,0.4)' },
  studentAvatar: { width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#60A5FA)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0 },
  studentName: { fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis' },
  studentMeta: { fontSize: 12, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis' },

  employerRow: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: '1px solid rgba(226,232,240,0.4)' },
  employerLeft: { display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: '1 1 200px' },
  employerStats: { display: 'flex', gap: 20, flexWrap: 'wrap' },
  empStat: { textAlign: 'center' },
  empStatVal: { fontSize: 18, fontWeight: 800, color: '#0F172A' },
  empStatLabel: { fontSize: 11, color: '#64748B', fontWeight: 600 },

  placementRow: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid rgba(226,232,240,0.4)' },
  placementLeft: { display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 200px', minWidth: 0 },
  placementRight: { flex: '1 1 200px', minWidth: 0 },
  placementName: { fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 2 },
  placementMeta: { fontSize: 12, color: '#64748B' },
  placementJob: { fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 2 },
  placementCompany: { fontSize: 12, color: '#64748B' },
  offerBadge: { background: '#ECFDF5', color: '#10B981', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' },

  getBadge: (status) => {
    const styles = {
      'offer': { background: '#ECFDF5', color: '#10B981' },
      'interview': { background: '#FFFBEB', color: '#F59E0B' },
      'applied': { background: '#EFF6FF', color: '#2563EB' },
    }
    const s = styles[status] || { background: '#F1F5F9', color: '#64748B' }
    return { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, ...s }
  },
  empty: { textAlign: 'center', padding: '40px 0', color: '#64748B', fontSize: 14 },
  emptyIcon: { fontSize: 32, marginBottom: 10 },
}