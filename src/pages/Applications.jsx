// src/pages/Applications.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import {
  BookmarkCheck, Building2, MapPin, CheckCircle2,
  Clock, ArrowRight, XCircle, CalendarCheck, ShieldCheck,
} from 'lucide-react'
import { parseJobDescription } from '../lib/jobsStore'

export default function Applications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data, error } = await supabase
        .from('applications')
        .select('*, jobs(*, employer:profiles(verified, full_name, company_name))')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })

      if (!mounted) return

      if (error) {
        console.error('Error fetching applications:', error)
        setLoading(false)
        return
      }

      const enriched = (data || []).map((app) => {
        let imageAttachment = null
        let salary = null
        if (app.jobs?.description) {
          const parsed = parseJobDescription(app.jobs.description)
          imageAttachment = parsed.imageAttachment
          salary = parsed.salary
        }
        return {
          ...app,
          image_attachment: imageAttachment,
          salary,
          employer_verified: app.jobs?.employer?.verified === true,
        }
      })

      setApplications(enriched)
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [])

  const getStatusStyle = (status) => {
    if (status === 'interview')
      return { bg: '#FEF3C7', color: '#D97706', label: 'Interview', icon: CalendarCheck }
    if (status === 'offer')
      return { bg: '#D1FAE5', color: '#059669', label: 'Offer Received', icon: CheckCircle2 }
    if (status === 'rejected')
      return { bg: '#FEE2E2', color: '#DC2626', label: 'Not Selected', icon: XCircle }
    return { bg: '#EFF6FF', color: '#2563EB', label: 'Application Received', icon: CheckCircle2 }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Recently'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto animate-fade-up">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Applications</h1>
        <p className="text-sm text-slate-500 mt-1.5">
          Track the status of your submitted applications in real time.
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading your applications...</p>
        </div>
      )}

      {!loading && applications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-200">
          <BookmarkCheck size={48} className="text-slate-300 mb-4" />
          <h3 className="text-base font-bold text-slate-800">No applications submitted yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5 max-w-sm">
            Explore curated opportunities and apply with your profile skills.
          </p>
          <button
            onClick={() => navigate('/student/browse-jobs')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition shadow-brand active:scale-95"
          >
            Browse Available Jobs <ArrowRight size={16} />
          </button>
        </div>
      )}

      {!loading && applications.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-subtle">
          {applications.map((app) => {
            const status = getStatusStyle(app.status)
            const StatusIcon = status.icon
            const job = app.jobs

            return (
              <div
                key={app.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 sm:p-6 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition"
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {app.image_attachment?.url ? (
                    <img
                      src={app.image_attachment.url}
                      alt={job?.title || 'Job flyer'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 size={22} className="text-slate-400" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {job?.title || 'Unknown Position'}
                    </h3>
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
                      style={{ background: status.bg, color: status.color }}
                    >
                      <StatusIcon size={11} />
                      {status.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-700 inline-flex items-center gap-1">
                      {job?.company || 'Unknown Company'}
                      {app.employer_verified && (
                        <span title="Verified Employer" className="inline-flex">
                          <ShieldCheck size={13} className="text-emerald-600 fill-emerald-50" />
                        </span>
                      )}
                    </span>
                    {job?.location && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={11} className="text-slate-400" />
                          {job.location}
                        </span>
                      </>
                    )}
                    {app.salary && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-emerald-700 font-bold">{app.salary}</span>
                      </>
                    )}
                  </p>

                  <p className="text-[11px] text-slate-400 mt-1.5 inline-flex items-center gap-1">
                    <Clock size={11} />
                    Submitted {formatDate(app.created_at)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}