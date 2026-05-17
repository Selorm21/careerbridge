import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

export default function EmployerDashboard() {
  const [profile, setProfile] = useState(null)
  const [jobs, setJobs] = useState([])
  const [totalApplicants, setTotalApplicants] = useState(0)
  const [totalShortlisted, setTotalShortlisted] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)

      const { data: jobsData } = await supabase.from('jobs').select('*').eq('employer_id', user.id).order('created_at', { ascending: false })
      setJobs(jobsData || [])

      if (jobsData && jobsData.length > 0) {
        const jobIds = jobsData.map(j => j.id)
        const { data: appsData } = await supabase.from('applications').select('*').in('job_id', jobIds)
        setTotalApplicants(appsData?.length || 0)
        setTotalShortlisted(appsData?.filter(a => a.status === 'interview' || a.status === 'offer').length || 0)
      }
    }
    getData()
  }, [])

  async function handleLogout() { await supabase.auth.signOut() }

  return (
    <div style={styles.container}>
      <div style={styles.topbar}>
        <div style={styles.logo}>CareerBridge</div>
        <div style={styles.navRight}>
          <span style={styles.welcome}>👋 {profile?.full_name || 'Employer'}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Log out</button>
        </div>
      </div>

      <div style={styles.main}>
        <h2 style={styles.heading}>Employer Dashboard</h2>

        <div style={styles.grid3}>
          <div style={styles.metric}>
            <div style={{...styles.metricVal, color:'#185FA5'}}>{jobs.length}</div>
            <div style={styles.metricLabel}>Active listings</div>
          </div>
          <div style={styles.metric}>
            <div style={{...styles.metricVal, color:'#1D9E75'}}>{totalApplicants}</div>
            <div style={styles.metricLabel}>Total applicants</div>
          </div>
          <div style={styles.metric}>
            <div style={{...styles.metricVal, color:'#534AB7'}}>{totalShortlisted}</div>
            <div style={styles.metricLabel}>Shortlisted</div>
          </div>
        </div>

        <div style={styles.grid2}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Company Profile</div>
            <div style={styles.profileRow}><span style={styles.profileLabel}>Name</span><span>{profile?.full_name || '-'}</span></div>
            <div style={styles.profileRow}><span style={styles.profileLabel}>Email</span><span>{profile?.email || '-'}</span></div>
            <div style={styles.profileRow}><span style={styles.profileLabel}>Role</span><span style={styles.badge}>Employer</span></div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Quick Actions</div>
            <button style={styles.actionBtn} onClick={() => navigate('/post-job')}>Post a job</button>
            <button style={{...styles.actionBtn, marginTop:'10px', background:'#fff', color:'#185FA5', border:'1px solid #185FA5'}} onClick={() => navigate('/browse-jobs')}>View all jobs</button>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>My Job Listings</div>
          {jobs.length === 0 && <div style={styles.empty}>No jobs posted yet. Post your first job!</div>}
          {jobs.map(job => (
            <div key={job.id} style={styles.jobRow}>
              <div>
                <div style={styles.jobTitle}>{job.title}</div>
                <div style={styles.jobMeta}>{job.company} · {job.location} · {job.type}</div>
              </div>
              <button style={styles.viewBtn} onClick={() => navigate(`/applicants/${job.id}`)}>View applicants</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f5f5f5', fontFamily: 'sans-serif' },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 28px', background: '#fff', borderBottom: '1px solid #eee' },
  logo: { fontSize: '18px', fontWeight: '700', color: '#185FA5' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcome: { fontSize: '14px', color: '#555' },
  logoutBtn: { padding: '7px 14px', background: 'transparent', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  main: { padding: '28px', maxWidth: '900px', margin: '0 auto' },
  heading: { fontSize: '20px', fontWeight: '600', marginBottom: '20px' },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '20px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' },
  metric: { background: '#fff', borderRadius: '10px', padding: '18px', textAlign: 'center', border: '1px solid #eee' },
  metricVal: { fontSize: '26px', fontWeight: '600', marginBottom: '4px' },
  metricLabel: { fontSize: '13px', color: '#888' },
  card: { background: '#fff', borderRadius: '10px', padding: '18px', border: '1px solid #eee', marginBottom: '20px' },
  cardTitle: { fontSize: '15px', fontWeight: '600', marginBottom: '14px' },
  profileRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f5f5f5', fontSize: '14px' },
  profileLabel: { color: '#888', fontSize: '13px' },
  badge: { background: '#E1F5EE', color:'#085041', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  actionBtn: { width: '100%', padding: '10px', background: '#185FA5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  empty: { textAlign: 'center', color: '#aaa', fontSize: '14px', padding: '20px 0' },
  jobRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f5f5f5' },
  jobTitle: { fontSize: '14px', fontWeight: '500', marginBottom: '2px' },
  jobMeta: { fontSize: '12px', color: '#888' },
  viewBtn: { padding: '7px 14px', background: '#185FA5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }
}