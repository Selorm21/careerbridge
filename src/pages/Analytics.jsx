import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'

export default function Analytics() {
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchData() {
      const [{ data: apps }, { data: jobsData }, { data: profilesData }] = await Promise.all([
        supabase.from('applications').select('*, jobs(*), profiles(*)'),
        supabase.from('jobs').select('*'),
        supabase.from('profiles').select('*')
      ])
      setApplications(apps || [])
      setJobs(jobsData || [])
      setProfiles(profilesData || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  // Applications by status
  const statusData = [
    { name: 'Applied', value: applications.filter(a => a.status === 'applied').length, color: '#2563EB' },
    { name: 'Interview', value: applications.filter(a => a.status === 'interview').length, color: '#D97706' },
    { name: 'Offer', value: applications.filter(a => a.status === 'offer').length, color: '#059669' },
    { name: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, color: '#DC2626' },
  ].filter(d => d.value > 0)

  // Top companies by applications
  const companyCounts = {}
  applications.forEach(app => {
    const company = app.jobs?.company || 'Unknown'
    companyCounts[company] = (companyCounts[company] || 0) + 1
  })
  const companyData = Object.entries(companyCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  // Most in-demand skills
  const skillCounts = {}
  jobs.forEach(job => {
    job.skills?.split(',').forEach(s => {
      const skill = s.trim().toLowerCase()
      if (skill) skillCounts[skill] = (skillCounts[skill] || 0) + 1
    })
  })
  const skillData = Object.entries(skillCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // Job types breakdown
  const typeCounts = {}
  jobs.forEach(job => {
    const types = job.type?.split(',') || ['Unknown']
    types.forEach(t => {
      const type = t.trim()
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })
  })
  const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }))

  // Applications over time (by month)
  const monthCounts = {}
  applications.forEach(app => {
    const month = new Date(app.created_at).toLocaleDateString('en', { month: 'short', year: '2-digit' })
    monthCounts[month] = (monthCounts[month] || 0) + 1
  })
  const timeData = Object.entries(monthCounts).map(([month, count]) => ({ month, count }))

  const COLORS = ['#2563EB', '#D97706', '#059669', '#DC2626', '#7C3AED', '#0891B2']

  const students = profiles.filter(p => p.role === 'student').length
  const employers = profiles.filter(p => p.role === 'employer').length
  const placementRate = applications.length > 0
    ? Math.round((applications.filter(a => a.status === 'offer').length / applications.length) * 100)
    : 0

  if (loading) return (
    <div style={S.loadingPage}>
      <div style={S.loadingText}>Loading analytics...</div>
    </div>
  )

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .pageIn{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) forwards}
        .backBtn{transition:all .2s ease}
        .backBtn:hover{background:#EFF6FF!important;color:#2563EB!important}
        @media(max-width:768px){
          .metricsGrid{grid-template-columns:1fr 1fr!important}
          .chartsGrid{grid-template-columns:1fr!important}
          .mainPad{padding:20px 16px!important}
        }
      `}</style>

      <nav style={S.nav}>
        <div style={S.logo}>CareerBridge</div>
        <div style={S.navRight}>
          <button className="backBtn" style={S.backBtn} onClick={() => navigate('/employer')}>← Employer Dashboard</button>
          <button className="backBtn" style={S.backBtn} onClick={() => navigate('/student')}>Student Dashboard</button>
        </div>
      </nav>

      <div className="pageIn mainPad" style={S.main}>
        <div style={S.pageHead}>
          <h1 style={S.heading}>Analytics Dashboard</h1>
          <p style={S.headSub}>Real-time insights across the CareerBridge platform</p>
        </div>

        <div className="metricsGrid" style={S.metricsGrid}>
          {[
            { label: 'Total Students', val: students, icon: '🎓', color: '#2563EB', bg: '#EFF6FF' },
            { label: 'Total Employers', val: employers, icon: '🏢', color: '#059669', bg: '#ECFDF5' },
            { label: 'Total Jobs Posted', val: jobs.length, icon: '💼', color: '#7C3AED', bg: '#F5F3FF' },
            { label: 'Total Applications', val: applications.length, icon: '📤', color: '#D97706', bg: '#FFFBEB' },
            { label: 'Interviews Granted', val: applications.filter(a => a.status === 'interview').length, icon: '🎯', color: '#0891B2', bg: '#ECFEFF' },
            { label: 'Placement Rate', val: `${placementRate}%`, icon: '🏆', color: '#059669', bg: '#ECFDF5' },
          ].map((m, i) => (
            <div key={i} style={{...S.metCard, borderTop: `3px solid ${m.color}`}}>
              <div style={{...S.metIcon, background: m.bg}}>{m.icon}</div>
              <div style={{...S.metVal, color: m.color}}>{m.val}</div>
              <div style={S.metLabel}>{m.label}</div>
            </div>
          ))}
        </div>

        <div className="chartsGrid" style={S.chartsGrid}>
          <div style={S.chartCard}>
            <div style={S.chartTitle}>📊 Applications by Company</div>
            <div style={S.chartSub}>Which companies receive the most applications</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={companyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #F0F2F5', fontSize: '13px' }} />
                <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={S.chartCard}>
            <div style={S.chartTitle}>🎯 Application Status Breakdown</div>
            <div style={S.chartSub}>Current status of all applications</div>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #F0F2F5', fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={S.noData}>No application data yet</div>
            )}
          </div>

          <div style={S.chartCard}>
            <div style={S.chartTitle}>🔥 Most In-Demand Skills</div>
            <div style={S.chartSub}>Skills most requested by employers</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={skillData} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 600 }} width={80} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #F0F2F5', fontSize: '13px' }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Jobs requiring this skill">
                  {skillData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={S.chartCard}>
            <div style={S.chartTitle}>💼 Job Types Distribution</div>
            <div style={S.chartSub}>Breakdown of job types on the platform</div>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {typeData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #F0F2F5', fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={S.noData}>No job data yet</div>
            )}
          </div>
        </div>

        {timeData.length > 1 && (
          <div style={{...S.chartCard, marginTop: '20px'}}>
            <div style={S.chartTitle}>📈 Applications Over Time</div>
            <div style={S.chartSub}>How applications have grown over time</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #F0F2F5', fontSize: '13px' }} />
                <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={3} dot={{ fill: '#2563EB', r: 5 }} name="Applications" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: '#F1F5F9', fontFamily: "'Inter', -apple-system, sans-serif" },
  loadingPage: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' },
  loadingText: { fontSize: '16px', color: '#94A3B8', fontWeight: '600' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 36px', background: '#fff', borderBottom: '1px solid #F0F2F5', position: 'sticky', top: 0, zIndex: 10 },
  logo: { fontSize: '19px', fontWeight: '800', color: '#2563EB', letterSpacing: '-0.5px' },
  navRight: { display: 'flex', gap: '10px' },
  backBtn: { padding: '9px 18px', background: '#F8FAFC', border: '1.5px solid #E5E7EB', borderRadius: '10px', cursor: 'pointer', fontSize: '13.5px', fontWeight: '700', color: '#374151' },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '36px 24px' },
  pageHead: { marginBottom: '28px' },
  heading: { fontSize: '26px', fontWeight: '800', color: '#0F172A', marginBottom: '6px', letterSpacing: '-0.5px' },
  headSub: { fontSize: '14.5px', color: '#94A3B8' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', marginBottom: '24px' },
  metCard: { background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #F0F2F5', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' },
  metIcon: { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '10px' },
  metVal: { fontSize: '26px', fontWeight: '800', marginBottom: '4px' },
  metLabel: { fontSize: '12px', color: '#94A3B8', fontWeight: '600' },
  chartsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  chartCard: { background: '#fff', borderRadius: '16px', padding: '22px', border: '1px solid #F0F2F5', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' },
  chartTitle: { fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' },
  chartSub: { fontSize: '12.5px', color: '#94A3B8', marginBottom: '20px' },
  noData: { height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '14px' }
}