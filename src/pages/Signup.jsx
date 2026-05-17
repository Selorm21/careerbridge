import { useState } from 'react'
import { supabase } from '../supabase'
import { Link } from 'react-router-dom'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: null
      }
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        email: email,
        role: role
      })

      if (profileError) {
        setError('Account created but profile failed: ' + profileError.message)
        setLoading(false)
        return
      }

      setSuccess('Account created! You can now log in.')
    }

    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>CareerBridge</h1>
        <h2 style={styles.title}>Create your account</h2>
        <p style={styles.sub}>Join CareerBridge today</p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.successBox}>{success} <Link to="/login" style={styles.link}>Log in now</Link></div>}

        <form onSubmit={handleSignup}>
          <div style={styles.field}>
            <label style={styles.label}>Full name</label>
            <input style={styles.input} type="text" placeholder="Your full name" value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>I am a</label>
            <select style={styles.input} value={role} onChange={e => setRole(e.target.value)}>
              <option value="student">Student / Job seeker</option>
              <option value="employer">Employer / Company</option>
            </select>
          </div>
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Log in</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' },
  card: { background: '#fff', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  logo: { fontSize: '22px', fontWeight: '700', color: '#185FA5', marginBottom: '8px' },
  title: { fontSize: '20px', fontWeight: '600', marginBottom: '4px' },
  sub: { color: '#888', fontSize: '14px', marginBottom: '24px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '11px', background: '#185FA5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginTop: '8px' },
  error: { background: '#fef2f2', color: '#dc2626', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  successBox: { background: '#f0fdf4', color: '#16a34a', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  footer: { textAlign: 'center', fontSize: '13px', color: '#888', marginTop: '20px' },
  link: { color: '#185FA5', textDecoration: 'none', fontWeight: '500' }
}