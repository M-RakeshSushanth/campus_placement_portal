import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Upload,
  Save,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  ShieldCheck,
  User,
  Sparkles
} from 'lucide-react';

export default function StudentProfile() {
  const { student, updateStudentProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: student?.name || '',
    personalEmail: student?.personalEmail || '',
    branch: student?.branch || 'CSE',
    section: student?.section || 'A',
    academicYear: student?.academicYear || '2026',
    cgpa: student?.cgpa || 8.0,
    backlogs: student?.backlogs || 0,
    skills: (student?.skills || []).join(', '),
    resumeText: student?.resumeText || ''
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await axios.put('/api/student/profile', formData);
      updateStudentProfile(res.data.student);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadResume = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResumeFile(file);

    const uploadData = new FormData();
    uploadData.append('resume', file);
    uploadData.append('resumeText', formData.resumeText);

    setUploading(true);
    setMessage('');
    setError('');
    try {
      const res = await axios.post('/api/student/upload-resume', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Resume uploaded successfully!');
      // Update local student info
      if (student) {
        updateStudentProfile({
          ...student,
          resumeUrl: res.data.resumeUrl,
          resumeFileName: res.data.fileName
        });
      }
    } catch (err) {
      setError('Failed to upload resume file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Placement Profile & Resume Repository</h1>
        <p className="text-sm text-[#475569] mt-1">
          Maintain your verified academic records, placement credentials, and resume for automated eligibility filtering.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {message}
        </div>
      )}

      {error && (
        <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] rounded-lg text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Academic Credentials Overview */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs text-center">
            <div className="h-16 w-16 mx-auto rounded-full bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center font-bold text-xl text-[#4F46E5]">
              {(student?.name || 'S')[0].toUpperCase()}
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mt-3">{student?.name}</h3>
            <p className="text-xs text-[#2563EB] font-medium mt-0.5">{student?.collegeEmail}</p>
            <div className="mt-3 pt-3 border-t border-[#F1F5F9] text-xs text-[#475569] space-y-1">
              <p>Branch: <strong>{student?.branch}</strong> (Sec {student?.section})</p>
              <p>Passing Class: <strong>{student?.academicYear}</strong></p>
              <p>CGPA: <strong>{student?.cgpa}</strong></p>
              <p>Active Backlogs: <strong>{student?.backlogs || 0}</strong></p>
            </div>
          </div>

          {/* Resume Upload Box */}
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-[#0F172A] font-bold text-sm">
              <FileText className="h-4 w-4 text-[#2563EB]" />
              <span>Saved Resume File</span>
            </div>

            {student?.resumeUrl ? (
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
                <p className="font-semibold text-[#0F172A] truncate">
                  {student.resumeFileName || 'Resume.pdf'}
                </p>
                <a
                  href={student.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#2563EB] font-medium hover:underline block mt-1"
                >
                  Download / View &rarr;
                </a>
              </div>
            ) : (
              <p className="text-xs text-[#64748B]">No resume uploaded yet.</p>
            )}

            <label className="block">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleUploadResume}
                disabled={uploading}
                className="hidden"
                id="resume-file-input"
              />
              <label
                htmlFor="resume-file-input"
                className="w-full py-2 px-3 border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="h-3.5 w-3.5 text-[#2563EB]" />
                {uploading ? 'Uploading...' : 'Upload New Resume'}
              </label>
            </label>
          </div>
        </div>

        {/* Right Column: Editable Profile & Resume Text */}
        <div className="md:col-span-2">
          <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider pb-2 border-b border-[#F1F5F9]">
              Placement Profile Attributes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">Personal Email</label>
                <input
                  type="email"
                  value={formData.personalEmail}
                  onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">Branch</label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">Section</label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">Year</label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Technical Skills (Comma-separated)
              </label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="Java, Python, React, MongoDB, System Design"
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#475569]">
                  Resume Summary & Project Keywords (Used for ATS Intelligence)
                </label>
                <span className="text-[11px] text-[#6366F1] font-semibold flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> ATS Parser
                </span>
              </div>
              <textarea
                rows={5}
                value={formData.resumeText}
                onChange={(e) => setFormData({ ...formData, resumeText: e.target.value })}
                placeholder="Paste key sections from your resume: summary, technical projects, technologies used, metrics achieved..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
