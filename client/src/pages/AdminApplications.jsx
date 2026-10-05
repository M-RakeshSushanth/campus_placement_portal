import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export default function AdminApplications() {
  const [searchParams] = useSearchParams();
  const initialOppId = searchParams.get('opportunityId') || '';

  const [applications, setApplications] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOppFilter, setSelectedOppFilter] = useState(initialOppId);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modal / Drawer for stage progression update
  const [selectedApp, setSelectedApp] = useState(null);
  const [roundIdxToUpdate, setRoundIdxToUpdate] = useState(0);
  const [roundResult, setRoundResult] = useState('qualified');
  const [roundFeedback, setRoundFeedback] = useState('');
  const [updatingStage, setUpdatingStage] = useState(false);

  useEffect(() => {
    fetchOpportunities();
    fetchApplications();
  }, [selectedOppFilter, statusFilter]);

  const fetchOpportunities = async () => {
    try {
      const res = await axios.get('/api/opportunities');
      setOpportunities(res.data);
    } catch (err) {}
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedOppFilter) params.opportunityId = selectedOppFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await axios.get('/api/admin/applications', { params });
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStageModal = (app, roundIdx) => {
    setSelectedApp(app);
    setRoundIdxToUpdate(roundIdx);
    setRoundResult(app.roundResults[roundIdx]?.result || 'qualified');
    setRoundFeedback(app.roundResults[roundIdx]?.feedback || '');
  };

  const handleUpdateStageSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    setUpdatingStage(true);
    try {
      await axios.put(`/api/admin/applications/${selectedApp._id}/update-stage`, {
        roundIndex: roundIdxToUpdate,
        result: roundResult,
        feedback: roundFeedback
      });

      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      alert('Failed to update applicant progression');
    } finally {
      setUpdatingStage(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Applicant Lifecycle & Round Management</h1>
        <p className="text-sm text-[#475569] mt-1">
          Review submitted student applications, record results for each selection stage, and trigger real-time notifications.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Filter by Opportunity:</label>
            <select
              value={selectedOppFilter}
              onChange={(e) => setSelectedOppFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-[#CBD5E1] bg-white font-medium"
            >
              <option value="">All Drives / Roles</option>
              {opportunities.map(o => (
                <option key={o._id} value={o._id}>{o.companyId?.name} - {o.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-[#CBD5E1] bg-white font-medium"
            >
              <option value="all">All Lifecycle States</option>
              <option value="submitted">Submitted</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="in_selection">In Selection Rounds</option>
              <option value="selected">Selected / Offered</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-[#64748B] font-medium self-end">
          Total Candidates: <strong>{applications.length}</strong>
        </span>
      </div>

      {/* Applicants Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#475569] border-b border-[#E2E8F0] uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-4 py-3.5">Academic Credentials</th>
                <th className="px-4 py-3.5">Opportunity</th>
                <th className="px-4 py-3.5">Current Status</th>
                <th className="px-4 py-3.5">Selection Pipeline Progress</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#64748B]">Loading candidates...</td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#64748B]">No applications match the current criteria.</td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app._id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-bold text-[#0F172A] block text-sm">{app.studentId?.name}</span>
                        <span className="text-xs text-[#64748B]">{app.studentId?.collegeEmail}</span>
                        {app.studentId?.resumeUrl && (
                          <a
                            href={app.studentId.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[#2563EB] hover:underline mt-0.5"
                          >
                            <ExternalLink className="h-3 w-3" /> View Resume
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-[#475569] space-y-0.5">
                      <p>Branch: <strong>{app.studentId?.branch}</strong> (Sec {app.studentId?.section})</p>
                      <p>CGPA: <strong>{app.studentId?.cgpa}</strong> • Backlogs: <strong>{app.studentId?.backlogs || 0}</strong></p>
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-bold text-[#0F172A] block">{app.opportunityId?.title}</span>
                      <span className="text-xs text-[#64748B]">{app.opportunityId?.companyId?.name}</span>
                    </td>

                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase ${
                        app.status === 'selected' ? 'bg-[#DCFCE7] text-[#15803D]' :
                        app.status === 'rejected' ? 'bg-[#FEE2E2] text-[#B91C1C]' :
                        app.status === 'shortlisted' ? 'bg-[#DBEAFE] text-[#1D4ED8]' :
                        'bg-[#FEF3C7] text-[#B45309]'
                      }`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Sequential Selection Stages */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {app.roundResults?.map((round, rIdx) => (
                          <button
                            key={rIdx}
                            onClick={() => handleOpenStageModal(app, rIdx)}
                            className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
                              round.result === 'qualified'
                                ? 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]'
                                : round.result === 'rejected'
                                ? 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]'
                                : 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0] hover:bg-[#E2E8F0]'
                            }`}
                            title="Click to update round qualification"
                          >
                            <span>{rIdx + 1}. {round.roundName}</span>
                            <span>{round.result === 'qualified' ? '✓' : round.result === 'rejected' ? '✕' : '●'}</span>
                          </button>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleOpenStageModal(app, Math.min(app.roundResults?.length - 1 || 0, (app.currentRoundOrder || 1) - 1))}
                        className="px-3 py-1.5 bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Grade Stage &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stage Grade Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#CBD5E1] shadow-xl">
            <h2 className="text-base font-bold text-[#0F172A] border-b border-[#F1F5F9] pb-3 mb-3">
              Update Candidate Recruitment Stage
            </h2>

            <div className="text-xs text-[#475569] space-y-1 mb-4 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
              <p>Candidate: <strong>{selectedApp.studentId?.name}</strong> ({selectedApp.studentId?.branch})</p>
              <p>Opportunity: <strong>{selectedApp.opportunityId?.companyId?.name} - {selectedApp.opportunityId?.title}</strong></p>
            </div>

            <form onSubmit={handleUpdateStageSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Select Round to Grade:
                </label>
                <select
                  value={roundIdxToUpdate}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setRoundIdxToUpdate(idx);
                    setRoundResult(selectedApp.roundResults[idx]?.result || 'qualified');
                    setRoundFeedback(selectedApp.roundResults[idx]?.feedback || '');
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white font-medium"
                >
                  {selectedApp.roundResults?.map((r, i) => (
                    <option key={i} value={i}>
                      Round {i + 1}: {r.roundName} (Current: {r.result})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Evaluation Verdict:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRoundResult('qualified')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      roundResult === 'qualified'
                        ? 'bg-[#DCFCE7] text-[#15803D] border-[#16A34A]'
                        : 'bg-white text-[#475569] border-[#CBD5E1]'
                    }`}
                  >
                    ✓ Qualified / Pass
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoundResult('pending')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      roundResult === 'pending'
                        ? 'bg-[#FEF3C7] text-[#B45309] border-[#D97706]'
                        : 'bg-white text-[#475569] border-[#CBD5E1]'
                    }`}
                  >
                    ● Pending / In Review
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoundResult('rejected')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      roundResult === 'rejected'
                        ? 'bg-[#FEE2E2] text-[#B91C1C] border-[#DC2626]'
                        : 'bg-white text-[#475569] border-[#CBD5E1]'
                    }`}
                  >
                    ✕ Not Qualified
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Feedback / Next Instructions (Dispatched to Student):
                </label>
                <textarea
                  rows={3}
                  value={roundFeedback}
                  onChange={(e) => setRoundFeedback(e.target.value)}
                  placeholder="e.g. Cleared resume screening. Progressive interview materials unlocked. Report for OA on Saturday."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStage}
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {updatingStage ? 'Saving...' : 'Update & Notify Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
