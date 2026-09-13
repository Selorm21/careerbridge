// src/pages/StudentProfile.jsx
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import {
  Save, AlertCircle, Check, File, Upload, User, Camera, X, RefreshCw
} from 'lucide-react'
import { compressImage } from '../lib/imageUtils'

export default function StudentProfile() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [fullName, setFullName] = useState('')
  const [university, setUniversity] = useState('')
  const [course, setCourse] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [indexNumber, setIndexNumber] = useState('')
  const [skills, setSkills] = useState('')
  const [bio, setBio] = useState('')
  const [cvUrl, setCvUrl] = useState('')
  const [avatar, setAvatar] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [profile, setProfile] = useState(null)
  const [applicationsCount, setApplicationsCount] = useState(0)
  const [interviewsCount, setInterviewsCount] = useState(0)
  const navigate = useNavigate()
  const avatarInputRef = useRef(null)

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setFullName(data.full_name || '')
        setUniversity(data.university || '')
        setCourse(data.course || '')
        setGraduationYear(data.graduation_year || '')
        setIndexNumber(data.index_number || '')
        setSkills(data.skills || '')
        setBio(data.bio || '')
        setCvUrl(data.cv_url || '')
        setAvatar(data.avatar_url || '')
      }

      const { data: appsData } = await supabase.from('applications').select('id').eq('student_id', user.id)
      setApplicationsCount(appsData?.length || 0)

      const { data: interviewsData } = await supabase.from('interviews').select('id').eq('student_id', user.id)
      setInterviewsCount(interviewsData?.length || 0)
    }
    getProfile()
  }, [])

  async function handleCvUpload(file) {
    setUploading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const fileName = `${user.id}/cv.pdf`
    const { error: upError } = await supabase.storage.from('cvs').upload(fileName, file, { upsert: true })
    if (upError) { setError('CV upload failed: ' + upError.message); setUploading(false); return }
    const { data } = supabase.storage.from('cvs').getPublicUrl(fileName)
    setCvUrl(data.publicUrl)

    await supabase.from('profiles').update({ cv_url: data.publicUrl }).eq('id', user.id)
    setUploading(false)
    setSuccess('CV uploaded successfully!')
    setTimeout(() => setSuccess(''), 3000)
  }

  async function handleAvatarUpload(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please pick a valid image file.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image too large (max 5 MB).'); return }

    setUploadingAvatar(true)
    setError('')

    try {
      // Compress to a 400x400 square
      const compressed = await compressImage(file, 400, 400, 0.88)
      const dataUrl = compressed.dataUrl

      const { data: { user } } = await supabase.auth.getUser()
      const fileName = `${user.id}/avatar.jpg`

      // Upload to a storage bucket called 'avatars' (create it in Supabase if you don't have it)
      const { error: upError } = await supabase.storage
        .from('avatars')
        .upload(fileName, dataUrlToBlob(dataUrl), { upsert: true, contentType: 'image/jpeg' })

      let publicUrl = dataUrl
      if (!upError) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
        publicUrl = data.publicUrl
      } else {
        // Fallback: store data URL directly (larger but works)
        console.warn('Avatar storage upload failed, using data URL:', upError.message)
      }

      setAvatar(publicUrl)
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      setSuccess('Profile photo updated!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
      setError('Failed to process image.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  function dataUrlToBlob(dataUrl) {
    const [meta, base64] = dataUrl.split(',')
    const mime = meta.match(/:(.*?);/)[1]
    const bin = atob(base64)
    const arr = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
    return new Blob([arr], { type: mime })
  }

  async function handleSave(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const { data: { user } } = await supabase.auth.getUser()
    const { error: upError } = await supabase.from('profiles').update({
      full_name: fullName,
      university,
      course,
      graduation_year: graduationYear,
      index_number: indexNumber,
      skills,
      bio,
      cv_url: cvUrl || undefined,
      avatar_url: avatar || undefined,
    }).eq('id', user.id)

    if (upError) setError(upError.message)
    else setSuccess('Profile saved successfully!')
    setLoading(false)
    setTimeout(() => setSuccess(''), 3000)
  }

  function profileStrength() {
    let score = 0
    if (fullName) score += 16
    if (university) score += 16
    if (course) score += 16
    if (indexNumber) score += 16
    if (skills) score += 16
    if (bio) score += 20
    return score
  }

  const strength = profileStrength()
  const strengthColor = strength >= 80 ? '#10B981' : strength >= 60 ? '#F59E0B' : strength >= 40 ? '#F59E0B' : '#EF4444'

  const initials = (name) => (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto animate-fade-up space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Complete your profile to get better matches and impress employers</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
          <Check size={16} /> {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* LEFT — form */}
        <form onSubmit={handleSave} className="space-y-5">
          {/* Personal Info */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle space-y-5">
            <h2 className="text-base font-bold text-slate-900">Personal Information</h2>

            {/* Avatar upload */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl bg-gradient-to-br from-brand-50/50 to-slate-50 border border-brand-100">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="relative w-24 h-24 rounded-3xl overflow-hidden bg-brand-50 border-2 border-white shadow-md flex-shrink-0 group"
              >
                {avatar ? (
                  <img src={avatar} alt={fullName || 'Avatar'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-black text-brand-500">
                    {initials(fullName) || <User size={28} className="text-brand-500" />}
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploadingAvatar ? <RefreshCw size={20} className="text-white animate-spin" /> : <Camera size={20} className="text-white" />}
                </div>
              </button>

              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-sm font-bold text-slate-900">Profile Photo</h3>
                <p className="text-xs text-slate-500 mt-1">JPG, PNG, or WEBP. We'll compress it to a square.</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                  >
                    <Upload size={14} /> {uploadingAvatar ? 'Optimizing...' : 'Upload Photo'}
                  </button>
                  {avatar && (
                    <button
                      type="button"
                      onClick={async () => {
                        setAvatar('')
                        const { data: { user } } = await supabase.auth.getUser()
                        await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id)
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition"
                    >
                      <X size={14} /> Remove
                    </button>
                  )}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => e.target.files[0] && handleAvatarUpload(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">University / School</label>
                <input
                  type="text"
                  value={university}
                  onChange={e => setUniversity(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Course / Programme</label>
                <input
                  type="text"
                  value={course}
                  onChange={e => setCourse(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Expected graduation year</label>
                <select
                  value={graduationYear}
                  onChange={e => setGraduationYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="">Select year</option>
                  {[2025, 2026, 2027, 2028, 2029, 2030].map(y => <option key={y} value={String(y)}>{y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Index Number / Student ID</label>
              <input
                type="text"
                value={indexNumber}
                onChange={e => setIndexNumber(e.target.value)}
                placeholder="e.g. UG202312345"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Skills & Bio */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle space-y-5">
            <h2 className="text-base font-bold text-slate-900">Skills & Bio</h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Your skills</label>
              <input
                type="text"
                value={skills}
                onChange={e => setSkills(e.target.value)}
                placeholder="e.g. Python, React, SQL, Machine Learning"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <p className="text-xs text-slate-500 mt-1.5">Separate with commas — used for AI matching</p>
            </div>

            {skills && (
              <div className="flex flex-wrap gap-1.5">
                {skills.split(',').filter(s => s.trim()).map((s, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                    {s.trim()}
                  </span>
                ))}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Short bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell employers about yourself, your goals, and experience..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 min-h-[110px] resize-y"
              />
            </div>
          </div>

          {/* CV Upload */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle">
            <h2 className="text-base font-bold text-slate-900 mb-4">CV / Resume</h2>
            <label className="block border-2 border-dashed border-slate-300 hover:border-brand-400 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition bg-slate-50/50 hover:bg-brand-50/30">
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={e => e.target.files[0] && handleCvUpload(e.target.files[0])}
              />
              {uploading ? (
                <div className="space-y-2">
                  <RefreshCw size={26} className="mx-auto text-brand-500 animate-spin" />
                  <p className="text-sm font-bold text-slate-700">Uploading your CV...</p>
                </div>
              ) : cvUrl ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                    <Check size={22} />
                  </div>
                  <p className="text-sm font-bold text-slate-900">CV uploaded</p>
                  <p className="text-xs text-slate-500">
                    Click to replace ·{' '}
                    <a href={cvUrl} target="_blank" rel="noreferrer" className="text-brand-600 underline font-bold" onClick={e => e.stopPropagation()}>
                      View CV →
                    </a>
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-500 mx-auto flex items-center justify-center">
                    <File size={22} />
                  </div>
                  <p className="text-sm font-bold text-slate-900">Upload your CV</p>
                  <p className="text-xs text-slate-500">Click to browse · PDF only · Max 5 MB</p>
                </div>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition shadow-brand active:scale-95 inline-flex items-center justify-center gap-2"
          >
            <Save size={16} /> {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        {/* RIGHT — strength */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Profile strength</h3>
            <div className="text-4xl font-black mb-3" style={{ color: strengthColor }}>{strength}%</div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${strength}%`, background: strengthColor }} />
            </div>

            <div className="space-y-2.5">
              {[
                { label: 'Full name', done: !!fullName },
                { label: 'University', done: !!university },
                { label: 'Course', done: !!course },
                { label: 'Index Number', done: !!indexNumber },
                { label: 'Skills', done: !!skills },
                { label: 'Bio', done: !!bio },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      item.done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {item.done ? '✓' : ''}
                  </span>
                  <span className={`text-xs ${item.done ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 rounded-3xl border border-amber-200 p-6">
            <h3 className="text-sm font-bold text-amber-700 mb-3">💡 Tips</h3>
            <ul className="text-xs text-amber-800 space-y-2 leading-relaxed">
              <li>• Add all your technical skills</li>
              <li>• Upload an up-to-date CV</li>
              <li>• Write a compelling bio</li>
              <li>• A complete profile gets 3× more matches</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}