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
        setCvUrl(data.cv_url || '')
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
    setTimeout(() => setSuccess(''), 3000)
  }

  async function handleSave(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('profiles').update({
      full_name: fullName, university, course,
      graduation_year: graduationYear, skills, bio,
      cv_url: cvUrl || undefined
    }).eq('id', user.id)
    if (error) setError(error.message)
    else setSuccess('Profile saved successfully!')
    setLoading(false)
  }

  function profileStrength() {
    let score = 0
    if (fullName) score += 20
    if (university) score += 20
    if (course) score += 20
    if (skills) score += 20
    if (bio) score += 20
    return score
  }

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .pageIn{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) forwards}
        .inputF{transition:border-color .2s ease,box-shadow .2s ease}
        .inputF:focus{outline:none;border-color:#2563EB!important;box-shadow:0 0 0 3px rgba(37,99,235,0.1)!important}
        .saveBtn{transition:all .2s ease}
        .saveBtn:hover{transform:translateY(-2px);box-shadow:0 10px 22px rgba(37,99,235,0.3)!important}
        .backBtn{transition:all .2s ease}
        .backBtn:hover{background:#EFF6FF!important;color:#2563EB!important}
        .uploadArea{transition:all .2s ease;cursor:pointer}
        .uploadArea:hover{border-color:#2563EB!important;background:#EFF6FF!important}
        .progressBar{background:linear-gradient(90deg,#2563EB,#3B82F6,#2563EB);background-size:200% 100%;animation:shimmer 2s linear infinite}
      `}</style>

      <nav style={S.nav}>
        <div style={S.logo}>CareerBridge</div>
        <button className="backBtn" style={S.backBtn} onClick={() => navigate('/student')}>← Back to dashboard</button>
      </nav>

      <div className="pageIn" style={S.main}>
        <div style={S.pageHead}>
          <h1 style={S.heading}>My Profile</h1>
          <p style={S.headSub}>Complete your profile to get better job matches and impress employers</p>
        </div>

        <div style={S.layout}>
          <div style={S.formCol}>
            {error && <div style={S.error}>⚠️ {error}</div>}
            {success && <div style={S.successBox}>✓ {success}</div>}

            <form onSubmit={handleSave}>
              <div style={S.card}>
                <div style={S.cardTitle}>Personal Information</div>
                <div style={S.grid2}>
                  <div style={S.field}>
                    <label style={S.label}>Full name <span style={S.required}>*</span></label>
                    <input className="inputF" style={S.input} type="text" placeholder="Your full name" value={fullName} onChange={e => setFullName(e.target.value)} required />
                  </div>
                  <div style={S.field}>
                    <label style={S.label}>University / School</label>
                    <input className="inputF" style={S.input} type="text" placeholder="e.g. University of Ghana" value={university} onChange={e => setUniversity(e.target.value)} />
                  </div>
                  <div style={S.field}>
                    <label style={S.label}>Course / Programme</label>
                    <input className="inputF" style={S.input} type="text" placeholder="e.g. BSc Computer Science" value={course} onChange={e => setCourse(e.target.value)} />
                  </div>
                  <div style={S.field}>
                    <label style={S.label}>Expected graduation year</label>
                    <select className="inputF" style={S.input} value={graduationYear} onChange={e => setGraduationYear(e.target.value)}>
                      <option value="">Select year</option>
                      <option>2025</option>
                      <option>2026</option>
                      <option>2027</option>
                      <option>2028</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{...S.card, marginTop: '16px'}}>
                <div style={S.cardTitle}>Skills & Bio</div>
                <div style={S.field}>
                  <label style={S.label}>Your skills</label>
                  <input className="inputF" style={S.input} type="text" placeholder="e.g. Python, React, SQL, Machine Learning" value={skills} onChange={e => setSkills(e.target.value)} />
                  <div style={S.hint}>Separate skills with commas — these are used by the AI to match you to jobs</div>
                </div>
                {skills && (
                  <div style={S.skillsPreview}>
                    {skills.split(',').filter(s => s.trim()).map((s, i) => (
                      <span key={i} style={S.skillChip}>{s.trim()}</span>
                    ))}
                  </div>
                )}
                <div style={{...S.field, marginTop: '16px'}}>
                  <label style={S.label}>Short bio</label>
                  <textarea className="inputF" style={{...S.input, height: '110px', resize: 'vertical'}} placeholder="Tell employers about yourself, your goals and experience..." value={bio} onChange={e => setBio(e.target.value)} />
                  <div style={S.hint}>{bio.length}/300 characters</div>
                </div>
              </div>

              <div style={{...S.card, marginTop: '16px'}}>
                <div style={S.cardTitle}>CV / Resume</div>
                <label className="uploadArea" style={{...S.uploadArea, ...(cvUrl ? S.uploadAreaDone : {})}}>
                  <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => e.target.files[0] && handleCvUpload(e.target.files[0])} />
                  {uploading ? (
                    <div style={S.uploadContent}>
                      <div style={S.uploadIcon}>⏳</div>
                      <div style={S.uploadText}>Uploading your CV...</div>
                    </div>
                  ) : cvUrl ? (
                    <div style={S.uploadContent}>
                      <div style={S.uploadIcon}>✅</div>
                      <div style={S.uploadText}>CV uploaded successfully</div>
                      <div style={S.uploadSub}>Click to replace · <a href={cvUrl} target="_blank" rel="noreferrer" style={S.viewLink} onClick={e => e.stopPropagation()}>View CV →</a></div>
                    </div>
                  ) : (
                    <div style={S.uploadContent}>
                      <div style={S.uploadIcon}>📄</div>
                      <div style={S.uploadText}>Upload your CV</div>
                      <div style={S.uploadSub}>Click to browse · PDF only · Max 5MB</div>
                    </div>
                  )}
                </label>
              </div>

              <button className="saveBtn" style={S.saveBtn} type="submit" disabled={loading}>
                {loading ? '⏳ Saving...' : '💾 Save profile'}
              </button>
            </form>
          </div>

          <div style={S.sideCol}>
            <div style={S.strengthCard}>
              <div style={S.strengthTitle}>Profile strength</div>
              <div style={S.strengthPct}>{profileStrength()}%</div>
              <div style={S.strengthTrack}>
                <div className="progressBar" style={{...S.strengthFill, width: `${profileStrength()}%`}}></div>
              </div>
              <div style={S.strengthItems}>
                {[
                  { label: 'Full name', done: !!fullName },
                  { label: 'University', done: !!university },
                  { label: 'Course', done: !!course },
                  { label: 'Skills', done: !!skills },
                  { label: 'Bio', done: !!bio },
                ].map((item, i) => (
                  <div key={i} style={S.strengthItem}>
                    <span style={{...S.strengthDot, background: item.done ? '#059669' : '#E5E7EB'}}>{item.done ? '✓' : ''}</span>
                    <span style={{...S.strengthItemLabel, color: item.done ? '#059669' : '#94A3B8'}}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{...S.strengthCard, marginTop: '16px', background: '#FFFBEB', border: '1px solid #FDE68A'}}>
              <div style={{...S.strengthTitle, color: '#D97706'}}>💡 Tips</div>
              <div style={S.tipItem}>✓ Add all your technical skills</div>
              <div style={S.tipItem}>✓ Upload an up-to-date CV</div>
              <div style={S.tipItem}>✓ Write a compelling bio</div>
              <div style={S.tipItem}>✓ A complete profile gets 3x more matches</div>
            </div>
          </div>
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
  main: { maxWidth: '1000px', margin: '0 auto', padding: '36px 24px' },
  pageHead: { marginBottom: '28px' },
  heading: { fontSize: '26px', fontWeight: '800', color: '#0F172A', marginBottom: '6px', letterSpacing: '-0.5px' },
  headSub: { fontSize: '14.5px', color: '#94A3B8' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' },
  formCol: {},
  sideCol: {},
  card: { background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #F0F2F5', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' },
  cardTitle: { fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '18px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { marginBottom: '4px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '7px', color: '#374151' },
  required: { color: '#DC2626' },
  hint: { fontSize: '11.5px', color: '#94A3B8', marginTop: '5px' },
  input: { width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit', color: '#0F172A' },
  skillsPreview: { display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '10px' },
  skillChip: { background: '#EFF6FF', color: '#2563EB', padding: '5px 13px', borderRadius: '20px', fontSize: '12.5px', fontWeight: '600' },
  uploadArea: { display: 'block', border: '2px dashed #E5E7EB', borderRadius: '14px', padding: '32px', textAlign: 'center' },
  uploadAreaDone: { border: '2px dashed #A7F3D0', background: '#F0FDF4' },
  uploadContent: {},
  uploadIcon: { fontSize: '32px', marginBottom: '10px' },
  uploadText: { fontSize: '14.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' },
  uploadSub: { fontSize: '12.5px', color: '#94A3B8' },
  viewLink: { color: '#2563EB', fontWeight: '700', textDecoration: 'none' },
  saveBtn: { width: '100%', padding: '14px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', marginTop: '16px', boxShadow: '0 4px 14px rgba(37,99,235,0.25)' },
  error: { background: '#FEF2F2', color: '#DC2626', padding: '13px 16px', borderRadius: '10px', fontSize: '13.5px', fontWeight: '600', marginBottom: '16px' },
  successBox: { background: '#ECFDF5', color: '#059669', padding: '13px 16px', borderRadius: '10px', fontSize: '13.5px', fontWeight: '600', marginBottom: '16px' },
  strengthCard: { background: '#fff', borderRadius: '16px', padding: '22px', border: '1px solid #F0F2F5', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' },
  strengthTitle: { fontSize: '14px', fontWeight: '800', color: '#0F172A', marginBottom: '12px' },
  strengthPct: { fontSize: '32px', fontWeight: '800', color: '#2563EB', marginBottom: '10px' },
  strengthTrack: { height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' },
  strengthFill: { height: '100%', borderRadius: '4px', transition: 'width 1s ease' },
  strengthItems: { display: 'flex', flexDirection: 'column', gap: '8px' },
  strengthItem: { display: 'flex', alignItems: 'center', gap: '10px' },
  strengthDot: { width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', color: '#fff', flexShrink: 0 },
  strengthItemLabel: { fontSize: '13px', fontWeight: '600' },
  tipItem: { fontSize: '13px', color: '#92400E', marginBottom: '7px', lineHeight: '1.5' }
}