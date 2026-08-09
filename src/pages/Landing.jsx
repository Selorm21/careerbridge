import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef, useCallback } from 'react'

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState({})
  const [userRole, setUserRole] = useState('Student')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const refs = useRef({})
  const heroRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)

    // Mouse tracker for Spotlight effect
    const onMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        })
      }
    }
    window.addEventListener('mousemove', onMouseMove)

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setVisible(p => ({ ...p, [e.target.dataset.k]: true })) })
    }, { threshold: 0.12 })
    Object.values(refs.current).forEach(el => el && obs.observe(el))

    return () => { 
      window.removeEventListener('scroll', onScroll) 
      window.removeEventListener('mousemove', onMouseMove)
      obs.disconnect() 
    }
  }, [])

  const setRef = useCallback(k => el => { refs.current[k] = el }, [])
  const v = k => visible[k] ? 'show' : ''

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800;14..32,900&display=swap');
        
        * { box-sizing: border-box; }
        
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes floatPanel{0%,100%{transform:translateY(0px) rotate(0deg)}50%{transform:translateY(-12px) rotate(2deg)}}
        @keyframes drift{0%,100%{transform:translate(0,0)}33%{transform:translate(15px,-15px)}66%{transform:translate(-10px,10px)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        
        .reveal{opacity:0; transform: translateY(20px); transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);}
        .reveal.show{opacity:1; transform: translateY(0);}
        
        .navLink{position:relative;padding:4px 0;transition:color .2s ease;cursor:pointer;font-weight:500;}
        .navLink:hover{color:#0F172A!important}
        .navLink::after{content:'';position:absolute;left:0;right:0;bottom:-4px;height:2px;background:#EA4E1B;border-radius:2px;transform:scaleX(0);transition:transform .2s ease;}
        .navLink:hover::after{transform:scaleX(1);}
        
        .btnGhost{transition:all .2s ease;border: 1px solid transparent;}
        .btnGhost:hover{background:#F1F5F9!important;border-color:#E2E8F0;}
        
        .btnDark{transition:all .2s ease;}
        .btnDark:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(15,23,42,.25);}
        
        .ctaPrimary{transition:all .2s ease;}
        .ctaPrimary:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(234,78,27,.4);}
        
        .roleBtn{transition:all .15s ease;cursor:pointer}
        .roleBtn:hover:not(.active){background:#F1F5F9!important}
        
        .floaty{transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);}
        .floaty:hover{transform: scale(1.05) translateY(-5px)!important;}
        
        .featureCard{transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); border: 1px solid #E2E8F0;}
        .featureCard:hover{transform:translateY(-8px) scale(1.02);box-shadow:0 20px 40px rgba(15,23,42,.06);border-color:#EA4E1B;}
        
        .testiCard{transition:all .3s ease; border: 1px solid #E2E8F0;}
        .testiCard:hover{transform:translateY(-6px);box-shadow:0 16px 32px rgba(15,23,42,.06);border-color:#0F172A;}
        
        .footerLink{transition:color .2s ease;cursor:pointer}
        .footerLink:hover{color:#EA4E1B!important}
        
        .ctaWhite{transition:transform .15s ease,box-shadow .15s ease}
        .ctaWhite:hover{transform:scale(1.02);box-shadow:0 8px 20px rgba(255,255,255,.2);}
        
        .ctaOutline{transition: all .2s ease;}
        .ctaOutline:hover{background:rgba(255,255,255,.1);border-color:#fff;}

        @media(max-width:1024px){
          .heroInner{grid-template-columns:1fr!important; gap: 40px!important;}
          .featuresGrid{grid-template-columns:1fr 1fr!important}
          .stepsGrid{grid-template-columns:1fr 1fr!important;row-gap:36px!important}
          .stepsLine{display:none!important}
          .testimonialGrid{grid-template-columns:1fr!important}
          .footerGrid{grid-template-columns:1fr 1fr!important; gap: 40px!important;}
        }
        @media(max-width:768px){
          .navCenter{display:none!important}
          .h1{font-size:36px!important;letter-spacing:-1px!important}
          .featuresGrid{grid-template-columns:1fr!important}
          .stepsGrid{grid-template-columns:1fr!important}
          .searchRow{flex-direction:column!important; align-items: stretch!important;}
          .searchBox{width: 100%!important;}
          .miniMockup{display:none!important}
          .floaty{display:none!important}
          .impactContent{flex-direction:column!important;align-items:flex-start!important; gap: 20px!important;}
          .statsGrid{grid-template-columns:1fr 1fr!important}
          .statDivider{border-right: none!important; border-bottom: 1px solid #E2E8F0;}
        }
      `}</style>

      {/* Navigation */}
      <nav style={{...S.nav, ...(scrolled ? S.navScrolled : {})}}>
        <div style={S.logoRow}>
          <div style={S.logoMark}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.84-1 .5-2.5.5-2.5s-1.5-.34-2.5.5z" />
              <path d="M11.5 4.5c1.5-1.26 5-2 5-2s.5 3.74-2 5c-1 .84-2.5.5-2.5.5s-.34-1.5.5-2.5z" />
              <path d="M15.5 8.5c3 3 5 7 5 10s-3 3-5 2-7-2-10-5c-.84 1-1.5 2.5-1.5 2.5s-1.5-.34-2.5.5c-1.26 1.5-2 5-2 5s3.74-.5 5-2c.84-1 .5-2.5.5-2.5s2.5-1.5 3.5-2.5c-3-3-5-7-5-10s3-3 5-2 7 2 10 5z" />
            </svg>
          </div>
          <span style={S.logoText}>CareerBridge</span>
        </div>
        <div style={S.navCenter} className="navCenter">
          <span className="navLink" style={S.navLink}>Home</span>
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
      <section ref={heroRef} style={S.hero}>
        {/* Dynamic glowing spotlight effect */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(234, 78, 27, 0.08), transparent 40%)`
        }} />
        
        <div className="blob" style={S.blob1}></div>
        <div className="blob" style={{...S.blob2, animationDelay: '3s'}}></div>
        <div style={S.gridBg}></div>

        <div style={S.heroInner} className="heroInner">
          <div style={{position: 'relative', zIndex: 1}}>
            <div style={S.eyebrow}>
              <span style={S.dots}>
                <span style={{...S.dot, opacity: .5}}></span>
                <span style={{...S.dot, opacity: .8}}></span>
                <span style={{...S.dot, opacity: 1}}></span>
              </span>
              Trusted by 500+ universities
            </div>

            <h1 style={S.h1} className="h1">Where <span style={S.h1Accent}>students</span>, universities <span style={S.h1Accent}>&amp; employers</span> connect</h1>
            <p style={S.lead}>CareerBridge is the all-in-one platform linking ambitious students with leading employers. Powered by real partnerships and actionable analytics.</p>

            <div style={S.searchRow} className="searchRow">
              <div style={S.searchBox}>
                <span style={S.searchIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
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
          </div>

          <div style={{...S.photoWrap, position: 'relative', zIndex: 1}}>
            <div className="floaty" style={S.floaty1}>
              <span style={{...S.floatyDot, background: '#0E9C8F'}}></span> 92% placement rate
            </div>
            <img
              style={S.heroPhoto}
              alt="Students collaborating on laptops"
              src="https://images.unsplash.com/photo-1758270705290-62b6294dd044?fm=jpg&q=70&w=900&auto=format&fit=crop"
            />
            <div className="miniMockup" style={S.miniMockup}>
              <div style={S.mmTop}>
                <span style={S.mmLabel}>Match rate</span>
                <span style={S.mmPct}>73.5%</span>
              </div>
              <div style={S.mmBars}>
                {[35, 55, 40, 70, 60, 85, 95].map((h, i) => (
                  <div key={i} style={{...S.mmBar, height: `${h}%`, animationDelay: `${i * 0.1}s`}}></div>
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
          <p style={S.sectionSub}>A single platform bringing together job discovery, partnerships, and insight.</p>
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
          <p style={S.sectionSub}>From profile to placement in four seamless steps.</p>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.84-1 .5-2.5.5-2.5s-1.5-.34-2.5.5z" />
                  <path d="M11.5 4.5c1.5-1.26 5-2 5-2s.5 3.74-2 5c-1 .84-2.5.5-2.5.5s-.34-1.5.5-2.5z" />
                  <path d="M15.5 8.5c3 3 5 7 5 10s-3 3-5 2-7-2-10-5c-.84 1-1.5 2.5-1.5 2.5s-1.5-.34-2.5.5c-1.26 1.5-2 5-2 5s3.74-.5 5-2c.84-1 .5-2.5.5-2.5s2.5-1.5 3.5-2.5c-3-3-5-7-5-10s3-3 5-2 7 2 10 5z" />
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
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 48px', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,.75)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #F1F5F9' },
  navScrolled: { boxShadow: '0 4px 20px rgba(0,0,0,0.03)' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoMark: { width: '32px', height: '32px', borderRadius: '10px', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(15,23,42,0.15)' },
  logoText: { fontWeight: '800', fontSize: '18px', letterSpacing: '-.4px', color: '#0F172A' },
  navCenter: { display: 'flex', gap: '32px', alignItems: 'center' },
  navLink: { fontSize: '14px', fontWeight: '600', color: '#64748B' },
  navRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  loginBtn: { padding: '10px 18px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700', borderRadius: '10px', color: '#0F172A' },
  signupBtn: { padding: '10px 20px', background: '#0F172A', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' },

  /* Hero */
  hero: { position: 'relative', overflow: 'hidden', padding: '80px 48px 80px' },
  gridBg: { position: 'absolute', inset: 0, zIndex: 0, opacity: 0.4, backgroundImage: `radial-gradient(#E2E8F0 1px, transparent 1px)`, backgroundSize: '32px 32px' },
  blob1: { position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', filter: 'blur(80px)', opacity: .15, background: '#EA4E1B', top: '-180px', right: '-160px', zIndex: 0, animation: 'drift 16s ease-in-out infinite' },
  blob2: { position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', filter: 'blur(80px)', opacity: .1, background: '#0E9C8F', bottom: '-160px', right: '200px', zIndex: 0, animation: 'drift 14s ease-in-out infinite' },
  heroInner: { position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: '60px', alignItems: 'center', maxWidth: '1180px', margin: '0 auto' },

  eyebrow: { display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: '700', letterSpacing: '.05em', color: '#64748B', textTransform: 'uppercase', marginBottom: '20px' },
  dots: { display: 'flex', gap: '5px' },
  dot: { width: '6px', height: '6px', borderRadius: '50%', background: '#EA4E1B' },

  h1: { fontSize: '54px', lineHeight: '1.05', fontWeight: '900', letterSpacing: '-2px', marginBottom: '24px', color: '#0F172A' },
  h1Accent: { color: '#EA4E1B' },
  lead: { fontSize: '17px', lineHeight: '1.6', color: '#64748B', maxWidth: '480px', marginBottom: '32px' },

  searchRow: { display: 'flex', gap: '12px', marginBottom: '24px', maxWidth: '540px' },
  searchBox: { flex: 1, display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: '14px', padding: '0 16px', boxShadow: '0 2px 10px rgba(15,23,42,.02)' },
  searchIcon: { display: 'flex', flexShrink: 0 },
  searchInput: { border: 'none', outline: 'none', padding: '15px 0', fontSize: '15px', fontFamily: 'inherit', flex: 1, color: '#0F172A', background: 'transparent', width: '100%' },
  ctaPrimary: { padding: '15px 28px', background: '#EA4E1B', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 6px 20px rgba(234,78,27,.25)', whiteSpace: 'nowrap' },

  whoRow: { display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', fontWeight: '600', color: '#64748B', marginBottom: '10px' },
  segmented: { display: 'inline-flex', gap: '4px', background: '#F1F5F9', padding: '4px', borderRadius: '12px' },
  segBtn: { padding: '8px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: '700', color: '#64748B' },
  segBtnActive: { background: '#0F172A', color: '#fff', boxShadow: '0 2px 8px rgba(15,23,42,0.1)' },
  heroHint: { fontSize: '13px', color: '#94A3B8', marginTop: '14px' },

  photoWrap: { position: 'relative' },
  heroPhoto: { width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: '28px', boxShadow: '0 40px 70px -20px rgba(15,23,42,.25)' },
  miniMockup: { position: 'absolute', left: '-10%', bottom: '-8%', width: '65%', minWidth: '230px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 24px 48px rgba(15,23,42,.15)', padding: '16px 18px' },
  mmTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  mmLabel: { fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '.05em' },
  mmPct: { fontSize: '24px', fontWeight: '900', color: '#EA4E1B' },
  mmBars: { display: 'flex', alignItems: 'flex-end', gap: '5px', height: '40px' },
  mmBar: { flex: 1, background: 'linear-gradient(180deg,#EA4E1B,#f97316)', borderRadius: '3px 3px 0 0', animation: 'shimmer 2s infinite', backgroundSize: '200% 100%' },
  floaty1: { position: 'absolute', top: '6%', left: '-12%', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '14px', boxShadow: '0 16px 32px rgba(15,23,42,.08)', padding: '12px 18px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', color: '#0F172A' },
  floaty2: { position: 'absolute', bottom: '6%', right: '-14%', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '14px', boxShadow: '0 16px 32px rgba(15,23,42,.08)', padding: '12px 18px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', color: '#0F172A' },
  floatyDot: { width: '10px', height: '10px', borderRadius: '50%' },

  /* Stats */
  statsSection: { background: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '32px 48px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', maxWidth: '1180px', margin: '0 auto' },
  stat: { textAlign: 'center', padding: '8px 16px', position: 'relative' },
  statDivider: { borderRight: '1px solid #E2E8F0' },
  statNum: { fontSize: '32px', fontWeight: '900', letterSpacing: '-1px', color: '#0F172A' },
  statLabel: { fontSize: '13px', color: '#64748B', fontWeight: '600', marginTop: '4px' },

  /* Shared section */
  section: { maxWidth: '1180px', margin: '0 auto', padding: '88px 48px' },
  sectionHead: { textAlign: 'center', maxWidth: '560px', margin: '0 auto 48px' },
  h2: { fontSize: '36px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '10px', color: '#0F172A' },
  sectionSub: { fontSize: '15px', color: '#64748B' },

  /* Features */
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
  featureCard: { background: '#fff', borderRadius: '20px', padding: '28px 24px' },
  featureIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px', fontSize: '22px' },
  featureTitle: { fontSize: '16px', fontWeight: '800', marginBottom: '6px', color: '#0F172A' },
  featureDesc: { fontSize: '14px', color: '#64748B', lineHeight: '1.6' },

  /* Steps */
  stepsWrap: { position: 'relative' },
  stepsLine: { position: 'absolute', top: '22px', left: '12.5%', right: '12.5%', height: '2px', background: 'repeating-linear-gradient(to right, #E2E8F0 0 8px, transparent 8px 16px)' },
  stepsGrid: { position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' },
  step: { position: 'relative', textAlign: 'center' },
  stepNum: { width: '44px', height: '44px', borderRadius: '50%', color: '#fff', fontWeight: '800', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', position: 'relative', zIndex: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
  stepTitle: { fontSize: '16px', fontWeight: '800', marginBottom: '6px', color: '#0F172A' },
  stepDesc: { fontSize: '13px', color: '#64748B', lineHeight: '1.6', maxWidth: '200px', margin: '0 auto' },

  /* Testimonials */
  testiSection: { background: '#F8FAFC', padding: '88px 48px' },
  testimonialGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  testiCard: { background: '#fff', borderRadius: '20px', padding: '28px 24px', boxShadow: '0 2px 10px rgba(15,23,42,.02)' },
  stars: { color: '#F0A93A', fontSize: '14px', letterSpacing: '2px', marginBottom: '12px' },
  testiQuote: { fontSize: '14px', lineHeight: '1.6', color: '#0F172A', marginBottom: '20px' },
  testiPerson: { display: 'flex', alignItems: 'center', gap: '12px' },
  testiAvatar: { width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '14px', flexShrink: 0 },
  testiName: { fontSize: '14px', fontWeight: '700', color: '#0F172A' },
  testiRole: { fontSize: '12px', color: '#64748B' },

  /* Impact band */
  impactBand: { position: 'relative', borderRadius: '28px', overflow: 'hidden', minHeight: '340px', display: 'flex', alignItems: 'flex-end' },
  impactImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 },
  impactOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(11,20,33,.92) 10%, rgba(11,20,33,.2) 60%, rgba(11,20,33,0))', zIndex: 1 },
  impactContent: { position: 'relative', zIndex: 2, padding: '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', gap: '24px', flexWrap: 'wrap' },
  impactTitle: { color: '#fff', fontSize: '26px', fontWeight: '900', letterSpacing: '-.5px', maxWidth: '420px', lineHeight: '1.25' },
  impactStats: { display: 'flex', gap: '32px' },
  impactStatN: { color: '#fff', fontSize: '28px', fontWeight: '900' },
  impactStatL: { color: '#CBD5E1', fontSize: '12px', fontWeight: '600' },

  /* CTA */
  ctaBlock: { background: '#0F172A', borderRadius: '28px', padding: '72px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' },
  ctaGlow: { position: 'absolute', width: '400px', height: '400px', background: '#EA4E1B', opacity: .15, filter: 'blur(80px)', borderRadius: '50%', top: '-150px', left: '-100px' },
  ctaTitle: { position: 'relative', fontSize: '42px', fontWeight: '900', color: '#fff', letterSpacing: '-1px', maxWidth: '560px', margin: '0 auto 14px', lineHeight: '1.15' },
  ctaSub: { position: 'relative', fontSize: '15px', color: '#94A3B8', marginBottom: '32px', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto' },
  ctaButtons: { position: 'relative', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  ctaWhite: { padding: '14px 28px', background: '#fff', color: '#0F172A', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },
  ctaOutline: { padding: '14px 28px', background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,.15)', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },

  /* Footer */
  footer: { borderTop: '1px solid #E2E8F0', padding: '56px 48px 28px' },
  footerGrid: { display: 'grid', gridTemplateColumns: '1.4fr repeat(3, 1fr)', gap: '40px', maxWidth: '1180px', margin: '0 auto 48px' },
  footerTag: { fontSize: '14px', color: '#64748B', lineHeight: '1.6', maxWidth: '240px', marginTop: '12px' },
  footerHead: { fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '.05em', color: '#64748B', marginBottom: '16px' },
  footerLink: { display: 'block', fontSize: '14px', color: '#0F172A', fontWeight: '500', marginBottom: '10px', cursor: 'pointer' },
  footerBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '28px', borderTop: '1px solid #E2E8F0', fontSize: '13px', color: '#64748B', flexWrap: 'wrap', gap: '12px', maxWidth: '1180px', margin: '0 auto' },
  socials: { display: 'flex', gap: '10px' },
  socialIc: { width: '36px', height: '36px', borderRadius: '10px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', transition: 'all 0.2s', cursor: 'pointer' },
}