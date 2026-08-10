import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

// ---------- inline icon set (shared visual language with Analytics / BrowseJobs) ----------
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
  alert: <><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9L2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></>,
  file: <><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v5h5" /></>,
  save: <><path d="M5 3h11l3 3v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M8 3v6h8V3M8 13h8v7H8z" /></>,
  bulb: <><path d="M9 18h6M10 22h4" /><path d="M12 2a6 6 0 0 0-3.5 10.9c.6.4.9 1.1.9 1.8v.3h5.2v-.3c0-.7.3-1.4.9-1.8A6 6 0 0 0 12 2z" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
}

const C = {
  bg: '#F8FAFC',
  ink: '#0F172A',
  sub: '#64748B',
  border: '#E2E8F0',
  card: 'rgba(255, 255, 255, 0.75)',
  navText: '#475569',
  accent: '#EA4E1B',
  teal: '#0E9C8F',
  green: '#10B981',
  red: '#DC2626',
}

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
  const [profile, setProfile] = useState(null)
  const [applicationsCount, setApplicationsCount] = useState(0)
  const [interviewsCount, setInterviewsCount] = useState(0)
  const [recommendedCount, setRecommendedCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setFullName(data.full_name || '')
        setUniversity(data.university || '')
        setCourse(data.course || '')
        setGraduationYear(data.graduation_year || '')
        setSkills(data.skills || '')
        setBio(data.bio || '')
        setCvUrl(data.cv_url || '')
      }

      const { data: appsData } = await supabase
        .from('applications')
        .select('job_id')
        .eq('student_id', user.id)

      setApplicationsCount(appsData?.length || 0)

      const { data: interviewsData } = await supabase
        .from('interviews')
        .select('id')
        .eq('student_id', user.id)

      setInterviewsCount(interviewsData?.length || 0)

      // Keep the Recommended badge consistent with the dashboard.
      if (data?.skills) {
        const { data: jobsData } = await supabase.from('jobs').select('*')
        const appliedIds = appsData?.map(a => a.job_id) || []
        const skillsList = data.skills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean)

        const count = (jobsData || [])
          .filter(job => !appliedIds.includes(job.id))
          .map(job => {
            const jobSkills = job.skills?.toLowerCase().split(',').map(s => s.trim()).filter(Boolean) || []
            const matched = jobSkills.filter(skill =>
              skillsList.some(studentSkill =>
                studentSkill.includes(skill) || skill.includes(studentSkill)
              )
            )
            return jobSkills.length ? Math.round((matched.length / jobSkills.length) * 100) : 0
          })
          .filter(score => score > 0)
          .length

        setRecommendedCount(count > 4 ? 4 : count)
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

  const initials = (name) => (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes pulseGlow{0%,100%{opacity:0.3}50%{opacity:0.6}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        
        .pageIn{animation:fadeUp .6s cubic-bezier(.16,1,.3,1) forwards}
        .glowPulse{animation:pulseGlow 6s ease-in-out infinite}
        
        .cardIn{transition:all 0.4s cubic-bezier(.34,1.56,.64,1);}
        .cardIn:hover{box-shadow:0 20px 40px rgba(15,23,42,0.06)!important;border-color:rgba(234,78,27,0.2)!important;}
        
        .inputF{transition:border-color .2s ease,box-shadow .2s ease,transform .2s ease; background: rgba(255,255,255,0.6);}
        .inputF:focus{outline:none;border-color:${C.accent}!important;box-shadow:0 0 0 4px rgba(234,78,27,0.12)!important;transform:translateY(-1px); background: #FFFFFF;}
        
        .saveBtn{transition:all 0.3s cubic-bezier(.34,1.56,.64,1);}
        .saveBtn:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 12px 24px rgba(234,78,27,0.35)!important;}
        
        .uploadArea{transition:all .3s ease;cursor:pointer}
        .uploadArea:hover{border-color:${C.accent}!important;background:rgba(234,78,27,0.04)!important; transform: scale(1.01);}
        .progressBar{background:linear-gradient(90deg,${C.accent},#FF8552,${C.accent});background-size:200% 100%;animation:shimmer 2s linear infinite; border-radius: 4px;}
        
        @media(max-width:1000px){.mainEl{padding-left:24px!important;padding-right:24px!important}}
        @media(max-width:900px){.layoutGrid{grid-template-columns:1fr!important}}
        @media(max-width:768px){.grid2El{grid-template-columns:1fr!important};.mainEl{padding:20px 16px!important}}
      `}</style>

      {/* 🌟 Ambient Glowing Background */}
      <div style={S.bgEffects}>
        <div style={S.glowOrb1} className="glowPulse"></div>
        <div style={S.glowOrb2} className="glowPulse"></div>
        <div style={S.gridPattern}></div>
      </div>

      {/* ---------------- Main ---------------- */}
      <div className="pageIn mainEl" style={S.main}>
        <div style={S.pageHead}>
          <h1 style={S.heading}>My Profile</h1>
          <p style={S.headSub}>Complete your profile to get better job matches and impress employers</p>
        </div>

        <div className="layoutGrid" style={S.layout}>
          <div style={S.formCol}>
            {error && <div style={S.error}><Icon path={icons.alert} size={16} /> {error}</div>}
            {success && <div style={S.successBox}><Icon path={icons.check} size={16} /> {success}</div>}

            <form onSubmit={handleSave}>
              
              {/* --- PERSONAL INFO CARD --- */}
              <div className="cardIn" style={S.card}>
                <div style={S.cardTitle}>Personal Information</div>
                <div className="grid2El" style={S.grid2}>
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

              {/* --- SKILLS & BIO CARD --- */}
              <div className="cardIn" style={{ ...S.card, marginTop: '20px' }}>
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
                <div style={{ ...S.field, marginTop: '16px' }}>
                  <label style={S.label}>Short bio</label>
                  <textarea className="inputF" style={{ ...S.input, height: '110px', resize: 'vertical' }} placeholder="Tell employers about yourself, your goals and experience..." value={bio} onChange={e => setBio(e.target.value)} />
                  <div style={S.hint}>{bio.length}/300 characters</div>
                </div>
              </div>

              {/* --- CV UPLOAD CARD --- */}
              <div className="cardIn" style={{ ...S.card, marginTop: '20px' }}>
                <div style={S.cardTitle}>CV / Resume</div>
                <label className="uploadArea" style={{ ...S.uploadArea, ...(cvUrl ? S.uploadAreaDone : {}) }}>
                  <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => e.target.files[0] && handleCvUpload(e.target.files[0])} />
                  {uploading ? (
                    <div style={S.uploadContent}>
                      <div style={S.uploadIconWrap}>⏳</div>
                      <div style={S.uploadText}>Uploading your CV...</div>
                    </div>
                  ) : cvUrl ? (
                    <div style={S.uploadContent}>
                      <div style={{ ...S.uploadIconWrap, background: 'rgba(16, 185, 129, 0.1)', color: C.teal }}><Icon path={icons.check} size={24} /></div>
                      <div style={S.uploadText}>CV uploaded successfully</div>
                      <div style={S.uploadSub}>Click to replace · <a href={cvUrl} target="_blank" rel="noreferrer" style={S.viewLink} onClick={e => e.stopPropagation()}>View CV →</a></div>
                    </div>
                  ) : (
                    <div style={S.uploadContent}>
                      <div style={{ ...S.uploadIconWrap, background: 'rgba(234, 78, 27, 0.08)', color: C.accent }}><Icon path={icons.file} size={24} /></div>
                      <div style={S.uploadText}>Upload your CV</div>
                      <div style={S.uploadSub}>Click to browse · PDF only · Max 5MB</div>
                    </div>
                  )}
                </label>
              </div>

              <button className="saveBtn" style={S.saveBtn} type="submit" disabled={loading}>
                <Icon path={icons.save} size={16} /> {loading ? 'Saving...' : 'Save profile'}
              </button>
            </form>
          </div>

          <div style={S.sideCol}>
            
            {/* --- PROFILE STRENGTH CARD --- */}
            <div className="cardIn" style={S.strengthCard}>
              <div style={S.strengthTitle}>Profile strength</div>
              <div style={S.strengthPct}>{profileStrength()}%</div>
              <div style={S.strengthTrack}>
                <div className="progressBar" style={{ ...S.strengthFill, width: `${profileStrength()}%` }}></div>
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
                    <span style={{ ...S.strengthDot, background: item.done ? C.green : '#E2E8F0' }}>
                      {item.done ? '✓' : ''}
                    </span>
                    <span style={{ ...S.strengthItemLabel, color: item.done ? C.ink : C.sub }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* --- TIPS CARD --- */}
            <div className="cardIn" style={{ ...S.strengthCard, marginTop: '20px', background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div style={{ ...S.strengthTitle, color: '#D97706', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Icon path={icons.bulb} size={16} /> Tips
              </div>
              <div style={S.tipItem}>Add all your technical skills</div>
              <div style={S.tipItem}>Upload an up-to-date CV</div>
              <div style={S.tipItem}>Write a compelling bio</div>
              <div style={S.tipItem}>A complete profile gets 3x more matches</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 🎨 PREMIUM STYLES
// ============================================================
const S = {
  app: { minHeight: '100vh', background: C.bg, fontFamily: "'Inter', -apple-system, sans-serif", position: 'relative' },

  // Ambient Background Effects
  bgEffects: {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  glowOrb1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06), transparent 70%)',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: '-20%',
    left: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.04), transparent 70%)',
  },
  gridPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)',
    backgroundSize: '32px 32px',
  },

  main: { 
    position: 'relative',
    zIndex: 1,
    flex: 1, 
    minWidth: 0, 
    padding: '32px 40px 60px' 
  },
  pageHead: { marginBottom: '28px' },
  heading: { fontSize: '32px', fontWeight: '900', color: C.ink, marginBottom: '8px', letterSpacing: '-1px' },
  headSub: { fontSize: '15px', color: C.sub },

  layout: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px' },
  formCol: {},
  sideCol: {},
  
  // Form Cards
  card: { 
    background: 'rgba(255, 255, 255, 0.7)', 
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '20px', 
    padding: '26px', 
    border: '1px solid rgba(255, 255, 255, 0.8)', 
    boxShadow: '0 4px 20px rgba(15,23,42,0.03)' 
  },
  cardTitle: { fontSize: '16px', fontWeight: '800', color: C.ink, marginBottom: '20px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { marginBottom: '6px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '7px', color: C.navText },
  required: { color: C.red },
  hint: { fontSize: '12px', color: C.sub, marginTop: '6px' },
  input: { 
    width: '100%', 
    padding: '12px 14px', 
    border: `1.5px solid ${C.border}`, 
    borderRadius: '12px', 
    fontSize: '14px', 
    boxSizing: 'border-box', 
    fontFamily: 'inherit', 
    color: C.ink,
    transition: 'all 0.2s ease'
  },
  
  skillsPreview: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' },
  skillChip: { background: 'rgba(234, 78, 27, 0.08)', color: C.accent, padding: '5px 14px', borderRadius: '20px', fontSize: '12.5px', fontWeight: '600' },
  
  // CV Upload
  uploadArea: { 
    display: 'block', 
    border: '2px dashed rgba(148, 163, 184, 0.4)', 
    borderRadius: '14px', 
    padding: '32px 20px', 
    textAlign: 'center',
    background: 'rgba(255,255,255,0.5)'
  },
  uploadAreaDone: { border: '2px dashed rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.04)' },
  uploadContent: {},
  uploadIconWrap: { 
    width: '56px', 
    height: '56px', 
    borderRadius: '16px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    margin: '0 auto 14px', 
    fontSize: '24px' 
  },
  uploadText: { fontSize: '15px', fontWeight: '700', color: C.navText, marginBottom: '6px' },
  uploadSub: { fontSize: '13px', color: C.sub },
  viewLink: { color: C.accent, fontWeight: '700', textDecoration: 'none' },
  
  // Buttons & Alerts
  saveBtn: { 
    width: '100%', 
    padding: '14px', 
    background: 'linear-gradient(135deg, #EA4E1B, #F97316)',
    color: '#fff', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontSize: '15px', 
    fontWeight: '700', 
    marginTop: '20px', 
    boxShadow: '0 4px 16px rgba(234,78,27,0.3)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '8px' 
  },
  error: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    background: 'rgba(239, 68, 68, 0.08)', 
    color: C.red, 
    padding: '13px 16px', 
    borderRadius: '12px', 
    fontSize: '13.5px', 
    fontWeight: '600', 
    marginBottom: '20px',
    border: '1px solid rgba(239, 68, 68, 0.15)'
  },
  successBox: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    background: 'rgba(16, 185, 129, 0.08)', 
    color: C.green, 
    padding: '13px 16px', 
    borderRadius: '12px', 
    fontSize: '13.5px', 
    fontWeight: '600', 
    marginBottom: '20px',
    border: '1px solid rgba(16, 185, 129, 0.15)'
  },

  // Strength Side Panel
  strengthCard: { 
    background: 'rgba(255, 255, 255, 0.7)', 
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '20px', 
    padding: '24px', 
    border: '1px solid rgba(255, 255, 255, 0.8)', 
    boxShadow: '0 4px 20px rgba(15,23,42,0.03)' 
  },
  strengthTitle: { fontSize: '15px', fontWeight: '800', color: C.ink, marginBottom: '12px' },
  strengthPct: { fontSize: '34px', fontWeight: '900', color: C.accent, marginBottom: '10px' },
  strengthTrack: { height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' },
  strengthFill: { height: '100%', transition: 'width 1s ease' },
  strengthItems: { display: 'flex', flexDirection: 'column', gap: '10px' },
  strengthItem: { display: 'flex', alignItems: 'center', gap: '10px' },
  strengthDot: { 
    width: '22px', 
    height: '22px', 
    borderRadius: '50%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '12px', 
    fontWeight: '800', 
    color: '#fff', 
    flexShrink: 0,
    transition: 'background 0.3s ease'
  },
  strengthItemLabel: { fontSize: '13px', fontWeight: '600' },
  tipItem: { fontSize: '13px', color: '#92400E', marginBottom: '8px', lineHeight: '1.5' }
}