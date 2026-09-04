// src/pages/MyJobListings.jsx
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
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.3 3-6 6.5-6s6.5 2.7 6.5 6" /><path d="M16 8.2a3 3 0 1 1 3.6 3M21.5 20c0-2.6-1.8-4.8-4.3-5.6" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  mapPin: <><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></>,
}

const C = {
  ink: '#0F172A', sub: '#64748B', border: '#E2E8F0',
  bg: '#F8FAFC', amber: '#F59E0B', green: '#10B981', blue: '#2563EB',
}

export default function MyJobListings() {
  const [jobs, setJobs] = useState([])
  const [applicantCounts, setApplicantCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', user.id)
        .order('created_at', { ascending: false })

      setJobs(jobsData || [])

      if (jobsData && jobsData.length > 0) {
        const jobIds = jobsData.map(j => j.id)
        const { data: appsData } = await supabase
          .from('applications')
          .select('job_id')
          .in('job_id', jobIds)

        const counts = {}
        ;(appsData || []).forEach(a => {
          counts[a.job_id] = (counts[a.job_id] || 0) + 1
        })
        setApplicantCounts(counts)
      }

      setLoading(false)
    }
    getData()
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        .pageIn{animation:fadeUp .6s cubic-bezier(.16,1,.3,1) forwards}
        .jobRow{transition:all .2s ease}
        .jobRow:hover{box-shadow:0 12px 28px rgba(15,23,42,0.06)!important;border-color:#D9DEE8!important}
        .postBtn{transition:all .2s ease}
        .postBtn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(245,158,11,0.3)!important}
      `}</style>

      <div className="pageIn" style={S.main}>
        <div style={S.topBar}>
          <div>
            <h1 style={S.heading}>My Job Listings</h1>
            <p style={S.headSub}>Manage the jobs you've posted and track applicant activity.</p>
          </div>
          <button className="postBtn" style={S.postBtn} onClick={() => navigate('/employer/post-job')}>
            <Icon path={icons.plus} size={16} /> Post a Job
          </button>
        </div>

        {loading && <div style={S.loading}>Loading your listings...</div>}

        {!loading && jobs.length === 0 && (
          <div style={S.empty}>
            <div style={{ marginBottom: '16px' }}><Icon path={icons.briefcase} size={44} color={C.sub} /></div>
            <div style={S.emptyTitle}>You haven't posted any jobs yet</div>
            <div style={S.emptySub}>Post your first job listing to start receiving applications.</div>
            <button className="postBtn" style={{ ...S.postBtn, marginTop: '18px' }} onClick={() => navigate('/employer/post-job')}>
              <Icon path={icons.plus} size={16} /> Post a Job
            </button>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <div style={S.jobsList}>
            {jobs.map(job => (
              <div key={job.id} className="jobRow" style={S.jobCard}>
                <div style={S.jobCardLeft}>
                  <div style={S.jobIcon}><Icon path={icons.briefcase} size={20} /></div>
                  <div>
                    <div style={S.jobTitle}>{job.title}</div>
                    <div style={S.jobMeta}>
                      <span style={S.metaItem}><Icon path={icons.mapPin} size={12} /> {job.location}</span>
                      <span style={S.metaDot}>·</span>
                      <span>{job.type}</span>
                      <span style={S.metaDot}>·</span>
                      <span>Posted {formatDate(job.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div style={S.jobCardRight}>
                  <div style={S.applicantStat}>
                    <div style={S.applicantCount}>{applicantCounts[job.id] || 0}</div>
                    <div style={S.applicantLabel}>Applicants</div>
                  </div>
                  <button style={S.viewBtn} onClick={() => navigate(`/employer/applicants/${job.id}`)}>
                    View Applicants <Icon path={icons.chevron} size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: C.bg, fontFamily: "'Inter', -apple-system, sans-serif" },
  main: { maxWidth: '1100px', margin: '0 auto', padding: '32px 32px 60px', width: '100%' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' },
  heading: { fontSize: '28px', fontWeight: '900', color: C.ink, marginBottom: '6px', letterSpacing: '-1px' },
  headSub: { fontSize: '15px', color: C.sub },
  postBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '11px 20px', background: 'linear-gradient(135deg, #F59E0B, #D97706)',
    color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '700', boxShadow: '0 4px 14px rgba(245,158,11,0.25)',
    whiteSpace: 'nowrap',
  },
  loading: { padding: '60px 0', textAlign: 'center', color: C.sub, fontSize: '15px' },
  empty: { textAlign: 'center', padding: '80px 20px', color: C.sub },
  emptyTitle: { fontSize: '18px', fontWeight: '700', color: C.ink, marginBottom: '4px' },
  emptySub: { fontSize: '14px', color: C.sub },
  jobsList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  jobCard: {
    background: '#FFFFFF', border: `1.5px solid ${C.border}`, borderRadius: '16px',
    padding: '20px 22px', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', flexWrap: 'wrap', gap: '16px',
    boxShadow: '0 2px 8px rgba(15,23,42,0.03)',
  },
  jobCardLeft: { display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '220px' },
  jobIcon: {
    width: '44px', height: '44px', borderRadius: '12px', background: '#FFFBEB',
    color: C.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  jobTitle: { fontSize: '15.5px', fontWeight: '700', color: C.ink, marginBottom: '4px' },
  jobMeta: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: C.sub, flexWrap: 'wrap' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '4px' },
  metaDot: { color: '#CBD5E1' },
  jobCardRight: { display: 'flex', alignItems: 'center', gap: '20px' },
  applicantStat: { textAlign: 'center' },
  applicantCount: { fontSize: '20px', fontWeight: '800', color: C.blue },
  applicantLabel: { fontSize: '11px', color: C.sub, fontWeight: '600' },
  viewBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '9px 16px', background: '#F8FAFC', border: `1px solid ${C.border}`,
    borderRadius: '10px', color: C.ink, fontSize: '13px', fontWeight: '700', cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
}
