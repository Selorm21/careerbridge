import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef, useCallback } from 'react'

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState({})
  const [userRole, setUserRole] = useState('Student')
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

  return (
    <div style={S.page}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
        .reveal{opacity:0}
        .reveal.show{animation:fadeUp .8s cubic-bezier(.16,1,.3,1) forwards}
        .imgFloat{animation:float 7s ease-in-out infinite}
        .navBar{transition:all .3s ease}
        .navLink{transition:opacity .2s ease;cursor:pointer}
        .navLink:hover{opacity:.65}
        .btnPrimary{transition:all .25s cubic-bezier(.16,1,.3,1)}
        .btnPrimary:hover{transform:translateY(-2px);box-shadow:0 12px 24px rgba(0,0,0,.15)!important}
        .card{transition:transform .35s cubic-bezier(.16,1,.3,1),box-shadow .35s ease}
        .card:hover{transform:translateY(-4px);box-shadow:0 12px 24px rgba(0,0,0,.08)}
        .roleBtn{transition:all .2s ease;cursor:pointer}
        .roleBtn.active{background:#0F172A;color:#fff;border-color:#0F172A}
        .roleBtn:hover:not(.active){background:#F3F4F6}
        .testimonialCard{transition:all .3s ease}
        .testimonialCard:hover{transform:translateY(-4px);box-shadow:0 12px 24px rgba(0,0,0,.08)}

        @media(max-width: 1024px){
          .heroInner{grid-template-columns:1fr !important; padding:40px 24px 60px !important}
          .heroImg{height:320px !important}
          .h1{font-size:36px !important}
          .statsGrid{grid-template-columns:1fr 1fr !important}
          .featuresGrid{grid-template-columns:1fr 1fr !important}
          .testimonialGrid{grid-template-columns:1fr !important}
        }
        @media(max-width:640px){
          .navBar{padding:12px 16px !important}
          .navCenter{display:none !important}
          .heroInner{padding:24px 16px 40px !important}
          .h1{font-size:28px !important}
          .statsGrid{grid-template-columns:1fr 1fr !important}
          .featuresGrid{grid-template-columns:1fr !important}
          .lead{font-size:14px !important}
          .searchBar{flex-direction:column}
        }
      `}</style>

      {/* Navigation */}
      <nav className="navBar" style={{...S.nav, ...(scrolled ? S.navScrolled : {})}}>
        <div style={S.navLeft}>
          <div style={S.logo}>CareerBridge</div>
        </div>
        <div style={S.navCenter} className="navCenter">
          <span className="navLink" style={S.navLink}>Home</span>
          <span className="navLink" style={S.navLink}>Browse Jobs</span>
          <span className="navLink" style={S.navLink}>For Universities</span>
          <span className="navLink" style={S.navLink}>For Employers</span>
          <span className="navLink" style={S.navLink}>Analytics</span>
        </div>
        <div style={S.navRight}>
          <button style={S.loginBtn} onClick={() => navigate('/login')}>Log in</button>
          <button className="btnPrimary" style={S.signupBtn} onClick={() => navigate('/signup')}>Sign up</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={S.hero}>
        <div style={S.trustBadge}>
          Trusted by 500+ universities
        </div>

        <div style={S.heroInner} className="heroInner">
          <div style={S.heroLeft}>
            <h1 style={S.h1}>Where students, universities & employers connect</h1>
            <p style={S.lead}>CareerBridge is the all-in-one platform that links ambitious students with leading employers, powered by real university partnerships and actionable analytics.</p>
            
            {/* Search Bar */}
            <div style={S.searchBar} className="searchBar">
              <div style={S.searchInputWrapper}>
                <span style={S.searchIcon}>🔍</span>
                <input type="text" placeholder="Search roles, companies, skills..." style={S.searchInputField} />
              </div>
              <button style={S.getStartedBtn} onClick={() => navigate('/signup')}>Get Started</button>
            </div>

            {/* User Role Selector */}
            <div style={S.roleSection}>
              <span style={S.roleLabel}>I am a:</span>
              <div style={S.roleButtons}>
                {['Student', 'University', 'Employer'].map(role => (
                  <button
                    key={role}
                    className={`roleBtn ${userRole === role ? 'active' : ''}`}
                    onClick={() => setUserRole(role)}
                    style={{
                      ...S.roleBtn,
                      ...(userRole === role ? S.roleBtnActive : S.roleBtnInactive)
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <p style={S.roleDesc}>Discover internships and graduate roles matched to your degree.</p>
          </div>

          {/* Hero Image */}
          <div style={S.heroRight}>
            <div className="imgFloat" style={S.imgWrap}>
              <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=640&q=80" alt="Student preparing for opportunities" role="img" loading="lazy" style={S.heroImg} className="heroImg" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={S.statsSection}>
        <div style={S.statsGrid} className="statsGrid">
          <div className={`reveal ${v('stats')}`} ref={setRef('stats')} data-k="stats" style={S.statCard}>
            <div style={S.statNum}>2.4M+</div>
            <div style={S.statLabel}>Active job listings</div>
          </div>
          <div className={`reveal ${v('stats')}`} style={{...S.statCard, animationDelay: '0.1s'}}>
            <div style={S.statNum}>500+</div>
            <div style={S.statLabel}>University partners</div>
          </div>
          <div className={`reveal ${v('stats')}`} style={{...S.statCard, animationDelay: '0.2s'}}>
            <div style={S.statNum}>18K</div>
            <div style={S.statLabel}>Hiring employers</div>
          </div>
          <div className={`reveal ${v('stats')}`} style={{...S.statCard, animationDelay: '0.3s'}}>
            <div style={S.statNum}>92%</div>
            <div style={S.statLabel}>Placement rate</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={S.featuresSection}>
        <div className={`reveal ${v('feat')}`} ref={setRef('feat')} data-k="feat" style={S.sectionHead}>
          <h2 style={S.h2}>Everything you need to bridge the gap</h2>
          <p style={S.sectionSub}>A single platform that brings together job discovery, partnerships, and insights.</p>
        </div>

        <div style={S.featuresGrid} className="featuresGrid">
          {[
            { icon: '🔍', t: 'Smart Job Search', d: 'Filter thousands of roles by degree, skills and location with AI-matched recommendations.' },
            { icon: '🏫', t: 'University Partnerships', d: 'Coordinators manage placements, endorse students and monitor outcomes in one dashboard.' },
            { icon: '🤝', t: 'Employer Connections', d: 'Post roles, screen verified candidates and build a pipeline directly from campus.' },
            { icon: '📊', t: 'Powerful Analytics', d: 'Real-time reporting on applications, placements and hiring trends across your network.' }
          ].map((f, i) => (
            <div key={i} className={`card reveal ${v('feat')}`} style={{...S.featureCard, animationDelay: `${i * 0.1}s`}}>
              <div style={S.featureIcon}>{f.icon}</div>
              <div style={S.featureTitle}>{f.t}</div>
              <div style={S.featureDesc}>{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={S.testimonialSection}>
        <div className={`reveal ${v('testi')}`} ref={setRef('testi')} data-k="testi" style={S.sectionHead}>
          <h2 style={S.h2}>Loved by the whole community</h2>
          <p style={S.sectionSub}>Students, coordinators and recruiters share why they choose CareerBridge.</p>
        </div>

        <div style={S.testimonialGrid} className="testimonialGrid">
          {[
            { 
              name: 'Amara Okafor', 
              role: 'Computer Science Graduate', 
              text: 'I landed my first graduate role within two weeks. The matching was spot on for my degree.',
              stars: 5 
            },
            { 
              name: 'Daniel Rivera', 
              role: 'University Coordinator', 
              text: 'Managing 300 placements used to be a spreadsheet nightmare. Now it\'s all in one place.',
              stars: 5 
            },
            { 
              name: 'Priya Sharma', 
              role: 'Talent Acquisition Lead', 
              text: 'The quality of pre-verified candidates from partner universities cut our hiring time in half.',
              stars: 5 
            }
          ].map((t, i) => (
            <div key={i} className={`testimonialCard reveal ${v('testi')}`} style={{...S.testimonial, animationDelay: `${i * 0.1}s`}}>
              <div style={S.stars}>{'★'.repeat(t.stars)}</div>
              <p style={S.testimonialText}>"{t.text}"</p>
              <div style={S.testimonialAuthor}>
                <div style={S.authorAvatar}>{t.name.split(' ').map(n => n[0]).join('')}</div>
                <div>
                  <div style={S.authorName}>{t.name}</div>
                  <div style={S.authorRole}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={S.ctaSection}>
        <div style={S.ctaBanner}>
          <h2 style={S.ctaTitle}>Ready<br/>to<br/>bridge<br/>your<br/>career?</h2>
          <p style={S.ctaSub}>Join thousands of students, universities and employers already building better futures together.</p>
          <div style={S.ctaButtons}>
            <button style={S.ctaBtnPrimary} onClick={() => navigate('/signup')}>Create free account</button>
            <button style={S.ctaBtnSecondary} onClick={() => navigate('/login')}>Log in</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={S.footer}>
        <div style={S.footerContent}>
          <div style={S.footerSection}>
            <div style={S.footerBrand}>CareerBridge</div>
            <p style={S.footerDesc}>Connecting students, universities and employers for a stronger future workforce.</p>
          </div>
          <div style={S.footerSection}>
            <div style={S.footerTitle}>Product</div>
            <div style={S.footerLink}>Browse Jobs</div>
            <div style={S.footerLink}>Analytics</div>
            <div style={S.footerLink}>Pricing</div>
          </div>
          <div style={S.footerSection}>
            <div style={S.footerTitle}>Company</div>
            <div style={S.footerLink}>About</div>
            <div style={S.footerLink}>Careers</div>
            <div style={S.footerLink}>Contact</div>
          </div>
          <div style={S.footerSection}>
            <div style={S.footerTitle}>Legal</div>
            <div style={S.footerLink}>Privacy</div>
            <div style={S.footerLink}>Terms</div>
            <div style={S.footerLink}>Security</div>
          </div>
        </div>
        <div style={S.footerBottom}>© 2026 CareerBridge. All rights reserved.</div>
      </footer>
    </div>
  )
}

const S = {
  page: { fontFamily: "'Inter', -apple-system, sans-serif", overflowX: 'hidden', color: '#0F172A', background: '#FFFFFF' },
  
  /* Navigation */
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 48px', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #F0F1F3' },
  navScrolled: { boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  navLeft: { display: 'flex', alignItems: 'center' },
  logo: { fontSize: '16px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' },
  navCenter: { display: 'flex', gap: '32px', alignItems: 'center' },
  navLink: { fontSize: '13px', fontWeight: '500', color: '#6B7280' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  loginBtn: { padding: '9px 18px', background: 'transparent', color: '#374151', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  signupBtn: { padding: '9px 20px', background: '#0F172A', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: 'none' },

  /* Hero */
  trustBadge: { textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6B7280', marginBottom: '24px' },
  hero: { padding: '60px 48px 80px' },
  heroInner: { display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '48px', maxWidth: '1280px', margin: '0 auto', alignItems: 'center' },
  heroLeft: {},
  h1: { fontSize: '48px', fontWeight: '900', lineHeight: '1.15', marginBottom: '20px', letterSpacing: '-1.2px', color: '#0F172A' },
  h1Accent: { color: '#2563EB' },
  lead: { fontSize: '15px', color: '#6B7280', lineHeight: '1.7', marginBottom: '32px', maxWidth: '520px' },

  /* Search Bar */
  searchBar: { display: 'flex', gap: '12px', marginBottom: '28px', alignItems: 'center' },
  searchInputWrapper: { display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '10px 12px', flex: 1, background: '#FFFFFF' },
  searchIcon: { fontSize: '16px' },
  searchInputField: { border: 'none', outline: 'none', fontSize: '13px', color: '#6B7280', flex: 1, background: 'transparent' },
  getStartedBtn: { padding: '10px 20px', background: '#0F172A', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' },

  /* Role Section */
  roleSection: { marginBottom: '20px' },
  roleLabel: { fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' },
  roleButtons: { display: 'flex', gap: '8px' },
  roleBtn: { padding: '8px 14px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: '#FFFFFF', color: '#374151', cursor: 'pointer' },
  roleBtnActive: { background: '#0F172A', color: '#fff', border: '1px solid #0F172A' },
  roleBtnInactive: { background: '#FFFFFF', color: '#374151', border: '1px solid #D1D5DB' },
  roleDesc: { fontSize: '12px', color: '#9CA3AF', fontWeight: '500' },

  /* Hero Image */
  heroRight: { position: 'relative' },
  imgWrap: { position: 'relative' },
  heroImg: { width: '100%', height: '400px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 16px 32px rgba(0,0,0,0.12)', display: 'block' },

  /* Stats */
  statsSection: { padding: '56px 48px', background: '#F9FAFB', borderTop: '1px solid #F0F1F3', borderBottom: '1px solid #F0F1F3' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '48px', maxWidth: '1280px', margin: '0 auto' },
  statCard: { textAlign: 'center' },
  statNum: { fontSize: '32px', fontWeight: '900', color: '#0F172A', marginBottom: '4px' },
  statLabel: { fontSize: '13px', color: '#6B7280', fontWeight: '500' },

  /* Features */
  featuresSection: { maxWidth: '1280px', margin: '0 auto', padding: '80px 48px' },
  sectionHead: { textAlign: 'center', marginBottom: '56px' },
  h2: { fontSize: '36px', fontWeight: '900', letterSpacing: '-0.7px', marginBottom: '12px', color: '#0F172A' },
  sectionSub: { fontSize: '14px', color: '#6B7280', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
  featureCard: { background: '#FFFFFF', border: '1px solid #F0F1F3', borderRadius: '14px', padding: '28px 20px', textAlign: 'center' },
  featureIcon: { fontSize: '32px', marginBottom: '16px', display: 'block' },
  featureTitle: { fontSize: '15px', fontWeight: '700', marginBottom: '10px', color: '#0F172A' },
  featureDesc: { fontSize: '13px', color: '#6B7280', lineHeight: '1.6' },

  /* Testimonials */
  testimonialSection: { maxWidth: '1280px', margin: '0 auto', padding: '80px 48px' },
  testimonialGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' },
  testimonial: { background: '#FFFFFF', border: '1px solid #F0F1F3', borderRadius: '14px', padding: '24px' },
  stars: { fontSize: '14px', color: '#FBBF24', marginBottom: '12px', letterSpacing: '1.5px', display: 'block' },
  testimonialText: { fontSize: '13px', color: '#4B5563', lineHeight: '1.7', marginBottom: '16px', fontStyle: 'italic' },
  testimonialAuthor: { display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #F0F1F3', paddingTop: '16px' },
  authorAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '11px', flexShrink: 0 },
  authorName: { fontSize: '12px', fontWeight: '700', color: '#0F172A' },
  authorRole: { fontSize: '11px', color: '#9CA3AF' },

  /* CTA */
  ctaSection: { padding: '60px 48px' },
  ctaBanner: { background: '#1F2937', textAlign: 'center', padding: '80px 60px', borderRadius: '18px', maxWidth: '1280px', margin: '0 auto' },
  ctaTitle: { fontSize: '52px', fontWeight: '900', color: '#fff', marginBottom: '20px', lineHeight: '1.2', letterSpacing: '-1px' },
  ctaSub: { fontSize: '14px', color: '#D1D5DB', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px', lineHeight: '1.7' },
  ctaButtons: { display: 'flex', gap: '12px', justifyContent: 'center' },
  ctaBtnPrimary: { padding: '10px 32px', background: '#fff', color: '#1F2937', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
  ctaBtnSecondary: { padding: '10px 32px', background: 'transparent', color: '#fff', border: '1.5px solid #fff', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },

  /* Footer */
  footer: { background: '#0F172A', color: '#fff', padding: '56px 48px 20px', borderTop: '1px solid #1E293B' },
  footerContent: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', maxWidth: '1280px', margin: '0 auto 40px' },
  footerSection: { fontSize: '13px' },
  footerBrand: { fontSize: '16px', fontWeight: '800', marginBottom: '10px', color: '#fff' },
  footerDesc: { color: '#9CA3AF', fontSize: '12px', lineHeight: '1.6' },
  footerTitle: { fontWeight: '700', marginBottom: '10px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#D1D5DB' },
  footerLink: { color: '#9CA3AF', fontSize: '12px', marginBottom: '8px', cursor: 'pointer' },
  footerBottom: { textAlign: 'center', color: '#6B7280', fontSize: '11px', borderTop: '1px solid #1E293B', paddingTop: '20px' }
}
