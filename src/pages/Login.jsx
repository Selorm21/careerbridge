import { useState } from 'react'
import { supabase } from '../supabase'
import { Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleForgotPassword() {
    if (!email) {
      setError('Enter your email above first, then click "Forgot password?"')
      return
    }

    setError('')
    setSuccess('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Password reset email sent! Check your inbox.')
    }
  }

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    }

    setLoading(false)
  }

  function handleSocialSign(provider) {
    // Example: supabase.auth.signInWithOAuth({ provider: 'google' })
    // implement as needed
    alert('Social sign in: ' + provider)
  }

  return (
    <div style={S.page}>
      <style>{`
        @keyframes fadeUp {
          from {opacity:0;transform:translateY(20px)}
          to {opacity:1;transform:translateY(0)}
        }
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        .blobA{animation:float 8s ease-in-out infinite}
        .blobB{animation:float 10s ease-in-out infinite reverse}
        .cardIn{animation:fadeUp .6s cubic-bezier(.16,1,.3,1) forwards}
        .inputF{transition:border-color .2s ease, box-shadow .2s ease}
        .inputF:focus{outline:none;border-color:#2563EB!important;box-shadow:0 0 0 3px rgba(37,99,235,0.12)}
        .btnP{transition:all .2s ease}
        .btnP:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 22px rgba(0,0,0,0.12)!important}
        .btnSocial:hover{transform:translateY(-2px)}
        .linkBack{transition:opacity .2s ease}
        .linkBack:hover{opacity:.7}
        .forgotLink:hover{text-decoration:underline}
      `}</style>

      <div className="blobA" style={S.blob1}></div>
      <div className="blobB" style={S.blob2}></div>

      <Link to="/" className="linkBack" style={S.backLink}>
        <span style={S.backIcon}>🎓</span> CareerBridge
      </Link>

      <div className="cardIn" style={S.card}>
        <h1 style={S.logo}>CareerBridge</h1>

        <h2 style={S.title}>Welcome back</h2>
        <p style={S.sub}>Log in to your CareerBridge account to continue.</p>

        {error && <div style={S.error}>{error}</div>}
        {success && <div style={S.successBox}>{success}</div>}

        <form onSubmit={handleLogin}>
          <div style={S.field}>
            <label style={S.label}>Email address</label>
            <input
              className="inputF"
              style={S.input}
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={S.field}>
            <div style={S.labelRow}>
              <label style={S.label}>Password</label>
              <span
                className="forgotLink"
                style={S.forgotLink}
                onClick={handleForgotPassword}
              >
                Forgot password?
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                className="inputF"
                style={{ ...S.input, paddingRight: '44px' }}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={S.eyeBtn}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div style={S.row}>
            <label style={S.checkboxLabel}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />{' '}
              Remember me for 30 days
            </label>
          </div>

          <button
            className="btnP"
            style={S.btn}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : '↪ Log in'}
          </button>
        </form>

        <div style={S.orRow}>
          <div style={S.rule}></div>
          <div style={S.orText}>OR CONTINUE WITH</div>
          <div style={S.rule}></div>
        </div>

        <div style={S.socialRow}>
          <button className="btnSocial" onClick={() => handleSocialSign('google')} style={S.socialBtn}>Google</button>
          <button className="btnSocial" onClick={() => handleSocialSign('linkedin')} style={S.socialBtn}>LinkedIn</button>
        </div>

        <p style={S.footer}>
          New to CareerBridge? <Link to="/signup" style={S.link}>Create an account</Link>
        </p>
      </div>
    </div>
  )
}

const S = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F8FAFC',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
  },
  blob1: { position: 'absolute', top: '-100px', right: '-100px', width: '340px', height: '340px', borderRadius: '50%', background: 'radial-gradient(circle, #DBEAFE 0%, transparent 70%)' },
  blob2: { position: 'absolute', bottom: '-120px', left: '-100px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, #D1FAE5 0%, transparent 70%)' },
  backLink: { position: 'absolute', top: '28px', left: '40px', fontSize: '14px', fontWeight: '700', color: '#0F172A', textDecoration: 'none', zIndex: 2, display: 'flex', alignItems: 'center', gap: '8px' },
  backIcon: { display: 'inline-block', background: '#0F172A', color: '#fff', padding: '6px 8px', borderRadius: '8px', fontSize: '13px' },
  card: { background: '#fff', padding: '44px 40px', borderRadius: '14px', width: '100%', maxWidth: '420px', boxShadow: '0 24px 60px -12px rgba(15,23,42,0.12)', position: 'relative', zIndex: 1 },
  logo: { fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '10px', letterSpacing: '-0.5px' },
  title: { fontSize: '20px', fontWeight: '800', marginBottom: '6px', color: '#0F172A' },
  sub: { color: '#94A3B8', fontSize: '14px', marginBottom: '20px' },
  field: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#374151' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  forgotLink: { fontSize: '13px', color: '#2563EB', fontWeight: '600', cursor: 'pointer' },
  input: { width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' },
  eyeBtn: { position: 'absolute', right: '8px', top: '6px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '18px' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  checkboxLabel: { fontSize: '13px', color: '#6B7280' },
  btn: { width: '100%', padding: '13px', background: '#0F172A', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14.5px', fontWeight: '700', cursor: 'pointer', marginTop: '8px', boxShadow: '0 6px 16px rgba(0,0,0,0.12)' },
  error: { background: '#FEF2F2', color: '#DC2626', padding: '11px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '18px', fontWeight: '500' },
  successBox: { background: '#ECFDF5', color: '#059669', padding: '11px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '18px', fontWeight: '500' },
  orRow: { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '18px', marginBottom: '12px' },
  rule: { height: '1px', background: '#E5E7EB', flex: 1 },
  orText: { fontSize: '12px', color: '#94A3B8', fontWeight: '600' },
  socialRow: { display: 'flex', gap: '10px' },
  socialBtn: { flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontWeight: '600' },
  footer: { textAlign: 'center', fontSize: '13.5px', color: '#94A3B8', marginTop: '18px' },
  link: { color: '#2563EB', textDecoration: 'none', fontWeight: '700' },
}
