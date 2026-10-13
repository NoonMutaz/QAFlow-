'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../i18n/LanguageProvider';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="relative py-8 px-6 border-t border-brand-800/70 bg-brand-950 backdrop-blur-md mt-auto z-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
        <div>
          <p className="text-sm font-semibold text-slate-200">
            {t("Imtithal Compliance & Governance")}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            &copy; {new Date().getFullYear()} {t("Imtithal Platform. All rights reserved.")}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/aboutUs"
            className="text-xs font-medium text-slate-400 hover:text-brand-400 transition-colors"
          >
            {t("About")}
          </Link>
          <Link 
            href="/privacy" 
            className="text-xs font-medium text-slate-400 hover:text-brand-400 transition-colors"
          >
            {t("Privacy Policy")}
          </Link>
          <Link 
            href="/terms" 
            className="text-xs font-medium text-slate-400 hover:text-brand-400 transition-colors"
          >
            {t("Terms of Service")}
          </Link>
          <Link 
            href="/contactus" 
            className="text-xs font-medium text-slate-400 hover:text-brand-400 transition-colors"
          >
            {t("Contact Support")}
          </Link>
        </div>
      </div>
    </footer>
  );
}