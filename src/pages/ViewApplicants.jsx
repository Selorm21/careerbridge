import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate, useParams } from 'react-router-dom'
import { calculateMatchScore, getScoreColor } from '../matchScore'
import { sendEmail, statusUpdatedEmail } from '../emailService'

export default function ViewApplicants() {
  const [applicants, setApplicants] = useState([])
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [sortBy, setSortBy] = useState('score')
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
      const { subject, message } = statusUpdatedEmail(app.profiles.full_name, job?.title, job?.company, newStatus)
      await sendEmail(app.profiles.email, subject, message)
    }
    await fetchApplicants()
    setUpdating(null)
  }

  function getStatusStyle(status) {
    if (status === 'applied') return { background: '#EFF6FF', color: '#2563EB' }
    if (status === 'interview') return { background: '#FFFBEB', color: '#D97706' }
    if (status === 'offer') return { background: '#ECFDF5', color: '#059669' }
    if (status === 'rejected') return { background: '#FEF2F2', color: '#DC2626' }
    return { background: '#F1F5F9', color: '#64748B' }
  }

  const sortedApplicants = [...applicants].sort((a, b) => {
    if (sortBy === 'score') {
      const scoreA = calculateMatchScore(a.profiles?.skills || '', job?.skills || '').score
      const scoreB = calculateMatchScore(b.profiles?.skills || '', job?.skills || '').score
      return scoreB - scoreA
    }
    return 0
  })

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .pageIn{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) forwards}
        .appCard{transition:all .25s ease}
        .appCard:hover{box-shadow:0 12px 28px rgba(15,23,42,0.08)!important}
        .backBtn{transition:all .2s ease}
        .backBtn:hover{background:#EFF6FF!important;color:#2563EB!important}
        .statusBtn{transition:all .15s ease;cursor:pointer}
        .statusBtn:hover{opacity:.8;transform:scale(1.03)}
        .sortBtn{transition:all .2s ease;cursor:pointer}
        .sortBtn:hover{background:#EFF6FF!important;color:#2563EB!important}
      `}</style>

      <nav style={S.nav}>
        <div style={S.navLeft}>
          <div style={S.logo}>CareerBridge</div>
        </div>
        <button className="backBtn" style={S.backBtn} onClick={() => navigate('/employer')}>← Back to dashboard</button>
      </nav>

      <div className="pageIn" style={S.main}>
        <div style={S.jobBanner}>
          <div style={S.jobBannerLeft}>
            <div style={S.jobIconWrap}>🏢</div>
            <div>
              <h1 style={S.heading}>{job?.title}</h1>
              <div style={S.jobMeta}>{job?.company} · {job?.location} · {job?.type}</div>
              {job?.skills && (
                <div style={S.jobSkillsRow}>
                  <span style={S.jobSkillsLabel}>Required skills:</span>
                  {job.skills.split(',').map((s, i) => (
                    <span key={i} style={S.jobSkillChip}>{s.trim()}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={S.jobStats}>
            <div style={S.jobStat}>
              <div style={S.jobStatVal}>{applicants.length}</div>
              <div style={S.jobStatLabel}>Total applicants</div>
            </div>
            <div style={S.jobStat}>
              <div style={{...S.jobStatVal, color:'#D97706'}}>{applicants.filter(a=>a.status==='interview').length}</div>
              <div style={S.jobStatLabel}>Interviews</div>
            </div>
            <div style={S.jobStat}>
              <div style={{...S.jobStatVal, color:'#059669'}}>{applicants.filter(a=>a.status==='offer').length}</div>
              <div style={S.jobStatLabel}>Offers</div>
            </div>
          </div>
        </div>

        <div style={S.sortRow}>
          <div style={S.sortLabel}>Sort by:</div>
          <button className="sortBtn" style={{...S.sortBtn, ...(sortBy==='score' ? S.sortBtnActive : {})}} onClick={() => setSortBy('score')}>🤖 AI Match Score</button>
          <button className="sortBtn" style={{...S.sortBtn, ...(sortBy==='date' ? S.sortBtnActive : {})}} onClick={() => setSortBy('date')}>📅 Date Applied</button>
          {sortBy === 'score' && <span style={S.sortNote}>Applicants ranked by how well their skills match your job requirements</span>}
        </div>

        {loading && <div style={S.empty}><div style={S.emptyIcon}>⏳</div><div>Loading applicants...</div></div>}
        {!loading && applicants.length === 0 && (
          <div style={S.empty}>
            <div style={S.emptyIcon}>📭</div>
            <div style={S.emptyText}>No applicants yet</div>
            <div style={S.emptySub}>Share your job listing to attract candidates</div>
          </div>
        )}

        <div style={S.appsList}>
          {sortedApplicants.map((app, idx) => {
            const { score, matched, missing } = calculateMatchScore(app.profiles?.skills || '', job?.skills || '')
            const { color, bg, label } = getScoreColor(score)
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
                      <div style={S.appDetail}>🎓 {app.profiles?.course} · {app.profiles?.university} · Class of {app.profiles?.graduation_year}</div>
                    )}
                    {app.profiles?.skills && (
                      <div style={S.skillsRow}>
                        {app.profiles.skills.split(',').map((s, i) => (
                          <span key={i} style={S.skillChip}>{s.trim()}</span>
                        ))}
                      </div>
                    )}
                    {app.profiles?.bio && <div style={S.appBio}>"{app.profiles?.bio}"</div>}
                    {app.profiles?.cv_url && (
                      <a href={app.profiles.cv_url} target="_blank" rel="noreferrer" style={S.cvBtn}>📄 View CV</a>
                    )}
                  </div>

                  <div style={S.appRight}>
                    <div style={S.rankBadge}>#{idx + 1}</div>
                    <div style={{...S.statusBadge, ...st}}>{app.status}</div>
                    <div style={{...S.scoreBadge, background: bg, color}}>
                      <div style={S.scoreNum}>{score}%</div>
                      <div style={S.scoreLabel}>{label}</div>
                    </div>
                  </div>
                </div>

                {job?.skills && (
                  <div style={S.matchSection}>
                    <div style={S.matchTitle}>AI Skill Analysis</div>
                    <div style={S.matchRow}>
                      {matched.length > 0 && (
                        <div style={S.matchGroup}>
                          <span style={S.matchGroupLabel}>✓ Matched:</span>
                          {matched.map((s, i) => <span key={i} style={S.matchedChip}>{s}</span>)}
                        </div>
                      )}
                      {missing.length > 0 && (
                        <div style={S.matchGroup}>
                          <span style={S.missingGroupLabel}>✗ Missing:</span>
                          {missing.map((s, i) => <span key={i} style={S.missingChip}>{s}</span>)}
                        </div>
                      )}
                      {matched.length === 0 && missing.length === 0 && (
                        <span style={{fontSize:'12px',color:'#94A3B8'}}>No skills data available</span>
                      )}
                    </div>
                  </div>
                )}

                <div style={S.divider}></div>

                <div style={S.statusRow}>
                  <div style={S.statusRowLabel}>Update status:</div>
                  <div style={S.statusBtns}>
                    {[
                      { s: 'interview', label: '🎯 Interview', bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
                      { s: 'offer', label: '🏆 Offer', bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' },
                      { s: 'rejected', label: '❌ Reject', bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
                      { s: 'applied', label: '↩ Reset', bg: '#EFF6FF', color: '#2563EB', border: '#DBEAFE' },
                    ].map(btn => (
                      <button key={btn.s} className="statusBtn"
                        style={{...S.statusBtn, background: btn.bg, color: btn.color, border: `1px solid ${btn.border}`, opacity: updating===app.id ? 0.6 : 1}}
                        onClick={() => updateStatus(app.id, btn.s)}
                        disabled={updating === app.id}>
                        {updating === app.id ? '...' : btn.label}
                      </button>
                    ))}
                    <button className="statusBtn"
                      style={{...S.statusBtn, background:'#F5F3FF', color:'#7C3AED', border:'1px solid #DDD6FE'}}
                      onClick={() => navigate(`/schedule/${app.id}`)}>
                      📅 Schedule Interview
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
  page: { minHeight: '100vh', background: '#F1F5F9', fontFamily: "'Inter', -apple-system, sans-serif" },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 36px', background: '#fff', borderBottom: '1px solid #F0F2F5', position: 'sticky', top: 0, zIndex: 10 },
  navLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  logo: { fontSize: '19px', fontWeight: '800', color: '#2563EB', letterSpacing: '-0.5px' },
  backBtn: { padding: '9px 18px', background: '#F8FAFC', border: '1.5px solid #E5E7EB', borderRadius: '10px', cursor: 'pointer', fontSize: '13.5px', fontWeight: '700', color: '#374151' },
  main: { maxWidth: '900px', margin: '0 auto', padding: '36px 24px' },

  jobBanner: { background: '#fff', borderRadius: '16px', padding: '24px 28px', border: '1px solid #F0F2F5', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' },
  jobBannerLeft: { display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1 },
  jobIconWrap: { width: '52px', height: '52px', borderRadius: '14px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 },
  heading: { fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' },
  jobMeta: { fontSize: '13.5px', color: '#94A3B8', fontWeight: '500', marginBottom: '8px' },
  jobSkillsRow: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  jobSkillsLabel: { fontSize: '12px', fontWeight: '700', color: '#64748B' },
  jobSkillChip: { background: '#EFF6FF', color: '#2563EB', padding: '3px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: '600' },
  jobStats: { display: 'flex', gap: '28px' },
  jobStat: { textAlign: 'center' },
  jobStatVal: { fontSize: '24px', fontWeight: '800', color: '#2563EB' },
  jobStatLabel: { fontSize: '12px', color: '#94A3B8', fontWeight: '600' },

  sortRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  sortLabel: { fontSize: '13px', fontWeight: '700', color: '#64748B' },
  sortBtn: { padding: '7px 16px', background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#374151' },
  sortBtnActive: { background: '#EFF6FF', color: '#2563EB', borderColor: '#DBEAFE' },
  sortNote: { fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' },

  appsList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  appCard: { background: '#fff', borderRadius: '16px', padding: '22px', border: '1.5px solid #F0F2F5', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' },
  appCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' },
  appLeft: { flex: 1 },
  appRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', marginLeft: '16px' },
  avatarWrap: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' },
  avatar: { width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #3B82F6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', flexShrink: 0 },
  appName: { fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '2px' },
  appEmail: { fontSize: '13px', color: '#94A3B8' },
  appDetail: { fontSize: '13px', color: '#64748B', marginBottom: '10px', fontWeight: '500' },
  skillsRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' },
  skillChip: { background: '#F1F5F9', color: '#374151', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  appBio: { fontSize: '13px', color: '#64748B', fontStyle: 'italic', marginBottom: '10px', lineHeight: '1.5' },
  cvBtn: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 16px', background: '#EFF6FF', color: '#2563EB', borderRadius: '8px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', border: '1px solid #DBEAFE' },

  rankBadge: { fontSize: '12px', color: '#CBD5E1', fontWeight: '700' },
  statusBadge: { padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', whiteSpace: 'nowrap' },
  scoreBadge: { padding: '10px 14px', borderRadius: '12px', textAlign: 'center', minWidth: '80px' },
  scoreNum: { fontSize: '22px', fontWeight: '800', marginBottom: '2px' },
  scoreLabel: { fontSize: '11px', fontWeight: '600' },

  matchSection: { background: '#F8FAFC', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px' },
  matchTitle: { fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  matchRow: { display: 'flex', flexWrap: 'wrap', gap: '12px' },
  matchGroup: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  matchGroupLabel: { fontSize: '12px', fontWeight: '700', color: '#059669' },
  missingGroupLabel: { fontSize: '12px', fontWeight: '700', color: '#DC2626' },
  matchedChip: { background: '#ECFDF5', color: '#059669', padding: '3px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: '600', border: '1px solid #A7F3D0' },
  missingChip: { background: '#FEF2F2', color: '#DC2626', padding: '3px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: '600', border: '1px solid #FECACA' },

  divider: { height: '1px', background: '#F1F5F9', marginBottom: '14px' },
  statusRow: { display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' },
  statusRowLabel: { fontSize: '12.5px', color: '#94A3B8', fontWeight: '700', whiteSpace: 'nowrap' },
  statusBtns: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  statusBtn: { padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', border: 'none', cursor: 'pointer' },

  empty: { textAlign: 'center', padding: '60px 0', color: '#94A3B8' },
  emptyIcon: { fontSize: '40px', marginBottom: '12px' },
  emptyText: { fontSize: '16px', fontWeight: '700', color: '#64748B', marginBottom: '6px' },
  emptySub: { fontSize: '13.5px' }
}