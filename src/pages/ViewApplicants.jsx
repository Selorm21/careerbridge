import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate, useParams } from 'react-router-dom'
import { sendEmail, statusUpdatedEmail } from '../emailService'

export default function ViewApplicants() {
  const [applicants, setApplicants] = useState([])
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const navigate = useNavigate()
  const { jobId } = useParams()

  useEffect(() => { fetchApplicants() }, [])

  async function fetchApplicants() {
    const { data: jobData } = await supabase.from('jobs').select('*').eq('id', jobId).single()
    setJob(jobData)
    const { data } = await supabase.from('applications').select('*, profiles(*)').eq('job_id', jobId).order('created_at', { ascending: false })
    setApplicants(data || [])
    setLoading(false)
  }

  async function updateStatus(appId, newStatus) {
    setUpdating(appId)
    await supabase.from('applications').update({ status: newStatus }).eq('id', appId)

    const app = applicants.find(a => a.id === appId)
    if (app?.profiles?.email && ['interview', 'offer', 'rejected'].includes(newStatus)) {
      const { subject, html } = statusUpdatedEmail(
        app.profiles.full_name,
        job?.title,
        job?.company,
        newStatus
      )
      await sendEmail(app.profiles.email, subject, html)
    }

    await fetchApplicants()
    setUpdating(null)
  }
  function getStatusStyle(status) {
    if (status === 'applied') return { bg: '#F4F4F5', color: '#3F3F46' }
    if (status === 'interview') return { bg: '#FEF9EE', color: '#B45309' }
    if (status === 'offer') return { bg: '#F0FDF4', color: '#15803D' }
    if (status === 'rejected') return { bg: '#FEF2F2', color: '#B91C1C' }
    return { bg: '#F4F4F5', color: '#3F3F46' }
  }

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .pageIn{animation:fadeUp .45s cubic-bezier(.16,1,.3,1) forwards}
        .appCard{transition:border-color .15s ease}
        .appCard:hover{border-color:#D4D4D8!important}
        .backBtn{transition:all .15s ease}
        .backBtn:hover{background:#F4F4F5!important;border-color:#D4D4D8!important}
        .statusBtn{transition:opacity .15s ease;cursor:pointer}
        .statusBtn:hover{opacity:.75}
        .cvBtn{transition:all .15s ease}
        .cvBtn:hover{background:#F4F4F5!important;border-color:#D4D4D8!important}
      `}</style>

      <nav style={S.nav}>
        <div style={S.logoRow}>
          <div style={S.logoMark}>CB</div>
          <div style={S.logo}>CareerBridge</div>
        </div>
        <button className="backBtn" style={S.backBtn} onClick={() => navigate('/employer')}>← Back to dashboard</button>
      </nav>

      <div className="pageIn" style={S.main}>
        <div style={S.jobBanner}>
          <div style={S.jobBannerLeft}>
            <div style={S.jobIconWrap}>◍</div>
            <div>
              <h1 style={S.heading}>{job?.title}</h1>
              <div style={S.jobMeta}>{job?.company} · {job?.location} · {job?.type}</div>
            </div>
          </div>
          <div style={S.jobStats}>
            <div style={S.jobStat}>
              <div style={S.jobStatVal}>{applicants.length}</div>
              <div style={S.jobStatLabel}>Total applicants</div>
            </div>
            <div style={S.jobStatDivider}></div>
            <div style={S.jobStat}>
              <div style={{...S.jobStatVal, color:'#B45309'}}>{applicants.filter(a => a.status === 'interview').length}</div>
              <div style={S.jobStatLabel}>Interviews</div>
            </div>
            <div style={S.jobStatDivider}></div>
            <div style={S.jobStat}>
              <div style={{...S.jobStatVal, color:'#15803D'}}>{applicants.filter(a => a.status === 'offer').length}</div>
              <div style={S.jobStatLabel}>Offers</div>
            </div>
          </div>
        </div>

        {loading && <div style={S.empty}><div style={S.emptyIcon}>⏳</div><div>Loading applicants…</div></div>}

        {!loading && applicants.length === 0 && (
          <div style={S.empty}>
            <div style={S.emptyIcon}>▤</div>
            <div style={S.emptyText}>No applicants yet</div>
            <div style={S.emptySub}>Share your job listing to attract candidates</div>
          </div>
        )}

        <div style={S.appsList}>
          {applicants.map((app, idx) => {
            const st = getStatusStyle(app.status)
            return (
              <div key={app.id} className="appCard" style={S.appCard}>
                <div style={S.appCardTop}>
                  <div style={S.appLeft}>
                    <div style={S.avatarWrap}>
                      <div style={S.avatar}>{app.profiles?.full_name?.charAt(0) || '?'}</div>
                      <div>
                        <div style={S.appName}>{app.profiles?.full_name}</div>
                        <div style={S.appEmail}>{app.profiles?.email}</div>
                      </div>
                    </div>
                    {app.profiles?.university && (
                      <div style={S.appDetail}>{app.profiles?.course} · {app.profiles?.university} · Class of {app.profiles?.graduation_year}</div>
                    )}
                    {app.profiles?.skills && (
                      <div style={S.skillsRow}>
                        {app.profiles.skills.split(',').map((s, i) => (
                          <span key={i} style={S.skillChip}>{s.trim()}</span>
                        ))}
                      </div>
                    )}
                    {app.profiles?.bio && <div style={S.appBio}>"{app.profiles?.bio}"</div>}
                    <div style={S.appActions}>
                      {app.profiles?.cv_url && (
                        <a href={app.profiles.cv_url} target="_blank" rel="noreferrer" className="cvBtn" style={S.cvBtn}>▤ View CV</a>
                      )}
                    </div>
                  </div>
                  <div style={S.appRight}>
                    <div style={{...S.statusBadge, background: st.bg, color: st.color}}>{app.status}</div>
                    <div style={S.appNum}>#{idx + 1}</div>
                  </div>
                </div>

                <div style={S.divider}></div>
                <div style={S.statusRow}>
                  <div style={S.statusRowLabel}>Update status</div>
                  <div style={S.statusBtns}>
                    {[
                      { s: 'interview', label: 'Interview', bg: '#FEF9EE', color: '#B45309', border: '#FDE9C8' },
                      { s: 'offer', label: 'Offer', bg: '#F0FDF4', color: '#15803D', border: '#DCFCE7' },
                      { s: 'rejected', label: 'Reject', bg: '#FEF2F2', color: '#B91C1C', border: '#FCDCDC' },
                      { s: 'applied', label: '↩ Reset', bg: '#F4F4F5', color: '#3F3F46', border: '#E4E4E7' },
                    ].map(btn => (
                      <button
                        key={btn.s}
                        className="statusBtn"
                        style={{...S.statusBtn, background: btn.bg, color: btn.color, border: `1px solid ${btn.border}`, opacity: updating === app.id ? 0.5 : 1}}
                        onClick={() => updateStatus(app.id, btn.s)}
                        disabled={updating === app.id}
                      >
                        {updating === app.id ? '…' : btn.label}
                      </button>
                    ))}
                    <button
                      className="statusBtn"
                      style={{...S.statusBtn, background: '#18181B', color: '#fff', border: '1px solid #18181B'}}
                      onClick={() => navigate(`/schedule/${app.id}`)}
                    >
                      Schedule Interview
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: '#FAFAFA', fontFamily: "'Inter', -apple-system, sans-serif" },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 36px', background: '#fff', borderBottom: '1px solid #E4E4E7', position: 'sticky', top: 0, zIndex: 10 },
  logoRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoMark: { width: '30px', height: '30px', borderRadius: '8px', background: '#18181B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '11px' },
  logo: { fontSize: '17px', fontWeight: '700', color: '#18181B', letterSpacing: '-0.3px' },
  backBtn: { padding: '9px 18px', background: '#fff', border: '1px solid #E4E4E7', borderRadius: '10px', cursor: 'pointer', fontSize: '13.5px', fontWeight: '600', color: '#3F3F46' },

  main: { maxWidth: '900px', margin: '0 auto', padding: '36px 24px 80px' },

  jobBanner: { background: '#fff', borderRadius: '16px', padding: '22px 26px', border: '1px solid #E4E4E7', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
  jobBannerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  jobIconWrap: { width: '48px', height: '48px', borderRadius: '13px', background: '#F4F4F5', border: '1px solid #E4E4E7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#3F3F46' },
  heading: { fontSize: '19px', fontWeight: '700', color: '#18181B', marginBottom: '4px' },
  jobMeta: { fontSize: '13.5px', color: '#A1A1AA', fontWeight: '500' },
  jobStats: { display: 'flex', alignItems: 'center', gap: '22px' },
  jobStat: { textAlign: 'center' },
  jobStatDivider: { width: '1px', height: '32px', background: '#E4E4E7' },
  jobStatVal: { fontSize: '22px', fontWeight: '700', color: '#18181B' },
  jobStatLabel: { fontSize: '11.5px', color: '#A1A1AA', fontWeight: '500' },

  appsList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  appCard: { background: '#fff', borderRadius: '16px', padding: '22px', border: '1px solid #E4E4E7' },
  appCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  appLeft: { flex: 1 },
  appRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', marginLeft: '16px' },
  avatarWrap: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' },
  avatar: { width: '42px', height: '42px', borderRadius: '50%', background: '#F4F4F5', border: '1px solid #E4E4E7', color: '#18181B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', flexShrink: 0 },
  appName: { fontSize: '15px', fontWeight: '700', color: '#18181B', marginBottom: '2px' },
  appEmail: { fontSize: '13px', color: '#A1A1AA' },
  appDetail: { fontSize: '13px', color: '#52525B', marginBottom: '10px', fontWeight: '500' },
  skillsRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' },
  skillChip: { background: '#F4F4F5', color: '#3F3F46', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', border: '1px solid #E4E4E7' },
  appBio: { fontSize: '13px', color: '#71717A', fontStyle: 'italic', marginBottom: '12px', lineHeight: '1.5' },
  appActions: { display: 'flex', gap: '10px' },
  cvBtn: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 16px', background: '#fff', color: '#3F3F46', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', border: '1px solid #E4E4E7' },
  statusBadge: { padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' },
  appNum: { fontSize: '12px', color: '#D4D4D8', fontWeight: '700' },
  divider: { height: '1px', background: '#F0F0F1', marginBottom: '14px' },
  statusRow: { display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' },
  statusRowLabel: { fontSize: '12.5px', color: '#A1A1AA', fontWeight: '600', whiteSpace: 'nowrap' },
  statusBtns: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  statusBtn: { padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '60px 0', color: '#A1A1AA' },
  emptyIcon: { fontSize: '30px', marginBottom: '12px', color: '#D4D4D8' },
  emptyText: { fontSize: '15px', fontWeight: '700', color: '#52525B', marginBottom: '6px' },
  emptySub: { fontSize: '13.5px' }
}
