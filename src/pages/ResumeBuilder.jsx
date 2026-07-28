import { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

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
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      setFormData(prev => ({ ...prev, fullName: p?.full_name||'', email: p?.email||'', university: p?.university||'', course: p?.course||'', graduationYear: p?.graduation_year||'', bio: p?.bio||'' }))
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
    setDownloading(false)
  }

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .pageIn{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) forwards}
        .sideBtn{transition:all .2s ease;cursor:pointer}
        .sideBtn:hover{background:#1E293B!important;color:#fff!important}
        .logoutBtn:hover{background:#FEF2F2!important;color:#DC2626!important}
        .inputF:focus{outline:none;border-color:#2563EB!important;box-shadow:0 0 0 3px rgba(37,99,235,0.1)!important}
        @media(max-width:768px){.sidebar{display:none!important}.main{padding:20px 16px!important}.layout2{grid-template-columns:1fr!important}.previewSection{display:none!important}}
      `}</style>

      <div style={S.layout}>
        <aside className="sidebar" style={S.sidebar}>
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
                <div style={S.grid2}>
                  <div style={S.field}><label style={S.label}>Full Name</label><input className="inputF" style={S.input} name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="ERNEST AMUZU" /></div>
                  <div style={S.field}><label style={S.label}>Email</label><input className="inputF" style={S.input} name="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" /></div>
                  <div style={S.field}><label style={S.label}>Phone</label><input className="inputF" style={S.input} name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+233 XX XXX XXXX" /></div>
                  <div style={S.field}><label style={S.label}>LinkedIn</label><input className="inputF" style={S.input} name="linkedin" value={formData.linkedin} onChange={handleInputChange} placeholder="linkedin.com/in/yourname" /></div>
                  <div style={S.field}><label style={S.label}>GitHub</label><input className="inputF" style={S.input} name="github" value={formData.github} onChange={handleInputChange} placeholder="github.com/yourname" /></div>
                  <div style={S.field}><label style={S.label}>Portfolio</label><input className="inputF" style={S.input} name="portfolio" value={formData.portfolio} onChange={handleInputChange} placeholder="yoursite.vercel.app" /></div>
                </div>
              </div>

              <div style={S.card}>
                <div style={S.cardTitle}>Education</div>
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
                  </div>
                ))}
              </div>

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
                  </div>
                ))}
              </div>

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