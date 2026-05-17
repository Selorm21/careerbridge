import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate, useParams } from 'react-router-dom'

export default function ViewApplicants() {
  const [applicants, setApplicants] = useState([])
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { jobId } = useParams()

  useEffect(() => {
    fetchApplicants()
  }, [])

  async function fetchApplicants() {
    const { data: jobData } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()
    setJob(jobData)

    const { data } = await supabase
      .from('applications')
      .select('*, profiles(*)')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })
    setApplicants(data || [])
    setLoading(false)
  }

  async function updateStatus(appId, newStatus) {
    await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', appId)
    fetchApplicants()
  }

  function getStatusColor(status) {
    if (status === 'applied') return { background: '#E6F1FB', color: '#185FA5' }
    if (status === 'interview') return { background: '#FAEEDA', color: '#633806' }
    if (status === 'offer') return { background: '#E1F5EE', color: '#085041' }
    if (status === 'rejected') return { background: '#fef2f2', color: '#dc2626' }
    return { background: '#f5f5f5', color: '#888' }
  }

  return (
    <div style={styles.container}>
      <div style={styles.topbar}>
        <div style={styles.logo}>CareerBridge</div>
        <button style={styles.backBtn} onClick={() => navigate('/employer')}>← Back to dashboard</button>
      </div>

      <div style={styles.main}>
        <h2 style={styles.heading}>Applicants for: {job?.title}</h2>
        <div style={styles.jobMeta}>{job?.company} · {job?.location} · {job?.type}</div>

        {loading && <div style={styles.empty}>Loading applicants...</div>}
        {!loading && applicants.length === 0 && <div style={styles.empty}>No applicants yet for this job.</div>}

        {applicants.map(app => (
          <div key={app.id} style={styles.card}>
            <div style={styles.cardTop}>
              <div>
                <div style={styles.name}>{app.profiles?.full_name}</div>
                <div style={styles.email}>{app.profiles?.email}</div>
                {app.profiles?.university && <div style={styles.detail}>{app.profiles?.course} · {app.profiles?.university}</div>}
                {app.profiles?.skills && (
                  <div style={styles.skillsRow}>
                    {app.profiles.skills.split(',').map((skill, i) => (
                      <span key={i} style={styles.skillBadge}>{skill.trim()}</span>
                    ))}
                  </div>
                )}
                {app.profiles?.bio && <div style={styles.bio}>{app.profiles?.bio}</div>}
                {app.profiles?.cv_url && (
                  <a href={app.profiles.cv_url} target="_blank" rel="noreferrer" style={styles.cvLink}>📄 View CV</a>
                )}
              </div>
              <div style={styles.rightSide}>
                <span style={{...styles.statusBadge, ...getStatusColor(app.status)}}>{app.status}</span>
              </div>
            </div>

            <div style={styles.actions}>
              <div style={styles.actionsLabel}>Update status:</div>
              <div style={styles.btnsRow}>
                <button style={{...styles.actionBtn, background:'#FAEEDA', color:'#633806'}} onClick={() => updateStatus(app.id, 'interview')}>Interview</button>
                <button style={{...styles.actionBtn, background:'#E1F5EE', color:'#085041'}} onClick={() => updateStatus(app.id, 'offer')}>Offer</button>
                <button style={{...styles.actionBtn, background:'#fef2f2', color:'#dc2626'}} onClick={() => updateStatus(app.id, 'rejected')}>Reject</button>
                <button style={{...styles.actionBtn, background:'#E6F1FB', color:'#185FA5'}} onClick={() => updateStatus(app.id, 'applied')}>Reset</button>
              </div>
            </div>
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
  main: { padding: '28px', maxWidth: '800px', margin: '0 auto' },
  heading: { fontSize: '20px', fontWeight: '600', marginBottom: '4px' },
  jobMeta: { fontSize: '13px', color: '#888', marginBottom: '24px' },
  card: { background: '#fff', borderRadius: '10px', padding: '20px', border: '1px solid #eee', marginBottom: '14px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' },
  name: { fontSize: '16px', fontWeight: '600', marginBottom: '2px' },
  email: { fontSize: '13px', color: '#888', marginBottom: '4px' },
  detail: { fontSize: '13px', color: '#555', marginBottom: '8px' },
  skillsRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' },
  skillBadge: { background: '#EEEDFE', color: '#3C3489', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' },
  bio: { fontSize: '13px', color: '#555', marginBottom: '8px', fontStyle: 'italic' },
  cvLink: { fontSize: '13px', color: '#185FA5', textDecoration: 'none', fontWeight: '500' },
  rightSide: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' },
  statusBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  actions: { borderTop: '1px solid #f5f5f5', paddingTop: '12px' },
  actionsLabel: { fontSize: '12px', color: '#888', marginBottom: '8px' },
  btnsRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  actionBtn: { padding: '6px 14px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  empty: { textAlign: 'center', color: '#aaa', fontSize: '14px', padding: '40px 0' }
}