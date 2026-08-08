import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getScoreColor } from '../matchScore'
import {
  LayoutGrid, ListChecks, Sparkles, CalendarClock, Search, UserCircle,
  FileText, BarChart3, Send, CheckCircle2, XCircle, ArrowRight,
  Pencil, MapPin, Clock, StickyNote, ChevronRight, Plus, Check
} from 'lucide-react'

// Cycles a small, deliberate accent palette across cards/avatars
const ACCENTS = [
  { bg: '#EEF2FF', color: '#4338CA', border: '#E0E7FF' },
  { bg: '#F0FDF4', color: '#15803D', border: '#DCFCE7' },
  { bg: '#FEF9EE', color: '#B45309', border: '#FDE9C8' },
  { bg: '#FCE7F3', color: '#BE185D', border: '#FBCFE8' },
  { bg: '#ECFEFF', color: '#0E7490', border: '#CFFAFE' },
]
function accentFor(seed = '') {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return ACCENTS[h % ACCENTS.length]
}
function initialsFor(text = '') {
  const parts = text.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '·'
}

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [recommendedJobs, setRecommendedJobs] = useState([])
  const [interviews, setInterviews] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')

  // Sync tab from URL parameter
  useEffect(() => {
    if (tabParam && ['overview', 'applications', 'recommended', 'interviews'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

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

  function getStatusStyle(status) {
    if (status === 'applied') return { bg: '#EEF2FF', color: '#4338CA', dot: '#6366F1' }
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

  const metrics = [
    { label: 'Applications', val: applications.length, Icon: Send, bg: '#EEF2FF', color: '#4338CA' },
    { label: 'Interviews', val: applications.filter(a => a.status === 'interview').length, Icon: CalendarClock, bg: '#FEF9EE', color: '#B45309' },
    { label: 'Offers', val: applications.filter(a => a.status === 'offer').length, Icon: CheckCircle2, bg: '#F0FDF4', color: '#15803D' },
    { label: 'Rejected', val: applications.filter(a => a.status === 'rejected').length, Icon: XCircle, bg: '#FEF2F2', color: '#B91C1C' },
  ]

  // Navigation handler for tab changes
  const handleTabChange = (tab) => {
    // For these tabs, update the URL parameter
    const stateTabs = ['overview', 'applications', 'recommended', 'interviews'];
    
    if (stateTabs.includes(tab)) {
      // Update the URL with the tab parameter
      if (tab === 'overview') {
        navigate('/student')
      } else {
        navigate(`/student?tab=${tab}`)
      }
    } else if (tab === 'browse') {
      navigate('/student/browse-jobs')
    } else if (tab === 'profile') {
      navigate('/student/profile')
    } else if (tab === 'resume') {
      navigate('/student/resume-builder')
    } else if (tab === 'analytics') {
      navigate('/student/analytics')
    }
  };

  return (
    <div style={S.page}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .pageIn{animation:fadeUp .4s ease forwards}
        .cardIn{animation:fadeUp .4s ease forwards}
        .metCard{transition:border-color .15s ease, transform .15s ease}
        .metCard:hover{border-color:#D4D4D8!important;transform:translateY(-1px)}
        .jobCard{transition:all .15s ease}
        .jobCard:hover{border-color:#D4D4D8!important;transform:translateY(-1px)}
        .progressBar{background:linear-gradient(90deg,#4338CA,#6366F1)}
        .recCard:hover{border-color:#D4D4D8!important;background:#fff!important;transform:translateY(-1px)}
        .browseBtn:hover{opacity:.88;transform:translateY(-1px)}
        .quickAction:hover{border-color:#D4D4D8!important;transform:translateY(-1px)}
        @media(max-width:768px){
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
        <main className="main" style={S.main}>
          <div className="pageIn topBar" style={S.topBar}>
            <div>
              <h1 style={S.heading}>Good day, {profile?.full_name?.split(' ')[0] || 'Student'}</h1>
              <p style={S.headSub}>Here's what's happening with your job search.</p>
            </div>
            <button className="browseBtn" style={S.browseBtn} onClick={() => handleTabChange('browse')}>
              <Search size={16} />
              Browse jobs
            </button>
          </div>

          <div className="metricsRow" style={S.metricsRow}>
            {metrics.map((m, i) => (
              <div key={i} className="metCard cardIn" style={S.metCard}>
                <div style={{...S.metIcon, background: m.bg, color: m.color}}><m.Icon size={16} /></div>
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
                    <span style={S.cardLink} onClick={() => handleTabChange('recommended')}>View all<ChevronRight size={14} /></span>
                  </div>
                  <div className="recsGrid" style={S.recsGrid}>
                    {recommendedJobs.map(job => {
                      const { color, bg } = getScoreColor(job.score)
                      const a = accentFor(job.company)
                      return (
                        <div key={job.id} className="recCard jobCard" style={S.recCard} onClick={() => handleTabChange('browse')}>
                          <div style={S.recTop}>
                            <div style={{...S.recIconWrap, background: a.bg, color: a.color}}>{initialsFor(job.company)}</div>
                            <div style={{...S.recScore, background: bg, color}}>{job.score}%</div>
                          </div>
                          <div style={S.recTitle}>{job.title}</div>
                          <div style={S.recCompany}>{job.company} · {job.location}</div>
                          <div style={S.recSkills}>
                            {job.matched.slice(0,3).map((s,i) => (
                              <span key={i} style={S.recSkillChip}><Check size={11} style={{display:'inline', verticalAlign:'-1px', marginRight:'2px'}} />{s}</span>
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
                      <div style={S.cardTitle}>Recent applications</div>
                      <div style={S.cardSub}>Your latest activity and status.</div>
                    </div>
                    <span style={S.cardLink} onClick={() => handleTabChange('applications')}>View all<ChevronRight size={14} /></span>
                  </div>
                  {applications.length === 0 && (
                    <div style={S.empty}>
                      <ListChecks size={28} style={S.emptyIcon} />
                      <div style={S.emptyText}>No applications yet</div>
                      <div style={S.emptySubText}>Start browsing jobs to apply.</div>
                    </div>
                  )}
                  {applications.slice(0,4).map(app => {
                    const st = getStatusStyle(app.status)
                    const a = accentFor(app.jobs?.company)
                    return (
                      <div key={app.id} className="jobCard" style={S.appRow}>
                        <div style={S.appLeftRow}>
                          <div style={{...S.appAvatar, background: a.bg, color: a.color}}>{initialsFor(app.jobs?.company)}</div>
                          <div style={S.appLeft}>
                            <div style={S.appTitle}>{app.jobs?.title}</div>
                            <div style={S.appMeta}>{app.jobs?.company} · {app.jobs?.location}</div>
                          </div>
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
                      <div style={S.cardTitle}>My profile</div>
                      <span style={S.cardLink} onClick={() => handleTabChange('profile')}>Edit<ChevronRight size={14} /></span>
                    </div>
                    <div style={S.profileRow}><span style={S.profileLabel}>University</span><span style={S.profileVal}>{profile?.university || <span style={S.notSet}>Not set</span>}</span></div>
                    <div style={S.profileRow}><span style={S.profileLabel}>Course</span><span style={S.profileVal}>{profile?.course || <span style={S.notSet}>Not set</span>}</span></div>
                    <div style={{...S.profileRow, borderBottom: 'none'}}><span style={S.profileLabel}>Grad year</span><span style={S.profileVal}>{profile?.graduation_year || <span style={S.notSet}>Not set</span>}</span></div>
                    {profile?.skills && (
                      <div style={S.skillsWrap}>
                        {profile.skills.split(',').slice(0,5).map((s,i) => (
                          <span key={i} style={S.skillChip}>{s.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="cardIn" style={S.card}>
                    <div style={S.cardTitle}>Quick actions</div>
                    <div style={S.quickActions}>
                     <div className="quickAction" style={S.quickAction} onClick={() => handleTabChange('browse')}><Search size={18} style={S.qaIcon} /><span style={S.qaLabel}>Browse jobs</span></div>
                      <div className="quickAction" style={S.quickAction} onClick={() => handleTabChange('profile')}><Pencil size={18} style={S.qaIcon} /><span style={S.qaLabel}>Edit profile</span></div>
                      <div className="quickAction" style={S.quickAction} onClick={() => handleTabChange('applications')}><ListChecks size={18} style={S.qaIcon} /><span style={S.qaLabel}>Applications</span></div>
                      <div className="quickAction" style={S.quickAction} onClick={() => handleTabChange('resume')}><FileText size={18} style={S.qaIcon} /><span style={S.qaLabel}>Resume</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'applications' && (
            <div className="cardIn" style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardTitle}>All applications ({applications.length})</div>
              </div>
              {applications.length === 0 && (
                <div style={S.empty}>
                  <ListChecks size={28} style={S.emptyIcon} />
                  <div style={S.emptyText}>No applications yet</div>
                  <div style={S.emptySubText}>Browse jobs and apply to get started.</div>
                </div>
              )}
              {applications.map(app => {
                const st = getStatusStyle(app.status)
                const a = accentFor(app.jobs?.company)
                return (
                  <div key={app.id} style={{...S.appRow, flexDirection:'column', alignItems:'stretch', gap:'0'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <div style={S.appLeftRow}>
                        <div style={{...S.appAvatar, background: a.bg, color: a.color}}>{initialsFor(app.jobs?.company)}</div>
                        <div style={S.appLeft}>
                          <div style={S.appTitle}>{app.jobs?.title}</div>
                          <div style={S.appMeta}>{app.jobs?.company} · {app.jobs?.location} · {app.jobs?.type}</div>
                        </div>
                      </div>
                      <div style={{...S.statusBadge, background: st.bg, color: st.color}}>
                        <span style={{...S.statusDot, background: st.dot}}></span>
                        {app.status}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'interviews' && (
            <div className="cardIn" style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardTitle}>My interviews ({interviews.length})</div>
              </div>
              {interviews.length === 0 && (
                <div style={S.empty}>
                  <CalendarClock size={28} style={S.emptyIcon} />
                  <div style={S.emptyText}>No interviews scheduled yet</div>
                  <div style={S.emptySubText}>Keep applying — interviews will appear here.</div>
                </div>
              )}
              {interviews.map(interview => (
                <div key={interview.id} style={S.appRow}>
                  <div style={S.appLeftRow}>
                    <div style={{...S.appAvatar, background: '#EEF2FF', color: '#4338CA'}}>📅</div>
                    <div style={S.appLeft}>
                      <div style={S.appTitle}>Interview with {interview.company || 'Company'}</div>
                      <div style={S.appMeta}>{new Date(interview.scheduled_at).toLocaleDateString()} at {interview.time || 'TBD'}</div>
                    </div>
                  </div>
                  <div style={{...S.statusBadge, background: '#FEF9EE', color: '#B45309'}}>
                    <span style={{...S.statusDot, background: '#D97706'}}></span>
                    Scheduled
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'recommended' && (
            <div className="cardIn" style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardTitle}>Recommended for you ({recommendedJobs.length})</div>
              </div>
              {recommendedJobs.length === 0 && (
                <div style={S.empty}>
                  <Sparkles size={28} style={S.emptyIcon} />
                  <div style={S.emptyText}>No recommendations yet</div>
                  <div style={S.emptySubText}>Add your skills in your profile to get recommendations.</div>
                </div>
              )}
              {recommendedJobs.map(job => {
                const { color, bg } = getScoreColor(job.score)
                const a = accentFor(job.company)
                return (
                  <div key={job.id} style={{...S.appRow, cursor: 'pointer'}} onClick={() => handleTabChange('browse')}>
                    <div style={S.appLeftRow}>
                      <div style={{...S.appAvatar, background: a.bg, color: a.color}}>{initialsFor(job.company)}</div>
                      <div style={S.appLeft}>
                        <div style={S.appTitle}>{job.title}</div>
                        <div style={S.appMeta}>{job.company} · {job.location}</div>
                      </div>
                    </div>
                    <div style={{...S.statusBadge, background: bg, color}}>
                      {job.score}% Match
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'browse' && (
            <div className="cardIn" style={S.card}>
              <div style={S.cardHead}>
                <div>
                  <div style={S.cardTitle}>Browse Jobs</div>
                  <div style={S.cardSub}>Find opportunities that match your skills.</div>
                </div>
              </div>
              <BrowseJobsTab studentSkills={profile?.skills || ''} userId={profile?.id} />
            </div>
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              profile={profile}
              onSaved={(updatedProfile) => setProfile(updatedProfile)}
            />
          )}

          {activeTab === 'resume' && (
            <div className="cardIn" style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardTitle}>Resume Builder</div>
                <span style={S.cardLink} onClick={() => handleTabChange('resume')}>
                  Open full page<ChevronRight size={14} />
                </span>
              </div>
              <p style={{color:'#A1A1AA', fontSize:'14px'}}>
                Click "Open full page" to use the full Resume Builder with live preview and PDF download.
              </p>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="cardIn" style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardTitle}>Analytics</div>
                <span style={S.cardLink} onClick={() => handleTabChange('analytics')}>
                  Open full page<ChevronRight size={14} />
                </span>
              </div>
              <p style={{color:'#A1A1AA', fontSize:'14px'}}>
                Click "Open full page" to view the full analytics dashboard with charts.
              </p>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}


function BrowseJobsTab({ studentSkills, userId }) {
  const [jobs, setJobs] = useState([])
  const [appliedJobs, setAppliedJobs] = useState([])
  const [search, setSearch] = useState('')
  const [applying, setApplying] = useState(null)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function fetchJobs() {
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })

      setJobs(jobsData || [])

      if (userId) {
        const { data: appsData } = await supabase
          .from('applications')
          .select('job_id')
          .eq('student_id', userId)

        setAppliedJobs(appsData?.map(a => a.job_id) || [])
      }
    }

    fetchJobs()
  }, [userId])

  async function applyForJob(jobId) {
    if (!userId) return

    setApplying(jobId)

    const { error } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        student_id: userId,
        status: 'applied'
      })

    if (!error) {
      setAppliedJobs(prev => [...prev, jobId])
      setSuccess('Application submitted!')
      setTimeout(() => setSuccess(''), 3000)
    }

    setApplying(null)
  }

  const filtered = jobs.filter(job =>
    job.title?.toLowerCase().includes(search.toLowerCase()) ||
    job.company?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {success && (
        <div style={{
          background:'#F0FDF4',
          color:'#15803D',
          padding:'12px 16px',
          borderRadius:'10px',
          marginBottom:'16px',
          fontSize:'14px',
          fontWeight:'600'
        }}>
          ✓ {success}
        </div>
      )}

      <input
        style={{
          width:'100%',
          padding:'12px 14px',
          border:'1px solid #E4E4E7',
          borderRadius:'12px',
          fontSize:'14px',
          marginBottom:'16px',
          boxSizing:'border-box'
        }}
        placeholder="Search jobs..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))',
        gap:'14px'
      }}>
        {filtered.map(job => {
          const jobSkills = job.skills
            ? job.skills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean)
            : []

          const skills = studentSkills
            ? studentSkills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean)
            : []

          const matchedCount = jobSkills.filter(jobSkill =>
            skills.some(studentSkill =>
              studentSkill.includes(jobSkill) || jobSkill.includes(studentSkill)
            )
          ).length

          const score = jobSkills.length
            ? Math.round((matchedCount / jobSkills.length) * 100)
            : 0

          return (
            <div
              key={job.id}
              style={{
                background:'#fff',
                borderRadius:'14px',
                padding:'18px',
                border:'1px solid #E4E4E7'
              }}
            >
              <div style={{
                fontSize:'15px',
                fontWeight:'700',
                color:'#18181B',
                marginBottom:'4px'
              }}>
                {job.title}
              </div>

              <div style={{
                fontSize:'13px',
                color:'#A1A1AA',
                marginBottom:'8px'
              }}>
                {job.company} · {job.location}
              </div>

              {studentSkills && (
                <div style={{
                  fontSize:'13px',
                  fontWeight:'700',
                  color: score >= 70 ? '#15803D' : score >= 40 ? '#B45309' : '#B91C1C',
                  marginBottom:'10px'
                }}>
                  {score}% match
                </div>
              )}

              {appliedJobs.includes(job.id) ? (
                <div style={{
                  padding:'10px',
                  background:'#F0FDF4',
                  color:'#15803D',
                  borderRadius:'8px',
                  fontSize:'13px',
                  fontWeight:'600',
                  textAlign:'center'
                }}>
                  ✓ Applied
                </div>
              ) : (
                <button
                  onClick={() => applyForJob(job.id)}
                  disabled={applying === job.id}
                  style={{
                    width:'100%',
                    padding:'10px',
                    background:'#18181B',
                    color:'#fff',
                    border:'none',
                    borderRadius:'8px',
                    fontSize:'13px',
                    fontWeight:'600',
                    cursor:'pointer'
                  }}
                >
                  {applying === job.id ? 'Applying...' : 'Apply now →'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProfileTab({ profile, onSaved }) {
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    university: profile?.university || '',
    course: profile?.course || '',
    graduation_year: profile?.graduation_year || '',
    skills: profile?.skills || '',
    bio: profile?.bio || ''
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setForm({
      full_name: profile?.full_name || '',
      university: profile?.university || '',
      course: profile?.course || '',
      graduation_year: profile?.graduation_year || '',
      skills: profile?.skills || '',
      bio: profile?.bio || ''
    })
  }, [profile])

  async function handleSave() {
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setSaving(false)
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(form)
      .eq('id', user.id)
      .select()
      .single()

    if (!error && data) {
      onSaved?.(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }

    setSaving(false)
  }

  return (
    <div style={{
      background:'#fff',
      borderRadius:'16px',
      padding:'22px',
      border:'1px solid #E4E4E7'
    }}>
      <div style={{
        fontSize:'15px',
        fontWeight:'700',
        color:'#18181B',
        marginBottom:'18px'
      }}>
        My Profile
      </div>

      {saved && (
        <div style={{
          background:'#F0FDF4',
          color:'#15803D',
          padding:'12px',
          borderRadius:'10px',
          marginBottom:'16px',
          fontSize:'14px',
          fontWeight:'600'
        }}>
          ✓ Profile saved!
        </div>
      )}

      <div style={{
        display:'grid',
        gridTemplateColumns:'1fr 1fr',
        gap:'14px',
        marginBottom:'14px'
      }}>
        {[
          ['Full name','full_name'],
          ['University','university'],
          ['Course','course'],
          ['Graduation year','graduation_year']
        ].map(([label, key]) => (
          <div key={key}>
            <label style={{
              display:'block',
              fontSize:'12.5px',
              fontWeight:'600',
              color:'#52525B',
              marginBottom:'6px'
            }}>
              {label}
            </label>

            <input
              style={{
                width:'100%',
                padding:'10px 12px',
                border:'1px solid #E4E4E7',
                borderRadius:'8px',
                fontSize:'13px',
                boxSizing:'border-box'
              }}
              value={form[key]}
              onChange={e => setForm(prev => ({
                ...prev,
                [key]: e.target.value
              }))}
            />
          </div>
        ))}
      </div>

      <div style={{ marginBottom:'14px' }}>
        <label style={{
          display:'block',
          fontSize:'12.5px',
          fontWeight:'600',
          color:'#52525B',
          marginBottom:'6px'
        }}>
          Skills (comma separated)
        </label>

        <input
          style={{
            width:'100%',
            padding:'10px 12px',
            border:'1px solid #E4E4E7',
            borderRadius:'8px',
            fontSize:'13px',
            boxSizing:'border-box'
          }}
          value={form.skills}
          onChange={e => setForm(prev => ({
            ...prev,
            skills: e.target.value
          }))}
        />
      </div>

      <div style={{ marginBottom:'18px' }}>
        <label style={{
          display:'block',
          fontSize:'12.5px',
          fontWeight:'600',
          color:'#52525B',
          marginBottom:'6px'
        }}>
          Bio
        </label>

        <textarea
          style={{
            width:'100%',
            padding:'10px 12px',
            border:'1px solid #E4E4E7',
            borderRadius:'8px',
            fontSize:'13px',
            boxSizing:'border-box',
            height:'80px',
            resize:'vertical',
            fontFamily:'inherit'
          }}
          value={form.bio}
          onChange={e => setForm(prev => ({
            ...prev,
            bio: e.target.value
          }))}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding:'12px 24px',
          background:'#18181B',
          color:'#fff',
          border:'none',
          borderRadius:'10px',
          fontSize:'14px',
          fontWeight:'600',
          cursor:'pointer'
        }}
      >
        {saving ? 'Saving...' : 'Save profile'}
      </button>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: '#FAFAFA', fontFamily: "'Inter', -apple-system, sans-serif" },
  layout: { display: 'grid', gridTemplateColumns: '1fr', minHeight: '100vh', gap: '24px', padding: '40px' },

  main: { padding: '22px', overflowY: 'auto', paddingBottom: '80px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  heading: { fontSize: '24px', fontWeight: '700', color: '#18181B', marginBottom: '4px', letterSpacing: '-0.3px' },
  headSub: { fontSize: '14px', color: '#A1A1AA' },
  browseBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px', background: '#18181B', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s ease' },

  metricsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' },
  metCard: { background: '#fff', borderRadius: '14px', padding: '16px', border: '1px solid #E4E4E7' },
  metIcon: { width: '32px', height: '32px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', marginBottom: '12px', fontWeight: '700' },
  metVal: { fontSize: '24px', fontWeight: '700', marginBottom: '4px', color: '#18181B' },
  metLabel: { fontSize: '12.5px', color: '#A1A1AA', fontWeight: '500' },

  grid2: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '16px' },
  rightCol: {},
  card: { background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #E4E4E7' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' },
  cardTitle: { fontSize: '15px', fontWeight: '700', color: '#18181B' },
  cardSub: { fontSize: '12.5px', color: '#A1A1AA', marginTop: '2px' },
  cardLink: { fontSize: '13px', color: '#4338CA', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '2px' },

  recsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  recCard: { background: '#FAFAFA', borderRadius: '12px', padding: '14px', border: '1px solid #E4E4E7', cursor: 'pointer' },
  recTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  recIconWrap: { width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700' },
  recScore: { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  recTitle: { fontSize: '13px', fontWeight: '700', color: '#18181B', marginBottom: '3px' },
  recCompany: { fontSize: '11.5px', color: '#A1A1AA', marginBottom: '8px' },
  recSkills: { display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' },
  recSkillChip: { background: '#F0FDF4', color: '#15803D', padding: '2px 8px', borderRadius: '20px', fontSize: '10.5px', fontWeight: '600', border: '1px solid #DCFCE7' },

  appRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 14px', borderRadius: '12px', border: '1px solid #F4F4F5', marginBottom: '8px', background: '#fff' },
  appLeftRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  appAvatar: { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 },
  appLeft: {},
  appTitle: { fontSize: '14px', fontWeight: '700', color: '#18181B', marginBottom: '3px' },
  appMeta: { fontSize: '12px', color: '#A1A1AA', marginBottom: '3px' },
  statusBadge: { display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' },
  statusDot: { width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0 },

  profileRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #F4F4F5' },
  profileLabel: { fontSize: '12.5px', color: '#A1A1AA', fontWeight: '500' },
  profileVal: { fontSize: '13px', fontWeight: '600', color: '#3F3F46' },
  notSet: { color: '#D4D4D8', fontStyle: 'italic', fontWeight: '400' },
  skillsWrap: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' },
  skillChip: { background: '#EEF2FF', color: '#4338CA', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', border: '1px solid #E0E7FF' },

  quickActions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' },
  quickAction: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '14px 10px', background: '#FAFAFA', borderRadius: '12px', cursor: 'pointer', border: '1px solid #F4F4F5', transition: 'all 0.2s ease' },
  qaIcon: { color: '#3F3F46' },
  qaLabel: { fontSize: '12px', fontWeight: '600', color: '#3F3F46', textAlign: 'center' },

  empty: { textAlign: 'center', padding: '36px 0', color: '#A1A1AA' },
  emptyIcon: { marginBottom: '10px', color: '#D4D4D8' },
  emptyText: { fontSize: '14px', fontWeight: '700', color: '#52525B', marginBottom: '4px' },
  emptySubText: { fontSize: '13px' }
}