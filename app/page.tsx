'use client';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Glowing Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-indigo-500/20">
              MeitY
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                Vernacular Grievance Redressal
              </h1>
              <p className="text-xs text-slate-400">
                AI-Assisted Regional Classification & Auto-Ticket Drafting
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              AI System Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 flex flex-col items-center justify-center z-10">
        {/* Title Badge */}
        <div className="mb-6 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-medium backdrop-blur-sm">
          <span>🌐 Supports 12+ Official Indian Languages</span>
        </div>

        <div className="text-center mb-10 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Submit Your Grievance in Any Regional Language
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            Express your issue in your native language. Our system automatically detects the language, extracts key details, classifies the department, and drafts an official grievance ticket.
          </p>
        </div>

        {/* Form Container */}
        <div className="w-full bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-indigo-950/40 relative">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
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
                placeholder="यहाँ अपनी समस्या लिखें... (Enter grievance in Hindi, Tamil, Telugu, Kannada, Marathi, English, etc.)"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-sm sm:text-base"
              />
              <p className="mt-2 text-xs text-slate-500 flex justify-between">
                <span>Supports voice & text input across regional dialects.</span>
                <span>0 / 1000</span>
              </p>
            </div>

            {/* Optional Location & Contact Fields */}
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
                  placeholder="e.g. Ward 14, Main Road, Mysuru"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 group cursor-pointer"
              >
                <span>Draft Auto-Ticket</span>
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
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
              </button>
            </div>
          </form>
        </div>

        {/* Supported Categories Pills */}
        <div className="mt-12 text-center w-full">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-4">
            Automated Department Routing
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { name: 'Water Supply', dept: 'Municipal Water Board' },
              { name: 'Electricity', dept: 'Electricity Board' },
              { name: 'Sanitation', dept: 'Sanitation Dept.' },
              { name: 'Roads/PWD', dept: 'Public Works Dept.' },
              { name: 'Police', dept: 'Police Dept.' },
              { name: 'Revenue', dept: 'Revenue Dept.' },
            ].map((cat) => (
              <span
                key={cat.name}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center space-x-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span className="font-medium">{cat.name}</span>
                <span className="text-slate-500">({cat.dept})</span>
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 px-6 text-center text-xs text-slate-500">
        <p>MeitY AI Hackathon Project • Vernacular Grievance Redressal System</p>
      </footer>
    </div>
  );
}
