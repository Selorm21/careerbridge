// src/components/JobDetailModal.jsx
import React, { useState } from 'react';
import {
  X, MapPin, CheckCircle2, Sparkles, ShieldCheck,
  Image as ImageIcon, ZoomIn, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { jobsStore } from '../lib/jobsStore';
import { profileStore } from '../lib/profileStore';
import { evaluateJobMatch } from '../lib/aiMatchingEngine';

export default function JobDetailModal({ job, onClose, onApply, isApplied }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(isApplied);

  if (!job) return null;

  const isEmployerVerified = job?.employer?.verified === true || job?.verified === true;
  const aiMatch = evaluateJobMatch(job, profileStore.profile);
  const primaryResume = profileStore.getPrimaryResume();

  const handleApplyClick = () => {
    setApplying(true);
    setTimeout(() => {
      onApply(job.id);
      setApplying(false);
      setAppliedSuccess(true);
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-fade-up">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Job ID: {job.id}</span>
            <span>·</span>
            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-bold">Active Listing</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {job.image_attachment && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 relative group">
              <div
                onClick={() => setLightboxOpen(true)}
                className="relative max-h-80 w-full overflow-hidden cursor-zoom-in flex items-center justify-center"
              >
                <img
                  src={job.image_attachment.url}
                  alt={job.title}
                  className="w-full h-full object-contain max-h-80 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white/90 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-brand-500" /> Click to enlarge flyer
                  </span>
                </div>
              </div>
              <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium">
                  <ImageIcon className="w-4 h-4 text-brand-400" />
                  Attached Recruitment Material ({job.image_attachment.type || 'Flyer'})
                </span>
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="text-brand-400 hover:text-brand-300 font-bold underline"
                >
                  Full resolution
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-brand-600">{job.company}</span>
                {isEmployerVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3" /> Verified Employer
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{job.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location}
                </span>
                <span>·</span>
                <span className="bg-brand-50 text-brand-700 font-bold px-2 py-0.5 rounded">{job.type}</span>
                {job.salary && (
                  <>
                    <span>·</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{job.salary}</span>
                  </>
                )}
              </div>
            </div>

            <div className={`p-4 rounded-2xl border text-center min-w-[140px] flex-shrink-0 ${aiMatch?.tierColor}`}>
              <span className="text-3xl font-black block">{aiMatch?.score}%</span>
              <span className="text-[11px] uppercase tracking-wider font-extrabold block">{aiMatch?.tierBadge}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-50/70 to-purple-50/50 border border-brand-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-600" />
                AI Compatibility Rationale
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{aiMatch?.aiRationale}</p>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-sm font-bold text-slate-900">Key Skills & Requirements Comparison</h4>
            <div className="flex flex-wrap gap-2">
              {aiMatch?.matchedSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs px-3 py-1.5 rounded-xl font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {skill}
                </span>
              ))}
              {aiMatch?.missingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs px-3 py-1.5 rounded-xl font-medium bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5"
                >
                  {skill}
                  <span className="text-[10px] text-amber-600 font-semibold">(Skill gap)</span>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900">Job Description & Responsibilities</h4>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
              {job.description}
            </div>
          </div>
        </div>

        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition"
          >
            Close
          </button>

          {appliedSuccess ? (
            <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-5 py-2.5 rounded-xl text-sm font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Application Submitted!</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs text-slate-500 font-medium">
                CV: <strong className="text-slate-800">{primaryResume?.title || 'Profile Resume'}</strong>
              </span>
              <button
                onClick={handleApplyClick}
                disabled={applying}
                className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition shadow-md flex items-center gap-2 active:scale-95"
              >
                {applying ? <span>Submitting...</span> : <><span>1-Click Apply</span> <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          )}
        </div>
      </div>

      {lightboxOpen && job.image_attachment && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-up"
        >
          <img
            src={job.image_attachment.url}
            alt={job.title}
            className="max-h-[92vh] max-w-[92vw] object-contain rounded-xl shadow-2xl"
          />
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-brand-400 p-2 rounded-full bg-white/10 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}