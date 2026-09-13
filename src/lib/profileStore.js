// src/lib/profileStore.js
const PROFILE_STORAGE_KEY = 'careerbridge_student_profile_v3';
const DOCS_STORAGE_KEY = 'careerbridge_student_docs_v3';

export const INITIAL_STUDENT_PROFILE = {
  full_name: 'Student',
  headline: '',
  email: '',
  phone: '',
  location: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=260&q=80',
  bio: '',
  university: '',
  degree: '',
  major: '',
  graduation_year: '',
  gpa: '',
  skills: [],
  links: { github: '', linkedin: '', portfolio: '', twitter: '' },
  preferences: {
    targetRoles: [],
    jobTypes: [],
    workplaceType: '',
    targetSalary: '',
  },
  experience: [],
  education: [],
  projects: [],
  certifications: [],
};

export const INITIAL_DOCUMENTS = [];

class ProfileStore {
  constructor() {
    this.profile = this.loadProfile();
    this.documents = this.loadDocuments();
    this.listeners = new Set();
  }

  loadProfile() {
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) return { ...INITIAL_STUDENT_PROFILE, ...JSON.parse(stored) };
    } catch (e) {}
    return { ...INITIAL_STUDENT_PROFILE };
  }

  saveProfile(updatedProfile) {
    this.profile = { ...this.profile, ...updatedProfile };
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(this.profile));
    } catch (e) {}
    this.notify();
    return this.profile;
  }

  loadDocuments() {
    try {
      const stored = localStorage.getItem(DOCS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [...INITIAL_DOCUMENTS];
  }

  saveDocuments(docs) {
    this.documents = docs;
    try {
      localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(this.documents));
    } catch (e) {}
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener({ profile: this.profile, documents: this.documents });
    }
  }

  addDocument(doc) {
    const newDoc = {
      id: 'doc_' + Date.now(),
      uploadedAt: new Date().toISOString().split('T')[0],
      isPrimary: this.documents.length === 0,
      ...doc,
    };
    this.saveDocuments([newDoc, ...this.documents]);
    return newDoc;
  }

  deleteDocument(docId) {
    const remaining = this.documents.filter((d) => d.id !== docId);
    if (!remaining.some((d) => d.isPrimary) && remaining.length > 0) {
      const firstResume = remaining.find((d) => d.type === 'resume') || remaining[0];
      firstResume.isPrimary = true;
    }
    this.saveDocuments(remaining);
  }

  setPrimaryResume(docId) {
    const updated = this.documents.map((d) => ({ ...d, isPrimary: d.id === docId }));
    this.saveDocuments(updated);
  }

  getPrimaryResume() {
    return (
      this.documents.find((d) => d.isPrimary) ||
      this.documents.find((d) => d.type === 'resume') ||
      this.documents[0] ||
      null
    );
  }

  getProfileCompleteness() {
    const p = this.profile;
    let score = 0;
    if (p.full_name) score += 10;
    if (p.email) score += 10;
    if (p.headline) score += 10;
    if (p.bio) score += 10;
    if (p.university && p.major) score += 15;
    if (p.skills && p.skills.length >= 5) score += 15;
    if (p.experience && p.experience.length >= 1) score += 15;
    if (p.projects && p.projects.length >= 1) score += 10;
    if (this.documents.some((d) => d.type === 'resume')) score += 5;
    return Math.min(100, score);
  }

  getAtsScore() {
    const p = this.profile;
    let ats = 70;
    if (p.skills && p.skills.length >= 8) ats += 10;
    if (p.experience && p.experience.some((e) => e.bullets && e.bullets.length >= 2)) ats += 10;
    if (p.education && p.education.length > 0) ats += 5;
    if (this.documents.some((d) => d.isPrimary)) ats += 5;
    return Math.min(96, ats);
  }
}

export const profileStore = new ProfileStore();