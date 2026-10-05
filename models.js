const mongoose = require('mongoose');

// 1. User Model (Admin, Faculty, Student)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'faculty', 'student'], required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// 2. Student Profile Model
const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  collegeEmail: { type: String, required: true, unique: true, lowercase: true },
  personalEmail: { type: String, default: '' },
  branch: { type: String, required: true }, // e.g. CSE, IT, ECE
  section: { type: String, required: true }, // e.g. A, B, C
  academicYear: { type: String, required: true }, // e.g. 2026, 2027, 2028
  cgpa: { type: Number, required: true, min: 0, max: 10 },
  academicScores: {
    tenth: { type: Number, default: 0 },
    intermediate: { type: Number, default: 0 }
  },
  backlogs: { type: Number, default: 0 },
  skills: [{ type: String }],
  resumeUrl: { type: String, default: '' },
  resumeText: { type: String, default: '' }, // Extracted text for fallback / ATS
  resumeFileName: { type: String, default: '' }
}, { timestamps: true });

// 3. Company Model
const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  website: { type: String, default: '' },
  logoUrl: { type: String, default: '' }
}, { timestamps: true });

// 4. Opportunity Model
const selectionRoundSchema = new mongoose.Schema({
  name: { type: String, required: true },
  order: { type: Number, required: true },
  type: {
    type: String,
    enum: ['resume_screening', 'online_assessment', 'coding', 'technical_interview', 'hr', 'custom'],
    default: 'custom'
  },
  description: { type: String, default: '' }
});

const opportunitySchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['full_time', 'internship', 'hackathon', 'recruitment_drive', 'career_event'],
    default: 'full_time'
  },
  description: { type: String, required: true },
  requiredSkills: [{ type: String }],
  eligibility: {
    minCgpa: { type: Number, default: 0 },
    branches: [{ type: String }],
    academicYears: [{ type: String }],
    maxBacklogs: { type: Number, default: 0 },
    requiredSkills: [{ type: String }]
  },
  targetAudience: {
    branches: [{ type: String }],
    sections: [{ type: String }],
    academicYears: [{ type: String }]
  },
  deadline: { type: Date, required: true },
  selectionRounds: [selectionRoundSchema],
  status: { type: String, enum: ['draft', 'published', 'closed'], default: 'published' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// 5. Application Model
const roundResultSchema = new mongoose.Schema({
  roundId: { type: mongoose.Schema.Types.ObjectId },
  roundName: { type: String },
  result: { type: String, enum: ['pending', 'qualified', 'rejected'], default: 'pending' },
  feedback: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

const applicationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  resumeUrl: { type: String, default: '' },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'submitted', 'shortlisted', 'in_selection', 'selected', 'rejected'],
    default: 'submitted'
  },
  currentRoundOrder: { type: Number, default: 1 },
  roundResults: [roundResultSchema],
  appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });
applicationSchema.index({ studentId: 1, opportunityId: 1 }, { unique: true });

// 6. Resume Analysis Model
const resumeAnalysisSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  score: { type: Number, required: true },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  recommendations: [{ type: String }],
  matchedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  attemptNumber: { type: Number, default: 1 }
}, { timestamps: true });

// 7. Notification Model
const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['opportunity', 'application_update', 'shortlisted', 'deadline_reminder', 'announcement', 'selection'],
    default: 'announcement'
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

// 8. Preparation Resources Model
const preparationResourceSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' },
  type: {
    type: String,
    enum: ['interview_question', 'study_material', 'coding_question', 'mock_interview'],
    required: true
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  requiredStage: {
    type: String,
    enum: ['resume_screening', 'online_assessment', 'coding', 'technical_interview', 'hr'],
    default: 'resume_screening'
  }
}, { timestamps: true });

// 9. Admin Settings Model
const settingsSchema = new mongoose.Schema({
  approvedEmailDomains: [{ type: String }],
  branches: [{ type: String }],
  sections: [{ type: String }],
  academicYears: [{ type: String }],
  maxResumeAttempts: { type: Number, default: 3 },
  maxMockInterviewAttempts: { type: Number, default: 3 },
  deadlineReminderHours: { type: Number, default: 24 }
}, { timestamps: true });

module.exports = {
  User: mongoose.model('User', userSchema),
  Student: mongoose.model('Student', studentSchema),
  Company: mongoose.model('Company', companySchema),
  Opportunity: mongoose.model('Opportunity', opportunitySchema),
  Application: mongoose.model('Application', applicationSchema),
  ResumeAnalysis: mongoose.model('ResumeAnalysis', resumeAnalysisSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  PreparationResource: mongoose.model('PreparationResource', preparationResourceSchema),
  Settings: mongoose.model('Settings', settingsSchema)
};
