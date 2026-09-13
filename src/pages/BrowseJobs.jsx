// src/pages/BrowseJobs.jsx
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowUpDown, Image as ImageIcon, CheckCircle2 } from 'lucide-react'
import JobCard from '../components/JobCard'
import JobDetailModal from '../components/JobDetailModal'
import { parseJobDescription } from '../lib/jobsStore'

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [onlyWithImages, setOnlyWithImages] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [appliedJobs, setAppliedJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()

     const { data: jobsData } = await supabase
  .from('jobs')
  .select('*, employer:profiles(verified, full_name, company_name)')
  .order('created_at', { ascending: false })
      if (!mounted) return

      // Parse the packed description to extract image/salary
      const enriched = (jobsData || []).map((j) => {
        const parsed = parseJobDescription(j.description)
        return {
          ...j,
          description: parsed.description || j.description,
          image_attachment: parsed.imageAttachment,
          salary: parsed.salary || null,
        }
      })
      setJobs(enriched)

      if (user) {
        const { data: appsData } = await supabase
          .from('applications')
          .select('job_id')
          .eq('student_id', user.id)
        if (mounted) setAppliedJobs((appsData || []).map((a) => a.job_id))
      }

      setLoading(false)
    })()
    return () => { mounted = false }
  }, [])

  async function handleApply(jobId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Snapshot the job for possible optimistic UI
    const job = jobs.find((j) => j.id === jobId)

    const { error } = await supabase.from('applications').insert({
      job_id: jobId,
      student_id: user.id,
      status: 'applied',
    })

    if (error) {
      alert('Could not submit application: ' + error.message)
      return
    }

    setAppliedJobs((prev) => [...prev, jobId])
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return jobs
      .filter((job) => {
        const matchSearch =
          !q ||
          job.title?.toLowerCase().includes(q) ||
          job.company?.toLowerCase().includes(q) ||
          job.location?.toLowerCase().includes(q) ||
          job.skills?.toLowerCase().includes(q)

        const matchFilter =
          filter === 'All' ||
          (filter === 'Remote'
            ? job.location?.toLowerCase().includes('remote')
            : job.type?.toLowerCase().includes(filter.toLowerCase()))

        const matchImage = !onlyWithImages || !!job.image_attachment

        return matchSearch && matchFilter && matchImage
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0)
        if (sortBy === 'oldest') return new Date(a.created_at || 0) - new Date(b.created_at || 0)
        if (sortBy === 'company') return (a.company || '').localeCompare(b.company || '')
        return 0
      })
  }, [jobs, search, filter, onlyWithImages, sortBy])

  return (
    <div style={S.app}>
      <style>{`
        .bj-main { max-width: 1280px; margin: 0 auto; padding: 32px 32px 60px; width: 100%; }
        .bj-search-row { display: flex; gap: 12px; align-items: center; }
        .bj-search-wrap {
          flex: 1; display: flex; align-items: center; gap: 10px;
          background: #fff; border: 1.5px solid #E2E8F0; border-radius: 14px;
          padding: 0 16px; min-height: 48px;
          transition: border-color .2s ease, box-shadow .2s ease;
        }
        .bj-search-wrap:focus-within { border-color: #EA4E1B; box-shadow: 0 0 0 3px rgba(234,78,27,.1); }
        .bj-search-input {
          flex: 1; border: none; outline: none; padding: 12px 0;
          font-size: 16px; font-family: inherit; background: transparent;
          color: #0F172A; min-width: 0;
        }
        .bj-sort {
          padding: 12px 16px; border: 1.5px solid #E2E8F0; border-radius: 14px;
          font-size: 13px; font-weight: 700; background: #fff;
          cursor: pointer; min-height: 48px; font-family: inherit;
          color: #334155; white-space: nowrap;
        }
        .bj-pill {
          padding: 8px 16px; border-radius: 10px;
          font-size: 12.5px; font-weight: 700; cursor: pointer;
          background: #F1F5F9; color: #64748B; border: none;
          transition: all .2s ease; min-height: 36px;
        }
        .bj-pill:hover { background: #E2E8F0; color: #0F172A; }
        .bj-pill.active { background: #EA4E1B; color: #fff; box-shadow: 0 2px 8px rgba(234,78,27,.25); }
        .bj-flyer-toggle {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 10px;
          font-size: 12px; font-weight: 700; cursor: pointer;
          border: 1.5px solid #E2E8F0; background: #F8FAFC; color: #64748B;
          transition: all .2s ease; min-height: 36px;
        }
        .bj-flyer-toggle.active {
          background: #FFF1EA; color: #C2410C; border-color: #FED7AA;
        }
        .bj-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }

        @media (max-width: 768px) {
          .bj-main { padding: 20px 16px 40px; }
          .bj-search-row { flex-direction: column; align-items: stretch; }
          .bj-sort { width: 100%; }
          .bj-grid { grid-template-columns: 1fr; gap: 18px; }
        }
      `}</style>

      <div className="bj-main">
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={S.heading}>Browse Jobs</h1>
          <p style={S.headSub}>
            {jobs.length} opportunities · AI-matched to your skills · Listings with flyers stand out
          </p>
        </div>

        {/* Search + Sort */}
        <div className="bj-search-row" style={{ marginBottom: 16 }}>
          <div className="bj-search-wrap">
            <Search size={18} color="#94A3B8" />
            <input
              className="bj-search-input"
              type="text"
              placeholder="Search roles, companies, skills, or locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="bj-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="company">Sort: Company A-Z</option>
          </select>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20, alignItems: 'center' }}>
          {['All', 'Full-time', 'Internship', 'Part-time', 'Contract', 'Remote'].map((t) => (
            <button
              key={t}
              className={`bj-pill ${filter === t ? 'active' : ''}`}
              onClick={() => setFilter(t)}
            >
              {t}
            </button>
          ))}

          <div style={{ flex: 1 }} />

          <button
            className={`bj-flyer-toggle ${onlyWithImages ? 'active' : ''}`}
            onClick={() => setOnlyWithImages((v) => !v)}
            type="button"
          >
            <ImageIcon size={14} />
            <span>Flyer attached</span>
            {onlyWithImages && <CheckCircle2 size={14} />}
          </button>
        </div>

        {/* Results count */}
        <div style={S.resultsLabel}>
          {loading ? 'Loading...' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
          {filter !== 'All' && ` · ${filter}`}
          {onlyWithImages && ` · with flyer`}
        </div>

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div style={S.empty}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
            <div style={S.emptyTitle}>No jobs match your criteria</div>
            <div style={S.emptySub}>Try a different search, or clear the flyer filter.</div>
          </div>
        )}

        {/* Grid */}
        {filtered.length > 0 && (
          <div className="bj-grid">
            {filtered.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onOpenDetails={(j) => setSelectedJob(j)}
                onQuickApply={(j) => handleApply(j.id)}
                isApplied={appliedJobs.includes(job.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={handleApply}
          isApplied={appliedJobs.includes(selectedJob.id)}
        />
      )}
    </div>
  )
}

const S = {
  app: { minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Inter', -apple-system, sans-serif" },
  heading: { fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, color: '#0F172A', marginBottom: 8, letterSpacing: '-1px' },
  headSub: { fontSize: 'clamp(13px, 1.4vw, 15px)', color: '#64748B', lineHeight: 1.5 },
  resultsLabel: { fontSize: 13, color: '#64748B', fontWeight: 600, marginBottom: 20 },
  empty: { textAlign: 'center', padding: '60px 20px', color: '#64748B' },
  emptyTitle: { fontSize: 18, fontWeight: 700, color: '#334155', marginBottom: 6 },
  emptySub: { fontSize: 14, color: '#64748B' },
}