import { useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

export default function PostJob() {
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
    else { setSuccess('Job posted successfully!'); setTimeout(() => navigate('/employer'), 2000) }
    setLoading(false)
  }

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .pageIn{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) forwards}
        .inputF{transition:border-color .2s ease,box-shadow .2s ease}
        .inputF:focus{outline:none;border-color:#2563EB!important;box-shadow:0 0 0 3px rgba(37,99,235,0.1)!important}
        .submitBtn{transition:all .2s ease}
        .submitBtn:hover{transform:translateY(-2px);box-shadow:0 10px 22px rgba(37,99,235,0.3)!important}
        .backBtn{transition:all .2s ease}
        .backBtn:hover{background:#EFF6FF!important;color:#2563EB!important}
        .typeCard{transition:all .2s ease;cursor:pointer;user-select:none}
        .typeCard:hover{border-color:#DBEAFE!important;background:#F0F7FF!important}
      `}</style>

      <nav style={S.nav}>
        <div style={S.logo}>CareerBridge</div>
        <button className="backBtn" style={S.backBtn} onClick={() => navigate('/employer')}>← Back to dashboard</button>
      </nav>

      <div className="pageIn" style={S.main}>
        <div style={S.pageHead}>
          <h1 style={S.heading}>Post a new job</h1>
          <p style={S.headSub}>Fill in the details below to start receiving applications</p>
        </div>

        <div style={S.layout}>
          <div style={S.formCol}>
            {error && <div style={S.error}>⚠️ {error}</div>}
            {success && <div style={S.successBox}>✓ {success} Redirecting...</div>}

            <form onSubmit={handleSubmit}>
              <div style={S.card}>
                <div style={S.cardTitle}>Basic Information</div>
                <div style={S.grid2}>
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

              <div style={{...S.card, marginTop: '16px'}}>
                <div style={S.cardTitle}>Job Type</div>
                <div style={S.typeHint}>Select all that apply — you can choose multiple</div>
                <div style={S.typeGrid}>
                  {[
                    { t: 'Full-time', icon: '💼' },
                    { t: 'Internship', icon: '🎓' },
                    { t: 'Part-time', icon: '⏰' },
                    { t: 'Contract', icon: '📝' }
                  ].map(({ t, icon }) => (
                    <div key={t} className="typeCard" style={{...S.typeCard, ...(types.includes(t) ? S.typeCardActive : {})}} onClick={() => toggleType(t)}>
                      <div style={S.typeIcon}>{icon}</div>
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

              <div style={{...S.card, marginTop: '16px'}}>
                <div style={S.cardTitle}>Job Description</div>
                <div style={S.field}>
                  <label style={S.label}>Description <span style={S.required}>*</span></label>
                  <textarea className="inputF" style={{...S.input, height: '160px', resize: 'vertical'}} placeholder="Describe the role, responsibilities, requirements and what you're looking for in a candidate..." value={description} onChange={e => setDescription(e.target.value)} required />
                </div>
              </div>

              <button className="submitBtn" style={S.submitBtn} type="submit" disabled={loading}>
                {loading ? '⏳ Posting...' : '🚀 Post job'}
              </button>
            </form>
          </div>

          <div style={S.sideCol}>
            <div style={S.tipCard}>
              <div style={S.tipTitle}>💡 Tips for a great job post</div>
              <div style={S.tipItem}>✓ Use a clear, specific job title</div>
              <div style={S.tipItem}>✓ List the most important skills first</div>
              <div style={S.tipItem}>✓ Be specific about the location</div>
              <div style={S.tipItem}>✓ Write a detailed description to attract the right candidates</div>
              <div style={S.tipItem}>✓ Select all job types that apply to reach more candidates</div>
            </div>
            <div style={{...S.tipCard, marginTop: '16px', background: '#F5F3FF', border: '1px solid #DDD6FE'}}>
              <div style={{...S.tipTitle, color: '#7C3AED'}}>🤖 AI matching</div>
              <div style={{...S.tipItem, color: '#6D28D9'}}>Once posted, our AI will automatically match your job to the most suitable student profiles based on skills and experience.</div>
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
  typeHint: { fontSize: '12.5px', color: '#94A3B8', fontWeight: '600', marginBottom: '12px' },
  typeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '12px' },
  typeCard: { border: '1.5px solid #E5E7EB', borderRadius: '12px', padding: '14px 10px', textAlign: 'center', background: '#F8FAFC' },
  typeCardActive: { border: '1.5px solid #2563EB', background: '#EFF6FF' },
  typeIcon: { fontSize: '22px', marginBottom: '6px' },
  typeLabel: { fontSize: '12.5px', fontWeight: '700', color: '#374151' },
  typeCheck: { fontSize: '11px', color: '#2563EB', fontWeight: '800', marginTop: '4px' },
  selectedTypes: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '8px', fontSize: '13px', color: '#64748B', fontWeight: '600' },
  selectedBadge: { background: '#EFF6FF', color: '#2563EB', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  submitBtn: { width: '100%', padding: '14px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', marginTop: '16px', boxShadow: '0 4px 14px rgba(37,99,235,0.25)' },
  error: { background: '#FEF2F2', color: '#DC2626', padding: '13px 16px', borderRadius: '10px', fontSize: '13.5px', fontWeight: '600', marginBottom: '16px' },
  successBox: { background: '#ECFDF5', color: '#059669', padding: '13px 16px', borderRadius: '10px', fontSize: '13.5px', fontWeight: '600', marginBottom: '16px' },
  tipCard: { background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '14px', padding: '20px' },
  tipTitle: { fontSize: '14px', fontWeight: '800', color: '#D97706', marginBottom: '12px' },
  tipItem: { fontSize: '13px', color: '#92400E', marginBottom: '8px', lineHeight: '1.5' }
}