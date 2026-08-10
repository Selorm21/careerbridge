import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

// ============================================================
// ICONS
// ============================================================

const Icon = ({ path, size = 18, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {path}
  </svg>
)

const icons = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
      <path d="M10 12v2h4v-2" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  check: (
    <>
      <path d="M20 6 9 17l-5-5" />
    </>
  ),
  star: (
    <>
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3z" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h6" />
    </>
  ),
  chevron: (
    <>
      <path d="m6 9 6 6 6-6" />
    </>
  ),
  arrowUp: (
    <>
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </>
  ),
  arrowDown: (
    <>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </>
  ),
  percent: (
    <>
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="7" cy="7" r="2" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
  moon: (
    <>
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.7 6.7 0 0 0 21 12.8z" />
    </>
  ),
  logout: (
    <>
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
    </>
  ),
}

// ============================================================
// COLORS
// ============================================================

const C = {
  bg: '#F8FAFC', // Clean light grey background
  ink: '#0F172A',
  sub: '#64748B',
  border: 'rgba(226, 232, 240, 0.6)',
  card: 'rgba(255, 255, 255, 0.75)',
  
  accent: '#EA4E1B',
  teal: '#0E9C8F',
  navy: '#0B3B57',
  gold: '#F0A93A',

  green: '#10B981',
  red: '#DC2626',
}

const DONUT_COLORS = [
  C.teal,
  C.gold,
  C.navy,
  C.accent,
]

// ============================================================
// ANALYTICS PAGE
// ============================================================

export default function Analytics() {
  const navigate = useNavigate()

  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [profiles, setProfiles] = useState([])
  const [profile, setProfile] = useState(null)

  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('30d')
  const [compare, setCompare] = useState(false)
  const [tableTab, setTableTab] = useState('placements')
  const [starred, setStarred] = useState({})

  // ============================================================
  // FETCH DATA
  // ============================================================

  useEffect(() => {
    let mounted = true

    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        const [
          { data: apps, error: appsError },
          { data: jobsData, error: jobsError },
          { data: profilesData, error: profilesError },
          { data: profileData, error: profileError },
        ] = await Promise.all([
          supabase.from('applications').select('*, jobs(*), profiles(*)'),
          supabase.from('jobs').select('*'),
          supabase.from('profiles').select('*'),
          user ? supabase.from('profiles').select('*').eq('id', user.id).single() : Promise.resolve({ data: null, error: null }),
        ])

        if (!mounted) return
        setApplications(apps || [])
        setJobs(jobsData || [])
        setProfiles(profilesData || [])
        setProfile(profileData || null)
      } catch (error) {
        console.error('Failed to load analytics:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()
    return () => { mounted = false }
  }, [])

  // ============================================================
  // RANGE
  // ============================================================

  const RANGE_DAYS = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }
  const days = RANGE_DAYS[range]

  // ============================================================
  // HELPERS
  // ============================================================

  function periodChange(items, dateField, numberOfDays) {
    const now = new Date()
    const cutoff = new Date(now)
    cutoff.setDate(cutoff.getDate() - numberOfDays)
    const previousCutoff = new Date(cutoff)
    previousCutoff.setDate(previousCutoff.getDate() - numberOfDays)

    const current = items.filter((item) => item?.[dateField] && new Date(item[dateField]) >= cutoff).length
    const previous = items.filter((item) => item?.[dateField] && new Date(item[dateField]) >= previousCutoff && new Date(item[dateField]) < cutoff).length

    const pct = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0
    return { current, previous, pct }
  }

  const initials = (name) => {
    if (!name) return '?'
    return name.split(' ').filter(Boolean).map((word) => word[0]).slice(0, 2).join('').toUpperCase()
  }

  // ============================================================
  // OFFERS
  // ============================================================

  const offers = useMemo(() => applications.filter((application) => application.status === 'offer'), [applications])

  // ============================================================
  // METRIC DELTAS
  // ============================================================

  const placementsDelta = useMemo(() => periodChange(offers, 'created_at', days), [offers, days])
  const listingsDelta = useMemo(() => periodChange(jobs, 'created_at', days), [jobs, days])
  const usersDelta = useMemo(() => periodChange(profiles, 'created_at', days), [profiles, days])

  // ============================================================
  // CURRENT PLACEMENT RATE
  // ============================================================

  const currentRate = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const windowApplications = applications.filter((application) => application.created_at && new Date(application.created_at) >= cutoff)
    if (!windowApplications.length) return 0
    const offerCount = windowApplications.filter((application) => application.status === 'offer').length
    return Math.round((offerCount / windowApplications.length) * 100)
  }, [applications, days])

  const previousRate = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const previousCutoff = new Date(cutoff)
    previousCutoff.setDate(previousCutoff.getDate() - days)
    const windowApplications = applications.filter((application) => application.created_at && new Date(application.created_at) >= previousCutoff && new Date(application.created_at) < cutoff)
    if (!windowApplications.length) return 0
    const offerCount = windowApplications.filter((application) => application.status === 'offer').length
    return Math.round((offerCount / windowApplications.length) * 100)
  }, [applications, days])

  const placementRate = applications.length > 0 ? Math.round((offers.length / applications.length) * 100) : 0
  const rateDeltaPts = currentRate - previousRate

  // ============================================================
  // APPLICATION STATUS DATA
  // ============================================================

  const statusData = useMemo(() => {
    return [
      { name: 'Applied', value: applications.filter((a) => a.status === 'applied').length, color: DONUT_COLORS[0] },
      { name: 'Interview', value: applications.filter((a) => a.status === 'interview').length, color: DONUT_COLORS[1] },
      { name: 'Offer', value: applications.filter((a) => a.status === 'offer').length, color: DONUT_COLORS[2] },
      { name: 'Rejected', value: applications.filter((a) => a.status === 'rejected').length, color: DONUT_COLORS[3] },
    ].filter((item) => item.value > 0)
  }, [applications])

  // ============================================================
  // COMPANY DATA
  // ============================================================

  const companyData = useMemo(() => {
    const companyCounts = {}
    applications.forEach((application) => {
      const company = application.jobs?.company || 'Unknown'
      companyCounts[company] = (companyCounts[company] || 0) + 1
    })
    return Object.entries(companyCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6)
  }, [applications])

  // ============================================================
  // SKILLS DATA
  // ============================================================

  const skillData = useMemo(() => {
    const skillCounts = {}
    jobs.forEach((job) => {
      if (!job.skills) return
      job.skills.split(',').forEach((skillItem) => {
        const skill = skillItem.trim().toLowerCase()
        if (!skill) return
        skillCounts[skill] = (skillCounts[skill] || 0) + 1
      })
    })
    return Object.entries(skillCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8)
  }, [jobs])

  // ============================================================
  // JOB TYPES
  // ============================================================

  const typeData = useMemo(() => {
    const typeCounts = {}
    jobs.forEach((job) => {
      if (!job.type) return
      job.type.split(',').forEach((typeItem) => {
        const type = typeItem.trim()
        if (!type) return
        typeCounts[type] = (typeCounts[type] || 0) + 1
      })
    })
    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }))
  }, [jobs])

  // ============================================================
  // TREND DATA
  // ============================================================

  const trendData = useMemo(() => {
    const trendMap = {}
    applications.forEach((application) => {
      if (!application.created_at) return
      const date = new Date(application.created_at)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      const label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      if (!trendMap[key]) {
        trendMap[key] = { month: label, applications: 0, placements: 0, sortDate: date.getTime() }
      }
      trendMap[key].applications += 1
      if (application.status === 'offer') {
        trendMap[key].placements += 1
      }
    })
    return Object.values(trendMap).sort((a, b) => a.sortDate - b.sortDate).map(({ month, applications, placements }) => ({ month, applications, placements }))
  }, [applications])

  // ============================================================
  // TABLE DATA
  // ============================================================

  const tableRows = useMemo(() => {
    return applications
      .filter((application) => tableTab === 'placements' ? application.status === 'offer' : application.status === 'applied' || application.status === 'interview')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 6)
  }, [applications, tableTab])

  // ============================================================
  // STATUS BADGE
  // ============================================================

  const statusBadge = (status) => {
    const map = {
      offer: { bg: '#CCFBF1', fg: '#0F766E', label: 'Confirmed' },
      interview: { bg: '#FEF3C7', fg: '#92400E', label: 'Review' },
      applied: { bg: '#EFF6FF', fg: '#2563EB', label: 'Applied' },
      rejected: { bg: '#FEE2E2', fg: '#B91C1C', label: 'Rejected' },
    }
    return map[status] || { bg: '#F1F5F9', fg: '#475569', label: status || 'Unknown' }
  }

  // ============================================================
  // DELTA COMPONENT
  // ============================================================

  const Delta = ({ pct }) => {
    const up = pct >= 0
    return (
      <span style={{ ...S.deltaPill, color: up ? C.green : C.red, background: up ? '#ECFDF5' : '#FEF2F2' }}>
        <Icon path={icons[up ? 'arrowUp' : 'arrowDown']} size={12} />
        {Math.abs(pct).toFixed(1)}%
      </span>
    )
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return <div style={S.loadingPage}><div style={S.loadingText}>📊 Loading analytics...</div></div>
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div style={S.app}>
      
      {/* 🌟 Ambient Glowing Background for premium feel */}
      <div style={S.bgEffects}>
        <div style={S.glowOrb1} className="glowPulse"></div>
        <div style={S.glowOrb2} className="glowPulse"></div>
        <div style={S.gridPattern}></div>
      </div>

      {/* ======================================================
          MAIN ANALYTICS AREA
      ====================================================== */}
      <main className="pageIn mainPad" style={S.main}>
        {/* HEADER */}
        <div style={S.headRow}>
          <div>
            <h1 style={S.heading}>Analytics Dashboard</h1>
            <p style={S.headSub}>Placements, engagement, and platform activity at a glance.</p>
          </div>

          <div style={S.headControls}>
            <div style={S.rangeGroup}>
              {['7d', '30d', '90d', '1y'].map((item) => (
                <button key={item} className={`rangeBtn ${range === item ? 'active' : ''}`} style={S.rangeBtn} onClick={() => setRange(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ==================================================
            METRIC CARDS (Glassmorphism)
        ================================================== */}
        <div className="metricsGrid" style={S.metricsGrid}>
          {[
            { label: 'Total Placements', val: offers.length.toLocaleString(), icon: icons.check, bg: 'rgba(234, 78, 27, 0.1)', color: C.accent, delta: placementsDelta.pct },
            { label: 'Active Listings', val: jobs.length.toLocaleString(), icon: icons.briefcase, bg: 'rgba(14, 156, 143, 0.1)', color: C.teal, delta: listingsDelta.pct },
            { label: 'Active Users', val: profiles.length.toLocaleString(), icon: icons.users, bg: 'rgba(37, 99, 235, 0.1)', color: '#2563EB', delta: usersDelta.pct },
            { label: 'Placement Rate', val: `${placementRate}%`, icon: icons.percent, bg: 'rgba(240, 169, 58, 0.1)', color: C.gold, delta: rateDeltaPts },
          ].map((item, idx) => (
            <div key={idx} style={S.metCard} className="metric-card">
              <div style={S.metTop}>
                <span style={S.metLabel}>{item.label}</span>
                <div style={{ ...S.metIcon, background: item.bg, color: item.color }}>
                  <Icon path={item.icon} size={16} />
                </div>
              </div>
              <div style={S.metVal}>{item.val}</div>
              <Delta pct={item.delta} />
            </div>
          ))}
        </div>

        {/* ==================================================
            TREND + STATUS (Grid)
        ================================================== */}
        <div className="chartsGrid" style={S.chartsGrid}>
          {/* TREND */}
          <div style={S.chartCard}>
            <div style={S.chartHeadRow}>
              <div>
                <div style={S.chartTitle}>Placement Trends</div>
                <div style={S.chartSub}>Placements vs applications over time</div>
              </div>
              <label style={S.compareLabel}>
                Compare
                <span style={{ ...S.toggleTrack, background: compare ? C.accent : '#E2E8F0' }} onClick={() => setCompare((v) => !v)}>
                  <span style={{ ...S.toggleThumb, transform: compare ? 'translateX(16px)' : 'translateX(0)' }} />
                </span>
              </label>
            </div>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600, fill: C.sub }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }} />
                  <Line type="monotone" dataKey="applications" stroke={C.accent} strokeWidth={3} dot={false} name="Applications" />
                  {compare && <Line type="monotone" dataKey="placements" stroke={C.navy} strokeWidth={3} dot={false} name="Placements" />}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={S.noData}>No trend data available</div>
            )}
          </div>

          {/* STATUS */}
          <div style={S.chartCard}>
            <div style={S.chartTitle}>Applications by Status</div>
            <div style={S.chartSub}>Share of total applications</div>
            {statusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                      {statusData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={S.legendWrap}>
                  {statusData.map((item, index) => (
                    <div key={index} style={S.legendItem}>
                      <span style={{ ...S.legendDot, background: item.color }} />
                      {item.name} <span style={{ color: C.sub }}>({item.value})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={S.noData}>No application data yet</div>
            )}
          </div>
        </div>

        {/* ==================================================
            COMPANY + TABLE (Grid)
        ================================================== */}
        <div className="chartsGrid" style={{ ...S.chartsGrid, marginTop: '24px' }}>
          {/* COMPANY */}
          <div style={S.chartCard}>
            <div style={S.chartTitle}>Applications by Company</div>
            <div style={S.chartSub}>Which companies receive the most applications</div>
            {companyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={companyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: C.sub }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }} />
                  <Bar dataKey="count" fill={C.accent} radius={[6, 6, 0, 0]} name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={S.noData}>No company data available</div>
            )}
          </div>

          {/* TABLE */}
          <div style={S.chartCard}>
            <div style={S.chartHeadRow}>
              <div>
                <div style={S.chartTitle}>Recent Placements</div>
                <div style={S.chartSub}>Latest applications by status</div>
              </div>
              <div style={S.tabGroup}>
                <button className={`tabBtn ${tableTab === 'placements' ? 'active' : ''}`} style={S.tabBtn} onClick={() => setTableTab('placements')}>Placements</button>
                <button className={`tabBtn ${tableTab === 'pending' ? 'active' : ''}`} style={S.tabBtn} onClick={() => setTableTab('pending')}>Pending</button>
              </div>
            </div>
            {tableRows.length === 0 ? (
              <div style={S.noData}>Nothing here yet</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>Student</th>
                      <th style={S.th}>Company</th>
                      <th style={S.th}>Status</th>
                      <th style={S.th} />
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row, index) => {
                      const name = row.profiles?.full_name || row.profiles?.name || 'Unknown'
                      const badge = statusBadge(row.status)
                      const rowKey = row.id ?? index
                      return (
                        <tr key={rowKey} className="rowHover" style={S.tableRow}>
                          <td style={S.td}>
                            <div style={S.studentCell}>
                              <div style={S.rowAvatar}>{initials(name)}</div>
                              <span>{name}</span>
                            </div>
                          </td>
                          <td style={S.td}>{row.jobs?.company || 'Unknown'}</td>
                          <td style={S.td}>
                            <span style={{ ...S.badge, background: badge.bg, color: badge.fg }}>{badge.label}</span>
                          </td>
                          <td style={{ ...S.td, textAlign: 'right' }}>
                            <button className="starBtn" onClick={() => setStarred((current) => ({ ...current, [rowKey]: !current[rowKey] }))}>
                              <Icon path={icons.star} size={16} stroke={starred[rowKey] ? C.gold : C.sub} fill={starred[rowKey] ? C.gold : 'none'} />
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
        </div>

        {/* ==================================================
            SKILLS + JOB TYPES (Grid)
        ================================================== */}
        <div className="chartsGrid" style={{ ...S.chartsGrid, marginTop: '24px' }}>
          {/* SKILLS */}
          <div style={S.chartCard}>
            <div style={S.chartTitle}>Most In-Demand Skills</div>
            <div style={S.chartSub}>Skills most requested by employers</div>
            {skillData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={skillData} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 600, fill: C.ink }} width={90} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Jobs requiring this skill">
                    {skillData.map((entry, index) => <Cell key={index} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={S.noData}>No skill data available</div>
            )}
          </div>

          {/* JOB TYPES */}
          <div style={S.chartCard}>
            <div style={S.chartTitle}>Job Types Distribution</div>
            <div style={S.chartSub}>Breakdown of job types on the platform</div>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {typeData.map((entry, index) => <Cell key={index} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={S.noData}>No job data yet</div>
            )}
          </div>
        </div>
      </main>

      {/* CSS Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform: translateY(20px) scale(0.98); }
          to { opacity:1; transform: translateY(0) scale(1); }
        }
        
        .pageIn { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .glowPulse { animation: pulseGlow 6s ease-in-out infinite; }
        
        .metric-card { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .metric-card:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 20px 40px rgba(15,23,42,0.06) !important; }
        
        .rowHover { transition: background 0.2s ease; cursor: default; }
        .rowHover:hover { background: rgba(234, 78, 27, 0.04); }
        .rowHover:hover td { border-bottom-color: transparent; }
        
        .rangeBtn { transition: all 0.2s ease; }
        .rangeBtn:hover { color: #0F172A; }
        .rangeBtn.active { background: #FFFFFF; color: #0F172A; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        
        .tabBtn { transition: all 0.2s ease; }
        .tabBtn:hover { color: #0F172A; }
        .tabBtn.active { background: #FFFFFF; color: #0F172A; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        
        .starBtn { transition: all 0.2s ease; background: transparent; border: none; cursor: pointer; padding: 0; display: flex; align-items: center; }
        .starBtn:hover { transform: scale(1.15); }

        @media(max-width: 1200px) {
          .metricsGrid { grid-template-columns: repeat(2, 1fr) !important; }
          .chartsGrid { grid-template-columns: 1fr !important; }
        }
        @media(max-width: 640px) {
          .metricsGrid { grid-template-columns: 1fr !important; }
          .headRow { flex-direction: column !important; align-items: stretch !important; }
          .headControls { flex-wrap: wrap !important; }
        }
      `}</style>
    </div>
  )
}

// ============================================================
// STYLES
// ============================================================

const S = {
  app: {
    minHeight: '100vh',
    width: '100%',
    background: C.bg,
    fontFamily: "'Inter', -apple-system, sans-serif",
    display: 'flex',
    alignItems: 'stretch',
    position: 'relative',
  },

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
    background: 'radial-gradient(circle, rgba(234, 78, 27, 0.06), transparent 70%)',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: '-20%',
    left: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(14, 156, 143, 0.04), transparent 70%)',
  },
  gridPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)',
    backgroundSize: '32px 32px',
  },

  loadingPage: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: C.bg,
    fontFamily: "'Inter', sans-serif",
  },
  loadingText: { fontSize: '16px', color: C.sub, fontWeight: '600' },

  // ----------------------------------------------------------
  // MAIN
  // ----------------------------------------------------------
  main: {
    position: 'relative',
    zIndex: 1,
    flex: 1,
    minWidth: 0,
    width: '100%',
    padding: '40px 40px 60px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  headRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '32px',
  },
  heading: { fontSize: '32px', fontWeight: '900', color: C.ink, margin: '0 0 6px', letterSpacing: '-1px' },
  headSub: { fontSize: '15px', color: C.sub, margin: 0 },

  headControls: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  rangeGroup: {
    display: 'flex',
    gap: '2px',
    background: '#F1F5F9',
    borderRadius: '12px',
    padding: '4px',
  },
  rangeBtn: {
    padding: '8px 16px',
    border: 'none',
    background: 'transparent',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    color: C.navText,
    cursor: 'pointer',
  },

  // ----------------------------------------------------------
  // METRICS
  // ----------------------------------------------------------
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  metCard: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    boxShadow: '0 4px 20px rgba(15,23,42,0.03)',
    minWidth: 0,
  },
  metTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  metIcon: { width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  metVal: { fontSize: '32px', fontWeight: '900', color: C.ink, marginBottom: '8px', letterSpacing: '-1px' },
  metLabel: { fontSize: '14px', color: C.sub, fontWeight: '600' },
  deltaPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '20px',
  },

  // ----------------------------------------------------------
  // CHARTS
  // ----------------------------------------------------------
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)',
    gap: '24px',
    minWidth: 0,
  },
  chartCard: {
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    boxShadow: '0 4px 20px rgba(15,23,42,0.03)',
    minWidth: 0,
    overflow: 'hidden',
  },
  chartHeadRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '6px' },
  chartTitle: { fontSize: '16px', fontWeight: '800', color: C.ink, marginBottom: '4px' },
  chartSub: { fontSize: '13px', color: C.sub, marginBottom: '16px' },
  noData: { height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sub, fontSize: '14px' },

  compareLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: C.navText, flexShrink: 0 },
  toggleTrack: { width: '32px', height: '18px', borderRadius: '10px', position: 'relative', cursor: 'pointer', display: 'inline-block', transition: 'background .2s ease' },
  toggleThumb: { position: 'absolute', top: '2px', left: '2px', width: '14px', height: '14px', borderRadius: '50%', background: '#fff', transition: 'transform .2s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },

  legendWrap: { display: 'flex', flexWrap: 'wrap', gap: '10px 16px', justifyContent: 'center', marginTop: '6px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: C.ink },
  legendDot: { width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block' },

  // ----------------------------------------------------------
  // TABLE
  // ----------------------------------------------------------
  tabGroup: { display: 'flex', gap: '2px', background: '#F1F5F9', borderRadius: '10px', padding: '3px', flexShrink: 0 },
  tabBtn: { padding: '6px 14px', border: 'none', background: 'transparent', borderRadius: '7px', fontSize: '12.5px', fontWeight: '700', color: C.navText, cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '480px' },
  th: { textAlign: 'left', fontSize: '11.5px', fontWeight: '700', color: C.sub, textTransform: 'uppercase', letterSpacing: '0.03em', padding: '0 8px 12px', borderBottom: `1px solid #E2E8F0` },
  td: { padding: '14px 8px', fontSize: '14px', color: C.ink, borderBottom: `1px solid #E2E8F0`, fontWeight: '600' },
  studentCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  rowAvatar: { width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', color: C.ink, fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  badge: { fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', display: 'inline-block' },
}