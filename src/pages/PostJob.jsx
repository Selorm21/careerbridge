// src/pages/PostJob.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

// ---------- inline icon set ----------
const Icon = ({ path, size = 18, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {path}
  </svg>
)
const icons = {
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
  cap: <><path d="M2 9l10-5 10 5-10 5-10-5z" /><path d="M6 11v4c0 1.5 2.5 3 6 3s6-1.5 6-3v-4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  file: <><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v5h5" /></>,
  alert: <><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9L2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></>,
  rocket: <><path d="M4.5 16.5c-1.5 1.5-2 5-2 5s3.5-.5 5-2c.8-.8 1-2.2.2-3.2a2 2 0 0 0-3.2.2z" /><path d="M12 15l-3-3a19 19 0 0 1 7-11c3 0 6 3 6 6a19 19 0 0 1-11 7z" /><circle cx="15" cy="9" r="2" /></>,
  bulb: <><path d="M9 18h6M10 22h4" /><path d="M12 2a6 6 0 0 0-3.5 10.9c.6.4.9 1.1.9 1.8v.3h5.2v-.3c0-.7.3-1.4.9-1.8A6 6 0 0 0 12 2z" /></>,
  bot: <><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M12 8V4M9 4h6" /><circle cx="9" cy="14" r="1.3" /><circle cx="15" cy="14" r="1.3" /></>,
}

const C = {
  ink: '#0F172A',
  sub: '#64748B',
  border: '#E2E8F0',
  card: '#FFFFFF',
  navText: '#475569',
  accent: '#EA4E1B',
  green: '#10B981',
  red: '#DC2626',
}

export default function PostJob() {
  const [profile, setProfile] = useState(null)
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [location, setLocation] = useState('')
  const [types, setTypes] = useState([])
  const [description, setDescription] = useState('')
  const [skills, setSkills] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
    }
    getProfile()
  }, [])

  function toggleType(t) {
    setTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    if (types.length === 0) { setError('Please select at least one job type'); setLoading(false); return }
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('jobs').insert({
      employer_id: user.id, title, company, location,
      type: types.join(', '), description, skills
    })
    if (error) setError(error.message)
    else { setSuccess('Job posted successfully!') }
    setLoading(false)
  }

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .pageIn{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) forwards}
        .inputF{transition:border-color .2s ease,box-shadow .2s ease}
        .inputF:focus{outline:none;border-color:${C.accent}!important;box-shadow:0 0 0 3px rgba(234,78,27,0.1)!important}
        .submitBtn{transition:all .2s ease}
        .submitBtn:hover{transform:translateY(-2px);box-shadow:0 10px 22px rgba(234,78,27,0.3)!important}
        .typeCard{transition:all .2s ease;cursor:pointer;user-select:none}
        .typeCard:hover{border-color:#FFDCC7!important;background:#FFF6F0!important}
        @media(max-width:1024px){
          .layoutGrid{grid-template-columns:1fr!important}
        }
        @media(max-width:768px){
          .grid2El{grid-template-columns:1fr!important}
          .typeGridEl{grid-template-columns:1fr 1fr!important}
          .mainEl{padding:20px 16px!important}
        }
      `}</style>

      <div className="pageIn mainEl" style={S.main}>
        <div style={S.pageHead}>
          <h1 style={S.heading}>Post a new job</h1>
          <p style={S.headSub}>Fill in the details below to start receiving applications</p>
        </div>

        <div style={S.layoutGrid}>
          <div style={S.formCol}>
            {error && <div style={S.error}><Icon path={icons.alert} size={16} /> {error}</div>}
            {success && (
              <div style={{ ...S.successBox, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div><Icon path={icons.check} size={16} /> {success}</div>
                <button onClick={() => navigate('/employer')} style={{ ...S.submitBtn, width: 'auto', padding: '10px 20px', fontSize: '14px', marginTop: 0 }}>
                  Return to Dashboard
                </button>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit}>
                <div style={S.card}>
                  <div style={S.cardTitle}>Basic Information</div>
                  <div className="grid2El" style={S.grid2}>
                    <div style={S.field}>
                      <label style={S.label}>Job title <span style={S.required}>*</span></label>
                      <input className="inputF" style={S.input} type="text" placeholder="e.g. Software Engineer Intern" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    <div style={S.field}>
                      <label style={S.label}>Company name <span style={S.required}>*</span></label>
                      <input className="inputF" style={S.input} type="text" placeholder="Your company name" value={company} onChange={e => setCompany(e.target.value)} required />
                    </div>
                    <div style={S.field}>
                      <label style={S.label}>Location <span style={S.required}>*</span></label>
                      <input className="inputF" style={S.input} type="text" placeholder="e.g. Accra, Remote" value={location} onChange={e => setLocation(e.target.value)} required />
                    </div>
                    <div style={S.field}>
                      <label style={S.label}>Required skills <span style={S.required}>*</span></label>
                      <input className="inputF" style={S.input} type="text" placeholder="e.g. Python, React, SQL" value={skills} onChange={e => setSkills(e.target.value)} required />
                      <div style={S.hint}>Separate skills with commas</div>
                    </div>
                  </div>
                </div>

                <div style={{ ...S.card, marginTop: '16px' }}>
                  <div style={S.cardTitle}>Job Type</div>
                  <div style={S.typeHint}>Select all that apply — you can choose multiple</div>
                  <div className="typeGridEl" style={S.typeGrid}>
                    {[
                      { t: 'Full-time', icon: icons.briefcase },
                      { t: 'Internship', icon: icons.cap },
                      { t: 'Part-time', icon: icons.clock },
                      { t: 'Contract', icon: icons.file }
                    ].map(({ t, icon }) => (
                      <div key={t} className="typeCard" style={{ ...S.typeCard, ...(types.includes(t) ? S.typeCardActive : {}) }} onClick={() => toggleType(t)}>
                        <div style={{ ...S.typeIcon, color: types.includes(t) ? C.accent : C.sub }}><Icon path={icon} size={22} /></div>
                        <div style={S.typeLabel}>{t}</div>
                        {types.includes(t) && <div style={S.typeCheck}>✓ Selected</div>}
                      </div>
                    ))}
                  </div>
                  {types.length > 0 && (
                    <div style={S.selectedTypes}>
                      Selected: {types.map(t => <span key={t} style={S.selectedBadge}>{t}</span>)}
                    </div>
                  )}
                </div>

                <div style={{ ...S.card, marginTop: '16px' }}>
                  <div style={S.cardTitle}>Job Description</div>
                  <div style={S.field}>
                    <label style={S.label}>Description <span style={S.required}>*</span></label>
                    <textarea className="inputF" style={{ ...S.input, height: '160px', resize: 'vertical' }} placeholder="Describe the role, responsibilities, requirements..." value={description} onChange={e => setDescription(e.target.value)} required />
                  </div>
                </div>

                <button className="submitBtn" style={S.submitBtn} type="submit" disabled={loading}>
                  <Icon path={icons.rocket} size={16} /> {loading ? 'Posting...' : 'Post job'}
                </button>
              </form>
            )}
          </div>

          <div style={S.sideCol}>
            <div style={S.tipCard}>
              <div style={S.tipTitle}><Icon path={icons.bulb} size={16} /> Tips for a great job post</div>
              <div style={S.tipItem}>Use a clear, specific job title</div>
              <div style={S.tipItem}>List the most important skills first</div>
              <div style={S.tipItem}>Be specific about the location</div>
              <div style={S.tipItem}>Write a detailed description to attract the right candidates</div>
              <div style={S.tipItem}>Select all job types that apply to reach more candidates</div>
            </div>
            <div style={{ ...S.tipCard, marginTop: '16px', background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <div style={{ ...S.tipTitle, color: '#1D4ED8' }}><Icon path={icons.bot} size={16} /> AI matching</div>
              <div style={{ ...S.tipItem, color: '#1E40AF' }}>Once posted, our AI will automatically match your job to the most suitable student profiles based on skills and experience.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 🎨 STYLES
// ============================================================
const S = {
  page: { minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Inter', -apple-system, sans-serif" },

  // ✅ FIXED: Expanded width to match large screens with floating sidebar
  main: { maxWidth: '1440px', margin: '0 auto', padding: '32px 32px 60px', width: '100%' },
  pageHead: { marginBottom: '28px' },
  heading: { fontSize: '28px', fontWeight: '900', color: C.ink, marginBottom: '6px', letterSpacing: '-1px' },
  headSub: { fontSize: '15px', color: C.sub },

  layoutGrid: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px' },
  formCol: {},
  sideCol: {},

  card: { background: C.card, borderRadius: '16px', padding: '24px', border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
  cardTitle: { fontSize: '16px', fontWeight: '800', color: C.ink, marginBottom: '18px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { marginBottom: '4px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '7px', color: C.navText },
  required: { color: C.red },
  hint: { fontSize: '12px', color: C.sub, marginTop: '5px' },
  input: { width: '100%', padding: '12px 14px', border: `1.5px solid ${C.border}`, borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit', color: C.ink },

  typeHint: { fontSize: '13px', color: C.sub, fontWeight: '600', marginBottom: '12px' },
  typeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' },
  typeCard: { border: `1.5px solid ${C.border}`, borderRadius: '12px', padding: '14px 10px', textAlign: 'center', background: '#FAFBFC' },
  typeCardActive: { border: `1.5px solid ${C.accent}`, background: '#FFF4EE' },
  typeIcon: { display: 'flex', justifyContent: 'center', marginBottom: '6px' },
  typeLabel: { fontSize: '13px', fontWeight: '700', color: C.navText },
  typeCheck: { fontSize: '11px', color: C.accent, fontWeight: '800', marginTop: '4px' },
  selectedTypes: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '8px', fontSize: '13px', color: C.navText, fontWeight: '600' },
  selectedBadge: { background: '#FFF4EE', color: C.accent, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },

  submitBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', background: C.accent, color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', marginTop: '20px', boxShadow: '0 4px 14px rgba(234,78,27,0.25)' },
  error: { display: 'flex', alignItems: 'center', gap: '8px', background: '#FEF2F2', color: C.red, padding: '13px 16px', borderRadius: '10px', fontSize: '13.5px', fontWeight: '600', marginBottom: '16px' },
  successBox: { display: 'flex', alignItems: 'center', gap: '8px', background: '#ECFDF5', color: C.green, padding: '13px 16px', borderRadius: '10px', fontSize: '13.5px', fontWeight: '600', marginBottom: '16px' },

  tipCard: { background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '14px', padding: '20px' },
  tipTitle: { display: 'flex', alignItems: 'center', gap: '7px', fontSize: '14px', fontWeight: '800', color: '#D97706', marginBottom: '12px' },
  tipItem: { fontSize: '13px', color: '#92400E', marginBottom: '8px', lineHeight: '1.5' }
}