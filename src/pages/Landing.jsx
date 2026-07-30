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
        </div>
      </nav>

      {/* Hero */}
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
            </div>
            <div className="floaty" style={S.floaty2}>
              <span style={{...S.floatyDot, background: '#EA4E1B'}}></span> AI-matched today
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
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
            </div>
          ))}
        </div>
      </section>

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
            </div>
          ))}
        </div>
      </section>

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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
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
        </div>
      </section>

      {/* Footer */}
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
        </div>
      </footer>
    </div>
  )
}

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
