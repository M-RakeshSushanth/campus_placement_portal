import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
  Briefcase,
  FileCheck,
  CheckCircle,
  TrendingUp,
  PlusCircle,
  Bell,
  ArrowRight,
  Sliders,
  Send
} from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    totalOpportunities: 0,
    totalApplications: 0,
    selectedApplications: 0,
    shortlistedApplications: 0
  });
  const [recentOpportunities, setRecentOpportunities] = useState([]);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementSending, setAnnouncementSending] = useState(false);
  const [announcementSuccess, setAnnouncementSuccess] = useState('');

  useEffect(() => {
    fetchMetrics();
    fetchOpportunities();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await axios.get('/api/admin/metrics');
      setMetrics(res.data);
    } catch (err) {}
  };

  const fetchOpportunities = async () => {
    try {
      const res = await axios.get('/api/opportunities');
      setRecentOpportunities(res.data.slice(0, 4));
    } catch (err) {}
  };

  const handleBroadcastAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementTitle || !announcementText) return;
    setAnnouncementSending(true);
    setAnnouncementSuccess('');
    try {
      const res = await axios.post('/api/admin/announcements', {
        title: announcementTitle,
        message: announcementText
      });
      setAnnouncementSuccess(res.data.message);
      setAnnouncementTitle('');
      setAnnouncementText('');
    } catch (err) {
      alert('Failed to send announcement');
    } finally {
      setAnnouncementSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#4F46E5] bg-[#EEF2FF] px-2.5 py-1 rounded-md">
            Placement Administration Console
          </span>
          <h1 className="text-2xl font-bold text-[#0F172A] mt-2">
            Training & Placement (T&P) Command Center
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            Manage institutional recruitment drives, configure dynamic eligibility rules, and track selection rounds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/opportunities"
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" /> Publish Opportunity
          </Link>
          <Link
            to="/admin/settings"
            className="px-4 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Sliders className="h-4 w-4" /> System Settings
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Total Students</span>
            <div className="p-2 bg-[#EFF6FF] text-[#2563EB] rounded-lg">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0F172A] mt-2">{metrics.totalStudents}</p>
          <p className="text-[11px] text-[#64748B] mt-1">Verified college domain</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Opportunities</span>
            <div className="p-2 bg-[#EEF2FF] text-[#4F46E5] rounded-lg">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0F172A] mt-2">{metrics.totalOpportunities}</p>
          <p className="text-[11px] text-[#64748B] mt-1">Active recruitment pipelines</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Applications</span>
            <div className="p-2 bg-[#FEF3C7] text-[#B45309] rounded-lg">
              <FileCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0F172A] mt-2">{metrics.totalApplications}</p>
          <p className="text-[11px] text-[#64748B] mt-1">Across all drives</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Shortlisted</span>
            <div className="p-2 bg-[#DBEAFE] text-[#1D4ED8] rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0F172A] mt-2">{metrics.shortlistedApplications}</p>
          <p className="text-[11px] text-[#1D4ED8] font-medium mt-1">In selection rounds</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Placements Placed</span>
            <div className="p-2 bg-[#DCFCE7] text-[#15803D] rounded-lg">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0F172A] mt-2">{metrics.selectedApplications}</p>
          <p className="text-[11px] text-[#15803D] font-medium mt-1">Offers extended</p>
        </div>
      </div>

      {/* Main Administrative Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Published Opportunities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#0F172A]">Active Drives & Opportunities</h2>
            <Link to="/admin/opportunities" className="text-xs font-semibold text-[#2563EB] hover:underline">
              Manage All &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {recentOpportunities.map((opp) => (
              <div
                key={opp._id}
                className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={opp.companyId?.logoUrl || 'https://img.icons8.com/color/96/briefcase.png'}
                    alt={opp.companyId?.name}
                    className="h-11 w-11 rounded-lg object-contain bg-[#F8FAFC] p-1 border border-[#E2E8F0]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#64748B] uppercase">
                      {opp.companyId?.name}
                    </span>
                    <h3 className="text-sm font-bold text-[#0F172A]">{opp.title}</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Deadline: {new Date(opp.deadline).toLocaleDateString()} • {opp.selectionRounds?.length || 0} Selection Rounds
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/applications?opportunityId=${opp._id}`}
                    className="px-3 py-1.5 bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] text-xs font-semibold rounded-lg transition-colors"
                  >
                    Applications
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Centralized Announcement Dispatcher */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center gap-2 text-[#0F172A] font-bold text-sm mb-3">
              <Bell className="h-4 w-4 text-[#2563EB]" />
              <span>Real-Time Announcement Dispatcher</span>
            </div>

            <p className="text-xs text-[#64748B] mb-4">
              Push real-time notifications directly to student dashboards and socket listeners across campus.
            </p>

            {announcementSuccess && (
              <div className="p-2.5 mb-3 bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] rounded-lg text-xs font-semibold">
                ✓ {announcementSuccess}
              </div>
            )}

            <form onSubmit={handleBroadcastAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Announcement Subject
                </label>
                <input
                  type="text"
                  required
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="e.g. PPT Session with Microsoft Tomorrow"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Message Content
                </label>
                <textarea
                  rows={3}
                  required
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="All eligible 2026 graduates must report to the campus seminar hall at 10:00 AM sharp..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <button
                type="submit"
                disabled={announcementSending}
                className="w-full py-2 px-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                {announcementSending ? 'Broadcasting...' : 'Broadcast to All Students'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
