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
      `}</style>

      <div style={S.layout}>
        <aside className="sidebar" style={S.sidebar}>
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
                </div>
              </div>

              <div className="cardIn" style={S.card}>
                <div style={S.cardTitle}>Education</div>
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
                  </div>
                ))}
              </div>

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
                  </div>
                ))}
              </div>

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
}
