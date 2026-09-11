// src/pages/Signup.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Link, useLocation } from 'react-router-dom'
import { Rocket, Mail, Lock, User, ArrowRight } from 'lucide-react'

export default function Signup() {
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('admin') === 'true') setShowAdmin(true)
  }, [location])

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    const { data, error: signupError } = await supabase.auth.signUp({ email, password })
    if (signupError) { setError(signupError.message); setLoading(false); return }
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({ id: data.user.id, full_name: fullName, email, role })
      if (profileError) { setError('Account created but profile failed: ' + profileError.message); setLoading(false); return }
      setSuccess('Account created! You can now log in.')
    }
    setLoading(false)
  }

  const roles = [
    { value: 'student', icon: '🎓', label: 'Student' },
    { value: 'employer', icon: '🏢', label: 'Employer' },
    { value: 'coordinator', icon: '📚', label: 'Coordinator' },
  ]

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes suFadeUp { from { opacity:0; transform:translateY(30px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes suFloat1 { 0%,100% { transform: translate(0,0) rotate(0); } 33% { transform: translate(40px,-40px) rotate(120deg); } 66% { transform: translate(-20px,20px) rotate(240deg); } }
        @keyframes suFloat2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-50px,30px) scale(1.1); } }
        @keyframes suScrollRight { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes suScrollLeft { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }

        .su-card-anim { animation: suFadeUp .7s cubic-bezier(.16,1,.3,1) forwards; }
        .su-shape-1 { animation: suFloat1 20s ease-in-out infinite; }
        .su-shape-2 { animation: suFloat2 25s ease-in-out infinite; }
        .su-shape-3 { animation: suFloat1 18s ease-in-out infinite; }

        .su-input { transition: all .2s ease; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.15); font-size: 16px; }
        .su-input:focus { outline: none; border-color: #10B981; background: rgba(255,255,255,.1); box-shadow: 0 0 0 4px rgba(16,185,129,.15); }

        .su-btn { transition: transform .25s ease, box-shadow .25s ease; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .su-btn:hover:not(:disabled) { transform: translateY(-2px) scale(1.01); box-shadow: 0 12px 30px rgba(16,185,129,.4); }
        .su-btn:active { transform: scale(.98); }

        .su-role { transition: all .2s ease; cursor: pointer; }
        .su-role:hover { background: rgba(255,255,255,.08); transform: translateY(-2px); }

        @media (max-width: 768px) {
          .su-scroll-text { display: none !important; }
          .su-shapes { display: none !important; }
          .su-card-anim { padding: 32px 22px !important; }
        }
      `}</style>

      <Link to="/" style={styles.backButton}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
        </svg>
        <span>Back</span>
      </Link>

      <div style={styles.bgContainer}>
        <div style={styles.bgGradient} />
        <div style={styles.vignette} />

        <div className="su-shapes">
          <div style={{ ...styles.shape, ...styles.shape1 }} className="su-shape-1" />
          <div style={{ ...styles.shape, ...styles.shape2 }} className="su-shape-2" />
          <div style={{ ...styles.shape, ...styles.shape3 }} className="su-shape-3" />
        </div>

        <div className="su-scroll-text" style={styles.textScroller}>
          <div style={styles.textRow1}>
            <span>Welcome to the Family • Start Your Journey • </span>
            <span>Welcome to the Family • Start Your Journey • </span>
          </div>
          <div style={styles.textRow2}>
            <span>Shape Your Future • New Opportunities • </span>
            <span>Shape Your Future • New Opportunities • </span>
          </div>
        </div>

        <div style={styles.glowSpot} />
      </div>

      <div className="su-card-anim" style={styles.signupCard}>
        <div style={styles.cardGlowBorder} />

        <div style={styles.cardLogoContainer}>
          <div style={styles.logoIconSmall}><Rocket size={18} color="#fff" /></div>
          <span style={styles.cardLogoText}>CareerBridge</span>
        </div>

        <div style={styles.cardHeader}>
          <h2 style={styles.title}>Start your journey</h2>
          <p style={styles.sub}>Join thousands of students and employers shaping the future.</p>
        </div>

        {error && <div style={styles.errorBanner}><span style={styles.errorIcon}>!</span> {error}</div>}
        {success && <div style={styles.successBanner}>✅ {success} <Link to="/login" style={styles.successLink}>Log in now</Link></div>}

        <form onSubmit={handleSignup} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full name</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} color="#94A3B8" />
              <input className="su-input" style={styles.input} type="text" placeholder="Your full name"
                value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} color="#94A3B8" />
              <input className="su-input" style={styles.input} type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} color="#94A3B8" />
              <input className="su-input" style={styles.input} type="password" placeholder="Min. 6 characters"
                value={password} onChange={e => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>I am a...</label>
            <div style={styles.roleRow}>
              {roles.map(r => (
                <button type="button" key={r.value}
                  className="su-role"
                  style={{ ...styles.roleCard, ...(role === r.value ? styles.roleCardActive : {}) }}
                  onClick={() => setRole(r.value)}>
                  <div style={styles.roleIcon}>{r.icon}</div>
                  <div style={styles.roleLabel}>{r.label}</div>
                </button>
              ))}
              {showAdmin && (
                <button type="button" className="su-role"
                  style={{ ...styles.roleCard, ...(role === 'admin' ? styles.roleCardActive : {}) }}
                  onClick={() => setRole('admin')}>
                  <div style={styles.roleIcon}>⚙️</div>
                  <div style={styles.roleLabel}>Admin</div>
                </button>
              )}
            </div>
          </div>

          <button className="su-btn" style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : <>Create account <ArrowRight size={18} /></>}
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
  page: {
    minHeight: '100vh',
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    background: '#05100A',
    padding: 16,
  },
  backButton: {
    position: 'fixed', top: 24, left: 24, zIndex: 50,
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '10px 18px', minHeight: 44,
    background: 'rgba(16,185,129,.1)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(16,185,129,.2)', borderRadius: 50,
    color: '#E2E8F0', fontSize: 13, fontWeight: 600, textDecoration: 'none',
  },

  bgContainer: { position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', background: '#05100A' },
  bgGradient: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,.3) 0%, rgba(6,78,59,.5) 40%, #05100A 100%)' },
  vignette: { position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,.7) 100%)' },
  glowSpot: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(16,185,129,.15), transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' },
  textScroller: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 60, overflow: 'hidden', opacity: .1, zIndex: 1, pointerEvents: 'none' },
  textRow1: { display: 'flex', whiteSpace: 'nowrap', fontSize: 100, fontWeight: 900, color: '#FFFFFF', letterSpacing: -4, animation: 'suScrollRight 30s linear infinite' },
  textRow2: { display: 'flex', whiteSpace: 'nowrap', fontSize: 80, fontWeight: 800, color: '#6EE7B7', letterSpacing: -3, animation: 'suScrollLeft 35s linear infinite' },

  shape: { position: 'absolute', borderRadius: '50%', filter: 'blur(2px)', pointerEvents: 'none', zIndex: 1 },
  shape1: { top: '10%', left: '10%', width: 280, height: 280, background: 'linear-gradient(135deg, rgba(16,185,129,.15), rgba(52,211,153,.05))', borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' },
  shape2: { bottom: '20%', right: '15%', width: 340, height: 340, background: 'linear-gradient(135deg, rgba(6,182,212,.15), rgba(16,185,129,.05))', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
  shape3: { top: '40%', right: '30%', width: 180, height: 180, background: 'linear-gradient(135deg, rgba(251,191,36,.1), rgba(16,185,129,.05))', borderRadius: '50%' },

  signupCard: {
    position: 'relative', zIndex: 10, width: '100%', maxWidth: 520,
    padding: '40px 32px', borderRadius: 24,
    background: 'rgba(5,16,10,.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(16,185,129,.15)', boxShadow: '0 30px 80px rgba(0,0,0,.6)',
    overflow: 'hidden',
  },
  cardGlowBorder: {
    position: 'absolute', inset: 0, borderRadius: 24, padding: 1,
    background: 'linear-gradient(135deg, rgba(16,185,129,.4), transparent 40%, rgba(52,211,153,.1))',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor', maskComposite: 'exclude', pointerEvents: 'none',
  },
  cardLogoContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 },
  logoIconSmall: { width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#10B981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16,185,129,.3)' },
  cardLogoText: { fontSize: 18, fontWeight: 800, color: '#FFFFFF', letterSpacing: -0.5 },
  cardHeader: { marginBottom: 24, textAlign: 'center' },
  title: { fontSize: 24, fontWeight: 800, color: '#FFFFFF', margin: '0 0 4px 0', letterSpacing: -0.5 },
  sub: { color: '#94A3B8', fontSize: 14, margin: 0, lineHeight: 1.5 },

  errorBanner: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)', color: '#FCA5A5', padding: '10px 14px', borderRadius: 12, fontSize: 13, fontWeight: 500, marginBottom: 20 },
  errorIcon: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 },
  successBanner: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', background: 'rgba(16,185,129,.15)', color: '#6EE7B7', padding: '10px 14px', borderRadius: 12, fontSize: 13, fontWeight: 500, marginBottom: 20, border: '1px solid rgba(16,185,129,.2)' },
  successLink: { color: '#FCD34D', textDecoration: 'underline', fontWeight: 700 },

  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#CBD5E1' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  input: { width: '100%', padding: '12px 12px 12px 42px', borderRadius: 12, color: '#F1F5F9', fontFamily: 'inherit', boxSizing: 'border-box' },

  roleRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 },
  roleCard: { borderRadius: 12, padding: '16px 8px', textAlign: 'center', border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.03)', minHeight: 80 },
  roleCardActive: { border: '1px solid #10B981', background: 'rgba(16,185,129,.15)' },
  roleIcon: { fontSize: 22, marginBottom: 4 },
  roleLabel: { fontSize: 11, fontWeight: 600, color: '#E2E8F0', lineHeight: 1.2 },

  btn: { width: '100%', padding: 13, background: 'linear-gradient(135deg,#10B981,#059669)', color: '#FFFFFF', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4, boxShadow: '0 4px 16px rgba(16,185,129,.4)', fontFamily: 'inherit', minHeight: 48 },

  footer: { textAlign: 'center', fontSize: 14, color: '#94A3B8', marginTop: 24 },
  link: { color: '#6EE7B7', textDecoration: 'none', fontWeight: 700 },
}