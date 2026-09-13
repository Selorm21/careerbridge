// src/pages/StudentDashboard.jsx
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabase'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Sparkles, ListChecks, CalendarClock, Search, UserCircle,
  FileText, Send, Award, ArrowRight, Pencil, MapPin, Clock,
  ChevronRight, Check, Eye, RefreshCw, Zap
} from 'lucide-react'
import { profileStore } from '../lib/profileStore'
import { rankJobsByAiMatch } from '../lib/aiMatchingEngine'

const DESIGN = {
  gradients: {
    cosmic: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
  },
}

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [recommendedJobs, setRecommendedJobs] = useState([])
  const [interviews, setInterviews] = useState([])

  const [aiAnalysis, setAiAnalysis] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const containerRef = useRef(null)

  // ============================================================
  // AI RECOMMENDATIONS (Gemini)
  // ============================================================
  const getAIRecommendations = async (currentProfile, currentJobs) => {
    if (!currentProfile || !currentJobs?.length) return
    setAiLoading(true)
    setAiError('')

    try {
      const jobsText = currentJobs.map((job, i) => `
JOB ${i + 1}
Title: ${job.title || 'Not provided'}
Company: ${job.company || 'Not provided'}
Location: ${job.location || 'Not provided'}
Required Skills: ${job.skills || 'Not provided'}
Current Skill Match: ${job.score || 0}%
Matched Skills: ${job.matched?.join(', ') || 'None'}
`).join('\n')

      const prompt = `You are CareerBridge AI, an intelligent career advisor inside a student job and internship placement platform.

Analyze the student's profile and recommended job opportunities and provide practical career advice.

STUDENT PROFILE
Name: ${currentProfile.full_name || 'Not provided'}
University: ${currentProfile.university || 'Not provided'}
Course: ${currentProfile.course || 'Not provided'}
Skills: ${currentProfile.skills || 'Not provided'}
Bio: ${currentProfile.bio || 'Not provided'}
Graduation Year: ${currentProfile.graduation_year || 'Not provided'}

RECOMMENDED JOBS
${jobsText}

TASK
1. TOP RECOMMENDATION — identify the strongest opportunity and why it fits.
2. STRONGEST SKILLS — from information provided only.
3. SKILL GAPS — most important skills to improve.
4. CAREER ADVICE — practical steps to improve chances.
5. NEXT STEP — one specific action this week.

Keep it concise, professional, encouraging. Use clear headings and bullet points.
Do not invent qualifications, experience, companies, or skills not in the supplied information.`

      const { data, error } = await supabase.functions.invoke('gemini', { body: { prompt } })

      if (error) { setAiError('Unable to generate AI career insights right now.'); return }
      if (!data?.response) { setAiError('The AI returned an empty response.'); return }
      setAiAnalysis(data.response)
    } catch (e) {
      console.error(e)
      setAiError('Something went wrong while generating your AI career insights.')
    } finally {
      setAiLoading(false)
    }
  }

  // ============================================================
  // LOAD DATA
  // ============================================================
  useEffect(() => {
    async function getData() {
      setLoading(true)
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) { setLoading(false); return }

        const { data: profileData } = await supabase
          .from('profiles').select('*').eq('id', user.id).single()
        setProfile(profileData)

        const { data: appsData } = await supabase
          .from('applications')
          .select('*, jobs(*)')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false })
        const safeApps = appsData || []
        setApplications(safeApps)

        const { data: interviewsData } = await supabase
          .from('interviews').select('*').eq('student_id', user.id)
        setInterviews(interviewsData || [])

        const { data: jobsData } = await supabase.from('jobs').select('*')
        const appliedIds = safeApps.map(a => a.job_id)

        // Sync profileStore so aiMatchingEngine has real data
        if (profileData) {
          const skillsArray = (profileData.skills || '').split(',').map(s => s.trim()).filter(Boolean)
          profileStore.saveProfile({
            full_name: profileData.full_name || 'Student',
            email: profileData.email || user.email || '',
            headline: profileData.headline || profileData.course || '',
            bio: profileData.bio || '',
            university: profileData.university || '',
            major: profileData.course || '',
            graduation_year: profileData.graduation_year || '',
            skills: skillsArray,
          })
        }

        // Rank available jobs by AI match
        if (jobsData) {
          const available = jobsData.filter(j => !appliedIds.includes(j.id))
          const ranked = rankJobsByAiMatch(available, profileData).slice(0, 4)

          // Convert AI tier format into the shape your old code expects (score, matched)
          const normalized = ranked.map(j => ({
            ...j,
            score: j.aiMatch?.score || 0,
            matched: j.aiMatch?.matchedSkills || [],
            aiMatch: j.aiMatch,
          }))

          setRecommendedJobs(normalized)

          if (profileData && normalized.length > 0) {
            await getAIRecommendations(profileData, normalized)
          }
        }
      } catch (e) {
        console.error('Dashboard loading error:', e)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [])

  const refreshAIAnalysis = () => getAIRecommendations(profile, recommendedJobs)

  const getStatusStyle = (status) => {
    if (status === 'interview') return { bg: '#FEF3C7', color: '#D97706', dot: '#D97706', label: 'Interview' }
    if (status === 'offer') return { bg: '#D1FAE5', color: '#059669', dot: '#059669', label: 'Offer' }
    if (status === 'rejected') return { bg: '#FEE2E2', color: '#DC2626', dot: '#DC2626', label: 'Rejected' }
    return { bg: '#EEF2FF', color: '#6366F1', dot: '#6366F1', label: 'Applied' }
  }

  const metrics = [
    { label: 'Applications Sent', val: applications.length, Icon: Send, iconBg: 'rgba(99,102,241,.12)', iconColor: '#6366F1' },
    { label: 'Interviews', val: applications.filter(a => a.status === 'interview').length, Icon: CalendarClock, iconBg: 'rgba(245,158,11,.12)', iconColor: '#F59E0B' },
    { label: 'Offers', val: applications.filter(a => a.status === 'offer').length, Icon: Award, iconBg: 'rgba(16,185,129,.12)', iconColor: '#10B981' },
    { label: 'Profile Views', val: 47, Icon: Eye, iconBg: 'rgba(59,130,246,.12)', iconColor: '#3B82F6' },
  ]

  const formatDate = (d) => {
    const date = new Date(d)
    const days = Math.ceil(Math.abs(new Date() - date) / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const strength = profile ? (
    (profile.full_name ? 20 : 0) + (profile.university ? 20 : 0) +
    (profile.course ? 20 : 0) + (profile.skills ? 20 : 0) + (profile.bio ? 20 : 0)
  ) : 0

  const strengthLevel = strength >= 80 ? '🌟 Excellent' : strength >= 60 ? '💪 Good' : strength >= 40 ? '📈 Fair' : '⚡ Needs Work'
  const strengthColor = strength >= 80 ? '#10B981' : strength >= 60 ? '#F59E0B' : strength >= 40 ? '#F59E0B' : '#EF4444'

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 border-4 border-transparent rounded-full border-t-indigo-500 animate-spin" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
        </div>
        <p className="text-sm text-slate-500 font-medium">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-up">
      {/* ---------- Welcome ---------- */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-7">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            Welcome back
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {profile?.full_name?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">Here's what's happening with your job search today.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/student/browse-jobs')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold transition shadow-brand active:scale-95"
          >
            <Search size={16} />
            Browse Jobs
            <ChevronRight size={15} />
          </button>
          <button
            onClick={() => navigate('/student/profile')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-sm font-bold transition"
          >
            <UserCircle size={16} />
            Profile
          </button>
        </div>
      </div>

      {/* ---------- Metrics ---------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {metrics.map((m, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-subtle hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: m.iconBg, color: m.iconColor }}
              >
                <m.Icon size={19} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{m.val}</div>
            <div className="text-xs text-slate-500 font-semibold mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* ---------- Main grid ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recommended */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-subtle">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={18} className="text-brand-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900">Recommended for You</h3>
                  <p className="text-xs text-slate-500">Smart matches based on your skills</p>
                </div>
              </div>
              {recommendedJobs.length > 0 && (
                <button
                  onClick={() => navigate('/student/browse-jobs')}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                >
                  View all <ChevronRight size={14} />
                </button>
              )}
            </div>

            {recommendedJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="text-4xl mb-3">🎯</div>
                <p className="text-sm font-bold text-slate-800">No recommendations yet</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">Add skills to your profile to get personalized matches</p>
                <button
                  onClick={() => navigate('/student/profile')}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95"
                >
                  Add Skills
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendedJobs.map((job) => {
                  const ai = job.aiMatch
                  return (
                    <div
                      key={job.id}
                      onClick={() => navigate('/student/browse-jobs')}
                      className="p-4 rounded-2xl border border-slate-200/80 hover:border-brand-300 hover:shadow-md cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center font-black text-sm flex-shrink-0">
                          {job.company?.charAt(0) || 'J'}
                        </div>
                        {ai && (
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${ai.tierColor}`}>
                            {ai.score}%
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">{job.title}</h4>
                      <p className="text-xs text-slate-500 truncate">{job.company}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 truncate">
                        <MapPin size={11} /> {job.location}
                      </p>
                      {ai?.tierBadge && (
                        <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-brand-600">
                          {ai.tierBadge}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* AI Insights */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-subtle">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: DESIGN.gradients.cosmic }}
                >
                  <Sparkles size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900">AI Career Insights</h3>
                  <p className="text-xs text-slate-500">Personalized advice powered by CareerBridge AI</p>
                </div>
              </div>
              {recommendedJobs.length > 0 && (
                <button
                  onClick={refreshAIAnalysis}
                  disabled={aiLoading}
                  className="w-9 h-9 rounded-xl border border-slate-200 hover:border-brand-300 text-brand-500 hover:text-brand-600 flex items-center justify-center transition disabled:opacity-50"
                  aria-label="Refresh AI insights"
                >
                  <RefreshCw size={15} className={aiLoading ? 'animate-spin' : ''} />
                </button>
              )}
            </div>

            {aiLoading ? (
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-50/60 to-purple-50/40 border border-indigo-100">
                <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center animate-pulse">
                  <Sparkles size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Analyzing your profile...</p>
                  <p className="text-xs text-slate-500 mt-0.5">Comparing your skills with opportunities.</p>
                </div>
              </div>
            ) : aiError ? (
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-red-50 border border-red-200">
                <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-red-100 flex items-center justify-center">⚠️</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-red-800">AI analysis unavailable</p>
                  <p className="text-xs text-red-700 mt-1 leading-relaxed">{aiError}</p>
                  <button
                    onClick={refreshAIAnalysis}
                    className="mt-3 px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : aiAnalysis ? (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                {aiAnalysis.split('\n').map((line, i) => {
                  const t = line.trim()
                  if (!t) return <div key={i} className="h-2" />
                  const isHeading = /^[1-5]\./.test(t) || t.endsWith(':')
                  const isBullet = /^[-•*]/.test(t)
                  if (isHeading) return <div key={i} className="text-sm font-extrabold text-slate-900 mt-3 first:mt-0">{t}</div>
                  if (isBullet) return (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed my-1">
                      <span className="text-indigo-500 font-black leading-snug">•</span>
                      <span>{t.replace(/^[-•*]\s*/, '')}</span>
                    </div>
                  )
                  return <p key={i} className="text-sm text-slate-600 leading-relaxed my-1">{t}</p>
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center rounded-2xl bg-gradient-to-br from-indigo-50/40 to-purple-50/30">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl mb-3">✨</div>
                <p className="text-sm font-bold text-slate-800">
                  {recommendedJobs.length === 0 ? 'Build your profile to unlock AI insights' : 'AI insights are being prepared'}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">
                  {recommendedJobs.length === 0
                    ? 'Add your skills, course, and bio so CareerBridge AI can provide personalized guidance.'
                    : 'We need a moment to analyze your opportunities.'}
                </p>
                {recommendedJobs.length === 0 && (
                  <button
                    onClick={() => navigate('/student/profile')}
                    className="mt-4 px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-2"
                    style={{ background: DESIGN.gradients.cosmic }}
                  >
                    Complete Profile <ArrowRight size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Applications */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-subtle">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <ListChecks size={18} className="text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900">Recent Applications</h3>
                  <p className="text-xs text-slate-500">Your latest activity and status</p>
                </div>
              </div>
              {applications.length > 0 && (
                <button
                  onClick={() => navigate('/student/my-applications')}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                >
                  View all <ChevronRight size={14} />
                </button>
              )}
            </div>

            {applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-sm font-bold text-slate-800">No applications yet</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">Start browsing jobs and apply to opportunities</p>
                <button
                  onClick={() => navigate('/student/browse-jobs')}
                  className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95"
                >
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {applications.slice(0, 4).map((app) => {
                  const st = getStatusStyle(app.status)
                  return (
                    <div key={app.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                          style={{ background: st.bg, color: st.color }}
                        >
                          {app.jobs?.company?.charAt(0) || 'J'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{app.jobs?.title}</p>
                          <p className="text-xs text-slate-500 truncate">{app.jobs?.company} · {app.jobs?.location}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock size={11} /> {formatDate(app.created_at)}
                          </p>
                        </div>
                      </div>
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
                        style={{ background: st.bg, color: st.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                        {st.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Profile card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-subtle">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 opacity-30" style={{ transform: 'scale(1.08)' }} />
                <div
                  className="relative w-20 h-20 rounded-full text-white flex items-center justify-center text-3xl font-bold"
                  style={{ background: DESIGN.gradients.cosmic }}
                >
                  {profile?.full_name?.charAt(0) || 'S'}
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-900">{profile?.full_name || 'Student'}</h3>
              <p className="text-xs text-slate-500 mb-4">Student</p>

              <div className="w-full mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-500">Profile Strength</span>
                  <span className="text-sm font-black" style={{ color: strengthColor }}>{strength}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${strength}%`, background: strengthColor }} />
                </div>
                <p className="text-[11px] font-bold text-slate-500 mt-2">{strengthLevel}</p>
              </div>

              <div className="w-full text-left space-y-2 pt-3 border-t border-slate-100">
                <div className="flex justify-between gap-2 text-xs">
                  <span className="text-slate-500">University</span>
                  <span className="font-bold text-slate-800 truncate text-right max-w-[60%]">{profile?.university || 'Not set'}</span>
                </div>
                <div className="flex justify-between gap-2 text-xs">
                  <span className="text-slate-500">Course</span>
                  <span className="font-bold text-slate-800 truncate text-right max-w-[60%]">{profile?.course || 'Not set'}</span>
                </div>
                <div className="flex justify-between gap-2 text-xs">
                  <span className="text-slate-500">Graduation</span>
                  <span className="font-bold text-slate-800 truncate text-right max-w-[60%]">{profile?.graduation_year || 'Not set'}</span>
                </div>
              </div>

              {profile?.skills && (
                <div className="w-full text-left mt-4">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.split(',').slice(0, 5).map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-600">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate('/student/profile')}
                className="w-full mt-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-bold text-slate-700 flex items-center justify-center gap-2 transition"
              >
                <Pencil size={14} /> Edit Profile
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-subtle">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Browse Jobs', icon: Search, bg: 'rgba(99,102,241,.12)', color: '#6366F1', to: '/student/browse-jobs' },
                { label: 'Edit Profile', icon: Pencil, bg: 'rgba(245,158,11,.12)', color: '#F59E0B', to: '/student/profile' },
                { label: 'Applications', icon: ListChecks, bg: 'rgba(16,185,129,.12)', color: '#10B981', to: '/student/my-applications' },
                { label: 'Resume', icon: FileText, bg: 'rgba(59,130,246,.12)', color: '#3B82F6', to: '/student/resume-builder' },
              ].map((a, i) => (
                <button
                  key={i}
                  onClick={() => navigate(a.to)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: a.bg, color: a.color }}>
                    <a.icon size={18} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}