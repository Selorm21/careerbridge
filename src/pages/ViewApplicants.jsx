// src/pages/ViewApplicants.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useParams, useNavigate } from 'react-router-dom'
import VerifiedBadge, { isStudentFullyVerified } from '../components/VerifiedBadge'

const Icon = ({ path, size = 18, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {path}
  </svg>
)
const icons = {
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.3 3-6 6.5-6s6.5 2.7 6.5 6" /><path d="M16 8.2a3 3 0 1 1 3.6 3M21.5 20c0-2.6-1.8-4.8-4.3-5.6" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  x: <><path d="M18 6L6 18" /><path d="M6 6l12 12" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
  sparkle: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></>,
  back: <path d="M19 12H5M12 19l-7-7 7-7" />,
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
  purple: '#7C3AED',
}

export default function ViewApplicants() {
  const { jobId } = useParams()
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // --- AI ranking state ---
  const [ranking, setRanking] = useState(false)
  const [rankedResults, setRankedResults] = useState(null) // null = not showing ranked view
  const [rankError, setRankError] = useState('')

  useEffect(() => {
    async function getData() {
      setLoading(true)

      // Fetch the single job this page is for
      const { data: jobData } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single()
      setJob(jobData || null)

      // Fetch only this job's applications, joined with applicant profiles
      const { data: appsData } = await supabase
        .from('applications')
        .select('*, profiles(id, full_name, email, university, course, graduation_year, skills, bio, verified)')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })

      // Fetch verification status for each applicant using shared helper
      const appsWithVerification = await Promise.all((appsData || []).map(async (app) => {
        const { data: docs } = await supabase
          .from('documents')
          .select('doc_type, status')
          .eq('student_id', app.profiles?.id)

        return { ...app, isFullyVerified: isStudentFullyVerified(docs) }
      }))

      setApplications(appsWithVerification || [])
      setLoading(false)
    }
    if (jobId) getData()
  }, [jobId])

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

  const scoreColor = (score) => {
    if (score >= 80) return { color: '#059669', bg: '#ECFDF5' }
    if (score >= 60) return { color: '#D97706', bg: '#FFFBEB' }
    if (score >= 40) return { color: '#2563EB', bg: '#EFF6FF' }
    return { color: '#DC2626', bg: '#FEF2F2' }
  }

  // Filter applicants for this job by name/university/course
  const filteredApps = applications.filter(app => {
    const searchTerm = search.toLowerCase()
    return (
      app.profiles?.full_name?.toLowerCase().includes(searchTerm) ||
      app.profiles?.university?.toLowerCase().includes(searchTerm) ||
      app.profiles?.course?.toLowerCase().includes(searchTerm)
    )
  })

  async function handleRankCandidates() {
    setRanking(true)
    setRankError('')
    setRankedResults(null)

    try {
      const { data, error } = await supabase.functions.invoke('rank-candidates', {
        body: { job_id: jobId },
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)

      // Defensive sort — best score first — in case the function ever returns unsorted
      const sorted = [...(data.ranked || [])].sort((a, b) => b.score - a.score)
      setRankedResults({ ...data, ranked: sorted })
    } catch (err) {
      setRankError(err.message || 'Something went wrong ranking candidates.')
    } finally {
      setRanking(false)
    }
  }

  function handleBackToList() {
    setRankedResults(null)
    setRankError('')
  }

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .pageIn{animation:fadeUp .6s cubic-bezier(.16,1,.3,1) forwards}
        .appRow{transition:all .2s ease}
        .appRow:hover{background:#FAFBFC!important;border-color:#D9DEE8!important}
        .rankCard{transition:all .2s ease}
        .rankCard:hover{box-shadow:0 4px 12px rgba(16,24,40,.06)!important;transform:translateY(-1px)}
        .spinner{animation:spin .8s linear infinite}
        @media(max-width:768px){ .main{padding:20px 16px!important} .tableWrap{overflow-x:auto!important} .rankBar{flex-direction:column;align-items:stretch!important} }
      `}</style>

      <div className="pageIn main" style={S.main}>
        <button style={S.backLink} onClick={() => navigate('/employer/applicants')}>
          <Icon path={icons.back} size={14} /> All Applicants
        </button>

        <div style={S.topBar}>
          <div>
            <h1 style={S.heading}>{job?.title || 'Applicants'}</h1>
            <p style={S.headSub}>
              {job?.company ? `${job.company} · ` : ''}
              {applications.length} applicant{applications.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div style={S.searchWrap}>
            <span style={{ color: C.sub, display: 'flex' }}><Icon path={icons.search} size={16} /></span>
            <input style={S.searchInput} type="text" placeholder="Search applicants..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* --- AI Ranking Bar --- */}
        {!loading && applications.length > 0 && (
          <div className="rankBar" style={S.rankBar}>
            <div style={S.rankBarLeft}>
              <span style={S.rankIcon}><Icon path={icons.sparkle} size={16} /></span>
              <span style={S.rankBarText}>Let AI score and rank these candidates against the job description.</span>
            </div>
            <button
              style={{ ...S.rankBtn, opacity: ranking ? 0.7 : 1, cursor: ranking ? 'not-allowed' : 'pointer' }}
              onClick={handleRankCandidates}
              disabled={ranking}
            >
              {ranking ? (
                <><span className="spinner" style={S.spinnerIcon}><Icon path={icons.clock} size={14} /></span> Ranking…</>
              ) : (
                <><Icon path={icons.sparkle} size={14} /> Rank with AI</>
              )}
            </button>
          </div>
        )}

        {rankError && (
          <div style={S.rankErrorBox}>
            Couldn't rank candidates: {rankError}
          </div>
        )}

        {/* --- Ranked Results View --- */}
        {rankedResults && (
          <div style={{ marginBottom: '28px' }}>
            <div style={S.rankedHeader}>
              <button style={S.toggleBtn} onClick={handleBackToList}>
                <Icon path={icons.back} size={14} /> Back to applicant list
              </button>
              <div style={S.rankedTitle}>
                AI ranking · {rankedResults.ranked.length} candidate{rankedResults.ranked.length !== 1 ? 's' : ''}, best match first
              </div>
            </div>

            {rankedResults.ranked.length === 0 && (
              <div style={S.empty}>
                <div style={S.emptyTitle}>No candidates to rank</div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {rankedResults.ranked.map((r, i) => {
                const sc = scoreColor(r.score)
                const badge = getStatusBadge(r.status)
                return (
                  <div key={r.application_id} className="rankCard" style={S.rankCard}>
                    <div style={S.rankNumber}>{i + 1}</div>
                    <div style={S.avatar}>{initials(r.profile?.full_name)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={S.studentName}>
                        {r.profile?.full_name || 'Unknown'}
                        {r.profile?.verified && <VerifiedBadge size={14} />}
                      </div>
                      <div style={S.studentSub}>
                        {r.profile?.university || 'No university listed'}
                        {r.profile?.course ? ` · ${r.profile.course}` : ''}
                      </div>
                      <div style={S.reasoning}>{r.reasoning}</div>
                    </div>
                    <span style={{ ...S.badge, background: badge.bg, color: badge.color, flexShrink: 0 }}>
                      <Icon path={badge.icon} size={14} /> {badge.label}
                    </span>
                    <div style={{ ...S.scorePill, background: sc.bg, color: sc.color }}>{r.score}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* --- Normal applicant list (hidden while viewing ranked results) --- */}
        {!rankedResults && (
          <>
            {loading && <div style={S.loading}>Loading applicants...</div>}

            {!loading && filteredApps.length === 0 && (
              <div style={S.empty}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}><Icon path={icons.users} size={48} color={C.sub} /></div>
                <div style={S.emptyTitle}>No applicants found</div>
                <div style={S.emptySub}>{search ? 'Try a different search term.' : 'No one has applied to this job yet.'}</div>
              </div>
            )}

            {!loading && filteredApps.length > 0 && (
              <div style={S.tableWrap} className="tableWrap">
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>Applicant</th>
                      <th style={S.th}>University / Course</th>
                      <th style={S.th}>Applied On</th>
                      <th style={S.th}>Status</th>
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
                                <div style={S.studentName}>
                                  {app.profiles?.full_name || 'Unknown'}
                                  {app.isFullyVerified && <VerifiedBadge size={14} />}
                                </div>
                                <div style={S.studentSub}>{app.profiles?.email || 'No email'}</div>
                              </div>
                            </div>
                          </td>
                          <td style={S.td}>
                            <div style={{ fontWeight: 600, color: C.ink }}>{app.profiles?.university || '—'}</div>
                            <div style={{ color: C.sub, fontSize: '13px' }}>{app.profiles?.course || ''}</div>
                          </td>
                          <td style={S.td}><div style={S.dateBadge}>{formatDate(app.created_at)}</div></td>
                          <td style={S.td}>
                            <span style={{ ...S.badge, background: badge.bg, color: badge.color }}>
                              <Icon path={badge.icon} size={14} /> {badge.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: C.bg, fontFamily: "'Inter', -apple-system, sans-serif" },
  main: { maxWidth: '1280px', margin: '0 auto', padding: '32px 32px 60px', width: '100%' },
  backLink: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0', marginBottom: '16px', background: 'transparent', border: 'none', color: C.sub, fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
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
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '600px' },
  th: { textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.8px', background: '#FAFBFC', borderBottom: `1px solid ${C.border}` },
  tr: { borderBottom: `1px solid ${C.border}` },
  td: { padding: '16px 20px', fontSize: '14px', color: C.ink, verticalAlign: 'middle', borderBottom: `1px solid ${C.border}` },
  studentCell: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#F1F5F9', color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, flexShrink: 0 },
  studentName: { fontSize: '14px', fontWeight: 700, color: C.ink, display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' },
  studentSub: { fontSize: '12px', color: C.sub, marginTop: '2px' },
  dateBadge: { fontSize: '13px', color: C.sub, fontWeight: 500 },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' },

  // --- AI ranking ---
  rankBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: '14px', padding: '14px 16px', marginBottom: '20px', boxShadow: '0 1px 2px rgba(16,24,40,.03)' },
  rankBarLeft: { display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 },
  rankIcon: { color: C.purple, display: 'flex', flexShrink: 0 },
  rankBarText: { fontSize: '13px', color: C.sub },
  rankBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: `linear-gradient(135deg, ${C.purple}, #6D28D9)`, border: 'none', borderRadius: '10px', color: '#FFF', fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap' },
  spinnerIcon: { display: 'flex' },
  rankErrorBox: { background: '#FEF2F2', border: '1px solid #FECACA', color: C.red, borderRadius: '10px', padding: '12px 16px', fontSize: '14px', marginBottom: '20px' },
  rankedHeader: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px', flexWrap: 'wrap' },
  toggleBtn: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.ink, fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
  rankedTitle: { fontSize: '14px', color: C.sub },
  rankCard: { display: 'flex', alignItems: 'center', gap: '14px', background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: '14px', padding: '14px 18px', boxShadow: '0 1px 2px rgba(16,24,40,.03)' },
  rankNumber: { width: '28px', height: '28px', borderRadius: '8px', background: '#F1F5F9', color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, flexShrink: 0 },
  reasoning: { fontSize: '13px', color: C.sub, marginTop: '4px', lineHeight: 1.4 },
  scorePill: { minWidth: '48px', textAlign: 'center', padding: '8px 4px', borderRadius: '10px', fontSize: '16px', fontWeight: 800, flexShrink: 0 },
}
