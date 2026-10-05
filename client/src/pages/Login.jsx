import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { GraduationCap, Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { loginWithCredentials, loginDemo, registerStudent, user } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration Form State
  const [regForm, setRegForm] = useState({
    name: 'Maremalla Rakesh Sushanth',
    email: '24241a0536@grietcollege.com',
    password: '',
    personalEmail: 'maremallarakesh07@gmail.com',
    branch: 'CSE',
    section: 'A',
    academicYear: '2028',
    cgpa: '9.28',
    skills: 'Java, Python, React, SQL'
  });

  const [availableConfig, setAvailableConfig] = useState({
    approvedEmailDomains: ['college.edu', 'griet.ac.in', 'campus.edu'],
    branches: ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical'],
    sections: ['A', 'B', 'C', 'D'],
    academicYears: ['2025', '2026', '2027', '2028']
  });

  useEffect(() => {
    // If already logged in, redirect
    if (user) {
      if (user.role === 'admin' || user.role === 'faculty') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    }

    // Fetch dynamic registration settings (approved domains, branches)
    axios.get('/api/settings/public')
      .then(res => setAvailableConfig(res.data))
      .catch(() => {});
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginWithCredentials(email, password);
      if (data.user.role === 'admin' || data.user.role === 'faculty') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFastDemoLogin = async (role) => {
    setError('');
    setLoading(true);
    try {
      const data = await loginDemo(role);
      if (role === 'admin' || role === 'faculty') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerStudent(regForm);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Check college email domain requirements.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-md">
          <GraduationCap className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#0F172A]">
          College Placement Portal
        </h2>
        <p className="mt-1 text-sm text-[#475569]">
          Centralized Recruitment Management & Verification
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-[#E2E8F0] shadow-sm">
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3 rounded-lg bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!isRegistering ? (
            /* Standard Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[#94A3B8]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. student@college.edu"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF] text-[#0F172A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#94A3B8]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF] text-[#0F172A]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white rounded-lg text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>

              <div className="pt-4 border-t border-[#E2E8F0] text-center">
                <p className="text-xs text-[#64748B] mb-3">One-Click Demonstration Access</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleFastDemoLogin('admin')}
                    className="py-2 px-3 text-xs font-semibold rounded-lg bg-[#EEF2FF] text-[#4F46E5] hover:bg-[#E0E7FF] border border-[#C7D2FE] transition-colors cursor-pointer"
                  >
                    Demo Admin / T&P
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFastDemoLogin('student')}
                    className="py-2 px-3 text-xs font-semibold rounded-lg bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] border border-[#BFDBFE] transition-colors cursor-pointer"
                  >
                    Demo Student
                  </button>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="text-xs text-[#2563EB] hover:underline font-medium cursor-pointer"
                >
                  New student? Register with verified college email &rarr;
                </button>
              </div>
            </form>
          ) : (
            /* Verified Registration Form */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="p-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-xs text-[#1D4ED8] flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Institutional domain verification active. Approved domains: <strong>{availableConfig.approvedEmailDomains.join(', ')}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    placeholder="Rahul Kumar"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">College Email</label>
                  <input
                    type="email"
                    required
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="student@college.edu"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Personal Email</label>
                  <input
                    type="email"
                    value={regForm.personalEmail}
                    onChange={(e) => setRegForm({ ...regForm, personalEmail: e.target.value })}
                    placeholder="name@gmail.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Branch</label>
                  <select
                    value={regForm.branch}
                    onChange={(e) => setRegForm({ ...regForm, branch: e.target.value })}
                    className="w-full px-2 py-2 text-sm rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#2563EB]"
                  >
                    {availableConfig.branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Section</label>
                  <select
                    value={regForm.section}
                    onChange={(e) => setRegForm({ ...regForm, section: e.target.value })}
                    className="w-full px-2 py-2 text-sm rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#2563EB]"
                  >
                    {availableConfig.sections.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Grad Year</label>
                  <select
                    value={regForm.academicYear}
                    onChange={(e) => setRegForm({ ...regForm, academicYear: e.target.value })}
                    className="w-full px-2 py-2 text-sm rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#2563EB]"
                  >
                    {availableConfig.academicYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Current CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={regForm.cgpa}
                    onChange={(e) => setRegForm({ ...regForm, cgpa: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Skills (Comma-separated)</label>
                  <input
                    type="text"
                    value={regForm.skills}
                    onChange={(e) => setRegForm({ ...regForm, skills: e.target.value })}
                    placeholder="Java, Python, React"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Verifying & Creating Profile...' : 'Complete Registration'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="text-xs text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                >
                  &larr; Already have an account? Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
