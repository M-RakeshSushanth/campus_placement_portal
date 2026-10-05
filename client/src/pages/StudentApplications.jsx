import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Lock,
  Unlock,
  BookOpen,
  HelpCircle,
  Terminal,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export default function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [prepData, setPrepData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPrep, setLoadingPrep] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await axios.get('/api/student/my-applications');
      setApplications(res.data);
      if (res.data.length > 0) {
        setSelectedApp(res.data[0]);
        loadPreparation(res.data[0].opportunityId?._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPreparation = async (oppId) => {
    if (!oppId) return;
    setLoadingPrep(true);
    try {
      const res = await axios.get(`/api/preparation/${oppId}`);
      setPrepData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPrep(false);
    }
  };

  const handleSelectApp = (app) => {
    setSelectedApp(app);
    loadPreparation(app.opportunityId?._id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">My Applications & Stage Progression</h1>
        <p className="text-sm text-[#475569] mt-1">
          Monitor your recruitment pipeline stages and access progressive preparation resources unlocked as you clear company rounds.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#64748B]">Loading your applications...</div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-[#E2E8F0]">
          <p className="text-base font-semibold text-[#0F172A]">No applications found.</p>
          <p className="text-xs text-[#64748B] mt-1">Visit Opportunities to submit applications to campus recruiters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications Master List */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Applied Roles</h2>
            {applications.map((app) => {
              const isSelected = selectedApp?._id === app._id;
              const opp = app.opportunityId;
              return (
                <div
                  key={app._id}
                  onClick={() => handleSelectApp(app)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#EFF6FF] border-[#2563EB] shadow-xs'
                      : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#64748B] uppercase">
                      {opp?.companyId?.name}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                      app.status === 'selected' ? 'bg-[#DCFCE7] text-[#15803D]' :
                      app.status === 'rejected' ? 'bg-[#FEE2E2] text-[#B91C1C]' :
                      'bg-[#DBEAFE] text-[#1D4ED8]'
                    }`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#0F172A] mt-1.5">{opp?.title}</h3>
                  <p className="text-[11px] text-[#64748B] mt-2">
                    Applied on: {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Detailed Progression Pipeline & Progressive Preparation */}
          <div className="lg:col-span-2 space-y-6">
            {selectedApp && (
              <>
                {/* 1. Recruitment Pipeline Timeline */}
                <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-xs">
                  <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4 mb-4">
                    <div>
                      <span className="text-xs font-semibold text-[#64748B] uppercase">
                        {selectedApp.opportunityId?.companyId?.name}
                      </span>
                      <h2 className="text-lg font-bold text-[#0F172A]">
                        {selectedApp.opportunityId?.title}
                      </h2>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 text-xs font-bold rounded-lg uppercase ${
                        selectedApp.status === 'selected' ? 'bg-[#DCFCE7] text-[#15803D]' :
                        selectedApp.status === 'rejected' ? 'bg-[#FEE2E2] text-[#B91C1C]' :
                        'bg-[#FEF3C7] text-[#B45309]'
                      }`}>
                        Status: {selectedApp.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold uppercase text-[#475569] tracking-wider mb-4">
                    Sequential Selection Pipeline
                  </h3>

                  <div className="space-y-4">
                    {selectedApp.roundResults?.map((round, idx) => {
                      const isPassed = round.result === 'qualified';
                      const isFailed = round.result === 'rejected';
                      const isCurrent = round.result === 'pending' && idx + 1 === selectedApp.currentRoundOrder;

                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                            isPassed
                              ? 'bg-[#DCFCE7]/40 border-[#BBF7D0]'
                              : isFailed
                              ? 'bg-[#FEE2E2]/40 border-[#FECACA]'
                              : isCurrent
                              ? 'bg-[#EFF6FF] border-[#BFDBFE]'
                              : 'bg-[#F8FAFC] border-[#E2E8F0] opacity-60'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isPassed
                                ? 'bg-[#16A34A] text-white'
                                : isFailed
                                ? 'bg-[#DC2626] text-white'
                                : isCurrent
                                ? 'bg-[#2563EB] text-white'
                                : 'bg-[#CBD5E1] text-[#475569]'
                            }`}>
                              {idx + 1}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#0F172A]">{round.roundName}</p>
                              <p className="text-xs text-[#475569] mt-0.5">
                                {round.feedback || (isPassed ? 'Candidate cleared round requirements.' : 'Pending evaluation by Placement Cell.')}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`text-xs font-bold uppercase ${
                              isPassed ? 'text-[#15803D]' :
                              isFailed ? 'text-[#B91C1C]' :
                              isCurrent ? 'text-[#1D4ED8]' : 'text-[#64748B]'
                            }`}>
                              {isPassed ? '✓ Cleared' : isFailed ? '✕ Not Cleared' : isCurrent ? '● Active Round' : '○ Upcoming'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Progressive Company-Specific Preparation Resources */}
                <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-[#4F46E5]" />
                        Progressive Company Preparation Hub
                      </h2>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Materials adapt to your progress. Clearing preliminary stages unlocks technical question banks, mock scenarios, and company blueprints.
                      </p>
                    </div>
                  </div>

                  {loadingPrep ? (
                    <div className="text-xs text-[#64748B] py-6 text-center">Loading resources...</div>
                  ) : !prepData?.resources?.length ? (
                    <p className="text-xs text-[#64748B] py-4">No company preparation resources configured yet.</p>
                  ) : (
                    <div className="space-y-3 mt-4">
                      {prepData.resources.map((res) => (
                        <div
                          key={res._id}
                          className={`p-4 rounded-xl border transition-all ${
                            res.isUnlocked
                              ? 'bg-white border-[#C7D2FE] shadow-xs'
                              : 'bg-[#F8FAFC] border-[#E2E8F0] opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {res.isUnlocked ? (
                                <Unlock className="h-4 w-4 text-[#16A34A]" />
                              ) : (
                                <Lock className="h-4 w-4 text-[#94A3B8]" />
                              )}
                              <h4 className="text-xs font-bold text-[#0F172A]">{res.title}</h4>
                            </div>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              res.isUnlocked
                                ? 'bg-[#DCFCE7] text-[#15803D]'
                                : 'bg-[#F1F5F9] text-[#64748B]'
                            }`}>
                              {res.isUnlocked ? 'Unlocked' : `Requires Clearing: ${res.requiredStageLabel}`}
                            </span>
                          </div>

                          {res.isUnlocked ? (
                            <div className="mt-2 text-xs text-[#334155] bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0] whitespace-pre-line leading-relaxed font-mono">
                              {res.content}
                            </div>
                          ) : (
                            <p className="text-[11px] text-[#64748B] italic mt-1">
                              This resource will automatically unlock once the placement cell records that you have cleared the {res.requiredStageLabel} stage.
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
