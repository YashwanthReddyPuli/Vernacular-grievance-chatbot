'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import ConfirmationCard from '@/components/ConfirmationCard';
import { ClassificationMetadata, StructuredTicketDraft } from '@/lib/classifier';

export default function Home() {
  const [rawText, setRawText] = useState('');
  const [locationHint, setLocationHint] = useState('');
  const [citizenContact, setCitizenContact] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Classified Response State
  const [classifiedData, setClassifiedData] = useState<{
    grievanceId: string;
    ticketId: string;
    classification: ClassificationMetadata;
    structuredTicket: StructuredTicketDraft;
  } | null>(null);

  // Edge Case Presets for Live Hackathon Testing
  const samplePresets = [
    {
      label: '🇮🇳 Code-Switched (Hinglish / Teluglish)',
      text: 'Ward 5 me high voltage current cutoff hua hai, electrical transformer is sparking badly since morning.',
      location: 'Ward 5, Bhopal',
    },
    {
      label: '⚡ Very Short (2-3 Words)',
      text: 'Water leakage pipe',
      location: 'Sector 4, Rohini',
    },
    {
      label: '📜 Long Rambling Complaint',
      text: 'I am writing to inform you that yesterday when I went out to buy groceries near the main market road, I noticed that the street light was broken and there was also garbage dumped near the corner next to the drain, but the main issue is that a huge truck hit the transformer and electricity is cut off for 50 houses.',
      location: 'Civil Lines, Nagpur',
    },
    {
      label: '⚖️ Multi-Category Tie Candidate',
      text: 'Dirty sewage water is leaking onto the main road created huge potholes and street light is off.',
      location: 'Station Road, Mysuru',
    },
  ];

  const handleApplyPreset = (preset: { text: string; location: string }) => {
    setRawText(preset.text);
    setLocationHint(preset.location);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) {
      setErrorMsg('Please enter your grievance text.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/grievance/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_text: rawText.trim(),
          citizen_contact: citizenContact.trim() || undefined,
          location_hint: locationHint.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to classify grievance');
      }

      setClassifiedData({
        grievanceId: data.grievance_id,
        ticketId: data.ticket_id,
        classification: data.classification,
        structuredTicket: data.structured_ticket,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during classification.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setClassifiedData(null);
    setRawText('');
    setLocationHint('');
    setCitizenContact('');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      <Navbar />

      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 flex flex-col items-center justify-center z-10 space-y-8">
        {/* Title Header */}
        <div className="text-center max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
            <span>🌐 Multilingual Civic Intelligence Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Vernacular Grievance Redressal
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Submit your complaint in Hindi, Telugu, English, or regional dialects. Our system uses explainable rule-based logic to auto-draft official department tickets.
          </p>
        </div>

        {/* State 1: Input Form Shell */}
        {!classifiedData ? (
          <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            {/* Quick Test Presets */}
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Edge Case Test Presets (Click to load):
              </span>
              <div className="flex flex-wrap gap-2">
                {samplePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-indigo-300 transition-colors cursor-pointer font-medium"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Grievance Textarea */}
              <div>
                <label
                  htmlFor="grievance"
                  className="block text-sm font-semibold text-slate-200 mb-2"
                >
                  Describe Your Grievance <span className="text-indigo-400">*</span>
                </label>
                <textarea
                  id="grievance"
                  rows={5}
                  value={rawText}
                  maxLength={3000}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="यहाँ अपनी समस्या लिखें... (Enter grievance in Hindi, Telugu, English, or code-switched vernacular dialect)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base resize-none"
                />
                <p className="mt-1.5 text-xs text-slate-500 flex justify-between">
                  <span>Supports code-switching, short phrases, and regional terms.</span>
                  <span>{rawText.length} / 3000</span>
                </p>
              </div>

              {/* Optional Location & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="location"
                    className="block text-xs font-medium text-slate-300 mb-1.5"
                  >
                    Location / Ward Hint <span className="text-slate-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={locationHint}
                    onChange={(e) => setLocationHint(e.target.value)}
                    placeholder="e.g. Ward 14, Main Road, Mysuru"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact"
                    className="block text-xs font-medium text-slate-300 mb-1.5"
                  >
                    Citizen Contact Number / Email <span className="text-slate-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="contact"
                    value={citizenContact}
                    onChange={(e) => setCitizenContact(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Classifying Regional Text...</span>
                    </div>
                  ) : (
                    <>
                      <span>Draft Auto-Ticket</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* State 2: Confirmation Card Component */
          <ConfirmationCard
            grievanceId={classifiedData.grievanceId}
            ticketId={classifiedData.ticketId}
            rawText={rawText}
            classification={classifiedData.classification}
            structuredTicket={classifiedData.structuredTicket}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-6 text-center text-xs text-slate-500 mt-auto">
        <p>MeitY AI Hackathon Project • Vernacular Grievance Redressal System</p>
      </footer>
    </div>
  );
}
