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

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: jobsData } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
    setJobs(jobsData || [])

    const { data: appsData } = await supabase
      .from('applications')
      .select('job_id')
      .eq('student_id', user.id)
    setAppliedJobs(appsData?.map(a => a.job_id) || [])

    setLoading(false)
  }

  async function applyForJob(jobId) {
    setApplying(jobId)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('applications').insert({
      job_id: jobId,
      student_id: user.id,
      status: 'applied'
    })

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setAppliedJobs(prev => [...prev, jobId])
      setSuccess('Application submitted successfully!')
      setTimeout(() => setSuccess(''), 3000)
    }
    setApplying(null)
  }

  const filtered = jobs.filter(job => {
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.skills.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || job.type === filter
    return matchSearch && matchFilter
  })

  return (
    <div style={styles.container}>
      <div style={styles.topbar}>
        <div style={styles.logo}>CareerBridge</div>
        <button style={styles.backBtn} onClick={() => navigate('/student')}>← Back to dashboard</button>
      </div>

      <div style={styles.main}>
        <h2 style={styles.heading}>Browse Jobs</h2>

        {success && <div style={styles.successBox}>{success}</div>}

        <div style={styles.searchRow}>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search by title, company or skill..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select style={styles.select} value={filter} onChange={e => setFilter(e.target.value)}>
            <option>All</option>
            <option>Full-time</option>
            <option>Internship</option>
            <option>Part-time</option>
            <option>Contract</option>
          </select>
        </div>

        {loading && <div style={styles.empty}>Loading jobs...</div>}
        {!loading && filtered.length === 0 && <div style={styles.empty}>No jobs found.</div>}

        {filtered.map(job => (
          <div key={job.id} style={styles.jobCard}>
            <div style={styles.jobTop}>
              <div>
                <div style={styles.jobTitle}>{job.title}</div>
                <div style={styles.jobMeta}>{job.company} · {job.location}</div>
              </div>
              <span style={styles.typeBadge}>{job.type}</span>
            </div>
            <div style={styles.jobDesc}>{job.description}</div>
            <div style={styles.skillsRow}>
              {job.skills.split(',').map((skill, i) => (
                <span key={i} style={styles.skillBadge}>{skill.trim()}</span>
              ))}
            </div>
            {appliedJobs.includes(job.id) ? (
              <button style={styles.appliedBtn} disabled>✓ Applied</button>
            ) : (
              <button
                style={styles.applyBtn}
                onClick={() => applyForJob(job.id)}
                disabled={applying === job.id}
              >
                {applying === job.id ? 'Applying...' : 'Apply now'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f5f5f5', fontFamily: 'sans-serif' },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 28px', background: '#fff', borderBottom: '1px solid #eee' },
  logo: { fontSize: '18px', fontWeight: '700', color: '#185FA5' },
  backBtn: { padding: '7px 14px', background: 'transparent', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  main: { padding: '28px', maxWidth: '700px', margin: '0 auto' },
  heading: { fontSize: '20px', fontWeight: '600', marginBottom: '20px' },
  searchRow: { display: 'flex', gap: '10px', marginBottom: '20px' },
  searchInput: { flex: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' },
  select: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', background: '#fff' },
  jobCard: { background: '#fff', borderRadius: '10px', padding: '20px', border: '1px solid #eee', marginBottom: '14px' },
  jobTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  jobTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '4px' },
  jobMeta: { fontSize: '13px', color: '#888' },
  typeBadge: { background: '#E6F1FB', color: '#185FA5', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap' },
  jobDesc: { fontSize: '13px', color: '#555', marginBottom: '12px', lineHeight: '1.6' },
  skillsRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' },
  skillBadge: { background: '#EEEDFE', color: '#3C3489', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' },
  applyBtn: { padding: '9px 20px', background: '#185FA5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  appliedBtn: { padding: '9px 20px', background: '#E1F5EE', color: '#085041', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'default' },
  empty: { textAlign: 'center', color: '#aaa', fontSize: '14px', padding: '40px 0' },
  successBox: { background: '#f0fdf4', color: '#16a34a', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }
}