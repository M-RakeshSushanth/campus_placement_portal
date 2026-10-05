import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  Calendar,
  Building,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function OpportunitiesList() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [eligibilityFilter, setEligibilityFilter] = useState('all'); // all, eligible_only

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

  const filtered = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(search.toLowerCase()) ||
      opp.companyId?.name.toLowerCase().includes(search.toLowerCase()) ||
      (opp.requiredSkills || []).some(s => s.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === 'all' || opp.type === typeFilter;
    const matchesElig =
      eligibilityFilter === 'all' ||
      (eligibilityFilter === 'eligible' && opp.eligibilityStatus?.isEligible);

    return matchesSearch && matchesType && matchesElig;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Placement Opportunities</h1>
        <p className="text-sm text-[#475569] mt-1">
          Explore campus recruitment drives, internships, full-time positions, and hackathons with automated eligibility matching.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by company, role or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Opportunity Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="all">All Opportunities</option>
            <option value="full_time">Full-Time</option>
            <option value="internship">Internships</option>
            <option value="hackathon">Hackathons</option>
            <option value="recruitment_drive">Drives</option>
          </select>

          {/* Eligibility Filter */}
          <select
            value={eligibilityFilter}
            onChange={(e) => setEligibilityFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="all">Show All (Eligible & Ineligible)</option>
            <option value="eligible">Only Roles I Qualify For</option>
          </select>
        </div>
      </div>

      {/* Opportunities Grid */}
      {loading ? (
        <div className="text-center py-12 text-[#64748B] text-sm">Loading opportunities...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center border border-[#E2E8F0]">
          <p className="text-sm font-semibold text-[#0F172A]">No opportunities match your filter.</p>
          <p className="text-xs text-[#64748B] mt-1">Try clearing some filter criteria or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((opp) => {
            const elig = opp.eligibilityStatus;
            const hasApplied = !!opp.application;

            return (
              <div
                key={opp._id}
                className="bg-white rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all p-5 flex flex-col justify-between shadow-xs"
              >
                <div>
                  {/* Top Bar with Company & Type */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={opp.companyId?.logoUrl || 'https://img.icons8.com/color/96/briefcase.png'}
                        alt={opp.companyId?.name}
                        className="h-10 w-10 rounded-lg object-contain bg-[#F8FAFC] p-1 border border-[#E2E8F0]"
                      />
                      <div>
                        <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block">
                          {opp.companyId?.name}
                        </span>
                        <h3 className="text-sm font-bold text-[#0F172A] line-clamp-1">{opp.title}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569]">
                      {opp.type.replace('_', ' ')}
                    </span>

                    {elig && (
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                        elig.isEligible
                          ? 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]'
                          : 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]'
                      }`}>
                        {elig.isEligible ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> Eligible
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" /> Ineligible
                          </>
                        )}
                      </span>
                    )}

                    {hasApplied && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                        Applied
                      </span>
                    )}
                  </div>

                  {/* Description snippet */}
                  <p className="text-xs text-[#475569] mt-3 line-clamp-2 leading-relaxed">
                    {opp.description}
                  </p>

                  {/* Skills tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(opp.requiredSkills || []).slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium bg-[#F1F5F9] text-[#334155] px-2 py-0.5 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {(opp.requiredSkills || []).length > 4 && (
                      <span className="text-[10px] text-[#64748B] self-center">
                        +{opp.requiredSkills.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Eligibility summary */}
                  <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-[11px] text-[#64748B] space-y-1">
                    <div>
                      <strong>CGPA Req:</strong> {opp.eligibility?.minCgpa || 'No minimum'}
                    </div>
                    <div>
                      <strong>Branches:</strong> {opp.eligibility?.branches?.join(', ') || 'All Branches'}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-5 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(opp.deadline).toLocaleDateString()}
                  </span>

                  <Link
                    to={`/student/opportunities/${opp._id}`}
                    className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    View & Apply <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
