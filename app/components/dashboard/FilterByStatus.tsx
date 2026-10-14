'use client';

import React from 'react'
import { useLanguage } from '../../i18n/LanguageProvider';
type Status = "notFixed" | "in-progress" | "fixed";
interface FilterByStatusPrpos {
 select: Status | "";
  setSelect: React.Dispatch<React.SetStateAction<Status | "">>;
}
export default function FilterByStatus({select,setSelect}:FilterByStatusPrpos) {
  const { t } = useLanguage();
  return (
    <div>
       <form>
                  <select
                    value={select}
                    onChange={(e) => setSelect(e.target.value as Status | "")}
                    className={`px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition `}
                  >
                    <option value="" disabled hidden>
                      {" "}
                      {t("Filter by status")}{" "}
                    </option>
                    <option value="">{t("All")}</option>
                    <option value="notFixed"> 
{t("Non-Conformities")}</option>
                    <option value="in-progress">{t("In-progress")}</option>
                    <option value="fixed">{t("Verified")}</option>
                  </select>
                </form>
    </div>
  )
}
