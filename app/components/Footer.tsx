import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative py-8 px-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md mt-auto z-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <p className="text-sm font-semibold text-slate-200">
            Imtithal Compliance & Governance
          </p>
          <p className="text-xs text-slate-400 mt-1">
            &copy; {new Date().getFullYear()} Imtithal Platform. All rights reserved.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/aboutUs"
            className="text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors"
          >
            About
          </Link>
          <Link 
            href="/privacy" 
            className="text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link 
            href="/terms" 
            className="text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors"
          >
            Terms of Service
          </Link>
          <Link 
            href="/contactus" 
            className="text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </footer>
  );
}