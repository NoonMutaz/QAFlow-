'use client';

import React from "react";
import { useLanguage } from '../../../i18n/LanguageProvider';

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

const BUTTON =
  "px-4 py-2 text-[10px] font-black bg-gray-100 rounded-xl disabled:opacity-30 hover:bg-gray-200 transition-all uppercase tracking-widest";

export default function Pagination({ page, totalPages, onChange }: Props) {
  const { t } = useLanguage();
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm mt-4">
      <div className="text-xs text-gray-500 font-bold uppercase">
        {t("Page")}{" "}<span className="text-blue-600">{page}</span>{" "}{t("of")}{" "}{totalPages}
      </div>
      <div className="flex gap-2">
        <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1} className={BUTTON}>
          {t("Back")}
        </button>
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className={BUTTON}
        >
          {t("Next")}
        </button>
      </div>
    </div>
  );
}
