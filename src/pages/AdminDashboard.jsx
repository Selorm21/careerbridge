import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

// ============================================================
// PREMIUM ICON SYSTEM
// ============================================================
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
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate()

  // ==========================================================
  // LOAD DATA
  // ==========================================================
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

  async function handleLogout() { await supabase.auth.signOut(); navigate('/') }

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
    if (!error) setUsers(users.map(u => u.id === userId ? { ...u, role: 'coordinator' } : u))
    setLoading(false)
  }

  async function handleSuspendUser(userId) {
    setLoading(true)
    const { error } = await supabase.from('profiles').update({ suspended: true }).eq('id', userId)
    if (!error) setUsers(users.map(u => u.id === userId ? { ...u, suspended: true } : u))
    setLoading(false)
  }

  async function handleDeleteUser(userId) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setLoading(true)
      const { error } = await supabase.from('profiles').delete().eq('id', userId)
      if (!error) setUsers(users.filter(u => u.id !== userId))
      setLoading(false)
    }
  }

  async function handleVerifyCompany(companyId) {
    setLoading(true)
    const { error } = await supabase.from('profiles').update({ verified: true }).eq('id', companyId)
    if (!error) setCompanies(companies.map(c => c.id === companyId ? { ...c, verified: true } : c))
    setLoading(false)
  }

  async function handleDeleteJob(jobId) {
    if (confirm('Delete this job?')) {
      setLoading(true)
      const { error } = await supabase.from('jobs').delete().eq('id', jobId)
      if (!error) setJobs(jobs.filter(j => j.id !== jobId))
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
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes pulseGlow{0%,100%{opacity:0.3}50%{opacity:0.6}}
        @keyframes cbFloat{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(15px,-10px,0) scale(1.04)}}
        @keyframes fadeIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        
        .pageIn{animation:fadeUp .6s cubic-bezier(.16,1,.3,1) forwards}
        .glowPulse{animation:pulseGlow 6s ease-in-out infinite}
        
        .sideBtn{transition:all .2s ease;cursor:pointer; border-radius: 12px;}
        .sideBtn:hover{background:rgba(234,78,27,0.06)!important; color:#EA4E1B;}
        .sideBtn.active{background:rgba(234,78,27,0.12)!important;color:#0F172A!important}
        
        .logoutBtn{transition:all .2s ease; border-radius: 12px;}
        .logoutBtn:hover{background:rgba(234,78,27,0.06)!important;color:#EA4E1B!important}
        
        .metCard{transition:all 0.3s cubic-bezier(.34,1.56,.64,1)}
        .metCard:hover{transform:translateY(-4px) scale(1.02);box-shadow:0 20px 40px rgba(234,78,27,0.08)!important;border-color:#EA4E1B!important;}
        
        .actionBtn{transition:all 0.2s cubic-bezier(.34,1.56,.64,1)}
        .actionBtn:hover{transform:translateY(-1px) scale(1.05);}
        
        .row{transition:all .2s ease; cursor: default;}
        .row:hover{background:rgba(234,78,27,0.03)!important}
        .row:last-child{border-bottom:none}
        
        @media(max-width:1024px){.main{margin-left: 80px !important;}}
        @media(max-width:768px){.main{padding:20px 16px!important}.metricsRow{grid-template-columns:1fr 1fr!important}}
      `}</style>

      {/* 🌟 Red Ambient Glowing Background */}
      <div style={S.bgEffects}>
        <div style={S.glowOrb1} className="glowPulse" />
        <div style={S.glowOrb2} className="glowPulse" />
        <div style={S.gridPattern} />
      </div>

      <div style={S.layout}>
        {/* ======================================================
            FLOATING GLASS SIDEBAR (LIGHT THEME, RED ACCENTS)
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
            <div style={S.logoRow}>
              <div style={S.logoMark}><Icon path={icons.grid} size={20} /></div>
              {isHovered && <span style={S.logoText}>CareerBridge</span>}
            </div>
            
            <div style={S.avatarWrap}>
              <div style={S.avatar}>{profile?.full_name?.charAt(0) || 'A'}</div>
              {isHovered && (
                <div>
                  <div style={S.avatarName}>{profile?.full_name || 'Admin'}</div>
                  <div style={S.avatarRole}>Administrator</div>
                </div>
              )}
            </div>
            {isHovered && <div style={S.divider} />}
          </div>

          <nav style={S.sideNav}>
            {[
              { id: 'overview', icon: icons.grid, label: 'Overview' },
              { id: 'users', icon: icons.users, label: 'Users', count: users.length },
              { id: 'companies', icon: icons.briefcase, label: 'Companies', count: companies.length },
              { id: 'jobs', icon: icons.plus, label: 'Jobs', count: jobs.length },
              { id: 'reports', icon: icons.download, label: 'Reports' },
            ].map(item => {
              const isActive = activeTab === item.id
              return (
                <div 
                  key={item.id}
                  className={`sideBtn ${isActive ? 'active' : ''}`}
                  style={{
                    ...S.sideNavItem,
                    background: isActive ? 'rgba(234,78,27,0.12)' : 'transparent',
                    justifyContent: isHovered ? 'flex-start' : 'center',
                    padding: isHovered ? '0 16px' : '0',
                  }} 
                  onClick={() => setActiveTab(item.id)}
                >
                  <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon path={item.icon} size={18} color={isActive ? '#EA4E1B' : '#94A3B8'} />
                  </div>
                  {isHovered && (
                    <span style={{ ...S.navLabel, color: isActive ? '#0F172A' : '#94A3B8', fontWeight: isActive ? '700' : '500', marginLeft: '12px', whiteSpace: 'nowrap' }}>
                      {item.label}
                    </span>
                  )}
                  {isHovered && item.count !== undefined && item.count > 0 && (
                    <span style={{ ...S.badge, marginLeft: 'auto', background: isActive ? 'rgba(234,78,27,0.2)' : '#F1F5F9', color: isActive ? '#EA4E1B' : '#64748B' }}>
                      {item.count}
                    </span>
                  )}
                  {isActive && <div style={S.activeIndicator} />}
                </div>
              )
            })}
          </nav>

          <div style={S.bottomSection}>
            {isHovered && <div style={S.divider} />}
            <div className="logoutBtn" style={{
              ...S.logoutBtn,
              justifyContent: isHovered ? 'flex-start' : 'center',
              padding: isHovered ? '0 16px' : '0',
            }} onClick={handleLogout}>
              <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon path={icons.logout} size={18} color="#94A3B8" />
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
              <h1 style={S.heading}>Admin Dashboard</h1>
              <p style={S.headSub}>Platform overview and management</p>
            </div>
          </div>

          {/* ---------- OVERVIEW TAB ---------- */}
          {activeTab === 'overview' && (
            <>
              <div className="metricsRow" style={S.metricsRow}>
                {[
                  { label: 'Total Users', val: totalUsers, color: '#EA4E1B', bg: 'rgba(234,78,27,0.1)', icon: icons.users },
                  { label: 'Students', val: totalStudents, color: '#3B82F6', bg: 'rgba(37,99,235,0.1)', icon: icons.users },
                  { label: 'Employers', val: totalEmployers, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', icon: icons.briefcase },
                  { label: 'Total Jobs', val: totalJobs, color: '#EC4899', bg: 'rgba(236,72,153,0.1)', icon: icons.plus },
                  { label: 'Applications', val: totalApplications, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: icons.grid },
                  { label: 'Offers Made', val: offers, color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: icons.check },
                ].map((m, i) => (
                  <div key={i} className="metCard" style={{...S.metCard, borderTop: `4px solid ${m.color}`}}>
                    <div style={{...S.metIcon, background: m.bg, color: m.color}}><Icon path={m.icon} size={18} /></div>
                    <div style={{...S.metVal, color: m.color}}>{m.val}</div>
                    <div style={S.metLabel}>{m.label}</div>
                  </div>
                ))}
              </div>
              <div className="pageIn" style={{...S.card, marginTop: '20px'}}>
                <div style={S.cardHead}>
                  <div style={S.cardTitle}>Platform Placement Rate</div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                  <div style={{flex: 1}}>
                    <div style={{fontSize: '48px', fontWeight: '900', color: '#10B981'}}>{placementRate}%</div>
                    <div style={{fontSize: '13px', color: '#94A3B8', marginTop: '4px'}}>{offers} offers out of {totalApplications} applications</div>
                  </div>
                  <div style={{width: '120px', height: '120px', borderRadius: '50%', background: `conic-gradient(#10B981 0deg ${placementRate * 3.6}deg, #E2E8F0 ${placementRate * 3.6}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div style={{width: '100px', height: '100px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: '#10B981'}}>{placementRate}%</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ---------- USERS TAB ---------- */}
          {activeTab === 'users' && (
            <div className="pageIn" style={S.card}>
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
                      <tr key={user.id} className="row" style={S.tableRow}>
                        <td style={S.tableCell}><span style={{fontWeight: '700', color: '#0F172A'}}>{user.full_name}</span></td>
                        <td style={S.tableCell}><span style={{fontSize: '13px', color: '#64748B'}}>{user.email}</span></td>
                        <td style={S.tableCell}>
                          <span style={{...S.roleBadge, background: user.role === 'student' ? 'rgba(37,99,235,0.1)' : user.role === 'employer' ? 'rgba(139,92,246,0.1)' : 'rgba(234,78,27,0.1)', color: user.role === 'student' ? '#2563EB' : user.role === 'employer' ? '#8B5CF6' : '#EA4E1B'}}>
                            {user.role}
                          </span>
                        </td>
                        <td style={S.tableCell}>
                          <span style={{...S.statusBadge, background: user.suspended ? 'rgba(234,78,27,0.1)' : 'rgba(16,185,129,0.1)', color: user.suspended ? '#EA4E1B' : '#10B981'}}>
                            {user.suspended ? '🚫 Suspended' : '✓ Active'}
                          </span>
                        </td>
                        <td style={{...S.tableCell, textAlign: 'center'}}>
                          <div style={{display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap'}}>
                            {user.role !== 'coordinator' && (
                              <button className="actionBtn" style={{...S.actionBtn, background: 'rgba(37,99,235,0.1)', color: '#2563EB'}} onClick={() => handlePromoteToCoordinator(user.id)} disabled={loading}>
                                Promote
                              </button>
                            )}
                            <button className="actionBtn" style={{...S.actionBtn, background: 'rgba(245,158,11,0.1)', color: '#D97706'}} onClick={() => handleSuspendUser(user.id)} disabled={loading}>
                              Suspend
                            </button>
                            <button className="actionBtn" style={{...S.actionBtn, background: 'rgba(234,78,27,0.1)', color: '#EA4E1B'}} onClick={() => handleDeleteUser(user.id)} disabled={loading}>
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

          {/* ---------- COMPANIES TAB ---------- */}
          {activeTab === 'companies' && (
            <div className="pageIn" style={S.card}>
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
                          <tr key={company.id} className="row" style={S.tableRow}>
                            <td style={S.tableCell}><span style={{fontWeight: '700'}}>{company.company_name || company.full_name}</span></td>
                            <td style={S.tableCell}><span style={{fontSize: '13px', color: '#64748B'}}>{company.email}</span></td>
                            <td style={{...S.tableCell, textAlign: 'center'}}>{companyJobs}</td>
                            <td style={{...S.tableCell, textAlign: 'center'}}>{companyApps}</td>
                            <td style={{...S.tableCell, textAlign: 'center'}}>
                              <span style={{...S.verifyBadge, background: company.verified ? 'rgba(16,185,129,0.1)' : 'rgba(139,92,246,0.1)', color: company.verified ? '#10B981' : '#8B5CF6'}}>
                                {company.verified ? '✓ Verified' : 'Unverified'}
                              </span>
                            </td>
                            <td style={{...S.tableCell, textAlign: 'center'}}>
                              {!company.verified && (
                                <button className="actionBtn" style={{...S.actionBtn, background: 'rgba(16,185,129,0.1)', color: '#10B981'}} onClick={() => handleVerifyCompany(company.id)} disabled={loading}>
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

          {/* ---------- JOBS TAB ---------- */}
          {activeTab === 'jobs' && (
            <div className="pageIn" style={S.card}>
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
                          <tr key={job.id} className="row" style={S.tableRow}>
                            <td style={S.tableCell}><span style={{fontWeight: '700'}}>{job.title}</span></td>
                            <td style={S.tableCell}>{job.company}</td>
                            <td style={S.tableCell}><span style={{...S.typeBadge, background: 'rgba(37,99,235,0.1)', color: '#2563EB'}}>{job.type}</span></td>
                            <td style={S.tableCell}>{job.location}</td>
                            <td style={{...S.tableCell, textAlign: 'center', fontWeight: '700'}}>{jobApps}</td>
                            <td style={S.tableCell}>{new Date(job.created_at).toLocaleDateString()}</td>
                            <td style={{...S.tableCell, textAlign: 'center'}}>
                              <button className="actionBtn" style={{...S.actionBtn, background: 'rgba(234,78,27,0.1)', color: '#EA4E1B'}} onClick={() => handleDeleteJob(job.id)} disabled={loading}>
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

          {/* ---------- REPORTS TAB ---------- */}
          {activeTab === 'reports' && (
            <div className="pageIn" style={S.card}>
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

// ============================================================
// 🎨 PREMIUM LIGHT / RED ACCENT STYLES
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
  glowOrb1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(234, 78, 27, 0.08), transparent 70%)',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: '-20%',
    left: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(37, 99, 235, 0.05), transparent 70%)',
  },
  gridPattern: {
    position: 'absolute',
    inset: 0,
    opacity: 0.35,
    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(15,23,42,.035) 1px, transparent 0)',
    backgroundSize: '34px 34px',
  },

  layout: { display: 'grid', gridTemplateColumns: '1fr', minHeight: '100vh', position: 'relative', zIndex: 1 },
  
  // Light Glass Sidebar
  sidebar: { 
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 32px)',
    minHeight: 0,
    boxSizing: 'border-box',
    margin: '16px 0 16px 16px',
    padding: '20px 10px 12px',
    background: 'linear-gradient(145deg, rgba(255,255,255,0.8), rgba(255,255,255,0.6))',
    backdropFilter: 'blur(30px) saturate(150%)',
    WebkitBackdropFilter: 'blur(30px) saturate(150%)',
    border: '1px solid rgba(234,78,27,0.1)',
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
  logoMark: { width: '46px', height: '46px', minWidth: '46px', borderRadius: '15px', background: 'linear-gradient(135deg, #EA4E1B 0%, #F97316 45%, #EA4E1B 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px rgba(234,78,27,.3)' },
  logoText: { fontSize: '20px', lineHeight: 1, fontWeight: '800', letterSpacing: '-.7px', color: '#0F172A', whiteSpace: 'nowrap', animation: 'fadeIn .25s ease forwards' },
  avatarWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px', width: '100%', padding: '0 4px' },
  avatar: { width: '40px', height: '40px', minWidth: '40px', borderRadius: '14px', background: 'linear-gradient(135deg, #EA4E1B, #F97316)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800', flexShrink: 0 },
  avatarName: { fontSize: '14px', fontWeight: '700', color: '#0F172A' },
  avatarRole: { fontSize: '12px', color: '#64748B', fontWeight: '500' },
  divider: { height: '1px', background: 'rgba(226,232,240,0.4)', margin: '10px 0' },
  
  sideNav: { display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 auto', minHeight: 0, overflowY: 'auto', overflowX: 'hidden', width: '100%', padding: '0 6px' },
  sideNavItem: { display: 'flex', alignItems: 'center', width: '100%', height: '48px', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative' },
  navLabel: { fontSize: '14px', lineHeight: '1', animation: 'fadeIn .25s ease forwards' },
  activeIndicator: { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '4px', height: '20px', borderRadius: '4px', background: '#EA4E1B', boxShadow: '0 0 12px rgba(234,78,27,0.3)' },
  badge: { fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', transition: 'all .2s ease' },
  
  bottomSection: { width: '100%', marginTop: 'auto', paddingTop: '8px', flexShrink: 0, padding: '0 8px' },
  logoutBtn: { display: 'flex', alignItems: 'center', width: '100%', height: '48px', borderRadius: '14px', cursor: 'pointer', color: '#64748B', fontWeight: '600', transition: 'all 0.2s ease' },

  // Main Content
  main: { transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', padding: '32px 40px', overflowY: 'auto', minHeight: '100vh' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  heading: { fontSize: '28px', fontWeight: '900', color: '#0F172A', marginBottom: '4px', letterSpacing: '-1px' },
  headSub: { fontSize: '15px', color: '#64748B' },
  
  // Metrics
  metricsRow: { display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '14px', marginBottom: '32px' },
  metCard: { background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', borderRadius: '16px', padding: '18px', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 20px rgba(15,23,42,0.03)' },
  metIcon: { width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' },
  metVal: { fontSize: '28px', fontWeight: '800', marginBottom: '4px' },
  metLabel: { fontSize: '12.5px', color: '#64748B', fontWeight: '600' },
  
  // Grid & Cards
  card: { background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 20px rgba(15,23,42,0.03)' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  cardTitle: { fontSize: '16px', fontWeight: '800', color: '#0F172A' },
  
  // Tables
  tableWrapper: { marginTop: '14px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  tableHeader: { background: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(226,232,240,0.4)' },
  tableRow: { borderBottom: '1px solid rgba(226,232,240,0.3)', transition: 'background .2s ease' },
  tableCell: { padding: '12px 14px', color: '#1E293B', verticalAlign: 'middle' },

  // Badges & Buttons
  roleBadge: { padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', display: 'inline-block' },
  statusBadge: { padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', display: 'inline-block' },
  verifyBadge: { padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', display: 'inline-block' },
  typeBadge: { padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', display: 'inline-block' },
  actionBtn: { padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all .2s ease' },
  searchInput: { padding: '10px 12px', border: '1px solid rgba(226,232,240,0.6)', borderRadius: '8px', fontSize: '13px', fontFamily: 'Inter, sans-serif', background: 'rgba(255,255,255,0.6)' },
  filterSelect: { padding: '10px 12px', border: '1px solid rgba(226,232,240,0.6)', borderRadius: '8px', fontSize: '13px', fontFamily: 'Inter, sans-serif', cursor: 'pointer', background: '#fff' },

  // Empty
  empty: { textAlign: 'center', padding: '60px 20px', color: '#94A3B8' },
  emptyIcon: { fontSize: '48px', marginBottom: '12px' },
  emptyText: { fontSize: '14px', fontWeight: '700', color: '#64748B' },

  // Reports
  reportBox: { background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(226,232,240,0.4)', borderRadius: '12px', padding: '20px' },
  exportBtn: { width: '100%', padding: '12px', background: '#EA4E1B', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all .2s ease' }
}