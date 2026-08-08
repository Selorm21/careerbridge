import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

// Pages - Updated imports to point to the pages folder
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

// Layout - Updated to point to components folder
import StudentLayout from './components/StudentLayout'

function App() {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return

      setSession(session)

      if (session) {
        fetchRole(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for authentication changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return

      setSession(session)

      if (session) {
        fetchRole(session.user.id)
      } else {
        setRole(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function fetchRole(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        setRole(null)
      } else {
        setRole(data?.role || null)
      }
    } catch (error) {
      console.error('Unexpected error fetching role:', error)
      setRole(null)
    } finally {
      setLoading(false)
    }
  }

  // Loading screen
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif',
          color: '#94A3B8',
          background: '#F8FAFC',
        }}
      >
        Loading...
      </div>
    )
  }

  return (
    <Routes>
      {/* =====================================================
          PUBLIC ROUTES
      ====================================================== */}

      <Route
        path="/"
        element={
          !session ? (
            <Landing />
          ) : role === 'student' ? (
            <Navigate to="/student" replace />
          ) : role === 'employer' ? (
            <Navigate to="/employer" replace />
          ) : role === 'coordinator' ? (
            <Navigate to="/coordinator" replace />
          ) : role === 'admin' ? (
            <Navigate to="/admin" replace />
          ) : (
            <Landing />
          )
        }
      />

      <Route
        path="/login"
        element={
          !session ? (
            <Login />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/signup"
        element={
          !session ? (
            <Signup />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* =====================================================
          STUDENT APPLICATION
          
          StudentLayout is the parent.

          This means:
          
          StudentLayout
              ├── StudentDashboard
              ├── Analytics
              ├── BrowseJobs
              ├── StudentProfile
              ├── ResumeBuilder
              └── Documents

          The SAME sidebar remains visible while switching
          between these pages.
      ====================================================== */}

      <Route
        path="/student"
        element={
          session && role === 'student' ? (
            <StudentLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<StudentDashboard />} />

        <Route
          path="analytics"
          element={<Analytics />}
        />

        <Route
          path="browse-jobs"
          element={<BrowseJobs />}
        />

        <Route
          path="profile"
          element={<StudentProfile />}
        />

        <Route
          path="resume-builder"
          element={<ResumeBuilder />}
        />

        <Route
          path="documents"
          element={<DocumentUpload />}
        />
      </Route>

      {/* =====================================================
          EMPLOYER ROUTES
      ====================================================== */}

      <Route
        path="/employer"
        element={
          session && role === 'employer' ? (
            <EmployerDashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/post-job"
        element={
          session && role === 'employer' ? (
            <PostJob />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/applicants/:jobId"
        element={
          session && role === 'employer' ? (
            <ViewApplicants />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/schedule/:applicationId"
        element={
          session && role === 'employer' ? (
            <ScheduleInterview />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* =====================================================
          COORDINATOR
      ====================================================== */}

      <Route
        path="/coordinator"
        element={
          session && role === 'coordinator' ? (
            <CoordinatorDashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* =====================================================
          ADMIN
      ====================================================== */}

      <Route
        path="/admin"
        element={
          session && role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* =====================================================
          OLD / DIRECT ROUTES
          
          These redirect to the new student layout routes.
      ====================================================== */}

      <Route
        path="/analytics"
        element={
          session && role === 'student' ? (
            <Navigate to="/student/analytics" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/browse-jobs"
        element={
          session && role === 'student' ? (
            <Navigate to="/student/browse-jobs" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/student-profile"
        element={
          session && role === 'student' ? (
            <Navigate to="/student/profile" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/resume-builder"
        element={
          session && role === 'student' ? (
            <Navigate to="/student/resume-builder" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/documents"
        element={
          session && role === 'student' ? (
            <Navigate to="/student/documents" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* =====================================================
          FALLBACK
      ====================================================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  )
}

export default App