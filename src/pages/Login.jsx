import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { Link } from 'react-router-dom' // 🟢 Removed useNavigate
import { Mail, Lock, Eye, EyeOff, ArrowRight, Rocket } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const cardRef = useRef(null)

  // Dynamic subtle spotlight over the card
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
    } else {
      // ✅ FIXED: Removed navigate('/student'). App.jsx handles the routing now!
      console.log('✅ Login successful. App.jsx will now route you based on your role.')
    }
    setLoading(false)
  }

  function handleSocialSign(provider) {
    alert(`Connecting with ${provider}...`)
  }

  return (
    <div style={styles.page}>
      
      {/* 🏠 FLOATING BACK BUTTON */}
      <Link to="/" style={styles.backButton}>
        <span style={styles.backIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </span>
        Back
      </Link>

      {/* 🎨 ANIMATED CINEMATIC BACKGROUND */}
      <div style={styles.bgContainer}>
        <div style={styles.bgGradient}></div>
        <div style={styles.vignette}></div>
        
        <div style={{...styles.shape, ...styles.shape1}} className="animShape"></div>
        <div style={{...styles.shape, ...styles.shape2}} className="animShape"></div>
        <div style={{...styles.shape, ...styles.shape3}} className="animShape"></div>
        
        <div className="textScroller" style={styles.textScroller}>
          <div style={styles.textRow1}>
            <span>CareerBridge • Launch Your Future • </span>
            <span>CareerBridge • Launch Your Future • </span>
            <span>CareerBridge • Launch Your Future • </span>
            <span>CareerBridge • Launch Your Future • </span>
          </div>
          <div style={styles.textRow2}>
            <span>AI Matched • Real-time Analytics • </span>
            <span>AI Matched • Real-time Analytics • </span>
            <span>AI Matched • Real-time Analytics • </span>
            <span>AI Matched • Real-time Analytics • </span>
          </div>
        </div>
        
        <div style={styles.glowSpot}></div>
      </div>

      {/* 🃏 FLOATING LOGIN CARD */}
      <div 
        ref={cardRef}
        className="cardIn"
        style={{
          ...styles.loginCard,
          // ✅ FIXED: Combined background and backgroundColor into one string
          background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.08), transparent 40%), rgba(15, 23, 42, 0.65)`
        }}
      >
        <div style={styles.cardGlowBorder}></div>
        
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
              <input className="inputF" style={styles.input} type="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div style={styles.field}>
            <div style={styles.labelRow}>
              <label style={styles.label}>Password</label>
              <span className="forgotLink" style={styles.forgotLink} onClick={handleForgotPassword}>Forgot password?</span>
            </div>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} color="#94A3B8" />
              <input className="inputF" style={{ ...styles.input, paddingRight: '44px' }} type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                {showPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
              </button>
            </div>
          </div>

          <div style={styles.row}>
            <label style={styles.checkboxLabel}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={styles.checkbox} />
              Remember me
            </label>
          </div>

          <button className="btnP" style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign in'} 
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={styles.orRow}>
          <div style={styles.rule}></div>
          <div style={styles.orText}>OR CONTINUE WITH</div>
          <div style={styles.rule}></div>
        </div>

        <div style={styles.socialRow}>
          <button className="btnSocial" onClick={() => handleSocialSign('google')} style={styles.socialGoogle}>
            <GoogleIcon /> Google
          </button>
          <button className="btnSocial" onClick={() => handleSocialSign('linkedin')} style={styles.socialLinkedin}>
            <LinkedInIcon /> LinkedIn
          </button>
        </div>

        <p style={styles.footer}>
          New to CareerBridge? <Link to="/signup" style={styles.link}>Create an account</Link>
        </p>
      </div>

      <style>{`
        * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
        
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(40px) scale(0.96); }
          to { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes floatShape1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(40px, -40px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        @keyframes floatShape2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, 30px) scale(1.1); }
        }
        @keyframes floatShape3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(30px, 30px) rotate(180deg); }
        }
        @keyframes scrollTextRight {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scrollTextLeft {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        
        .cardIn { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animShape { animation: floatShape1 20s ease-in-out infinite; }
        .animShape:nth-child(2) { animation-name: floatShape2; animation-duration: 25s; }
        .animShape:nth-child(3) { animation-name: floatShape3; animation-duration: 18s; }
        
        .inputF { transition: all 0.2s ease; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); }
        .inputF:focus { 
          outline: none; 
          border-color: #6366F1 !important; 
          background: rgba(255,255,255,0.1);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15) !important; 
          transform: translateY(-1px);
        }
        
        .btnP { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); display: flex; align-items: center; justify-content: center; gap: 8px; position: relative; overflow: hidden; }
        .btnP:hover:not(:disabled) { transform: translateY(-2px) scale(1.02); box-shadow: 0 12px 30px rgba(99, 102, 241, 0.4) !important; }
        .btnP:active { transform: scale(0.95); }
        
        .btnSocial { transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btnSocial:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.2); background: rgba(255,255,255,0.1); }
        
        .forgotLink { transition: color 0.2s ease; }
        .forgotLink:hover { color: #A5B4FC; text-decoration: underline; }

        @media(max-width: 768px) {
          .loginCard { max-width: 100% !important; margin: 0 20px; }
          .socialRow { flex-direction: column; gap: 12px; }
        }
      `}</style>
    </div>
  )
}

// ============================================
// 🎨 PREMIUM STYLES OBJECT
// ============================================
const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    background: '#050B14',
  },
  backButton: {
    position: 'fixed',
    top: '24px',
    left: '24px',
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '50px',
    color: '#E2E8F0',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    fontFamily: "'Inter', sans-serif",
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  backIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
  },
  bgContainer: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    background: '#050B14',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgGradient: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at 50% 50%, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.6) 40%, #050B14 100%)',
  },
  vignette: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.7) 100%)',
  },
  glowSpot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  },
  textScroller: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '60px',
    overflow: 'hidden',
    pointerEvents: 'none',
    opacity: 0.15,
    zIndex: 1,
  },
  textRow1: {
    display: 'flex',
    whiteSpace: 'nowrap',
    fontSize: '120px',
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: '-4px',
    animation: 'scrollTextRight 30s linear infinite',
  },
  textRow2: {
    display: 'flex',
    whiteSpace: 'nowrap',
    fontSize: '100px',
    fontWeight: '800',
    color: '#818CF8',
    letterSpacing: '-3px',
    animation: 'scrollTextLeft 35s linear infinite',
  },
  shape: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(2px)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  shape1: {
    top: '10%',
    left: '10%',
    width: '300px',
    height: '300px',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.05))',
    borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
  },
  shape2: {
    bottom: '20%',
    right: '15%',
    width: '400px',
    height: '400px',
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.05))',
    borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
  },
  shape3: {
    top: '40%',
    right: '30%',
    width: '200px',
    height: '200px',
    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.05))',
    borderRadius: '50%',
  },
  loginCard: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '420px',
    padding: '40px 36px',
    borderRadius: '24px',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 30px 80px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
  },
  cardGlowBorder: {
    position: 'absolute',
    inset: 0,
    borderRadius: '24px',
    padding: '1px',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), transparent 40%, rgba(139, 92, 246, 0.1))',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    pointerEvents: 'none',
  },
  cardLogoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '24px',
  },
  logoIconSmall: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
  },
  cardLogoText: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: '-0.5px',
  },
  cardHeader: {
    marginBottom: '24px',
    textAlign: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#FFFFFF',
    margin: '0 0 4px 0',
    letterSpacing: '-0.5px',
  },
  sub: {
    color: '#94A3B8',
    fontSize: '14px',
    margin: 0,
    lineHeight: 1.5,
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#FCA5A5',
    padding: '10px 14px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '20px',
  },
  errorIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: '#EF4444',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '700',
    flexShrink: 0,
  },
  successBanner: {
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#6EE7B7',
    padding: '10px 14px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '20px',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#CBD5E1',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotLink: {
    fontSize: '13px',
    color: '#818CF8',
    fontWeight: '600',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 12px 12px 42px',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#F1F5F9',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '2px',
  },
  checkboxLabel: {
    fontSize: '13px',
    color: '#94A3B8',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: '#6366F1',
    cursor: 'pointer',
    background: 'transparent',
  },
  btn: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '4px',
    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
    fontFamily: 'inherit',
  },
  orRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginTop: '24px',
    marginBottom: '16px',
  },
  rule: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.1)',
    flex: 1,
  },
  orText: {
    fontSize: '11px',
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  },
  socialRow: {
    display: 'flex',
    gap: '12px',
  },
  socialGoogle: {
    flex: 1,
    padding: '10px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.05)',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    color: '#E2E8F0',
    fontFamily: 'inherit',
  },
  socialLinkedin: {
    flex: 1,
    padding: '10px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.05)',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    color: '#E2E8F0',
    fontFamily: 'inherit',
  },
  footer: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#94A3B8',
    marginTop: '24px',
  },
  link: {
    color: '#818CF8',
    textDecoration: 'none',
    fontWeight: '700',
    transition: 'color 0.2s ease',
  },
}

// ============================================
// 🎨 CUSTOM SVG ICONS
// ============================================
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M23.52 12.29c0-.85-.08-1.68-.23-2.48H12v4.7h6.46c-.28 1.5-1.12 2.77-2.41 3.62v3h3.9c2.28-2.1 3.57-5.19 3.57-8.84z" fill="#4285F4"/>
      <path d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.9-3c-1.08.72-2.46 1.15-4.05 1.15-3.11 0-5.74-2.1-6.68-4.93H1.3v3.1C3.34 21.46 7.38 24 12 24z" fill="#34A853"/>
      <path d="M5.32 14.32c-.25-.74-.39-1.53-.39-2.32 0-.8.14-1.58.39-2.32V6.58H1.3C.47 8.24 0 10.07 0 12c0 1.93.47 3.76 1.3 5.42l4.02-3.1z" fill="#FBBC05"/>
      <path d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.43-3.44C17.96 1.15 15.24 0 12 0 7.38 0 3.34 2.54 1.3 6.58l4.02 3.1c.94-2.83 3.57-4.93 6.68-4.93z" fill="#EA4335"/>
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  )
}