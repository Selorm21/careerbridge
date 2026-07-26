export function calculateMatchScore(studentSkills, jobSkills) {
  if (!studentSkills || !jobSkills) return { score: 0, matched: [], missing: [] }

  const student = studentSkills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean)
  const job = jobSkills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean)

  if (job.length === 0) return { score: 0, matched: [], missing: [] }

  const matched = []
  const missing = []

  job.forEach(jobSkill => {
    const isMatch = student.some(studentSkill =>
      studentSkill.includes(jobSkill) || jobSkill.includes(studentSkill)
    )
    if (isMatch) matched.push(jobSkill)
    else missing.push(jobSkill)
  })

  const score = Math.round((matched.length / job.length) * 100)

  return { score, matched, missing }
}

export function getScoreColor(score) {
  if (score >= 80) return { color: '#059669', bg: '#ECFDF5', label: 'Excellent match' }
  if (score >= 60) return { color: '#D97706', bg: '#FFFBEB', label: 'Good match' }
  if (score >= 40) return { color: '#2563EB', bg: '#EFF6FF', label: 'Partial match' }
  return { color: '#DC2626', bg: '#FEF2F2', label: 'Low match' }
}