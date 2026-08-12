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

    // -------------------------------------------------------
    // FETCH USER ROLE
    // -------------------------------------------------------
    const fetchRole = async (userId) => {
      console.log('🔎 Fetching role for user:', userId)

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle()

        if (!mounted) return

        if (error) {
          console.error('❌ Error fetching role:', error)

          setRole(null)
          setLoading(false)

          return
        }

        if (!data) {
          console.error('❌ No profile found for user:', userId)

          setRole(null)
          setLoading(false)

          return
        }

        console.log('✅ Role from database:', data.role)

        setRole(data.role)
        setLoading(false)

      } catch (error) {
        if (!mounted) return

        console.error('❌ Unexpected role error:', error)

        setRole(null)
        setLoading(false)
      }
    }


    // -------------------------------------------------------
    // INITIAL SESSION
    // -------------------------------------------------------
    const initializeAuth = async () => {
      console.log('🔐 Checking initial session...')

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!mounted) return

      console.log(
        '🔐 Initial session:',
        session?.user?.email || 'No session'
      )

      setSession(session)

      if (!session) {
        setRole(null)
        setLoading(false)
        return
      }

      // Keep loading until role is known
      setLoading(true)

      await fetchRole(session.user.id)
    }


    initializeAuth()


    // -------------------------------------------------------
    // AUTH STATE CHANGES
    // -------------------------------------------------------
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return

      console.log('🔄 Auth event:', event)

      setSession(newSession)

      if (!newSession) {
        console.log('🚪 User logged out')

        setRole(null)
        setLoading(false)

        return
      }

      // New login/user
      console.log(
        '👤 Authenticated user:',
        newSession.user.email
      )

      // IMPORTANT:
      // Clear old role before fetching new user's role.
      setRole(null)
      setLoading(true)

      // Run role lookup outside the auth callback.
      setTimeout(() => {
        if (mounted) {
          fetchRole(newSession.user.id)
        }
      }, 0)
    })


    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])


  // -------------------------------------------------------
  // DEBUG STATE
  // -------------------------------------------------------
  console.log('🧭 App state:', {
    email: session?.user?.email,
    session: !!session,
    role,
    loading,
  })


  // -------------------------------------------------------
  // LOADING SCREEN
  // -------------------------------------------------------
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

        <div>
          Loading your account...
        </div>

        <style>
          {`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    )
  }


  // -------------------------------------------------------
  // ROOT REDIRECT
  // -------------------------------------------------------
  const getDashboardPath = () => {
    switch (role) {
      case 'student':
        return '/student'

      case 'employer':
        return '/employer'

      case 'coordinator':
        return '/coordinator'

      case 'admin':
        return '/admin'

      default:
        return '/login'
    }
  }


  return (
    <Routes>

      {/* =====================================================
          PUBLIC
      ===================================================== */}

      <Route
        path="/"
        element={
          !session
            ? <Landing />
            : <Navigate to={getDashboardPath()} replace />
        }
      />

      <Route
        path="/login"
        element={
          !session
            ? <Login />
            : <Navigate to={getDashboardPath()} replace />
        }
      />

      <Route
        path="/signup"
        element={
          !session
            ? <Signup />
            : <Navigate to={getDashboardPath()} replace />
        }
      />


      {/* =====================================================
          STUDENT
      ===================================================== */}

      <Route
        path="/student"
        element={
          session && role === 'student'
            ? <StudentLayout />
            : <Navigate to={getDashboardPath()} replace />
        }
      >
        <Route
          index
          element={<StudentDashboard />}
        />

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
          EMPLOYER
      ===================================================== */}

      <Route
        path="/employer"
        element={
          session && role === 'employer'
            ? <EmployerLayout />
            : <Navigate to={getDashboardPath()} replace />
        }
      >
        <Route
          index
          element={<EmployerDashboard />}
        />

        <Route
          path="post-job"
          element={<PostJob />}
        />

        <Route
          path="browse-jobs"
          element={<BrowseJobs />}
        />

        <Route
          path="analytics"
          element={<Analytics />}
        />

        <Route
          path="listings"
          element={<AllApplicants />}
        />

        <Route
          path="applicants"
          element={<AllApplicants />}
        />

        <Route
          path="applicants/:jobId"
          element={<ViewApplicants />}
        />

        <Route
          path="schedule/:applicationId"
          element={<ScheduleInterview />}
        />
      </Route>


      {/* =====================================================
          COORDINATOR
      ===================================================== */}

      <Route
        path="/coordinator"
        element={
          session && role === 'coordinator'
            ? <CoordinatorDashboard />
            : <Navigate to={getDashboardPath()} replace />
        }
      />


      {/* =====================================================
          ADMIN
      ===================================================== */}

      <Route
        path="/admin"
        element={
          session && role === 'admin'
            ? <AdminDashboard />
            : <Navigate to={getDashboardPath()} replace />
        }
      />


      {/* =====================================================
          OLD STUDENT URLS
      ===================================================== */}

      <Route
        path="/analytics"
        element={
          session && role === 'student'
            ? <Navigate to="/student/analytics" replace />
            : <Navigate to={getDashboardPath()} replace />
        }
      />

      <Route
        path="/browse-jobs"
        element={
          session && role === 'student'
            ? <Navigate to="/student/browse-jobs" replace />
            : <Navigate to={getDashboardPath()} replace />
        }
      />

      <Route
        path="/student-profile"
        element={
          session && role === 'student'
            ? <Navigate to="/student/profile" replace />
            : <Navigate to={getDashboardPath()} replace />
        }
      />

      <Route
        path="/resume-builder"
        element={
          session && role === 'student'
            ? <Navigate to="/student/resume-builder" replace />
            : <Navigate to={getDashboardPath()} replace />
        }
      />

      <Route
        path="/documents"
        element={
          session && role === 'student'
            ? <Navigate to="/student/documents" replace />
            : <Navigate to={getDashboardPath()} replace />
        }
      />


      {/* =====================================================
          404
      ===================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to={session ? getDashboardPath() : '/'}
            replace
          />
        }
      />

    </Routes>
  )
}

export default App