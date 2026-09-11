// src/components/StudentLayout.jsx
import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import {
  LayoutGrid, Search, Sparkles, FileText, CalendarClock,
  UserCircle, Briefcase, Rocket
} from 'lucide-react'
import DashboardShell from './DashboardShell'

export default function StudentLayout() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    let mounted = true
    async function fetchProfile() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) return
        const { data } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single()
        if (mounted && data) {
          setProfile({ ...data, email: data.email || user.email })
        }
      } catch (err) {
        console.error('StudentLayout profile fetch error:', err)
      }
    }
    fetchProfile()
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