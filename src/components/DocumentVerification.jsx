import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function DocumentVerification() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    setError(null)

    try {
      console.log('🔍 ===== STARTING FETCH =====')

      // Step 1: Get ALL documents
      const { data: docsData, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .order('uploaded_at', { ascending: false })

      if (docsError) {
        console.error('❌ Docs error:', docsError)
        setError('Failed to load documents')
        setLoading(false)
        return
      }

      console.log('📄 Documents found:', docsData?.length || 0)

      if (!docsData || docsData.length === 0) {
        setStudents([])
        setLoading(false)
        return
      }

      // Step 2: Get ALL profiles - NO FILTERS!
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')

      if (profilesError) {
        console.error('❌ Profiles error:', profilesError)
        setError('Failed to load profiles')
        setLoading(false)
        return
      }

      console.log('👤 ALL profiles found:', profilesData?.length || 0)
      console.log('👤 ALL profiles:', profilesData)

      // Step 3: Create a map of profile ID -> profile data
      const profileMap = {}
      profilesData.forEach(p => {
        console.log(`📍 Mapping profile: ${p.id} -> ${p.full_name} (role: ${p.role})`)
        profileMap[p.id] = {
          full_name: p.full_name || 'Unknown Student',
          email: p.email || 'No email',
          university: p.university || 'No university',
          course: p.course || 'No course',
          index_number: p.index_number || 'No index number',
          skills: p.skills || '',
          graduation_year: p.graduation_year || '',
          role: p.role || 'student'
        }
      })

      console.log('🗺️ Profile map keys:', Object.keys(profileMap))

      // Step 4: Group documents by student_id and merge with profile data
      const studentMap = {}
      
      docsData.forEach((doc, index) => {
        const studentId = doc.student_id
        
        console.log(`📄 Document ${index}: student_id = ${studentId}`)
        console.log(`   Does profile exist? ${!!profileMap[studentId]}`)
        
        if (!studentMap[studentId]) {
          // Get profile data or use defaults
          const profile = profileMap[studentId] || {
            full_name: 'Unknown Student',
            email: 'No email',
            university: 'No university',
            course: 'No course',
            index_number: 'No index number',
            skills: '',
            graduation_year: ''
          }
          
          console.log(`   Creating new student entry for ${studentId} with name: ${profile.full_name}`)
          
          studentMap[studentId] = {
            id: studentId,
            full_name: profile.full_name,
            email: profile.email,
            university: profile.university,
            course: profile.course,
            index_number: profile.index_number,
            skills: profile.skills,
            graduation_year: profile.graduation_year,
            role: profile.role,
            documents: []
          }
        }
        
        studentMap[studentId].documents.push(doc)
      })

      console.log('📊 Final student map:', studentMap)

      // Step 5: Convert to array
      const result = Object.values(studentMap)
      
      console.log('✅ Final result:', result)

      setStudents(result)
    } catch (err) {
      console.error('❌ Unexpected error:', err)
      setError('An unexpected error occurred: ' + err.message)
    }

    setLoading(false)
  }

  async function updateDocumentStatus(docId, status) {
    setUpdating(docId)
    try {
      const { error } = await supabase
        .from('documents')
        .update({ 
          status: status,
          verified_at: status === 'verified' ? new Date().toISOString() : null
        })
        .eq('id', docId)

      if (error) {
        console.error('Error updating document:', error)
        alert('Failed to update document: ' + error.message)
      } else {
        await fetchData()
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('An unexpected error occurred')
    }
    setUpdating(null)
  }

  function getStatusBadge(status) {
    const map = {
      'verified': { bg: '#D1FAE5', color: '#059669', label: '✅ Verified' },
      'rejected': { bg: '#FEE2E2', color: '#DC2626', label: '❌ Rejected' },
      'pending': { bg: '#FEF3C7', color: '#D97706', label: '⏳ Pending' }
    }
    return map[status] || map['pending']
  }

  function getDocTypeLabel(type) {
    const map = {
      'transcript': '🎓 Academic Transcript',
      'national_id': '🪪 National ID',
      'recommendation': '📝 Recommendation Letter'
    }
    return map[type] || type
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#64748B' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #E2E8F0', 
          borderTop: '4px solid #6366F1', 
          borderRadius: '50%',
          margin: '0 auto 16px',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p>Loading document verification...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#DC2626' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        <p style={{ fontSize: '18px', fontWeight: '600' }}>{error}</p>
        <button 
          onClick={fetchData}
          style={{
            marginTop: '16px',
            padding: '10px 24px',
            background: '#6366F1',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Try Again
        </button>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#64748B' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
        <p style={{ fontSize: '18px', fontWeight: '600' }}>No documents uploaded yet</p>
        <p style={{ fontSize: '14px' }}>Students need to upload documents for verification</p>
      </div>
    )
  }

  const totalDocs = students.reduce((acc, s) => acc + s.documents.length, 0)
  const totalPending = students.reduce((acc, s) => acc + s.documents.filter(d => d.status === 'pending').length, 0)

  return (
    <>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>📁 Document Verification</h2>
            <p style={styles.subtitle}>
              {students.length} student{students.length > 1 ? 's' : ''} · {totalDocs} total documents · {totalPending} pending
            </p>
          </div>
          <button onClick={fetchData} style={styles.refreshBtn}>
            🔄 Refresh
          </button>
        </div>

        {students.map(student => {
          const hasPending = student.documents.some(d => d.status === 'pending')
          const hasVerified = student.documents.some(d => d.status === 'verified')
          const hasRejected = student.documents.some(d => d.status === 'rejected')

          return (
            <div 
              key={student.id} 
              style={{
                ...styles.studentCard,
                border: hasPending ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                boxShadow: hasPending ? '0 4px 20px rgba(245,158,11,0.15)' : 'none'
              }}
              onClick={() => {
                setSelectedStudent(student)
                setShowModal(true)
              }}
            >
              <div style={styles.studentHeader}>
                <div style={styles.studentInfo}>
                  <div style={styles.avatar}>
                    {student.full_name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <div style={styles.studentName}>
                      {student.full_name || 'Unknown Student'}
                    </div>
                    <div style={styles.studentEmail}>
                      📧 {student.email || 'No email'}
                    </div>
                    <div style={styles.studentIndex}>
                      🆔 {student.index_number || 'No index number'}
                    </div>
                    <div style={styles.studentMeta}>
                      {student.course || 'No course'} · {student.university || 'No university'}
                    </div>
                  </div>
                </div>

                <div style={styles.statusBadges}>
                  {hasPending && (
                    <span style={styles.badgePending}>
                      ⏳ {student.documents.filter(d => d.status === 'pending').length} pending
                    </span>
                  )}
                  {hasVerified && (
                    <span style={styles.badgeVerified}>
                      ✅ {student.documents.filter(d => d.status === 'verified').length} verified
                    </span>
                  )}
                  {hasRejected && (
                    <span style={styles.badgeRejected}>
                      ❌ {student.documents.filter(d => d.status === 'rejected').length} rejected
                    </span>
                  )}
                </div>
              </div>

              <div style={styles.documentsRow}>
                {student.documents.map(doc => {
                  const status = getStatusBadge(doc.status)
                  return (
                    <span 
                      key={doc.id}
                      style={{
                        ...styles.docTag,
                        background: status.bg,
                        color: status.color
                      }}
                    >
                      {getDocTypeLabel(doc.doc_type)} → {status.label}
                    </span>
                  )
                })}
              </div>

              <div style={styles.viewProfile}>
                Click to view full profile →
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && selectedStudent && (
        <div style={modalStyles.overlay} onClick={() => setShowModal(false)}>
          <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
            <button style={modalStyles.close} onClick={() => setShowModal(false)}>✕</button>

            <div style={modalStyles.studentInfo}>
              <div style={modalStyles.avatarLarge}>
                {selectedStudent.full_name?.charAt(0) || 'S'}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={modalStyles.name}>{selectedStudent.full_name || 'Unknown Student'}</h2>
                <div style={modalStyles.details}>
                  <span>📧 {selectedStudent.email || 'No email'}</span>
                  <span>🆔 {selectedStudent.index_number || 'No index number'}</span>
                  <span>🎓 {selectedStudent.course || 'No course'}</span>
                  <span>🏛️ {selectedStudent.university || 'No university'}</span>
                  {selectedStudent.graduation_year && (
                    <span>📅 {selectedStudent.graduation_year}</span>
                  )}
                </div>
                {selectedStudent.skills && (
                  <div style={modalStyles.skills}>
                    {selectedStudent.skills.split(',').slice(0, 6).map((skill, i) => (
                      <span key={i} style={modalStyles.skillChip}>{skill.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={modalStyles.docSection}>
              <h3 style={modalStyles.docTitle}>📄 Documents ({selectedStudent.documents.length})</h3>
              {selectedStudent.documents.map((doc) => {
                const status = getStatusBadge(doc.status)
                return (
                  <div key={doc.id} style={modalStyles.docCard}>
                    <div style={modalStyles.docHeader}>
                      <div>
                        <div style={modalStyles.docName}>{getDocTypeLabel(doc.doc_type)}</div>
                        <div style={modalStyles.docDate}>
                          Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span style={{
                        ...modalStyles.docStatus,
                        background: status.bg,
                        color: status.color
                      }}>
                        {status.label}
                      </span>
                    </div>

                    {doc.file_url && (
                      <a href={doc.file_url} target="_blank" rel="noreferrer" style={modalStyles.viewLink}>
                        📎 View Document
                      </a>
                    )}

                    {doc.status === 'pending' && (
                      <div style={modalStyles.actions}>
                        <button 
                          style={modalStyles.verifyBtn}
                          onClick={() => updateDocumentStatus(doc.id, 'verified')}
                          disabled={updating === doc.id}
                        >
                          ✅ Verify
                        </button>
                        <button 
                          style={modalStyles.rejectBtn}
                          onClick={() => updateDocumentStatus(doc.id, 'rejected')}
                          disabled={updating === doc.id}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const styles = {
  container: {
    padding: '20px 0'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0F172A',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748B',
    margin: '4px 0 0 0'
  },
  refreshBtn: {
    padding: '8px 16px',
    background: '#F1F5F9',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    color: '#475569',
    transition: 'all 0.2s ease'
  },
  studentCard: {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '1px solid #E2E8F0'
  },
  studentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  },
  studentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '700',
    flexShrink: 0
  },
  studentName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0F172A'
  },
  studentEmail: {
    fontSize: '13px',
    color: '#64748B'
  },
  studentIndex: {
    fontSize: '13px',
    color: '#64748B',
    fontWeight: '600'
  },
  studentMeta: {
    fontSize: '13px',
    color: '#64748B',
    marginTop: '2px'
  },
  statusBadges: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap'
  },
  badgePending: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    background: '#FEF3C7',
    color: '#D97706'
  },
  badgeVerified: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    background: '#D1FAE5',
    color: '#059669'
  },
  badgeRejected: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    background: '#FEE2E2',
    color: '#DC2626'
  },
  documentsRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '4px'
  },
  docTag: {
    padding: '2px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  viewProfile: {
    marginTop: '12px',
    fontSize: '13px',
    color: '#6366F1',
    fontWeight: '600'
  }
}

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  modal: {
    background: '#FFFFFF',
    borderRadius: '24px',
    maxWidth: '680px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '32px',
    position: 'relative',
    boxShadow: '0 25px 70px rgba(15, 23, 42, 0.2)'
  },
  close: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    background: '#F1F5F9',
    color: '#64748B',
    fontSize: '18px',
    cursor: 'pointer'
  },
  studentInfo: {
    display: 'flex',
    gap: '20px',
    paddingBottom: '24px',
    borderBottom: '1px solid #F1F5F9',
    marginBottom: '24px'
  },
  avatarLarge: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '700',
    flexShrink: 0
  },
  name: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0F172A',
    margin: '0 0 4px 0'
  },
  details: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    fontSize: '14px',
    color: '#64748B'
  },
  skills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '8px'
  },
  skillChip: {
    padding: '2px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    background: '#EEF2FF',
    color: '#4F46E5'
  },
  docSection: {
    marginTop: '4px'
  },
  docTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: '16px'
  },
  docCard: {
    background: '#F8FAFC',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    border: '1px solid #F1F5F9'
  },
  docHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px'
  },
  docName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#0F172A'
  },
  docDate: {
    fontSize: '12px',
    color: '#94A3B8'
  },
  docStatus: {
    padding: '4px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700'
  },
  viewLink: {
    display: 'inline-block',
    fontSize: '13px',
    color: '#6366F1',
    fontWeight: '600',
    textDecoration: 'none',
    marginBottom: '10px'
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px'
  },
  verifyBtn: {
    padding: '6px 18px',
    background: '#10B981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  rejectBtn: {
    padding: '6px 18px',
    background: '#EF4444',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  }
}