import { useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

export default function PostJob() {
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState('Full-time')
  const [description, setDescription] = useState('')
  const [skills, setSkills] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('jobs').insert({
      employer_id: user.id,
      title,
      company,
      location,
      type,
      description,
      skills
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Job posted successfully!')
      setTimeout(() => navigate('/employer'), 2000)
    }

    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.topbar}>
        <div style={styles.logo}>CareerBridge</div>
        <button style={styles.backBtn} onClick={() => navigate('/employer')}>← Back to dashboard</button>
      </div>

      <div style={styles.main}>
        <h2 style={styles.heading}>Post a new job</h2>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.successBox}>{success} Redirecting...</div>}

        <div style={styles.card}>
          <form onSubmit={handleSubmit}>
            <div style={styles.grid2}>
              <div style={styles.field}>
                <label style={styles.label}>Job title</label>
                <input style={styles.input} type="text" placeholder="e.g. Software Engineer Intern" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Company name</label>
                <input style={styles.input} type="text" placeholder="Your company name" value={company} onChange={e => setCompany(e.target.value)} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Location</label>
                <input style={styles.input} type="text" placeholder="e.g. Accra, Remote" value={location} onChange={e => setLocation(e.target.value)} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Job type</label>
                <select style={styles.input} value={type} onChange={e => setType(e.target.value)}>
                  <option>Full-time</option>
                  <option>Internship</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                </select>
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Required skills (comma separated)</label>
              <input style={styles.input} type="text" placeholder="e.g. Python, React, SQL" value={skills} onChange={e => setSkills(e.target.value)} required />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Job description</label>
              <textarea style={{...styles.input, height:'140px', resize:'vertical'}} placeholder="Describe the role, responsibilities and requirements..." value={description} onChange={e => setDescription(e.target.value)} required />
            </div>

            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Posting...' : 'Post job'}
            </button>
          </form>
        </div>
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
  card: { background: '#fff', borderRadius: '10px', padding: '24px', border: '1px solid #eee' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'sans-serif' },
  btn: { width: '100%', padding: '12px', background: '#185FA5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginTop: '8px' },
  error: { background: '#fef2f2', color: '#dc2626', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  successBox: { background: '#f0fdf4', color: '#16a34a', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }
}