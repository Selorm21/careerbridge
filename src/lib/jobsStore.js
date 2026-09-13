// src/lib/jobsStore.js
import { supabase } from '../supabase';

const STORAGE_KEY = 'careerbridge_local_jobs_v2';
const APPS_KEY = 'careerbridge_user_applications_v2';

export function parseJobDescription(rawDescription) {
  if (!rawDescription) return { description: '', imageAttachment: null, salary: null };

  let description = rawDescription;
  let imageAttachment = null;
  let salary = null;

  const imgMatch = rawDescription.match(/<!--ATTACHMENT_IMAGE:([\s\S]*?)-->/);
  if (imgMatch) {
    try {
      imageAttachment = JSON.parse(imgMatch[1]);
      description = description.replace(imgMatch[0], '').trim();
    } catch (e) {
      console.warn('Failed to parse image attachment:', e);
    }
  }

  const salMatch = rawDescription.match(/<!--SALARY:(.*?)-->/);
  if (salMatch) {
    salary = salMatch[1].trim();
    description = description.replace(salMatch[0], '').trim();
  }

  return { description, imageAttachment, salary };
}

export function packJobDescription(description, imageAttachment, salary) {
  let packed = description || '';
  if (salary) packed += `\n\n<!--SALARY:${salary}-->`;
  if (imageAttachment && imageAttachment.url) {
    packed += `\n\n<!--ATTACHMENT_IMAGE:${JSON.stringify(imageAttachment)}-->`;
  }
  return packed;
}

class JobsStore {
  constructor() {
    const local = this.getLocalJobs();
    this.jobs = this.dedupe(local);
    this.applications = this.loadApplications();
    this.listeners = new Set();
    this.hasLoaded = false;
    this.candidateSkills = '';
  }

  dedupe(list) {
    const seen = new Set();
    const unique = [];
    for (const j of list) {
      const key = j.id || (j.title + '|' + j.company);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(j);
      }
    }
    return unique;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) listener(this.jobs);
  }

  loadApplications() {
    try {
      const stored = localStorage.getItem(APPS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  saveApplications() {
    try {
      localStorage.setItem(APPS_KEY, JSON.stringify(this.applications));
    } catch (e) {}
  }

  getLocalJobs() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  saveLocalJobs(jobs) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch (e) {}
  }

  async fetchJobs() {
    let remoteJobs = [];
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        remoteJobs = data.map((j) => {
          const { description, imageAttachment, salary } = parseJobDescription(j.description);
          return {
            ...j,
            description,
            image_attachment: imageAttachment,
            salary: salary || j.salary || null,
            verified: true,
            isRemoteDb: true,
          };
        });
      }
    } catch (err) {
      console.warn('Could not fetch from remote Supabase jobs, using local store:', err);
    }

    const localJobs = this.getLocalJobs();
    this.jobs = this.dedupe([...remoteJobs, ...localJobs]);
    this.hasLoaded = true;
    this.notify();
    return this.jobs;
  }

  async addJob(newJob) {
    const id = 'job_' + Date.now();
    const createdAt = new Date().toISOString();

    const packedDescription = packJobDescription(
      newJob.description,
      newJob.image_attachment,
      newJob.salary
    );

    const jobRecord = {
      id,
      created_at: createdAt,
      title: newJob.title,
      company: newJob.company,
      location: newJob.location,
      type: newJob.type,
      description: newJob.description,
      skills: newJob.skills,
      salary: newJob.salary || null,
      image_attachment: newJob.image_attachment || null,
      company_logo: newJob.company_logo || null,
      verified: true,
      employer_id: newJob.employer_id || null,
    };

    try {
      const { data: userData } = await supabase.auth.getUser();
      const employerId = userData?.user?.id || null;

      const insertPayload = {
        title: newJob.title,
        company: newJob.company,
        location: newJob.location,
        type: newJob.type,
        description: packedDescription,
        skills: newJob.skills,
      };
      if (employerId) insertPayload.employer_id = employerId;

      const { data, error } = await supabase.from('jobs').insert(insertPayload).select().single();
      if (!error && data) {
        jobRecord.id = data.id;
        jobRecord.isRemoteDb = true;
      }
    } catch (e) {
      console.warn('Supabase remote insert bypassed, saving locally:', e);
    }

    const currentLocal = this.getLocalJobs();
    this.saveLocalJobs([jobRecord, ...currentLocal]);

    this.jobs = [jobRecord, ...this.jobs.filter((j) => j.id !== jobRecord.id)];
    this.notify();
    return jobRecord;
  }

  deleteJob(jobId) {
    const currentLocal = this.getLocalJobs().filter((j) => j.id !== jobId);
    this.saveLocalJobs(currentLocal);

    supabase
      .from('jobs')
      .delete()
      .eq('id', jobId)
      .then(() => {})
      .catch(() => {});

    this.jobs = this.jobs.filter((j) => j.id !== jobId);
    this.notify();
  }

  applyToJob(jobId, studentNotes = '') {
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job) return false;

    if (this.applications.some((a) => a.jobId === jobId)) return false;

    const newApp = {
      id: 'app_' + Date.now(),
      jobId,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      image_attachment: job.image_attachment,
      appliedAt: new Date().toISOString(),
      status: 'applied',
      studentNotes,
    };

    this.applications = [newApp, ...this.applications];
    this.saveApplications();
    this.notify();
    return true;
  }

  hasApplied(jobId) {
    return this.applications.some((a) => a.jobId === jobId);
  }

  calculateMatchScore(jobSkills) {
    if (!jobSkills) return 60;
    const student = this.candidateSkills.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
    const required = jobSkills.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
    if (!required.length) return 75;

    const matched = required.filter((r) => student.some((s) => s.includes(r) || r.includes(s)));
    const percentage = Math.round((matched.length / required.length) * 100);
    return Math.max(25, Math.min(98, percentage));
  }
}

export const jobsStore = new JobsStore();