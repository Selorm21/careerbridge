import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate, useParams } from 'react-router-dom'
import { sendEmail, interviewScheduledEmail } from '../emailService'

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

    if (application?.profiles?.email) {
      const { subject, message } = interviewScheduledEmail(
        application.profiles.full_name,
        application.jobs?.title,
        application.jobs?.company,
        date,
        time,
        location,
        notes
      )
      await sendEmail(application.profiles.email, subject, message)
    }

    setSuccess('Interview scheduled! Email sent to candidate.')
    setTimeout(() => navigate(-1), 2000)
    setLoading(false)
  }

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
        .pageIn{animation:fadeUp .45s cubic-bezier(.16,1,.3,1) forwards}
        .cardIn{animation:popIn .35s cubic-bezier(.16,1,.3,1) forwards}
        .inputF{transition:border-color .15s ease, box-shadow .15s ease}
        .inputF:focus{outline:none;border-color:#18181B!important;box-shadow:0 0 0 3px rgba(24,24,27,0.06)!important}
        .submitBtn{transition:opacity .15s ease, transform .15s ease}
        .submitBtn:hover:not(:disabled){opacity:.88}
        .submitBtn:active:not(:disabled){transform:scale(.99)}
        .backBtn{transition:all .15s ease}
        .backBtn:hover{background:#F4F4F5!important;border-color:#D4D4D8!important}
        .fieldGroup:focus-within .label{color:#18181B}
      `}</style>

      <nav style={S.nav}>
        <div style={S.logoRow}>
          <div style={S.logoMark}>CB</div>
          <div style={S.logo}>CareerBridge</div>
        </div>
        <button className="backBtn" style={S.backBtn} onClick={() => navigate(-1)}>← Back</button>
      </nav>

      <div className="pageIn" style={S.main}>
        <div style={S.pageHead}>
          <div style={S.pageHeadIcon}>◷</div>
          <div>
            <h1 style={S.heading}>Schedule Interview</h1>
            <p style={S.headSub}>Set up an interview with the candidate.</p>
          </div>
        </div>

        {application && (
          <div className="cardIn" style={S.candidateCard}>
            <div style={S.candidateAvatar}>{application.profiles?.full_name?.charAt(0)}</div>
            <div style={S.candidateInfo}>
              <div style={S.candidateName}>{application.profiles?.full_name}</div>
              <div style={S.candidateMeta}>{application.profiles?.email} · {application.profiles?.course} · {application.profiles?.university}</div>
              <div style={S.candidateJobRow}>
                <span style={S.candidateJobLabel}>Applying for</span>
                <span style={S.candidateJobPill}>{application.jobs?.title}</span>
              </div>
            </div>
          </div>
        )}

        {error && <div className="cardIn" style={S.error}>⚠ {error}</div>}
        {success && <div className="cardIn" style={S.successBox}>✓ {success}</div>}

        <div className="cardIn" style={S.card}>
          <div style={S.cardHead}>
            <div style={S.cardTitle}>Interview details</div>
            <div style={S.cardSub}>The candidate will be notified once this is saved.</div>
          </div>

          <form onSubmit={handleSchedule}>
            <div style={S.grid2}>
              <div className="fieldGroup" style={S.field}>
                <label className="label" style={S.label}>Interview date <span style={S.required}>*</span></label>
                <input className="inputF" style={S.input} type="date" value={date} onChange={e => setDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="fieldGroup" style={S.field}>
                <label className="label" style={S.label}>Interview time <span style={S.required}>*</span></label>
                <input className="inputF" style={S.input} type="time" value={time} onChange={e => setTime(e.target.value)} required />
              </div>
            </div>

            <div className="fieldGroup" style={S.field}>
              <label className="label" style={S.label}>Location / Meeting link <span style={S.required}>*</span></label>
              <input className="inputF" style={S.input} type="text" placeholder="e.g. Office - 3rd Floor, Accra or https://meet.google.com/xyz" value={location} onChange={e => setLocation(e.target.value)} required />
            </div>

            <div className="fieldGroup" style={{...S.field, marginBottom: '4px'}}>
              <label className="label" style={S.label}>Notes for candidate</label>
              <textarea className="inputF" style={{...S.input, height: '96px', resize: 'vertical'}} placeholder="e.g. Please bring your portfolio and transcripts. Dress professionally." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            <div style={S.divider}></div>

            <button className="submitBtn" style={{...S.submitBtn, ...(loading ? S.submitBtnDisabled : {})}} type="submit" disabled={loading}>
              {loading ? 'Scheduling…' : '◷  Schedule Interview'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: '#FAFAFA', fontFamily: "'Inter', -apple-system, sans-serif" },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 36px', background: '#fff', borderBottom: '1px solid #E4E4E7', position: 'sticky', top: 0, zIndex: 10 },
  logoRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoMark: { width: '30px', height: '30px', borderRadius: '8px', background: '#18181B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px' },
  logo: { fontSize: '17px', fontWeight: '700', color: '#18181B', letterSpacing: '-0.3px' },
  backBtn: { padding: '9px 18px', background: '#fff', border: '1px solid #E4E4E7', borderRadius: '10px', cursor: 'pointer', fontSize: '13.5px', fontWeight: '600', color: '#3F3F46' },

  main: { maxWidth: '700px', margin: '0 auto', padding: '40px 24px 80px' },
  pageHead: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' },
  pageHeadIcon: { width: '44px', height: '44px', borderRadius: '12px', background: '#F4F4F5', border: '1px solid #E4E4E7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  heading: { fontSize: '24px', fontWeight: '700', color: '#18181B', marginBottom: '4px', letterSpacing: '-0.3px' },
  headSub: { fontSize: '14px', color: '#A1A1AA' },

  candidateCard: { display: 'flex', alignItems: 'center', gap: '16px', background: '#fff', borderRadius: '16px', padding: '20px 22px', border: '1px solid #E4E4E7', marginBottom: '16px' },
  candidateAvatar: { width: '50px', height: '50px', borderRadius: '50%', background: '#F4F4F5', border: '1px solid #E4E4E7', color: '#18181B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700' },
  candidateInfo: { flex: 1, minWidth: 0 },
  candidateName: { fontSize: '15.5px', fontWeight: '700', color: '#18181B', marginBottom: '4px' },
  candidateMeta: { fontSize: '13px', color: '#A1A1AA', marginBottom: '8px' },
  candidateJobRow: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  candidateJobLabel: { fontSize: '12.5px', color: '#A1A1AA' },
  candidateJobPill: { fontSize: '12.5px', fontWeight: '600', color: '#3F3F46', background: '#F4F4F5', border: '1px solid #E4E4E7', borderRadius: '20px', padding: '3px 12px' },

  card: { background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #E4E4E7' },
  cardHead: { marginBottom: '20px' },
  cardTitle: { fontSize: '15px', fontWeight: '700', color: '#18181B', marginBottom: '3px' },
  cardSub: { fontSize: '13px', color: '#A1A1AA' },

  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '7px', color: '#3F3F46', transition: 'color .15s ease' },
  required: { color: '#DC2626' },
  input: { width: '100%', padding: '11px 14px', border: '1px solid #E4E4E7', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit', color: '#18181B', background: '#fff' },

  divider: { height: '1px', background: '#F0F0F1', margin: '4px 0 18px' },

  submitBtn: { width: '100%', padding: '13px', background: '#18181B', color: '#fff', border: 'none', borderRadius: '11px', cursor: 'pointer', fontSize: '14.5px', fontWeight: '600' },
  submitBtnDisabled: { opacity: 0.6, cursor: 'not-allowed' },

  error: { background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FCDCDC', padding: '13px 16px', borderRadius: '12px', fontSize: '13.5px', fontWeight: '600', marginBottom: '16px' },
  successBox: { background: '#F0FDF4', color: '#15803D', border: '1px solid #DCFCE7', padding: '13px 16px', borderRadius: '12px', fontSize: '13.5px', fontWeight: '600', marginBottom: '16px' }
}
