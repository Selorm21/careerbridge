import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import { calculateMatchScore, getScoreColor } from '../matchScore'
import { sendEmail, applicationSubmittedEmail } from '../emailService'

// ---------- inline icon set (shared visual language with Analytics) ----------
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
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
  pin: <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.3" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></>,
  alert: <><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9L2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  chevron: <path d="M6 9l6 6 6-6" />,
}

const C = {
  bg: '#F8F9FB',
  ink: '#0F172A',
  sub: '#94A3B8',
  border: '#EEF1F5',
  card: '#FFFFFF',
  navActiveBg: '#111827',
  navActiveText: '#FFFFFF',
  navText: '#475569',
  accent: '#EA4E1B',
  teal: '#0E9C8F',
  navy: '#0B3B57',
  gold: '#F0A93A',
  green: '#0E9C6B',
  red: '#DC2626',
  blue: '#2563EB',
}

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [applying, setApplying] = useState(null)
  const [success, setSuccess] = useState('')
  const [appliedJobs, setAppliedJobs] = useState([])
  const [studentSkills, setStudentSkills] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: jobsData } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
      if (!mounted) return
      setJobs(jobsData || [])
      const { data: appsData } = await supabase.from('applications').select('job_id').eq('student_id', user.id)
      if (!mounted) return
      setAppliedJobs(appsData?.map(a => a.job_id) || [])
      const { data: profileData } = await supabase.from('profiles').select('skills').eq('id', user.id).single()
      if (!mounted) return
      setStudentSkills(profileData?.skills || '')
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [])

  async function applyForJob(jobId, jobSkills) {
    setApplying(jobId)
    const { data: { user } } = await supabase.auth.getUser()
    const { score, matched, missing } = calculateMatchScore(studentSkills, jobSkills)
    const { error } = await supabase.from('applications').insert({
      job_id: jobId,
      student_id: user.id,
      status: 'applied',
      match_score: score,
      match_details: { matched, missing }
    })
    if (error) { alert('Error: ' + error.message) }
    else {
      setAppliedJobs(prev => [...prev, jobId])
      setSuccess('Application submitted!')
      setTimeout(() => setSuccess(''), 3000)
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profileData } = await supabase.from('profiles').select('full_name, email').eq('id', user.id).single()
      const job = jobs.find(j => j.id === jobId)
      if (profileData?.email) {
        const { subject, message } = applicationSubmittedEmail(profileData.full_name, job?.title, job?.company)
        await sendEmail(profileData.email, subject, message)
      }
    }
    setApplying(null)
  }

  const filtered = jobs.filter(job => {
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.skills.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || job.type === filter
    return matchSearch && matchFilter
  }).sort((a, b) => {
    const scoreA = calculateMatchScore(studentSkills, a.skills).score
    const scoreB = calculateMatchScore(studentSkills, b.skills).score
    return scoreB - scoreA
  })

  const initials = (name) => (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .pageIn{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) forwards}
        .jobCard{transition:all .25s ease}
        .jobCard:hover{transform:translateY(-4px);box-shadow:0 16px 36px rgba(234,78,27,0.10)!important;border-color:#FFDCC7!important}
        .applyBtn{transition:all .2s ease}
        .applyBtn:hover{transform:translateY(-2px);box-shadow:0 8px 18px rgba(234,78,27,0.28)!important}
        .searchIn:focus{outline:none;border-color:${C.accent}!important;box-shadow:0 0 0 3px rgba(234,78,27,0.12)!important}
        .filterSel:focus{outline:none;border-color:${C.accent}!important}
        @media(max-width:768px){
          .searchBarEl{flex-direction:column!important}
          .jobsGridEl{grid-template-columns:1fr!important}
          .mainEl{padding:20px 16px!important}
        }
      `}</style>

      {/* ---------------- Main ---------------- */}
      <div className="pageIn mainEl" style={S.main}>
        <div style={S.pageHead}>
          <h1 style={S.heading}>Browse Jobs</h1>
          <p style={S.headSub}>
            {studentSkills
              ? `Jobs sorted by your match score based on your skills`
              : `${jobs.length} opportunities available — add your skills to see match scores`}
          </p>
        </div>

        {!studentSkills && (
          <div style={S.skillsAlert}>
            <Icon path={icons.alert} size={16} />
            Add your skills in your profile to see how well you match each job!
            <span style={S.skillsAlertLink} onClick={() => navigate('/student/profile')}>Add skills <Icon path={icons.arrow} size={13} /></span>
          </div>
        )}

        {success && <div style={S.successBanner}><Icon path={icons.check} size={16} /> {success}</div>}

        <div className="searchBarEl" style={S.searchBar}>
          <div style={S.searchWrap}>
            <span style={{ color: C.sub, display: 'flex' }}><Icon path={icons.search} size={16} /></span>
            <input className="searchIn" style={S.searchInput} type="text" placeholder="Search by title, company or skill..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={S.filterWrap}>
            <select className="filterSel" style={S.filterSelect} value={filter} onChange={e => setFilter(e.target.value)}>
              <option>All</option>
              <option>Full-time</option>
              <option>Internship</option>
              <option>Part-time</option>
              <option>Contract</option>
            </select>
          </div>
        </div>

        <div style={S.resultsLabel}>{filtered.length} result{filtered.length !== 1 ? 's' : ''} {filter !== 'All' ? `· ${filter}` : ''} {studentSkills ? '· sorted by match score' : ''}</div>

        {loading && <div style={S.empty}><div style={S.emptyIcon}>⏳</div><div>Loading jobs...</div></div>}
        {!loading && filtered.length === 0 && (
          <div style={S.empty}>
            <div style={{ color: C.sub, display: 'flex', justifyContent: 'center', marginBottom: '10px' }}><Icon path={icons.search} size={32} /></div>
            <div style={S.emptyText}>No jobs found</div>
            <div style={S.emptySub}>Try a different search or filter</div>
          </div>
        )}

        <div className="jobsGridEl" style={S.jobsGrid}>
          {filtered.map(job => {
            const { score, matched, missing } = calculateMatchScore(studentSkills, job.skills)
            const { color, bg, label } = getScoreColor(score)
            return (
              <div key={job.id} className="jobCard" style={S.jobCard}>
                <div style={S.jobCardTop}>
                  <div style={S.jobIconWrap}><Icon path={icons.briefcase} size={20} /></div>
                  <span style={{ ...S.typeBadge, ...(job.type?.includes('Internship') ? S.typeBadgeIntern : job.type?.includes('Full') ? S.typeBadgeFull : S.typeBadgeOther) }}>{job.type}</span>
                </div>

                <div style={S.jobTitle}>{job.title}</div>
                <div style={S.jobCompany}>{job.company}</div>
                <div style={S.jobLocation}><Icon path={icons.pin} size={13} /> {job.location}</div>
                <div style={S.jobDesc}>{job.description?.slice(0, 100)}{job.description?.length > 100 ? '...' : ''}</div>

                {studentSkills && (
                  <div style={{ ...S.matchBadge, background: bg, color }}>
                    <div style={S.matchScore}>{score}%</div>
                    <div>
                      <div style={S.matchLabel}>{label}</div>
                      <div style={S.matchSub}>{matched.length} of {matched.length + missing.length} skills matched</div>
                    </div>
                  </div>
                )}

                <div style={S.skillsRow}>
                  {job.skills.split(',').map((skill, i) => {
                    const isMatch = matched.includes(skill.trim().toLowerCase())
                    return (
                      <span key={i} style={{ ...S.skillChip, ...(isMatch && studentSkills ? S.skillChipMatch : {}) }}>
                        {isMatch && studentSkills ? '✓ ' : ''}{skill.trim()}
                      </span>
                    )
                  })}
                </div>

                {studentSkills && missing.length > 0 && (
                  <div style={S.missingRow}>
                    <span style={S.missingLabel}>Missing: </span>
                    {missing.map((s, i) => <span key={i} style={S.missingChip}>{s}</span>)}
                  </div>
                )}

                <div style={S.jobCardBottom}>
                  {appliedJobs.includes(job.id) ? (
                    <button style={S.appliedBtn} disabled><Icon path={icons.check} size={15} /> Applied</button>
                  ) : (
                    <button className="applyBtn" style={S.applyBtn} onClick={() => applyForJob(job.id, job.skills)} disabled={applying === job.id}>
                      {applying === job.id ? 'Applying...' : <>Apply now <Icon path={icons.arrow} size={15} /></>}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const S = {
  app: { minHeight: '100vh', background: C.bg, fontFamily: "'Inter', -apple-system, sans-serif" },

  main: { maxWidth: '1180px', margin: '0 auto', padding: '32px 32px 60px' },
  pageHead: { marginBottom: '20px' },
  heading: { fontSize: '25px', fontWeight: '800', color: C.ink, marginBottom: '6px', letterSpacing: '-0.5px' },
  headSub: { fontSize: '14px', color: C.sub },

  skillsAlert: { display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '12px 16px', fontSize: '13.5px', color: '#92400E', fontWeight: '600', marginBottom: '16px' },
  skillsAlertLink: { display: 'inline-flex', alignItems: 'center', gap: '4px', color: C.accent, cursor: 'pointer', fontWeight: '700', marginLeft: '4px' },
  successBanner: { display: 'flex', alignItems: 'center', gap: '8px', background: '#ECFDF5', color: C.green, padding: '13px 18px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', marginBottom: '20px', border: '1px solid #A7F3D0' },

  searchBar: { display: 'flex', gap: '12px', marginBottom: '16px' },
  searchWrap: { flex: 1, display: 'flex', alignItems: 'center', background: C.card, border: `1.5px solid ${C.border}`, borderRadius: '12px', padding: '0 14px', gap: '10px' },
  searchInput: { flex: 1, padding: '13px 0', border: 'none', background: 'transparent', fontSize: '14px', fontFamily: 'inherit', color: C.ink },
  filterWrap: {},
  filterSelect: { padding: '13px 16px', border: `1.5px solid ${C.border}`, borderRadius: '12px', fontSize: '14px', background: C.card, fontFamily: 'inherit', fontWeight: '600', color: C.navText, cursor: 'pointer' },
  resultsLabel: { fontSize: '13px', color: C.sub, fontWeight: '600', marginBottom: '20px' },

  jobsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' },
  jobCard: { background: C.card, borderRadius: '18px', padding: '24px', border: `1.5px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.04)', display: 'flex', flexDirection: 'column', gap: '10px' },
  jobCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  jobIconWrap: { width: '44px', height: '44px', borderRadius: '12px', background: '#FFF1EA', color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  typeBadge: { padding: '5px 13px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  typeBadgeIntern: { background: '#F5F3FF', color: '#7C3AED' },
  typeBadgeFull: { background: '#ECFDF5', color: C.teal },
  typeBadgeOther: { background: '#EFF6FF', color: C.blue },
  jobTitle: { fontSize: '16px', fontWeight: '800', color: C.ink, letterSpacing: '-0.3px' },
  jobCompany: { fontSize: '13.5px', fontWeight: '600', color: C.navText },
  jobLocation: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: C.sub },
  jobDesc: { fontSize: '13.5px', color: C.navText, lineHeight: '1.6' },
  matchBadge: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '12px' },
  matchScore: { fontSize: '24px', fontWeight: '800', minWidth: '52px' },
  matchLabel: { fontSize: '13px', fontWeight: '700' },
  matchSub: { fontSize: '11.5px', opacity: 0.8 },
  skillsRow: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  skillChip: { background: '#FFF4EE', color: C.accent, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  skillChipMatch: { background: '#ECFDF5', color: C.teal, border: '1px solid #A7F3D0' },
  missingRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' },
  missingLabel: { fontSize: '11.5px', color: C.red, fontWeight: '700' },
  missingChip: { background: '#FEF2F2', color: C.red, padding: '3px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: '600' },
  jobCardBottom: { marginTop: 'auto', paddingTop: '8px' },
  applyBtn: { width: '100%', padding: '12px', background: C.accent, color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', boxShadow: '0 4px 12px rgba(234,78,27,0.24)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
  appliedBtn: { width: '100%', padding: '12px', background: '#ECFDF5', color: C.teal, border: '1.5px solid #A7F3D0', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
  empty: { textAlign: 'center', padding: '60px 0', color: C.sub },
  emptyIcon: { fontSize: '40px', marginBottom: '12px' },
  emptyText: { fontSize: '16px', fontWeight: '700', color: C.navText, marginBottom: '6px' },
  emptySub: { fontSize: '13.5px' }
}