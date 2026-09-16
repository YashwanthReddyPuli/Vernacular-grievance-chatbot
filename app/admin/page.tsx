'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

interface TicketRecord {
  id: string;
  grievance_id: string;
  structured_summary?: {
    issue_summary?: string;
    location?: string;
    urgency?: string;
    requested_action?: string;
  };
  classification_method: string;
  confidence: number;
  matched_keywords?: string[];
  reasoning?: string;
  status: string;
  created_at: string;
  grievances?: {
    raw_text: string;
    location_hint?: string;
    citizen_contact?: string;
  };
  categories?: {
    name: string;
    department: string;
  };
}

export default function AdminPage() {
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/tickets');
      const data = await res.json();
      if (data.success && Array.isArray(data.tickets)) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter((t) => {
    const categoryName = t.categories?.name || 'Unclassified';
    const matchesDept = selectedFilter === 'all' || categoryName === selectedFilter;
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;
    return matchesDept && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Department Governance Dashboard
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Grievance Classification & Ticket Directory
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Live audit view of citizen grievances, automated classifications, and status tracking.
            </p>
          </div>

          <button
            onClick={fetchTickets}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
          >
            <span>🔄 Refresh Tickets</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          {/* Department Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-400">Department:</span>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none"
            >
              <option value="all">All Departments</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Electricity">Electricity</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Roads/PWD">Roads/PWD</option>
              <option value="Police">Police</option>
              <option value="Revenue/Land Records">Revenue/Land Records</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Showing {filteredTickets.length} of {tickets.length} tickets
          </div>
        </div>

        {/* Tickets Grid / Table */}
        {isLoading ? (
          <div className="text-center py-20 text-slate-500 space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading grievance records from database...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
            <p className="text-base font-semibold">No Tickets Found</p>
            <p className="text-xs text-slate-500">
              Submit a new grievance on the Citizen Portal to view it here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTickets.map((ticket) => {
              const deptName = ticket.categories?.department || 'Unassigned Department';
              const catName = ticket.categories?.name || 'Unclassified';

              return (
                <div
                  key={ticket.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all space-y-4"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center space-x-3">
                      <span className="px-2.5 py-1 rounded-md bg-indigo-600/20 text-indigo-300 font-semibold text-xs border border-indigo-500/30">
                        {catName}
                      </span>
                      <span className="text-xs text-slate-400">{deptName}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                          ticket.status === 'confirmed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : ticket.status === 'rejected'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {ticket.status}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        ID: {ticket.id.substring(0, 8)}
                      </span>
                    </div>
                  </div>

                  {/* Grievance Content */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Left: Raw Grievance */}
                    <div className="md:col-span-2 space-y-2">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Raw Citizen Grievance
                      </span>
                      <p className="text-sm text-slate-200 bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
                        "{ticket.grievances?.raw_text || 'No raw text stored'}"
                      </p>

                      {ticket.structured_summary && (
                        <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 text-xs space-y-1">
                          <span className="font-semibold text-slate-400">Structured Summary:</span>
                          <p className="text-slate-300">
                            {ticket.structured_summary.issue_summary}
                          </p>
                          {ticket.structured_summary.requested_action && (
                            <p className="text-slate-400">
                              <strong className="text-slate-300">Requested Action:</strong>{' '}
                              {ticket.structured_summary.requested_action}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Classification Metadata */}
                    <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs space-y-2">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Classification Audit
                      </span>

                      <div className="flex justify-between">
                        <span className="text-slate-400">Method:</span>
                        <span className="font-mono text-indigo-400">{ticket.classification_method}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">Confidence:</span>
                        <span className="font-bold text-emerald-400">
                          {ticket.confidence ? (ticket.confidence * 100).toFixed(0) : 0}%
                        </span>
                      </div>

                      {ticket.matched_keywords && ticket.matched_keywords.length > 0 && (
                        <div>
                          <span className="text-slate-400 block mb-1">Matched Keywords:</span>
                          <div className="flex flex-wrap gap-1">
                            {ticket.matched_keywords.map((kw, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded bg-slate-900 text-indigo-300 border border-slate-800 text-[10px]"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {ticket.created_at && (
                        <div className="pt-1 text-[10px] text-slate-500">
                          Logged: {new Date(ticket.created_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
