import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus,
  Trash2,
  Calendar,
  Building,
  CheckCircle2,
  ListPlus,
  Send,
  Sliders,
  ChevronDown,
  Layers
} from 'lucide-react';

export default function AdminOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [remindingOppId, setRemindingOppId] = useState(null);
  const [message, setMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    companyDescription: '',
    companyWebsite: '',
    title: '',
    type: 'full_time',
    description: '',
    requiredSkills: '',
    deadline: '',
    minCgpa: 7.5,
    branches: 'CSE, IT, ECE',
    academicYears: '2026, 2027',
    maxBacklogs: 0,
    sections: 'A, B, C',
    selectionRounds: [
      { name: 'Resume Screening', order: 1, type: 'resume_screening', description: 'Institutional profile review' },
      { name: 'Online Assessment', order: 2, type: 'online_assessment', description: 'Aptitude & DSA test' },
      { name: 'Technical Interview', order: 3, type: 'technical_interview', description: 'Problem solving & tech depth' },
      { name: 'HR Interview', order: 4, type: 'hr', description: 'Cultural fit and compensation discussion' }
    ]
  });

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const res = await axios.get('/api/opportunities');
      setOpportunities(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRound = () => {
    const nextOrder = formData.selectionRounds.length + 1;
    setFormData({
      ...formData,
      selectionRounds: [
        ...formData.selectionRounds,
        { name: `Round ${nextOrder}`, order: nextOrder, type: 'custom', description: '' }
      ]
    });
  };

  const handleRemoveRound = (idx) => {
    const updated = formData.selectionRounds.filter((_, i) => i !== idx).map((r, i) => ({ ...r, order: i + 1 }));
    setFormData({ ...formData, selectionRounds: updated });
  };

  const handleUpdateRound = (idx, field, value) => {
    const updated = [...formData.selectionRounds];
    updated[idx][field] = value;
    setFormData({ ...formData, selectionRounds: updated });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        companyName: formData.companyName,
        companyDescription: formData.companyDescription,
        companyWebsite: formData.companyWebsite,
        title: formData.title,
        type: formData.type,
        description: formData.description,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        deadline: formData.deadline,
        eligibility: {
          minCgpa: Number(formData.minCgpa),
          branches: formData.branches.split(',').map(s => s.trim()).filter(Boolean),
          academicYears: formData.academicYears.split(',').map(s => s.trim()).filter(Boolean),
          maxBacklogs: Number(formData.maxBacklogs)
        },
        targetAudience: {
          branches: formData.branches.split(',').map(s => s.trim()).filter(Boolean),
          sections: formData.sections.split(',').map(s => s.trim()).filter(Boolean),
          academicYears: formData.academicYears.split(',').map(s => s.trim()).filter(Boolean)
        },
        selectionRounds: formData.selectionRounds
      };

      await axios.post('/api/opportunities', payload);
      setShowCreateModal(false);
      setMessage('Opportunity published and notified to matching students.');
      fetchOpportunities();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to publish opportunity');
    }
  };

  const handleSendDeadlineReminder = async (oppId) => {
    setRemindingOppId(oppId);
    try {
      const res = await axios.post(`/api/admin/remind-deadline/${oppId}`);
      setMessage(res.data.message);
    } catch (err) {
      alert('Failed to send reminder');
    } finally {
      setRemindingOppId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Opportunity & Recruitment Drive Pipeline</h1>
          <p className="text-sm text-[#475569] mt-1">
            Configure recruitment drives, dynamic eligibility criteria, and customized sequential selection rounds.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Create New Opportunity
        </button>
      </div>

      {message && (
        <div className="p-3 bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] rounded-lg text-xs font-semibold flex items-center justify-between">
          <span>✓ {message}</span>
          <button onClick={() => setMessage('')} className="text-xs hover:underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Opportunities Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#475569] border-b border-[#E2E8F0] uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Company & Role</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Eligibility Rules</th>
                <th className="px-4 py-3.5">Rounds</th>
                <th className="px-4 py-3.5">Deadline</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {opportunities.map((opp) => (
                <tr key={opp._id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={opp.companyId?.logoUrl || 'https://img.icons8.com/color/96/briefcase.png'}
                        alt={opp.companyId?.name}
                        className="h-8 w-8 rounded object-contain bg-[#F8FAFC] border border-[#E2E8F0] p-0.5"
                      />
                      <div>
                        <span className="font-bold text-[#0F172A] block text-sm">{opp.title}</span>
                        <span className="text-xs text-[#64748B]">{opp.companyId?.name}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-[#F1F5F9] text-[#475569]">
                      {opp.type.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-[#475569] space-y-0.5">
                    <p>CGPA: <strong>&ge; {opp.eligibility?.minCgpa || 0}</strong></p>
                    <p>Branches: <strong>{opp.eligibility?.branches?.join(', ') || 'All'}</strong></p>
                    <p>Backlogs: <strong>&le; {opp.eligibility?.maxBacklogs ?? 0}</strong></p>
                  </td>

                  <td className="px-4 py-4">
                    <span className="font-semibold text-[#0F172A]">{opp.selectionRounds?.length || 0} stages</span>
                    <p className="text-[11px] text-[#64748B] truncate max-w-[150px]">
                      {opp.selectionRounds?.map(r => r.name).join(' &rarr; ')}
                    </p>
                  </td>

                  <td className="px-4 py-4 text-[#475569]">
                    {new Date(opp.deadline).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleSendDeadlineReminder(opp._id)}
                      disabled={remindingOppId === opp._id}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded bg-[#EEF2FF] text-[#4F46E5] hover:bg-[#E0E7FF] border border-[#C7D2FE] transition-colors cursor-pointer"
                      title="Send automated deadline reminder to eligible students who haven't applied"
                    >
                      {remindingOppId === opp._id ? 'Sending...' : 'Remind Eligible'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Opportunity with Sequential Rounds */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 border border-[#CBD5E1] shadow-xl my-8">
            <h2 className="text-lg font-bold text-[#0F172A] border-b border-[#F1F5F9] pb-3 mb-4">
              Configure Placement Opportunity & Selection Rounds
            </h2>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Goldman Sachs"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Role Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Quantitative Analyst"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Opportunity Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white"
                  >
                    <option value="full_time">Full-Time Placement</option>
                    <option value="internship">Internship</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="recruitment_drive">Recruitment Drive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">Role Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of job responsibilities and expectations..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Required Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.requiredSkills}
                    onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                    placeholder="Java, Python, Algorithms, SQL"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Application Deadline</label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1]"
                  />
                </div>
              </div>

              {/* Dynamic Eligibility Criteria */}
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-3">
                <span className="text-xs font-bold text-[#0F172A] block uppercase tracking-wider">
                  Configurable Eligibility Rules
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569]">Min CGPA</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.minCgpa}
                      onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs rounded border border-[#CBD5E1] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569]">Max Backlogs</label>
                    <input
                      type="number"
                      value={formData.maxBacklogs}
                      onChange={(e) => setFormData({ ...formData, maxBacklogs: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs rounded border border-[#CBD5E1] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569]">Eligible Branches</label>
                    <input
                      type="text"
                      value={formData.branches}
                      onChange={(e) => setFormData({ ...formData, branches: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs rounded border border-[#CBD5E1] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569]">Target Class Years</label>
                    <input
                      type="text"
                      value={formData.academicYears}
                      onChange={(e) => setFormData({ ...formData, academicYears: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs rounded border border-[#CBD5E1] bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Configurable Sequential Selection Rounds */}
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    Sequential Selection Rounds (Add/Remove/Order)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddRound}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] cursor-pointer"
                  >
                    + Add Round
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.selectionRounds.map((round, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-[#E2E8F0] text-[#0F172A] flex items-center justify-center font-bold text-xs shrink-0">
                        {round.order}
                      </span>
                      <input
                        type="text"
                        value={round.name}
                        onChange={(e) => handleUpdateRound(idx, 'name', e.target.value)}
                        placeholder="Round Name"
                        className="flex-1 px-2.5 py-1.5 text-xs rounded border border-[#CBD5E1] bg-white"
                      />
                      <select
                        value={round.type}
                        onChange={(e) => handleUpdateRound(idx, 'type', e.target.value)}
                        className="px-2 py-1.5 text-xs rounded border border-[#CBD5E1] bg-white"
                      >
                        <option value="resume_screening">Resume Screening</option>
                        <option value="online_assessment">Online Assessment</option>
                        <option value="coding">Coding Round</option>
                        <option value="technical_interview">Technical Interview</option>
                        <option value="hr">HR Interview</option>
                        <option value="custom">Custom Round</option>
                      </select>
                      {formData.selectionRounds.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRound(idx)}
                          className="p-1.5 text-[#DC2626] hover:bg-[#FEE2E2] rounded cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Publish Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
