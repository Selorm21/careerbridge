// src/pages/MyJobListings.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import { parseJobDescription } from '../lib/jobsStore'

const Icon = ({ path, size = 18, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {path}
  </svg>
)
const icons = {
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.3 3-6 6.5-6s6.5 2.7 6.5 6" /><path d="M16 8.2a3 3 0 1 1 3.6 3M21.5 20c0-2.6-1.8-4.8-4.3-5.6" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  mapPin: <><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></>,
  trash: <><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 14h10l1-14M9 7V4h6v3" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
}

const C = {
  ink: '#0F172A', sub: '#64748B', border: '#E2E8F0',
  bg: '#F8FAFC', amber: '#F59E0B', green: '#10B981', blue: '#2563EB', red: '#DC2626',
}

export default function MyJobListings() {
  const [jobs, setJobs] = useState([])
  const [applicantCounts, setApplicantCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [toast, setToast] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: jobsData } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', user.id)
      .order('created_at', { ascending: false })

    // Enrich each job with parsed description + attachment so the row can render the thumbnail
    const enriched = (jobsData || []).map(j => {
      const parsed = parseJobDescription(j.description)
      return {
        ...j,
        description: parsed.description || j.description,
        image_attachment: parsed.imageAttachment,
        salary: parsed.salary || null,
      }
    })
    setJobs(enriched)

    if (enriched.length > 0) {
      const jobIds = enriched.map(j => j.id)
      const { data: appsData } = await supabase
        .from('applications')
        .select('job_id')
        .in('job_id', jobIds)

      const counts = {}
      ;(appsData || []).forEach(a => {
        counts[a.job_id] = (counts[a.job_id] || 0) + 1
      })
      setApplicantCounts(counts)
    } else {
      setApplicantCounts({})
    }

    setLoading(false)
  }

  async function handleDelete(job) {
    setDeleting(job.id)

    try {
      // Check for interviews scheduled against this job BEFORE asking to confirm,
      // so the employer knows what deleting this job will take with it.
      // (interviews.job_id has a foreign key to jobs.id, which is what caused
      // the "violates foreign key constraint" error.)
      const { count: interviewCount, error: countError } = await supabase
        .from('interviews')
        .select('*', { count: 'exact', head: true })
        .eq('job_id', job.id)

      if (countError) {
        alert('Could not check this job for scheduled interviews: ' + countError.message)
        setDeleting(null)
        return
      }

      const interviewWarning = interviewCount > 0
        ? `\n\nThis job has ${interviewCount} scheduled interview${interviewCount !== 1 ? 's' : ''}. Deleting it will also permanently remove ${interviewCount !== 1 ? 'those interviews' : 'that interview'}.`
        : ''

      const confirmed = window.confirm(
        `Delete the listing "${job.title}"?\n\nThis will also remove its applications.${interviewWarning}\n\nThis cannot be undone.`
      )
      if (!confirmed) {
        setDeleting(null)
        return
      }

      // 1. Delete interviews tied to this job (FK safety).
      // .select('id') forces Postgres to return the rows it actually deleted,
      // so we can tell a silent RLS block (0 rows removed) apart from success.
      const { data: deletedInterviews, error: interviewsDeleteError } = await supabase
        .from('interviews')
        .delete()
        .eq('job_id', job.id)
        .select('id')

      if (interviewsDeleteError) {
        alert('Could not delete this job\'s interviews: ' + interviewsDeleteError.message)
        setDeleting(null)
        return
      }

      if ((deletedInterviews?.length || 0) < interviewCount) {
        alert(
          `Could not delete this job: ${interviewCount} interview(s) exist for it, but only ${deletedInterviews?.length || 0} could be removed. ` +
          `This is usually a Row Level Security policy on the "interviews" table blocking employers from deleting rows — check that table's DELETE policy in Supabase.`
        )
        setDeleting(null)
        return
      }

      // 2. Delete associated applications (FK safety)
      await supabase.from('applications').delete().eq('job_id', job.id)

      // 3. Delete the job itself
      const { error } = await supabase.from('jobs').delete().eq('id', job.id)

      if (error) {
        alert('Could not delete job: ' + error.message)
        setDeleting(null)
        return
      }

      // 4. Update UI
      setJobs(prev => prev.filter(j => j.id !== job.id))
      setToast(`"${job.title}" deleted`)
      setTimeout(() => setToast(''), 3000)
    } catch (err) {
      console.error('Delete error:', err)
      alert('Something went wrong while deleting the job.')
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Recently'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div style={S.page}>
      <style>{`
        .mjl-row { transition: box-shadow .2s ease, border-color .2s ease; }
        .mjl-row:hover { box-shadow: 0 12px 28px rgba(15,23,42,0.06); border-color: #D9DEE8; }
        .mjl-post-btn { transition: all .2s ease; }
        .mjl-post-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(245,158,11,0.3); }
        .mjl-delete-btn { transition: all .15s ease; }
        .mjl-delete-btn:hover:not(:disabled) { background: #FEE2E2; color: #DC2626; }
        .mjl-delete-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 640px) {
          .mjl-row { flex-direction: column !important; align-items: stretch !important; }
          .mjl-right { width: 100%; justify-content: space-between !important; }
          .mjl-main { padding: 20px 16px !important; }
        }
      `}</style>

      <div className="mjl-main" style={S.main}>
        <div style={S.topBar}>
          <div style={{ minWidth: 0 }}>
            <h1 style={S.heading}>My Job Listings</h1>
            <p style={S.headSub}>Manage the jobs you've posted. Track applicants, view flyers, and remove listings.</p>
          </div>
          <button className="mjl-post-btn" style={S.postBtn} onClick={() => navigate('/employer/post-job')}>
            <Icon path={icons.plus} size={16} /> Post a Job
          </button>
        </div>

        {toast && (
          <div style={S.toast}>
            <Icon path={icons.trash} size={15} /> {toast}
          </div>
        )}

        {loading && <div style={S.loading}>Loading your listings...</div>}

        {!loading && jobs.length === 0 && (
          <div style={S.empty}>
            <div style={{ marginBottom: 16, color: C.sub }}><Icon path={icons.briefcase} size={44} /></div>
            <div style={S.emptyTitle}>You haven't posted any jobs yet</div>
            <div style={S.emptySub}>Post your first job listing to start receiving applications.</div>
            <button className="mjl-post-btn" style={{ ...S.postBtn, marginTop: 18 }} onClick={() => navigate('/employer/post-job')}>
              <Icon path={icons.plus} size={16} /> Post a Job
            </button>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <div style={S.jobsList}>
            {jobs.map(job => {
              const hasFlyer = !!job.image_attachment?.url
              const isDeleting = deleting === job.id
              return (
                <div key={job.id} className="mjl-row" style={S.jobCard}>
                  <div style={S.jobCardLeft}>
                    {/* Flyer thumbnail OR default icon */}
                    <div style={S.thumb}>
                      {hasFlyer ? (
                        <img src={job.image_attachment.url} alt={job.title} style={S.thumbImg} />
                      ) : (
                        <div style={S.thumbPlaceholder}>
                          <Icon path={icons.briefcase} size={20} />
                        </div>
                      )}
                      {hasFlyer && job.image_attachment.type && (
                        <span style={S.thumbBadge}>{job.image_attachment.type}</span>
                      )}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={S.jobTitle}>{job.title}</div>
                      <div style={S.jobMeta}>
                        <span style={S.metaItem}><Icon path={icons.mapPin} size={12} /> {job.location}</span>
                        <span style={S.metaDot}>·</span>
                        <span>{job.type}</span>
                        {job.salary && (<><span style={S.metaDot}>·</span><span style={{ color: C.green, fontWeight: 700 }}>{job.salary}</span></>)}
                        <span style={S.metaDot}>·</span>
                        <span>Posted {formatDate(job.created_at)}</span>
                      </div>
                      {hasFlyer && (
                        <div style={S.flyerNote}>
                          <Icon path={icons.image} size={11} /> Flyer attached
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mjl-right" style={S.jobCardRight}>
                    <div style={S.applicantStat}>
                      <div style={S.applicantCount}>{applicantCounts[job.id] || 0}</div>
                      <div style={S.applicantLabel}>Applicants</div>
                    </div>

                    <button
                      style={S.viewBtn}
                      onClick={() => navigate(`/employer/applicants/${job.id}`)}
                    >
                      View Applicants <Icon path={icons.chevron} size={14} />
                    </button>

                    <button
                      className="mjl-delete-btn"
                      style={S.deleteBtn}
                      onClick={() => handleDelete(job)}
                      disabled={isDeleting}
                      title="Delete this job"
                      aria-label={`Delete ${job.title}`}
                    >
                      {isDeleting ? (
                        <span style={{ fontSize: 11 }}>...</span>
                      ) : (
                        <Icon path={icons.trash} size={16} />
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: C.bg, fontFamily: "'Inter', -apple-system, sans-serif" },
  main: { maxWidth: 1100, margin: '0 auto', padding: '32px 32px 60px', width: '100%' },

  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 },
  heading: { fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 900, color: C.ink, marginBottom: 6, letterSpacing: '-1px' },
  headSub: { fontSize: 'clamp(13px, 1.4vw, 15px)', color: C.sub },

  postBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '11px 20px', minHeight: 44,
    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
    color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer',
    fontSize: 14, fontWeight: 700, boxShadow: '0 4px 14px rgba(245,158,11,0.25)',
    whiteSpace: 'nowrap',
  },

  toast: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#FEF2F2', color: C.red,
    border: '1px solid #FECACA',
    padding: '11px 16px', borderRadius: 12,
    fontSize: 13.5, fontWeight: 600, marginBottom: 18,
  },

  loading: { padding: '60px 0', textAlign: 'center', color: C.sub, fontSize: 15 },
  empty: { textAlign: 'center', padding: '80px 20px', color: C.sub },
  emptyTitle: { fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 4 },
  emptySub: { fontSize: 14, color: C.sub },

  jobsList: { display: 'flex', flexDirection: 'column', gap: 14 },

  jobCard: {
    background: '#FFFFFF', border: `1.5px solid ${C.border}`, borderRadius: 16,
    padding: 'clamp(16px, 2vw, 20px) clamp(14px, 2vw, 22px)',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', flexWrap: 'wrap', gap: 14,
    boxShadow: '0 2px 8px rgba(15,23,42,0.03)',
  },
  jobCardLeft: { display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 },

  thumb: {
    position: 'relative',
    width: 64, height: 64, flexShrink: 0,
    borderRadius: 14, overflow: 'hidden',
    background: '#FFFBEB', border: '1px solid #FDE68A',
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  thumbPlaceholder: {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: C.amber,
  },
  thumbBadge: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    background: 'rgba(0,0,0,0.7)', color: '#fff',
    fontSize: 8, fontWeight: 800, textAlign: 'center',
    padding: '2px 0', textTransform: 'uppercase', letterSpacing: 0.5,
  },

  jobTitle: { fontSize: 15.5, fontWeight: 700, color: C.ink, marginBottom: 4 },
  jobMeta: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.sub, flexWrap: 'wrap' },
  metaItem: { display: 'flex', alignItems: 'center', gap: 4 },
  metaDot: { color: '#CBD5E1' },
  flyerNote: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontSize: 11, fontWeight: 700, color: C.amber,
    background: '#FFFBEB', border: '1px solid #FDE68A',
    padding: '2px 8px', borderRadius: 10, marginTop: 6,
  },

  jobCardRight: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },

  applicantStat: { textAlign: 'center', minWidth: 60 },
  applicantCount: { fontSize: 20, fontWeight: 800, color: C.blue, lineHeight: 1 },
  applicantLabel: { fontSize: 11, color: C.sub, fontWeight: 600, marginTop: 2 },

  viewBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '9px 16px', minHeight: 40,
    background: '#F8FAFC', border: `1px solid ${C.border}`,
    borderRadius: 10, color: C.ink, fontSize: 13, fontWeight: 700,
    cursor: 'pointer', whiteSpace: 'nowrap',
  },

  deleteBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 40, height: 40,
    background: '#F8FAFC', border: `1px solid ${C.border}`,
    borderRadius: 10, color: C.sub, cursor: 'pointer',
  },
}
