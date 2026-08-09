import { useState } from 'react'
import { supabase } from '../supabase'
import { Link, useNavigate } from 'react-router-dom'
import { Rocket, Mail, Lock, User, ArrowRight } from 'lucide-react'

export default function Signup() {
  const navigate = useNavigate()
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

  const roles = [
    { value: 'student', icon: '🎓', label: 'Student' },
    { value: 'employer', icon: '🏢', label: 'Employer' },
    { value: 'coordinator', icon: '📚', label: 'Coordinator' },
    { value: 'admin', icon: '⚙️', label: 'Admin' }
  ]

  return (
    <div style={styles.page}>
      
      {/* 🎨 ANIMATED CINEMATIC BACKGROUND (Teal & Emerald Theme) */}
      <div style={styles.bgContainer}>
        <div style={styles.bgGradient}></div>
        <div style={styles.vignette}></div>
        
        {/* Floating Geometric Blobs (Re-colored to Emerald/Teal) */}
        <div style={{...styles.shape, ...styles.shape1}} className="animShape"></div>
        <div style={{...styles.shape, ...styles.shape2}} className="animShape"></div>
        <div style={{...styles.shape, ...styles.shape3}} className="animShape"></div>
        
        {/* ✨ ANIMATED SCROLLING TEXT BACKGROUND (Customized for Signup) */}
        <div className="textScroller" style={styles.textScroller}>
          <div style={styles.textRow1}>
            <span>Welcome to the Family • Start Your Journey • </span>
            <span>Welcome to the Family • Start Your Journey • </span>
            <span>Welcome to the Family • Start Your Journey • </span>
            <span>Welcome to the Family • Start Your Journey • </span>
          </div>
          <div style={styles.textRow2}>
            <span>Shape Your Future • New Opportunities • </span>
            <span>Shape Your Future • New Opportunities • </span>
            <span>Shape Your Future • New Opportunities • </span>
            <span>Shape Your Future • New Opportunities • </span>
          </div>
        </div>
        
        <div style={styles.glowSpot}></div>
      </div>

      {/* 🃏 FLOATING SIGNUP CARD (Green Accents) */}
      <div className="cardIn" style={styles.signupCard}>
        <div style={styles.cardGlowBorder}></div>
        
        {/* Brand Logo */}
        <div style={styles.cardLogoContainer}>
          <div style={styles.logoIconSmall}><Rocket size={18} color="#fff" /></div>
          <span style={styles.cardLogoText}>CareerBridge</span>
        </div>

        <div style={styles.cardHeader}>
          <h2 style={styles.title}>Start your journey</h2>
          <p style={styles.sub}>Join thousands of students and employers shaping the future.</p>
        </div>

        {/* Alerts */}
        {error && <div style={styles.errorBanner}><span style={styles.errorIcon}>!</span> {error}</div>}
        {success && <div style={styles.successBanner}>✅ {success} <Link to="/login" style={styles.successLink}>Log in now</Link></div>}

        {/* Form */}
        <form onSubmit={handleSignup} style={styles.form}>
          
          <div style={styles.field}>
            <label style={styles.label}>Full name</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} color="#94A3B8" />
              <input
                className="inputF"
                style={styles.input}
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} color="#94A3B8" />
              <input
                className="inputF"
                style={styles.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} color="#94A3B8" />
              <input
                className="inputF"
                style={{ ...styles.input, paddingRight: '44px' }}
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>I am a...</label>
            <div style={styles.roleRow}>
              {roles.map(r => (
                <div 
                  key={r.value} 
                  className="roleCard" 
                  style={{...styles.roleCard, ...(role === r.value ? styles.roleCardActive : {})}} 
                  onClick={() => setRole(r.value)}
                >
                  <div style={styles.roleIcon}>{r.icon}</div>
                  <div style={styles.roleLabel}>{r.label}</div>
                </div>
              ))}
            </div>
          </div>

          <button className="btnP" style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'} 
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Log in</Link>
        </p>
      </div>

      {/* 🎬 GLOBAL ANIMATIONS & MEDIA QUERIES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
        
        /* Card Entry Animation */
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(40px) scale(0.96); }
          to { opacity:1; transform:translateY(0) scale(1); }
        }
        
        /* Shape Floating Animations */
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
        
        /* Text Scroll Animation */
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
        
        /* Input Focus States (Changed to Emerald Green) */
        .inputF { transition: all 0.2s ease; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); }
        .inputF:focus { 
          outline: none; 
          border-color: #10B981 !important; 
          background: rgba(255,255,255,0.1);
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15) !important; 
          transform: translateY(-1px);
        }
        
        /* Button States (Changed to Emerald Gradient) */
        .btnP { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); display: flex; align-items: center; justify-content: center; gap: 8px; position: relative; overflow: hidden; }
        .btnP:hover:not(:disabled) { transform: translateY(-2px) scale(1.02); box-shadow: 0 12px 30px rgba(16, 185, 129, 0.4) !important; }
        .btnP:active { transform: scale(0.95); }
        
        /* Role Card States */
        .roleCard { transition: all 0.2s ease; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.03); }
        .roleCard:hover { background: rgba(255, 255, 255, 0.08); transform: translateY(-2px); }
        
        @media(max-width: 768px) {
          .signupCard { max-width: 100% !important; margin: 0 20px; padding: 32px 24px !important; }
          .roleRow { grid-template-columns: 1fr 1fr !important; }
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
    background: '#05100A', // Much darker forest green base
    padding: '20px',
  },

  // 🌌 FULL PAGE ANIMATED BACKGROUND
  bgContainer: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    background: '#05100A',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgGradient: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.3) 0%, rgba(6, 78, 59, 0.5) 40%, #05100A 100%)',
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
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15), transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  },
  
  // ✨ ANIMATED SCROLLING TEXT
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
    opacity: 0.10,
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
    color: '#6EE7B7', // Teal text instead of Blue
    letterSpacing: '-3px',
    animation: 'scrollTextLeft 35s linear infinite',
  },

  // Floating Shapes (Now Emerald/Teal Tinted)
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
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.05))',
    borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
  },
  shape2: {
    bottom: '20%',
    right: '15%',
    width: '400px',
    height: '400px',
    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(16, 185, 129, 0.05))',
    borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
  },
  shape3: {
    top: '40%',
    right: '30%',
    width: '200px',
    height: '200px',
    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(16, 185, 129, 0.05))',
    borderRadius: '50%',
  },

  // 🃏 FLOATING SIGNUP CARD
  signupCard: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '520px',
    padding: '40px 36px',
    borderRadius: '24px',
    background: 'rgba(5, 16, 10, 0.7)', // Darker forest green glass
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(16, 185, 129, 0.15)', // Green tinted border
    boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6)',
    overflow: 'hidden',
  },
  cardGlowBorder: {
    position: 'absolute',
    inset: 0,
    borderRadius: '24px',
    padding: '1px',
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.4), transparent 40%, rgba(52, 211, 153, 0.1))',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    pointerEvents: 'none',
  },

  // Card Content
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
    background: 'linear-gradient(135deg, #10B981, #059669)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
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
  
  // Alerts
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
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#6EE7B7',
    padding: '10px 14px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '20px',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  successLink: {
    color: '#FCD34D',
    textDecoration: 'underline',
    fontWeight: '700',
    marginLeft: '4px',
  },

  // Form Elements
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
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

  // Role Selection
  roleRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
  },
  roleCard: {
    borderRadius: '12px',
    padding: '16px 8px',
    textAlign: 'center',
    cursor: 'pointer',
  },
  roleCardActive: {
    border: '1px solid #10B981',
    background: 'rgba(16, 185, 129, 0.15)',
    boxShadow: '0 0 20px rgba(16, 185, 129, 0.1)',
  },
  roleIcon: {
    fontSize: '22px',
    marginBottom: '4px',
  },
  roleLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#E2E8F0',
    lineHeight: 1.2,
  },

  // Buttons & Footer
  btn: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #10B981, #059669)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '4px',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
    fontFamily: 'inherit',
  },
  footer: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#94A3B8',
    marginTop: '24px',
  },
  link: {
    color: '#6EE7B7',
    textDecoration: 'none',
    fontWeight: '700',
    transition: 'color 0.2s ease',
  },
}