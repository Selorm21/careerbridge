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
        @keyframes floatRev{0%,100%{transform:translateY(0)}50%{transform:translateY(14px)}}
        @keyframes pulseDot{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
        .reveal{opacity:0}
        .reveal.show{animation:fadeUp .8s cubic-bezier(.16,1,.3,1) forwards}
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
        .roleBtn{transition:all .2s ease;cursor:pointer}
        .roleBtn.active{background:#2563EB;color:#fff}
        .roleBtn:hover:not(.active){background:#F0F1F3}
        .statBlock{transition:transform .25s ease}
        .statBlock:hover{transform:translateY(-3px)}
        .ctaBtn{transition:all .25s ease}
        .ctaBtn:hover{transform:translateY(-3px);box-shadow:0 16px 32px rgba(0,0,0,.18)!important}
        .testimonialCard{transition:all .3s ease}
        .testimonialCard:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(15,23,42,.08)}
        .placementCard{transition:all .3s ease}
        .placementCard:hover{transform:translateY(-4px);box-shadow:0 16px 32px rgba(15,23,42,.12)}

        /* Responsive tweaks */
        @media(max-width: 980px){
          .heroInner{grid-template-columns:1fr !important; padding:36px 20px 60px !important}
          .heroImg{height:360px !important}
          .h1{font-size:34px !important}
          .lead{max-width:100% !important}
          .navBar{padding:12px 20px !important}
          .navRight{gap:12px !important}
          .statsGrid{grid-template-columns:1fr 1fr !important}
          .featuresGrid{grid-template-columns:1fr 1fr !important}
          .placementGrid{grid-template-columns:1fr !important}
          .testimonialGrid{grid-template-columns:1fr !important}
        }
        @media(max-width:560px){
          .heroImg{height:240px !important}
          .btnPrimary,.btnGhost{padding:12px 18px !important; font-size:14px !important}
          .statsRow{display:none}
          .statsGrid{grid-template-columns:1fr !important}
          .h1{font-size:28px !important}
          .roleButtons{flex-direction:column}
          .searchBar{flex-direction:column}
        }
      `}</style>

      {/* Navigation */}
      <nav className="navBar" style={{...S.nav, ...(scrolled ? S.navScrolled : {})}} aria-label="Main navigation">
        <div style={S.navLeft}>
          <div style={S.logo}>CareerBridge</div>
        </div>
        <div style={S.navCenter}>
          <span className="navLink" style={S.navLink} onClick={() => navigate('/')}>Home</span>
          <span className="navLink" style={S.navLink} onClick={() => navigate('/browse')}>Browse Jobs</span>
          <span className="navLink" style={S.navLink}>For Universities</span>
          <span className="navLink" style={S.navLink}>For Employers</span>
          <span className="navLink" style={S.navLink}>Analytics</span>
        </div>
        <div style={S.navRight}>
          <button style={S.loginBtn} onClick={() => navigate('/login')}>Log in</button>
          <button className="btnPrimary" style={S.navCta} onClick={() => navigate('/signup')}>Sign up</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={S.hero}>
        {/* Trust Badge */}
        <div style={S.trustBadge}>
          Trusted by 500+ universities
        </div>

        <div style={S.heroInner}>
          <div style={S.heroLeft}>
            <h1 style={S.h1}>Where students, universities & employers <span style={S.h1Accent}>connect</span></h1>
            <p style={S.lead}>CareerBridge is the all-in-one platform that links ambitious students with leading employers, powered by real university partnerships and actionable analytics.</p>
            
            {/* Search Bar */}
            <div style={S.searchBar} className="searchBar">
              <div style={S.searchInput}>
                <span style={{fontSize: '18px'}}>🔍</span>
                <input type="text" placeholder="Search roles, companies, skills..." style={S.searchInputField} />
              </div>
              <button style={S.getStartedBtn} onClick={() => navigate('/signup')}>Get Started</button>
            </div>

            {/* User Role Selector */}
            <div style={S.roleSection}>
              <span style={S.roleLabel}>I am a:</span>
              <div style={S.roleButtons} className="roleButtons">
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
              <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=640&q=80" alt="Student preparing for opportunities" role="img" loading="lazy" style={S.heroImg} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={S.statsSection}>
        <div style={S.statsGrid}>
          <div className={`reveal ${v('stats')}`} ref={setRef('stats')} data-k="stats" style={S.statCard}>
            <div style={S.statNum}>2.4M+</div>
            <div style={S.statLabel}>Active job listings</div>
          </div>
          <div className={`reveal ${v('stats')}`} style={{...S.statCard, animationDelay: '0.08s'}}>
            <div style={S.statNum}>500+</div>
            <div style={S.statLabel}>University partners</div>
          </div>
          <div className={`reveal ${v('stats')}`} style={{...S.statCard, animationDelay: '0.16s'}}>
            <div style={S.statNum}>18K</div>
            <div style={S.statLabel}>Hiring employers</div>
          </div>
          <div className={`reveal ${v('stats')}`} style={{...S.statCard, animationDelay: '0.24s'}}>
            <div style={S.statNum}>92%</div>
            <div style={S.statLabel}>Placement rate</div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section style={S.coreSection}>
        <div className={`reveal ${v('core')}`} ref={setRef('core')} data-k="core" style={S.sectionHead}>
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
            <div key={i} className={`card reveal ${v('core')}`} style={{...S.featureCard, animationDelay: `${i * 0.12}s`}}>
              <div style={S.featureIcon}>{f.icon}</div>
              <div style={S.featureTitle}>{f.t}</div>
              <div style={S.featureDesc}>{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Placement Proof Section */}
      <section style={S.placementSection}>
        <div style={S.placementBadge}>Placement proof</div>
        <div className={`reveal ${v('place')}`} ref={setRef('place')} data-k="place" style={S.sectionHead}>
          <h2 style={S.h2}>Trusted outcomes from real coordinator workflows</h2>
          <p style={S.sectionSub}>A successful placement is more than a match — it is a record of follow-up, employer context, and student progress that builds confidence for everyone involved.</p>
        </div>

        <div style={S.placementGrid} className="placementGrid">
          {/* Student Placement Card */}
          <div className={`placementCard reveal ${v('place')}`} style={{...S.placementCard, animationDelay: '0s'}}>
            <div style={S.placementHeader}>
              <div style={S.studentAvatar}>SM</div>
              <div>
                <div style={S.studentName}>Sarah Mitchell</div>
                <div style={S.studentRole}>Software Engineering · Year 4</div>
              </div>
              <div style={S.placedBadge}>Placed</div>
            </div>
            <div style={S.placementDetails}>
              <div style={S.detailRow}>
                <div style={S.detailLabel}>EMPLOYER</div>
                <div style={S.detailValue}>Nimbus Labs</div>
              </div>
              <div style={S.detailRow}>
                <div style={S.detailLabel}>ROLE</div>
                <div style={S.detailValue}>Software Engineer Intern · Full-Time</div>
              </div>
              <div style={S.detailRow}>
                <div style={S.detailLabel}>COORDINATOR NOTE</div>
                <div style={S.detailValue}>Onboarding follow-up recorded for June 4, 2026.</div>
              </div>
            </div>
          </div>

          {/* Placement Status Card */}
          <div className={`placementCard reveal ${v('place')}`} style={{...S.placementCard, animationDelay: '0.12s'}}>
            <div style={S.statusTitle}>
              <span style={S.checkIcon}>✓</span>
              Placement confirmed
            </div>
            <p style={S.statusDesc}>Coordinator actions keep the record current and actionable.</p>
            
            <div style={S.statusUpdate}>
              <div style={S.updateIcon}>✓</div>
              <div>
                <div style={S.updateTitle}>Note saved</div>
                <div style={S.updateDesc}>The latest coordinator note was added to Sarah's placement timeline.</div>
              </div>
            </div>

            <div style={S.statusDetail}>
              <div style={S.detailLabel}>FOLLOW-UP DATE</div>
              <div style={S.detailValue}>June 4, 2026</div>
            </div>

            <div style={S.statusDetail}>
              <div style={S.detailLabel}>STATUS</div>
              <div style={S.detailValue}>Placed · Confirmed Full-Time Offer</div>
            </div>
          </div>

          {/* Recent Notes Card */}
          <div className={`placementCard reveal ${v('place')}`} style={{...S.placementCard, animationDelay: '0.24s'}}>
            <div style={S.statusTitle}>
              <span style={{fontSize: '18px'}}>📝</span>
              Recent notes
            </div>
            <p style={S.statusDesc}>Latest coordinator updates on this placement.</p>

            <div style={S.noteItem}>
              <div style={S.noteTitle}>Coordinator note saved</div>
              <div style={S.notePriority}>Normal</div>
              <div style={S.noteDesc}>Onboarding follow-up recorded and assigned for June 4, 2026.</div>
            </div>

            <div style={S.noteItem}>
              <div style={S.noteTitle}>Offer packet pending</div>
              <div style={S.notePriority}>Normal</div>
              <div style={S.noteDesc}>Awaiting signed copy from employer contact.</div>
            </div>

            <div style={S.noteItem}>
              <div style={S.noteTitle}>Placement confirmed</div>
              <div style={S.notePriority}>Low</div>
              <div style={S.noteDesc}>Sarah accepted the full-time offer with Nimbus Labs.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights for Each Role */}
      <section style={S.highlightSection}>
        <div className={`reveal ${v('high')}`} ref={setRef('high')} data-k="high" style={S.sectionHead}>
          <h2 style={S.h2}>One platform, every career journey</h2>
          <p style={S.sectionSub}>From student readiness to placement success, CareerBridge keeps every step connected with clear workflows, trusted outcomes, and coordinator visibility.</p>
        </div>
        <div style={S.highlightGrid}>
          {[
            { icon: '👨‍🎓', t: 'For students', d: 'Land your first role with confidence through guided applications, interview prep, and placement tracking.', features: ['AI resume feedback', 'One-click apply', 'Interview prep'] },
            { icon: '🏢', t: 'For employers', d: 'Hire better talent faster with streamlined candidate review and placement-ready workflows.', features: ['Smart candidate ranking', 'Bulk application review', 'ATS integration'] },
            { icon: '🤖', t: 'AI-powered support', d: 'Our matching engine learns from successful placements to improve every recommendation.', features: ['Semantic skill matching', 'Career forecasting', 'Placement insights'] }
          ].map((h, i) => (
            <div key={i} className={`card reveal ${v('high')}`} style={{...S.highlightCard, animationDelay: `${i * 0.12}s`}}>
              <div style={S.highlightIcon}>{h.icon}</div>
              <div style={S.highlightTitle}>{h.t}</div>
              <div style={S.highlightDesc}>{h.d}</div>
              <div style={S.featuresList}>
                {h.features.map((feat, j) => (
                  <div key={j} style={S.featureItem}>
                    <span style={S.checkmark}>✓</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
              <div style={S.ctaLink}>{h.t === 'For students' ? 'Free tools for students →' : h.t === 'For employers' ? 'Start hiring →' : 'Explore AI insights →'}</div>
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
            { name: 'Amara Okafor', role: 'Computer Science Graduate', text: 'I landed my first graduate role within two weeks. The matching was spot on for my degree.', stars: 5 },
            { name: 'Daniel Rivera', role: 'University Coordinator', text: 'Managing 300 placements used to be a spreadsheet nightmare. Now it\'s all in one place.', stars: 5 },
            { name: 'Priya Sharma', role: 'Talent Acquisition Lead', text: 'The quality of pre-verified candidates from partner universities cut our hiring time in half.', stars: 5 }
          ].map((t, i) => (
            <div key={i} className={`testimonialCard reveal ${v('testi')}`} style={{...S.testimonial, animationDelay: `${i * 0.12}s`}}>
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
          <h2 style={S.ctaTitle}>Ready to bridge your career?</h2>
          <p style={S.ctaSub}>Join thousands of students, universities and employers already building better futures together.</p>
          <div style={S.ctaButtons}>
            <button className="ctaBtn" style={S.ctaBtnPrimary} onClick={() => navigate('/signup')}>Create free account</button>
            <button className="ctaBtn" style={S.ctaBtnSecondary} onClick={() => navigate('/login')}>Log in</button>
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
        <div style={S.footerBottom}>© 2026 CareerBridge. All rights reserved. | Built by student success teams</div>
      </footer>
    </div>
  )
}

const S = {
  page: { fontFamily: "'Inter', -apple-system, sans-serif", overflowX: 'hidden', color: '#0F172A', background: '#FFFFFF' },
  
  /* Navigation */
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 48px', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #E2E8F0' },
  navScrolled: { boxShadow: '0 1px 3px rgba(15,23,42,0.1)', background: 'rgba(255,255,255,0.98)' },
  navLeft: { display: 'flex', alignItems: 'center', gap: '32px' },
  logo: { fontSize: '18px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' },
  navCenter: { display: 'flex', gap: '28px', flex: 1, justifyContent: 'center' },
  navLink: { fontSize: '14px', fontWeight: '500', color: '#4B5563' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  loginBtn: { padding: '10px 20px', background: 'transparent', color: '#4B5563', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  navCta: { padding: '10px 24px', background: '#0F172A', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },

  /* Hero Section */
  trustBadge: { textAlign: 'left', fontSize: '13px', fontWeight: '500', color: '#64748B', paddingTop: '0', marginBottom: '24px' },
  hero: { position: 'relative', overflow: 'hidden', padding: '60px 48px' },
  heroInner: { display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '56px', maxWidth: '1280px', margin: '0 auto', alignItems: 'center', position: 'relative', zIndex: 1 },
  heroLeft: { animation: 'fadeUp 0.8s cubic-bezier(.16,1,.3,1) forwards' },
  h1: { fontSize: '52px', fontWeight: '800', lineHeight: '1.1', marginBottom: '20px', letterSpacing: '-1.5px' },
  h1Accent: { color: '#2563EB' },
  lead: { fontSize: '17px', color: '#64748B', lineHeight: '1.7', marginBottom: '32px', maxWidth: '520px' },

  /* Search Bar */
  searchBar: { display: 'flex', gap: '12px', marginBottom: '36px', alignItems: 'center' },
  searchInput: { display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px 20px', flex: 1 },
  searchInputField: { border: 'none', outline: 'none', fontSize: '14px', color: '#4B5563', width: '100%', background: 'transparent' },
  getStartedBtn: { padding: '14px 28px', background: '#0F172A', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },

  /* User Role Section */
  roleSection: { marginBottom: '20px' },
  roleLabel: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#4B5563', marginBottom: '10px' },
  roleButtons: { display: 'flex', gap: '12px' },
  roleBtn: { padding: '10px 20px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', fontWeight: '600', background: '#fff', color: '#4B5563' },
  roleBtnActive: { background: '#2563EB', color: '#fff', border: '1px solid #2563EB' },
  roleBtnInactive: { background: '#fff', color: '#4B5563', border: '1px solid #E2E8F0' },
  roleDesc: { fontSize: '13px', color: '#94A3B8', fontWeight: '500' },

  heroRight: { position: 'relative' },
  imgWrap: { position: 'relative' },
  heroImg: { width: '100%', height: '420px', objectFit: 'cover', borderRadius: '18px', boxShadow: '0 20px 40px rgba(15,23,42,0.15)', display: 'block' },

  /* Stats Section */
  statsSection: { padding: '48px 48px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', maxWidth: '1280px', margin: '0 auto' },
  statCard: { textAlign: 'center' },
  statNum: { fontSize: '36px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' },
  statLabel: { fontSize: '14px', color: '#64748B', fontWeight: '500' },

  /* Core Features */
  coreSection: { maxWidth: '1280px', margin: '0 auto', padding: '80px 48px' },
  sectionHead: { textAlign: 'center', marginBottom: '56px' },
  h2: { fontSize: '38px', fontWeight: '800', letterSpacing: '-0.8px', marginBottom: '16px', color: '#0F172A' },
  sectionSub: { fontSize: '16px', color: '#64748B', maxWidth: '600px', margin: '0 auto', lineHeight: '1.7' },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
  featureCard: { background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '28px 24px', textAlign: 'center' },
  featureIcon: { fontSize: '32px', marginBottom: '16px' },
  featureTitle: { fontSize: '16px', fontWeight: '700', marginBottom: '10px', color: '#0F172A' },
  featureDesc: { fontSize: '14px', color: '#64748B', lineHeight: '1.65' },

  /* Placement Section */
  placementSection: { maxWidth: '1280px', margin: '0 auto', padding: '80px 48px' },
  placementBadge: { textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '16px', background: '#EFF6FF', display: 'inline-block', padding: '6px 14px', borderRadius: '20px', margin: '0 auto 16px' },
  placementGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '40px' },
  placementCard: { background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px' },
  placementHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #F0F1F3' },
  studentAvatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px' },
  studentName: { fontSize: '14px', fontWeight: '700', color: '#0F172A' },
  studentRole: { fontSize: '12px', color: '#64748B' },
  placedBadge: { marginLeft: 'auto', background: '#ECFDF5', color: '#059669', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
  placementDetails: { display: 'flex', flexDirection: 'column', gap: '14px' },
  detailRow: { display: 'flex', flexDirection: 'column', gap: '4px' },
  detailLabel: { fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' },
  detailValue: { fontSize: '13px', fontWeight: '600', color: '#0F172A' },

  statusTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' },
  checkIcon: { fontSize: '16px', color: '#059669' },
  statusDesc: { fontSize: '13px', color: '#64748B', marginBottom: '16px' },
  statusUpdate: { background: '#ECFDF5', border: '1px solid #D1FAE5', borderRadius: '12px', padding: '14px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' },
  updateIcon: { width: '24px', height: '24px', borderRadius: '50%', background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', flexShrink: 0 },
  updateTitle: { fontSize: '13px', fontWeight: '700', color: '#059669', marginBottom: '2px' },
  updateDesc: { fontSize: '12px', color: '#047857' },
  statusDetail: { marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #F0F1F3' },

  noteItem: { marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid #F0F1F3' },
  noteTitle: { fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' },
  notePriority: { fontSize: '11px', fontWeight: '600', color: '#94A3B8', marginBottom: '4px' },
  noteDesc: { fontSize: '12px', color: '#64748B', lineHeight: '1.5' },

  /* Highlights Section */
  highlightSection: { maxWidth: '1280px', margin: '0 auto', padding: '80px 48px', background: '#F8FAFC', borderRadius: '20px', marginBottom: '80px' },
  highlightGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' },
  highlightCard: { background: '#fff', borderRadius: '16px', padding: '32px 28px', border: '1px solid #E2E8F0' },
  highlightIcon: { fontSize: '40px', marginBottom: '16px', display: 'block' },
  highlightTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '10px', color: '#0F172A' },
  highlightDesc: { fontSize: '14px', color: '#64748B', lineHeight: '1.7', marginBottom: '18px' },
  featuresList: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px', paddingBottom: '18px', borderBottom: '1px solid #E2E8F0' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '500', color: '#0F172A' },
  checkmark: { color: '#059669', fontWeight: '800', fontSize: '14px' },
  ctaLink: { fontSize: '13px', fontWeight: '600', color: '#2563EB', cursor: 'pointer' },

  /* Testimonials */
  testimonialSection: { maxWidth: '1280px', margin: '0 auto', padding: '80px 48px' },
  testimonialGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' },
  testimonial: { background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px' },
  stars: { fontSize: '14px', color: '#FCD34D', marginBottom: '12px', letterSpacing: '1px' },
  testimonialText: { fontSize: '14px', fontStyle: 'italic', color: '#4B5563', lineHeight: '1.7', marginBottom: '16px', borderLeft: '3px solid #2563EB', paddingLeft: '12px' },
  testimonialAuthor: { display: 'flex', alignItems: 'center', gap: '10px' },
  authorAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px' },
  authorName: { fontSize: '13px', fontWeight: '700', color: '#0F172A' },
  authorRole: { fontSize: '12px', color: '#94A3B8' },

  /* CTA Banner */
  ctaSection: { padding: '60px 48px' },
  ctaBanner: { background: '#0F172A', textAlign: 'center', padding: '80px 60px', borderRadius: '24px', maxWidth: '1280px', margin: '0 auto' },
  ctaTitle: { fontSize: '40px', fontWeight: '800', color: '#fff', marginBottom: '16px' },
  ctaSub: { fontSize: '17px', color: '#CBD5E1', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px', lineHeight: '1.7' },
  ctaButtons: { display: 'flex', gap: '16px', justifyContent: 'center' },
  ctaBtnPrimary: { padding: '14px 36px', background: '#fff', color: '#0F172A', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' },
  ctaBtnSecondary: { padding: '14px 36px', background: 'transparent', color: '#fff', border: '1.5px solid #fff', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' },

  /* Footer */
  footer: { background: '#0F172A', color: '#fff', padding: '60px 48px 24px', borderTop: '1px solid #1E293B' },
  footerContent: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', maxWidth: '1280px', margin: '0 auto 40px' },
  footerSection: { fontSize: '14px' },
  footerBrand: { fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: '#fff' },
  footerDesc: { color: '#94A3B8', fontSize: '13px', lineHeight: '1.6' },
  footerTitle: { fontWeight: '700', marginBottom: '12px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#CBD5E1' },
  footerLink: { color: '#94A3B8', fontSize: '13px', marginBottom: '10px', cursor: 'pointer' },
  footerBottom: { textAlign: 'center', color: '#64748B', fontSize: '12px', borderTop: '1px solid #1E293B', paddingTop: '24px' }
}
