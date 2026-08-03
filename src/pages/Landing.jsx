import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef, useCallback } from 'react'
import './Landing.css'

const ROLES = ['Student', 'University', 'Employer']

const STATS = [
  { num: '2.4M+', label: 'Active job listings' },
  { num: '500+', label: 'University partners' },
  { num: '18K', label: 'Hiring employers' },
  { num: '92%', label: 'Placement rate' },
]

const PLATFORM_CARDS = [
  {
    iconBg: '#EFF6FF', iconColor: '#2563EB',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
    title: 'For students',
    desc: 'Build your profile, upload your CV, browse internships and track every application in one place.',
    checks: ['AI resume feedback', 'One-click apply', 'Interview prep'],
    link: 'Free tools for students →',
    path: '/signup',
  },
  {
    iconBg: '#FFF7ED', iconColor: '#EA580C',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
    title: 'For employers',
    desc: 'Post jobs in minutes and review applicants with all the information you need to make the right hire.',
    checks: ['Smart candidate ranking', 'Bulk application review', 'ATS integration'],
    link: 'Start hiring →',
    path: '/signup',
  },
  {
    iconBg: '#F5F3FF', iconColor: '#7C3AED',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2">
        <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.8 5.7 21l2.3-7-6-4.6h7.6z" />
      </svg>
    ),
    title: 'AI-powered support',
    desc: 'Get instant CV feedback and smart job match scores powered by real artificial intelligence.',
    checks: ['Semantic skill matching', 'Career forecasting', 'Placement insights'],
    link: 'Explore AI insights →',
    path: '/signup',
  },
]

const STEPS = [
  { n: '1', t: 'Create your profile', d: 'Sign up, add your skills and upload your CV in minutes.' },
  { n: '2', t: 'Browse & apply', d: 'Search jobs and internships, then apply with one click.' },
  { n: '3', t: 'Get matched', d: 'Our AI scores your fit and tracks every application status.' },
]

const FEATURES = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
      </svg>
    ),
    t: 'Smart Job Search',
    d: 'Filter thousands of roles by degree, skills and location with AI-matched recommendations.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    t: 'University Partnerships',
    d: 'Coordinators manage placements, endorse students and monitor outcomes in one dashboard.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
    t: 'Employer Connections',
    d: 'Post roles, screen verified candidates and build a pipeline directly from campuses.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
    t: 'Powerful Analytics',
    d: 'Real-time reporting on applications, placements and hiring trends across your network.',
  },
]

const TESTIMONIALS = [
  {
    quote: 'I landed my first graduate role within two weeks of using CareerBridge. The AI matching actually understood my skills.',
    name: 'Amara Okafor',
    title: 'Computer Science Graduate',
    avatar: 'https://i.pravatar.cc/80?img=47',
  },
  {
    quote: 'As a coordinator, I can track every student placement in one place. It has completely transformed how we manage outcomes.',
    name: 'Dr. Kwame Mensah',
    title: 'Career Coordinator, GCTU',
    avatar: 'https://i.pravatar.cc/80?img=12',
  },
  {
    quote: 'We filled three intern positions in a month. The candidate quality from verified university profiles is outstanding.',
    name: 'Sarah Chen',
    title: 'HR Manager, TechCorp',
    avatar: 'https://i.pravatar.cc/80?img=32',
  },
]

const NOTES = [
  { title: 'Coordinator note saved', desc: 'Follow-up scheduled for next week.', tag: 'Normal' },
  { title: 'Offer packet pending', desc: 'Awaiting employer confirmation.', tag: 'Low' },
  { title: 'Interview completed', desc: 'Student performed well — recommend offer.', tag: 'Normal' },
]

function Logo({ onClick }) {
  return (
    <div className="landing-logo" onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick?.()}>
      <div className="landing-logo-icon">C</div>
      <span className="landing-logo-text">CareerBridge</span>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState({})
<<<<<<< HEAD
  const [role, setRole] = useState('Student')
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
=======
  const [userRole, setUserRole] = useState('Student')
>>>>>>> feature/auth-ui-forms
  const refs = useRef({})

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setVisible(p => ({ ...p, [e.target.dataset.k]: true })) }),
      { threshold: 0.1 }
    )
    Object.values(refs.current).forEach(el => el && obs.observe(el))
    return () => { window.removeEventListener('scroll', onScroll); obs.disconnect() }
  }, [])

  const setRef = useCallback(k => el => { refs.current[k] = el }, [])
  const v = k => visible[k] ? 'show' : ''
<<<<<<< HEAD
  const scrollTo = k => { const el = refs.current[k]; if (el) el.scrollIntoView({ behavior: 'smooth' }) }

  const handleSearch = () => {
    navigate(search.trim() ? `/browse-jobs?q=${encodeURIComponent(search.trim())}` : '/browse-jobs')
  }

  const roleHints = {
    Student: 'Discover internships and graduate roles matched to your degree.',
    University: 'Manage placements, endorse students and track outcomes in one dashboard.',
    Employer: 'Post roles, screen verified candidates and build your campus pipeline.',
  }

  const navLinks = [
    { label: 'Home', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { label: 'Browse Jobs', action: () => navigate('/browse-jobs') },
    { label: 'For Universities', action: () => scrollTo('platform') },
    { label: 'For Employers', action: () => scrollTo('platform') },
    { label: 'Analytics', action: () => scrollTo('features') },
  ]

  return (
    <div className="landing">
      <nav className={`landing-nav${scrolled ? ' scrolled' : ''}`} aria-label="Main navigation">
        <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

        <div className={`landing-nav-links${menuOpen ? ' open' : ''}`}>
          {navLinks.map(l => (
            <button key={l.label} className="landing-nav-link" onClick={() => { l.action(); setMenuOpen(false) }}>
              {l.label}
            </button>
          ))}
        </div>

        <div className="landing-nav-actions">
          <button className="landing-btn-login" onClick={() => navigate('/login')}>Log in</button>
          <button className="landing-btn-signup" onClick={() => navigate('/signup')}>Sign up</button>
          <button className="landing-mobile-toggle" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen
                ? <path d="M18 6L6 18M6 6l12 12" />
                : <><path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h18" /></>}
            </svg>
          </button>
=======

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatPanel{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-10px) rotate(-1deg)}}
        @keyframes drift{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-16px)}}
        .reveal{opacity:0}
        .reveal.show{animation:fadeUp .7s cubic-bezier(.16,1,.3,1) forwards}
        .navLink{position:relative;padding:4px 0;transition:color .15s ease;cursor:pointer}
        .navLink:hover{color:#0F172A!important}
        .navLink.active::after{content:'';position:absolute;left:0;right:0;bottom:-4px;height:2px;background:#EA4E1B;border-radius:2px}
        .btnGhost{transition:background .15s ease}
        .btnGhost:hover{background:#F7F8FA!important}
        .btnDark{transition:transform .15s ease,box-shadow .15s ease}
        .btnDark:hover{transform:translateY(-1px);box-shadow:0 8px 18px rgba(15,23,42,.22)}
        .ctaPrimary{transition:transform .15s ease,box-shadow .15s ease}
        .ctaPrimary:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(234,78,27,.38)}
        .roleBtn{transition:all .15s ease;cursor:pointer}
        .roleBtn:hover:not(.active){background:#EDEEF1!important}
        .blob{animation:drift 12s ease-in-out infinite}
        .miniMockup{animation:floatPanel 6s ease-in-out infinite}
        .featureCard{transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}
        .featureCard:hover{transform:translateY(-4px);box-shadow:0 16px 32px rgba(15,23,42,.08);border-color:transparent}
        .testiCard{transition:transform .2s ease,box-shadow .2s ease}
        .testiCard:hover{transform:translateY(-4px);box-shadow:0 12px 24px rgba(15,23,42,.08)}
        .footerLink{transition:color .15s ease}
        .footerLink:hover{color:#EA4E1B!important}
        .ctaWhite{transition:opacity .15s ease}
        .ctaWhite:hover{opacity:.9}
        .ctaOutline{transition:background .15s ease}
        .ctaOutline:hover{background:rgba(255,255,255,.08)}

        @media(max-width:1024px){
          .heroInner{grid-template-columns:1fr!important}
          .statsGrid{grid-template-columns:1fr 1fr!important}
          .featuresGrid{grid-template-columns:1fr 1fr!important}
          .stepsGrid{grid-template-columns:1fr 1fr!important;row-gap:36px!important}
          .stepsLine{display:none!important}
          .testimonialGrid{grid-template-columns:1fr!important}
          .footerGrid{grid-template-columns:1fr 1fr!important}
        }
        @media(max-width:640px){
          .navCenter{display:none!important}
          .h1{font-size:32px!important;letter-spacing:-1px!important}
          .statsGrid{grid-template-columns:1fr 1fr!important}
          .featuresGrid{grid-template-columns:1fr!important}
          .stepsGrid{grid-template-columns:1fr!important}
          .searchRow{flex-direction:column!important}
          .miniMockup{display:none!important}
          .floaty{display:none!important}
          .impactContent{flex-direction:column!important;align-items:flex-start!important}
        }
      `}</style>

      {/* Navigation */}
      <nav style={{...S.nav, ...(scrolled ? S.navScrolled : {})}}>
        <div style={S.logoRow}>
          <div style={S.logoMark}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <span style={S.logoText}>CareerBridge</span>
        </div>
        <div style={S.navCenter} className="navCenter">
          <span className="navLink active" style={S.navLink}>Home</span>
          <span className="navLink" style={S.navLink} onClick={() => navigate('/browse-jobs')}>Browse Jobs</span>
          <span className="navLink" style={S.navLink}>For Universities</span>
          <span className="navLink" style={S.navLink}>For Employers</span>
          <span className="navLink" style={S.navLink} onClick={() => navigate('/analytics')}>Analytics</span>
        </div>
        <div style={S.navRight}>
          <button className="btnGhost" style={S.loginBtn} onClick={() => navigate('/login')}>Log in</button>
          <button className="btnDark" style={S.signupBtn} onClick={() => navigate('/signup')}>Sign up</button>
>>>>>>> feature/auth-ui-forms
        </div>
      </nav>

      {/* Hero */}
<<<<<<< HEAD
      <section className="landing-hero">
        <div>
          <div className="landing-badges">
            <span className="landing-badge">Trusted by 500+ universities</span>
            <span className="landing-badge accent">Final Year Project · GCTU 2026</span>
          </div>
          <h1 className="landing-h1">
            Where students, universities &amp; employers connect
          </h1>
          <p className="landing-lead">
            CareerBridge is the all-in-one platform that links ambitious students with leading employers,
            powered by real university partnerships, AI-powered matching, and actionable analytics.
          </p>

          <div className="landing-search-wrap">
            <svg className="landing-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              className="landing-search-input"
              placeholder="Search roles, companies, skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button className="landing-search-btn" onClick={handleSearch}>Get Started</button>
          </div>

          <div className="landing-role-row">
            <span className="landing-role-label">I am a...</span>
            {ROLES.map(r => (
              <button
                key={r}
                className={`landing-role-pill${role === r ? ' active' : ''}`}
                onClick={() => setRole(r)}
              >
                {r}
              </button>
            ))}
          </div>
          <p className="landing-role-hint">{roleHints[role]}</p>

          <div className="landing-hero-stats">
            <div>
              <div className="landing-hero-stat-num">AI</div>
              <div className="landing-hero-stat-label">Smart matching</div>
            </div>
            <div className="landing-hero-stat-divider" />
            <div>
              <div className="landing-hero-stat-num">100%</div>
              <div className="landing-hero-stat-label">Free for students</div>
            </div>
            <div className="landing-hero-stat-divider" />
            <div>
              <div className="landing-hero-stat-num">3</div>
              <div className="landing-hero-stat-label">User roles</div>
=======
      <section style={S.hero}>
        <div className="blob" style={S.blob1}></div>
        <div className="blob" style={{...S.blob2, animationDelay: '3s'}}></div>

        <div style={S.heroInner} className="heroInner">
          <div>
            <div style={S.eyebrow}>
              <span style={S.dots}>
                <span style={{...S.dot, opacity: .5}}></span>
                <span style={{...S.dot, opacity: .8}}></span>
                <span style={{...S.dot, opacity: 1}}></span>
              </span>
              Trusted by 500+ universities
            </div>

            <h1 style={S.h1} className="h1">Where students, universities <span style={S.h1Accent}>&amp; employers</span> connect</h1>
            <p style={S.lead}>CareerBridge is the all-in-one platform that links ambitious students with leading employers — powered by real university partnerships and actionable analytics.</p>

            <div style={S.searchRow} className="searchRow">
              <div style={S.searchBox}>
                <span style={S.searchIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8593A6" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
                </span>
                <input type="text" placeholder="Search roles, companies, skills..." style={S.searchInput} />
              </div>
              <button className="ctaPrimary" style={S.ctaPrimary} onClick={() => navigate('/signup')}>Get started</button>
>>>>>>> feature/auth-ui-forms
            </div>

            <div style={S.whoRow}>
              I am a:
              <div style={S.segmented}>
                {['Student', 'University', 'Employer'].map(role => (
                  <span
                    key={role}
                    className={`roleBtn ${userRole === role ? 'active' : ''}`}
                    onClick={() => setUserRole(role)}
                    style={{...S.segBtn, ...(userRole === role ? S.segBtnActive : {})}}
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <div style={S.heroHint}>Discover internships and graduate roles matched to your degree.</div>
          </div>
<<<<<<< HEAD
        </div>

        <div className="landing-hero-img-wrap">
          <img
            className="landing-hero-img"
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
            alt="Students and professionals collaborating"
            loading="eager"
          />
          <div className="landing-float-card top">
            <div className="landing-float-icon" style={{ background: '#F3F4F6', color: '#111' }}>✓</div>
            <div>
              <div className="landing-float-title">Application sent</div>
              <div className="landing-float-sub">Software Engineer Intern</div>
            </div>
          </div>
          <div className="landing-float-card bottom">
            <div className="landing-float-icon" style={{ background: '#ECFDF5', color: '#059669' }}>94%</div>
            <div>
              <div className="landing-float-title">AI match score</div>
              <div className="landing-float-sub">Strong fit for this role</div>
=======

          <div style={S.photoWrap}>
            <div className="floaty" style={S.floaty1}>
              <span style={{...S.floatyDot, background: '#0E9C8F'}}></span> 92% placement rate
            </div>
            <img
              style={S.heroPhoto}
              alt="Students collaborating on laptops in a university setting"
              src="https://images.unsplash.com/photo-1758270705290-62b6294dd044?fm=jpg&q=70&w=900&auto=format&fit=crop"
            />
            <div className="miniMockup" style={S.miniMockup}>
              <div style={S.mmTop}>
                <span style={S.mmLabel}>Match rate</span>
                <span style={S.mmPct}>73.5%</span>
              </div>
              <div style={S.mmBars}>
                {[35, 55, 40, 70, 60, 85, 95].map((h, i) => (
                  <div key={i} style={{...S.mmBar, height: `${h}%`}}></div>
                ))}
              </div>
>>>>>>> feature/auth-ui-forms
            </div>
            <div className="floaty" style={S.floaty2}>
              <span style={{...S.floatyDot, background: '#EA4E1B'}}></span> AI-matched today
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
<<<<<<< HEAD
      <section className="landing-stats">
        {STATS.map(s => (
          <div key={s.label} className="landing-stat-card">
            <div className="landing-stat-num">{s.num}</div>
            <div className="landing-stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Platform cards */}
      <section ref={setRef('platform')} data-k="platform" id="platform" className="landing-section">
        <div className={`landing-section-head left landing-reveal ${v('platform')}`}>
          <h2 className="landing-h2">One platform, every career journey</h2>
          <p className="landing-section-sub">
            From student readiness to employer hiring and coordinator oversight — CareerBridge keeps every
            stakeholder aligned for placement success.
          </p>
        </div>
        <div className="landing-platform-grid">
          {PLATFORM_CARDS.map((c, i) => (
            <div key={c.title} className={`landing-platform-card landing-reveal ${v('platform')}`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="landing-platform-icon" style={{ background: c.iconBg }}>{c.icon}</div>
              <div className="landing-platform-title">{c.title}</div>
              <div className="landing-platform-desc">{c.desc}</div>
              <ul className="landing-check-list">
                {c.checks.map(item => (
                  <li key={item}>
                    <span className="landing-check-icon">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="landing-platform-link" onClick={() => navigate(c.path)}>{c.link}</button>
=======
      <section style={S.statsSection}>
        <div style={S.statsGrid} className="statsGrid">
          {[
            { n: '2.4M+', l: 'Active job listings' },
            { n: '500+', l: 'University partners' },
            { n: '18K', l: 'Hiring employers' },
            { n: '92%', l: 'Placement rate' },
          ].map((s, i) => (
            <div key={i} className={`reveal ${v('stats')}`} ref={i === 0 ? setRef('stats') : null} data-k="stats" style={{...S.stat, ...(i < 3 ? S.statDivider : {})}}>
              <div style={S.statNum}>{s.n}</div>
              <div style={S.statLabel}>{s.l}</div>
>>>>>>> feature/auth-ui-forms
            </div>
          ))}
        </div>
      </section>

<<<<<<< HEAD
      {/* How it works */}
      <section ref={setRef('how')} data-k="how" className="landing-section">
        <div className={`landing-section-head landing-reveal ${v('how')}`}>
          <span className="landing-eyebrow">How it works</span>
          <h2 className="landing-h2">Three simple steps to your next opportunity</h2>
        </div>
        <div className="landing-steps-grid">
          {STEPS.map((s, i) => (
            <div key={s.n} className={`landing-step-card landing-reveal ${v('how')}`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="landing-step-num">{s.n}</div>
              <div className="landing-step-title">{s.t}</div>
              <div className="landing-step-desc">{s.d}</div>
=======
      {/* Features */}
      <section style={S.section}>
        <div className={`reveal ${v('feat')}`} ref={setRef('feat')} data-k="feat" style={S.sectionHead}>
          <h2 style={S.h2}>Everything you need to bridge the gap</h2>
          <p style={S.sectionSub}>A single platform that brings together job discovery, partnerships, and insight.</p>
        </div>

        <div style={S.featuresGrid} className="featuresGrid">
          {[
            { icon: '🔍', bg: '#EFF6FF', color: '#2563EB', t: 'Smart job search', d: 'Filter thousands of roles by degree, skills and location, with AI-matched recommendations.' },
            { icon: '🎓', bg: '#E8FBF8', color: '#0E9C8F', t: 'University partnerships', d: 'Coordinators manage placements, endorse students and monitor outcomes in one dashboard.' },
            { icon: '💼', bg: '#FEF7E9', color: '#F0A93A', t: 'Employer connections', d: 'Post roles, screen verified candidates and build a pipeline directly from campus.' },
            { icon: '📊', bg: '#FFF1EA', color: '#EA4E1B', t: 'Powerful analytics', d: 'Real-time reporting on applications, placements and hiring trends across your network.' },
          ].map((f, i) => (
            <div key={i} className={`featureCard reveal ${v('feat')}`} style={{...S.featureCard, animationDelay: `${i * .1}s`}}>
              <div style={{...S.featureIcon, background: f.bg, color: f.color}}>{f.icon}</div>
              <div style={S.featureTitle}>{f.t}</div>
              <div style={S.featureDesc}>{f.d}</div>
>>>>>>> feature/auth-ui-forms
            </div>
          ))}
        </div>
      </section>

<<<<<<< HEAD
      {/* Features */}
      <section ref={setRef('features')} data-k="features" id="features" className="landing-section">
        <div className={`landing-section-head landing-reveal ${v('features')}`}>
          <h2 className="landing-h2">Everything you need to bridge the gap</h2>
          <p className="landing-section-sub">
            A single platform that brings together job discovery, partnerships, and insights.
          </p>
        </div>
        <div className="landing-features-grid">
          {FEATURES.map((f, i) => (
            <div key={f.t} className={`landing-feature-card landing-reveal ${v('features')}`} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="landing-feature-icon-wrap">{f.icon}</div>
              <div className="landing-feature-title">{f.t}</div>
              <div className="landing-feature-desc">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Placement proof */}
      <section ref={setRef('proof')} data-k="proof" className="landing-section">
        <div className={`landing-section-head landing-reveal ${v('proof')}`}>
          <span className="landing-eyebrow">Placement proof</span>
          <h2 className="landing-h2">Trusted outcomes from real coordinator workflows</h2>
          <p className="landing-section-sub">
            See how coordinators track student progress from application to confirmed placement.
          </p>
        </div>
        <div className="landing-workflow-grid">
          <div className={`landing-workflow-card landing-reveal ${v('proof')}`}>
            <div className="landing-workflow-header">
              <div>
                <div className="landing-workflow-name">Sarah Mitchell</div>
                <div className="landing-workflow-role">Software Engineering · Year 4</div>
              </div>
              <span className="landing-placed-badge">Placed</span>
            </div>
            <div className="landing-field-label">Employer</div>
            <div className="landing-field-box">Nimbus Labs</div>
            <div className="landing-field-label">Role</div>
            <div className="landing-field-box">Software Engineer Intern → Full-Time</div>
            <div className="landing-field-label">Coordinator note</div>
            <div className="landing-field-box">Strong candidate — recommend for full-time conversion.</div>
          </div>

          <div className={`landing-workflow-card landing-reveal ${v('proof')}`} style={{ animationDelay: '0.1s' }}>
            <div className="landing-workflow-center">
              <div className="landing-workflow-check">✓</div>
              <div className="landing-platform-title" style={{ marginBottom: 16 }}>Placement confirmed</div>
              <div className="landing-note-saved">
                <div className="landing-note-saved-title">Note saved</div>
                <div className="landing-note-saved-text">Coordinator follow-up recorded. Student notified of offer acceptance.</div>
              </div>
              <div className="landing-field-label" style={{ alignSelf: 'flex-start', width: '100%' }}>Follow-up date</div>
              <div className="landing-field-box" style={{ width: '100%' }}>March 15, 2026</div>
              <div className="landing-field-label" style={{ alignSelf: 'flex-start', width: '100%' }}>Status</div>
              <div className="landing-field-box" style={{ width: '100%' }}>Offer accepted · Onboarding scheduled</div>
            </div>
          </div>

          <div className={`landing-workflow-card landing-reveal ${v('proof')}`} style={{ animationDelay: '0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div className="landing-platform-icon" style={{ background: '#F5F3FF', marginBottom: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="landing-platform-title" style={{ marginBottom: 0 }}>Recent notes</div>
            </div>
            {NOTES.map(n => (
              <div key={n.title} className="landing-note-item">
                <div>
                  <div className="landing-note-title">{n.title}</div>
                  <div className="landing-note-desc">{n.desc}</div>
                </div>
                <span className="landing-priority-tag">{n.tag}</span>
=======
      {/* How it works */}
      <section style={{...S.section, paddingTop: 0}}>
        <div className={`reveal ${v('steps')}`} ref={setRef('steps')} data-k="steps" style={S.sectionHead}>
          <h2 style={S.h2}>How it works</h2>
          <p style={S.sectionSub}>From profile to placement in four steps.</p>
        </div>

        <div style={S.stepsWrap}>
          <div className="stepsLine" style={S.stepsLine}></div>
          <div style={S.stepsGrid} className="stepsGrid">
            {[
              { n: 1, bg: '#0F172A', t: 'Create your profile', d: 'Add your skills, degree and CV in minutes.' },
              { n: 2, bg: '#EA4E1B', t: 'Get matched', d: 'Our AI scores you against live roles by fit.' },
              { n: 3, bg: '#0E9C8F', t: 'Apply with confidence', d: 'See exactly which skills to highlight, and which to build.' },
              { n: 4, bg: '#F0A93A', t: 'Get placed', d: 'Track every application through to an offer.' },
            ].map((s, i) => (
              <div key={i} className={`reveal ${v('steps')}`} style={{...S.step, animationDelay: `${i * .1}s`}}>
                <div style={{...S.stepNum, background: s.bg}}>{s.n}</div>
                <h4 style={S.stepTitle}>{s.t}</h4>
                <p style={S.stepDesc}>{s.d}</p>
>>>>>>> feature/auth-ui-forms
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
<<<<<<< HEAD
      <section ref={setRef('testimonials')} data-k="testimonials" className="landing-section">
        <div className={`landing-section-head landing-reveal ${v('testimonials')}`}>
          <h2 className="landing-h2">Loved by the whole community</h2>
          <p className="landing-section-sub">
            Students, coordinators and recruiters share why they choose CareerBridge.
          </p>
        </div>
        <div className="landing-testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} className={`landing-testimonial-card landing-reveal ${v('testimonials')}`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="landing-stars">★★★★★</div>
              <p className="landing-testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
              <div className="landing-testimonial-author">
                <img className="landing-testimonial-avatar" src={t.avatar} alt={t.name} loading="lazy" />
                <div>
                  <div className="landing-testimonial-name">{t.name}</div>
                  <div className="landing-testimonial-title">{t.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section ref={setRef('cta')} data-k="cta" className="landing-cta-section">
        <div className={`landing-cta-banner landing-reveal ${v('cta')}`}>
          <h2 className="landing-cta-title">Ready to bridge your career?</h2>
          <p className="landing-cta-sub">
            Join thousands of students, coordinators and employers already using CareerBridge.
            Completely free for students.
          </p>
          <button className="landing-cta-btn" onClick={() => navigate('/signup')}>Create free account</button>
          <button className="landing-cta-login" onClick={() => navigate('/login')}>Log in</button>
=======
      <section style={S.testiSection}>
        <div style={S.wrap}>
          <div className={`reveal ${v('testi')}`} ref={setRef('testi')} data-k="testi" style={S.sectionHead}>
            <h2 style={S.h2}>Loved by the whole community</h2>
            <p style={S.sectionSub}>Students, coordinators and recruiters share why they choose CareerBridge.</p>
          </div>

          <div style={S.testimonialGrid} className="testimonialGrid">
            {[
              { name: 'Amara Okafor', role: 'Computer Science Graduate', text: 'I landed my first graduate role within two weeks. The matching was spot-on for my degree.', bg: '#EA4E1B' },
              { name: 'Daniel Rivers', role: 'University Coordinator', text: "Managing 300 placements used to be a spreadsheet nightmare. Now it's all in one place.", bg: '#0B3B57' },
              { name: 'Priya Sharma', role: 'Talent Acquisition Lead', text: 'The quality of pre-verified candidates from partner universities cut our hiring time in half.', bg: '#0E9C8F' },
            ].map((t, i) => (
              <div key={i} className={`testiCard reveal ${v('testi')}`} style={{...S.testiCard, animationDelay: `${i * .1}s`}}>
                <div style={S.stars}>★★★★★</div>
                <p style={S.testiQuote}>"{t.text}"</p>
                <div style={S.testiPerson}>
                  <div style={{...S.testiAvatar, background: t.bg}}>{t.name.split(' ').map(n => n[0]).join('')}</div>
                  <div>
                    <div style={S.testiName}>{t.name}</div>
                    <div style={S.testiRole}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact band */}
      <section style={{...S.section, paddingBottom: 0}}>
        <div className={`reveal ${v('impact')}`} ref={setRef('impact')} data-k="impact" style={S.impactBand}>
          <img
            style={S.impactImg}
            alt="Group of graduates celebrating, throwing caps in the air"
            src="https://images.unsplash.com/photo-1695425173758-37e9c23b962a?fm=jpg&q=70&w=1600&auto=format&fit=crop"
          />
          <div style={S.impactOverlay}></div>
          <div style={S.impactContent} className="impactContent">
            <h3 style={S.impactTitle}>Every year, thousands of students turn their degree into a first offer here.</h3>
            <div style={S.impactStats}>
              <div><div style={S.impactStatN}>18K</div><div style={S.impactStatL}>Hiring employers</div></div>
              <div><div style={S.impactStatN}>92%</div><div style={S.impactStatL}>Placement rate</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{...S.section, paddingTop: '40px'}}>
        <div className={`reveal ${v('cta')}`} ref={setRef('cta')} data-k="cta" style={S.ctaBlock}>
          <div style={S.ctaGlow}></div>
          <h2 style={S.ctaTitle}>Ready to bridge your career?</h2>
          <p style={S.ctaSub}>Join thousands of students, universities and employers already building better futures together.</p>
          <div style={S.ctaButtons}>
            <button className="ctaWhite" style={S.ctaWhite} onClick={() => navigate('/signup')}>Create free account</button>
            <button className="ctaOutline" style={S.ctaOutline} onClick={() => navigate('/login')}>Log in</button>
          </div>
>>>>>>> feature/auth-ui-forms
        </div>
      </section>

      {/* Footer */}
<<<<<<< HEAD
      <footer className="landing-footer">
        <div className="landing-footer-top">
          <div>
            <Logo />
            <p className="landing-footer-brand-desc">
              Connecting students, universities and employers for a stronger future workforce.
              AI-powered matching · Final Year Project · GCTU 2026.
            </p>
          </div>
          <div>
            <div className="landing-footer-col-title">Product</div>
            <button className="landing-footer-link" onClick={() => navigate('/browse-jobs')}>Browse Jobs</button>
            <button className="landing-footer-link" onClick={() => scrollTo('features')}>Analytics</button>
            <button className="landing-footer-link" onClick={() => navigate('/signup')}>Get Started</button>
          </div>
          <div>
            <div className="landing-footer-col-title">Company</div>
            <button className="landing-footer-link" onClick={() => scrollTo('platform')}>About</button>
            <button className="landing-footer-link" onClick={() => scrollTo('testimonials')}>Careers</button>
            <button className="landing-footer-link" onClick={() => scrollTo('cta')}>Contact</button>
          </div>
          <div>
            <div className="landing-footer-col-title">Legal</div>
            <button className="landing-footer-link">Privacy</button>
            <button className="landing-footer-link">Terms</button>
            <button className="landing-footer-link">Security</button>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <span className="landing-footer-copy">© 2026 CareerBridge. All rights reserved.</span>
          <span className="landing-footer-credit">
            Built by Selorm Amuzu · Final Year Project · Ghana Communication Technology University
          </span>
=======
      <footer style={S.footer}>
        <div style={S.footerGrid} className="footerGrid">
          <div>
            <div style={S.logoRow}>
              <div style={S.logoMark}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </div>
              <span style={S.logoText}>CareerBridge</span>
            </div>
            <p style={S.footerTag}>The all-in-one platform linking students, universities and employers.</p>
          </div>
          <div>
            <h5 style={S.footerHead}>Product</h5>
            <div className="footerLink" style={S.footerLink} onClick={() => navigate('/browse-jobs')}>Browse jobs</div>
            <div className="footerLink" style={S.footerLink}>For universities</div>
            <div className="footerLink" style={S.footerLink}>For employers</div>
            <div className="footerLink" style={S.footerLink} onClick={() => navigate('/analytics')}>Analytics</div>
          </div>
          <div>
            <h5 style={S.footerHead}>Company</h5>
            <div className="footerLink" style={S.footerLink}>About</div>
            <div className="footerLink" style={S.footerLink}>Careers</div>
            <div className="footerLink" style={S.footerLink}>Contact</div>
          </div>
          <div>
            <h5 style={S.footerHead}>Legal</h5>
            <div className="footerLink" style={S.footerLink}>Privacy policy</div>
            <div className="footerLink" style={S.footerLink}>Terms of service</div>
          </div>
        </div>
        <div style={S.footerBottom}>
          <span>© 2026 CareerBridge. All rights reserved.</span>
          <div style={S.socials}>
            <div style={S.socialIc}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" /></svg>
            </div>
            <div style={S.socialIc}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /><path d="M8 9h4v2a4 4 0 0 1 8 0v9h-4v-8a2 2 0 0 0-4 0v8H8z" /></svg>
            </div>
          </div>
>>>>>>> feature/auth-ui-forms
        </div>
      </footer>
    </div>
  )
}
<<<<<<< HEAD
=======

const S = {
  page: { fontFamily: "'Inter', -apple-system, sans-serif", overflowX: 'hidden', color: '#0F172A', background: '#FFFFFF' },
  wrap: { maxWidth: '1180px', margin: '0 auto' },

  /* Nav */
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 48px', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #ECEFF3' },
  navScrolled: { boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '9px' },
  logoMark: { width: '26px', height: '26px', borderRadius: '8px', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoText: { fontWeight: '800', fontSize: '17px', letterSpacing: '-.4px', color: '#0F172A' },
  navCenter: { display: 'flex', gap: '30px', alignItems: 'center' },
  navLink: { fontSize: '13.5px', fontWeight: '600', color: '#8593A6' },
  navRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  loginBtn: { padding: '9px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13.5px', fontWeight: '700', borderRadius: '9px', color: '#0F172A' },
  signupBtn: { padding: '9px 18px', background: '#0F172A', color: '#fff', border: 'none', borderRadius: '9px', cursor: 'pointer', fontSize: '13.5px', fontWeight: '700' },

  /* Hero */
  hero: { position: 'relative', overflow: 'hidden', padding: '76px 48px 64px' },
  blob1: { position: 'absolute', width: '420px', height: '420px', borderRadius: '50%', filter: 'blur(60px)', opacity: .35, background: '#EA4E1B', top: '-160px', right: '-120px', zIndex: 0 },
  blob2: { position: 'absolute', width: '320px', height: '320px', borderRadius: '50%', filter: 'blur(60px)', opacity: .18, background: '#0E9C8F', bottom: '-140px', right: '220px', zIndex: 0 },
  heroInner: { position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: '56px', alignItems: 'center', maxWidth: '1180px', margin: '0 auto' },

  eyebrow: { display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', fontWeight: '700', letterSpacing: '.09em', color: '#8593A6', textTransform: 'uppercase', marginBottom: '18px' },
  dots: { display: 'flex', gap: '4px' },
  dot: { width: '6px', height: '6px', borderRadius: '50%', background: '#EA4E1B' },

  h1: { fontSize: '52px', lineHeight: '1.04', fontWeight: '800', letterSpacing: '-1.6px', marginBottom: '20px', color: '#0F172A' },
  h1Accent: { color: '#EA4E1B' },
  lead: { fontSize: '16px', lineHeight: '1.6', color: '#8593A6', maxWidth: '480px', marginBottom: '28px' },

  searchRow: { display: 'flex', gap: '10px', marginBottom: '20px', maxWidth: '520px' },
  searchBox: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', border: '1.5px solid #ECEFF3', borderRadius: '12px', padding: '0 16px', boxShadow: '0 2px 10px rgba(15,23,42,.03)' },
  searchIcon: { display: 'flex', flexShrink: 0 },
  searchInput: { border: 'none', outline: 'none', padding: '14px 0', fontSize: '14px', fontFamily: 'inherit', flex: 1, color: '#0F172A', background: 'transparent', width: '100%' },
  ctaPrimary: { padding: '14px 24px', background: '#EA4E1B', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 6px 18px rgba(234,78,27,.3)', whiteSpace: 'nowrap' },

  whoRow: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12.5px', fontWeight: '600', color: '#8593A6', marginBottom: '10px' },
  segmented: { display: 'inline-flex', gap: '3px', background: '#F7F8FA', padding: '3px', borderRadius: '10px' },
  segBtn: { padding: '7px 15px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: '#8593A6' },
  segBtnActive: { background: '#0F172A', color: '#fff' },
  heroHint: { fontSize: '12.5px', color: '#8593A6', marginTop: '14px' },

  photoWrap: { position: 'relative' },
  heroPhoto: { width: '100%', aspectRatio: '4 / 4.6', objectFit: 'cover', borderRadius: '22px', boxShadow: '0 30px 60px -18px rgba(15,23,42,.28), 0 10px 24px rgba(15,23,42,.08)' },
  miniMockup: { position: 'absolute', left: '-8%', bottom: '-10%', width: '62%', minWidth: '220px', background: '#fff', borderRadius: '16px', border: '1px solid #ECEFF3', boxShadow: '0 20px 40px rgba(15,23,42,.2)', padding: '14px 16px' },
  mmTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  mmLabel: { fontSize: '10px', fontWeight: '700', color: '#8593A6', textTransform: 'uppercase', letterSpacing: '.05em' },
  mmPct: { fontSize: '22px', fontWeight: '800', color: '#EA4E1B' },
  mmBars: { display: 'flex', alignItems: 'flex-end', gap: '4px', height: '36px' },
  mmBar: { flex: 1, background: 'linear-gradient(180deg,#EA4E1B,#ff8a5c)', borderRadius: '2px 2px 0 0' },
  floaty1: { position: 'absolute', top: '8%', left: '-8%', background: '#fff', border: '1px solid #ECEFF3', borderRadius: '12px', boxShadow: '0 14px 30px rgba(15,23,42,.14)', padding: '10px 14px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' },
  floaty2: { position: 'absolute', bottom: '10%', right: '-10%', background: '#fff', border: '1px solid #ECEFF3', borderRadius: '12px', boxShadow: '0 14px 30px rgba(15,23,42,.14)', padding: '10px 14px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' },
  floatyDot: { width: '8px', height: '8px', borderRadius: '50%' },

  /* Stats */
  statsSection: { background: '#F7F8FA', borderTop: '1px solid #ECEFF3', borderBottom: '1px solid #ECEFF3', padding: '40px 48px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', maxWidth: '1180px', margin: '0 auto' },
  stat: { textAlign: 'center', padding: '0 16px', position: 'relative' },
  statDivider: { borderRight: '1px solid #ECEFF3' },
  statNum: { fontSize: '30px', fontWeight: '800', letterSpacing: '-1px', color: '#0F172A' },
  statLabel: { fontSize: '12.5px', color: '#8593A6', fontWeight: '600', marginTop: '4px' },

  /* Shared section */
  section: { maxWidth: '1180px', margin: '0 auto', padding: '88px 48px' },
  sectionHead: { textAlign: 'center', maxWidth: '560px', margin: '0 auto 48px' },
  h2: { fontSize: '32px', fontWeight: '800', letterSpacing: '-.8px', marginBottom: '10px', color: '#0F172A' },
  sectionSub: { fontSize: '14.5px', color: '#8593A6' },

  /* Features */
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' },
  featureCard: { background: '#fff', border: '1px solid #ECEFF3', borderRadius: '16px', padding: '24px' },
  featureIcon: { width: '42px', height: '42px', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '19px' },
  featureTitle: { fontSize: '15px', fontWeight: '800', marginBottom: '7px', color: '#0F172A' },
  featureDesc: { fontSize: '13px', color: '#8593A6', lineHeight: '1.55' },

  /* Steps */
  stepsWrap: { position: 'relative' },
  stepsLine: { position: 'absolute', top: '22px', left: '12.5%', right: '12.5%', height: '1.5px', background: 'repeating-linear-gradient(to right, #ECEFF3 0 6px, transparent 6px 12px)' },
  stepsGrid: { position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' },
  step: { position: 'relative', textAlign: 'center' },
  stepNum: { width: '44px', height: '44px', borderRadius: '50%', color: '#fff', fontWeight: '800', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', position: 'relative', zIndex: 1 },
  stepTitle: { fontSize: '14.5px', fontWeight: '800', marginBottom: '6px', color: '#0F172A' },
  stepDesc: { fontSize: '12.5px', color: '#8593A6', lineHeight: '1.5', maxWidth: '200px', margin: '0 auto' },

  /* Testimonials */
  testiSection: { background: '#F7F8FA', padding: '88px 48px' },
  testimonialGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' },
  testiCard: { background: '#fff', border: '1px solid #ECEFF3', borderRadius: '16px', padding: '22px', boxShadow: '0 2px 10px rgba(15,23,42,.03)' },
  stars: { color: '#F0A93A', fontSize: '13px', letterSpacing: '2px', marginBottom: '12px' },
  testiQuote: { fontSize: '13.5px', lineHeight: '1.6', color: '#0F172A', marginBottom: '18px' },
  testiPerson: { display: 'flex', alignItems: 'center', gap: '10px' },
  testiAvatar: { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '13px', flexShrink: 0 },
  testiName: { fontSize: '13px', fontWeight: '700', color: '#0F172A' },
  testiRole: { fontSize: '11.5px', color: '#8593A6' },

  /* Impact band */
  impactBand: { position: 'relative', borderRadius: '24px', overflow: 'hidden', minHeight: '320px', display: 'flex', alignItems: 'flex-end' },
  impactImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 },
  impactOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(11,20,33,.88) 10%, rgba(11,20,33,.25) 60%, rgba(11,20,33,.05))', zIndex: 1 },
  impactContent: { position: 'relative', zIndex: 2, padding: '36px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', gap: '24px', flexWrap: 'wrap' },
  impactTitle: { color: '#fff', fontSize: '24px', fontWeight: '800', letterSpacing: '-.5px', maxWidth: '420px', lineHeight: '1.25' },
  impactStats: { display: 'flex', gap: '28px' },
  impactStatN: { color: '#fff', fontSize: '26px', fontWeight: '800' },
  impactStatL: { color: '#CBD5E1', fontSize: '11.5px', fontWeight: '600' },

  /* CTA */
  ctaBlock: { background: '#0F172A', borderRadius: '24px', padding: '64px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' },
  ctaGlow: { position: 'absolute', width: '300px', height: '300px', background: '#EA4E1B', opacity: .25, filter: 'blur(80px)', borderRadius: '50%', top: '-100px', left: '-60px' },
  ctaTitle: { position: 'relative', fontSize: '38px', fontWeight: '800', color: '#fff', letterSpacing: '-1px', maxWidth: '560px', margin: '0 auto 14px', lineHeight: '1.15' },
  ctaSub: { position: 'relative', fontSize: '14.5px', color: '#94A3B8', marginBottom: '28px', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto' },
  ctaButtons: { position: 'relative', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  ctaWhite: { padding: '13px 24px', background: '#fff', color: '#0F172A', border: 'none', borderRadius: '11px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
  ctaOutline: { padding: '13px 24px', background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,.3)', borderRadius: '11px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },

  /* Footer */
  footer: { borderTop: '1px solid #ECEFF3', padding: '56px 48px 28px' },
  footerGrid: { display: 'grid', gridTemplateColumns: '1.4fr repeat(3, 1fr)', gap: '32px', maxWidth: '1180px', margin: '0 auto 40px' },
  footerTag: { fontSize: '13px', color: '#8593A6', lineHeight: '1.6', maxWidth: '220px', marginTop: '12px' },
  footerHead: { fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '.06em', color: '#8593A6', marginBottom: '14px' },
  footerLink: { display: 'block', fontSize: '13.5px', color: '#0F172A', fontWeight: '500', marginBottom: '10px', cursor: 'pointer' },
  footerBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '24px', borderTop: '1px solid #ECEFF3', fontSize: '12.5px', color: '#8593A6', flexWrap: 'wrap', gap: '12px', maxWidth: '1180px', margin: '0 auto' },
  socials: { display: 'flex', gap: '10px' },
  socialIc: { width: '32px', height: '32px', borderRadius: '9px', background: '#F7F8FA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8593A6' },
}
>>>>>>> feature/auth-ui-forms
