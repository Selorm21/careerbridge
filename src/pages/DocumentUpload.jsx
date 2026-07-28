import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

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
    if (status === 'verified') return { bg: '#ECFDF5', color: '#059669', icon: '✓' }
    if (status === 'rejected') return { bg: '#FEF2F2', color: '#DC2626', icon: '✗' }
    return { bg: '#FFFBEB', color: '#D97706', icon: '⏳' }
  }

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .pageIn{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) forwards}
        .sideBtn{transition:all .2s ease;cursor:pointer}
        .sideBtn:hover{background:#1E293B!important;color:#fff!important}
        .uploadArea{transition:all .2s ease;cursor:pointer}
        .uploadArea:hover{border-color:#2563EB!important;background:#EFF6FF!important}
        .backBtn{transition:all .2s ease}
        .backBtn:hover{background:#EFF6FF!important;color:#2563EB!important}
        @media(max-width:768px){.sidebar{display:none!important}.main{padding:20px 16px!important}}
      `}</style>

      <div style={S.layout}>
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
            <div className="sideBtn" style={S.sideNavItem} onClick={() => navigate('/student')}><span style={S.sideNavIcon}>📊</span> Dashboard</div>
            <div className="sideBtn" style={S.sideNavItem} onClick={() => navigate('/browse-jobs')}><span style={S.sideNavIcon}>🔍</span> Browse Jobs</div>
            <div className="sideBtn" style={S.sideNavItem} onClick={() => navigate('/student-profile')}><span style={S.sideNavIcon}>👤</span> My Profile</div>
            <div className="sideBtn" style={S.sideNavItem} onClick={() => navigate('/resume-builder')}><span style={S.sideNavIcon}>📄</span> Resume Builder</div>
            <div className="sideBtn" style={{...S.sideNavItem, ...S.sideNavActive}}><span style={S.sideNavIcon}>📁</span> Documents</div>
          </nav>
          <button style={S.logoutBtn} onClick={() => supabase.auth.signOut()}>← Log out</button>
        </aside>

        <main className="main" style={S.main}>
          <div className="pageIn" style={S.topBar}>
            <div>
              <h1 style={S.heading}>Document Verification</h1>
              <p style={S.headSub}>Upload your documents for verification by the university coordinator</p>
            </div>
          </div>

          {success && <div style={S.successBanner}>✓ {success}</div>}

          <div style={S.infoCard}>
            <div style={S.infoIcon}>ℹ️</div>
            <div>
              <div style={S.infoTitle}>How document verification works</div>
              <div style={S.infoText}>Upload your documents below. The University Coordinator will review and verify them. Verified documents strengthen your profile and increase employer trust.</div>
            </div>
          </div>

          <div style={S.docsGrid}>
            {docTypes.map(docType => {
              const doc = getDoc(docType.key)
              const st = doc ? getStatusStyle(doc.status) : null
              return (
                <div key={docType.key} style={S.docCard}>
                  <div style={S.docCardTop}>
                    <div style={S.docIcon}>{docType.icon}</div>
                    {doc && (
                      <span style={{...S.statusBadge, background: st.bg, color: st.color}}>
                        {st.icon} {doc.status}
                      </span>
                    )}
                  </div>
                  <div style={S.docTitle}>{docType.label}</div>
                  <div style={S.docDesc}>{docType.desc}</div>

                  <label className="uploadArea" style={{...S.uploadArea, ...(doc ? S.uploadAreaDone : {})}}>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => e.target.files[0] && handleUpload(docType.key, e.target.files[0])} />
                    {uploading === docType.key ? (
                      <div style={S.uploadText}>⏳ Uploading...</div>
                    ) : doc ? (
                      <div>
                        <div style={S.uploadText}>✓ Uploaded</div>
                        <div style={S.uploadSub}>Click to replace</div>
                      </div>
                    ) : (
                      <div>
                        <div style={S.uploadText}>📤 Upload file</div>
                        <div style={S.uploadSub}>PDF, JPG or PNG</div>
                      </div>
                    )}
                  </label>

                  {doc?.file_url && (
                    <a href={doc.file_url} target="_blank" rel="noreferrer" style={S.viewLink}>View uploaded document →</a>
                  )}

                  {doc?.status === 'rejected' && (
                    <div style={S.rejectedNote}>⚠️ Document was rejected. Please upload a clearer version.</div>
                  )}
                  {doc?.status === 'verified' && (
                    <div style={S.verifiedNote}>✓ This document has been verified by the coordinator.</div>
                  )}
                </div>
              )
            })}
          </div>

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
                    <span style={{...S.summaryStatus, background: st?.bg || '#F1F5F9', color: st?.color || '#94A3B8'}}>
                      {doc ? doc.status : 'not uploaded'}
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

const S = {
  page: { minHeight: '100vh', background: '#F1F5F9', fontFamily: "'Inter', -apple-system, sans-serif" },
  layout: { display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100vh' },
  sidebar: { background: '#0F172A', display: 'flex', flexDirection: 'column', padding: '0', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' },
  sidebarTop: { padding: '28px 24px 20px' },
  sidebarLogo: { fontSize: '18px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px', marginBottom: '28px' },
  avatarWrap: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #3B82F6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', flexShrink: 0 },
  avatarName: { fontSize: '14px', fontWeight: '700', color: '#F1F5F9' },
  avatarRole: { fontSize: '11.5px', color: '#64748B', fontWeight: '500' },
  sideNav: { padding: '20px 12px', flex: 1 },
  sideNavItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: '#94A3B8', marginBottom: '4px' },
  sideNavActive: { background: '#1E293B', color: '#fff' },
  sideNavIcon: { fontSize: '16px' },
  logoutBtn: { margin: '0 12px 24px', padding: '11px', background: 'transparent', border: '1px solid #1E293B', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#64748B', textAlign: 'left' },
  main: { padding: '32px 36px', overflowY: 'auto' },
  topBar: { marginBottom: '24px' },
  heading: { fontSize: '26px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' },
  headSub: { fontSize: '14.5px', color: '#94A3B8' },
  successBanner: { background: '#ECFDF5', color: '#059669', padding: '13px 18px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', marginBottom: '20px', border: '1px solid #A7F3D0' },
  infoCard: { display: 'flex', gap: '14px', background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px' },
  infoIcon: { fontSize: '22px', flexShrink: 0 },
  infoTitle: { fontSize: '14px', fontWeight: '700', color: '#1D4ED8', marginBottom: '4px' },
  infoText: { fontSize: '13px', color: '#2563EB', lineHeight: '1.6' },
  docsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  docCard: { background: '#fff', borderRadius: '16px', padding: '22px', border: '1px solid #F0F2F5', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' },
  docCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  docIcon: { fontSize: '28px' },
  statusBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  docTitle: { fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' },
  docDesc: { fontSize: '13px', color: '#94A3B8', marginBottom: '16px', lineHeight: '1.5' },
  uploadArea: { display: 'block', border: '2px dashed #E5E7EB', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '12px' },
  uploadAreaDone: { border: '2px dashed #A7F3D0', background: '#F0FDF4' },
  uploadText: { fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '4px' },
  uploadSub: { fontSize: '12px', color: '#94A3B8' },
  viewLink: { display: 'block', fontSize: '13px', color: '#2563EB', fontWeight: '700', textDecoration: 'none', marginBottom: '8px' },
  rejectedNote: { background: '#FEF2F2', color: '#DC2626', padding: '10px 12px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600' },
  verifiedNote: { background: '#ECFDF5', color: '#059669', padding: '10px 12px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600' },
  summaryCard: { background: '#fff', borderRadius: '16px', padding: '22px', border: '1px solid #F0F2F5', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' },
  summaryTitle: { fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' },
  summaryGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  summaryItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #F8FAFC' },
  summaryIcon: { fontSize: '18px' },
  summaryLabel: { flex: 1, fontSize: '14px', fontWeight: '600', color: '#374151' },
  summaryStatus: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }
}