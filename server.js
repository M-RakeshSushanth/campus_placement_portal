const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
require('dotenv').config();

const {
  User,
  Student,
  Company,
  Opportunity,
  Application,
  ResumeAnalysis,
  Notification,
  PreparationResource,
  Settings
} = require('./models');
const { seedDatabase } = require('./seed');

const app = express();
const server = http.createServer(app);

// WebSocket Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// Resumes storage
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({ storage });

// Real-time socket room mapping
const userSockets = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    if (userId) {
      userSockets.set(userId.toString(), socket.id);
      socket.join(`user_${userId}`);
    }
  });

  socket.on('disconnect', () => {
    for (const [uid, sid] of userSockets.entries()) {
      if (sid === socket.id) {
        userSockets.delete(uid);
        break;
      }
    }
  });
});

function emitToUser(userId, event, data) {
  io.to(`user_${userId}`).emit(event, data);
}

function broadcastUpdate(event, data) {
  io.emit(event, data);
}

// Authentication Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'placement_secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized role access' });
    }
    next();
  };
};

/* ==========================================
   1. AUTHENTICATION & ONBOARDING ROUTES
   ========================================== */

// Public: Get Approved Domains & Branches for verified registration
app.get('/api/settings/public', async (req, res) => {
  try {
    const settings = await Settings.findOne() || {
      approvedEmailDomains: ['college.edu', 'griet.ac.in', 'campus.edu'],
      branches: ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical'],
      sections: ['A', 'B', 'C', 'D'],
      academicYears: ['2025', '2026', '2027', '2028']
    };
    res.json({
      approvedEmailDomains: settings.approvedEmailDomains,
      branches: settings.branches,
      sections: settings.sections,
      academicYears: settings.academicYears
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student Verified Registration
app.post('/api/auth/register-student', async (req, res) => {
  try {
    const { email, password, name, branch, section, academicYear, cgpa, personalEmail, skills } = req.body;

    if (!email || !password || !name || !branch || !academicYear || cgpa === undefined) {
      return res.status(400).json({ error: 'All essential academic fields are required' });
    }

    // Verify Approved Email Domain
    const settings = await Settings.findOne();
    const approvedDomains = settings?.approvedEmailDomains || ['college.edu', 'griet.ac.in', 'campus.edu'];
    const emailDomain = email.split('@')[1]?.toLowerCase();

    if (!emailDomain || !approvedDomains.includes(emailDomain)) {
      return res.status(400).json({
        error: `Email domain '@${emailDomain}' is not approved. Only registered college domains are allowed: ${approvedDomains.join(', ')}`
      });
    }

    // Check existing
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'Account with this verified college email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      role: 'student'
    });

    const parsedSkills = Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []);

    const student = await Student.create({
      userId: user._id,
      name,
      collegeEmail: email.toLowerCase(),
      personalEmail: personalEmail || '',
      branch,
      section: section || 'A',
      academicYear,
      cgpa: Number(cgpa),
      skills: parsedSkills
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'placement_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Student registered successfully',
      token,
      user: { _id: user._id, email: user.email, role: user.role },
      student
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Login (Supports standard and 1-Click Demo)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    let student = null;
    if (user.role === 'student') {
      student = await Student.findOne({ userId: user._id });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'placement_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { _id: user._id, email: user.email, role: user.role },
      student
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Demo Fast Login
app.post('/api/auth/demo-login', async (req, res) => {
  try {
    const { role } = req.body;
    let targetEmail = '24241a0536@grietcollege.com';
    if (role === 'admin') targetEmail = 'admin@college.edu';
    if (role === 'faculty') targetEmail = 'tnp@college.edu';

    let user = await User.findOne({ email: targetEmail });

    // Fallback: If student changed email or doesn't match, find any student
    if (!user && role === 'student') {
      user = await User.findOne({ role: 'student' });
    }

    // Auto-seed if not present
    if (!user) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = await User.create({
        email: targetEmail,
        passwordHash: hashedPassword,
        role: role || 'student',
        isActive: true
      });
      if (user.role === 'student') {
        await Student.create({
          userId: user._id,
          name: 'Maremalla Rakesh Sushanth',
          collegeEmail: targetEmail,
          personalEmail: 'maremallarakesh07@gmail.com',
          branch: 'CSE',
          section: 'A',
          academicYear: '2028',
          cgpa: 9.28,
          skills: ['Java', 'Spring Boot', 'React', 'Node.js', 'MongoDB', 'Data Structures', 'SQL', 'Git'],
          resumeUrl: '/uploads/sample_resume.pdf',
          resumeFileName: 'Rakesh_Sushanth_Resume.pdf',
          resumeText: 'Maremalla Rakesh Sushanth - Computer Science & Engineering (Class of 2028). Skills: Java, Spring Boot, React, MongoDB, REST APIs, Git, Algorithms. Projects: Placement Management Portal. Education: B.Tech CSE CGPA 9.28.'
        });
      }
    }

    let student = null;
    if (user.role === 'student') {
      student = await Student.findOne({ userId: user._id });
      if (!student) {
        student = await Student.create({
          userId: user._id,
          name: 'Maremalla Rakesh Sushanth',
          collegeEmail: user.email,
          personalEmail: 'maremallarakesh07@gmail.com',
          branch: 'CSE',
          section: 'A',
          academicYear: '2028',
          cgpa: 9.28,
          skills: ['Java', 'Spring Boot', 'React', 'Node.js', 'MongoDB', 'Data Structures', 'SQL', 'Git']
        });
      }
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'placement_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { _id: user._id, email: user.email, role: user.role },
      student
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Current User Profile
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    let student = null;
    if (user && user.role === 'student') {
      student = await Student.findOne({ userId: user._id });
    }
    res.json({ user, student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   2. STUDENT PROFILE MANAGEMENT
   ========================================== */

// Update Student Profile
app.put('/api/student/profile', authenticate, authorize(['student']), async (req, res) => {
  try {
    const { name, personalEmail, branch, section, academicYear, cgpa, academicScores, backlogs, skills, resumeText } = req.body;

    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    if (name) student.name = name;
    if (personalEmail !== undefined) student.personalEmail = personalEmail;
    if (branch) student.branch = branch;
    if (section) student.section = section;
    if (academicYear) student.academicYear = academicYear;
    if (cgpa !== undefined) student.cgpa = Number(cgpa);
    if (academicScores) student.academicScores = academicScores;
    if (backlogs !== undefined) student.backlogs = Number(backlogs);
    if (skills) student.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    if (resumeText !== undefined) student.resumeText = resumeText;

    await student.save();
    res.json({ message: 'Profile updated successfully', student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload Student Resume
app.post('/api/student/upload-resume', authenticate, authorize(['student']), upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No resume file uploaded' });

    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const resumeUrl = `/uploads/${req.file.filename}`;
    student.resumeUrl = resumeUrl;
    student.resumeFileName = req.file.originalname;

    // Optional text parsing if plain text was provided or fallback default
    if (req.body.resumeText) {
      student.resumeText = req.body.resumeText;
    }

    await student.save();
    res.json({
      message: 'Resume uploaded successfully',
      resumeUrl,
      fileName: req.file.originalname
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   3. OPPORTUNITIES & ELIGIBILITY ENGINE
   ========================================== */

// Helper to calculate student eligibility against an opportunity
function evaluateEligibility(student, opportunity) {
  const reasons = [];
  let isEligible = true;

  const elig = opportunity.eligibility || {};

  // 1. CGPA
  if (elig.minCgpa !== undefined && student.cgpa < elig.minCgpa) {
    isEligible = false;
    reasons.push(`Minimum CGPA requirement: ${elig.minCgpa} (Your CGPA: ${student.cgpa})`);
  }

  // 2. Branch
  if (elig.branches && elig.branches.length > 0 && !elig.branches.includes(student.branch)) {
    isEligible = false;
    reasons.push(`Allowed branches: ${elig.branches.join(', ')} (Your branch: ${student.branch})`);
  }

  // 3. Academic Year
  if (elig.academicYears && elig.academicYears.length > 0 && !elig.academicYears.includes(student.academicYear)) {
    isEligible = false;
    reasons.push(`Target passing years: ${elig.academicYears.join(', ')} (Your year: ${student.academicYear})`);
  }

  // 4. Backlogs
  if (elig.maxBacklogs !== undefined && student.backlogs > elig.maxBacklogs) {
    isEligible = false;
    reasons.push(`Maximum allowed backlogs: ${elig.maxBacklogs} (Your backlogs: ${student.backlogs})`);
  }

  // 5. Target Audience checks (Section filtering if defined)
  const target = opportunity.targetAudience;
  if (target?.sections && target.sections.length > 0 && !target.sections.includes(student.section)) {
    isEligible = false;
    reasons.push(`Targeted to sections: ${target.sections.join(', ')} (Your section: ${student.section})`);
  }

  // Skills match check
  const studentSkillsUpper = (student.skills || []).map(s => s.toUpperCase());
  const requiredSkills = opportunity.requiredSkills || [];
  const matchedSkills = requiredSkills.filter(s => studentSkillsUpper.includes(s.toUpperCase()));
  const matchPercentage = requiredSkills.length > 0 ? Math.round((matchedSkills.length / requiredSkills.length) * 100) : 100;

  return {
    isEligible,
    reasons,
    matchPercentage,
    matchedSkills,
    missingSkills: requiredSkills.filter(s => !studentSkillsUpper.includes(s.toUpperCase()))
  };
}

// Get Opportunities (Filtered for student or complete list for staff/admin)
app.get('/api/opportunities', authenticate, async (req, res) => {
  try {
    const opportunities = await Opportunity.find().populate('companyId').sort({ createdAt: -1 });

    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user.userId });
      if (!student) return res.json([]);

      // Fetch student's existing applications
      const applications = await Application.find({ studentId: student._id });
      const appMap = new Map();
      applications.forEach(a => appMap.set(a.opportunityId.toString(), a));

      // Append eligibility & application status for each opportunity
      const enriched = opportunities.map(opp => {
        const oppObj = opp.toObject();
        const evalResult = evaluateEligibility(student, oppObj);
        const app = appMap.get(opp._id.toString());

        return {
          ...oppObj,
          eligibilityStatus: evalResult,
          application: app || null
        };
      });

      return res.json(enriched);
    }

    // For Admin / Faculty
    res.json(opportunities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Single Opportunity
app.get('/api/opportunities/:id', authenticate, async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id).populate('companyId');
    if (!opp) return res.status(404).json({ error: 'Opportunity not found' });

    let data = opp.toObject();

    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user.userId });
      if (student) {
        data.eligibilityStatus = evaluateEligibility(student, data);
        const app = await Application.findOne({ studentId: student._id, opportunityId: opp._id });
        data.application = app || null;
      }
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin/T&P: Create Opportunity
app.post('/api/opportunities', authenticate, authorize(['admin', 'faculty']), async (req, res) => {
  try {
    const {
      companyName,
      companyDescription,
      companyWebsite,
      companyLogoUrl,
      title,
      type,
      description,
      requiredSkills,
      eligibility,
      targetAudience,
      deadline,
      selectionRounds
    } = req.body;

    // Find or create company
    let company = await Company.findOne({ name: { $regex: new RegExp(`^${companyName}$`, 'i') } });
    if (!company) {
      company = await Company.create({
        name: companyName,
        description: companyDescription || '',
        website: companyWebsite || '',
        logoUrl: companyLogoUrl || 'https://img.icons8.com/color/96/briefcase.png'
      });
    }

    // Default Selection Rounds if not specified
    const rounds = selectionRounds && selectionRounds.length > 0 ? selectionRounds : [
      { name: 'Resume Screening', order: 1, type: 'resume_screening', description: 'Initial profile evaluation' },
      { name: 'Online Assessment', order: 2, type: 'online_assessment', description: 'Aptitude & Technical OA' },
      { name: 'Technical Interview', order: 3, type: 'technical_interview', description: 'Core problem solving and tech stack discussion' },
      { name: 'HR Interview', order: 4, type: 'hr', description: 'Cultural and compensation interview' }
    ];

    const opp = await Opportunity.create({
      companyId: company._id,
      title,
      type: type || 'full_time',
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : []),
      eligibility: eligibility || {},
      targetAudience: targetAudience || {},
      deadline: new Date(deadline),
      selectionRounds: rounds,
      createdBy: req.user.userId
    });

    const populated = await Opportunity.findById(opp._id).populate('companyId');

    // Real-time broadcast to all students
    broadcastUpdate('new_opportunity', {
      opportunity: populated,
      message: `New Opportunity Published: ${populated.companyId.name} - ${populated.title}`
    });

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin/T&P: Update Opportunity & Modify Selection Rounds
app.put('/api/opportunities/:id', authenticate, authorize(['admin', 'faculty']), async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) return res.status(404).json({ error: 'Opportunity not found' });

    const updates = req.body;
    Object.assign(opp, updates);
    await opp.save();

    const populated = await Opportunity.findById(opp._id).populate('companyId');
    broadcastUpdate('opportunity_updated', populated);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin/T&P: Delete Opportunity
app.delete('/api/opportunities/:id', authenticate, authorize(['admin', 'faculty']), async (req, res) => {
  try {
    await Opportunity.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ opportunityId: req.params.id });
    res.json({ message: 'Opportunity deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   4. APPLICATION LIFECYCLE & ROUND PROGRESSION
   ========================================== */

// Student: Submit Application
app.post('/api/applications/apply', authenticate, authorize(['student']), async (req, res) => {
  try {
    const { opportunityId } = req.body;
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const opp = await Opportunity.findById(opportunityId);
    if (!opp) return res.status(404).json({ error: 'Opportunity not found' });

    // Check deadline
    if (new Date() > new Date(opp.deadline)) {
      return res.status(400).json({ error: 'Application deadline has passed' });
    }

    // Check Eligibility
    const evalResult = evaluateEligibility(student, opp);
    if (!evalResult.isEligible) {
      return res.status(400).json({
        error: 'You are not eligible for this opportunity',
        reasons: evalResult.reasons
      });
    }

    // Check existing
    let appRecord = await Application.findOne({ studentId: student._id, opportunityId: opp._id });
    if (appRecord) {
      return res.status(400).json({ error: 'You have already applied to this opportunity' });
    }

    // Build initial round results tracking
    const roundResults = (opp.selectionRounds || []).map((round, idx) => ({
      roundId: round._id,
      roundName: round.name,
      result: idx === 0 ? 'pending' : 'pending',
      feedback: idx === 0 ? 'Application submitted and queued for resume screening.' : ''
    }));

    appRecord = await Application.create({
      studentId: student._id,
      opportunityId: opp._id,
      resumeUrl: student.resumeUrl || '',
      status: 'submitted',
      currentRoundOrder: 1,
      roundResults
    });

    // Notify student
    const notif = await Notification.create({
      recipientId: req.user.userId,
      type: 'opportunity',
      title: 'Application Submitted Successfully',
      message: `Your application for ${opp.title} has been submitted for review.`,
      opportunityId: opp._id
    });
    emitToUser(req.user.userId, 'notification', notif);

    res.status(201).json({
      message: 'Application submitted successfully',
      application: appRecord
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student: Get My Applications
app.get('/api/student/my-applications', authenticate, authorize(['student']), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) return res.json([]);

    const applications = await Application.find({ studentId: student._id })
      .populate({
        path: 'opportunityId',
        populate: { path: 'companyId' }
      })
      .sort({ updatedAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin/T&P: Get Applications for Opportunity or All
app.get('/api/admin/applications', authenticate, authorize(['admin', 'faculty']), async (req, res) => {
  try {
    const { opportunityId, status, branch } = req.query;
    const filter = {};
    if (opportunityId) filter.opportunityId = opportunityId;
    if (status) filter.status = status;

    let applications = await Application.find(filter)
      .populate('studentId')
      .populate({
        path: 'opportunityId',
        populate: { path: 'companyId' }
      })
      .sort({ updatedAt: -1 });

    if (branch) {
      applications = applications.filter(app => app.studentId && app.studentId.branch === branch);
    }

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin/T&P: Update Application Status & Progression through Selection Rounds
app.put('/api/admin/applications/:id/update-stage', authenticate, authorize(['admin', 'faculty']), async (req, res) => {
  try {
    const { roundIndex, result, feedback, overallStatus } = req.body;
    // result: 'qualified' | 'rejected' | 'pending'
    // overallStatus: 'shortlisted' | 'in_selection' | 'selected' | 'rejected'

    const appRecord = await Application.findById(req.params.id)
      .populate('studentId')
      .populate({
        path: 'opportunityId',
        populate: { path: 'companyId' }
      });

    if (!appRecord) return res.status(404).json({ error: 'Application not found' });

    if (roundIndex !== undefined && appRecord.roundResults[roundIndex]) {
      appRecord.roundResults[roundIndex].result = result;
      if (feedback) appRecord.roundResults[roundIndex].feedback = feedback;
      appRecord.roundResults[roundIndex].updatedAt = new Date();

      if (result === 'qualified') {
        // Progress to next round if available
        if (roundIndex + 1 < appRecord.roundResults.length) {
          appRecord.currentRoundOrder = roundIndex + 2;
          appRecord.status = 'in_selection';
        } else {
          // Final round cleared -> Selected!
          appRecord.status = 'selected';
        }
      } else if (result === 'rejected') {
        appRecord.status = 'rejected';
      }
    }

    if (overallStatus) {
      appRecord.status = overallStatus;
    }

    await appRecord.save();

    // Trigger Real-Time Notification to student
    if (appRecord.studentId?.userId) {
      let notifTitle = 'Application Status Updated';
      let notifMessage = `Your application for ${appRecord.opportunityId?.title} at ${appRecord.opportunityId?.companyId?.name} is now ${appRecord.status.replace('_', ' ').toUpperCase()}.`;

      if (appRecord.status === 'selected') {
        notifTitle = '🎉 Congratulations! You are Selected!';
        notifMessage = `You have received a placement offer from ${appRecord.opportunityId?.companyId?.name}!`;
      } else if (result === 'qualified') {
        notifTitle = '✨ Round Cleared!';
        notifMessage = `You passed ${appRecord.roundResults[roundIndex]?.roundName} for ${appRecord.opportunityId?.companyId?.name}. Check progressive preparation material!`;
      }

      const notif = await Notification.create({
        recipientId: appRecord.studentId.userId,
        type: appRecord.status === 'selected' ? 'selection' : 'application_update',
        title: notifTitle,
        message: notifMessage,
        opportunityId: appRecord.opportunityId?._id
      });

      emitToUser(appRecord.studentId.userId, 'notification', notif);
      emitToUser(appRecord.studentId.userId, 'application_updated', appRecord);
    }

    res.json(appRecord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   5. RESUME INTELLIGENCE & ATS SCORING MODULE
   ========================================== */

app.post('/api/resume/analyze', authenticate, authorize(['student']), async (req, res) => {
  try {
    const { opportunityId, resumeText: customResumeText } = req.body;
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const opp = await Opportunity.findById(opportunityId).populate('companyId');
    if (!opp) return res.status(404).json({ error: 'Opportunity not found' });

    // Check configured attempt limits
    const settings = await Settings.findOne() || { maxResumeAttempts: 3 };
    const previousAnalyses = await ResumeAnalysis.find({
      studentId: student._id,
      opportunityId: opp._id
    });

    if (previousAnalyses.length >= (settings.maxResumeAttempts || 3)) {
      return res.status(400).json({
        error: `Maximum resume review attempts (${settings.maxResumeAttempts}) reached for this opportunity.`
      });
    }

    const textToAnalyze = customResumeText || student.resumeText || student.skills.join(', ');
    const requiredSkills = opp.requiredSkills || [];

    // Analyze text & skills alignment
    const textUpper = (textToAnalyze + ' ' + (student.skills || []).join(' ')).toUpperCase();
    const matchedSkills = [];
    const missingSkills = [];

    requiredSkills.forEach(skill => {
      if (textUpper.includes(skill.toUpperCase())) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    // ATS Calculation formula
    // Factor 1: Skills coverage (50%)
    const skillRatio = requiredSkills.length > 0 ? (matchedSkills.length / requiredSkills.length) : 1;
    let atsScore = Math.round(skillRatio * 50);

    // Factor 2: Academic CGPA Weight (20%)
    if (student.cgpa >= (opp.eligibility?.minCgpa || 0)) {
      atsScore += 20;
    } else {
      atsScore += Math.round((student.cgpa / 10) * 20);
    }

    // Factor 3: Text Depth & Project keywords (20%)
    const keywords = ['PROJECT', 'EXPERIENCE', 'DESIGN', 'REST', 'API', 'DATABASE', 'ALGORITHM', 'GIT', 'DEVELOP'];
    const foundKeywords = keywords.filter(kw => textUpper.includes(kw));
    atsScore += Math.min(20, foundKeywords.length * 3);

    // Factor 4: Structure completeness (10%)
    if (student.academicScores?.tenth && student.academicScores?.intermediate) atsScore += 5;
    if (student.personalEmail) atsScore += 5;

    atsScore = Math.min(100, Math.max(35, atsScore));

    const strengths = [];
    const weaknesses = [];
    const recommendations = [];

    if (matchedSkills.length > 0) {
      strengths.push(`Strong coverage of core competencies: ${matchedSkills.join(', ')}`);
    }
    if (student.cgpa >= 8.0) {
      strengths.push(`Excellent academic record (CGPA ${student.cgpa}) stands out on candidate screening.`);
    }

    if (missingSkills.length > 0) {
      weaknesses.push(`Missing high-priority JD keywords: ${missingSkills.join(', ')}`);
      recommendations.push(`Incorporate hands-on projects highlighting ${missingSkills.slice(0, 3).join(', ')}.`);
    }

    if (!textUpper.includes('METRICS') && !textUpper.includes('%') && !textUpper.includes('OPTIMIZED')) {
      recommendations.push('Quantify your project outcomes using actionable metrics (e.g., "improved query response time by 30%").');
    }

    recommendations.push(`Tailor summary specifically towards ${opp.companyId?.name}'s engineering standards.`);

    const analysis = await ResumeAnalysis.create({
      studentId: student._id,
      opportunityId: opp._id,
      score: atsScore,
      strengths,
      weaknesses,
      recommendations,
      matchedSkills,
      missingSkills,
      attemptNumber: previousAnalyses.length + 1
    });

    res.json({
      analysis,
      attemptsRemaining: (settings.maxResumeAttempts || 3) - (previousAnalyses.length + 1)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Resume Analyses for an Opportunity
app.get('/api/resume/analyses/:opportunityId', authenticate, authorize(['student']), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) return res.json([]);

    const analyses = await ResumeAnalysis.find({
      studentId: student._id,
      opportunityId: req.params.opportunityId
    }).sort({ createdAt: -1 });

    const settings = await Settings.findOne() || { maxResumeAttempts: 3 };

    res.json({
      analyses,
      maxAttempts: settings.maxResumeAttempts || 3,
      attemptsRemaining: Math.max(0, (settings.maxResumeAttempts || 3) - analyses.length)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   6. PROGRESSIVE COMPANY-SPECIFIC PREPARATION
   ========================================== */

// Unlocks company resources progressively based on student's actual cleared rounds
app.get('/api/preparation/:opportunityId', authenticate, authorize(['student']), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const opp = await Opportunity.findById(req.params.opportunityId).populate('companyId');
    if (!opp) return res.status(404).json({ error: 'Opportunity not found' });

    const appRecord = await Application.findOne({
      studentId: student._id,
      opportunityId: opp._id
    });

    // Progressive stage levels
    const stageRank = {
      not_applied: 0,
      resume_screening: 1,
      online_assessment: 2,
      coding: 3,
      technical_interview: 4,
      hr: 5
    };

    let studentCurrentLevel = 0; // Not applied yet

    if (appRecord) {
      studentCurrentLevel = 1; // Submitted, basic resume screening unlocked

      // Check cleared rounds
      (appRecord.roundResults || []).forEach((rr, idx) => {
        if (rr.result === 'qualified') {
          // If cleared resume screening (round 1), unlocks OA/Interview prep
          studentCurrentLevel = Math.max(studentCurrentLevel, idx + 2);
        }
      });
    }

    // Fetch resources for company & opportunity
    const allResources = await PreparationResource.find({
      $or: [
        { opportunityId: opp._id },
        { companyId: opp.companyId._id }
      ]
    });

    const enrichedResources = allResources.map(res => {
      const obj = res.toObject();
      const requiredLevel = stageRank[obj.requiredStage] || 1;
      const isUnlocked = studentCurrentLevel >= requiredLevel;

      return {
        ...obj,
        isUnlocked,
        requiredStageLabel: obj.requiredStage.replace('_', ' ').toUpperCase()
      };
    });

    res.json({
      company: opp.companyId,
      studentLevel: studentCurrentLevel,
      hasApplied: !!appRecord,
      resources: enrichedResources
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin/T&P: Add Preparation Resource
app.post('/api/preparation', authenticate, authorize(['admin', 'faculty']), async (req, res) => {
  try {
    const { companyId, opportunityId, type, title, content, requiredStage } = req.body;
    const resource = await PreparationResource.create({
      companyId,
      opportunityId: opportunityId || null,
      type,
      title,
      content,
      requiredStage: requiredStage || 'resume_screening'
    });
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   7. NOTIFICATIONS & TARGETED ANNOUNCEMENTS
   ========================================== */

// Get My Notifications
app.get('/api/notifications', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user.userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark Notification Read
app.put('/api/notifications/:id/read', authenticate, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin/T&P: Broadcast Announcement or Send Targeted Notification
app.post('/api/admin/announcements', authenticate, authorize(['admin', 'faculty']), async (req, res) => {
  try {
    const { title, message, targetBranch, targetAcademicYear, type } = req.body;

    let studentQuery = {};
    if (targetBranch) studentQuery.branch = targetBranch;
    if (targetAcademicYear) studentQuery.academicYear = targetAcademicYear;

    const targetStudents = await Student.find(studentQuery).populate('userId');

    const notifs = [];
    for (const st of targetStudents) {
      if (st.userId) {
        notifs.push({
          recipientId: st.userId._id,
          type: type || 'announcement',
          title,
          message
        });
        emitToUser(st.userId._id, 'notification', { title, message, type: type || 'announcement' });
      }
    }

    if (notifs.length > 0) {
      await Notification.insertMany(notifs);
    }

    res.json({ message: `Announcement broadcasted to ${notifs.length} students` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin/T&P: Send automated deadline reminder to eligible non-applicants
app.post('/api/admin/remind-deadline/:opportunityId', authenticate, authorize(['admin', 'faculty']), async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.opportunityId).populate('companyId');
    if (!opp) return res.status(404).json({ error: 'Opportunity not found' });

    // Find existing applicants
    const existingApps = await Application.find({ opportunityId: opp._id });
    const appliedStudentIds = new Set(existingApps.map(a => a.studentId.toString()));

    const allStudents = await Student.find().populate('userId');
    let remindedCount = 0;

    for (const st of allStudents) {
      if (!appliedStudentIds.has(st._id.toString())) {
        const evalResult = evaluateEligibility(st, opp);
        if (evalResult.isEligible && st.userId) {
          const notif = await Notification.create({
            recipientId: st.userId._id,
            type: 'deadline_reminder',
            title: `Deadline Approaching: ${opp.companyId?.name} - ${opp.title}`,
            message: `You are eligible for ${opp.title} at ${opp.companyId?.name}! Deadline: ${new Date(opp.deadline).toLocaleDateString()}. Apply before registration closes.`,
            opportunityId: opp._id
          });
          emitToUser(st.userId._id, 'notification', notif);
          remindedCount++;
        }
      }
    }

    res.json({ message: `Deadline reminder sent to ${remindedCount} eligible candidates.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   8. ADMIN CONFIGURABLE SETTINGS PANEL
   ========================================== */

app.get('/api/admin/settings', authenticate, authorize(['admin']), async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/settings', authenticate, authorize(['admin']), async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    const {
      approvedEmailDomains,
      branches,
      sections,
      academicYears,
      maxResumeAttempts,
      maxMockInterviewAttempts,
      deadlineReminderHours
    } = req.body;

    if (approvedEmailDomains) settings.approvedEmailDomains = approvedEmailDomains;
    if (branches) settings.branches = branches;
    if (sections) settings.sections = sections;
    if (academicYears) settings.academicYears = academicYears;
    if (maxResumeAttempts !== undefined) settings.maxResumeAttempts = Number(maxResumeAttempts);
    if (maxMockInterviewAttempts !== undefined) settings.maxMockInterviewAttempts = Number(maxMockInterviewAttempts);
    if (deadlineReminderHours !== undefined) settings.deadlineReminderHours = Number(deadlineReminderHours);

    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: View all registered Students
app.get('/api/admin/students', authenticate, authorize(['admin', 'faculty']), async (req, res) => {
  try {
    const { branch, academicYear, minCgpa } = req.query;
    const query = {};
    if (branch) query.branch = branch;
    if (academicYear) query.academicYear = academicYear;
    if (minCgpa) query.cgpa = { $gte: Number(minCgpa) };

    const students = await Student.find(query).sort({ cgpa: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Dashboard Analytics Summary
app.get('/api/admin/metrics', authenticate, authorize(['admin', 'faculty']), async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalOpportunities = await Opportunity.countDocuments();
    const totalApplications = await Application.countDocuments();
    const selectedApplications = await Application.countDocuments({ status: 'selected' });
    const shortlistedApplications = await Application.countDocuments({ status: { $in: ['shortlisted', 'in_selection'] } });

    res.json({
      totalStudents,
      totalOpportunities,
      totalApplications,
      selectedApplications,
      shortlistedApplications
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================
   START SERVER & MONGODB CONNECTION
   ========================================== */
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/college_placement';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✓ Connected to MongoDB:', MONGODB_URI);
    await seedDatabase();
    server.listen(PORT, () => {
      console.log(`✓ Placement Portal Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
