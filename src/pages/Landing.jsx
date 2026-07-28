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
  const [role, setRole] = useState('Student')
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
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
        </div>
      </nav>

      {/* Hero */}
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
            </div>
          </div>
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
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
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
            </div>
          ))}
        </div>
      </section>

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
            </div>
          ))}
        </div>
      </section>

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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
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
        </div>
      </section>

      {/* Footer */}
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
        </div>
      </footer>
    </div>
  )
}
