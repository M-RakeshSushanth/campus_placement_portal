const bcrypt = require('bcryptjs');
const { User, Student, Company, Opportunity, Application, Settings, PreparationResource } = require('./models');

async function seedDatabase() {
  try {
    // 1. Settings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        approvedEmailDomains: ['college.edu', 'griet.ac.in', 'campus.edu', 'grietcollege.com'],
        branches: ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical'],
        sections: ['A', 'B', 'C', 'D'],
        academicYears: ['2025', '2026', '2027', '2028'],
        maxResumeAttempts: 3,
        maxMockInterviewAttempts: 3,
        deadlineReminderHours: 24
      });
      console.log('✓ Initial settings seeded');
    } else {
      if (!settings.approvedEmailDomains.includes('grietcollege.com')) {
        settings.approvedEmailDomains.push('grietcollege.com');
        await settings.save();
      }
    }

    // 2. Demo Users
    const hashedPassword = await bcrypt.hash('password123', 10);

    let admin = await User.findOne({ email: 'admin@college.edu' });
    if (!admin) {
      admin = await User.create({
        email: 'admin@college.edu',
        passwordHash: hashedPassword,
        role: 'admin',
        isActive: true
      });
      console.log('✓ Demo Admin created: admin@college.edu / password123');
    }

    let faculty = await User.findOne({ email: 'tnp@college.edu' });
    if (!faculty) {
      faculty = await User.create({
        email: 'tnp@college.edu',
        passwordHash: hashedPassword,
        role: 'faculty',
        isActive: true
      });
      console.log('✓ Demo Faculty/T&P created: tnp@college.edu / password123');
    }

    let studentUser = await User.findOne({ email: '24241a0536@grietcollege.com' });
    if (!studentUser) {
      // Check if previous demo user exists and update or create
      studentUser = await User.findOne({ email: 'student@college.edu' });
      if (studentUser) {
        studentUser.email = '24241a0536@grietcollege.com';
        await studentUser.save();
      } else {
        studentUser = await User.create({
          email: '24241a0536@grietcollege.com',
          passwordHash: hashedPassword,
          role: 'student',
          isActive: true
        });
      }
      console.log('✓ Demo Student User created: 24241a0536@grietcollege.com / password123');
    }

    // 3. Demo Student Profile
    let studentProfile = await Student.findOne({ userId: studentUser._id });
    if (!studentProfile) {
      studentProfile = await Student.create({
        userId: studentUser._id,
        name: 'Maremalla Rakesh Sushanth',
        collegeEmail: '24241a0536@grietcollege.com',
        personalEmail: 'maremallarakesh07@gmail.com',
        branch: 'CSE',
        section: 'A',
        academicYear: '2028',
        cgpa: 9.28,
        academicScores: {
          tenth: 94,
          intermediate: 92
        },
        backlogs: 0,
        skills: ['Java', 'Spring Boot', 'React', 'Node.js', 'MongoDB', 'Data Structures', 'SQL', 'Git'],
        resumeUrl: '/uploads/sample_resume.pdf',
        resumeFileName: 'Rakesh_Sushanth_Resume.pdf',
        resumeText: 'Maremalla Rakesh Sushanth - Computer Science & Engineering (Class of 2028). Skills: Java, Spring Boot, React, MongoDB, REST APIs, Git, Algorithms. Projects: Placement Management Portal, Full-Stack Distributed Microservices. Education: B.Tech CSE CGPA 9.28.'
      });
      console.log('✓ Demo Student Profile created for Maremalla Rakesh Sushanth');
    } else {
      studentProfile.name = 'Maremalla Rakesh Sushanth';
      studentProfile.collegeEmail = '24241a0536@grietcollege.com';
      studentProfile.personalEmail = 'maremallarakesh07@gmail.com';
      studentProfile.branch = 'CSE';
      studentProfile.section = 'A';
      studentProfile.academicYear = '2028';
      studentProfile.cgpa = 9.28;
      studentProfile.resumeFileName = 'Rakesh_Sushanth_Resume.pdf';
      studentProfile.resumeText = 'Maremalla Rakesh Sushanth - Computer Science & Engineering (Class of 2028). Skills: Java, Spring Boot, React, MongoDB, REST APIs, Git, Algorithms. Projects: Placement Management Portal, Full-Stack Distributed Microservices. Education: B.Tech CSE CGPA 9.28.';
      await studentProfile.save();
      console.log('✓ Updated Student Profile to Maremalla Rakesh Sushanth');
    }

    // 4. Demo Companies
    let microsoft = await Company.findOne({ name: 'Microsoft' });
    if (!microsoft) {
      microsoft = await Company.create({
        name: 'Microsoft',
        description: 'Global technology leader in cloud, AI, and enterprise software.',
        website: 'https://microsoft.com',
        logoUrl: 'https://img.icons8.com/color/96/microsoft.png'
      });
    }

    let google = await Company.findOne({ name: 'Google' });
    if (!google) {
      google = await Company.create({
        name: 'Google',
        description: 'Pioneering search, AI, cloud computing and distributed systems.',
        website: 'https://google.com',
        logoUrl: 'https://img.icons8.com/color/96/google-logo.png'
      });
    }

    let amazon = await Company.findOne({ name: 'Amazon' });
    if (!amazon) {
      amazon = await Company.create({
        name: 'Amazon',
        description: 'World-leading e-commerce, cloud infrastructure (AWS), and digital streaming.',
        website: 'https://amazon.com',
        logoUrl: 'https://img.icons8.com/color/96/amazon.png'
      });
    }

    // 5. Demo Opportunities
    const oppCount = await Opportunity.countDocuments();
    if (oppCount === 0) {
      const opp1 = await Opportunity.create({
        companyId: microsoft._id,
        title: 'Software Development Engineer (SDE-1)',
        type: 'full_time',
        description: 'Join Azure Core team to architect highly resilient scalable backend microservices, REST APIs, and distributed data systems.',
        requiredSkills: ['Java', 'Data Structures', 'Spring Boot', 'SQL', 'System Design'],
        eligibility: {
          minCgpa: 8.0,
          branches: ['CSE', 'IT', 'ECE'],
          academicYears: ['2026', '2027'],
          maxBacklogs: 0,
          requiredSkills: ['Java', 'Data Structures']
        },
        targetAudience: {
          branches: ['CSE', 'IT'],
          sections: ['A', 'B', 'C'],
          academicYears: ['2026', '2027']
        },
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days later
        selectionRounds: [
          { name: 'Resume Screening', order: 1, type: 'resume_screening', description: 'ATS evaluation of core technical competencies & projects' },
          { name: 'Online Assessment (OA)', order: 2, type: 'online_assessment', description: '90-min DSA & CS Fundamentals on Hackerrank' },
          { name: 'Technical Interview', order: 3, type: 'technical_interview', description: 'Live coding problem solving, System Architecture' },
          { name: 'HR / Behavioral', order: 4, type: 'hr', description: 'Culture fit and leadership principles' }
        ],
        status: 'published',
        createdBy: admin._id
      });

      const opp2 = await Opportunity.create({
        companyId: google._id,
        title: 'Software Engineering Intern (Summer 2026)',
        type: 'internship',
        description: 'Google Summer Internship program focusing on machine intelligence, search query pipelines, and frontend web applications.',
        requiredSkills: ['React', 'Data Structures', 'Python', 'Algorithms'],
        eligibility: {
          minCgpa: 8.5,
          branches: ['CSE', 'IT'],
          academicYears: ['2026', '2027', '2028'],
          maxBacklogs: 0,
          requiredSkills: ['Data Structures']
        },
        targetAudience: {
          branches: ['CSE', 'IT'],
          sections: ['A', 'B', 'C', 'D'],
          academicYears: ['2026', '2027', '2028']
        },
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        selectionRounds: [
          { name: 'Resume Screening', order: 1, type: 'resume_screening', description: 'Academic profile & extracurricular analysis' },
          { name: 'Coding Assessment', order: 2, type: 'coding', description: '2 medium-hard Leetcode style questions' },
          { name: 'Technical Round 1', order: 3, type: 'technical_interview', description: 'Deep dive into algorithmic complexity' }
        ],
        status: 'published',
        createdBy: admin._id
      });

      const opp3 = await Opportunity.create({
        companyId: amazon._id,
        title: 'National Campus Hackathon 2026',
        type: 'hackathon',
        description: 'Build Generative AI and Cloud microservices in a 36-hour sprint. Cash prizes & direct fast-track SDE interview vouchers.',
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'Cloud'],
        eligibility: {
          minCgpa: 7.0,
          branches: ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical'],
          academicYears: ['2025', '2026', '2027', '2028'],
          maxBacklogs: 2,
          requiredSkills: []
        },
        targetAudience: {
          branches: ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical'],
          sections: ['A', 'B', 'C', 'D'],
          academicYears: ['2025', '2026', '2027', '2028']
        },
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        selectionRounds: [
          { name: 'Idea Submission', order: 1, type: 'resume_screening', description: 'Proposal screening' },
          { name: 'Prototype Demo & Evaluation', order: 2, type: 'custom', description: 'Grand jury presentation' }
        ],
        status: 'published',
        createdBy: admin._id
      });

      // Sample Application for Microsoft (already submitted & cleared screening to demonstrate progressive resources)
      await Application.create({
        studentId: studentProfile._id,
        opportunityId: opp1._id,
        resumeUrl: studentProfile.resumeUrl,
        status: 'in_selection',
        currentRoundOrder: 2,
        roundResults: [
          {
            roundId: opp1.selectionRounds[0]._id,
            roundName: 'Resume Screening',
            result: 'qualified',
            feedback: 'Strong alignment with Java and distributed systems.'
          },
          {
            roundId: opp1.selectionRounds[1]._id,
            roundName: 'Online Assessment (OA)',
            result: 'pending',
            feedback: 'Scheduled for upcoming Saturday.'
          }
        ]
      });

      // 6. Progressive Company-Specific Preparation Resources
      await PreparationResource.create([
        {
          companyId: microsoft._id,
          opportunityId: opp1._id,
          type: 'study_material',
          title: 'Microsoft Azure Interview Preparation Blueprint',
          content: 'Key focus areas: C#/Java thread concurrency, LRU Cache implementation, CAP theorem, and REST idempotency principles.',
          requiredStage: 'resume_screening'
        },
        {
          companyId: microsoft._id,
          opportunityId: opp1._id,
          type: 'interview_question',
          title: 'Recent Microsoft SDE Questions (2025-2026)',
          content: '1. Design an in-memory Key-Value store with TTL.\n2. Binary Tree Maximum Path Sum.\n3. How does connection pooling work in high-throughput backend services?',
          requiredStage: 'resume_screening'
        },
        {
          companyId: microsoft._id,
          opportunityId: opp1._id,
          type: 'coding_question',
          title: 'Microsoft Coding Assessment Simulator',
          content: 'Problem: Min Cost to Connect all Server Nodes. Given an undirected graph, find minimum spanning tree using Kruskal/Prim with cycle detection.',
          requiredStage: 'online_assessment'
        },
        {
          companyId: microsoft._id,
          opportunityId: opp1._id,
          type: 'mock_interview',
          title: 'Microsoft Technical Mock Interview Scenario',
          content: 'Interactive Mock: Explain a time you optimized database query latency from 800ms to 40ms. Focus on indexing, query execution plans, and caching.',
          requiredStage: 'coding'
        }
      ]);

      console.log('✓ Demo Opportunities & Progressive Preparation Resources seeded');
    }
  } catch (err) {
    console.error('Seed error:', err);
  }
}

module.exports = { seedDatabase };
