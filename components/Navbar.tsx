'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Branding */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center font-bold text-slate-950 text-lg shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            GOI
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                National Vernacular Grievance Portal
              </h1>
              <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-semibold px-2 py-0.5 rounded border border-indigo-500/20">
                MeitY AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              AI-Assisted Regional Grievance Classification & Auto-Ticket Drafting
            </p>
          </div>
        </Link>

        {/* Navigation Switcher */}
        <nav className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              pathname === '/'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Citizen Portal
          </Link>
          <Link
            href="/admin"
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5 ${
              pathname === '/admin'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>Department Admin</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
