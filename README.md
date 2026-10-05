# College Placement Portal

A centralized, full-stack recruitment management ecosystem designed to streamline college placement operations, verified student onboarding, dynamic eligibility filtering, sequential selection round management, progressive preparation hubs, and AI-powered ATS resume intelligence.

---

## 🌟 Key Features

### 1. Verified Student Registration & Onboarding
- **Institutional Domain Verification**: Accounts can only be created using administrator-approved college email domains (`@grietcollege.com`, `@college.edu`, `@griet.ac.in`, etc.), preventing duplicate profiles and non-institutional submissions.
- **Dynamic Academic Profiles**: Tracks CGPA, passing year, active backlogs, branches, sections, technical skills, and saved resume files.
- **1-Click Demo Login**: Quick-access demonstration buttons for Admin and Student personas on the login screen.

### 2. Opportunity & Dynamic Eligibility Engine
- **Multiple Opportunity Formats**: Supports full-time jobs, summer internships, hackathons, and recruitment drives.
- **Configurable Eligibility Criteria**: Automatically verifies minimum CGPA, eligible branches, target academic years, maximum backlog allowances, and required technical skills.
- **Visual Eligibility Badging**: Students instantly see whether they qualify (e.g., `92% Eligible` or `Ineligible`) with a detailed criteria checklist.

### 3. Sequential Selection Round Management
- **Customizable Pipeline**: T&P staff can add, reorder, label, and remove selection stages for any opportunity (e.g., *Resume Screening &rarr; Online Assessment &rarr; Coding Round &rarr; Technical Interview &rarr; HR*).
- **Stage Progression & Grading**: Administrators evaluate and grade each applicant stage-by-stage with custom feedback, automatically advancing candidates through the pipeline.

### 4. Progressive Company-Specific Preparation Hub
- **Dynamic Content Unlocking**: Preparation resources (interview question banks, company blueprints, coding scenarios, and mock interviews) unlock progressively as students clear specific selection rounds.
- Prevents cognitive overload by exposing relevant resources only when a student qualifies for that stage.

### 5. AI Resume Intelligence & ATS Scoring
- **Automated Resume Evaluation**: Analyzes resume content against opportunity job descriptions and technical competencies.
- **ATS Readiness Score (0–100)**: Highlights strengths, missing technical keywords, and actionable suggestions to improve the resume before submission.
- **Controlled Review Attempts**: Admin-configurable attempt limits (e.g., 3 attempts per opportunity) to encourage structured iterations.

### 6. Real-Time Communication & Notifications (Socket.IO)
- **Instant Updates**: Live notifications for new opportunities, application status changes, round progression, and selections without page reloads.
- **Targeted Announcements & Deadline Reminders**: T&P Cell can broadcast announcements and dispatch automated deadline reminders to eligible non-applicants.

### 7. Configurable Institutional Rules & Settings Panel
- Manage approved email domains, recognized branches, section structures, graduation years, review attempts, and reminder lead times dynamically without code modifications.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router, Axios, Lucide Icons |
| **Backend** | Node.js, Express.js, Socket.IO, Multer, JWT, bcryptjs |
| **Database** | MongoDB & Mongoose ODM |
| **AI Microservice** | Python 3, FastAPI, Uvicorn, Pydantic |

---

## 📂 Project Architecture

```text
D:\campus\
├── client\                     # React + Vite + Tailwind CSS Frontend
│   ├── src\
│   │   ├── context\
│   │   │   └── AuthContext.jsx # JWT Authentication & WebSocket state
│   │   ├── components\
│   │   │   └── Layout.jsx      # Navigation header & live notification drawer
│   │   ├── pages\
│   │   │   ├── Login.jsx       # Verified onboarding & 1-click demo access
│   │   │   ├── StudentDashboard.jsx     # Overview, eligible drives & progress
│   │   │   ├── OpportunitiesList.jsx    # Search, type & eligibility filtering
│   │   │   ├── OpportunityDetail.jsx    # JD breakdown & ATS resume reviewer
│   │   │   ├── StudentApplications.jsx  # Stage progression & progressive prep hub
│   │   │   ├── StudentProfile.jsx       # Academic attributes & resume upload
│   │   │   ├── AdminDashboard.jsx       # Real-time metrics & announcements
│   │   │   ├── AdminOpportunities.jsx   # Drive creation & selection rounds builder
│   │   │   ├── AdminApplications.jsx    # Candidate grading & stage evaluation
│   │   │   ├── AdminStudents.jsx        # Verified student talent directory
│   │   │   └── AdminSettings.jsx        # Institutional rules & domains engine
│   │   ├── App.jsx             # Routes & role-based access control
│   │   └── index.css           # Tailwind CSS styles
│   └── vite.config.js          # Vite config with backend & socket proxy
│
├── ai_service\                 # FastAPI AI Microservice
│   ├── venv\
│   └── main.py                 # ATS scoring & mock question generation
│
├── models.js                   # Unified Mongoose models
├── seed.js                     # Realistic initial seed data & demo accounts
├── server.js                   # Express REST APIs & Socket.IO server
├── .env                        # Environment configurations
├── .gitignore                  # Git ignore rules
└── package.json                # Server dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (3.10+)
- **MongoDB** running locally on default port `27017`

---

### Step 1: Install Dependencies

#### Root Backend:
```powershell
cd D:\campus
npm install
```

#### Frontend Client:
```powershell
cd D:\campus\client
npm install
```

#### Python AI Service (Virtual Environment):
```powershell
cd D:\campus
python -m venv ai_service/venv
.\ai_service\venv\Scripts\pip install fastapi uvicorn pydantic
```

---

### Step 2: Start the Services

Open separate terminal windows for each service:

#### 1. Backend Server (Node.js + Express + Socket.IO)
```powershell
cd D:\campus
node server.js
```
> Running on: **http://localhost:5000** (Seeds demo data and initial settings automatically on first run)

#### 2. Frontend Client (React + Vite)
```powershell
cd D:\campus\client
npm run dev
```
> Running on: **http://localhost:5173**

#### 3. AI Microservice (FastAPI + Python)
```powershell
cd D:\campus
.\ai_service\venv\Scripts\python -m uvicorn ai_service.main:app --port 8000 --reload
```
> Running on: **http://localhost:8000** (Interactive Swagger docs: **http://localhost:8000/docs**)

---

## 🔑 Demo Credentials

You can use the **1-Click Demo Buttons** on the login page or enter credentials manually:

### Student Account:
- **Email**: `24241a0536@grietcollege.com`
- **Password**: `password123`
- **Profile**: Maremalla Rakesh Sushanth (CSE • Class of 2028 • CGPA: 9.28)

### Administrator / T&P Cell Account:
- **Email**: `admin@college.edu`
- **Password**: `password123`

---

## 🎨 UI Color System

Designed to match professional enterprise SaaS standards:
- **Primary Brand**: Blue (`#2563EB`)
- **Secondary & AI Features**: Indigo (`#4F46E5`)
- **Surface & Backgrounds**: Slate (`#F8FAFC` page background, `#FFFFFF` cards)
- **Status Indicators**:
  - `Qualified / Selected`: Green (`#15803D` / `#DCFCE7`)
  - `In Progress / Pending`: Amber (`#B45309` / `#FEF3C7`)
  - `Rejected / Ineligible`: Red (`#B91C1C` / `#FEE2E2`)

---

## 📄 License
This project is developed for educational and institutional placement administration purposes.
