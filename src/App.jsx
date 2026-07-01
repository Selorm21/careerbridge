import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import StudentDashboard from './pages/StudentDashboard'
import EmployerDashboard from './pages/EmployerDashboard'
import PostJob from './pages/PostJob'
import BrowseJobs from './pages/BrowseJobs'
import StudentProfile from './pages/StudentProfile'
import ViewApplicants from './pages/ViewApplicants'

function App() {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchRole(session.user.id)
      else setLoading(false)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchRole(session.user.id)
      else { setRole(null); setLoading(false) }
    })
  }, [])

  async function fetchRole(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    setRole(data?.role)
    setLoading(false)
  }

  if (loading) return <div style={{padding:'40px',textAlign:'center'}}>Loading...</div>

  return (
    <Routes>
      <Route path="/" element={session ? (role === 'employer' ? <Navigate to="/employer" /> : <Navigate to="/student" />) : <Landing />} />
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
      <Route path="/signup" element={!session ? <Signup /> : <Navigate to="/" />} />
      <Route path="/student" element={session && role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />} />
      <Route path="/employer" element={session && role === 'employer' ? <EmployerDashboard /> : <Navigate to="/login" />} />
      <Route path="/post-job" element={session && role === 'employer' ? <PostJob /> : <Navigate to="/login" />} />
      <Route path="/browse-jobs" element={session ? <BrowseJobs /> : <Navigate to="/login" />} />
      <Route path="/student-profile" element={session && role === 'student' ? <StudentProfile /> : <Navigate to="/login" />} />
      <Route path="/applicants/:jobId" element={session && role === 'employer' ? <ViewApplicants /> : <Navigate to="/login" />} />
    </Routes>
  )
}

export default App