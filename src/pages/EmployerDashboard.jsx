// src/pages/CoordinatorDashboard.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import {
  LayoutGrid, Users, Briefcase, Plus, Trophy, Download,
  ChevronRight, Star, Target, FileText
} from 'lucide-react'
import DocumentVerification from '../components/DocumentVerification'

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
      if (!user) return

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

  const metrics = [
    { label: 'Total Students', val: students.length, color: '#2563EB', bg: '#EFF6FF', icon: Users },
    { label: 'Total Employers', val: employers.length, color: '#7C3AED', bg: '#F5F3FF', icon: Briefcase },
    { label: 'Applications', val: applications.length, color: '#D97706', bg: '#FFFBEB', icon: Plus },
    { label: 'Placements', val: applications.filter(a => a.status === 'offer').length, color: '#10B981', bg: '#ECFDF5', icon: Trophy },
    { label: 'Interviews', val: applications.filter(a => a.status === 'interview').length, color: '#0891B2', bg: '#ECFEFF', icon: Target },
    { label: 'Placement Rate', val: `${placementRate}%`, color: '#10B981', bg: '#ECFDF5', icon: Star },
  ]

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'students', label: `Students (${students.length})` },
    { id: 'employers', label: `Employers (${employers.length})` },
    { id: 'placements', label: `Placements (${applications.filter(a => a.status === 'offer').length})` },
    { id: 'documents', label: 'Documents' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-up space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            University Coordinator Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">Monitor student placements and employer activity</p>
        </div>
        <button
          onClick={exportToCSV}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm whitespace-nowrap active:scale-95 transition"
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-subtle" style={{ borderTop: `3px solid ${m.color}` }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: m.bg, color: m.color }}>
              <m.icon size={17} />
            </div>
            <div className="text-2xl font-black" style={{ color: m.color }}>{m.val}</div>
            <div className="text-[11px] text-slate-500 font-semibold mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === t.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Recent Placements</h3>
              <button
                onClick={() => setActiveTab('placements')}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                View all <ChevronRight size={13} />
              </button>
            </div>

            {applications.filter(a => a.status === 'offer').slice(0, 5).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">📭 No placements yet</div>
            ) : (
              applications.filter(a => a.status === 'offer').slice(0, 5).map(app => (
                <div key={app.id} className="flex items-center justify-between gap-3 py-3 border-b border-slate-100 last:border-b-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 text-white flex items-center justify-center text-sm font-black flex-shrink-0">
                      {app.profiles?.full_name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{app.profiles?.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{app.jobs?.title} at {app.jobs?.company}</p>
                    </div>
                  </div>
                  <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 whitespace-nowrap">
                    ✓ Offer
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Recently Registered Students</h3>
              <button
                onClick={() => setActiveTab('students')}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                View all <ChevronRight size={13} />
              </button>
            </div>

            {students.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-b-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 text-white flex items-center justify-center text-sm font-black flex-shrink-0">
                  {s.full_name?.charAt(0) || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{s.full_name || 'Unknown Student'}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {s.course || 'No course set'} · {s.university || 'No university set'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Students */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">All Students ({students.length})</h3>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              <Download size={13} /> Export
            </button>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr>
                  {['Name', 'Email', 'University', 'Course', 'Index', 'Skills', 'Apps', 'Status'].map(h => (
                    <th key={h} className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 pb-3 border-b border-slate-200 whitespace-nowrap pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const studentApps = applications.filter(a => a.student_id === s.id)
                  const bestStatus = studentApps.find(a => a.status === 'offer')?.status
                    || studentApps.find(a => a.status === 'interview')?.status
                    || studentApps[0]?.status
                    || 'No applications'
                  const badgeStyle =
                    bestStatus === 'offer' ? 'bg-emerald-50 text-emerald-700'
                    : bestStatus === 'interview' ? 'bg-amber-50 text-amber-700'
                    : bestStatus === 'applied' ? 'bg-blue-50 text-blue-700'
                    : 'bg-slate-100 text-slate-600'
                  return (
                    <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-3 pr-4 font-bold text-slate-900">{s.full_name || 'Unknown'}</td>
                      <td className="py-3 pr-4 text-slate-600 text-xs">{s.email || '-'}</td>
                      <td className="py-3 pr-4 text-slate-600 text-xs">{s.university || '-'}</td>
                      <td className="py-3 pr-4 text-slate-600 text-xs">{s.course || '-'}</td>
                      <td className="py-3 pr-4 text-slate-600 text-xs">{s.index_number || '-'}</td>
                      <td className="py-3 pr-4 text-slate-600 text-xs">{s.skills ? s.skills.split(',').slice(0, 3).join(', ') : '-'}</td>
                      <td className="py-3 pr-4 text-center font-bold text-slate-700">{studentApps.length}</td>
                      <td className="py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${badgeStyle}`}>
                          {bestStatus}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Employers */}
      {activeTab === 'employers' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle">
          <h3 className="text-sm font-bold text-slate-900 mb-4">All Employers ({employers.length})</h3>
          {employers.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">🏢 No employers yet</div>
          ) : (
            employers.map(e => {
              const employerJobs = jobs.filter(j => j.employer_id === e.id)
              const employerApps = applications.filter(a => employerJobs.some(j => j.id === a.job_id))
              return (
                <div key={e.id} className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-slate-100 last:border-b-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-400 text-white flex items-center justify-center text-sm font-black flex-shrink-0">
                      {e.full_name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{e.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{e.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    {[
                      { val: employerJobs.length, label: 'Jobs' },
                      { val: employerApps.length, label: 'Apps' },
                      { val: employerApps.filter(a => a.status === 'offer').length, label: 'Offers', color: '#10B981' },
                    ].map((s, i) => (
                      <div key={i} className="text-center">
                        <div className="text-lg font-black" style={s.color ? { color: s.color } : { color: '#0F172A' }}>{s.val}</div>
                        <div className="text-[11px] text-slate-500 font-semibold">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Placements */}
      {activeTab === 'placements' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              All Placements ({applications.filter(a => a.status === 'offer').length})
            </h3>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              <Download size={13} /> Export
            </button>
          </div>

          {applications.filter(a => a.status === 'offer').length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">📭 No placements yet</div>
          ) : (
            applications.filter(a => a.status === 'offer').map(app => (
              <div key={app.id} className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-slate-100 last:border-b-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 text-white flex items-center justify-center text-sm font-black flex-shrink-0">
                    {app.profiles?.full_name?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{app.profiles?.full_name}</p>
                    <p className="text-xs text-slate-500 truncate">{app.profiles?.course} · {app.profiles?.university}</p>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">{app.jobs?.title}</p>
                  <p className="text-xs text-slate-500 truncate">{app.jobs?.company} · {app.jobs?.location}</p>
                </div>
                <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 whitespace-nowrap">
                  ✓ Placed
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Documents */}
      {activeTab === 'documents' && <DocumentVerification />}
    </div>
  )
}