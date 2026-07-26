import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef, useCallback } from 'react'

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState({})
  const refs = useRef({})

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setVisible(p => ({ ...p, [e.target.dataset.k]: true })) })
    }, { threshold: 0.12 })
    Object.values(refs.current).forEach(el => el && obs.observe(el))
    return () => { window.removeEventListener('scroll', onScroll); obs.disconnect() }
  }, [])

  const setRef = useCallback(k => el => { refs.current[k] = el }, [])
  const v = k => visible[k] ? 'show' : ''
  const scrollTo = (k) => { const el = refs.current[k]; if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }) }

  return (
    <div style={S.page}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
        @keyframes floatRev{0%,100%{transform:translateY(0)}50%{transform:translateY(14px)}}
        @keyframes pulseDot{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
        @keyframes gradientMove{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        .reveal{opacity:0}
        .reveal.show{animation:fadeUp .8s cubic-bezier(.16,1,.3,1) forwards}
        .blobA{animation:float 9s ease-in-out infinite}
        .blobB{animation:floatRev 11s ease-in-out infinite}
        .imgFloat{animation:float 7s ease-in-out infinite}
        .dot{animation:pulseDot 2s ease-in-out infinite}
        .navBar{transition:all .3s ease}
        .navLink{transition:opacity .2s ease;cursor:pointer}
        .navLink:hover{opacity:.65}
        .btnPrimary{transition:all .25s cubic-bezier(.16,1,.3,1)}
        .btnPrimary:hover{transform:translateY(-3px) scale(1.015);box-shadow:0 16px 32px rgba(37,99,235,.35)!important}
        .btnGhost{transition:all .25s ease}
        .btnGhost:hover{background:#EFF6FF;border-color:#93C5FD}
        .card{transition:transform .35s cubic-bezier(.16,1,.3,1),box-shadow .35s ease,border-color .35s ease}
        .card:hover{transform:translateY(-8px);box-shadow:0 24px 48px rgba(15,23,42,.1);border-color:#DBEAFE}
        .stepCard:hover .stepCircle{background:#2563EB;color:#fff;transform:scale(1.08)}
        .stepCircle{transition:all .3s ease}
        .statBlock{transition:transform .25s ease}
        .statBlock:hover{transform:translateY(-3px)}
        .ctaBtn{transition:all .25s ease}
        .ctaBtn:hover{transform:translateY(-3px);box-shadow:0 16px 32px rgba(0,0,0,.18)!important}
        .gradientBg{background:linear-gradient(120deg,#1D4ED8,#2563EB,#3B82F6,#2563EB);background-size:300% 300%;animation:gradientMove 8s ease infinite}
        .btnPrimary:focus,.btnGhost:focus,.navLink:focus{outline:3px solid rgba(37,99,235,0.18);outline-offset:3px}
        .btnPrimary:focus{box-shadow:0 8px 24px rgba(37,99,235,0.2)}

        /* Responsive tweaks */
        @media(max-width: 980px){
          .heroInner{grid-template-columns:1fr !important; padding:36px 20px 60px !important}
          .heroImg{height:360px !important}
          .h1{font-size:34px !important}
          .lead{max-width:100% !important}
          .navBar{padding:12px 20px !important}
          .navRight{gap:12px !important}
        }
        @media(max-width:560px){
          .heroImg{height:240px !important}
          .btnPrimary,.btnGhost{padding:12px 18px !important; font-size:14px !important}
          .statsRow{display:none}
        }
      `}</style>


      <nav className="navBar" style={{...S.nav, ...(scrolled ? S.navScrolled : {})}} aria-label="Main navigation">
        <div style={S.logo}>CareerBridge</div>
        <div style={S.navRight}>
          <span className="navLink" style={S.navLink} onClick={() => scrollTo('how')}>How it works</span>
          <span className="navLink" style={S.navLink} onClick={() => scrollTo('feat')}>Features</span>
          <span className="navLink" style={S.navLink} onClick={() => navigate('/login')}>Log in</span>
          <button className="btnPrimary" style={S.navCta} onClick={() => navigate('/signup')} aria-label="Sign up">Sign up</button>
        </div>
      </nav>

      <section style={S.hero}>
        <div className="blobA" style={S.blob1}></div>
        <div className="blobB" style={S.blob2}></div>
        <div style={S.heroInner}>
          <div style={S.heroLeft}>
            <div style={S.badge}><span className="dot" style={S.badgeDot}></span>Final Year Project · GCTU 2026</div>
            <h1 style={S.h1}>Connecting students to internships with <span style={S.h1Accent}>AI-powered</span> matching</h1>
            <p style={S.lead}>CareerBridge helps students discover the right job and internship opportunities, while giving employers smarter tools to find top talent — faster.</p>
            <div style={S.btnRow}>
              <button className="btnPrimary" style={S.btnPrimary} onClick={() => navigate('/signup')}>Get started — it's free</button>
              <button className="btnGhost" style={S.btnGhost} onClick={() => navigate('/login')}>I already have an account</button>
            </div>
            <div style={S.statsRow}>
              <div className="statBlock" style={S.stat}><div style={S.statNum}>2</div><div style={S.statLabel}>User roles</div></div>
              <div style={S.statLine}></div>
              <div className="statBlock" style={S.stat}><div style={S.statNum}>AI</div><div style={S.statLabel}>Smart matching</div></div>
              <div style={S.statLine}></div>
              <div className="statBlock" style={S.stat}><div style={S.statNum}>100%</div><div style={S.statLabel}>Free for students</div></div>
            </div>
          </div>
          <div style={S.heroRight}>
            <div className="imgFloat" style={S.imgWrap}>
              <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=640&q=80" alt="Student preparing for opportunities" role="img" loading="lazy" style={S.heroImg} />
              <div style={S.float1} aria-hidden="true">
                <div style={S.floatIcon}>✓</div>
                <div><div style={S.floatTitle}>Application sent</div><div style={S.floatSub}>Software Engineer Intern</div></div>
              </div>
              <div style={S.float2} aria-hidden="true">
                <div style={{...S.floatIcon, background:'#ECFDF5', color:'#059669'}}>94%</div>
                <div><div style={S.floatTitle}>AI match score</div><div style={S.floatSub}>Strong fit for this role</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={setRef('how')} data-k="how" style={S.section}>
        <div className={`reveal ${v('how')}`} style={S.sectionHead}>
          <div style={S.eyebrow}>How it works</div>
          <h2 style={S.h2}>Three simple steps to your next opportunity</h2>
        </div>
        <div style={S.stepsGrid}>
          {[
            { n: '1', t: 'Create your profile', d: 'Sign up, add your skills and upload your CV in minutes.' },
            { n: '2', t: 'Browse & apply', d: 'Search jobs and internships, then apply with one click.' },
            { n: '3', t: 'Get matched', d: 'Our AI scores your fit and tracks every application status.' }
          ].map((s, i) => (
            <div key={i} className={`stepCard reveal ${v('how')}`} style={{...S.stepCard, animationDelay: `${i * 0.12}s`}}>
              <div className="stepCircle" style={S.stepCircle}>{s.n}</div>
              <div style={S.stepTitle}>{s.t}</div>
              <div style={S.stepDesc}>{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section ref={setRef('feat')} data-k="feat" style={S.featuresSection}>
        {[
          { icon: '🎓', bg: '#EFF6FF', t: 'For Students', d: 'Build your profile, upload your CV, browse internships and track every application in one place.' },
          { icon: '🏢', bg: '#ECFDF5', t: 'For Employers', d: 'Post jobs in minutes and review applicants with all the information you need to make the right hire.' },
          { icon: '🤖', bg: '#F5F3FF', t: 'AI-Powered', d: 'Get instant CV feedback and smart job match scores powered by real artificial intelligence.' }
        ].map((f, i) => (
          <div key={i} className={`card reveal ${v('feat')}`} style={{...S.featureCard, animationDelay: `${i * 0.12}s`}}>
            <div style={{...S.featureIconWrap, background: f.bg}}><span style={S.featureIcon}>{f.icon}</span></div>
            <div style={S.featureTitle}>{f.t}</div>
            <div style={S.featureDesc}>{f.d}</div>
          </div>
        ))}
      </section>

      <section ref={setRef('cta')} data-k="cta" className={`reveal ${v('cta')}`}>
        <div className="gradientBg" style={S.ctaBanner}>
          <h2 style={S.ctaTitle}>Ready to find your next opportunity?</h2>
          <p style={S.ctaSub}>Join CareerBridge today — completely free for students.</p>
          <button className="ctaBtn" style={S.ctaBtn} onClick={() => navigate('/signup')} aria-label="Create your CareerBridge account">Create your account</button>
        </div>
      </section>

      <footer style={S.footer}>Built by Selorm Amuzu · Final Year Project · Ghana Communication Technology University</footer>
    </div>
  )
}




const S = {
  page: { fontFamily: "'Inter', -apple-system, sans-serif", overflowX: 'hidden', color: '#0F172A' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 48px', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(14px)' },
  navScrolled: { boxShadow: '0 1px 0 #EEF0F3', background: 'rgba(255,255,255,0.95)' },
  logo: { fontSize: '21px', fontWeight: '800', color: '#2563EB', letterSpacing: '-0.6px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '24px' },
  navLink: { fontSize: '14.5px', fontWeight: '600', color: '#374151' },
  navCta: { padding: '10px 22px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 4px 12px rgba(37,99,235,0.28)' },

  hero: { position: 'relative', overflow: 'hidden', padding: '10px 0 0' },
  blob1: { position: 'absolute', top: '-120px', right: '-140px', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, #DBEAFE 0%, transparent 70%)', zIndex: 0 },
  blob2: { position: 'absolute', top: '260px', left: '-160px', width: '380px', height: '380px', borderRadius: '50%', background: 'radial-gradient(circle, #D1FAE5 0%, transparent 70%)', zIndex: 0 },
  heroInner: { display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '48px', maxWidth: '1180px', margin: '0 auto', padding: '64px 40px 110px', alignItems: 'center', position: 'relative', zIndex: 1 },
  heroLeft: { animation: 'fadeUp 0.8s cubic-bezier(.16,1,.3,1) forwards' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EFF6FF', color: '#2563EB', padding: '8px 18px 8px 14px', borderRadius: '20px', fontSize: '12.5px', fontWeight: '700', marginBottom: '26px' },
  badgeDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#2563EB' },
  h1: { fontSize: '46px', fontWeight: '800', lineHeight: '1.14', marginBottom: '22px', letterSpacing: '-1.3px' },
  h1Accent: { color: '#2563EB' },
  lead: { fontSize: '17.5px', color: '#64748B', lineHeight: '1.75', marginBottom: '34px', maxWidth: '490px' },
  btnRow: { display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '44px' },
  btnPrimary: { padding: '16px 30px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15.5px', fontWeight: '700', boxShadow: '0 8px 20px rgba(37,99,235,0.28)' },
  btnGhost: { padding: '16px 30px', background: '#fff', color: '#2563EB', border: '1.5px solid #DBEAFE', borderRadius: '12px', cursor: 'pointer', fontSize: '15.5px', fontWeight: '700' },
  statsRow: { display: 'flex', alignItems: 'center', gap: '26px' },
  stat: { cursor: 'default' },
  statNum: { fontSize: '23px', fontWeight: '800' },
  statLabel: { fontSize: '12.5px', color: '#94A3B8', fontWeight: '600', marginTop: '2px' },
  statLine: { width: '1px', height: '34px', background: '#E2E8F0' },

  heroRight: { position: 'relative' },
  imgWrap: { position: 'relative' },
  heroImg: { width: '100%', height: '460px', objectFit: 'cover', borderRadius: '26px', boxShadow: '0 36px 70px -20px rgba(37,99,235,0.3)', display: 'block' },
  float1: { position: 'absolute', top: '-20px', left: '-32px', background: '#fff', borderRadius: '14px', padding: '13px 18px', boxShadow: '0 16px 32px rgba(15,23,42,0.14)', display: 'flex', alignItems: 'center', gap: '11px', maxWidth: '215px' },
  float2: { position: 'absolute', bottom: '-20px', right: '-28px', background: '#fff', borderRadius: '14px', padding: '13px 18px', boxShadow: '0 16px 32px rgba(15,23,42,0.14)', display: 'flex', alignItems: 'center', gap: '11px', maxWidth: '225px' },
  floatIcon: { width: '34px', height: '34px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', flexShrink: 0 },
  floatTitle: { fontSize: '12.5px', fontWeight: '700' },
  floatSub: { fontSize: '11px', color: '#94A3B8' },

  section: { maxWidth: '1080px', margin: '0 auto', padding: '50px 24px 100px' },
  sectionHead: { textAlign: 'center', marginBottom: '54px' },
  eyebrow: { color: '#2563EB', fontSize: '12.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '12px' },
  h2: { fontSize: '32px', fontWeight: '800', letterSpacing: '-0.6px' },
  stepsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px' },
  stepCard: { cursor: 'default' },
  stepCircle: { width: '46px', height: '46px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px', marginBottom: '20px' },
  stepTitle: { fontSize: '17.5px', fontWeight: '700', marginBottom: '9px' },
  stepDesc: { fontSize: '14px', color: '#64748B', lineHeight: '1.7' },

  featuresSection: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '26px', maxWidth: '1080px', margin: '0 auto', padding: '0 24px 100px' },
  featureCard: { background: '#fff', border: '1px solid #F0F1F3', borderRadius: '20px', padding: '34px 28px', textAlign: 'center', cursor: 'default' },
  featureIconWrap: { width: '58px', height: '58px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  featureIcon: { fontSize: '27px' },
  featureTitle: { fontSize: '17.5px', fontWeight: '700', marginBottom: '10px' },
  featureDesc: { fontSize: '14px', color: '#64748B', lineHeight: '1.75' },

  ctaBanner: { textAlign: 'center', padding: '76px 24px', margin: '0 24px 70px', borderRadius: '30px', maxWidth: '1080px', marginLeft: 'auto', marginRight: 'auto' },
  ctaTitle: { fontSize: '30px', fontWeight: '800', color: '#fff', marginBottom: '14px' },
  ctaSub: { fontSize: '15.5px', color: '#DBEAFE', marginBottom: '30px' },
  ctaBtn: { padding: '16px 32px', background: '#fff', color: '#2563EB', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15.5px', fontWeight: '700', boxShadow: '0 10px 24px rgba(0,0,0,0.15)' },

  footer: { textAlign: 'center', padding: '30px', color: '#94A3B8', fontSize: '12.5px', borderTop: '1px solid #F0F1F3' }
}