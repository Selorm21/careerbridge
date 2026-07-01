import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [applying, setApplying] = useState(null)
  const [success, setSuccess] = useState('')
  const [appliedJobs, setAppliedJobs] = useState([])
  const navigate = useNavigate()

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: jobsData } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
    setJobs(jobsData || [])
    const { data: appsData } = await supabase.from('applications').select('job_id').eq('student_id', user.id)
    setAppliedJobs(appsData?.map(a => a.job_id) || [])
    setLoading(false)
  }

  async function applyForJob(jobId) {
    setApplying(jobId)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('applications').insert({ job_id: jobId, student_id: user.id, status: 'applied' })
    if (error) { alert('Error: ' + error.message) }
    else { setAppliedJobs(prev => [...prev, jobId]); setSuccess('Application submitted!'); setTimeout(() => setSuccess(''), 3000) }
    setApplying(null)
  }

  const filtered = jobs.filter(job => {
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase()) || job.company.toLowerCase().includes(search.toLowerCase()) || job.skills.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || job.type === filter
    return matchSearch && matchFilter
  })

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .pageIn{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) forwards}
        .jobCard{transition:all .25s ease}
        .jobCard:hover{transform:translateY(-4px);box-shadow:0 16px 36px rgba(37,99,235,0.1)!important;border-color:#DBEAFE!important}
        .applyBtn{transition:all .2s ease}
        .applyBtn:hover{transform:translateY(-2px);box-shadow:0 8px 18px rgba(37,99,235,0.28)!important}
        .backBtn{transition:all .2s ease}
        .backBtn:hover{background:#EFF6FF!important;color:#2563EB!important}
        .searchIn:focus{outline:none;border-color:#2563EB!important;box-shadow:0 0 0 3px rgba(37,99,235,0.12)!important}
        .filterSel:focus{outline:none;border-color:#2563EB!important}
        .skillChipH{transition:all .15s ease}
        .skillChipH:hover{background:#DBEAFE!important}
      `}</style>

      <nav style={S.nav}>
        <div style={S.logo}>CareerBridge</div>
        <button className="backBtn" style={S.backBtn} onClick={() => navigate('/student')}>← Back to dashboard</button>
      </nav>

      <div className="pageIn" style={S.main}>
        <div style={S.pageHead}>
          <h1 style={S.heading}>Browse Jobs</h1>
          <p style={S.headSub}>{jobs.length} opportunities available — find your perfect match</p>
        </div>

        {success && <div style={S.successBanner}>✓ {success}</div>}

        <div style={S.searchBar}>
          <div style={S.searchWrap}>
            <span style={S.searchIcon}>🔍</span>
            <input
              className="searchIn"
              style={S.searchInput}
              type="text"
              placeholder="Search by title, company or skill..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="filterSel" style={S.filterSelect} value={filter} onChange={e => setFilter(e.target.value)}>
            <option>All</option>
            <option>Full-time</option>
            <option>Internship</option>
            <option>Part-time</option>
            <option>Contract</option>
          </select>
        </div>

        <div style={S.resultsLabel}>{filtered.length} result{filtered.length !== 1 ? 's' : ''} {filter !== 'All' ? `· ${filter}` : ''}</div>

        {loading && (
          <div style={S.loadingWrap}>
            <div style={S.loadingDot}></div>
            <span style={S.loadingText}>Loading jobs...</span>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={S.empty}>
            <div style={S.emptyIcon}>🔎</div>
            <div style={S.emptyText}>No jobs found</div>
            <div style={S.emptySub}>Try a different search or filter</div>
          </div>
        )}

        <div style={S.jobsGrid}>
          {filtered.map(job => (
            <div key={job.id} className="jobCard" style={S.jobCard}>
              <div style={S.jobCardTop}>
                <div style={S.jobIconWrap}>
                  <span style={S.jobIcon}>🏢</span>
                </div>
                <span style={{...S.typeBadge, ...(job.type === 'Internship' ? S.typeBadgeIntern : job.type === 'Full-time' ? S.typeBadgeFull : S.typeBadgeOther)}}>{job.type}</span>
              </div>
              <div style={S.jobTitle}>{job.title}</div>
              <div style={S.jobCompany}>{job.company}</div>
              <div style={S.jobLocation}>📍 {job.location}</div>
              <div style={S.jobDesc}>{job.description?.slice(0, 100)}{job.description?.length > 100 ? '...' : ''}</div>
              <div style={S.skillsRow}>
                {job.skills.split(',').map((skill, i) => (
                  <span key={i} className="skillChipH" style={S.skillChip}>{skill.trim()}</span>
                ))}
              </div>
              <div style={S.jobCardBottom}>
                {appliedJobs.includes(job.id) ? (
                  <button style={S.appliedBtn} disabled>✓ Applied</button>
                ) : (
                  <button className="applyBtn" style={S.applyBtn} onClick={() => applyForJob(job.id)} disabled={applying === job.id}>
                    {applying === job.id ? 'Applying...' : 'Apply now →'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: '#F1F5F9', fontFamily: "'Inter', -apple-system, sans-serif" },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 36px', background: '#fff', borderBottom: '1px solid #F0F2F5', position: 'sticky', top: 0, zIndex: 10 },
  logo: { fontSize: '19px', fontWeight: '800', color: '#2563EB', letterSpacing: '-0.5px' },
  backBtn: { padding: '9px 18px', background: '#F8FAFC', border: '1.5px solid #E5E7EB', borderRadius: '10px', cursor: 'pointer', fontSize: '13.5px', fontWeight: '700', color: '#374151' },
  main: { maxWidth: '1100px', margin: '0 auto', padding: '36px 24px' },
  pageHead: { marginBottom: '28px' },
  heading: { fontSize: '26px', fontWeight: '800', color: '#0F172A', marginBottom: '6px', letterSpacing: '-0.5px' },
  headSub: { fontSize: '14.5px', color: '#94A3B8' },
  successBanner: { background: '#ECFDF5', color: '#059669', padding: '13px 18px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', marginBottom: '20px', border: '1px solid #A7F3D0' },
  searchBar: { display: 'flex', gap: '12px', marginBottom: '16px' },
  searchWrap: { flex: 1, display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: '12px', padding: '0 14px', gap: '10px' },
  searchIcon: { fontSize: '16px' },
  searchInput: { flex: 1, padding: '13px 0', border: 'none', background: 'transparent', fontSize: '14px', fontFamily: 'inherit' },
  filterSelect: { padding: '13px 16px', border: '1.5px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', background: '#fff', fontFamily: 'inherit', fontWeight: '600', color: '#374151', cursor: 'pointer' },
  resultsLabel: { fontSize: '13px', color: '#94A3B8', fontWeight: '600', marginBottom: '20px' },
  jobsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' },
  jobCard: { background: '#fff', borderRadius: '18px', padding: '24px', border: '1.5px solid #F0F2F5', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', display: 'flex', flexDirection: 'column', gap: '10px' },
  jobCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  jobIconWrap: { width: '44px', height: '44px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  jobIcon: { fontSize: '22px' },
  typeBadge: { padding: '5px 13px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  typeBadgeIntern: { background: '#F5F3FF', color: '#7C3AED' },
  typeBadgeFull: { background: '#ECFDF5', color: '#059669' },
  typeBadgeOther: { background: '#EFF6FF', color: '#2563EB' },
  jobTitle: { fontSize: '16px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.3px' },
  jobCompany: { fontSize: '13.5px', fontWeight: '600', color: '#64748B' },
  jobLocation: { fontSize: '13px', color: '#94A3B8' },
  jobDesc: { fontSize: '13.5px', color: '#64748B', lineHeight: '1.6' },
  skillsRow: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  skillChip: { background: '#EFF6FF', color: '#2563EB', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'default' },
  jobCardBottom: { marginTop: 'auto', paddingTop: '8px' },
  applyBtn: { width: '100%', padding: '12px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', boxShadow: '0 4px 12px rgba(37,99,235,0.22)' },
  appliedBtn: { width: '100%', padding: '12px', background: '#ECFDF5', color: '#059669', border: '1.5px solid #A7F3D0', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'default' },
  loadingWrap: { textAlign: 'center', padding: '60px 0', color: '#94A3B8' },
  loadingDot: { width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #DBEAFE', borderTopColor: '#2563EB', margin: '0 auto 12px', animation: 'spin 0.7s linear infinite' },
  loadingText: { fontSize: '14px', fontWeight: '600' },
  empty: { textAlign: 'center', padding: '60px 0', color: '#94A3B8' },
  emptyIcon: { fontSize: '40px', marginBottom: '12px' },
  emptyText: { fontSize: '16px', fontWeight: '700', color: '#64748B', marginBottom: '6px' },
  emptySub: { fontSize: '13.5px' }
}