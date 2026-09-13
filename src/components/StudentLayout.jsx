// src/components/StudentLayout.jsx
import { Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import {
  LayoutGrid, Search, Sparkles, FileText, CalendarClock,
  UserCircle, Briefcase, Rocket
} from 'lucide-react'
import DashboardShell from './DashboardShell'
import { profileStore } from '../lib/profileStore'
import { jobsStore } from '../lib/jobsStore'

export default function StudentLayout() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    let mounted = true

    async function hydrateStores() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return

        // ---- 1. Load profile from Supabase ----
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileRow && mounted) {
          setProfile({ ...profileRow, email: profileRow.email || user.email })

          // Build the skills array from the comma-separated field
          const skillsArray = (profileRow.skills || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)

          // ---- 2. Feed profileStore ----
          profileStore.saveProfile({
            full_name: profileRow.full_name || 'Student',
            email: profileRow.email || user.email || '',
            headline: profileRow.headline || profileRow.course || '',
            bio: profileRow.bio || '',
            university: profileRow.university || '',
            degree: profileRow.degree || '',
            major: profileRow.course || '',
            graduation_year: profileRow.graduation_year || '',
            gpa: profileRow.gpa || profileRow.index_number || '',
            location: profileRow.location || '',
            phone: profileRow.phone || '',
            avatar: profileRow.avatar || undefined,
            skills: skillsArray,
          })

          // ---- 3. Feed jobsStore.candidateSkills (used by JobCard + modal) ----
          jobsStore.candidateSkills = skillsArray.join(', ')
        }

        // ---- 4. Load student's documents so the resume vault knows what's there ----
        const { data: docsRows } = await supabase
          .from('documents')
          .select('*')
          .eq('student_id', user.id)

        if (docsRows && mounted) {
          const mappedDocs = docsRows.map((d) => ({
            id: d.id,
            title: `${d.doc_type || 'document'}.pdf`,
            type: d.doc_type === 'transcript' ? 'transcript'
              : d.doc_type === 'national_id' ? 'certificate'
              : d.doc_type === 'recommendation' ? 'cover_letter'
              : 'resume',
            size: '—',
            uploadedAt: d.uploaded_at ? d.uploaded_at.split('T')[0] : '',
            isPrimary: false,
            category: d.doc_type || 'Document',
            url: d.file_url || '',
            status: d.status || 'pending',
          }))
          // Save silently — this replaces the local list with the real one
          profileStore.saveDocuments(mappedDocs)
        }

        // ---- 5. Load this student's applications into jobsStore (for pages that read it) ----
        const { data: appsRows } = await supabase
          .from('applications')
          .select('*, jobs(*)')
          .eq('student_id', user.id)

        if (appsRows && mounted) {
          jobsStore.applications = appsRows.map((a) => ({
            id: a.id,
            jobId: a.job_id,
            jobTitle: a.jobs?.title || 'Unknown',
            company: a.jobs?.company || 'Unknown',
            location: a.jobs?.location || '',
            type: a.jobs?.type || '',
            appliedAt: a.created_at,
            status: a.status || 'applied',
          }))
          jobsStore.saveApplications()
        }
      } catch (err) {
        console.error('StudentLayout hydration error:', err)
      }
    }

    hydrateStores()
    return () => { mounted = false }
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      navigate('/')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const navItems = [
    { path: '/student', label: 'Overview', icon: <LayoutGrid size={18} />, exact: true },
    { path: '/student/browse-jobs', label: 'Browse Jobs', icon: <Search size={18} /> },
    { path: '/student/my-applications', label: 'My Applications', icon: <Briefcase size={18} /> },
    { path: '/student/analytics', label: 'Analytics', icon: <Sparkles size={18} /> },
    { path: '/student/resume-builder', label: 'Resume', icon: <FileText size={18} /> },
    { path: '/student/documents', label: 'Documents', icon: <CalendarClock size={18} /> },
    { path: '/student/profile', label: 'Profile', icon: <UserCircle size={18} /> },
  ]

  return (
    <DashboardShell
      brandLabel="STUDENT"
      accent="#6366F1"
      navItems={navItems}
      profile={{
        full_name: profile?.full_name || 'Student',
        role_label: 'Student account',
      }}
      onLogout={handleLogout}
      logoMark={<Rocket size={18} color="#fff" />}
    >
      <Outlet />
    </DashboardShell>
  )
}