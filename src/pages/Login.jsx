// src/pages/Login.jsx
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Rocket } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const cardRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect()
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        })
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  async function handleForgotPassword() {
    if (!email) { setError('Enter your email above first, then click "Forgot password?"'); return }
    setError(''); setSuccess('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) setError(error.message)
    else setSuccess('Password reset email sent! Check your inbox.')
  }

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={styles.page} className="login-page">
      <style>{`
        @keyframes loginFadeUp { from { opacity:0; transform:translateY(30px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes loginFloat1 { 0%,100% { transform: translate(0,0) rotate(0deg); } 33% { transform: translate(40px,-40px) rotate(120deg); } 66% { transform: translate(-20px,20px) rotate(240deg); } }
        @keyframes loginFloat2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-50px,30px) scale(1.1); } }
        @keyframes loginScrollRight { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes loginScrollLeft { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }

        .login-card-anim { animation: loginFadeUp .7s cubic-bezier(.16,1,.3,1) forwards; }
        .login-shape-1 { animation: loginFloat1 20s ease-in-out infinite; }
        .login-shape-2 { animation: loginFloat2 25s ease-in-out infinite; }
        .login-shape-3 { animation: loginFloat1 18s ease-in-out infinite; }

        .login-input {
          transition: all .2s ease;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.15);
          font-size: 16px; /* prevents iOS zoom */
        }
        .login-input:focus {
          outline: none;
          border-color: #6366F1;
          background: rgba(255,255,255,0.1);
          box-shadow: 0 0 0 4px rgba(99,102,241,0.15);
        }

        .login-btn {
          transition: transform .25s ease, box-shadow .25s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .login-btn:hover:not(:disabled) { transform: translateY(-2px) scale(1.01); box-shadow: 0 12px 30px rgba(99,102,241,.4); }
        .login-btn:active { transform: scale(.98); }

        .login-social {
          transition: transform .2s ease, background .2s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .login-social:hover { transform: translateY(-2px); background: rgba(255,255,255,0.1); }

        @media (max-width: 768px) {
          .login-scroll-text { display: none !important; }
          .login-shapes { display: none !important; }
          .login-card-anim { padding: 32px 22px !important; }
          .login-back-btn { position: absolute !important; top: 16px !important; left: 16px !important; }
        }
      `}</style>

      {/* Back button — inline on mobile, fixed on desktop */}
      <Link to="/" style={styles.backButton} className="login-back-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
        </svg>
        <span>Back</span>
      </Link>

      {/* Background */}
      <div style={styles.bgContainer}>
        <div style={styles.bgGradient} />
        <div style={styles.vignette} />

        <div className="login-shapes">
          <div style={{ ...styles.shape, ...styles.shape1 }} className="login-shape-1" />
          <div style={{ ...styles.shape, ...styles.shape2 }} className="login-shape-2" />
          <div style={{ ...styles.shape, ...styles.shape3 }} className="login-shape-3" />
        </div>

        <div className="login-scroll-text" style={styles.textScroller}>
          <div style={styles.textRow1}>
            <span>CareerBridge • Launch Your Future • </span>
            <span>CareerBridge • Launch Your Future • </span>
          </div>
          <div style={styles.textRow2}>
            <span>AI Matched • Real-time Analytics • </span>
            <span>AI Matched • Real-time Analytics • </span>
          </div>
        </div>

        <div style={styles.glowSpot} />
      </div>

      {/* Card */}
      <div
        ref={cardRef}
        className="login-card-anim"
        style={{
          ...styles.loginCard,
          background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.08), transparent 40%), rgba(15, 23, 42, 0.65)`,
        }}
      >
        <div style={styles.cardGlowBorder} />

        <div style={styles.cardLogoContainer}>
          <div style={styles.logoIconSmall}><Rocket size={18} color="#fff" /></div>
          <span style={styles.cardLogoText}>CareerBridge</span>
        </div>

        <div style={styles.cardHeader}>
          <h2 style={styles.title}>Sign in</h2>
          <p style={styles.sub}>Enter your credentials to access your account.</p>
        </div>

        {error && <div style={styles.errorBanner}><span style={styles.errorIcon}>!</span> {error}</div>}
        {success && <div style={styles.successBanner}>✅ {success}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} color="#94A3B8" />
              <input className="login-input" style={styles.input} type="email" placeholder="you@university.edu"
                value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
          </div>

          <div style={styles.field}>
            <div style={styles.labelRow}>
              <label style={styles.label}>Password</label>
              <button type="button" style={styles.forgotLink} onClick={handleForgotPassword}>Forgot password?</button>
            </div>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} color="#94A3B8" />
              <input className="login-input" style={{ ...styles.input, paddingRight: 44 }} type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)}
                required autoComplete="current-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
              </button>
            </div>
          </div>

          <label style={styles.checkboxLabel}>
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={styles.checkbox} />
            Remember me
          </label>

          <button className="login-btn" style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Authenticating...' : <>Sign in <ArrowRight size={18} /></>}
          </button>
        </form>

        <div style={styles.orRow}>
          <div style={styles.rule} /><div style={styles.orText}>OR CONTINUE WITH</div><div style={styles.rule} />
        </div>

        <div style={styles.socialRow}>
          <button className="login-social" type="button" style={styles.social}>
            <GoogleIcon /> Google
          </button>
          <button className="login-social" type="button" style={styles.social}>
            <LinkedInIcon /> LinkedIn
          </button>
        </div>

        <p style={styles.footer}>
          New to CareerBridge? <Link to="/signup" style={styles.link}>Create an account</Link>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M23.52 12.29c0-.85-.08-1.68-.23-2.48H12v4.7h6.46c-.28 1.5-1.12 2.77-2.41 3.62v3h3.9c2.28-2.1 3.57-5.19 3.57-8.84z" fill="#4285F4"/>
      <path d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.9-3c-1.08.72-2.46 1.15-4.05 1.15-3.11 0-5.74-2.1-6.68-4.93H1.3v3.1C3.34 21.46 7.38 24 12 24z" fill="#34A853"/>
      <path d="M5.32 14.32c-.25-.74-.39-1.53-.39-2.32 0-.8.14-1.58.39-2.32V6.58H1.3C.47 8.24 0 10.07 0 12c0 1.93.47 3.76 1.3 5.42l4.02-3.1z" fill="#FBBC05"/>
      <path d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.43-3.44C17.96 1.15 15.24 0 12 0 7.38 0 3.34 2.54 1.3 6.58l4.02 3.1c.94-2.83 3.57-4.93 6.68-4.93z" fill="#EA4335"/>
    </svg>
  )
}
function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2"/>
    </svg>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    background: '#050B14',
    padding: 16,
  },
  backButton: {
    position: 'fixed',
    top: 24, left: 24,
    zIndex: 50,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 18px',
    minHeight: 44,
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 50,
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
  },

  bgContainer: { position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', background: '#050B14' },
  bgGradient: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(30,58,138,.4) 0%, rgba(15,23,42,.6) 40%, #050B14 100%)' },
  vignette: { position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,.7) 100%)' },
  glowSpot: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(99,102,241,.15), transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' },
  textScroller: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 60, overflow: 'hidden', opacity: .12, zIndex: 1, pointerEvents: 'none' },
  textRow1: { display: 'flex', whiteSpace: 'nowrap', fontSize: 100, fontWeight: 900, color: '#FFFFFF', letterSpacing: -4, animation: 'loginScrollRight 30s linear infinite' },
  textRow2: { display: 'flex', whiteSpace: 'nowrap', fontSize: 80, fontWeight: 800, color: '#818CF8', letterSpacing: -3, animation: 'loginScrollLeft 35s linear infinite' },

  shape: { position: 'absolute', borderRadius: '50%', filter: 'blur(2px)', pointerEvents: 'none', zIndex: 1 },
  shape1: { top: '10%', left: '10%', width: 280, height: 280, background: 'linear-gradient(135deg, rgba(99,102,241,.15), rgba(139,92,246,.05))', borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' },
  shape2: { bottom: '20%', right: '15%', width: 340, height: 340, background: 'linear-gradient(135deg, rgba(16,185,129,.1), rgba(6,182,212,.05))', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
  shape3: { top: '40%', right: '30%', width: 180, height: 180, background: 'linear-gradient(135deg, rgba(245,158,11,.1), rgba(251,191,36,.05))', borderRadius: '50%' },

  loginCard: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: 420,
    padding: '40px 32px',
    borderRadius: 24,
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
    overflow: 'hidden',
  },
  cardGlowBorder: {
    position: 'absolute', inset: 0, borderRadius: 24, padding: 1,
    background: 'linear-gradient(135deg, rgba(99,102,241,.3), transparent 40%, rgba(139,92,246,.1))',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor', maskComposite: 'exclude', pointerEvents: 'none',
  },
  cardLogoContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 },
  logoIconSmall: { width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,.3)' },
  cardLogoText: { fontSize: 18, fontWeight: 800, color: '#FFFFFF', letterSpacing: -0.5 },
  cardHeader: { marginBottom: 24, textAlign: 'center' },
  title: { fontSize: 24, fontWeight: 800, color: '#FFFFFF', margin: '0 0 4px 0', letterSpacing: -0.5 },
  sub: { color: '#94A3B8', fontSize: 14, margin: 0, lineHeight: 1.5 },

  errorBanner: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)', color: '#FCA5A5', padding: '10px 14px', borderRadius: 12, fontSize: 13, fontWeight: 500, marginBottom: 20 },
  errorIcon: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 },
  successBanner: { background: 'rgba(16,185,129,.15)', color: '#6EE7B7', padding: '10px 14px', borderRadius: 12, fontSize: 13, fontWeight: 500, marginBottom: 20, border: '1px solid rgba(16,185,129,.2)' },

  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#CBD5E1' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  forgotLink: { fontSize: 13, color: '#818CF8', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', padding: 0, minHeight: 'auto' },

  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  input: { width: '100%', padding: '12px 12px 12px 42px', borderRadius: 12, color: '#F1F5F9', fontFamily: 'inherit', boxSizing: 'border-box' },
  eyeBtn: { position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'auto', minWidth: 'auto' },

  checkboxLabel: { fontSize: 13, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, cursor: 'pointer' },
  checkbox: { width: 16, height: 16, accentColor: '#6366F1', cursor: 'pointer' },

  btn: { width: '100%', padding: 13, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#FFFFFF', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4, boxShadow: '0 4px 16px rgba(99,102,241,.4)', fontFamily: 'inherit', minHeight: 48 },

  orRow: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 24, marginBottom: 16 },
  rule: { height: 1, background: 'rgba(255,255,255,0.1)', flex: 1 },
  orText: { fontSize: 11, color: '#64748B', fontWeight: 700, letterSpacing: '0.05em', whiteSpace: 'nowrap' },
  socialRow: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  social: { flex: '1 1 120px', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.05)', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#E2E8F0', fontFamily: 'inherit', minHeight: 44 },

  footer: { textAlign: 'center', fontSize: 14, color: '#94A3B8', marginTop: 24 },
  link: { color: '#818CF8', textDecoration: 'none', fontWeight: 700 },
}