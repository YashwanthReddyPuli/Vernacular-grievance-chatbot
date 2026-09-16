'use client';

import { useState } from 'react';
import { ClassificationMetadata, StructuredTicketDraft } from '@/lib/classifier';

interface ConfirmationCardProps {
  grievanceId: string;
  ticketId: string;
  rawText: string;
  classification: ClassificationMetadata;
  structuredTicket: StructuredTicketDraft;
  onReset: () => void;
}

const CATEGORY_OPTIONS = [
  { name: 'Water Supply', dept: 'Municipal Water Board' },
  { name: 'Electricity', dept: 'Electricity Board' },
  { name: 'Sanitation', dept: 'Sanitation Department' },
  { name: 'Roads/PWD', dept: 'Public Works Department' },
  { name: 'Police', dept: 'Police Department' },
  { name: 'Revenue/Land Records', dept: 'Revenue Department' },
];

export default function ConfirmationCard({
  grievanceId,
  ticketId,
  rawText,
  classification,
  structuredTicket,
  onReset,
}: ConfirmationCardProps) {
  const [isExplainableOpen, setIsExplainableOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Manual Category Picker State
  const [selectedCategory, setSelectedCategory] = useState(classification.category);
  const selectedDept =
    CATEGORY_OPTIONS.find((c) => c.name === selectedCategory)?.dept || classification.department;

  // Editable Form Fields
  const [summary, setSummary] = useState(structuredTicket.issue_summary);
  const [location, setLocation] = useState(structuredTicket.location);
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'urgent'>(
    structuredTicket.urgency || 'medium'
  );
  const [requestedAction, setRequestedAction] = useState(structuredTicket.requested_action);

  const isLowConfidence =
    classification.low_confidence || classification.confidence < 0.35 || classification.matched_keywords.length === 0;

  // Check if citizen edited any fields or category
  const isEdited =
    selectedCategory !== classification.category ||
    summary !== structuredTicket.issue_summary ||
    location !== structuredTicket.location ||
    urgency !== structuredTicket.urgency ||
    requestedAction !== structuredTicket.requested_action;

  const handleConfirm = async (action: 'confirmed' | 'edited' | 'rejected') => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/grievance/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grievance_id: grievanceId,
          ticket_id: ticketId,
          citizen_action: action,
          edited_fields: action === 'edited' ? {
            category: selectedCategory,
            department: selectedDept,
            issue_summary: summary,
            location: location,
            urgency: urgency,
            requested_action: requestedAction,
          } : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit confirmation');
      }

      setIsConfirmed(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Confirmation submission failed';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isConfirmed) {
    return (
      <div className="w-full bg-slate-900 border border-emerald-500/40 rounded-2xl p-8 backdrop-blur-xl shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl font-bold border border-emerald-500/40 animate-bounce">
          ✓
        </div>
        <div>
          <span className="bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/20">
            Official Ticket Registered
          </span>
          <h3 className="text-2xl font-bold text-white mt-3">Grievance Submitted Successfully</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Your grievance has been assigned to the{' '}
            <strong className="text-slate-200">{selectedDept}</strong>.
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-w-md mx-auto text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Ticket Reference ID:</span>
            <span className="font-mono text-indigo-400 font-bold">{ticketId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Assigned Department:</span>
            <span className="text-slate-200 font-semibold">{selectedDept} ({selectedCategory})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Priority Level:</span>
            <span className="uppercase font-bold text-emerald-400">{urgency}</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onReset}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Submit Another Grievance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Auto-Drafted Ticket
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {ticketId.substring(0, 8)}...</span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1">Review & Confirm Ticket Details</h3>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Department:</span>
          <span className="px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 font-semibold text-xs border border-indigo-500/30">
            {selectedDept}
          </span>
        </div>
      </div>

      {/* Low Confidence / Ambiguity Warning Alert Banner */}
      {isLowConfidence && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs">
            <span>⚠️ System Uncertainty Detected (Confidence: {(classification.confidence * 100).toFixed(0)}%)</span>
          </div>
          <p className="text-xs text-slate-300">
            Our automated classifier detected low keyword certainty for this complaint. Please verify or manually select the correct department below.
          </p>
          <div className="pt-1">
            <label className="block text-xs font-semibold text-amber-300 mb-1">
              Select Department Manually:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-amber-500/40 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name} ({cat.dept})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Raw Complaint Text */}
      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
          Original Citizen Complaint Input
        </span>
        <p className="text-sm text-slate-300 italic">"{rawText}"</p>
      </div>

      {/* Editable Fields */}
      <div className="space-y-4 pt-1">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Draft Ticket Fields (Editable)
        </h4>

        {/* Category Override if not low confidence */}
        {!isLowConfidence && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Assigned Category / Department
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name} ({cat.dept})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Issue Summary */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Structured Issue Summary
          </label>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Location & Urgency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Location / Address
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Urgency Level
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Requested Action */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Requested Action for Department
          </label>
          <input
            type="text"
            value={requestedAction}
            onChange={(e) => setRequestedAction(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Explainability Drawer ("Why this category?") */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
        <button
          type="button"
          onClick={() => setIsExplainableOpen(!isExplainableOpen)}
          className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-semibold text-slate-300 hover:bg-slate-900/50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>Explainable Logic: Why was this category selected?</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">
              Method:{' '}
              <strong className="text-indigo-400 font-mono">{classification.method}</strong>
            </span>
            <span className="text-slate-400">{isExplainableOpen ? '▲' : '▼'}</span>
          </div>
        </button>

        {isExplainableOpen && (
          <div className="p-4 border-t border-slate-800 bg-slate-950 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Classification Method:</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[11px]">
                {classification.method}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Confidence Score:</span>
              <span className={`font-bold ${isLowConfidence ? 'text-amber-400' : 'text-emerald-400'}`}>
                {(classification.confidence * 100).toFixed(0)}%
              </span>
            </div>

            {classification.matched_keywords && classification.matched_keywords.length > 0 && (
              <div>
                <span className="text-slate-400 block mb-1">Matched Keywords:</span>
                <div className="flex flex-wrap gap-1">
                  {classification.matched_keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[11px]"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {classification.candidates && classification.candidates.length > 0 && (
              <div>
                <span className="text-slate-400 block mb-1">Top Candidate Department Scores:</span>
                <div className="space-y-1">
                  {classification.candidates.slice(0, 3).map((c, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-[11px] bg-slate-900 px-2.5 py-1 rounded"
                    >
                      <span className="text-slate-300">{c.category} ({c.department})</span>
                      <span className="font-mono text-slate-400">{c.score} matches</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {classification.reasoning && (
              <div className="pt-1">
                <span className="text-slate-400 block mb-0.5">Audit Reasoning:</span>
                <p className="text-slate-300 italic bg-slate-900 p-2.5 rounded border border-slate-800">
                  {classification.reasoning}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => handleConfirm(isEdited ? 'edited' : 'confirmed')}
          disabled={isSubmitting}
          className="w-full sm:flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <span>Processing...</span>
          ) : (
            <span>{isEdited ? 'Submit Modified Ticket' : 'Confirm & Register Ticket'}</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleConfirm('rejected')}
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 px-5 rounded-xl transition-colors cursor-pointer text-xs"
        >
          Reject Ticket
        </button>
      </div>
    </div>
  );
}
