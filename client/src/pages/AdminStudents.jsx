import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  ExternalLink,
  Mail,
  Award
} from 'lucide-react';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [branchFilter, yearFilter]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (branchFilter) params.branch = branchFilter;
      if (yearFilter) params.academicYear = yearFilter;

      const res = await axios.get('/api/admin/students', { params });
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.collegeEmail.toLowerCase().includes(search.toLowerCase()) ||
    (s.skills || []).some(sk => sk.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Verified Student Talent Directory</h1>
        <p className="text-sm text-[#475569] mt-1">
          Centrally managed institutional student placement profiles, verified domains, academic scores, and resumes.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search student, email, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A]"
          >
            <option value="">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="Mechanical">Mechanical</option>
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A]"
          >
            <option value="">All Academic Years</option>
            <option value="2025">Class of 2025</option>
            <option value="2026">Class of 2026</option>
            <option value="2027">Class of 2027</option>
            <option value="2028">Class of 2028</option>
          </select>

          <span className="text-xs text-[#64748B] font-semibold">
            Count: {filtered.length}
          </span>
        </div>
      </div>

      {/* Students Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-[#64748B] text-xs">Loading talent directory...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-[#64748B] text-xs bg-white rounded-xl border border-[#E2E8F0]">
            No verified students match your query.
          </div>
        ) : (
          filtered.map((s) => (
            <div
              key={s._id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col justify-between shadow-xs hover:border-[#CBD5E1] transition-all"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#EEF2FF] border border-[#C7D2FE] text-[#4F46E5] font-bold text-sm flex items-center justify-center shrink-0">
                    {s.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">{s.name}</h3>
                    <p className="text-xs text-[#64748B] flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {s.collegeEmail}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F1F5F9] grid grid-cols-2 gap-2 text-xs text-[#475569]">
                  <div>Branch: <strong>{s.branch}</strong> ({s.section})</div>
                  <div>Class: <strong>{s.academicYear}</strong></div>
                  <div>CGPA: <strong>{s.cgpa}</strong></div>
                  <div>Backlogs: <strong>{s.backlogs || 0}</strong></div>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] font-semibold text-[#64748B] uppercase block mb-1">
                    Skills:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(s.skills || []).slice(0, 5).map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] bg-[#F1F5F9] text-[#334155] font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                    {(s.skills || []).length > 5 && (
                      <span className="text-[10px] text-[#64748B] self-center">
                        +{s.skills.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                <span className="text-[11px] text-[#15803D] font-medium flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#16A34A]"></span> Verified Domain
                </span>

                {s.resumeUrl ? (
                  <a
                    href={s.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
                  >
                    Resume <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-[11px] text-[#94A3B8]">No resume</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
