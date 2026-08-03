import { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// ---------- inline icon set (shared visual language with Analytics / BrowseJobs / StudentProfile) ----------
const Icon = ({ path, size = 18, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {path}
  </svg>
)
const icons = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
  user: <><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c0-4.1 3.4-7 7.5-7s7.5 2.9 7.5 7" /></>,
  file: <><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v5h5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <><path d="M4 7h16" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" /></>,
  download: <><path d="M12 3v13" /><path d="M7 11l5 5 5-5" /><path d="M4 20h16" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>,
}

const C = {
  bg: '#F8F9FB',
  ink: '#0F172A',
  sub: '#94A3B8',
  border: '#EEF1F5',
  card: '#FFFFFF',
  navActiveBg: '#111827',
  navActiveText: '#FFFFFF',
  navText: '#475569',
  accent: '#EA4E1B',
  teal: '#0E9C8F',
  navy: '#0B3B57',
  gold: '#F0A93A',
  green: '#0E9C6B',
  red: '#DC2626',
  blue: '#2563EB',
}

export default function ResumeBuilder() {
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', linkedin: '', github: '', portfolio: '',
    university: '', course: '', graduationYear: '', classification: '', coursework: '',
    bio: '',
    skillCategories: [
      { category: 'Programming & Web', skills: '' },
      { category: 'Database & Data', skills: '' },
      { category: 'Office & Tools', skills: '' },
      { category: 'Professional Skills', skills: '' }
    ],
    coreCompetencies: '',
    experiences: [{ company: '', role: '', duration: '', description: '' }],
    projects: [{ name: '', tech: '', year: '', description: '' }]
  })
  const [downloading, setDownloading] = useState(false)
  const previewRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser()
<<<<<<< HEAD
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      setFormData(prev => ({ ...prev, fullName: p?.full_name||'', email: p?.email||'', university: p?.university||'', course: p?.course||'', graduationYear: p?.graduation_year||'', bio: p?.bio||'' }))
=======
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)

      // Pre-fill form with profile data
      setFormData(prev => ({
        ...prev,
        fullName: profileData?.full_name || '',
        email: profileData?.email || '',
        university: profileData?.university || '',
        course: profileData?.course || '',
        graduationYear: profileData?.graduation_year || '',
        bio: profileData?.bio || '',
        skills: profileData?.skills || ''
      }))
>>>>>>> feature/auth-ui-forms
    }
    getData()
  }, [])

  async function handleLogout() { await supabase.auth.signOut() }
  function handleInputChange(e) { const {name,value}=e.target; setFormData(prev=>({...prev,[name]:value})) }
  function handleSkillCategoryChange(i,f,v) { const n=[...formData.skillCategories]; n[i][f]=v; setFormData(prev=>({...prev,skillCategories:n})) }
  function handleExperienceChange(i,f,v) { const n=[...formData.experiences]; n[i][f]=v; setFormData(prev=>({...prev,experiences:n})) }
  function handleProjectChange(i,f,v) { const n=[...formData.projects]; n[i][f]=v; setFormData(prev=>({...prev,projects:n})) }
  function addExperience() { setFormData(prev=>({...prev,experiences:[...prev.experiences,{company:'',role:'',duration:'',description:''}]})) }
  function removeExperience(i) { setFormData(prev=>({...prev,experiences:prev.experiences.filter((_,x)=>x!==i)})) }
  function addProject() { setFormData(prev=>({...prev,projects:[...prev.projects,{name:'',tech:'',year:'',description:''}]})) }
  function removeProject(i) { setFormData(prev=>({...prev,projects:prev.projects.filter((_,x)=>x!==i)})) }

  async function downloadPDF() {
    setDownloading(true)
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgHeight = (canvas.height * pdfWidth) / canvas.width
<<<<<<< HEAD
      let position = 0
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight)
      let remaining = imgHeight - pdfHeight
      while (remaining > 0) {
        position -= pdfHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight)
        remaining -= pdfHeight
      }
      pdf.save(`${formData.fullName || 'resume'}.pdf`)
    } catch (err) { alert('PDF failed: ' + err.message) }
=======

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${formData.fullName}-resume.pdf`)
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('Failed to generate PDF')
    }
>>>>>>> feature/auth-ui-forms
    setDownloading(false)
  }

  const navItems = [
    { label: 'Dashboard', icon: 'grid', path: '/student' },
    { label: 'Browse Jobs', icon: 'briefcase', path: '/browse-jobs' },
    { label: 'My Profile', icon: 'user', path: '/student-profile' },
    { label: 'Resume Builder', icon: 'file', path: '/resume-builder', active: true },
    { label: 'Analytics', icon: 'grid', path: '/analytics' },
  ]

  const initials = (name) => (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .pageIn{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) forwards}
<<<<<<< HEAD
        .sideBtn{transition:all .2s ease;cursor:pointer}
        .sideBtn:hover{background:#1E293B!important;color:#fff!important}
        .logoutBtn:hover{background:#FEF2F2!important;color:#DC2626!important}
        .inputF:focus{outline:none;border-color:#2563EB!important;box-shadow:0 0 0 3px rgba(37,99,235,0.1)!important}
        @media(max-width:768px){.sidebar{display:none!important}.main{padding:20px 16px!important}.layout2{grid-template-columns:1fr!important}.previewSection{display:none!important}}
=======
        .cardIn{animation:fadeUp .6s cubic-bezier(.16,1,.3,1) forwards}
        .navBtn{transition:all .15s ease;cursor:pointer}
        .navBtn:hover{background:#F1F5F9!important}
        .navBtn.active:hover{background:${C.navActiveBg}!important}
        .logoutBtn{transition:all .2s ease}
        .logoutBtn:hover{background:#FEF2F2!important;color:${C.red}!important;border-color:#FECACA!important}
        .btn{transition:all .2s ease}
        .btn:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.08)!important}
        .inputF{transition:border-color .2s ease,box-shadow .2s ease}
        .inputF:focus{outline:none;border-color:${C.accent}!important;box-shadow:0 0 0 3px rgba(234,78,27,0.1)!important}
        @media(max-width:1024px){
          .layout2{grid-template-columns:1fr!important}
          .preview{display:none!important}
          .form{width:100%!important}
        }
        @media(max-width:768px){
          .sidebar{display:none!important}
          .main{padding:20px 16px!important}
        }
>>>>>>> feature/auth-ui-forms
      `}</style>

      <div style={S.layout}>
        <aside className="sidebar" style={S.sidebar}>
<<<<<<< HEAD
          <div style={S.sidebarTop}>
            <div style={S.sidebarLogo}>CareerBridge</div>
            <div style={S.avatarWrap}>
              <div style={S.avatar}>{profile?.full_name?.charAt(0)||'S'}</div>
              <div><div style={S.avatarName}>{profile?.full_name||'Student'}</div><div style={S.avatarRole}>Student</div></div>
            </div>
          </div>
          <nav style={S.sideNav}>
            <div className="sideBtn" style={S.sideNavItem} onClick={()=>navigate('/student')}><span style={S.sideNavIcon}>📊</span> Dashboard</div>
            <div className="sideBtn" style={S.sideNavItem} onClick={()=>navigate('/browse-jobs')}><span style={S.sideNavIcon}>🔍</span> Browse Jobs</div>
            <div className="sideBtn" style={S.sideNavItem} onClick={()=>navigate('/student-profile')}><span style={S.sideNavIcon}>👤</span> My Profile</div>
            <div className="sideBtn" style={{...S.sideNavItem,...S.sideNavActive}}><span style={S.sideNavIcon}>📄</span> Resume Builder</div>
          </nav>
          <button className="logoutBtn" style={S.logoutBtn} onClick={handleLogout}>← Log out</button>
=======
          <div style={S.logoRow}>
            <div style={S.logoMark}><Icon path={icons.grid} size={16} /></div>
            <span style={S.logoText}>CareerBridge</span>
          </div>

          <nav style={S.navList}>
            {navItems.map(item => (
              <button
                key={item.label}
                className={`navBtn${item.active ? ' active' : ''}`}
                style={{ ...S.navItem, ...(item.active ? S.navItemActive : {}) }}
                onClick={() => navigate(item.path)}
              >
                <Icon path={icons[item.icon]} size={17} />
                {item.label}
              </button>
            ))}
          </nav>

          <div style={S.sidebarFooter}>
            <div style={S.userAvatar}>{initials(profile?.full_name || 'Student')}</div>
            <div>
              <div style={S.userName}>{profile?.full_name || 'Student'}</div>
              <div style={S.userRole}>Student</div>
            </div>
          </div>
          <button className="logoutBtn" style={S.logoutBtn} onClick={handleLogout}>
            <Icon path={icons.logout} size={15} /> Log out
          </button>
>>>>>>> feature/auth-ui-forms
        </aside>

        <main className="main" style={S.main}>
          <div className="pageIn" style={S.topBar}>
            <div><h1 style={S.heading}>Resume Builder</h1><p style={S.headSub}>Build a professional CV</p></div>
            <button style={S.downloadBtn} onClick={downloadPDF} disabled={downloading}>{downloading?'⏳ Generating...':'📥 Download PDF'}</button>
          </div>

          <div style={S.layout2}>
            <div style={S.formSection}>

              <div style={S.card}>
                <div style={S.cardTitle}>Personal Information</div>
<<<<<<< HEAD
                <div style={S.grid2}>
                  <div style={S.field}><label style={S.label}>Full Name</label><input className="inputF" style={S.input} name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="ERNEST AMUZU" /></div>
                  <div style={S.field}><label style={S.label}>Email</label><input className="inputF" style={S.input} name="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" /></div>
                  <div style={S.field}><label style={S.label}>Phone</label><input className="inputF" style={S.input} name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+233 XX XXX XXXX" /></div>
                  <div style={S.field}><label style={S.label}>LinkedIn</label><input className="inputF" style={S.input} name="linkedin" value={formData.linkedin} onChange={handleInputChange} placeholder="linkedin.com/in/yourname" /></div>
                  <div style={S.field}><label style={S.label}>GitHub</label><input className="inputF" style={S.input} name="github" value={formData.github} onChange={handleInputChange} placeholder="github.com/yourname" /></div>
                  <div style={S.field}><label style={S.label}>Portfolio</label><input className="inputF" style={S.input} name="portfolio" value={formData.portfolio} onChange={handleInputChange} placeholder="yoursite.vercel.app" /></div>
=======
                <div style={S.fieldGroup}>
                  <label style={S.label}>Full Name</label>
                  <input className="inputF" style={S.input} type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Your full name" />
                </div>
                <div style={S.fieldRow}>
                  <div style={S.fieldGroup}>
                    <label style={S.label}>Email</label>
                    <input className="inputF" style={S.input} type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" />
                  </div>
                  <div style={S.fieldGroup}>
                    <label style={S.label}>Phone (Optional)</label>
                    <input className="inputF" style={S.input} type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 (555) 000-0000" />
                  </div>
>>>>>>> feature/auth-ui-forms
                </div>
              </div>

              <div style={S.card}>
                <div style={S.cardTitle}>Education</div>
<<<<<<< HEAD
                <div style={S.grid2}>
                  <div style={S.field}><label style={S.label}>Degree</label><input className="inputF" style={S.input} name="course" value={formData.course} onChange={handleInputChange} placeholder="BSc Computer Science" /></div>
                  <div style={S.field}><label style={S.label}>University</label><input className="inputF" style={S.input} name="university" value={formData.university} onChange={handleInputChange} placeholder="Ghana Communication Technology University" /></div>
                  <div style={S.field}><label style={S.label}>Graduation Year</label><input className="inputF" style={S.input} name="graduationYear" value={formData.graduationYear} onChange={handleInputChange} placeholder="2026" /></div>
                  <div style={S.field}><label style={S.label}>Classification</label><input className="inputF" style={S.input} name="classification" value={formData.classification} onChange={handleInputChange} placeholder="Second Class Upper" /></div>
                </div>
                <div style={S.field}><label style={S.label}>Key Coursework (comma separated)</label><input className="inputF" style={S.input} name="coursework" value={formData.coursework} onChange={handleInputChange} placeholder="Information Systems, Software Engineering, AI" /></div>
              </div>

              <div style={S.card}>
                <div style={S.cardTitle}>Professional Summary</div>
                <textarea className="inputF" style={{...S.input,height:'90px',resize:'vertical'}} name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Motivated Computer Science graduate..." />
              </div>

              <div style={S.card}>
                <div style={S.cardTitle}>Technical Skills & Competencies</div>
                <div style={{fontSize:'12px',color:'#94A3B8',marginBottom:'12px'}}>Each row appears as a table row in the CV</div>
                {formData.skillCategories.map((cat,i)=>(
                  <div key={i} style={S.grid2}>
                    <div style={S.field}><label style={S.label}>Category</label><input className="inputF" style={S.input} value={cat.category} onChange={e=>handleSkillCategoryChange(i,'category',e.target.value)} placeholder="Programming & Web" /></div>
                    <div style={S.field}><label style={S.label}>Skills</label><input className="inputF" style={S.input} value={cat.skills} onChange={e=>handleSkillCategoryChange(i,'skills',e.target.value)} placeholder="JavaScript, Python, React" /></div>
                  </div>
                ))}
                <button style={S.addBtn} onClick={()=>setFormData(prev=>({...prev,skillCategories:[...prev.skillCategories,{category:'',skills:''}]}))}>+ Add category</button>
              </div>

              <div style={S.card}>
                <div style={S.cardTitle}>Core Competencies</div>
                <input className="inputF" style={S.input} name="coreCompetencies" value={formData.coreCompetencies} onChange={handleInputChange} placeholder="Communication Skills, Team Collaboration, Analytical Thinking" />
                <div style={{fontSize:'12px',color:'#94A3B8',marginTop:'6px'}}>Comma separated — shown as chips in the CV</div>
              </div>

              <div style={S.card}>
                <div style={{...S.cardTitle,display:'flex',justifyContent:'space-between',alignItems:'center'}}>Professional Experience <button style={S.addBtn} onClick={addExperience}>+ Add</button></div>
                {formData.experiences.map((exp,i)=>(
                  <div key={i} style={{...S.entryBox,marginBottom:'12px'}}>
                    <div style={S.grid2}>
                      <div style={S.field}><label style={S.label}>Company</label><input className="inputF" style={S.input} value={exp.company} onChange={e=>handleExperienceChange(i,'company',e.target.value)} placeholder="Electricity Company of Ghana" /></div>
                      <div style={S.field}><label style={S.label}>Role</label><input className="inputF" style={S.input} value={exp.role} onChange={e=>handleExperienceChange(i,'role',e.target.value)} placeholder="IT Intern" /></div>
                      <div style={S.field}><label style={S.label}>Duration</label><input className="inputF" style={S.input} value={exp.duration} onChange={e=>handleExperienceChange(i,'duration',e.target.value)} placeholder="June 2023 – August 2023" /></div>
                    </div>
                    <div style={S.field}><label style={S.label}>Responsibilities (one per line)</label><textarea className="inputF" style={{...S.input,height:'80px',resize:'vertical'}} value={exp.description} onChange={e=>handleExperienceChange(i,'description',e.target.value)} placeholder={'Provided technical support\nMaintained network infrastructure'} /></div>
                    {formData.experiences.length>1 && <button style={S.removeBtn} onClick={()=>removeExperience(i)}>Remove</button>}
=======
                <div style={S.fieldGroup}>
                  <label style={S.label}>University</label>
                  <input className="inputF" style={S.input} type="text" name="university" value={formData.university} onChange={handleInputChange} placeholder="University name" />
                </div>
                <div style={S.fieldRow}>
                  <div style={S.fieldGroup}>
                    <label style={S.label}>Course/Degree</label>
                    <input className="inputF" style={S.input} type="text" name="course" value={formData.course} onChange={handleInputChange} placeholder="e.g., Bachelor of Science in Computer Science" />
                  </div>
                  <div style={S.fieldGroup}>
                    <label style={S.label}>Graduation Year</label>
                    <input className="inputF" style={S.input} type="number" name="graduationYear" value={formData.graduationYear} onChange={handleInputChange} placeholder="2024" />
                  </div>
                </div>
              </div>

              <div className="cardIn" style={S.card}>
                <div style={S.cardTitle}>Bio/Summary</div>
                <div style={S.fieldGroup}>
                  <label style={S.label}>Professional Summary</label>
                  <textarea className="inputF" style={{ ...S.input, minHeight: '100px', resize: 'vertical' }} name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Brief professional summary..." />
                </div>
              </div>

              <div className="cardIn" style={S.card}>
                <div style={S.cardTitle}>Skills</div>
                <div style={S.fieldGroup}>
                  <label style={S.label}>Skills (comma-separated)</label>
                  <textarea className="inputF" style={{ ...S.input, minHeight: '80px', resize: 'vertical' }} name="skills" value={formData.skills} onChange={handleInputChange} placeholder="JavaScript, React, Node.js, Python..." />
                </div>
              </div>

              <div className="cardIn" style={S.card}>
                <div style={S.cardHead}>
                  <div style={S.cardTitle}>Work Experience</div>
                  <button className="btn" style={S.addBtn} onClick={addExperience}><Icon path={icons.plus} size={13} /> Add Experience</button>
                </div>
                {formData.experiences.map((exp, idx) => (
                  <div key={idx} style={{ ...S.entryBox, marginBottom: '16px', paddingBottom: '16px', borderBottom: idx < formData.experiences.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <div style={S.fieldRow}>
                      <div style={S.fieldGroup}>
                        <label style={S.label}>Company</label>
                        <input className="inputF" style={S.input} type="text" value={exp.company} onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)} placeholder="Company name" />
                      </div>
                      <div style={S.fieldGroup}>
                        <label style={S.label}>Job Title</label>
                        <input className="inputF" style={S.input} type="text" value={exp.role} onChange={(e) => handleExperienceChange(idx, 'role', e.target.value)} placeholder="e.g., Software Engineer" />
                      </div>
                    </div>
                    <div style={S.fieldGroup}>
                      <label style={S.label}>Duration</label>
                      <input className="inputF" style={S.input} type="text" value={exp.duration} onChange={(e) => handleExperienceChange(idx, 'duration', e.target.value)} placeholder="e.g., Jan 2023 - Dec 2023" />
                    </div>
                    <div style={S.fieldGroup}>
                      <label style={S.label}>Description</label>
                      <textarea className="inputF" style={{ ...S.input, minHeight: '80px', resize: 'vertical' }} value={exp.description} onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)} placeholder="Job responsibilities..." />
                    </div>
                    {formData.experiences.length > 1 && (
                      <button className="btn" style={S.removeBtn} onClick={() => removeExperience(idx)}><Icon path={icons.trash} size={13} /> Remove</button>
                    )}
>>>>>>> feature/auth-ui-forms
                  </div>
                ))}
              </div>

<<<<<<< HEAD
              <div style={S.card}>
                <div style={{...S.cardTitle,display:'flex',justifyContent:'space-between',alignItems:'center'}}>Key Projects <button style={S.addBtn} onClick={addProject}>+ Add</button></div>
                {formData.projects.map((proj,i)=>(
                  <div key={i} style={{...S.entryBox,marginBottom:'12px'}}>
                    <div style={S.grid2}>
                      <div style={S.field}><label style={S.label}>Project Name</label><input className="inputF" style={S.input} value={proj.name} onChange={e=>handleProjectChange(i,'name',e.target.value)} placeholder="CareerBridge — AI Job Placement" /></div>
                      <div style={S.field}><label style={S.label}>Year</label><input className="inputF" style={S.input} value={proj.year} onChange={e=>handleProjectChange(i,'year',e.target.value)} placeholder="2024 – 2025" /></div>
                      <div style={S.field}><label style={S.label}>Tech Stack</label><input className="inputF" style={S.input} value={proj.tech} onChange={e=>handleProjectChange(i,'tech',e.target.value)} placeholder="React, Supabase, PostgreSQL, Vercel" /></div>
                    </div>
                    <div style={S.field}><label style={S.label}>Description (one per line)</label><textarea className="inputF" style={{...S.input,height:'80px',resize:'vertical'}} value={proj.description} onChange={e=>handleProjectChange(i,'description',e.target.value)} placeholder={'Built AI-powered job matching algorithm\nDesigned multi-role dashboards'} /></div>
                    {formData.projects.length>1 && <button style={S.removeBtn} onClick={()=>removeProject(i)}>Remove</button>}
=======
              <div className="cardIn" style={S.card}>
                <div style={S.cardHead}>
                  <div style={S.cardTitle}>Education History</div>
                  <button className="btn" style={S.addBtn} onClick={addEducation}><Icon path={icons.plus} size={13} /> Add Education</button>
                </div>
                {formData.education.map((edu, idx) => (
                  <div key={idx} style={{ ...S.entryBox, marginBottom: '16px', paddingBottom: '16px', borderBottom: idx < formData.education.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <div style={S.fieldRow}>
                      <div style={S.fieldGroup}>
                        <label style={S.label}>Institution</label>
                        <input className="inputF" style={S.input} type="text" value={edu.institution} onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)} placeholder="School/University name" />
                      </div>
                      <div style={S.fieldGroup}>
                        <label style={S.label}>Degree</label>
                        <input className="inputF" style={S.input} type="text" value={edu.degree} onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)} placeholder="e.g., Bachelor of Science" />
                      </div>
                    </div>
                    <div style={S.fieldGroup}>
                      <label style={S.label}>Year</label>
                      <input className="inputF" style={S.input} type="text" value={edu.year} onChange={(e) => handleEducationChange(idx, 'year', e.target.value)} placeholder="e.g., 2024" />
                    </div>
                    {formData.education.length > 1 && (
                      <button className="btn" style={S.removeBtn} onClick={() => removeEducation(idx)}><Icon path={icons.trash} size={13} /> Remove</button>
                    )}
>>>>>>> feature/auth-ui-forms
                  </div>
                ))}
              </div>

<<<<<<< HEAD
            </div>

            <div className="previewSection" style={S.previewSection}>
              <div style={S.previewTitle}>📄 Live Preview</div>
              <div style={S.previewWrap}>
                <div ref={previewRef} style={S.resume}>

                  <div style={R.header}>
                    <div style={R.name}>{formData.fullName||'YOUR NAME'}</div>
                    <div style={R.degree}>{formData.course}{formData.university?` | ${formData.university}`:''}</div>
                    <div style={R.contacts}>
                      {formData.phone&&<span style={R.contact}>📞 {formData.phone}</span>}
                      {formData.email&&<span style={R.contact}>✉ {formData.email}</span>}
                      {formData.linkedin&&<span style={R.contact}>🔗 {formData.linkedin}</span>}
                      {formData.github&&<span style={R.contact}>💻 {formData.github}</span>}
                      {formData.portfolio&&<span style={R.contact}>🌐 {formData.portfolio}</span>}
=======
              <button className="btn" style={S.downloadBtn} onClick={downloadPDF} disabled={downloading}>
                <Icon path={icons.download} size={16} /> {downloading ? 'Generating PDF...' : 'Download as PDF'}
              </button>
            </div>

            <div className="preview" style={S.previewSection}>
              <div style={S.previewTitle}><Icon path={icons.file} size={14} /> Live Preview</div>
              <div ref={previewRef} style={S.preview}>
                <div style={S.resumeContainer}>
                  <div style={S.resumeHeader}>
                    <h1 style={S.resumeName}>{formData.fullName || 'Your Name'}</h1>
                    <div style={S.resumeContact}>
                      {formData.email && <span>{formData.email}</span>}
                      {formData.phone && <span> • {formData.phone}</span>}
>>>>>>> feature/auth-ui-forms
                    </div>
                  </div>

                  {formData.bio&&<div style={R.section}><div style={R.sectionTitle}>PROFESSIONAL SUMMARY</div><div style={R.line}></div><p style={R.bodyText}>{formData.bio}</p></div>}

                  {(formData.course||formData.university)&&(
                    <div style={R.section}>
                      <div style={R.sectionTitle}>EDUCATION</div>
                      <div style={R.line}></div>
                      <div style={R.entryRow}><strong style={R.entryTitle}>{formData.course}</strong><span style={R.entryDate}>{formData.graduationYear}</span></div>
                      <div style={R.entryCompany}>{formData.university}</div>
                      {formData.classification&&<div style={R.bodyText}>Classification: {formData.classification}</div>}
                      {formData.coursework&&<div style={R.bodyText}>Key Coursework: {formData.coursework}</div>}
                    </div>
                  )}

                  {formData.skillCategories.some(c=>c.skills)&&(
                    <div style={R.section}>
                      <div style={R.sectionTitle}>TECHNICAL SKILLS & COMPETENCIES</div>
                      <div style={R.line}></div>
                      <table style={R.skillTable}>
                        <tbody>
                          {formData.skillCategories.filter(c=>c.category&&c.skills).map((cat,i)=>(
                            <tr key={i}><td style={R.skillCat}>{cat.category}</td><td style={R.skillVal}>{cat.skills}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {formData.coreCompetencies&&(
                    <div style={R.section}>
                      <div style={R.sectionTitle}>CORE COMPETENCIES</div>
                      <div style={R.line}></div>
                      <div style={R.chipsRow}>
                        {formData.coreCompetencies.split(',').map((c,i)=><span key={i} style={R.chip}>{c.trim()}</span>)}
                      </div>
                    </div>
                  )}

                  {formData.experiences.some(e=>e.company||e.role)&&(
                    <div style={R.section}>
                      <div style={R.sectionTitle}>PROFESSIONAL EXPERIENCE</div>
                      <div style={R.line}></div>
                      {formData.experiences.map((exp,i)=>(exp.company||exp.role)&&(
                        <div key={i} style={R.entry}>
                          <div style={R.entryRow}><strong style={R.entryTitle}>{exp.role}</strong><span style={R.entryDate}>{exp.duration}</span></div>
                          <div style={R.entryCompany}>{exp.company}</div>
                          {exp.description&&<ul style={R.bulletList}>{exp.description.split('\n').filter(l=>l.trim()).map((line,j)=><li key={j} style={R.bullet}>{line}</li>)}</ul>}
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.projects.some(p=>p.name)&&(
                    <div style={R.section}>
                      <div style={R.sectionTitle}>KEY PROJECTS</div>
                      <div style={R.line}></div>
                      {formData.projects.map((proj,i)=>proj.name&&(
                        <div key={i} style={R.entry}>
                          <div style={R.entryRow}><strong style={R.entryTitle}>{proj.name}</strong><span style={R.entryDate}>{proj.year}</span></div>
                          {proj.tech&&<div style={R.techStack}>{proj.tech}</div>}
                          {proj.description&&<ul style={R.bulletList}>{proj.description.split('\n').filter(l=>l.trim()).map((line,j)=><li key={j} style={R.bullet}>{line}</li>)}</ul>}
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

const S = {
<<<<<<< HEAD
  page:{minHeight:'100vh',background:'#F1F5F9',fontFamily:"'Inter',-apple-system,sans-serif"},
  layout:{display:'grid',gridTemplateColumns:'260px 1fr',minHeight:'100vh'},
  sidebar:{background:'#0F172A',display:'flex',flexDirection:'column',padding:'0',position:'sticky',top:0,height:'100vh',overflowY:'auto'},
  sidebarTop:{padding:'28px 24px 20px'},
  sidebarLogo:{fontSize:'18px',fontWeight:'800',color:'#fff',letterSpacing:'-0.5px',marginBottom:'28px'},
  avatarWrap:{display:'flex',alignItems:'center',gap:'12px'},
  avatar:{width:'42px',height:'42px',borderRadius:'50%',background:'linear-gradient(135deg,#2563EB,#3B82F6)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',fontWeight:'800'},
  avatarName:{fontSize:'14px',fontWeight:'700',color:'#F1F5F9'},
  avatarRole:{fontSize:'11.5px',color:'#64748B',fontWeight:'500'},
  sideNav:{padding:'20px 12px',flex:1},
  sideNavItem:{display:'flex',alignItems:'center',gap:'10px',padding:'11px 14px',borderRadius:'10px',fontSize:'14px',fontWeight:'600',color:'#94A3B8',marginBottom:'4px'},
  sideNavActive:{background:'#1E293B',color:'#fff'},
  sideNavIcon:{fontSize:'16px'},
  logoutBtn:{margin:'0 12px 24px',padding:'11px',background:'transparent',border:'1px solid #1E293B',borderRadius:'10px',cursor:'pointer',fontSize:'13px',fontWeight:'600',color:'#64748B',textAlign:'left'},
  main:{padding:'32px 36px',overflowY:'auto'},
  topBar:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'28px'},
  heading:{fontSize:'26px',fontWeight:'800',color:'#0F172A',marginBottom:'4px'},
  headSub:{fontSize:'14px',color:'#94A3B8'},
  downloadBtn:{padding:'12px 24px',background:'#2563EB',color:'#fff',border:'none',borderRadius:'10px',cursor:'pointer',fontSize:'14px',fontWeight:'700',boxShadow:'0 4px 12px rgba(37,99,235,0.25)'},
  layout2:{display:'grid',gridTemplateColumns:'1fr 420px',gap:'24px'},
  formSection:{},
  previewSection:{position:'sticky',top:'32px',height:'fit-content'},
  previewTitle:{fontSize:'14px',fontWeight:'700',color:'#0F172A',marginBottom:'10px'},
  previewWrap:{background:'#fff',border:'1px solid #E5E7EB',borderRadius:'12px',padding:'8px',maxHeight:'85vh',overflowY:'auto'},
  card:{background:'#fff',borderRadius:'16px',padding:'22px',border:'1px solid #F0F2F5',boxShadow:'0 2px 8px rgba(15,23,42,0.04)',marginBottom:'16px'},
  cardTitle:{fontSize:'15px',fontWeight:'800',color:'#0F172A',marginBottom:'16px'},
  grid2:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'},
  field:{marginBottom:'14px'},
  label:{display:'block',fontSize:'12.5px',fontWeight:'700',marginBottom:'6px',color:'#374151'},
  input:{width:'100%',padding:'10px 12px',border:'1.5px solid #E5E7EB',borderRadius:'8px',fontSize:'13px',fontFamily:'inherit',boxSizing:'border-box',color:'#0F172A'},
  entryBox:{background:'#F8FAFC',borderRadius:'10px',padding:'14px'},
  addBtn:{padding:'7px 14px',background:'#EFF6FF',color:'#2563EB',border:'none',borderRadius:'8px',fontSize:'12.5px',fontWeight:'700',cursor:'pointer'},
  removeBtn:{padding:'6px 12px',background:'#FEF2F2',color:'#DC2626',border:'none',borderRadius:'8px',fontSize:'12px',fontWeight:'600',cursor:'pointer',marginTop:'8px'},
  resume:{fontFamily:"'Times New Roman',Georgia,serif",fontSize:'10px',color:'#000',background:'#fff',padding:'28px 32px',minWidth:'500px'},
=======
  page: { minHeight: '100vh', background: C.bg, fontFamily: "'Inter', -apple-system, sans-serif" },
  layout: { display: 'grid', gridTemplateColumns: '232px 1fr', minHeight: '100vh' },

  // sidebar (shared light style with Analytics / BrowseJobs / StudentProfile)
  sidebar: { background: C.card, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', padding: '22px 16px', position: 'sticky', top: 0, height: '100vh' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px', marginBottom: '28px' },
  logoMark: { width: '30px', height: '30px', borderRadius: '9px', background: C.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: '17px', fontWeight: '800', color: C.ink, letterSpacing: '-0.4px' },
  navList: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  navItem: { display: 'flex', alignItems: 'center', gap: '11px', padding: '10px 12px', borderRadius: '10px', border: 'none', background: 'transparent', color: C.navText, fontSize: '14px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' },
  navItemActive: { background: C.navActiveBg, color: C.navActiveText },
  sidebarFooter: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 10px', borderTop: `1px solid ${C.border}`, marginTop: '10px' },
  userAvatar: { width: '34px', height: '34px', borderRadius: '10px', background: '#F1F5F9', color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' },
  userName: { fontSize: '13.5px', fontWeight: '700', color: C.ink, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole: { fontSize: '12px', color: C.sub },
  logoutBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', marginTop: '10px', padding: '10px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: C.navText },

  main: { padding: '32px 36px', overflowY: 'auto', paddingBottom: '40px' },
  topBar: { marginBottom: '28px' },
  heading: { fontSize: '25px', fontWeight: '800', color: C.ink, marginBottom: '4px', letterSpacing: '-0.5px' },
  headSub: { fontSize: '14px', color: C.sub },

  layout2: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' },
  formSection: { width: '100%' },
  previewSection: { position: 'sticky', top: '32px', height: 'fit-content' },
  previewTitle: { display: 'flex', alignItems: 'center', gap: '7px', fontSize: '14px', fontWeight: '700', color: C.ink, marginBottom: '12px' },

  card: { background: C.card, borderRadius: '16px', padding: '20px', border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.04)', marginBottom: '20px' },
  cardTitle: { fontSize: '15px', fontWeight: '800', color: C.ink, marginBottom: '16px' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },

  fieldGroup: { marginBottom: '16px' },
  fieldRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: C.navText },
  input: { width: '100%', padding: '10px 12px', border: `1.5px solid ${C.border}`, borderRadius: '8px', fontSize: '13px', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', color: C.ink },

  entryBox: { background: '#FAFBFC', padding: '16px', borderRadius: '10px' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#FFF4EE', color: C.accent, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
  removeBtn: { display: 'flex', alignItems: 'center', gap: '5px', marginTop: '12px', padding: '6px 12px', background: '#FEF2F2', color: C.red, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },

  downloadBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', background: C.accent, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(234,78,27,0.28)' },

  // The preview mirrors an actual printed resume, so it stays neutral/professional rather than orange-branded.
  preview: { background: '#fff', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px', fontSize: '12px', maxHeight: '600px', overflowY: 'auto' },
  resumeContainer: { background: '#fff', padding: '0' },
  resumeHeader: { marginBottom: '16px', paddingBottom: '12px', borderBottom: `2px solid ${C.navy}` },
  resumeName: { fontSize: '18px', fontWeight: '800', color: C.ink, margin: '0 0 6px 0' },
  resumeContact: { fontSize: '11px', color: C.navText },

  resumeSection: { marginBottom: '12px' },
  resumeSectionTitle: { fontSize: '12px', fontWeight: '700', color: C.ink, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' },
  resumeEntry: { marginBottom: '8px' },
  resumeEntryHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', color: C.ink },
  resumeDate: { fontSize: '11px', color: C.sub, fontWeight: '500' },
  resumeSubtext: { fontSize: '11px', color: C.navText, marginBottom: '4px' },
  resumeText: { fontSize: '11px', color: '#374151', margin: '4px 0', lineHeight: '1.4' },
  resumeSkills: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  resumeSkillChip: { background: '#F1F5F9', color: C.navy, padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600' }
>>>>>>> feature/auth-ui-forms
}

const R = {
  header:{textAlign:'center',marginBottom:'14px',paddingBottom:'10px',borderBottom:'2px solid #8B0000'},
  name:{fontSize:'20px',fontWeight:'900',color:'#8B0000',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'4px'},
  degree:{fontSize:'10px',color:'#444',marginBottom:'6px',fontStyle:'italic'},
  contacts:{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'10px'},
  contact:{fontSize:'9.5px',color:'#333'},
  section:{marginBottom:'12px'},
  sectionTitle:{fontSize:'10.5px',fontWeight:'900',color:'#000',letterSpacing:'0.8px',marginBottom:'3px'},
  line:{height:'1.5px',background:'#8B0000',marginBottom:'7px'},
  bodyText:{fontSize:'9.5px',color:'#222',lineHeight:'1.5',margin:'3px 0'},
  entryRow:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'2px'},
  entryTitle:{fontSize:'10px',fontWeight:'700',color:'#000'},
  entryDate:{fontSize:'9px',color:'#555',fontStyle:'italic'},
  entryCompany:{fontSize:'9.5px',color:'#444',marginBottom:'4px',fontStyle:'italic'},
  entry:{marginBottom:'10px'},
  skillTable:{width:'100%',borderCollapse:'collapse',fontSize:'9.5px'},
  skillCat:{fontWeight:'700',color:'#000',padding:'3px 8px 3px 0',width:'160px',verticalAlign:'top',borderBottom:'0.5px solid #eee'},
  skillVal:{color:'#333',padding:'3px 0',borderBottom:'0.5px solid #eee',lineHeight:'1.4'},
  chipsRow:{display:'flex',flexWrap:'wrap',gap:'6px',marginTop:'4px'},
  chip:{background:'#f0f0f0',border:'0.5px solid #ccc',padding:'3px 10px',borderRadius:'3px',fontSize:'9px',fontWeight:'600',color:'#333'},
  techStack:{fontSize:'9px',color:'#555',fontStyle:'italic',marginBottom:'4px'},
  bulletList:{margin:'4px 0 0 14px',padding:0},
  bullet:{fontSize:'9.5px',color:'#333',lineHeight:'1.5',marginBottom:'2px'}
}