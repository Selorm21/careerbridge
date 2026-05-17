import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

export default function StudentProfile() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [fullName, setFullName] = useState('')
  const [university, setUniversity] = useState('')
  const [course, setCourse] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [skills, setSkills] = useState('')
  const [bio, setBio] = useState('')
  const [cvFile, setCvFile] = useState(null)
  const [cvUrl, setCvUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setFullName(data.full_name || '')
        setUniversity(data.university || '')
        setCourse(data.course || '')
        setGraduationYear(data.graduation_year || '')
        setSkills(data.skills || '')
        setBio(data.bio || '')
      }
    }
    getProfile()
  }, [])

  async function handleCvUpload(file) {
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const fileName = `${user.id}/cv.pdf`
    const { error } = await supabase.storage.from('cvs').upload(fileName, file, { upsert: true })
    if (error) { setError('CV upload failed: ' + error.message); setUploading(false); return }
    const { data } = supabase.storage.from('cvs').getPublicUrl(fileName)
    setCvUrl(data.publicUrl)
    setUploading(false)
    setSuccess('CV uploaded successfully!')
  }
  
  async function handleSave(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('profiles').update({
      full_name: fullName,
      university,
      course,
      graduation_year: graduationYear,
      skills,
      bio,
      cv_url: cvUrl || undefined
    }).eq('id', user.id)

    if (error) setError(error.message)
    else setSuccess('Profile saved successfully!')
    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.topbar}>
        <div style={styles.logo}>CareerBridge</div>
        <button style={styles.backBtn} onClick={() => navigate('/student')}>← Back to dashboard</button>
      </div>

      <div style={styles.main}>
        <h2 style={styles.heading}>My Profile</h2>
        <p style={styles.sub}>Complete your profile so employers and AI can match you to the right jobs.</p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <div style={styles.card}>
          <form onSubmit={handleSave}>
            <div style={styles.sectionTitle}>Personal Information</div>
            <div style={styles.grid2}>
              <div style={styles.field}>
                <label style={styles.label}>Full name</label>
                <input style={styles.input} type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>University / School</label>
                <input style={styles.input} type="text" placeholder="e.g. University of Ghana" value={university} onChange={e => setUniversity(e.target.value)} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Course / Programme</label>
                <input style={styles.input} type="text" placeholder="e.g. BSc Computer Science" value={course} onChange={e => setCourse(e.target.value)} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Expected graduation year</label>
                <select style={styles.input} value={graduationYear} onChange={e => setGraduationYear(e.target.value)}>
                  <option value="">Select year</option>
                  <option>2025</option>
                  <option>2026</option>
                  <option>2027</option>
                  <option>2028</option>
                </select>
              </div>
            </div>

            <div style={styles.sectionTitle}>Skills & Experience</div>
            <div style={styles.field}>
              <label style={styles.label}>Your skills (comma separated)</label>
              <input style={styles.input} type="text" placeholder="e.g. Python, React, SQL, Machine Learning" value={skills} onChange={e => setSkills(e.target.value)} />
              <div style={styles.hint}>These skills are used by the AI to match you to jobs</div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Short bio</label>
              <textarea style={{...styles.input, height:'100px', resize:'vertical'}} placeholder="Tell employers a bit about yourself, your goals and experience..." value={bio} onChange={e => setBio(e.target.value)} />
            </div>

            <div style={styles.sectionTitle}>CV / Resume</div>
            <div style={styles.field}>
              <label style={styles.label}>Upload your CV (PDF)</label>
              <input
                type="file"
                accept=".pdf"
                style={styles.input}
                onChange={e => {
                  setCvFile(e.target.files[0])
                  handleCvUpload(e.target.files[0])
                }}
              />
              {uploading && <div style={styles.hint}>Uploading...</div>}
              {cvUrl && <div style={{...styles.hint, color:'#16a34a'}}>✓ CV uploaded successfully</div>}
            </div>

            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save profile'}
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
  heading: { fontSize: '20px', fontWeight: '600', marginBottom: '6px' },
  sub: { fontSize: '13px', color: '#888', marginBottom: '20px' },
  sectionTitle: { fontSize: '14px', fontWeight: '600', color: '#185FA5', marginBottom: '14px', marginTop: '8px', paddingBottom: '8px', borderBottom: '1px solid #eee' },
  card: { background: '#fff', borderRadius: '10px', padding: '24px', border: '1px solid #eee' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' },
  hint: { fontSize: '12px', color: '#888', marginTop: '4px' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'sans-serif' },
  btn: { width: '100%', padding: '12px', background: '#185FA5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginTop: '8px' },
  error: { background: '#fef2f2', color: '#dc2626', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  successBox: { background: '#f0fdf4', color: '#16a34a', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }
}