import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

// ---------- Premium Icon Helpers ----------
const Icon = ({ path, size = 18, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {path}
  </svg>
)

const icons = {
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></>,
  check: <><path d="M20 6 9 17l-5-5" /></>,
  warning: <><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></>,
  upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
  replace: <><path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></>,
}

export default function DocumentUpload() {
  const [profile, setProfile] = useState(null)
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(null)
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const docTypes = [
    { key: 'transcript', label: 'Academic Transcript', icon: '🎓', desc: 'Your official academic transcript from your university' },
    { key: 'national_id', label: 'National ID', icon: '🪪', desc: 'Ghana Card or any valid national identification' },
    { key: 'recommendation', label: 'Recommendation Letter', icon: '📝', desc: 'A recommendation letter from a lecturer or employer' }
  ]

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)
      const { data: docsData } = await supabase.from('documents').select('*').eq('student_id', user.id)
      setDocuments(docsData || [])
    }
    getData()
  }, [])

  async function handleUpload(docType, file) {
    setUploading(docType)
    const { data: { user } } = await supabase.auth.getUser()
    const fileName = `${user.id}/${docType}.${file.name.split('.').pop()}`

    const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, file, { upsert: true })
    if (uploadError) { alert('Upload failed: ' + uploadError.message); setUploading(null); return }

    const { data } = supabase.storage.from('documents').getPublicUrl(fileName)

    const existing = documents.find(d => d.doc_type === docType)
    if (existing) {
      await supabase.from('documents').update({ file_url: data.publicUrl, status: 'pending', uploaded_at: new Date() }).eq('id', existing.id)
    } else {
      await supabase.from('documents').insert({ student_id: user.id, doc_type: docType, file_url: data.publicUrl, status: 'pending' })
    }

    const { data: docsData } = await supabase.from('documents').select('*').eq('student_id', user.id)
    setDocuments(docsData || [])
    setSuccess(`${docType.replace('_', ' ')} uploaded successfully!`)
    setTimeout(() => setSuccess(''), 3000)
    setUploading(null)
  }

  function getDoc(type) { return documents.find(d => d.doc_type === type) }

  function getStatusStyle(status) {
    if (status === 'verified') return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981', icon: '✓', border: '1px solid rgba(16, 185, 129, 0.2)' }
    if (status === 'rejected') return { bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', icon: '✗', border: '1px solid rgba(239, 68, 68, 0.2)' }
    return { bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', icon: '⏳', border: '1px solid rgba(245, 158, 11, 0.2)' }
  }

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes pulseGlow{0%,100%{opacity:0.3}50%{opacity:0.6}}
        @keyframes dashMove{to{stroke-dashoffset:-24}}
        @keyframes borderPulse{0%,100%{border-color:rgba(37,99,235,0.2)}50%{border-color:rgba(37,99,235,0.5)}}
        
        .pageIn{animation:fadeUp .6s cubic-bezier(.16,1,.3,1) forwards}
        .glowPulse{animation:pulseGlow 6s ease-in-out infinite}
        
        .uploadArea{transition:all 0.3s cubic-bezier(.34,1.56,.64,1);cursor:pointer;position:relative;overflow:hidden;}
        .uploadArea:hover{transform:translateY(-2px) scale(1.02);border-color:#6366F1!important;background:rgba(99,102,241,0.06)!important;}
        
        .docCard{transition:all 0.4s cubic-bezier(.34,1.56,.64,1);}
        .docCard:hover{transform:translateY(-4px) scale(1.01);box-shadow:0 20px 40px rgba(15,23,42,0.06)!important;border-color:rgba(99,102,241,0.2)!important;}
        
        @media(max-width:1024px){.docsGrid{grid-template-columns:1fr 1fr!important;}}
        @media(max-width:768px){.main{padding:20px 16px!important;}.docsGrid{grid-template-columns:1fr!important;}}
      `}</style>

      {/* 🌟 Ambient Glowing Background */}
      <div style={S.bgEffects}>
        <div style={S.glowOrb1} className="glowPulse"></div>
        <div style={S.glowOrb2} className="glowPulse"></div>
        <div style={S.gridPattern}></div>
      </div>

      <div style={S.layout}>
        <main className="main pageIn" style={S.main}>
          <div style={S.topBar}>
            <div>
              <h1 style={S.heading}>Document Verification</h1>
              <p style={S.headSub}>Upload your documents for verification by the university coordinator.</p>
            </div>
          </div>

          {success && <div style={S.successBanner}><Icon path={icons.check} size={16} /> {success}</div>}

          {/* Info Banner */}
          <div style={S.infoCard}>
            <div style={{ color: '#2563EB', display: 'flex' }}><Icon path={icons.info} size={20} /></div>
            <div>
              <div style={S.infoTitle}>How document verification works</div>
              <div style={S.infoText}>Upload your documents below. The University Coordinator will review and verify them. Verified documents strengthen your profile and increase employer trust.</div>
            </div>
          </div>

          {/* Document Grid */}
          <div className="docsGrid" style={S.docsGrid}>
            {docTypes.map(docType => {
              const doc = getDoc(docType.key)
              const st = doc ? getStatusStyle(doc.status) : null
              return (
                <div key={docType.key} className="docCard" style={S.docCard}>
                  <div style={S.docCardTop}>
                    <div style={S.docIcon}>{docType.icon}</div>
                    {doc && (
                      <span style={{...S.statusBadge, background: st.bg, color: st.color, border: st.border}}>
                        {st.icon} {doc.status}
                      </span>
                    )}
                  </div>
                  <div style={S.docTitle}>{docType.label}</div>
                  <div style={S.docDesc}>{docType.desc}</div>

                  <label className="uploadArea" style={{...S.uploadArea, ...(doc ? S.uploadAreaDone : {})}}>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => e.target.files[0] && handleUpload(docType.key, e.target.files[0])} />
                    
                    {/* Animated SVG Dashed Border */}
                    <div style={S.uploadBgIcon}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity: 0.1, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                        <rect x="2" y="2" width="20" height="20" rx="4" strokeDasharray="8 4" style={{animation: 'dashMove 2s linear infinite'}}/>
                      </svg>
                    </div>

                    {uploading === docType.key ? (
                      <div style={S.uploadText}>⏳ Uploading...</div>
                    ) : doc ? (
                      <div style={{position: 'relative', zIndex: 1}}>
                        <div style={S.uploadText}>✓ Uploaded</div>
                        <div style={S.uploadSub}>Click to replace</div>
                      </div>
                    ) : (
                      <div style={{position: 'relative', zIndex: 1}}>
                        <div style={{...S.uploadText, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>
                          <Icon path={icons.upload} size={18} /> Upload file
                        </div>
                        <div style={S.uploadSub}>PDF, JPG or PNG</div>
                      </div>
                    )}
                  </label>

                  {doc?.file_url && (
                    <a href={doc.file_url} target="_blank" rel="noreferrer" style={S.viewLink}>
                      View uploaded document →
                    </a>
                  )}

                  {doc?.status === 'rejected' && (
                    <div style={S.rejectedNote}><Icon path={icons.warning} size={14} /> Document was rejected. Please upload a clearer version.</div>
                  )}
                  {doc?.status === 'verified' && (
                    <div style={S.verifiedNote}><Icon path={icons.check} size={14} /> This document has been verified by the coordinator.</div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Verification Summary */}
          <div style={S.summaryCard}>
            <div style={S.summaryTitle}>Verification Summary</div>
            <div style={S.summaryGrid}>
              {docTypes.map(dt => {
                const doc = getDoc(dt.key)
                const st = doc ? getStatusStyle(doc.status) : null
                return (
                  <div key={dt.key} style={S.summaryItem}>
                    <span style={S.summaryIcon}>{dt.icon}</span>
                    <span style={S.summaryLabel}>{dt.label}</span>
                    <span style={{...S.summaryStatus, background: st?.bg || 'rgba(148, 163, 184, 0.1)', color: st?.color || '#94A3B8', border: st?.border || '1px solid rgba(148, 163, 184, 0.1)'}}>
                      {doc ? doc.status : 'Not uploaded'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// ============================================================
// 🎨 PREMIUM STYLES
// ============================================================
const S = {
  page: { 
    minHeight: '100vh', 
    background: '#F8FAFC', 
    fontFamily: "'Inter', -apple-system, sans-serif",
    position: 'relative'
  },

  // Ambient Background Effects
  bgEffects: {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  glowOrb1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06), transparent 70%)',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: '-20%',
    left: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.04), transparent 70%)',
  },
  gridPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)',
    backgroundSize: '32px 32px',
  },

  layout: { 
    display: 'grid', 
    gridTemplateColumns: '1fr', 
    minHeight: '100vh',
    position: 'relative',
    zIndex: 1
  },
  main: { 
    padding: '40px 36px', 
    overflowY: 'auto' 
  },
  topBar: { 
    marginBottom: '28px' 
  },
  heading: { 
    fontSize: '32px', 
    fontWeight: '900', 
    color: '#0F172A', 
    marginBottom: '8px',
    letterSpacing: '-1px'
  },
  headSub: { 
    fontSize: '15px', 
    color: '#64748B' 
  },
  successBanner: { 
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(16, 185, 129, 0.1)', 
    color: '#10B981', 
    padding: '14px 18px', 
    borderRadius: '12px', 
    fontSize: '14px', 
    fontWeight: '600', 
    marginBottom: '24px', 
    border: '1px solid rgba(16, 185, 129, 0.2)' 
  },
  
  // Info Card
  infoCard: { 
    display: 'flex', 
    gap: '14px', 
    background: 'rgba(37, 99, 235, 0.05)', 
    border: '1px solid rgba(37, 99, 235, 0.15)', 
    borderRadius: '16px', 
    padding: '18px 22px', 
    marginBottom: '32px',
    backdropFilter: 'blur(8px)' 
  },
  infoIcon: { 
    fontSize: '22px', 
    flexShrink: 0 
  },
  infoTitle: { 
    fontSize: '15px', 
    fontWeight: '700', 
    color: '#1D4ED8', 
    marginBottom: '4px' 
  },
  infoText: { 
    fontSize: '13.5px', 
    color: '#3B82F6', 
    lineHeight: '1.6' 
  },

  // Document Grid
  docsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(3, 1fr)', 
    gap: '24px', 
    marginBottom: '32px' 
  },
  docCard: { 
    background: 'rgba(255, 255, 255, 0.7)', 
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '20px', 
    padding: '26px', 
    border: '1px solid rgba(255, 255, 255, 0.8)', 
    boxShadow: '0 4px 20px rgba(15,23,42,0.03)' 
  },
  docCardTop: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '14px' 
  },
  docIcon: { 
    fontSize: '32px' 
  },
  statusBadge: { 
    padding: '5px 14px', 
    borderRadius: '20px', 
    fontSize: '12px', 
    fontWeight: '700' 
  },
  docTitle: { 
    fontSize: '16px', 
    fontWeight: '800', 
    color: '#0F172A', 
    marginBottom: '6px' 
  },
  docDesc: { 
    fontSize: '13.5px', 
    color: '#64748B', 
    marginBottom: '20px', 
    lineHeight: '1.5' 
  },

  // Upload Area
  uploadArea: { 
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100px',
    border: '2px dashed rgba(148, 163, 184, 0.4)', 
    borderRadius: '14px', 
    padding: '16px', 
    textAlign: 'center', 
    marginBottom: '14px',
    background: 'rgba(255,255,255,0.5)',
    animation: 'borderPulse 3s ease-in-out infinite'
  },
  uploadAreaDone: { 
    border: '2px dashed rgba(16, 185, 129, 0.4)', 
    background: 'rgba(16, 185, 129, 0.04)',
    animation: 'none'
  },
  uploadBgIcon: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none'
  },
  uploadText: { 
    fontSize: '14px', 
    fontWeight: '700', 
    color: '#374151', 
    marginBottom: '4px' 
  },
  uploadSub: { 
    fontSize: '12px', 
    color: '#94A3B8' 
  },

  // Links & Status Messages
  viewLink: { 
    display: 'inline-block', 
    fontSize: '13px', 
    color: '#6366F1', 
    fontWeight: '700', 
    textDecoration: 'none', 
    marginBottom: '10px',
    transition: 'color 0.2s'
  },
  rejectedNote: { 
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(239, 68, 68, 0.08)', 
    color: '#EF4444', 
    padding: '10px 14px', 
    borderRadius: '10px', 
    fontSize: '12.5px', 
    fontWeight: '600' 
  },
  verifiedNote: { 
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(16, 185, 129, 0.08)', 
    color: '#10B981', 
    padding: '10px 14px', 
    borderRadius: '10px', 
    fontSize: '12.5px', 
    fontWeight: '600' 
  },

  // Summary Card
  summaryCard: { 
    background: 'rgba(255, 255, 255, 0.5)', 
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '20px', 
    padding: '26px', 
    border: '1px solid rgba(255, 255, 255, 0.8)', 
    boxShadow: '0 4px 20px rgba(15,23,42,0.03)' 
  },
  summaryTitle: { 
    fontSize: '16px', 
    fontWeight: '800', 
    color: '#0F172A', 
    marginBottom: '18px' 
  },
  summaryGrid: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px' 
  },
  summaryItem: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '14px', 
    padding: '12px 0', 
    borderBottom: '1px solid rgba(0,0,0,0.04)' 
  },
  summaryIcon: { 
    fontSize: '20px' 
  },
  summaryLabel: { 
    flex: 1, 
    fontSize: '14px', 
    fontWeight: '600', 
    color: '#374151' 
  },
  summaryStatus: { 
    padding: '5px 14px', 
    borderRadius: '20px', 
    fontSize: '12px', 
    fontWeight: '700' 
  }
}