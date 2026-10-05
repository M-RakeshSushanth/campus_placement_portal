import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Building,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  FileText,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Award,
  Layers,
  Send
} from 'lucide-react';

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { student } = useAuth();

  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // Resume / ATS Intelligence State
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [resumeTextOverride, setResumeTextOverride] = useState('');
  const [showAtsTab, setShowAtsTab] = useState(false);

  useEffect(() => {
    fetchDetail();
    fetchPastAnalyses();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await axios.get(`/api/opportunities/${id}`);
      setOpp(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPastAnalyses = async () => {
    try {
      const res = await axios.get(`/api/resume/analyses/${id}`);
      if (res.data.analyses && res.data.analyses.length > 0) {
        setAtsResult(res.data.analyses[0]);
      }
      setAttemptsRemaining(res.data.attemptsRemaining ?? 3);
    } catch (err) {}
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await axios.post('/api/applications/apply', { opportunityId: opp._id });
      setApplySuccess(true);
      fetchDetail();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleRunAtsAnalysis = async () => {
    setAnalyzingResume(true);
    try {
      const res = await axios.post('/api/resume/analyze', {
        opportunityId: opp._id,
        resumeText: resumeTextOverride || undefined
      });
      setAtsResult(res.data.analysis);
      setAttemptsRemaining(res.data.attemptsRemaining);
    } catch (err) {
      alert(err.response?.data?.error || 'ATS analysis limit reached or failed');
    } finally {
      setAnalyzingResume(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-[#64748B]">Loading opportunity details...</div>;
  }

  if (!opp) {
    return <div className="text-center py-16 text-[#64748B]">Opportunity not found</div>;
  }

  const elig = opp.eligibilityStatus;
  const isApplied = !!opp.application || applySuccess;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/student/opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to opportunities
        </Link>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <img
            src={opp.companyId?.logoUrl || 'https://img.icons8.com/color/96/briefcase.png'}
            alt={opp.companyId?.name}
            className="h-16 w-16 rounded-xl object-contain bg-[#F8FAFC] p-2 border border-[#E2E8F0]"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                {opp.companyId?.name}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569] uppercase">
                {opp.type.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A] mt-1">{opp.title}</h1>
            <p className="text-xs text-[#64748B] flex items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Deadline: {new Date(opp.deadline).toLocaleDateString()}
              </span>
              {opp.companyId?.website && (
                <a
                  href={opp.companyId.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#2563EB] hover:underline"
                >
                  Visit Website &rarr;
                </a>
              )}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => setShowAtsTab(!showAtsTab)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-[#C7D2FE] bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4F46E5] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            {showAtsTab ? 'Hide ATS Review' : '✨ AI Resume Review'}
          </button>

          {isApplied ? (
            <div className="w-full sm:w-auto px-5 py-2.5 bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] text-xs font-bold rounded-lg flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Application Submitted
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={applying || !elig?.isEligible}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                elig?.isEligible
                  ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
                  : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
              }`}
            >
              <Send className="h-4 w-4" />
              {applying ? 'Submitting...' : elig?.isEligible ? 'Submit Application' : 'Ineligible to Apply'}
            </button>
          )}
        </div>
      </div>

      {/* ATS Resume Intelligence Drawer / Panel */}
      {showAtsTab && (
        <div className="bg-[#EEF2FF]/60 rounded-2xl p-6 border border-[#C7D2FE] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#4F46E5]">
              <Sparkles className="h-5 w-5" />
              <h2 className="text-base font-bold text-[#0F172A]">AI Resume Intelligence & Keyword Matching</h2>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-white border border-[#C7D2FE] text-[#4F46E5] font-semibold">
              {attemptsRemaining} / 3 review attempts left
            </span>
          </div>

          <p className="text-xs text-[#475569]">
            Optimize your saved resume before final submission. The system measures JD semantic relevance, tech stack keywords, and structural readiness.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold text-[#475569]">
                Resume Content (Pre-filled from your profile or paste tailored copy):
              </label>
              <textarea
                rows={4}
                value={resumeTextOverride}
                onChange={(e) => setResumeTextOverride(e.target.value)}
                placeholder={student?.resumeText || "Paste your resume project descriptions and skills here to inspect ATS score..."}
                className="w-full text-xs p-3 rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#4F46E5]"
              />
              <button
                onClick={handleRunAtsAnalysis}
                disabled={analyzingResume || attemptsRemaining <= 0}
                className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {analyzingResume ? 'Analyzing ATS Alignment...' : 'Calculate ATS Readiness Score'}
              </button>
            </div>

            {atsResult && (
              <div className="bg-white p-4 rounded-xl border border-[#CBD5E1] flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#64748B]">ATS Match Score</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className={`text-4xl font-extrabold ${
                      atsResult.score >= 80 ? 'text-[#15803D]' :
                      atsResult.score >= 60 ? 'text-[#B45309]' : 'text-[#B91C1C]'
                    }`}>
                      {atsResult.score}
                    </span>
                    <span className="text-xs text-[#64748B]">/ 100</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${
                        atsResult.score >= 80 ? 'bg-[#16A34A]' :
                        atsResult.score >= 60 ? 'bg-[#D97706]' : 'bg-[#DC2626]'
                      }`}
                      style={{ width: `${atsResult.score}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-[11px] space-y-1 text-[#475569]">
                  <p className="font-semibold text-[#0F172A]">Actionable Recommendations:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {atsResult.recommendations?.slice(0, 2).map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid: Details & Eligibility Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Description & Selection Workflow */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-xs">
            <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-3">
              Role & Responsibility
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed whitespace-pre-line">
              {opp.description}
            </p>

            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mt-6 mb-2">
              Required Technical Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {(opp.requiredSkills || []).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-[#F1F5F9] text-[#0F172A] text-xs font-semibold rounded-md border border-[#E2E8F0]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Configurable Selection Rounds Sequence */}
          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-xs">
            <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4">
              Configured Selection Pipeline
            </h2>
            <div className="space-y-4">
              {(opp.selectionRounds || []).map((round, idx) => (
                <div key={round._id || idx} className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] flex items-center justify-center font-bold text-xs shrink-0">
                    {round.order || idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A]">{round.name}</h4>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {round.description || `Evaluation round ${idx + 1} configured by Placement Cell.`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Institutional Eligibility Breakdown */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-xs">
            <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#2563EB]" /> Eligibility Verification
            </h2>

            <div className="space-y-3 mt-4 text-xs">
              {/* CGPA */}
              <div className="flex items-start justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div>
                  <p className="font-semibold text-[#0F172A]">CGPA Requirement</p>
                  <p className="text-[#64748B]">Min: {opp.eligibility?.minCgpa || 0} (Your CGPA: {student?.cgpa})</p>
                </div>
                {student?.cgpa >= (opp.eligibility?.minCgpa || 0) ? (
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-[#DC2626] shrink-0" />
                )}
              </div>

              {/* Branch */}
              <div className="flex items-start justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div>
                  <p className="font-semibold text-[#0F172A]">Eligible Branches</p>
                  <p className="text-[#64748B]">Allowed: {opp.eligibility?.branches?.join(', ') || 'All'}</p>
                </div>
                {(!opp.eligibility?.branches?.length || opp.eligibility.branches.includes(student?.branch)) ? (
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-[#DC2626] shrink-0" />
                )}
              </div>

              {/* Academic Year */}
              <div className="flex items-start justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div>
                  <p className="font-semibold text-[#0F172A]">Passing Year</p>
                  <p className="text-[#64748B]">Years: {opp.eligibility?.academicYears?.join(', ') || 'All'}</p>
                </div>
                {(!opp.eligibility?.academicYears?.length || opp.eligibility.academicYears.includes(student?.academicYear)) ? (
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-[#DC2626] shrink-0" />
                )}
              </div>

              {/* Backlogs */}
              <div className="flex items-start justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div>
                  <p className="font-semibold text-[#0F172A]">Backlog Policy</p>
                  <p className="text-[#64748B]">Max Allowed: {opp.eligibility?.maxBacklogs ?? 0}</p>
                </div>
                {(student?.backlogs <= (opp.eligibility?.maxBacklogs ?? 0)) ? (
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-[#DC2626] shrink-0" />
                )}
              </div>
            </div>

            {/* Overall Verdict */}
            <div className={`mt-5 p-3 rounded-lg border text-xs font-semibold text-center ${
              elig?.isEligible
                ? 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]'
                : 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]'
            }`}>
              {elig?.isEligible
                ? '✓ You meet all eligibility criteria for this role.'
                : '✕ You currently do not meet all criteria specified above.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
