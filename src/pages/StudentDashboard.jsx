import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import { getScoreColor } from '../matchScore'

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [recommendedJobs, setRecommendedJobs] = useState([])
  const [interviews, setInterviews] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const navigate = useNavigate()

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)

      const { data: appsData } = await supabase.from('applications').select('*, jobs(*)').eq('student_id', user.id).order('created_at', { ascending: false })
      setApplications(appsData || [])

      const { data: interviewsData } = await supabase.from('interviews').select('*').eq('student_id', user.id)
      setInterviews(interviewsData || [])

      const { data: jobsData } = await supabase.from('jobs').select('*')
      const studentSkills = profileData?.skills || ''
      const appliedJobIds = appsData?.map(a => a.job_id) || []

      if (studentSkills && jobsData) {
        const scored = jobsData
          .filter(job => !appliedJobIds.includes(job.id))
          .map(job => {
            const studentSkillList = studentSkills.toLowerCase().split(',').map(s => s.trim())
            const matched = job.skills?.toLowerCase().split(',').map(s => s.trim()).filter(s =>
              studentSkillList.some(sk => sk.includes(s) || s.includes(sk))
            ) || []
            const total = job.skills?.split(',').length || 1
            const score = Math.round((matched.length / total) * 100)
            return { ...job, score, matched }
          })
          .filter(job => job.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 4)
        setRecommendedJobs(scored)
      }
    }
    getData()
  }, [])

  async function handleLogout() { await supabase.auth.signOut(); navigate('/') }

  function getStatusStyle(status) {
    if (status === 'applied') return { bg: '#F4F4F5', color: '#3F3F46', dot: '#71717A' }
    if (status === 'interview') return { bg: '#FEF9EE', color: '#B45309', dot: '#D97706' }
    if (status === 'offer') return { bg: '#F0FDF4', color: '#15803D', dot: '#16A34A' }
    if (status === 'rejected') return { bg: '#FEF2F2', color: '#B91C1C', dot: '#DC2626' }
    return { bg: '#F4F4F5', color: '#3F3F46', dot: '#71717A' }
  }

  function profileStrength() {
    let score = 0
    if (profile?.full_name) score += 20
    if (profile?.university) score += 20
    if (profile?.course) score += 20
    if (profile?.skills) score += 20
    if (profile?.bio) score += 20
    return score
  }

  return (
    <div style={S.page}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .pageIn{animation:fadeUp .4s ease forwards}
        .cardIn{animation:fadeUp .4s ease forwards}
        .metCard{transition:border-color .15s ease}
        .metCard:hover{border-color:#D4D4D8!important}
        .jobCard{transition:all .15s ease}
        .jobCard:hover{border-color:#D4D4D8!important}
        .sideBtn{transition:background .15s ease;cursor:pointer}
        .sideBtn:hover{background:#F4F4F5!important}
        .logoutBtn{transition:all .15s ease}
        .logoutBtn:hover{background:#F4F4F5!important}
        .progressBar{background:#18181B}
        .recCard:hover{border-color:#D4D4D8!important;background:#fff!important}
        .browseBtn:hover{opacity:.85}
        .quickAction:hover{border-color:#D4D4D8!important}
        @media(max-width:768px){
          .sidebar{display:none!important}
          .mobileNav{display:flex!important}
          .layout{grid-template-columns:1fr!important}
          .grid2{grid-template-columns:1fr!important}
          .metricsRow{grid-template-columns:1fr 1fr!important}
          .main{padding:20px 16px 90px!important}
          .topBar{flex-direction:column!important;align-items:flex-start!important;gap:10px!important}
          .browseBtn{width:100%!important}
          .rightCol{display:none!important}
          .recsGrid{grid-template-columns:1fr 1fr!important}
        }
      `}</style>

      <div className="layout" style={S.layout}>
        <aside className="sidebar" style={S.sidebar}>
          <div style={S.sidebarTop}>
            <div style={S.sidebarLogoRow}>
              <div style={S.sidebarMark}>CB</div>
              <div>
                <div style={S.sidebarLogo}>CareerBridge</div>
                <div style={S.sidebarSub}>Student Console</div>
              </div>
            </div>
            <div style={S.avatarWrap}>
              <div style={S.avatar}>{profile?.full_name?.charAt(0) || 'S'}</div>
              <div>
                <div style={S.avatarName}>{profile?.full_name || 'Student'}</div>
                <div style={S.avatarRole}>Student</div>
              </div>
            </div>
          </div>

          <nav style={S.sideNav}>
            <div className="sideBtn" style={{...S.sideNavItem, ...(activeTab==='overview' ? S.sideNavActive : {})}} onClick={() => setActiveTab('overview')}>
              <span style={S.sideNavIcon}>▦</span>
              <span style={{marginLeft:6}}>Overview</span>
            </div>

            <div className="sideBtn" style={{...S.sideNavItem, ...(activeTab==='applications' ? S.sideNavActive : {})}} onClick={() => setActiveTab('applications')}>
              <span style={S.sideNavIcon}>▤</span>
              <span style={{marginLeft:6}}>Applications</span>
              {applications.length > 0 && <span style={S.navBadge}>{applications.length}</span>}
            </div>

            <div className="sideBtn" style={{...S.sideNavItem, ...(activeTab==='recommended' ? S.sideNavActive : {})}} onClick={() => setActiveTab('recommended')}>
              <span style={S.sideNavIcon}>◎</span>
              <span style={{marginLeft:6}}>Recommended</span>
              {recommendedJobs.length > 0 && <span style={S.navBadge}>{recommendedJobs.length}</span>}
            </div>

            <div className="sideBtn" style={{...S.sideNavItem, ...(activeTab==='interviews' ? S.sideNavActive : {})}} onClick={() => setActiveTab('interviews')}>
              <span style={S.sideNavIcon}>◷</span>
              <span style={{marginLeft:6}}>Interviews</span>
              {interviews.length > 0 && <span style={{...S.navBadge, background:'#D97706'}}>{interviews.length}</span>}
            </div>

            <div className="sideBtn" style={S.sideNavItem} onClick={() => navigate('/browse-jobs')}>
              <span style={S.sideNavIcon}>⌕</span>
              <span style={{marginLeft:6}}>Browse Jobs</span>
            </div>

            <div className="sideBtn" style={S.sideNavItem} onClick={() => navigate('/student-profile')}>
              <span style={S.sideNavIcon}>◍</span>
              <span style={{marginLeft:6}}>My Profile</span>
            </div>

            <div className="sideBtn" style={S.sideNavItem} onClick={() => navigate('/resume-builder')}>
              <span style={S.sideNavIcon}>▥</span>
              <span style={{marginLeft:6}}>Resume Builder</span>
            </div>

            <div className="sideBtn" style={S.sideNavItem} onClick={() => navigate('/analytics')}>
              <span style={S.sideNavIcon}>▦</span>
              <span style={{marginLeft:6}}>Analytics</span>
            </div>
          </nav>

          <div style={S.profileStrengthBox}>
            <div style={S.strengthLabel}>Profile strength</div>
            <div style={S.strengthTrack}>
              <div className="progressBar" style={{...S.strengthFill, width: `${profileStrength()}%`}}></div>
            </div>
            <div style={S.strengthPct}>{profileStrength()}% complete</div>
            {profileStrength() < 100 && <div style={S.strengthTip} onClick={() => navigate('/student-profile')}>Complete profile →</div>}
          </div>

          <button className="logoutBtn" style={S.logoutBtn} onClick={handleLogout}>← Log out</button>
        </aside>

        <main className="main" style={S.main}>
          <div className="pageIn topBar" style={S.topBar}>
            <div>
              <h1 style={S.heading}>Good day, {profile?.full_name?.split(' ')[0] || 'Student'}</h1>
              <p style={S.headSub}>Here's what's happening with your job search</p>
            </div>
            <button className="browseBtn" style={S.browseBtn} onClick={() => navigate('/browse-jobs')}>+ Browse jobs</button>
          </div>

          <div className="metricsRow" style={S.metricsRow}>
            {[
              { label: 'Applications', val: applications.length, icon: '↗' },
              { label: 'Interviews', val: applications.filter(a=>a.status==='interview').length, icon: '◷' },
              { label: 'Offers', val: applications.filter(a=>a.status==='offer').length, icon: '✓' },
              { label: 'Rejected', val: applications.filter(a=>a.status==='rejected').length, icon: '✕' },
            ].map((m, i) => (
              <div key={i} className="metCard cardIn" style={S.metCard}>
                <div style={S.metIcon}>{m.icon}</div>
                <div style={S.metVal}>{m.val}</div>
                <div style={S.metLabel}>{m.label}</div>
              </div>
            ))}
          </div>

          {activeTab === 'overview' && (
            <>
              {recommendedJobs.length > 0 && (
                <div className="cardIn" style={{...S.card, marginBottom: '16px'}}>
                  <div style={S.cardHead}>
                    <div>
                      <div style={S.cardTitle}>Recommended for you</div>
                      <div style={S.cardSub}>Roles matched to your profile skills.</div>
                    </div>
                    <span style={S.cardLink} onClick={() => setActiveTab('recommended')}>View all →</span>
                  </div>
                  <div className="recsGrid" style={S.recsGrid}>
                    {recommendedJobs.map(job => {
                      const { color, bg } = getScoreColor(job.score)
                      return (
                        <div key={job.id} className="recCard jobCard" style={S.recCard} onClick={() => navigate('/browse-jobs')}>
                          <div style={S.recTop}>
                            <div style={S.recIconWrap}>◍</div>
                            <div style={{...S.recScore, background: bg, color}}>{job.score}%</div>
                          </div>
                          <div style={S.recTitle}>{job.title}</div>
                          <div style={S.recCompany}>{job.company} · {job.location}</div>
                          <div style={S.recSkills}>
                            {job.matched.slice(0,3).map((s,i) => (
                              <span key={i} style={S.recSkillChip}>✓ {s}</span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="grid2" style={S.grid2}>
                <div className="cardIn" style={S.card}>
                  <div style={S.cardHead}>
                    <div>
                      <div style={S.cardTitle}>Recent Applications</div>
                      <div style={S.cardSub}>Your latest activity and status.</div>
                    </div>
                    <span style={S.cardLink} onClick={() => setActiveTab('applications')}>View all →</span>
                  </div>
                  {applications.length === 0 && (
                    <div style={S.empty}>
                      <div style={S.emptyIcon}>▤</div>
                      <div style={S.emptyText}>No applications yet</div>
                      <div style={S.emptySubText}>Start browsing jobs to apply</div>
                    </div>
                  )}
                  {applications.slice(0,4).map(app => {
                    const st = getStatusStyle(app.status)
                    return (
                      <div key={app.id} className="jobCard" style={S.appRow}>
                        <div style={S.appLeft}>
                          <div style={S.appTitle}>{app.jobs?.title}</div>
                          <div style={S.appMeta}>{app.jobs?.company} · {app.jobs?.location}</div>
                        </div>
                        <div style={{...S.statusBadge, background: st.bg, color: st.color}}>
                          <span style={{...S.statusDot, background: st.dot}}></span>
                          {app.status}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="rightCol" style={S.rightCol}>
                  <div className="cardIn" style={{...S.card, marginBottom:'16px'}}>
                    <div style={S.cardHead}>
                      <div style={S.cardTitle}>My Profile</div>
                      <span style={S.cardLink} onClick={() => navigate('/student-profile')}>Edit →</span>
                    </div>
                    <div style={S.profileRow}><span style={S.profileLabel}>University</span><span style={S.profileVal}>{profile?.university || <span style={S.notSet}>Not set</span>}</span></div>
                    <div style={S.profileRow}><span style={S.profileLabel}>Course</span><span style={S.profileVal}>{profile?.course || <span style={S.notSet}>Not set</span>}</span></div>
                    <div style={S.profileRow}><span style={S.profileLabel}>Grad year</span><span style={S.profileVal}>{profile?.graduation_year || <span style={S.notSet}>Not set</span>}</span></div>
                    {profile?.skills && (
                      <div style={S.skillsWrap}>
                        {profile.skills.split(',').slice(0,5).map((s,i) => (
                          <span key={i} style={S.skillChip}>{s.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="cardIn" style={S.card}>
                    <div style={S.cardTitle}>Quick Actions</div>
                    <div style={S.quickActions}>
                      <div className="quickAction" style={S.quickAction} onClick={() => navigate('/browse-jobs')}><span style={S.qaIcon}>⌕</span><span style={S.qaLabel}>Browse Jobs</span></div>
                      <div className="quickAction" style={S.quickAction} onClick={() => navigate('/student-profile')}><span style={S.qaIcon}>✎</span><span style={S.qaLabel}>Edit Profile</span></div>
                      <div className="quickAction" style={S.quickAction} onClick={() => setActiveTab('applications')}><span style={S.qaIcon}>▤</span><span style={S.qaLabel}>Applications</span></div>
                      <div className="quickAction" style={S.quickAction} onClick={() => navigate('/resume-builder')}><span style={S.qaIcon}>▥</span><span style={S.qaLabel}>Resume</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'applications' && (
            <div className="cardIn" style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardTitle}>All Applications ({applications.length})</div>
              </div>
              {applications.length === 0 && (
                <div style={S.empty}>
                  <div style={S.emptyIcon}>▤</div>
                  <div style={S.emptyText}>No applications yet</div>
                  <div style={S.emptySubText}>Browse jobs and apply to get started</div>
                </div>
              )}
              {applications.map(app => {
                const st = getStatusStyle(app.status)
                const interview = interviews.find(i => i.application_id === app.id)
                return (
                  <div key={app.id} style={{...S.appRow, flexDirection:'column', alignItems:'stretch', gap:'0'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <div style={S.appLeft}>
                        <div style={S.appTitle}>{app.jobs?.title}</div>
                        <div style={S.appMeta}>{app.jobs?.company} · {app.jobs?.location} · {app.jobs?.type}</div>
                        {app.match_score > 0 && (
                          <div style={{...S.matchPill, background: getScoreColor(app.match_score).bg, color: getScoreColor(app.match_score).color}}>{app.match_score}% match</div>
                        )}
                      </div>
                      <div style={{...S.statusBadge, background: st.bg, color: st.color}}>
                        <span style={{...S.statusDot, background: st.dot}}></span>
                        {app.status}
                      </div>
                    </div>
                    {interview && (
                      <div style={S.interviewCard}>
                       <div style={S.interviewTitle}>
                          {new Date(interview.interview_date) < new Date() ? '✓ Interview Completed' : '◷ Interview Scheduled'}
                        </div>
                        <div style={S.interviewRow}><span style={S.interviewIcon}>◷</span><span>{new Date(interview.interview_date).toLocaleDateString()}</span></div>
                        <div style={S.interviewRow}><span style={S.interviewIcon}>⏱</span><span>{interview.interview_time}</span></div>
                        <div style={S.interviewRow}><span style={S.interviewIcon}>◍</span><span>{interview.location}</span></div>
                        {interview.notes && <div style={S.interviewRow}><span style={S.interviewIcon}>✎</span><span>{interview.notes}</span></div>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'interviews' && (
            <div className="cardIn" style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardTitle}>My Interviews ({interviews.length})</div>
              </div>
              {interviews.length === 0 && (
                <div style={S.empty}>
                  <div style={S.emptyIcon}>◷</div>
                  <div style={S.emptyText}>No interviews scheduled yet</div>
                  <div style={S.emptySubText}>Keep applying — interviews will appear here</div>
                </div>
              )}
              {interviews.map(interview => {
                const app = applications.find(a => a.id === interview.application_id)
                const isPast = new Date(interview.interview_date) < new Date()
                return (
                  <div key={interview.id} style={{...S.interviewCard, marginBottom: '12px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px'}}>
                      <div>
                        <div style={{fontSize:'15px', fontWeight:'700', color:'#18181B', marginBottom:'3px'}}>{app?.jobs?.title}</div>
                        <div style={{fontSize:'13px', color:'#A1A1AA'}}>{app?.jobs?.company}</div>
                      </div>
                     <span style={{
                        background: isPast ? '#F4F4F5' : '#FEF9EE',
                        color: isPast ? '#52525B' : '#B45309',
                        padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'600',
                        border: isPast ? '1px solid #E4E4E7' : '1px solid #FDE9C8'
                      }}>
                        {isPast ? '✓ Completed' : '◷ Scheduled'}
                      </span>
                    </div>
                    <div style={S.interviewRow}><span style={S.interviewIcon}>◷</span><span style={{fontWeight:'600'}}>{new Date(interview.interview_date).toLocaleDateString()}</span></div>
                    <div style={S.interviewRow}><span style={S.interviewIcon}>⏱</span><span>{interview.interview_time}</span></div>
                    <div style={S.interviewRow}><span style={S.interviewIcon}>◍</span><span>{interview.location}</span></div>
                    {interview.notes && <div style={S.interviewRow}><span style={S.interviewIcon}>✎</span><span>{interview.notes}</span></div>}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'recommended' && (
            <div className="cardIn" style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardTitle}>Recommended for you ({recommendedJobs.length})</div>
              </div>
              {recommendedJobs.length === 0 && (
                <div style={S.empty}>
                  <div style={S.emptyIcon}>◎</div>
                  <div style={S.emptyText}>No recommendations yet</div>
                  <div style={S.emptySubText}>Add your skills in your profile to get recommendations</div>
                </div>
              )}
              <div className="recsGrid" style={{...S.recsGrid, gridTemplateColumns: 'repeat(2, 1fr)'}}>
                {recommendedJobs.map(job => {
                  const { color, bg } = getScoreColor(job.score)
                  return (
                    <div key={job.id} className="recCard jobCard" style={{...S.recCard, padding: '18px'}} onClick={() => navigate('/browse-jobs')}>
                      <div style={S.recTop}>
                        <div style={S.recIconWrap}>◍</div>
                        <div style={{...S.recScore, background: bg, color, fontSize: '16px', padding: '4px 12px'}}>{job.score}% match</div>
                      </div>
                      <div style={{...S.recTitle, fontSize: '15px'}}>{job.title}</div>
                      <div style={S.recCompany}>{job.company} · {job.location}</div>
                      <div style={S.recSkills}>
                        {job.matched.map((s,i) => (
                          <span key={i} style={S.recSkillChip}>✓ {s}</span>
                        ))}
                      </div>
                      <div style={S.recApplyBtn}>Apply now →</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: '#FAFAFA', fontFamily: "'Inter', -apple-system, sans-serif" },

  layout: { display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100vh', gap: '24px', padding: '40px' },

  mobileNav: { display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #E4E4E7', justifyContent: 'space-around', padding: '10px 0 16px', zIndex: 30 },
  mobileNavItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '0 8px' },
  mobileNavIcon: { fontSize: '18px' },
  mobileNavLabel: { fontSize: '10.5px', fontWeight: '600', color: '#A1A1AA' },

  // Sidebar — flat, bordered, neutral
  sidebar: { background: '#fff', display: 'flex', flexDirection: 'column', padding: '0', position: 'sticky', top: 0, height: 'calc(100vh - 80px)', borderRadius: '16px', border: '1px solid #E4E4E7', paddingBottom: '20px' },
  sidebarTop: { padding: '20px 18px 14px', borderBottom: '1px solid #F4F4F5' },
  sidebarLogoRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' },
  sidebarMark: { width: '32px', height: '32px', borderRadius: '9px', background: '#18181B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', letterSpacing: '.02em' },
  sidebarLogo: { fontSize: '15px', fontWeight: '700', color: '#18181B', letterSpacing: '-0.2px' },
  sidebarSub: { fontSize: '11.5px', color: '#A1A1AA', fontWeight: '500' },
  avatarWrap: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { width: '44px', height: '44px', borderRadius: '50%', background: '#F4F4F5', color: '#18181B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', border: '1px solid #E4E4E7' },
  avatarName: { fontSize: '14px', fontWeight: '700', color: '#18181B' },
  avatarRole: { fontSize: '12px', color: '#A1A1AA', fontWeight: '500' },

  sideNav: { padding: '12px 12px', flex: 1 },
  sideNavItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', fontSize: '14px', fontWeight: '500', color: '#3F3F46', marginBottom: '4px' },
  sideNavActive: { background: '#F4F4F5', color: '#18181B', fontWeight: '700', border: '1px solid #E4E4E7' },
  sideNavIcon: { fontSize: '14px', width: '16px', textAlign: 'center', color: '#71717A' },
  navBadge: { marginLeft: 'auto', background: '#18181B', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px' },

  profileStrengthBox: { margin: '12px', padding: '12px', background: '#FAFAFA', borderRadius: '12px', marginBottom: '16px', border: '1px solid #F4F4F5' },
  strengthLabel: { fontSize: '12px', fontWeight: '600', color: '#71717A', marginBottom: '8px' },
  strengthTrack: { height: '6px', background: '#E4E4E7', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' },
  strengthFill: { height: '100%', borderRadius: '3px', transition: 'width .6s ease' },
  strengthPct: { fontSize: '12px', fontWeight: '700', color: '#18181B' },
  strengthTip: { fontSize: '12px', color: '#18181B', marginTop: '6px', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' },

  logoutBtn: { margin: '0 12px 12px', padding: '10px', background: '#fff', border: '1px solid #E4E4E7', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#3F3F46' },

  main: { padding: '22px', overflowY: 'auto', paddingBottom: '80px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  heading: { fontSize: '24px', fontWeight: '700', color: '#18181B', marginBottom: '4px', letterSpacing: '-0.3px' },
  headSub: { fontSize: '14px', color: '#A1A1AA' },
  browseBtn: { padding: '11px 18px', background: '#18181B', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'opacity .15s ease' },

  metricsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' },
  metCard: { background: '#fff', borderRadius: '14px', padding: '16px', border: '1px solid #E4E4E7' },
  metIcon: { width: '32px', height: '32px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', marginBottom: '12px', background: '#F4F4F5', color: '#3F3F46' },
  metVal: { fontSize: '24px', fontWeight: '700', marginBottom: '4px', color: '#18181B' },
  metLabel: { fontSize: '12.5px', color: '#A1A1AA', fontWeight: '500' },

  grid2: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '16px' },
  rightCol: {},
  card: { background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #E4E4E7' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' },
  cardTitle: { fontSize: '15px', fontWeight: '700', color: '#18181B' },
  cardSub: { fontSize: '12.5px', color: '#A1A1AA', marginTop: '2px' },
  cardLink: { fontSize: '13px', color: '#18181B', fontWeight: '600', cursor: 'pointer' },

  recsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  recCard: { background: '#FAFAFA', borderRadius: '12px', padding: '14px', border: '1px solid #E4E4E7', cursor: 'pointer' },
  recTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  recIconWrap: { fontSize: '16px', color: '#71717A' },
  recScore: { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  recTitle: { fontSize: '13px', fontWeight: '700', color: '#18181B', marginBottom: '3px' },
  recCompany: { fontSize: '11.5px', color: '#A1A1AA', marginBottom: '8px' },
  recSkills: { display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' },
  recSkillChip: { background: '#F0FDF4', color: '#15803D', padding: '2px 8px', borderRadius: '20px', fontSize: '10.5px', fontWeight: '600', border: '1px solid #DCFCE7' },
  recApplyBtn: { fontSize: '12.5px', color: '#18181B', fontWeight: '700', marginTop: '8px' },

  appRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 14px', borderRadius: '12px', border: '1px solid #F4F4F5', marginBottom: '8px', background: '#fff' },
  appLeft: {},
  appTitle: { fontSize: '14px', fontWeight: '700', color: '#18181B', marginBottom: '3px' },
  appMeta: { fontSize: '12px', color: '#A1A1AA', marginBottom: '3px' },
  matchPill: { display: 'inline-block', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', marginTop: '3px' },
  statusBadge: { display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' },
  statusDot: { width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0 },

  interviewCard: { background: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: '12px', padding: '14px', marginTop: '10px' },
  interviewTitle: { fontSize: '13px', fontWeight: '700', color: '#15803D', marginBottom: '8px' },
  interviewRow: { display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#3F3F46', marginBottom: '5px' },
  interviewIcon: { fontSize: '13px', flexShrink: 0, color: '#71717A' },

  profileRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #F4F4F5' },
  profileLabel: { fontSize: '12.5px', color: '#A1A1AA', fontWeight: '500' },
  profileVal: { fontSize: '13px', fontWeight: '600', color: '#3F3F46' },
  notSet: { color: '#D4D4D8', fontStyle: 'italic', fontWeight: '400' },
  skillsWrap: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' },
  skillChip: { background: '#F4F4F5', color: '#3F3F46', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', border: '1px solid #E4E4E7' },

  quickActions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' },
  quickAction: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '14px 10px', background: '#FAFAFA', borderRadius: '12px', cursor: 'pointer', border: '1px solid #E4E4E7', transition: 'border-color .15s ease' },
  qaIcon: { fontSize: '18px', color: '#3F3F46' },
  qaLabel: { fontSize: '12px', fontWeight: '600', color: '#3F3F46', textAlign: 'center' },

  empty: { textAlign: 'center', padding: '36px 0', color: '#A1A1AA' },
  emptyIcon: { fontSize: '28px', marginBottom: '10px', color: '#D4D4D8' },
  emptyText: { fontSize: '14px', fontWeight: '700', color: '#52525B', marginBottom: '4px' },
  emptySubText: { fontSize: '13px' }
}
