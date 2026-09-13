// src/lib/aiMatchingEngine.js
import { profileStore } from './profileStore.js';

function normalizeSkill(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[().#+/]/g, '')
    .trim();
}

export function evaluateJobMatch(job, customProfile = null) {
  const profile = customProfile || profileStore.profile;
  if (!job) return null;

  const candidateSkills = (profile.skills || []).map((s) => s.trim());
  const candidateSkillsNorm = candidateSkills.map(normalizeSkill);

  const jobSkills = (job.skills || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const jobSkillsNorm = jobSkills.map(normalizeSkill);

  const matchedSkills = [];
  const missingSkills = [];

  for (let i = 0; i < jobSkills.length; i++) {
    const rawReq = jobSkills[i];
    const normReq = jobSkillsNorm[i];

    const isMatch = candidateSkillsNorm.some(
      (cand) => cand.includes(normReq) || normReq.includes(cand)
    );

    if (isMatch) matchedSkills.push(rawReq);
    else missingSkills.push(rawReq);
  }

  // Bonus from bio / headline / experience keywords
  let contextualBonus = 0;
  const searchableProfileText = [
    profile.headline || '',
    profile.bio || '',
    profile.major || '',
    ...(profile.experience || []).flatMap((e) => [e.title, ...(e.bullets || [])]),
    ...(profile.projects || []).flatMap((p) => [p.title, p.tech, p.description]),
  ]
    .join(' ')
    .toLowerCase();

  const titleWords = (job.title || '')
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);
  for (const word of titleWords) {
    if (searchableProfileText.includes(word)) contextualBonus += 4;
  }

  let baseScore = 65;
  if (jobSkills.length > 0) {
    const skillRatio = matchedSkills.length / jobSkills.length;
    baseScore = Math.round(skillRatio * 85);
  }

  const finalScore = Math.max(35, Math.min(98, baseScore + contextualBonus));

  let tier = 'stretch';
  let tierBadge = 'Stretch Match';
  let tierColor = 'text-amber-700 bg-amber-50 border-amber-200';
  if (finalScore >= 80) {
    tier = 'high';
    tierBadge = 'Top AI Match';
    tierColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else if (finalScore >= 60) {
    tier = 'medium';
    tierBadge = 'Good Match';
    tierColor = 'text-blue-700 bg-blue-50 border-blue-200';
  }

  let aiRationale = '';
  if (finalScore >= 80) {
    aiRationale = `Your profile demonstrates exceptional synergy with this ${job.title} position at ${job.company}. You fulfill ${matchedSkills.length} of ${jobSkills.length || 1} core requirements, notably in ${matchedSkills.slice(0, 3).join(', ')}.`;
  } else if (finalScore >= 60) {
    aiRationale = `Solid potential match for ${job.title}. You have strong foundational capability in ${matchedSkills.join(', ') || 'modern software principles'}. Bridging experience in ${missingSkills.slice(0, 2).join(' or ') || 'specialized tools'} will elevate your interview placement odds.`;
  } else {
    aiRationale = `This opportunity offers high learning growth. While you possess complementary skills like ${matchedSkills.join(', ') || 'general problem solving'}, the position requires expertise in ${missingSkills.slice(0, 2).join(' and ')}.`;
  }

  const recommendations = [];
  if (missingSkills.length > 0) {
    recommendations.push(
      `Highlight any side projects or coursework related to ${missingSkills[0]} in your tailored cover letter.`
    );
  }
  if (matchedSkills.length >= 2) {
    recommendations.push(
      `Feature your hands-on experience with ${matchedSkills[0]} and ${matchedSkills[1]} prominently at the top of your CV.`
    );
  }

  const jobTypeStr = (job.type || 'relevant').toLowerCase();
  const companyStr = job.company || 'the employer';
  recommendations.push(
    `Align your resume summary with ${companyStr}'s focus on ${jobTypeStr} engineering standards.`
  );

  return {
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    score: finalScore,
    tier,
    tierBadge,
    tierColor,
    matchedSkills,
    missingSkills,
    aiRationale,
    recommendations,
    matchedCount: matchedSkills.length,
    totalRequiredCount: jobSkills.length,
  };
}

export function rankJobsByAiMatch(jobs, customProfile = null) {
  if (!jobs || !Array.isArray(jobs)) return [];

  const evaluated = jobs.map((job) => ({
    ...job,
    aiMatch: evaluateJobMatch(job, customProfile),
  }));

  return evaluated.sort((a, b) => (b.aiMatch?.score || 0) - (a.aiMatch?.score || 0));
}