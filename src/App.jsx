import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'

import StudentDashboard from './pages/StudentDashboard'
import EmployerDashboard from './pages/EmployerDashboard'
import PostJob from './pages/PostJob'
import BrowseJobs from './pages/BrowseJobs'
import StudentProfile from './pages/StudentProfile'
import ViewApplicants from './pages/ViewApplicants'
import Analytics from './pages/Analytics'
import ScheduleInterview from './pages/ScheduleInterview'
import CoordinatorDashboard from './pages/CoordinatorDashboard'
import DocumentUpload from './pages/DocumentUpload'
import AdminDashboard from './pages/AdminDashboard'
import ResumeBuilder from './pages/ResumeBuilder'

import AllApplicants from './pages/AllApplicants'

// Layouts
import StudentLayout from './components/StudentLayout'
import EmployerLayout from './components/EmployerLayout'

function App() {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchRole = async (userId) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle()

        if (!mounted) return

        if (error) {
          console.error('Error fetching role:', error)
          setRole(null)
          setLoading(false)
          return
        }

        if (!data) {
          console.error('No profile found for user:', userId)
          setRole(null)
          setLoading(false)
          return
        }

        setRole(data.role)
        setLoading(false)
      } catch (error) {
        console.error('Unexpected error:', error)
        setRole(null)
        setLoading(false)
      }
    }

    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(session)
      if (!session) {
        setRole(null)
        setLoading(false)
        return
      }
      setLoading(true)
      await fetchRole(session.user.id)
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return
      setSession(newSession)
      if (!newSession) {
        setRole(null)
        setLoading(false)
        return
      }
      setRole(null)
      setLoading(true)
      setTimeout(() => {
        if (mounted) fetchRole(newSession.user.id)
      }, 0)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '12px',
          padding: '40px',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif',
          color: '#94A3B8',
          background: '#F8FAFC',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            border: '4px solid #E2E8F0',
            borderTop: '4px solid #6366F1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <div>Loading your account...</div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const getDashboardPath = () => {
    switch (role) {
      case 'student': return '/student'
      case 'employer': return '/employer'
      case 'coordinator': return '/coordinator'
      case 'admin': return '/admin'
      default: return '/login'
    }
  }

  return (
    <Routes>
      <Route path="/" element={!session ? <Landing /> : <Navigate to={getDashboardPath()} replace />} />
      <Route path="/login" element={!session ? <Login /> : <Navigate to={getDashboardPath()} replace />} />
      <Route path="/signup" element={!session ? <Signup /> : <Navigate to={getDashboardPath()} replace />} />
      
      <Route path="/student" element={session && role === 'student' ? <StudentLayout /> : <Navigate to={getDashboardPath()} replace />}>
        <Route index element={<StudentDashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="browse-jobs" element={<BrowseJobs />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="resume-builder" element={<ResumeBuilder />} />
        <Route path="documents" element={<DocumentUpload />} />
      </Route>

      <Route path="/employer" element={session && role === 'employer' ? <EmployerLayout /> : <Navigate to={getDashboardPath()} replace />}>
        <Route index element={<EmployerDashboard />} />
        <Route path="post-job" element={<PostJob />} />
        <Route path="browse-jobs" element={<BrowseJobs />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="listings" element={<AllApplicants />} />
        <Route path="applicants" element={<AllApplicants />} />
        <Route path="applicants/:jobId" element={<ViewApplicants />} />
        <Route path="schedule/:applicationId" element={<ScheduleInterview />} />
      </Route>

      <Route path="/coordinator" element={session && role === 'coordinator' ? <CoordinatorDashboard /> : <Navigate to={getDashboardPath()} replace />} />
      <Route path="/admin" element={session && role === 'admin' ? <AdminDashboard /> : <Navigate to={getDashboardPath()} replace />} />
      
      <Route path="/analytics" element={session && role === 'student' ? <Navigate to="/student/analytics" replace /> : <Navigate to={getDashboardPath()} replace />} />
      <Route path="/browse-jobs" element={session && role === 'student' ? <Navigate to="/student/browse-jobs" replace /> : <Navigate to={getDashboardPath()} replace />} />
      <Route path="/student-profile" element={session && role === 'student' ? <Navigate to="/student/profile" replace /> : <Navigate to={getDashboardPath()} replace />} />
      <Route path="/resume-builder" element={session && role === 'student' ? <Navigate to="/student/resume-builder" replace /> : <Navigate to={getDashboardPath()} replace />} />
      <Route path="/documents" element={session && role === 'student' ? <Navigate to="/student/documents" replace /> : <Navigate to={getDashboardPath()} replace />} />
      
      <Route path="*" element={<Navigate to={session ? getDashboardPath() : '/'} replace />} />
    </Routes>
  )
}

export default App