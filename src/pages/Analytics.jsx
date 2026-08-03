import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'

// ---------- tiny inline icon set (line-style, matches reference) ----------
const Icon = ({ path, size = 18, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {path}
  </svg>
)
const icons = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
  cap: <><path d="M2 9l10-5 10 5-10 5-10-5z" /><path d="M6 11v4c0 1.5 2.5 3 6 3s6-1.5 6-3v-4" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.3 3-6 6.5-6s6.5 2.7 6.5 6" /><path d="M16 8.2a3 3 0 1 1 3.6 3M21.5 20c0-2.6-1.8-4.8-4.3-5.6" /></>,
  building: <><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 13a7.7 7.7 0 0 0 0-2l2-1.6-2-3.4-2.4.6a7.7 7.7 0 0 0-1.8-1L14.6 3H9.4l-.6 2.6a7.7 7.7 0 0 0-1.8 1l-2.4-.6-2 3.4L4.6 11a7.7 7.7 0 0 0 0 2l-2 1.6 2 3.4 2.4-.6c.5.4 1.1.8 1.8 1l.6 2.6h5.2l.6-2.6c.7-.2 1.3-.6 1.8-1l2.4.6 2-3.4-2-1.6z" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></>,
  percent: <><circle cx="7" cy="7" r="2.3" /><circle cx="17" cy="17" r="2.3" /><path d="M6 18L18 6" /></>,
  moon: <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />,
  star: <path d="M12 3.5l2.5 5.5 6 .7-4.4 4.2 1.2 6-5.3-3-5.3 3 1.2-6-4.4-4.2 6-.7z" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  arrowUp: <path d="M12 19V5M5 12l7-7 7 7" />,
  arrowDown: <path d="M12 5v14M5 12l7 7 7-7" />,
}

// ---------- palette (derived from the reference layout) ----------
const C = {
  bg: '#F8F9FB',
  ink: '#0F172A',
  sub: '#94A3B8',
  border: '#EEF1F5',
  card: '#FFFFFF',
  sidebar: '#FFFFFF',
  navActiveBg: '#111827',
  navActiveText: '#FFFFFF',
  navText: '#475569',
  accent: '#EA4E1B',   // primary orange used for the hero line/bars
  teal: '#0E9C8F',
  navy: '#0B3B57',
  gold: '#F0A93A',
  green: '#0E9C6B',
  red: '#DC2626',
}
const DONUT_COLORS = [C.teal, C.gold, C.navy, C.accent]

export default function Analytics() {
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('30d')
  const [compare, setCompare] = useState(false)
  const [tableTab, setTableTab] = useState('placements')
  const [starred, setStarred] = useState({})
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

  const RANGE_DAYS = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }

  // ---------- period helper: counts items in the current window vs the equivalent prior window ----------
  function periodChange(items, dateField, days) {
    const now = new Date()
    const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - days)
    const prevCutoff = new Date(cutoff); prevCutoff.setDate(prevCutoff.getDate() - days)
    const current = items.filter(i => i?.[dateField] && new Date(i[dateField]) >= cutoff).length
    const previous = items.filter(i => i?.[dateField] && new Date(i[dateField]) >= prevCutoff && new Date(i[dateField]) < cutoff).length
    const pct = previous > 0 ? ((current - previous) / previous) * 100 : (current > 0 ? 100 : 0)
    return { current, previous, pct }
  }

  const days = RANGE_DAYS[range]
  const offers = useMemo(() => applications.filter(a => a.status === 'offer'), [applications])

  const placementsDelta = useMemo(() => periodChange(offers, 'created_at', days), [offers, days])
  const listingsDelta = useMemo(() => periodChange(jobs, 'created_at', days), [jobs, days])
  const usersDelta = useMemo(() => periodChange(profiles, 'created_at', days), [profiles, days])

  const currentRate = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days)
    const windowApps = applications.filter(a => a.created_at && new Date(a.created_at) >= cutoff)
    return windowApps.length ? Math.round((windowApps.filter(a => a.status === 'offer').length / windowApps.length) * 100) : 0
  }, [applications, days])
  const previousRate = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days)
    const prevCutoff = new Date(cutoff); prevCutoff.setDate(prevCutoff.getDate() - days)
    const windowApps = applications.filter(a => a.created_at && new Date(a.created_at) >= prevCutoff && new Date(a.created_at) < cutoff)
    return windowApps.length ? Math.round((windowApps.filter(a => a.status === 'offer').length / windowApps.length) * 100) : 0
  }, [applications, days])
  const placementRate = applications.length > 0
    ? Math.round((offers.length / applications.length) * 100) : 0
  const rateDeltaPts = currentRate - previousRate

  const students = profiles.filter(p => p.role === 'student').length
  const employers = profiles.filter(p => p.role === 'employer').length

  // ---------- chart data ----------
  const statusData = [
    { name: 'Applied', value: applications.filter(a => a.status === 'applied').length, color: DONUT_COLORS[0] },
    { name: 'Interview', value: applications.filter(a => a.status === 'interview').length, color: DONUT_COLORS[1] },
    { name: 'Offer', value: applications.filter(a => a.status === 'offer').length, color: DONUT_COLORS[2] },
    { name: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, color: DONUT_COLORS[3] },
  ].filter(d => d.value > 0)

  const companyCounts = {}
  applications.forEach(app => {
    const company = app.jobs?.company || 'Unknown'
    companyCounts[company] = (companyCounts[company] || 0) + 1
  })
  const companyData = Object.entries(companyCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

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

  const typeCounts = {}
  jobs.forEach(job => {
    const types = job.type?.split(',') || ['Unknown']
    types.forEach(t => {
      const type = t.trim()
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })
  })
  const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }))

  // Trend: applications vs placements(offers), grouped by month, across all history
  const trendMap = {}
  applications.forEach(app => {
    const month = new Date(app.created_at).toLocaleDateString('en', { month: 'short' })
    if (!trendMap[month]) trendMap[month] = { month, applications: 0, placements: 0 }
    trendMap[month].applications += 1
    if (app.status === 'offer') trendMap[month].placements += 1
  })
  const trendData = Object.values(trendMap)

  // Recent placements / pending table
  const tableRows = applications
    .filter(a => tableTab === 'placements' ? a.status === 'offer' : (a.status === 'applied' || a.status === 'interview'))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6)

  const initials = (name) => (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const statusBadge = (status) => {
    const map = {
      offer: { bg: '#CCFBF1', fg: '#0F766E', label: 'Confirmed' },
      interview: { bg: '#FEF3C7', fg: '#92400E', label: 'Review' },
      applied: { bg: '#EFF6FF', fg: '#2563EB', label: 'Applied' },
      rejected: { bg: '#FEE2E2', fg: '#B91C1C', label: 'Rejected' },
    }
    return map[status] || { bg: '#F1F5F9', fg: '#475569', label: status || 'Unknown' }
  }

  const navItems = [
    { label: 'Analytics', icon: 'grid', path: '/analytics', active: true },
    { label: 'Browse Jobs', icon: 'briefcase', path: '/jobs' },
    { label: 'Coordinator', icon: 'cap', path: '/coordinator' },
    { label: 'Students', icon: 'users', path: '/students' },
    { label: 'Employers', icon: 'building', path: '/employers' },
    { label: 'Settings', icon: 'settings', path: '/settings' },
  ]

  const Delta = ({ pct }) => {
    const up = pct >= 0
    return (
      <span style={{ ...S.deltaPill, color: up ? C.green : C.red, background: up ? '#ECFDF5' : '#FEF2F2' }}>
        <Icon path={icons[up ? 'arrowUp' : 'arrowDown']} size={12} />
        {Math.abs(pct).toFixed(1)}% vs last period
      </span>
    )
  }

  if (loading) return (
    <div style={S.loadingPage}>
      <div style={S.loadingText}>Loading analytics...</div>
    </div>
  )

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .pageIn{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) forwards}
        .navBtn{transition:all .15s ease;}
        .navBtn:hover{background:#F1F5F9!important;}
        .navBtn.active:hover{background:${C.navActiveBg}!important;}
        .rangeBtn{transition:all .15s ease;}
        .rangeBtn.active{background:${C.ink}!important;color:#fff!important;}
        .tabBtn{transition:all .15s ease;}
        .tabBtn.active{background:#fff!important;color:${C.ink}!important;box-shadow:0 1px 3px rgba(15,23,42,.08);}
        .starBtn{transition:transform .15s ease;cursor:pointer;background:none;border:none;}
        .starBtn:hover{transform:scale(1.15);}
        .rowHover:hover{background:#FAFBFC;}
        @media(max-width:1000px){
          .sidebar{display:none!important;}
        }
        @media(max-width:768px){
          .metricsGrid{grid-template-columns:1fr 1fr!important;}
          .chartsGrid{grid-template-columns:1fr!important;}
          .mainPad{padding:20px 16px!important;}
        }
      `}</style>

      {/* ---------------- Sidebar ---------------- */}
      <aside className="sidebar" style={S.sidebar}>
        <div style={S.logoRow}>
          <div style={S.logoMark}><Icon path={icons.grid} size={16} /></div>
          <span style={S.logoText}>CareerBridge</span>
        </div>

        <nav style={S.navList}>
          {navItems.map(item => (
            <button
              key={item.label}
              className={`navBtn${item.active ? ' active' : ''}`}
              style={{ ...S.navItem, ...(item.active ? S.navItemActive : {}) }}
              onClick={() => navigate(item.path)}
            >
              <Icon path={icons[item.icon]} size={17} />
              {item.label}
            </button>
          ))}
        </nav>

        <div style={S.sidebarFooter}>
          <div style={S.userAvatar}>{initials('Admin User')}</div>
          <div>
            <div style={S.userName}>Admin User</div>
            <div style={S.userRole}>Coordinator</div>
          </div>
        </div>
      </aside>

      {/* ---------------- Main ---------------- */}
      <div className="pageIn mainPad" style={S.main}>
        <div style={S.headRow}>
          <div>
            <h1 style={S.heading}>Analytics Dashboard</h1>
            <p style={S.headSub}>Placements, engagement and platform activity at a glance.</p>
          </div>
          <div style={S.headControls}>
            <button style={S.categoryDropdown}>
              All Categories <Icon path={icons.chevron} size={14} />
            </button>
            <div style={S.rangeGroup}>
              {['7d', '30d', '90d', '1y'].map(r => (
                <button
                  key={r}
                  className={`rangeBtn${range === r ? ' active' : ''}`}
                  style={S.rangeBtn}
                  onClick={() => setRange(r)}
                >{r}</button>
              ))}
            </div>
            <button style={S.iconBtn}><Icon path={icons.moon} size={16} /></button>
          </div>
        </div>

        {/* ---- metric cards ---- */}
        <div className="metricsGrid" style={S.metricsGrid}>
          <div style={S.metCard}>
            <div style={S.metTop}>
              <span style={S.metLabel}>Total Placements</span>
              <div style={{ ...S.metIcon, background: '#FFF1EA', color: C.accent }}><Icon path={icons.check} size={16} /></div>
            </div>
            <div style={S.metVal}>{offers.length.toLocaleString()}</div>
            <Delta pct={placementsDelta.pct} />
          </div>

          <div style={S.metCard}>
            <div style={S.metTop}>
              <span style={S.metLabel}>Active Listings</span>
              <div style={{ ...S.metIcon, background: '#ECFDF5', color: C.teal }}><Icon path={icons.briefcase} size={16} /></div>
            </div>
            <div style={S.metVal}>{jobs.length.toLocaleString()}</div>
            <Delta pct={listingsDelta.pct} />
          </div>

          <div style={S.metCard}>
            <div style={S.metTop}>
              <span style={S.metLabel}>Active Users</span>
              <div style={{ ...S.metIcon, background: '#EFF6FF', color: '#2563EB' }}><Icon path={icons.users} size={16} /></div>
            </div>
            <div style={S.metVal}>{profiles.length.toLocaleString()}</div>
            <Delta pct={usersDelta.pct} />
          </div>

          <div style={S.metCard}>
            <div style={S.metTop}>
              <span style={S.metLabel}>Placement Rate</span>
              <div style={{ ...S.metIcon, background: '#FEFCE8', color: C.gold }}><Icon path={icons.percent} size={16} /></div>
            </div>
            <div style={S.metVal}>{placementRate}%</div>
            <Delta pct={rateDeltaPts} />
          </div>
        </div>

        {/* ---- trend + donut ---- */}
        <div className="chartsGrid" style={{ ...S.chartsGrid, gridTemplateColumns: '1.6fr 1fr' }}>
          <div style={S.chartCard}>
            <div style={S.chartHeadRow}>
              <div>
                <div style={S.chartTitle}>Placement Trends</div>
                <div style={S.chartSub}>Placements vs applications over time</div>
              </div>
              <label style={S.compareLabel}>
                Compare
                <span style={{ ...S.toggleTrack, background: compare ? C.accent : '#E2E8F0' }} onClick={() => setCompare(v => !v)}>
                  <span style={{ ...S.toggleThumb, transform: compare ? 'translateX(16px)' : 'translateX(0)' }} />
                </span>
              </label>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600, fill: C.sub }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: `1px solid ${C.border}`, fontSize: '13px' }} />
                <Line type="monotone" dataKey="applications" stroke={C.accent} strokeWidth={3} dot={false} name="Applications" />
                {compare && <Line type="monotone" dataKey="placements" stroke={C.navy} strokeWidth={3} dot={false} name="Placements" />}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={S.chartCard}>
            <div style={S.chartTitle}>Applications by Status</div>
            <div style={S.chartSub}>Share of total applications</div>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">
                    {statusData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '10px', border: `1px solid ${C.border}`, fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div style={S.noData}>No application data yet</div>}
            <div style={S.legendWrap}>
              {statusData.map((d, i) => (
                <div key={i} style={S.legendItem}>
                  <span style={{ ...S.legendDot, background: d.color }} />
                  {d.name} <span style={{ color: C.sub }}>({d.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---- company bar + table ---- */}
        <div className="chartsGrid" style={{ ...S.chartsGrid, gridTemplateColumns: '1fr 1.4fr', marginTop: '20px' }}>
          <div style={S.chartCard}>
            <div style={S.chartTitle}>Applications by Company</div>
            <div style={S.chartSub}>Which companies receive the most applications</div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={companyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: C.sub }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: `1px solid ${C.border}`, fontSize: '13px' }} />
                <Bar dataKey="count" fill={C.accent} radius={[6, 6, 0, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={S.chartCard}>
            <div style={S.chartHeadRow}>
              <div>
                <div style={S.chartTitle}>Recent Placements</div>
                <div style={S.chartSub}>Latest applications by status</div>
              </div>
              <div style={S.tabGroup}>
                <button className={`tabBtn${tableTab === 'placements' ? ' active' : ''}`} style={S.tabBtn} onClick={() => setTableTab('placements')}>Placements</button>
                <button className={`tabBtn${tableTab === 'pending' ? ' active' : ''}`} style={S.tabBtn} onClick={() => setTableTab('pending')}>Pending</button>
              </div>
            </div>

            {tableRows.length === 0 ? (
              <div style={S.noData}>Nothing here yet</div>
            ) : (
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Student</th>
                    <th style={S.th}>Company</th>
                    <th style={S.th}>Status</th>
                    <th style={S.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, i) => {
                    const name = row.profiles?.full_name || row.profiles?.name || 'Unknown'
                    const badge = statusBadge(row.status)
                    return (
                      <tr key={row.id ?? i} className="rowHover">
                        <td style={S.td}>
                          <div style={S.studentCell}>
                            <div style={S.rowAvatar}>{initials(name)}</div>
                            {name}
                          </div>
                        </td>
                        <td style={S.td}>{row.jobs?.company || 'Unknown'}</td>
                        <td style={S.td}>
                          <span style={{ ...S.badge, background: badge.bg, color: badge.fg }}>{badge.label}</span>
                        </td>
                        <td style={{ ...S.td, textAlign: 'right' }}>
                          <button
                            className="starBtn"
                            onClick={() => setStarred(s => ({ ...s, [row.id ?? i]: !s[row.id ?? i] }))}
                          >
                            <Icon
                              path={icons.star}
                              size={16}
                              stroke={starred[row.id ?? i] ? C.gold : C.sub}
                              fill={starred[row.id ?? i] ? C.gold : 'none'}
                            />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ---- skills + job types (kept from original, restyled) ---- */}
        <div className="chartsGrid" style={{ ...S.chartsGrid, marginTop: '20px' }}>
          <div style={S.chartCard}>
            <div style={S.chartTitle}>Most In-Demand Skills</div>
            <div style={S.chartSub}>Skills most requested by employers</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={skillData} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis type="number" tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 600, fill: C.ink }} width={80} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: `1px solid ${C.border}`, fontSize: '13px' }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Jobs requiring this skill">
                  {skillData.map((entry, index) => <Cell key={index} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={S.chartCard}>
            <div style={S.chartTitle}>Job Types Distribution</div>
            <div style={S.chartSub}>Breakdown of job types on the platform</div>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {typeData.map((entry, index) => <Cell key={index} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '10px', border: `1px solid ${C.border}`, fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div style={S.noData}>No job data yet</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

const S = {
  app: { minHeight: '100vh', background: C.bg, fontFamily: "'Inter', -apple-system, sans-serif", display: 'flex' },
  loadingPage: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg },
  loadingText: { fontSize: '16px', color: C.sub, fontWeight: '600' },

  // sidebar
  sidebar: { width: '232px', flexShrink: 0, background: C.sidebar, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', padding: '22px 16px', position: 'sticky', top: 0, height: '100vh' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px', marginBottom: '28px' },
  logoMark: { width: '30px', height: '30px', borderRadius: '9px', background: C.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: '17px', fontWeight: '800', color: C.ink, letterSpacing: '-0.4px' },
  navList: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  navItem: { display: 'flex', alignItems: 'center', gap: '11px', padding: '10px 12px', borderRadius: '10px', border: 'none', background: 'transparent', color: C.navText, fontSize: '14px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' },
  navItemActive: { background: C.navActiveBg, color: C.navActiveText },
  sidebarFooter: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 10px', borderTop: `1px solid ${C.border}`, marginTop: '10px' },
  userAvatar: { width: '34px', height: '34px', borderRadius: '10px', background: '#F1F5F9', color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' },
  userName: { fontSize: '13.5px', fontWeight: '700', color: C.ink },
  userRole: { fontSize: '12px', color: C.sub },

  // main
  main: { flex: 1, maxWidth: '1280px', margin: '0 auto', padding: '32px 32px 60px' },
  headRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '26px' },
  heading: { fontSize: '25px', fontWeight: '800', color: C.ink, marginBottom: '5px', letterSpacing: '-0.5px' },
  headSub: { fontSize: '14px', color: C.sub },
  headControls: { display: 'flex', alignItems: 'center', gap: '10px' },
  categoryDropdown: { display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '10px', border: `1px solid ${C.border}`, background: '#fff', fontSize: '13px', fontWeight: '600', color: C.ink, cursor: 'pointer' },
  rangeGroup: { display: 'flex', gap: '2px', background: '#F1F5F9', borderRadius: '10px', padding: '3px' },
  rangeBtn: { padding: '7px 13px', border: 'none', background: 'transparent', borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: C.navText, cursor: 'pointer' },
  iconBtn: { width: '36px', height: '36px', borderRadius: '10px', border: `1px solid ${C.border}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.navText },

  // metrics
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '22px' },
  metCard: { background: C.card, borderRadius: '16px', padding: '20px', border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.04)' },
  metTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  metIcon: { width: '32px', height: '32px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  metVal: { fontSize: '28px', fontWeight: '800', color: C.ink, marginBottom: '8px', letterSpacing: '-0.5px' },
  metLabel: { fontSize: '13px', color: C.sub, fontWeight: '600' },
  deltaPill: { display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px' },

  // charts
  chartsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  chartCard: { background: C.card, borderRadius: '16px', padding: '22px', border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.04)' },
  chartHeadRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' },
  chartTitle: { fontSize: '15px', fontWeight: '800', color: C.ink, marginBottom: '4px' },
  chartSub: { fontSize: '12.5px', color: C.sub, marginBottom: '18px' },
  noData: { height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sub, fontSize: '14px' },

  compareLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: C.navText },
  toggleTrack: { width: '32px', height: '18px', borderRadius: '10px', position: 'relative', cursor: 'pointer', display: 'inline-block', transition: 'background .15s ease' },
  toggleThumb: { position: 'absolute', top: '2px', left: '2px', width: '14px', height: '14px', borderRadius: '50%', background: '#fff', transition: 'transform .15s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' },

  legendWrap: { display: 'flex', flexWrap: 'wrap', gap: '10px 16px', justifyContent: 'center', marginTop: '4px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: '600', color: C.ink },
  legendDot: { width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block' },

  tabGroup: { display: 'flex', gap: '2px', background: '#F1F5F9', borderRadius: '9px', padding: '3px' },
  tabBtn: { padding: '6px 12px', border: 'none', background: 'transparent', borderRadius: '7px', fontSize: '12.5px', fontWeight: '700', color: C.navText, cursor: 'pointer' },

  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: '11.5px', fontWeight: '700', color: C.sub, textTransform: 'uppercase', letterSpacing: '0.03em', padding: '0 8px 10px', borderBottom: `1px solid ${C.border}` },
  td: { padding: '12px 8px', fontSize: '13.5px', color: C.ink, borderBottom: `1px solid ${C.border}`, fontWeight: '600' },
  studentCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  rowAvatar: { width: '28px', height: '28px', borderRadius: '50%', background: '#F1F5F9', color: C.ink, fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { fontSize: '11.5px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', display: 'inline-block' },
}
