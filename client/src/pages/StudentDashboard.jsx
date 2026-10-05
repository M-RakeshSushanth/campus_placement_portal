import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  FileText,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export default function StudentDashboard() {
  const { student, user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [oppRes, appRes] = await Promise.all([
        axios.get('/api/opportunities'),
        axios.get('/api/student/my-applications')
      ]);
      setOpportunities(oppRes.data);
      setApplications(appRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const eligibleCount = opportunities.filter(o => o.eligibilityStatus?.isEligible).length;
  const inProgressApps = applications.filter(a => a.status === 'in_selection' || a.status === 'shortlisted');
  const selectedApps = applications.filter(a => a.status === 'selected');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-md">
            Verified Placement Profile
          </span>
          <h1 className="text-2xl font-bold text-[#0F172A] mt-2">
            Welcome back, {student?.name || 'Student'}!
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            {student?.branch} • Section {student?.section} • Class of {student?.academicYear} • CGPA: {student?.cgpa}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/student/opportunities"
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            Explore Opportunities <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/student/profile"
            className="px-4 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-sm font-medium rounded-lg transition-colors"
          >
            Update Resume
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Available Opportunities</span>
            <div className="p-2 bg-[#EFF6FF] text-[#2563EB] rounded-lg">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0F172A] mt-2">{opportunities.length}</p>
          <p className="text-xs text-[#16A34A] font-medium mt-1">
            {eligibleCount} eligible for your profile
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Active Applications</span>
            <div className="p-2 bg-[#EEF2FF] text-[#4F46E5] rounded-lg">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0F172A] mt-2">{applications.length}</p>
          <p className="text-xs text-[#475569] mt-1">
            {inProgressApps.length} in interview rounds
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Shortlisted / Progressing</span>
            <div className="p-2 bg-[#FEF3C7] text-[#B45309] rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0F172A] mt-2">{inProgressApps.length}</p>
          <p className="text-xs text-[#B45309] font-medium mt-1">Cleared screening stages</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Offers Accepted</span>
            <div className="p-2 bg-[#DCFCE7] text-[#15803D] rounded-lg">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0F172A] mt-2">{selectedApps.length}</p>
          <p className="text-xs text-[#15803D] font-medium mt-1">Final selections</p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recommended & Eligible Opportunities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#0F172A]">Eligible Opportunities</h2>
            <Link to="/student/opportunities" className="text-xs font-semibold text-[#2563EB] hover:underline">
              View All ({opportunities.length}) &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {opportunities.slice(0, 3).map((opp) => {
              const elig = opp.eligibilityStatus;
              return (
                <div
                  key={opp._id}
                  className="bg-white rounded-xl p-5 border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all shadow-xs"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={opp.companyId?.logoUrl || 'https://img.icons8.com/color/96/briefcase.png'}
                        alt={opp.companyId?.name}
                        className="h-11 w-11 rounded-lg object-contain bg-[#F8FAFC] p-1 border border-[#E2E8F0]"
                      />
                      <div>
                        <span className="text-xs font-medium text-[#64748B] uppercase tracking-wider">
                          {opp.companyId?.name}
                        </span>
                        <h3 className="text-base font-bold text-[#0F172A]">{opp.title}</h3>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                      elig?.isEligible
                        ? 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]'
                        : 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]'
                    }`}>
                      {elig?.isEligible ? `${elig.matchPercentage}% Eligible` : 'Not Eligible'}
                    </span>
                  </div>

                  <p className="text-xs text-[#475569] line-clamp-2 mt-3">
                    {opp.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/student/opportunities/${opp._id}`}
                        className="px-3 py-1.5 bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] text-xs font-semibold rounded-lg transition-colors"
                      >
                        Details & ATS Review
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Progressive Recruitment Timeline & AI Advisor */}
        <div className="space-y-6">
          {/* Active Application Stages */}
          <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs">
            <h3 className="text-sm font-bold text-[#0F172A] mb-3">Recruitment Progression</h3>
            {applications.length === 0 ? (
              <p className="text-xs text-[#64748B]">No active applications submitted yet.</p>
            ) : (
              <div className="space-y-4">
                {applications.slice(0, 2).map((app) => (
                  <div key={app._id} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#0F172A]">{app.opportunityId?.companyId?.name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold uppercase bg-[#DBEAFE] text-[#1D4ED8]">
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>
                    {/* Compact Rounds Timeline */}
                    <div className="space-y-1.5 mt-2">
                      {app.roundResults?.map((round, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-[#475569]">{round.roundName}</span>
                          <span className={`font-semibold ${
                            round.result === 'qualified' ? 'text-[#15803D]' :
                            round.result === 'rejected' ? 'text-[#B91C1C]' : 'text-[#A16207]'
                          }`}>
                            {round.result === 'qualified' ? '✓ Passed' :
                             round.result === 'rejected' ? '✕ Not Cleared' : '● In Progress'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Link
                      to={`/student/applications`}
                      className="mt-3 block text-right text-xs text-[#2563EB] font-semibold hover:underline"
                    >
                      View Progressive Prep Resources &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Resume Intelligence Widget */}
          <div className="bg-radial from-[#EEF2FF] to-white rounded-xl p-5 border border-[#C7D2FE] shadow-xs">
            <div className="flex items-center gap-2 text-[#4F46E5] mb-2">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-sm font-bold text-[#0F172A]">AI Resume Intelligence</h3>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              Match your resume against institutional recruitment criteria. Get ATS readiness scores, keyword gaps, and progressive interview guides before applying.
            </p>
            <div className="mt-4 pt-3 border-t border-[#E0E7FF] flex justify-between items-center">
              <span className="text-[11px] text-[#6366F1] font-semibold">Active Module</span>
              <Link
                to="/student/profile"
                className="text-xs font-bold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1"
              >
                Inspect Resume <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
