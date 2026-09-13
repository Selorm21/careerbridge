// src/components/JobCard.jsx
import React from 'react';
import {
  MapPin, Sparkles, Check, ArrowRight, ShieldCheck, Image as ImageIcon
} from 'lucide-react';
import { jobsStore } from '../lib/jobsStore';

export default function JobCard({ job, onOpenDetails, onQuickApply, isApplied }) {
  const matchScore = jobsStore.calculateMatchScore(job.skills);

  // Employer verification lives on the joined employer profile
  const isEmployerVerified = job?.employer?.verified === true || job?.verified === true;

  const getMatchBadgeStyle = (score) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  const skillsList = (job.skills || '').split(',').map((s) => s.trim()).filter(Boolean);
  const studentSkills = (jobsStore.candidateSkills || '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 hover:border-brand-300/80 shadow-subtle hover:shadow-elevated transition-all duration-300 overflow-hidden flex flex-col group relative">
      {job.image_attachment && (
        <div
          onClick={() => onOpenDetails(job)}
          className="relative w-full h-40 bg-slate-100 overflow-hidden cursor-pointer border-b border-slate-100"
        >
          <img
            src={job.image_attachment.url}
            alt={job.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[11px] font-bold">
            <ImageIcon className="w-3 h-3 text-brand-400" />
            <span className="capitalize">{job.image_attachment.type || 'Flyer'}</span>
          </div>

          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
            <span className="text-xs font-semibold drop-shadow-sm truncate">{job.company}</span>
            {job.salary && (
              <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md">
                {job.salary}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-3 min-w-0">
              {job.company_logo || (job.image_attachment?.type === 'logo' && job.image_attachment.url) ? (
                <img
                  src={job.company_logo || job.image_attachment.url}
                  alt={job.company}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-white shadow-sm flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 border border-brand-200 text-brand-600 flex items-center justify-center font-black text-sm flex-shrink-0">
                  {job.company ? job.company.slice(0, 2).toUpperCase() : 'CB'}
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-600 truncate">{job.company}</span>
                  {isEmployerVerified && (
                    <span title="Verified Employer" className="inline-flex items-center flex-shrink-0">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-50" />
                    </span>
                  )}
                </div>
                <h3
                  onClick={() => onOpenDetails(job)}
                  className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors cursor-pointer line-clamp-1"
                >
                  {job.title}
                </h3>
              </div>
            </div>

            <div className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center gap-1 flex-shrink-0 ${getMatchBadgeStyle(matchScore)}`}>
              <Sparkles className="w-3 h-3" />
              <span>{matchScore}%</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3">
            <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md font-medium text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 font-semibold px-2.5 py-1 rounded-md">
              {job.type}
            </span>
            {!job.image_attachment && job.salary && (
              <span className="text-slate-600 font-semibold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">
                {job.salary}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {job.description}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {skillsList.slice(0, 4).map((skill, idx) => {
              const isMatch = studentSkills.some((s) => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s));
              return (
                <span
                  key={idx}
                  className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition ${
                    isMatch ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {isMatch ? '✓ ' : ''}{skill}
                </span>
              );
            })}
            {skillsList.length > 4 && (
              <span className="text-[11px] px-1.5 py-0.5 text-slate-400 font-semibold">+{skillsList.length - 4} more</span>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={() => onOpenDetails(job)}
            className="text-xs font-bold text-slate-700 hover:text-brand-600 transition flex items-center gap-1 py-2 px-1"
          >
            {job.image_attachment ? 'View Flyer & Details' : 'View Details'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {isApplied ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold">
              <Check className="w-3.5 h-3.5" /> Applied
            </span>
          ) : (
            <button
              onClick={() => onQuickApply(job)}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
            >
              Apply now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}