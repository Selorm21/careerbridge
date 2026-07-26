import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate, useParams } from 'react-router-dom'

export default function ScheduleInterview() {
  const [application, setApplication] = useState(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { applicationId } = useParams()

  useEffect(() => {
    async function fetchApplication() {
      const { data } = await supabase
        .from('applications')
        .select('*, jobs(*), profiles(*)')
        .eq('id', applicationId)
        .single()
      setApplication(data)
    }
    fetchApplication()
  }, [])

  async function handleSchedule(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('interviews').insert({
      application_id: applicationId,
      job_id: application.job_id,
      student_id: application.student_id,
      employer_id: user.id,
      interview_date: date,
      interview_time: time,
      location,
      notes,
      status: 'scheduled'
    })

    if (error) { setError(error.message); setLoading(false); return }

    await supabase.from('applications').update({ status: 'interview' }).eq('id', applicationId)

    setSuccess('Interview scheduled successfully!')
    setTimeout(() => navigate(-1), 2000)
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
      `}</style>

      <nav style={S.nav}>
        <div style={S.logo}>CareerBridge</div>
        <button className="backBtn" style={S.backBtn} onClick={() => navigate(-1)}>← Back</button>
      </nav>

      <div className="pageIn" style={S.main}>
        <div style={S.pageHead}>
          <h1 style={S.heading}>Schedule Interview</h1>
          <p style={S.headSub}>Set up an interview with the candidate</p>
        </div>

        {application && (
          <div style={S.candidateCard}>
            <div style={S.candidateAvatar}>{application.profiles?.full_name?.charAt(0)}</div>
            <div>
              <div style={S.candidateName}>{application.profiles?.full_name}</div>
              <div style={S.candidateMeta}>{application.profiles?.email} · {application.profiles?.course} · {application.profiles?.university}</div>
              <div style={S.candidateJob}>Applying for: <strong>{application.jobs?.title}</strong></div>
            </div>
          </div>
        )}

        {error && <div style={S.error}>⚠️ {error}</div>}
        {success && <div style={S.successBox}>✓ {success}</div>}

        <div style={S.card}>
          <form onSubmit={handleSchedule}>
            <div style={S.grid2}>
              <div style={S.field}>
                <label style={S.label}>Interview date <span style={S.required}>*</span></label>
                <input className="inputF" style={S.input} type="date" value={date} onChange={e => setDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} />
              </div>
              <div style={S.field}>
                <label style={S.label}>Interview time <span style={S.required}>*</span></label>
                <input className="inputF" style={S.input} type="time" value={time} onChange={e => setTime(e.target.value)} required />
              </div>
            </div>
            <div style={S.field}>
              <label style={S.label}>Location / Meeting link <span style={S.required}>*</span></label>
              <input className="inputF" style={S.input} type="text" placeholder="e.g. Office - 3rd Floor, Accra or https://meet.google.com/xyz" value={location} onChange={e => setLocation(e.target.value)} required />
            </div>
            <div style={S.field}>
              <label style={S.label}>Notes for candidate</label>
              <textarea className="inputF" style={{...S.input, height: '100px', resize: 'vertical'}} placeholder="e.g. Please bring your portfolio and transcripts. Dress professionally." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <button className="submitBtn" style={S.submitBtn} type="submit" disabled={loading}>
              {loading ? '⏳ Scheduling...' : '📅 Schedule Interview'}
            </button>
          </form>
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
  main: { maxWidth: '700px', margin: '0 auto', padding: '36px 24px' },
  pageHead: { marginBottom: '24px' },
  heading: { fontSize: '26px', fontWeight: '800', color: '#0F172A', marginBottom: '6px', letterSpacing: '-0.5px' },
  headSub: { fontSize: '14.5px', color: '#94A3B8' },
  candidateCard: { display: 'flex', alignItems: 'center', gap: '16px', background: '#fff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #F0F2F5', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', marginBottom: '20px' },
  candidateAvatar: { width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #3B82F6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '800', flexShrink: 0 },
  candidateName: { fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' },
  candidateMeta: { fontSize: '13px', color: '#94A3B8', marginBottom: '4px' },
  candidateJob: { fontSize: '13px', color: '#64748B' },
  card: { background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #F0F2F5', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '7px', color: '#374151' },
  required: { color: '#DC2626' },
  input: { width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit', color: '#0F172A' },
  submitBtn: { width: '100%', padding: '14px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', marginTop: '8px', boxShadow: '0 4px 14px rgba(37,99,235,0.25)' },
  error: { background: '#FEF2F2', color: '#DC2626', padding: '13px 16px', borderRadius: '10px', fontSize: '13.5px', fontWeight: '600', marginBottom: '16px' },
  successBox: { background: '#ECFDF5', color: '#059669', padding: '13px 16px', borderRadius: '10px', fontSize: '13.5px', fontWeight: '600', marginBottom: '16px' }
}