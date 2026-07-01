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

    const { data, error: signupError } = await supabase.auth.signUp({ email, password })
    if (signupError) { setError(signupError.message); setLoading(false); return }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id, full_name: fullName, email, role
      })
      if (profileError) { setError('Account created but profile failed: ' + profileError.message); setLoading(false); return }
      setSuccess('Account created! You can now log in.')
    }
    setLoading(false)
  }

  return (
    <div style={S.page}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        .blobA{animation:float 8s ease-in-out infinite}
        .blobB{animation:float 10s ease-in-out infinite reverse}
        .cardIn{animation:fadeUp .6s cubic-bezier(.16,1,.3,1) forwards}
        .inputF{transition:border-color .2s ease, box-shadow .2s ease}
        .inputF:focus{outline:none;border-color:#2563EB!important;box-shadow:0 0 0 3px rgba(37,99,235,0.12)}
        .btnP{transition:all .2s ease}
        .btnP:hover{transform:translateY(-2px);box-shadow:0 10px 22px rgba(37,99,235,0.3)!important}
        .linkBack{transition:opacity .2s ease}
        .linkBack:hover{opacity:.7}
        .roleCard{transition:all .2s ease;cursor:pointer}
      `}</style>
      <div className="blobA" style={S.blob1}></div>
      <div className="blobB" style={S.blob2}></div>

      <Link to="/" className="linkBack" style={S.backLink}>← CareerBridge</Link>

      <div className="cardIn" style={S.card}>
        <h1 style={S.logo}>CareerBridge</h1>
        <h2 style={S.title}>Create your account</h2>
        <p style={S.sub}>Join CareerBridge today</p>

        {error && <div style={S.error}>{error}</div>}
        {success && <div style={S.successBox}>{success} <Link to="/login" style={S.link}>Log in now</Link></div>}

        <form onSubmit={handleSignup}>
          <div style={S.field}>
            <label style={S.label}>Full name</label>
            <input className="inputF" style={S.input} type="text" placeholder="Your full name" value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
          <div style={S.field}>
            <label style={S.label}>Email</label>
            <input className="inputF" style={S.input} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div style={S.field}>
            <label style={S.label}>Password</label>
            <input className="inputF" style={S.input} type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div style={S.field}>
            <label style={S.label}>I am a</label>
            <div style={S.roleRow}>
              <div className="roleCard" style={{...S.roleCard, ...(role === 'student' ? S.roleCardActive : {})}} onClick={() => setRole('student')}>
                <div style={S.roleIcon}>🎓</div>
                <div style={S.roleLabel}>Student</div>
              </div>
              <div className="roleCard" style={{...S.roleCard, ...(role === 'employer' ? S.roleCardActive : {})}} onClick={() => setRole('employer')}>
                <div style={S.roleIcon}>🏢</div>
                <div style={S.roleLabel}>Employer</div>
              </div>
            </div>
          </div>
          <button className="btnP" style={S.btn} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={S.footer}>Already have an account? <Link to="/login" style={S.link}>Log in</Link></p>
      </div>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', position: 'relative', overflow: 'hidden', fontFamily: "'Inter', sans-serif", padding: '20px' },
  blob1: { position: 'absolute', top: '-100px', right: '-100px', width: '340px', height: '340px', borderRadius: '50%', background: 'radial-gradient(circle, #DBEAFE 0%, transparent 70%)' },
  blob2: { position: 'absolute', bottom: '-120px', left: '-100px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, #D1FAE5 0%, transparent 70%)' },
  backLink: { position: 'absolute', top: '28px', left: '40px', fontSize: '14px', fontWeight: '700', color: '#2563EB', textDecoration: 'none', zIndex: 2 },
  card: { background: '#fff', padding: '40px 40px', borderRadius: '20px', width: '100%', maxWidth: '440px', boxShadow: '0 24px 60px -12px rgba(15,23,42,0.15)', position: 'relative', zIndex: 1 },
  logo: { fontSize: '22px', fontWeight: '800', color: '#2563EB', marginBottom: '10px', letterSpacing: '-0.5px' },
  title: { fontSize: '22px', fontWeight: '800', marginBottom: '5px', color: '#0F172A' },
  sub: { color: '#94A3B8', fontSize: '14px', marginBottom: '24px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '7px', color: '#374151' },
  input: { width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' },
  roleRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  roleCard: { border: '1.5px solid #E5E7EB', borderRadius: '12px', padding: '16px', textAlign: 'center' },
  roleCardActive: { border: '1.5px solid #2563EB', background: '#EFF6FF' },
  roleIcon: { fontSize: '24px', marginBottom: '6px' },
  roleLabel: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  btn: { width: '100%', padding: '13px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14.5px', fontWeight: '700', cursor: 'pointer', marginTop: '8px', boxShadow: '0 6px 16px rgba(37,99,235,0.25)' },
  error: { background: '#FEF2F2', color: '#DC2626', padding: '11px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '18px', fontWeight: '500' },
  successBox: { background: '#ECFDF5', color: '#059669', padding: '11px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '18px', fontWeight: '500' },
  footer: { textAlign: 'center', fontSize: '13.5px', color: '#94A3B8', marginTop: '22px' },
  link: { color: '#2563EB', textDecoration: 'none', fontWeight: '700' }
}