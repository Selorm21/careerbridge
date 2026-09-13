// src/pages/ViewApplicants.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Search, Users, CheckCircle2, Clock, XCircle, ChevronRight,
  Sparkles, ArrowLeft, Briefcase, CalendarClock, Award,
  Mail, MapPin, FileText, X, Trophy, User
} from 'lucide-react'
import VerifiedBadge, { isStudentFullyVerified } from '../components/VerifiedBadge'

export default function ViewApplicants() {
  const { jobId } = useParams()
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updating, setUpdating] = useState(null)
  const [toast, setToast] = useState('')
  const [selectedApp, setSelectedApp] = useState(null) // for profile modal

  // --- AI ranking state (kept from your original) ---
  const [ranking, setRanking] = useState(false)
  const [rankedResults, setRankedResults] = useState(null)
  const [rankError, setRankError] = useState('')

  useEffect(() => {
    if (jobId) fetchData()
  }, [jobId])

  async function fetchData() {
    setLoading(true)

    const { data: jobData } = await supabase.from('jobs').select('*').eq('id', jobId).single()
    setJob(jobData || null)

    const { data: appsData } = await supabase
      .from('applications')
      .select('*, profiles(id, full_name, email, university, course, graduation_year, skills, bio, verified)')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    const appsWithVerification = await Promise.all((appsData || []).map(async (app) => {
      const { data: docs } = await supabase
        .from('documents')
        .select('doc_type, status')
        .eq('student_id', app.profiles?.id)
      return { ...app, isFullyVerified: isStudentFullyVerified(docs) }
    }))

    setApplications(appsWithVerification)
    setLoading(false)
  }

  // ============================================================
  // STATUS UPDATES — the missing piece
  // ============================================================
  async function updateStatus(app, newStatus) {
    if (!newStatus || newStatus === app.status) return
    setUpdating(app.id)

    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', app.id)

    if (error) {
      alert('Could not update status: ' + error.message)
      setUpdating(null)
      return
    }

    setApplications(prev =>
      prev.map(a => a.id === app.id ? { ...a, status: newStatus } : a)
    )
    setToast(`${app.profiles?.full_name || 'Applicant'} → ${labelFor(newStatus)}`)
    setTimeout(() => setToast(''), 2500)
    setUpdating(null)
  }

  function labelFor(s) {
    if (s === 'interview') return 'Interview'
    if (s === 'offer') return 'Offer'
    if (s === 'rejected') return 'Rejected'
    return 'Applied'
  }

  function badgeStyle(status) {
    if (status === 'interview') return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', Icon: CalendarClock }
    if (status === 'offer') return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', Icon: Trophy }
    if (status === 'rejected') return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', Icon: XCircle }
    return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', Icon: Clock }
  }

  function scoreColor(score) {
    if (score >= 80) return { color: '#059669', bg: '#ECFDF5' }
    if (score >= 60) return { color: '#D97706', bg: '#FFFBEB' }
    if (score >= 40) return { color: '#2563EB', bg: '#EFF6FF' }
    return { color: '#DC2626', bg: '#FEF2F2' }
  }

  const initials = (name) => (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Counts per status
  const counts = {
    all: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    interview: applications.filter(a => a.status === 'interview').length,
    offer: applications.filter(a => a.status === 'offer').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }

  // Filter
  const filteredApps = applications.filter(app => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      app.profiles?.full_name?.toLowerCase().includes(q) ||
      app.profiles?.university?.toLowerCase().includes(q) ||
      app.profiles?.course?.toLowerCase().includes(q) ||
      app.profiles?.email?.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || app.status === statusFilter
    return matchSearch && matchStatus
  })

  async function handleRankCandidates() {
    setRanking(true)
    setRankError('')
    setRankedResults(null)
    try {
      const { data, error } = await supabase.functions.invoke('rank-candidates', { body: { job_id: jobId } })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      const sorted = [...(data.ranked || [])].sort((a, b) => b.score - a.score)
      setRankedResults({ ...data, ranked: sorted })
    } catch (err) {
      setRankError(err.message || 'Something went wrong ranking candidates.')
    } finally {
      setRanking(false)
    }
  }

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'applied', label: 'Applied' },
    { id: 'interview', label: 'Interview' },
    { id: 'offer', label: 'Offer' },
    { id: 'rejected', label: 'Rejected' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-up space-y-5">
      {/* Back link */}
      <button
        onClick={() => navigate('/employer/applicants')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft size={14} /> All Applicants
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">
            {job?.title || 'Applicants'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {job?.company ? `${job.company} · ` : ''}
            {applications.length} applicant{applications.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search applicants..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
          <CheckCircle2 size={15} /> {toast}
        </div>
      )}

      {/* AI ranking bar */}
      {!loading && applications.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-purple-600 flex-shrink-0"><Sparkles size={16} /></span>
            <span className="text-xs text-slate-600">Let AI score and rank these candidates against the job description.</span>
          </div>
          <button
            onClick={handleRankCandidates}
            disabled={ranking}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-sm transition whitespace-nowrap"
          >
            {ranking ? (
              <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Ranking…</>
            ) : (
              <><Sparkles size={14} /> Rank with AI</>
            )}
          </button>
        </div>
      )}

      {rankError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          Couldn't rank candidates: {rankError}
        </div>
      )}

      {/* Ranked results */}
      {rankedResults && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setRankedResults(null)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700"
            >
              <ArrowLeft size={13} /> Back to applicant list
            </button>
            <span className="text-xs text-slate-500">
              AI ranking · {rankedResults.ranked.length} candidate{rankedResults.ranked.length !== 1 ? 's' : ''}, best match first
            </span>
          </div>

          {rankedResults.ranked.map((r, i) => {
            const sc = scoreColor(r.score)
            const b = badgeStyle(r.status)
            const BIcon = b.Icon
            return (
              <div key={r.application_id} className="flex items-center gap-3.5 bg-white border border-slate-200 rounded-2xl p-4">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-black flex-shrink-0">
                  {i + 1}
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {initials(r.profile?.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">{r.profile?.full_name || 'Unknown'}</span>
                    {r.profile?.verified && <VerifiedBadge size={14} />}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {r.profile?.university || 'No university listed'}
                    {r.profile?.course ? ` · ${r.profile.course}` : ''}
                  </div>
                  {r.reasoning && (
                    <div className="text-xs text-slate-500 mt-1.5 leading-relaxed">{r.reasoning}</div>
                  )}
                </div>
                <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${b.bg} ${b.text} ${b.border}`}>
                  <BIcon size={11} /> {labelFor(r.status)}
                </span>
                <div
                  className="min-w-[52px] text-center px-3 py-2 rounded-xl text-base font-black flex-shrink-0"
                  style={{ background: sc.bg, color: sc.color }}
                >
                  {r.score}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Normal list */}
      {!rankedResults && (
        <>
          {/* Filter tabs */}
          {!loading && applications.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setStatusFilter(t.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    statusFilter === t.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {t.label} ({counts[t.id]})
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin" />
              <span className="text-sm text-slate-500 font-medium">Loading applicants...</span>
            </div>
          )}

          {!loading && filteredApps.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <Users size={28} className="text-slate-400" />
              </div>
              <p className="text-base font-bold text-slate-800">No applicants found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {search || statusFilter !== 'all' ? 'Try a different search or filter.' : 'No one has applied to this job yet.'}
              </p>
            </div>
          )}

          {!loading && filteredApps.length > 0 && (
            <div className="space-y-3">
              {filteredApps.map(app => {
                const b = badgeStyle(app.status)
                const BIcon = b.Icon
                const isUpdating = updating === app.id
                const profile = app.profiles

                return (
                  <div key={app.id} className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 sm:p-5 transition">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Left: applicant info */}
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700 flex items-center justify-center text-sm font-black flex-shrink-0">
                          {initials(profile?.full_name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-sm font-bold text-slate-900 truncate">
                              {profile?.full_name || 'Unknown'}
                            </h3>
                            {app.isFullyVerified && <VerifiedBadge size={14} />}
                            {profile?.verified && !app.isFullyVerified && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                                ✓ Verified
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1">
                              <Mail size={11} /> {profile?.email || 'No email'}
                            </span>
                            {profile?.university && (
                              <>
                                <span className="text-slate-300">·</span>
                                <span className="inline-flex items-center gap-1">
                                  <MapPin size={11} /> {profile.university}
                                </span>
                              </>
                            )}
                          </div>
                          {profile?.course && (
                            <div className="text-xs text-slate-500 mt-0.5">
                              <Briefcase size={11} className="inline mr-1" /> {profile.course}
                              {profile.graduation_year && ` · Graduating ${profile.graduation_year}`}
                            </div>
                          )}
                          <div className="text-[11px] text-slate-400 mt-1">
                            Applied {formatDate(app.created_at)}
                          </div>
                        </div>
                      </div>

                      {/* Right: status + actions */}
                      <div className="flex flex-col items-stretch sm:items-end gap-3 sm:min-w-[340px]">
                        {/* Status pill + profile button */}
                        <div className="flex items-center gap-2 justify-between sm:justify-end">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${b.bg} ${b.text} ${b.border}`}>
                            <BIcon size={11} /> {labelFor(app.status)}
                          </span>

                          <button
                            onClick={() => setSelectedApp(app)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                          >
                            <User size={11} /> Profile
                          </button>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                          {app.status !== 'interview' && (
                            <button
                              onClick={() => updateStatus(app, 'interview')}
                              disabled={isUpdating}
                              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 transition disabled:opacity-50"
                              title="Mark as Interview"
                            >
                              Shortlist
                            </button>
                          )}
                          {app.status !== 'offer' && (
                            <button
                              onClick={() => updateStatus(app, 'offer')}
                              disabled={isUpdating}
                              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
                              title="Make Offer"
                            >
                              Make Offer
                            </button>
                          )}
                          {app.status !== 'rejected' && (
                            <button
                              onClick={() => updateStatus(app, 'rejected')}
                              disabled={isUpdating}
                              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-red-50 text-red-700 hover:bg-red-100 transition disabled:opacity-50"
                              title="Reject applicant"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/employer/schedule/${app.id}`)}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition inline-flex items-center gap-1"
                            title="Schedule interview"
                          >
                            <CalendarClock size={11} /> Schedule
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Profile modal */}
      {selectedApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-up"
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="text-sm font-bold text-slate-900">Applicant Profile</div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700 flex items-center justify-center text-xl font-black flex-shrink-0">
                  {initials(selectedApp.profiles?.full_name)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-black text-slate-900 truncate">
                      {selectedApp.profiles?.full_name || 'Unknown'}
                    </h3>
                    {selectedApp.isFullyVerified && <VerifiedBadge size={16} />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{selectedApp.profiles?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'University', value: selectedApp.profiles?.university },
                  { label: 'Course', value: selectedApp.profiles?.course },
                  { label: 'Graduation Year', value: selectedApp.profiles?.graduation_year },
                  { label: 'Applied On', value: formatDate(selectedApp.created_at) },
                ].map((f, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{f.label}</div>
                    <div className="text-sm font-semibold text-slate-800 mt-1">{f.value || 'Not provided'}</div>
                  </div>
                ))}
              </div>

              {selectedApp.profiles?.bio && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Bio</h4>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {selectedApp.profiles.bio}
                  </p>
                </div>
              )}

              {selectedApp.profiles?.skills && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedApp.profiles.skills.split(',').filter(s => s.trim()).map((s, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
                >
                  Close
                </button>
                <div className="flex gap-2">
                  {selectedApp.status !== 'offer' && (
                    <button
                      onClick={() => { updateStatus(selectedApp, 'offer'); setSelectedApp(null); }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition"
                    >
                      Make Offer
                    </button>
                  )}
                  <button
                    onClick={() => { setSelectedApp(null); navigate(`/employer/schedule/${selectedApp.id}`); }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition inline-flex items-center gap-1.5"
                  >
                    <CalendarClock size={13} /> Schedule Interview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}