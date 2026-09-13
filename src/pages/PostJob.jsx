// src/pages/PostJob.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import ImageUploader from '../components/ImageUploader'
import { packJobDescription } from '../lib/jobsStore'

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
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
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
  const [salary, setSalary] = useState('')
  const [imageAttachment, setImageAttachment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      if (data?.company_name) setCompany(data.company_name)
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

    if (types.length === 0) {
      setError('Please select at least one job type')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    // Pack salary + image into description using hidden comments.
    // This avoids any database schema change — jobs.description holds everything.
    const packedDescription = packJobDescription(description, imageAttachment, salary)

    const { error: insertError } = await supabase.from('jobs').insert({
      employer_id: user.id,
      title,
      company,
      location,
      type: types.join(', '),
      description: packedDescription,
      skills,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setSuccess('Job posted successfully with attached flyer!')
    setLoading(false)

    setTimeout(() => {
      navigate('/employer/my-jobs')
    }, 1200)
  }

  return (
    <div style={S.page}>
      <style>{`
        .pj-input {
          width: 100%; padding: 12px 14px;
          border: 1.5px solid #E2E8F0; border-radius: 10px;
          font-size: 16px; font-family: inherit; color: #0F172A;
          box-sizing: border-box;
          transition: border-color .2s ease, box-shadow .2s ease;
          background: #FFFFFF;
        }
        .pj-input:focus {
          outline: none;
          border-color: #EA4E1B;
          box-shadow: 0 0 0 3px rgba(234,78,27,0.1);
        }
        .pj-submit {
          transition: all .2s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 14px; min-height: 48px;
          background: #EA4E1B; color: #fff; border: none; border-radius: 12px;
          cursor: pointer; font-size: 15px; font-weight: 700;
          box-shadow: 0 4px 14px rgba(234,78,27,0.25);
        }
        .pj-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(234,78,27,0.3);
        }
        .pj-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .pj-type-card {
          transition: all .2s ease; cursor: pointer; user-select: none;
          border: 1.5px solid #E2E8F0; border-radius: 12px;
          padding: 14px 10px; text-align: center; background: #FAFBFC;
          min-height: 88px;
        }
        .pj-type-card:hover { border-color: #FFDCC7; background: #FFF6F0; }
        .pj-type-card.active { border: 1.5px solid #EA4E1B; background: #FFF4EE; }

        @media (max-width: 1024px) { .pj-layout { grid-template-columns: 1fr !important; } }
        @media (max-width: 768px) {
          .pj-grid2 { grid-template-columns: 1fr !important; }
          .pj-typerow { grid-template-columns: 1fr 1fr !important; }
          .pj-main { padding: 20px 16px !important; }
        }
      `}</style>

      <div className="pj-main" style={S.main}>
        <div style={S.pageHead}>
          <h1 style={S.heading}>Post a new job</h1>
          <p style={S.headSub}>Add a flyer or logo to make your listing stand out</p>
        </div>

        <div className="pj-layout" style={S.layoutGrid}>
          <div style={S.formCol}>
            {error && <div style={S.error}><Icon path={icons.alert} size={16} /> {error}</div>}
            {success && (
              <div style={{ ...S.successBox, flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div><Icon path={icons.check} size={16} /> {success}</div>
                <div style={{ fontSize: 12, color: C.sub }}>Redirecting to your listings...</div>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit}>
                {/* ---- Basic Info ---- */}
                <div style={S.card}>
                  <div style={S.cardTitle}>Basic Information</div>
                  <div className="pj-grid2" style={S.grid2}>
                    <div style={S.field}>
                      <label style={S.label}>Job title <span style={S.required}>*</span></label>
                      <input className="pj-input" type="text" placeholder="e.g. Software Engineer Intern"
                        value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    <div style={S.field}>
                      <label style={S.label}>Company name <span style={S.required}>*</span></label>
                      <input className="pj-input" type="text" placeholder="Your company name"
                        value={company} onChange={e => setCompany(e.target.value)} required />
                    </div>
                    <div style={S.field}>
                      <label style={S.label}>Location <span style={S.required}>*</span></label>
                      <input className="pj-input" type="text" placeholder="e.g. Accra, Remote"
                        value={location} onChange={e => setLocation(e.target.value)} required />
                    </div>
                    <div style={S.field}>
                      <label style={S.label}>Salary / Compensation (optional)</label>
                      <input className="pj-input" type="text" placeholder="e.g. GH₵ 4,000 / month"
                        value={salary} onChange={e => setSalary(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* ---- Image Uploader ---- */}
                <div style={{ ...S.card, marginTop: 16 }}>
                  <div style={S.cardTitle}>
                    <Icon path={icons.image} size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                    Promotional Image
                  </div>
                  <div style={{ fontSize: 13, color: C.sub, marginBottom: 14 }}>
                    Attach a flyer, banner, or company logo. Listings with images get <strong style={{ color: C.ink }}>3.2x more applications</strong>.
                  </div>
                  <ImageUploader imageAttachment={imageAttachment} onChange={setImageAttachment} />
                </div>

                {/* ---- Job Type ---- */}
                <div style={{ ...S.card, marginTop: 16 }}>
                  <div style={S.cardTitle}>Job Type</div>
                  <div style={S.typeHint}>Select all that apply — you can choose multiple</div>
                  <div className="pj-typerow" style={S.typeGrid}>
                    {[
                      { t: 'Full-time', icon: icons.briefcase },
                      { t: 'Internship', icon: icons.cap },
                      { t: 'Part-time', icon: icons.clock },
                      { t: 'Contract', icon: icons.file },
                    ].map(({ t, icon }) => (
                      <div
                        key={t}
                        className={`pj-type-card ${types.includes(t) ? 'active' : ''}`}
                        onClick={() => toggleType(t)}
                      >
                        <div style={{ ...S.typeIcon, color: types.includes(t) ? C.accent : C.sub }}>
                          <Icon path={icon} size={22} />
                        </div>
                        <div style={S.typeLabel}>{t}</div>
                        {types.includes(t) && <div style={S.typeCheck}>✓ Selected</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ---- Skills ---- */}
                <div style={{ ...S.card, marginTop: 16 }}>
                  <div style={S.cardTitle}>Required Skills</div>
                  <div style={S.field}>
                    <label style={S.label}>Skills <span style={S.required}>*</span></label>
                    <input className="pj-input" type="text" placeholder="e.g. Python, React, SQL"
                      value={skills} onChange={e => setSkills(e.target.value)} required />
                    <div style={S.hint}>Separate skills with commas — used by AI matching</div>
                  </div>
                </div>

                {/* ---- Description ---- */}
                <div style={{ ...S.card, marginTop: 16 }}>
                  <div style={S.cardTitle}>Job Description</div>
                  <div style={S.field}>
                    <label style={S.label}>Description <span style={S.required}>*</span></label>
                    <textarea className="pj-input" style={{ minHeight: 160, resize: 'vertical', fontFamily: 'inherit' }}
                      placeholder="Describe the role, responsibilities, requirements..."
                      value={description} onChange={e => setDescription(e.target.value)} required />
                  </div>
                </div>

                <button className="pj-submit" type="submit" disabled={loading}>
                  <Icon path={icons.rocket} size={16} /> {loading ? 'Posting...' : 'Post job'}
                </button>
              </form>
            )}
          </div>

          {/* ---- Sidebar ---- */}
          <div style={S.sideCol}>
            <div style={S.tipCard}>
              <div style={S.tipTitle}><Icon path={icons.bulb} size={16} /> Tips for a great post</div>
              <div style={S.tipItem}>Use a clear, specific job title</div>
              <div style={S.tipItem}>List the most important skills first</div>
              <div style={S.tipItem}>Be specific about the location</div>
              <div style={S.tipItem}>Add a flyer to stand out — 3.2x more applicants</div>
              <div style={S.tipItem}>Write a detailed description to attract the right candidates</div>
            </div>
            <div style={{ ...S.tipCard, marginTop: 16, background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <div style={{ ...S.tipTitle, color: '#1D4ED8' }}><Icon path={icons.bot} size={16} /> AI matching</div>
              <div style={{ ...S.tipItem, color: '#1E40AF' }}>
                Once posted, our AI matches your job to suitable students based on skills and experience.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Inter', -apple-system, sans-serif" },
  main: { maxWidth: 1440, margin: '0 auto', padding: '32px 32px 60px', width: '100%' },
  pageHead: { marginBottom: 28 },
  heading: { fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 900, color: C.ink, marginBottom: 6, letterSpacing: '-1px' },
  headSub: { fontSize: 'clamp(13px, 1.4vw, 15px)', color: C.sub },

  layoutGrid: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 },
  formCol: { minWidth: 0 },
  sideCol: { minWidth: 0 },

  card: { background: C.card, borderRadius: 16, padding: 'clamp(16px, 2.5vw, 24px)', border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
  cardTitle: { fontSize: 16, fontWeight: 800, color: C.ink, marginBottom: 18 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  field: { marginBottom: 4 },
  label: { display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 7, color: C.navText },
  required: { color: C.red },
  hint: { fontSize: 12, color: C.sub, marginTop: 5 },

  typeHint: { fontSize: 13, color: C.sub, fontWeight: 600, marginBottom: 12 },
  typeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 },
  typeIcon: { display: 'flex', justifyContent: 'center', marginBottom: 6 },
  typeLabel: { fontSize: 13, fontWeight: 700, color: C.navText },
  typeCheck: { fontSize: 11, color: C.accent, fontWeight: 800, marginTop: 4 },

  error: { display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', color: C.red, padding: '13px 16px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, marginBottom: 16 },
  successBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#ECFDF5', color: C.green, padding: '13px 16px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, marginBottom: 16 },

  tipCard: { background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 14, padding: 20 },
  tipTitle: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 800, color: '#D97706', marginBottom: 12 },
  tipItem: { fontSize: 13, color: '#92400E', marginBottom: 8, lineHeight: 1.5 },
}