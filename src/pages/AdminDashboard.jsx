// src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell'

// ---------- Icon system (unchanged) ----------
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
  trash: <><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 14h10l1-14M9 7V4h6v3" /></>,
  check: <><path d="M20 6 9 17l-5-5" /></>,
  download: <><path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 21h14" /></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>,
}

export default function AdminDashboard() {
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState([])
  const [companies, setCompanies] = useState([])
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)
      const { data: usersData } = await supabase.from('profiles').select('*')
      setUsers(usersData || [])
      const { data: jobsData } = await supabase.from('jobs').select('*, employer:profiles(*)')
      setJobs(jobsData || [])
      const { data: appsData } = await supabase.from('applications').select('*')
      setApplications(appsData || [])
      const employers = usersData?.filter(u => u.role === 'employer') || []
      setCompanies(employers)
    }
    getData()
  }, [])

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/') }

  const getMetrics = () => {
    const totalUsers = users.length
    const totalStudents = users.filter(u => u.role === 'student').length
    const totalEmployers = users.filter(u => u.role === 'employer').length
    const totalJobs = jobs.length
    const totalApplications = applications.length
    const offers = applications.filter(a => a.status === 'offer').length
    const placementRate = totalApplications > 0 ? Math.round((offers / totalApplications) * 100) : 0
    return { totalUsers, totalStudents, totalEmployers, totalJobs, totalApplications, offers, placementRate }
  }

  async function handlePromoteToCoordinator(userId) {
    setLoading(true)
    const { error } = await supabase.from('profiles').update({ role: 'coordinator' }).eq('id', userId)
    if (!error) setUsers(users.map(u => u.id === userId ? { ...u, role: 'coordinator' } : u))
    setLoading(false)
  }

  async function handleToggleSuspend(user) {
    const newStatus = !user.suspended
    const action = newStatus ? 'suspend' : 'unsuspend'
    if (!confirm(`Are you sure you want to ${action} ${user.full_name || user.email}?`)) return
    setLoading(true)
    const { error } = await supabase.from('profiles').update({ suspended: newStatus }).eq('id', user.id)
    if (error) alert(`Could not ${action} user: ${error.message}`)
    else setUsers(prev => prev.map(u => u.id === user.id ? { ...u, suspended: newStatus } : u))
    setLoading(false)
  }

  async function handleDeleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    setLoading(true)
    try {
      await supabase.from('applications').delete().eq('student_id', userId)
      await supabase.from('jobs').delete().eq('employer_id', userId)
      const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId)
      if (profileError) { alert('Could not delete user: ' + profileError.message); setLoading(false); return }
      setUsers(prev => prev.filter(u => u.id !== userId))
    } catch (err) { console.error(err); alert('Unexpected error while deleting user.') }
    finally { setLoading(false) }
  }

  async function handleVerifyCompany(companyId) {
    setLoading(true)
    const { error } = await supabase.from('profiles').update({ verified: true }).eq('id', companyId)
    if (!error) setCompanies(companies.map(c => c.id === companyId ? { ...c, verified: true } : c))
    setLoading(false)
  }

  async function handleDeleteJob(jobId) {
    if (!confirm('Delete this job?')) return
    setLoading(true)
    const { error } = await supabase.from('jobs').delete().eq('id', jobId)
    if (!error) setJobs(jobs.filter(j => j.id !== jobId))
    setLoading(false)
  }

  async function exportToCSV() {
    const data = {
      users: users.map(u => ({ name: u.full_name, email: u.email, role: u.role, suspended: u.suspended })),
      jobs: jobs.map(j => ({ title: j.title, company: j.company, type: j.type, location: j.location })),
      applications: applications.map(a => ({ job_id: a.job_id, student_id: a.student_id, status: a.status })),
    }
    const csv = JSON.stringify(data, null, 2)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `careerbridge-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  const filteredUsers = search
    ? users.filter(u => (u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())) && (filter === 'all' || u.role === filter))
    : users.filter(u => filter === 'all' || u.role === filter)

  const { totalUsers, totalStudents, totalEmployers, totalJobs, totalApplications, offers, placementRate } = getMetrics()

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <Icon path={icons.grid} size={18} />, exact: true },
  ]

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: `Users (${users.length})` },
    { id: 'companies', label: `Companies (${companies.length})` },
    { id: 'jobs', label: `Jobs (${jobs.length})` },
    { id: 'reports', label: 'Reports' },
  ]

  return (
    <DashboardShell
      brandLabel="ADMIN"
      accent="#EA4E1B"
      navItems={navItems}
      profile={{ full_name: profile?.full_name || 'Admin', role_label: 'Administrator' }}
      onLogout={handleLogout}
      logoMark={<Icon path={icons.shield} size={20} />}
    >
      <div className="ad-main" style={S.main}>
        <div style={S.topBar}>
          <div>
            <h1 style={S.heading}>Admin Dashboard</h1>
            <p style={S.headSub}>Platform overview and management</p>
          </div>
        </div>

        {/* Tab strip — horizontal scroll on mobile */}
        <div className="ad-tabs" style={S.tabs}>
          {tabs.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              style={{
                ...S.tab,
                ...(activeTab === t.id ? S.tabActive : {}),
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="ad-metrics" style={S.metricsRow}>
              {[
                { label: 'Total Users', val: totalUsers, color: '#EA4E1B', bg: 'rgba(234,78,27,0.1)', icon: icons.users },
                { label: 'Students', val: totalStudents, color: '#3B82F6', bg: 'rgba(37,99,235,0.1)', icon: icons.users },
                { label: 'Employers', val: totalEmployers, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', icon: icons.briefcase },
                { label: 'Total Jobs', val: totalJobs, color: '#EC4899', bg: 'rgba(236,72,153,0.1)', icon: icons.plus },
                { label: 'Applications', val: totalApplications, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: icons.grid },
                { label: 'Offers Made', val: offers, color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: icons.check },
              ].map((m, i) => (
                <div key={i} style={{ ...S.metCard, borderTop: `4px solid ${m.color}` }}>
                  <div style={{ ...S.metIcon, background: m.bg, color: m.color }}><Icon path={m.icon} size={18} /></div>
                  <div style={{ ...S.metVal, color: m.color }}>{m.val}</div>
                  <div style={S.metLabel}>{m.label}</div>
                </div>
              ))}
            </div>

            <div style={S.card}>
              <div style={S.cardHead}><div style={S.cardTitle}>Platform Placement Rate</div></div>
              <div className="ad-placement" style={S.placementRow}>
                <div style={{ flex: 1 }}>
                  <div style={S.placementBig}>{placementRate}%</div>
                  <div style={S.placementSub}>{offers} offers out of {totalApplications} applications</div>
                </div>
                <div style={S.placementDonut}>
                  <div style={S.placementDonutInner}>{placementRate}%</div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div style={S.card}>
            <div style={S.cardHead}>
              <div style={S.cardTitle}>All Users</div>
              <div className="ad-user-controls" style={S.userControls}>
                <input style={S.searchInput} type="text" placeholder="Search by name/email..."
                  value={search} onChange={e => setSearch(e.target.value)} />
                <select style={S.filterSelect} value={filter} onChange={e => setFilter(e.target.value)}>
                  <option value="all">All Roles</option>
                  <option value="student">Student</option>
                  <option value="employer">Employer</option>
                  <option value="coordinator">Coordinator</option>
                </select>
              </div>
            </div>
            <div className="table-scroll" style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={{ ...S.th, textAlign: 'left' }}>Name</th>
                    <th style={{ ...S.th, textAlign: 'left' }}>Email</th>
                    <th style={{ ...S.th, textAlign: 'left' }}>Role</th>
                    <th style={{ ...S.th, textAlign: 'left' }}>Status</th>
                    <th style={{ ...S.th, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} style={S.tr}>
                      <td style={S.td}><strong style={{ color: '#0F172A' }}>{user.full_name}</strong></td>
                      <td style={S.td}><span style={S.tdMuted}>{user.email}</span></td>
                      <td style={S.td}>
                        <span style={{ ...S.roleBadge, ...(user.role === 'student' ? { background: 'rgba(37,99,235,0.1)', color: '#2563EB' } : user.role === 'employer' ? { background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' } : { background: 'rgba(234,78,27,0.1)', color: '#EA4E1B' }) }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={S.td}>
                        <span style={{ ...S.statusBadge, background: user.suspended ? 'rgba(234,78,27,0.1)' : 'rgba(16,185,129,0.1)', color: user.suspended ? '#EA4E1B' : '#10B981' }}>
                          {user.suspended ? '🚫 Suspended' : '✓ Active'}
                        </span>
                      </td>
                      <td style={{ ...S.td, textAlign: 'center' }}>
                        <div style={S.actionBtns}>
                          {user.role !== 'coordinator' && (
                            <button style={{ ...S.actionBtn, background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}
                              onClick={() => handlePromoteToCoordinator(user.id)} disabled={loading}>Promote</button>
                          )}
                          <button style={{ ...S.actionBtn, background: user.suspended ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: user.suspended ? '#10B981' : '#D97706' }}
                            onClick={() => handleToggleSuspend(user)} disabled={loading}>
                            {user.suspended ? 'Unsuspend' : 'Suspend'}
                          </button>
                          <button style={{ ...S.actionBtn, background: 'rgba(234,78,27,0.1)', color: '#EA4E1B' }}
                            onClick={() => handleDeleteUser(user.id)} disabled={loading}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'companies' && (
          <div style={S.card}>
            <div style={S.cardHead}><div style={S.cardTitle}>Companies</div></div>
            {companies.length === 0 ? (
              <div style={S.empty}><div style={S.emptyIcon}>🏢</div><div style={S.emptyText}>No companies yet</div></div>
            ) : (
              <div className="table-scroll" style={S.tableWrap}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={{ ...S.th, textAlign: 'left' }}>Company</th>
                      <th style={{ ...S.th, textAlign: 'left' }}>Email</th>
                      <th style={{ ...S.th, textAlign: 'center' }}>Jobs Posted</th>
                      <th style={{ ...S.th, textAlign: 'center' }}>Applications</th>
                      <th style={{ ...S.th, textAlign: 'center' }}>Status</th>
                      <th style={{ ...S.th, textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map(company => {
                      const companyJobs = jobs.filter(j => j.employer_id === company.id).length
                      const companyApps = applications.filter(a => jobs.find(j => j.id === a.job_id && j.employer_id === company.id)).length
                      return (
                        <tr key={company.id} style={S.tr}>
                          <td style={S.td}><strong>{company.company_name || company.full_name}</strong></td>
                          <td style={S.td}><span style={S.tdMuted}>{company.email}</span></td>
                          <td style={{ ...S.td, textAlign: 'center' }}>{companyJobs}</td>
                          <td style={{ ...S.td, textAlign: 'center' }}>{companyApps}</td>
                          <td style={{ ...S.td, textAlign: 'center' }}>
                            <span style={{ ...S.roleBadge, background: company.verified ? 'rgba(16,185,129,0.1)' : 'rgba(139,92,246,0.1)', color: company.verified ? '#10B981' : '#8B5CF6' }}>
                              {company.verified ? '✓ Verified' : 'Unverified'}
                            </span>
                          </td>
                          <td style={{ ...S.td, textAlign: 'center' }}>
                            {!company.verified && (
                              <button style={{ ...S.actionBtn, background: 'rgba(16,185,129,0.1)', color: '#10B981' }}
                                onClick={() => handleVerifyCompany(company.id)} disabled={loading}>Verify</button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div style={S.card}>
            <div style={S.cardHead}><div style={S.cardTitle}>All Jobs</div></div>
            {jobs.length === 0 ? (
              <div style={S.empty}><div style={S.emptyIcon}>💼</div><div style={S.emptyText}>No jobs posted</div></div>
            ) : (
              <div className="table-scroll" style={S.tableWrap}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={{ ...S.th, textAlign: 'left' }}>Title</th>
                      <th style={{ ...S.th, textAlign: 'left' }}>Company</th>
                      <th style={{ ...S.th, textAlign: 'left' }}>Type</th>
                      <th style={{ ...S.th, textAlign: 'left' }}>Location</th>
                      <th style={{ ...S.th, textAlign: 'center' }}>Applications</th>
                      <th style={{ ...S.th, textAlign: 'center' }}>Posted</th>
                      <th style={{ ...S.th, textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(job => {
                      const jobApps = applications.filter(a => a.job_id === job.id).length
                      return (
                        <tr key={job.id} style={S.tr}>
                          <td style={S.td}><strong>{job.title}</strong></td>
                          <td style={S.td}>{job.company}</td>
                          <td style={S.td}><span style={{ ...S.roleBadge, background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>{job.type}</span></td>
                          <td style={S.td}>{job.location}</td>
                          <td style={{ ...S.td, textAlign: 'center', fontWeight: 700 }}>{jobApps}</td>
                          <td style={S.td}>{new Date(job.created_at).toLocaleDateString()}</td>
                          <td style={{ ...S.td, textAlign: 'center' }}>
                            <button style={{ ...S.actionBtn, background: 'rgba(234,78,27,0.1)', color: '#EA4E1B' }}
                              onClick={() => handleDeleteJob(job.id)} disabled={loading}>Delete</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div style={S.card}>
            <div style={S.cardHead}><div style={S.cardTitle}>Reports & Export</div></div>
            <div className="ad-reports" style={S.reportsGrid}>
              <div style={S.reportBox}>
                <div style={S.reportTitle}>📊 Platform Summary</div>
                <div style={S.reportList}>
                  <div>Total Users: <strong>{totalUsers}</strong></div>
                  <div>Students: <strong>{totalStudents}</strong></div>
                  <div>Employers: <strong>{totalEmployers}</strong></div>
                  <div>Jobs Posted: <strong>{totalJobs}</strong></div>
                  <div>Total Applications: <strong>{totalApplications}</strong></div>
                  <div>Placement Rate: <strong>{placementRate}%</strong></div>
                </div>
              </div>
              <div style={S.reportBox}>
                <div style={S.reportTitle}>📈 Quick Actions</div>
                <button style={S.exportBtn} onClick={exportToCSV}>📥 Export All Data</button>
                <p style={S.reportNote}>Export all platform data as JSON for analysis and backups</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .ad-main { padding: clamp(16px, 3vw, 32px) clamp(16px, 3vw, 40px) 60px; max-width: 1400px; margin: 0 auto; }
        .ad-metrics { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 14px; margin-bottom: 32px; }
        .ad-tabs {
          display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;
          margin-bottom: 24px; scrollbar-width: thin;
        }
        .ad-tabs::-webkit-scrollbar { height: 4px; }
        .ad-user-controls { display: flex; gap: 8px; flex-wrap: wrap; }
        .ad-placement { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .ad-reports { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }

        @media (max-width: 1200px) { .ad-metrics { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 760px) {
          .ad-metrics { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .ad-reports { grid-template-columns: 1fr; }
          .ad-user-controls { width: 100%; }
          .ad-user-controls > input,
          .ad-user-controls > select { flex: 1 1 140px; width: 100%; }
        }
        @media (max-width: 420px) {
          .ad-metrics { grid-template-columns: 1fr; }
        }
      `}</style>
    </DashboardShell>
  )
}

const S = {
  main: { position: 'relative' },
  topBar: { marginBottom: 20 },
  heading: { fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 900, color: '#0F172A', marginBottom: 4, letterSpacing: '-1px' },
  headSub: { fontSize: 'clamp(13px, 1.4vw, 15px)', color: '#64748B' },

  tabs: { display: 'flex', gap: 6, marginBottom: 24 },
  tab: {
    padding: '9px 16px', borderRadius: 10, border: '1px solid #E2E8F0',
    background: '#fff', fontSize: 13, fontWeight: 600, color: '#475569',
    cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 40,
  },
  tabActive: { background: '#0F172A', color: '#fff', borderColor: '#0F172A' },

  metricsRow: { display: 'grid', gap: 14, marginBottom: 32 },
  metCard: { background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', borderRadius: 16, padding: 18, border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 20px rgba(15,23,42,0.03)', minWidth: 0 },
  metIcon: { width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  metVal: { fontSize: 'clamp(22px, 2.4vw, 28px)', fontWeight: 800, marginBottom: 4 },
  metLabel: { fontSize: 12.5, color: '#64748B', fontWeight: 600 },

  card: { background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderRadius: 20, padding: 'clamp(16px, 2.5vw, 24px)', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 20px rgba(15,23,42,0.03)', minWidth: 0 },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 800, color: '#0F172A' },

  userControls: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  searchInput: { padding: '10px 12px', border: '1px solid rgba(226,232,240,0.6)', borderRadius: 8, fontSize: 13, background: 'rgba(255,255,255,0.6)', minWidth: 0, minHeight: 40 },
  filterSelect: { padding: '10px 12px', border: '1px solid rgba(226,232,240,0.6)', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#fff', minHeight: 40 },

  tableWrap: { marginTop: 14 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 640 },
  th: { padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.5px', background: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(226,232,240,0.4)', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid rgba(226,232,240,0.3)' },
  td: { padding: '12px 14px', color: '#1E293B', verticalAlign: 'middle' },
  tdMuted: { fontSize: 13, color: '#64748B' },

  roleBadge: { padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, display: 'inline-block', whiteSpace: 'nowrap' },
  statusBadge: { padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, display: 'inline-block', whiteSpace: 'nowrap' },
  actionBtns: { display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' },
  actionBtn: { padding: '7px 12px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', minHeight: 36 },

  empty: { textAlign: 'center', padding: '60px 20px', color: '#94A3B8' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, fontWeight: 700, color: '#64748B' },

  placementRow: { display: 'flex', alignItems: 'center', gap: 20 },
  placementBig: { fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#10B981' },
  placementSub: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  placementDonut: { width: 120, height: 120, borderRadius: '50%', background: 'conic-gradient(#10B981 0deg 300deg, #E2E8F0 300deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  placementDonutInner: { width: 100, height: 100, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#10B981' },

  reportsGrid: { display: 'grid', gap: 16 },
  reportBox: { background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(226,232,240,0.4)', borderRadius: 12, padding: 20, minWidth: 0 },
  reportTitle: { fontSize: 18, marginBottom: 10 },
  reportList: { fontSize: 13, color: '#64748B', lineHeight: 1.7 },
  reportNote: { fontSize: 12, color: '#94A3B8', marginTop: 12 },
  exportBtn: { width: '100%', padding: 12, background: '#EA4E1B', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', minHeight: 44 },
}