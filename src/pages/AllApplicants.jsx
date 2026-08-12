// src/pages/AllApplicants.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

const Icon = ({ path, size = 18, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {path}
  </svg>
)
const icons = {
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.3 3-6 6.5-6s6.5 2.7 6.5 6" /><path d="M16 8.2a3 3 0 1 1 3.6 3M21.5 20c0-2.6-1.8-4.8-4.3-5.6" /></>,
  file: <><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v5h5" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  x: <><path d="M18 6L6 18" /><path d="M6 6l12 12" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
}

const C = {
  ink: '#0F172A',
  sub: '#64748B',
  border: '#E2E8F0',
  card: '#FFFFFF',
  bg: '#F8FAFC',
  accent: '#EA4E1B',
  green: '#10B981',
  amber: '#F59E0B',
  blue: '#2563EB',
  red: '#DC2626',
}

export default function AllApplicants() {
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Fetch all jobs for this employer
      const { data: jobsData } = await supabase.from('jobs').select('*').eq('employer_id', user.id)
      setJobs(jobsData || [])

      if (jobsData && jobsData.length > 0) {
        const jobIds = jobsData.map(j => j.id)
        // Fetch all applications for these jobs, including student profile info
        const { data: appsData } = await supabase
          .from('applications')
          .select('*, profiles(full_name, email, university, course), jobs(title, company)')
          .in('job_id', jobIds)
          .order('created_at', { ascending: false })
          
        setApplications(appsData || [])
      }
      setLoading(false)
    }
    getData()
  }, [])

  const getStatusBadge = (status) => {
    const styles = {
      applied: { bg: '#EFF6FF', color: C.blue, icon: icons.clock, label: 'Applied' },
      interview: { bg: '#FFFBEB', color: C.amber, icon: icons.users, label: 'Interview' },
      offer: { bg: '#ECFDF5', color: C.green, icon: icons.check, label: 'Offer' },
      rejected: { bg: '#FEF2F2', color: C.red, icon: icons.x, label: 'Rejected' },
    }
    return styles[status] || styles.applied
  }

  const initials = (name) => (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Filter applications based on search
  const filteredApps = applications.filter(app => {
    const searchTerm = search.toLowerCase()
    return (
      app.profiles?.full_name?.toLowerCase().includes(searchTerm) ||
      app.jobs?.title?.toLowerCase().includes(searchTerm) ||
      app.jobs?.company?.toLowerCase().includes(searchTerm)
    )
  })

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        .pageIn{animation:fadeUp .6s cubic-bezier(.16,1,.3,1) forwards}
        .appRow{transition:all .2s ease}
        .appRow:hover{background:#FAFBFC!important;border-color:#D9DEE8!important}
        @media(max-width:768px){ .main{padding:20px 16px!important} .tableWrap{overflow-x:auto!important} }
      `}</style>

      <div className="pageIn main" style={S.main}>
        <div style={S.topBar}>
          <div>
            <h1 style={S.heading}>All Applicants</h1>
            <p style={S.headSub}>Review and manage candidates across all your job listings.</p>
          </div>
          <div style={S.searchWrap}>
            <span style={{ color: C.sub, display: 'flex' }}><Icon path={icons.search} size={16} /></span>
            <input style={S.searchInput} type="text" placeholder="Search by name, job, or company..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading && <div style={S.loading}>Loading applicants...</div>}

        {!loading && filteredApps.length === 0 && (
          <div style={S.empty}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}><Icon path={icons.users} size={48} color={C.sub} /></div>
            <div style={S.emptyTitle}>No applicants found</div>
            <div style={S.emptySub}>{search ? 'Try a different search term.' : 'Start posting jobs to receive applications.'}</div>
          </div>
        )}

        {!loading && filteredApps.length > 0 && (
          <div style={S.tableWrap} className="tableWrap">
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Applicant</th>
                  <th style={S.th}>Job Applied</th>
                  <th style={S.th}>Applied On</th>
                  <th style={S.th}>Status</th>
                  <th style={S.th}></th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => {
                  const badge = getStatusBadge(app.status)
                  return (
                    <tr key={app.id} className="appRow" style={S.tr}>
                      <td style={S.td}>
                        <div style={S.studentCell}>
                          <div style={S.avatar}>{initials(app.profiles?.full_name)}</div>
                          <div>
                            <div style={S.studentName}>{app.profiles?.full_name || 'Unknown'}</div>
                            <div style={S.studentSub}>{app.profiles?.university || app.profiles?.email || 'No details'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={S.td}>
                        <div style={{ fontWeight: 600, color: C.ink }}>{app.jobs?.title || 'Untitled'}</div>
                        <div style={{ color: C.sub, fontSize: '13px' }}>{app.jobs?.company || ''}</div>
                      </td>
                      <td style={S.td}><div style={S.dateBadge}>{formatDate(app.created_at)}</div></td>
                      <td style={S.td}>
                        <span style={{ ...S.badge, background: badge.bg, color: badge.color }}>
                          <Icon path={badge.icon} size={14} /> {badge.label}
                        </span>
                      </td>
                      <td style={{ ...S.td, textAlign: 'right' }}>
                        <button style={S.viewBtn} onClick={() => navigate(`/employer/applicants/${app.job_id}`)}>
                          View Job <Icon path={icons.chevron} size={14} />
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
  )
}

const S = {
  page: { minHeight: '100vh', background: C.bg, fontFamily: "'Inter', -apple-system, sans-serif" },
  main: { maxWidth: '1280px', margin: '0 auto', padding: '32px 32px 60px', width: '100%' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' },
  heading: { fontSize: '28px', fontWeight: '900', color: C.ink, marginBottom: '6px', letterSpacing: '-1px' },
  headSub: { fontSize: '15px', color: C.sub },
  searchWrap: { display: 'flex', alignItems: 'center', gap: '10px', background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '0 16px', boxShadow: '0 1px 2px rgba(16,24,40,.03)' },
  searchInput: { border: 'none', outline: 'none', padding: '12px 0', fontSize: '14px', background: 'transparent', width: '240px', color: C.ink },
  loading: { padding: '60px 0', textAlign: 'center', color: C.sub, fontSize: '15px' },
  empty: { textAlign: 'center', padding: '80px 0', color: C.sub },
  emptyTitle: { fontSize: '18px', fontWeight: '700', color: C.ink, marginBottom: '4px' },
  emptySub: { fontSize: '14px', color: C.sub },
  tableWrap: { background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: '16px', boxShadow: '0 1px 2px rgba(16,24,40,.03)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '700px' },
  th: { textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.8px', background: '#FAFBFC', borderBottom: `1px solid ${C.border}` },
  tr: { borderBottom: `1px solid ${C.border}` },
  td: { padding: '16px 20px', fontSize: '14px', color: C.ink, verticalAlign: 'middle', borderBottom: `1px solid ${C.border}` },
  studentCell: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#F1F5F9', color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, flexShrink: 0 },
  studentName: { fontSize: '14px', fontWeight: 700, color: C.ink },
  studentSub: { fontSize: '12px', color: C.sub, marginTop: '2px' },
  dateBadge: { fontSize: '13px', color: C.sub, fontWeight: 500 },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' },
  viewBtn: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '8px', color: C.sub, fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' },
}