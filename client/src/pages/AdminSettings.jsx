import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Sliders,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Shield,
  Layers,
  Clock,
  Sparkles
} from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    approvedEmailDomains: ['college.edu', 'griet.ac.in', 'campus.edu'],
    branches: ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical'],
    sections: ['A', 'B', 'C', 'D'],
    academicYears: ['2025', '2026', '2027', '2028'],
    maxResumeAttempts: 3,
    maxMockInterviewAttempts: 3,
    deadlineReminderHours: 24
  });

  const [newDomain, setNewDomain] = useState('');
  const [newBranch, setNewBranch] = useState('');
  const [newSection, setNewSection] = useState('');
  const [newYear, setNewYear] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/admin/settings');
      if (res.data) setSettings(res.data);
    } catch (err) {}
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await axios.put('/api/admin/settings', settings);
      setMessage('System operational settings & institutional rules saved successfully!');
    } catch (err) {
      setError('Failed to update system settings');
    } finally {
      setSaving(false);
    }
  };

  const addDomain = () => {
    if (newDomain.trim() && !settings.approvedEmailDomains.includes(newDomain.trim())) {
      setSettings({
        ...settings,
        approvedEmailDomains: [...settings.approvedEmailDomains, newDomain.trim().toLowerCase()]
      });
      setNewDomain('');
    }
  };

  const removeDomain = (domain) => {
    setSettings({
      ...settings,
      approvedEmailDomains: settings.approvedEmailDomains.filter(d => d !== domain)
    });
  };

  const addBranch = () => {
    if (newBranch.trim() && !settings.branches.includes(newBranch.trim())) {
      setSettings({
        ...settings,
        branches: [...settings.branches, newBranch.trim()]
      });
      setNewBranch('');
    }
  };

  const removeBranch = (branch) => {
    setSettings({
      ...settings,
      branches: settings.branches.filter(b => b !== branch)
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Settings & Institutional Rules Engine</h1>
        <p className="text-sm text-[#475569] mt-1">
          Configure verified email domains, dynamic academic categories, and operational thresholds without code changes.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {message}
        </div>
      )}

      {error && (
        <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] rounded-lg text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Approved College Email Domains */}
        <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
            <Shield className="h-4 w-4 text-[#2563EB]" />
            <span>Approved College Email Domains (Student Identity & Anti-Duplicate Verification)</span>
          </div>
          <p className="text-xs text-[#64748B]">
            Only students registering with emails ending in these domains will be permitted to create accounts.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {settings.approvedEmailDomains.map((domain) => (
              <span
                key={domain}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
              >
                @{domain}
                <button
                  type="button"
                  onClick={() => removeDomain(domain)}
                  className="hover:text-[#DC2626] cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="e.g. college.ac.in"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-[#CBD5E1] w-64"
            />
            <button
              type="button"
              onClick={addDomain}
              className="px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] rounded-lg text-xs font-semibold cursor-pointer"
            >
              Add Domain
            </button>
          </div>
        </div>

        {/* 2. Dynamically Configurable Academic Categories */}
        <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
            <Layers className="h-4 w-4 text-[#4F46E5]" />
            <span>Configurable Academic Categories (Branches & Structure)</span>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-[#475569]">Recognized Branches:</label>
            <div className="flex flex-wrap gap-2">
              {settings.branches.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F8FAFC] text-[#334155] border border-[#E2E8F0]"
                >
                  {b}
                  <button
                    type="button"
                    onClick={() => removeBranch(b)}
                    className="hover:text-[#DC2626] cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. AI & Data Science"
                value={newBranch}
                onChange={(e) => setNewBranch(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-[#CBD5E1] w-64"
              />
              <button
                type="button"
                onClick={addBranch}
                className="px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] rounded-lg text-xs font-semibold cursor-pointer"
              >
                Add Branch
              </button>
            </div>
          </div>
        </div>

        {/* 3. Operational Rules & Limits */}
        <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
            <Clock className="h-4 w-4 text-[#B45309]" />
            <span>Policy Limits & Automated Timing Rules</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Max Resume Review Attempts
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.maxResumeAttempts}
                onChange={(e) => setSettings({ ...settings, maxResumeAttempts: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1]"
              />
              <p className="text-[11px] text-[#64748B] mt-1">Prevents unlimited ATS review abuse</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Max Mock Interview Attempts
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.maxMockInterviewAttempts}
                onChange={(e) => setSettings({ ...settings, maxMockInterviewAttempts: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1]"
              />
              <p className="text-[11px] text-[#64748B] mt-1">Cap per company progressive prep</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Deadline Reminder Timing (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="72"
                value={settings.deadlineReminderHours}
                onChange={(e) => setSettings({ ...settings, deadlineReminderHours: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1]"
              />
              <p className="text-[11px] text-[#64748B] mt-1">Hours before deadline to dispatch alerts</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="py-2.5 px-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving System Rules...' : 'Save Configuration Rules'}
        </button>
      </form>
    </div>
  );
}
