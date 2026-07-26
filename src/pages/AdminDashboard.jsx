import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

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

      // Fetch all users
      const { data: usersData } = await supabase.from('profiles').select('*')
      setUsers(usersData || [])

      // Fetch all jobs
      const { data: jobsData } = await supabase.from('jobs').select('*, employer:profiles(*)')
      setJobs(jobsData || [])

      // Fetch all applications
      const { data: appsData } = await supabase.from('applications').select('*')
      setApplications(appsData || [])

      // Get companies (employers with verified status)
      const employers = usersData?.filter(u => u.role === 'employer') || []
      setCompanies(employers)
    }
    getData()
  }, [])

  async function handleLogout() { await supabase.auth.signOut() }

  function getMetrics() {
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
    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: 'coordinator' } : u))
    }
    setLoading(false)
  }

  async function handleSuspendUser(userId) {
    setLoading(true)
    const { error } = await supabase.from('profiles').update({ suspended: true }).eq('id', userId)
    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, suspended: true } : u))
    }
    setLoading(false)
  }

  async function handleDeleteUser(userId) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setLoading(true)
      const { error } = await supabase.from('profiles').delete().eq('id', userId)
      if (!error) {
        setUsers(users.filter(u => u.id !== userId))
      }
      setLoading(false)
    }
  }

  async function handleVerifyCompany(companyId) {
    setLoading(true)
    const { error } = await supabase.from('profiles').update({ verified: true }).eq('id', companyId)
    if (!error) {
      setCompanies(companies.map(c => c.id === companyId ? { ...c, verified: true } : c))
    }
    setLoading(false)
  }

  async function handleDeleteJob(jobId) {
    if (confirm('Delete this job?')) {
      setLoading(true)
      const { error } = await supabase.from('jobs').delete().eq('id', jobId)
      if (!error) {
        setJobs(jobs.filter(j => j.id !== jobId))
      }
      setLoading(false)
    }
  }

  async function exportToCSV() {
    const data = {
      users: users.map(u => ({ name: u.full_name, email: u.email, role: u.role, suspended: u.suspended })),
      jobs: jobs.map(j => ({ title: j.title, company: j.company, type: j.type, location: j.location })),
      applications: applications.map(a => ({ job_id: a.job_id, student_id: a.student_id, status: a.status }))
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
        .metCard{transition:transform .25s ease,box-shadow .25s ease;cursor:default}
        .metCard:hover{transform:translateY(-5px);box-shadow:0 20px 40px rgba(15,23,42,0.1)!important}
        .sideBtn{transition:all .2s ease;cursor:pointer}
        .sideBtn:hover{background:#1E293B!important;color:#fff!important}
        .logoutBtn{transition:all .2s ease}
        .logoutBtn:hover{background:#FEF2F2!important;color:#DC2626!important;border-color:#FECACA!important}
        .actionBtn{transition:all .2s ease}
        .actionBtn:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.1)!important}
        @media(max-width:768px){
          .sidebar{display:none!important}
          .layout{grid-template-columns:1fr!important}
          .main{padding:20px 16px 80px!important}
          .metricsRow{grid-template-columns:1fr 1fr!important}
          .tableScroll{overflow-x:auto!important}
        }
      `}</style>

      <div className="layout" style={S.layout}>
        <aside className="sidebar" style={S.sidebar}>
          <div style={S.sidebarTop}>
            <div style={S.sidebarLogo}>CareerBridge</div>
            <div style={S.avatarWrap}>
              <div style={{...S.avatar, background: 'linear-gradient(135deg, #DC2626, #F87171)'}}>{profile?.full_name?.charAt(0) || 'A'}</div>
              <div>
                <div style={S.avatarName}>{profile?.full_name || 'Admin'}</div>
                <div style={S.avatarRole}>Administrator</div>
              </div>
            </div>
          </div>
          <nav style={S.sideNav}>
            <div className="sideBtn" style={{...S.sideNavItem, ...(activeTab==='overview' ? S.sideNavActive : {})}} onClick={() => setActiveTab('overview')}>
              <span style={S.sideNavIcon}>📊</span> Overview
            </div>
            <div className="sideBtn" style={{...S.sideNavItem, ...(activeTab==='users' ? S.sideNavActive : {})}} onClick={() => setActiveTab('users')}>
              <span style={S.sideNavIcon}>👥</span> Users ({users.length})
            </div>
            <div className="sideBtn" style={{...S.sideNavItem, ...(activeTab==='companies' ? S.sideNavActive : {})}} onClick={() => setActiveTab('companies')}>
              <span style={S.sideNavIcon}>🏢</span> Companies ({companies.length})
            </div>
            <div className="sideBtn" style={{...S.sideNavItem, ...(activeTab==='jobs' ? S.sideNavActive : {})}} onClick={() => setActiveTab('jobs')}>
              <span style={S.sideNavIcon}>💼</span> Jobs ({jobs.length})
            </div>
            <div className="sideBtn" style={{...S.sideNavItem, ...(activeTab==='reports' ? S.sideNavActive : {})}} onClick={() => setActiveTab('reports')}>
              <span style={S.sideNavIcon}>📈</span> Reports
            </div>
          </nav>
          <button className="logoutBtn" style={S.logoutBtn} onClick={handleLogout}>← Log out</button>
        </aside>

        <main className="main" style={S.main}>
          <div className="pageIn" style={S.topBar}>
            <div>
              <h1 style={S.heading}>Admin Dashboard</h1>
              <p style={S.headSub}>Platform overview and management</p>
            </div>
          </div>

          {activeTab === 'overview' && (
            <>
              <div className="metricsRow" style={S.metricsRow}>
                {[
                  { label: 'Total Users', val: totalUsers, color: '#2563EB', bg: '#EFF6FF', icon: '👥' },
                  { label: 'Students', val: totalStudents, color: '#3B82F6', bg: '#EFF6FF', icon: '🎓' },
                  { label: 'Employers', val: totalEmployers, color: '#8B5CF6', bg: '#F3E8FF', icon: '🏢' },
                  { label: 'Total Jobs', val: totalJobs, color: '#EC4899', bg: '#FCE7F3', icon: '💼' },
                  { label: 'Applications', val: totalApplications, color: '#F59E0B', bg: '#FEF3C7', icon: '📋' },
                  { label: 'Offers Made', val: offers, color: '#10B981', bg: '#ECFDF5', icon: '🏆' },
                ].map((m, i) => (
                  <div key={i} className={`metCard cardIn c${i+1}`} style={{...S.metCard, borderTop: `3px solid ${m.color}`}}>
                    <div style={{...S.metIcon, background: m.bg}}>{m.icon}</div>
                    <div style={{...S.metVal, color: m.color}}>{m.val}</div>
                    <div style={S.metLabel}>{m.label}</div>
                  </div>
                ))}
              </div>
              <div className="cardIn c2" style={{...S.card, marginTop: '20px'}}>
                <div style={S.cardHead}>
                  <div style={S.cardTitle}>Platform Placement Rate</div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                  <div style={{flex: 1}}>
                    <div style={{fontSize: '48px', fontWeight: '800', color: '#10B981'}}>{placementRate}%</div>
                    <div style={{fontSize: '13px', color: '#94A3B8', marginTop: '4px'}}>{offers} offers out of {totalApplications} applications</div>
                  </div>
                  <div style={{width: '120px', height: '120px', borderRadius: '50%', background: `conic-gradient(#10B981 0deg ${placementRate * 3.6}deg, #E5E7EB ${placementRate * 3.6}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div style={{width: '100px', height: '100px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'}}>📊</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <div className="cardIn" style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardTitle}>All Users</div>
                <div style={{display: 'flex', gap: '8px'}}>
                  <input 
                    style={{...S.searchInput, width: '180px'}} 
                    type="text" 
                    placeholder="Search by name/email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <select 
                    style={S.filterSelect}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Student</option>
                    <option value="employer">Employer</option>
                    <option value="coordinator">Coordinator</option>
                  </select>
                </div>
              </div>
              <div className="tableScroll" style={S.tableWrapper}>
                <table style={S.table}>
                  <thead>
                    <tr style={S.tableHeader}>
                      <th style={{...S.tableCell, textAlign: 'left'}}>Name</th>
                      <th style={{...S.tableCell, textAlign: 'left'}}>Email</th>
                      <th style={{...S.tableCell, textAlign: 'left'}}>Role</th>
                      <th style={{...S.tableCell, textAlign: 'left'}}>Status</th>
                      <th style={{...S.tableCell, textAlign: 'center'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} style={S.tableRow}>
                        <td style={S.tableCell}><span style={{fontWeight: '600', color: '#0F172A'}}>{user.full_name}</span></td>
                        <td style={S.tableCell}><span style={{fontSize: '13px', color: '#64748B'}}>{user.email}</span></td>
                        <td style={S.tableCell}>
                          <span style={{...S.roleBadge, background: user.role === 'student' ? '#EFF6FF' : user.role === 'employer' ? '#F3E8FF' : '#DBEAFE', color: user.role === 'student' ? '#2563EB' : user.role === 'employer' ? '#8B5CF6' : '#3B82F6'}}>
                            {user.role}
                          </span>
                        </td>
                        <td style={S.tableCell}>
                          <span style={{...S.statusBadge, background: user.suspended ? '#FEF2F2' : '#ECFDF5', color: user.suspended ? '#DC2626' : '#059669'}}>
                            {user.suspended ? '🚫 Suspended' : '✓ Active'}
                          </span>
                        </td>
                        <td style={{...S.tableCell, textAlign: 'center'}}>
                          <div style={{display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap'}}>
                            {user.role !== 'coordinator' && (
                              <button className="actionBtn" style={{...S.actionBtn, background: '#EFF6FF', color: '#2563EB'}} onClick={() => handlePromoteToCoordinator(user.id)} disabled={loading}>
                                Promote
                              </button>
                            )}
                            <button className="actionBtn" style={{...S.actionBtn, background: '#FEF3C7', color: '#D97706'}} onClick={() => handleSuspendUser(user.id)} disabled={loading}>
                              Suspend
                            </button>
                            <button className="actionBtn" style={{...S.actionBtn, background: '#FEF2F2', color: '#DC2626'}} onClick={() => handleDeleteUser(user.id)} disabled={loading}>
                              Delete
                            </button>
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
            <div className="cardIn" style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardTitle}>Companies</div>
              </div>
              {companies.length === 0 ? (
                <div style={S.empty}>
                  <div style={S.emptyIcon}>🏢</div>
                  <div style={S.emptyText}>No companies yet</div>
                </div>
              ) : (
                <div className="tableScroll" style={S.tableWrapper}>
                  <table style={S.table}>
                    <thead>
                      <tr style={S.tableHeader}>
                        <th style={{...S.tableCell, textAlign: 'left'}}>Company</th>
                        <th style={{...S.tableCell, textAlign: 'left'}}>Email</th>
                        <th style={{...S.tableCell, textAlign: 'center'}}>Jobs Posted</th>
                        <th style={{...S.tableCell, textAlign: 'center'}}>Applications</th>
                        <th style={{...S.tableCell, textAlign: 'center'}}>Status</th>
                        <th style={{...S.tableCell, textAlign: 'center'}}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map(company => {
                        const companyJobs = jobs.filter(j => j.employer_id === company.id).length
                        const companyApps = applications.filter(a => jobs.find(j => j.id === a.job_id && j.employer_id === company.id)).length
                        return (
                          <tr key={company.id} style={S.tableRow}>
                            <td style={S.tableCell}><span style={{fontWeight: '600'}}>{company.company_name || company.full_name}</span></td>
                            <td style={S.tableCell}><span style={{fontSize: '13px', color: '#64748B'}}>{company.email}</span></td>
                            <td style={{...S.tableCell, textAlign: 'center'}}>{companyJobs}</td>
                            <td style={{...S.tableCell, textAlign: 'center'}}>{companyApps}</td>
                            <td style={{...S.tableCell, textAlign: 'center'}}>
                              <span style={{...S.verifyBadge, background: company.verified ? '#ECFDF5' : '#F3E8FF', color: company.verified ? '#059669' : '#8B5CF6'}}>
                                {company.verified ? '✓ Verified' : 'Unverified'}
                              </span>
                            </td>
                            <td style={{...S.tableCell, textAlign: 'center'}}>
                              {!company.verified && (
                                <button className="actionBtn" style={{...S.actionBtn, background: '#ECFDF5', color: '#059669'}} onClick={() => handleVerifyCompany(company.id)} disabled={loading}>
                                  Verify
                                </button>
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
            <div className="cardIn" style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardTitle}>All Jobs</div>
              </div>
              {jobs.length === 0 ? (
                <div style={S.empty}>
                  <div style={S.emptyIcon}>💼</div>
                  <div style={S.emptyText}>No jobs posted</div>
                </div>
              ) : (
                <div className="tableScroll" style={S.tableWrapper}>
                  <table style={S.table}>
                    <thead>
                      <tr style={S.tableHeader}>
                        <th style={{...S.tableCell, textAlign: 'left'}}>Title</th>
                        <th style={{...S.tableCell, textAlign: 'left'}}>Company</th>
                        <th style={{...S.tableCell, textAlign: 'left'}}>Type</th>
                        <th style={{...S.tableCell, textAlign: 'left'}}>Location</th>
                        <th style={{...S.tableCell, textAlign: 'center'}}>Applications</th>
                        <th style={{...S.tableCell, textAlign: 'center'}}>Posted</th>
                        <th style={{...S.tableCell, textAlign: 'center'}}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map(job => {
                        const jobApps = applications.filter(a => a.job_id === job.id).length
                        return (
                          <tr key={job.id} style={S.tableRow}>
                            <td style={S.tableCell}><span style={{fontWeight: '600'}}>{job.title}</span></td>
                            <td style={S.tableCell}>{job.company}</td>
                            <td style={S.tableCell}><span style={{...S.typeBadge}}>{job.type}</span></td>
                            <td style={S.tableCell}>{job.location}</td>
                            <td style={{...S.tableCell, textAlign: 'center', fontWeight: '600'}}>{jobApps}</td>
                            <td style={S.tableCell}>{new Date(job.created_at).toLocaleDateString()}</td>
                            <td style={{...S.tableCell, textAlign: 'center'}}>
                              <button className="actionBtn" style={{...S.actionBtn, background: '#FEF2F2', color: '#DC2626'}} onClick={() => handleDeleteJob(job.id)} disabled={loading}>
                                Delete
                              </button>
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
            <div className="cardIn" style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardTitle}>Reports & Export</div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px'}}>
                <div style={{...S.reportBox}}>
                  <div style={{fontSize: '18px', marginBottom: '10px'}}>📊 Platform Summary</div>
                  <div style={{fontSize: '13px', color: '#64748B', lineHeight: '1.6'}}>
                    <div>Total Users: <strong>{totalUsers}</strong></div>
                    <div>Students: <strong>{totalStudents}</strong></div>
                    <div>Employers: <strong>{totalEmployers}</strong></div>
                    <div>Jobs Posted: <strong>{totalJobs}</strong></div>
                    <div>Total Applications: <strong>{totalApplications}</strong></div>
                    <div>Placement Rate: <strong>{placementRate}%</strong></div>
                  </div>
                </div>
                <div style={{...S.reportBox}}>
                  <div style={{fontSize: '18px', marginBottom: '10px'}}>📈 Quick Actions</div>
                  <button style={{...S.exportBtn}} onClick={exportToCSV}>
                    📥 Export All Data
                  </button>
                  <p style={{fontSize: '12px', color: '#94A3B8', marginTop: '12px'}}>Export all platform data as JSON for analysis and backups</p>
                </div>
              </div>
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
  avatar: { width: '42px', height: '42px', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800' },
  avatarName: { fontSize: '14px', fontWeight: '700', color: '#F1F5F9' },
  avatarRole: { fontSize: '11.5px', color: '#64748B', fontWeight: '500' },

  sideNav: { padding: '20px 12px', flex: 1 },
  sideNavItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: '#94A3B8', marginBottom: '4px' },
  sideNavActive: { background: '#1E293B', color: '#fff' },
  sideNavIcon: { fontSize: '16px' },

  logoutBtn: { margin: '0 12px 24px', padding: '11px', background: 'transparent', border: '1px solid #1E293B', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#94A3B8' },

  main: { padding: '32px 36px', overflowY: 'auto', paddingBottom: '80px' },
  topBar: { marginBottom: '28px' },
  heading: { fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' },
  headSub: { fontSize: '14px', color: '#94A3B8' },

  metricsRow: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', marginBottom: '24px' },
  metCard: { background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #F0F2F5', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' },
  metIcon: { width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' },
  metVal: { fontSize: '28px', fontWeight: '800', marginBottom: '4px' },
  metLabel: { fontSize: '12.5px', color: '#94A3B8', fontWeight: '600' },

  card: { background: '#fff', borderRadius: '16px', padding: '22px', border: '1px solid #F0F2F5', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  cardTitle: { fontSize: '15px', fontWeight: '800', color: '#0F172A' },

  searchInput: { padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontFamily: 'Inter, sans-serif' },
  filterSelect: { padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontFamily: 'Inter, sans-serif', cursor: 'pointer', background: '#fff' },

  tableWrapper: { marginTop: '14px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  tableHeader: { background: '#F8FAFC', borderBottom: '1px solid #E5E7EB' },
  tableRow: { borderBottom: '1px solid #F0F2F5', transition: 'background .2s ease' },
  tableCell: { padding: '12px 14px', color: '#374151', verticalAlign: 'middle' },

  roleBadge: { padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', display: 'inline-block' },
  statusBadge: { padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', display: 'inline-block' },
  verifyBadge: { padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', display: 'inline-block' },
  typeBadge: { padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', display: 'inline-block', background: '#EFF6FF', color: '#2563EB' },

  actionBtn: { padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all .2s ease' },

  empty: { textAlign: 'center', padding: '60px 20px', color: '#94A3B8' },
  emptyIcon: { fontSize: '48px', marginBottom: '12px' },
  emptyText: { fontSize: '14px', fontWeight: '700', color: '#64748B' },

  reportBox: { background: '#F8FAFC', border: '1px solid #F0F2F5', borderRadius: '12px', padding: '20px' },
  exportBtn: { width: '100%', padding: '12px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all .2s ease' }
}
