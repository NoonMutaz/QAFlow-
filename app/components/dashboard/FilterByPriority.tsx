'use client';

import React from 'react'
import { useLanguage } from '../../i18n/LanguageProvider';
type Priority = "High" | "Medium" | "Low";
interface FilterByPriorityPrpos {
 selectP: Priority | "";
  setSelectP: React.Dispatch<React.SetStateAction<Priority | "">>;
  
}
export default function FilterByPriority({selectP,setSelectP}:FilterByPriorityPrpos) {
  const { t } = useLanguage();
  return (
    <div>
       <select
          value={selectP}
          onChange={(e) => setSelectP(e.target.value as Priority | "")}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
        >
          <option value="">{t("Filter by Risk level")}</option>
          <option value="High">{t("High")}</option>
          <option value="Medium">{t("Medium")}</option>
          <option value="Low">{t("Low")}</option>
        </select>
      </div>
 
  )
}
