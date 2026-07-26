import { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function ResumeBuilder() {
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    university: '',
    course: '',
    graduationYear: '',
    bio: '',
    skills: '',
    experiences: [{ company: '', role: '', duration: '', description: '' }],
    education: [{ institution: '', degree: '', year: '' }]
  })
  const [downloading, setDownloading] = useState(false)
  const previewRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser()
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
    }
    getData()
  }, [])

  async function handleLogout() { await supabase.auth.signOut() }

  function handleInputChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  function handleExperienceChange(index, field, value) {
    const newExperiences = [...formData.experiences]
    newExperiences[index][field] = value
    setFormData(prev => ({ ...prev, experiences: newExperiences }))
  }

  function handleEducationChange(index, field, value) {
    const newEducation = [...formData.education]
    newEducation[index][field] = value
    setFormData(prev => ({ ...prev, education: newEducation }))
  }

  function addExperience() {
    setFormData(prev => ({
      ...prev,
      experiences: [...prev.experiences, { company: '', role: '', duration: '', description: '' }]
    }))
  }

  function removeExperience(index) {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }))
  }

  function addEducation() {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { institution: '', degree: '', year: '' }]
    }))
  }

  function removeEducation(index) {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  async function downloadPDF() {
    setDownloading(true)
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2 })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${formData.fullName}-resume.pdf`)
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('Failed to generate PDF')
    }
    setDownloading(false)
  }

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .pageIn{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) forwards}
        .cardIn{animation:fadeUp .6s cubic-bezier(.16,1,.3,1) forwards}
        .sideBtn{transition:all .2s ease;cursor:pointer}
        .sideBtn:hover{background:#1E293B!important;color:#fff!important}
        .logoutBtn{transition:all .2s ease}
        .logoutBtn:hover{background:#FEF2F2!important;color:#DC2626!important;border-color:#FECACA!important}
        .btn{transition:all .2s ease}
        .btn:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.1)!important}
        @media(max-width:1024px){
          .layout{grid-template-columns:1fr!important}
          .preview{display:none!important}
          .form{width:100%!important}
        }
        @media(max-width:768px){
          .sidebar{display:none!important}
          .main{padding:20px 16px!important}
        }
      `}</style>

      <div className="layout" style={S.layout}>
        <aside className="sidebar" style={S.sidebar}>
          <div style={S.sidebarTop}>
            <div style={S.sidebarLogo}>CareerBridge</div>
            <div style={S.avatarWrap}>
              <div style={S.avatar}>{profile?.full_name?.charAt(0) || 'S'}</div>
              <div>
                <div style={S.avatarName}>{profile?.full_name || 'Student'}</div>
                <div style={S.avatarRole}>Student</div>
              </div>
            </div>
          </div>
          <nav style={S.sideNav}>
            <div className="sideBtn" style={S.sideNavItem} onClick={() => navigate('/student')}>
              <span style={S.sideNavIcon}>📊</span> Dashboard
            </div>
            <div className="sideBtn" style={S.sideNavItem} onClick={() => navigate('/browse-jobs')}>
              <span style={S.sideNavIcon}>🔍</span> Browse Jobs
            </div>
            <div className="sideBtn" style={S.sideNavItem} onClick={() => navigate('/student-profile')}>
              <span style={S.sideNavIcon}>👤</span> My Profile
            </div>
            <div className="sideBtn" style={{...S.sideNavItem, ...S.sideNavActive}}>
              <span style={S.sideNavIcon}>📄</span> Resume Builder
            </div>
            <div className="sideBtn" style={S.sideNavItem} onClick={() => navigate('/analytics')}>
              <span style={S.sideNavIcon}>📊</span> Analytics
            </div>
          </nav>
          <button className="logoutBtn" style={S.logoutBtn} onClick={handleLogout}>← Log out</button>
        </aside>

        <main className="main" style={S.main}>
          <div className="pageIn" style={S.topBar}>
            <h1 style={S.heading}>Resume Builder</h1>
            <p style={S.headSub}>Create a professional resume</p>
          </div>

          <div className="layout2" style={S.layout2}>
            <div className="form" style={S.formSection}>
              <div className="cardIn" style={S.card}>
                <div style={S.cardTitle}>Personal Information</div>
                <div style={S.fieldGroup}>
                  <label style={S.label}>Full Name</label>
                  <input style={S.input} type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Your full name" />
                </div>
                <div style={S.fieldRow}>
                  <div style={S.fieldGroup}>
                    <label style={S.label}>Email</label>
                    <input style={S.input} type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" />
                  </div>
                  <div style={S.fieldGroup}>
                    <label style={S.label}>Phone (Optional)</label>
                    <input style={S.input} type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
              </div>

              <div className="cardIn" style={S.card}>
                <div style={S.cardTitle}>Education</div>
                <div style={S.fieldGroup}>
                  <label style={S.label}>University</label>
                  <input style={S.input} type="text" name="university" value={formData.university} onChange={handleInputChange} placeholder="University name" />
                </div>
                <div style={S.fieldRow}>
                  <div style={S.fieldGroup}>
                    <label style={S.label}>Course/Degree</label>
                    <input style={S.input} type="text" name="course" value={formData.course} onChange={handleInputChange} placeholder="e.g., Bachelor of Science in Computer Science" />
                  </div>
                  <div style={S.fieldGroup}>
                    <label style={S.label}>Graduation Year</label>
                    <input style={S.input} type="number" name="graduationYear" value={formData.graduationYear} onChange={handleInputChange} placeholder="2024" />
                  </div>
                </div>
              </div>

              <div className="cardIn" style={S.card}>
                <div style={S.cardTitle}>Bio/Summary</div>
                <div style={S.fieldGroup}>
                  <label style={S.label}>Professional Summary</label>
                  <textarea style={{...S.input, minHeight: '100px', resize: 'vertical'}} name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Brief professional summary..." />
                </div>
              </div>

              <div className="cardIn" style={S.card}>
                <div style={S.cardTitle}>Skills</div>
                <div style={S.fieldGroup}>
                  <label style={S.label}>Skills (comma-separated)</label>
                  <textarea style={{...S.input, minHeight: '80px', resize: 'vertical'}} name="skills" value={formData.skills} onChange={handleInputChange} placeholder="JavaScript, React, Node.js, Python..." />
                </div>
              </div>

              <div className="cardIn" style={S.card}>
                <div style={S.cardHead}>
                  <div style={S.cardTitle}>Work Experience</div>
                  <button className="btn" style={{...S.addBtn}} onClick={addExperience}>+ Add Experience</button>
                </div>
                {formData.experiences.map((exp, idx) => (
                  <div key={idx} style={{...S.entryBox, marginBottom: '16px', paddingBottom: '16px', borderBottom: idx < formData.experiences.length - 1 ? '1px solid #E5E7EB' : 'none'}}>
                    <div style={S.fieldRow}>
                      <div style={S.fieldGroup}>
                        <label style={S.label}>Company</label>
                        <input style={S.input} type="text" value={exp.company} onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)} placeholder="Company name" />
                      </div>
                      <div style={S.fieldGroup}>
                        <label style={S.label}>Job Title</label>
                        <input style={S.input} type="text" value={exp.role} onChange={(e) => handleExperienceChange(idx, 'role', e.target.value)} placeholder="e.g., Software Engineer" />
                      </div>
                    </div>
                    <div style={S.fieldGroup}>
                      <label style={S.label}>Duration</label>
                      <input style={S.input} type="text" value={exp.duration} onChange={(e) => handleExperienceChange(idx, 'duration', e.target.value)} placeholder="e.g., Jan 2023 - Dec 2023" />
                    </div>
                    <div style={S.fieldGroup}>
                      <label style={S.label}>Description</label>
                      <textarea style={{...S.input, minHeight: '80px', resize: 'vertical'}} value={exp.description} onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)} placeholder="Job responsibilities..." />
                    </div>
                    {formData.experiences.length > 1 && (
                      <button className="btn" style={{...S.removeBtn}} onClick={() => removeExperience(idx)}>Remove</button>
                    )}
                  </div>
                ))}
              </div>

              <div className="cardIn" style={S.card}>
                <div style={S.cardHead}>
                  <div style={S.cardTitle}>Education History</div>
                  <button className="btn" style={{...S.addBtn}} onClick={addEducation}>+ Add Education</button>
                </div>
                {formData.education.map((edu, idx) => (
                  <div key={idx} style={{...S.entryBox, marginBottom: '16px', paddingBottom: '16px', borderBottom: idx < formData.education.length - 1 ? '1px solid #E5E7EB' : 'none'}}>
                    <div style={S.fieldRow}>
                      <div style={S.fieldGroup}>
                        <label style={S.label}>Institution</label>
                        <input style={S.input} type="text" value={edu.institution} onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)} placeholder="School/University name" />
                      </div>
                      <div style={S.fieldGroup}>
                        <label style={S.label}>Degree</label>
                        <input style={S.input} type="text" value={edu.degree} onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)} placeholder="e.g., Bachelor of Science" />
                      </div>
                    </div>
                    <div style={S.fieldGroup}>
                      <label style={S.label}>Year</label>
                      <input style={S.input} type="text" value={edu.year} onChange={(e) => handleEducationChange(idx, 'year', e.target.value)} placeholder="e.g., 2024" />
                    </div>
                    {formData.education.length > 1 && (
                      <button className="btn" style={{...S.removeBtn}} onClick={() => removeEducation(idx)}>Remove</button>
                    )}
                  </div>
                ))}
              </div>

              <button className="btn" style={S.downloadBtn} onClick={downloadPDF} disabled={downloading}>
                {downloading ? '⏳ Generating PDF...' : '📥 Download as PDF'}
              </button>
            </div>

            <div className="preview" style={S.previewSection}>
              <div style={S.previewTitle}>📄 Live Preview</div>
              <div ref={previewRef} style={S.preview}>
                <div style={S.resumeContainer}>
                  <div style={S.resumeHeader}>
                    <h1 style={S.resumeName}>{formData.fullName || 'Your Name'}</h1>
                    <div style={S.resumeContact}>
                      {formData.email && <span>{formData.email}</span>}
                      {formData.phone && <span> • {formData.phone}</span>}
                    </div>
                  </div>

                  {formData.bio && (
                    <div style={S.resumeSection}>
                      <h3 style={S.resumeSectionTitle}>Professional Summary</h3>
                      <p style={S.resumeText}>{formData.bio}</p>
                    </div>
                  )}

                  {(formData.university || formData.course) && (
                    <div style={S.resumeSection}>
                      <h3 style={S.resumeSectionTitle}>Education</h3>
                      <div style={S.resumeEntry}>
                        <div style={S.resumeEntryHeader}>
                          <strong>{formData.course || 'Degree'}</strong>
                          <span style={S.resumeDate}>{formData.graduationYear}</span>
                        </div>
                        <div style={S.resumeSubtext}>{formData.university}</div>
                      </div>
                    </div>
                  )}

                  {formData.experiences.some(e => e.company || e.role) && (
                    <div style={S.resumeSection}>
                      <h3 style={S.resumeSectionTitle}>Work Experience</h3>
                      {formData.experiences.map((exp, idx) => (
                        (exp.company || exp.role) && (
                          <div key={idx} style={S.resumeEntry}>
                            <div style={S.resumeEntryHeader}>
                              <strong>{exp.role || 'Position'}</strong>
                              <span style={S.resumeDate}>{exp.duration}</span>
                            </div>
                            <div style={S.resumeSubtext}>{exp.company}</div>
                            {exp.description && <p style={S.resumeText}>{exp.description}</p>}
                          </div>
                        )
                      ))}
                    </div>
                  )}

                  {formData.skills && (
                    <div style={S.resumeSection}>
                      <h3 style={S.resumeSectionTitle}>Skills</h3>
                      <div style={S.resumeSkills}>
                        {formData.skills.split(',').map((skill, idx) => (
                          <span key={idx} style={S.resumeSkillChip}>{skill.trim()}</span>
                        ))}
                      </div>
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
  page: { minHeight: '100vh', background: '#F1F5F9', fontFamily: "'Inter', -apple-system, sans-serif" },
  layout: { display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100vh' },

  sidebar: { background: '#0F172A', display: 'flex', flexDirection: 'column', padding: '0', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' },
  sidebarTop: { padding: '28px 24px 20px' },
  sidebarLogo: { fontSize: '18px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px', marginBottom: '28px' },
  avatarWrap: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #3B82F6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800' },
  avatarName: { fontSize: '14px', fontWeight: '700', color: '#F1F5F9' },
  avatarRole: { fontSize: '11.5px', color: '#64748B', fontWeight: '500' },

  sideNav: { padding: '20px 12px', flex: 1 },
  sideNavItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: '#94A3B8', marginBottom: '4px' },
  sideNavActive: { background: '#1E293B', color: '#fff' },
  sideNavIcon: { fontSize: '16px' },

  logoutBtn: { margin: '0 12px 24px', padding: '11px', background: 'transparent', border: '1px solid #1E293B', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#94A3B8' },

  main: { padding: '32px 36px', overflowY: 'auto', paddingBottom: '40px' },
  topBar: { marginBottom: '28px' },
  heading: { fontSize: '26px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' },
  headSub: { fontSize: '14px', color: '#94A3B8' },

  layout2: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' },
  formSection: { width: '100%' },
  previewSection: { position: 'sticky', top: '32px', height: 'fit-content' },
  previewTitle: { fontSize: '14px', fontWeight: '700', color: '#0F172A', marginBottom: '12px' },

  card: { background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #F0F2F5', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', marginBottom: '20px' },
  cardTitle: { fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },

  fieldGroup: { marginBottom: '16px' },
  fieldRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' },
  input: { width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' },

  entryBox: { background: '#F8FAFC', padding: '16px', borderRadius: '10px' },
  addBtn: { padding: '6px 12px', background: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  removeBtn: { marginTop: '12px', padding: '6px 12px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },

  downloadBtn: { width: '100%', padding: '14px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' },

  preview: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', fontSize: '12px', maxHeight: '600px', overflowY: 'auto' },
  resumeContainer: { background: '#fff', padding: '0' },
  resumeHeader: { marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #2563EB' },
  resumeName: { fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0' },
  resumeContact: { fontSize: '11px', color: '#64748B' },

  resumeSection: { marginBottom: '12px' },
  resumeSectionTitle: { fontSize: '12px', fontWeight: '700', color: '#0F172A', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' },
  resumeEntry: { marginBottom: '8px' },
  resumeEntryHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', color: '#0F172A' },
  resumeDate: { fontSize: '11px', color: '#94A3B8', fontWeight: '500' },
  resumeSubtext: { fontSize: '11px', color: '#64748B', marginBottom: '4px' },
  resumeText: { fontSize: '11px', color: '#374151', margin: '4px 0', lineHeight: '1.4' },
  resumeSkills: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  resumeSkillChip: { background: '#EFF6FF', color: '#2563EB', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600' }
}
