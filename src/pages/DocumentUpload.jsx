// src/pages/DocumentUpload.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import {
  Info, Check, AlertCircle, Upload, FileText, Clock, XCircle
} from 'lucide-react'

export default function DocumentUpload() {
  const [profile, setProfile] = useState(null)
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(null)
  const [success, setSuccess] = useState('')

  const docTypes = [
    { key: 'transcript', label: 'Academic Transcript', icon: '🎓', desc: 'Your official academic transcript from your university' },
    { key: 'national_id', label: 'National ID', icon: '🪪', desc: 'Ghana Card or any valid national identification' },
    { key: 'recommendation', label: 'Recommendation Letter', icon: '📝', desc: 'A recommendation letter from a lecturer or employer' },
  ]

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)
      const { data: docsData } = await supabase.from('documents').select('*').eq('student_id', user.id)
      setDocuments(docsData || [])
    }
    getData()
  }, [])

  async function handleUpload(docType, file) {
    setUploading(docType)
    setSuccess('')
    const { data: { user } } = await supabase.auth.getUser()
    const fileName = `${user.id}/${docType}.${file.name.split('.').pop()}`

    const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, file, { upsert: true })
    if (uploadError) { alert('Upload failed: ' + uploadError.message); setUploading(null); return }

    const { data } = supabase.storage.from('documents').getPublicUrl(fileName)
    const existing = documents.find(d => d.doc_type === docType)

    if (existing) {
      await supabase.from('documents').update({
        file_url: data.publicUrl, status: 'pending', uploaded_at: new Date()
      }).eq('id', existing.id)
    } else {
      await supabase.from('documents').insert({
        student_id: user.id, doc_type: docType, file_url: data.publicUrl, status: 'pending'
      })
    }

    const { data: docsData } = await supabase.from('documents').select('*').eq('student_id', user.id)
    setDocuments(docsData || [])
    setSuccess(`${docType.replace('_', ' ')} uploaded successfully!`)
    setTimeout(() => setSuccess(''), 3000)
    setUploading(null)
  }

  const getDoc = (type) => documents.find(d => d.doc_type === type)

  function statusStyle(status) {
    if (status === 'verified') return { bg: 'bg-emerald-50', color: 'text-emerald-700', border: 'border-emerald-200', icon: Check, label: 'Verified' }
    if (status === 'rejected') return { bg: 'bg-red-50', color: 'text-red-700', border: 'border-red-200', icon: XCircle, label: 'Rejected' }
    return { bg: 'bg-amber-50', color: 'text-amber-700', border: 'border-amber-200', icon: Clock, label: 'Pending' }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto animate-fade-up space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Document Verification</h1>
        <p className="text-sm text-slate-500 mt-1">Upload your documents for verification by the university coordinator.</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
          <Check size={16} /> {success}
        </div>
      )}

      {/* Info Banner */}
      <div className="flex gap-3.5 p-5 rounded-2xl bg-blue-50/60 border border-blue-200">
        <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-blue-800">How document verification works</p>
          <p className="text-xs text-blue-700 mt-1 leading-relaxed">
            Upload your documents below. The University Coordinator will review and verify them. Verified documents strengthen your profile and increase employer trust.
          </p>
        </div>
      </div>

      {/* Document cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {docTypes.map(dt => {
          const doc = getDoc(dt.key)
          const st = doc ? statusStyle(doc.status) : null
          const StatusIcon = st?.icon

          return (
            <div key={dt.key} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">{dt.icon}</div>
                {doc && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${st.bg} ${st.color} ${st.border}`}>
                    <StatusIcon size={11} /> {st.label}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">{dt.label}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-5">{dt.desc}</p>

              <label className="block border-2 border-dashed border-slate-300 hover:border-brand-400 rounded-2xl p-4 text-center cursor-pointer transition bg-slate-50/50 hover:bg-brand-50/30 mb-3">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={e => e.target.files[0] && handleUpload(dt.key, e.target.files[0])}
                />
                {uploading === dt.key ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-700">
                    <div className="w-4 h-4 border-2 border-slate-200 border-t-brand-500 rounded-full animate-spin" />
                    Uploading...
                  </div>
                ) : doc ? (
                  <>
                    <Check size={20} className="mx-auto text-emerald-500 mb-1" />
                    <p className="text-sm font-bold text-slate-800">Uploaded</p>
                    <p className="text-xs text-slate-500">Click to replace</p>
                  </>
                ) : (
                  <>
                    <Upload size={20} className="mx-auto text-brand-500 mb-1" />
                    <p className="text-sm font-bold text-slate-800">Upload file</p>
                    <p className="text-xs text-slate-500">PDF, JPG, or PNG</p>
                  </>
                )}
              </label>

              {doc?.file_url && (
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 mb-2"
                >
                  <FileText size={12} /> View uploaded document →
                </a>
              )}

              {doc?.status === 'rejected' && (
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 p-2 rounded-lg">
                  <AlertCircle size={12} /> Rejected — please upload a clearer version
                </div>
              )}
              {doc?.status === 'verified' && (
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                  <Check size={12} /> Verified by coordinator
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle">
        <h3 className="text-base font-bold text-slate-900 mb-4">Verification Summary</h3>
        <div className="space-y-2">
          {docTypes.map(dt => {
            const doc = getDoc(dt.key)
            const st = doc ? statusStyle(doc.status) : null
            return (
              <div key={dt.key} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-b-0">
                <span className="text-lg">{dt.icon}</span>
                <span className="flex-1 text-sm font-semibold text-slate-700">{dt.label}</span>
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                    st ? `${st.bg} ${st.color} ${st.border}` : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  {doc ? doc.status : 'Not uploaded'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}