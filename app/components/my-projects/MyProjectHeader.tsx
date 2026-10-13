'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../i18n/LanguageProvider';

interface MyProjectHeaderProps {
  isLoading: boolean;
  filteredProjects: any[];
  projects: any[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
}

export default function MyProjectHeader({
  isLoading,
  filteredProjects,
  projects,
  searchTerm,
  setSearchTerm,
}: MyProjectHeaderProps) {
  const { t } = useLanguage();
  const router = useRouter();

  // Prevent hydration mismatch caused by browser extensions modifying <input>
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("My Projects")}</h1>

          <p className="text-gray-500 text-sm mt-1">
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5 text-brand-700">
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
                {t("Loading...")}
              </span>
            ) : (
              t(filteredProjects.length === 1 ? '{n} project' : '{n} projects', { n: filteredProjects.length })
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <svg
              className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="text"
              placeholder={t("Search projects...")}
              className="w-full ps-9 pe-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none shadow-sm"
            />
          </div>

          <button
            onClick={() => router.push('/createProject')}
            className="px-5 py-2.5 bg-gradient-to-r from-brand-800 to-brand-600 hover:from-brand-900 hover:to-brand-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
          >
            {t("+ New Project")}
          </button>
        </div>
      </div>
    </div>
  );
}
