// src/components/EmployerLayout.jsx
import { Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import DashboardShell from './DashboardShell'

// -------- Icon set --------
const Icon = ({ path, size = 18, strokeWidth = 1.8 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {path}
  </svg>
)

const icons = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20c0-3.3 3-6 6.5-6s6.5 2.7 6.5 6" />
      <path d="M16 8.2a3 3 0 1 1 3.6 3" />
      <path d="M21.5 20c0-2.6-1.8-4.8-4.3-5.6" />
    </>
  ),
  analytics: (
    <>
      <path d="M5 20V10" />
      <path d="M12 20V4" />
      <path d="M19 20v-7" />
    </>
  ),
}

export default function EmployerLayout() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    let mounted = true
    async function getProfile() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) return

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!error && mounted) {
          setProfile({ ...data, email: data?.email || user.email })
        }
      } catch (err) {
        console.error('EmployerLayout profile fetch error:', err)
      }
    }
    getProfile()
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
    { path: '/employer', label: 'Overview', icon: <Icon path={icons.grid} size={18} />, exact: true },
    { path: '/employer/post-job', label: 'Post a Job', icon: <Icon path={icons.plus} size={18} /> },
    { path: '/employer/my-jobs', label: 'My Job Listings', icon: <Icon path={icons.briefcase} size={18} /> },
    { path: '/employer/applicants', label: 'View Applicants', icon: <Icon path={icons.users} size={18} /> },
    { path: '/employer/analytics', label: 'Analytics', icon: <Icon path={icons.analytics} size={18} /> },
  ]

  return (
    <DashboardShell
      brandLabel="EMPLOYER"
      accent="#F59E0B"
      navItems={navItems}
      profile={{
        full_name: profile?.full_name || 'Employer',
        role_label: 'Employer account',
      }}
      onLogout={handleLogout}
      logoMark={<Icon path={icons.grid} size={19} strokeWidth={2} />}
    >
      <Outlet />
    </DashboardShell>
  )
}