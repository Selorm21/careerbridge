import { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// ---------- inline icon set ----------
const Icon = ({ path, size = 18, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {path}
  </svg>
)

const icons = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  applications: (
    <>
      <path d="M9 11l3 3 7-7" />
      <path d="M21 12a9 9 0 1 1-5.3-8.2" />
    </>
  ),
  recommended: (
    <>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
      <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" />
    </>
  ),
  interviews: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
      <path d="M8 14h3M8 17h5" />
    </>
  ),
  browse: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </>
  ),
  file: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </>
  ),
  analytics: (
    <>
      <path d="M5 20V10M12 20V4M19 20v-7" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M10 11v6M14 11v6" />
      <path d="M6 7l1 14h10l1-14M9 7V4h6v3" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </>
  ),
  logout: (
    <>
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
    </>
  ),
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
  red: '#DC2626',
  blue: '#2563EB',
}

const initials = (name) =>
  (name || '?')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export default function ResumeBuilder() {
  const [profile, setProfile] = useState(null)
  const [applicationCount, setApplicationCount] = useState(0)
  const [recommendedCount, setRecommendedCount] = useState(0)
  const [interviewCount, setInterviewCount] = useState(0)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    bio: '',
    skills: '',
    careerInterests: '', // 🆕 New
    experiences: [{ company: '', role: '', duration: '', description: '' }],
    projects: [{ name: '', tech: '', description: '' }],
    education: [{ institution: '', degree: '', year: '' }],
    certifications: [{ name: '', issuer: '' }],
    references: [{ name: '', title: '', company: '', email: '', phone: '' }] // 🆕 New
  })

  const [downloading, setDownloading] = useState(false)
  const previewRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profileData) {
        setProfile(profileData)
        setFormData(prev => ({
          ...prev,
          fullName: profileData.full_name || '',
          email: profileData.email || user.email || '',
          bio: profileData.bio || '',
          skills: profileData.skills || ''
        }))
      }

      const { count: applications } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('student_id', user.id)
      setApplicationCount(applications || 0)

      const { count: interviews } = await supabase.from('interviews').select('*', { count: 'exact', head: true }).eq('student_id', user.id)
      setInterviewCount(interviews || 0)

      const { count: jobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true })
      setRecommendedCount(jobs || 0)
    }

    getData()
  }, [])

  function handleInputChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // ---- EXPERIENCE FUNCTIONS ----
  function handleExperienceChange(index, field, value) {
    const newExperiences = [...formData.experiences]
    newExperiences[index] = { ...newExperiences[index], [field]: value }
    setFormData(prev => ({ ...prev, experiences: newExperiences }))
  }
  function addExperience() {
    setFormData(prev => ({ ...prev, experiences: [...prev.experiences, { company: '', role: '', duration: '', description: '' }] }))
  }
  function removeExperience(index) {
    setFormData(prev => ({ ...prev, experiences: prev.experiences.filter((_, i) => i !== index) }))
  }

  // ---- EDUCATION FUNCTIONS ----
  function handleEducationChange(index, field, value) {
    const newEducation = [...formData.education]
    newEducation[index] = { ...newEducation[index], [field]: value }
    setFormData(prev => ({ ...prev, education: newEducation }))
  }
  function addEducation() {
    setFormData(prev => ({ ...prev, education: [...prev.education, { institution: '', degree: '', year: '' }] }))
  }
  function removeEducation(index) {
    setFormData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }))
  }

  // ---- PROJECTS FUNCTIONS ----
  function handleProjectChange(index, field, value) {
    const newProjects = [...formData.projects]
    newProjects[index] = { ...newProjects[index], [field]: value }
    setFormData(prev => ({ ...prev, projects: newProjects }))
  }
  function addProject() {
    setFormData(prev => ({ ...prev, projects: [...prev.projects, { name: '', tech: '', description: '' }] }))
  }
  function removeProject(index) {
    setFormData(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }))
  }

  // ---- CERTIFICATIONS FUNCTIONS ----
  function handleCertificationChange(index, field, value) {
    const newCertifications = [...formData.certifications]
    newCertifications[index] = { ...newCertifications[index], [field]: value }
    setFormData(prev => ({ ...prev, certifications: newCertifications }))
  }
  function addCertification() {
    setFormData(prev => ({ ...prev, certifications: [...prev.certifications, { name: '', issuer: '' }] }))
  }
  function removeCertification(index) {
    setFormData(prev => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== index) }))
  }

  // ---- 🆕 REFERENCES FUNCTIONS ----
  function handleReferenceChange(index, field, value) {
    const newReferences = [...formData.references]
    newReferences[index] = { ...newReferences[index], [field]: value }
    setFormData(prev => ({ ...prev, references: newReferences }))
  }
  function addReference() {
    setFormData(prev => ({ ...prev, references: [...prev.references, { name: '', title: '', company: '', email: '', phone: '' }] }))
  }
  function removeReference(index) {
    setFormData(prev => ({ ...prev, references: prev.references.filter((_, i) => i !== index) }))
  }

  async function downloadPDF() {
    if (!previewRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        useCORS: true,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgHeight = (canvas.height * pdfWidth) / canvas.width
      const finalHeight = Math.min(imgHeight, pdfHeight)
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, finalHeight)
      pdf.save(`${formData.fullName || 'resume'}-resume.pdf`)
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('Failed to generate PDF')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="page" style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .pageIn { animation: fadeUp .5s cubic-bezier(.16,1,.3,1) forwards; }
        .cardIn { animation: fadeUp .6s cubic-bezier(.16,1,.3,1) forwards; }
        .btn { transition: all .2s ease; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important; }
        .inputF { transition: border-color .2s ease, box-shadow .2s ease; }
        .inputF:focus { outline: none; border-color: #EA4E1B !important; box-shadow: 0 0 0 3px rgba(234,78,27,0.1) !important; }
        @media(max-width: 1024px) {
          .layout2 { grid-template-columns: 1fr !important; }
          .preview { display: none !important; }
          .form { width: 100% !important; }
        }
        @media(max-width: 768px) {
          .main { padding: 20px 16px !important; }
          .fieldRow { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={S.layout}>
        <main className="main" style={S.main}>
          <div className="pageIn" style={S.topBar}>
            <h1 style={S.heading}>Resume Builder</h1>
            <p style={S.headSub}>Create a professional, ATS-friendly resume.</p>
          </div>

          <div className="layout2" style={S.layout2}>
            <div className="form" style={S.formSection}>
              
              {/* ============================
                  PERSONAL INFO
              ============================ */}
              <div className="cardIn" style={S.card}>
                <div style={S.cardTitle}>Personal Information</div>
                <div style={S.fieldGroup}>
                  <label style={S.label}>Full Name</label>
                  <input className="inputF" style={S.input} type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Your full name" />
                </div>
                <div className="fieldRow" style={S.fieldRow}>
                  <div style={S.fieldGroup}>
                    <label style={S.label}>Email</label>
                    <input className="inputF" style={S.input} type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" />
                  </div>
                  <div style={S.fieldGroup}>
                    <label style={S.label}>Phone</label>
                    <input className="inputF" style={S.input} type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+233 00 000 0000" />
                  </div>
                </div>
                <div className="fieldRow" style={S.fieldRow}>
                  <div style={S.fieldGroup}>
                    <label style={S.label}>LinkedIn (Optional)</label>
                    <input className="inputF" style={S.input} type="text" name="linkedin" value={formData.linkedin} onChange={handleInputChange} placeholder="linkedin.com/in/username" />
                  </div>
                  <div style={S.fieldGroup}>
                    <label style={S.label}>GitHub (Optional)</label>
                    <input className="inputF" style={S.input} type="text" name="github" value={formData.github} onChange={handleInputChange} placeholder="github.com/username" />
                  </div>
                </div>
              </div>

              {/* ============================
                  SUMMARY
              ============================ */}
              <div className="cardIn" style={S.card}>
                <div style={S.cardTitle}>Professional Summary</div>
                <div style={S.fieldGroup}>
                  <label style={S.label}>Bio</label>
                  <textarea className="inputF" style={{...S.input, minHeight: '100px', resize: 'vertical'}} name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Brief professional summary..." />
                </div>
              </div>

              {/* ============================
                  CAREER INTERESTS (🆕 NEW)
              ============================ */}
              <div className="cardIn" style={S.card}>
                <div style={S.cardTitle}>Career Interests</div>
                <div style={S.fieldGroup}>
                  <label style={S.label}>Target Roles & Interests</label>
                  <textarea className="inputF" style={{...S.input, minHeight: '80px', resize: 'vertical'}} name="careerInterests" value={formData.careerInterests} onChange={handleInputChange} placeholder="e.g., Software Engineer, Full Stack Developer, Cyber Security..." />
                </div>
              </div>

              {/* ============================
                  SKILLS
              ============================ */}
              <div className="cardIn" style={S.card}>
                <div style={S.cardTitle}>Skills</div>
                <div style={S.fieldGroup}>
                  <label style={S.label}>Comma-separated skills</label>
                  <textarea className="inputF" style={{...S.input, minHeight: '80px', resize: 'vertical'}} name="skills" value={formData.skills} onChange={handleInputChange} placeholder="JavaScript, React, Node.js, Python..." />
                </div>
              </div>

              {/* ============================
                  WORK EXPERIENCE
              ============================ */}
              <div className="cardIn" style={S.card}>
                <div style={{...S.cardHead, justifyContent: 'center'}}>
                  <div style={{...S.cardTitle, marginBottom: 0}}>Work Experience</div>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                  <button className="btn" style={S.addBtn} onClick={addExperience}><Icon path={icons.plus} size={13} /> Add Experience</button>
                </div>
                {formData.experiences.map((exp, idx) => (
                  <div key={idx} style={{...S.entryBox, marginTop: '16px', marginBottom: '16px', paddingBottom: '16px', width: '100%'}}>
                    <div className="fieldRow" style={S.fieldRow}>
                      <div style={S.fieldGroup}><label style={S.label}>Company</label><input className="inputF" style={S.input} type="text" value={exp.company} onChange={e => handleExperienceChange(idx, 'company', e.target.value)} placeholder="Company" /></div>
                      <div style={S.fieldGroup}><label style={S.label}>Job Title</label><input className="inputF" style={S.input} type="text" value={exp.role} onChange={e => handleExperienceChange(idx, 'role', e.target.value)} placeholder="e.g., Software Engineer" /></div>
                    </div>
                    <div style={S.fieldGroup}><label style={S.label}>Duration</label><input className="inputF" style={S.input} type="text" value={exp.duration} onChange={e => handleExperienceChange(idx, 'duration', e.target.value)} placeholder="e.g., Jan 2025 - Dec 2025" /></div>
                    <div style={S.fieldGroup}><label style={S.label}>Description</label><textarea className="inputF" style={{...S.input, minHeight: '80px', resize: 'vertical'}} value={exp.description} onChange={e => handleExperienceChange(idx, 'description', e.target.value)} placeholder="Responsibilities..." /></div>
                    {formData.experiences.length > 1 && <div style={{display: 'flex', justifyContent: 'center', marginTop: '12px'}}><button className="btn" style={S.removeBtn} onClick={() => removeExperience(idx)}><Icon path={icons.trash} size={13} /> Remove</button></div>}
                  </div>
                ))}
              </div>

              {/* ============================
                  PROJECTS
              ============================ */}
              <div className="cardIn" style={S.card}>
                <div style={{...S.cardHead, justifyContent: 'center'}}>
                  <div style={{...S.cardTitle, marginBottom: 0}}>Projects</div>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                  <button className="btn" style={S.addBtn} onClick={addProject}><Icon path={icons.plus} size={13} /> Add Project</button>
                </div>
                {formData.projects.map((proj, idx) => (
                  <div key={idx} style={{...S.entryBox, marginTop: '16px', marginBottom: '16px', paddingBottom: '16px', width: '100%'}}>
                    <div className="fieldRow" style={S.fieldRow}>
                      <div style={S.fieldGroup}><label style={S.label}>Project Name</label><input className="inputF" style={S.input} type="text" value={proj.name} onChange={e => handleProjectChange(idx, 'name', e.target.value)} placeholder="Project Name" /></div>
                      <div style={S.fieldGroup}><label style={S.label}>Tech Stack</label><input className="inputF" style={S.input} type="text" value={proj.tech} onChange={e => handleProjectChange(idx, 'tech', e.target.value)} placeholder="React, Firebase, etc." /></div>
                    </div>
                    <div style={S.fieldGroup}><label style={S.label}>Description</label><textarea className="inputF" style={{...S.input, minHeight: '80px', resize: 'vertical'}} value={proj.description} onChange={e => handleProjectChange(idx, 'description', e.target.value)} placeholder="Features and purpose of project..." /></div>
                    {formData.projects.length > 1 && <div style={{display: 'flex', justifyContent: 'center', marginTop: '12px'}}><button className="btn" style={S.removeBtn} onClick={() => removeProject(idx)}><Icon path={icons.trash} size={13} /> Remove</button></div>}
                  </div>
                ))}
              </div>

              {/* ============================
                  EDUCATION
              ============================ */}
              <div className="cardIn" style={S.card}>
                <div style={{...S.cardHead, justifyContent: 'center'}}>
                  <div style={{...S.cardTitle, marginBottom: 0}}>Education</div>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                  <button className="btn" style={S.addBtn} onClick={addEducation}><Icon path={icons.plus} size={13} /> Add Education</button>
                </div>
                {formData.education.map((edu, idx) => (
                  <div key={idx} style={{...S.entryBox, marginTop: '16px', marginBottom: '16px', paddingBottom: '16px', width: '100%'}}>
                    <div className="fieldRow" style={S.fieldRow}>
                      <div style={S.fieldGroup}><label style={S.label}>Institution</label><input className="inputF" style={S.input} type="text" value={edu.institution} onChange={e => handleEducationChange(idx, 'institution', e.target.value)} placeholder="University name" /></div>
                      <div style={S.fieldGroup}><label style={S.label}>Degree</label><input className="inputF" style={S.input} type="text" value={edu.degree} onChange={e => handleEducationChange(idx, 'degree', e.target.value)} placeholder="e.g., BSc Computer Science" /></div>
                    </div>
                    <div style={S.fieldGroup}><label style={S.label}>Graduation Year</label><input className="inputF" style={S.input} type="text" value={edu.year} onChange={e => handleEducationChange(idx, 'year', e.target.value)} placeholder="2026" /></div>
                    {formData.education.length > 1 && <div style={{display: 'flex', justifyContent: 'center', marginTop: '12px'}}><button className="btn" style={S.removeBtn} onClick={() => removeEducation(idx)}><Icon path={icons.trash} size={13} /> Remove</button></div>}
                  </div>
                ))}
              </div>

              {/* ============================
                  CERTIFICATIONS
              ============================ */}
              <div className="cardIn" style={S.card}>
                <div style={{...S.cardHead, justifyContent: 'center'}}>
                  <div style={{...S.cardTitle, marginBottom: 0}}>Certifications</div>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                  <button className="btn" style={S.addBtn} onClick={addCertification}><Icon path={icons.plus} size={13} /> Add Certification</button>
                </div>
                {formData.certifications.map((cert, idx) => (
                  <div key={idx} style={{...S.entryBox, marginTop: '16px', marginBottom: '16px', paddingBottom: '16px', width: '100%'}}>
                    <div className="fieldRow" style={S.fieldRow}>
                      <div style={S.fieldGroup}><label style={S.label}>Certification Name</label><input className="inputF" style={S.input} type="text" value={cert.name} onChange={e => handleCertificationChange(idx, 'name', e.target.value)} placeholder="e.g., AWS Certified" /></div>
                      <div style={S.fieldGroup}><label style={S.label}>Issuing Organization</label><input className="inputF" style={S.input} type="text" value={cert.issuer} onChange={e => handleCertificationChange(idx, 'issuer', e.target.value)} placeholder="e.g., Amazon Web Services" /></div>
                    </div>
                    {formData.certifications.length > 1 && <div style={{display: 'flex', justifyContent: 'center', marginTop: '12px'}}><button className="btn" style={S.removeBtn} onClick={() => removeCertification(idx)}><Icon path={icons.trash} size={13} /> Remove</button></div>}
                  </div>
                ))}
              </div>

              {/* ============================
                  REFERENCES (🆕 NEW)
              ============================ */}
              <div className="cardIn" style={S.card}>
                <div style={{...S.cardHead, justifyContent: 'center'}}>
                  <div style={{...S.cardTitle, marginBottom: 0}}>References</div>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                  <button className="btn" style={S.addBtn} onClick={addReference}><Icon path={icons.plus} size={13} /> Add Reference</button>
                </div>
                {formData.references.map((ref, idx) => (
                  <div key={idx} style={{...S.entryBox, marginTop: '16px', marginBottom: '16px', paddingBottom: '16px', width: '100%'}}>
                    <div className="fieldRow" style={S.fieldRow}>
                      <div style={S.fieldGroup}><label style={S.label}>Full Name</label><input className="inputF" style={S.input} type="text" value={ref.name} onChange={e => handleReferenceChange(idx, 'name', e.target.value)} placeholder="Reference Name" /></div>
                      <div style={S.fieldGroup}><label style={S.label}>Job Title</label><input className="inputF" style={S.input} type="text" value={ref.title} onChange={e => handleReferenceChange(idx, 'title', e.target.value)} placeholder="e.g., Senior Manager" /></div>
                    </div>
                    <div style={S.fieldGroup}><label style={S.label}>Company</label><input className="inputF" style={S.input} type="text" value={ref.company} onChange={e => handleReferenceChange(idx, 'company', e.target.value)} placeholder="Company Name" /></div>
                    <div className="fieldRow" style={S.fieldRow}>
                      <div style={S.fieldGroup}><label style={S.label}>Email</label><input className="inputF" style={S.input} type="email" value={ref.email} onChange={e => handleReferenceChange(idx, 'email', e.target.value)} placeholder="ref@email.com" /></div>
                      <div style={S.fieldGroup}><label style={S.label}>Phone</label><input className="inputF" style={S.input} type="tel" value={ref.phone} onChange={e => handleReferenceChange(idx, 'phone', e.target.value)} placeholder="+233 00 000 0000" /></div>
                    </div>
                    {formData.references.length > 1 && <div style={{display: 'flex', justifyContent: 'center', marginTop: '12px'}}><button className="btn" style={S.removeBtn} onClick={() => removeReference(idx)}><Icon path={icons.trash} size={13} /> Remove</button></div>}
                  </div>
                ))}
              </div>

              <button className="btn" style={S.downloadBtn} onClick={downloadPDF} disabled={downloading}>
                <Icon path={icons.download} size={16} /> {downloading ? 'Generating PDF...' : 'Download as PDF'}
              </button>
            </div>

            {/* ============================
                LIVE PREVIEW AREA
            ============================ */}
            <div className="preview" style={S.previewSection}>
              <div style={S.previewTitle}><Icon path={icons.file} size={14} /> Live Preview</div>
              <div ref={previewRef} style={S.preview}>
                <div style={S.resumeContainer}>
                  
                  {/* --- HEADER --- */}
                  <div style={S.resumeHeader}>
                    <h1 style={S.resumeName}>{formData.fullName || 'Your Name'}</h1>
                    <div style={S.resumeContact}>
                      {formData.email && <span>{formData.email}</span>}
                      {formData.phone && <span style={S.resumeContactDivider}> | {formData.phone}</span>}
                      {formData.linkedin && <span style={S.resumeContactDivider}> | {formData.linkedin}</span>}
                      {formData.github && <span style={S.resumeContactDivider}> | {formData.github}</span>}
                    </div>
                  </div>

                  {/* --- SUMMARY --- */}
                  {formData.bio && (
                    <div style={S.resumeSection}>
                      <h3 style={S.resumeSectionTitle}>Professional Summary</h3>
                      <p style={S.resumeText}>{formData.bio}</p>
                    </div>
                  )}

                  {/* --- CAREER INTERESTS (🆕) --- */}
                  {formData.careerInterests && (
                    <div style={S.resumeSection}>
                      <h3 style={S.resumeSectionTitle}>Career Interests</h3>
                      <p style={S.resumeText}>{formData.careerInterests}</p>
                    </div>
                  )}

                  {/* --- WORK EXPERIENCE --- */}
                  {formData.experiences.some(e => e.company || e.role) && (
                    <div style={S.resumeSection}>
                      <h3 style={S.resumeSectionTitle}>Work Experience</h3>
                      {formData.experiences.map((exp, idx) => (exp.company || exp.role) ? (
                        <div key={idx} style={S.resumeEntry}>
                          <div style={S.resumeEntryHeader}><strong>{exp.role || 'Position'}</strong> <span style={S.resumeDate}>{exp.duration}</span></div>
                          <div style={S.resumeSubtext}>{exp.company}</div>
                          {exp.description && <div style={S.resumeBulletList}>{exp.description.split('\n').map((line, i) => <div key={i} style={S.resumeBullet}>• {line}</div>)}</div>}
                        </div>
                      ) : null)}
                    </div>
                  )}

                  {/* --- PROJECTS --- */}
                  {formData.projects.some(p => p.name || p.tech) && (
                    <div style={S.resumeSection}>
                      <h3 style={S.resumeSectionTitle}>Projects</h3>
                      {formData.projects.map((proj, idx) => (proj.name || proj.tech) ? (
                        <div key={idx} style={S.resumeEntry}>
                          <div style={S.resumeEntryHeader}><strong>{proj.name || 'Project'}</strong> <span style={S.resumeDate}>{proj.tech}</span></div>
                          {proj.description && <div style={S.resumeBulletList}>{proj.description.split('\n').map((line, i) => <div key={i} style={S.resumeBullet}>• {line}</div>)}</div>}
                        </div>
                      ) : null)}
                    </div>
                  )}

                  {/* --- EDUCATION --- */}
                  {formData.education.some(e => e.institution || e.degree) && (
                    <div style={S.resumeSection}>
                      <h3 style={S.resumeSectionTitle}>Education</h3>
                      {formData.education.map((edu, idx) => (edu.institution || edu.degree) ? (
                        <div key={idx} style={S.resumeEntry}>
                          <div style={S.resumeEntryHeader}><strong>{edu.degree || 'Degree'}</strong> <span style={S.resumeDate}>{edu.year}</span></div>
                          <div style={S.resumeSubtext}>{edu.institution}</div>
                        </div>
                      ) : null)}
                    </div>
                  )}

                  {/* --- SKILLS --- */}
                  {formData.skills && (
                    <div style={S.resumeSection}>
                      <h3 style={S.resumeSectionTitle}>Skills</h3>
                      <div style={S.resumeSkills}>
                        {formData.skills.split(',').map((skill, idx) => <span key={idx} style={S.resumeSkillChip}>{skill.trim()}</span>)}
                      </div>
                    </div>
                  )}

                  {/* --- CERTIFICATIONS --- */}
                  {formData.certifications.some(c => c.name || c.issuer) && (
                    <div style={S.resumeSection}>
                      <h3 style={S.resumeSectionTitle}>Certifications</h3>
                      <div style={S.resumeSkills}>
                        {formData.certifications.map((cert, idx) => (cert.name || cert.issuer) ? (
                          <span key={idx} style={S.resumeSkillChip}>{cert.name} {cert.issuer && `(${cert.issuer})`}</span>
                        ) : null)}
                      </div>
                    </div>
                  )}

                  {/* --- REFERENCES (🆕) --- */}
                  {formData.references.some(r => r.name) && (
                    <div style={S.resumeSection}>
                      <h3 style={S.resumeSectionTitle}>References</h3>
                      {formData.references.map((ref, idx) => ref.name ? (
                        <div key={idx} style={S.resumeRefEntry}>
                          <div style={S.resumeRefName}>{ref.name}</div>
                          <div style={S.resumeRefSub}>{ref.title} {ref.company && `at ${ref.company}`}</div>
                          {(ref.email || ref.phone) && (
                            <div style={S.resumeRefContact}>
                              {ref.email && <span>{ref.email}</span>}
                              {ref.phone && <span> • {ref.phone}</span>}
                            </div>
                          )}
                        </div>
                      ) : null)}
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

// ============================================================
// STYLES
// ============================================================

const S = {
  page: { minHeight: '100vh', background: C.bg, fontFamily: "'Inter', -apple-system, sans-serif" },
  layout: { display: 'grid', gridTemplateColumns: '1fr', minHeight: '100vh' },
  main: { padding: '32px 36px', overflowY: 'auto', paddingBottom: '40px' },
  topBar: { marginBottom: '28px' },
  heading: { fontSize: '25px', fontWeight: '800', color: C.ink, marginBottom: '4px', letterSpacing: '-0.5px' },
  headSub: { fontSize: '14px', color: C.sub },
  layout2: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' },
  formSection: { width: '100%' },
  previewSection: { position: 'sticky', top: '32px', height: 'fit-content' },
  previewTitle: { display: 'flex', alignItems: 'center', gap: '7px', fontSize: '14px', fontWeight: '700', color: C.ink, marginBottom: '12px' },
  card: { background: C.card, borderRadius: '16px', padding: '20px', border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.04)', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  cardTitle: { fontSize: '15px', fontWeight: '800', color: C.ink, marginBottom: '16px', textAlign: 'center', letterSpacing: '0.5px' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', width: '100%' },
  fieldGroup: { marginBottom: '16px', width: '100%' },
  fieldRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', width: '100%' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: C.navText },
  input: { width: '100%', padding: '10px 12px', border: `1.5px solid ${C.border}`, borderRadius: '8px', fontSize: '13px', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', color: C.ink },
  entryBox: { background: '#FAFBFC', padding: '16px', borderRadius: '10px' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#FFF4EE', color: C.accent, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
  removeBtn: { display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#FEF2F2', color: C.red, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
  downloadBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', background: C.accent, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(234,78,27,0.28)' },
  preview: { background: '#fff', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px', fontSize: '12px', maxHeight: '600px', overflowY: 'auto' },

  // ============================================================
  // 🎯 PROFESSIONAL RESUME STYLES
  // ============================================================
  resumeContainer: { background: '#ffffff', color: '#1E293B', padding: '0' },
  resumeHeader: { marginBottom: '24px', paddingBottom: '16px', borderBottom: '3px solid #0B3B57' },
  resumeName: { fontSize: '24px', fontWeight: '800', color: '#0B3B57', margin: '0 0 6px 0', letterSpacing: '-0.5px' },
  resumeContact: { fontSize: '12px', color: '#475569', fontWeight: '500', wordBreak: 'break-all' },
  resumeContactDivider: { marginLeft: '6px' },
  resumeSection: { marginBottom: '20px' },
  resumeSectionTitle: { fontSize: '12px', fontWeight: '700', color: '#0B3B57', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' },
  resumeEntry: { marginBottom: '12px' },
  resumeEntryHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '2px' },
  resumeDate: { fontSize: '11px', color: '#64748B', fontWeight: '500' },
  resumeSubtext: { fontSize: '12px', color: '#475569', fontWeight: '500', marginBottom: '4px' },
  resumeText: { fontSize: '12px', color: '#334155', margin: '4px 0', lineHeight: '1.5' },
  resumeBulletList: { marginTop: '6px', paddingLeft: '12px' },
  resumeBullet: { fontSize: '11.5px', color: '#334155', lineHeight: '1.6', marginBottom: '2px' },
  resumeSkills: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' },
  resumeSkillChip: { background: '#F1F5F9', color: '#0B3B57', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },

  // 🆕 Reference Styles
  resumeRefEntry: { marginBottom: '14px' },
  resumeRefName: { fontSize: '13px', fontWeight: '700', color: '#0F172A' },
  resumeRefSub: { fontSize: '12px', color: '#475569', fontStyle: 'italic' },
  resumeRefContact: { fontSize: '11px', color: '#64748B', marginTop: '2px' },
}