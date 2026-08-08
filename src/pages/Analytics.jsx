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
  bg: '#F8F9FB',
  ink: '#0F172A',
  sub: '#94A3B8',
  border: '#EEF1F5',
  card: '#FFFFFF',

  sidebar: '#FFFFFF',

  navActiveBg: '#111827',
  navActiveText: '#FFFFFF',
  navText: '#475569',

  accent: '#EA4E1B',
  teal: '#0E9C8F',
  navy: '#0B3B57',
  gold: '#F0A93A',

  green: '#0E9C6B',
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
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const [
          { data: apps, error: appsError },
          { data: jobsData, error: jobsError },
          { data: profilesData, error: profilesError },
          { data: profileData, error: profileError },
        ] = await Promise.all([
          supabase
            .from('applications')
            .select('*, jobs(*), profiles(*)'),

          supabase
            .from('jobs')
            .select('*'),

          supabase
            .from('profiles')
            .select('*'),

          user
            ? supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
            : Promise.resolve({ data: null, error: null }),
        ])

        if (appsError) console.error('Applications error:', appsError)
        if (jobsError) console.error('Jobs error:', jobsError)
        if (profilesError) console.error('Profiles error:', profilesError)
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile error:', profileError)
        }

        if (!mounted) return

        setApplications(apps || [])
        setJobs(jobsData || [])
        setProfiles(profilesData || [])
        setProfile(profileData || null)
      } catch (error) {
        console.error('Failed to load analytics:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [])

  // ============================================================
  // RANGE
  // ============================================================

  const RANGE_DAYS = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365,
  }

  const days = RANGE_DAYS[range]

  // ============================================================
  // HELPERS
  // ============================================================

  function periodChange(items, dateField, numberOfDays) {
    const now = new Date()

    const cutoff = new Date(now)
    cutoff.setDate(cutoff.getDate() - numberOfDays)

    const previousCutoff = new Date(cutoff)
    previousCutoff.setDate(
      previousCutoff.getDate() - numberOfDays
    )

    const current = items.filter(
      (item) =>
        item?.[dateField] &&
        new Date(item[dateField]) >= cutoff
    ).length

    const previous = items.filter(
      (item) =>
        item?.[dateField] &&
        new Date(item[dateField]) >= previousCutoff &&
        new Date(item[dateField]) < cutoff
    ).length

    const pct =
      previous > 0
        ? ((current - previous) / previous) * 100
        : current > 0
        ? 100
        : 0

    return {
      current,
      previous,
      pct,
    }
  }

  const initials = (name) => {
    if (!name) return '?'

    return name
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  // ============================================================
  // OFFERS
  // ============================================================

  const offers = useMemo(() => {
    return applications.filter(
      (application) => application.status === 'offer'
    )
  }, [applications])

  // ============================================================
  // METRIC DELTAS
  // ============================================================

  const placementsDelta = useMemo(
    () =>
      periodChange(
        offers,
        'created_at',
        days
      ),
    [offers, days]
  )

  const listingsDelta = useMemo(
    () =>
      periodChange(
        jobs,
        'created_at',
        days
      ),
    [jobs, days]
  )

  const usersDelta = useMemo(
    () =>
      periodChange(
        profiles,
        'created_at',
        days
      ),
    [profiles, days]
  )

  // ============================================================
  // CURRENT PLACEMENT RATE
  // ============================================================

  const currentRate = useMemo(() => {
    const cutoff = new Date()

    cutoff.setDate(
      cutoff.getDate() - days
    )

    const windowApplications =
      applications.filter(
        (application) =>
          application.created_at &&
          new Date(application.created_at) >= cutoff
      )

    if (!windowApplications.length) {
      return 0
    }

    const offerCount =
      windowApplications.filter(
        (application) =>
          application.status === 'offer'
      ).length

    return Math.round(
      (offerCount / windowApplications.length) * 100
    )
  }, [applications, days])

  // ============================================================
  // PREVIOUS PLACEMENT RATE
  // ============================================================

  const previousRate = useMemo(() => {
    const cutoff = new Date()

    cutoff.setDate(
      cutoff.getDate() - days
    )

    const previousCutoff = new Date(cutoff)

    previousCutoff.setDate(
      previousCutoff.getDate() - days
    )

    const windowApplications =
      applications.filter(
        (application) =>
          application.created_at &&
          new Date(application.created_at) >=
            previousCutoff &&
          new Date(application.created_at) <
            cutoff
      )

    if (!windowApplications.length) {
      return 0
    }

    const offerCount =
      windowApplications.filter(
        (application) =>
          application.status === 'offer'
      ).length

    return Math.round(
      (offerCount / windowApplications.length) * 100
    )
  }, [applications, days])

  const placementRate =
    applications.length > 0
      ? Math.round(
          (offers.length / applications.length) * 100
        )
      : 0

  const rateDeltaPts =
    currentRate - previousRate

  // ============================================================
  // APPLICATION STATUS DATA
  // ============================================================

  const statusData = useMemo(() => {
    return [
      {
        name: 'Applied',
        value: applications.filter(
          (a) => a.status === 'applied'
        ).length,
        color: DONUT_COLORS[0],
      },
      {
        name: 'Interview',
        value: applications.filter(
          (a) => a.status === 'interview'
        ).length,
        color: DONUT_COLORS[1],
      },
      {
        name: 'Offer',
        value: applications.filter(
          (a) => a.status === 'offer'
        ).length,
        color: DONUT_COLORS[2],
      },
      {
        name: 'Rejected',
        value: applications.filter(
          (a) => a.status === 'rejected'
        ).length,
        color: DONUT_COLORS[3],
      },
    ].filter((item) => item.value > 0)
  }, [applications])

  // ============================================================
  // COMPANY DATA
  // ============================================================

  const companyData = useMemo(() => {
    const companyCounts = {}

    applications.forEach((application) => {
      const company =
        application.jobs?.company ||
        'Unknown'

      companyCounts[company] =
        (companyCounts[company] || 0) + 1
    })

    return Object.entries(companyCounts)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [applications])

  // ============================================================
  // SKILLS DATA
  // ============================================================

  const skillData = useMemo(() => {
    const skillCounts = {}

    jobs.forEach((job) => {
      if (!job.skills) return

      job.skills
        .split(',')
        .forEach((skillItem) => {
          const skill =
            skillItem.trim().toLowerCase()

          if (!skill) return

          skillCounts[skill] =
            (skillCounts[skill] || 0) + 1
        })
    })

    return Object.entries(skillCounts)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [jobs])

  // ============================================================
  // JOB TYPES
  // ============================================================

  const typeData = useMemo(() => {
    const typeCounts = {}

    jobs.forEach((job) => {
      if (!job.type) return

      job.type
        .split(',')
        .forEach((typeItem) => {
          const type = typeItem.trim()

          if (!type) return

          typeCounts[type] =
            (typeCounts[type] || 0) + 1
        })
    })

    return Object.entries(typeCounts).map(
      ([name, value]) => ({
        name,
        value,
      })
    )
  }, [jobs])

  // ============================================================
  // TREND DATA
  // ============================================================

  const trendData = useMemo(() => {
    const trendMap = {}

    applications.forEach((application) => {
      if (!application.created_at) return

      const date = new Date(
        application.created_at
      )

      const key = `${date.getFullYear()}-${date.getMonth()}`

      const label = date.toLocaleDateString(
        'en-US',
        {
          month: 'short',
          year: 'numeric',
        }
      )

      if (!trendMap[key]) {
        trendMap[key] = {
          month: label,
          applications: 0,
          placements: 0,
          sortDate: date.getTime(),
        }
      }

      trendMap[key].applications += 1

      if (
        application.status === 'offer'
      ) {
        trendMap[key].placements += 1
      }
    })

    return Object.values(trendMap)
      .sort(
        (a, b) =>
          a.sortDate - b.sortDate
      )
      .map(
        ({
          month,
          applications,
          placements,
        }) => ({
          month,
          applications,
          placements,
        })
      )
  }, [applications])

  // ============================================================
  // TABLE DATA
  // ============================================================

  const tableRows = useMemo(() => {
    return applications
      .filter((application) =>
        tableTab === 'placements'
          ? application.status === 'offer'
          : application.status === 'applied' ||
            application.status === 'interview'
      )
      .sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      )
      .slice(0, 6)
  }, [applications, tableTab])

  // ============================================================
  // STATUS BADGE
  // ============================================================

  const statusBadge = (status) => {
    const map = {
      offer: {
        bg: '#CCFBF1',
        fg: '#0F766E',
        label: 'Confirmed',
      },

      interview: {
        bg: '#FEF3C7',
        fg: '#92400E',
        label: 'Review',
      },

      applied: {
        bg: '#EFF6FF',
        fg: '#2563EB',
        label: 'Applied',
      },

      rejected: {
        bg: '#FEE2E2',
        fg: '#B91C1C',
        label: 'Rejected',
      },
    }

    return (
      map[status] || {
        bg: '#F1F5F9',
        fg: '#475569',
        label: status || 'Unknown',
      }
    )
  }

  // ============================================================
  // LOGOUT
  // ============================================================

  

  // ============================================================
  // NAVIGATION
  // ============================================================

  

  // ============================================================
  // DELTA COMPONENT
  // ============================================================

  const Delta = ({ pct }) => {
    const up = pct >= 0

    return (
      <span
        style={{
          ...S.deltaPill,
          color: up
            ? C.green
            : C.red,

          background: up
            ? '#ECFDF5'
            : '#FEF2F2',
        }}
      >
        <Icon
          path={
            icons[
              up
                ? 'arrowUp'
                : 'arrowDown'
            ]
          }
          size={12}
        />

        {Math.abs(pct).toFixed(1)}% vs last period
      </span>
    )
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div style={S.loadingPage}>
        <div style={S.loadingText}>
          Loading analytics...
        </div>
      </div>
    )
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div style={S.app}>

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

     

      {/* ======================================================
          MAIN ANALYTICS AREA
      ====================================================== */}

      <main
        className="pageIn mainPad"
        style={S.main}
      >

        {/* HEADER */}

        <div style={S.headRow}>
          <div>
            <h1 style={S.heading}>
              Analytics Dashboard
            </h1>

            <p style={S.headSub}>
              Placements, engagement and
              platform activity at a glance.
            </p>
          </div>

          <div style={S.headControls}>

            {/* CATEGORY */}

            <button
              style={
                S.categoryDropdown
              }
            >
              All Categories

              <Icon
                path={icons.chevron}
                size={14}
              />
            </button>

            {/* RANGE */}

            <div
              style={S.rangeGroup}
            >
              {[
                '7d',
                '30d',
                '90d',
                '1y',
              ].map((item) => (
                <button
                  key={item}
                  className={`rangeBtn ${
                    range === item
                      ? 'active'
                      : ''
                  }`}
                  style={
                    S.rangeBtn
                  }
                  onClick={() =>
                    setRange(item)
                  }
                >
                  {item}
                </button>
              ))}
            </div>

            {/* DARK MODE BUTTON */}

            <button
              style={S.iconBtn}
              title="Theme"
            >
              <Icon
                path={icons.moon}
                size={16}
              />
            </button>
          </div>
        </div>

        {/* ==================================================
            METRIC CARDS
        ================================================== */}

        <div
          className="metricsGrid"
          style={S.metricsGrid}
        >

          {/* PLACEMENTS */}

          <div style={S.metCard}>
            <div style={S.metTop}>
              <span style={S.metLabel}>
                Total Placements
              </span>

              <div
                style={{
                  ...S.metIcon,
                  background:
                    '#FFF1EA',
                  color:
                    C.accent,
                }}
              >
                <Icon
                  path={icons.check}
                  size={16}
                />
              </div>
            </div>

            <div style={S.metVal}>
              {offers.length.toLocaleString()}
            </div>

            <Delta
              pct={
                placementsDelta.pct
              }
            />
          </div>

          {/* JOBS */}

          <div style={S.metCard}>
            <div style={S.metTop}>
              <span style={S.metLabel}>
                Active Listings
              </span>

              <div
                style={{
                  ...S.metIcon,
                  background:
                    '#ECFDF5',
                  color: C.teal,
                }}
              >
                <Icon
                  path={
                    icons.briefcase
                  }
                  size={16}
                />
              </div>
            </div>

            <div style={S.metVal}>
              {jobs.length.toLocaleString()}
            </div>

            <Delta
              pct={
                listingsDelta.pct
              }
            />
          </div>

          {/* USERS */}

          <div style={S.metCard}>
            <div style={S.metTop}>
              <span style={S.metLabel}>
                Active Users
              </span>

              <div
                style={{
                  ...S.metIcon,
                  background:
                    '#EFF6FF',
                  color:
                    '#2563EB',
                }}
              >
                <Icon
                  path={icons.users}
                  size={16}
                />
              </div>
            </div>

            <div style={S.metVal}>
              {profiles.length.toLocaleString()}
            </div>

            <Delta
              pct={
                usersDelta.pct
              }
            />
          </div>

          {/* RATE */}

          <div style={S.metCard}>
            <div style={S.metTop}>
              <span style={S.metLabel}>
                Placement Rate
              </span>

              <div
                style={{
                  ...S.metIcon,
                  background:
                    '#FEFCE8',
                  color: C.gold,
                }}
              >
                <Icon
                  path={icons.percent}
                  size={16}
                />
              </div>
            </div>

            <div style={S.metVal}>
              {placementRate}%
            </div>

            <Delta
              pct={rateDeltaPts}
            />
          </div>
        </div>

        {/* ==================================================
            TREND + STATUS
        ================================================== */}

        <div
          className="chartsGrid trendGrid"
          style={S.chartsGrid}
        >

          {/* TREND */}

          <div style={S.chartCard}>
            <div
              style={S.chartHeadRow}
            >
              <div>
                <div
                  style={S.chartTitle}
                >
                  Placement Trends
                </div>

                <div
                  style={S.chartSub}
                >
                  Placements vs applications
                  over time
                </div>
              </div>

              <label
                style={S.compareLabel}
              >
                Compare

                <span
                  style={{
                    ...S.toggleTrack,
                    background:
                      compare
                        ? C.accent
                        : '#E2E8F0',
                  }}
                  onClick={() =>
                    setCompare(
                      (value) =>
                        !value
                    )
                  }
                >
                  <span
                    style={{
                      ...S.toggleThumb,
                      transform:
                        compare
                          ? 'translateX(16px)'
                          : 'translateX(0)',
                    }}
                  />
                </span>
              </label>
            </div>

            {trendData.length >
            0 ? (
              <ResponsiveContainer
                width="100%"
                height={260}
              >
                <LineChart
                  data={trendData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={
                      C.border
                    }
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    tick={{
                      fontSize: 11,
                      fontWeight: 600,
                      fill: C.sub,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fontSize: 11,
                      fill: C.sub,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius:
                        '10px',
                      border:
                        `1px solid ${C.border}`,
                      fontSize:
                        '13px',
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke={
                      C.accent
                    }
                    strokeWidth={3}
                    dot={false}
                    name="Applications"
                  />

                  {compare && (
                    <Line
                      type="monotone"
                      dataKey="placements"
                      stroke={
                        C.navy
                      }
                      strokeWidth={3}
                      dot={false}
                      name="Placements"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={S.noData}
              >
                No trend data available
              </div>
            )}
          </div>

          {/* STATUS */}

          <div style={S.chartCard}>
            <div
              style={S.chartTitle}
            >
              Applications by Status
            </div>

            <div
              style={S.chartSub}
            >
              Share of total applications
            </div>

            {statusData.length >
            0 ? (
              <>
                <ResponsiveContainer
                  width="100%"
                  height={230}
                >
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map(
                        (
                          entry,
                          index
                        ) => (
                          <Cell
                            key={index}
                            fill={
                              entry.color
                            }
                            stroke="none"
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        borderRadius:
                          '10px',
                        border:
                          `1px solid ${C.border}`,
                        fontSize:
                          '13px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div
                  style={
                    S.legendWrap
                  }
                >
                  {statusData.map(
                    (item, index) => (
                      <div
                        key={index}
                        style={
                          S.legendItem
                        }
                      >
                        <span
                          style={{
                            ...S.legendDot,
                            background:
                              item.color,
                          }}
                        />

                        {item.name}

                        <span
                          style={{
                            color:
                              C.sub,
                          }}
                        >
                          ({item.value})
                        </span>
                      </div>
                    )
                  )}
                </div>
              </>
            ) : (
              <div
                style={S.noData}
              >
                No application data yet
              </div>
            )}
          </div>
        </div>

        {/* ==================================================
            COMPANY + PLACEMENTS TABLE
        ================================================== */}

        <div
          className="chartsGrid companyGrid"
          style={{
            ...S.chartsGrid,
            marginTop: '20px',
          }}
        >

          {/* COMPANY */}

          <div style={S.chartCard}>
            <div
              style={S.chartTitle}
            >
              Applications by Company
            </div>

            <div
              style={S.chartSub}
            >
              Which companies receive the
              most applications
            </div>

            {companyData.length >
            0 ? (
              <ResponsiveContainer
                width="100%"
                height={260}
              >
                <BarChart
                  data={companyData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={
                      C.border
                    }
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 11,
                      fontWeight: 600,
                      fill: C.sub,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fontSize: 11,
                      fill: C.sub,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius:
                        '10px',
                      border:
                        `1px solid ${C.border}`,
                      fontSize:
                        '13px',
                    }}
                  />

                  <Bar
                    dataKey="count"
                    fill={C.accent}
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                    name="Applications"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={S.noData}
              >
                No company data available
              </div>
            )}
          </div>

          {/* TABLE */}

          <div style={S.chartCard}>
            <div
              style={S.chartHeadRow}
            >
              <div>
                <div
                  style={S.chartTitle}
                >
                  Recent Placements
                </div>

                <div
                  style={S.chartSub}
                >
                  Latest applications by status
                </div>
              </div>

              <div
                style={S.tabGroup}
              >
                <button
                  className={`tabBtn ${
                    tableTab ===
                    'placements'
                      ? 'active'
                      : ''
                  }`}
                  style={S.tabBtn}
                  onClick={() =>
                    setTableTab(
                      'placements'
                    )
                  }
                >
                  Placements
                </button>

                <button
                  className={`tabBtn ${
                    tableTab ===
                    'pending'
                      ? 'active'
                      : ''
                  }`}
                  style={S.tabBtn}
                  onClick={() =>
                    setTableTab(
                      'pending'
                    )
                  }
                >
                  Pending
                </button>
              </div>
            </div>

            {tableRows.length ===
            0 ? (
              <div
                style={S.noData}
              >
                Nothing here yet
              </div>
            ) : (
              <div
                style={{
                  overflowX:
                    'auto',
                }}
              >
                <table
                  style={S.table}
                >
                  <thead>
                    <tr>
                      <th
                        style={S.th}
                      >
                        Student
                      </th>

                      <th
                        style={S.th}
                      >
                        Company
                      </th>

                      <th
                        style={S.th}
                      >
                        Status
                      </th>

                      <th
                        style={
                          S.th
                        }
                      />
                    </tr>
                  </thead>

                  <tbody>
                    {tableRows.map(
                      (
                        row,
                        index
                      ) => {
                        const name =
                          row
                            .profiles
                            ?.full_name ||
                          row
                            .profiles
                            ?.name ||
                          'Unknown'

                        const badge =
                          statusBadge(
                            row.status
                          )

                        const rowKey =
                          row.id ??
                          index

                        return (
                          <tr
                            key={
                              rowKey
                            }
                            className="rowHover"
                          >
                            <td
                              style={
                                S.td
                              }
                            >
                              <div
                                style={
                                  S.studentCell
                                }
                              >
                                <div
                                  style={
                                    S.rowAvatar
                                  }
                                >
                                  {initials(
                                    name
                                  )}
                                </div>

                                <span>
                                  {name}
                                </span>
                              </div>
                            </td>

                            <td
                              style={
                                S.td
                              }
                            >
                              {row.jobs
                                ?.company ||
                                'Unknown'}
                            </td>

                            <td
                              style={
                                S.td
                              }
                            >
                              <span
                                style={{
                                  ...S.badge,
                                  background:
                                    badge.bg,
                                  color:
                                    badge.fg,
                                }}
                              >
                                {
                                  badge.label
                                }
                              </span>
                            </td>

                            <td
                              style={{
                                ...S.td,
                                textAlign:
                                  'right',
                              }}
                            >
                              <button
                                className="starBtn"
                                onClick={() =>
                                  setStarred(
                                    (
                                      current
                                    ) => ({
                                      ...current,
                                      [rowKey]:
                                        !current[
                                          rowKey
                                        ],
                                    })
                                  )
                                }
                              >
                                <Icon
                                  path={
                                    icons.star
                                  }
                                  size={16}
                                  stroke={
                                    starred[
                                      rowKey
                                    ]
                                      ? C.gold
                                      : C.sub
                                  }
                                  fill={
                                    starred[
                                      rowKey
                                    ]
                                      ? C.gold
                                      : 'none'
                                  }
                                />
                              </button>
                            </td>
                          </tr>
                        )
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================
            SKILLS + JOB TYPES
        ================================================== */}

        <div
          className="chartsGrid bottomGrid"
          style={{
            ...S.chartsGrid,
            marginTop: '20px',
          }}
        >

          {/* SKILLS */}

          <div style={S.chartCard}>
            <div
              style={S.chartTitle}
            >
              Most In-Demand Skills
            </div>

            <div
              style={S.chartSub}
            >
              Skills most requested by employers
            </div>

            {skillData.length >
            0 ? (
              <ResponsiveContainer
                width="100%"
                height={240}
              >
                <BarChart
                  data={skillData}
                  layout="vertical"
                  margin={{
                    top: 0,
                    right: 10,
                    left: 20,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={
                      C.border
                    }
                  />

                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{
                      fontSize: 11,
                      fill: C.sub,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{
                      fontSize: 11,
                      fontWeight: 600,
                      fill: C.ink,
                    }}
                    width={90}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius:
                        '10px',
                      border:
                        `1px solid ${C.border}`,
                      fontSize:
                        '13px',
                    }}
                  />

                  <Bar
                    dataKey="count"
                    radius={[
                      0,
                      6,
                      6,
                      0,
                    ]}
                    name="Jobs requiring this skill"
                  >
                    {skillData.map(
                      (
                        entry,
                        index
                      ) => (
                        <Cell
                          key={index}
                          fill={
                            DONUT_COLORS[
                              index %
                                DONUT_COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={S.noData}
              >
                No skill data available
              </div>
            )}
          </div>

          {/* JOB TYPES */}

          <div style={S.chartCard}>
            <div
              style={S.chartTitle}
            >
              Job Types Distribution
            </div>

            <div
              style={S.chartSub}
            >
              Breakdown of job types on the platform
            </div>

            {typeData.length >
            0 ? (
              <ResponsiveContainer
                width="100%"
                height={240}
              >
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({
                      name,
                      value,
                    }) =>
                      `${name}: ${value}`
                    }
                  >
                    {typeData.map(
                      (
                        entry,
                        index
                      ) => (
                        <Cell
                          key={index}
                          fill={
                            DONUT_COLORS[
                              index %
                                DONUT_COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      borderRadius:
                        '10px',
                      border:
                        `1px solid ${C.border}`,
                      fontSize:
                        '13px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={S.noData}
              >
                No job data yet
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// ============================================================
// STYLES
// ============================================================

const S = {
  // ----------------------------------------------------------
  // APP
  // ----------------------------------------------------------

  app: {
    minHeight: '100vh',
    width: '100%',
    background: C.bg,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: 'flex',
    alignItems: 'stretch',
  },

  loadingPage: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: C.bg,
  },

  loadingText: {
    fontSize: '16px',
    color: C.sub,
    fontWeight: '600',
  },

  // ----------------------------------------------------------
  // SIDEBAR
  // ----------------------------------------------------------

  sidebar: {
    width: '358px',
    minWidth: '232px',
    flexShrink: 0,

    background: C.sidebar,

    borderRight:
      `1px solid ${C.border}`,

    display: 'flex',
    flexDirection: 'column',

    padding: '22px 16px',

    position: 'sticky',
    top: 0,

    height: '100vh',

    boxSizing: 'border-box',

    overflowY: 'auto',
  },

  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0 8px',
    marginBottom: '28px',
  },

  logoMark: {
    width: '30px',
    height: '30px',
    borderRadius: '9px',
    background: C.ink,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  logoText: {
    fontSize: '17px',
    fontWeight: '800',
    color: C.ink,
    letterSpacing: '-0.4px',
  },

  navList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },

  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',

    width: '100%',

    padding: '10px 12px',

    borderRadius: '10px',

    border: 'none',

    background: 'transparent',

    color: C.navText,

    fontSize: '14px',
    fontWeight: '600',

    cursor: 'pointer',

    textAlign: 'left',

    boxSizing: 'border-box',
  },

  navItemActive: {
    background: C.navActiveBg,
    color: C.navActiveText,
  },

  navBadge: {
    minWidth: '22px',
    height: '22px',

    padding: '0 6px',

    borderRadius: '7px',

    background: '#DC2626',

    color: '#fff',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    fontSize: '11px',
    fontWeight: '800',

    boxSizing: 'border-box',
  },

  sidebarFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',

    padding: '12px 10px',

    borderTop:
      `1px solid ${C.border}`,

    marginTop: '10px',

    minWidth: 0,
  },

  userAvatar: {
    width: '34px',
    height: '34px',

    borderRadius: '10px',

    background: '#F1F5F9',
    color: C.ink,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    fontSize: '12px',
    fontWeight: '700',

    flexShrink: 0,
  },

  userName: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: C.ink,

    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  userRole: {
    fontSize: '12px',
    color: C.sub,
  },

  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    gap: '7px',

    marginTop: '10px',

    padding: '10px',

    background: 'transparent',

    border:
      `1px solid ${C.border}`,

    borderRadius: '10px',

    cursor: 'pointer',

    fontSize: '13px',
    fontWeight: '700',

    color: C.navText,

    flexShrink: 0,
  },

  // ----------------------------------------------------------
  // MAIN
  // ----------------------------------------------------------

  main: {
    flex: 1,

    minWidth: 0,

    width: '100%',

    padding: '32px 32px 60px',

    boxSizing: 'border-box',

    overflow: 'hidden',
  },

  headRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',

    flexWrap: 'wrap',

    gap: '16px',

    marginBottom: '26px',
  },

  heading: {
    fontSize: '25px',
    fontWeight: '800',

    color: C.ink,

    margin: '0 0 5px',

    letterSpacing: '-0.5px',
  },

  headSub: {
    fontSize: '14px',
    color: C.sub,
    margin: 0,
  },

  headControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',

    flexWrap: 'wrap',
  },

  categoryDropdown: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',

    padding: '9px 14px',

    borderRadius: '10px',

    border:
      `1px solid ${C.border}`,

    background: '#fff',

    fontSize: '13px',
    fontWeight: '600',

    color: C.ink,

    cursor: 'pointer',
  },

  rangeGroup: {
    display: 'flex',
    gap: '2px',

    background: '#F1F5F9',

    borderRadius: '10px',

    padding: '3px',
  },

  rangeBtn: {
    padding: '7px 13px',

    border: 'none',

    background: 'transparent',

    borderRadius: '8px',

    fontSize: '13px',

    fontWeight: '700',

    color: C.navText,

    cursor: 'pointer',
  },

  iconBtn: {
    width: '36px',
    height: '36px',

    borderRadius: '10px',

    border:
      `1px solid ${C.border}`,

    background: '#fff',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    cursor: 'pointer',

    color: C.navText,
  },

  // ----------------------------------------------------------
  // METRICS
  // ----------------------------------------------------------

  metricsGrid: {
    display: 'grid',

    gridTemplateColumns:
      'repeat(4, minmax(0, 1fr))',

    gap: '16px',

    marginBottom: '22px',
  },

  metCard: {
    background: C.card,

    borderRadius: '16px',

    padding: '20px',

    border:
      `1px solid ${C.border}`,

    boxShadow:
      '0 2px 8px rgba(15,23,42,0.04)',

    minWidth: 0,
  },

  metTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',

    marginBottom: '14px',
  },

  metIcon: {
    width: '32px',
    height: '32px',

    borderRadius: '9px',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    flexShrink: 0,
  },

  metVal: {
    fontSize: '28px',

    fontWeight: '800',

    color: C.ink,

    marginBottom: '8px',

    letterSpacing: '-0.5px',
  },

  metLabel: {
    fontSize: '13px',

    color: C.sub,

    fontWeight: '600',
  },

  deltaPill: {
    display: 'inline-flex',

    alignItems: 'center',

    gap: '4px',

    fontSize: '12px',

    fontWeight: '700',

    padding: '3px 8px',

    borderRadius: '20px',
  },

  // ----------------------------------------------------------
  // CHARTS
  // ----------------------------------------------------------

  chartsGrid: {
    display: 'grid',

    gridTemplateColumns:
      'minmax(0, 1.6fr) minmax(0, 1fr)',

    gap: '20px',

    minWidth: 0,
  },

  chartCard: {
    background: C.card,

    borderRadius: '16px',

    padding: '22px',

    border:
      `1px solid ${C.border}`,

    boxShadow:
      '0 2px 8px rgba(15,23,42,0.04)',

    minWidth: 0,

    overflow: 'hidden',
  },

  chartHeadRow: {
    display: 'flex',

    justifyContent: 'space-between',

    alignItems: 'flex-start',

    gap: '12px',

    marginBottom: '6px',
  },

  chartTitle: {
    fontSize: '15px',

    fontWeight: '800',

    color: C.ink,

    marginBottom: '4px',
  },

  chartSub: {
    fontSize: '12.5px',

    color: C.sub,

    marginBottom: '18px',
  },

  noData: {
    height: '200px',

    display: 'flex',

    alignItems: 'center',

    justifyContent: 'center',

    color: C.sub,

    fontSize: '14px',
  },

  compareLabel: {
    display: 'flex',

    alignItems: 'center',

    gap: '8px',

    fontSize: '13px',

    fontWeight: '600',

    color: C.navText,

    flexShrink: 0,
  },

  toggleTrack: {
    width: '32px',
    height: '18px',

    borderRadius: '10px',

    position: 'relative',

    cursor: 'pointer',

    display: 'inline-block',

    transition:
      'background .15s ease',
  },

  toggleThumb: {
    position: 'absolute',

    top: '2px',
    left: '2px',

    width: '14px',
    height: '14px',

    borderRadius: '50%',

    background: '#fff',

    transition:
      'transform .15s ease',

    boxShadow:
      '0 1px 2px rgba(0,0,0,0.2)',
  },

  legendWrap: {
    display: 'flex',

    flexWrap: 'wrap',

    gap: '10px 16px',

    justifyContent: 'center',

    marginTop: '4px',
  },

  legendItem: {
    display: 'flex',

    alignItems: 'center',

    gap: '6px',

    fontSize: '12.5px',

    fontWeight: '600',

    color: C.ink,
  },

  legendDot: {
    width: '8px',
    height: '8px',

    borderRadius: '50%',

    display: 'inline-block',
  },

  // ----------------------------------------------------------
  // TABLE
  // ----------------------------------------------------------

  tabGroup: {
    display: 'flex',

    gap: '2px',

    background: '#F1F5F9',

    borderRadius: '9px',

    padding: '3px',

    flexShrink: 0,
  },

  tabBtn: {
    padding: '6px 12px',

    border: 'none',

    background: 'transparent',

    borderRadius: '7px',

    fontSize: '12.5px',

    fontWeight: '700',

    color: C.navText,

    cursor: 'pointer',
  },

  table: {
    width: '100%',

    borderCollapse: 'collapse',

    minWidth: '480px',
  },

  th: {
    textAlign: 'left',

    fontSize: '11.5px',

    fontWeight: '700',

    color: C.sub,

    textTransform: 'uppercase',

    letterSpacing: '0.03em',

    padding: '0 8px 10px',

    borderBottom:
      `1px solid ${C.border}`,
  },

  td: {
    padding: '12px 8px',

    fontSize: '13.5px',

    color: C.ink,

    borderBottom:
      `1px solid ${C.border}`,

    fontWeight: '600',
  },

  studentCell: {
    display: 'flex',

    alignItems: 'center',

    gap: '10px',
  },

  rowAvatar: {
    width: '28px',
    height: '28px',

    borderRadius: '50%',

    background: '#F1F5F9',

    color: C.ink,

    fontSize: '11px',

    fontWeight: '700',

    display: 'flex',

    alignItems: 'center',

    justifyContent: 'center',

    flexShrink: 0,
  },

  badge: {
    fontSize: '11.5px',

    fontWeight: '700',

    padding: '4px 10px',

    borderRadius: '20px',

    display: 'inline-block',
  },
}