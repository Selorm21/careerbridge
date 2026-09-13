// src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import {
  LayoutGrid, Users, Briefcase, Plus, Check, Download, Shield, Trash2,
  Search, TrendingUp, AlertCircle, Building2
} from 'lucide-react'
import DashboardShell from '../components/DashboardShell'

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
  const [fetching, setFetching] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function getData() {
      setFetching(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setFetching(false); return }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)

      const { data: usersData } = await supabase.from('profiles').select('*')
      setUsers(usersData || [])

      const { data: jobsData } = await supabase.from('jobs').select('*, employer:profiles(*)')
      setJobs(jobsData || [])

      const { data: appsData } = await supabase.from('applications').select('*')
      console.log('[Admin] Loaded applications:', appsData?.length ?? 0, appsData)
      setApplications(appsData || [])

      setCompanies((usersData || []).filter(u => u.role === 'employer'))
      setFetching(false)
    }
    getData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  // Robust count: compares as strings to survive UUID vs number mismatches
  const countAppsForJob = (jobId) =>
    applications.filter(a => String(a.job_id) === String(jobId)).length

  async function handlePromoteToCoordinator(userId) {
    setLoading(true)
    const { error } = await supabase.from('profiles').update({ role: 'coordinator' }).eq('id', userId)
    if (error) alert('Could not promote user: ' + error.message)
    else setUsers(users.map(u => u.id === userId ? { ...u, role: 'coordinator' } : u))
    setLoading(false)
  }

  async function handleToggleSuspend(user) {
    const newStatus = !user.suspended
    const action = newStatus ? 'suspend' : 'unsuspend'
    if (!window.confirm(`Are you sure you want to ${action} ${user.full_name || user.email}?`)) return
    setLoading(true)
    const { error } = await supabase.from('profiles').update({ suspended: newStatus }).eq('id', user.id)
    if (error) alert(`Could not ${action} user: ${error.message}`)
    else setUsers(prev => prev.map(u => u.id === user.id ? { ...u, suspended: newStatus } : u))
    setLoading(false)
  }

  async function handleDeleteUser(userId) {
    if (!window.confirm('Delete this user? Their jobs and applications will also be removed. This cannot be undone.')) return
    setLoading(true)
    try {
      await supabase.from('applications').delete().eq('student_id', userId)
      await supabase.from('jobs').delete().eq('employer_id', userId)
      const { error } = await supabase.from('profiles').delete().eq('id', userId)
      if (error) { alert('Could not delete user: ' + error.message); setLoading(false); return }
      setUsers(prev => prev.filter(u => u.id !== userId))
      setCompanies(prev => prev.filter(u => u.id !== userId))
    } catch (err) {
      console.error(err)
      alert('Unexpected error while deleting.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCompany(companyId) {
    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({ verified: true })
      .eq('id', companyId)

    if (error) {
      alert(
        'Could not verify company: ' + error.message +
        '\n\nThis usually means:\n• The "verified" column is missing on profiles\n• RLS is blocking the update'
      )
      setLoading(false)
      return
    }

    // Update both lists so the UI reflects the change everywhere
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, verified: true } : c))
    setUsers(prev => prev.map(u => u.id === companyId ? { ...u, verified: true } : u))
    setLoading(false)
  }

  async function handleDeleteJob(jobId) {
    if (!window.confirm('Delete this job? Related applications will also be removed.')) return
    setLoading(true)
    await supabase.from('applications').delete().eq('job_id', jobId)
    const { error } = await supabase.from('jobs').delete().eq('id', jobId)
    if (error) alert('Could not delete job: ' + error.message)
    else setJobs(jobs.filter(j => j.id !== jobId))
    setLoading(false)
  }

  async function exportToCSV() {
    const data = {
      users: users.map(u => ({ name: u.full_name, email: u.email, role: u.role, suspended: u.suspended, verified: u.verified })),
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
    ? users.filter(u =>
        (u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
         u.email?.toLowerCase().includes(search.toLowerCase())) &&
        (filter === 'all' || u.role === filter)
      )
    : users.filter(u => filter === 'all' || u.role === filter)

  const totalUsers = users.length
  const totalStudents = users.filter(u => u.role === 'student').length
  const totalEmployers = users.filter(u => u.role === 'employer').length
  const totalCoordinators = users.filter(u => u.role === 'coordinator').length
  const totalJobs = jobs.length
  const totalApplications = applications.length
  const offers = applications.filter(a => a.status === 'offer').length
  const placementRate = totalApplications > 0 ? Math.round((offers / totalApplications) * 100) : 0

  const metrics = [
    { label: 'Total Users', val: totalUsers, color: '#EA4E1B', bg: 'rgba(234,78,27,.1)', icon: Users, sub: `${totalStudents} students · ${totalEmployers} employers` },
    { label: 'Jobs Posted', val: totalJobs, color: '#EC4899', bg: 'rgba(236,72,153,.1)', icon: Briefcase, sub: `${companies.length} companies hiring` },
    { label: 'Applications', val: totalApplications, color: '#F59E0B', bg: 'rgba(245,158,11,.1)', icon: LayoutGrid, sub: `Avg ${totalJobs ? Math.round(totalApplications / totalJobs) : 0} per job` },
    { label: 'Offers Made', val: offers, color: '#10B981', bg: 'rgba(16,185,129,.1)', icon: Check, sub: `${placementRate}% placement rate` },
  ]

  const navItems = [
    { label: 'Overview', icon: <LayoutGrid size={18} />, active: activeTab === 'overview', onClick: () => setActiveTab('overview') },
    { label: 'Users', icon: <Users size={18} />, badge: users.length, active: activeTab === 'users', onClick: () => setActiveTab('users') },
    { label: 'Companies', icon: <Briefcase size={18} />, badge: companies.length, active: activeTab === 'companies', onClick: () => setActiveTab('companies') },
    { label: 'Jobs', icon: <Plus size={18} />, badge: jobs.length, active: activeTab === 'jobs', onClick: () => setActiveTab('jobs') },
    { label: 'Reports', icon: <Download size={18} />, active: activeTab === 'reports', onClick: () => setActiveTab('reports') },
  ]

  const tabTitles = {
    overview: { title: 'Overview', sub: 'A high-level view of platform health and activity.' },
    users: { title: 'Users', sub: 'Manage every account on the platform — students, employers, and coordinators.' },
    companies: { title: 'Companies', sub: 'Review and verify employer accounts on the platform.' },
    jobs: { title: 'Jobs', sub: 'All posted opportunities across the platform.' },
    reports: { title: 'Reports', sub: 'Platform-wide metrics and data export.' },
  }

  const page = tabTitles[activeTab] || tabTitles.overview

  return (
    <DashboardShell
      brandLabel="ADMIN"
      accent="#EA4E1B"
      navItems={navItems}
      profile={{ full_name: profile?.full_name || 'Admin', role_label: 'Administrator' }}
      onLogout={handleLogout}
      logoMark={<Shield size={20} color="#fff" />}
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-up">
        {/* PAGE HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-[11px] font-bold uppercase tracking-wider mb-3">
              <Shield size={12} /> Administrator
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{page.title}</h1>
            <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">{page.sub}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              <Download size={14} /> Export Data
            </button>
          </div>
        </header>

        {/* LOADING */}
        {fetching ? (
          <div className="flex items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin" />
            <span className="text-sm text-slate-500 font-medium">Loading platform data...</span>
          </div>
        ) : (
          <>
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {metrics.map((m, i) => (
                    <div
                      key={i}
                      className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle hover:shadow-md hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: m.bg, color: m.color }}
                        >
                          <m.icon size={18} />
                        </div>
                        <TrendingUp size={14} className="text-slate-300 group-hover:text-emerald-500 transition" />
                      </div>
                      <div className="text-3xl font-black leading-none" style={{ color: m.color }}>
                        {m.val}
                      </div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-2">{m.label}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{m.sub}</div>
                    </div>
                  ))}
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-subtle">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Platform Placement Rate</h3>
                        <p className="text-xs text-slate-500 mt-1">Percentage of applications that resulted in an offer</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-8">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-baseline gap-3">
                          <div className="text-5xl font-black text-emerald-500">{placementRate}%</div>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            {placementRate >= 50 ? 'Healthy' : placementRate > 0 ? 'Growing' : 'No data'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-3">
                          <strong className="text-slate-800">{offers}</strong> offers · from <strong className="text-slate-800">{totalApplications}</strong> applications
                        </p>
                      </div>

                      <div
                        className="w-32 h-32 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `conic-gradient(#10B981 0deg ${placementRate * 3.6}deg, #F1F5F9 ${placementRate * 3.6}deg)` }}
                      >
                        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-xl font-black text-emerald-500 shadow-inner">
                          {placementRate}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle">
                    <h3 className="text-base font-bold text-slate-900 mb-1">User Breakdown</h3>
                    <p className="text-xs text-slate-500 mb-5">Active accounts by role</p>

                    <div className="space-y-3">
                      {[
                        { label: 'Students', val: totalStudents, color: '#3B82F6' },
                        { label: 'Employers', val: totalEmployers, color: '#8B5CF6' },
                        { label: 'Coordinators', val: totalCoordinators, color: '#EA4E1B' },
                      ].map((r, i) => {
                        const pct = totalUsers > 0 ? Math.round((r.val / totalUsers) * 100) : 0
                        return (
                          <div key={i}>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-bold text-slate-700">{r.label}</span>
                              <span className="text-slate-500">{r.val} <span className="text-slate-400">({pct}%)</span></span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: r.color }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xl font-black text-slate-900">{companies.length}</div>
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Companies</div>
                      </div>
                      <div>
                        <div className="text-xl font-black text-slate-900">{totalJobs}</div>
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Open Jobs</div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* USERS */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:p-6 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">All Users</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{filteredUsers.length} of {users.length} shown</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="relative flex-1 sm:flex-initial min-w-[180px]">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full sm:w-56 pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                    </div>
                    <select
                      value={filter}
                      onChange={e => setFilter(e.target.value)}
                      className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white font-semibold cursor-pointer"
                    >
                      <option value="all">All Roles</option>
                      <option value="student">Students</option>
                      <option value="employer">Employers</option>
                      <option value="coordinator">Coordinators</option>
                    </select>
                  </div>
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="py-16 text-center">
                    <AlertCircle size={32} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-700">No users found</p>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filter.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[820px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 py-4 px-6 whitespace-nowrap">User</th>
                          <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 py-4 px-6 whitespace-nowrap">Role</th>
                          <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 py-4 px-6 whitespace-nowrap">Status</th>
                          <th className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-500 py-4 px-6 whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(user => (
                          <tr key={user.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 text-white flex items-center justify-center text-sm font-black flex-shrink-0">
                                  {(user.full_name || '?').charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 truncate max-w-[240px]">
                                    {user.full_name || 'Unnamed'}
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[240px]">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                  user.role === 'student' ? 'bg-blue-50 text-blue-700'
                                  : user.role === 'employer' ? 'bg-purple-50 text-purple-700'
                                  : 'bg-brand-50 text-brand-700'
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="py-4 px-6 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold">
                                <span className={`w-1.5 h-1.5 rounded-full ${user.suspended ? 'bg-brand-500' : 'bg-emerald-500'}`} />
                                <span className={user.suspended ? 'text-brand-700' : 'text-emerald-700'}>
                                  {user.suspended ? 'Suspended' : 'Active'}
                                </span>
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right whitespace-nowrap">
                              <div className="inline-flex gap-1.5 justify-end">
                                {user.role !== 'coordinator' && (
                                  <button
                                    onClick={() => handlePromoteToCoordinator(user.id)}
                                    disabled={loading}
                                    className="px-2.5 py-1.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold hover:bg-blue-100 transition disabled:opacity-50"
                                  >
                                    Promote
                                  </button>
                                )}
                                <button
                                  onClick={() => handleToggleSuspend(user)}
                                  disabled={loading}
                                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold transition disabled:opacity-50 ${
                                    user.suspended
                                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  }`}
                                >
                                  {user.suspended ? 'Unsuspend' : 'Suspend'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  disabled={loading}
                                  className="px-2.5 py-1.5 rounded-md bg-red-50 text-red-600 text-[11px] font-bold hover:bg-red-100 transition disabled:opacity-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* COMPANIES */}
            {activeTab === 'companies' && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:p-6 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Companies</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {companies.length} employer {companies.length === 1 ? 'account' : 'accounts'} on the platform
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {companies.filter(c => c.verified).length} verified
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      {companies.filter(c => !c.verified).length} pending
                    </span>
                  </div>
                </div>

                {companies.length === 0 ? (
                  <div className="py-16 text-center">
                    <Building2 size={32} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-700">No companies yet</p>
                    <p className="text-xs text-slate-500 mt-1">Employer accounts will appear here once they register.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[820px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 py-4 px-6 whitespace-nowrap">Company</th>
                          <th className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 py-4 px-6 whitespace-nowrap">Jobs Posted</th>
                          <th className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 py-4 px-6 whitespace-nowrap">Applications</th>
                          <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 py-4 px-6 whitespace-nowrap">Status</th>
                          <th className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-500 py-4 px-6 whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {companies.map(company => {
                          const companyJobs = jobs.filter(j => String(j.employer_id) === String(company.id)).length
                          const companyJobIds = jobs.filter(j => String(j.employer_id) === String(company.id)).map(j => String(j.id))
                          const companyApps = applications.filter(a => companyJobIds.includes(String(a.job_id))).length
                          return (
                            <tr key={company.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-400 text-white flex items-center justify-center text-sm font-black flex-shrink-0">
                                    {(company.company_name || company.full_name || '?').charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-slate-900 truncate max-w-[240px]">
                                      {company.company_name || company.full_name || 'Unnamed'}
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[240px]">
                                      {company.email}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-4 px-6 text-center">
                                <span className={`inline-flex items-center justify-center min-w-[36px] px-2.5 py-1 rounded-full text-xs font-black ${
                                  companyJobs > 0 ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-400'
                                }`}>
                                  {companyJobs}
                                </span>
                              </td>

                              <td className="py-4 px-6 text-center">
                                <span className={`inline-flex items-center justify-center min-w-[36px] px-2.5 py-1 rounded-full text-xs font-black ${
                                  companyApps > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                                }`}>
                                  {companyApps}
                                </span>
                              </td>

                              <td className="py-4 px-6 whitespace-nowrap">
                                {company.verified ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Verified
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    Pending
                                  </span>
                                )}
                              </td>

                              <td className="py-4 px-6 text-right whitespace-nowrap">
                                {company.verified ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                                    <Check size={13} /> Approved
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleVerifyCompany(company.id)}
                                    disabled={loading}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold transition disabled:opacity-50 shadow-sm"
                                  >
                                    <Check size={12} /> Verify
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

            {/* JOBS */}
            {activeTab === 'jobs' && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:p-6 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">All Jobs</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} posted across the platform
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    {totalApplications} total application{totalApplications === 1 ? '' : 's'}
                  </span>
                </div>

                {jobs.length === 0 ? (
                  <div className="py-16 text-center">
                    <Briefcase size={32} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-700">No jobs posted</p>
                    <p className="text-xs text-slate-500 mt-1">Employers haven't posted any opportunities yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[960px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 py-4 px-6 whitespace-nowrap">Job Title</th>
                          <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 py-4 px-6 whitespace-nowrap">Company</th>
                          <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 py-4 px-6 whitespace-nowrap">Type</th>
                          <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 py-4 px-6 whitespace-nowrap">Location</th>
                          <th className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 py-4 px-6 whitespace-nowrap">Applications</th>
                          <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 py-4 px-6 whitespace-nowrap">Posted</th>
                          <th className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-500 py-4 px-6 whitespace-nowrap">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map(job => {
                          const jobApps = countAppsForJob(job.id)
                          const postedDate = new Date(job.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })
                          return (
                            <tr key={job.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3 min-w-0">
                                  {job.image_attachment?.url || job.image_url ? (
                                    <img
                                      src={job.image_attachment?.url || job.image_url}
                                      alt=""
                                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                      <Briefcase size={16} className="text-slate-400" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <div className="font-bold text-slate-900 truncate max-w-[260px]">
                                      {job.title}
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-0.5">
                                      ID: {String(job.id).slice(0, 8)}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-4 px-6 text-slate-600 text-xs whitespace-nowrap">
                                {job.company || '—'}
                              </td>

                              <td className="py-4 px-6 whitespace-nowrap">
                                <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700">
                                  {job.type || '—'}
                                </span>
                              </td>

                              <td className="py-4 px-6 text-slate-600 text-xs whitespace-nowrap">
                                {job.location || '—'}
                              </td>

                              <td className="py-4 px-6 text-center">
                                <span
                                  className={`inline-flex items-center justify-center min-w-[36px] px-2.5 py-1 rounded-full text-xs font-black ${
                                    jobApps > 0
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : 'bg-slate-100 text-slate-400'
                                  }`}
                                >
                                  {jobApps}
                                </span>
                              </td>

                              <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                                {postedDate}
                              </td>

                              <td className="py-4 px-6 text-right whitespace-nowrap">
                                <button
                                  onClick={() => handleDeleteJob(job.id)}
                                  disabled={loading}
                                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition disabled:opacity-50"
                                  title="Delete job"
                                  aria-label={`Delete ${job.title}`}
                                >
                                  <Trash2 size={15} />
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

            {/* REPORTS */}
            {activeTab === 'reports' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-subtle">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Platform Summary</h3>
                      <p className="text-xs text-slate-500">Snapshot of the current state</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: 'Total Users', val: totalUsers },
                      { label: 'Students', val: totalStudents },
                      { label: 'Employers', val: totalEmployers },
                      { label: 'Coordinators', val: totalCoordinators },
                      { label: 'Jobs Posted', val: totalJobs },
                      { label: 'Total Applications', val: totalApplications },
                      { label: 'Offers Made', val: offers },
                      { label: 'Placement Rate', val: `${placementRate}%` },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                        <span className="text-xs text-slate-500 font-medium">{row.label}</span>
                        <span className="text-sm font-bold text-slate-900">{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-subtle">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Download size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Data Export</h3>
                      <p className="text-xs text-slate-500">Download a full JSON snapshot</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-5">
                    Export every user, job, and application on the platform as structured JSON. Useful for backups, audits, or migration to another system.
                  </p>

                  <button
                    onClick={exportToCSV}
                    className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold transition shadow-brand active:scale-[0.99] inline-flex items-center justify-center gap-2"
                  >
                    <Download size={15} /> Export All Data
                  </button>

                  <p className="text-[11px] text-slate-400 mt-3 text-center">
                    Filename: careerbridge-export-{new Date().toISOString().split('T')[0]}.json
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  )
}